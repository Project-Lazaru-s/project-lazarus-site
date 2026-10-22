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
      expect(screen.getByRole("link", { name: new RegExp(`^${highlight.title}`) })).toHaveAttribute("href", highlight.href);
    }
  });

  it("is a journey through the days, in order", () => {
    const { container } = render(<HomePage />);
    const days = [...container.querySelectorAll<HTMLElement>("[data-day]")].map((s) => Number(s.dataset.day));
    expect(days[0]).toBe(0);
    expect(days.at(-1)).toBe(60);
    expect(days).toEqual([...days].sort((a, b) => a - b));
  });

  it("has the stealth and horde encounters, the radio and the survivor HUD", () => {
    render(<HomePage />);
    expect(screen.getByRole("application", { name: /rua com infectados/i })).toBeInTheDocument();
    expect(screen.getByRole("application", { name: /contenção de horda/i })).toBeInTheDocument();
    expect(screen.getByRole("application", { name: /fontes de água/i })).toBeInTheDocument();
    expect(screen.getByRole("application", { name: /beco/i })).toBeInTheDocument();
    expect(screen.getByRole("application", { name: /farmácia/i })).toBeInTheDocument();
    expect(screen.getByRole("application", { name: /sua voz/i })).toBeInTheDocument();
    expect(screen.getByRole("application", { name: /acampamento dos rovers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Carne fresca" })).toBeInTheDocument();
    expect(screen.getByRole("log", { name: /rádio/i })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /sobrevivente/i })).toHaveTextContent("Dia 0");
  });

  it("never mentions alpha builds", () => {
    const { container } = render(<HomePage />);
    expect(container.textContent?.toLowerCase()).not.toContain("alpha");
  });
});
