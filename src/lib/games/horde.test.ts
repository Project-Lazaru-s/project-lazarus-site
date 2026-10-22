import { describe, expect, it } from "vitest";
import {
  aimJitter,
  createHorde,
  hitPart,
  nextWave,
  shoot,
  stepHorde,
  waveSize,
  type HordeState,
} from "./horde";

const fixed = () => 0.5;

function zombie(state: HordeState, kind: string) {
  const z = state.zombies.find((z) => z.kind === kind);
  if (!z) throw new Error(`no ${kind} in wave`);
  return z;
}

/** Headshots until the street is empty (shots draw more infected, so it takes more than one per zombie). */
function clearWave(state: HordeState) {
  while (state.zombies.length > 0) state = shoot(state, state.zombies[0].id, "head", fixed);
  return state;
}

describe("waveSize", () => {
  it("starts small and grows 15% per horde", () => {
    expect(waveSize(1)).toBe(6);
    expect(waveSize(2)).toBe(7);
    expect(waveSize(5)).toBe(Math.ceil(6 * 1.15 ** 4));
  });
});

describe("createHorde", () => {
  it("spawns the wave far away, runners included", () => {
    const state = createHorde(1, fixed);
    expect(state.zombies).toHaveLength(6);
    expect(state.zombies.every((z) => z.distance >= 100)).toBe(true);
    expect(state.zombies.some((z) => z.kind === "runner")).toBe(true);
  });

  it("brings armored soldiers from the second horde on", () => {
    expect(createHorde(1, fixed).zombies.some((z) => z.kind === "soldier")).toBe(false);
    expect(createHorde(2, fixed).zombies.some((z) => z.kind === "soldier")).toBe(true);
  });
});

describe("hitPart (dual hitbox: head is the centered 8x8 on top of a 16x32 sprite)", () => {
  it.each([
    [0.5, 0.1, 0, "head"],
    [0.5, 0.24, 0, "head"],
    [0.5, 0.3, 0, "body"],
    [0.5, 0.95, 0, "body"],
    [0.5, 0.2, 0.1, "body"],
    [0.1, 0.1, 0, "miss"],
    [0.5, 0.05, -0.1, "miss"],
    [0.5, 0.95, 0.1, "miss"],
  ])("x=%f y=%f jitter=%f → %s", (x, y, jitter, part) => {
    expect(hitPart(x, y, jitter)).toBe(part);
  });
});

describe("aimJitter", () => {
  it("is zero when calm and grows with fear", () => {
    expect(aimJitter(0, () => 1)).toBe(0);
    expect(Math.abs(aimJitter(100, () => 1))).toBeGreaterThan(Math.abs(aimJitter(50, () => 1)));
  });
});

describe("shoot", () => {
  it("a headshot kills a walker", () => {
    const state = createHorde(1, fixed);
    const walker = zombie(state, "walker");
    const after = shoot(state, walker.id, "head", fixed);
    expect(after.zombies.find((z) => z.id === walker.id)).toBeUndefined();
    expect(after.kills).toBe(1);
  });

  it("body shots need several hits", () => {
    let state = createHorde(1, fixed);
    const walker = zombie(state, "walker");
    state = shoot(state, walker.id, "body", fixed);
    expect(state.zombies.find((z) => z.id === walker.id)).toBeDefined();
    state = shoot(shoot(state, walker.id, "body", fixed), walker.id, "body", fixed);
    expect(state.zombies.find((z) => z.id === walker.id)).toBeUndefined();
  });

  it("a soldier's helmet stops the first headshot", () => {
    let state = createHorde(2, fixed);
    const soldier = zombie(state, "soldier");
    state = shoot(state, soldier.id, "head", fixed);
    expect(state.zombies.find((z) => z.id === soldier.id)?.helmet).toBe(false);
    state = shoot(state, soldier.id, "head", fixed);
    expect(state.zombies.find((z) => z.id === soldier.id)).toBeUndefined();
  });

  it("spends ammo, also on a miss, and stops at zero", () => {
    let state = { ...createHorde(1, fixed), ammo: 1 };
    state = shoot(state, -1, "miss", fixed);
    expect(state.ammo).toBe(0);
    expect(shoot(state, state.zombies[0].id, "head", fixed)).toBe(state);
  });

  it("every fifth shot draws one more infected", () => {
    let state = createHorde(1, fixed);
    for (let i = 0; i < 5; i++) state = shoot(state, -1, "miss", fixed);
    expect(state.zombies).toHaveLength(7);
  });
});

describe("stepHorde", () => {
  it("brings the infected closer, runners faster", () => {
    const state = createHorde(1, fixed);
    const after = stepHorde(state, 1);
    const walked = (kind: string) => zombie(state, kind).distance - zombie(after, kind).distance;
    expect(walked("walker")).toBeGreaterThan(0);
    expect(walked("runner")).toBeGreaterThan(walked("walker"));
  });

  it("is breached when one of them reaches the barricade", () => {
    expect(stepHorde(createHorde(1, fixed), 60).status).toBe("breached");
  });

  it("is held when the wave is cleared", () => {
    expect(stepHorde(clearWave(createHorde(1, fixed)), 0.1).status).toBe("held");
  });
});

describe("nextWave", () => {
  it("keeps the score, refills ammo and sends a bigger horde", () => {
    const cleared = clearWave(createHorde(1, fixed));
    const next = nextWave(cleared, fixed);
    expect(next).toMatchObject({ wave: 2, kills: cleared.kills, status: "playing", ammo: createHorde(2, fixed).ammo });
    expect(next.zombies).toHaveLength(waveSize(2));
  });
});
