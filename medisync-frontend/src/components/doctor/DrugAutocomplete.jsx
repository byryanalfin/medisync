import { useState } from "react";
import api from "../../services/api";

export default function DrugAutocomplete({ value, onChange }) {
  const [search, setSearch] = useState(value || "");
  const [showModal, setShowModal] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load obat saat modal dibuka
  const fetchDrugs = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await api.get("/drugs", {
        params: { search: searchTerm, per_page: 50 },
      });
      setDrugs(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch obat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (drug) => {
    // Auto-fill semua field
    onChange({
      drug: drug,
      nama: drug.name,
      jumlah: drug.default_quantity || "",
      dosis: drug.default_dosage || "",
      aturan: drug.default_instructions || "",
      catatan: drug.default_notes || "",
    });
    setSearch(drug.name);
    setShowModal(false);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchDrugs(val);
  };

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange({
            drug: null,
            nama: e.target.value,
            jumlah: "",
            dosis: "",
            aturan: "",
            catatan: "",
          });
        }}
        onFocus={() => { setShowModal(true); fetchDrugs(""); }}
        placeholder="Klik untuk pilih obat..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
      />

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#dce7ef]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-medisync-dark">Pilih Obat</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Cari nama obat..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
            </div>

            {/* List Obat */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Memuat...</div>
              ) : drugs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Tidak ada obat ditemukan
                </div>
              ) : (
                <div className="grid gap-2">
                  {drugs.map((drug) => (
                    <button
                      key={drug.id}
                      onClick={() => handleSelect(drug)}
                      className="w-full text-left p-4 border border-[#dce7ef] rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <p className="font-semibold text-medisync-dark">
                        {drug.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {drug.generic_name} • {drug.category}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Dosis: {drug.default_dosage || "-"} • Aturan:{" "}
                        {drug.default_instructions || "-"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
