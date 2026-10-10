---
description: "Standar integrasi IoT hardware: protokol Web Serial API, payload JSON firmware ESP32, dan pemetaan kartu RFID Aksantara."
globs: ["iot/**/*", "web/src/hooks/use-web-serial*", "web/src/types/hardware*"]
alwaysApply: false
---

# 07 — Hardware Integration: Aksantara Tactile Pad

## 1. Arsitektur Komunikasi IoT (Phygital)
- **Komponen Keras:** Mikrokontroler ESP32 + Modul RFID RC522 (13.56 MHz) + Kartu Akrilik ber-tag RFID.
- **Koneksi:** **Web Serial API** langsung dari browser modern (Chrome / Edge / Opera) melalui kabel USB.
- **Prinsip Utama:**
  - Zero-latency (<15ms per pembacaan).
  - **Zero-dependency pada WiFi panggung:** Demonstrasi aman panggung Grand Final karena tidak memerlukan koneksi internet lokal untuk komunikasi perangkat fisik.

## 2. Kontrak Data Terpusat (Standard JSON Payload)
Agent **DILARANG KERAS** mengimprovisasi struktur data serial antar sesi coding. Gunakan format standar berikut yang dipancarkan oleh firmware ESP32:

### Saat Kartu Ditempelkan:
```json
{
  "event": "CARD_DETECTED",
  "uid": "A1B2C3D4",
  "script": "sunda",
  "char": "ka",
  "type": "consonant",
  "timestamp": 1728590400000
}
```

### Saat Kartu Diangkat:
```json
{
  "event": "CARD_REMOVED",
  "uid": "A1B2C3D4",
  "timestamp": 1728590401500
}
```

### Ping / Heartbeat Firmware:
```json
{
  "event": "DEVICE_READY",
  "device": "Aksantara-Tactile-Pad-v1",
  "baudRate": 115200
}
```

## 3. Web Serial Hook Standards (`useWebSerial`)
- Implementasi pembacaan serial menggunakan `TextDecoderStream` dan split baris baru (`\n`).
- Sediakan fallback mode simulasi (*Mock Hardware Mode*) di Web UI: jika juri atau tester tidak memiliki alat fisik ESP32 yang tercolok, mereka dapat mengklik tombol "Simulasi Kartu" di antarmuka web.

## 4. Keamanan & Penanganan Kesalahan Serial
- Tangani `DOMException: The port is already open` secara elegan.
- Berikan penanganan event `disconnect` saat kabel USB dicabut tanpa peringatan.
- Pastikan *stream lock* dilepaskan (`reader.releaseLock()`) saat hook di-unmount.
