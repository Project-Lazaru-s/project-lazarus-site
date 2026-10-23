import { describe, expect, it } from "vitest";
import { archive, inicioDoCaos, roads } from "./lore";

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

describe("lore archive", () => {
  it("opens with O Início do Caos and keeps the other files sealed", () => {
    const [first, ...rest] = archive;
    expect(first).toMatchObject({ sealed: false, slug: "o-inicio-do-caos" });
    expect(rest.length).toBeGreaterThan(0);
    expect(rest.every((entry) => entry.sealed)).toBe(true);
  });
});

describe("O Início do Caos", () => {
  it("tells five acts in order", () => {
    expect(inicioDoCaos.acts.map((act) => act.id)).toEqual(["ato-1", "ato-2", "ato-3", "ato-4", "ato-5"]);
    expect(inicioDoCaos.acts.map((act) => act.numeral)).toEqual(["I", "II", "III", "IV", "V"]);
  });

  it("keeps every act short enough to read in about a minute", () => {
    for (const act of inicioDoCaos.acts) {
      expect(words([...act.scenes, ...act.after].join(" "))).toBeLessThanOrEqual(200);
    }
  });

  it("gives each act an illustration and a trace left in the world", () => {
    for (const act of inicioDoCaos.acts) {
      expect(act.image).toMatch(/^\/images\/lore\/ato-\d\.png$/);
      expect(act.trace.length).toBeGreaterThan(0);
    }
  });

  it("offers three roads, each with its own outcome", () => {
    expect(roads.map((road) => road.id)).toEqual(["wardens", "rovers", "desconhecido"]);
    expect(new Set(roads.map((road) => road.outcome)).size).toBe(3);
  });
});
