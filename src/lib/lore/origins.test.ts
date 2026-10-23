import { describe, expect, it } from "vitest";
import { arrivals, dossiers } from "@/content/origins";
import {
  available,
  crewVerdict,
  entryVerdict,
  retreatAt,
  cuesFor,
  decodeSave,
  encodeSave,
  type OriginsState,
  pagesFor,
  reduce,
  returnMap,
  ROVERS_MAP,
  scriptFor,
  START,
  watchVerdict,
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

  it("Haven, Rovers and Wardens are open; Military is still sealed; the other folders are sealed", () => {
    expect(available("haven")).toBe(true);
    for (const id of ["military"] as const) expect(available(id)).toBe(false);
    expect(dossiers.map((d) => d.id)).toEqual(["haven", "rovers", "wardens", "military"]);
  });
});

describe("Antes das Bandeiras: reducer", () => {
  it("opens a folder, waits at each gate and only the right gate opens it", () => {
    let s = reduce(START, { type: "open", faction: "military" });
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
    expect(decodeSave(JSON.stringify({ v: 1, open: "military", at: {}, done: [] }))).toBeNull();
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

describe("Antes das Bandeiras: Rovers gates", () => {
  it("runs Rovers as 3 parts with the bus, the crew and the guaranteed return", () => {
    expect(available("rovers")).toBe(true);
    const ids = scriptFor("rovers").flatMap((s) => (s.kind === "gate" ? [s.gate] : []));
    expect(ids).toEqual(["onibus", "tripulacao", "volta"]);
  });

  it("the crew needs someone to drive, repair, trade and listen", () => {
    expect(crewVerdict(["josue", "celia", "tania"])).toEqual({ done: false });
    expect(crewVerdict(["josue", "celia", "tania", "igor"])).toEqual({ done: true, missing: ["escutar"] });
    expect(crewVerdict(["josue", "celia", "tania", "bento"])).toEqual({ done: true, missing: [] });
  });

  it("the return map starts at the fuel station and the infected close the street of the way in", () => {
    const middle = [{ r: 5, c: 1 }, ...Array.from({ length: 21 }, (_, i) => ({ r: 5, c: i + 2 }))];
    const back = returnMap(ROVERS_MAP, middle);
    expect(back[5]).toBe("#GXXXXXXXXXXXXXXXXXXXXS#");
    expect(back[1]).toBe(ROVERS_MAP[1]); // a avenida continua aberta para voltar
  });
});

describe("Antes das Bandeiras: Wardens gates", () => {
  it("runs Wardens as 3 parts with the watch, the entry book and the retreat", () => {
    expect(available("wardens")).toBe(true);
    const ids = scriptFor("wardens").flatMap((s) => (s.kind === "gate" ? [s.gate] : []));
    expect(ids).toEqual(["turnos", "entrada", "retirada"]);
  });

  it("the watch needs every shift covered, no double shift and all three on the roster", () => {
    expect(watchVerdict(["nogueira", "ivete", null, "caio"])).toEqual({ done: false });
    expect(watchVerdict(["nogueira", "nogueira", "ivete", "caio"])).toMatchObject({ problem: /Meia-noite/ });
    expect(watchVerdict(["nogueira", "ivete", "nogueira", "ivete"])).toMatchObject({ problem: /fora da escala/ });
    expect(watchVerdict(["nogueira", "ivete", "caio", "nogueira"])).toEqual({ done: true, problem: null });
  });

  it("each mistake at the gate writes a rule; the right call goes through", () => {
    const [familia, troca, atrasado] = arrivals;
    expect(entryVerdict(familia, "entra", false)).toEqual({ ok: false, rule: "Ninguém entra sem revista." });
    expect(entryVerdict(familia, "espera", true)).toMatchObject({ ok: false, rule: /antes do anoitecer/ });
    expect(entryVerdict(familia, "entra", true)).toEqual({ ok: true });
    expect(entryVerdict(troca, "entra", true)).toMatchObject({ ok: false, rule: /ferida escondida/i });
    expect(entryVerdict(atrasado, "espera", false)).toEqual({ ok: true });
  });

  it("holding the gate lets one survivor in per hold while the horde closes in", () => {
    expect(retreatAt(0)).toEqual({ outside: 4, distance: 6, overrun: false });
    expect(retreatAt(4)).toEqual({ outside: 0, distance: 2, overrun: false });
    expect(retreatAt(5).overrun).toBe(true); // um passo a mais e a horda chega
  });
});
