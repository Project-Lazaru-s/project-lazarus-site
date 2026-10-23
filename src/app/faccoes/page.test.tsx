import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { factions } from "@/content/factions";
import FactionsPage from "./page";

describe("/faccoes", () => {
  it("has a sheet per faction, with an anchor and its profile", () => {
    render(<FactionsPage />);
    for (const faction of factions) {
      const sheet = screen.getByRole("article", { name: faction.name });
      expect(sheet).toHaveAttribute("id", faction.slug);
      expect(within(sheet).getByText(faction.profile)).toBeInTheDocument();
    }
  });

  it("illustrates every faction with a described scene", () => {
    render(<FactionsPage />);
    for (const name of [
      /refúgio haven/i,
      /acampamento rovers/i,
      /forte wardens/i,
      /quarentena militar/i,
      /the preacher/i,
      /desertores/i,
      /gangues rivais/i,
    ]) {
      expect(screen.getByRole("img", { name })).toBeInTheDocument();
    }
  });

  it("explains the wanted system", () => {
    render(<FactionsPage />);
    const section = screen.getByRole("region", { name: /procurado/i });
    expect(within(section).getByText(/caçadores de recompensa/i)).toBeInTheDocument();
  });
});
