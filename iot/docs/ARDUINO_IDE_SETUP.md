# Panduan Kompilasi & Pengunggahan Firmware Arduino IDE (ESP32-S3)

Panduan ini menjelaskan langkah demi langkah untuk mengompilasi dan mengunggah (*flashing*) firmware **Aksantara Tactile Pad** menggunakan **Arduino IDE 2.x** ke mikrokontroler **ESP32-S3**.

---

## 1. Prasyarat Software & Driver

1. **Arduino IDE 2.x**: Unduh versi resmi terbaru (v2.2+ direkomendasikan) dari situs [arduino.cc](https://www.arduino.cc/en/software).
2. **Driver USB Controller**:
   - Jika menggunakan port **COM / UART** (dengan chip bridge CH340 atau CP2102/CP2104), pastikan driver terkait telah terpasang pada sistem operasi.
   - Jika menggunakan port **USB Native (OTG)** pada ESP32-S3, Windows 10/11, macOS, dan Linux modern sudah mengenali *USB CDC Serial* secara langsung tanpa driver tambahan.

---

## 2. Instalasi ESP32 Board Package (Espressif Systems)

1. Buka Arduino IDE.
2. Buka menu **File** $\rightarrow$ **Preferences...** (atau tekan `Ctrl + ,`).
3. Pada kolom **Additional boards manager URLs**, tambahkan URL paket resmi Espressif:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
   *(Jika sudah ada URL board lain, pisahkan dengan tanda koma atau enter).*
4. Klik **OK**.
5. Buka menu **Tools** $\rightarrow$ **Board** $\rightarrow$ **Boards Manager...** (ikon chip di panel kiri).
6. Ketik `esp32` pada kotak pencarian.
7. Cari paket **esp32 by Espressif Systems** dan klik **Install** (pilih versi 2.0.14 atau 3.0.x ke atas). Tunggu hingga pengunduhan dan instalasi toolchain Xtensa selesai.

---

## 3. Instalasi Library RFID (MFRC522)

Firmware Aksantara Tactile Pad memerlukan pustaka standar komunikasi RC522:
1. Buka menu **Sketch** $\rightarrow$ **Include Library** $\rightarrow$ **Manage Libraries...** (atau tekan `Ctrl + Shift + I`).
2. Ketik `MFRC522` pada kotak pencarian.
3. Cari pustaka **MFRC522 by GithubCommunity / Miguel Balboa** versi **1.4.12** (1.4.11 gagal pada core 3.3.12; riwayat di TESTING_GUIDE).
4. Klik **Install**.
5. Salin folder utuh `iot/lib/AksantaraRfid` ke `<sketchbook>/libraries/AksantaraRfid`, lalu restart IDE. Game dan `tools/card_writer` menggunakan library lokal yang sama; jangan menggandakan header per sketch.
6. Provisioning empat kartu dilakukan terpisah melalui `tools/card_writer`; ikuti [TESTING_GUIDE.md](TESTING_GUIDE.md). Firmware game hanya membaca identitas blok 4, bukan pemetaan UID pabrik.

---

## 4. Konfigurasi Menu Tools (ESP32-S3 Specific Settings)

Ini adalah tahapan paling krusial untuk silikon ESP32-S3. Konfigurasikan menu **Tools** persis seperti tabel berikut:

| Parameter Menu Tools | Nilai Pengaturan | Keterangan / Alasan Teknis |
| :--- | :--- | :--- |
| **Board** | **ESP32S3 Dev Module** | Core target resmi untuk seluruh varian ESP32-S3 |
| **USB CDC On Boot** | **Enabled** | **WAJIB DIAKTIFKAN.** Mengarahkan `Serial.print()` ke port USB Native CDC agar terbaca di Web Serial browser |
| **Upload Mode** | **UART0 / Hardware CDC** | Mendukung pengunggahan via UART maupun port USB CDC |
| **USB DFU On Boot** | Disabled | Default |
| **CPU Frequency** | 240MHz (WiFi) | Frekuensi clock prosesor standar |
| **Flash Mode** | QIO 80MHz | Kecepatan akses Quad SPI flash |
| **Flash Size** | **8MB (64Mb)** | Sesuaikan dengan kapasitas flash board (umumnya 8MB atau 16MB) |
| **Partition Scheme** | **Default 4MB with spiffs** | Partisi standar dengan alokasi SPIFFS |
| **Core Debug Level** | None (atau Info saat uji) | Level verbositas log sistem |
| **Port** | Pilih COM port terdeteksi | Contoh: `COM5` (Windows) atau `/dev/ttyUSB0` / `/dev/ttyACM0` (Linux) |

---

## 5. Membuka & Mengunggah Sketch Firmware

1. Buka berkas sketch standalone yang telah disediakan pada repositori:
   ```text
   iot/aksantara_tactile_pad/aksantara_tactile_pad.ino
   ```
2. Hubungkan kabel USB dari laptop ke board ESP32-S3.
3. Pastikan port COM yang benar telah dipilih pada **Tools** $\rightarrow$ **Port**.
4. Klik tombol **Verify** (ikon centang) untuk memastikan kode berhasil dikompilasi tanpa galat.
5. Klik tombol **Upload** (ikon panah kanan) untuk memulai proses flashing firmware.

### Penanganan Jika Proses Flashing Mengalami Timeout / "A fatal error occurred: Failed to connect"
Jika terminal pengunggahan berhenti pada pesan `Connecting........_____.....`:
1. Tekan dan tahan tombol **BOOT** (atau **GPIO 0**) pada board ESP32-S3.
2. Tekan tombol **RST / EN** sekali secara singkat.
3. Lepaskan tombol **BOOT**.
4. Arduino IDE akan langsung mendeteksi mode bootloader ROM dan melanjutkan penulisan flash.

---

## 6. Verifikasi & Uji Serial Monitor

1. Buka Serial Monitor di Arduino IDE (**Tools** $\rightarrow$ **Serial Monitor** atau `Ctrl + Shift + M`).
2. Pastikan baud rate pada pojok kanan bawah diatur ke **115200 baud**.
3. Tekan tombol **RST** pada ESP32-S3. Anda akan melihat payload JSON inisialisasi:
   ```json
   {"event":"DEVICE_READY","device":"Aksantara-Tactile-Pad-v1","chip":"ESP32-S3","baudRate":115200}
   ```
4. Dekatkan kartu RFID ke **Reader 1 (Slot Konsonan)**:
   ```json
   {"event":"CARD_DETECTED","slot":1,"uid":"SD-KA-01","rawUid":"83D54BA1","type":"consonant"}
   ```
5. Dekatkan kartu RFID ke **Reader 2 (Slot Diakritik)**:
   ```json
   {"event":"CARD_DETECTED","slot":2,"uid":"SD-PANGHULU-05","rawUid":"A2F13C89","type":"diacritic"}
   ```
6. Angkat kartu dari slot:
   ```json
   {"event":"CARD_REMOVED","slot":1,"uid":"SD-KA-01"}
   ```

Setelah verifikasi Serial Monitor berhasil, tutup Serial Monitor Arduino IDE agar port serial tidak terkunci, lalu buka browser untuk menghubungkan konsol fisik ke antarmuka web Aksantara via **Web Serial API**.
