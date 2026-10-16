# Panduan Uji Coba & Eksperimen Mandiri (Testing Guide)

Dokumen ini merupakan panduan praktis langkah demi langkah untuk menguji coba dan mengeksperimenkan perangkat keras **Aksantara Tactile Pad** secara mandiri di komputer Anda sebelum dihubungkan ke antarmuka web.

---

## Alur Pengujian 5 Langkah (Step-by-Step Bring-up)

```
[Tahap 1: Perkabelan]   -->  [Tahap 2: SPI Self-Test]  -->  [Tahap 3: Provisioning]
  wiring_diagram.svg           card_uid_scanner.ino            card_writer.ino
                                       |
                                       v
[Tahap 5: Serial Web]    <--  [Tahap 4: Uji Firmware & Ramu Mantra di Terminal]
  Web Serial API (115200)       python iot/tools/test_serial.py
```

---

## Tahap 1: Pemeriksaan Fisik & Skema Perkabelan

1. Buka diagram visual perkabelan:
   ```text
   iot/docs/wiring_diagram.svg
   ```
2. Pastikan pin SPI terhubung pada controller FSPI ESP32-S3:
   - **SCK** $\rightarrow$ GPIO 12
   - **MOSI** $\rightarrow$ GPIO 11
   - **MISO** $\rightarrow$ GPIO 13
3. Pastikan pin kontrol independen:
   - Reader 1 (Slot Konsonan): **SDA/SS** $\rightarrow$ GPIO 10, **RST** $\rightarrow$ GPIO 9
   - Reader 2 (Slot Diakritik): **SDA/SS** $\rightarrow$ GPIO 14, **RST** $\rightarrow$ GPIO 21
4. **Pemeriksaan Tegangan:** Pastikan VCC kedua modul terhubung ke pin **3.3V** (*BUKAN 5V*).

---

## Tahap 2: Uji Self-Test Bus SPI & Kalibrasi Kartu

Gunakan sketch khusus scanner yang telah kami sediakan untuk memastikan mikrokontroler berhasil berkomunikasi dengan kedua modul RC522:

1. Buka sketch:
   ```text
   iot/tools/card_uid_scanner/card_uid_scanner.ino
   ```
2. Upload ke ESP32-S3 menggunakan Arduino IDE atau Arduino CLI. Jangan menimpa `src/main.cpp` dengan scanner.
3. Buka **Serial Monitor** pada kecepatan **115200 baud**.
4. Periksa log keluaran self-test saat boot:
   - `[SELF-TEST] Reader 1 VersionReg: 0x92 -> OK`
   - `[SELF-TEST] Reader 2 VersionReg: 0x92 -> OK`
   - *Jika muncul `0x00` atau `0xFF`:* Berarti kabel SPI (SCK/MOSI/MISO) atau CS/RST belum terhubung dengan baik atau pin VCC longgar.


### Catatan upload USB nyata (16 Oktober 2026)

Scanner berhasil dikompilasi dan diunggah ke ESP32-S3 revision v0.2 melalui
COM7 (USB Serial/JTAG), dengan Arduino ESP32 core 3.3.12, MFRC522 1.4.12,
dan FQBN `esp32:esp32:esp32s3:CDCOnBoot=cdc,USBMode=hwcdc`.
MFRC522 1.4.11 gagal kompilasi pada core ini karena perbandingan pointer
`backLen > 0` dalam `MFRC522Extended.cpp`; gunakan 1.4.12 untuk konfigurasi ini.

Hash flash diverifikasi esptool dan banner scanner terbaca setelah reset.
Reader 1 mengembalikan `VersionReg=0xB2`, reader 2 `0x82` (keduanya
`Unknown Version`, bukan bukti reader sehat). Belum ada UID terbaca selama
jendela monitor 25 detik. Pembacaan kartu fisik masih perlu diverifikasi.
Tutup monitor lain sebelum membuka COM7 pada 115200 baud.
---

