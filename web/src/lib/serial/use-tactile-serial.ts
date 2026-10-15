'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  type SerialConnectionStatus,
  type RfidCardData,
  type SerialTelemetryLog,
  type TipeSlot,
  KARTU_RFID_PRESET,
} from './tactile-serial-types';
import { playWoodTap } from '@/lib/audio/sound-effects';

export function useTactileSerial() {
  const [status, setStatus] = useState<SerialConnectionStatus>('disconnected');
  const [deviceInfo, setDeviceInfo] = useState<{ portName: string; baudRate: number } | null>(null);
  const [slotKonsonan, setSlotKonsonan] = useState<RfidCardData | null>(null);
  const [slotDiakritik, setSlotDiakritik] = useState<RfidCardData | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<SerialTelemetryLog[]>([]);
  const [isSerialSupported, setIsSerialSupported] = useState<boolean>(true);

  // References to active Serial port and reader stream
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);

  // Check Web Serial API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSerialSupported('serial' in navigator);
    }
  }, []);

  const addLog = useCallback((arah: 'RX' | 'TX' | 'SYS', pesan: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setTelemetryLogs((prev) => [
      ...prev.slice(-49), // Keep last 50 logs
      { id: `${Date.now()}-${Math.random()}`, timestamp, arah, pesan },
    ]);
  }, []);

  // Web Audio chime feedback on card scan - uses organic teak wood tap
  const playChime = useCallback((_frequency?: number) => {
    playWoodTap();
  }, []);

  // Combined syllable calculation
  const sukuKataGabungan = useMemo(() => {
    if (!slotKonsonan) return '';
    if (!slotDiakritik) return slotKonsonan.simbol;

    // Unicode rendering for consonant + diacritic
    return `${slotKonsonan.simbol}${slotDiakritik.simbol}`;
  }, [slotKonsonan, slotDiakritik]);

  const latinGabungan = useMemo(() => {
    if (!slotKonsonan) return '';
    const kons = slotKonsonan.latin.toUpperCase();
    if (!slotDiakritik) return kons;

    // Replace default 'A' with diacritic vowel
    const baseConsonant = kons.slice(0, -1); // e.g. "K" from "KA"
    return `${baseConsonant}${slotDiakritik.latin.toUpperCase()}`;
  }, [slotKonsonan, slotDiakritik]);

  // Place a card into one of the slots (simulation / parser dispatch)
  const placeCard = useCallback(
    (slot: TipeSlot, card: RfidCardData) => {
      if (slot === 'konsonan') {
        setSlotKonsonan(card);
        addLog('RX', `{"slot":1,"uid":"${card.uid}","tipe":"konsonan","aksara":"${card.aksaraId}","simbol":"${card.simbol}","label":"${card.label}"}`);
        playChime(587.33); // D5 chime
      } else {
        setSlotDiakritik(card);
        addLog('RX', `{"slot":2,"uid":"${card.uid}","tipe":"diakritik","aksara":"${card.aksaraId}","simbol":"${card.simbol}","label":"${card.label}"}`);
        playChime(880.0); // A5 chime
      }
    },
    [addLog, playChime]
  );

  const clearSlot = useCallback(
    (slot: TipeSlot) => {
      if (slot === 'konsonan') {
        setSlotKonsonan(null);
        addLog('RX', '{"slot":1,"event":"tag_removed"}');
      } else {
        setSlotDiakritik(null);
        addLog('RX', '{"slot":2,"event":"tag_removed"}');
      }
    },
    [addLog]
  );

  const clearBothSlots = useCallback(() => {
    setSlotKonsonan(null);
    setSlotDiakritik(null);
    addLog('SYS', 'Kedua slot sensor dikosongkan.');
  }, [addLog]);

  // Disconnect cleanly
  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {
      // Ignored on forced disconnect
    }

    setStatus('disconnected');
    setDeviceInfo(null);
    setSlotKonsonan(null);
    setSlotDiakritik(null);
    addLog('SYS', 'Perangkat serial diputuskan.');
  }, [addLog]);

  // Connect via native Web Serial API
  const connectWebSerial = useCallback(async () => {
    if (!isSerialSupported) {
      addLog('SYS', 'Peringatan: Web Serial API tidak didukung di browser ini. Mengalihkan ke Mode Simulasi.');
      setStatus('simulated');
      return;
    }

    try {
      setStatus('connecting');
      addLog('SYS', 'Meminta akses port serial USB via dialog peramban...');

      // @ts-expect-error Web Serial API standard type
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      portRef.current = port;
      setStatus('connected');
      setDeviceInfo({ portName: 'ESP32-S3 UART Bridge', baudRate: 115200 });
      addLog('SYS', 'Perangkat terhubung! Baud rate: 115200. Port siap membaca stream RFID.');
      addLog('RX', '{"event":"READY","firmware":"Aksantara-Tactile-Pad-v2.4","status":"OK"}');
      playChime(659.25); // E5 chime

      // ============================================================================
      // HARDWARE FIRMWARE INTEGRATION STREAM READER
      // Membaca stream data UART dari mikrokontroler ESP32 secara asinkron
      // ============================================================================
      const textDecoder = new (window as any).TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable).catch(() => {});
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      // Background stream consumption loop
      (async () => {
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line) continue;

              try {
                // Parsing 1: Format JSON dari ESP32
                // Contoh: {"slot":1,"uid":"SD-KA-01"} atau {"event":"tag_removed","slot":1}
                const data = JSON.parse(line);
                if (data.event === 'tag_removed' && data.slot) {
                  clearSlot(data.slot === 1 ? 'konsonan' : 'diakritik');
                } else if (data.uid) {
                  const matched = KARTU_RFID_PRESET.find(
                    (k) => k.uid.toLowerCase() === String(data.uid).toLowerCase()
                  );
                  const targetSlot: TipeSlot =
                    data.slot === 2 || data.tipe === 'diakritik' || matched?.tipe === 'diakritik'
                      ? 'diakritik'
                      : 'konsonan';

                  const cardData: RfidCardData = matched || {
                    uid: String(data.uid),
                    aksaraId: data.aksara || 'sunda',
                    tipe: targetSlot,
                    simbol: data.simbol || 'ᮊ',
                    label: data.label || 'Card',
                    latin: data.latin || 'ka',
                    fonetik: data.fonetik || '/ka/',
                  };
                  placeCard(targetSlot, cardData);
                }
              } catch {
                // Parsing 2: Format UID Polos (contoh: "SD-KA-01\r")
                const matched = KARTU_RFID_PRESET.find(
                  (k) => k.uid.toLowerCase() === line.toLowerCase()
                );
                if (matched) {
                  placeCard(matched.tipe, matched);
                } else {
                  addLog('RX', line);
                }
              }
            }
          }
        } catch {
          // Stream cancelled when disconnected
        }
      })();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('No port selected') || errorMsg.includes('canceled')) {
        addLog('SYS', 'Pemilihan port USB dibatalkan oleh pengguna.');
      } else {
        addLog('SYS', `Gagal menghubungkan port serial: ${errorMsg}`);
      }
      setStatus('disconnected');
    }
  }, [isSerialSupported, addLog, playChime, placeCard, clearSlot]);

  // Activate virtual simulation mode (for testing without physical hardware)
  const activateSimulation = useCallback(() => {
    setStatus('simulated');
    setDeviceInfo({ portName: 'Virtual Pad Simulator (Chromium)', baudRate: 115200 });
    addLog('SYS', 'Mode Simulasi Virtual Kinestetik diaktifkan.');
    addLog('SYS', 'Pilih kartu dari rak simulasi untuk menguji interaksi sensor RFID.');
    playChime(523.25); // C5 chime
  }, [addLog, playChime]);

  return {
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
    clearLogs: () => setTelemetryLogs([]),
  };
}
