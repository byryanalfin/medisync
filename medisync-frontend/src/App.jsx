import LoginView from "./components/auth/LoginView";
import PortalLayout from "./components/layout/PortalLayout";
import { useState, useEffect } from "react";
import api from "./services/api";
import DashboardView from "./components/doctor/DashboardView";
import DaftarPasienView from "./components/doctor/DaftarPasienView";
import DetailPasienView from "./components/doctor/DetailPasienView";
import PemeriksaanView from "./components/doctor/PemeriksaanView";
import DrugCatalogView from "./components/pharmacy/DrugCatalogView";
import PharmacyQueueView from "./components/pharmacy/PharmacyQueueView";
import ResepElektronikView from "./components/doctor/ResepElektronikView";
import TrackingPasienView from "./components/public/TrackingPasienView";
import ResepDisahkanView from "./components/doctor/ResepDisahkanView";


function App() {
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(() => Boolean(localStorage.getItem("token")));
  const [currentPage, setCurrentPage] = useState("login");
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [trackingInitialCode, setTrackingInitialCode] = useState("");
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("dokter");
  const [email, setEmail] = useState(import.meta.env.DEV ? "andi.saputra@medika.com" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "password123" : "");

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    let active = true;
    api.get("/me").then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentPage(data.user.role === "admin_apoteker" ? "admin-portal" : "dashboard");
    }).catch(() => {
      if (active) setLoginError("Sesi belum dapat dipulihkan. Silakan masuk kembali.");
    }).finally(() => { if (active) setSessionChecking(false); });
    return () => { active = false; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError("");
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
      setLoginError(
        "Login gagal: " +
          (error.response?.data?.message ||
            (!error.response
              ? "Tidak dapat terhubung ke server. Periksa koneksi dan pastikan server aktif."
              : "Terjadi kesalahan pada server. Silakan coba lagi.")),
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setLoginError("");
    // Auto-fill demo credentials sesuai role, tapi tetap bisa diedit manual
    if (import.meta.env.DEV) {
      setEmail(role === "dokter" ? "andi.saputra@medika.com" : "nur.aisyah@medika.com");
      setPassword("password123");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // Ignore error
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    ["currentExaminationId", "lastPrescription", "trackingCode"].forEach(key => localStorage.removeItem(key));
    setUser(null);
    setCurrentPage("login");
    setCurrentView("dashboard");
    setSelectedPatient(null);
  };

  if (sessionChecking) return <main className="grid min-h-screen place-items-center bg-medisync-light text-sm text-slate-600" role="status">Memulihkan sesi MediSync...</main>;

  if (currentPage === "login") {
    return <LoginView email={email} password={password} role={selectedRole} onEmailChange={setEmail} onPasswordChange={setPassword} onRoleChange={handleRoleChange} onSubmit={handleLogin} onTrack={() => { setTrackingInitialCode(""); setCurrentPage("tracking"); }} loading={loginLoading} error={loginError} />;
  }

  if (currentPage === "tracking") {
    return <TrackingPasienView initialCode={trackingInitialCode} onBackToLogin={() => setCurrentPage(user?.role === "admin_apoteker" ? "admin-portal" : user ? "dashboard" : "login")} backLabel={user?.role === "admin_apoteker" ? "Kembali ke Instalasi Farmasi" : user ? "Kembali ke Portal Dokter" : undefined} />;
  }

  function navigate(view, patient) {
    if (patient) {
      if (patient.id !== selectedPatient?.id) {
        ["currentExaminationId", "lastPrescription", "trackingCode"].forEach(key => localStorage.removeItem(key));
      }
      setSelectedPatient(patient);
    }
    if (["pemeriksaan", "resep"].includes(view) && !patient && !selectedPatient) {
      setCurrentView("pasien");
      return;
    }
    setCurrentView(view);
  }

  return (
    <PortalLayout user={user} activeView={currentView} onNavigate={navigate} onTrack={() => { setTrackingInitialCode(""); setCurrentPage("tracking"); }} onLogout={handleLogout}>
      {user?.role === "admin_apoteker" ? currentView === "drugs" ? <DrugCatalogView /> : <PharmacyQueueView tab={currentView} onTabChange={setCurrentView} userName={user.name} /> : <>
        {currentView === "dashboard" && <DashboardView userName={user?.name} onNavigate={navigate} />}
        {currentView === "pasien" && <DaftarPasienView onDetail={patient => navigate("detail-pasien", patient)} onPeriksa={patient => navigate("pemeriksaan", patient)} />}
        {currentView === "detail-pasien" && <DetailPasienView key={selectedPatient?.id} patient={selectedPatient} onStartExam={() => navigate("pemeriksaan")} />}
        {currentView === "pemeriksaan" && <PemeriksaanView key={selectedPatient?.id} patient={selectedPatient} doctor={user} onNext={() => setCurrentView("resep")} onBackToDashboard={() => navigate("dashboard")} />}
        {currentView === "resep" && <ResepElektronikView key={selectedPatient?.id} patient={selectedPatient} onSahkan={() => setCurrentView("resep-disahkan")} />}
        {currentView === "resep-disahkan" && <ResepDisahkanView onBackToDashboard={() => { setSelectedPatient(null); setCurrentView("dashboard"); }} onTrack={code => { setTrackingInitialCode(code); setCurrentPage("tracking"); }} />}
        {currentView === "riwayat" && <PharmacyQueueView tab="history" doctorHistory />}
      </>}
    </PortalLayout>
  );
}

export default App;
