import { useFeedback } from "../../feedbackContext";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { ageInYears, formatDate } from "../../utils/format";

const emptyForm = {
  rm_number: "",
  name: "",
  birth_date: "",
  gender: "Laki-laki",
  allergies: "",
};

export default function DaftarPasienView({ onDetail, onPeriksa }) {
  const showFeedback = useFeedback();
  const [patients, setPatients] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchPatients = () =>
    api.get("/patients")
      .then((response) => { setPatients(response.data.data); setLoadError(""); })
      .catch(() => setLoadError("Data pasien belum dapat dimuat. Periksa koneksi dan muat ulang halaman."))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchPatients();
  }, []);

  const openAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setModalMode("edit");
    setEditingId(p.id);
    setForm({
      rm_number: p.rm_number,
      name: p.name,
      birth_date: p.birth_date ? p.birth_date.slice(0, 10) : "",
      gender: p.gender,
      allergies: p.allergies || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        allergies: form.allergies.trim() ? form.allergies.trim() : null,
      };
      if (modalMode === "edit") {
        await api.put(`/patients/${editingId}`, payload);
        showFeedback("Data pasien telah diperbarui.", "Perubahan tersimpan");
      } else {
        await api.post("/patients", payload);
        showFeedback("Data pasien telah ditambahkan.", "Pasien ditambahkan");
      }
      setShowModal(false);
      setForm(emptyForm);
      fetchPatients();
    } catch (error) {
      const errMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0][0]
        : error.response?.data?.message || error.message;
      showFeedback(
        (modalMode === "edit"
          ? "Gagal menyimpan perubahan: "
          : "Gagal menambah pasien: ") + errMsg,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/patients/${deletingPatient.id}`);
      showFeedback("Data pasien telah dihapus.", "Pasien dihapus");
      setDeletingPatient(null);
      fetchPatients();
    } catch (error) {
      showFeedback(
        "Gagal menghapus: " + (error.response?.data?.message || error.message),
      );
      setDeletingPatient(null);
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rm_number.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Memuat data pasien...
      </div>
    );
  }

  return (
    <div>
      {loadError && <p role="alert" className="form-error mb-5">{loadError}</p>}
      <div className="mb-6">
        <p className="text-xs font-bold text-medisync-primary tracking-wider uppercase mb-1">
          PORTAL DOKTER / PASIEN
        </p>
        <h2 className="text-2xl font-bold text-medisync-dark">Daftar Pasien</h2>
        <p className="text-slate-500 text-sm mt-1">
          Temukan pasien dan lanjutkan pemeriksaan rawat jalan hari ini.
        </p>
      </div>

      <div className="min-w-0 bg-white rounded-xl border border-[#dce7ef] shadow-sm p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-medisync-dark">
              Pasien Terdaftar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {filteredPatients.length} pasien ditemukan
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5] transition flex items-center gap-2 shadow-sm"
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
            Tambah Pasien
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Pencarian
            </label>
            <input
              type="text"
              placeholder="Cari nama pasien atau nomor rekam medis"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

        </div>

        <div className="divide-y divide-slate-100 md:hidden">{filteredPatients.map(patient => <article key={patient.id} className="space-y-3 py-4"><div><h3 className="text-sm font-semibold">{patient.name}</h3><p className="mt-1 break-all text-xs text-slate-500">{patient.rm_number}</p><p className="mt-1 text-xs text-slate-500">{patient.gender} · {ageInYears(patient.birth_date)} tahun</p></div><div className="flex flex-wrap gap-2"><button type="button" className="button-secondary" onClick={() => onDetail(patient)}>Detail Pasien</button><button type="button" className="button-primary" onClick={() => onPeriksa(patient)}>Periksa</button><button type="button" className="button-secondary" onClick={() => openEdit(patient)}>Edit</button></div></article>)}{!filteredPatients.length && <p className="py-6 text-sm text-slate-500">Tidak ada pasien ditemukan.</p>}</div>
        <div className="hidden max-w-full overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dce7ef] text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-2">No</th>
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="py-3 px-2">No. Rekam Medis</th>
                <th className="py-3 px-2">Identitas</th>
                <th className="py-3 px-2">Terdaftar</th>
                <th className="py-3 px-2">Pemeriksaan</th>
                <th className="py-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPatients.map((p, idx) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-4 px-2 text-slate-500">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="py-4 px-2 font-semibold text-medisync-dark">
                    {p.name}
                  </td>
                  <td className="py-4 px-2 text-slate-600 font-mono text-xs">
                    {p.rm_number}
                  </td>
                  <td className="py-4 px-2 text-slate-600">
                    {p.gender} ·{" "}
                    {ageInYears(p.birth_date)}{" "}
                    tahun
                  </td>
                  <td className="py-4 px-2 text-slate-600">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${p.examinations_count ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {p.examinations_count ? `${p.examinations_count} pemeriksaan` : "Belum diperiksa"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        onClick={() => onDetail && onDetail(p)}
                        className="text-medisync-primary font-medium hover:underline text-xs cursor-pointer"
                      >
                        Detail Pasien
                      </button>
                      <button
                        onClick={() => onPeriksa && onPeriksa(p)}
                        className="text-medisync-primary font-medium hover:underline text-xs cursor-pointer"
                      >
                        Periksa ›
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit pasien"
                        className="text-amber-600 hover:text-amber-700 cursor-pointer"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingPatient(p)}
                        title="Hapus pasien"
                        className="text-red-500 hover:text-red-600 cursor-pointer"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs text-slate-500">Menampilkan {filteredPatients.length} pasien sesuai pencarian.</p>
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
          Data pasien digunakan untuk pelayanan internal. Pilih Detail Pasien
          untuk melihat riwayat ringkas, atau Periksa untuk memulai pemeriksaan.
        </p>
      </div>

      {/* === MODAL TAMBAH / EDIT PASIEN === */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-medisync-dark mb-1">
              {modalMode === "edit" ? "Edit Data Pasien" : "Tambah Pasien Baru"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {modalMode === "edit"
                ? "Perubahan akan langsung tersimpan ke database."
                : "Data tersimpan ke database dan langsung muncul di daftar kunjungan."}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    No. Rekam Medis
                  </label>
                  <input
                    type="text"
                    required
                    value={form.rm_number}
                    onChange={(e) =>
                      setForm({ ...form, rm_number: e.target.value })
                    }
                    placeholder="RM-2025-00218"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama pasien"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    required
                    value={form.birth_date}
                    onChange={(e) =>
                      setForm({ ...form, birth_date: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Alergi (opsional)
                </label>
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) =>
                    setForm({ ...form, allergies: e.target.value })
                  }
                  placeholder="Contoh: Penicillin — kosongkan jika tidak ada"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-medisync-primary text-white rounded-lg text-sm font-semibold hover:bg-[#0958b5] disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : modalMode === "edit"
                      ? "Simpan Perubahan"
                      : "Simpan Pasien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL KONFIRMASI HAPUS === */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-medisync-dark">
                  Hapus Pasien?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Anda akan menghapus pasien <b>{deletingPatient.name}</b> (
              <span className="font-mono text-xs">
                {deletingPatient.rm_number}
              </span>
              ) dari sistem.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingPatient(null)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
