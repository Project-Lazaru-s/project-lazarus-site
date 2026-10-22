// Estado do "sobrevivente" que atravessa a landing: o scroll avança os dias,
// os minigames somam abates, mortes e medo.

import { isWanted, PARDONED_REPUTATION, type Deal, type HunterOutcome } from "@/lib/games/negotiation";

export type Item = "antibiotic" | "painkiller" | "bandage" | "water" | "ammo";
export type DrinkOutcome = "safe" | "sick" | "severe";
export type Stomach = "ok" | "sick" | "severe";

export type ChestResult = "forced" | "picked" | "picked-clean";

export type SurvivalRecord = {
  stealthBest: number | null;
  /** Atravessou a rua sem ninguém chegar a "investigando". */
  stealthClean: boolean;
  hordesHeld: number;
  /** Conteve uma horda sem tiro no corpo. */
  cleanHorde: boolean;
  takedowns: number;
  lootOpened: number;
  lootFound: number;
  wanted: boolean;
  huntersSurvived: boolean;
  /** Terminou o Fale baixo sem nenhum infectado ouvir. */
  voiceQuiet: boolean;
  chest: ChestResult | null;
  cured: boolean;
};

export type SurvivalState = {
  day: number;
  fear: number;
  kills: number;
  deaths: number;
  inventory: Item[];
  stomach: Stomach;
  infected: boolean;
  /** Reputação com os Rovers, de -100 a +100. */
  reputation: number;
  /** Som ligado pelo visitante (ambiente e efeitos). */
  sound: boolean;
  record: SurvivalRecord;
  /** Conquistas desbloqueadas (ids de achievements.ts); sobrevivem a uma nova partida. */
  achievements: string[];
  /** Avisos de conquista a mostrar; `n` cresce a cada aviso para animar cada um uma vez. */
  toasts: { id: string; n: number }[];
};

export type SurvivalAction =
  | { type: "day"; day: number }
  | { type: "kill"; count: number }
  | { type: "death" }
  | { type: "fear"; amount: number }
  | { type: "sedative" }
  | { type: "sound"; on: boolean }
  | { type: "loot"; item: Item | null }
  | { type: "drink"; outcome: DrinkOutcome }
  | { type: "takedown"; success: boolean }
  | { type: "use"; item: Item }
  | { type: "stealth"; time: number; clean: boolean }
  | { type: "horde-held"; wave: number; clean: boolean }
  | { type: "voice"; heard: number }
  | { type: "chest"; method: "picked" | "forced"; broken: number }
  | { type: "deal"; deal: Deal }
  | { type: "hunters"; outcome: HunterOutcome; paid: Item[] };

export const initialSurvival: SurvivalState = {
  day: 0,
  fear: 0,
  kills: 0,
  deaths: 0,
  inventory: [],
  stomach: "ok",
  infected: false,
  reputation: 0,
  sound: false,
  record: {
    stealthBest: null,
    stealthClean: false,
    hordesHeld: 0,
    cleanHorde: false,
    takedowns: 0,
    lootOpened: 0,
    lootFound: 0,
    wanted: false,
    huntersSurvived: false,
    voiceQuiet: false,
    chest: null,
    cured: false,
  },
  achievements: [],
  toasts: [],
};

