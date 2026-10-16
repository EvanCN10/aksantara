# Panduan Toolchain PlatformIO IDE (ESP32-S3)

Dokumen ini merupakan panduan kompilasi dan manajemen dependensi firmware **Aksantara Tactile Pad** menggunakan **PlatformIO** (VS Code extension / PlatformIO Core CLI).

---

## 1. Keunggulan PlatformIO untuk Aksantara Tactile Pad

- **Reproducibility Tinggi:** Dependensi pustaka (`miguelbalboa/MFRC522@1.4.12`) dan toolchain board didefinisikan secara deklaratif di `platformio.ini`.
- **Automated USB CDC Flags:** Flag `-D ARDUINO_USB_CDC_ON_BOOT=1` disematkan secara otomatis pada saat build tanpa risiko kelalaian pengaturan GUI menu.
- **Isolasi Proyek:** Toolchain terisolasi di dalam direktori proyek, mencegah konflik versi board package global.

---

## 2. Struktur Direktori Proyek PlatformIO

```text
iot/
├── docs/                      # Dokumentasi teknis & perkabelan
│   ├── WIRING_ESP32_S3.md
│   ├── ARDUINO_IDE_SETUP.md
│   └── PLATFORMIO_SETUP.md
├── src/
│   ├── config.h               # Konfigurasi pinout ESP32-S3 & timing
│   └── main.cpp               # Logika firmware dual reader & JSON serial
├── include/                   # Header tambahan (jika ada)
├── lib/AksantaraRfid/          # Katalog dan primitive blok 4 bersama
├── tools/card_writer/          # Provisioning eksplisit, bukan build game
├── platformio.ini             # Konfigurasi build environment PlatformIO
└── README.md                  # Gambaran umum sistem IoT
```

---

## 3. Konfigurasi `platformio.ini` Resmi

Berkas `platformio.ini` yang telah dikonfigurasi untuk ESP32-S3 DevKitC-1:

```ini
[env:esp32-s3-devkitc-1]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
monitor_speed = 115200

# Konfigurasi USB Native CDC untuk Web Serial API
build_flags =
    -D ARDUINO_USB_CDC_ON_BOOT=1
    -D ARDUINO_USB_MODE=1
    -D CORE_DEBUG_LEVEL=0

# Pustaka RFID MFRC522
lib_deps =
    miguelbalboa/MFRC522 @ 1.4.12

# Kecepatan upload SPI & serial monitor filter
upload_speed = 921600
monitor_filters = 
    esp32_exception_decoder
    direct
```

### Penjelasan Build Flags:
- `-D ARDUINO_USB_CDC_ON_BOOT=1`: Memerintahkan firmware ESP32-S3 mengarahkan aliran `Serial` standar langsung ke port USB OTG controller. Tanpa flag ini, data serial tidak akan terbaca oleh Web Serial API browser jika dicolokkan ke port native "USB".
- `-D ARDUINO_USB_MODE=1`: Mengatur antarmuka peripheral USB ke mode CDC (Virtual COM Port).

---

## 4. Alur Kerja via VS Code Extension

1. **Instalasi Ekstensi:** Buka VS Code, cari ekstensi **PlatformIO IDE** (ikon semut oranye), lalu klik **Install**.
2. **Membuka Proyek:**
   - Pilih menu **File** $\rightarrow$ **Open Folder...**
   - Pilih direktori `iot/`.
3. **Kompilasi (Build):**
   - Klik ikon centang (`✓ PlatformIO: Build`) pada status bar bawah, atau tekan shortcut `Ctrl + Alt + B`.
   - PlatformIO akan secara otomatis mengunduh toolchain ESP32-S3 dan pustaka `MFRC522`.
4. **Pengunggahan (Upload):**
   - Hubungkan ESP32-S3 ke PC dengan kabel USB.
   - Klik ikon panah kanan (`→ PlatformIO: Upload`) pada status bar bawah.
5. **Memantau Serial Monitor:**
   - Klik ikon steker kabel (`PlatformIO: Serial Monitor`) untuk melihat aliran payload JSON pada baud rate 115200.
   - **PENTING:** Selalu hentikan / tutup Serial Monitor PlatformIO sebelum menghubungkan konsol fisik ke peramban Web Serial, karena satu port COM fisik hanya dapat dibuka oleh satu aplikasi dalam satu waktu.

---

## 5. Alur Kerja via PlatformIO CLI (Command-Line)

Bagi pengembang yang lebih menyukai terminal atau proses CI/CD:

```bash
# Berpindah ke direktori iot
cd iot

# 1. Kompilasi firmware
pio run

# 2. Upload firmware ke ESP32-S3 (auto-detect COM port)
pio run -t upload

# 3. Spesifik COM port tertentu (opsional, contoh COM5 atau /dev/ttyACM0)
pio run -t upload --upload-port COM5

# 4. Buka Serial Monitor 115200 baud
pio device monitor -b 115200
```

---

## 6. Diagnosis Masalah Umum (Troubleshooting)

| Gejala Masalah | Penyebab Umum | Solusi Tindakan |
| :--- | :--- | :--- |
| `MFRC522.h: No such file or directory` | Library belum terunduh | Jalankan `pio pkg install` di folder `iot` atau pastikan koneksi internet aktif saat kompilasi pertama |
| `Fatal error: Failed to connect to ESP32-S3` | Chip belum masuk bootloader | Tahan tombol BOOT pada board ESP32-S3, tekan tombol RST sekali, lepaskan BOOT, lalu jalankan upload ulang |
| Serial Monitor tidak menampilkan karakter apapun saat di-reset | CDC belum aktif atau port salah | Periksa apakah kabel terhubung ke port Native USB vs COM UART, dan pastikan build flag `-D ARDUINO_USB_CDC_ON_BOOT=1` aktif |
| Pembacaan kartu acak / `PCD_DumpVersionToSerial: 0x00` | Sinyal SPI atau tegangan drop | Cek koneksi pin SCK, MOSI, MISO (GPIO 12, 11, 13) dan pasang kapasitor decoupling 100nF antara 3.3V dan GND modul RC522 |
