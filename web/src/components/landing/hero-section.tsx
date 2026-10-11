import Image from 'next/image';

const DESIGN_W = 1440;
const DESIGN_H = 1857;

interface LayerItem {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  priority?: boolean;
  inner?: {
    w: number;
    h: number;
    transform: string;
  };
  animateEnter?: string;
  animateLoop?: string;
}

// 1. Layer di bawah judul AKSANTARA (urutan DOM Figma)
const LAYERS_BELOW_TITLE: LayerItem[] = [
  {
    id: '1:16',
    name: 'bg-main',
    x: 0,
    y: 0,
    w: 1440,
    h: 1857,
    src: '/images/ui/landing-page/bg-main.png',
    priority: true,
    animateEnter: 'heroBgZoom 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  {
    id: '1:18',
    name: 'Parallax-Castle',
    x: 0,
    y: 634,
    w: 1440,
    h: 805,
    src: '/images/ui/landing-page/section-landing/Parallax-Castle.png',
    priority: true,
  },
  // flower 2 (Figma node 3:4) - statis sesuai arahan
  {
    id: '3:4',
    name: 'flower 2',
    x: 85,
    y: 1263,
    w: 590.2,
    h: 579.164,
    src: '/images/ui/landing-page/section-landing/flower.png',
    inner: {
      w: 427.553,
      h: 450.705,
      transform: 'scaleY(-1) rotate(-115.3deg)',
    },
  },
  // 12x Kelopak (posisi sesuai Figma node 1:20 s.d 1:42)
  // Masuk: scale(0) -> scale(1) (bukan fade), fase & ritme floating dibedakan secara organik
  {
    id: '1:20',
    name: 'Kelopak 1',
    x: 1284,
    y: 227,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.72s both',
    animateLoop: 'floatPetalSlow 3.8s ease-in-out 0.2s infinite alternate',
  },
  {
    id: '1:28',
    name: 'Kelopak 2',
    x: 1222,
    y: 379,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.85s both',
    animateLoop: 'floatPetalMedium 4.6s ease-in-out 0.6s infinite alternate',
  },
  {
    id: '1:30',
    name: 'Kelopak 4',
    x: 1348,
    y: 532,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.10s both',
    animateLoop: 'floatPetalSlow 5.2s ease-in-out 1.1s infinite alternate',
  },
  {
    id: '1:31',
    name: 'Kelopak 5',
    x: 1307,
    y: 796,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.95s both',
    animateLoop: 'floatPetalMedium 4.1s ease-in-out 0.4s infinite alternate',
  },
  {
    id: '1:32',
    name: 'Kelopak 6',
    x: 89,
    y: 395,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.78s both',
    animateLoop: 'floatPetalSlow 4.4s ease-in-out 0.8s infinite alternate',
  },
  {
    id: '1:49',
    name: 'Kelopak 23',
    x: 1243,
    y: 1571,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.30s both',
    animateLoop: 'floatPetalMedium 4.9s ease-in-out 0.1s infinite alternate',
  },
  {
    id: '1:46',
    name: 'Kelopak 20',
    x: 180,
    y: 634,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.05s both',
    animateLoop: 'floatPetalSlow 3.6s ease-in-out 0.5s infinite alternate',
  },
  {
    id: '1:37',
    name: 'Kelopak 11',
    x: 431,
    y: 1304,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.22s both',
    animateLoop: 'floatPetalMedium 5.4s ease-in-out 1.3s infinite alternate',
  },
  {
    id: '1:39',
    name: 'Kelopak 13',
    x: 415,
    y: 1070,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.15s both',
    animateLoop: 'floatPetalSlow 4.0s ease-in-out 0.7s infinite alternate',
  },
  {
    id: '1:40',
    name: 'Kelopak 14',
    x: 180,
    y: 928,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.90s both',
    animateLoop: 'floatPetalMedium 4.3s ease-in-out 0.3s infinite alternate',
  },
  {
    id: '1:41',
    name: 'Kelopak 15',
    x: 447,
    y: 438,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.82s both',
    animateLoop: 'floatPetalSlow 4.7s ease-in-out 0.9s infinite alternate',
  },
  {
    id: '1:42',
    name: 'Kelopak 16',
    x: 349,
    y: 180,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    animateEnter: 'popPetal 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.00s both',
    animateLoop: 'floatPetalMedium 3.9s ease-in-out 1.2s infinite alternate',
  },
  // Mahkota 1: Masuk dari kanan atas (ease-in), on loop floating
  {
    id: '1:21',
    name: 'Mahkota 1',
    x: 982,
    y: 101,
    w: 205,
    h: 179,
    src: '/images/ui/landing-page/section-landing/Mahkota.png',
    animateEnter: 'enterMahkota 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.35s both',
    animateLoop: 'floatMahkota 4.6s ease-in-out infinite alternate',
  },
  // Keris 1: Masuk dari kiri bawah (ease-in), on loop floating
  {
    id: '1:22',
    name: 'Keris 1',
    x: 230,
    y: 284,
    w: 185,
    h: 164,
    src: '/images/ui/landing-page/section-landing/Keris.png',
    animateEnter: 'enterKeris 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.30s both',
    animateLoop: 'floatKeris 4.2s ease-in-out infinite alternate',
  },
  // Cloud-3(2): Masuk kiri ke kanan, ritme loop kiri-kanan A (7.4s)
  {
    id: '1:23',
    name: 'Cloud-3(2) 1',
    x: -8,
    y: 75,
    w: 335,
    h: 167,
    src: '/images/ui/landing-page/section-landing/Cloud-3(2).png',
    animateEnter: 'enterCloudLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both',
    animateLoop: 'floatCloudLeftA 7.4s ease-in-out infinite alternate',
  },
  // Cloud-2: Masuk kanan ke kiri, ritme loop kiri-kanan (8.2s)
  {
    id: '1:25',
    name: 'Cloud-2 1',
    x: 1186,
    y: 97,
    w: 242,
    h: 115,
    src: '/images/ui/landing-page/section-landing/Cloud-2.png',
    animateEnter: 'enterCloudRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both',
    animateLoop: 'floatCloudRight 8.2s ease-in-out infinite alternate',
  },
];

