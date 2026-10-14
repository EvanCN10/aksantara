import { NextResponse } from 'next/server';

interface TranscribeRequest {
  manuscriptId?: string;
  aksaraType?: 'lontara' | 'sunda' | 'bali';
  imageBase64?: string;
}

export async function POST(req: Request) {
  try {
    const body: TranscribeRequest = await req.json();
    const { aksaraType = 'sunda', manuscriptId = 'kropak-406' } = body;

    // ------------------------------------------------------------------------
    // TODO: AI ENGINEER OCR / TRANSLITERATION INTEGRATION
    // Endpoint ini disiapkan bagi AI Engineer untuk menempatkan model
    // TrOCR / Vision-Language Model (VLM) fine-tuned manuskrip kuno.
    // ------------------------------------------------------------------------

    // Data transkripsi rujukan paleografi autentik
    const sampleTranscriptions: Record<
      string,
      {
        originalAksara: string;
        latinTransliteration: string;
        indonesianTranslation: string;
        confidence: number;
        regions: { x: number; y: number; w: number; h: number; label: string }[];
      }
    > = {
      sunda: {
        originalAksara: 'ᮃᮄᮀ ᮓᮦᮊ᮪ ᮜᮨᮙ᮪ᮘᮎ᮪ ᮎᮛᮤᮒ ᮕᮥᮁᮔ ᮕᮒᮤ',
        latinTransliteration: 'Aing dek leumbac carita purna pati',
        indonesianTranslation: 'Hamba hendak menuturkan kisah paripurna para leluhur utama.',
        confidence: 0.94,
        regions: [
          { x: 45, y: 30, w: 120, h: 50, label: 'ᮃᮄᮀ (Aing)' },
          { x: 175, y: 30, w: 110, h: 50, label: 'ᮓᮦᮊ᮪ (dek)' },
          { x: 295, y: 30, w: 180, h: 50, label: 'ᮜᮨᮙ᮪ᮘᮎ᮪ (leumbac)' },
        ],
      },
      lontara: {
        originalAksara: 'ᨕᨗᨐᨊ ᨔᨘᨑᨛ ᨁᨒᨗᨁᨚ ᨄᨚᨒᨙ ᨑᨗ ᨈᨊ ᨒᨘᨓᨘ',
        latinTransliteration: 'Iyana sureq Galigo pole ri tana Luwu',
        indonesianTranslation: 'Inilah lembaran naskah I La Galigo yang berasal dari tanah Luwu mulia.',
        confidence: 0.96,
        regions: [
          { x: 40, y: 35, w: 110, h: 45, label: 'ᨕᨗᨐᨊ (Iyana)' },
          { x: 160, y: 35, w: 130, h: 45, label: 'ᨔᨘᨑᨛ (sureq)' },
          { x: 300, y: 35, w: 140, h: 45, label: 'ᨁᨒᨗᨁᨚ (Galigo)' },
        ],
      },
      bali: {
        originalAksara: 'ᬑᬁ ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ ᬦᬫᭀ ᬲᬶᬤ᭄ᬥᬫ᭄',
        latinTransliteration: 'Om Awighnamastu Namo Siddham',
        indonesianTranslation: 'Semoga tiada rintangan dan keberhasilan senantiasa terwujud sempurna.',
        confidence: 0.98,
        regions: [
          { x: 50, y: 40, w: 130, h: 55, label: 'ᬑᬁ (Om)' },
          { x: 190, y: 40, w: 220, h: 55, label: 'ᬅᬯᬶᬖ᭄ᬦᬫᬲ᭄ᬢᬸ (Awighnamastu)' },
        ],
      },
    };

    const result = sampleTranscriptions[aksaraType] || sampleTranscriptions['sunda'];

    return NextResponse.json({
      success: true,
      manuscriptId,
      aksaraType,
      ...result,
      source: 'nusaaksara_paleography_pipeline',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Gagal memproses transliterasi manuskrip: ${errorMsg}` },
      { status: 500 }
    );
  }
}
