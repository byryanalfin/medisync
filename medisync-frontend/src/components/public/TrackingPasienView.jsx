import trackingLogo from "../../assets/figma-tracking-logo.svg";
import trackingPill from "../../assets/figma-tracking-pill.svg";
import trackingSearch from "../../assets/figma-tracking-search.svg";
import trackingPrivacy from "../../assets/figma-tracking-privacy.svg";
import { useState, useEffect, Fragment } from "react";
import api from "../../services/api";

const STAGES = [
  "Menunggu",
  "Diterima",
  "Sedang Diracik",
  "Siap Diserahkan",
  "Diserahkan",
];

const stageInfo = (status) => {
  if (status === "preparing")
    return { stage: 2, title: "Sedang Diracik", desc: "Obat Anda sedang diproses oleh instalasi farmasi." };
  if (status === "ready")
    return { stage: 3, title: "Siap Diserahkan", desc: "Obat Anda siap diambil di instalasi farmasi." };
  if (status === "picked_up")
    return { stage: 4, title: "Diserahkan", desc: "Obat telah diserahkan oleh instalasi farmasi." };
  if (status === "on_hold")
    return {
      stage: 0,
      title: "Menunggu Konfirmasi",
      desc: "Resep ditahan sementara menunggu konfirmasi hasil pemeriksaan penunjang.",
    };
  return {
    stage: 0,
    title: "Menunggu",
    desc: "Resep menunggu verifikasi oleh instalasi farmasi.",
  };
};

const formatWaktu = (d) => {
  const tanggal = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
  return `${tanggal} ${jam} WIB`;
};