// 2. Layer di atas judul AKSANTARA (urutan DOM Figma)
const LAYERS_ABOVE_TITLE: LayerItem[] = [
  // Cloud-1: Masuk kanan bawah, loop kanan atas lalu kembali (6.8s)
  {
    id: '1:26',
    name: 'Cloud-1 1',
    x: 802,
    y: 266,
    w: 428,
    h: 152,
    src: '/images/ui/landing-page/section-landing/Cloud-1.png',
    animateEnter: 'enterCloud1 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both',
    animateLoop: 'floatCloud1Diagonal 6.8s ease-in-out infinite alternate',
  },
  // Cloud-3(1): Masuk kiri ke kanan, ritme loop kiri-kanan B (9.6s - berbeda dengan Cloud-3(2))
  {
    id: '1:24',
    name: 'Cloud-3(1) 1',
    x: 142,
    y: 158,
    w: 243,
    h: 135,
    src: '/images/ui/landing-page/section-landing/Cloud-3(1).png',
    animateEnter: 'enterCloudLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
    animateLoop: 'floatCloudLeftB 9.6s ease-in-out infinite alternate',
  },
  // left-flower 1 (Figma node 3:2) - statis sesuai arahan
  {
    id: '3:2',
    name: 'left-flower 1',
    x: 0,
    y: 1101,
    w: 537,
    h: 756,
    src: '/images/ui/landing-page/section-landing/left-flower.png',
  },
  // flower 1 (Figma node 3:3) - statis sesuai arahan
  {
    id: '3:3',
    name: 'flower 1',
    x: 1142.11,
    y: 1315,
    w: 423.997,
    h: 416.068,
    src: '/images/ui/landing-page/section-landing/flower.png',
    inner: {
      w: 307.152,
      h: 323.785,
      transform: 'rotate(-64.7deg)',
    },
  },
];

const TITLE_LETTERS = 'AKSANTARA'.split('');
const TITLE_BASE_DELAY = 1.7; // Detik mulai setelah pusaka mendarat
const TITLE_STAGGER = 0.06;   // 60ms selisih antar huruf

