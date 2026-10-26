import { describe, expect, it } from "vitest";
import { links, modpackMenu, navGroups, navItems, requirements, site, topNav } from "./site";

describe("site", () => {
  it("publishes the public version only, never an alpha", () => {
    expect(site.version).toBe("1.0.0");
    expect(JSON.stringify(site).toLowerCase()).not.toContain("alpha");
  });

  it("counts the third-party mods as in the 1.0.0 release notes", () => {
    expect(requirements.find((r) => r.label === "Mods")?.value).toBe("109 do CurseForge + 8 Lazarus");
  });

  it("points the download to the latest GitHub release", () => {
    expect(links.download).toBe("https://github.com/Project-Lazaru-s/project-lazarus-modpack/releases/latest");
  });

  it("does not invent store or community links: only the real CurseForge page", () => {
    const { curseforge, ...rest } = links;
    expect(curseforge).toBe("https://www.curseforge.com/minecraft/modpacks/project-lazarus-the-long-collapse");
    const all = JSON.stringify(rest).toLowerCase();
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
      "/lore",
      "/servidor",
      "/mods",
      "/baixar",
      "/changelog",
      "/blog",
      "/creditos",
    ]);
  });

  it("keeps the top bar short: logo, the modpack menu, four links and the download button", () => {
    expect(topNav).toHaveLength(4);
    expect(modpackMenu.every((item) => item.description)).toBe(true);
    // O logo cobre "/", o botão cobre "/baixar"; o resto está no menu ou nos links.
    const top = ["/", "/baixar", ...modpackMenu.map((i) => i.href), ...topNav.map((i) => i.href)];
    expect(navItems.filter((i) => !top.includes(i.href)).map((i) => i.href)).toEqual(["/blog", "/creditos"]);
  });

  it("groups every page (but home and download) for the phone menu and the footer", () => {
    const grouped = navGroups.flatMap((g) => g.items.map((i) => i.href)).sort();
    expect(grouped).toEqual(
      navItems
        .map((i) => i.href)
        .filter((href) => href !== "/" && href !== "/baixar")
        .sort(),
    );
  });
});
