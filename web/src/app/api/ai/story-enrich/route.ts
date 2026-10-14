import { NextResponse } from 'next/server';

interface StoryEnrichRequest {
  karakterId: string;
  pembicaraNama: string;
  konteksCerita: string;
  aksaraId: 'lontara' | 'sunda' | 'bali';
  glifTarget?: string;
}

export async function POST(req: Request) {
  try {
    const body: StoryEnrichRequest = await req.json();
    const { karakterId, pembicaraNama, konteksCerita, aksaraId, glifTarget } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Jika GEMINI_API_KEY tersedia, panggil Gemini API untuk respon dinamis
    if (apiKey && apiKey !== 'your-google-gemini-api-key-here') {
      try {
        const systemPrompt = `Kamu adalah karakter cerita rakyat Nusantara bernama ${pembicaraNama} dari tradisi aksara ${aksaraId}.
Bicaralah dengan nada agung, bijaksana, dan mendalam layaknya sastra luhur Nusantara.
Berikan satu nasihat filosofis singkat (maksimal 2-3 kalimat) mengenai makna pelestarian aksara atau glif '${glifTarget || 'pusaka'}' terkait situasi: "${konteksCerita}".`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: systemPrompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 150,
              temperature: 0.7,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({
              success: true,
              dialog: generatedText.trim(),
              source: 'gemini_ai',
            });
          }
        }
      } catch {
        // Fallback jika API request gagal
      }
    }

    // Fallback Deterministik Cerdas (Bebas Crash Saat Panggung Offline Tanpa Internet)
    const personaQuotes: Record<string, string> = {
      sawerigading:
        'Samudra boleh bergelora kencang, namun batin yang berpegang pada empat sudut Sulapa Eppa takkan pernah karam ditelan ombak Luwu.',
      purbasari:
        'Rimba Cupu ini mengajarkan bahwa kebenaran sejati seperti aksara Ngalagena; ia tetap kokoh berdiri meski diselimuti kabut fitnah kedengkian.',
      'mpu-bharadah':
        'Kidung aksara suci di atas daun lontar adalah penyeimbang Rwa Bhineda; memadamkan amarah duniawi dan menghadirkan kedamaian jagat Hyang Widhi.',
    };

    const dialog =
      personaQuotes[karakterId] ||
      `Pegang teguh pesan leluhur kita, wahai pelindung aksara ${aksaraId}. Tiap tarikan garis adalah doa yang mengalir ke masa depan.`;

    return NextResponse.json({
      success: true,
      dialog,
      source: 'deterministic_lore',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Gagal memperkaya dialog cerita: ${errorMsg}` },
      { status: 500 }
    );
  }
}
