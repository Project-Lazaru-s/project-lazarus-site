import { describe, expect, it } from "vitest";
import { confrontHunters, haggleChance, isWanted, negotiate, PARDON_COST, WANTED_AT } from "./negotiation";

const always = (value: number) => () => value;

describe("negotiate", () => {
  it("a fair trade swaps items and earns reputation", () => {
    expect(negotiate("trade", 0, "bandage", "antibiotic", always(0.99))).toEqual({
      success: true,
      given: "bandage",
      received: "antibiotic",
      reputation: 10,
    });
  });

  it("you cannot trade or haggle with empty hands", () => {
    expect(negotiate("trade", 0, null, "antibiotic", always(0))).toMatchObject({ success: false, reputation: 0 });
    expect(negotiate("haggle", 0, null, "antibiotic", always(0))).toMatchObject({ success: false, reputation: 0 });
  });

  it("a good haggle gets the item and keeps yours; a bad one annoys the trader", () => {
    expect(negotiate("haggle", 0, "bandage", "ammo", always(0))).toEqual({
      success: true,
      given: null,
      received: "ammo",
      reputation: 0,
    });
    expect(negotiate("haggle", 0, "bandage", "ammo", always(0.99))).toEqual({
      success: false,
      given: null,
      received: null,
      reputation: -10,
    });
  });

  it("haggling is easier with a good reputation", () => {
    expect(haggleChance(60)).toBeGreaterThan(haggleChance(0));
    expect(haggleChance(-100)).toBeGreaterThan(0);
    expect(haggleChance(100)).toBeLessThan(1);
  });

  it("intimidation always costs reputation, and only sometimes works", () => {
    expect(negotiate("intimidate", 0, null, "antibiotic", always(0))).toEqual({
      success: true,
      given: null,
      received: "antibiotic",
      reputation: -30,
    });
    expect(negotiate("intimidate", 0, null, "antibiotic", always(0.99))).toMatchObject({
      success: false,
      received: null,
      reputation: -30,
    });
  });
});

describe("isWanted", () => {
  it("a faction sends hunters at -40 reputation or lower", () => {
    expect(isWanted(WANTED_AT + 1)).toBe(false);
    expect(isWanted(WANTED_AT)).toBe(true);
    expect(isWanted(-100)).toBe(true);
  });
});

describe("confrontHunters", () => {
  const unseen = { inventory: [], stealthBest: null };

  it("fighting the squad is a coin flip", () => {
    expect(confrontHunters("fight", unseen, always(0.1))).toEqual({ outcome: "won", paid: [] });
    expect(confrontHunters("fight", unseen, always(0.9))).toEqual({ outcome: "killed", paid: [] });
  });

  it("fleeing is easier for someone who already crossed the street unseen", () => {
    const roll = always(0.55);
    expect(confrontHunters("flee", unseen, roll).outcome).toBe("killed");
    expect(confrontHunters("flee", { ...unseen, stealthBest: 8 }, roll).outcome).toBe("escaped");
  });

  it("the Haven pardon costs supplies", () => {
    const rich = { inventory: ["bandage", "water", "ammo"] as const, stealthBest: null };
    expect(confrontHunters("pardon", { ...rich, inventory: [...rich.inventory] }, always(0))).toEqual({
      outcome: "pardoned",
      paid: ["bandage", "water"],
    });
    expect(PARDON_COST).toBe(2);
  });

  it("there is no pardon without supplies", () => {
    expect(confrontHunters("pardon", { inventory: ["bandage"], stealthBest: null }, always(0))).toEqual({
      outcome: "refused",
      paid: [],
    });
  });
});