const CHEST_RANK: Record<ChestResult, number> = { forced: 0, picked: 1, "picked-clean": 2 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const STOMACH: Record<DrinkOutcome, Stomach> = { safe: "ok", sick: "sick", severe: "severe" };

function withoutItems(inventory: Item[], items: Item[]) {
  return items.reduce((left, item) => {
    const index = left.indexOf(item);
    return index === -1 ? left : left.toSpliced(index, 1);
  }, inventory);
}

function withReputation(state: SurvivalState, reputation: number): SurvivalState {
  const value = clamp(reputation, -100, 100);
  return { ...state, reputation: value, record: { ...state.record, wanted: state.record.wanted || isWanted(value) } };
}

const SQUAD_SIZE = 3;

function consume(state: SurvivalState, item: Item): SurvivalState {
  const index = state.inventory.indexOf(item);
  if (index === -1) return state;
  const inventory = state.inventory.toSpliced(index, 1);
  if (item !== "antibiotic") return { ...state, inventory };
  // Antibiótico cura disenteria e infecção.
  const wasIll = state.stomach !== "ok" || state.infected;
  return {
    ...state,
    inventory,
    stomach: "ok",
    infected: false,
    record: { ...state.record, cured: state.record.cured || wasIll },
  };
}

export function survivalReducer(state: SurvivalState, action: SurvivalAction): SurvivalState {
  const record = state.record;
  switch (action.type) {
    case "day":
      return { ...state, day: Math.max(state.day, action.day) };
    case "kill":
      return { ...state, kills: state.kills + action.count };
    case "death":
      return { ...state, deaths: state.deaths + 1 };
    case "fear":
      return { ...state, fear: clamp(state.fear + action.amount, 0, 100) };
    case "sedative":
      return { ...state, fear: 0 };
    case "sound":
      return { ...state, sound: action.on };
    case "loot":
      return {
        ...state,
        inventory: action.item ? [...state.inventory, action.item] : state.inventory,
        record: { ...record, lootOpened: record.lootOpened + 1, lootFound: record.lootFound + (action.item ? 1 : 0) },
      };
    case "drink":
      return { ...state, stomach: STOMACH[action.outcome] };
    case "takedown":
      return action.success
        ? { ...state, kills: state.kills + 1, record: { ...record, takedowns: record.takedowns + 1 } }
        : { ...state, infected: true };
    case "use":
      return consume(state, action.item);
    case "stealth":
      return {
        ...state,
        record: {
          ...record,
          stealthBest: Math.min(record.stealthBest ?? Infinity, action.time),
          stealthClean: record.stealthClean || action.clean,
        },
      };
    case "horde-held":
      return {
        ...state,
        record: {
          ...record,
          hordesHeld: Math.max(record.hordesHeld, action.wave),
          cleanHorde: record.cleanHorde || action.clean,
        },
      };
    case "voice":
      return { ...state, record: { ...record, voiceQuiet: record.voiceQuiet || action.heard === 0 } };
    case "chest": {
      const result: ChestResult = action.method === "forced" ? "forced" : action.broken === 0 ? "picked-clean" : "picked";
      const best = record.chest && CHEST_RANK[record.chest] >= CHEST_RANK[result] ? record.chest : result;
      return { ...state, record: { ...record, chest: best } };
    }
    case "deal": {
      const { given, received, reputation } = action.deal;
      const inventory = withoutItems(state.inventory, given ? [given] : []);
      return withReputation({ ...state, inventory: received ? [...inventory, received] : inventory }, state.reputation + reputation);
    }
    case "hunters":
      switch (action.outcome) {
        case "won": // o esquadrão deixa a munição para trás
          return {
            ...state,
            kills: state.kills + SQUAD_SIZE,
            inventory: [...state.inventory, "ammo"],
            record: { ...record, huntersSurvived: true },
          };
        case "escaped":
          return { ...state, record: { ...record, huntersSurvived: true } };
        case "pardoned":
          return {
            ...state,
            inventory: withoutItems(state.inventory, action.paid),
            reputation: PARDONED_REPUTATION,
            record: { ...record, huntersSurvived: true },
          };
        case "killed":
          return { ...state, deaths: state.deaths + 1 };
        default:
          return state;
      }
  }
}

export function conditionMoodles(state: SurvivalState) {
  const moodles: string[] = [];
  if (state.stomach === "sick") moodles.push("Sick");
  if (state.stomach === "severe") moodles.push("Severely Sick");
  if (state.infected) moodles.push("Infection");
  return moodles;
}

const MAX_RANKED_LOOT = 3; // saquear a mesma farmácia de novo não vale título

export type Rank ="Carne fresca" | "Sobrevivente" | "Veterano" | "Lenda de Lazarus";

export function rank(state: SurvivalState): Rank {
  const { record } = state;
  const score =
    state.kills +
    record.hordesHeld * 5 +
    record.takedowns * 3 +
    Math.min(record.lootFound, MAX_RANKED_LOOT) * 2 +
    (record.stealthBest !== null ? 5 : 0) -
    state.deaths * 4;
  if (score >= 40) return "Lenda de Lazarus";
  if (score >= 15) return "Veterano";
  if (score >= 5) return "Sobrevivente";
  return "Carne fresca";
}

export function shareText(state: SurvivalState, url: string) {
  const deaths = `${state.deaths} ${state.deaths === 1 ? "morte" : "mortes"}`;
  return `Cheguei ao dia ${state.day} no site do Project Lazarus: ${state.kills} abates, ${deaths}. Título: ${rank(state)}. Você dura mais? ${url}`;
}

/** Dia da última seção cujo topo já passou da linha de leitura. */
export function currentDay(sections: { day: number; top: number }[], readingLine: number) {
  return sections.filter((s) => s.top <= readingLine).reduce((day, s) => Math.max(day, s.day), 0);
}

// Lazarus Scarcity, locais comuns (ver content/progression).
export function lootForDay(day: number) {
  if (day >= 40) return 25;
  if (day >= 15) return 42;
  if (day >= 7) return 72;
  return 100;
}

const threats: [fromDay: number, text: string][] = [
  [60, "Teto de 100 hostis"],
  [45, "Teto de 90 hostis"],
  [30, "Teto de 80 hostis"],
  [20, "Teto de 70 hostis"],
  [12, "Especiais, Hollow e gás"],
  [10, "Primeira horda"],
  [6, "Runners à noite"],
  [3, "Os sentidos deles ligaram"],
  [0, "Poucos walkers"],
];

export function threatForDay(day: number) {
  return threats.find(([from]) => day >= from)![1];
}

export type FearMoodle = "Tense" | "Fearful" | "Panicked";

export function fearMoodle(fear: number): FearMoodle | null {
  if (fear >= 85) return "Panicked";
  if (fear >= 60) return "Fearful";
  if (fear >= 30) return "Tense";
  return null;
}
