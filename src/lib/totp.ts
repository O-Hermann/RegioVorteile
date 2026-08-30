import "server-only";
import crypto from "crypto";

// MVP-Roadmap Phase 7-Erweiterung, 2FA (siehe [[effivo_mvp_roadmap]]):
// eigene, minimale RFC 6238 (TOTP) / RFC 4226 (HOTP) Implementierung statt
// einer externen Bibliothek (otplib/speakeasy) - der Algorithmus ist mit
// Node's eingebautem "crypto" (HMAC-SHA1) vollstaendig abbildbar, gleiches
// Prinzip wie die bereits bestehenden selbstgebauten Tokens (siehe
// lib/tokens.ts, actions/company.ts generateInviteToken) statt einer neuen
// Abhaengigkeit fuer ~60 Zeilen wohldefinierten Algorithmus. `qrcode` war
// bereits eine Projekt-Abhaengigkeit (siehe mitarbeiter/vorteile/[id]).
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const CODE_DIGITS = 6;

export function generateTotpSecret(): string {
  // 160 Bit (20 Byte) - der in RFC 4226 empfohlene Standard fuer HMAC-SHA1.
  return base32Encode(crypto.randomBytes(20));
}

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(binCode % 10 ** CODE_DIGITS).padStart(CODE_DIGITS, "0");
}

// Toleriert +/-1 Zeitfenster (also bis zu 30s Uhrenabweichung in beide
// Richtungen) - Standardpraxis fuer TOTP-Implementierungen, da Handy- und
// Serveruhr nie exakt synchron sind.
export function verifyTotpCode(base32Secret: string, code: string): boolean {
  const cleanCode = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleanCode)) return false;
  const secret = base32Decode(base32Secret);
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (let drift = -1; drift <= 1; drift++) {
    if (hotp(secret, counter + drift) === cleanCode) return true;
  }
  return false;
}

export function totpAuthUri(email: string, base32Secret: string): string {
  const label = encodeURIComponent(`Effivo:${email}`);
  return `otpauth://totp/${label}?secret=${base32Secret}&issuer=${encodeURIComponent("Effivo")}&digits=${CODE_DIGITS}&period=${STEP_SECONDS}&algorithm=SHA1`;
}

// Wiederherstellungscodes fuer den Fall, dass das Authenticator-Geraet
// verloren geht - 10 Codes, je 10 Zeichen aus einem eindeutigen Alphabet
// (keine 0/O/1/I-Verwechslungsgefahr), gehasht gespeichert (siehe
// actions/two-factor.ts) wie Passwoerter, da es Bearer-Credentials sind.
const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const bytes = crypto.randomBytes(10);
    let code = "";
    for (const b of bytes) code += BACKUP_CODE_ALPHABET[b % BACKUP_CODE_ALPHABET.length];
    return `${code.slice(0, 5)}-${code.slice(5, 10)}`;
  });
}