## Tahap 3: Provisioning Empat Kartu (Bukan Mengganti UID)

Gunakan **empat kartu uji MIFARE Classic 1K milik Anda**, bukan kartu transport,
pembayaran, atau akses. Identitas disimpan di **blok data 4 sektor 1**, tepat
16 byte: ID ASCII case-sensitive diikuti padding NUL. UID pabrik tidak diubah.
Key A yang dipakai hanya default `FF FF FF FF FF FF`; blok 0, trailer 7,
key dan access bits tidak pernah ditulis. Auth gagal bukan berarti kartu kosong.

### Compile dan upload dari root repo (PowerShell)

```powershell
$cli = "$env:LOCALAPPDATA\Programs\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe"
$fqbn = "esp32:esp32:esp32s3:CDCOnBoot=cdc,USBMode=hwcdc"
$library = "$PWD/iot/lib/AksantaraRfid"
& $cli compile --fqbn $fqbn --library $library iot/tools/card_writer
& $cli compile --fqbn $fqbn --library $library iot/aksantara_tactile_pad
python -m serial.tools.list_ports -v
# Ganti COM7 dengan port hasil discovery; tutup monitor lain lebih dahulu.
& $cli upload --port COM7 --fqbn $fqbn iot/tools/card_writer
```

Arduino IDE: salin satu folder utuh `iot/lib/AksantaraRfid` ke folder
`libraries` pada sketchbook, lalu restart IDE. Pasang MFRC522 **1.4.12**.
Jangan menggandakan header ke setiap sketch. PlatformIO menemukan library lokal
di `iot/lib` dan mematok MFRC522 1.4.12.

### Terminal penulis

Serial 115200 baud, newline atau CRLF. Penulis hanya memakai **Reader 1**;
Reader 2 ditahan reset. Jauhkan tiga kartu lainnya dari medan antena.

- `HELP`: sintaks dan batas keamanan.
- `LIST`: `SD-KA-01` Ka/consonant, `SD-GA-02` Ga/consonant,
  `SD-PANGHULU-05` Panghulu (i)/diacritic, `SD-PANYUKU-06` Panyuku (u)/diacritic.
- `READ`: arm pembacaan satu kartu, maksimum 30 detik.
- `WRITE <presetId> <expectedRawUid>`: konfirmasi menimpa blok 4 **hanya**
  kartu dengan UID itu; UID hex 8/14/20 karakter. ID harus salah satu empat di atas.
- `CANCEL`: batalkan arm. Command nonkosong baru membatalkan arm sebelumnya,
  termasuk command invalid. Baris kosong diabaikan. Maksimum 96 karakter/baris.

Untuk setiap kartu: `READ`, catat UID dan seluruh `block4`, pilih ID, lalu
`WRITE <ID> <UID hasil READ>` dan tempel/pertahankan kartu yang sama.
Tidak ada assignment berdasarkan urutan tap atau UID contoh.
Sebelum tulis, `BEFORE uid=... block4=...` mencatat 16 byte lama.
Sukses hanya `WRITE_OK uid=... id=... verified=16/16`, setelah baca ulang
seluruh byte cocok. `ALREADY_ASSIGNED` berarti payload sudah identik dan
tidak ada EEPROM write. Setelah satu transaksi, arm dihapus.

`ERROR AUTH_OR_READ` bukan kartu kosong. `ERROR WRITE_OR_VERIFY` berarti
blok mungkin berubah: `READ` ulang; **tidak ada klaim rollback**.
Collision, unsupported PICC, UID mismatch, dan error komunikasi membatalkan arm.
Jangan lanjut menulis jika RF gagal berulang; cabut USB sebelum memeriksa
kabel/daya. Jangan ubah pin berdasarkan tebakan.

### Checklist fisik setelah RF stabil

1. Assign empat ID ke **empat UID berbeda**, baca ulang setiap kartu, pastikan
   UID tetap sama, dan tempel label fisik. Simpan UID → ID hanya dari hasil nyata.
