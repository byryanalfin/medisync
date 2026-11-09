import { useFeedback } from "./feedbackContext";
import { useState } from "react";
import api from "./services/api";
import DashboardView from "./components/doctor/DashboardView";
import DaftarPasienView from "./components/doctor/DaftarPasienView";
import DetailPasienView from "./components/doctor/DetailPasienView";
import PemeriksaanView from "./components/doctor/PemeriksaanView";
import PharmacyQueueView from "./components/pharmacy/PharmacyQueueView";
import ResepElektronikView from "./components/doctor/ResepElektronikView";
import TrackingPasienView from "./components/public/TrackingPasienView";
import ResepDisahkanView from "./components/doctor/ResepDisahkanView";

const pharmacyTabs = [
  ["dashboard", "Dashboard", "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
  ["queue", "Antrean Resep", "M8 5H5v16h14V5h-3M8 3h8v4H8zM8 11h8M8 15h8"],
  ["patients", "Data Pasien", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-4"],
  ["bpjs", "Verifikasi BPJS", "M12 22s7-3 7-9V5l-7-3-7 3v8c0 6 7 9 7 9zM9 12l2 2 4-4"],
  ["status", "Status Pelayanan", "M2 12h5l3-8 4 16 3-8h5"],
  ["history", "Riwayat", "M3 12a9 9 0 1 1 3 7M3 5v7h7M12 7v5l4 2"],
];

function App() {
  const showFeedback = useFeedback();
  const [currentPage, setCurrentPage] = useState("login");
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("dokter");
  const [email, setEmail] = useState("andi.saputra@medika.com");
  const [password, setPassword] = useState("password123");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);

      if (response.data.user.role === "admin_apoteker") {
        setCurrentView("dashboard");
        setCurrentPage("admin-portal");
      } else {
        setCurrentPage("dashboard");
      }
    } catch (error) {
      showFeedback(
        "Login gagal: " +
          (error.response?.data?.message || "Email/password salah"),
      );
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // Auto-fill demo credentials sesuai role, tapi tetap bisa diedit manual
    setEmail(
      role === "dokter" ? "andi.saputra@medika.com" : "nur.aisyah@medika.com",
    );
    setPassword("password123");
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // Ignore error
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("login");
    setCurrentView("dashboard");
    setSelectedPatient(null);
  };

  // === LOGIN PAGE ===
  if (currentPage === "login") {
    return (
      <div className="flex min-h-[100dvh] flex-col lg:flex-row font-sans">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a4a6e] to-[#0d6e8e] text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-wide">
                MediSync
              </span>
            </div>

            <div className="mb-12">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-4">
                SISTEM PELAYANAN TERINTEGRASI
              </p>
              <h1 className="text-5xl font-light leading-tight mb-6">
                Pelayanan resep lebih
                <br />
                cepat, aman, dan
                <br />
                transparan.
              </h1>
              <p className="text-lg text-white/80 max-w-md leading-relaxed">
                Menghubungkan dokter dan instalasi farmasi secara real-time
                untuk mengurangi waktu tunggu pasien.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Resep elektronik terintegrasi",
                "Status pelayanan real-time",
                "Tracking publik tanpa akun",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
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
                  <span className="text-white/90 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/50 relative z-10">
            © 2025 RS Medika Utama • MediSync v1.0
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-1 flex-col justify-center bg-white px-5 py-8 sm:px-10 lg:w-1/2 lg:px-12 xl:px-20">
          <div className="max-w-md w-full mx-auto">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-blue-600 mb-3">
              AKSES INTERNAL RUMAH SAKIT
            </p>
            <h2 className="text-3xl font-semibold text-slate-800 mb-2">
              Masuk ke MediSync
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Silakan masuk menggunakan akun internal Anda.
            </p>

            {/* Toggle Role */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => handleRoleChange("dokter")}
                className={`flex-1 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition ${
                  selectedRole === "dokter"
                    ? "bg-white shadow-sm text-slate-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {/* ...icon svg... */}
                Dokter
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("admin_apoteker")}
                className={`flex-1 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition ${
                  selectedRole === "admin_apoteker"
                    ? "bg-white shadow-sm text-slate-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {/* ...icon svg... */}
                Admin Apoteker
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@medika.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                Masuk
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </form>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Butuh bantuan untuk masuk?
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hubungi Administrator SIMRS di ext. 120.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500 mb-2">Anda pasien?</p>
              <button
                onClick={() => setCurrentPage("tracking")}
                className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 mx-auto"
              >
                Lacak pelayanan obat tanpa login
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "tracking") {
    return <TrackingPasienView onBackToLogin={() => setCurrentPage(user?.role === "admin_apoteker" ? "admin-portal" : user ? "dashboard" : "login")} backLabel={user?.role === "admin_apoteker" ? "Kembali ke Instalasi Farmasi" : user ? "Kembali ke Portal Dokter" : undefined} />;
  }

  // === ADMIN PORTAL ===
  if (currentPage === "admin-portal") {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row bg-medisync-light font-sans">
        <aside className="w-full lg:w-[248px] bg-gradient-to-b from-[#103a5e] to-[#0a2945] text-white flex flex-col lg:fixed lg:h-full z-20">
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-wide">
              MediSync
            </span>
          </div>

          <div className="px-4 py-3 lg:py-6">
            <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#205578] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                AP
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {user?.name || "Nur Aisyah, S.Farm"}
                </p>
                <p className="text-[10px] text-white/60 truncate">
                  Admin Apoteker
                </p>
              </div>
            </div>
          </div>

          <nav aria-label="Instalasi Farmasi" className="flex flex-1 flex-wrap gap-1 px-4 pb-4 lg:block lg:space-y-1">
            {pharmacyTabs.map(([id, label, path]) => (
              <button key={id} type="button" aria-current={currentView === id ? "page" : undefined} onClick={() => setCurrentView(id)} className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-left text-sm lg:w-full ${currentView === id ? "border-teal-300 bg-[#174968] text-white" : "border-transparent text-slate-200 hover:bg-white/10"}`}>
                <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
                {label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Keluar
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 lg:ml-[248px] flex flex-col min-h-screen">
          <header className="min-h-16 gap-2 py-2 bg-white border-b border-[#dce7ef] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                Rumah Sakit Medika Utama
              </p>
              <h1 className="text-lg font-semibold text-slate-800 -mt-0.5">
                Instalasi Farmasi
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button type="button" onClick={() => setCurrentPage("tracking")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#14314b] hover:bg-slate-50">Tracking Publik</button>
              <div className="w-9 h-9 bg-[#205578] rounded-full flex items-center justify-center text-white text-xs font-bold">
                AP
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-7">
            <PharmacyQueueView tab={currentView} onTabChange={setCurrentView} userName={user?.name} />
          </main>
        </div>
      </div>
    );
  }

  // === DOKTOR PORTAL ===
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-medisync-light font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-[248px] bg-gradient-to-b from-[#103a5e] to-[#0a2945] text-white flex flex-col lg:fixed lg:h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-wide">MediSync</span>
        </div>

        <div className="px-4 py-3 lg:py-6">
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              AS
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {user?.name || "dr. Andi Saputra"}
              </p>
              <p className="text-[10px] text-white/60 truncate">Dokter Umum</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-wrap gap-1 px-4 pb-4 lg:block lg:space-y-1 lg:overflow-y-auto">
          {[
            {
              id: "dashboard",
              label: "Dashboard",
              icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
            },
            {
              id: "pasien",
              label: "Pasien",
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
            },
            {
              id: "pemeriksaan",
              label: "Pemeriksaan",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            },
            {
              id: "resep",
              label: "Resep",
              icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
            },
            {
              id: "riwayat",
              label: "Riwayat",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex min-h-11 items-center gap-2 px-3 py-2 lg:w-full rounded-lg text-sm font-medium transition ${
                currentView === item.id ||
                (item.id === "pasien" &&
                  [
                    "detail-pasien",
                    "pemeriksaan",
                    "resep",
                    "resep-disahkan",
                  ].includes(currentView))
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 lg:ml-[248px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="min-h-16 gap-2 py-2 bg-white border-b border-[#dce7ef] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
              Rumah Sakit Medika Utama
            </p>
            <h1 className="text-lg font-semibold text-slate-800 -mt-0.5">
              Portal Dokter
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={() => setCurrentPage("tracking")} className="min-h-11 px-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Tracking Publik
            </button>
            <button type="button" aria-label="Notifikasi" disabled className="hidden sm:flex w-9 h-9 border border-slate-300 rounded-lg items-center justify-center opacity-60">
              <svg
                className="w-5 h-5 text-slate-600"
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
            </button>
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              AS
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-7">
          {currentView === "dashboard" && (
            <DashboardView userName={user?.name}
              onNavigate={(view, patient) => {
                if (patient) setSelectedPatient(patient);
                setCurrentView(view);
              }}
            />
          )}

          {currentView === "pasien" && (
            <DaftarPasienView
              onDetail={(patient) => {
                setSelectedPatient(patient);
                setCurrentView("detail-pasien");
              }}
              onPeriksa={(patient) => {
                setSelectedPatient(patient);
                setCurrentView("pemeriksaan");
              }}
            />
          )}

          {currentView === "detail-pasien" && (
            <DetailPasienView
              patient={selectedPatient}
              onStartExam={() => setCurrentView("pemeriksaan")}
            />
          )}

          {currentView === "pemeriksaan" && (
            <PemeriksaanView
              patient={selectedPatient}
              onNext={() => setCurrentView("resep")}
            />
          )}

          {currentView === "resep" && (
            <ResepElektronikView
              patient={selectedPatient}
              onSahkan={() => setCurrentView("resep-disahkan")}
            />
          )}

          {currentView === "resep-disahkan" && (
            <ResepDisahkanView
              onBackToDashboard={() => {
                setSelectedPatient(null);
                setCurrentView("dashboard");
              }}
            />
          )}

          {currentView === "riwayat" && <PharmacyQueueView tab="history" doctorHistory />}

          {/* JARING PENGAMAN: kalau currentView aneh, tampilkan instead of blank */}
          {![
            "dashboard",
            "pasien",
            "detail-pasien",
            "pemeriksaan",
            "resep",
            "resep-disahkan",
            "riwayat",
          ].includes(currentView) && (
            <div className="p-12 text-center text-slate-500">
              View tidak dikenal: "{currentView}" — ada typo di App.jsx
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
