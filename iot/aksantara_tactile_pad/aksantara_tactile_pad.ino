/**
 * ============================================================================
 * AKSANTARA TACTILE PAD - FIRMWARE ARDUINO IDE STANDALONE
 * ============================================================================
 * Mikrokontroler : ESP32-S3 (Espressif Systems)
 * Modul Sensor   : 2x MFRC522 RFID 13.56 MHz (SPI Mode)
 * Komunikasi     : Web Serial API via USB CDC / UART (115200 Baud)
 * 
 * Pengaturan Menu Tools Arduino IDE:
 * - Board             : ESP32S3 Dev Module
 * - USB CDC On Boot   : Enabled (PENTING untuk port native USB!)
 * - Upload Mode       : UART0 / Hardware CDC
 * - Flash Size        : 8MB (atau 16MB)
 * - Partition Scheme  : Default 4MB with spiffs
 * 
 * Pustaka yang Diperlukan:
 * - MFRC522 by GithubCommunity / Miguel Balboa (v1.4.12)
 * - AksantaraRfid (library lokal iot/lib/AksantaraRfid)
 *
 * Arduino CLI: gunakan --library iot/lib/AksantaraRfid dan flag global
 * --build-property "compiler.cpp.extra_flags=-DMFRC522_SPICLOCK=1000000".
 * Flag harus diterapkan juga pada MFRC522.cpp, bukan define lokal sketch.
 * Kontrol baris serial: STATUS (snapshot), START (polling), STOP (reset),
 * DIAG (register saja). Boot tidak melakukan polling sampai START.
 * ============================================================================
 */

#include <SPI.h>
#include <MFRC522.h>
#include <aksantara-rfid.h>

// --- Metadata Perangkat ---
#define DEVICE_NAME         "Aksantara-Tactile-Pad-v1"
#define DEVICE_CHIP         "ESP32-S3"
#define FIRMWARE_VERSION    "2.5.0"
#define SERIAL_BAUD_RATE    115200
#define COMMAND_MAX_BYTES   32 // Drop oversized commands through the next newline

// --- Konfigurasi Pin SPI ESP32-S3 (FSPI) ---
// PERINGATAN: Jangan gunakan GPIO 26-37 pada ESP32-S3 (terhubung internal ke Flash/PSRAM)
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
#define STATUS_LED_PIN      2   // LED aktif saat kartu terdeteksi

// --- Konstanta Timing & Debounce (Milidetik) ---
#define POLL_INTERVAL_MS    25  // Interval polling reader (ms)
#define CARD_ABSENCE_TIMEOUT_MS 300 // Toleransi hilang baca sebelum kartu dianggap diangkat

// Objek reader RFID
MFRC522 readerConsonant(SS_1_PIN, RST_1_PIN);
MFRC522 readerDiacritic(SS_2_PIN, RST_2_PIN);

// Status pelacak per slot
struct SlotState {
    uint8_t slotNumber;
    char physicalUid[21];
    const aksantara::AksantaraCard* acceptedCard;
    unsigned long lastSeenMs;
};

SlotState slot1State = { 1, "", nullptr, 0 };
SlotState slot2State = { 2, "", nullptr, 0 };

unsigned long lastPollMs = 0;
bool scanning = false;
char commandLine[COMMAND_MAX_BYTES + 1];
size_t commandLength = 0;
bool commandOverflow = false;

bool formatUidToHex(const MFRC522::Uid& uid, char (&output)[21]) {
    if (uid.size != 4 && uid.size != 7 && uid.size != 10) return false;
    static const char HEX_DIGITS[] = "0123456789ABCDEF";
    for (byte i = 0; i < uid.size; ++i) {
        output[i * 2] = HEX_DIGITS[uid.uidByte[i] >> 4];
        output[i * 2 + 1] = HEX_DIGITS[uid.uidByte[i] & 0x0F];
    }
    output[uid.size * 2] = '\0';
    return true;
}

