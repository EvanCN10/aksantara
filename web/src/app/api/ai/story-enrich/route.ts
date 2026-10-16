import { NextResponse } from 'next/server';

interface StoryEnrichRequest {
  karakterId: string;
  pembicaraNama: string;
  konteksCerita: string;
  aksaraId: 'lontara' | 'sunda' | 'bali';
  glifTarget?: string;
}

function isNonEmptyString(val: unknown, maxLen: number): val is string {
  return typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen;
}

function isStoryEnrichRequest(val: unknown): val is StoryEnrichRequest {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return false;
  const obj = val as Record<string, unknown>;
  const aksaraValid = obj.aksaraId === 'lontara' || obj.aksaraId === 'sunda' || obj.aksaraId === 'bali';
  if (!aksaraValid) return false;
  if (!isNonEmptyString(obj.karakterId, 128)) return false;
  if (!isNonEmptyString(obj.pembicaraNama, 128)) return false;
  if (!isNonEmptyString(obj.konteksCerita, 4000)) return false;
  if (obj.glifTarget !== undefined && !isNonEmptyString(obj.glifTarget, 128)) return false;
  return true;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Payload harus berupa JSON yang valid.' }, { status: 400 });
  }

  if (!isStoryEnrichRequest(body)) {
    return NextResponse.json({ error: 'Payload permintaan pengayaan cerita tidak valid.' }, { status: 400 });
  }

  const { karakterId, pembicaraNama, konteksCerita, aksaraId, glifTarget } = body;
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (apiKey && apiKey !== 'your-google-gemini-api-key-here') {
    try {
      const systemPrompt = `Kamu adalah pendamping belajar bernama ${pembicaraNama} untuk aksara daerah ${aksaraId}.
Berikan petunjuk belajar sederhana dan ramah sebanyak 2-3 kalimat untuk membantu siswa memahami karakter '${glifTarget || 'aksara'}' atau menjawab pertanyaan dalam situasi: "${konteksCerita}".
Fokus pada ciri visual, bentuk garis, atau petunjuk praktis cara membedakannya. Jangan gunakan nasihat filosofis generik.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
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
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          return NextResponse.json({
            success: true,
            dialog: candidate.trim(),
            source: 'gemini_ai',
          });
        }
      }
    } catch {
      // Fallback deterministik jika Gemini API gagal, timeout, atau model tidak tersedia
    }
  }

  // Fallback deterministik berbasis lore lokal terkurasi
  const personaQuotes: Record<string, string> = {
    sawerigading:
      'Perhatikan bentuk sudut belah ketupat Sulapa Eppa Lontara. Garis-garisnya tegas dan mencerminkan unsur alam laut Luwu.',
    purbasari:
      'Aksara Sunda memiliki struktur ngalagena yang modular dan teratur. Amati lekukan cabang dan garis penopang di sekelilingnya.',
    'lutung-kasarung':
      'Perhatikan lekukan simetris pada aksara Sunda. Budi yang luhur tampak dari ketelitian setiap goresan.',
    'mpu-bharadah':
      'Aksara Bali dialirkan dengan kurvalinier yang luwes. Ikuti gelombang garis wianjana dengan tenang.',
    'calon-arang-arya':
      'Keseimbangan adalah kunci menulis aksara Bali. Cermati busur lengkung dan titik temu garisnya.',
    'guru-pamomong':
      "Dalam aksara Lontara, bedakan induk huruf Ina' Sureq dan tanda vokalisasi Ana' Sureq dengan teliti.",
  };

  const dialog =
    personaQuotes[karakterId] ||
    `Perhatikan bentuk dasar dan ciri khas aksara ${aksaraId}. Setiap tarikan garis memiliki ciri yang membedakannya.`;

  return NextResponse.json({
    success: true,
    dialog,
    source: 'deterministic_lore',
  });
}
