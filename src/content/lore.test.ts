import { describe, expect, it } from "vitest";
import { archive, inicioDoCaos, lineText, roads, whoIsWho } from "./lore";

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

describe("lore archive", () => {
  it("opens with O Início do Caos and Antes das Bandeiras and keeps the rest sealed", () => {
    const [first, second, ...rest] = archive;
    expect(first).toMatchObject({ sealed: false, slug: "o-inicio-do-caos" });
    expect(second).toMatchObject({ sealed: false, slug: "antes-das-bandeiras" });
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
      expect(words([...act.scenes, ...act.after].map(lineText).join(" "))).toBeLessThanOrEqual(200);
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

describe("clarity of the story", () => {
  const all = inicioDoCaos.acts.flatMap((a) => [...a.scenes, ...a.after].map(lineText)).join(" ");

  it("says plainly that the Military are the real army and the Wardens are civilians", () => {
    expect(all).toMatch(/Military: o exército de verdade/);
    expect(all).toMatch(/Os Wardens não são o exército/);
  });

  it("states why Rovers and Wardens became rivals before telling the night at the gate", () => {
    const [cause] = inicioDoCaos.acts[3].scenes.map(lineText);
    expect(cause).toMatch(/Rovers precisavam dela aberta/);
    expect(cause).toMatch(/Wardens só se sentiam seguros com ela fechada/);
  });

  it("illustrates scenes with images that exist", async () => {
    const { existsSync } = await import("node:fs");
    const scenes = inicioDoCaos.acts.flatMap((a) => [...a.scenes, ...a.after]).filter((l) => typeof l !== "string");
    expect(scenes.length).toBe(3);
    for (const scene of scenes) expect(existsSync(`public${(scene as { image: string }).image}`)).toBe(true);
  });

  it("lists who is who, each group introduced by the act where it appears", () => {
    expect(whoIsWho.map((g) => g.name)).toEqual([
      "Military",
      "Haven",
      "Rovers",
      "Wardens",
      "Desertores",
      "Gangues",
      "The Hollow",
    ]);
    expect(whoIsWho.find((g) => g.name === "Wardens")!.who).toMatch(/não militares/);
  });
});
