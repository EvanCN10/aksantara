'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  isStarted?: boolean;
}

export function Navbar({ isStarted = true }: NavbarProps) {
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      role="banner"
      aria-label="Navigasi Utama Aksantara"
      className="fixed top-5 inset-x-0 mx-auto z-40 w-[92%] max-w-4xl pointer-events-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300"
      style={{
        opacity: isStarted ? 1 : 0,
        transform: isStarted ? 'translateY(0)' : 'translateY(-24px)',
        pointerEvents: isStarted ? 'auto' : 'none',
      }}
    >
      <nav className="flex items-center justify-between px-5 md:px-7 py-2.5 rounded-full backdrop-blur-xl backdrop-saturate-150 bg-white/12 border border-white/30 shadow-[0_8px_32px_rgba(12,26,44,0.18),inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300 hover:border-white/40">
        {/* 1. Brand Logo & Name (Kiri) */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd261] rounded-full"
        >
          {/* Emblem Icon Nusantara */}
          <div className="size-8 rounded-full bg-gradient-to-br from-[#ffd261]/25 to-[#cf5600]/30 border border-[#ffd261]/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4.5 text-[#ffd261]"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span
              className="text-base md:text-lg font-bold leading-tight tracking-wide bg-gradient-to-r from-[#ffd261] to-[#f59e0b] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#ffd261] transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              Aksantara
            </span>
            <span className="text-[10px] tracking-widest text-white/70 italic font-serif hidden sm:inline -mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              Harmoni Tiga Aksara
            </span>
          </div>
        </Link>

        {/* 2. Menu Links (Tengah - Tersembunyi di layar kecil) */}
        <ul className="hidden md:flex items-center gap-7 text-xs lg:text-sm font-medium text-white/90 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          <li>
            <Link
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="hover:text-[#ffd261] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#ffd261] hover:after:w-full after:transition-all after:duration-300"
            >
              Beranda
            </Link>
          </li>
          <li>
            <Link
              href="/trinitas"
              onClick={(e) => handleNavClick(e, '/trinitas')}
              className="hover:text-[#ffd261] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#ffd261] hover:after:w-full after:transition-all after:duration-300"
            >
              Trinitas Aksara
            </Link>
          </li>
          <li>
            <Link
              href="#tentang"
              className="hover:text-[#ffd261] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#ffd261] hover:after:w-full after:transition-all after:duration-300"
            >
              Tentang
            </Link>
          </li>
        </ul>

        {/* 3. CTA Action Buttons (Kanan) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth"
            onClick={(e) => handleNavClick(e, '/auth')}
            className="text-xs md:text-sm font-medium text-white/85 hover:text-white px-2.5 py-1.5 rounded-full transition-colors hidden sm:inline-block drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          >
            Masuk
          </Link>
          <Link
            href="/mulai"
            onClick={(e) => handleNavClick(e, '/mulai')}
            className="px-4 md:px-5 py-2 rounded-full font-semibold text-xs md:text-sm text-white bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#d97706] hover:from-[#ea580c] hover:to-[#f59e0b] shadow-[0_4px_16px_rgba(234,88,12,0.35)] hover:shadow-[0_4px_22px_rgba(234,88,12,0.55)] border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Mulai Belajar
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
