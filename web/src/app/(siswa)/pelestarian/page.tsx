export const PelestarianPage = () => {
  return (
    <main>
      <h1>Pilar 4: Preservasi Manuskrip Kuno</h1>
      <p>Modul transliterasi digital naskah kuno nusantara (Human-in-the-Loop).</p>
      
      <section>
        <h2>Citra Manuskrip Kuno</h2>
        <p>[Penampil Citra Naskah Lontar / Dluwang Kuno Bersejarah]</p>
      </section>

      <section>
        <h2>Prediksi OCR &amp; Model AI</h2>
        <p>Prediksi Awal AI: &quot;...&quot;</p>
      </section>

      <section>
        <h2>Formulir Koreksi Siswa Mahir</h2>
        <form>
          <label htmlFor="koreksi">Usulan Transliterasi Latin yang Benar:</label>
          <textarea id="koreksi" name="koreksi" rows={4} cols={50} />
          <button type="submit">Kirim Usulan Transkripsi</button>
        </form>
      </section>

      <nav>
        <a href="/pelestarian/status">Lihat Status Validasi Komunitas</a>
        <a href="/mulai">Kembali ke Beranda</a>
      </nav>
    </main>
  );
};

export default PelestarianPage;
