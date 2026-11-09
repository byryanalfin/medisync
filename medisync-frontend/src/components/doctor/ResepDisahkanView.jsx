import { useFeedback } from "../../feedbackContext";
import { useState } from "react";
import api from "../../services/api";

export default function ResepDisahkanView({ onBackToDashboard }) {
  const showFeedback = useFeedback();
  const [presc, setPresc] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lastPrescription"));
    } catch {
      return null;
    }
  });
  const [confirming, setConfirming] = useState(false);
  const [copyResult, setCopyResult] = useState(null);

  const isHold = presc?.status === "on_hold";
  const kode =
    presc?.tracking_code || localStorage.getItem("trackingCode") || "MS-000000";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(kode);
      setCopyResult({ code: kode, copied: true });
    } catch {
      setCopyResult({ code: kode, copied: false });
    }
  };

  // MED-5: konfirmasi hasil → lepas hold → tracking code terbit
  const konfirmasiHasil = async () => {
    setConfirming(true);
    try {
      const res = await api.put(`/prescriptions/${presc.id}`, {
        status: "approved",
      });
      const updated = res.data.data;
      const next = {
        ...presc,
        status: updated.status,
        tracking_code: updated.tracking_code,
      };
      setPresc(next);
      localStorage.setItem("lastPrescription", JSON.stringify(next));
      if (updated.tracking_code)
        localStorage.setItem("trackingCode", updated.tracking_code);
    } catch (error) {
      showFeedback(
        "Gagal konfirmasi hasil: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-1">
          PORTAL DOKTER / RESEP
        </p>
        <h2 className="text-2xl font-bold text-medisync-dark">Resep Disahkan</h2>
        <p className="text-slate-500 text-sm mt-1">
          Tahap 3: Pengesahan berhasil pada 18 Feb 2025, 09:42 WIB •
          RSP-250218-042
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 lg:col-span-2 bg-white p-8 rounded-xl border border-[#dce7ef] shadow-sm text-center">
          {isHold ? (
            <>
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-medisync-dark mb-2">
                Resep Ditahan Otomatis
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Resep menunggu hasil pemeriksaan penunjang sebelum masuk antrean
                farmasi.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Alasan Penahanan
                </p>
                <p className="text-sm text-amber-800">
                  {presc?.hold_reason ||
                    "Menunggu hasil pemeriksaan penunjang."}
                </p>
              </div>
              <button
                onClick={konfirmasiHasil}
                disabled={confirming}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 shadow-sm disabled:opacity-50 mb-4"
              >
                {confirming
                  ? "Mengkonfirmasi..."
                  : "Konfirmasi Hasil Pemeriksaan"}
              </button>
              <p className="text-xs text-slate-400">
                Kode tracking dibuat otomatis setelah konfirmasi hasil.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
              <h3 className="text-2xl font-bold text-medisync-dark mb-2">
                Resep Berhasil Disahkan
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                Resep telah dikirim ke instalasi farmasi.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-2">
                  KODE TRACKING PASIEN
                </p>
                <p className="text-4xl font-bold text-slate-900 font-mono mb-3">
                  {kode}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-medisync-primary font-medium hover:underline flex items-center gap-1 mx-auto"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  {copyResult?.code === kode && copyResult.copied ? "Kode disalin" : "Salin Kode"}
                </button>
                <span role="status" className="text-xs text-slate-600">
                  {copyResult?.code === kode && (copyResult.copied ? "Kode siap ditempel." : "Kode gagal disalin. Salin manual dari teks di atas.")}
                </span>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-8">
                <p className="text-sm font-semibold text-teal-800 mb-1">
                  Berikan kode ini kepada pasien
                </p>
                <p className="text-xs text-teal-600">
                  Pasien melacak pelayanan obat di halaman publik tanpa login.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={onBackToDashboard}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-base font-bold text-medisync-dark mb-4">
              Informasi Resep
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Dokter</p>
                <p className="font-semibold text-medisync-dark">dr. Andi Saputra</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tanggal</p>
                <p className="font-semibold text-medisync-dark">
                  18 Feb 2025 • 09:42 WIB
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 tracking-wider uppercase">
                  Status
                </p>
                <p
                  className={`text-sm font-semibold ${isHold ? "text-amber-600" : "text-teal-600"}`}
                >
                  {isHold ? "Ditahan (menunggu hasil)" : "Terkirim ke Farmasi"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 tracking-wider uppercase">
                  Kode Tracking
                </p>
                <p
                  className={`text-2xl font-bold font-mono ${isHold ? "text-slate-300" : "text-medisync-primary"}`}
                >
                  {isHold ? "—" : kode}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-base font-bold text-medisync-dark mb-4">
              Ringkasan Resep
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Hanya dapat dilihat • {presc?.patient_name || "-"}
            </p>
            <div className="space-y-3">
              {(presc?.items || []).map((item, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-medisync-dark">
                    {item.nama} • {item.jumlah}
                  </p>
                  <p className="text-xs text-slate-500">
                    Dosis {item.dosis} • {item.aturan}
                  </p>
                  {item.catatan && (
                    <p className="text-xs text-slate-500">
                      Catatan: {item.catatan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <svg
          className="w-5 h-5 text-medisync-primary flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p className="text-sm text-blue-700">
          Kode tracking unik dibuat otomatis oleh sistem untuk setiap resep.
          Resep yang telah disahkan tidak dapat diedit atau dihapus.
        </p>
      </div>
    </div>
  );
}
