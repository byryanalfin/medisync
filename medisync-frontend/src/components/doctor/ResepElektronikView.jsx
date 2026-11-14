import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import DrugAutocomplete from "./DrugAutocomplete";
import icons from "../../assets/figma/icons";

const blankDrug = () => ({ nama: "", jumlah: "", dosis: "", aturan: "", catatan: "" });
export default function ResepElektronikView({ patient, onSahkan }) {
  const [items, setItems] = useState([blankDrug()]);
  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const confirmation = useRef(null);
  useEffect(() => {
    const id = localStorage.getItem("currentExaminationId");
    const controller = new AbortController();
    async function load() {
      try {
        if (!id) throw new Error("Simpan pemeriksaan pasien terlebih dahulu sebelum membuat resep.");
        const response = await api.get(`/examinations/${id}`, { signal: controller.signal });
        const data = response.data.data;
        if (data.patient_id !== patient?.id) throw new Error("Pemeriksaan tidak sesuai dengan pasien yang dipilih. Mulai pemeriksaan baru.");
        if (data.care_decision !== "rawat_jalan") throw new Error("Resep rawat jalan tidak tersedia untuk pemeriksaan rawat inap.");
        if (data.prescription) throw new Error("Pemeriksaan ini sudah memiliki resep. Buka menu Riwayat untuk melihat resep tersebut.");
        if (!controller.signal.aborted) setExamination(data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.response?.data?.message || requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [patient?.id]);
  const held = Boolean(examination?.supporting_exams?.length);
  function change(index, fields) { setItems(previous => previous.map((item, i) => i === index ? { ...item, ...fields } : item)); }
  async function save() {
    if (saving || !examination) return;
    setSaving(true);
    setError("");
    try {
      const response = await api.post("/prescriptions", {
        examination_id: examination.id,
        status: held ? "on_hold" : "approved",
        hold_reason: held ? "Menunggu hasil pemeriksaan penunjang: " + examination.supporting_exams.join(", ") : null,
        items: items.map(item => ({ drug_name: item.nama.trim(), quantity: item.jumlah.trim(), dosage: item.dosis.trim(), instructions: item.aturan.trim(), notes: item.catatan.trim() || null })),
      });
      localStorage.setItem("lastPrescription", JSON.stringify({ id: response.data.data.prescription.id }));
      confirmation.current.close();
      onSahkan();
    } catch (requestError) {
      setError(Object.values(requestError.response?.data?.errors || {})[0]?.[0] || requestError.response?.data?.message || "Resep belum tersimpan. Periksa koneksi dan coba lagi.");
      confirmation.current.close();
    } finally {
      setSaving(false);
    }
  }
  if (!patient) return <p className="p-8 text-sm text-slate-500">Pilih pasien dan simpan pemeriksaan terlebih dahulu.</p>;
  return <section className="mx-auto max-w-[1440px] space-y-5">
    <div><p className="mb-2 text-xs font-semibold text-medisync-primary">PORTAL DOKTER / RESEP</p><h1 className="text-2xl font-semibold tracking-tight">Resep Elektronik</h1><p className="mt-1 text-sm text-slate-500">Tahap 2 · {loading ? "Memuat pemeriksaan..." : examination ? `Pemeriksaan tersimpan · ${examination.diagnosis}` : "Pemeriksaan belum tersedia"}</p></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <form className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]" onSubmit={event => { event.preventDefault(); if (examination && !saving) confirmation.current.showModal(); }}>
      <article className="rounded-xl border border-[#dce7ef] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Form Resep</h2><p className="mb-5 mt-1 text-xs text-slate-500">Isi obat, jumlah, dosis, dan aturan pakai sesuai pemeriksaan.</p><fieldset disabled={saving || !examination} className="space-y-5"><legend className="sr-only">Obat yang diresepkan</legend>{items.map((item, index) => <div key={index} className="space-y-4 border-b border-slate-100 pb-5"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-500">OBAT {index + 1}</h3>{items.length > 1 && <button type="button" onClick={() => setItems(previous => previous.filter((_, i) => i !== index))} className="min-h-9 text-xs text-red-700">Hapus obat {index + 1}</button>}</div><div><label htmlFor={`drug-${index}`} className="mb-1.5 block text-xs font-medium text-slate-600">Nama Obat</label><DrugAutocomplete inputId={`drug-${index}`} value={item.nama} onChange={fields => change(index, fields)} /></div><div className="grid gap-3 sm:grid-cols-2">{[["jumlah", "Jumlah"], ["dosis", "Dosis"]].map(([key, label]) => <label key={key} className="block text-xs font-medium text-slate-600" htmlFor={`${key}-${index}`}>{label}<input id={`${key}-${index}`} type="text" maxLength={key === "jumlah" ? 100 : 255} required value={item[key]} onChange={event => change(index, { [key]: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#cfdae4] px-3 text-sm font-normal" /></label>)}</div><label className="block text-xs font-medium text-slate-600" htmlFor={`aturan-${index}`}>Aturan Pakai<input id={`aturan-${index}`} type="text" maxLength={1000} required value={item.aturan} onChange={event => change(index, { aturan: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#cfdae4] px-3 text-sm font-normal" /></label><label className="block text-xs font-medium text-slate-600" htmlFor={`catatan-${index}`}>Catatan <span className="font-normal">(opsional)</span><input id={`catatan-${index}`} type="text" maxLength={2000} value={item.catatan} onChange={event => change(index, { catatan: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#cfdae4] px-3 text-sm font-normal" /></label></div>)}<button type="button" className="button-secondary w-full" disabled={items.length >= 50} onClick={() => setItems(previous => [...previous, blankDrug()])}>+ Tambah obat</button></fieldset></article>
      <div className="space-y-5"><article className="rounded-xl border border-[#dce7ef] bg-white p-5 sm:p-6"><h2 className="mb-4 text-lg font-semibold">Informasi Pasien</h2><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Nama pasien</dt><dd className="mt-1 font-semibold">{patient.name}</dd></div><div><dt className="text-xs text-slate-500">No. Rekam Medis</dt><dd className="mt-1 font-semibold">{patient.rm_number}</dd></div></dl>{patient.allergies && <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs leading-relaxed text-red-800">Alergi tercatat: <strong>{patient.allergies}</strong>. Tinjau pemilihan obat sebelum mengesahkan resep.</p>}</article>
        {held && <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><h2 className="font-semibold">Menunggu hasil pemeriksaan penunjang</h2><p className="mt-2 text-xs leading-relaxed">{examination.supporting_exams.join(", ")}. Resep akan ditahan; kode tracking diterbitkan setelah dokter mengonfirmasi hasil.</p></aside>}
        <article className="rounded-xl border border-[#dce7ef] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Pengesahan Resep</h2><p className="mb-5 mt-2 text-sm leading-relaxed text-slate-600">Tinjau seluruh obat, dosis, dan aturan pakai. Resep yang telah disahkan dikirim ke farmasi dan tidak dapat diubah.</p><button type="submit" className="button-primary w-full" disabled={saving || !examination}>Tinjau & sahkan resep</button></article>
        <aside className="flex items-start gap-3 rounded-lg bg-[#eaf3ff] p-4 text-xs leading-relaxed"><img src={icons.v61} alt="" /><p>Kode tracking dibuat otomatis setelah resep disahkan. Berikan kode kepada pasien untuk memantau pelayanan obat.</p></aside>
      </div>
    </form>
    <dialog ref={confirmation} aria-labelledby="prescription-confirm-title" className="w-[calc(100%-2rem)] max-w-lg rounded-xl border border-[#dce7ef] p-6 text-medisync-dark backdrop:bg-slate-900/40"><h2 id="prescription-confirm-title" className="text-lg font-semibold">Konfirmasi pengesahan resep</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">Sahkan {items.length} jenis obat untuk <strong>{patient.name}</strong>? Pastikan identitas pasien, alergi, jumlah, dosis, dan aturan pakai sudah sesuai.</p><div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" autoFocus className="button-secondary" disabled={saving} onClick={() => confirmation.current.close()}>Tinjau kembali</button><button type="button" className="button-primary" disabled={saving} onClick={save}>{saving ? "Menyimpan..." : held ? "Sahkan & tahan resep" : "Sahkan resep"}</button></div></dialog>
  </section>;
}
