import crypto from "crypto";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 Stunde

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}
