'use client';

import { useEffect, useRef, useState } from 'react';

interface EntranceVideoProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

export function EntranceVideo({ onComplete, onFadeStart }: EntranceVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeTriggeredRef = useRef(false);
  const completedRef = useRef(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  const finishVideo = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (fadeTimeoutRef.current !== null) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  const startFade = () => {
    if (fadeTriggeredRef.current) return;
    fadeTriggeredRef.current = true;
    setIsFadingOut(true);
    if (onFadeStart) {
      onFadeStart();
    }
    // Selesai tepat pada detik ke-8 (fade out 800ms dari 7.2s ke 8.0s)
    fadeTimeoutRef.current = window.setTimeout(() => {
      finishVideo();
    }, 800);
  };

  // Langsung putar video tanpa jeda saat mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Coba putar dengan audio; jika browser memblokir audio unmuted, langsung fallback ke muted tanpa jeda
    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {
          finishVideo();
        });
      });
    }

    // Unmute otomatis saat user berinteraksi pertama kali (klik layar)
    const handleFirstInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.clearTimeout(fadeTimeoutRef.current ?? undefined);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // Mulai fade-out di detik 7.2 agar tepat selesai di detik ke-8
    if (video.currentTime >= 7.2) {
      startFade();
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    finishVideo();
  };

  return (
    <div
      aria-label="Video Pembuka Aksantara"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black select-none touch-none overscroll-none transition-opacity duration-800 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/landing-page/Landing-Video.mp4"
        playsInline
        autoPlay
        preload="auto"
        onError={finishVideo}
        onTimeUpdate={handleTimeUpdate}
        onEnded={startFade}
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Tombol Lewati Intro tersedia sejak awal dan ramah keyboard */}
      <button
        onClick={handleSkip}
        type="button"
        aria-label="Lewati intro video"
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-black/60 hover:bg-black/80 text-white text-sm font-medium border border-white/30 transition-all cursor-pointer shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd261]"
      >
        <span>Lewati intro</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default EntranceVideo;
