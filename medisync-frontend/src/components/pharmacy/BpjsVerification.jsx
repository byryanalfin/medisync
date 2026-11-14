import { useState } from "react";
import api from "../../services/api";

const checks = [
  ["bpjs_card_checked", "Kartu BPJS telah ditinjau secara manual"],
  ["bpjs_identity_checked", "Identitas pada dokumen sesuai dengan pasien"],
  ["bpjs_documents_checked", "Kelengkapan dokumen pelayanan telah diperiksa"],
];
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default function BpjsVerification({ prescription, onSaved }) {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const saved = Object.fromEntries(checks.map(([key]) => [key, Boolean(prescription[key])]));
  saved.bpjs_notes = prescription.bpjs_notes || "";
  const values = draft ?? saved;
  const dirty = draft !== null && Object.keys(saved).some(key => values[key] !== saved[key]);
  const completed = checks.filter(([key]) => values[key]).length;
  function change(key, value) {
    setDraft({ ...values, [key]: value });
    setNotice("");
    setError("");
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await api.put(`/prescriptions/${prescription.id}/bpjs`, values);
      onSaved(response.data.data);
      setDraft(null);
      setNotice(completed === checks.length ? "Verifikasi lengkap berhasil disimpan." : "Pemeriksaan sementara berhasil disimpan. Anda dapat melanjutkannya nanti.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Pemeriksaan belum tersimpan. Periksa koneksi, lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-5" aria-busy={saving}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">Checklist Verifikasi Manual</h3><span className={`rounded-md px-2.5 py-1 text-xs font-medium ${completed === 3 ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-600"}`}>{completed} dari 3 diperiksa</span></div>
      <fieldset disabled={saving} className="grid gap-2 text-sm">
        <legend className="sr-only">Kelengkapan pemeriksaan dokumen BPJS</legend>
        {checks.map(([key, label]) => <label key={key} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 transition-colors ${values[key] ? "border-teal-100 bg-[#e3f7f5] text-teal-900" : "border-transparent bg-[#f4f8fb] text-medisync-dark"}`}><input type="checkbox" className="h-4 w-4 shrink-0 accent-[#0d9d92]" checked={values[key]} onChange={event => change(key, event.target.checked)} />{label}</label>)}
      </fieldset>
      <label className="block text-sm font-semibold" htmlFor="bpjs-notes">Catatan pemeriksaan <span className="font-normal text-slate-500">(opsional)</span><textarea id="bpjs-notes" maxLength={2000} rows={3} value={values.bpjs_notes} disabled={saving} onChange={event => change("bpjs_notes", event.target.value)} placeholder="Contoh: dokumen yang masih perlu dilengkapi" className="mt-2 w-full resize-y rounded-lg border border-[#cfdae4] p-3 text-sm font-normal" /></label>
      {dirty && <p role="status" className="text-xs font-medium text-amber-800">Ada perubahan yang belum disimpan.</p>}
      {error && <p role="alert" className="form-error">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
      <button type="submit" className="button-primary w-full" disabled={saving || (!dirty && Boolean(prescription.bpjs_checked_at))}>{saving ? "Menyimpan pemeriksaan..." : completed === 3 ? "Simpan verifikasi lengkap" : "Simpan pemeriksaan"}</button>
      {prescription.bpjs_checked_at && <p className="text-xs leading-relaxed text-slate-600">Terakhir disimpan oleh <strong>{prescription.bpjs_verifier?.name || "petugas farmasi"}</strong> pada {dateFormat.format(new Date(prescription.bpjs_checked_at))} WIB.{prescription.bpjs_verified_at && <span className="mt-1 block font-medium text-teal-700">Semua dokumen telah diverifikasi secara manual.</span>}</p>}
      <p className="text-xs leading-relaxed text-slate-500">Pemeriksaan dokumen dilakukan oleh petugas. Hasil yang disimpan merupakan catatan internal rumah sakit.</p>
    </form>
  );
}
