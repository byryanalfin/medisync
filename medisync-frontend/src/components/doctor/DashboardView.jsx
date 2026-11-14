import { useEffect, useState } from "react";
import api from "../../services/api";
import icons from "../../assets/figma/icons";
import { formatDate, statusLabel } from "../../utils/format";

export default function DashboardView({ onNavigate, userName }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api.get("/doctor/dashboard", { signal: controller.signal }).then(response => setData(response.data.data)).catch(() => {
      if (!controller.signal.aborted) setError("Ringkasan pelayanan belum dapat dimuat. Coba muat ulang halaman.");
    });
    return () => controller.abort();
  }, []);
  const cards = [
    ["Pasien terdaftar", data?.registered_patients, "Data pasien rumah sakit", "v11", "bg-blue-50"],
    ["Pemeriksaan hari ini", data?.examinations_today, "Pemeriksaan Anda hari ini", "v12", "bg-amber-50"],
    ["Resep hari ini", data?.prescriptions_today, "Resep yang Anda buat", "v13", "bg-violet-50"],
    ["Terkirim ke farmasi", data?.sent_today, "Resep disahkan hari ini", "v14", "bg-teal-50"],
  ];
  return (
    <section className="mx-auto max-w-[1440px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[11px] font-semibold uppercase text-medisync-primary">{new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date())}</p><h1 className="text-2xl font-semibold tracking-tight">Selamat datang, {userName || "Dokter"}</h1><p className="mt-1 text-sm text-slate-500">Berikut ringkasan pelayanan pasien Anda hari ini.</p></div><button type="button" className="button-primary" onClick={() => onNavigate("pasien")}><img src={icons.v10} alt="" />Mulai pemeriksaan</button></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(([label, value, caption, icon, color]) => <article key={label} className="flex items-center gap-3 rounded-xl border border-[#dce7ef] bg-white p-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color}`}><img src={icons[icon]} alt="" /></span><div><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value ?? "—"}</p><p className="mt-1 text-[10px] text-slate-500">{caption}</p></div></article>)}</div>
      <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
        <article className="rounded-xl border border-[#dce7ef] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Pasien terbaru</h2><p className="mt-1 text-xs text-slate-500">Pilih pasien untuk membuka data dan memulai pemeriksaan.</p><div className="mt-4 divide-y divide-slate-100">{data?.patients.map(patient => <div key={patient.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="text-sm font-semibold">{patient.name}</h3><p className="mt-1 text-xs text-slate-500">{patient.rm_number}</p></div><button className="button-secondary" onClick={() => onNavigate("detail-pasien", patient)}>Detail pasien</button></div>)}{!data?.patients.length && <p className="py-8 text-sm text-slate-500">{data ? "Belum ada pasien terdaftar." : error ? "Data belum tersedia." : "Memuat pasien..."}</p>}</div><button className="mt-3 min-h-10 text-xs font-semibold text-medisync-primary" onClick={() => onNavigate("pasien")}>Lihat semua pasien →</button></article>
        <article className="rounded-xl border border-[#dce7ef] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Resep terbaru</h2><p className="mt-1 text-xs text-slate-500">Status resep terakhir yang Anda buat.</p><div className="mt-4 divide-y divide-slate-100">{data?.prescriptions.map(prescription => <div key={prescription.id} className="py-4"><h3 className="text-sm font-semibold">{prescription.examination?.patient?.name}</h3><p className="mt-1 text-xs text-slate-500">{prescription.tracking_code || `Resep #${prescription.id}`} · {formatDate(prescription.created_at)}</p><p className="mt-1 text-xs font-medium text-teal-700">{statusLabel(prescription.status)}</p></div>)}{!data?.prescriptions.length && <p className="py-8 text-sm text-slate-500">{data ? "Belum ada resep." : error ? "Data belum tersedia." : "Memuat resep..."}</p>}</div><button className="button-primary mt-3 w-full" onClick={() => onNavigate("riwayat")}>Lihat riwayat resep</button></article>
      </div>
      <div className="flex gap-3 rounded-lg bg-[#eaf3ff] p-4 text-xs leading-relaxed"><img src={icons.v61} alt="" /><p>Alur pelayanan: pemeriksaan → resep rawat jalan → pengesahan dokter → antrean farmasi. Kode tracking dibuat otomatis setelah resep disahkan.</p></div>
    </section>
  );
}
