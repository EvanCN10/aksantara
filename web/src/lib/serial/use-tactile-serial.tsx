'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  type SerialConnectionStatus,
  type RfidCardData,
  type SerialTelemetryLog,
  type TipeSlot,
  type TactileDeviceInfo,
} from './tactile-serial-types';
import {
  SERIAL_BAUD_RATE,
  TactileLineFramer,
  decodeTactileLine,
  type TactileSerialEvent,
} from './tactile-protocol';
import { playWoodTap, playSoftMuted } from '@/lib/audio/sound-effects';

interface WebSerialPort {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface SerialEventTarget extends EventTarget {
  requestPort(): Promise<WebSerialPort>;
}

interface NavigatorWithSerial extends Navigator {
  serial: SerialEventTarget;
}

function getNavigatorSerial(): SerialEventTarget | null {
  if (typeof window === 'undefined') return null;
  const nav = navigator as unknown as Partial<NavigatorWithSerial>;
  return nav.serial ?? null;
}

export interface TactileSerialContextValue {
  status: SerialConnectionStatus;
  deviceInfo: TactileDeviceInfo | null;
  slotKonsonan: RfidCardData | null;
  slotDiakritik: RfidCardData | null;
  sukuKataGabungan: string;
  latinGabungan: string;
  telemetryLogs: SerialTelemetryLog[];
  isSerialSupported: boolean;
  lastIssue: string | null;
  cardRevision: number;
  connectWebSerial: () => Promise<void>;
  activateSimulation: () => void;
  disconnect: () => Promise<void>;
  placeCard: (slot: TipeSlot, card: RfidCardData) => void;
  clearSlot: (slot: TipeSlot) => void;
  clearBothSlots: () => void;
  clearLogs: () => void;
}

const TactileSerialContext = createContext<TactileSerialContextValue | null>(null);

export function TactileSerialProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SerialConnectionStatus>('disconnected');
  const [deviceInfo, setDeviceInfo] = useState<TactileDeviceInfo | null>(null);
  const [slotKonsonan, setSlotKonsonan] = useState<RfidCardData | null>(null);
  const [slotDiakritik, setSlotDiakritik] = useState<RfidCardData | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<SerialTelemetryLog[]>([]);
  const [isSerialSupported, setIsSerialSupported] = useState<boolean>(true);
  const [lastIssue, setLastIssue] = useState<string | null>(null);
  const [cardRevision, setCardRevision] = useState<number>(0);

