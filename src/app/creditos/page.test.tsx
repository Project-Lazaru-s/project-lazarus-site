import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { contributors, thirdPartyMods } from "@/content/credits";
import { links } from "@/content/site";
import CreditsPage from "./page";

describe("/creditos", () => {
  it("credits the author and contributors with their GitHub", () => {
    render(<CreditsPage />);
    for (const person of contributors) {
      expect(screen.getByRole("link", { name: person.name })).toHaveAttribute("href", person.url);
    }
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
