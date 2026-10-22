// Negociação com os Rovers e sistema de procurado (Lazarus NPCs + Lazarus Events).
import type { Item } from "@/lib/survival/survival";
import type { Random } from "./random";

export type Stance = "trade" | "haggle" | "intimidate";
export type Deal = { success: boolean; given: Item | null; received: Item | null; reputation: number };

export const WANTED_AT = -40; // reputação a partir da qual a facção manda caçadores
export const PARDON_COST = 2; // suprimentos que o Haven cobra pelo perdão
export const PARDONED_REPUTATION = -20;

const TRADE_GAIN = 10;
const HAGGLE_FAIL = -10;
const INTIMIDATE_COST = -30;
const INTIMIDATE_CHANCE = 0.35;

export function haggleChance(reputation: number) {
  return Math.min(0.9, Math.max(0.1, 0.45 + reputation / 200));
}

export function negotiate(stance: Stance, reputation: number, offer: Item | null, want: Item, random: Random): Deal {
  const nothing: Deal = { success: false, given: null, received: null, reputation: 0 };
  switch (stance) {
    case "trade":
      return offer ? { success: true, given: offer, received: want, reputation: TRADE_GAIN } : nothing;
    case "haggle":
      if (!offer) return nothing;
      return random() < haggleChance(reputation)
        ? { success: true, given: null, received: want, reputation: 0 }
        : { ...nothing, reputation: HAGGLE_FAIL };
    case "intimidate":
      return random() < INTIMIDATE_CHANCE
        ? { success: true, given: null, received: want, reputation: INTIMIDATE_COST }
        : { ...nothing, reputation: INTIMIDATE_COST };
  }
}

export function isWanted(reputation: number) {
  return reputation <= WANTED_AT;
}

export type HunterChoice = "fight" | "flee" | "pardon";
export type HunterOutcome = "won" | "escaped" | "pardoned" | "killed" | "refused";

const FIGHT_CHANCE = 0.5;
const FLEE_CHANCE = 0.4;
const STEALTH_BONUS = 0.3; // quem já atravessou a rua sem ser visto foge melhor

export function confrontHunters(
  choice: HunterChoice,
  survivor: { inventory: readonly Item[]; stealthBest: number | null },
  random: Random,
): { outcome: HunterOutcome; paid: Item[] } {
  switch (choice) {
    case "fight":
      return { outcome: random() < FIGHT_CHANCE ? "won" : "killed", paid: [] };
    case "flee": {
      const chance = FLEE_CHANCE + (survivor.stealthBest !== null ? STEALTH_BONUS : 0);
      return { outcome: random() < chance ? "escaped" : "killed", paid: [] };
    }
    case "pardon":
      return survivor.inventory.length >= PARDON_COST
        ? { outcome: "pardoned", paid: survivor.inventory.slice(0, PARDON_COST) }
        : { outcome: "refused", paid: [] };
  }
}
