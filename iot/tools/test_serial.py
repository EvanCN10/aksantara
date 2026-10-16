#!/usr/bin/env python3
"""
Aksantara Tactile Pad - Terminal Serial Monitor & Diagnostic Tester
===================================================================
Skrip pengujian terminal mandiri untuk memverifikasi komunikasi serial
ESP32-S3 Dual RC522 tanpa perlu membuka peramban web.

Dapat berjalan dalam 2 mode:
1. Mode Hardware Nyata: Membaca port COM/USB pada 115200 baud.
2. Mode Mock Simulators: Menyimulasikan aliran event JSON jika hardware belum terhubung.

Penggunaan:
    python iot/tools/test_serial.py              # Auto-detect port serial
    python iot/tools/test_serial.py COM5         # Spesifik port COM tertentu
    python iot/tools/test_serial.py --mock       # Jalankan simulator tanpa hardware fisik
"""

import sys
import time
import json
import argparse
from typing import Optional, Dict, Any

# Kamus Pemetaan Suku Kata (Ramu Mantra Engine Terminal Preview)
SUNDA_CONSONANTS = {
    "SD-KA-01": ("ᮊ", "Ka"),
    "SD-GA-02": ("ᮌ", "Ga"),
    "SD-TA-03": ("ᮒ", "Ta"),
    "SD-BA-04": ("ᮘ", "Ba"),
}

SUNDA_DIACRITICS = {
    "SD-PANGHULU-05": ("ᮤ", "i"),
    "SD-PANYUKU-06": ("ᮥ", "u"),
}

LONTARA_CONSONANTS = {
    "LT-KA-07": ("ᨀ", "Ka"),
    "LT-GA-08": ("ᨁ", "Ga"),
    "LT-TA-09": ("ᨈ", "Ta"),
}

LONTARA_DIACRITICS = {
    "LT-TETTA-10": ("ᨗ", "i"),
    "LT-TUKKI-11": ("ᨘ", "u"),
}

BALI_CONSONANTS = {
    "BL-KA-12": ("ᬓ", "Ka"),
    "BL-GA-13": ("ᬕ", "Ga"),
    "BL-TA-14": ("ᬢ", "Ta"),
}

BALI_DIACRITICS = {
    "BL-ULU-15": ("ᬶ", "i"),
    "BL-SUKU-16": ("ᬸ", "u"),
}

