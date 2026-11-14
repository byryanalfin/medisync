import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

const empty = { name: "", generic_name: "", category: "", unit: "tablet", stock: 0 };
export default function DrugCatalogView() {
  const [drugs, setDrugs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const dialog = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/drugs", { params: { search, page, per_page: 10 }, signal: controller.signal });
        if (!controller.signal.aborted) { setDrugs(response.data.data); setPagination(response.data.pagination); }
      } catch {
        if (!controller.signal.aborted) setError("Katalog belum dapat dimuat. Periksa koneksi lalu coba lagi.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, page, revision]);
  function open(drug) {
    setEditingId(drug?.id || null);
    setForm(drug ? Object.fromEntries(Object.keys(empty).map(key => [key, drug[key] ?? empty[key]])) : { ...empty });
    setFormError("");
    dialog.current.showModal();
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, name: form.name.trim(), stock: Number(form.stock) };
      if (editingId) await api.put(`/drugs/${editingId}`, payload);
      else await api.post("/drugs", payload);
      dialog.current.close();
      setNotice(editingId ? "Data obat berhasil diperbarui." : "Obat ditambahkan dan tersedia di katalog dokter.");
      setRevision(value => value + 1);
    } catch (requestError) { setFormError(Object.values(requestError.response?.data?.errors || {})[0]?.[0] || requestError.response?.data?.message || "Data obat belum tersimpan. Silakan coba lagi."); }
    finally { setSaving(false); }
  }
  return <section className="mx-auto max-w-[1440px] space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-semibold text-medisync-primary">INSTALASI FARMASI / KATALOG OBAT</p><h1 className="text-2xl font-semibold tracking-tight">Katalog Obat</h1><p className="mt-1 text-sm text-slate-500">Kelola obat yang dapat dipilih dokter saat membuat resep.</p></div><button type="button" className="button-primary" onClick={() => open(null)}>+ Tambah obat</button></div>
    {notice && <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
    {error && <p role="alert" className="form-error">{error}<button type="button" className="ml-3 underline" onClick={() => setRevision(value => value + 1)}>Coba lagi</button></p>}
    <article className="min-w-0 overflow-hidden rounded-xl border border-[#dce7ef] bg-white"><div className="p-5"><label htmlFor="catalog-search" className="text-xs font-semibold text-slate-600">Cari obat</label><input id="catalog-search" type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Nama, nama generik, atau kategori" className="mt-2 min-h-11 w-full rounded-lg border border-[#cfdae4] px-3 text-sm" /></div>
    <div className="divide-y divide-slate-100">{loading ? <p role="status" className="p-8 text-center text-sm text-slate-500">Memuat katalog...</p> : drugs.map(drug => <div key={drug.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><h2 className="break-words text-sm font-semibold">{drug.name}</h2><p className="mt-1 text-xs text-slate-500">{drug.generic_name || "Generik belum dicatat"} · {drug.category || "Tanpa kategori"}</p><p className="mt-1 text-xs text-slate-600">Stok tercatat: {drug.stock} {drug.unit}</p></div><button type="button" className="button-secondary" onClick={() => open(drug)} aria-label={`Edit ${drug.name}`}>Edit obat</button></div>)}{!loading && !drugs.length && <p className="p-8 text-center text-sm text-slate-500">Tidak ada obat ditemukan.</p>}</div>
    {pagination && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5 text-xs text-slate-500"><span>{pagination.total} obat · Halaman {pagination.current_page} dari {pagination.last_page}</span><div className="flex gap-3"><button type="button" className="min-h-10 font-semibold text-medisync-primary disabled:text-slate-400" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Sebelumnya</button><button type="button" className="min-h-10 font-semibold text-medisync-primary disabled:text-slate-400" disabled={loading || page >= pagination.last_page} onClick={() => setPage(value => value + 1)}>Berikutnya</button></div></div>}</article>
    <dialog ref={dialog} aria-labelledby="drug-form-title" onCancel={event => { if (saving) event.preventDefault(); }} className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-[#dce7ef] p-6 text-medisync-dark backdrop:bg-slate-900/40"><h2 id="drug-form-title" className="mb-5 text-xl font-semibold">{editingId ? "Edit obat" : "Tambah obat"}</h2><form onSubmit={save}><fieldset disabled={saving} className="grid gap-4">{[["name", "Nama obat", true], ["generic_name", "Nama generik", false], ["category", "Kategori", false], ["unit", "Satuan", true], ["stock", "Stok tercatat", true]].map(([key, label, required]) => <label key={key} className="block text-xs font-semibold text-slate-600" htmlFor={`catalog-${key}`}>{label}{!required && " (opsional)"}<input id={`catalog-${key}`} type={key === "stock" ? "number" : "text"} required={required} min={key === "stock" ? 0 : undefined} max={key === "stock" ? 10000000 : undefined} step={key === "stock" ? 1 : undefined} maxLength={key === "unit" ? 50 : 255} value={form[key]} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} className="mt-2 min-h-11 w-full rounded-lg border border-[#cfdae4] px-3 text-sm font-normal" /></label>)}</fieldset>{formError && <p role="alert" className="form-error mt-4">{formError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" disabled={saving} onClick={() => dialog.current.close()}>Batal</button><button type="submit" className="button-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan obat"}</button></div></form></dialog>
  </section>;
}
