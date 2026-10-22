import { describe, expect, it } from "vitest";
import {
  conditionMoodles,
  currentDay,
  fearMoodle,
  initialSurvival,
  lootForDay,
  needsMoodles,
  rank,
  shareText,
  survivalReducer,
  threatForDay,
} from "./survival";

describe("currentDay", () => {
  const sections = [
    { day: 0, top: -900 },
    { day: 3, top: -100 },
    { day: 10, top: 600 },
  ];

  it("is the day of the last section whose top passed the reading line", () => {
    expect(currentDay(sections, 400)).toBe(3);
    expect(currentDay(sections, 700)).toBe(10);
  });

  it("starts at day 0 before any section", () => {
    expect(currentDay([{ day: 3, top: 900 }], 400)).toBe(0);
  });
});

describe("lootForDay (Lazarus Scarcity, common locations)", () => {
  it.each([
    [0, 100],
    [6, 100],
    [7, 72],
    [15, 42],
    [39, 42],
    [40, 25],
    [60, 25],
  ])("day %i → %i%%", (day, loot) => {
    expect(lootForDay(day)).toBe(loot);
  });
});

describe("threatForDay", () => {
  it("follows the progression table", () => {
    expect(threatForDay(0)).toMatch(/poucos walkers/i);
    expect(threatForDay(10)).toMatch(/primeira horda/i);
    expect(threatForDay(25)).toMatch(/70 hostis/i);
    expect(threatForDay(60)).toMatch(/100 hostis/i);
  });
});

describe("fearMoodle", () => {
  it.each([
    [0, null],
    [29, null],
    [30, "Tense"],
    [60, "Fearful"],
    [85, "Panicked"],
    [100, "Panicked"],
  ])("fear %i → %s", (fear, moodle) => {
    expect(fearMoodle(fear)).toBe(moodle);
  });
});

describe("survivalReducer", () => {
  it("moves through days and never goes back", () => {
    let state = survivalReducer(initialSurvival, { type: "day", day: 10 });
    state = survivalReducer(state, { type: "day", day: 3 });
    expect(state.day).toBe(10);
  });

  it("counts kills and deaths", () => {
    let state = survivalReducer(initialSurvival, { type: "kill", count: 3 });
    state = survivalReducer(state, { type: "death" });
    expect(state).toMatchObject({ kills: 3, deaths: 1 });
  });

  it("raises fear up to 100 and a sedative clears it", () => {
    let state = survivalReducer(initialSurvival, { type: "fear", amount: 70 });
    state = survivalReducer(state, { type: "fear", amount: 70 });
    expect(state.fear).toBe(100);
    state = survivalReducer(state, { type: "sedative" });
    expect(state.fear).toBe(0);
  });

  it("lets fear calm down but not below zero", () => {
    const state = survivalReducer({ ...initialSurvival, fear: 10 }, { type: "fear", amount: -25 });
    expect(state.fear).toBe(0);
  });
});

