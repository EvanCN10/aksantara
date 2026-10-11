export const MulaiPage = () => {
  return (
    <main>
      <h1>Pilih Mode & Aksara</h1>
      <p>Tentukan aksara yang ingin dipelajari dan jalur pembelajaran.</p>
      <section>
        <h2>1. Pilih Aksara Target</h2>
        <ul>
          <li><button type="button">Lontara (Bugis-Makassar)</button></li>
          <li><button type="button">Aksara Sunda</button></li>
          <li><button type="button">Aksara Bali</button></li>
        </ul>
      </section>
      <section>
        <h2>2. Pilih Jalur Pembelajaran</h2>
        <ul>
          <li>
            <a href="/latihan/web/lontara">
              <h3>Web Canvas Mode</h3>
              <p>Latihan mandiri digital di layar kanvas dengan evaluasi AI instan.</p>
            </a>
          </li>
          <li>
            <a href="/hardware/koneksi">
              <h3>Hardware Mode (Aksantara Tactile Pad)</h3>
              <p>Latihan kinestetik merangkai kartu fisik RFID via koneksi USB Serial.</p>
            </a>
          </li>
          <li>
            <a href="/cerita">
              <h3>Narrative Story Mode</h3>
              <p>Petualangan cerita rakyat Nusantara dengan tantangan interaktif.</p>
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
};

export default MulaiPage;
