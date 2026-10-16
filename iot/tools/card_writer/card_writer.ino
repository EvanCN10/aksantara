#include <SPI.h>
#include <aksantara-rfid.h>
#include <ctype.h>

constexpr byte SS1 = 10, RST1 = 9, SS2 = 14, RST2 = 21;
constexpr unsigned long ARM_TIMEOUT_MS = 30000;
constexpr size_t COMMAND_MAX = 96;
MFRC522 writer(SS1, RST1);
const char* const PRESETS[] = {"SD-KA-01", "SD-GA-02", "SD-PANGHULU-05", "SD-PANYUKU-06"};
struct PendingOperation {
    bool armed = false;
    const aksantara::AksantaraCard* card = nullptr;
    char uid[21] = {};
    unsigned long started = 0;
};
PendingOperation pending;
char commandLine[COMMAND_MAX + 1];
size_t commandLength = 0;
bool overflow = false;

void disarm() { pending = PendingOperation{}; }

void printHex(const byte* bytes, byte count) {
    for (byte i = 0; i < count; ++i) {
        if (bytes[i] < 16) Serial.print('0');
        Serial.print(bytes[i], HEX);
    }
}

void formatUid(char (&out)[21]) {
    const char* hex = "0123456789ABCDEF";
    for (byte i = 0; i < writer.uid.size; ++i) {
        out[i * 2] = hex[writer.uid.uidByte[i] >> 4];
        out[i * 2 + 1] = hex[writer.uid.uidByte[i] & 15];
    }
    out[writer.uid.size * 2] = '\0';
}

void help() {
    Serial.println("HELP | LIST | DIAG | READ | WRITE <presetId> <expectedRawUid> | CANCEL");
    Serial.println("Safety: only owned test MIFARE Classic 1K cards; block 4 only; key A FF FF FF FF FF FF.");
    Serial.println("Never changes factory UID, block 0, trailer 7, keys or access bits.");
    Serial.println("Place ONLY ONE card on Reader 1; keep the other three away from its antenna. Reader 2 disabled.");
}

void printRegister(const char* name, MFRC522::PCD_Register reg) {
    byte value = writer.PCD_ReadRegister(reg);
    Serial.print(' '); Serial.print(name); Serial.print("=0x");
    printHex(&value, 1);
}

void diagnoseReader() {
    Serial.print("DIAG VersionReg samples=");
    for (byte i = 0; i < 16; ++i) {
        byte version = writer.PCD_ReadRegister(MFRC522::VersionReg);
        printHex(&version, 1); Serial.print(i == 15 ? '\n' : ' ');
        if (i != 15) delay(5);
    }
    Serial.print("DIAG CONFIG");
    printRegister("TxModeReg", MFRC522::TxModeReg);
    printRegister("RxModeReg", MFRC522::RxModeReg);
    printRegister("ModWidthReg", MFRC522::ModWidthReg);
    printRegister("TModeReg", MFRC522::TModeReg);
    printRegister("TPrescalerReg", MFRC522::TPrescalerReg);
    printRegister("TReloadRegH", MFRC522::TReloadRegH);
    printRegister("TReloadRegL", MFRC522::TReloadRegL);
    printRegister("TxASKReg", MFRC522::TxASKReg);
    printRegister("ModeReg", MFRC522::ModeReg);
    printRegister("RFCfgReg", MFRC522::RFCfgReg);
    Serial.println();
}

void printRfDiagnostics(const char* phase, MFRC522::StatusCode status) {
    Serial.print("RF_DIAG phase="); Serial.print(phase);
    Serial.print(" status="); Serial.print(static_cast<unsigned int>(status));
    printRegister("VersionReg", MFRC522::VersionReg);
    printRegister("ErrorReg", MFRC522::ErrorReg);
    printRegister("ComIrqReg", MFRC522::ComIrqReg);
    printRegister("FIFOLevelReg", MFRC522::FIFOLevelReg);
    printRegister("ControlReg", MFRC522::ControlReg);
    printRegister("CollReg", MFRC522::CollReg);
    printRegister("Status2Reg", MFRC522::Status2Reg);
    Serial.println();
}

void listCards() {
    for (const auto* id : PRESETS) {
        const auto* card = aksantara::findCardById(id);
        Serial.print(card->id); Serial.print(' ');
        Serial.print(card->label); Serial.print(' '); Serial.println(card->type);
    }
}

bool validUid(char* uid) {
    size_t length = strlen(uid);
    if (length != 8 && length != 14 && length != 20) return false;
    for (size_t i = 0; i < length; ++i) {
        if (!isxdigit(static_cast<unsigned char>(uid[i]))) return false;
        uid[i] = toupper(static_cast<unsigned char>(uid[i]));
    }
    return true;
}

const aksantara::AksantaraCard* provisioningCard(const char* id) {
    for (const auto* preset : PRESETS) {
        if (strcmp(preset, id) == 0) return aksantara::findCardById(id);
    }
    return nullptr;
}

bool armWrite(char* id, char* uid) {
    if (!id || !uid || !validUid(uid)) return false;
    const auto* card = provisioningCard(id);
    if (!card) return false;
    pending.card = card;
    strcpy(pending.uid, uid);
    pending.armed = true;
    pending.started = millis();
    Serial.print("ARMED id="); Serial.print(id);
    Serial.print(" expectedUid="); Serial.print(uid); Serial.println(" block=4");
    return true;
}