describe("inventory and conditions", () => {
  it("keeps what the survivor loots and tracks how many cabinets were opened", () => {
    let state = survivalReducer(initialSurvival, { type: "loot", item: "antibiotic" });
    state = survivalReducer(state, { type: "loot", item: null });
    expect(state.inventory).toEqual(["antibiotic"]);
    expect(state.record).toMatchObject({ lootOpened: 2, lootFound: 1 });
  });

  it("dirty water makes you sick, and dehydrated it gets severe", () => {
    expect(survivalReducer(initialSurvival, { type: "drink", outcome: "safe" }).stomach).toBe("ok");
    expect(survivalReducer(initialSurvival, { type: "drink", outcome: "sick" }).stomach).toBe("sick");
    expect(survivalReducer(initialSurvival, { type: "drink", outcome: "severe" }).stomach).toBe("severe");
  });

  it("a clean takedown is a kill; a botched one is a bite", () => {
    const clean = survivalReducer(initialSurvival, { type: "takedown", success: true });
    expect(clean).toMatchObject({ kills: 1, infected: false, record: { takedowns: 1 } });
    const botched = survivalReducer(initialSurvival, { type: "takedown", success: false });
    expect(botched).toMatchObject({ kills: 0, infected: true });
  });

  it("an antibiotic cures dysentery and infection, and is used up", () => {
    let state = survivalReducer(initialSurvival, { type: "loot", item: "antibiotic" });
    state = survivalReducer(state, { type: "drink", outcome: "severe" });
    state = survivalReducer(state, { type: "takedown", success: false });
    state = survivalReducer(state, { type: "use", item: "antibiotic" });
    expect(state).toMatchObject({ stomach: "ok", infected: false, inventory: [] });
  });

  it("cannot use what you do not have", () => {
    const sick = survivalReducer(initialSurvival, { type: "drink", outcome: "sick" });
    expect(survivalReducer(sick, { type: "use", item: "antibiotic" })).toBe(sick);
  });

  it("records the best stealth time and the hordes held", () => {
    let state = survivalReducer(initialSurvival, { type: "stealth", time: 9.2, clean: false });
    state = survivalReducer(state, { type: "stealth", time: 7.5, clean: false });
    state = survivalReducer(state, { type: "stealth", time: 8, clean: false });
    state = survivalReducer(state, { type: "horde-held", wave: 2, clean: false });
    state = survivalReducer(state, { type: "horde-held", wave: 1, clean: false });
    expect(state.record).toMatchObject({ stealthBest: 7.5, hordesHeld: 2 });
  });
});

describe("conditionMoodles", () => {
  it("lists dysentery and infection as moodles", () => {
    expect(conditionMoodles(initialSurvival)).toEqual([]);
    expect(conditionMoodles({ ...initialSurvival, stomach: "sick", infected: true })).toEqual(["Sick", "Infection"]);
    expect(conditionMoodles({ ...initialSurvival, stomach: "severe" })).toEqual(["Severely Sick"]);
  });
});

describe("rank", () => {
  it("goes from fresh meat to legend", () => {
    expect(rank(initialSurvival)).toBe("Carne fresca");
    const veteran = {
      ...initialSurvival,
      kills: 12,
      record: { ...initialSurvival.record, hordesHeld: 2, takedowns: 2, stealthBest: 8 },
    };
    expect(rank(veteran)).toBe("Veterano");
    expect(rank({ ...veteran, kills: 40 })).toBe("Lenda de Lazarus");
  });

  it("looting the same pharmacy over and over does not make a legend", () => {
    const hoarder = { ...initialSurvival, record: { ...initialSurvival.record, lootFound: 50 } };
    expect(rank(hoarder)).toBe("Sobrevivente");
  });

  it("deaths cost points", () => {
    const survivor = { ...initialSurvival, kills: 10 };
    expect(rank(survivor)).toBe("Sobrevivente");
    expect(rank({ ...survivor, deaths: 3 })).toBe("Carne fresca");
  });
});

describe("shareText", () => {
  it("sums up the run for sharing", () => {
    const state = { ...initialSurvival, day: 60, kills: 12, deaths: 1 };
    expect(shareText(state, "https://lazarus.example")).toBe(
      "Cheguei ao dia 60 no site do Project Lazarus: 12 abates, 1 morte. Título: Sobrevivente. Você dura mais? https://lazarus.example",
    );
  });

  it("pluralizes deaths", () => {
    expect(shareText({ ...initialSurvival, deaths: 2 }, "u")).toContain("2 mortes");
    expect(shareText({ ...initialSurvival, deaths: 0 }, "u")).toContain("0 mortes");
  });
});

