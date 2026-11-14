# MediSync

Aplikasi pelayanan resep dan tracking obat rumah sakit.

- `medisync-frontend/`: React + Vite untuk dokter, apoteker dan tracking pasien.
- `medisync-backend/`: Laravel API, database migrations dan pengujian backend.

Baca README masing-masing folder untuk setup, konfigurasi dan pengujian. Konfigurasi lokal `.env`, database pasien, dependency dan hasil build tidak disimpan di Git. Gunakan `.env.example` sebagai template untuk instalasi baru.

## Pengembangan lokal

Backend: jalankan `composer install` di `medisync-backend`, siapkan `.env` sesuai README, kemudian jalankan migrations dan Laravel Herd atau `php artisan serve`.

Frontend: jalankan `npm ci` di `medisync-frontend`, atur `VITE_API_URL` di `.env.local`, lalu `npm run dev`.

## Verifikasi

Backend: `php artisan test`.

Frontend: `npm run lint` dan `npm run build`. Pengujian Playwright memakai server dan database uji terpisah sebagaimana README frontend.
