import { describe, expect, it } from "vitest";
import { createChase, EXIT, run, stepChase, type ChaseState } from "./chase";

/** Corre `taps` vezes por segundo durante `seconds`. */
function play(taps: number, seconds = 15) {
  let state: ChaseState = createChase();
  const dt = 0.05;
  let sinceTap = 0;
  for (let t = 0; t < seconds && state.status === "running"; t += dt) {
    sinceTap += dt;
    if (taps > 0 && sinceTap >= 1 / taps) {
      state = run(state);
      sinceTap = 0;
    }
    state = stepChase(state, dt);
  }
  return state;
}

describe("chase", () => {
  it("starts with a head start over the zombie", () => {
    const state = createChase();
    expect(state.you).toBeGreaterThan(state.zombie);
    expect(state.status).toBe("running");
  });

  it("standing still gets you caught", () => {
    expect(play(0).status).toBe("caught");
  });

  it("running slowly is not enough", () => {
    expect(play(1.5).status).toBe("caught");
  });

  it("mashing the button gets you to the exit", () => {
    const end = play(5);
    expect(end.status).toBe("escaped");
    expect(end.you).toBe(EXIT);
  });

  it("is frozen once it is over", () => {
    const caught = play(0);
    expect(run(caught)).toBe(caught);
    expect(stepChase(caught, 1)).toBe(caught);
  });
});
