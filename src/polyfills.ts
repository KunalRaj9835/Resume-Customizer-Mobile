import 'expo-crypto';
// Hermes lacks parts of the User Timing API that React 19 dev builds call.
const p: any = (globalThis as any).performance ?? ((globalThis as any).performance = {});
for (const k of ['mark', 'measure', 'clearMarks', 'clearMeasures']) if (typeof p[k] !== 'function') p[k] = () => {};
