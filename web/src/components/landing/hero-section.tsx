'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ShinyButton from '@/components/ui/shiny-button';
import OrnateFrame from '@/components/ui/ornate-frame';

interface Pillar {
  id: string;
  pilar: string;
  nama: string;
  desc: string;
  img: string;
  accent: string;
  tag: string;
  href: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'pilar-1',
    pilar: 'Pilar I',
    nama: 'Precision AI Writing Coach',
    desc: 'Latih tulisan aksara di kanvas dan lihat prediksi AI untuk karakter yang didukung.',
    img: '/images/ui/landing-page/card/black-bg-card.png',
    accent: '#D4A373',
    tag: 'Latihan kanvas · AI eksperimen',
    href: '/mulai',
  },
  {
    id: 'pilar-2',
    pilar: 'Pilar II',
    nama: 'Trinitas Aksara Nusantara',
    desc: 'Kurikulum terstruktur tiga aksara dengan kontras visual tinggi: Lontara (sudut), Sunda (modular), dan Bali (kurvalinier).',
    img: '/images/ui/landing-page/card/green-bg-card.png',
    accent: '#2A9D8F',
    tag: 'Lontara · Sunda · Bali',
    href: '/trinitas',
  },
  {
    id: 'pilar-3',
    pilar: 'Pilar III',
    nama: 'Gamified Engagement Layer',
    desc: 'Petualangan naratif Story Mode dan tantangan fisik Tactile Phygital Arena berbasis sensor IoT.',
    img: '/images/ui/landing-page/card/purple-bg-card.png',
    accent: '#A78BFA',
    tag: 'Story Mode · IoT Phygital',
    href: '/cerita',
  },
  {
    id: 'pilar-4',
    pilar: 'Pilar IV',
    nama: 'Human-in-the-Loop Preservasi',
    desc: 'Tulis transliterasi dari foto naskah, lalu kirim untuk ditinjau guru atau ahli aksara.',
    img: '/images/ui/landing-page/card/yelllow-bg-card.png',
    accent: '#ffd261',
    tag: 'Transliterasi manual · Review manusia',
    href: '/pelestarian',
  },
];

const DESIGN_W = 1440;
const DESIGN_H = 1853;

export const SECTION_2_TOP_PX = 1000;

interface LayerItem {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  priority?: boolean;
  transformOrigin?: string;
  rotation?: number;
  inner?: {
    w: number;
    h: number;
    transform?: string;
    className?: string;
    transformOrigin?: string;
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
    h: 1855,
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
    src: '/images/ui/landing-page/section-landing/Parallax-Castle.svg',
    priority: true,
  },
  // flower 2 (Figma node 3:4) - Sesuai Dev Mode Figma: -scale-y-100 rotate-[-115.3deg]
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
      className: 'flex-none -scale-y-100 rotate-[-115.3deg]',
      transformOrigin: '15% 82%',
    },
    animateLoop: 'swayFlower2 4.6s ease-in-out infinite alternate',
  },
  // 12x Kelopak (posisi sesuai Figma node 1:20 s.d 1:42)
  // Masuk: scale(0) -> scale(1) (bukan fade), fase & ritme floating dibedakan secara organik
  // Setiap kelopak memiliki rotasi awal unik agar terlihat natural seperti gugur ditiup angin
  {
    id: '1:20',
    name: 'Kelopak 1',
    x: 1284,
    y: 227,
    w: 33,
    h: 31,
    src: '/images/ui/landing-page/section-landing/Kelopak.png',
    rotation: 28,
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
    rotation: -42,
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
    rotation: 75,
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
    rotation: -115,
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
    rotation: 45,
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
    rotation: -68,
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
    rotation: 130,
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
    rotation: -25,
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
    rotation: 62,
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
    rotation: -145,
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
    rotation: 85,
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
    rotation: -35,
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
  // left-flower 1 (Figma node 3:2) - Breathing tipis di pojok kiri bawah
  {
    id: '3:2',
    name: 'left-flower 1',
    x: 0,
    y: 1101,
    w: 537,
    h: 756,
    src: '/images/ui/landing-page/section-landing/left-flower.png',
    transformOrigin: '0% 100%',
    animateLoop: 'breatheLeftFlower 6.2s ease-in-out infinite alternate',
  },
  // flower 1 (Figma node 3:3) - Mengayun berporos pangkal tangkai
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
      className: 'flex-none rotate-[-64.7deg]',
      transformOrigin: '15% 82%',
    },
    animateLoop: 'swayFlower1 5.2s ease-in-out 0.4s infinite alternate',
  },
];

