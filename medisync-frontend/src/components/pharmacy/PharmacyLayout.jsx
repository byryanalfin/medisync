import { useState } from "react";

export default function PharmacyLayout({ children, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menus = [
    { id: "dashboard", label: "Dashboard Antrean", icon: "📋" },
    { id: "search", label: "Cari Pasien/Resep", icon: "🔍" },
    { id: "history", label: "Riwayat", icon: "📜" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f3d5c] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">MediSync</h1>
          <p className="text-xs text-white/60 mt-1">Portal Admin Apoteker</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeMenu === menu.id
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            {menus.find((m) => m.id === activeMenu)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Nur Aisyah</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              NA
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