2. Pada Ka, WRITE dengan UID sengaja berbeda harus `ERROR UID_MISMATCH`;
   READ ulang tetap Ka. WRITE Ka dengan UID benar harus `ALREADY_ASSIGNED`.
3. Assign ulang satu kartu secara eksplisit ke Ga, READ, pulihkan ID semula,
   READ lagi. Jangan menimpa kartu pertama untuk memalsukan empat hasil.
4. Cabut/sambungkan USB lalu READ setidaknya satu kartu untuk persistence.
   Reset MCU saja bukan power-cycle. Uji readback failure hanya dicatat bila terjadi.
5. Dengan Reader 1 kosong, uji READ 30 detik → `ERROR TIMEOUT`, dan CANCEL
   tidak meninggalkan transaksi tertunda.

### Bukti aktual sesi provisioning (16 Oktober 2026)

- Core ESP32 3.3.12 / MFRC522 1.4.12; COM7 USB Serial/JTAG ditemukan kembali
  setelah pengguna mengonfirmasi cabut USB, pemeriksaan, dan sambung ulang.
- Smoke sementara tanpa RF di ESP32: `PASS encoding fixtures and strict decoder`.
  Empat encoding dibanding fixture literal independen; decoder menerima fixture
  dan menolak padding salah, prefix ID, dan garbage. Upload hash verified.
- Compile writer, game Arduino, scanner, serta `main.cpp` melalui staging sketch
  Arduino di temp OS berhasil. PlatformIO tidak tersedia; **bukan** bukti `pio run`.
- Writer diunggah (hash verified); HELP/LIST nyata terbaca. Unknown command,
  UID malformed, dan baris 97 karakter ditolak. CANCEL dan pembatalan arm oleh
  command invalid teramati; arm WRITE dinormalisasi/ditampilkan.
- Satu transaksi UID mismatch nyata: `ERROR UID_MISMATCH actualUid=4B553802`.
  Tidak dilakukan WRITE dengan UID cocok. Kartu ini **belum** ditetapkan sebagai Ka.
- Percobaan lain menghasilkan `ERROR SELECT Error in communication.` dan
  `ERROR WAKEUP Error in communication.`. Dua READ saat pengguna menyatakan
  Reader 1 kosong, dan satu READ setelah pemeriksaan/sambung ulang, tetap error
  WAKEUP sebelum deadline. Timeout 30 detik **belum terverifikasi**.
- Game berhasil diunggah/hash verified dan mengirim DEVICE_READY, kemudian
  `{"event":"CARD_UNASSIGNED","slot":1,"rawUid":"843DE203"}`.
  Ini satu bukti baca terautentikasi payload tidak dikenal, bukan bukti write,
  identitas stabil, atau kedua reader sehat. UID `56F6B205` dari sesi baca
  sebelumnya juga tidak di-hardcode atau ditetapkan sebagai ID.
- Inspector terminal: smoke software menunjukkan rejected/unassigned tidak
  mengisi slot; engine existing menghasilkan Ki/Ku/Gi/Gu dari input software.
  Ini **bukan** hasil kombinasi kartu fisik.
- **Belum selesai:** empat UID → ID, WRITE_OK, READ ulang writer, idempotensi,
  reassignment, persistence data, readback-failure, dan seluruh uji dua reader.
  Penyebab RF belum dipastikan. Riwayat VersionReg nonstandar di atas tetap berlaku.
  Firmware terakhir pada perangkat adalah **card_writer**, tanpa arm tertunda.
  Web tidak diubah atau diuji.

### Diagnosis writer terinstrumentasi (16 Oktober 2026)

- `DIAG` tanpa argumen membatalkan arm lalu membaca register saja, tanpa WUPA,
  Select, autentikasi atau akses blok kartu. HELP mencantumkan command ini.
