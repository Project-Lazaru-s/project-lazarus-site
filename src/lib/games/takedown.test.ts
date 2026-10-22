import { describe, expect, it } from "vitest";
import { createTakedown, markerAt, TAKEDOWN_ROUNDS, tryTakedown } from "./takedown";

describe("takedown", () => {
  it("the marker sweeps back and forth across the bar", () => {
    expect(markerAt(0, 1)).toBe(0);
    expect(markerAt(0.5, 1)).toBeCloseTo(1);
    expect(markerAt(1, 1)).toBeCloseTo(0);
    expect(markerAt(0.25, 1)).toBeCloseTo(0.5);
  });

  it("hitting the center finishes him; missing it is a bite", () => {
    let state = createTakedown();
    state = tryTakedown(state, 0.5);
    expect(state.results).toEqual([true]);
    state = tryTakedown(state, 0.05);
    expect(state.results).toEqual([true, false]);
  });

  it("each round gets faster and tighter", () => {
    const state = createTakedown();
    const rounds = state.rounds;
    expect(rounds).toHaveLength(TAKEDOWN_ROUNDS);
    for (let i = 1; i < rounds.length; i++) {
      expect(rounds[i].speed).toBeGreaterThan(rounds[i - 1].speed);
      expect(rounds[i].window).toBeLessThan(rounds[i - 1].window);
    }
  });

  it("ends after the last round and ignores further tries", () => {
    let state = createTakedown();
    for (let i = 0; i < TAKEDOWN_ROUNDS; i++) state = tryTakedown(state, 0.5);
    expect(state.done).toBe(true);
    expect(tryTakedown(state, 0.5)).toBe(state);
  });

  it("a hit just inside the window counts, just outside does not", () => {
    const window = createTakedown().rounds[0].window;
    expect(tryTakedown(createTakedown(), 0.5 + window / 2 - 0.001).results).toEqual([true]);
    expect(tryTakedown(createTakedown(), 0.5 + window / 2 + 0.001).results).toEqual([false]);
  });
});
