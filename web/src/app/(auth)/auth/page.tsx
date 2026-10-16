'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertTriangle, Info, User, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'register';
type UserRole = 'siswa' | 'guru';

function ArrowLeftIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function EyeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsGuest } = useAuth();

  const redirectTarget = searchParams.get('redirect');
  const unauthorizedNotice = searchParams.get('unauthorized');

  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('siswa');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getDestination = (chosenRole: UserRole) => {
    if (redirectTarget) {
      if (chosenRole === 'siswa' && redirectTarget.startsWith('/guru')) {
        return '/profil';
      }
      return redirectTarget;
    }
    return chosenRole === 'guru' ? '/guru/dashboard' : '/mulai';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorNotice(null);

    const hasSupabaseConfig =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (hasSupabaseConfig && formData.email && formData.password) {
      try {
        const supabase = createClient();
        if (mode === 'login') {
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                nama: formData.nama || 'Penoreh Aksara',
              },
            },
          });
          if (error) throw error;
        }

        const dest = getDestination(role);
        router.push(dest);
        router.refresh();
        return;
      } catch (err: unknown) {
        console.warn('Supabase auth failed, falling back to guest session:', err);
        setErrorNotice('Koneksi Supabase belum aktif / kredensial belum sesuai. Masuk otomatis via sesi demo.');
      }
    }

    // Fallback: Sesi Tamu Demo Instan
    loginAsGuest(role, formData.nama || undefined);
    const dest = getDestination(role);
    router.push(dest);
    router.refresh();
  };

  const handleGuestDemo = () => {
    loginAsGuest(role, formData.nama || undefined);
    const dest = getDestination(role);
    router.push(dest);
    router.refresh();
  };

  const handleGoogleAuth = async () => {
    const hasSupabaseConfig =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (hasSupabaseConfig) {
      try {
        const supabase = createClient();
        const nextDest = getDestination(role);
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextDest)}`,
          },
        });
        return;
      } catch {
        // Fallback ke guest demo jika gagal
      }
    }

    handleGuestDemo();
  };

  return (
    <main className="min-h-screen w-full bg-[#0c1a2c] text-[#F6F2E9] flex flex-col lg:flex-row overflow-x-hidden lg:h-screen lg:max-h-screen lg:overflow-hidden selection:bg-[#ffd261]/20 selection:text-[#ffd261]">
      {/* =========================================
          PANEL KIRI: IMAGE & SHOWCASE BUDAYA
          ========================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[300px] sm:min-h-[380px] lg:min-h-0 lg:h-full overflow-hidden flex-shrink-0">
        {/* Floating Back Button ke Beranda */}
        <div className="absolute top-5 left-5 lg:top-6 lg:left-6 z-30">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Kembali ke Beranda"
            className="w-10 h-10 lg:w-11 lg:h-11 bg-black/45 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-black/70 border border-white/25 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Gambar Showcase Budaya */}
        <Image
          src="/images/ui/landing-page/auth/image.png"
          alt="Eksplorasi Aksara Nusantara"
          fill
          priority={true}
          quality={90}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center filter brightness-[0.88] contrast-[1.05] animate-bg-zoom-in"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2c] via-[#0c1a2c]/35 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0c1a2c]/20 lg:to-[#0c1a2c]" />

        {/* Quote Budaya di Bawah Gambar */}
        <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 z-20">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ffd261]/20 text-[#ffd261] border border-[#ffd261]/40 backdrop-blur-md inline-block mb-2">
            Harmoni Trinitas Aksara
          </span>
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-md"
            style={{ fontFamily: 'var(--font-philosopher), serif' }}
          >
            Menoreh Jejak Kebudayaan di Kanvas Masa Depan
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1 drop-shadow">
            Lontara Bugis, Sunda Parahyangan, dan Bali Dwipa dalam satu ekosistem terpadu.
          </p>
        </div>
      </div>

      {/* =========================================
          PANEL KANAN: FORMULIR AUTENTIKASI
          ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header Sambutan */}
          <div className="space-y-2">
            <h1
              className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
              style={{ fontFamily: 'var(--font-philosopher), serif' }}
            >
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Petualangan Aksantara'}
            </h1>
            <p className="text-xs sm:text-sm text-white/70">
              {mode === 'login'
                ? 'Akses kanvas belajar, riwayat cerita epos, dan konsol hardware Anda.'
                : 'Daftarkan diri Anda untuk merevitalisasi aksara daerah Nusantara.'}
            </p>

            {/* Banner Notifikasi Redirect / Proteksi Rute */}
            {redirectTarget && (
              <div className="p-3 rounded-xl bg-[#ffd261]/10 border border-[#ffd261]/30 text-[#ffd261] text-xs flex items-center gap-2 mt-2">
                <Lock className="w-4 h-4 text-[#ffd261] shrink-0" />
                <span>
                  Halaman tujuan Anda (<span className="font-mono font-semibold">{redirectTarget}</span>) memerlukan sesi aktif.
                </span>
              </div>
            )}

            {unauthorizedNotice === 'guru_only' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Portal Pengampu hanya dapat diakses dengan akun peran Pendidik / Guru.</span>
              </div>
            )}

            {errorNotice && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-blue-300 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}
          </div>

          {/* Toggle Mode (Masuk / Daftar) */}
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] shadow-[0_0_16px_rgba(255,210,97,0.3)] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#ffd261] to-[#D4A373] text-[#0c1a2c] shadow-[0_0_16px_rgba(255,210,97,0.3)] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Pilihan Peran (Siswa vs Guru) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Pilih Peran Belajar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('siswa')}
                className={`p-3 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center gap-3 ${
                  role === 'siswa'
                    ? 'border-[#ffd261] bg-[#ffd261]/15 text-white shadow-[0_0_18px_rgba(255,210,97,0.2)]'
                    : 'border-white/10 bg-black/20 text-white/60 hover:border-white/20 hover:text-white/80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#ffd261]/10 border border-[#ffd261]/30 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#ffd261]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Siswa / Pelajar</p>
                  <p className="text-[10px] text-white/50">Kanvas, Cerita, Hardware</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('guru')}
                className={`p-3 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center gap-3 ${
                  role === 'guru'
                    ? 'border-[#ffd261] bg-[#ffd261]/15 text-white shadow-[0_0_18px_rgba(255,210,97,0.2)]'
                    : 'border-white/10 bg-black/20 text-white/60 hover:border-white/20 hover:text-white/80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#ffd261]/10 border border-[#ffd261]/30 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-[#ffd261]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pendidik / Guru</p>
                  <p className="text-[10px] text-white/50">Analitik Kelas & Rapor</p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5 animate-cascade-fade-up">
                <label className="text-xs font-medium text-white/80">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  placeholder="Misal: Raden Arya Nusantara"
                  className="w-full bg-[#060d16] border border-white/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ffd261] focus:ring-2 focus:ring-[#ffd261]/20 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/80">Alamat Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="nama@aksantara.id"
                className="w-full bg-[#060d16] border border-white/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ffd261] focus:ring-2 focus:ring-[#ffd261]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/80">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-[#060d16] border border-white/20 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ffd261] focus:ring-2 focus:ring-[#ffd261]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5 animate-cascade-fade-up">
                <label className="text-xs font-medium text-white/80">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Ketik ulang kata sandi"
                    className="w-full bg-[#060d16] border border-white/20 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ffd261] focus:ring-2 focus:ring-[#ffd261]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Tombol Submit Utama */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#d97706] hover:from-[#ea580c] hover:to-[#f59e0b] shadow-[0_4px_20px_rgba(234,88,12,0.35)] hover:shadow-[0_6px_28px_rgba(234,88,12,0.5)] border border-white/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              {isLoading
                ? 'Memproses...'
                : mode === 'login'
                ? role === 'guru'
                  ? 'Masuk ke Dashboard Guru'
                  : 'Masuk ke Aksantara'
                : 'Buat Akun'}
            </button>

            {mode === 'register' && (
              <p className="text-[11px] text-white/50 text-center pt-1">
                Akun baru berperan siswa. Akses guru atau ahli diberikan oleh administrator.
              </p>
            )}

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0c1a2c] text-white/50 font-light">
                  atau lanjutkan tanpa pendaftaran
                </span>
              </div>
            </div>

            {/* Tombol Alternatif & Demo Tamu Instan */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex items-center justify-center gap-2 px-3 py-2.5 border border-white/10 rounded-xl bg-black/30 hover:bg-white/[0.06] hover:border-[#ffd261]/35 text-xs font-medium text-white transition-all cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4 flex-none" />
                <span className="truncate">Akun Google</span>
              </button>

              <button
                type="button"
                onClick={handleGuestDemo}
                className="flex items-center justify-center gap-2 px-3 py-2.5 border border-[#D4A373]/40 rounded-xl bg-black/30 hover:bg-[#ffd261]/15 hover:border-[#ffd261] text-xs font-semibold text-[#ffd261] transition-all cursor-pointer shadow-sm"
              >
                <SparklesIcon className="w-4 h-4 text-[#ffd261] flex-none" />
                <span className="truncate">
                  {role === 'guru' ? 'Tamu Guru (Demo)' : 'Tamu Siswa (Demo)'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c1a2c] flex items-center justify-center text-white text-sm">
          Memuat portal autentikasi...
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