- Output berisi 16 sampel VersionReg berjarak 5 ms dan register konfigurasi.
  Error WAKEUP/SELECT menyertakan `RF_DIAG` sebelum cleanup; label
  `POST_AUTH_OR_READ` / `POST_WRITE_OR_VERIFY` adalah snapshot setelah helper
  kembali, bukan diagnosis pasti sublangkah yang gagal.
- Compile writer berhasil (310534 byte flash, 22552 byte global); upload COM7
  hash verified, banner `AKSANTARA CARD WRITER READY`, HELP/LIST/DIAG dan CANCEL
  teramati. Port ditutup sesudah pemeriksaan, tanpa transaksi kartu.
- Gain tetap maksimum, SPI library belum diubah. VersionReg 16/16 `B2`;
  TxMode/RxMode `00`, ModWidth `26`, TMode `80`, TPrescaler `A9`,
  TReload `03E8`, TxASK `40`, Mode `3D`, RFCfg `74`.
  Sampel stabil dan konfigurasi cocok tidak membuktikan RF sehat.
- Setiap READ/WRITE, termasuk kosong/recovery/pasca-reconnect, harus menunggu
  kesiapan pengguna tersendiri. WRITE mencakup baca lama, tulis blok4, dan
  readback internal; READ verifikasi terpisah perlu kesiapan baru.
  Belum ada WRITE baru atau bukti perbaikan RF pada tahap diagnosis ini.
- READ kosong berizin pada gain maksimum gagal WAKEUP dalam 0,181 detik:
  status `1`, Version `B2`, Error `00`, ComIrq `64`, FIFOLevel `00`,
  Control `10`, Coll `20`, Status2 `01`. CANCEL terkonfirmasi, port ditutup.
- Eksperimen berikut mengubah hanya gain writer ke `RxGain_avg` (33 dB).
  Compile/upload hash verified dan READY lulus; DIAG tetap B2 16/16,
  konfigurasi sama kecuali RFCfg `44`. READ kosong dengan izin baru gagal
  WAKEUP pada 1,603 detik dengan snapshot sama. CANCEL terkonfirmasi dan port
  ditutup. Gain rata-rata belum terbukti memperbaiki RF; langkah berikut
  isolasi seluruh kabel Reader2 saat USB dicabut. Tidak ada WRITE.
- Pengguna mengonfirmasi USB dicabut, seluruh kabel Reader2 dilepas, lalu USB
  disambung kembali tanpa mengubah Reader1. DIAG tetap stabil; READ kosong
  gain rata-rata/SPI 4 MHz masih gagal WAKEUP pada 26,909 detik, snapshot sama.
- Flag existing `compiler.cpp.extra_flags` kosong; guard MFRC522_SPICLOCK
  tersedia. Build verbose membuktikan `-DMFRC522_SPICLOCK=1000000` diterapkan
  pada kompilasi `MFRC522.cpp`, tanpa patch library terpasang.
  Upload/hash, READY, dan DIAG lulus.
- Pada SPI 1 MHz, gain rata-rata, Reader2 terlepas: READ kosong berizin
  menghasilkan `ERROR TIMEOUT` pada 30,020 detik. Tiga READ kartu dengan izin
  terpisah semuanya menghasilkan UID `CBEA7D2F`, `UNASSIGNED`, blok4
  `00000000000000000000000000000000` (masing-masing sekitar 0,012 detik).
  Setiap operasi diakhiri CANCEL terkonfirmasi dan penutupan port.
  Konfigurasi ini lulus gate kosong + tiga baca; belum membuktikan dua reader.

Pertahankan flag global untuk build writer yang telah lulus gate tersebut
(PowerShell, dari root repo; jangan hanya define di sketch):

```powershell
$cli = "$env:LOCALAPPDATA\Programs\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe"
& $cli compile --fqbn "esp32:esp32:esp32s3:CDCOnBoot=cdc,USBMode=hwcdc" --library "$PWD/iot/lib/AksantaraRfid" --build-property "compiler.cpp.extra_flags=-DMFRC522_SPICLOCK=1000000" --verbose iot/tools/card_writer
& $cli upload --port COM7 --fqbn "esp32:esp32:esp32s3:CDCOnBoot=cdc,USBMode=hwcdc" iot/tools/card_writer
```

