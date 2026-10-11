export const ProfilPage = () => {
  return (
    <main>
      <h1>Profil Pengguna</h1>
      <p>Informasi akun dan riwayat aktivitas pembelajaran Aksantara.</p>
      
      <section>
        <h2>Informasi Akun</h2>
        <p>Nama Pengguna: Peserta Aksantara</p>
        <p>Peran: Siswa / Guru</p>
        <p>Email: user@aksantara.id</p>
      </section>

      <section>
        <h2>Statistik Pembelajaran</h2>
        <ul>
          <li>Aksara Dipelajari: Lontara, Sunda, Bali</li>
          <li>Total Waktu Latihan: 4 Jam 20 Menit</li>
          <li>Kisah Cerita Diselesaikan: 2 Cerita</li>
        </ul>
      </section>

      <nav>
        <a href="/mulai">Mulai Belajar</a>
        <a href="/auth">Keluar (Logout)</a>
      </nav>
    </main>
  );
};

export default ProfilPage;
