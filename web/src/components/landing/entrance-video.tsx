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
    fadeTimeoutRef.current = window.setTimeout(() => {
      finishVideo();
    }, 800);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

    const handleFirstInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        startFade();
        finishVideo();
      } else if (videoRef.current) {
        videoRef.current.muted = false;
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(fadeTimeoutRef.current ?? undefined);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime >= 7.2) {
      startFade();
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    startFade();
    finishVideo();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black select-none touch-none overscroll-none transition-opacity duration-800 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/landing-page/Landing-Video.mp4"
        aria-label="Video pembuka Aksantara"
        playsInline
        autoPlay
        preload="auto"
        onError={finishVideo}
        onTimeUpdate={handleTimeUpdate}
        onEnded={startFade}
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      <button
        onClick={handleSkip}
        type="button"
        className="absolute top-6 right-6 z-50 inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-full backdrop-blur-md bg-black/70 hover:bg-black/85 text-white text-xs sm:text-sm font-medium border border-white/35 transition-all cursor-pointer shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd261]"
      >
        <span>Lewati Intro</span>
        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default EntranceVideo;
