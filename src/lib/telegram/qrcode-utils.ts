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
 * Genera la URL/data para el código QR.
 * El QR codifica un texto simple con el código para que
 * el usuario pueda escanearlo o copiar el código manualmente.
 */
export function getVerificationQRData(code: string, botUsername?: string): string {
  const bot = botUsername ? `@${botUsername}` : "el bot";
  return `Vinculate a Certa Seguros CRM. Codigo: ${code}. Envia este codigo a ${bot}`;
}
