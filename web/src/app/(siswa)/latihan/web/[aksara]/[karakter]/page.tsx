interface LatihanCanvasPageProps {
  params: Promise<{ aksara: string; karakter: string }>;
}

export const LatihanCanvasPage = async ({ params }: LatihanCanvasPageProps) => {
  const { aksara, karakter } = await params;

  return (
    <main>
      <h1>Latihan Menulis Aksara</h1>
      <p>Aksara: {aksara} | Karakter Target: {karakter}</p>
      
      <section>
        <h2>Universal Web Canvas (Area Goresan)</h2>
        <p>[Area Canvas Interaktif: Stylus / Touchscreen / Mouse]</p>
        <div>
          <button type="button">Hapus Goresan</button>
          <button type="button">Periksa AI (Evaluasi)</button>
        </div>
      </section>

      <section>
        <h2>Panel Evaluasi AI (Real-time)</h2>
        <p>Status: Menunggu goresan pengguna</p>
        <p>Tingkat Akurasi Bentuk: 0%</p>
        <p>Verifikasi Diakritik / Vokalisasi: -</p>
      </section>

      <nav>
        <a href={`/latihan/web/${aksara}`}>Kembali ke Katalog</a>
        <a href="/latihan/web/hasil">Selesaikan Sesi Latihan</a>
      </nav>
    </main>
  );
};

export default LatihanCanvasPage;