void processCommand() {
    if (commandLength == 0) return;
    char* context = nullptr;
    char* command = strtok_r(commandLine, " \t", &context);
    if (!command) return;
    disarm(); // A new nonempty command cancels the previous confirmation even if invalid.
    char* arg1 = strtok_r(nullptr, " \t", &context);
    char* arg2 = strtok_r(nullptr, " \t", &context);
    char* extra = strtok_r(nullptr, " \t", &context);
    if (strcmp(command, "WRITE") == 0 && !extra && armWrite(arg1, arg2)) return;
    if (arg1) { Serial.println("ERROR COMMAND"); return; }
    if (strcmp(command, "HELP") == 0) help();
    else if (strcmp(command, "LIST") == 0) listCards();
    else if (strcmp(command, "DIAG") == 0) diagnoseReader();
    else if (strcmp(command, "CANCEL") == 0) Serial.println("CANCELLED");
    else if (strcmp(command, "READ") == 0) {
        pending.armed = true; pending.started = millis(); Serial.println("ARMED READ");
    } else Serial.println("ERROR COMMAND");
}

void receiveCommands() {
    while (Serial.available()) {
        char c = Serial.read();
        if (c == '\r' || c == '\n') {
            if (overflow) Serial.println("ERROR COMMAND_TOO_LONG");
            else { commandLine[commandLength] = '\0'; processCommand(); }
            overflow = false; commandLength = 0;
        } else if (!overflow) {
            if (commandLength == COMMAND_MAX) { overflow = true; disarm(); }
            else commandLine[commandLength++] = c;
        }
    }
}

void statusError(const char* prefix, MFRC522::StatusCode status) {
    Serial.print(prefix); Serial.println(writer.GetStatusCodeName(status));
}

void writeIdentity(const char* uid, const byte (&before)[16]) {
    byte expected[16];
    aksantara::encodeCardBlock(*pending.card, expected);
    Serial.print("BEFORE uid="); Serial.print(uid); Serial.print(" block4=");
    printHex(before, 16); Serial.println();
    if (memcmp(before, expected, 16) == 0) {
        Serial.print("ALREADY_ASSIGNED uid="); Serial.print(uid);
        Serial.print(" id="); Serial.println(pending.card->id); return;
    }
    auto status = aksantara::writeCardBlockVerified(writer, expected);
    if (status != MFRC522::STATUS_OK) {
        printRfDiagnostics("POST_WRITE_OR_VERIFY", status);
        statusError("ERROR WRITE_OR_VERIFY ", status);
        Serial.println("Block 4 may have changed; READ again. No rollback claimed."); return;
    }
    Serial.print("WRITE_OK uid="); Serial.print(uid); Serial.print(" id=");
    Serial.print(pending.card->id); Serial.println(" verified=16/16");
}

void selectedTransaction() {
    char uid[21]; formatUid(uid);
    if (writer.PICC_GetType(writer.uid.sak) != MFRC522::PICC_TYPE_MIFARE_1K) {
        Serial.println("ERROR UNSUPPORTED_CARD"); return;
    }
    if (pending.card && strcmp(uid, pending.uid) != 0) {
        Serial.print("ERROR UID_MISMATCH actualUid="); Serial.println(uid); return;
    }
    byte block[16];
    auto status = aksantara::readCardBlock(writer, block);
    if (status != MFRC522::STATUS_OK) {
        printRfDiagnostics("POST_AUTH_OR_READ", status);
        Serial.print("uid="); Serial.println(uid);
        statusError("ERROR AUTH_OR_READ ", status); return;
    }
    if (pending.card) { writeIdentity(uid, block); return; }
    const auto* card = aksantara::decodeCardBlock(block);
    Serial.print("CARD_READ uid="); Serial.print(uid); Serial.print(" id=");
    Serial.print(card ? card->id : "UNASSIGNED"); Serial.print(" block4=");
    printHex(block, 16); Serial.println();
}

void pollTransaction() {
    byte atqa[2]; byte size = sizeof(atqa);
    auto status = writer.PICC_WakeupA(atqa, &size);
    if (status == MFRC522::STATUS_TIMEOUT) {
        writer.PICC_HaltA(); writer.PCD_StopCrypto1(); return;
    }
    if (status == MFRC522::STATUS_OK) {
        // Use status-returning selection so collisions cannot become a write target.
        status = writer.PICC_Select(&writer.uid);
        if (status == MFRC522::STATUS_OK) selectedTransaction();
        else {
            printRfDiagnostics("SELECT", status);
            statusError("ERROR SELECT ", status);
        }
    } else {
        printRfDiagnostics("WAKEUP", status);
        statusError("ERROR WAKEUP ", status);
    }
    writer.PICC_HaltA(); writer.PCD_StopCrypto1(); disarm();
}

void setup() {
    Serial.begin(115200);
    unsigned long start = millis();
    while (!Serial && millis() - start < 1500) delay(10);
    pinMode(SS1, OUTPUT); digitalWrite(SS1, HIGH);
    pinMode(SS2, OUTPUT); digitalWrite(SS2, HIGH);
    pinMode(RST2, OUTPUT); digitalWrite(RST2, LOW);
    SPI.begin(12, 13, 11);
    writer.PCD_Init();
    writer.PCD_SetAntennaGain(MFRC522::RxGain_avg);
    Serial.println("AKSANTARA CARD WRITER READY");
    help();
}

void loop() {
    receiveCommands();
    if (!pending.armed) return;
    if (millis() - pending.started >= ARM_TIMEOUT_MS) {
        disarm(); Serial.println("ERROR TIMEOUT"); return;
    }
    pollTransaction();
    delay(25);
}
