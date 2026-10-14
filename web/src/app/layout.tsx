import type { Metadata } from 'next';
import { Philosopher } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

const philosopher = Philosopher({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-philosopher',
});

export const metadata: Metadata = {
  title: 'Aksantara',
  description: 'Platform edukasi pelestarian Trinitas Aksara Nusantara (Lontara, Sunda, Bali)',
  icons: {
    icon: '/images/ui/logo/MAIN LOGO AKSANTARA.png',
    shortcut: '/images/ui/logo/MAIN LOGO AKSANTARA.png',
    apple: '/images/ui/logo/MAIN LOGO AKSANTARA.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={philosopher.variable}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

