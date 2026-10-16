# Aksantara Tactile Pad — Hardware & IoT (Phygital Kinesthetic Console)

Direktori ini memuat seluruh kode sumber firmware mikrokontroler, skema perkabelan sirkuit (*wiring*), panduan toolchain, serta dokumentasi integrasi perangkat keras **Aksantara Tactile Pad** berbasis **ESP32-S3** dan **Dual RC522 RFID Reader (13.56 MHz)**.

---

## 1. Latar Belakang & Filosofi "Phygital"

Pembelajaran aksara daerah (*Lontara, Sunda, Bali*) sering kali terbentur pada fenomena *screen fatigue* pada anak usia sekolah dasar serta sifat ortografi abugida yang rumit (penggabungan konsonan dasar dengan tanda vokalisasi/sandhangan).

**Aksantara Tactile Pad** menjembatani dunia fisik dan digital (*Phygital*):
- **Sentuhan Kinestetik Nyata:** Siswa memegang kartu fisik akrilik bertekstur, merasakan bentuk glif aksara asli, dan menaruhnya pada slot konsonan (Slot 1) dan slot diakritik (Slot 2).
- **Meramu Mantra Secara Fisik:** Menaruh konsonan Sunda *Ka* [ᮊ] di Slot 1 dan tanda vokal *Panghulu (i)* [ᮤ] di Slot 2 menghasilkan suku kata gabungan *Ki* [ᮊᮤ] secara seketika pada antarmuka web.
- **Bebas Ketergantungan WiFi (Zero WiFi Dependency):** Komunikasi data dialirkan melalui kabel USB langsung menggunakan **Web Serial API** pada baud rate 115200. Perangkat tidak memerlukan pairing Bluetooth, server lokal, atau koneksi internet WiFi panggung yang rentan putus saat demonstrasi.

---

## 2. Bill of Materials (BOM) & Kelayakan Skala Sekolah

Total Cost of Goods Sold (COGS) perangkat ini dirancang sangat hemat biaya agar terjangkau oleh dana BOS (Bantuan Operasional Sekolah) maupun platform SIPLah:

| Komponen Hardware | Estimasi Biaya Satuan | Deskripsi Spesifikasi |
| :--- | :--- | :--- |
| **ESP32-S3 DevKitC-1** | Rp65.000 | Dual-core Xtensa 240MHz, 8MB Flash, USB Native CDC OTG |
| **2x RFID RC522 Module** | Rp30.000 (2 × Rp15.000) | Frekuensi 13.56 MHz SPI, kompatibel Mifare Classic 1K / NTAG213 |
| **Set Kartu RFID (30 Tag)** | Rp25.000 | White PVC / Acrylic RFID Cards (ISO 14443A) |
| **Kabel Jumper & Resistor** | Rp3.000 | DuPont wires Female-to-Female 15cm |
| **Kapasitor Decoupling (2x 100nF)**| Rp1.000 | Peredam voltage ripple 3.3V power rail |
| **Enclosure Kayu / Akrilik Mini** | Rp4.000 | Rangka dudukan tactile slot dual-pocket |
| **TOTAL BIAYA PRODUKSI (COGS)** | **~Rp128.000** | **Sangat terjangkau untuk skala lab komputer SD/SMP** |

---

## 3. Arsitektur Komunikasi Web Serial API

