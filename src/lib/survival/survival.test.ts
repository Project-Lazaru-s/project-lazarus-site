import { describe, expect, it } from "vitest";
import {
  currentDay,
  fearMoodle,
  initialSurvival,
  lootForDay,
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
