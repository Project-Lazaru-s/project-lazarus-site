"use server";

import { createHash } from "node:crypto";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { connect, saveRecruit } from "@/lib/enlist/db";
import { encodeCard, type EnlistInput, type Field, validate } from "@/lib/enlist/enlist";

export type EnlistResult =
  | { ok: true; number: number; code: string; updated: boolean }
  | { ok: false; errors?: Partial<Record<Field, string>>; message?: string };

/** Endereço de rede só como hash: serve para o limite de envios, não identifica ninguém. */
async function networkHash() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return createHash("sha256").update(`lazarus:${ip}`).digest("hex").slice(0, 32);
}

export async function enlist(input: EnlistInput): Promise<EnlistResult> {
  const checked = validate(input);
  // Robô: finge que deu certo e não grava nada.
  if (!checked.ok && checked.bot) return { ok: true, number: 0, code: "", updated: false };
  if (!checked.ok) return { ok: false, errors: checked.errors };

  const sql = connect();
  if (!sql) return { ok: false, message: "O alistamento ainda não está aberto. Tente de novo mais tarde." };

  const saved = await saveRecruit(sql, checked.data, await networkHash());
  if ("error" in saved) {
    return saved.error === "nick"
      ? { ok: false, errors: { nick: "Esse nick já está alistado com outro e-mail." } }
      : { ok: false, message: "Muitas fichas desta rede na última hora. Tente de novo mais tarde." };
  }

  updateTag("recruits"); // o contador da página já mostra a ficha nova
  const { nick, side } = checked.data;
  return {
    ok: true,
    number: saved.number,
    code: encodeCard({ number: saved.number, nick, side }),
    updated: saved.updated,
  };
}