  // References to active Serial port and reader
  const portRef = useRef<WebSerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isClosingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSerialSupported(getNavigatorSerial() !== null);
    }
  }, []);

  const addLog = useCallback((arah: 'RX' | 'TX' | 'SYS', pesan: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setTelemetryLogs((prev) => [
      ...prev.slice(-49),
      { id: `${Date.now()}-${Math.random()}`, timestamp, arah, pesan },
    ]);
  }, []);

  const sukuKataGabungan = useMemo(() => {
    if (!slotKonsonan) return '';
    if (!slotDiakritik) return slotKonsonan.simbol;
    return `${slotKonsonan.simbol}${slotDiakritik.simbol}`;
  }, [slotKonsonan, slotDiakritik]);

  const latinGabungan = useMemo(() => {
    if (!slotKonsonan) return '';
    const kons = slotKonsonan.latin.toUpperCase();
    if (!slotDiakritik) return kons;
    const baseConsonant = kons.slice(0, -1);
    return `${baseConsonant}${slotDiakritik.latin.toUpperCase()}`;
  }, [slotKonsonan, slotDiakritik]);

  // Clean disconnect
  const disconnect = useCallback(async () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    try {
      if (portRef.current?.writable && !portRef.current.writable.locked) {
        try {
          const writer = portRef.current.writable.getWriter();
          await writer.write(new TextEncoder().encode('STOP\n'));
          writer.releaseLock();
        } catch {}
      }

      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
          readerRef.current.releaseLock();
        } catch {}
        readerRef.current = null;
      }

      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch {}
        portRef.current = null;
      }
    } catch {}

    setStatus('disconnected');
    setDeviceInfo(null);
    setSlotKonsonan(null);
    setSlotDiakritik(null);
    setLastIssue(null);
    addLog('SYS', 'Perangkat serial diputuskan.');
    isClosingRef.current = false;
  }, [addLog]);

  // Listen for hardware unplug events
  useEffect(() => {
    const serial = getNavigatorSerial();
    if (!serial) return;
    const handleDisconnect = (event: Event) => {
      const targetPort = 'target' in event ? (event.target as unknown) : null;
      if (portRef.current && targetPort === portRef.current) {
        addLog('SYS', 'Kabel USB dicabut dari komputer.');
        disconnect();
      }
    };
    serial.addEventListener('disconnect', handleDisconnect);
    return () => {
      serial.removeEventListener('disconnect', handleDisconnect);
    };
  }, [addLog, disconnect]);

  // Dispatch decoded events from stream
  const handleDecodedEvent = useCallback(
    (event: TactileSerialEvent) => {
      switch (event.event) {
        case 'DEVICE_READY': {
          setDeviceInfo((prev) => ({
            portName: prev?.portName || 'ESP32-S3 Tactile Pad',
            baudRate: event.baudRate,
            device: event.device,
            chip: event.chip,
            version: event.version,
            scanning: event.scanning,
          }));
          setStatus('connected');
          break;
        }

        case 'CARD_DETECTED': {
          if (event.slot === 1) {
            setSlotKonsonan(event.card);
          } else {
            setSlotDiakritik(event.card);
          }
          setCardRevision((r) => r + 1);
          setLastIssue(null);
          playWoodTap();
          break;
        }

        case 'CARD_REMOVED': {
          if (event.slot === 1) {
            setSlotKonsonan((current) => (current?.uid === event.uid ? null : current));
          } else {
            setSlotDiakritik((current) => (current?.uid === event.uid ? null : current));
          }
          setCardRevision((r) => r + 1);
          break;
        }

        case 'CARD_REJECTED': {
          const reasonText =
            event.reason === 'WRONG_SLOT'
              ? `Kartu diletakkan di slot yang salah (Slot ${event.slot}).`
              : event.reason === 'UNSUPPORTED_CARD'
              ? 'Jenis kartu tidak didukung (harus Mifare Classic 1K).'
              : 'Gagal membaca kartu RFID.';
          setLastIssue(reasonText);
          playSoftMuted();
          break;
        }

        case 'CARD_UNASSIGNED': {
          setLastIssue('Kartu belum di-provisioning (belum terdaftar di katalog).');
          playSoftMuted();
          break;
        }
      }
    },
    []
  );

  // Connect via native Web Serial API
  const connectWebSerial = useCallback(async () => {
    if (!isSerialSupported) {
      addLog('SYS', 'Peringatan: Web Serial API tidak didukung di peramban ini. Beralih ke Mode Simulasi.');
      setStatus('simulated');
      return;
    }

    try {
      setStatus('connecting');
      setLastIssue(null);
      addLog('SYS', 'Meminta akses port serial USB via dialog peramban...');

      const serial = getNavigatorSerial();
      if (!serial) throw new Error('Web Serial API tidak tersedia.');
      const port = await serial.requestPort();
      await port.open({ baudRate: SERIAL_BAUD_RATE });

      portRef.current = port;
      setStatus('connected');
      setDeviceInfo({ portName: 'ESP32-S3 Tactile Pad', baudRate: SERIAL_BAUD_RATE });
      addLog('SYS', 'Port USB terhubung! Mengirim inisialisasi STATUS & START...');

      // Write handshake command to device
      if (port.writable && !port.writable.locked) {
        try {
          const writer = port.writable.getWriter();
          await writer.write(new TextEncoder().encode('STATUS\nSTART\n'));
          writer.releaseLock();
          addLog('TX', 'STATUS & START dikirim.');
        } catch (writeErr) {
          console.warn('Gagal menulis command inisialisasi serial:', writeErr);
        }
      }

      // Start stream consumption with TactileLineFramer
      const framer = new TactileLineFramer(
        (line: string) => {
          addLog('RX', line);
          const decoded = decodeTactileLine(line);
          if (decoded.ok) {
            handleDecodedEvent(decoded.value);
          } else {
            console.warn('[TactileSerial] Decode issue:', decoded.issue, line);
          }
        },
        (issue: string) => {
          addLog('SYS', `Peringatan framing: ${issue}`);
        }
      );

      (async () => {
        try {
          while (port.readable && !isClosingRef.current) {
            const reader = port.readable.getReader();
            readerRef.current = reader;
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                  framer.push(value);
                }
              }
            } finally {
              try {
                reader.releaseLock();
              } catch {}
              readerRef.current = null;
            }
          }
        } catch (streamErr) {
          if (!isClosingRef.current) {
            console.warn('[TactileSerial] Stream error:', streamErr);
          }
        } finally {
          framer.finish();
        }
      })();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('No port selected') || errorMsg.includes('canceled')) {
        addLog('SYS', 'Pemilihan port USB dibatalkan oleh pengguna.');
        setStatus('disconnected');
      } else {
        addLog('SYS', `Gagal menghubungkan port serial: ${errorMsg}`);
        setStatus('error');
      }
    }
  }, [isSerialSupported, addLog, handleDecodedEvent]);

  // Simulation mode
  const activateSimulation = useCallback(() => {
    if (status === 'connected') {
      disconnect();
    }
    setStatus('simulated');
    setDeviceInfo({ portName: 'Virtual Pad Simulator', baudRate: SERIAL_BAUD_RATE });
    setLastIssue(null);
    addLog('SYS', 'Mode Simulasi Virtual Kinestetik diaktifkan.');
    playWoodTap();
  }, [status, disconnect, addLog]);

  const placeCard = useCallback(
    (slot: TipeSlot, card: RfidCardData) => {
      if (slot === 'konsonan') {
        setSlotKonsonan(card);
        addLog('SYS', `[SIM] Slot 1: ${card.label} (${card.uid})`);
      } else {
        setSlotDiakritik(card);
        addLog('SYS', `[SIM] Slot 2: ${card.label} (${card.uid})`);
      }
      setCardRevision((r) => r + 1);
      playWoodTap();
    },
    [addLog]
  );

  const clearSlot = useCallback(
    (slot: TipeSlot) => {
      if (slot === 'konsonan') {
        setSlotKonsonan(null);
        addLog('SYS', '[SIM] Slot 1 dikosongkan.');
      } else {
        setSlotDiakritik(null);
        addLog('SYS', '[SIM] Slot 2 dikosongkan.');
      }
      setCardRevision((r) => r + 1);
    },
    [addLog]
  );

  const clearBothSlots = useCallback(() => {
    setSlotKonsonan(null);
    setSlotDiakritik(null);
    setCardRevision((r) => r + 1);
    addLog('SYS', 'Kedua slot sensor dikosongkan.');
  }, [addLog]);

  const value = useMemo<TactileSerialContextValue>(
    () => ({
      status,
      deviceInfo,
      slotKonsonan,
      slotDiakritik,
      sukuKataGabungan,
      latinGabungan,
      telemetryLogs,
      isSerialSupported,
      lastIssue,
      cardRevision,
      connectWebSerial,
      activateSimulation,
      disconnect,
      placeCard,
      clearSlot,
      clearBothSlots,
      clearLogs: () => setTelemetryLogs([]),
    }),
    [
      status,
      deviceInfo,
      slotKonsonan,
      slotDiakritik,
      sukuKataGabungan,
      latinGabungan,
      telemetryLogs,
      isSerialSupported,
      lastIssue,
      cardRevision,
      connectWebSerial,
      activateSimulation,
      disconnect,
      placeCard,
      clearSlot,
      clearBothSlots,
    ]
  );

  return <TactileSerialContext.Provider value={value}>{children}</TactileSerialContext.Provider>;
}

export function useTactileSerial(): TactileSerialContextValue {
  const context = useContext(TactileSerialContext);
  if (!context) {
    throw new Error('useTactileSerial harus digunakan di dalam TactileSerialProvider (rute /hardware).');
  }
  return context;
}
