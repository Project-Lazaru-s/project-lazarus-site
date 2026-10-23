import type { Line } from "@/content/lore";
import { dossiers, type FactionId, type OriginGateId, WELL_BUCKETS } from "@/content/origins";
import type { Cue } from "./audio";

// "Antes das Bandeiras" como jogo: quatro pastas na mesa, cada uma com o seu roteiro de falas e portões.

export type { FactionId, OriginGateId };

export type Step =
  | { kind: "part"; part: number }
  | { kind: "line"; part: number; text: string; quote?: boolean; image?: string; alt?: string }
  | { kind: "gate"; part: number; gate: OriginGateId }
  | { kind: "end"; part: number };

const FACTIONS = dossiers.map((d) => d.id);
const dossier = (id: FactionId) => dossiers.find((d) => d.id === id)!;

/** Pasta com roteiro escrito; as outras ficam lacradas na mesa. */
export const available = (id: FactionId) => dossier(id).parts.length > 0;

const line = (part: number, l: Line): Step =>
  typeof l === "string" ? { kind: "line", part, text: l } : { kind: "line", part, ...l };

const scripts = Object.fromEntries(
  dossiers.map((d) => {
    const steps = d.parts.flatMap((p, part): Step[] => [
      { kind: "part", part },
      ...p.scenes.map((l) => line(part, l)),
      { kind: "gate", part, gate: p.gate },
      { kind: "line", part, text: p.quote, quote: true },
      ...p.after.map((l) => line(part, l)),
    ]);
    return [d.id, steps.length ? [...steps, { kind: "end", part: d.parts.length - 1 } as const] : []];
  }),
) as Record<FactionId, Step[]>;

export const scriptFor = (id: FactionId) => scripts[id];

/** Pasta aberta (ou a mesa), onde cada pasta parou e quais já foram lidas até o fim. */
export type OriginsState = { open: FactionId | null; at: Partial<Record<FactionId, number>>; done: FactionId[] };
export const START: OriginsState = { open: null, at: {}, done: [] };

export type OriginsAction =
  | { type: "open"; faction: FactionId }
  | { type: "close" }
  | { type: "next" }
  | { type: "pass"; gate: OriginGateId }
  | { type: "finish" };

/** Passo atual da pasta aberta. */
export function current(state: OriginsState) {
  return state.open ? scripts[state.open][state.at[state.open] ?? 0] : null;
}

export function reduce(state: OriginsState, action: OriginsAction): OriginsState {
  const { open } = state;
  const step = current(state);
  const advance = () => ({ ...state, at: { ...state.at, [open!]: state.at[open!]! + 1 } });
  switch (action.type) {
    case "open":
      if (!available(action.faction)) return state;
      return { ...state, open: action.faction, at: { ...state.at, [action.faction]: state.at[action.faction] ?? 0 } };
    case "close":
      return open ? { ...state, open: null } : state;
    case "next":
      return step?.kind === "line" || step?.kind === "part" ? advance() : state;
    case "pass":
      return step?.kind === "gate" && step.gate === action.gate ? advance() : state;
    case "finish": {
      if (step?.kind !== "end") return state;
      const at = { ...state.at };
      delete at[open!];
      return { open: null, at, done: state.done.includes(open!) ? state.done : [...state.done, open!] };
    }
  }
}

/** Páginas do dossiê já recuperadas: a anotação de cada parte cujo portão ficou para trás. */
export function pagesFor(state: OriginsState, id: FactionId) {
  const steps = scripts[id];
  const at = state.done.includes(id) && state.at[id] === undefined ? steps.length : (state.at[id] ?? 0);
  return dossier(id)
    .parts.filter((_, part) => at > steps.findIndex((s) => s.kind === "gate" && s.part === part))
    .map((p) => ({ numeral: p.numeral, title: p.title, note: p.note }));
}

// ---------- Salvar no navegador ----------

export const SAVE_KEY = "lazarus:lore:antes-das-bandeiras";

export const encodeSave = (state: OriginsState) => JSON.stringify({ v: 1, ...state });

const isFaction = (x: unknown): x is FactionId => FACTIONS.includes(x as FactionId);

/** O localStorage é entrada não confiável: só volta um estado que o jogo poderia ter produzido. */
export function decodeSave(raw: string): OriginsState | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { v, open, at, done } = data as Record<string, unknown>;
    if (v !== 1 || typeof at !== "object" || at === null || !Array.isArray(done)) return null;
    if (!done.every((id) => isFaction(id) && available(id))) return null;
    const entries = Object.entries(at);
    const validAt = entries.every(
      ([id, n]) => isFaction(id) && available(id) && Number.isInteger(n) && n >= 0 && n < scripts[id].length,
    );
    if (!validAt) return null;
    if (open !== null && !(isFaction(open) && open in at)) return null;
    return { open, at: Object.fromEntries(entries) as OriginsState["at"], done: [...new Set(done)] };
  } catch {
    return null;
  }
}

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

// ---------- Sons ----------

/** O que toca quando o jogo anda de `prev` para `next`. */
export function cuesFor(next: OriginsState, prev: OriginsState): Cue[] {
  if (next.open === null)
    return prev.open && next.done.length > prev.done.length ? [{ name: "loreStamp", volume: 0.8 }] : [];
  // O som da pasta abrindo toca no clique (antes da animação); aqui só o que vem dentro dela.
  const entering = prev.open !== next.open;
  const at = next.at[next.open]!;
  if (!entering && prev.at[next.open] === at) return [];
  const steps = scripts[next.open];
  const step = steps[at];
  const before = steps[at - 1];
  const cue: Cue =
    step.kind === "part"
      ? { name: "loreAct", volume: 0.6 }
      : step.kind === "end"
        ? { name: "loreEnding", volume: 0.7 }
        : step.kind === "gate"
          ? { name: "loreInspect", volume: 0.4 }
          : !entering && before?.kind === "gate"
            ? { name: "lorePage", volume: 0.6 }
            : { name: "lorePencil", volume: 0.25 };
  return [cue];
}
