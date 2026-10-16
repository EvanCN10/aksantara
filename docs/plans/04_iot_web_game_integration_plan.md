# Integrasi IoT ke Game Web Aksantara

## Dasar kerja dan batas lingkup

- Dasar terbaru: `origin/main` commit `28ab199`, diambil 16 Oktober 2026. Upstream di-force-push; pengguna memilih mengikuti main terbaru, bukan merge lima commit lama.
- Branch aktif `aiot-main-integration-20261016`; riwayat lama tetap di `AIoT` dan `backup/aiot-before-main-refresh-20261016`. Stash `AIoT provisioning before main refresh 2026-10-16` tetap disimpan. File IoT lokal dipulihkan; konflik tambahan tabel `docs/usage.md` diselesaikan dengan mempertahankan riwayat pengungkapan.
- Aset `web/public/wasm/` lokal yang muncul sebagai untracked pada main terbaru tidak dihapus atau dianggap bagian integrasi IoT.
- Ini rencana implementasi, bukan klaim hardware sudah terhubung ke web. Tidak ada upload firmware game atau akses kartu pada tahap perencanaan.
- Reuse UI `/hardware/koneksi`, `/hardware/game/ramu-mantra`, `/hardware/game/speed-match`; jangan membangun arena kedua atau mengubah classifier/cerita teman.
- Empat kartu nyata sudah WRITE_OK verified=16/16, READ terpisah, dan READ setelah power-cycle: Ka `CBEA7D2F`, Ga `A457E003`, Panghulu `843DE203`, Panyuku `55F60E0A`. Identitas game berasal dari ID blok4, bukan hardcode UID fisik.
- Firmware aktif perangkat masih card_writer. Konfigurasi terbukti: SPI global 1 MHz, gain rata-rata; Reader2 terlepas. Dual-reader dan kombinasi fisik belum terbukti.

## Temuan yang menentukan desain

1. `web/src/lib/serial/use-tactile-serial.ts`: parser hanya menangani removal `tag_removed`; `CARD_REMOVED` firmware membawa uid dan jatuh ke cabang placement. Unknown uid diberi default Ka; ini harus dihapus, bukan fallback.
2. Hook tersebut memakai `any`, membuat READY RX sintetis, tidak release reader lock secara eksplisit, tidak menunggu akhir pipe sebelum close, dan tidak menutup port saat route unmount. Koneksi terbuka belum berarti firmware terverifikasi.
3. `web/src/app/(siswa)/hardware/game/[jenis]/page.tsx`: hook serial dibuat ulang per halaman, disconnected otomatis mengaktifkan simulasi. Koneksi console tidak dimiliki bersama. Game mengosongkan slot UI saat pergantian ronde meskipun kartu fisik masih tertempel.
4. `web/src/data/hardware/game-quests.ts`: ronde meminta kartu Lontara/Bali/Ba yang tidak dimiliki empat kartu terprovisioning; permainan hardware tidak dapat diselesaikan dengan deck fisik sekarang.
5. `iot/src/main.cpp` dan sketch `iot/aksantara_tactile_pad/aksantara_tactile_pad.ino`: masih gain maksimum; `iot/platformio.ini` belum menerapkan MFRC522_SPICLOCK=1000000. Kedua firmware harus konsisten dengan pengaturan reader yang berhasil, tanpa mengubah format kartu.
6. Firmware mengingat physicalUid meski read gagal; deteksi UID sama hanya memperbarui lastSeen dan tidak memvalidasi ulang. Read gagal tidak boleh menghasilkan kartu diterima; kebijakan aman demo adalah angkat-tempel untuk transaksi baru, dengan pesan UI eksplisit, bukan retry tulis.
7. Pemeriksaan browser aktual: `/hardware/koneksi` tampil, simulasi Ka+Panghulu menghasilkan Ki; membuka game menghasilkan status Simulated dan slot baru kosong. Ini bukti simulasi saja, bukan sambungan USB. `/hardware` sendiri tidak memiliki halaman console.

## Kontrak dan keputusan