const TITLE_LETTERS = 'AKSANTARA'.split('');
const TITLE_BASE_DELAY = 1.7; // Detik mulai setelah pusaka mendarat
const TITLE_STAGGER = 0.06;   // 60ms selisih antar huruf

function RenderLayer({
  item,
  isStarted = true,
  elementRef,
  customStyle,
}: {
  item: LayerItem;
  isStarted?: boolean;
  elementRef?: React.Ref<HTMLDivElement>;
  customStyle?: React.CSSProperties;
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
        ref={elementRef}
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
          ...customStyle,
        }}
      >
        <div
          className={`relative will-change-transform ${item.inner.className || ''}`}
          style={{
            width: innerW,
            height: innerH,
            transform: item.inner.transform,
          }}
        >
          <div
            className="relative size-full will-change-transform"
            style={{
              transformOrigin: item.inner.transformOrigin || 'center',
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
      </div>
    );
  }

  // Lapisan normal (bg, castle, awan, pusaka, kelopak, semak)
  return (
    <div
      key={item.id}
      ref={elementRef}
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
        ...customStyle,
      }}
    >
      <div
        className="relative size-full will-change-transform"
        style={{
          transformOrigin: item.transformOrigin || 'center',
          animation: isStarted ? item.animateLoop : 'none',
        }}
      >
        <div
          className="relative size-full"
          style={{
            transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
          }}
        >
          <Image
            src={item.src}
            alt=""
            fill
            sizes={sizes}
            priority={item.priority}
            className={item.name === 'bg-main' ? 'object-cover' : 'object-contain'}
          />
        </div>
      </div>
    </div>
  );
}

// [dx, dy] px pergeseran saat exit = 1.
// Miring: Mahkota (kanan-atas), Keris (kiri-atas), Cloud-1 (kanan-atas).
// Sisanya: awan atas & kelopak meluncur ke atas.
const EXIT_VECTORS: Record<string, [number, number]> = {
  '1:21': [65, -85],  // Mahkota 1
  '1:22': [-65, -75], // Keris 1
  '1:26': [60, -70],  // Cloud-1 1
  '1:23': [0, -75],   // Cloud-2 1
  '1:24': [0, -75],   // Cloud-3(1) 1
  '1:25': [0, -75],   // Cloud-3 1
  '1:20': [0, -60],   // Kelopak 1
  '1:28': [0, -60],   // Kelopak 2
  '1:30': [0, -60],   // Kelopak 4
  '1:31': [0, -60],   // Kelopak 5
  '1:32': [0, -60],   // Kelopak 6
  '1:46': [0, -60],   // Kelopak 7
  '1:41': [0, -60],   // Kelopak 8
  '1:42': [0, -60],   // Kelopak 9
};

