import { describe, expect, it } from "vitest";
import { links, navItems, site } from "./site";

describe("site", () => {
  it("publishes the public version only, never an alpha", () => {
    expect(site.version).toBe("1.0.0");
    expect(JSON.stringify(site).toLowerCase()).not.toContain("alpha");
  });

  it("points the download to the latest GitHub release", () => {
    expect(links.download).toBe(
      "https://github.com/Project-Lazaru-s/project-lazarus-modpack/releases/latest",
    );
  });

  it("does not invent store or community links", () => {
    const all = JSON.stringify(links).toLowerCase();
    for (const banned of ["discord", "curseforge.com", "modrinth"]) {
      expect(all).not.toContain(banned);
    }
  });

  it("navigates to every section of the site", () => {
    expect(navItems.map((item) => item.href)).toEqual([
      "/",
      "/modpack",
      "/faccoes",
      "/progressao",
      "/mods",
      "/baixar",
      "/changelog",
      "/blog",
      "/creditos",
    ]);
  });
});
