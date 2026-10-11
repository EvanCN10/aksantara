interface HardwareGamePageProps {
  params: Promise<{ jenis: string }>;
}

export const HardwareGamePage = async ({ params }: HardwareGamePageProps) => {
  const { jenis } = await params;

  return (
    <main>
      <h1>Mini-Game Tactile Pad: {jenis}</h1>
      <p>Gunakan kartu fisik RFID atau tombol simulasi untuk menyelesaikan tantangan.</p>
      
      <section>
        <h2>Status Slot Kartu Fisik</h2>
        <p>Slot Konsonan: [Kosong]</p>
        <p>Slot Diakritik / Vokal: [Kosong]</p>
        <p>Suku Kata Terbentuk: -</p>
      </section>

      <section>
        <h2>Tantangan Aktif</h2>
        <p>Susunlah suku kata: &quot;KI&quot; (Konsonan Ka + Diakritik i)</p>
      </section>

      <nav>
        <a href="/hardware/koneksi">Kembali ke Status Hardware</a>
        <a href="/mulai">Pilih Mode Lain</a>
      </nav>
    </main>
  );
};

export default HardwareGamePage;
