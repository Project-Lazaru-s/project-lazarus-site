// Estado do "sobrevivente" que atravessa a landing: o scroll avança os dias,
// os minigames somam abates, mortes e medo.

export type SurvivalState = { day: number; fear: number; kills: number; deaths: number };

export type SurvivalAction =
  | { type: "day"; day: number }
  | { type: "kill"; count: number }
  | { type: "death" }
  | { type: "fear"; amount: number }
  | { type: "sedative" };

export const initialSurvival: SurvivalState = { day: 0, fear: 0, kills: 0, deaths: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function survivalReducer(state: SurvivalState, action: SurvivalAction): SurvivalState {
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
  }
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
