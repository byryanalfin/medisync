# MediSync frontend

React + Vite application for doctors, pharmacy staff and patients. The visual system follows the MediSync Figma file, using locally stored SVG assets, DM Sans/Manrope and responsive layouts.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env` on a new installation. Set `VITE_API_URL` to your Laravel server's `/api` URL. If using `php artisan serve`, use `http://127.0.0.1:8000/api`.
3. Run `npm run dev -- --host 127.0.0.1` and open `http://127.0.0.1:5173`.

The backend's CORS configuration must permit the exact frontend origin. The Laravel welcome page is the backend, not this application.

Demo credentials are prefilled only in Vite development mode. Production builds require the user to enter credentials. Session restoration is verified with `/api/me`, not just local storage.

## Features

- Doctor: live dashboard, patient CRUD and examination history, outpatient examinations, catalog drug selection, prescription confirmation and approval, held-prescription review.
- Pharmacy: queue, prescription details, persistent manual BPJS checklist/notes with staff and timestamps, sequential service status changes and audit trail.
- Patient: prominent tracking button without login, patient/doctor names, medication details, five-stage progress, automatic polling and visible return-to-login controls.

BPJS checklist changes must be saved with the save button. Partial checks can be saved. This feature records manual review and does not connect to an external BPJS service.

## Checks

- `npm run lint`
- `npm run build`
- `npm run test:e2e`

The Playwright tests require an **isolated** Laravel test server at `http://127.0.0.1:8001` with the demonstration seed users and drug catalog, and a frontend dev server at `http://127.0.0.1:5175` using that test API. Tests create fictional patients and prescriptions; never point them at a real patient database. Allow the test frontend origin in the test backend's `CORS_ALLOWED_ORIGINS`.

Override `E2E_BASE_URL` and `E2E_API_URL` if necessary. Install Playwright Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_EXECUTABLE_PATH` to an installed Chromium-based browser executable. Tests use an isolated browser profile.

The checked browser workflow covers doctor prescription creation, pharmacy processing, BPJS persistence across navigation and reload, public tracking details, login navigation, error messages, and desktop/mobile overflow checks. Test screenshots are stored under `test-results/`.

## Dependency audit

Runtime dependency fixes were applied with `npm audit fix`. At implementation time, four moderate development-tool advisories remained in the ESLint/minimatch chain; npm suggested a major ESLint downgrade. No forced major downgrade was applied. Review `npm audit` when updating the lint toolchain.
