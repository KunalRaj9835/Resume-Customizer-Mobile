# Resume Customizer Mobile (Expo + React Native)
Uses the shared FastAPI backend and Supabase project. No secrets belong in this app.

## Setup (macOS)
```bash
npm install
npx expo install --fix     # aligns package versions with your Expo SDK
cp .env.example .env       # fill in values
npx expo start
```
- `EXPO_PUBLIC_*` values are embedded in the client; never put secrets there.
- Physical device: use your Mac's LAN IP in `EXPO_PUBLIC_API_BASE_URL`, not `localhost`. Android emulator: `http://10.0.2.2:8000/api/v1`.
- Supabase: enable Google provider; add the redirect URL printed by `Linking.createURL('auth/callback')` (Expo Go: `exp://…/--/auth/callback`; dev/prod builds: `resume-customizer://auth/callback`) to Auth → URL Configuration.
- Type check: `npm run typecheck`. Builds: `npx eas build --profile development --platform ios|android`.

## API contract
Aligned with the Upthrust web app (`src/lib/api.ts`, `types.ts`): `page`/`page_size` pagination returning `{items,total,page,page_size,total_pages}`; ids normalized from `resume_id`/`jd_id`/`customization_id`; JD fields `title`, `company_name`, `jd_text`; customization body `{resume_id, jd_id, preferences:{tone}}`; result under `content`; dashboard `uploaded_resumes`/`saved_job_descriptions`/`retained_customizations`/`recent_customizations`; errors via `error.code`/`error.message`. Still assumed (same as web): `X-Session-ID` header, `session_id` from `POST /auth/session`, `/profile` shape. Only 401 ends the session.

## Status
Styled to match the Upthrust web design (black/white/#FF4A00, Anton + Inter, square edges). Not installed, type-checked, run, or tested on any device/live service. Not implemented: automated tests, extra docs (docs/ is empty), Zod/React Hook Form validation, offline banner. Not run on any device or live backend.

## 3D
`src/components/Scene3D.tsx` uses `@react-three/fiber/native` + `expo-gl` (works in Expo Go; procedural geometry, no model files). Needs a real device or simulator with GL; run `npx expo install --fix` to align `expo-gl`/`three` versions.
`ResumeScene3D` (upload + customize; speeds up while uploading/generating) and `Gauge3D` (result screen; shown only if the backend returns a numeric `match_score`).

## Android (Gradle)
`android/` was generated with `npx expo prebuild --platform android`. Not compiled here (no Android SDK).
```bash
npm install --legacy-peer-deps
npx expo run:android            # or: cd android && ./gradlew assembleDebug
```
Requires JDK 17 and Android Studio/SDK. Set `ANDROID_HOME`. Debug APK: `android/app/build/outputs/apk/debug/`. Re-run prebuild after changing `app.json` or native deps. Release signing keys are not included.

3D models: `assets/models/statue.glb` (login) and `curve.glb` (dashboard), copied from the Upthrust web project; bundled via `metro.config.js`. If a model fails to load, the scene falls back to the procedural core.
