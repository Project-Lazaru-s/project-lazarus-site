import { describe, expect, it } from "vitest";
import { progressionEvents } from "@/content/progression";
import { eventsUntil, hostileCap, KEY_DAYS, riskyLootForDay, worldAt } from "./progression";

describe("progressionEvents", () => {
  it("are in day order and stay inside days 0–60", () => {
    const days = progressionEvents.map((e) => e.day);
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(days[0]).toBe(0);
    expect(days.at(-1)).toBe(60);
  });

  it("never mention the internal alpha builds", () => {
    expect(JSON.stringify(progressionEvents).toLowerCase()).not.toContain("alpha");
  });
});

describe("riskyLootForDay (Lazarus Scarcity, risky locations)", () => {
  it.each([
    [0, 100],
    [7, 86],
    [15, 62],
    [40, 45],
    [60, 45],
  ])("day %i → %i%%", (day, loot) => {
    expect(riskyLootForDay(day)).toBe(loot);
  });
});

describe("hostileCap", () => {
  it("is only known from day 20, where the table gives numbers", () => {
    expect(hostileCap(19)).toBeNull();
    expect(hostileCap(20)).toBe(70);
    expect(hostileCap(30)).toBe(80);
    expect(hostileCap(45)).toBe(90);
    expect(hostileCap(60)).toBe(100);
  });
});

describe("eventsUntil", () => {
  it("accumulates what has already started", () => {
    expect(eventsUntil(0).map((e) => e.text)).toEqual(["Poucos walkers, longe de você."]);
    const day10 = eventsUntil(10).map((e) => e.text);
    expect(day10).toContain("Runners saem à noite.");
    expect(day10.some((t) => /primeira horda/i.test(t))).toBe(true);
    expect(day10.some((t) => /hollow/i.test(t))).toBe(false);
  });

  it("grows with the days", () => {
    const sizes = [0, 3, 10, 13, 20, 60].map((d) => eventsUntil(d).length);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(eventsUntil(60)).toHaveLength(progressionEvents.length);
  });
});

describe("worldAt", () => {
  it("sums up the world on a given day", () => {
    expect(worldAt(15)).toMatchObject({ day: 15, commonLoot: 42, riskyLoot: 62, hostileCap: null });
    expect(worldAt(15).fresh.map((e) => e.text).join(" ")).toMatch(/42%/);
  });

  it("marks only the events of that exact day as new", () => {
    expect(worldAt(11).fresh).toEqual([]);
    expect(worldAt(14).fresh.map((e) => e.text)).toEqual(["Runners em dobro."]);
  });
});

describe("KEY_DAYS", () => {
  it("are exactly the days where something changes", () => {
    expect(KEY_DAYS).toEqual([...new Set(progressionEvents.map((e) => e.day))]);
  });
});
