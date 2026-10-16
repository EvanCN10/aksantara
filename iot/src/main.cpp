/**
 * @file main.cpp
 * @brief Firmware Aksantara Tactile Pad untuk ESP32-S3 Dual RC522 RFID
 * @details Mengelola deteksi paralel Slot 1 (Konsonan) dan Slot 2 (Diakritik)
 *          melalui bus SPI bersama, melakukan debounce pelepasan kartu,
 *          dan memancarkan newline-delimited JSON ke Web Serial API (115200 baud).
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <aksantara-rfid.h>
#include "config.h"

// Objek reader RFID independen per slot
static MFRC522 readerConsonant(SS_1_PIN, RST_1_PIN);
static MFRC522 readerDiacritic(SS_2_PIN, RST_2_PIN);

// Struktur pelacak status per slot
struct SlotState {
    uint8_t slotNumber;
    char physicalUid[21];
    const aksantara::AksantaraCard* acceptedCard;
    unsigned long lastSeenMs;
};

static SlotState slot1State = { 1, "", nullptr, 0 };
static SlotState slot2State = { 2, "", nullptr, 0 };

static unsigned long lastPollMs = 0;
static bool scanning = false;
static char commandLine[COMMAND_MAX_BYTES + 1];
static size_t commandLength = 0;
static bool commandOverflow = false;

/**
 * UID ISO 14443A berukuran 4, 7, atau 10 byte; buffer tetap tanpa alokasi heap.
 */
static bool formatUidToHex(const MFRC522::Uid& uid, char (&out)[21]) {
    if (uid.size != 4 && uid.size != 7 && uid.size != 10) {
        return false;
    }
    constexpr char HEX_DIGITS[] = "0123456789ABCDEF";
    for (byte i = 0; i < uid.size; ++i) {
        out[i * 2] = HEX_DIGITS[uid.uidByte[i] >> 4];
        out[i * 2 + 1] = HEX_DIGITS[uid.uidByte[i] & 0x0F];
    }
    out[uid.size * 2] = '\0';
    return true;
}

/**
 * Memancarkan metadata dan status polling tanpa operasi RF.
 */
static void broadcastDeviceReady() {
    Serial.print("{\"event\":\"DEVICE_READY\",\"device\":\"");
    Serial.print(DEVICE_NAME);
    Serial.print("\",\"chip\":\"");
    Serial.print(DEVICE_CHIP);
    Serial.print("\",\"version\":\"");
    Serial.print(FIRMWARE_VERSION);
    Serial.print("\",\"baudRate\":");
    Serial.print(SERIAL_BAUD_RATE);
    Serial.print(",\"scanning\":");
    Serial.print(scanning ? "true" : "false");
    Serial.println("}");
}

/**
 * Memancarkan event CARD_DETECTED dalam format JSON standar.
 */
static void broadcastCardDetected(const SlotState& state) {
    const auto& card = *state.acceptedCard;
    Serial.print("{\"event\":\"CARD_DETECTED\",\"slot\":");
    Serial.print(state.slotNumber);
    Serial.print(",\"uid\":\"");
    Serial.print(card.id);
    Serial.print("\",\"rawUid\":\"");
    Serial.print(state.physicalUid);
    Serial.print("\",\"type\":\"");
    Serial.print(card.type);
    Serial.print("\",\"script\":\"");
    Serial.print(card.script);
    Serial.print("\",\"label\":\"");
    Serial.print(card.label);
    Serial.println("\"}");
}

/**
 * Memancarkan event CARD_REMOVED dalam format JSON standar.
 */
static void broadcastCardRemoved(const SlotState& state) {
    Serial.print("{\"event\":\"CARD_REMOVED\",\"slot\":");
    Serial.print(state.slotNumber);
    Serial.print(",\"uid\":\"");
    Serial.print(state.acceptedCard->id);
    Serial.print("\",\"rawUid\":\"");
    Serial.print(state.physicalUid);
    Serial.println("\"}");
}

/**
 * Memperbarui indikator LED hanya untuk kartu yang diterima sebagai state game.
 */
static void updateStatusLed() {
#ifdef STATUS_LED_PIN
    bool anyCardAccepted = slot1State.acceptedCard || slot2State.acceptedCard;
    digitalWrite(STATUS_LED_PIN, anyCardAccepted ? HIGH : LOW);
#endif
}

static void broadcastCardIssue(const SlotState& state, const char* event, const char* reason = nullptr) {
    Serial.print("{\"event\":\"");
    Serial.print(event);
    Serial.print("\",\"slot\":");
    Serial.print(state.slotNumber);
    Serial.print(",\"rawUid\":\"");
    Serial.print(state.physicalUid);
    Serial.print("\"");
    if (reason) {
        Serial.print(",\"reason\":\"");
        Serial.print(reason);
        Serial.print("\"");
    }
    Serial.println("}");
}

