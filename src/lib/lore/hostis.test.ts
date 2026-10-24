import { describe, expect, it } from "vitest";
import { GUTTER_MAP, hostileDossiers, pickCases, testimonies } from "@/content/hostis";
import { parseMap } from "@/lib/games/route";
import { archive, patrolVerdict, rationDay, tuneStatic } from "./hostis";

describe("Os Hostis: script", () => {
  it("has the Deserters and The Hollow in 3 parts each and the gangs as 8 cases", () => {
    expect(hostileDossiers.map((d) => d.id)).toEqual(["desertores", "hollow", "gangues"]);
    const gates = (id: "desertores" | "hollow" | "gangues") =>
      archive.scriptFor(id).flatMap((s) => (s.kind === "gate" ? [s.gate] : []));
    expect(gates("desertores")).toEqual(["radio", "madrugada", "patrulha"]);
    expect(gates("hollow")).toEqual(["conta", "versoes", "luz"]);
    expect(gates("gangues")).toEqual(["rust", "lantern", "crowbar", "redtape", "gutter", "static", "tin", "pine"]);
  });

  it("saves apart from Arquivo 02", () => {
    expect(archive.SAVE_KEY).toBe("lazarus:lore:os-hostis");
    expect(archive.decodeSave(JSON.stringify({ v: 1, open: null, at: {}, done: ["haven"] }))).toBeNull();
    expect(archive.decodeSave(JSON.stringify({ v: 1, open: null, at: {}, done: ["hollow"] }))).toEqual({
      open: null,
      at: {},
      done: ["hollow"],
    });
  });
});

describe("Os Hostis: gates", () => {
  it("tells a real patrol from deserters", () => {
    expect(patrolVerdict("barreira", "military")).toBe(true);
    expect(patrolVerdict("ponte", "military")).toBe(false);
    expect(patrolVerdict("dupla", "desertores")).toBe(true);
  });

  it("the shelter's count stops closing: full portions end on day 5, half portions only delay it", () => {
    let stock = 44;
    for (let day = 1; day <= 4; day++) stock = rationDay(stock, "inteira").stock;
    expect(rationDay(stock, "inteira")).toEqual({ stock: 0, closes: false });
    expect(rationDay(10, "meia")).toEqual({ stock: 4, closes: true });
    expect(rationDay(4, "meia").closes).toBe(false);
  });

  it("both testimonies admit three things", () => {
    expect(testimonies.filter((t) => t.both)).toHaveLength(3);
  });

  it("every pick case has exactly one right answer", () => {
    for (const c of Object.values(pickCases)) expect(c.options.filter((o) => o.ok)).toHaveLength(1);
  });

  it("the drainage map has a free way through", () => {
    const map = parseMap(GUTTER_MAP);
    expect(map.start).toEqual({ r: 1, c: 1 });
    expect(map.goal).toEqual({ r: 6, c: 14 });
  });

  it("Static: the paid ad and the real call sit on different frequencies", () => {
    expect(tuneStatic(96)).toMatchObject({ locked: true, station: { real: false } });
    expect(tuneStatic(101.5)).toMatchObject({ locked: true, station: { real: true } });
    expect(tuneStatic(92).locked).toBe(false);
  });
});
