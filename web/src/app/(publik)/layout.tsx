import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Aksantara - Harmoni Tiga Aksara Nusantara',
  description:
    'Platform edukasi multi-modal berbasis AI klasifikasi dan perangkat kinestetik (Phygital) pelestarian Trinitas Aksara Nusantara (Lontara, Sunda, Bali).',
};

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0c1a2c] text-[#F6F2E9]">
      <Navbar />
      {children}
    </div>
  );
}
