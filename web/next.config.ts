import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  turbopack: {
    root: path.resolve(process.cwd(), '..'),
  },

  experimental: {
    externalDir: true,
  },

  // Optimasi format gambar modern untuk keringanan aset (AVIF & WebP)
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari cache aset
  },

  // Security Headers & Permissions Policy
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Izinkan Web Serial API untuk hardware IoT di origin aplikasi
            value: 'serial=(self), camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
