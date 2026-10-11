import type { Metadata } from 'next';
import { Philosopher } from 'next/font/google';
import './globals.css';

const philosopher = Philosopher({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-philosopher',
});

export const metadata: Metadata = {
  title: 'Aksantara — Multi-Modal AI & Phygital Platform',
  description: 'Platform edukasi pelestarian Trinitas Aksara Nusantara (Lontara, Sunda, Bali)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={philosopher.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

