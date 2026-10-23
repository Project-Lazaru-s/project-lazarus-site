import { describe, expect, it, vi } from "vitest";
import { countRecruits, MAX_PER_HOUR, saveRecruit, type Sql } from "./db";
import type { Recruit } from "./enlist";

vi.mock("server-only", () => ({}));

const recruit: Recruit = {
  nick: "Kai_D3v",
  email: "recruta@example.com",
  whatsapp: "+5511987654321",
  discord: null,
  side: "f1041",
  experience: "ja-joguei",
  region: "sudeste",
  playtime: "noite",
};

/** Banco falso: responde por palavra-chave da consulta e guarda o que foi enviado. */
function fakeSql(answer: (query: string, values: unknown[]) => Record<string, unknown>[] | Error) {
  const calls: { query: string; values: unknown[] }[] = [];
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push({ query, values });
    const out = answer(query, values);
    if (out instanceof Error) throw out;
    return out;
  }) as Sql;
  return { sql, calls };
}

describe("saveRecruit", () => {
  it("creates the table, inserts the form and returns the card number", async () => {
    const { sql, calls } = fakeSql((q) =>
      q.startsWith("select count") ? [{ recent: 0 }] : q.startsWith("insert") ? [{ id: 137, updated: false }] : [],
    );
    expect(await saveRecruit(sql, recruit, "hash")).toEqual({ number: 137, updated: false });
    expect(calls.some((c) => c.query.startsWith("create table if not exists recruits"))).toBe(true);
    const insert = calls.find((c) => c.query.startsWith("insert"))!;
    expect(insert.values).toEqual([
      "Kai_D3v",
      "recruta@example.com",
      "+5511987654321",
      null,
      "f1041",
      "ja-joguei",
      "sudeste",
      "noite",
      "hash",
    ]);
    expect(insert.query).toContain("on conflict (email) do update");
  });

  it("refuses more new forms from the same network within the hour", async () => {
    const { sql, calls } = fakeSql((q) => (q.startsWith("select count") ? [{ recent: MAX_PER_HOUR }] : []));
    expect(await saveRecruit(sql, recruit, "hash")).toEqual({ error: "rate" });
    expect(calls.some((c) => c.query.startsWith("insert"))).toBe(false);
  });

  it("reports a nick already enlisted with another e-mail", async () => {
    const taken = Object.assign(new Error("duplicate key"), { code: "23505" });
    const { sql } = fakeSql((q) =>
      q.startsWith("select count") ? [{ recent: 0 }] : q.startsWith("insert") ? taken : [],
    );
    expect(await saveRecruit(sql, recruit, "hash")).toEqual({ error: "nick" });
  });
});

describe("countRecruits", () => {
  it("counts by side, with zero for sides nobody picked yet", async () => {
    const { sql } = fakeSql((q) =>
      q.startsWith("select side")
        ? [
            { side: "f1041", n: 3 },
            { side: "solo", n: 2 },
          ]
        : [],
    );
    expect(await countRecruits(sql)).toEqual({
      total: 5,
      bySide: { f873: 0, f1041: 3, f1215: 0, solo: 2 },
    });
  });
});
