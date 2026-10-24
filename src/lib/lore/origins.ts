import {
  arrivals,
  blockBuildings,
  ledger,
  candidates,
  crewSkills,
  dossiers,
  type FactionId,
  type OriginGateId,
  BUS_SEATS,
  RETREAT,
  UNINSPECTED_RULE,
  WELL_BUCKETS,
  watchSlots,
} from "@/content/origins";
import type { Cell } from "@/lib/games/route";
import {
  type ArchiveAction as OriginsAction,
  type ArchiveState as OriginsState,
  makeArchive,
  START,
  type Step,
} from "./archive";

// "Antes das Bandeiras" como jogo: quatro pastas na mesa, cada uma com o seu roteiro de falas e portões.

export type { FactionId, OriginGateId };

export const archive = makeArchive(dossiers, "lazarus:lore:antes-das-bandeiras");
export const { available, scriptFor, current, reduce, pagesFor, SAVE_KEY, encodeSave, decodeSave, cuesFor } = archive;
export { START };
export type { OriginsAction, OriginsState, Step };

// ---------- Portões ----------

/** Parte I de Haven: todos os baldes entregues e ninguém sem nada. A maior parte diz qual regra o caderno assume. */
export function wellVerdict(shares: number[]): { done: false } | { done: true; ok: boolean; rule: string } {
  if (shares.reduce((a, b) => a + b, 0) < WELL_BUCKETS) return { done: false };
  if (shares.some((n) => n === 0))
    return { done: true, ok: false, rule: "Ninguém pode sair sem nada. Uma fila sem água vira briga." };
  const [idosos, feridos, criancas, buscam] = shares;
  const rule =
    Math.max(...shares) - Math.min(...shares) <= 1
      ? "Partes iguais, mesmo para quem não aguenta carregar."
      : buscam >= Math.max(idosos, feridos, criancas)
        ? "Quem busca bebe primeiro: sem eles, amanhã não há balde."
        : criancas > Math.max(idosos, feridos)
          ? "As crianças primeiro."
          : "Primeiro quem não consegue buscar.";
  return { done: true, ok: true, rule };
}

/** Parte II dos Rovers: com os quatro lugares ocupados, diz qual ofício ainda falta a bordo. */
export function crewVerdict(ids: string[]): { done: false } | { done: true; missing: string[] } {
  if (ids.length < BUS_SEATS) return { done: false };
  const aboard = new Set(candidates.filter((c) => ids.includes(c.id)).map((c) => c.skill as string));
  return { done: true, missing: crewSkills.filter((s) => !aboard.has(s)) };
}

/**
 * Parte III dos Rovers: três corredores entre o pátio (S) e o posto (G), só ligados pelas pontas.
 * = avenida · R rota marcada · ~ névoa. W, # e Z não se atravessam.
 */
export const ROVERS_MAP = [
  "########################",
  "#======================#",
  "#=####WWWW####ZZZ#####=#",
  "#=####################=#",
  "#=####################=#",
  "#SRRRRRRRRRRRRRRRRRRRRG#",
  "#~####################~#",
  "#~##ZZZZ#######WWWW###~#",
  "#~####################~#",
  "#~~~~~~~~~~~~~~~~~~~~~~#",
  "########################",
];

/** O mapa da volta: o ônibus parte do posto, e os infectados que o seguiram (X) fecham a rua da ida. */
export function returnMap(rows: string[], path: Cell[]): string[] {
  const grid = rows.map((row) => [...row]);
  for (const { r, c } of path.slice(1, -1)) grid[r][c] = "X";
  return grid.map((row) => row.map((t) => (t === "S" ? "G" : t === "G" ? "S" : t)).join(""));
}

/** Parte I dos Wardens: todo turno coberto, ninguém em dois turnos seguidos, ninguém de fora da escala. */
export function watchVerdict(shifts: (string | null)[]): { done: false } | { done: true; problem: string | null } {
  if (shifts.length < watchSlots.length || shifts.some((s) => !s)) return { done: false };
  const tired = shifts.findIndex((s, i) => i > 0 && s === shifts[i - 1]);
  if (tired > 0)
    return { done: true, problem: `Quem vigia dois turnos seguidos dorme no segundo (${watchSlots[tired]}).` };
  if (new Set(shifts).size < 3)
    return { done: true, problem: "Alguém ficou fora da escala e dois carregam a noite inteira." };
  return { done: true, problem: null };
}

type Arrival = (typeof arrivals)[number];

/** Parte II dos Wardens: abrir sem revista ou decidir errado não trava o portão, escreve uma regra no livro. */
export function entryVerdict(arrival: Arrival, choice: "entra" | "espera", inspected: boolean) {
  if (choice === "entra" && !inspected) return { ok: false, rule: UNINSPECTED_RULE } as const;
  return choice === arrival.answer ? ({ ok: true } as const) : ({ ok: false, rule: arrival.rule } as const);
}

/** Parte III dos Wardens: depois de segurar o portão `holds` vezes, quantos ainda estão fora e onde está a horda. */
export function retreatAt(holds: number) {
  const walked = RETREAT.approach.slice(0, holds).reduce((a: number, b) => a + b, 0);
  const distance = RETREAT.distance - walked;
  return { outside: Math.max(0, RETREAT.survivors - holds), distance, overrun: distance <= 0 };
}

/** Parte I de Military: a marca vai só nos prédios com sinal de infecção. */
export function quarantineVerdict(marked: string[]): { ok: true } | { ok: false; reply: string } {
  const wrong = blockBuildings.find((b) => !b.infected && marked.includes(b.id));
  if (wrong)
    return { ok: false, reply: `${wrong.label}: tem gente viva lá dentro. A marca condena quem espera ajuda.` };
  const missing = blockBuildings.find((b) => b.infected && !marked.includes(b.id));
  if (missing) return { ok: false, reply: `${missing.label} ficou sem marca. Releia o relatório.` };
  return { ok: true };
}

/** Parte III de Military: quanto deve sobrar de cada item do livro de estoque. */
export function ledgerBalance(id: (typeof ledger)[number]["id"]) {
  const item = ledger.find((l) => l.id === id)!;
  return item.entries.reduce((n: number, e) => n + e.delta, item.start);
}