Temukan ulang port setelah reconnect. Jika ada flag C++ tambahan di lingkungan
lain, gabungkan dengan flag tersebut, jangan menimpanya. Firmware game tidak
diubah pada eksperimen ini.

- READ identifikasi Ka berikutnya gagal pada UID `CBEA7D2F` sebelum WRITE:
  `POST_AUTH_OR_READ status=1`, Version `B2`, Error `01`, ComIrq `16`,
  FIFO `00`, Control `11`, Coll `20`, Status2 `00` (0,011 detik).
  Snapshot setelah helper tidak memastikan sublangkah autentikasi/baca.
  CANCEL terkonfirmasi dan port ditutup. Tiga baca sukses sebelumnya tidak
  membuktikan kestabilan berkelanjutan; provisioning dihentikan sebelum WRITE.
  Langkah fisik berikut: jumper Reader1 pendek/pengganti, common ground,
  suplai 3,3 V; seluruh perubahan kabel dilakukan saat USB dicabut.
- Pengguna mengonfirmasi jumper Reader1 diganti dan sambungan diperiksa saat
  USB dicabut; COM7 ditemukan kembali. DIAG B2 16/16 dan konfigurasi tetap
  sesuai. READ kosong berizin lulus TIMEOUT 30,020 detik.
- Pengguna meminta melewati tiga READ ulang agar lebih cepat; pengulangan
  tersebut dilewati, bukan dinyatakan lulus. READ identifikasi Ka tunggal
  berikutnya gagal SELECT pada 0,005 detik: status `1`, Version `B2`,
  Error `01`, ComIrq `66`, FIFO `01`, Control `12`, Coll `20`, Status2 `01`.
  CANCEL terkonfirmasi, port ditutup, tidak ada WRITE yang dikirim.
- **Status sementara sebelum kelanjutan:** provisioning dihentikan setelah
  error SELECT; modul pengganti/pengukuran fisik sempat disarankan, tetapi
  komponen rusak tertentu tidak dipastikan. Hasil kelanjutan di bawah
  menggantikan status terblokir tersebut, tanpa menghapus riwayat error.

### Hasil akhir WRITE/READ empat kartu (16 Oktober 2026)

Atas permintaan pengguna, dilanjutkan satu READ identifikasi berizin tanpa
mengulang tiga uji. READ berhasil; tidak ada perubahan firmware atau modul
tambahan sebelum provisioning. Konfigurasi tetap SPI 1 MHz, gain rata-rata,
Reader2 terlepas, dan jumper yang sebelumnya diganti pengguna.

| UID nyata | ID tersimpan | Blok4 hex (16 byte) | WRITE | READ terpisah | READ setelah cabut/sambung USB |
|---|---|---|---|---|---|
| CBEA7D2F | SD-KA-01 | 53442D4B412D30310000000000000000 | WRITE_OK verified=16/16 | Cocok | Cocok |
| A457E003 | SD-GA-02 | 53442D47412D30320000000000000000 | WRITE_OK verified=16/16 | Cocok | Cocok |
| 843DE203 | SD-PANGHULU-05 | 53442D50414E4748554C552D30350000 | WRITE_OK verified=16/16 | Cocok | Cocok |
| 55F60E0A | SD-PANYUKU-06 | 53442D50414E59554B552D3036000000 | WRITE_OK verified=16/16 | Cocok | Cocok |

- Empat UID berbeda; masing-masing READ identifikasi menunjukkan UNASSIGNED
  dengan 16 byte nol. Setiap WRITE dikirim tepat sekali setelah izin terpisah.
- Seluruh READ verifikasi cocok UID, ID, dan byte ASCII zero-padding katalog.
  Pengguna mengonfirmasi cabut/sambung USB; COM7 ditemukan ulang sebelum
  empat READ persistence, masing-masing dengan kesiapan tersendiri.
