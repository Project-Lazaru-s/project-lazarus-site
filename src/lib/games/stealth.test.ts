import { describe, expect, it } from "vitest";
import {
  createStealth,
  detection,
  noiseRadius,
  STREET_LENGTH,
  stepStealth,
  TIME_LIMIT,
  type Gait,
  type StealthState,
} from "./stealth";

function play(gait: Gait | ((s: StealthState) => Gait), seconds = 20) {
  let state = createStealth();
  for (let t = 0; t < seconds && state.status === "playing"; t += 0.05) {
    state = stepStealth(state, typeof gait === "function" ? gait(state) : gait, 0.05);
  }
  return state;
}

describe("noiseRadius", () => {
  it("grows with the gait: still < crouch < walk < run", () => {
    const radii = (["still", "crouch", "walk", "run"] as const).map((g) => noiseRadius(g, false));
    expect(radii).toEqual([...radii].sort((a, b) => a - b));
    expect(new Set(radii).size).toBe(4);
  });

  it("is louder on glass, even crouched", () => {
    expect(noiseRadius("walk", true)).toBeGreaterThan(noiseRadius("walk", false));
    expect(noiseRadius("crouch", true)).toBeGreaterThan(noiseRadius("crouch", false));
    expect(noiseRadius("still", true)).toBe(0);
  });
});

describe("detection", () => {
  it.each([
    [0, "calmo"],
    [30, "atenção"],
    [60, "investigando"],
    [100, "avistado"],
  ])("awareness %i → %s", (awareness, state) => {
    expect(detection(awareness)).toBe(state);
  });
});

describe("stepStealth", () => {
  it("crossing the street crouched reaches the end unseen, in time", () => {
    const end = play("crouch");
    expect(end.status).toBe("won");
    expect(end.time).toBeLessThan(TIME_LIMIT);
  });

  it("walking far from them and crouching close is the fastest safe way", () => {
    const smart = play((s) => (s.zombies.some((z) => Math.abs(z.x - s.x) < 14) ? "crouch" : "walk"));
    expect(smart.status).toBe("won");
    expect(smart.time).toBeLessThan(play("crouch").time);
  });

  it.each(["walk", "run"] as const)("going past the infected at a %s gets you spotted", (gait) => {
    expect(play(gait).status).toBe("spotted");
  });

  it("standing still runs out the clock", () => {
    const end = play("still");
    expect(end.status).toBe("timeout");
    expect(end.x).toBe(0);
  });

  it("awareness fades once the player goes quiet", () => {
    let state = createStealth();
    const zombie = state.zombies[0];
    state = { ...state, x: zombie.x, zombies: state.zombies.map((z, i) => (i === 0 ? { ...z, awareness: 50 } : z)) };
    state = stepStealth(state, "still", 1);
    expect(state.zombies[0].awareness).toBeLessThan(50);
  });

  it("is frozen once the run is over", () => {
    const end = play("run");
    expect(stepStealth(end, "walk", 1)).toBe(end);
  });

  it("never walks past the end of the street", () => {
    const end = play("crouch");
    expect(end.x).toBe(STREET_LENGTH);
  });
});

describe("alerted", () => {
  it("stays false crossing crouched and turns true once anyone starts investigating", () => {
    expect(play("crouch").alerted).toBe(false);
    expect(play("walk").alerted).toBe(true);
  });
});