describe("reputation and the wanted system", () => {
  const withBandage = { ...initialSurvival, inventory: ["bandage" as const] };

  it("a deal swaps items and moves reputation", () => {
    const state = survivalReducer(withBandage, {
      type: "deal",
      deal: { success: true, given: "bandage", received: "ammo", reputation: 10 },
    });
    expect(state).toMatchObject({ inventory: ["ammo"], reputation: 10 });
  });

  it("reputation stays between -100 and +100", () => {
    let state = initialSurvival;
    for (let i = 0; i < 5; i++) {
      state = survivalReducer(state, { type: "deal", deal: { success: false, given: null, received: null, reputation: -30 } });
    }
    expect(state.reputation).toBe(-100);
  });

  it("remembers having been wanted", () => {
    let state = survivalReducer(initialSurvival, {
      type: "deal",
      deal: { success: false, given: null, received: null, reputation: -40 },
    });
    expect(state.record.wanted).toBe(true);
    state = survivalReducer({ ...state, inventory: ["bandage", "water"] }, { type: "hunters", outcome: "pardoned", paid: ["bandage", "water"] });
    expect(state).toMatchObject({ reputation: -20, inventory: [], record: { wanted: true } });
  });

  it("beating the squad counts kills and leaves their ammo behind", () => {
    const state = survivalReducer(initialSurvival, { type: "hunters", outcome: "won", paid: [] });
    expect(state).toMatchObject({ kills: 3, inventory: ["ammo"] });
  });

  it("being caught by the hunters is a death", () => {
    expect(survivalReducer(initialSurvival, { type: "hunters", outcome: "killed", paid: [] }).deaths).toBe(1);
  });
});

describe("sound", () => {
  it("starts muted and follows the visitor's choice", () => {
    expect(initialSurvival.sound).toBe(false);
    expect(survivalReducer(initialSurvival, { type: "sound", on: true }).sound).toBe(true);
  });
});

describe("thirst and hunger", () => {
  it("start full and drop while time passes, thirst faster than hunger", () => {
    expect(initialSurvival).toMatchObject({ thirst: 100, hunger: 100 });
    const later = survivalReducer(initialSurvival, { type: "time", seconds: 120 });
    expect(later.thirst).toBeLessThan(100);
    expect(later.hunger).toBeLessThan(100);
    expect(100 - later.thirst).toBeGreaterThan(100 - later.hunger);
  });

  it("never go below zero", () => {
    const state = survivalReducer(initialSurvival, { type: "time", seconds: 3600 });
    expect(state).toMatchObject({ thirst: 0, hunger: 0 });
  });

  it("bottled water and canned food bring them back", () => {
    const empty = { ...initialSurvival, thirst: 10, hunger: 10, inventory: ["water" as const, "food" as const] };
    let state = survivalReducer(empty, { type: "use", item: "water" });
    state = survivalReducer(state, { type: "use", item: "food" });
    expect(state.thirst).toBeGreaterThan(50);
    expect(state.hunger).toBeGreaterThan(50);
    expect(state.inventory).toEqual([]);
  });

  it("drinking quenches thirst, but dysentery throws up water and food", () => {
    const thirsty = { ...initialSurvival, thirst: 20, hunger: 80 };
    expect(survivalReducer(thirsty, { type: "drink", outcome: "safe" })).toMatchObject({ thirst: 100, hunger: 80 });
    const sick = survivalReducer(thirsty, { type: "drink", outcome: "sick" });
    expect(sick.thirst).toBeLessThan(100);
    expect(sick.hunger).toBeLessThan(80);
  });
});

describe("needs moodles", () => {
  it.each([
    [{ thirst: 30, hunger: 30 }, []],
    [{ thirst: 20, hunger: 100 }, ["Thirsty"]],
    [{ thirst: 0, hunger: 100 }, ["Dehydrated"]],
    [{ thirst: 100, hunger: 25 }, ["Hungry"]],
    [{ thirst: 100, hunger: 0 }, ["Starving"]],
  ])("%o → %o", (needs, moodles) => {
    expect(needsMoodles({ ...initialSurvival, ...needs })).toEqual(moodles);
  });
});
