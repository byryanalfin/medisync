import { useFeedback } from "../../feedbackContext";
import { useState } from "react";
import api from "../../services/api";
import { ageInYears, formatDate, escapeHtml } from "../../utils/format";

const OPSI_PENUNJANG = [
  "Laboratorium Darah",
  "Rontgen Thorax",
  "EKG",
  "USG Abdomen",
];

export default function PemeriksaanView({
  patient,
  onNext,
  onBackToDashboard,
  doctor,
}) {
  const showFeedback = useFeedback();
  const [keluhan, setKeluhan] = useState("");
  const [riwayat, setRiwayat] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [penunjang, setPenunjang] = useState([]);
  const [rawat, setRawat] = useState("jalan");
  const [saving, setSaving] = useState(false);
  const [showSurat, setShowSurat] = useState(false);
  const [flowStopped, setFlowStopped] = useState(false);

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Tidak ada data pasien
      </div>
    );
  }

  const age = ageInYears(patient.birth_date);

  const togglePenunjang = (item) => {
    setPenunjang((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const simpanPemeriksaan = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const res = await api.post("/examinations", {
      patient_id: patient.id,
      doctor_id: user.id || 1,
      complaints: keluhan,
      history: riwayat,
      diagnosis: diagnosis,
      supporting_exams: penunjang,
      care_decision: rawat === "jalan" ? "rawat_jalan" : "rawat_inap",
    });
    localStorage.setItem("currentExaminationId", res.data.data.id);
    return res.data.data;
  };

  // MED-6: rawat inap = alur farmasi rawat jalan dihentikan
  const handleLanjut = async () => {
    if (saving || flowStopped) return;
    if (!keluhan.trim() || !diagnosis.trim()) {
      showFeedback("Lengkapi keluhan dan diagnosis sebelum menyimpan pemeriksaan.");
      return;
    }
    setSaving(true);
    try {
      await simpanPemeriksaan();
      if (rawat === "inap") {
        setFlowStopped(true);
      } else {
        onNext();
      }
    } catch (error) {
      showFeedback(
        "Gagal menyimpan pemeriksaan: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setSaving(false);
    }
  };

  // MED-4: cetak surat pengantar pemeriksaan penunjang
  const cetakSurat = () => {
    const nomor =
      "SP-" +
      patient.rm_number +
      "-" +
      new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const html = `
      <html><head><title>Surat Pengantar Pemeriksaan Penunjang</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        .kop { text-align: center; border-bottom: 3px double #111; padding-bottom: 12px; margin-bottom: 24px; }
        .kop h2 { margin: 0; } .kop p { margin: 4px 0 0; font-size: 12px; }
        h3 { text-align: center; text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        td { padding: 6px 8px; vertical-align: top; } td.label { width: 200px; }
        .ttd { margin-top: 48px; text-align: right; padding-right: 60px; }
      </style></head><body>
      <div class="kop">
        <h2>RUMAH SAKIT MEDIKA UTAMA</h2>
        <p>Jl. Kesehatan No. 120, Jakarta • Telp (021) 555-0120</p>
        <p>Instalasi Pelayanan Terintegrasi MediSync</p>
      </div>
      <h3>SURAT PENGANTAR PEMERIKSAAN PENUNJANG</h3>
      <p>Nomor: ${nomor}</p>
      <table>
        <tr><td class="label">Nama Pasien</td><td>: ${escapeHtml(patient.name)}</td></tr>
        <tr><td class="label">No. Rekam Medis</td><td>: ${escapeHtml(patient.rm_number)}</td></tr>
        <tr><td class="label">Usia / Jenis Kelamin</td><td>: ${age} tahun / ${escapeHtml(patient.gender)}</td></tr>
        <tr><td class="label">Diagnosis Kerja</td><td>: ${escapeHtml(diagnosis)}</td></tr>
        <tr><td class="label">Pemeriksaan Diminta</td><td>: ${escapeHtml(penunjang.join(", "))}</td></tr>
        <tr><td class="label">Tanggal</td><td>: ${escapeHtml(formatDate(new Date()))}</td></tr>
      </table>
      <p>Mohon dilakukan pemeriksaan penunjang tersebut di atas untuk menunjang penegakan diagnosis.
      Hasil pemeriksaan harap dikirim kembali ke dokter pengirim melalui sistem MediSync.</p>
      <div class="ttd">
        <p>Dokter Pengirim,</p><br/><br/>
        <p><b>${escapeHtml(doctor?.name)}</b><br/>Dokter Pengirim</p>
      </div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) { showFeedback("Izinkan popup untuk mencetak surat pengantar."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-1">
          PORTAL DOKTER / PEMERIKSAAN
        </p>
        <h2 className="text-2xl font-bold text-medisync-dark">
          Pemeriksaan Pasien
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Tahap 1: Pemeriksaan rawat jalan sebelum pembuatan resep
        </p>
      </div>

      {/* MED-6: banner alur dihentikan untuk rawat inap */}
      {flowStopped && (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-300 rounded-xl">
          <h3 className="text-base font-bold text-amber-800 mb-1">
            Alur Farmasi Rawat Jalan Dihentikan
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            Keputusan perawatan: <b>Rawat Inap</b>. Pemeriksaan tersimpan, namun
            resep elektronik TIDAK dibuat karena pelayanan obat mengikuti alur
            farmasi rawat inap (MED-6).
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Form */}
        <div className="min-w-0 lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <h3 className="text-lg font-bold text-medisync-dark mb-1">
            Form Pemeriksaan
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            {formatDate(new Date())} · {doctor?.name}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label htmlFor="exam-patient" className="block text-xs font-medium text-slate-500 mb-1">
                Nama Pasien
              </label>
              <input
                id="exam-patient"
                type="text"
                value={patient.name}
                readOnly
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
              />
            </div>
            <div>
              <label htmlFor="exam-rm" className="block text-xs font-medium text-slate-500 mb-1">
                No. Rekam Medis
              </label>
              <input
                id="exam-rm"
                type="text"
                value={patient.rm_number}
                readOnly
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 font-mono"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="exam-complaints" className="block text-xs font-medium text-slate-500 mb-1">
                Keluhan
              </label>
              <textarea
                id="exam-complaints"
                rows="2"
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label htmlFor="exam-history" className="block text-xs font-medium text-slate-500 mb-1">
                Riwayat Penyakit
              </label>
              <textarea
                id="exam-history"
                rows="2"
                value={riwayat}
                onChange={(e) => setRiwayat(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label htmlFor="exam-diagnosis" className="block text-xs font-medium text-slate-500 mb-1">
                Diagnosis
              </label>
              <input
                id="exam-diagnosis"
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* MED-4: checkbox pemeriksaan penunjang */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Pemeriksaan Penunjang
              </label>
              <div className="grid grid-cols-2 gap-2">
                {OPSI_PENUNJANG.map((opsi) => (
                  <label
                    key={opsi}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm cursor-pointer transition ${penunjang.includes(opsi) ? "border-blue-500 bg-blue-50 text-blue-700 font-medium" : "border-[#dce7ef] text-slate-600 hover:border-slate-300"}`}
                  >
                    <input
                      type="checkbox"
                      checked={penunjang.includes(opsi)}
                      onChange={() => togglePenunjang(opsi)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    {opsi}
                  </label>
                ))}
              </div>
              {penunjang.length > 0 && (
                <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    {penunjang.length} pemeriksaan diminta • Resep akan{" "}
                    <b>ditahan otomatis</b> sampai hasil dikonfirmasi.
                  </p>
                  <button
                    onClick={() => setShowSurat(true)}
                    className="px-3 py-1.5 bg-medisync-primary text-white rounded-lg text-xs font-semibold hover:bg-[#0958b5] flex-shrink-0"
                  >
                    Cetak Surat Pengantar
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Keputusan Perawatan
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRawat("jalan")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition ${rawat === "jalan" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-[#dce7ef] text-slate-500"}`}
                >
                  ● Rawat Jalan
                </button>
                <button
                  type="button"
                  onClick={() => setRawat("inap")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition ${rawat === "inap" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-[#dce7ef] text-slate-500"}`}
                >
                  ○ Rawat Inap
                </button>
              </div>
              {rawat === "inap" && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  Rawat inap: alur farmasi rawat jalan akan <b>dihentikan</b>{" "}
                  setelah pemeriksaan disimpan. Resep elektronik tidak dibuat.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handleLanjut}
              disabled={saving || flowStopped}
              className="px-6 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5] shadow-sm disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : rawat === "inap"
                  ? "Simpan & Hentikan Alur Farmasi"
                  : "Lanjut ke Resep"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-base font-bold text-medisync-dark mb-3">
              Pengingat Keselamatan
            </h3>
            {patient.allergies && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0"
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
                <p className="text-xs text-red-700 font-medium">
                  Peringatan Alergi: {patient.allergies} — hindari zat pemicu
                  alergi.
                </p>
              </div>
            )}
            <p className="text-xs text-slate-500">
              Periksa alergi sebelum memilih obat. Data pemeriksaan ini hanya
              dapat diakses oleh dokter.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-base font-bold text-medisync-dark mb-3">
              Alur Rawat Jalan
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="font-semibold text-medisync-dark">
                1. Pemeriksaan pasien
              </li>
              <li className="text-slate-500">2. Buat resep elektronik</li>
              <li className="text-slate-500">3. Sahkan resep</li>
              <li className="text-slate-500">
                4. Sistem mengirim resep ke farmasi
              </li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                Kode tracking dibuat otomatis setelah pengesahan, bukan oleh
                dokter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SURAT PENGANTAR (MED-4) */}
      {showSurat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-8">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8">
            <div className="text-center border-b-4 border-double border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-medisync-dark">
                RUMAH SAKIT MEDIKA UTAMA
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Jl. Kesehatan No. 120, Jakarta • Telp (021) 555-0120
              </p>
            </div>
            <h3 className="text-center font-bold text-medisync-dark underline mb-4">
              SURAT PENGANTAR PEMERIKSAAN PENUNJANG
            </h3>
            <table className="w-full text-sm mb-4">
              <tbody>
                <tr>
                  <td className="py-1 w-48 text-slate-500">Nama Pasien</td>
                  <td className="py-1 font-semibold text-medisync-dark">
                    : {patient.name}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500">No. Rekam Medis</td>
                  <td className="py-1 font-mono text-medisync-dark">
                    : {patient.rm_number}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500">Usia / Jenis Kelamin</td>
                  <td className="py-1 text-medisync-dark">
                    : {age} tahun / {patient.gender}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500">Diagnosis Kerja</td>
                  <td className="py-1 text-medisync-dark">: {diagnosis}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500">Pemeriksaan Diminta</td>
                  <td className="py-1 text-medisync-dark">
                    : {penunjang.join(", ")}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-slate-600 mb-8">
              Mohon dilakukan pemeriksaan penunjang tersebut di atas untuk
              menunjang penegakan diagnosis. Hasil pemeriksaan harap dikirim
              kembali ke dokter pengirim melalui sistem MediSync.
            </p>
            <div className="text-right pr-10 text-sm text-medisync-dark">
              <p>Dokter Pengirim,</p>
              <div className="h-16"></div>
              <p className="font-bold">{doctor?.name}</p>
              <p className="text-xs text-slate-500">Dokter Pengirim</p>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowSurat(false)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                onClick={cetakSurat}
                className="px-5 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5]"
              >
                Cetak Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
