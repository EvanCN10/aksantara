#ifndef AKSANTARA_CONFIG_H
#define AKSANTARA_CONFIG_H

#include <Arduino.h>

// ============================================================================
// AKSANTARA TACTILE PAD - HARDWARE CONFIGURATION
// Target MCU : ESP32-S3 (Espressif Systems)
// Dual Reader: MFRC522 (13.56 MHz RFID SPI)
// Web Serial : 115200 Baud (Newline-delimited JSON)
// ============================================================================

// --- Perangkat & Metadata Firmware ---
#define DEVICE_NAME         "Aksantara-Tactile-Pad-v1"
#define DEVICE_CHIP         "ESP32-S3"
#define FIRMWARE_VERSION    "2.5.0"
#define SERIAL_BAUD_RATE    115200
#define COMMAND_MAX_BYTES   32 // Drop oversized commands through the next newline

// --- Konfigurasi Pin SPI ESP32-S3 (FSPI Controller) ---
// PERINGATAN: Hindari GPIO 26-37 pada ESP32-S3 (terhubung internal ke Flash/PSRAM)
#define PIN_SPI_SCK         12  // Shared SPI Clock
#define PIN_SPI_MOSI        11  // Shared SPI MOSI
#define PIN_SPI_MISO        13  // Shared SPI MISO

// --- Reader 1 (Slot 1: Konsonan Dasar / Ngalagena / Wianjana) ---
#define SS_1_PIN            10  // Chip Select (SDA) Reader 1
#define RST_1_PIN           9   // Reset Hardware Reader 1

// --- Reader 2 (Slot 2: Diakritik / Rarangken / Pangangge) ---
#define SS_2_PIN            14  // Chip Select (SDA) Reader 2
#define RST_2_PIN           21  // Reset Hardware Reader 2

// --- Indikator LED Built-in (Opsional) ---
#define STATUS_LED_PIN      2   // Indikator aktif saat kartu terdeteksi

// --- Konstanta Timing (Milidetik) ---
#define POLL_INTERVAL_MS           25  // Periode polling antar siklus pembacaan reader
#define CARD_ABSENCE_TIMEOUT_MS    300 // Toleransi hilangnya pembacaan sebelum removal

#endif // AKSANTARA_CONFIG_H
