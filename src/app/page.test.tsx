import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { highlights } from "@/content/home";
import { site } from "@/content/site";
import { systems } from "@/content/systems";
import HomePage from "./page";

describe("/ (home)", () => {
  it("presents the modpack with its tagline", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /project lazarus/i })).toBeInTheDocument();
    expect(screen.getByText(site.tagline)).toBeInTheDocument();
  });

  it("calls to download the current version", () => {
    render(<HomePage />);
    const hero = screen.getByRole("region", { name: /apresentação/i });
    expect(within(hero).getByRole("link", { name: `Baixar ${site.version}` })).toHaveAttribute("href", "/baixar");
  });

  it("shows 3 to 6 highlights, each pointing to a real section", () => {
    render(<HomePage />);
    expect(highlights.length).toBeGreaterThanOrEqual(3);
    expect(highlights.length).toBeLessThanOrEqual(6);
    const anchors = systems.map((s) => `/modpack#${s.id}`);
    for (const highlight of highlights) {
      expect(["/faccoes", "/progressao", ...anchors]).toContain(highlight.href);
      expect(screen.getByRole("link", { name: new RegExp(highlight.title) })).toHaveAttribute("href", highlight.href);
    }
  });

  it("never mentions alpha builds", () => {
    const { container } = render(<HomePage />);
    expect(container.textContent?.toLowerCase()).not.toContain("alpha");
  });
});
