import { useState, useEffect } from "react";
import api from "../../services/api";

export default function DashboardView({ onNavigate, userName }) {
  const [stats, setStats] = useState({
    total: 5,
    waiting: 3,
    resep: 12,
    sent: 8,
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients");
        const data = res.data.data || [];
        setPatients(data.slice(0, 3));
        setStats((prev) => ({
          ...prev,
          total: data.length,
          waiting: data.length,
        }));
      } catch {
        setPatients([
          {
            id: 1,
            rm_number: "RM-2024-01892",
            name: "Siti Budiarti",
            birth_date: "1991-05-15",
            gender: "Perempuan",
            allergies: "Amoxicillin",
          },
          {
            id: 2,
            rm_number: "RM-2023-01451",
            name: "Ahmad Rizki",
            birth_date: "1997-08-22",
            gender: "Laki-laki",
            allergies: null,
          },
          {
            id: 3,
            rm_number: "RM-2023-02114",
            name: "Budi Santoso",
            birth_date: "1979-03-10",
            gender: "Laki-laki",
            allergies: "Penicillin",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Memuat dashboard...
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-8">
        <div>
          <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-1">
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date())}
          </p>
          <h2 className="text-2xl font-bold text-medisync-dark">
            Selamat datang, {userName || "Dokter"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Berikut ringkasan pelayanan pasien Anda hari ini.
          </p>
        </div>
        <button
          onClick={() => {
            console.log("Mulai Pemeriksaan clicked");
            onNavigate && onNavigate("pasien");
          }}
          className="px-5 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5] transition flex items-center gap-2 shadow-sm cursor-pointer"
          style={{ cursor: "pointer" }}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 xl:grid-cols-4">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">
              Pasien Hari Ini
            </p>
            <svg
              className="w-5 h-5 text-medisync-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-medisync-dark">{stats.total}</p>
          <p className="text-xs text-teal-600 mt-1">+3 dari kemarin</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">
              Menunggu Pemeriksaan
            </p>
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-medisync-dark">{stats.waiting}</p>
          <p className="text-xs text-amber-600 mt-1">Perlu ditangani</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Resep Hari Ini</p>
            <svg
              className="w-5 h-5 text-medisync-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-medisync-dark">{stats.resep}</p>
          <p className="text-xs text-slate-500 mt-1">Hari ini</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">
              Resep Terkirim ke Farmasi
            </p>
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-medisync-dark">{stats.sent}</p>
          <p className="text-xs text-teal-600 mt-1">83% dari resep</p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Antrean Pemeriksaan */}
        <div className="min-w-0 lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-medisync-dark">
              Antrean Pemeriksaan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {patients.length} pasien menunggu • Urutan berdasarkan waktu
              kunjungan
            </p>
          </div>
          <div className="space-y-3">
            {patients.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div>
                  <p className="text-sm font-semibold text-medisync-dark">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.rm_number} • 09:{30 + idx * 5} WIB
                  </p>
                </div>
                <button
                  onClick={() => {
                    console.log("Periksa clicked for", p.name);
                    onNavigate && onNavigate("detail-pasien", p);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    idx === 0
                      ? "bg-medisync-primary text-white hover:bg-[#0958b5]"
                      : "text-medisync-primary hover:bg-blue-50 bg-white border border-blue-200"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {idx === 0 ? "Mulai Pemeriksaan" : "Periksa"}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              console.log("Lihat semua clicked");
              onNavigate && onNavigate("pasien");
            }}
            className="mt-4 text-sm text-medisync-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Lihat semua pasien menunggu
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Resep Disahkan Terbaru */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <h3 className="text-lg font-bold text-medisync-dark mb-1">
            Resep Disahkan Terbaru
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Resep otomatis terkirim ke instalasi farmasi
          </p>
          <div className="space-y-4">
            {[
              {
                name: "Siti Budiarti",
                code: "RSP-250218-042",
                time: "09:42 WIB",
              },
              {
                name: "Lina Novitasari",
                code: "RSP-250218-031",
                time: "09:10 WIB",
              },
              {
                name: "Rina Wulandari",
                code: "RSP-250218-028",
                time: "08:58 WIB",
              },
            ].map((r, i) => (
              <div
                key={i}
                className="pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <p className="text-sm font-semibold text-medisync-dark">{r.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {r.code} • {r.time}
                </p>
                <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Terkirim ke Farmasi
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              console.log("Buat Resep clicked");
              onNavigate && onNavigate("resep");
            }}
            className="w-full mt-6 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5] transition shadow-sm cursor-pointer"
            style={{ cursor: "pointer" }}
          >
            Buat Resep
          </button>
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
          Alur pelayanan: pemeriksaan → resep rawat jalan → pengesahan dokter →
          antrean farmasi. Kode tracking dibuat otomatis setelah resep disahkan.
        </p>
      </div>
    </div>
  );
}
