import { useState } from "react";

export default function AdminDashboardView() {
  // State untuk simulasi update status
  const [resepList, setResepList] = useState([
    {
      id: "RSP-250218-042",
      pasien: "Siti Budiarti",
      rm: "RM-2024-01892",
      waktu: "09:42 WIB",
      status: "Menunggu",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "RSP-250218-031",
      pasien: "Lina Novitasari",
      rm: "RM-2022-00981",
      waktu: "09:10 WIB",
      status: "Diracik",
      statusColor: "bg-amber-100 text-amber-700",
    },
    {
      id: "RSP-250218-028",
      pasien: "Rina Wulandari",
      rm: "RM-2023-01112",
      waktu: "08:58 WIB",
      status: "Selesai",
      statusColor: "bg-teal-100 text-teal-700",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    const colors = {
      Menunggu: "bg-blue-100 text-blue-700",
      Diracik: "bg-amber-100 text-amber-700",
      Selesai: "bg-teal-100 text-teal-700",
    };
    setResepList(
      resepList.map((r) =>
        r.id === id
          ? { ...r, status: newStatus, statusColor: colors[newStatus] }
          : r,
      ),
    );
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
          INSTALASI FARMASI / DASHBOARD
        </p>
        <h2 className="text-2xl font-bold text-slate-800">
          Dashboard Apoteker
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Kelola antrean resep elektronik dan update status peracikan.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
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
            <p className="text-xs font-medium text-slate-500">
              Resep Masuk Hari Ini
            </p>
          </div>
          <p className="text-3xl font-bold text-slate-800">18</p>
          <p className="text-xs text-slate-400 mt-1">Dari 4 dokter aktif</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
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
            <p className="text-xs font-medium text-slate-500">Sedang Diracik</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">4</p>
          <p className="text-xs text-slate-400 mt-1">Perlu diselesaikan</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Selesai & Diambil
            </p>
          </div>
          <p className="text-3xl font-bold text-slate-800">12</p>
          <p className="text-xs text-slate-400 mt-1">83% dari total resep</p>
        </div>
      </div>

      {/* Tabel Antrean Resep */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Antrean Resep Elektronik
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update status secara real-time agar pasien dapat memantau.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-2">Kode Resep</th>
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="py-3 px-2">No. RM</th>
                <th className="py-3 px-2">Waktu Masuk</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {resepList.map((resep, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-4 px-2 font-mono text-xs font-semibold text-slate-800">
                    {resep.id}
                  </td>
                  <td className="py-4 px-2 font-semibold text-slate-800">
                    {resep.pasien}
                  </td>
                  <td className="py-4 px-2 text-slate-600 font-mono text-xs">
                    {resep.rm}
                  </td>
                  <td className="py-4 px-2 text-slate-600">{resep.waktu}</td>
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${resep.statusColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {resep.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    {resep.status === "Menunggu" && (
                      <button
                        onClick={() => updateStatus(resep.id, "Diracik")}
                        className="text-amber-600 font-medium hover:underline text-xs"
                      >
                        Mulai Racik
                      </button>
                    )}
                    {resep.status === "Diracik" && (
                      <button
                        onClick={() => updateStatus(resep.id, "Selesai")}
                        className="text-teal-600 font-medium hover:underline text-xs"
                      >
                        Tandai Selesai
                      </button>
                    )}
                    {resep.status === "Selesai" && (
                      <span className="text-slate-400 text-xs">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-slate-600">
          Setiap perubahan status akan otomatis diteruskan ke halaman tracking
          pasien publik. Pastikan stok obat tersedia sebelum memulai peracikan.
        </p>
      </div>
    </div>
  );
}
