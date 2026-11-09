import { useFeedback } from "../../feedbackContext";
import { useState, useEffect } from "react";
import api from "../../services/api";
import DrugAutocomplete from "./DrugAutocomplete";

export default function ResepElektronikView({ patient, onSahkan }) {
  const showFeedback = useFeedback();
  const [obatList, setObatList] = useState([
    {
      drug: null,
      nama: "Paracetamol 500 mg",
      jumlah: "10 tablet",
      dosis: "500 mg",
      aturan: "3 × 1 sesudah makan",
      catatan: "Jika demam atau nyeri",
    },
    {
      drug: null,
      nama: "Cetirizine 10 mg",
      jumlah: "5 tablet",
      dosis: "10 mg",
      aturan: "1 × 1 malam hari",
      catatan: "Dapat menyebabkan kantuk",
    },
  ]);
  const [examination, setExamination] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("currentExaminationId");
    if (id) {
      api
        .get(`/examinations/${id}`)
        .then((res) => setExamination(res.data.data))
        .catch(() => {});
    }
  }, []);

  const akanDitahan =
    examination &&
    Array.isArray(examination.supporting_exams) &&
    examination.supporting_exams.length > 0;

  const handleSahkan = async () => {
    const examinationId = localStorage.getItem("currentExaminationId");
    if (!examinationId || !examination) {
      showFeedback(
        "Silakan lakukan pemeriksaan terlebih dahulu sebelum membuat resep.",
      );
      return;
    }
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const status = akanDitahan ? "on_hold" : "approved";
      const holdReason = akanDitahan
        ? "Menunggu hasil pemeriksaan penunjang: " +
          examination.supporting_exams.join(", ")
        : null;

      const res = await api.post("/prescriptions", {
        examination_id: examination.id,
        doctor_id: user.id || 1,
        status,
        hold_reason: holdReason,
        items: obatList
          .filter((o) => o.nama.trim())
          .map((o) => ({
            drug_name: o.nama,
            quantity: o.jumlah,
            dosage: o.dosis,
            instructions: o.aturan,
            notes: o.catatan,
          })),
      });

      const data = res.data.data;
      localStorage.setItem(
        "lastPrescription",
        JSON.stringify({
          id: data.prescription.id,
          status: data.prescription.status,
          tracking_code: data.tracking_code,
          hold_reason: holdReason,
          items: obatList.filter((o) => o.nama.trim()),
          patient_name: patient?.name,
          rm_number: patient?.rm_number,
        }),
      );
      if (data.tracking_code)
        localStorage.setItem("trackingCode", data.tracking_code);
      onSahkan();
    } catch (error) {
      showFeedback(
        "Gagal menyimpan resep: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!patient)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Tidak ada data pasien
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-1">
          PORTAL DOKTER / RESEP
        </p>
        <h2 className="text-2xl font-bold text-medisync-dark">Resep Elektronik</h2>
        <p className="text-slate-500 text-sm mt-1">
          Tahap 2: Draf resep rawat jalan • Pemeriksaan telah disimpan •
          Diagnosis {examination?.diagnosis || "-"}
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
          <h3 className="text-lg font-bold text-medisync-dark mb-1">Form Resep</h3>
          <p className="text-xs text-slate-500 mb-6">
            Lengkapi jumlah, dosis, aturan pakai, dan catatan obat.
          </p>

          <div className="space-y-6">
            {obatList.map((obat, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-lg border border-[#dce7ef] space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Nama Obat
                    </label>
                    <DrugAutocomplete
                      value={obat.nama}
                      onChange={(selected) => {
                        const l = [...obatList];
                        l[idx] = {
                          drug: selected.drug || null,
                          nama: selected.nama || "",
                          jumlah: selected.jumlah || "",
                          dosis: selected.dosis || "",
                          aturan: selected.aturan || "",
                          catatan: selected.catatan || "",
                        };
                        setObatList(l);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Jumlah
                    </label>
                    <input
                      type="text"
                      value={obat.jumlah}
                      onChange={(e) => {
                        const l = [...obatList];
                        l[idx].jumlah = e.target.value;
                        setObatList(l);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Dosis
                    </label>
                    <input
                      type="text"
                      value={obat.dosis}
                      onChange={(e) => {
                        const l = [...obatList];
                        l[idx].dosis = e.target.value;
                        setObatList(l);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Aturan Pakai
                  </label>
                  <input
                    type="text"
                    value={obat.aturan}
                    onChange={(e) => {
                      const l = [...obatList];
                      l[idx].aturan = e.target.value;
                      setObatList(l);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Catatan
                  </label>
                  <input
                    type="text"
                    value={obat.catatan}
                    onChange={(e) => {
                      const l = [...obatList];
                      l[idx].catatan = e.target.value;
                      setObatList(l);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              setObatList([
                ...obatList,
                {
                  drug: null,
                  nama: "",
                  jumlah: "",
                  dosis: "",
                  aturan: "",
                  catatan: "",
                },
              ])
            }
            className="w-full mt-6 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:border-blue-500 hover:text-medisync-primary transition flex items-center justify-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Obat Lain
          </button>

          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handleSahkan}
              disabled={saving}
              className="px-8 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5] shadow-sm disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : akanDitahan
                  ? "Sahkan Resep (Ditahan Otomatis)"
                  : "Ajukan / Simpan Resep"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-base font-bold text-medisync-dark mb-4">
              Informasi Pasien
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm mb-4">
              <div>
                <p className="text-xs text-slate-500">Nama Pasien</p>
                <p className="font-semibold text-medisync-dark">{patient.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">No. Rekam Medis</p>
                <p className="font-semibold text-medisync-dark font-mono">
                  {patient.rm_number}
                </p>
              </div>
            </div>
            {patient.allergies && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
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
          </div>

          {akanDitahan && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
              <h4 className="text-sm font-bold text-amber-800 mb-1">
                Resep Akan Ditahan Otomatis
              </h4>
              <p className="text-xs text-amber-700">
                Pemeriksaan penunjang diminta:{" "}
                <b>{examination.supporting_exams.join(", ")}</b>. Resep
                tersimpan berstatus <b>on_hold</b> dan kode tracking baru terbit
                setelah dokter mengkonfirmasi hasil.
              </p>
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dce7ef] shadow-sm">
            <h3 className="text-base font-bold text-medisync-dark mb-3">
              Konfirmasi Pengesahan Resep
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Resep yang telah disahkan akan dikirim ke instalasi farmasi dan
              tidak dapat dihapus.
            </p>
            <button
              onClick={handleSahkan}
              disabled={saving}
              className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50 ${akanDitahan ? "bg-amber-600 hover:bg-amber-700" : "bg-medisync-primary hover:bg-[#0958b5]"}`}
            >
              {saving
                ? "Menyimpan..."
                : akanDitahan
                  ? "SAHKAN & TAHAN RESEP"
                  : "SAHKAN RESEP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
