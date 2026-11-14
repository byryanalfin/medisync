import { useState } from "react";
import icons from "../../assets/figma/icons";

const pharmacyTabs = [["dashboard", "Dashboard", "v20"], ["queue", "Antrean Resep", "v59"], ["patients", "Data Pasien", "v22"], ["drugs", "Katalog Obat", "v26"], ["bpjs", "Verifikasi BPJS", "v61"], ["status", "Status Pelayanan", "v63"], ["history", "Riwayat", "v27"]];
const doctorTabs = [["dashboard", "Dashboard", "v20"], ["pasien", "Pasien", "v22"], ["pemeriksaan", "Pemeriksaan", "v24"], ["resep", "Resep", "v26"], ["riwayat", "Riwayat", "v27"]];

export default function PortalLayout({ user, activeView, onNavigate, onTrack, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pharmacy = user.role === "admin_apoteker";
  const tabs = pharmacy ? pharmacyTabs : doctorTabs;
  const initials = user.name.replace(/^dr\.\s*/i, "").split(/[\s,]+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("");
  const active = activeView === "detail-pasien" ? "pasien" : activeView === "resep-disahkan" ? "resep" : activeView;
  return (
    <div className="flex min-h-screen flex-col bg-medisync-light text-medisync-dark lg:flex-row">
      <a href="#main-content" className="sr-only z-50 bg-white p-3 focus:not-sr-only focus:fixed">Langsung ke konten utama</a>
      <aside className="flex shrink-0 flex-col bg-[#103654] text-white lg:fixed lg:inset-y-0 lg:w-[248px]">
        <div className="flex min-h-[75px] items-center justify-between border-b border-white/10 px-5"><div className="brand-lockup"><span className="brand-mark bg-white/15"><img src={icons.v1} alt="" /></span><span>MediSync</span></div><button type="button" aria-expanded={menuOpen} aria-controls="portal-navigation" onClick={() => setMenuOpen(!menuOpen)} className="min-h-11 rounded-lg border border-white/20 px-3 text-xs font-semibold lg:hidden">{menuOpen ? "Tutup" : "Menu"}</button></div>
        <div id="portal-navigation" className={`${menuOpen ? "flex" : "hidden"} flex-1 flex-col lg:flex`}>
          <div className="mx-4 my-4 flex items-center gap-3 rounded-lg bg-white/10 p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-semibold">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{user.name}</p><p className="mt-1 text-[10px] text-slate-300">{pharmacy ? "Admin Apoteker" : "Dokter"}</p></div></div>
          <nav aria-label={pharmacy ? "Instalasi Farmasi" : "Portal Dokter"} className="flex-1 space-y-1 px-4 py-2">{tabs.map(([id, label, icon]) => <button type="button" key={id} aria-current={active === id ? "page" : undefined} onClick={() => { onNavigate(id); setMenuOpen(false); }} className={`flex min-h-11 w-full items-center gap-3 rounded-lg border-l-2 px-3 py-3 text-left text-[13px] transition-colors ${active === id ? "border-[#4ccfc2] bg-[#174968] font-semibold text-white" : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"}`}><img src={icons[icon]} alt="" className="shrink-0" />{label}</button>)}</nav>
          <div className="border-t border-white/10 p-4"><button type="button" onClick={onLogout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"><img src={icons.v28} alt="" />Keluar</button></div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col lg:ml-[248px]">
        <header className="sticky top-0 z-10 flex min-h-[75px] items-center justify-between gap-3 border-b border-[#dce7ef] bg-white px-4 py-3 sm:px-8"><div><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-slate-500">Rumah Sakit Medika Utama</p><p className="mt-1 font-heading text-base font-medium">{pharmacy ? "Instalasi Farmasi" : "Portal Dokter"}</p></div><div className="flex items-center gap-3"><button type="button" onClick={onTrack} className="button-secondary"><img className="hidden sm:block" src={icons.v8} alt="" /><span>Tracking Publik</span></button><span aria-label={user.name} className="hidden h-9 w-9 place-items-center rounded-full bg-medisync-primary text-xs font-semibold text-white sm:grid">{initials}</span></div></header>
        <main id="main-content" className="min-w-0 flex-1 p-4 sm:px-8 sm:py-6">{children}</main>
        <footer className="px-4 pb-5 pt-2 text-[10px] text-slate-500 sm:px-8">MediSync · RS Medika Utama · Pelayanan resep terintegrasi</footer>
      </div>
    </div>
  );
}