void broadcastDeviceReady() {
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

void broadcastCardDetected(const SlotState& state) {
    const aksantara::AksantaraCard& card = *state.acceptedCard;
    Serial.print("{\"event\":\"CARD_DETECTED\",\"slot\":");
    Serial.print(state.slotNumber);
    Serial.print(",\"uid\":\"");
    Serial.print(card.id);
    Serial.print("\",\"rawUid\":\"");
    Serial.print(state.physicalUid);
    Serial.print("\",\"script\":\"");
    Serial.print(card.script);
    Serial.print("\",\"type\":\"");
    Serial.print(card.type);
    Serial.print("\",\"label\":\"");
    Serial.print(card.label);
    Serial.println("\"}");
}

void broadcastCardRemoved(const SlotState& state) {
    Serial.print("{\"event\":\"CARD_REMOVED\",\"slot\":");
    Serial.print(state.slotNumber);
    Serial.print(",\"uid\":\"");
    Serial.print(state.acceptedCard->id);
    Serial.print("\",\"rawUid\":\"");
    Serial.print(state.physicalUid);
    Serial.println("\"}");
}

void broadcastCardInvalid(const SlotState& state, const char* reason) {
    Serial.print("{\"event\":\"");
    Serial.print(reason ? "CARD_REJECTED" : "CARD_UNASSIGNED");
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

void updateStatusLed() {
#ifdef STATUS_LED_PIN
    bool anyCardAccepted = slot1State.acceptedCard || slot2State.acceptedCard;
    digitalWrite(STATUS_LED_PIN, anyCardAccepted ? HIGH : LOW);
#endif
}

void resetSlotState(SlotState& state) {
    if (state.acceptedCard) broadcastCardRemoved(state);
    state.physicalUid[0] = '\0';
    state.acceptedCard = nullptr;
    state.lastSeenMs = 0;
    updateStatusLed();
}

void printDiagnosticRegister(MFRC522& reader, const char* name, MFRC522::PCD_Register reg) {
    Serial.print(",\"");
    Serial.print(name);
    Serial.print("\":\"");
    byte value = reader.PCD_ReadRegister(reg);
    if (value < 0x10) Serial.print('0');
    Serial.print(value, HEX);
    Serial.print('"');
}

void diagnoseReader(MFRC522& reader, uint8_t slot) {
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

void processCommand() {
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

bool receiveCommands() {
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

void validateSelectedCard(MFRC522& reader, SlotState& state) {
    if (reader.PICC_GetType(reader.uid.sak) != MFRC522::PICC_TYPE_MIFARE_1K) {
        broadcastCardInvalid(state, "UNSUPPORTED_CARD");
        return;
    }
    byte block[aksantara::CARD_BLOCK_BYTES];
    if (aksantara::readCardBlock(reader, block) != MFRC522::STATUS_OK) {
        broadcastCardInvalid(state, "READ_FAILED");
        return;
    }
    const aksantara::AksantaraCard* card = aksantara::decodeCardBlock(block);
    if (!card) {
        broadcastCardInvalid(state, nullptr);
        return;
    }
    // Rute cerdas: konsonan ke Slot 1, diakritik ke Slot 2 (mendukung mode 1 atau 2 reader)
    state.slotNumber = (strcmp(card->type, "consonant") == 0) ? 1 : 2;
    state.acceptedCard = card;
    broadcastCardDetected(state);
    updateStatusLed();
}

void observeSelectedCard(MFRC522& reader, SlotState& state) {
    char currentRawUid[21];
    if (!formatUidToHex(reader.uid, currentRawUid)) return;
    unsigned long now = millis();
    if (strcmp(state.physicalUid, currentRawUid) == 0) {
        state.lastSeenMs = now;
        return;
    }
    resetSlotState(state);
    strcpy(state.physicalUid, currentRawUid);
    state.lastSeenMs = now;
    validateSelectedCard(reader, state);
}

void processReaderSlot(MFRC522& reader, SlotState& state) {
    byte atqa[2];
    byte atqaSize = sizeof(atqa);
    MFRC522::StatusCode status = reader.PICC_WakeupA(atqa, &atqaSize);
    if (status == MFRC522::STATUS_OK) {
        status = reader.PICC_Select(&reader.uid);
        if (status == MFRC522::STATUS_OK) observeSelectedCard(reader, state);
    }
    // Cleanup juga wajib ketika seleksi atau autentikasi gagal.
    reader.PICC_HaltA();
    reader.PCD_StopCrypto1();
    if (state.physicalUid[0] != '\0' &&
        millis() - state.lastSeenMs >= CARD_ABSENCE_TIMEOUT_MS) {
        resetSlotState(state);
    }
}

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);

    unsigned long startWait = millis();
    while (!Serial && (millis() - startWait < 1500)) {
        delay(10);
    }

#ifdef STATUS_LED_PIN
    pinMode(STATUS_LED_PIN, OUTPUT);
    digitalWrite(STATUS_LED_PIN, LOW);
#endif

    pinMode(SS_1_PIN, OUTPUT);
    digitalWrite(SS_1_PIN, HIGH);
    pinMode(SS_2_PIN, OUTPUT);
    digitalWrite(SS_2_PIN, HIGH);

    SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

    readerConsonant.PCD_Init();
    readerDiacritic.PCD_Init();

    readerConsonant.PCD_SetAntennaGain(MFRC522::RxGain_avg);
    readerDiacritic.PCD_SetAntennaGain(MFRC522::RxGain_avg);

    broadcastDeviceReady();
}

void loop() {
    if (receiveCommands() || !scanning) return;
    unsigned long currentMs = millis();
    if (currentMs - lastPollMs >= POLL_INTERVAL_MS) {
        lastPollMs = currentMs;
        processReaderSlot(readerConsonant, slot1State);
        if (receiveCommands() || !scanning) return;
        processReaderSlot(readerDiacritic, slot2State);
    }
}
