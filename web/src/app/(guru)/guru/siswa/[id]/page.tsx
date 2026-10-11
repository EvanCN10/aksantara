interface DetailSiswaPageProps {
  params: Promise<{ id: string }>;
}

export const DetailSiswaPage = async ({ params }: DetailSiswaPageProps) => {
  const { id } = await params;

  return (
    <main>
      <h1>Detail Progres Siswa: ID {id}</h1>
      <p>Laporan individual riwayat latihan web, hardware tactile pad, dan cerita rakyat.</p>
      
      <section>
        <h2>Histori Latihan Web Canvas</h2>
        <ul>
          <li>Lontara: Karakter [Ka] (Akurasi: 92%)</li>
          <li>Sunda: Karakter [Ga] (Akurasi: 88%)</li>
        </ul>
      </section>

      <section>
        <h2>Histori Hardware Tactile Pad</h2>
        <p>Mini-Game Ramu Mantra: Selesai 3 kombinasi</p>
      </section>

      <nav>
        <a href="/guru/dashboard">Kembali ke Dashboard Guru</a>
      </nav>
    </main>
  );
};

export default DetailSiswaPage;
