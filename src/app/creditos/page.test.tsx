import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { thirdPartyMods } from "@/content/credits";
import { links } from "@/content/site";
import CreditsPage from "./page";

describe("/creditos", () => {
  it("credits KaiD3v and FSantiago75 as co-authors", () => {
    render(<CreditsPage />);
    const team = screen.getByRole("region", { name: "Autores" });
    expect(within(team).getByRole("link", { name: "KaiD3v" })).toHaveAttribute("href", "https://kaidev.com.br");
    expect(within(team).getByRole("link", { name: "FSantiago75" })).toHaveAttribute(
      "href",
      "https://github.com/FSantiago75",
    );
    expect(within(team).getAllByText("Co-autor")).toHaveLength(2);
  });

  it("groups the main third-party mods", () => {
    render(<CreditsPage />);
    for (const { group } of thirdPartyMods) {
      expect(screen.getByRole("heading", { name: group })).toBeInTheDocument();
    }
    expect(screen.getByText("CityWorld")).toBeInTheDocument();
  });

  it("links to the full list with authors", () => {
    render(<CreditsPage />);
    expect(screen.getByRole("link", { name: /lista completa/i })).toHaveAttribute("href", links.modsList);
  });
});
