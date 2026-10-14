'use client';

import { CSSProperties, ReactNode, useId } from 'react';

function CornerOrnament({ className = '', gradId }: { className?: string; gradId: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`pointer-events-none absolute h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 z-20 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd261" />
          <stop offset="50%" stopColor="#D4A373" />
          <stop offset="100%" stopColor="#8B6536" />
        </linearGradient>
      </defs>
      <path d="M8,8 L8,40 Q8,8 40,8 Z" fill={`url(#${gradId})`} opacity="0.9" />
      <path d="M18,18 Q18,30 30,18 Z" fill={`url(#${gradId})`} opacity="0.7" />
      <circle cx="10" cy="10" r="3.5" fill="#ffd261" opacity="0.95" />
      <line x1="8" y1="8" x2="52" y2="8" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.55" />
      <line x1="8" y1="8" x2="8" y2="52" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.55" />
    </svg>
  );
}

interface OrnateFrameProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function OrnateFrame({ children, className = '', style }: OrnateFrameProps) {
  const rawId = useId();
  const gradId = `goldGrad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div className={`relative ${className}`} style={style}>
      <CornerOrnament className="top-0 left-0" gradId={gradId} />
      <CornerOrnament className="top-0 right-0 [transform:scaleX(-1)]" gradId={gradId} />
      <CornerOrnament className="bottom-0 left-0 [transform:scaleY(-1)]" gradId={gradId} />
      <CornerOrnament className="bottom-0 right-0 [transform:scale(-1)]" gradId={gradId} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          border: '1px solid rgba(212,163,115,0.45)',
          boxShadow: 'inset 0 0 0 1px rgba(255,210,97,0.12), 0 0 20px rgba(212,163,115,0.08)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default OrnateFrame;