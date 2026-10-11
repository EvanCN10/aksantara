export const GuruDashboardPage = () => {
  return (
    <main>
      <h1>Dashboard Guru Aksantara</h1>
      <p>Pemantauan aktivitas literasi siswa dan analitik kelas.</p>
      
      <section>
        <h2>Ringkasan Kelas</h2>
        <p>Total Siswa Aktif: 28 Siswa</p>
        <p>Rata-rata Akurasi Menulis: 88.5%</p>
        <p>Sesi Hardware Selesai: 42 Sesi</p>
      </section>

      <section>
        <h2>Daftar Siswa</h2>
        <ul>
          <li><a href="/guru/siswa/1">Siswa 01 — Budi (Lontara: 92%, Sunda: 85%)</a></li>
          <li><a href="/guru/siswa/2">Siswa 02 — Siti (Bali: 95%, Sunda: 90%)</a></li>
        </ul>
      </section>

      <nav>
        <a href="/profil">Profil Guru</a>
      </nav>
    </main>
  );
};

export default GuruDashboardPage;
