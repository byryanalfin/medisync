import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

const stages = [
  { id: "approved", label: "Menunggu", color: "bg-[#edf5fc] text-[#526c80]" },
  { id: "preparing", label: "Sedang Diracik", color: "bg-[#fff4d4] text-[#895800]" },
  { id: "ready", label: "Siap Diserahkan", color: "bg-[#e3f7f5] text-[#087a71]" },
  { id: "picked_up", label: "Diserahkan", color: "bg-[#f2ebff] text-[#6347b2]" },
];
const nextActions = ["Mulai Peracikan", "Siap Diserahkan", "Tandai Diserahkan"];
const panel = "rounded-xl border border-[#dce7ef] bg-white";
const action = "rounded-lg bg-medisync-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0958b5] disabled:opacity-50";
const field = "w-full rounded-md border border-[#dce7ef] bg-white px-3 py-2 text-sm";
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const dayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" });
const formatDate = (value) => value ? dateFormat.format(new Date(value)) + " WIB" : "—";

function Badge({ status }) {
  const stage = stages.find(({ id }) => id === status);
  return <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs ${stage?.color || "bg-slate-100"}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{stage?.label || status}</span>;
}

export default function PharmacyQueueView({ tab = "queue", onTabChange, userName, doctorHistory = false }) {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detailFrom, setDetailFrom] = useState("queue");
  const [historyDetail, setHistoryDetail] = useState(false);
  const showDetail = tab === "detail" || (doctorHistory && historyDetail);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const handoverDialog = useRef(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    let timer;
    async function refresh() {
      try {
        const response = await api.get("/prescriptions");
        if (active) {
          setRecords(response.data.data.filter((row) => stages.some(({ id }) => id === row.status)));
          setUpdatedAt(new Date());
          setLoadError(false);
        }
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) timer = setTimeout(refresh, 5000);
      }
    }
    refresh();
    return () => { active = false; clearTimeout(timer); };
  }, []);

  const activeRecords = records.filter((row) => row.status !== "picked_up");
  const selected = records.find(({ id }) => id === selectedId);
  const detail = selected || activeRecords[0] || records[0];
  const patient = detail?.examination?.patient;
  const stageIndex = stages.findIndex(({ id }) => id === detail?.status);

  async function updateStatus() {
    setSaving(true);
    setError("");
    try {
      const response = await api.put(`/prescriptions/${detail.id}/status`, { status: stages[stageIndex + 1].id });
      setRecords((previous) => previous.map((row) => row.id === detail.id ? { ...row, ...response.data.data } : row));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Status gagal disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function navigate(view) {
    setError("");
    if (doctorHistory) setHistoryDetail(view === "detail");
    else onTabChange?.(view);
  }

  const title = showDetail ? "Detail Resep" : ({
    dashboard: userName ? `Selamat datang, ${userName}` : "Dashboard Farmasi", queue: "Antrean Resep", patients: "Data Pasien",
    bpjs: "Verifikasi BPJS — Manual", status: "Status Pelayanan Obat", history: doctorHistory ? "Riwayat Pemeriksaan & Resep" : "Riwayat Pelayanan Obat",
  })[tab];
  const source = doctorHistory ? records : tab === "history" ? records.filter((row) => row.status === "picked_up").sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    : tab === "patients" || tab === "dashboard" ? records : [...activeRecords].reverse();
  const rows = source.filter((row) => {
    const person = row.examination?.patient;
    const timestamp = tab === "history" && !doctorHistory ? row.updated_at : row.created_at;
    return (tab === "history" || !filter || row.status === filter)
      && (!date || (timestamp && dayFormat.format(new Date(timestamp)) === date))
      && [person?.name, person?.rm_number, row.tracking_code, row.id].some((value) => String(value ?? "").toLowerCase().includes(search.trim().toLowerCase()));
  });
  const pageCount = Math.max(1, Math.ceil(rows.length / 5));
  const visiblePage = Math.min(page, pageCount);
  const visibleRows = tab === "dashboard" ? source.slice(0, 5) : rows.slice((visiblePage - 1) * 5, visiblePage * 5);
  const emptyMessage = updatedAt ? "Belum ada resep yang sesuai." : loadError ? "Data belum tersedia." : "Memuat resep...";

  function openDetail(row) {
    setSelectedId(row.id);
    setDetailFrom(tab);
    navigate("detail");
  }

  function prescriptionPicker() {
    return <label className="block text-xs text-slate-600">Pilih resep
      <select className={field + " mt-1"} value={detail?.id || ""} onChange={(event) => { setSelectedId(Number(event.target.value)); setError(""); }}>
        {!detail && <option value="">Belum ada resep</option>}
        {records.map((row) => <option key={row.id} value={row.id}>{row.examination?.patient?.name} · {row.tracking_code || row.id}</option>)}
      </select>
    </label>;
  }

  return (
    <section className="mx-auto max-w-[1440px] space-y-5 text-medisync-dark">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold text-medisync-primary">{doctorHistory ? "PORTAL DOKTER" : "INSTALASI FARMASI"} / {tab === "dashboard" ? "DASHBOARD" : title?.toUpperCase()}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{showDetail ? "Tinjau identitas pasien dan obat yang diresepkan." : doctorHistory ? "Catatan resep yang telah disahkan dan dikirim ke farmasi." : "Pelayanan resep Rumah Sakit Medika Utama."}</p>
        </div>
        {showDetail ? <button className="text-sm font-semibold text-medisync-primary" onClick={() => navigate(detailFrom)}>Kembali ke daftar</button>
          : tab === "dashboard" ? <button className={action} onClick={() => navigate("queue")}>Lihat Antrean Resep</button>
          : updatedAt && <span className="rounded-md bg-teal-50 px-3 py-2 text-xs text-teal-800">Diperbarui {formatDate(updatedAt)}</span>}
      </div>
      {loadError && <p role="status" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Data gagal dimuat. Sistem akan mencoba lagi.</p>}
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      {showDetail && detail ? (
        <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
          <div className="space-y-5">
            <article className={panel + " p-5"}>
              <h2 className="mb-4 font-semibold">Informasi Pasien</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-xs text-slate-500">Nama Pasien</dt><dd>{patient?.name || "—"}</dd></div>
                <div><dt className="text-xs text-slate-500">No. Rekam Medis</dt><dd>{patient?.rm_number || "—"}</dd></div>
                <div><dt className="text-xs text-slate-500">Tanggal Lahir</dt><dd>{patient?.birth_date?.slice(0, 10) || "—"}</dd></div>
              </dl>
              {patient?.allergies && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">Peringatan alergi · {patient.allergies}</p>}
            </article>
            <article className={panel + " overflow-x-auto"}>
              <h2 className="p-5 font-semibold">Daftar Obat</h2>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-600"><tr>{["Nama Obat", "Jumlah", "Dosis", "Aturan Pakai"].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">{detail.items?.map((item) => <tr key={item.id}><td className="px-5 py-4">{item.drug_name}{item.notes && <p className="mt-1 text-xs text-slate-600">{item.notes}</p>}</td><td className="px-5 py-4">{item.quantity}</td><td className="px-5 py-4">{item.dosage}</td><td className="px-5 py-4">{item.instructions}</td></tr>)}</tbody>
              </table>
            </article>
          </div>
          <div className="space-y-5">
            <article className={panel + " space-y-2 p-5 text-sm"}><h2 className="font-semibold">Informasi Resep</h2><p>{detail.doctor?.name || "—"}</p><p>{formatDate(detail.created_at)}</p><p className="pt-2 text-xs text-slate-500">KODE TRACKING</p><p className="text-lg text-medisync-primary">{detail.tracking_code || "—"}</p></article>
            {!doctorHistory && <article className={panel + " space-y-3 p-5"}><h2 className="font-semibold">Verifikasi BPJS</h2><button className="text-sm font-semibold text-medisync-primary" onClick={() => navigate("bpjs")}>Lihat verifikasi manual</button></article>}
            <article className={panel + " space-y-3 p-5"}><h2 className="font-semibold">Status Pelayanan</h2><Badge status={detail.status} />{!doctorHistory && <div><button className={action + " w-full"} onClick={() => navigate("status")}>Kelola Status Pelayanan</button></div>}</article>
          </div>
        </div>
      ) : tab === "bpjs" ? (
        <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
          <article className={panel + " space-y-4 p-5"}>
            <h2 className="font-semibold">Pemeriksaan Dokumen Pasien</h2>
            {prescriptionPicker()}
            <div className="rounded-md bg-slate-50 p-4 text-sm"><p className="font-semibold">{patient?.name || "Belum ada pasien"}</p><p>{patient?.rm_number}</p></div>
            <h3 className="text-sm font-semibold">Checklist Verifikasi Manual</h3>
            <fieldset key={detail?.id} disabled={!detail} className="grid gap-2 text-sm">
              {["Kartu BPJS telah ditinjau secara manual", "Identitas pada dokumen sesuai dengan pasien", "Kelengkapan dokumen pelayanan telah diperiksa"].map((label) => <label key={label} className="flex gap-2 rounded-md bg-slate-50 p-3"><input type="checkbox" />{label}</label>)}
            </fieldset>
            <p className="text-xs text-slate-600">Checklist ini hanya tersedia selama halaman terbuka. Penyimpanan verifikasi memerlukan dukungan API.</p>
          </article>
          <article className={panel + " space-y-2 p-5 text-sm"}><h2 className="font-semibold">Informasi Resep</h2><p>{detail?.doctor?.name || "—"}</p><p>{formatDate(detail?.created_at)}</p><p className="font-mono text-medisync-primary">{detail?.tracking_code || "—"}</p></article>
        </div>
      ) : tab === "status" ? (
        <div className="grid items-start gap-5 xl:grid-cols-[2fr_3fr]">
          <article className={panel + " space-y-4 p-5"}><h2 className="font-semibold">Pelayanan Saat Ini</h2>{prescriptionPicker()}{detail && <Badge status={detail.status} />}</article>
          <article className={panel + " space-y-5 p-5"}>
            <h2 className="font-semibold">Progres Pelayanan Obat</h2>
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stages.map((stage, index) => <li key={stage.id} aria-current={index === stageIndex ? "step" : undefined} className={`rounded-md border p-3 text-sm ${index <= stageIndex ? stage.color : "border-slate-100 text-slate-500"}`}><span className="mb-1 block text-xs">{index + 1}</span>{stage.label}</li>)}</ol>
            {detail && <p className="text-xs text-slate-600">Pembaruan terakhir {formatDate(detail.updated_at)}</p>}
          </article>
          <article className={panel + " space-y-3 p-5"}>
            <h2 className="font-semibold">Perubahan Status Terakhir</h2>
            {detail ? <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><Badge status={detail.status} /><span>{formatDate(detail.updated_at)}</span></div> : <p className="text-sm text-slate-600">Pilih resep untuk melihat statusnya.</p>}
            <p className="text-xs text-slate-600">Waktu yang tersedia berasal dari pembaruan terakhir resep.</p>
          </article>
          <article className={panel + " space-y-3 p-5"}>
            <h2 className="font-semibold">Update Status Pelayanan</h2>
            {nextActions.map((label, index) => <button key={label} type="button" className={action + " w-full"} disabled={saving || stageIndex !== index} onClick={index === 2 ? () => { setSelectedId(detail.id); handoverDialog.current.showModal(); } : updateStatus}>{saving && stageIndex === index ? "Menyimpan..." : label}</button>)}
            <dialog ref={handoverDialog} aria-labelledby="handover-title" className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-[#dce7ef] p-5 text-medisync-dark shadow-xl backdrop:bg-slate-900/50">
              <h3 id="handover-title" className="font-semibold">Konfirmasi penyerahan obat</h3>
              <p className="my-3 text-sm text-slate-600">Pastikan obat untuk <strong>{patient?.name || "pasien ini"}</strong> telah diserahkan. Status akan tampil di Tracking Publik.</p>
              <form method="dialog" className="flex flex-wrap justify-end gap-2">
                <button autoFocus className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm">Batal</button>
                <button type="button" className={action} disabled={saving || stageIndex !== 2} onClick={() => { handoverDialog.current.close(); updateStatus(); }}>Tandai Diserahkan</button>
              </form>
            </dialog>
          </article>
        </div>
      ) : (
        <>
          {tab === "dashboard" && <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stages.map((stage) => <article key={stage.id} className={panel + " p-4"}><Badge status={stage.id} /><p className="mt-2 text-2xl font-semibold">{records.filter((row) => row.status === stage.id).length}</p></article>)}</div>}
          <article className={panel + " overflow-hidden"}>
            <div className="space-y-3 p-5">
              <h2 className="font-semibold">{({ dashboard: "Resep Masuk Terbaru", history: doctorHistory ? "Riwayat Rawat Jalan" : "Pelayanan Selesai", patients: "Pasien Pelayanan Obat" })[tab] || "Antrean Pelayanan Obat"}</h2>
              {tab !== "dashboard" && <div key={tab} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                <label className="text-xs text-slate-600">Pencarian<input className={field + " mt-1"} placeholder="Cari pasien, no. RM, atau kode tracking" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
                <label className="text-xs text-slate-600">Status<select className={field + " mt-1"} disabled={tab === "history"} value={doctorHistory ? "sent" : tab === "history" ? "picked_up" : filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }}>{doctorHistory && <option value="sent">Terkirim ke Farmasi</option>}<option value="">Semua status</option>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
                <label className="text-xs text-slate-600">Tanggal<input type="date" className={field + " mt-1"} value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} /></label>
              </div>}
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {visibleRows.map((row) => (
                <article key={row.id} className="space-y-2 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold">{row.examination?.patient?.name || "—"}</h3>
                      <p className="text-xs text-slate-600">{row.examination?.patient?.rm_number || "—"}</p>
                    </div>
                    {doctorHistory ? <span className="rounded-full bg-[#edf5fc] px-3 py-1 text-xs text-medisync-primary">Terkirim ke Farmasi</span> : <Badge status={row.status} />}
                  </div>
                  <div className="flex items-end justify-between gap-2 text-xs text-slate-600">
                    <div>
                      <p>{row.tracking_code || `#${row.id}`}</p>
                      <p>{formatDate(tab === "history" && !doctorHistory ? row.updated_at : row.created_at)}</p>
                    </div>
                    <button type="button" onClick={() => openDetail(row)} className="min-h-11 rounded-md border border-[#dce7ef] px-3 text-sm font-semibold text-medisync-primary">Detail</button>
                  </div>
                </article>
              ))}
              {!visibleRows.length && <p className="px-4 py-8 text-center text-sm text-slate-600">{emptyMessage}</p>}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[660px] text-left text-sm">
                <thead className="bg-[#eef4f8] text-xs text-slate-700"><tr>{["Pasien", "No. Rekam Medis", "Dokter", tab === "history" && !doctorHistory ? "Pembaruan Terakhir" : "Waktu Resep", doctorHistory ? "Pengiriman Resep" : "Status", "Aksi"].map((label) => <th key={label} scope="col" className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRows.map((row) => <tr key={row.id} className="hover:bg-blue-50">
                    <td className="px-5 py-4 font-semibold">{row.examination?.patient?.name || "—"}<span className="mt-1 block font-mono text-xs font-normal text-slate-600">{row.tracking_code}</span></td>
                    <td className="px-5 py-4">{row.examination?.patient?.rm_number || "—"}</td>
                    <td className="px-5 py-4">{row.doctor?.name || "—"}</td>
                    <td className="px-5 py-4 text-xs">{formatDate(tab === "history" && !doctorHistory ? row.updated_at : row.created_at)}</td>
                    <td className="px-5 py-4">{doctorHistory ? <span className="whitespace-nowrap rounded-full bg-[#edf5fc] px-3 py-1 text-xs text-medisync-primary">Terkirim ke Farmasi</span> : <Badge status={row.status} />}</td>
                    <td className="px-5 py-4"><button className="font-semibold text-medisync-primary hover:underline" onClick={() => openDetail(row)}>Detail</button></td>
                  </tr>)}
                  {!visibleRows.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-600">{emptyMessage}</td></tr>}
                </tbody>
              </table>
            </div>
            {tab !== "dashboard" && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5 text-xs"><span>{rows.length} resep</span><div className="flex items-center gap-4"><button disabled={visiblePage === 1} onClick={() => setPage(visiblePage - 1)} className="font-semibold text-medisync-primary disabled:text-slate-400">Sebelumnya</button><span>{visiblePage} / {pageCount}</span><button disabled={visiblePage === pageCount} onClick={() => setPage(visiblePage + 1)} className="font-semibold text-medisync-primary disabled:text-slate-400">Berikutnya</button></div></div>}
          </article>
        </>
      )}
    </section>
  );
}

