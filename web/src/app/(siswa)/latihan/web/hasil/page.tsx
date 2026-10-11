export const HasilLatihanPage = () => {
  return (
    <main>
      <h1>Ringkasan Sesi Latihan</h1>
      <p>Hasil evaluasi goresan dan akurasi bentuk Trinitas Aksara.</p>
      
      <section>
        <h2>Skor Akhir Sesi</h2>
        <p>Akurasi Rata-rata: 92%</p>
        <p>Karakter Terlatih: 5 Karakter</p>
      </section>

      <section>
        <h2>Catatan Koreksi AI</h2>
        <ul>
          <li>Karakter [Ka]: Proporsi sudut atas tepat, goresan stabil.</li>
          <li>Karakter [Ga]: Letak tanda vokalisasi sedikit bergeser ke kanan.</li>
        </ul>
      </section>

      <nav>
        <a href="/mulai">Latihan Karakter Lain</a>
        <a href="/profil">Lihat Profil & Riwayat Belajar</a>
      </nav>
    </main>
  );
};

export default HasilLatihanPage;
