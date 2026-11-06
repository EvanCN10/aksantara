'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface NavbarProps {
  isStarted?: boolean;
}

export function Navbar({ isStarted: isStartedProp }: NavbarProps = {}) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [internalStarted, setInternalStarted] = useState(pathname !== '/');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      setInternalStarted(true);
      return;
    }
    const seenCookie = document.cookie
      .split('; ')
      .some((row) => row === 'aksantara_intro_seen=true');
    if (sessionStorage.getItem('aksantara_intro_seen') === 'true' || seenCookie) {
      sessionStorage.setItem('aksantara_intro_seen', 'true');
      setInternalStarted(true);
    }
    const onHeroStarted = () => setInternalStarted(true);
    window.addEventListener('aksantara_hero_started', onHeroStarted);
    return () => window.removeEventListener('aksantara_hero_started', onHeroStarted);
  }, [pathname]);

  const isStarted = isStartedProp !== undefined ? isStartedProp : internalStarted;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAksaraBaliActive = pathname === '/aksara-bali';
  const isTentangActive = pathname === '/tentang';

  return (
    <header
      inert={!isStarted ? true : undefined}
      className="fixed top-4 inset-x-0 mx-auto z-40 w-[92%] max-w-4xl pointer-events-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300"
      style={{
        opacity: isStarted ? 1 : 0,
        transform: isStarted ? 'translateY(0)' : 'translateY(-24px)',
        pointerEvents: isStarted ? 'auto' : 'none',
      }}
    >
      <nav
        aria-label="Utama"
        className="flex items-center justify-between px-4 sm:px-5 md:px-7 py-2 rounded-full backdrop-blur-xl backdrop-saturate-150 bg-[#0c1a2c]/70 border border-white/30 shadow-[0_8px_32px_rgba(12,26,44,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 hover:border-white/45"
      >
        {/* 1. Brand Logo & Name (Kiri) */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center gap-2.5 min-h-11 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] rounded-full"
        >
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
            <span className="text-[10px] tracking-widest text-white/75 italic font-serif hidden sm:inline -mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              Pelestarian Aksara Bali
            </span>
          </div>
        </Link>

        {/* 2. Menu Links (Tengah - Desktop) */}
        <ul role="list" className="hidden md:flex items-center gap-7 text-xs lg:text-sm font-medium tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          <li>
            <Link
              href="/aksara-bali"
              aria-current={isAksaraBaliActive ? 'page' : undefined}
              onClick={(e) => handleNavClick(e, '/aksara-bali')}
              className={`inline-flex items-center min-h-11 px-1 transition-colors relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] rounded after:absolute after:bottom-2 after:left-0 after:h-0.5 after:bg-[#ffd261] after:transition-all after:duration-300 ${
                isAksaraBaliActive
                  ? 'text-[#ffd261] font-semibold after:w-full'
                  : 'text-white/90 hover:text-[#ffd261] after:w-0 hover:after:w-full'
              }`}
            >
              Aksara Bali
            </Link>
          </li>
          <li>
            <Link
              href="/tentang"
              aria-current={isTentangActive ? 'page' : undefined}
              onClick={(e) => handleNavClick(e, '/tentang')}
              className={`inline-flex items-center min-h-11 px-1 transition-colors relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261] rounded after:absolute after:bottom-2 after:left-0 after:h-0.5 after:bg-[#ffd261] after:transition-all after:duration-300 ${
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
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {isAuthenticated && user ? (
            <>
              <Link
                href={user.role === 'guru' ? '/guru/dashboard' : '/profil'}
                className="inline-flex items-center gap-1.5 min-h-11 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-[#ffd261]/30 text-white text-xs md:text-sm font-medium transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
              >
                {user.role === 'guru' ? (
                  <GraduationCap aria-hidden="true" className="w-4 h-4 text-[#ffd261] shrink-0" />
                ) : (
                  <User aria-hidden="true" className="w-4 h-4 text-[#ffd261] shrink-0" />
                )}
                <span className="max-w-[100px] sm:max-w-[150px] truncate font-semibold text-[#ffd261]">
                  {user.role === 'guru' ? 'Dashboard Guru' : user.nama.split(' ')[0]}
                </span>
                {user.isGuest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono hidden sm:inline">
                    Tamu
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                className="hidden sm:inline-flex items-center min-h-11 text-xs font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition border border-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                onClick={(e) => handleNavClick(e, '/auth')}
                className="hidden sm:inline-flex items-center min-h-11 text-xs md:text-sm font-medium text-white/90 hover:text-white px-3 py-1.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
              >
                Masuk
              </Link>
              <Link
                href="/auth?redirect=/mulai"
                className="inline-flex items-center min-h-11 px-4 md:px-5 py-2 rounded-full font-semibold text-xs md:text-sm text-white bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#d97706] hover:from-[#ea580c] hover:to-[#f59e0b] shadow-[0_4px_16px_rgba(234,88,12,0.35)] hover:shadow-[0_4px_22px_rgba(234,88,12,0.55)] border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
              >
                Mulai Belajar
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center min-h-11 min-w-11 rounded-full text-white/90 hover:text-[#ffd261] hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
          >
            {mobileMenuOpen ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl backdrop-blur-xl bg-[#0c1a2c]/95 border border-white/25 p-3 shadow-2xl">
          <ul role="list" className="flex flex-col gap-1 text-sm font-medium">
            <li>
              <Link
                href="/aksara-bali"
                aria-current={isAksaraBaliActive ? 'page' : undefined}
                onClick={(e) => handleNavClick(e, '/aksara-bali')}
                className={`flex items-center min-h-11 px-4 rounded-xl transition-colors ${
                  isAksaraBaliActive ? 'bg-[#ffd261]/15 text-[#ffd261] font-semibold' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Aksara Bali
              </Link>
            </li>
            <li>
              <Link
                href="/tentang"
                aria-current={isTentangActive ? 'page' : undefined}
                onClick={(e) => handleNavClick(e, '/tentang')}
                className={`flex items-center min-h-11 px-4 rounded-xl transition-colors ${
                  isTentangActive ? 'bg-[#ffd261]/15 text-[#ffd261] font-semibold' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Tentang
              </Link>
            </li>
            {isAuthenticated && user ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center min-h-11 px-4 rounded-xl text-left text-rose-300 hover:bg-white/10 transition-colors"
                >
                  Keluar Sesi
                </button>
              </li>
            ) : (
              <li>
                <Link
                  href="/auth"
                  onClick={(e) => handleNavClick(e, '/auth')}
                  className="flex items-center min-h-11 px-4 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                >
                  Masuk Akun
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

export default Navbar;
