import { describe, expect, it } from "vitest";
import { ambientZombieCount, ambientZombies, drift, MAX_AMBIENT, skyAt } from "./scenery";

describe("ambientZombieCount", () => {
  it("is empty before their senses turn on and grows with the threat", () => {
    expect(ambientZombieCount(0)).toBe(0);
    expect(ambientZombieCount(2)).toBe(0);
    expect(ambientZombieCount(3)).toBeGreaterThan(0);
    const counts = [3, 6, 10, 12, 20, 30, 45, 60].map(ambientZombieCount);
    expect(counts).toEqual([...counts].sort((a, b) => a - b));
    expect(ambientZombieCount(60)).toBe(MAX_AMBIENT);
  });
});

describe("ambientZombies", () => {
  it("is the same on the server and in the browser", () => {
    expect(ambientZombies(10, 4)).toEqual(ambientZombies(10, 4));
  });

  it("gives every zombie a unique id and a sane walk", () => {
    const zombies = ambientZombies(60, MAX_AMBIENT);
    expect(new Set(zombies.map((z) => z.id)).size).toBe(MAX_AMBIENT);
    for (const z of zombies) {
      expect([1, -1]).toContain(z.direction);
      expect(z.duration).toBeGreaterThan(0);
      expect(z.delay).toBeLessThanOrEqual(0);
    }
  });

  it("brings runners only from day 6, when they come out at night", () => {
    expect(ambientZombies(5, 6).some((z) => z.kind === "runner")).toBe(false);
    expect(ambientZombies(6, 6).some((z) => z.kind === "runner")).toBe(true);
  });

  it("runners cross faster than walkers", () => {
    const zombies = ambientZombies(30, 9);
    const avg = (kind: string) => {
      const d = zombies.filter((z) => z.kind === kind).map((z) => z.duration);
      return d.reduce((a, b) => a + b) / d.length;
    };
    expect(avg("runner")).toBeLessThan(avg("walker"));
  });
});

describe("drift", () => {
  it("slides a layer sideways as the page scrolls, wrapping on its tile", () => {
    expect(drift(0, 0.5, 640)).toBe(0);
    expect(drift(100, 0.5, 640)).toBe(-50);
    expect(drift(1400, 0.5, 640)).toBe(-60);
  });

  it("farther layers move less", () => {
    expect(Math.abs(drift(300, 0.1, 640))).toBeLessThan(Math.abs(drift(300, 0.4, 640)));
  });
});

describe("skyAt", () => {
  it("is a sunset at day 0 and night at day 60", () => {
    expect(skyAt(0)).toEqual({ top: "rgb(58 29 16)", bottom: "rgb(217 130 43)" });
    expect(skyAt(60)).toEqual({ top: "rgb(5 7 13)", bottom: "rgb(18 24 38)" });
  });

  it("blends in between and clamps past the end", () => {
    expect(skyAt(30).bottom).toBe("rgb(118 77 41)");
    expect(skyAt(90)).toEqual(skyAt(60));
  });
});
