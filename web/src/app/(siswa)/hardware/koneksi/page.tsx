'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlugZap, Globe, KeyRound, Layers, Lightbulb, Gamepad2 } from 'lucide-react';
import { useTactileSerial } from '@/lib/serial/use-tactile-serial';
import { TactilePadVisualizer } from '@/components/hardware/tactile-pad-visualizer';
import { VirtualCardRack } from '@/components/hardware/virtual-card-rack';
import { MiniGameLauncherCard } from '@/components/hardware/mini-game-launcher-card';
import { SerialTelemetryMonitor } from '@/components/hardware/serial-telemetry-monitor';
import { OrnateFrame } from '@/components/ui/ornate-frame';
import { ShinyButton } from '@/components/ui/shiny-button';

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
    </svg>
  );
}

function UsbIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="19" r="2" />
      <circle cx="6" cy="9" r="2" />
      <line x1="6" y1="11" x2="6" y2="13" />
      <line x1="12" y1="5" x2="12" y2="17" />
      <line x1="18" y1="11" x2="18" y2="13" />
      <polyline points="10 7 12 5 14 7" />
      <polyline points="4 13 6 15 8 13" />
      <polyline points="16 13 18 15 20 13" />
    </svg>
  );
}

export default function HardwareKoneksiPage() {
  const {
    status,
    deviceInfo,
    slotKonsonan,
    slotDiakritik,
    sukuKataGabungan,
    latinGabungan,
    telemetryLogs,
    isSerialSupported,
    connectWebSerial,
    activateSimulation,
    disconnect,
    placeCard,
    clearSlot,
    clearBothSlots,
    clearLogs,
  } = useTactileSerial();

  const isOnline = status === 'connected' || status === 'simulated';

  return (
    <main className="relative min-h-screen text-[#F6F2E9] selection:bg-[#ffd261]/20 selection:text-[#ffd261] flex flex-col justify-between">
      {/* Visual Thematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060d16]" aria-hidden="true">
        <Image
          src="/images/ui/backgrounds/bg-hardware-arena.webp"
          alt="Arena Aksantara Tactile Pad"
          fill
          priority={true}
          quality={90}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.45] contrast-[1.05] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d16] via-[#060d16]/70 to-[#060d16]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,13,22,0.75)_100%)]" />
      </div>

      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/4 w-[750px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,97,0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-1/4 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffd261_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025]" />
      </div>

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0c1a2c]/85 border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/mulai"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-[#ffd261]" />
            <span>Kembali ke Pilihan Jalur</span>
          </Link>

          {/* Connection Status Badge in Navbar */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : status === 'simulated'
                  ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-mono text-white/80">
              {status === 'connected'
                ? `USB Connected • 115200 Baud`
                : status === 'simulated'
                ? `Simulated Mode`
                : `Hardware Disconnected`}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Console Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-8">
        {/* Title & Cultural Pillar Badge */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#ffd261] px-3 py-1 rounded-full bg-[#ffd261]/10 border border-[#ffd261]/25 inline-block mb-2">
            Pilar 3: Phygital Tactile Learning • Web Serial API
          </span>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white tracking-wide mb-2.5"
            style={{ fontFamily: 'var(--font-philosopher)' }}
          >
            Aksantara Tactile Pad Console
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Jembatan interaktif konsol kinestetik fisik (ESP32 + RFID Reader) ke peramban. Belajar meramu aksara melalui kartu fisik tanpa kelelahan layar.
          </p>
        </div>

        {/* Browser Compatibility Notice if not Chromium */}
        {/* Browser Compatibility Notice if not Chromium */}
        {!isSerialSupported && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center">
            <p className="text-xs text-amber-200 flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Peramban Anda tidak mendukung native Web Serial API (disarankan Google Chrome / Microsoft Edge). Anda dapat menggunakan <strong>Mode Simulasi Virtual</strong> di bawah ini secara penuh.</span>
            </p>
          </div>
        )}

        {/* 2-Column Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Visualizer Pad & Connection Controls (5 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <OrnateFrame className="w-full">
              <TactilePadVisualizer
                status={status}
                slotKonsonan={slotKonsonan}
                slotDiakritik={slotDiakritik}
                sukuKataGabungan={sukuKataGabungan}
                latinGabungan={latinGabungan}
                onClearSlot={clearSlot}
                onClearBoth={clearBothSlots}
              />
            </OrnateFrame>

            {/* Hardware Connect / Simulation Action Panel */}
            <div className="rounded-2xl bg-[#141e2e]/90 border border-white/10 p-5 flex flex-col gap-3.5 shadow-xl">
              <span className="text-[10px] font-mono tracking-widest text-[#ffd261]/80 uppercase block">
                Kontrol Perangkat Keras
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Physical USB Connect Button */}
                {status !== 'connected' ? (
                  <ShinyButton
                    label="Hubungkan via USB"
                    onClick={connectWebSerial}
                    className="py-3 text-xs sm:text-sm font-bold cursor-pointer"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={disconnect}
                    className="py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    Putuskan USB
                  </button>
                )}

                {/* Simulation Mode Toggle Button */}
                {status !== 'simulated' ? (
                  <button
                    type="button"
                    onClick={activateSimulation}
                    className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/15 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gamepad2 className="w-4 h-4 text-white/90" />
                    <span>Mode Simulasi Virtual</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={disconnect}
                    className="py-3 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    Keluar Simulasi
                  </button>
                )}
              </div>

              {deviceInfo && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/50">
                  <span>Port: {deviceInfo.portName}</span>
                  <span>Baud: {deviceInfo.baudRate} bps</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Virtual Card Rack & Mini-Games Launcher (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Virtual Card Rack for testing/playing */}
            <VirtualCardRack
              onSelectCard={placeCard}
              activeSlot1Uid={slotKonsonan?.uid}
              activeSlot2Uid={slotDiakritik?.uid}
            />

            {/* Mini-Game Launcher */}
            <MiniGameLauncherCard isOnline={isOnline} />
          </div>
        </div>

        {/* 3. Illustrated Physical Setup Guide (Anti-AI Slop) */}
        <div className="rounded-3xl bg-black/40 border border-white/10 p-5 sm:p-7 shadow-xl space-y-6">
          {/* Physical Hardware Showcase Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-black/60 via-[#101826] to-black/60 border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-lg">
            <div className="relative w-36 sm:w-44 h-24 rounded-xl overflow-hidden border border-[#ffd261]/25 shrink-0 bg-black/40">
              <Image
                src="/images/hardware/tactile-pad-render.webp"
                alt="Aksantara Tactile Pad Fisik 3D"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-widest text-[#ffd261] uppercase block mb-1">
                Purwarupa Perangkat Fisik (Hardware Edition)
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1" style={{ fontFamily: 'var(--font-philosopher)' }}>
                Aksantara Kinesthetic Pad ESP32
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Casing kayu sonokeling dengan dua modul pembaca RFID RC522 terintegrasi dan chip mikrokontroler ESP32-S3 bertenaga Web Serial plug-and-play.
              </p>
            </div>
          </div>

          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffd261]/80 block">
              Prosedur Laboratorium
            </span>
            <h3
              className="text-base sm:text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-philosopher)' }}
            >
              Panduan Menghubungkan Konsol Fisik Aksantara
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                judul: 'Colokkan Kabel USB',
                teks: 'Hubungkan kabel USB-C Aksantara Tactile Pad ke port laptop atau PC guru/siswa.',
                Icon: PlugZap,
              },
              {
                step: '02',
                judul: 'Buka Browser Chromium',
                teks: 'Gunakan Google Chrome atau Microsoft Edge untuk akses Web Serial API bebas driver.',
                Icon: Globe,
              },
              {
                step: '03',
                judul: 'Beri Izin Port USB',
                teks: 'Klik tombol Hubungkan via USB dan pilih port serial ESP32 pada jendela browser.',
                Icon: KeyRound,
              },
              {
                step: '04',
                judul: 'Tempelkan Kartu RFID',
                teks: 'Letakkan kartu fisik pada slot sensor pad dan saksikan respon audio suku kata instan.',
                Icon: Layers,
              },
            ].map((p) => {
              const StepIcon = p.Icon;
              return (
                <div
                  key={p.step}
                  className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ffd261]/10 border border-[#ffd261]/25 flex items-center justify-center text-[#ffd261]">
                        <StepIcon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#ffd261]">
                        Langkah {p.step}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{p.judul}</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed">{p.teks}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Live Serial Telemetry Terminal (Bottom Drawer) */}
        <SerialTelemetryMonitor
          logs={telemetryLogs}
          onClearLogs={clearLogs}
          baudRate={deviceInfo?.baudRate || 115200}
        />
      </div>

      {/* 5. Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-6 text-center text-xs text-white/40">
        Aksantara Phygital Platform • Web Serial API Plug & Play Protocol • FMIPA UGM 2026
      </footer>
    </main>
  );
}

// ============================================================================
// TODO: BACKEND / HARDWARE FIRMWARE INTEGRATION
//
// Struktur payload UART Serial dari firmware ESP32 (Arduino C++):
// Baud Rate: 115200, Parity: None, Data Bits: 8, Stop Bits: 1
//
// Output format saat kartu NFC 13.56MHz terdeteksi di RC522:
// { "event": "tag_scanned", "slot": 1, "uid": "E28068A1", "aksara": "sunda", "glif": "Ka", "unicode": "ᮊ" }
//
// Output format saat kartu diangkat:
// { "event": "tag_removed", "slot": 1 }
// ============================================================================
