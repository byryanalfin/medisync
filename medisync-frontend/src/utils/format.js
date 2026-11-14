export const formatDate = value => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value)) + " WIB" : "—";
export function ageInYears(value) {
  if (!value) return "—";
  const birth = new Date(value);
  const now = new Date();
  const birthdayPending = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  return now.getFullYear() - birth.getFullYear() - Number(birthdayPending);
}
export const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export const statusLabel = value => ({ draft: "Draf", on_hold: "Menunggu hasil pemeriksaan", approved: "Menunggu", accepted: "Diterima", preparing: "Sedang Diracik", ready: "Siap Diserahkan", picked_up: "Diserahkan" })[value] || "—";
