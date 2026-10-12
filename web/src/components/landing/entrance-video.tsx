'use client';

import { useEffect, useRef, useState } from 'react';

interface EntranceVideoProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

export function EntranceVideo({ onComplete, onFadeStart }: EntranceVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const fadeTriggeredRef = useRef(false);
  const completedRef = useRef(false);

  const finishVideo = () => {
    if (completedRef.current) return;
    completedRef.current = true;
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
    setTimeout(() => {
      finishVideo();
    }, 800);
  };

  // Mencoba autoplay dengan audio saat mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setHasStarted(true);
        })
        .catch(() => {
          // Browser memblokir autoplay audio otomatis tanpa interaksi
          setNeedsUserInteraction(true);
        });
    }
  }, []);

  const handleStartWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.play().then(() => {
      setNeedsUserInteraction(false);
      setHasStarted(true);
    });
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // Mulai fade-out di detik 7.2 agar tepat selesai di detik ke-8
    if (video.currentTime >= 7.2) {
      startFade();
    }
  };

  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  const handleScreenClick = () => {
    if (!showSkipPrompt) {
      setShowSkipPrompt(true);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    startFade();
    finishVideo();
  };

  return (
    <div
      aria-label="Video Pembuka Aksantara"
      onClick={handleScreenClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black select-none touch-none overscroll-none transition-opacity duration-800 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/landing-page/Landing-Video.mp4"
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={startFade}
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Tombol Skip muncul hanya setelah user mengklik layar */}
      {showSkipPrompt && (
        <button
          onClick={handleSkip}
          type="button"
          className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-black/60 hover:bg-black/80 text-white text-sm font-medium border border-white/30 transition-all cursor-pointer shadow-xl animate-fade-in"
        >
          <span>Klik untuk Lewati Intro</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Prompt Mulai Pengalaman jika browser menahan audio autoplay */}
      {needsUserInteraction && !hasStarted && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md flex flex-col items-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-[#ffd261] to-[#cf5600] flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-['Philosopher',sans-serif]">
              Aksantara
            </h2>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Tekan tombol di bawah untuk memulai pengalaman sinematik dengan audio lengkap.
            </p>
            <button
              onClick={handleStartWithSound}
              type="button"
              className="px-6 py-3 rounded-full font-semibold text-slate-950 bg-gradient-to-r from-[#ffd261] to-[#cf5600] hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Mulai Pengalaman
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntranceVideo;
