// Como está o mundo do Project Lazarus num dado dia (tabela de progressão do 1.0.0).
import { progressionEvents } from "@/content/progression";
import { lootForDay } from "./survival";

/** Lazarus Scarcity, locais arriscados. */
export function riskyLootForDay(day: number) {
  if (day >= 40) return 45;
  if (day >= 15) return 62;
  if (day >= 7) return 86;
  return 100;
}

/** Teto de hostis por perto. A tabela só dá números a partir do dia 20. */
export function hostileCap(day: number): number | null {
  if (day >= 60) return 100;
  if (day >= 45) return 90;
  if (day >= 30) return 80;
  if (day >= 20) return 70;
  return null;
}

export function eventsUntil(day: number) {
  return progressionEvents.filter((e) => e.day <= day);
}

export const KEY_DAYS = [...new Set(progressionEvents.map((e) => e.day))];

export function worldAt(day: number) {
  return {
    day,
    commonLoot: lootForDay(day),
    riskyLoot: riskyLootForDay(day),
    hostileCap: hostileCap(day),
    active: eventsUntil(day),
    fresh: progressionEvents.filter((e) => e.day === day),
  };
}
