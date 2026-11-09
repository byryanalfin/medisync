export default function DetailPasienView({ patient, onStartExam }) {
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Tidak ada data pasien. Klik menu Pasien lalu pilih salah satu pasien.
      </div>
    );
  }

  const age =
    new Date().getFullYear() - new Date(patient.birth_date).getFullYear();

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-1">
            PORTAL DOKTER / PASIEN
          </p>
          <h2 className="text-2xl font-bold text-medisync-dark">Detail Pasien</h2>
          <p className="text-slate-500 text-sm mt-1">
            {patient.name} • {patient.rm_number} • Kunjungan 18 Feb 2025, 09:30
            WIB
          </p>
        </div>
        <button
          onClick={onStartExam}
          className="bg-medisync-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0958b5] transition flex items-center gap-2 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Mulai Pemeriksaan
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Kolom kiri */}
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-lg font-bold text-medisync-dark mb-4">
              Identitas Pasien
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Nama lengkap</p>
                <p className="font-semibold text-medisync-dark">{patient.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">No. Rekam Medis</p>
                <p className="font-semibold text-medisync-dark font-mono">
                  {patient.rm_number}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Usia</p>
                  <p className="font-semibold text-medisync-dark">{age} tahun</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Jenis kelamin</p>
                  <p className="font-semibold text-medisync-dark">
                    {patient.gender}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pelayanan</p>
                <p className="font-semibold text-medisync-dark">
                  Poli Umum • Rawat jalan
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-lg font-bold text-medisync-dark mb-4">
              Riwayat Ringkas
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Tidak ada penyakit kronis. Tidak minum obat rutin.
            </p>
            {patient.allergies && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Alergi tercatat</p>
                <p className="text-sm font-semibold text-medisync-dark">
                  {patient.allergies}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom kanan */}
        <div className="min-w-0 lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-lg font-bold text-medisync-dark mb-1">
              Kunjungan Saat Ini
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              18 Feb 2025 • Menunggu pemeriksaan
            </p>

            {patient.allergies && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-6">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm font-bold text-red-800">
                  Peringatan Alergi: {patient.allergies} — hindari zat pemicu
                  alergi.
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Keluhan</p>
              <p className="text-sm text-medisync-dark bg-slate-50 p-3 rounded-lg border border-slate-100">
                Demam, batuk kering, nyeri tenggorokan sejak 3 hari.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-lg font-bold text-medisync-dark mb-1">
              Kunjungan & Resep Sebelumnya
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Riwayat rawat jalan • Resep lama, bukan resep aktif hari ini
            </p>
            <div className="space-y-4">
              {[
                {
                  date: "10 Feb 2025",
                  desc: "Kontrol rawat jalan",
                  code: "RSP-250210-019 • MS-310219 • Terkirim ke Farmasi",
                },
                {
                  date: "21 Jan 2025",
                  desc: "Konsultasi poli umum",
                  code: "RSP-250121-011 • MS-291011 • Terkirim ke Farmasi",
                },
                {
                  date: "12 Des 2024",
                  desc: "Pemeriksaan rawat jalan",
                  code: "RSP-241212-023 • MS-184023 • Terkirim ke Farmasi",
                },
              ].map((v, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-medisync-dark">
                      {v.date} • {v.desc}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {v.code}
                    </p>
                  </div>
                  <button className="text-medisync-primary text-sm font-medium hover:underline">
                    Lihat Detail ›
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <svg
          className="w-5 h-5 text-medisync-primary flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p className="text-sm text-blue-700">
          Riwayat lengkap hanya tersedia untuk dokter. Resep yang sudah disahkan
          tidak dapat diedit atau dihapus.
        </p>
      </div>
    </div>
  );
}
