import { cancela, dayOne, inicioDoCaos, type Line, roads } from "@/content/lore";

// "O Início do Caos" como jogo: um roteiro linear de falas, com portões que só o jogador abre.

export type GateId = "triagem" | "radio" | "investigar" | "comparar" | "paredes" | "estrada";

export type Step =
  | { kind: "act"; act: number }
  | { kind: "line"; act: number; text: string; quote?: boolean; image?: string; alt?: string }
  | { kind: "gate"; act: number; gate: GateId }
  | { kind: "end"; act: number };

/** Portão de cada ato, entre as cenas e a frase do ato. O Ato V ainda fecha com a estrada. */
const GATES: GateId[] = ["triagem", "radio", "investigar", "comparar", "paredes"];

/** Uma fala do roteiro; quando a cena tem ilustração, ela vai junto. */
const line = (act: number, l: Line): Step =>
  typeof l === "string" ? { kind: "line", act, text: l } : { kind: "line", act, ...l };

export const script: Step[] = inicioDoCaos.acts.flatMap((a, act): Step[] => [
  { kind: "act", act },
  ...a.scenes.map((l) => line(act, l)),
  { kind: "gate", act, gate: GATES[act] },
  { kind: "line", act, text: a.quote, quote: true },
  ...a.after.map((l) => line(act, l)),
  ...(act === 4
    ? [
        { kind: "gate", act, gate: "estrada" } as const,
        { kind: "line", act, text: dayOne.radio } as const,
        { kind: "end", act } as const,
      ]
    : []),
]);

export type StoryState = { at: number; road?: string };
export const START: StoryState = { at: 0 };

export type StoryAction = { type: "next" } | { type: "pass"; gate: GateId; road?: string } | { type: "restart" };

const ROAD_GATE = script.findIndex((s) => s.kind === "gate" && s.gate === "estrada");

export function reduce(state: StoryState, action: StoryAction): StoryState {
  const step = script[state.at];
  switch (action.type) {
    case "next":
      // Falas e cartões avançam; portões e o fim, não.
      return step.kind === "line" || step.kind === "act" ? { ...state, at: state.at + 1 } : state;
    case "pass":
      if (step.kind !== "gate" || step.gate !== action.gate) return state;
      if (action.gate === "estrada") {
        if (!roads.some((r) => r.id === action.road)) return state;
        return { at: state.at + 1, road: action.road };
      }
      return { ...state, at: state.at + 1 };
    case "restart":
      return START;
  }
}

/** Ato atual (0 a 4), para o marcador "Ato II · 2/5". */
export function progress(state: StoryState) {
  return { act: script[state.at].act, of: inicioDoCaos.acts.length };
}

/** Último portão de cada ato: passar por ele rende a página do caderno daquele ato. */
const PAGE_AT = inicioDoCaos.acts.map((_, act) => script.findLastIndex((s) => s.kind === "gate" && s.act === act));

/** Páginas do caderno já recuperadas: a anotação da enfermeira de cada ato concluído. */
export function pages(state: StoryState) {
  return inicioDoCaos.acts
    .filter((_, act) => state.at > PAGE_AT[act])
    .map((a) => ({ numeral: a.numeral, title: a.title, note: a.note }));
}

// ---------- Salvar no navegador ----------

export const SAVE_KEY = "lazarus:lore:inicio-do-caos";

export function encodeSave(state: StoryState) {
  return JSON.stringify({ v: 1, ...state });
}

/** O localStorage é entrada não confiável: só volta o que for um ponto válido do roteiro. */
export function decodeSave(raw: string): StoryState | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { v, at, road } = data as Record<string, unknown>;
    if (v !== 1 || !Number.isInteger(at) || (at as number) < 0 || (at as number) >= script.length) return null;
    const passedRoad = (at as number) > ROAD_GATE;
    if (passedRoad !== roads.some((r) => r.id === road)) return null;
    return passedRoad ? { at: at as number, road: road as string } : { at: at as number };
  } catch {
    return null;
  }
}

// ---------- Portões ----------

/** Ato I: o desfecho na ficha. Só a verdade incômoda passa. */
export const triageOptions = [
  {
    id: "obito",
    label: "óbito",
    correct: false,
    reply: "Ele estava sentado. Óbito não explica um corpo sentado.",
  },
  {
    id: "reflexo",
    label: "reflexo pós-morte",
    correct: false,
    reply: "Reflexo não agarra o punho de ninguém. O médico pediu para não inventar.",
  },
  { id: "movimento", label: "movimento após declaração de óbito", correct: true, reply: "" },
];

/** Ato II: a frequência do aviso de emergência no dial. */
export const RADIO = { min: 88, max: 108, step: 0.1, target: 93.7, width: 1.6 };

/** Força do sinal (0 a 1) numa frequência: limpa no alvo, só estática longe dele. */
export function signal(freq: number) {
  return Math.max(0, 1 - Math.abs(freq - RADIO.target) / RADIO.width);
}

export const isTuned = (freq: number) => signal(freq) >= 0.9;

/** Ato III: onde tocar na ilustração (em % da imagem). */
export const hotspots = [
  { id: "poco", faction: "Haven", label: "O poço", x: 13, y: 76 },
  { id: "onibus", faction: "Rovers", label: "O ônibus", x: 40, y: 62 },
  { id: "muralha", faction: "Wardens", label: "A muralha", x: 80, y: 44 },
];

/** Ato IV: o que aparece nas duas versões. */
export const sharedFacts = cancela.facts;
