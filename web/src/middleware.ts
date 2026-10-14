import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rute yang membutuhkan proteksi sesi (login wajib / sesi tamu demo aktif)
const PROTECTED_PREFIXES = [
  '/mulai',
  '/latihan',
  '/cerita',
  '/hardware',
  '/pelestarian',
  '/profil',
  '/guru',
];

const GUEST_COOKIE_NAME = 'aksantara_guest_session';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Cek apakah rute saat ini adalah rute terproteksi
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // 2. Periksa keberadaan sesi (Sesi Tamu Demo ATAU Sesi Supabase)
  const guestSessionCookie = request.cookies.get(GUEST_COOKIE_NAME)?.value;

  // Cari cookie Supabase auth token (pola standar: sb-*-auth-token)
  const hasSupabaseToken = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('-auth-token') && cookie.value);

  const isAuthenticated = Boolean(guestSessionCookie || hasSupabaseToken);

  // 3. Jika belum terautentikasi sama sekali, arahkan ke /auth dengan parameter redirect
  if (!isAuthenticated) {
    const redirectUrl = new URL('/auth', request.url);
    const targetPath = `${pathname}${search}`;
    redirectUrl.searchParams.set('redirect', targetPath);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Role-Based Access Control (RBAC) untuk Rute Khusus Pengampu / Guru (/guru/*)
  if (pathname.startsWith('/guru')) {
    if (guestSessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(guestSessionCookie));
        if (parsed.role && parsed.role !== 'guru') {
          // Siswa dilarang masuk ke dashboard guru, arahkan ke profil pribadi
          const profilUrl = new URL('/profil', request.url);
          profilUrl.searchParams.set('unauthorized', 'guru_only');
          return NextResponse.redirect(profilUrl);
        }
      } catch {
        // Invalid cookie format
        const authUrl = new URL('/auth', request.url);
        authUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(authUrl);
      }
    }
  }

  return NextResponse.next();
}

// Konfigurasi matcher: jalankan middleware pada seluruh halaman kecuali aset statis & API internal
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - videos/ (public videos)
     * - fonts/ (public fonts)
     * - audio/ (public audio)
     * - models/ (public AI models)
     * - public files ending with .png, .jpg, .svg, .mp4, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|images|videos|fonts|audio|models|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)).*)',
  ],
};