export function HeroSection({ isStarted = true }: { isStarted?: boolean }) {
  const castleRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const dimOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStarted) {
      if (castleRef.current) {
        castleRef.current.style.transform = 'translate3d(0, 64px, 0)';
      }
      if (sectionRef.current) {
        sectionRef.current.style.setProperty('--exit', '0');
      }
      if (section2Ref.current) {
        delete section2Ref.current.dataset.inView;
      }
      if (dimOverlayRef.current) {
        dimOverlayRef.current.style.opacity = '0';
      }
      return;
    }

    let rafId: number | null = null;

    const updateScrollEffects = () => {
      const scrollY = window.scrollY;

      // 1. Parallax Exit untuk komponen atas (rentang scroll 0 s.d. 450px)
      const exitP = Math.min(1, Math.max(0, scrollY / 450));
      if (sectionRef.current) {
        sectionRef.current.style.setProperty('--exit', String(exitP));
      }

      // 2. Parallax Castle: bergerak 1:1 real-time seiring scroll (ongoing while scrolling)
      if (castleRef.current) {
        const castleProgress = Math.min(1, Math.max(0, scrollY / 450));
        castleRef.current.style.transform = `translate3d(0, ${(1 - castleProgress) * 64}px, 0)`;
      }

      // 3. Trigger animasi masuk kartu Section 2: baru muncul ketika elemen sudah 75% muncul di viewport user
      if (section2Ref.current) {
        const rect = section2Ref.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const elemH = rect.height || 1;

        // Porsi tinggi elemen Section 2 yang sudah berada di dalam viewport user
        const visiblePx = Math.max(0, Math.min(elemH, vh - rect.top));
        const visibleRatio = visiblePx / elemH;

        // Baru muncul ketika elemennya sudah 75% (0.75) muncul di viewport user
        if (visibleRatio >= 0.75 && !section2Ref.current.dataset.inView) {
          section2Ref.current.dataset.inView = 'true';
        } else if (visibleRatio < 0.2 && section2Ref.current.dataset.inView) {
          delete section2Ref.current.dataset.inView;
        }

        // 4. Redupkan background secara halus saat masuk Section 2, dan kembali terang normal saat kembali ke Section 1
        if (dimOverlayRef.current) {
          const dimProgress = Math.min(1, Math.max(0, (visibleRatio - 0.2) / 0.55));
          const dimOpacity = dimProgress * 0.42;
          dimOverlayRef.current.style.opacity = String(dimOpacity);
        }
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateScrollEffects();
        rafId = null;
      });
    };

    updateScrollEffects();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isStarted]);

  return (
    <section
      ref={sectionRef}
      data-node-id="1:54"
      aria-label="Hero Aksantara"
      className="@container relative w-full overflow-hidden bg-[#0c1a2c]"
      style={{
        minHeight: `calc(${DESIGN_H} / ${DESIGN_W} * 100cqw)`,
        containerType: 'inline-size',
        ['--exit' as string]: '0',
      } as React.CSSProperties}
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
      {LAYERS_BELOW_TITLE.map((layer) => {
        const rendered =
          layer.id === '1:18' ? (
            <RenderLayer
              key={layer.id}
              item={layer}
              isStarted={isStarted}
              elementRef={castleRef}
              customStyle={{
                transform: 'translate3d(0, 64px, 0)',
                willChange: 'transform',
              }}
            />
          ) : (
            <RenderLayer key={layer.id} item={layer} isStarted={isStarted} />
          );

        const vector = EXIT_VECTORS[layer.id];
        if (vector) {
          const [dx, dy] = vector;
          return (
            <div
              key={layer.id}
              className="absolute inset-0 size-full pointer-events-none will-change-transform"
              style={{
                transform: `translate3d(calc(var(--exit) * ${dx}px), calc(var(--exit) * ${dy}px), 0)`,
                opacity: 'calc(1 - var(--exit))',
              }}
            >
              {rendered}
            </div>
          );
        }
        return rendered;
      })}

      {/* 2. Judul AKSANTARA (Figma node 1:52) - Staggered huruf masuk dari bawah + Scroll Exit */}
      <h1
        data-node-id="1:52"
        data-name="AKSANTARA"
        className="absolute select-none whitespace-nowrap font-bold tracking-normal leading-none will-change-transform"
        style={{
          left: `${(358 / DESIGN_W) * 100}%`,
          top: `${(212 / DESIGN_H) * 100}%`,
          fontSize: 'calc(128 / 1440 * 100cqw)',
          fontFamily: 'var(--font-philosopher), serif',
          filter:
            'drop-shadow(0 calc(6 / 1440 * 100cqw) calc(11.4 / 1440 * 100cqw) rgba(0, 0, 0, 0.75))',
          transform: 'translate3d(0, calc(var(--exit) * -90px), 0)',
          opacity: 'calc(1 - var(--exit))',
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

      {/* 2.1 Subtext Naratif & CTA Button (Struktur sesuai referensi Hero & SSOT v3.1) */}
      <div
        data-name="Hero Narrative & CTA"
        className="absolute z-20 flex flex-col items-center text-center will-change-transform pointer-events-auto select-none"
        style={{
          left: '50%',
          top: `${(365 / DESIGN_H) * 100}%`,
          transform: 'translate3d(-50%, calc(var(--exit) * -90px), 0)',
          opacity: 'calc(1 - var(--exit))',
          width: 'min(90%, calc(680 / 1440 * 100cqw))',
          maxWidth: '680px',
        }}
      >
        <p
          className="text-white font-semibold tracking-wide text-balance drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
          style={{
            fontSize: 'clamp(14px, calc(17 / 1440 * 100cqw), 18px)',
            lineHeight: 1.65,
            animation: isStarted
              ? 'enterHeroSubtext 0.85s cubic-bezier(0.16, 1, 0.3, 1) 2.25s both'
              : 'none',
            opacity: isStarted ? undefined : 0,
          }}
        >
          Lestarikan Aksara Nusantara lewat AI dan permainan interaktif
          <br className="hidden sm:inline" />
          {' '}Revitalisasi harmoni Lontara, Sunda, dan Bali lewat presisi AI dan sentuhan kinestetik.
        </p>

        <div
          className="mt-[calc(22/1440*100cqw)] flex justify-center"
          style={{
            animation: isStarted
              ? 'enterHeroBtn 0.75s cubic-bezier(0.16, 1, 0.3, 1) 2.5s both'
              : 'none',
            opacity: isStarted ? undefined : 0,
          }}
        >
          <ShinyButton
            label="Mulai Petualangan Aksara"
            href="/mulai"
            fillColor="rgba(13, 14, 18, 0.65)"
            labelColor="#F6F2E9"
            accentColor="#ffd261"
            accentSoftColor="#ffe8a3"
            cornerRadius={9999}
            className="text-xs md:text-sm tracking-wide font-medium shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(255,210,97,0.18)] hover:scale-105 active:scale-95 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 2.15 Background Dimming Overlay saat masuk Section 2 */}
      <div
        ref={dimOverlayRef}
        aria-hidden="true"
        className="absolute inset-0 z-[25] pointer-events-none transition-opacity duration-500 ease-out"
        style={{
          backgroundColor: '#060b14',
          opacity: 0,
        }}
      />

      {/* 2.2 Section 2: Empat Pilar Revitalisasi (Bento Grid di dalam Main Background) */}
      <div
        ref={section2Ref}
        data-name="Section 2 Pillars"
        aria-label="Empat Pilar Revitalisasi Aksantara"
        className="relative z-30 w-full px-4 sm:px-6 lg:px-10 pointer-events-auto flex flex-col items-center select-none"
        style={{
          paddingTop: `${(SECTION_2_TOP_PX / DESIGN_W) * 100}%`,
          paddingBottom: '64px',
          isolation: 'isolate',
        }}
      >
        {/* Header Section 2 */}
        <div className="pillar-header flex flex-col items-center text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
          <span
            className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-2.5 px-3.5 py-1 rounded-full border border-[#D4A373]/35 bg-[#0D0E12]/90 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            style={{ color: '#D4A373' }}
          >
            Empat Pilar Revitalisasi
          </span>

          <h2
            className="font-bold tracking-tight text-balance leading-tight"
            style={{
              fontFamily: 'var(--font-philosopher), serif',
              fontSize: 'clamp(24px, calc(36 / 1440 * 100cqw), 44px)',
              background: 'linear-gradient(to top, #ffd261, #F6F2E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter:
                'drop-shadow(0 calc(3 / 1440 * 100cqw) calc(6 / 1440 * 100cqw) rgba(0, 0, 0, 0.75))',
            }}
          >
            Satu Sistem, Empat Cara Belajar
          </h2>

          <p
            className="mt-2.5 font-semibold text-shadow-lg text-xs sm:text-sm text-balance text-[#ffffff]/85 max-w-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
            style={{ lineHeight: 1.6 }}
          >
            Dari evaluasi cerdas AI hingga sentuhan kinestetik fisik, setiap pilar merawat warisan aksara secara utuh.
          </p>
        </div>

        {/* 4 Cards Grid: 1 kolom di HP, 2 kolom di tablet, 4 kolom di desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full max-w-[1240px] mx-auto">
          {PILLARS.map((pillar, index) => (
            <Link
              key={pillar.id}
              href={pillar.href}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd261] rounded-2xl"
            >
              <OrnateFrame
                className="pillar-card group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#ffd261]/50 cursor-pointer h-full flex flex-col"
                style={{
                  background: 'rgba(20, 23, 33, 0.94)',
                  boxShadow:
                    '0 12px 36px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,210,97,0.15)',
                  animationDelay: `${index * 0.12}s`,
                }}
              >
                {/* Thumbnail Image dengan gradient blend */}
                <div className="relative h-28 sm:h-32 w-full overflow-hidden">
                  <Image
                    src={pillar.img}
                    alt={pillar.nama}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(13,14,18,0.05) 0%, rgba(13,14,18,0.45) 50%, rgba(13,14,18,0.96) 100%)',
                    }}
                  />
                  <span
                    className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-white/20 bg-[#0D0E12]/95 shadow-md"
                    style={{ color: pillar.accent }}
                  >
                    {pillar.pilar}
                  </span>
                </div>

                {/* Card Body & Deskripsi */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 min-h-[145px] sm:min-h-[160px]">
                  <div>
                    <h3
                      className="font-bold text-[#F6F2E9] leading-snug tracking-tight text-sm sm:text-base group-hover:text-[#ffd261] transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-between"
                      style={{
                        fontFamily: 'var(--font-philosopher), serif',
                      }}
                    >
                      <span>{pillar.nama}</span>
                      <span className="text-[#ffd261] text-xs opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all">→</span>
                    </h3>
                    <p className="mt-2 text-xs sm:text-[13px] text-[#F6F2E9]/80 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[10px] text-[#D4A373] font-medium tracking-wide">
                      {pillar.tag}
                    </span>
                    <span className="text-[10px] text-[#ffd261] font-semibold tracking-wider uppercase group-hover:underline">
                      Jelajahi →
                    </span>
                  </div>
                </div>
              </OrnateFrame>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Layers di atas judul (awan depan teks & latar depan) */}
      {LAYERS_ABOVE_TITLE.map((layer) => {
        const rendered = (
          <RenderLayer key={layer.id} item={layer} isStarted={isStarted} />
        );

        const vector = EXIT_VECTORS[layer.id];
        if (vector) {
          const [dx, dy] = vector;
          return (
            <div
              key={layer.id}
              className="absolute inset-0 size-full pointer-events-none will-change-transform"
              style={{
                transform: `translate3d(calc(var(--exit) * ${dx}px), calc(var(--exit) * ${dy}px), 0)`,
                opacity: 'calc(1 - var(--exit))',
              }}
            >
              {rendered}
            </div>
          );
        }
        return rendered;
      })}
    </section>
  );
}

export default HeroSection;
