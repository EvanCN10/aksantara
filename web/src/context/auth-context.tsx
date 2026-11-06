'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearGuestProgress } from '@/lib/supabase/progress-service';

export interface AuthUser {
  id: string;
  nama: string;
  email?: string;
  role: 'siswa' | 'guru';
  avatar: string;
  gelarBudaya: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  role: 'siswa' | 'guru' | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  loginAsGuest: (role: 'siswa' | 'guru', nama?: string) => void;
  updateDisplayName: (namaBaru: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_COOKIE_NAME = 'aksantara_guest_session';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const hasSupabaseConfig =
          Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
          Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

        if (hasSupabaseConfig) {
          try {
            const supabase = createClient();
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
              const meta = session.user.user_metadata || {};
              const userRole: 'siswa' | 'guru' = meta.role === 'guru' ? 'guru' : 'siswa';
              setUser({
                id: session.user.id,
                nama: meta.nama || meta.name || session.user.email?.split('@')[0] || 'Penoreh Aksara',
                email: session.user.email,
                role: userRole,
                avatar: userRole === 'guru' ? 'Guru' : 'Siswa',
                gelarBudaya: userRole === 'guru' ? 'Pengampu Sastra Bali' : 'Penoreh Lontar Pemula',
                isGuest: false,
              });
              setIsLoading(false);
              return;
            }
          } catch {
            // Supabase network / config error, lanjut cek guest session
          }
        }

        const guestCookie = getCookie(GUEST_COOKIE_NAME);
        if (guestCookie) {
          try {
            const parsed = JSON.parse(guestCookie);
            if (parsed && parsed.id && parsed.role) {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            // Invalid JSON cookie
          }
        }

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const loginAsGuest = (selectedRole: 'siswa' | 'guru', customNama?: string) => {
    const isGuru = selectedRole === 'guru';
    const guestUser: AuthUser = {
      id: isGuru ? 'guru-demo-1' : 'siswa-demo-1',
      nama:
        customNama?.trim() ||
        (isGuru ? 'I Made Dananjaya, S.Pd. (Tamu)' : 'I Wayan Arya Pratama (Tamu)'),
      email: isGuru ? 'guru.demo@aksantara.id' : 'siswa.demo@aksantara.id',
      role: selectedRole,
      avatar: isGuru ? 'Guru' : 'Siswa',
      gelarBudaya: isGuru ? 'Pengampu Sastra Bali' : 'Penoreh Lontar Pemula',
      isGuest: true,
    };

    setCookie(GUEST_COOKIE_NAME, JSON.stringify(guestUser), 7);
    setUser(guestUser);
  };

  const updateDisplayName = (namaBaru: string) => {
    const trimmed = namaBaru.trim();
    if (!trimmed) return;
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, nama: trimmed };
      if (updated.isGuest) {
        setCookie(GUEST_COOKIE_NAME, JSON.stringify(updated), 7);
      }
      return updated;
    });
  };

  const logout = async () => {
    const wasGuest = Boolean(user?.isGuest);
    setIsLoading(true);
    try {
      const hasSupabaseConfig =
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      if (hasSupabaseConfig) {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // Ignore
        }
      }
    } finally {
      if (wasGuest) {
        clearGuestProgress();
      }
      deleteCookie(GUEST_COOKIE_NAME);
      setUser(null);
      setIsLoading(false);
      router.push('/auth');
      router.refresh();
    }
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isGuest = Boolean(user?.isGuest);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isGuest,
        isLoading,
        loginAsGuest,
        updateDisplayName,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
