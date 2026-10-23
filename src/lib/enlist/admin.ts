import { createHash, timingSafeEqual } from "node:crypto";

// Área das fichas: HTTP Basic com a senha em ADMIN_PASSWORD (qualquer usuário). Sem a variável, ninguém entra.

const digest = (value: string) => createHash("sha256").update(value).digest();

export function isAdmin(authorization: string | null, password = process.env.ADMIN_PASSWORD): boolean {
  if (!password || !authorization?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  const given = decoded.slice(decoded.indexOf(":") + 1);
  return timingSafeEqual(digest(given), digest(password));
}

/** CSV para planilha (separador ";" do Excel em português, BOM para os acentos). */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "﻿";
  const cell = (value: unknown) => {
    let text = value instanceof Date ? value.toISOString() : String(value ?? "");
    // Célula começando com = + - @ vira fórmula no Excel; o apóstrofo mantém como texto.
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = Object.keys(rows[0]);
  return "﻿" + [header, ...rows.map((r) => header.map((k) => r[k]))].map((l) => l.map(cell).join(";")).join("\r\n");
}
