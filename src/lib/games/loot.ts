// Farmácia saqueada: cada armário tem a chance de saque do dia (Lazarus Scarcity).
import type { Item } from "@/lib/survival/survival";
import type { Random } from "./random";

export const PHARMACY_LOOT: Item[] = ["antibiotic", "painkiller", "bandage", "water"];

export function openCabinet(lootPercent: number, random: Random): Item | null {
  const roll = random();
  if (roll * 100 >= lootPercent) return null;
  // Reaproveita a rolagem para escolher o item, mantendo uma rolagem por armário.
  return PHARMACY_LOOT[Math.floor((roll * 100 * PHARMACY_LOOT.length) / lootPercent) % PHARMACY_LOOT.length];
}
