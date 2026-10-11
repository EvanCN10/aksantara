export const HardwareKoneksiPage = () => {
  return (
    <main>
      <h1>Koneksi Aksantara Tactile Pad</h1>
      <p>Hubungkan konsol kinestetik fisik via kabel USB ke peramban (Web Serial API).</p>
      
      <section>
        <h2>Status Perangkat</h2>
        <p>Status: Belum Terhubung</p>
        <button type="button">Hubungkan Perangkat (Pilih Port USB)</button>
        <button type="button">Aktifkan Mode Simulasi (Tanpa Hardware Fisik)</button>
      </section>

      <section>
        <h2>Panduan Penggunaan</h2>
        <ol>
          <li>Pastikan mikrokontroler ESP32 tercolok ke port USB laptop/PC.</li>
          <li>Gunakan peramban berbasis Chromium (Google Chrome / Microsoft Edge).</li>
          <li>Klik tombol &quot;Hubungkan Perangkat&quot; di atas lalu pilih port serial ESP32.</li>
          <li>Tempelkan kartu RFID aksara pada permukaan pad untuk mulai bermain.</li>
        </ol>
      </section>

      <nav>
        <a href="/hardware/game/ramu-mantra">Mulai Mini-Game: Ramu Mantra</a>
        <a href="/hardware/game/speed-match">Mulai Mini-Game: Aksara Cepat Tanggap</a>
      </nav>
    </main>
  );
};

export default HardwareKoneksiPage;
