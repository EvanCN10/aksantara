'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

interface NavbarProps {
  isStarted?: boolean;
}

export function Navbar({ isStarted: isStartedProp }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  // Di SSR, selalu deterministik: rute '/' mulai dari false jika video ada, selain itu true
  const [internalStarted, setInternalStarted] = useState(pathname !== '/');

  useEffect(() => {
    if (pathname !== '/') {
      setInternalStarted(true);
      return;
    }
    // Cek sessionStorage hanya di sisi klien setelah mount
    if (sessionStorage.getItem('aksantara_intro_seen') === 'true') {
      setInternalStarted(true);
    }
    const onHeroStarted = () => setInternalStarted(true);
    window.addEventListener('aksantara_hero_started', onHeroStarted);
    return () => window.removeEventListener('aksantara_hero_started', onHeroStarted);
  }, [pathname]);

  const isStarted = isStartedProp !== undefined ? isStartedProp : internalStarted;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isTrinitasActive = pathname === '/trinitas';
  const isTentangActive = pathname === '/tentang';

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
          {/* Main Logo Aksantara */}
          <div className="relative h-8 w-7 md:h-9 md:w-7.5 flex-none flex items-center justify-center group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(255,210,97,0.35)]">
            <Image
              src="/images/ui/logo/MAIN LOGO AKSANTARA.png"
              alt="Logo Aksantara"
              fill
              sizes="36px"
              priority
              className="object-contain"
            />
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
        <ul className="hidden md:flex items-center gap-7 text-xs lg:text-sm font-medium tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          <li>
            <Link
              href="/trinitas"
              onClick={(e) => handleNavClick(e, '/trinitas')}
              className={`transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#ffd261] after:transition-all after:duration-300 ${
                isTrinitasActive
                  ? 'text-[#ffd261] font-semibold after:w-full'
                  : 'text-white/90 hover:text-[#ffd261] after:w-0 hover:after:w-full'
              }`}
            >
              Trinitas Aksara
            </Link>
          </li>
          <li>
            <Link
              href="/tentang"
              onClick={(e) => handleNavClick(e, '/tentang')}
              className={`transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#ffd261] after:transition-all after:duration-300 ${
                isTentangActive
                  ? 'text-[#ffd261] font-semibold after:w-full'
                  : 'text-white/90 hover:text-[#ffd261] after:w-0 hover:after:w-full'
              }`}
            >
              Tentang
            </Link>
          </li>
        </ul>

        {/* 3. CTA Action Buttons (Kanan) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <>
              {/* User Identity Chip */}
              <Link
                href={user.role === 'guru' ? '/guru/dashboard' : '/profil'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-[#ffd261]/30 text-white text-xs md:text-sm font-medium transition-all hover:scale-105 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
              >
                <span>{user.avatar}</span>
                <span className="max-w-[120px] sm:max-w-[160px] truncate font-semibold text-[#ffd261]">
                  {user.role === 'guru' ? 'Dashboard Guru' : user.nama.split(' ')[0]}
                </span>
                {user.isGuest && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono hidden sm:inline">
                    Tamu
                  </span>
                )}
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition border border-white/10"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                onClick={(e) => handleNavClick(e, '/auth')}
                className="text-xs md:text-sm font-medium text-white/85 hover:text-white px-2.5 py-1.5 rounded-full transition-colors hidden sm:inline-block drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
              >
                Masuk
              </Link>
              <Link
                href="/auth?redirect=/mulai"
                className="px-4 md:px-5 py-2 rounded-full font-semibold text-xs md:text-sm text-white bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#d97706] hover:from-[#ea580c] hover:to-[#f59e0b] shadow-[0_4px_16px_rgba(234,88,12,0.35)] hover:shadow-[0_4px_22px_rgba(234,88,12,0.55)] border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Mulai Belajar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
