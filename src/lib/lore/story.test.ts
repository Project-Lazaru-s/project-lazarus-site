import { describe, expect, it } from "vitest";
import { cancela, gangs, inicioDoCaos } from "@/content/lore";
import {
  decodeSave,
  encodeSave,
  hotspots,
  isTuned,
  pages,
  progress,
  reduce,
  script,
  signal,
  sharedFacts,
  START,
  triageOptions,
  type Step,
  type StoryState,
} from "./story";

const gates = script.filter((s): s is Extract<Step, { kind: "gate" }> => s.kind === "gate");

/** Joga a história inteira: avança falas e cumpre cada portão. */
function playThrough(road = "rovers") {
  let state: StoryState = START;
  for (let guard = 0; guard < 500 && script[state.at].kind !== "end"; guard++) {
    const step = script[state.at];
    state =
      step.kind === "gate" ? reduce(state, { type: "pass", gate: step.gate, road }) : reduce(state, { type: "next" });
  }
  return state;
}

describe("script", () => {
  it("opens each act with its title card, in order", () => {
    const cards = script.filter((s) => s.kind === "act").map((s) => s.act);
    expect(cards).toEqual([0, 1, 2, 3, 4]);
  });

  it("blocks every act behind at least one gate, and Act V ends on the road", () => {
    for (const act of [0, 1, 2, 3, 4]) expect(gates.some((g) => g.act === act)).toBe(true);
    expect(gates.map((g) => g.gate)).toEqual(["triagem", "radio", "investigar", "comparar", "paredes", "estrada"]);
  });

  it("tells the whole condensed text of every act", () => {
    const lines = script.flatMap((s) => (s.kind === "line" ? [s.text] : []));
    for (const act of inicioDoCaos.acts) {
      for (const text of [...act.scenes, act.quote, ...act.after]) expect(lines).toContain(text);
    }
  });

  it("finishes on the ending", () => {
    expect(script.at(-1)?.kind).toBe("end");
  });
});

describe("reduce", () => {
  it("advances line by line", () => {
    expect(reduce(START, { type: "next" }).at).toBe(1);
  });

  it("does not let the story move past a gate without solving it", () => {
    const atGate: StoryState = { at: script.indexOf(gates[0]) };
    expect(reduce(atGate, { type: "next" })).toBe(atGate);
    expect(reduce(atGate, { type: "pass", gate: "radio" })).toBe(atGate);
    expect(reduce(atGate, { type: "pass", gate: "triagem" }).at).toBe(atGate.at + 1);
  });

  it("needs a real road to leave Act V", () => {
    const atRoad: StoryState = { at: script.indexOf(gates.at(-1)!) };
    expect(reduce(atRoad, { type: "pass", gate: "estrada" })).toBe(atRoad);
    expect(reduce(atRoad, { type: "pass", gate: "estrada", road: "atalho" })).toBe(atRoad);
    expect(reduce(atRoad, { type: "pass", gate: "estrada", road: "wardens" })).toMatchObject({ road: "wardens" });
  });

  it("plays from the first line to the ending, collecting the five notebook pages", () => {
    const end = playThrough();
    expect(script[end.at].kind).toBe("end");
    expect(end.road).toBe("rovers");
    expect(pages(end).map((p) => p.note)).toEqual(inicioDoCaos.acts.map((a) => a.note));
    expect(pages(START)).toEqual([]);
  });

  it("restarts from the beginning", () => {
    expect(reduce(playThrough(), { type: "restart" })).toEqual(START);
  });
});

describe("progress", () => {
  it("knows the act being played", () => {
    expect(progress(START)).toEqual({ act: 0, of: 5 });
    expect(progress({ at: script.indexOf(gates[3]) }).act).toBe(3);
  });
});

describe("save", () => {
  it("round-trips a game in progress", () => {
    const state: StoryState = { at: 12 };
    expect(decodeSave(encodeSave(state))).toEqual(state);
    const done = playThrough("wardens");
    expect(decodeSave(encodeSave(done))).toEqual(done);
  });

  it("refuses tampered or broken saves", () => {
    expect(decodeSave("{nope")).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, at: -1 }))).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, at: 99999 }))).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, at: 3.5 }))).toBeNull();
    // Passou da estrada sem ter escolhido uma.
    expect(decodeSave(JSON.stringify({ v: 1, at: script.length - 1 }))).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 2, at: 1 }))).toBeNull();
  });
});

describe("gates", () => {
  it("Act I: only the honest outcome is accepted", () => {
    expect(triageOptions.filter((o) => o.correct).map((o) => o.label)).toEqual(["movimento após declaração de óbito"]);
    for (const wrong of triageOptions.filter((o) => !o.correct)) expect(wrong.reply.length).toBeGreaterThan(0);
  });

  it("Act II: the signal clears near the emergency frequency", () => {
    expect(signal(93.7)).toBe(1);
    expect(signal(88)).toBe(0);
    expect(isTuned(93.6)).toBe(true);
    expect(isTuned(95)).toBe(false);
  });

  it("Act III: three places to inspect, one per faction", () => {
    expect(hotspots.map((h) => h.faction)).toEqual(["Haven", "Rovers", "Wardens"]);
  });

  it("Act IV: the facts both versions admit are the shared ones", () => {
    expect(sharedFacts).toEqual(cancela.facts);
  });

  it("Act V: every gang has a wall", () => {
    expect(gangs).toHaveLength(8);
  });
});
