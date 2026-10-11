interface StoryPlayerPageProps {
  params: Promise<{ judul: string; n: string }>;
}

export const StoryPlayerPage = async ({ params }: StoryPlayerPageProps) => {
  const { judul, n } = await params;

  return (
    <main>
      <h1>Kisah: {judul} — Bab {n}</h1>
      <p>Petualangan interaktif berbasis State Machine lokal.</p>
      
      <article>
        <h2>Adegan Narasi</h2>
        <p>[Teks narasi cerita rakyat lokal dan dialog tokoh]</p>
      </article>

      <section>
        <h2>Tantangan Sela (Story Beat Trigger)</h2>
        <p>Pilih metode untuk melewati rintangan gerbang kuno:</p>
        <div>
          <button type="button">Tantangan Tulis (Buka Canvas Evaluator)</button>
          <button type="button">Tantangan Susun Fisik (Gunakan Tactile Pad)</button>
        </div>
      </section>

      <nav>
        <a href="/cerita">Daftar Cerita</a>
        <a href={`/cerita/${judul}/bab/${Number(n) + 1}`}>Lanjut ke Bab Berikutnya</a>
      </nav>
    </main>
  );
};

export default StoryPlayerPage;
