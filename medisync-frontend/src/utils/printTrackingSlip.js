import { escapeHtml, formatDate } from "./format";

export function printTrackingSlip(prescription) {
  if (!prescription?.tracking_code) throw new Error("Kode tracking belum tersedia.");
  const popup = window.open("", "_blank", "width=640,height=760");
  if (!popup) throw new Error("Izinkan popup browser untuk mencetak slip kode unik.");
  popup.opener = null;
  const configured = import.meta.env.VITE_PUBLIC_TRACKING_URL || "";
  let publicUrl = "";
  try {
    const url = new URL(configured);
    if (["https:", "http:"].includes(url.protocol)) publicUrl = url.href;
  } catch { /* Local development has no patient-accessible public URL. */ }
  popup.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Slip kode tracking MediSync</title><style>
  @page{size:A5;margin:15mm}*{box-sizing:border-box}body{font:14px/1.6 Arial,sans-serif;color:#17324d;margin:0;padding:28px}.slip{max-width:480px;margin:auto;border:1px solid #cbd5e1;padding:24px;border-radius:8px}h1{font-size:22px;margin:0}small{color:#52677b}h2{font-size:14px;font-weight:normal;margin-top:24px}.code{font:bold 34px monospace;letter-spacing:2px;border-block:1px solid #cbd5e1;padding:20px 0;text-align:center;overflow-wrap:anywhere}ol{padding-left:20px}.controls{display:flex;gap:12px;justify-content:center;margin:24px}button{padding:10px 18px;font-size:14px;cursor:pointer}footer{border-top:1px solid #cbd5e1;margin-top:24px;padding-top:12px;font-size:12px}@media print{body{padding:0}.slip{border:0;padding:0}.controls{display:none}}</style></head><body><article class="slip"><header><h1>MediSync</h1><small>RS Medika Utama · Pelayanan obat</small></header><h2>Nama pasien</h2><strong>${escapeHtml(prescription.examination?.patient?.name || "—")}</strong><p><small>Tanggal resep: ${escapeHtml(formatDate(prescription.created_at))}</small></p><h2>Kode unik tracking</h2><p class="code">${escapeHtml(prescription.tracking_code)}</p><ol><li>Buka ${publicUrl ? `<strong>${escapeHtml(publicUrl)}</strong>` : "website MediSync rumah sakit"}.</li><li>Pilih <strong>Lacak pelayanan obat</strong>.</li><li>Masukkan kode unik di atas untuk melihat status resep.</li></ol><footer>Simpan slip ini dan tunjukkan kode kepada petugas saat mengambil obat. Kode tracking dapat digunakan untuk mengakses informasi resep.</footer></article><div class="controls"><button id="print">Cetak / Simpan PDF</button><button id="close">Tutup</button></div></body></html>`);
  popup.document.close();
  popup.document.getElementById("print").addEventListener("click", () => popup.print());
  popup.document.getElementById("close").addEventListener("click", () => popup.close());
  popup.focus();
  return popup;
}
