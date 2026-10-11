export const PelestarianStatusPage = () => {
  return (
    <main>
      <h1>Status Validasi Transkripsi Manuskrip</h1>
      <p>Daftar usulan pembacaan naskah oleh komunitas dan kurator ahli.</p>
      
      <section>
        <h2>Daftar Naskah &amp; Status Transkripsi</h2>
        <table>
          <thead>
            <tr>
              <th>ID Naskah</th>
              <th>Judul Koleksi</th>
              <th>Pengusul</th>
              <th>Status Kurasi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EAP-001</td>
              <td>Lontar Calon Arang Lbr 1</td>
              <td>Siswa Mahir 01</td>
              <td>Terverifikasi Kurator</td>
            </tr>
            <tr>
              <td>EAP-002</td>
              <td>Naskah Sunda Kuno Sewaka Darma</td>
              <td>Siswa Mahir 02</td>
              <td>Menunggu Validasi</td>
            </tr>
          </tbody>
        </table>
      </section>

      <nav>
        <a href="/pelestarian">Kembali ke Modul Transliterasi</a>
      </nav>
    </main>
  );
};

export default PelestarianStatusPage;
