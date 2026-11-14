import icons from "../../assets/figma/icons";

export default function LoginView({ email, password, role, onEmailChange, onPasswordChange, onRoleChange, onSubmit, onTrack, loading, error }) {
  return (
    <main className="login-page">
      <section className="login-brand" aria-label="Tentang MediSync">
        <div className="brand-lockup"><span className="brand-mark"><img src={icons.v1} alt="" /></span><span>MediSync</span></div>
        <div className="login-brand-content">
          <p className="eyebrow">Sistem pelayanan terintegrasi</p>
          <h1>Pelayanan resep lebih cepat, aman, dan transparan.</h1>
          <p className="login-intro">Menghubungkan dokter dan instalasi farmasi secara real-time untuk mengurangi waktu tunggu pasien.</p>
          <ul className="login-benefits">{["Resep elektronik terintegrasi", "Status pelayanan real-time", "Tracking publik tanpa akun"].map(text => <li key={text}><span><img src={icons.v2} alt="" /></span>{text}</li>)}</ul>
        </div>
        <p className="login-copyright">© {new Date().getFullYear()} RS Medika Utama · MediSync</p>
      </section>
      <section className="login-main" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <div className="login-mobile-brand brand-lockup"><span className="brand-mark"><img src={icons.v1} alt="" /></span><span>MediSync</span></div>
          <p className="eyebrow text-medisync-primary">Akses internal rumah sakit</p>
          <h2 id="login-title">Masuk ke MediSync</h2>
          <p className="login-subtitle">Silakan masuk menggunakan akun internal Anda.</p>
          <div className="login-roles" aria-label="Jenis akun">
            <button type="button" aria-pressed={role === "dokter"} disabled={loading} onClick={() => onRoleChange("dokter")}><img src={icons.v3} alt="" />Dokter</button>
            <button type="button" aria-pressed={role === "admin_apoteker"} disabled={loading} onClick={() => onRoleChange("admin_apoteker")}><img src={icons.v4} alt="" />Admin Apoteker</button>
          </div>
          <form onSubmit={onSubmit} className="login-form" aria-busy={loading}>
            <label htmlFor="login-email">Email<input id="login-email" type="email" autoComplete="username" required maxLength={255} value={email} onChange={event => onEmailChange(event.target.value)} placeholder="nama@medika.com" disabled={loading} /></label>
            <label htmlFor="login-password">Password<input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => onPasswordChange(event.target.value)} placeholder="Masukkan kata sandi" disabled={loading} /></label>
            {error && <p role="alert" className="form-error">{error}</p>}
            <button type="submit" className="button-primary" disabled={loading}>{loading ? "Sedang masuk..." : "Masuk"}{!loading && <img src={icons.v5} alt="" />}</button>
          </form>
          <aside className="login-help"><img src={icons.v6} alt="" /><div><p>Butuh bantuan untuk masuk?</p><span>Hubungi Administrator SIMRS di ext. 120.</span></div></aside>
          <div className="login-patient"><p>Anda pasien?</p><button type="button" className="button-patient" onClick={onTrack}><span><strong>Lacak pelayanan obat</strong><small>Tanpa login · Gunakan kode dari dokter</small></span><img src={icons.v7} alt="" /></button></div>
        </div>
      </section>
    </main>
  );
}
