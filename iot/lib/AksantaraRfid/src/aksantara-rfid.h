#ifndef AKSANTARA_RFID_H
#define AKSANTARA_RFID_H

#include <MFRC522.h>
#include <string.h>

namespace aksantara {
constexpr byte CARD_DATA_BLOCK = 4;
constexpr byte CARD_TRAILER_BLOCK = 7;
constexpr byte CARD_BLOCK_BYTES = 16;
constexpr byte CARD_READ_BUFFER_BYTES = 18;

struct AksantaraCard {
    const char* id;
    const char* script;
    const char* type;
    const char* label;
};

static const AksantaraCard CARD_CATALOG[] = {
    {"SD-KA-01", "sunda", "consonant", "Ka"},
    {"SD-GA-02", "sunda", "consonant", "Ga"},
    {"SD-TA-03", "sunda", "consonant", "Ta"},
    {"SD-BA-04", "sunda", "consonant", "Ba"},
    {"SD-PANGHULU-05", "sunda", "diacritic", "Panghulu (i)"},
    {"SD-PANYUKU-06", "sunda", "diacritic", "Panyuku (u)"},
    {"LT-KA-07", "lontara", "consonant", "Ka"},
    {"LT-GA-08", "lontara", "consonant", "Ga"},
    {"LT-TA-09", "lontara", "consonant", "Ta"},
    {"LT-TETTA-10", "lontara", "diacritic", "Tetta (i)"},
    {"LT-TUKKI-11", "lontara", "diacritic", "Tukki (u)"},
    {"BL-KA-12", "bali", "consonant", "Ka"},
    {"BL-GA-13", "bali", "consonant", "Ga"},
    {"BL-TA-14", "bali", "consonant", "Ta"},
    {"BL-ULU-15", "bali", "diacritic", "Ulu (i)"},
    {"BL-SUKU-16", "bali", "diacritic", "Suku (u)"}
};

inline const AksantaraCard* findCardById(const char* id) {
    if (!id) return nullptr;
    for (const auto& card : CARD_CATALOG) {
        if (strcmp(card.id, id) == 0) return &card;
    }
    return nullptr;
}

inline bool encodeCardBlock(const AksantaraCard& card, byte (&out)[16]) {
    memset(out, 0, sizeof(out));
    const auto* known = findCardById(card.id);
    if (!known || strlen(known->id) >= sizeof(out)) return false;
    memcpy(out, known->id, strlen(known->id));
    return true;
}

inline const AksantaraCard* decodeCardBlock(const byte (&data)[16]) {
    byte expected[CARD_BLOCK_BYTES];
    for (const auto& card : CARD_CATALOG) {
        if (encodeCardBlock(card, expected) && memcmp(data, expected, sizeof(data)) == 0) {
            return &card;
        }
    }
    return nullptr;
}

inline MFRC522::StatusCode authenticateCard(MFRC522& reader) {
    if (reader.PICC_GetType(reader.uid.sak) != MFRC522::PICC_TYPE_MIFARE_1K) {
        return MFRC522::STATUS_INVALID;
    }
    MFRC522::MIFARE_Key key;
    memset(key.keyByte, 0xFF, sizeof(key.keyByte));
    return reader.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A,
                                   CARD_TRAILER_BLOCK, &key, &reader.uid);
}

// Caller owns PICC selection and must HALT/StopCrypto1 on every exit.
inline MFRC522::StatusCode readCardBlock(MFRC522& reader, byte (&out)[16]) {
    auto status = authenticateCard(reader);
    if (status != MFRC522::STATUS_OK) return status;
    byte buffer[CARD_READ_BUFFER_BYTES];
    byte size = sizeof(buffer);
    status = reader.MIFARE_Read(CARD_DATA_BLOCK, buffer, &size);
    if (status != MFRC522::STATUS_OK) return status;
    if (size < CARD_BLOCK_BYTES) return MFRC522::STATUS_ERROR;
    memcpy(out, buffer, sizeof(out));
    return MFRC522::STATUS_OK;
}

inline MFRC522::StatusCode writeCardBlockVerified(MFRC522& reader, const byte (&expected)[16]) {
    auto status = authenticateCard(reader);
    if (status != MFRC522::STATUS_OK) return status;
    // MFRC522 takes mutable data; keep the caller's immutable expected bytes intact.
    byte payload[CARD_BLOCK_BYTES];
    memcpy(payload, expected, sizeof(payload));
    status = reader.MIFARE_Write(CARD_DATA_BLOCK, payload, sizeof(payload));
    if (status != MFRC522::STATUS_OK) return status;
    byte actual[CARD_BLOCK_BYTES];
    status = readCardBlock(reader, actual);
    if (status != MFRC522::STATUS_OK) return status;
    return memcmp(expected, actual, sizeof(actual)) == 0 ? MFRC522::STATUS_OK : MFRC522::STATUS_ERROR;
}
} // namespace aksantara
#endif
