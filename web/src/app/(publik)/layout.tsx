import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Aksantara - Pelatih Menulis Aksara Bali Berbasis AI',
  description:
    'Platform edukasi pelestarian Aksara Bali berbasis AI klasifikasi bentuk goresan kanvas.',
};

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen text-[#F6F2E9]">
      <Navbar />
      {children}
    </div>
  );
}