- Seluruh transaksi diakhiri CANCEL terkonfirmasi dan port ditutup. Firmware
  terakhir tetap writer, tanpa arm tertunda. Tidak ada uji game/dua reader.
- Riwayat kegagalan intermiten tetap berlaku: hasil akhir membuktikan keempat
  WRITE dan persistence nyata, bukan jaminan stabilitas RF jangka panjang
  atau kepastian akar penyebab. Tidak diperlukan penggantian modul dalam
  kelanjutan yang berhasil ini.

---

## Tahap 4: Mengunggah Firmware Penuh Aksantara

1. Buka firmware utama:
   - **Arduino IDE:** `iot/aksantara_tactile_pad/aksantara_tactile_pad.ino`
   - **PlatformIO:** `iot/src/main.cpp`
2. Lakukan flashing ke board ESP32-S3.
3. Firmware kini siap memancarkan JSON streaming pada baud rate 115200.

Kartu valid dibaca dari blok 4 lewat katalog bersama (16 ID); tidak ada fallback
kamus UID. Konsonan hanya Slot 1 dan diakritik hanya Slot 2. Terminal menampilkan
`CARD_UNASSIGNED` dan `CARD_REJECTED` (WRONG_SLOT / UNSUPPORTED_CARD / READ_FAILED)
tanpa mengisi slot game. Poll memakai WUPA 25 ms; removal setelah 300 ms tidak
ada UID sukses. Setelah provisioning berhasil, uji fisik Ki/Ku/Gi/Gu, tahan
dua kartu >5 detik tanpa detect/remove berulang, angkat satu tanpa menghapus
slot lainnya, tukar konsonan tanpa jeda (removed lama sebelum detected baru),
taruh diakritik di Slot 1 (WRONG_SLOT), dan boot dengan kartu tetap terpasang.
Semua checklist ini masih menunggu RF stabil dan empat kartu terprovisioning.

---

## Tahap 5: Pengujian Terminal Interaktif (Tanpa Browser)

Kami menyediakan skrip monitor terminal Python untuk memantau status slot dan melihat hasil kalkulasi suku kata (*Ramu Mantra*) secara instan di terminal Anda:

### A. Jika Hardware ESP32-S3 Sudah Terhubung via USB:
```bash
# Otomatis mendeteksi port COM dan membaca aliran JSON
python iot/tools/test_serial.py
```
Saat Anda menaruh kartu di Slot 1 dan Slot 2, terminal akan menampilkan visualisasi state:
```text
=================================================================
 [STATUS AKSANTARA TACTILE PAD]
=================================================================
 Slot 1 (Konsonan Dasar)  : [Ka] (UID: SD-KA-01 | Raw: A1B1C101)
 Slot 2 (Tanda Diakritik) : [Panghulu (i)] (UID: SD-PANGHULU-05 | Raw: A1B1C105)
-----------------------------------------------------------------
 Hasil Ramu Mantra (Sunda): ᮊᮤ [KI]
 Fonetik                  : /ki/ (Konsonan 'Ka' + Vokal 'i')
=================================================================
```

### B. Mode Mock Simulator (Jika Hardware Belum Dirakit / Sedang Tidak Tercolok):
Anda dapat menguji logika konsol fisik menggunakan simulator interaktif:
```bash
python iot/tools/test_serial.py --mock
```
Perintah yang dapat Anda ketikkan:
- `1 SD-KA-01`: Menyimulasikan meletakkan konsonan Sunda *Ka* di Slot 1.
- `2 SD-PANGHULU-05`: Menyimulasikan meletakkan tanda vokal *Panghulu (i)* di Slot 2.
- `rm 1`: Menyimulasikan mengangkat kartu dari Slot 1.
- `rm 2`: Menyimulasikan mengangkat kartu dari Slot 2.
- `exit`: Keluar dari simulator.
