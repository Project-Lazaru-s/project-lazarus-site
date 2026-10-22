// Não beba essa água: escolher a fonte certa com sede (Lazarus Moodles, disenteria).
import type { DrinkOutcome } from "@/lib/survival/survival";
import type { Random } from "./random";

export type WaterSourceId = "river" | "puddle" | "cauldron" | "bottle" | "can";
export type WaterSource = { id: WaterSourceId; label: string; risk: number };

/** Chance de disenteria de cada fonte. Água lacrada nunca faz mal. */
export const WATER_SOURCES: WaterSource[] = [
  { id: "river", label: "Água do rio", risk: 0.55 },
  { id: "puddle", label: "Poça de chuva", risk: 0.8 },
  { id: "cauldron", label: "Caldeirão", risk: 0.45 },
  { id: "bottle", label: "Garrafa lacrada", risk: 0 },
  { id: "can", label: "Água enlatada", risk: 0 },
];

export const THIRST_LIMIT = 6; // segundos até desmaiar de sede
export const DEHYDRATED_AT = 3.5; // depois disso, a doença vem pior

export function drink(source: WaterSourceId, elapsed: number, random: Random): DrinkOutcome {
  const { risk } = WATER_SOURCES.find((s) => s.id === source)!;
  if (random() >= risk) return "safe";
  return elapsed >= DEHYDRATED_AT ? "severe" : "sick";
}

/** Três fontes sujas e uma lacrada, em ordem embaralhada. */
export function pickSources(random: Random): WaterSource[] {
  const dirty = WATER_SOURCES.filter((s) => s.risk > 0);
  const sealed = WATER_SOURCES.filter((s) => s.risk === 0);
  const safe = sealed[Math.floor(random() * sealed.length)];
  const options = [...dirty];
  options.splice(Math.floor(random() * (options.length + 1)), 0, safe);
  return options;
}