class TactilePadInspector:
    def __init__(self):
        self.slot1_card: Optional[Dict[str, Any]] = None
        self.slot2_card: Optional[Dict[str, Any]] = None

    def render_state(self):
        print("\n" + "="*65)
        print(" [STATUS AKSANTARA TACTILE PAD]")
        print("="*65)

        s1_str = "KOSONG"
        if self.slot1_card:
            uid = self.slot1_card.get("uid", "-")
            label = self.slot1_card.get("label", "-")
            raw = self.slot1_card.get("rawUid", "-")
            s1_str = f"[{label}] (UID: {uid} | Raw: {raw})"

        s2_str = "KOSONG"
        if self.slot2_card:
            uid = self.slot2_card.get("uid", "-")
            label = self.slot2_card.get("label", "-")
            raw = self.slot2_card.get("rawUid", "-")
            s2_str = f"[{label}] (UID: {uid} | Raw: {raw})"

        print(f" Slot 1 (Konsonan Dasar)  : {s1_str}")
        print(f" Slot 2 (Tanda Diakritik) : {s2_str}")
        print("-" * 65)

        # Evaluasi Ramu Mantra
        self.evaluate_ramu_mantra()
        print("=" * 65 + "\n")

    def evaluate_ramu_mantra(self):
        if not self.slot1_card:
            print(" Hasil Ramu Mantra        : (Menunggu konsonan pada Slot 1)")
            return

        s1_uid = self.slot1_card.get("uid", "")
        s2_uid = self.slot2_card.get("uid", "") if self.slot2_card else None

        # Cek Sunda
        if s1_uid in SUNDA_CONSONANTS:
            c_char, c_latin = SUNDA_CONSONANTS[s1_uid]
            if not s2_uid or s2_uid not in SUNDA_DIACRITICS:
                print(f" Hasil Ramu Mantra (Sunda): {c_char} ({c_latin})")
            else:
                d_char, d_latin = SUNDA_DIACRITICS[s2_uid]
                combined_glyph = f"{c_char}{d_char}"
                combined_latin = f"{c_latin[:-1]}{d_latin.upper()}"
                print(f" Hasil Ramu Mantra (Sunda): {combined_glyph} [{combined_latin}]")
                print(f" Fonetik                  : /{combined_latin.lower()}/ (Konsonan '{c_latin}' + Vokal '{d_latin}')")
            return

        # Cek Lontara
        if s1_uid in LONTARA_CONSONANTS:
            c_char, c_latin = LONTARA_CONSONANTS[s1_uid]
            if not s2_uid or s2_uid not in LONTARA_DIACRITICS:
                print(f" Hasil Ramu Mantra (Lontara): {c_char} ({c_latin})")
            else:
                d_char, d_latin = LONTARA_DIACRITICS[s2_uid]
                combined_glyph = f"{c_char}{d_char}"
                combined_latin = f"{c_latin[:-1]}{d_latin.upper()}"
                print(f" Hasil Ramu Mantra (Lontara): {combined_glyph} [{combined_latin}]")
                print(f" Fonetik                    : /{combined_latin.lower()}/")
            return

        # Cek Bali
        if s1_uid in BALI_CONSONANTS:
            c_char, c_latin = BALI_CONSONANTS[s1_uid]
            if not s2_uid or s2_uid not in BALI_DIACRITICS:
                print(f" Hasil Ramu Mantra (Bali)  : {c_char} ({c_latin})")
            else:
                d_char, d_latin = BALI_DIACRITICS[s2_uid]
                combined_glyph = f"{c_char}{d_char}"
                combined_latin = f"{c_latin[:-1]}{d_latin.upper()}"
                print(f" Hasil Ramu Mantra (Bali)  : {combined_glyph} [{combined_latin}]")
                print(f" Fonetik                   : /{combined_latin.lower()}/")
            return

        # Fallback kartu umum
        label1 = self.slot1_card.get("label", "Konsonan")
        label2 = self.slot2_card.get("label", "") if self.slot2_card else ""
        print(f" Hasil Ramu Mantra        : {label1} + {label2}")

    def handle_line(self, line: str):
        line = line.strip()
        if not line:
            return

        # Upayakan parse format JSON resmi
        try:
            data = json.loads(line)
            event = data.get("event")

            if event == "DEVICE_READY":
                print(f"\n[DEVICE READY] {data.get('device')} ({data.get('chip')}) | Firmware v{data.get('version')} @ {data.get('baudRate')} baud")
                return

            if event in ("CARD_UNASSIGNED", "CARD_REJECTED"):
                print(
                    f">> [{event}] Slot {data.get('slot')} "
                    f"Raw: {data.get('rawUid')} "
                    f"Reason: {data.get('reason', 'UNASSIGNED')}"
                )
                return

            if event == "CARD_DETECTED":
                slot = data.get("slot")
                if slot == 1:
                    self.slot1_card = data
                elif slot == 2:
                    self.slot2_card = data
                print(f">> [DETEKSI] Slot {slot} -> Kartu: {data.get('label', data.get('uid'))} (Raw: {data.get('rawUid')})")
                self.render_state()
                return

            if event == "CARD_REMOVED":
                slot = data.get("slot")
                if slot == 1:
                    self.slot1_card = None
                elif slot == 2:
                    self.slot2_card = None
                print(f"<< [LEPAS] Slot {slot} kartu diangkat.")
                self.render_state()
                return

        except json.JSONDecodeError:
            # Output teks non-JSON (misal pesan debug UART)
            print(f"[RAW SERIAL] {line}")


