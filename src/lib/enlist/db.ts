import "server-only";
import { neon } from "@neondatabase/serverless";
import { type Recruit, SIDES, type SideId } from "./enlist";

/** Consulta parametrizada no estilo do driver do Neon (template string). */
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

/** Banco do Vercel Marketplace (Neon). Sem a variável, o site funciona e as fichas ficam fechadas. */
export function connect(): Sql | null {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return url ? (neon(url) as unknown as Sql) : null;
}

let schema: Promise<unknown> | null = null;

/** Cria a tabela na primeira escrita (idempotente), sem passo de migração separado. */
export function ensureSchema(sql: Sql) {
  schema ??= (async () => {
    await sql`create table if not exists recruits (
      id serial primary key,
      nick text not null,
      email text not null unique,
      whatsapp text,
      discord text,
      side text not null,
      experience text not null,
      region text not null,
      playtime text not null,
      group_size int,
      ip_hash text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`;
    await sql`create unique index if not exists recruits_nick_key on recruits (lower(nick))`;
  })().catch((error) => {
    schema = null; // tenta de novo na próxima ficha
    throw error;
  });
  return schema;
}

export const MAX_PER_HOUR = 5;

export type SaveResult = { number: number; updated: boolean } | { error: "nick" | "rate" };

/**
 * Grava a ficha. O mesmo e-mail atualiza a ficha existente; um nick já usado por outro e-mail
 * é recusado; mais de MAX_PER_HOUR fichas novas por endereço de rede numa hora também.
 */
export async function saveRecruit(sql: Sql, r: Recruit, ipHash: string): Promise<SaveResult> {
  await ensureSchema(sql);
  const [{ recent }] = await sql`select count(*)::int as recent from recruits
    where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
  if ((recent as number) >= MAX_PER_HOUR) return { error: "rate" };
  try {
    const [row] = await sql`insert into recruits
        (nick, email, whatsapp, discord, side, experience, region, playtime, ip_hash)
      values (${r.nick}, ${r.email}, ${r.whatsapp}, ${r.discord}, ${r.side}, ${r.experience}, ${r.region},
        ${r.playtime}, ${ipHash})
      on conflict (email) do update set
        nick = excluded.nick, whatsapp = excluded.whatsapp, discord = excluded.discord, side = excluded.side,
        experience = excluded.experience, region = excluded.region, playtime = excluded.playtime,
        updated_at = now()
      returning id, (xmax <> 0) as updated`;
    return { number: row.id as number, updated: row.updated as boolean };
  } catch (error) {
    // 23505 = violação de unicidade; a do e-mail virou atualização, então só sobra a do nick.
    if ((error as { code?: string }).code === "23505") return { error: "nick" };
    throw error;
  }
}

/** Todas as fichas, da mais nova para a mais antiga (área restrita). */
export async function listRecruits(sql: Sql) {
  await ensureSchema(sql);
  return sql`select id, nick, email, whatsapp, discord, side, experience, region, playtime,
    created_at, updated_at from recruits order by id desc`;
}

/** Apaga uma ficha (área restrita). Devolve se havia algo para apagar. */
export async function deleteRecruit(sql: Sql, id: number) {
  await ensureSchema(sql);
  return (await sql`delete from recruits where id = ${id} returning id`).length > 0;
}

export type Stats = { total: number; bySide: Record<SideId, number> };

/** Contagem pública: só números agregados por lado, nenhum dado pessoal. */
export async function countRecruits(sql: Sql): Promise<Stats> {
  await ensureSchema(sql);
  const rows = await sql`select side, count(*)::int as n from recruits group by side`;
  const bySide = Object.fromEntries(SIDES.map((s) => [s.id, 0])) as Record<SideId, number>;
  for (const row of rows) if ((row.side as string) in bySide) bySide[row.side as SideId] = row.n as number;
  return { total: Object.values(bySide).reduce((a, b) => a + b, 0), bySide };
}