- USB Web Serial 115200, NDJSON; tanpa WiFi, server relay, atau WebSocket. Gunakan Chrome/Edge desktop pada localhost/HTTPS.
- Pertahankan field firmware saat ini: `CARD_DETECTED {slot,uid,rawUid,type,script,label}`; uid adalah ID katalog. `CARD_REMOVED {slot,uid,rawUid}`. Issue: `CARD_REJECTED {slot,rawUid,reason}` dan `CARD_UNASSIGNED {slot,rawUid}`. DEVICE_READY memuat device/chip/version/baudRate. Jangan mensyaratkan char/timestamp yang belum dipancarkan.
- Decoder TypeScript memvalidasi unknown, event union, slot 1/2, ID katalog dan kecocokan type/script. Unicode/fonetik berasal dari preset tepercaya, bukan fallback payload/UID fisik.
- Removal hanya membersihkan kartu yang cocok di slot terkait; event issue tidak memasukkan kartu dan tidak menghasilkan skor. Pergantian kartu selalu removal lama sebelum detected baru.
- Connection state eksplisit: disconnected, connecting, connected, error, simulated. Jangan mengubah kegagalan USB menjadi simulasi diam-diam atau mengarang READY. Boleh connected saat port terbuka dengan metadata firmware 'belum diterima'; tambah STATUS read-only pada firmware agar metadata/state bisa diminta setelah port dibuka, termasuk bila boot banner terlewat. STATUS mengirim DEVICE_READY dan snapshot kartu diterima tanpa operasi RF tambahan; snapshot tidak boleh menggandakan skor.
- Satu client provider di layout `/hardware` memiliki port, loop baca dan state slot. Halaman console/game mengonsumsi provider yang sama; boundary halaman/layout tetap server bila memungkinkan.
- Simulasi hanya lewat tombol eksplisit, terlabel, dan tidak dapat mengubah state sesi USB aktif. Tutup mode sebelumnya sebelum berganti; tidak ada RX sintetis yang disamarkan sebagai paket hardware.
- Target demo fisik: deck Sunda Ka/Ga/Panghulu/Panyuku, Ramu Mantra Ki/Ku/Gi/Gu. Speed Match memakai empat ID yang sama pada slot sesuai jenis. Katalog 16 kartu dan mode simulasi lintas aksara dipertahankan; pilihan deck dinyatakan eksplisit, tidak menghapus konten teman.
- Jangan mengganti Ramu Mantra dua-slot menjadi mode satu reader tanpa persetujuan pengguna. Reader2 harus dihubungkan dan lulus gate sebelum mengklaim game kombinasi fisik selesai.

## Tahap 1 — Kontrak serial dan lifecycle web

Target: `web/src/lib/serial/tactile-serial-types.ts`, `use-tactile-serial.ts`, provider kecil pada layout hardware, serta console/game consumers.

1. Tambahkan event union dan decoder ketat mengikuti katalog existing. Framing menangani chunk terpotong, beberapa baris, CRLF, JSON rusak, serta batas panjang buffer; error tampil di telemetry tanpa crash atau kartu default.
2. Ganti any dengan interface Web Serial minimal atau deklarasi standar. Port hanya dibuka dari user gesture. Batalkan reader, releaseLock dalam finally, tunggu pipe selesai, lalu close; handle cabut USB dan unmount secara deterministik.
3. Pindahkan ownership sesi ke provider; hapus auto-simulation dari game dan READY palsu. Game yang belum tersambung menampilkan connect/simulasi eksplisit dan timer belum berjalan.
4. Pertahankan raw RX asli di telemetry; pisahkan log simulasi. Tampilkan rejected/unassigned dan petunjuk angkat-tempel untuk READ_FAILED.

Gate: stream fixture terfragmentasi menghasilkan slot yang benar; CARD_REMOVED benar-benar mengangkat kartu; unknown tidak berubah menjadi Ka; connect-cancel/disconnect/navigation tidak meninggalkan port lock; simulasi tidak berpura-pura USB.

## Tahap 2 — Firmware game sesuai pengaturan terbukti

Target: kedua entry firmware game, `iot/src/config.h`, `iot/platformio.ini`, dokumentasi command Arduino CLI.

1. Terapkan RxGain_avg dan macro global MFRC522_SPICLOCK=1000000 pada compile library, bukan define sketch lokal. Pertahankan pin dan flags USB yang ada.
2. Terapkan command STATUS read-only untuk metadata dan snapshot diterima, tanpa WUPA/Select/tulis tambahan. Jangan menulis blok kartu pada firmware game.
3. Pertahankan katalog blok4, default key, slot-type guard, removal 300 ms dan cleanup crypto. Gunakan status-returning select agar kegagalan tidak dianggap kehadiran kartu valid.
4. Compile Arduino sketch dengan flag global dan library lokal; periksa verbose bahwa MFRC522.cpp menerima flag. Compile entry PlatformIO bila tool tersedia; jangan menyebut pio lulus jika hanya staging Arduino.

