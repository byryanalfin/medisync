import { useEffect, useState } from "react";
import api from "../../services/api";
import { printTrackingSlip } from "../../utils/printTrackingSlip";
import icons from "../../assets/figma/icons";
import { formatDate, statusLabel } from "../../utils/format";

export default function ResepDisahkanView({ onBackToDashboard, onTrack }) {
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const id = JSON.parse(localStorage.getItem("lastPrescription") || "null")?.id;
        if (!id) throw new Error("Belum ada resep tersimpan. Buka riwayat untuk melihat resep Anda.");
        const response = await api.get(`/prescriptions/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted) setPrescription(response.data.data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.response?.data?.message || requestError.message);
      }
    }
    load();
    return () => controller.abort();
  }, []);
  async function release() {
    if (confirming) return;
    setConfirming(true);
    setError("");
    try {
      const response = await api.put(`/prescriptions/${prescription.id}`, { status: "approved" });
      setPrescription(previous => ({ ...previous, ...response.data.data }));
    } catch (requestError) { setError(requestError.response?.data?.message || "Pengesahan belum tersimpan. Silakan coba lagi."); }
    finally { setConfirming(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(prescription.tracking_code); setCopied(true); }
    catch { setError("Kode belum dapat disalin otomatis. Silakan salin kode yang ditampilkan."); }
  }
  function printSlip() {
    try { printTrackingSlip(prescription); }
    catch (printError) { setError(printError.message); }
  }
  const held = prescription?.status === "on_hold";
  return <section className="mx-auto max-w-[1440px] space-y-5">
    <div><p className="mb-2 text-xs font-semibold text-medisync-primary">PORTAL DOKTER / RESEP</p><h1 className="text-2xl font-semibold tracking-tight">{held ? "Resep Menunggu Konfirmasi" : "Resep Disahkan"}</h1><p className="mt-1 text-sm text-slate-500">{prescription ? `Resep #${prescription.id} · ${formatDate(prescription.created_at)}` : "Memuat resep tersimpan..."}</p></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {prescription && <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]"><div className="space-y-5"><article className="rounded-xl border border-[#dce7ef] bg-white p-6 text-center sm:p-8">
      <span className={`mx-auto mb-5 grid h-[60px] w-[60px] place-items-center rounded-full ${held ? "bg-amber-100 text-amber-800" : "bg-[#0d9d92]"}`}>{held ? <span className="text-2xl">!</span> : <img src={icons.v47} alt="" />}</span>
      <h2 className="text-xl font-semibold">{held ? "Resep tersimpan dan ditahan" : "Resep berhasil disahkan"}</h2><p className="mb-5 mt-2 text-sm text-slate-500">{held ? prescription.hold_reason : "Resep telah dikirim ke instalasi farmasi."}</p>
      {held ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900"><p className="leading-relaxed">Konfirmasikan setelah hasil pemeriksaan penunjang telah ditinjau. Kode tracking akan diterbitkan saat resep disahkan.</p><label className="mt-4 flex items-start gap-2 text-xs"><input type="checkbox" required id="results-reviewed" className="mt-0.5 h-4 w-4 accent-[#1269d3]" />Hasil pemeriksaan penunjang telah saya tinjau dan resep dapat dilanjutkan.</label><button type="button" className="button-primary mt-4 w-full" disabled={confirming} onClick={() => { if (document.getElementById("results-reviewed").reportValidity()) release(); }}>{confirming ? "Mengesahkan..." : "Konfirmasi hasil & sahkan"}</button></div> : <><div className="rounded-xl border border-[#dce7ef] bg-[#f4f8ff] p-5"><p className="text-[10px] font-semibold uppercase tracking-wide text-medisync-primary">Kode tracking pasien</p><p className="my-3 break-all font-mono text-3xl font-bold">{prescription.tracking_code}</p><div className="flex flex-wrap items-center justify-center gap-2"><button type="button" className="button-secondary" onClick={copy}><img src={icons.v48} alt="" />{copied ? "Kode tersalin" : "Salin kode"}</button><button type="button" className="button-secondary" onClick={printSlip}>Cetak slip kode unik</button></div></div><div className="mt-4 rounded-lg bg-[#e3f7f5] p-4 text-xs leading-relaxed text-teal-800"><strong>Berikan kode ini kepada pasien</strong><p className="mt-1">Pasien dapat memantau status dan rincian obat tanpa login.</p></div></>}
      <div className="mt-5 flex flex-wrap justify-between gap-3"><button type="button" className="button-secondary" onClick={onBackToDashboard}>Kembali ke dashboard</button>{!held && onTrack && <button type="button" className="button-primary" onClick={() => onTrack(prescription.tracking_code)}>Lihat halaman tracking</button>}</div>
    </article></div><div className="space-y-5"><article className="rounded-xl border border-[#dce7ef] bg-white p-5"><h2 className="text-lg font-semibold">Informasi Resep</h2><p className="mt-3 text-sm">{prescription.doctor?.name}</p><p className="mt-2 text-xs text-slate-500">{formatDate(prescription.created_at)}</p><p className="mt-4 text-xs text-slate-500">Pasien</p><p className="mt-1 text-sm font-semibold">{prescription.examination?.patient?.name}</p></article><article className="rounded-xl border border-[#dce7ef] bg-white p-5"><h2 className="text-lg font-semibold">Ringkasan Resep</h2><p className="mt-2 text-xs font-medium text-teal-700">{statusLabel(prescription.status)}</p><div className="mt-3 divide-y divide-slate-100">{prescription.items?.map(item => <div key={item.id} className="py-3 text-sm"><p className="font-semibold">{item.drug_name} · {item.quantity}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{item.dosage} · {item.instructions}</p>{item.notes && <p className="mt-1 text-xs text-slate-500">Catatan: {item.notes}</p>}</div>)}</div></article></div></div>}
  </section>;
}
