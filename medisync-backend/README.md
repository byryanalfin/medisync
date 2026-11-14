# MediSync API

Laravel backend for the React MediSync application. The backend root is a Laravel welcome page; open the React development server to use MediSync.

## Local setup

Requires PHP 8.3+, Composer, SQLite or MySQL, and Node/npm for the separate frontend.

1. Run `composer install`.
2. Copy `.env.example` to `.env` only on a new installation. Preserve existing database settings.
3. Run `php artisan key:generate` on a new installation.
4. Create the SQLite database file if using SQLite, then run `php artisan migrate`.
5. For a new demonstration database only, run `php artisan db:seed` and `php artisan db:seed --class=DrugSeeder`. Seeders create fictional users and patients and must not run against production patient data.
6. Serve with Laravel Herd at `http://medisync-backend.test`, or `php artisan serve` at port 8000.

The frontend `.env` must use the same server's `/api` URL. CORS origins can be configured with `CORS_ALLOWED_ORIGINS` (comma separated exact origins).

## API

All requests and responses use JSON. Protected endpoints require `Authorization: Bearer <token>`.

- `POST /api/login`: email and password; rate limited.
- `GET /api/me`, `POST /api/logout`: current session and token revocation.
- `GET /api/tracking/{code}`: public tracking; patient name, doctor name, prescribed drugs and service progress. Internal notes, medical-record numbers and BPJS data are excluded. Responses are not cacheable.
- `GET /api/doctor/dashboard`: authenticated doctor's live statistics.
- `GET|POST /api/patients`, `GET|PUT|DELETE /api/patients/{id}`: patient records. Patients with examination history cannot be deleted.
- `POST /api/examinations`, `GET /api/examinations/{id}`, `GET /api/examinations/patient/{id}`: examination workflow. Doctor identity comes from the authenticated user.
- `GET|POST /api/prescriptions`, `GET|PUT /api/prescriptions/{id}`: prescriptions. Creation is transactional; duplicate prescriptions for one examination are rejected. Only the owning doctor may approve a draft or held prescription.
- `GET /api/drugs`, `GET /api/drugs/categories`: catalog search; page size limited to 100.
- `GET /api/pharmacy/queue`, `GET /api/prescriptions/{id}/detail`: pharmacy workflow.
- `PUT /api/prescriptions/{id}/bpjs`: pharmacist only. Required booleans: `bpjs_card_checked`, `bpjs_identity_checked`, `bpjs_documents_checked`; optional `bpjs_notes` (up to 2000 characters). Partial checks may be saved. The API records the saving staff member and timestamp; complete verification is recorded only when all checks are true. This records manual document review, not an external BPJS integration.
- `PUT /api/prescriptions/{id}/status`: pharmacist only. Sequential stages: `approved → accepted → preparing → ready → picked_up`. Repeated identical requests are idempotent; skipped or reversed transitions are rejected. Each change has a persisted status event.

Doctors can save held prescriptions while waiting for supporting examinations. Inpatient examinations cannot create outpatient prescriptions. Public tracking codes are issued after doctor approval.

## Verification

`php artisan test` uses an isolated in-memory SQLite database. It does not reset the configured application database.

Production deployment remains a separate step: configure HTTPS, real staff accounts, production secrets, database backups and the intended access policy for tracking codes. Demo credentials are for local development only.

## Pharmacy catalog management

Only pharmacy accounts (`admin_apoteker`) can `POST /api/drugs` or `PUT /api/drugs/{drug}`. Fields: required unique `name`, required `unit`, required nonnegative integer `stock`, optional `generic_name` and `category`. Doctors can read/search the same catalog but cannot write it. Stock is the recorded catalog quantity; this feature does not automatically deduct inventory when prescriptions are processed.
