import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { factions } from "./factions";
import { lazarusMods } from "./mods";
import { progression } from "./progression";
import { skillTrees, systems } from "./systems";
import { thirdPartyMods } from "./credits";

const publicFile = (src: string) => existsSync(path.join(process.cwd(), "public", src));
const unique = (values: string[]) => new Set(values).size === values.length;

describe("site content", () => {
  it("never mentions the internal alpha builds", () => {
    const all = JSON.stringify({ factions, lazarusMods, progression, systems, skillTrees, thirdPartyMods });
    expect(all.toLowerCase()).not.toContain("alpha");
  });

  it("lists the 8 Lazarus mods with the 1.0.0 versions", () => {
    expect(Object.fromEntries(lazarusMods.map((m) => [m.name, m.version]))).toEqual({
      "Lazarus Events": "1.4.1",
      "Lazarus NPCs": "1.20.0",
      "Lazarus Stealth": "0.3.0",
      "Lazarus Moodles": "1.17.0",
      "Lazarus Wrecks": "0.3.0",
      "Lazarus Maps": "0.3.0",
      "Lazarus Scarcity": "0.2.0",
      "Lazarus Status": "1.1.2",
    });
  });

  it("gives every mod a unique slug, an org repository and a banner on disk", () => {
    expect(unique(lazarusMods.map((m) => m.slug))).toBe(true);
    for (const mod of lazarusMods) {
      expect(mod.repo).toBe(`https://github.com/Project-Lazaru-s/lazarus-${mod.slug}`);
      expect(publicFile(mod.banner), mod.banner).toBe(true);
    }
  });

  it("gives every faction a unique slug and only images that exist", () => {
    expect(unique(factions.map((f) => f.slug))).toBe(true);
    for (const faction of factions) {
      if (faction.image) expect(publicFile(faction.image.src), faction.image.src).toBe(true);
    }
  });

  it("orders the progression by day", () => {
    const starts = progression.map((stage) => stage.from);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it("gives every system section a unique anchor", () => {
    expect(unique(systems.map((s) => s.id))).toBe(true);
  });
});
