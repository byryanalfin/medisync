import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

export default function DrugAutocomplete({ value, onChange, inputId }) {
  const dialog = useRef(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/drugs", { params: { search, per_page: 50 }, signal: controller.signal });
        if (!controller.signal.aborted) setDrugs(response.data.data || []);
      } catch {
        if (!controller.signal.aborted) setError("Daftar obat belum dapat dimuat. Coba tutup lalu buka kembali.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, open]);
  function close() { dialog.current.close(); setOpen(false); }
  return <>
    <div className="flex gap-2"><input id={inputId} type="text" required maxLength={255} value={value} onChange={event => onChange({ nama: event.target.value })} placeholder="Nama obat" className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#cfdae4] px-3 py-2 text-sm" /><button type="button" className="button-secondary shrink-0" aria-label="Pilih obat dari katalog" onClick={() => { setSearch(""); setOpen(true); dialog.current.showModal(); }}>Katalog</button></div>
    <dialog ref={dialog} onCancel={() => setOpen(false)} aria-label="Pilih obat dari katalog" className="w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-[#dce7ef] bg-white p-0 text-medisync-dark shadow-xl backdrop:bg-slate-900/40">
      <div className="border-b border-[#dce7ef] p-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">Pilih obat</h3><button type="button" className="button-secondary" onClick={close}>Tutup</button></div><input autoFocus type="search" value={search} aria-label="Cari nama obat" onChange={event => setSearch(event.target.value)} placeholder="Cari nama obat..." className="min-h-11 w-full rounded-lg border border-[#cfdae4] px-3 text-sm" /><p className="mt-3 text-xs leading-relaxed text-slate-500">Tinjau kembali jumlah, dosis, dan aturan pakai setelah memilih obat.</p></div>
      <div className="max-h-[55dvh] overflow-y-auto p-5">{error ? <p role="alert" className="form-error">{error}</p> : loading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Memuat obat...</p> : drugs.length ? <div className="grid gap-2">{drugs.map(drug => <button type="button" key={drug.id} onClick={() => { onChange({ drug, nama: drug.name, jumlah: drug.default_quantity || "", dosis: drug.default_dosage || "", aturan: drug.default_instructions || "", catatan: drug.default_notes || "" }); close(); }} className="rounded-lg border border-[#dce7ef] p-4 text-left hover:border-medisync-primary hover:bg-blue-50"><p className="text-sm font-semibold">{drug.name}</p><p className="mt-1 text-xs text-slate-500">{drug.generic_name} · {drug.category}</p></button>)}</div> : <p className="py-8 text-center text-sm text-slate-500">Tidak ada obat ditemukan.</p>}</div>
    </dialog>
  </>;
}
