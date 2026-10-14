import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const SESSION_KEY = 'app_session_id';
export class ApiError extends Error {
  code = '';
  constructor(public status: number, message: string) { super(message); }
}
// Mirrors the web app's error handling (error.code / error.message envelope).
const MESSAGES: Record<number, string> = { 403: "You don't have access to this item.", 404: 'This item no longer exists.', 409: 'This conflicts with existing data.', 413: 'That file is too large.', 422: 'Some fields are invalid.', 429: 'Too many requests. Please wait and try again.', 500: 'The server had a problem. Try again shortly.' };
const CODES: Record<string, string> = {
  jd_in_use: "This job description is used by a saved customization, so it can't be deleted. Delete that customization first.",
  generation_in_progress: 'A resume is already being generated. Wait for it to finish.',
  rate_limited: 'Too many requests. Please wait a moment and try again.',
};
export const sessionStore = {
  get: () => SecureStore.getItemAsync(SESSION_KEY),
  set: (v: string) => SecureStore.setItemAsync(SESSION_KEY, v),
  clear: () => SecureStore.deleteItemAsync(SESSION_KEY),
};
let onSessionInvalid: () => void = () => {};
export const setSessionInvalidHandler = (fn: () => void) => { onSessionInvalid = fn; };

async function headers(extra: Record<string, string> = {}) {
  const { data } = await supabase.auth.getSession();
  const h: Record<string, string> = { ...extra };
  if (data.session) h.Authorization = `Bearer ${data.session.access_token}`;
  const sid = await sessionStore.get();
  if (sid) h['X-Session-ID'] = sid; // ASSUMPTION: confirm header name against backend
  return h;
}
async function request(path: string, init: RequestInit = {}, timeout = 30000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(BASE + path, { ...init, signal: ctrl.signal, headers: await headers(init.headers as any) });
    if (res.status === 401) onSessionInvalid(); // 403 = ownership error, not a dead session
    if (!res.ok) {
      let detail = '', code = '';
      try { const b = await res.json(); detail = b?.error?.message ?? (typeof b.detail === 'string' ? b.detail : ''); code = b?.error?.code ?? ''; } catch {}
      const e = new ApiError(res.status, CODES[code] ?? (detail || MESSAGES[res.status] || `Request failed (${res.status}).`)); e.code = code; throw e;
    }
    return res;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, (e as Error).name === 'AbortError' ? 'Request timed out.' : 'Network error. Check your connection.');
  } finally { clearTimeout(t); }
}
export const json = async <T,>(path: string, init?: RequestInit, timeout?: number): Promise<T> =>
  (await request(path, init, timeout)).json();
export const send = <T,>(method: string, path: string, body: unknown, timeout?: number) =>
  json<T>(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, timeout);
/** Backend ids are resume_id / jd_id / customization_id etc.; expose a uniform `id` (same as web). */
export const norm = <T = any,>(x: any): T => {
  if (x && typeof x === 'object' && !Array.isArray(x)) { const k = Object.keys(x); if (k.length === 1 && x[k[0]] && typeof x[k[0]] === 'object') x = x[k[0]]; }
  const idKey = ['id', 'jd_uuid', 'resume_uuid', 'customization_id', 'jd_id', 'resume_id', 'job_description_id'].find((k) => typeof x?.[k] === 'string')
    ?? Object.keys(x ?? {}).find((k) => /(^|_)(id|uuid)$/i.test(k) && typeof x[k] === 'string');
  return { ...x, id: idKey ? x[idKey] : undefined } as T;
};
export type Page<T> = { items: T[]; total: number; page: number; page_size: number; total_pages: number };
export const PAGE_SIZE = 20;
export const getPage = async <T = any,>(path: string, page = 1): Promise<Page<T>> => {
  const p = await json<any>(`${path}?page=${page}&page_size=${PAGE_SIZE}`);
  return { ...p, items: (p.items ?? []).map((i: unknown) => norm<T>(i)) };
};
export const getAll = async <T = any,>(path: string): Promise<T[]> => {
  const out: T[] = []; let page = 1, total = 1;
  do { const p = await getPage<T>(path, page); out.push(...p.items); total = p.total_pages ?? 1; page++; } while (page <= total && page < 20);
  return out;
};

export async function upload(file: { uri: string; name: string; mimeType?: string }) {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' } as any);
  return json<any>('/resumes', { method: 'POST', body: form }, 120000);
}
/** Authenticated download to the app cache dir, returns local file URI. */
export async function download(path: string, filename: string) {
  const safe = filename.replace(/[^\w.\-]+/g, '_');
  const dest = FileSystem.cacheDirectory + safe;
  const res = await FileSystem.downloadAsync(BASE + path, dest, { headers: await headers() });
  if (res.status < 200 || res.status >= 300) throw new ApiError(res.status, 'Download failed.');
  return res.uri;
}
