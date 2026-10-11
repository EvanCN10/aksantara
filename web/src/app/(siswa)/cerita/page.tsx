export const PilihCeritaPage = () => {
  return (
    <main>
      <h1>Pilih Kisah Cerita Rakyat Nusantara</h1>
      <p>Petualangan naratif interaktif dengan tantangan aksara daerah.</p>
      
      <section>
        <h2>Daftar Kisah</h2>
        <ul>
          <li>
            <a href="/cerita/sawerigading/bab/1">
              <h3>Kisah Sawerigading & I La Galigo (Lontara)</h3>
              <p>Mengarungi samudra luas dan mengungkap aksara warisan Bugis-Makassar.</p>
            </a>
          </li>
          <li>
            <a href="/cerita/lutung-kasarung/bab/1">
              <h3>Legenda Lutung Kasarung (Sunda)</h3>
              <p>Menyusuri hutan Pasundan dan merangkai aksara suci Kerajaan Pasundan.</p>
            </a>
          </li>
          <li>
            <a href="/cerita/calon-arang/bab/1">
              <h3>Misteri Mantra Calon Arang (Bali)</h3>
              <p>Membaca lontar kuno dan menghadapi tantangan mantra sakral Bali.</p>
            </a>
          </li>
        </ul>
      </section>

      <nav>
        <a href="/mulai">Kembali ke Beranda Belajar</a>
      </nav>
    </main>
  );
};

export default PilihCeritaPage;