static void resetSlotState(SlotState& state) {
    if (state.acceptedCard) {
        broadcastCardRemoved(state);
    }
    state.physicalUid[0] = '\0';
    state.acceptedCard = nullptr;
    state.lastSeenMs = 0;
    updateStatusLed();
}

static void printDiagnosticRegister(MFRC522& reader, const char* name, MFRC522::PCD_Register reg) {
    Serial.print(",\"");
    Serial.print(name);
    Serial.print("\":\"");
    byte value = reader.PCD_ReadRegister(reg);
    if (value < 0x10) Serial.print('0');
    Serial.print(value, HEX);
    Serial.print('"');
}

static void diagnoseReader(MFRC522& reader, uint8_t slot) {
    constexpr byte VERSION_SAMPLES = 16;
    constexpr unsigned long SAMPLE_INTERVAL_MS = 5;
    Serial.print("{\"event\":\"DIAGNOSTICS\",\"slot\":");
    Serial.print(slot);
    Serial.print(",\"versions\":[");
    for (byte i = 0; i < VERSION_SAMPLES; ++i) {
        byte version = reader.PCD_ReadRegister(MFRC522::VersionReg);
        if (i) Serial.print(',');
        Serial.print('"');
        if (version < 0x10) Serial.print('0');
        Serial.print(version, HEX);
        Serial.print('"');
        if (i + 1 < VERSION_SAMPLES) delay(SAMPLE_INTERVAL_MS);
    }
    Serial.print(']');
    printDiagnosticRegister(reader, "TxModeReg", MFRC522::TxModeReg);
    printDiagnosticRegister(reader, "RxModeReg", MFRC522::RxModeReg);
    printDiagnosticRegister(reader, "ModWidthReg", MFRC522::ModWidthReg);
    printDiagnosticRegister(reader, "TModeReg", MFRC522::TModeReg);
    printDiagnosticRegister(reader, "TPrescalerReg", MFRC522::TPrescalerReg);
    printDiagnosticRegister(reader, "TReloadRegH", MFRC522::TReloadRegH);
    printDiagnosticRegister(reader, "TReloadRegL", MFRC522::TReloadRegL);
    printDiagnosticRegister(reader, "TxASKReg", MFRC522::TxASKReg);
    printDiagnosticRegister(reader, "ModeReg", MFRC522::ModeReg);
    printDiagnosticRegister(reader, "RFCfgReg", MFRC522::RFCfgReg);
    Serial.println("}");
}

static void processCommand() {
    if (commandLength == 0) return;
    if (strcmp(commandLine, "STATUS") == 0) {
        broadcastDeviceReady();
        if (slot1State.acceptedCard) broadcastCardDetected(slot1State);
        if (slot2State.acceptedCard) broadcastCardDetected(slot2State);
    } else if (strcmp(commandLine, "START") == 0) {
        scanning = true;
        broadcastDeviceReady();
    } else if (strcmp(commandLine, "STOP") == 0) {
        scanning = false;
        resetSlotState(slot1State);
        resetSlotState(slot2State);
        broadcastDeviceReady();
    } else if (strcmp(commandLine, "DIAG") == 0) {
        diagnoseReader(readerConsonant, 1);
        diagnoseReader(readerDiacritic, 2);
    } else {
        Serial.println("{\"event\":\"COMMAND_ERROR\",\"reason\":\"UNKNOWN_COMMAND\"}");
    }
}

static bool receiveCommands() {
    bool received = false;
    while (Serial.available() > 0) {
        int value = Serial.read();
        if (value < 0) break;
        received = true;
        char c = static_cast<char>(value);
        if (c == '\r' || c == '\n') {
            if (commandOverflow) {
                Serial.println("{\"event\":\"COMMAND_ERROR\",\"reason\":\"INVALID_OR_TOO_LONG\"}");
            } else {
                commandLine[commandLength] = '\0';
                processCommand();
            }
            commandLength = 0;
            commandOverflow = false;
        } else if (!commandOverflow) {
            if (commandLength == COMMAND_MAX_BYTES || c < ' ' || c > '~') {
                commandOverflow = true;
            } else {
                commandLine[commandLength++] = c;
            }
        }
    }
    // A partial STOP must finish before another card transaction can begin.
    return received || commandLength != 0 || commandOverflow;
}

