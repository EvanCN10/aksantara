/**
 * ============================================================================
 * AKSANTARA TACTILE PAD - RFID CARD CALIBRATION & UID SCANNER TOOL
 * ============================================================================
 * Skrip diagnostik ini digunakan khusus untuk:
 * 1. Mengetes sambungan fisik bus SPI kedua modul RC522 (Self-Test Firmware).
 * 2. Membaca UID fisik dari kartu RFID baru yang dibeli pengguna.
 * 3. Mengarahkan provisioning identitas blok 4 melalui alat card_writer.
 * 
 * Target Board : ESP32-S3 (Baud Rate: 115200)
 * ============================================================================
 */

#include <SPI.h>
#include <MFRC522.h>

// Pin SPI ESP32-S3
#define PIN_SPI_SCK   12
#define PIN_SPI_MOSI  11
#define PIN_SPI_MISO  13

// Reader 1 (Slot Konsonan)
#define SS_1_PIN      10
#define RST_1_PIN     9

// Reader 2 (Slot Diakritik)
#define SS_2_PIN      14
#define RST_2_PIN     21

#define STATUS_LED    2

MFRC522 reader1(SS_1_PIN, RST_1_PIN);
MFRC522 reader2(SS_2_PIN, RST_2_PIN);

String formatUidHex(byte* buffer, byte bufferSize) {
    String hex = "";
    for (byte i = 0; i < bufferSize; ++i) {
        if (buffer[i] < 0x10) hex += "0";
        hex += String(buffer[i], HEX);
    }
    hex.toUpperCase();
    return hex;
}

void printSelfTest(const char* name, MFRC522& reader) {
    byte v = reader.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("  [SELF-TEST] ");
    Serial.print(name);
    Serial.print(" VersionReg: 0x");
    Serial.print(v, HEX);

    if (v == 0x91) {
        Serial.println(" -> OK (MFRC522 v1.0)");
    } else if (v == 0x92) {
        Serial.println(" -> OK (MFRC522 v2.0)");
    } else if (v == 0x12) {
        Serial.println(" -> OK (MFRC522 counterfeit / clone)");
    } else if (v == 0x00 || v == 0xFF) {
        Serial.println(" -> GAGAL! Periksa sambungan kabel SPI & VCC 3.3V!");
    } else {
        Serial.println(" -> Unknown Version");
    }
}

void scanSlot(int slotNumber, const char* slotName, MFRC522& reader) {
    if (reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial()) {
        String uidHex = formatUidHex(reader.uid.uidByte, reader.uid.size);
        MFRC522::PICC_Type piccType = reader.PICC_GetType(reader.uid.sak);

        digitalWrite(STATUS_LED, HIGH);

        Serial.println("\n=======================================================");
        Serial.print(">>> KARTU BARU TERDETEKSI DI SLOT ");
        Serial.print(slotNumber);
        Serial.print(" (");
        Serial.print(slotName);
        Serial.println(") <<<");
        Serial.println("-------------------------------------------------------");
        Serial.print("Tipe Kartu : ");
        Serial.println(reader.PICC_GetTypeName(piccType));
        Serial.print("Panjang UID: ");
        Serial.print(reader.uid.size);
        Serial.println(" byte");
        Serial.print("Hex UID    : ");
        Serial.println(uidHex);
        Serial.println("-------------------------------------------------------");
        Serial.println("UID pabrik tidak diubah. Upload tools/card_writer untuk provisioning.");
        Serial.println("Jalankan READ pada Reader 1, lalu WRITE <presetId> <UID hasil READ>.");
        Serial.println("Pilih ID lewat LIST; hanya blok 4 kartu uji milik Anda yang ditimpa.");
        Serial.println("=======================================================");

        reader.PICC_HaltA();
        reader.PCD_StopCrypto1();

        delay(300);
        digitalWrite(STATUS_LED, LOW);
    }
}

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 1500);

    pinMode(STATUS_LED, OUTPUT);
    digitalWrite(STATUS_LED, LOW);

    SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

    reader1.PCD_Init();
    reader2.PCD_Init();

    reader1.PCD_SetAntennaGain(MFRC522::RxGain_max);
    reader2.PCD_SetAntennaGain(MFRC522::RxGain_max);

    Serial.println("\n============================================================");
    Serial.println(" AKSANTARA TACTILE PAD - RFID CALIBRATION & SCANNER TOOL");
    Serial.println("============================================================");
    Serial.println("Memeriksa status sambungan modul MFRC522...");

    printSelfTest("Reader 1 (Slot Konsonan - CS: GPIO 10)", reader1);
    printSelfTest("Reader 2 (Slot Diakritik - CS: GPIO 14)", reader2);

    Serial.println("------------------------------------------------------------");
    Serial.println("SILAKAN TEMPELKAN KARTU RFID FISIK KE SLOT 1 ATAU SLOT 2.");
    Serial.println("UID kartu akan dicetak otomatis di bawah ini.");
    Serial.println("============================================================\n");
}

void loop() {
    scanSlot(1, "Konsonan Dasar", reader1);
    delay(20);
    scanSlot(2, "Tanda Diakritik", reader2);
    delay(20);
}
