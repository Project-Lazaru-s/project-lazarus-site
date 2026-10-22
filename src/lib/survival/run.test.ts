import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, unlockedBy } from "./achievements";
import { runReducer, type RunAction } from "./run";
import { initialSurvival, type SurvivalState } from "./survival";

const play = (actions: RunAction[], from: SurvivalState = initialSurvival) => actions.reduce(runReducer, from);
const ids = (state: SurvivalState) => state.achievements;

describe("ACHIEVEMENTS", () => {
  it("has unique ids, a title and a description each", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
    }
  });

  it("starts with nothing unlocked", () => {
    expect(unlockedBy(initialSurvival)).toEqual([]);
  });
});

describe("unlocking", () => {
  it.each<[string, RunAction[]]>([
    ["silencio", [{ type: "stealth", time: 9, clean: true }]],
    ["so-na-cabeca", [{ type: "horde-held", wave: 1, clean: true }]],
    ["muralha", [{ type: "horde-held", wave: 3, clean: false }]],
    ["mestre-gazua", [{ type: "chest", method: "picked", broken: 0 }]],
    ["boca-fechada", [{ type: "voice", heard: 0 }]],
    ["procurado-vivo", [{ type: "hunters", outcome: "escaped", paid: [] }]],
    [
      "imunizado",
      [
        { type: "loot", item: "antibiotic" },
        { type: "drink", outcome: "sick" },
        { type: "use", item: "antibiotic" },
      ],
    ],
    ["maos-limpas", [{ type: "day", day: 60 }]],
  ])("%s", (id, actions) => {
    expect(ids(play(actions))).toContain(id);
  });

  it("does not unlock the near misses", () => {
    const state = play([
      { type: "stealth", time: 9, clean: false },
      { type: "horde-held", wave: 1, clean: false },
      { type: "chest", method: "picked", broken: 1 },
      { type: "chest", method: "forced", broken: 0 },
      { type: "voice", heard: 2 },
      { type: "hunters", outcome: "killed", paid: [] },
      { type: "loot", item: "antibiotic" },
      { type: "use", item: "antibiotic" },
      { type: "kill", count: 1 },
      { type: "day", day: 60 },
    ]);
    expect(ids(state)).toEqual([]);
  });

  it("keeps the best result when an encounter is replayed", () => {
    const state = play([
      { type: "chest", method: "picked", broken: 0 },
      { type: "chest", method: "forced", broken: 0 },
      { type: "stealth", time: 8, clean: true },
      { type: "stealth", time: 7, clean: false },
    ]);
    expect(state.record).toMatchObject({ chest: "picked-clean", stealthClean: true, stealthBest: 7 });
  });

  it("announces each achievement once, in order", () => {
    const state = play([
      { type: "voice", heard: 0 },
      { type: "voice", heard: 0 },
      { type: "stealth", time: 9, clean: true },
    ]);
    expect(state.toasts.map((t) => t.id)).toEqual(["boca-fechada", "silencio"]);
    expect(new Set(state.toasts.map((t) => t.n)).size).toBe(2);
  });
});

describe("new run and loading", () => {
  it("a new run starts over but keeps achievements and the sound setting", () => {
    const state = play([
      { type: "day", day: 15 },
      { type: "kill", count: 4 },
      { type: "voice", heard: 0 },
      { type: "sound", on: true },
      { type: "reset" },
    ]);
    expect(state).toMatchObject({ day: 0, kills: 0, sound: true, achievements: ["boca-fechada"], toasts: [] });
  });

  it("loading replaces the run", () => {
    const saved = { ...initialSurvival, day: 13, kills: 7 };
    expect(runReducer(initialSurvival, { type: "load", state: saved })).toMatchObject({ day: 13, kills: 7 });
  });
});