static void validateSelectedCard(MFRC522& reader, SlotState& state) {
    if (reader.PICC_GetType(reader.uid.sak) != MFRC522::PICC_TYPE_MIFARE_1K) {
        broadcastCardIssue(state, "CARD_REJECTED", "UNSUPPORTED_CARD");
        return;
    }
    byte block[aksantara::CARD_BLOCK_BYTES];
    if (aksantara::readCardBlock(reader, block) != MFRC522::STATUS_OK) {
        broadcastCardIssue(state, "CARD_REJECTED", "READ_FAILED");
        return;
    }
    const auto* card = aksantara::decodeCardBlock(block);
    if (!card) {
        broadcastCardIssue(state, "CARD_UNASSIGNED");
        return;
    }
    // Rute cerdas: konsonan ke Slot 1, diakritik ke Slot 2 (mendukung mode 1 atau 2 reader)
    state.slotNumber = (strcmp(card->type, "consonant") == 0) ? 1 : 2;
    state.acceptedCard = card;
    broadcastCardDetected(state);
    updateStatusLed();
}

static void observeSelectedCard(MFRC522& reader, SlotState& state) {
    char currentUid[21];
    if (!formatUidToHex(reader.uid, currentUid)) {
        return;
    }
    if (strcmp(state.physicalUid, currentUid) == 0) {
        state.lastSeenMs = millis();
        return;
    }
    // Penggantian tanpa jeda kosong tetap melepas identitas lama lebih dahulu.
    resetSlotState(state);
    strcpy(state.physicalUid, currentUid);
    state.lastSeenMs = millis();
    validateSelectedCard(reader, state);
}

/**
 * WUPA membangunkan kartu HALT agar kartu menetap tidak dianggap terangkat.
 */
static void processReaderSlot(MFRC522& reader, SlotState& state) {
    byte atqa[2];
    byte atqaSize = sizeof(atqa);
    MFRC522::StatusCode status = reader.PICC_WakeupA(atqa, &atqaSize);
    if (status == MFRC522::STATUS_OK) {
        status = reader.PICC_Select(&reader.uid);
        if (status == MFRC522::STATUS_OK) observeSelectedCard(reader, state);
    }
    // Tetap cleanup saat seleksi/auth/baca gagal; game tidak pernah menulis kartu.
    reader.PICC_HaltA();
    reader.PCD_StopCrypto1();

    if (state.physicalUid[0] != '\0' &&
        millis() - state.lastSeenMs >= CARD_ABSENCE_TIMEOUT_MS) {
        resetSlotState(state);
    }
}

void setup() {
    // Inisialisasi port serial USB (115200 baud)
    Serial.begin(SERIAL_BAUD_RATE);

    // Tunggu koneksi USB CDC (maksimal 1.5 detik jika tidak tercolok ke Serial Monitor)
    unsigned long startWait = millis();
    while (!Serial && (millis() - startWait < 1500)) {
        delay(10);
    }

#ifdef STATUS_LED_PIN
    pinMode(STATUS_LED_PIN, OUTPUT);
    digitalWrite(STATUS_LED_PIN, LOW);
#endif

    // Kedua chip harus tidak terpilih sebelum bus SPI mulai aktif.
    pinMode(SS_1_PIN, OUTPUT);
    digitalWrite(SS_1_PIN, HIGH);
    pinMode(SS_2_PIN, OUTPUT);
    digitalWrite(SS_2_PIN, HIGH);

    // Inisialisasi Bus SPI dengan pin yang telah dipetakan khusus untuk ESP32-S3
    SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

    // Inisialisasi masing-masing chip RC522
    readerConsonant.PCD_Init();
    readerDiacritic.PCD_Init();

    // Gain rata-rata dan SPI global 1 MHz: konfigurasi terbukti pada Reader 1.
    readerConsonant.PCD_SetAntennaGain(MFRC522::RxGain_avg);
    readerDiacritic.PCD_SetAntennaGain(MFRC522::RxGain_avg);

    // Kirim sinyal selamat datang & handshake ke Web Serial API
    broadcastDeviceReady();
}

void loop() {
    if (receiveCommands() || !scanning) return;
    unsigned long currentMs = millis();

    // Polling berkala non-blocking sesuai interval konfigurasi
    if (currentMs - lastPollMs >= POLL_INTERVAL_MS) {
        lastPollMs = currentMs;

        // Baca Slot 1 (Konsonan Dasar)
        processReaderSlot(readerConsonant, slot1State);
        if (receiveCommands() || !scanning) return;

        // Baca Slot 2 (Diakritik / Vokalisasi)
        processReaderSlot(readerDiacritic, slot2State);
    }
}