export default function TrackingPasienView({ onBackToLogin, backLabel = "Kembali ke login internal" }) {
  const [code, setCode] = useState("");
  const [trackedCode, setTrackedCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const doTrack = async (e) => {
    e?.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.get(`/tracking/${c}`);
      setResult(res.data.data);
      setTrackedCode(c);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Kode tracking tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  // Pembaruan langsung: polling otomatis tiap 10 detik
  useEffect(() => {
    if (!trackedCode) return;
    const t = setInterval(async () => {
      try {
        const res = await api.get(`/tracking/${trackedCode}`);
        setResult(res.data.data);
        setLastUpdate(new Date());
      } catch {
        // Pertahankan hasil terakhir sampai polling berikutnya.
      }
    }, 10000);
    return () => clearInterval(t);
  }, [trackedCode]);

  const info = result ? stageInfo(result.status) : null;
  const stage = info?.stage ?? 0;

  return (
    <div className="min-h-screen bg-medisync-light font-sans flex flex-col text-medisync-dark">
      {/* Header */}
      <header className="bg-white border-b border-[#dce7ef]">
        <div className="mx-auto gap-3 px-4 sm:px-8 min-h-[75px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-medisync-primary rounded-lg flex items-center justify-center">
              <img src={trackingLogo} alt="" />
            </div>
            <span className="text-lg font-bold text-slate-800">MediSync</span>
          </div>
          <span className="border-l border-[#dce7ef] pl-4 text-sm font-semibold">
            Tracking Pelayanan Obat
          </span>
        </div>
      </header>

      <main className="flex-1 w-full bg-[radial-gradient(ellipse_at_top,#e8f7f6_0%,transparent_60%)]">
        <div className="max-w-[816px] mx-auto px-4 py-7 sm:px-6 sm:py-10">
          {!result ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 grid h-[60px] w-[60px] place-items-center rounded-2xl bg-[#e3f7f5]"><img src={trackingPill} alt="" /></div>
                <p className="mb-3 text-xs font-bold text-medisync-primary">LAYANAN PASIEN TANPA LOGIN</p>
                <h1 className="mb-2 text-3xl font-semibold tracking-tight">Tracking Pelayanan Obat</h1>
                <p className="mb-2 text-xl font-medium">Pantau Status Pelayanan Obat Anda</p>
                <p className="text-sm text-slate-600">Masukkan kode tracking yang diberikan oleh dokter.</p>
              </div>
              <div className="mx-auto max-w-[480px] rounded-2xl border border-[#dce7ef] bg-white p-6 shadow-sm">
                <form onSubmit={doTrack} className="space-y-3">
                  <label htmlFor="tracking-code" className="block text-sm font-semibold">Kode Tracking</label>
                  <input
                    id="tracking-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="Contoh: MS-482731"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "tracking-error" : "tracking-hint"}
                    className="w-full rounded-[10px] border border-[#cfdae4] px-4 py-3 text-sm focus:outline focus:outline-2 focus:outline-medisync-primary"
                  />
                  <p id="tracking-hint" className="text-xs text-slate-600">Gunakan format MS- diikuti 6 karakter.</p>
                  <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-medisync-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[#0958b5] disabled:opacity-50">
                    <img src={trackingSearch} alt="" />
                    {loading ? "Mencari..." : "Lacak Status"}
                  </button>
                </form>
                <div className="mt-4 flex items-start gap-3 border-t border-[#dce7ef] pt-4 text-xs">
                  <img src={trackingPrivacy} alt="" />
                  <div><p className="font-semibold">Privasi Anda terlindungi</p><p className="mt-1 text-slate-600">Halaman ini hanya menampilkan status pelayanan obat, tanpa data medis pribadi.</p></div>
                </div>
              </div>
              {error && <p id="tracking-error" role="alert" className="mx-auto mt-5 max-w-[480px] rounded-xl border border-[#f2b8ad] bg-[#fff2f0] px-5 py-4 text-sm text-[#a12e26]">{error}</p>}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setResult(null);
                  setTrackedCode("");
                  setCode("");
                }}
                className="flex items-center gap-1 text-sm text-medisync-primary font-medium hover:underline mb-4"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Lacak kode lain
              </button>

              {/* Kartu Status Saat Ini */}
              <div className="bg-white border-2 border-medisync-primary rounded-xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-medisync-primary uppercase tracking-wider mb-1">
                    Status Saat Ini
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800">
                    {info.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{info.desc}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Kode Tracking
                  </p>
                  <p className="text-xl font-bold font-mono text-slate-800">
                    {result.tracking_code}
                  </p>
                </div>
              </div>

              {/* Kartu Progres + Stepper */}
              <div className="bg-white rounded-xl border border-[#dce7ef] shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-6 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Progres Pelayanan Obat
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Status diperbarui langsung oleh instalasi farmasi.
                    </p>
                  </div>
                  <span className="animate-live-teal flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-700 flex-shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    Pembaruan Langsung
                  </span>
                </div>

                {/* Stepper horizontal */}
                <div className="flex items-center">
                  {STAGES.map((label, i) => {
                    const state =
                      i < stage ? "done" : i === stage ? "current" : "todo";
                    return (
                      <Fragment key={label}>
                        {i > 0 && (
                          <div
                            className={`flex-1 h-0.5 mx-1 ${i <= stage ? "bg-teal-500" : "bg-slate-200"}`}
                          />
                        )}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            state === "done"
                              ? "bg-teal-500 text-white"
                              : state === "current"
                                ? "bg-medisync-primary text-white ring-4 ring-blue-100"
                                : "bg-white border-2 border-slate-300 text-slate-400"
                          }`}
                        >
                          {state === "todo" ? (
                            <span className="text-sm font-bold">{i + 1}</span>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
                <div className="grid grid-cols-5 gap-1 mt-3 text-center [overflow-wrap:anywhere]">
                  {STAGES.map((label, i) => {
                    const state =
                      i < stage ? "done" : i === stage ? "current" : "todo";
                    return (
                      <div key={label}>
                        <p
                          className={`text-sm font-semibold ${state === "done" ? "text-teal-600" : state === "current" ? "text-medisync-primary" : "text-slate-400"}`}
                        >
                          {label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {state === "done"
                            ? "Tahap selesai"
                            : state === "current"
                              ? "Status saat ini"
                              : "Menunggu proses"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info layanan */}
              <div className="bg-white rounded-xl border border-[#dce7ef] shadow-sm p-4 sm:p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Layanan</p>
                  <p className="text-sm font-bold text-slate-800">
                    Instalasi Farmasi
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    Waktu pembaruan terakhir
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {lastUpdate ? formatWaktu(lastUpdate) : "-"}
                  </p>
                </div>
              </div>

              {/* Banner status */}
              {result.status === "on_hold" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-sm text-red-700">
                    Resep sedang ditahan menunggu konfirmasi hasil pemeriksaan
                    penunjang. Pelayanan obat berlanjut setelah konfirmasi.
                  </p>
                </div>
              )}
              {result.status !== "on_hold" && stage < 3 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Silakan datang ke instalasi farmasi setelah status menjadi
                    'Siap Diserahkan'.
                  </p>
                </div>
              )}
              {stage === 3 && (
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-teal-800">
                    Obat siap diambil. Tunjukkan kode tracking ini di loket
                    instalasi farmasi.
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center">
                Halaman publik hanya menampilkan informasi status pelayanan
                obat. Tidak ada identitas pasien atau informasi medis yang
                ditampilkan.
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#dce7ef]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            © 2025 RS Medika Utama · MediSync · Informasi status pelayanan obat
          </p>
          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              className="text-xs text-slate-500 hover:text-medisync-primary underline"
            >
              {backLabel}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
