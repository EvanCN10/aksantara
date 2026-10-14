'use client';

import { useEffect, useState } from 'react';
import HeroSection from './hero-section';
import EntranceVideo from './entrance-video';

export function LandingView({ initialSeen = false }: { initialSeen?: boolean }) {
  const [hasSeenIntro, setHasSeenIntro] = useState(initialSeen);
  const [isHeroStarted, setIsHeroStarted] = useState(initialSeen);

  useEffect(() => {
    const seen = sessionStorage.getItem('aksantara_intro_seen');
    if (seen === 'true' || initialSeen) {
      setHasSeenIntro(true);
      setIsHeroStarted(true);
    }
  }, [initialSeen]);

  // Kunci scroll body selama intro video aktif
  useEffect(() => {
    if (!hasSeenIntro) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [hasSeenIntro]);

  const handleVideoComplete = () => {
    document.cookie = 'aksantara_intro_seen=true; path=/; SameSite=Lax';
    sessionStorage.setItem('aksantara_intro_seen', 'true');
    setHasSeenIntro(true);
    setIsHeroStarted(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aksantara_hero_started'));
    }
    window.scrollTo(0, 0);
  };

  const handleFadeStart = () => {
    // Memicu animasi hero saat video mulai fade-out (detik 7.2)
    setIsHeroStarted(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aksantara_hero_started'));
    }
    window.scrollTo(0, 0);
  };

  return (
    <main className="min-h-screen w-full bg-[#0c1a2c] relative">
      {!hasSeenIntro && (
        <EntranceVideo
          onComplete={handleVideoComplete}
          onFadeStart={handleFadeStart}
        />
      )}
      <HeroSection isStarted={isHeroStarted} />
    </main>
  );
}

export default LandingView;
