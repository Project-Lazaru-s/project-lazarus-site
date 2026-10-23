import { describe, expect, it } from "vitest";
import { dossiers } from "@/content/origins";
import {
  available,
  cuesFor,
  decodeSave,
  encodeSave,
  type OriginsState,
  pagesFor,
  reduce,
  scriptFor,
  START,
  wellVerdict,
} from "./origins";

const havenScript = scriptFor("haven");
const gates = havenScript.filter((s) => s.kind === "gate");

/** Avança até o fim de Haven passando por todos os portões. */
function playHaven(state: OriginsState) {
  let s = reduce(state, { type: "open", faction: "haven" });
  for (let i = 0; i < 200; i++) {
    const step = havenScript[s.at.haven!];
    if (step.kind === "end") break;
    s = reduce(s, step.kind === "gate" ? { type: "pass", gate: step.gate } : { type: "next" });
  }
  return s;
}

describe("Antes das Bandeiras: script", () => {
  it("runs Haven as 3 parts, each with its gate, and ends once", () => {
    expect(havenScript.filter((s) => s.kind === "part")).toHaveLength(3);
    expect(gates.map((g) => g.kind === "gate" && g.gate)).toEqual(["poco", "enfermaria", "trocas"]);
    expect(havenScript.at(-1)?.kind).toBe("end");
  });

  it("only Haven is open for now; the other folders are sealed", () => {
    expect(available("haven")).toBe(true);
    for (const id of ["rovers", "wardens", "military"] as const) expect(available(id)).toBe(false);
    expect(dossiers.map((d) => d.id)).toEqual(["haven", "rovers", "wardens", "military"]);
  });
});

describe("Antes das Bandeiras: reducer", () => {
  it("opens a folder, waits at each gate and only the right gate opens it", () => {
    let s = reduce(START, { type: "open", faction: "rovers" });
    expect(s).toBe(START); // lacrada
    s = reduce(START, { type: "open", faction: "haven" });
    expect(s.open).toBe("haven");
    const gateAt = havenScript.findIndex((x) => x.kind === "gate");
    s = { ...s, at: { haven: gateAt } };
    expect(reduce(s, { type: "next" })).toBe(s);
    expect(reduce(s, { type: "pass", gate: "trocas" })).toBe(s);
    expect(reduce(s, { type: "pass", gate: "poco" }).at.haven).toBe(gateAt + 1);
  });

  it("keeps the place in a folder when you go back to the desk", () => {
    let s = reduce(reduce(START, { type: "open", faction: "haven" }), { type: "next" });
    s = reduce(s, { type: "close" });
    expect(s.open).toBeNull();
    expect(reduce(s, { type: "open", faction: "haven" }).at.haven).toBe(1);
  });

  it("finishing stamps the folder as read and returns to the desk", () => {
    const end = playHaven(START);
    expect(havenScript[end.at.haven!].kind).toBe("end");
    const done = reduce(end, { type: "finish" });
    expect(done).toEqual({ open: null, at: {}, done: ["haven"] });
    expect(reduce(done, { type: "open", faction: "haven" }).at.haven).toBe(0); // reler do começo
    expect(reduce(reduce(done, { type: "open", faction: "haven" }), { type: "finish" }).done).toEqual(["haven"]);
  });

  it("collects one dossier page per part already passed", () => {
    expect(pagesFor(START, "haven")).toEqual([]);
    const end = playHaven(START);
    expect(pagesFor(end, "haven").map((p) => p.numeral)).toEqual(["I", "II", "III"]);
    expect(pagesFor(reduce(end, { type: "finish" }), "haven")).toHaveLength(3);
  });
});

describe("Antes das Bandeiras: save", () => {
  it("round-trips and rejects anything that is not a valid point", () => {
    const s = playHaven(START);
    expect(decodeSave(encodeSave(s))).toEqual(s);
    expect(decodeSave("")).toBeNull();
    expect(decodeSave("{")).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, open: "rovers", at: {}, done: [] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, open: null, at: { haven: 999 }, done: [] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, open: null, at: {}, done: ["x"] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ v: 1, open: "haven", at: {}, done: [] }))).toBeNull();
  });
});

describe("Antes das Bandeiras: well gate", () => {
  it("waits until every bucket is given, refuses an empty share and names the rule", () => {
    expect(wellVerdict([3, 3, 2, 1])).toEqual({ done: false });
    expect(wellVerdict([4, 3, 3, 0])).toMatchObject({ done: true, ok: false });
    expect(wellVerdict([3, 2, 3, 2])).toMatchObject({ done: true, ok: true, rule: expect.stringMatching(/iguais/) });
    expect(wellVerdict([1, 1, 1, 7])).toMatchObject({ ok: true, rule: expect.stringMatching(/busca/) });
    expect(wellVerdict([4, 4, 1, 1])).toMatchObject({ ok: true, rule: expect.stringMatching(/não consegue/) });
    expect(wellVerdict([1, 1, 7, 1])).toMatchObject({ ok: true, rule: expect.stringMatching(/crianças/i) });
  });
});

describe("Antes das Bandeiras: sound cues", () => {
  it("part card, recovered page, pencil and ending", () => {
    const open = reduce(START, { type: "open", faction: "haven" });
    expect(cuesFor(open, START).map((c) => c.name)).toEqual(["loreAct"]);
    const line = reduce(open, { type: "next" });
    expect(cuesFor(line, open).map((c) => c.name)).toEqual(["lorePencil"]);
    const gateAt = havenScript.findIndex((x) => x.kind === "gate");
    const atGate: OriginsState = { ...open, at: { haven: gateAt } };
    expect(cuesFor(reduce(atGate, { type: "pass", gate: "poco" }), atGate).map((c) => c.name)).toEqual(["lorePage"]);
    const end = playHaven(START);
    const beforeEnd: OriginsState = { ...end, at: { haven: end.at.haven! - 1 } };
    expect(cuesFor(end, beforeEnd).map((c) => c.name)).toEqual(["loreEnding"]);
    expect(cuesFor(reduce(end, { type: "finish" }), end).map((c) => c.name)).toEqual(["loreStamp"]);
    expect(cuesFor(open, open)).toEqual([]);
  });
});