```
+-----------------------------------------------------------------------------------+
|                            KOMPUTER / LAPTOP GURU                                 |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                  Peramban Web (Google Chrome / Edge / Opera)              |   |
|   |                                                                           |   |
|   |   +--------------------------+          +-----------------------------+   |   |
|   |   |  Aksantara Web Client    |          |   Web Serial API Controller |   |   |
|   |   |  (Next.js 16 / React 19) | <=====>  |  useTactileSerial hook      |   |   |
|   |   |  - Ramu Mantra Engine    |  Event   |  - TextDecoderStream        |   |   |
|   |   |  - Telemetry Live Feed   |  JSON    |  - Auto-reconnect & lock    |   |   |
|   |   +--------------------------+          +--------------^--------------+   |   |
|   +--------------------------------------------------------|------------------+   |
+------------------------------------------------------------|----------------------+
                                                             | Kabel USB (115200 Baud)
+------------------------------------------------------------|----------------------+
|                     KONSOL FISIK AKSANTARA TACTILE PAD     |                      |
|                                                            v                      |
|                 +---------------------------------------------------+             |
|                 |    ESP32-S3 Microcontroller (USB Native CDC)      |             |
|                 |    - Shared Hardware SPI Bus (GPIO 11, 12, 13)    |             |
|                 |    - Debounce state machine (150ms / 300ms)       |             |
|                 |    - Non-blocking loop scheduler (20ms polling)   |             |
|                 +--------------------+------------------------------+             |
|                                      |                                            |
|                 +--------------------+--------------------+                       |
|                 |                                         |                       |
|   +-------------v-------------+             +-------------v-------------+         |
|   |    RC522 RFID READER 1    |             |    RC522 RFID READER 2    |         |
|   |      [SLOT KONSONAN]      |             |     [SLOT DIAKRITIK]      |         |
|   | SS: GPIO 10, RST: GPIO 9  |             | SS: GPIO 14, RST: GPIO 21 |         |
|   +---------------------------+             +---------------------------+         |
+-----------------------------------------------------------------------------------+
```

---

## 4. Struktur Direktori

- `docs/WIRING_ESP32_S3.md`: Skema perkabelan lengkap, tabel pin-to-pin, larangan GPIO Flash/PSRAM, dan penanganan decoupling.
- `docs/wiring_diagram.svg`: **Diagram visual perkabelan resolusi tinggi** (ESP32-S3 ke Dual MFRC522 pin-to-pin).
- `docs/ARDUINO_IDE_SETUP.md`: Panduan instalasi board esp32, library MFRC522, dan pengaturan menu Tools Arduino IDE 2.x.
- `docs/PLATFORMIO_SETUP.md`: Panduan kompilasi otomatis berbasis PlatformIO CLI & VS Code extension.
- `src/config.h`: Konfigurasi pin GPIO, polling 25 ms, absence timeout 300 ms, metadata dan baud rate 115200.
- `src/main.cpp`: Implementasi firmware C++ PlatformIO lengkap dengan dual-reader scanner dan output JSON streaming.
- `aksantara_tactile_pad/aksantara_tactile_pad.ino`: Versi sketch mandiri siap kompilasi untuk pengguna Arduino IDE.
- `platformio.ini`: Konfigurasi resmi target board `esp32-s3-devkitc-1`.
- `lib/AksantaraRfid`: Katalog 16 identitas ASCII/padding NUL di blok 4 MIFARE Classic 1K, baca key A default dan primitive tulis terverifikasi bersama.
- `tools/card_writer/card_writer.ino`: Penulis terpisah Reader 1; READ lalu WRITE dengan preset dan UID eksplisit. Game tidak menulis atau mengandalkan kamus UID. Prosedur dan status uji nyata: [TESTING_GUIDE](docs/TESTING_GUIDE.md).

---

## 5. Kontrak Payload JSON Web Serial

Firmware memancarkan pesan baris baru (*newline-delimited JSON*) sesuai standar Aksantara:

### Handshake Saat Perangkat Menyala (Bootup):
```json
{"event":"DEVICE_READY","device":"Aksantara-Tactile-Pad-v1","chip":"ESP32-S3","baudRate":115200}
```

### Kartu Ditempelkan ke Slot:
```json
{"event":"CARD_DETECTED","slot":1,"uid":"SD-KA-01","rawUid":"83D54BA1","type":"consonant"}
```

### Kartu Diangkat dari Slot:
```json
{"event":"CARD_REMOVED","slot":1,"uid":"SD-KA-01"}
```

---

## 6. Mode Cadangan Simulasi (Mock Hardware Mode)

Jika demonstrasi dilakukan di perangkat tanpa port USB fisik (misal iPad/tablet juri) atau jika perangkat keras tidak dibawa, aplikasi web menyediakan tombol **"Mode Simulasi Virtual"** di antarmuka `/hardware/koneksi`. Seluruh logika kalkulasi suku kata (*Ramu Mantra*) dan *Speed Match* tetap dapat diuji 100% menggunakan kartu virtual interaktif.
