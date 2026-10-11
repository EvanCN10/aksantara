interface KatalogAksaraPageProps {
  params: Promise<{ aksara: string }>;
}

export const KatalogAksaraPage = async ({ params }: KatalogAksaraPageProps) => {
  const { aksara } = await params;

  return (
    <main>
      <h1>Katalog Aksara: {aksara}</h1>
      <p>Pilih karakter dasar konsonan atau pasangan tanda vokalisasi untuk dilatih.</p>
      <section>
        <h2>Daftar Karakter</h2>
        <ul>
          <li><a href={`/latihan/web/${aksara}/ka`}>Karakter Ka</a></li>
          <li><a href={`/latihan/web/${aksara}/ga`}>Karakter Ga</a></li>
          <li><a href={`/latihan/web/${aksara}/nga`}>Karakter Nga</a></li>
          <li><a href={`/latihan/web/${aksara}/pa`}>Karakter Pa</a></li>
        </ul>
      </section>
      <nav>
        <a href="/mulai">Kembali ke Pilihan Aksara</a>
      </nav>
    </main>
  );
};

export default KatalogAksaraPage;
