import { randomBytes } from "crypto";

/**
 * Genera un código alfanumérico de 6 caracteres para vinculación.
 */
export function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin I, O, 0, 1
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Genera la URL para el código QR.
 * El QR codifica un deep link de Telegram que al escanearlo
 * abre el chat del bot con el código pre-escrito.
 * Ejemplo: https://t.me/certasegurosbot?start=ABC123
 */
export function getVerificationQRData(code: string, botUsername?: string): string {
  const botName = (botUsername ?? "@certasegurosbot").replace("@", "");
  return `https://t.me/${botName}?start=${code}`;
}
