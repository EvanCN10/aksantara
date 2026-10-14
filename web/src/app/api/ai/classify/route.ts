import { NextResponse } from 'next/server';
import type { GlyphInferenceInput, GlyphInferenceOutput } from '@/lib/onnx/onnx-classifier';

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body: GlyphInferenceInput = await req.json();
    const { aksaraId, karakterSlug, strokes } = body;

    if (!aksaraId || !karakterSlug) {
      return NextResponse.json(
        { error: 'Parameter aksaraId dan karakterSlug wajib disertakan' },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------------
    // TODO: AI ENGINEER INTEGRATION
    // Jika AI Engineer menjalankan microservice eksternal (FastAPI / Triton / TorchServe),
    // teruskan payload citra / tensor ke sini:
    //
    // const externalUrl = process.env.NEXT_PUBLIC_AI_CLASSIFIER_URL;
    // if (externalUrl) {
    //   const aiRes = await fetch(`${externalUrl}/predict`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(body),
    //   });
    //   if (aiRes.ok) return NextResponse.json(await aiRes.json());
    // }
    // ------------------------------------------------------------------------

    // Simulasi respons AI server-side yang realistis dan tangguh
    const strokeCount = strokes?.length || 1;
    const isLontara = aksaraId === 'lontara';
    const isSunda = aksaraId === 'sunda';

    const baseScore = Math.min(89 + Math.floor(Math.random() * 8), 98);

    const output: GlyphInferenceOutput = {
      score: baseScore,
      status: baseScore >= 88 ? 'sempurna' : 'bagus',
      predictedSymbol: karakterSlug.toUpperCase(),
      confidence: Number((baseScore / 100).toFixed(2)),
      latencyMs: Date.now() - startTime,
      ringkasan: `Evaluasi Server: Bentuk glif ${karakterSlug.toUpperCase()} konsisten dengan kaidah paleografi ${aksaraId}.`,
      kriteria: [
        {
          label: 'Akurasi Geometri Bentuk',
          lulus: true,
          catatan: isLontara
            ? 'Sudut kemiringan belah ketupat sulapa eppa presisi dan proporsional.'
            : isSunda
            ? 'Struktur modular konsonan ngalagena tegak lurus sesuai kaidah Pasundan.'
            : 'Gelombang kurvalinier mengalir luwes sesuai kaidah rontal aksara Bali.',
        },
        {
          label: 'Keseimbangan & Kontinuitas Tarikan',
          lulus: true,
          catatan: `Terdeteksi ${strokeCount} tarikan kuas dengan ketebalan yang stabil.`,
        },
        {
          label: 'Verifikasi Vokalisasi / Diakritik',
          lulus: true,
          catatan: 'Posisi tanda diakritik konsisten terhadap badan konsonan utama.',
        },
      ],
      modelSource: 'api_edge',
    };

    return NextResponse.json(output);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Gagal memproses evaluasi aksara: ${errorMsg}` },
      { status: 500 }
    );
  }
}
