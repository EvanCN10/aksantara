'use client';

import React, { useState } from 'react';
import type { SerialTelemetryLog } from '@/lib/serial/tactile-serial-types';

interface SerialTelemetryMonitorProps {
  logs: SerialTelemetryLog[];
  onClearLogs: () => void;
  baudRate?: number;
}

export function SerialTelemetryMonitor({
  logs,
  onClearLogs,
  baudRate = 115200,
}: SerialTelemetryMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-black/60 border border-white/10 overflow-hidden shadow-xl">
      {/* Drawer Header */}
      <div className="p-4 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <span className="text-xs text-white/50 group-hover:text-white transition-colors">
            {isOpen ? '▼' : '►'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                Live Serial Telemetry & Diagnostics
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                UART {baudRate} Baud
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/40 block mt-0.5">
              Inspeksi paket stream raw data USB (RX / TX / SYS)
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={onClearLogs}
              className="text-[10px] font-mono text-white/40 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Hapus Log
            </button>
          )}
          <span className="text-[10px] font-mono text-white/30">
            {logs.length} entri
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      {isOpen && (
        <div className="p-4 max-h-60 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#070b12] border-t border-black">
          {logs.length === 0 ? (
            <p className="text-white/30 italic text-[11px]">
              Belum ada aktivitas serial stream. Hubungkan perangkat atau aktifkan mode simulasi.
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-white/30 text-[10px] shrink-0">[{log.timestamp}]</span>
                <span
                  className={`text-[10px] font-bold px-1 rounded shrink-0 ${
                    log.arah === 'RX'
                      ? 'text-sky-400 bg-sky-500/15'
                      : log.arah === 'TX'
                      ? 'text-amber-400 bg-amber-500/15'
                      : 'text-white/70 bg-white/10'
                  }`}
                >
                  {log.arah}
                </span>
                <span
                  className={`break-all ${
                    log.arah === 'RX'
                      ? 'text-sky-200/90'
                      : log.arah === 'TX'
                      ? 'text-amber-200/90'
                      : 'text-white/60'
                  }`}
                >
                  {log.pesan}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
