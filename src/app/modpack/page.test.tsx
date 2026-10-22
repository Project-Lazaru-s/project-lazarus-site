import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { skillTrees, systems } from "@/content/systems";
import ModpackPage from "./page";

describe("/modpack", () => {
  it("has an anchored section per game system", () => {
    render(<ModpackPage />);
    for (const system of systems) {
      expect(screen.getByRole("region", { name: system.title })).toHaveAttribute("id", system.id);
    }
  });

  it("links systems to the Lazarus mod behind them", () => {
    render(<ModpackPage />);
    const stealth = screen.getByRole("region", { name: "Furtividade" });
    expect(within(stealth).getByRole("link", { name: /lazarus stealth/i })).toHaveAttribute("href", "/mods/stealth");
  });

  it("has a side index tuned to each system", () => {
    render(<ModpackPage />);
    const index = screen.getByRole("navigation", { name: /sistemas/i });
    for (const system of systems) {
      expect(within(index).getByRole("link", { name: new RegExp(system.title) })).toHaveAttribute(
        "href",
        `#${system.id}`,
      );
    }
  });

  it("lists the skill trees", () => {
    render(<ModpackPage />);
    const table = screen.getByRole("table", {
      name: /árvores de habilidades/i,
    });
    expect(within(table).getAllByRole("row")).toHaveLength(skillTrees.length + 1);
  });

  it("states the technical requirements", () => {
    render(<ModpackPage />);
    expect(screen.getByText(/forge 47\.4\.10/i)).toBeInTheDocument();
  });
});
