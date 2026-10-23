import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gangs, inicioDoCaos } from "@/content/lore";
import StoryPage from "./page";

describe("/lore/o-inicio-do-caos/leitura", () => {
  it("tells the five acts in order, each with an anchor", () => {
    render(<StoryPage />);
    const titles = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titles.slice(0, 5)).toEqual(inicioDoCaos.acts.map((act) => `Ato ${act.numeral}${act.title}`));
    for (const act of inicioDoCaos.acts) expect(document.getElementById(act.id)).not.toBeNull();
  });

  it("lets the reader jump between acts", () => {
    render(<StoryPage />);
    const nav = screen.getByRole("navigation", { name: /atos/i });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(inicioDoCaos.acts.map((act) => `#${act.id}`));
  });

  it("brings the triage sheet, the gang names and the disputed night", () => {
    render(<StoryPage />);
    expect(screen.getByText("movimento após declaração de óbito")).toBeInTheDocument();
    for (const gang of gangs) expect(screen.getByText(gang)).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: /versões da noite/i })).toBeInTheDocument();
  });

  it("ends with the reader's Day 1: download, or play Day 0 on the site", () => {
    render(<StoryPage />);
    const cta = screen.getByRole("region", { name: /seu dia 1/i });
    expect(within(cta).getByRole("link", { name: /baixar e começar/i })).toHaveAttribute("href", "/baixar");
    expect(within(cta).getByRole("link", { name: /dia 0/i })).toHaveAttribute("href", "/");
  });
});
