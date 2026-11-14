import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import icons from "../../assets/figma/icons";
import trackingPill from "../../assets/figma-tracking-pill.svg";
import trackingSearch from "../../assets/figma-tracking-search.svg";
import trackingPrivacy from "../../assets/figma-tracking-privacy.svg";

const STAGES = [
  { id: "approved", label: "Menunggu", description: "Resep menunggu verifikasi oleh instalasi farmasi." },
  { id: "accepted", label: "Diterima", description: "Resep telah diterima dan sedang ditinjau oleh petugas farmasi." },
  { id: "preparing", label: "Sedang Diracik", description: "Obat Anda sedang diproses oleh instalasi farmasi." },
  { id: "ready", label: "Siap Diserahkan", description: "Obat Anda siap diambil di instalasi farmasi." },
  { id: "picked_up", label: "Diserahkan", description: "Obat telah diserahkan oleh instalasi farmasi." },
];
const formatDate = value => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value)) + " WIB" : "—";
const panel = "rounded-xl border border-[#dce7ef] bg-white";

export default function TrackingPasienView({ onBackToLogin, backLabel = "Kembali ke login", initialCode = "" }) {
  const [code, setCode] = useState(initialCode);
  const [trackedCode, setTrackedCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [copied, setCopied] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function doTrack(event) {
    event?.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!/^MS-[A-Z0-9]{6}$/.test(normalized)) {
      setError("Gunakan format MS- diikuti 6 huruf atau angka, misalnya MS-482731.");
      return;
    }
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    setTrackedCode("");
    setResult(null);
    setRefreshError(false);
    try {
      const response = await api.get(`/tracking/${encodeURIComponent(normalized)}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setResult(response.data.data);
      setTrackedCode(normalized);
      setLastChecked(new Date());
    } catch (requestError) {
      if (!controller.signal.aborted) setError(requestError.response?.data?.message || "Belum dapat terhubung ke layanan tracking. Silakan coba lagi.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    if (!trackedCode) return;
    const controller = new AbortController();
    let timer;
    async function refresh() {
      try {
        const response = await api.get(`/tracking/${encodeURIComponent(trackedCode)}`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setResult(response.data.data);
          setLastChecked(new Date());
          setRefreshError(false);
        }
      } catch {
        if (!controller.signal.aborted) setRefreshError(true);
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 10000);
      }
    }
    timer = setTimeout(refresh, 10000);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [trackedCode]);

  function reset() {
    requestRef.current?.abort();
    setTrackedCode("");
    setResult(null);
    setCode("");
    setError("");
    setRefreshError(false);
    setCopied(false);
  }
  async function copyCode() {
    try { await navigator.clipboard.writeText(result.tracking_code); setCopied(true); }
    catch { setCopied(false); }
  }
  const stageIndex = STAGES.findIndex(stage => stage.id === result?.status);
  const info = STAGES[stageIndex] || { label: "Menunggu Konfirmasi", description: "Petugas sedang mengonfirmasi resep Anda." };

  return (
    <div className="flex min-h-screen flex-col bg-medisync-light text-medisync-dark">
      <header className="border-b border-[#dce7ef] bg-white">
        <div className="mx-auto flex min-h-[75px] max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="brand-lockup"><span className="brand-mark"><img src={icons.v1} alt="" /></span><span>MediSync</span></div>
          <span className="hidden border-l border-[#dce7ef] pl-4 text-sm font-semibold sm:block">Tracking Pelayanan Obat</span>
          {onBackToLogin && <button type="button" onClick={onBackToLogin} className="button-secondary">{backLabel}</button>}
        </div>
      </header>
      <main className="w-full flex-1">
        <div className="mx-auto max-w-[816px] px-4 py-7 sm:px-6 sm:py-10">
          {!result ? <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 grid h-[60px] w-[60px] place-items-center rounded-2xl bg-[#e3f7f5]"><img src={trackingPill} alt="" /></div>
              <p className="eyebrow mb-3 text-medisync-primary">Layanan pasien tanpa login</p>
              <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">Tracking Pelayanan Obat</h1>
              <p className="mt-3 text-lg">Pantau status pelayanan obat Anda</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Masukkan kode tracking yang diberikan oleh dokter.</p>
            </div>
            <div className={panel + " mx-auto max-w-[480px] p-6"}>
              <form onSubmit={doTrack} className="space-y-3" aria-busy={loading}>
                <label htmlFor="tracking-code" className="block text-sm font-semibold">Kode Tracking</label>
                <input id="tracking-code" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={9} value={code} required disabled={loading} onChange={event => { setCode(event.target.value.toUpperCase()); setError(""); }} placeholder="Contoh: MS-482731" aria-invalid={Boolean(error)} aria-describedby={error ? "tracking-error" : "tracking-hint"} className="min-h-[50px] w-full rounded-[10px] border border-[#cfdae4] px-3.5 py-3 font-mono text-base uppercase placeholder:font-sans placeholder:normal-case placeholder:text-slate-400" />
                <p id="tracking-hint" className="text-xs text-slate-500">Format MS- diikuti 6 huruf atau angka.</p>
                {error && <p id="tracking-error" role="alert" className="form-error">{error}</p>}
                <button type="submit" disabled={loading} className="button-primary w-full"><img src={trackingSearch} alt="" />{loading ? "Mencari resep..." : "Lacak status obat"}</button>
              </form>
              <div className="mt-5 flex items-start gap-3 border-t border-[#dce7ef] pt-4 text-xs"><img src={trackingPrivacy} alt="" /><div><p className="font-semibold">Simpan kode tracking Anda</p><p className="mt-1 leading-relaxed text-slate-500">Kode ini digunakan untuk melihat nama pasien, dokter, detail obat, dan progres pelayanan resep Anda.</p></div></div>
            </div>
          </> : <>
            <button type="button" onClick={reset} className="mb-5 flex min-h-10 items-center gap-2 text-sm font-semibold text-medisync-primary"><img src={icons.v76} alt="" />Lacak kode lain</button>
            <section aria-labelledby="tracking-status" className="mb-5 flex flex-col justify-between gap-5 rounded-xl border border-medisync-primary border-t-[3px] bg-white p-5 sm:flex-row sm:items-center sm:p-7">
              <div><p className="mb-2 text-xs font-semibold text-medisync-primary">Status saat ini</p><h1 id="tracking-status" aria-live="polite" className="text-[28px] font-semibold tracking-tight">{info.label}</h1><p className="mt-2 text-sm leading-relaxed text-slate-500">{info.description}</p></div>
              <div className="shrink-0 sm:border-l sm:border-[#dce7ef] sm:pl-6"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Kode tracking</p><p className="mt-1 font-mono text-xl font-bold">{result.tracking_code}</p><button type="button" onClick={copyCode} className="mt-2 min-h-8 text-xs font-semibold text-medisync-primary">{copied ? "Kode tersalin" : "Salin kode"}</button></div>
            </section>
            <section aria-labelledby="patient-info" className={panel + " mb-5 p-5 sm:p-6"}>
              <h2 id="patient-info" className="mb-4 text-base font-semibold">Informasi resep Anda</h2>
              <dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Nama pasien</dt><dd className="mt-1 text-base font-semibold">{result.patient_name || "—"}</dd></div><div><dt className="text-xs text-slate-500">Dokter pemberi resep</dt><dd className="mt-1 text-base font-semibold">{result.doctor_name || "—"}</dd></div></dl>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Tanggal resep · {formatDate(result.created_at)}</p>
            </section>
            <section aria-labelledby="tracking-progress" className={panel + " mb-5 p-5 sm:p-6"}>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h2 id="tracking-progress" className="text-base font-semibold">Progres pelayanan obat</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Diperbarui otomatis setiap 10 detik.</p></div><span role="status" className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${refreshError ? "bg-amber-50 text-amber-800" : "bg-[#e3f7f5] text-teal-700"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{refreshError ? "Menghubungkan ulang" : "Terhubung"}</span></div>
              <ol className="tracking-timeline">{STAGES.map((stage, index) => {
                const done = index < stageIndex;
                const current = index === stageIndex;
                const event = result.status_events?.find(item => item.to_status === stage.id);
                return <li key={stage.id} className={done ? "is-done" : current ? "is-current" : ""} aria-current={current ? "step" : undefined}><span className="timeline-dot">{done || current ? <img src={icons.v78} alt="" /> : index + 1}</span><div><p className="timeline-label">{stage.label}</p><p className="timeline-description">{event ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(event.created_at)) + " WIB" : done ? "Tahap selesai" : current ? "Status saat ini" : "Menunggu proses"}</p></div></li>;
              })}</ol>
              {refreshError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">Koneksi terputus. Status terakhir tetap ditampilkan dan akan diperbarui saat koneksi kembali.</p>}
            </section>
            <section aria-labelledby="tracking-drugs" className={panel + " mb-5 overflow-hidden"}>
              <div className="flex items-center justify-between border-b border-[#e8eef3] px-5 py-4 sm:px-6"><h2 id="tracking-drugs" className="text-base font-semibold">Detail obat</h2><span className="text-xs text-slate-500">{result.items?.length || 0} jenis obat</span></div>
              <div className="divide-y divide-[#e8eef3]">{result.items?.map((item, index) => <article key={`${index}-${item.drug_name}`} className="p-5 sm:px-6"><div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">{item.drug_name}</h3><span className="text-xs text-slate-600">{item.quantity}</span></div><dl className="grid gap-3 text-sm sm:grid-cols-[1fr_2fr]"><div><dt className="text-xs text-slate-500">Dosis</dt><dd className="mt-1">{item.dosage}</dd></div><div><dt className="text-xs text-slate-500">Aturan pakai</dt><dd className="mt-1 leading-relaxed">{item.instructions}</dd></div></dl></article>)}{!result.items?.length && <p className="p-5 text-sm text-slate-500">Rincian obat belum tersedia. Hubungi petugas farmasi.</p>}</div>
            </section>
            <div className={panel + " mb-5 grid gap-4 p-5 text-sm sm:grid-cols-2"}><div><p className="text-xs text-slate-500">Layanan</p><p className="mt-1 font-semibold">Instalasi Farmasi</p></div><div><p className="text-xs text-slate-500">Pembaruan resep terakhir</p><p className="mt-1 font-semibold">{formatDate(result.updated_at)}</p></div></div>
            <div className={`mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed ${stageIndex >= 3 ? "border-teal-200 bg-teal-50 text-teal-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}><img src={icons.v80} alt="" /><p>{stageIndex === 4 ? "Obat telah diserahkan. Jika ada pertanyaan mengenai aturan pakai, hubungi petugas farmasi." : stageIndex === 3 ? "Obat siap diambil. Tunjukkan kode tracking Anda kepada petugas instalasi farmasi." : "Silakan datang ke instalasi farmasi setelah status menjadi ‘Siap Diserahkan’."}</p></div>
            <p className="text-center text-xs leading-relaxed text-slate-500">Informasi resep dapat diakses menggunakan kode tracking. Simpan kode Anda dengan baik.{lastChecked && <span className="mt-1 block">Terakhir terhubung {formatDate(lastChecked)}</span>}</p>
          </>}
        </div>
      </main>
      <footer className="border-t border-[#dce7ef] bg-white"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-slate-500"><p>© {new Date().getFullYear()} RS Medika Utama · MediSync</p>{onBackToLogin && <button type="button" className="min-h-9 font-semibold text-medisync-primary" onClick={onBackToLogin}>{backLabel}</button>}</div></footer>
    </div>
  );
}