def run_mock_interactive():
    print("=" * 65)
    print(" AKSANTARA TACTILE PAD - MOCK INTERACTIVE SIMULATOR")
    print("=" * 65)
    print("Petunjuk Uji Coba:")
    print("  Ketik '1 SD-KA-01'        -> Simulasikan letak kartu Ka di Slot 1")
    print("  Ketik '2 SD-PANGHULU-05'  -> Simulasikan letak kartu Panghulu di Slot 2")
    print("  Ketik 'rm 1'              -> Angkat kartu dari Slot 1")
    print("  Ketik 'rm 2'              -> Angkat kartu dari Slot 2")
    print("  Ketik 'scan <hex>'        -> Uji deteksi UID kartu fisik acak")
    print("  Ketik 'exit' atau 'quit'  -> Keluar")
    print("=" * 65)

    inspector = TactilePadInspector()
    # Pancarkan handshake awal
    inspector.handle_line(json.dumps({
        "event": "DEVICE_READY",
        "device": "Aksantara-Tactile-Pad-Mock",
        "chip": "ESP32-S3-Virtual",
        "version": "2.4.0",
        "baudRate": 115200
    }))

    while True:
        try:
            cmd = input("TactilePad> ").strip()
            if not cmd:
                continue
            if cmd.lower() in ("exit", "quit"):
                break

            parts = cmd.split()
            if parts[0] == "1" and len(parts) >= 2:
                card_id = parts[1].upper()
                c_data = SUNDA_CONSONANTS.get(card_id) or LONTARA_CONSONANTS.get(card_id) or BALI_CONSONANTS.get(card_id)
                label = c_data[1] if c_data else card_id
                inspector.handle_line(json.dumps({
                    "event": "CARD_DETECTED",
                    "slot": 1,
                    "uid": card_id,
                    "rawUid": f"SIM_{card_id[-4:]}",
                    "type": "consonant",
                    "label": label
                }))
            elif parts[0] == "2" and len(parts) >= 2:
                card_id = parts[1].upper()
                d_data = SUNDA_DIACRITICS.get(card_id) or LONTARA_DIACRITICS.get(card_id) or BALI_DIACRITICS.get(card_id)
                label = d_data[1] if d_data else card_id
                inspector.handle_line(json.dumps({
                    "event": "CARD_DETECTED",
                    "slot": 2,
                    "uid": card_id,
                    "rawUid": f"SIM_{card_id[-4:]}",
                    "type": "diacritic",
                    "label": label
                }))
            elif parts[0].lower() == "rm" and len(parts) >= 2:
                slot_num = int(parts[1])
                inspector.handle_line(json.dumps({
                    "event": "CARD_REMOVED",
                    "slot": slot_num,
                    "uid": "REMOVED"
                }))
            elif parts[0].lower() == "scan" and len(parts) >= 2:
                raw_hex = parts[1].upper()
                inspector.handle_line(json.dumps({
                    "event": "CARD_DETECTED",
                    "slot": 1,
                    "uid": raw_hex,
                    "rawUid": raw_hex,
                    "type": "consonant",
                    "label": f"Tag_{raw_hex[:4]}"
                }))
            else:
                print("Perintah tidak dikenal. Coba: '1 SD-KA-01', '2 SD-PANGHULU-05', 'rm 1', 'exit'")
        except (KeyboardInterrupt, EOFError):
            break

    print("\nSimulator ditutup.")


def run_hardware_serial(port_name: Optional[str] = None, baud_rate: int = 115200):
    try:
        import serial  # type: ignore
        import serial.tools.list_ports  # type: ignore
    except ImportError:
        print("[PERINGATAN] Modul 'pyserial' belum terpasang.")
        print("Silakan pasang dengan: pip install pyserial")
        print("Menjalankan Mode Simulator Mock interaktif sebagai gantinya...\n")
        run_mock_interactive()
        return

    # Auto-detect port jika tidak dispesifikasikan
    if not port_name:
        ports = list(serial.tools.list_ports.comports())
        if not ports:
            print("[INFO] Tidak ada port COM / serial yang terdeteksi.")
            print("Pastikan kabel USB ESP32-S3 terhubung dengan kokoh.")
            print("Menjalankan Mode Simulator Mock interaktif...\n")
            run_mock_interactive()
            return

        print("\nPort Serial Terdeteksi:")
        for idx, p in enumerate(ports):
            print(f"  [{idx + 1}] {p.device} - {p.description}")

        if len(ports) == 1:
            port_name = ports[0].device
            print(f"-> Memilih otomatis: {port_name}")
        else:
            try:
                choice = input(f"Pilih nomor port (1-{len(ports)}) [1]: ").strip()
                selected_idx = int(choice) - 1 if choice else 0
                port_name = ports[selected_idx].device
            except (ValueError, IndexError):
                port_name = ports[0].device

    print(f"\nMenghubungkan ke {port_name} pada baud {baud_rate}...")
    try:
        ser = serial.Serial(port_name, baud_rate, timeout=1)
        time.sleep(1.0) # Beri jeda USB DTR reset
        print(f"[TERHUBUNG] Mendengarkan stream JSON dari ESP32-S3. Tekan Ctrl+C untuk berhenti.\n")

        inspector = TactilePadInspector()

        while True:
            if ser.in_waiting > 0:
                raw_line = ser.readline().decode('utf-8', errors='ignore')
                inspector.handle_line(raw_line)
            time.sleep(0.01)

    except serial.SerialException as e:
        print(f"[GALAT SERIAL] Gagal membuka port {port_name}: {e}")
        print("Beralih ke mode simulator...\n")
        run_mock_interactive()
    except KeyboardInterrupt:
        print("\n[SELESAI] Koneksi serial diputuskan.")


def main():
    parser = argparse.ArgumentParser(description="Aksantara Tactile Pad Serial Diagnostic Monitor")
    parser.add_argument("port", nargs="?", default=None, help="Nama port COM/Serial (contoh: COM3, /dev/ttyACM0)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--mock", action="store_true", help="Jalankan mode mock simulator tanpa hardware fisik")

    args = parser.parse_args()

    if args.mock:
        run_mock_interactive()
    else:
        run_hardware_serial(args.port, args.baud)


if __name__ == "__main__":
    main()
