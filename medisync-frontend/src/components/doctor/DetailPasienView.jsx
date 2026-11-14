import { useEffect, useState } from "react";
import api from "../../services/api";
import { ageInYears, formatDate, statusLabel } from "../../utils/format";
import icons from "../../assets/figma/icons";

export default function DetailPasienView({ patient, onStartExam }) {
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  useEffect(() => {
    if (!patient?.id) return;
    const controller = new AbortController();
    api.get(`/patients/${patient.id}`, { signal: controller.signal }).then(response => setRecord(response.data.data)).catch(() => {
      if (!controller.signal.aborted) setError("Riwayat pasien belum dapat dimuat. Silakan coba lagi.");
    });
    return () => controller.abort();
  }, [patient?.id]);
  if (!patient) return <p className="rounded-xl border border-[#dce7ef] bg-white p-8 text-sm text-slate-500">Pilih pasien dari menu Pasien untuk melihat detail.</p>;
  const current = record || patient;
  const history = [...(record?.examinations || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latest = history[0];
  const panel = "rounded-xl border border-[#dce7ef] bg-white p-5 sm:p-6";
  return (
    <section className="mx-auto max-w-[1440px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-semibold text-medisync-primary">PORTAL DOKTER / PASIEN</p><h1 className="text-2xl font-semibold tracking-tight">Detail Pasien</h1><p className="mt-1 text-sm text-slate-500">{current.name} · {current.rm_number}</p></div><button type="button" onClick={onStartExam} className="button-primary"><img src={icons.v10} alt="" />Mulai Pemeriksaan</button></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-5"><article className={panel}><h2 className="mb-5 text-lg font-semibold">Identitas Pasien</h2><dl className="grid gap-4 text-sm">{[["Nama lengkap", current.name], ["No. Rekam Medis", current.rm_number], ["Usia", `${ageInYears(current.birth_date)} tahun`], ["Jenis kelamin", current.gender]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl></article><article className={panel}><h2 className="mb-3 text-lg font-semibold">Riwayat Ringkas</h2><p className="text-sm leading-relaxed text-slate-600">{latest?.history || "Riwayat penyakit belum dicatat."}</p><p className="mt-4 text-xs text-slate-500">Alergi tercatat</p><p className="mt-1 text-sm font-semibold">{current.allergies || "Belum ada alergi yang dicatat"}</p></article></div>
        <div className="space-y-5"><article className={panel}><h2 className="text-lg font-semibold">Pemeriksaan Terakhir</h2><p className="mt-1 text-xs text-slate-500">{latest ? formatDate(latest.created_at) : "Belum ada pemeriksaan tersimpan."}</p>{current.allergies && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">Alergi tercatat: <strong>{current.allergies}</strong>. Tinjau sebelum meresepkan obat.</p>}{latest && <dl className="mt-4 grid gap-4 text-sm"><div><dt className="text-xs text-slate-500">Keluhan</dt><dd className="mt-1 leading-relaxed">{latest.complaints}</dd></div><div><dt className="text-xs text-slate-500">Diagnosis</dt><dd className="mt-1">{latest.diagnosis || "—"}</dd></div><div><dt className="text-xs text-slate-500">Dokter</dt><dd className="mt-1">{latest.doctor?.name || "—"}</dd></div></dl>}</article>
          <article className={panel}><h2 className="text-lg font-semibold">Kunjungan & Resep Sebelumnya</h2><p className="mt-1 text-xs text-slate-500">Riwayat pemeriksaan yang tersimpan untuk pasien ini.</p><div className="mt-4 divide-y divide-slate-100">{history.map(examination => <div key={examination.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold">{formatDate(examination.created_at)}</p><p className="mt-1 text-xs text-slate-500">{examination.doctor?.name} · {examination.care_decision === "rawat_inap" ? "Rawat inap" : "Rawat jalan"}</p><p className="mt-1 text-xs text-medisync-primary">{examination.prescription?.tracking_code || "Belum ada kode tracking"} · {examination.prescription ? statusLabel(examination.prescription.status) : "Belum ada resep"}</p></div><button type="button" className="min-h-10 text-xs font-semibold text-medisync-primary" aria-expanded={expanded === examination.id} onClick={() => setExpanded(expanded === examination.id ? null : examination.id)}>{expanded === examination.id ? "Tutup detail" : "Lihat detail"}</button></div>{expanded === examination.id && <div className="mt-3 rounded-lg bg-[#f4f8fb] p-4 text-sm"><p className="font-medium">{examination.diagnosis || "Diagnosis belum dicatat"}</p><p className="mt-1 text-slate-600">{examination.complaints}</p>{examination.prescription?.items?.map(item => <p key={item.id} className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed"><strong>{item.drug_name}</strong> · {item.quantity}<br />{item.dosage} · {item.instructions}</p>)}</div>}</div>)}{!history.length && <p className="py-6 text-sm text-slate-500">{record ? "Belum ada riwayat pemeriksaan." : error ? "Riwayat belum tersedia." : "Memuat riwayat..."}</p>}</div></article>
        </div>
      </div>
    </section>
  );
}
