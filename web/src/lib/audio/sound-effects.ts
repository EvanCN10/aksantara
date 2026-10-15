// Sound Effects Engine - Aksantara Phygital Platform
// Professional acoustic & gamelan sound design using Web Audio API

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Resonant Bronze Gamelan / Singing Bowl Chime
 * Used for: Chapter completion, challenge passed, glyph recognition
 */
export function playSuccessGamelan(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Master output gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.linearRampToValueAtTime(0.22, now + 0.015);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
  masterGain.connect(ctx.destination);

  // Warm acoustic lowpass filter (simulates physical instrument body)
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2600, now);
  filter.Q.setValueAtTime(2.5, now);
  filter.connect(masterGain);

  // Fundamental Bronze Tone: G5 (~784 Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(783.99, now);

  // Harmonic Overtone: C6 (~1046.5 Hz) with warm detune
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1046.5, now);
  osc2.detune.setValueAtTime(6, now); // subtle acoustic shimmer

  // Third resonance: E6 (~1318.5 Hz) quieter sparkle
  const gain3 = ctx.createGain();
  gain3.gain.setValueAtTime(0.35, now);
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(1318.51, now);
  osc3.connect(gain3);
  gain3.connect(filter);

  osc1.connect(filter);
  osc2.connect(filter);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);

  const stopTime = now + 1.0;
  osc1.stop(stopTime);
  osc2.stop(stopTime);
  osc3.stop(stopTime);
}

/**
 * Organic Teak Wood / Bamboo Tap
 * Used for: Canvas drawing stroke, subtle UI clicks, RFID tile detection
 */
export function playWoodTap(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  gain.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(360, now);
  filter.Q.setValueAtTime(4.0, now);
  filter.connect(gain);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(340, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

  osc.connect(filter);
  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * Soft Muted Damped Chime
 * Used for: Quiz incorrect try-again, undo, cancel actions (never harsh or buzzing)
 */
export function playSoftMuted(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  gain.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.connect(gain);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(261.63, now); // C4
  osc.frequency.exponentialRampToValueAtTime(196.0, now + 0.18); // G3

  osc.connect(filter);
  osc.start(now);
  osc.stop(now + 0.23);
}
