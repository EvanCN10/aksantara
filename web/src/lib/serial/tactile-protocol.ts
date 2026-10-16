import { KARTU_RFID_PRESET, type RfidCardData } from './tactile-serial-types';

export const SERIAL_BAUD_RATE = 115200;
export const MAX_SERIAL_LINE_LENGTH = 4096;

type CardSlot = 1 | 2;
type CardIdentity = { slot: CardSlot; uid: string; rawUid: string };

export type TactileSerialEvent =
  | { event: 'DEVICE_READY'; device: string; chip: string; version: string; baudRate: number; scanning: boolean }
  | ({ event: 'CARD_DETECTED'; type: 'consonant' | 'diacritic'; script: RfidCardData['aksaraId']; label: string; card: RfidCardData } & CardIdentity)
  | ({ event: 'CARD_REMOVED' } & CardIdentity)
  | { event: 'CARD_REJECTED'; slot: CardSlot; rawUid: string; reason: string }
  | { event: 'CARD_UNASSIGNED'; slot: CardSlot; rawUid: string };

export type SerialDecodeResult =
  | { ok: true; value: TactileSerialEvent }
  | { ok: false; issue: string };

interface UnvalidatedSerialEvent {
  event?: unknown;
  device?: unknown;
  chip?: unknown;
  version?: unknown;
  baudRate?: unknown;
  scanning?: unknown;
  slot?: unknown;
  uid?: unknown;
  rawUid?: unknown;
  type?: unknown;
  script?: unknown;
  label?: unknown;
  reason?: unknown;
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRawUid(value: unknown): value is string {
  return typeof value === 'string' && /^(?:[0-9A-F]{8}|[0-9A-F]{14}|[0-9A-F]{20})$/.test(value);
}

function decodeReady(data: UnvalidatedSerialEvent): SerialDecodeResult {
  if (!isText(data.device) || !isText(data.chip) || !isText(data.version) ||
      data.baudRate !== SERIAL_BAUD_RATE || typeof data.scanning !== 'boolean') {
    return { ok: false, issue: 'DEVICE_READY tidak sesuai kontrak firmware.' };
  }
  return { ok: true, value: { event: 'DEVICE_READY', device: data.device,
    chip: data.chip, version: data.version, baudRate: data.baudRate, scanning: data.scanning } };
}

function decodeCard(data: UnvalidatedSerialEvent, identity: CardIdentity): SerialDecodeResult {
  const card = KARTU_RFID_PRESET.find((preset) => preset.uid === identity.uid);
  if (!card) return { ok: false, issue: `ID kartu tidak ada dalam katalog: ${identity.uid}.` };
  const expectedType = card.tipe === 'konsonan' ? 'consonant' : 'diacritic';
  const expectedSlot = card.tipe === 'konsonan' ? 1 : 2;
  if (data.type !== expectedType || identity.slot !== expectedSlot ||
      data.script !== card.aksaraId || data.label !== card.label) {
    return { ok: false, issue: `Metadata atau slot kartu ${identity.uid} tidak sesuai katalog.` };
  }
  return { ok: true, value: { event: 'CARD_DETECTED', ...identity,
    type: expectedType, script: card.aksaraId, label: card.label,
    card: { ...card, rawUid: identity.rawUid } } };
}

function decodeEvent(data: UnvalidatedSerialEvent): SerialDecodeResult {
  if (data.event === 'DEVICE_READY') return decodeReady(data);
  if ((data.slot !== 1 && data.slot !== 2) || !isRawUid(data.rawUid)) {
    return { ok: false, issue: 'Event kartu memerlukan slot 1/2 dan rawUid heksadesimal yang valid.' };
  }
  const slot: CardSlot = data.slot === 1 ? 1 : 2;
  const rawUid: string = data.rawUid;
  if (data.event === 'CARD_REJECTED' && isText(data.reason)) {
    return { ok: true, value: { event: 'CARD_REJECTED', slot, rawUid, reason: data.reason } };
  }
  if (data.event === 'CARD_UNASSIGNED') {
    return { ok: true, value: { event: 'CARD_UNASSIGNED', slot, rawUid } };
  }
  if (!isText(data.uid)) return { ok: false, issue: 'Event kartu tidak memiliki ID katalog.' };
  const identity = { slot, rawUid, uid: data.uid };
  if (data.event === 'CARD_REMOVED') return { ok: true, value: { event: 'CARD_REMOVED', ...identity } };
  if (data.event === 'CARD_DETECTED') return decodeCard(data, identity);
  return { ok: false, issue: `Event serial tidak dikenal: ${String(data.event)}.` };
}

export function decodeTactileLine(line: string): SerialDecodeResult {
  try {
    const data: unknown = JSON.parse(line);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { ok: false, issue: 'Payload serial harus berupa objek JSON.' };
    }
    return decodeEvent(data as UnvalidatedSerialEvent);
  } catch {
    return { ok: false, issue: 'Baris serial bukan JSON yang valid.' };
  }
}

// Retain at most one bounded line; discard an oversized frame through its newline.
export class TactileLineFramer {
  private decoder = new TextDecoder();
  private buffer = '';
  private discarding = false;

  constructor(private onLine: (line: string, complete: boolean) => void, private onIssue: (issue: string) => void) {}

  push(bytes: Uint8Array): void {
    this.consume(this.decoder.decode(bytes, { stream: true }));
  }

  finish(): void {
    this.consume(this.decoder.decode());
    if (this.buffer || this.discarding) this.onIssue('Stream serial berakhir di tengah baris NDJSON.');
    this.buffer = '';
    this.discarding = false;
  }

  private consume(text: string): void {
    let start = 0;
    while (start < text.length) {
      const end = text.indexOf('\n', start);
      const segment = text.slice(start, end === -1 ? text.length : end);
      if (!this.discarding) this.append(segment);
      if (end === -1) break;
      if (!this.discarding && this.buffer.trim()) this.onLine(this.buffer.replace(/\r$/, ''), true);
      this.buffer = '';
      this.discarding = false;
      start = end + 1;
    }
  }

  private append(segment: string): void {
    if (this.buffer.length + segment.length > MAX_SERIAL_LINE_LENGTH) {
      this.onLine((this.buffer + segment).slice(0, MAX_SERIAL_LINE_LENGTH), false);
      this.buffer = '';
      this.discarding = true;
      this.onIssue(`Baris serial melebihi ${MAX_SERIAL_LINE_LENGTH} karakter; frame dibuang.`);
      return;
    }
    this.buffer += segment;
  }
}