Gate: output NDJSON sesuai decoder, READY/STATUS aktual, tidak ada operasi WRITE. Upload hanya setelah memberi tahu reset; polling RF otomatis memerlukan persetujuan sesi pengujian khusus.

## Tahap 3 — Sambungkan game existing ke input nyata

Target: `game-quests.ts`, halaman game, visualizer/rak kartu dan komponen game terkait.

1. Deck hardware Sunda memilih ID target yang benar-benar dimiliki; Ramu Ki/Ku/Gi/Gu, Speed Match empat kartu tersebut. Mode simulasi boleh memakai deck lebih luas dengan label berbeda.
2. Match berdasarkan ID katalog/script/type, bukan simbol saja. Validasi dua kartu harus berasal dari aksara yang sama.
3. Skor diberikan sekali per ronde; tahan kartu tidak menggandakan skor. State kartu fisik tidak dihapus semata-mata karena ronde berganti. Tunggu removal/re-arm untuk input baru; bersihkan hanya state tantangan. Batalkan timer/delay ketika keluar/restart, pause saat USB putus.
4. Rak virtual hanya aktif di simulated; real mode menampilkan slot/status/error aktual. Reuse gaya console dan kontrol aksesibel, bukan redesign.
5. Audit audio yang sudah ada: efek tap bukan bukti audio pelafalan. Gunakan aset pelafalan nyata jika tersedia; jangan mengklaim audio Ki/Ku/Gi/Gu hanya dari chime atau speech yang belum diuji.

Gate: Ki/Ku/Gi/Gu dapat menyelesaikan deck yang dipilih, kartu salah tidak menang, hold tidak menambah skor, disconnect tidak menyelesaikan ronde, dan navigasi console→game mempertahankan sesi.

## Tahap 4 — Uji perangkat bersama pengguna

Sebelum setiap tindakan fisik beri kabar. Tidak ada penulisan ulang kartu. Untuk firmware game yang polling otomatis, minta izin eksplisit satu sesi READ kontinu dengan durasi/batas berhenti dan skenario jelas; persetujuan READ tunggal writer tidak berlaku sebagai izin polling. Jika izin tidak diberikan, jangan upload/jalankan game otomatis.

1. Cabut USB, sambungkan kembali Reader2 sesuai pin existing, common ground dan 3,3 V; sambungkan USB. Tidak memindah pin Reader1. Periksa register/komunikasi dua reader dahulu.
2. Dengan izin, upload game; reader1 Ka/Ga, reader2 Panghulu/Panyuku. Buktikan tiap slot menerima jenis tepat, wrong-slot ditolak, dan kartu diangkat mengosongkan slot yang benar.
3. Buka `/hardware/koneksi`, klik USB pilih ESP32; hanya browser memiliki COM. Buktikan metadata/telemetry dan slot dari empat kartu fisik tanpa tombol virtual.
4. Lanjut route Ramu dengan sesi sama. Uji Ki, Ku, Gi, Gu; tahan pasangan >5 detik tanpa skor/detect berulang; angkat satu tanpa menghapus yang lain; tukar konsonan tanpa jeda. Uji Speed Match pada deck Sunda.
5. Cabut USB: UI menjadi disconnected, slot dibersihkan, timer pause; reconnect lewat user gesture lalu baca kartu lagi. Keluar/masuk route tidak port-busy. Tidak perlu provisioning ulang.
6. Jika Reader2 menimbulkan gangguan, hentikan pengujian dual-reader dan laporkan bukti; console/Speed Match konsonan Reader1 dapat dibuktikan terpisah tetapi bukan pengganti diam-diam penerimaan Ramu dua-slot.

## Verifikasi akhir dan keluaran

- Jalankan typecheck dan production build web satu kali setelah integrasi, bukan per slice. Tambahkan regression behavior untuk event removal/unknown, parser fragmented stream, round single-score dan disconnect bila sesuai test tooling repo; jangan menambah suite yang hanya mengecek wiring/source text.
- Browser smoke actual surface: koneksi, navigasi, sesi simulasi eksplisit dan sesi USB nyata yang disetujui. MCP Next errors bila tersedia. Fixture/simulasi tidak disebut bukti fisik.
- Simpan UID→ID hasil sebelumnya, packet nyata, konfigurasi dua reader, game rounds dan batas pengujian di TESTING_GUIDE; update README/usage setelah implementasi. Jangan commit model/aset WASM lokal sebagai bagian IoT.
- Selesai berarti empat kartu nyata mengendalikan game web lewat USB dan hasil removal/reconnect benar; bukan sekadar build sukses. Story integration, kartu aksara lain, deployment dan perubahan AI bukan cakupan rencana ini.