function RenderLayer({
  item,
  isStarted = true,
}: {
  item: LayerItem;
  isStarted?: boolean;
}) {
  const left = `${(item.x / DESIGN_W) * 100}%`;
  const top = `${(item.y / DESIGN_H) * 100}%`;
  const width = `${(item.w / DESIGN_W) * 100}%`;
  const height = `${(item.h / DESIGN_H) * 100}%`;
  const sizes = `${Math.round((item.w / DESIGN_W) * 100)}vw`;

  // Item dengan inner bounding & rotasi khusus (seperti flower 2 & flower 1)
  if (item.inner) {
    const innerW = `${(item.inner.w / item.w) * 100}%`;
    const innerH = `${(item.inner.h / item.h) * 100}%`;

    return (
      <div
        key={item.id}
        data-node-id={item.id}
        data-name={item.name}
        className="absolute pointer-events-none select-none flex items-center justify-center will-change-transform"
        style={{
          left,
          top,
          width,
          height,
          animation: isStarted ? item.animateEnter : 'none',
          opacity: !isStarted && item.animateEnter ? 0 : undefined,
        }}
      >
        <div
          className="relative will-change-transform"
          style={{
            width: innerW,
            height: innerH,
            transform: item.inner.transform,
            animation: isStarted ? item.animateLoop : 'none',
          }}
        >
          <Image
            src={item.src}
            alt=""
            fill
            sizes={sizes}
            priority={item.priority}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // Lapisan normal (bg, castle, awan, pusaka, kelopak, semak)
  return (
    <div
      key={item.id}
      data-node-id={item.id}
      data-name={item.name}
      className="absolute pointer-events-none select-none will-change-transform"
      style={{
        left,
        top,
        width,
        height,
        animation: isStarted ? item.animateEnter : 'none',
        opacity: !isStarted && item.animateEnter && item.name !== 'bg-main' ? 0 : undefined,
      }}
    >
      <div
        className="relative size-full will-change-transform"
        style={{
          animation: isStarted ? item.animateLoop : 'none',
        }}
      >
        <Image
          src={item.src}
          alt=""
          fill
          sizes={sizes}
          priority={item.priority}
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function HeroSection({ isStarted = true }: { isStarted?: boolean }) {
  return (
    <section
      data-node-id="1:54"
      aria-label="Hero Aksantara"
      className="@container relative w-full overflow-hidden bg-[#0c1a2c]"
      style={{
        aspectRatio: `${DESIGN_W} / ${DESIGN_H}`,
        containerType: 'inline-size',
      }}
    >
      {/* 0. White Overlay Fade Out (Cinematic entrance dari putih) */}
      <div
        className="absolute inset-0 z-30 pointer-events-none bg-white will-change-opacity"
        style={{
          animation: isStarted
            ? 'heroWhiteFade 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : 'none',
          opacity: isStarted ? undefined : 1,
        }}
      />

      {/* 1. Layers di bawah judul */}
      {LAYERS_BELOW_TITLE.map((layer) => (
        <RenderLayer key={layer.id} item={layer} isStarted={isStarted} />
      ))}

      {/* 2. Judul AKSANTARA (Figma node 1:52) - Staggered huruf masuk dari bawah */}
      <h1
        data-node-id="1:52"
        data-name="AKSANTARA"
        className="absolute select-none whitespace-nowrap font-bold tracking-normal leading-none"
        style={{
          left: `${(358 / DESIGN_W) * 100}%`,
          top: `${(212 / DESIGN_H) * 100}%`,
          fontSize: 'calc(128 / 1440 * 100cqw)',
          fontFamily: 'var(--font-philosopher), serif',
          filter:
            'drop-shadow(0 calc(6 / 1440 * 100cqw) calc(11.4 / 1440 * 100cqw) rgba(0, 0, 0, 0.75))',
        }}
      >
        {TITLE_LETTERS.map((char, index) => {
          const delay = TITLE_BASE_DELAY + index * TITLE_STAGGER;
          return (
            <span
              key={index}
              className="inline-block will-change-transform bg-gradient-to-t from-[#ffd261] to-[#cf5600] bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(to top, #ffd261, #cf5600)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: isStarted
                  ? `enterLetter 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`
                  : 'none',
                opacity: isStarted ? undefined : 0,
              }}
            >
              {char}
            </span>
          );
        })}
      </h1>

      {/* 3. Layers di atas judul (awan depan teks & latar depan) */}
      {LAYERS_ABOVE_TITLE.map((layer) => (
        <RenderLayer key={layer.id} item={layer} isStarted={isStarted} />
      ))}

      {/* 4. Navigasi sementara agar akses halaman tetap terjaga */}
      <nav
        aria-label="Navigasi Utama"
        className="absolute z-20 flex items-center justify-center gap-[2cqw] text-white/90 font-medium tracking-wide"
        style={{
          top: `${(24 / DESIGN_H) * 100}%`,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(12px, 1.2cqw, 18px)',
        }}
      >
        <a
          href="/mulai"
          className="px-[1.2cqw] py-[0.5cqw] rounded-full backdrop-blur-md bg-black/25 hover:bg-black/40 transition-colors border border-white/15 shadow-sm"
        >
          Mulai Belajar
        </a>
        <a
          href="/trinitas"
          className="px-[1.2cqw] py-[0.5cqw] rounded-full backdrop-blur-md bg-black/25 hover:bg-black/40 transition-colors border border-white/15 shadow-sm"
        >
          Tentang Trinitas Aksara
        </a>
        <a
          href="/auth"
          className="px-[1.2cqw] py-[0.5cqw] rounded-full backdrop-blur-md bg-black/25 hover:bg-black/40 transition-colors border border-white/15 shadow-sm"
        >
          Masuk
        </a>
      </nav>
    </section>
  );
}

export default HeroSection;
