import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { initialSurvival, type SurvivalState } from "@/lib/survival/survival";
import { Dossier } from "./Dossier";
import { SurvivalProvider } from "./SurvivalProvider";

const run: Partial<SurvivalState> = {
  day: 60,
  kills: 14,
  deaths: 1,
  infected: true,
  inventory: ["bandage"],
  record: { ...initialSurvival.record, stealthBest: 7.4, hordesHeld: 2, takedowns: 2, lootOpened: 3, lootFound: 1 },
};

function renderDossier(initial: Partial<SurvivalState> = run) {
  render(
    <SurvivalProvider initial={initial}>
      <Dossier />
    </SurvivalProvider>,
  );
}

describe("Dossier", () => {
  it("gives the survivor a title", () => {
    renderDossier();
    expect(screen.getByRole("heading", { name: "Veterano" })).toBeInTheDocument();
  });

  it("lists what happened in every encounter", () => {
    renderDossier();
    const value = (term: string) => screen.getByText(term).nextElementSibling?.textContent;
    expect(value("Abates")).toBe("14");
    expect(value("Mortes")).toBe("1");
    expect(value("Melhor travessia")).toBe("7,4 s");
    expect(value("Hordas contidas")).toBe("2");
    expect(value("Finalizações")).toBe("2");
    expect(value("Saque")).toBe("1 de 3");
    expect(value("Condição")).toBe("Infection");
    expect(value("Mochila")).toBe("Bandagem");
  });

  it("shows dashes for encounters that were not played", () => {
    renderDossier({});
    const value = (term: string) => screen.getByText(term).nextElementSibling?.textContent;
    expect(value("Melhor travessia")).toBe("—");
    expect(value("Condição")).toBe("Saudável");
    expect(value("Mochila")).toBe("Vazia");
  });

  it("copies the run summary to share it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderDossier();
    await userEvent.click(screen.getByRole("button", { name: /compartilhar/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("14 abates"));
    expect(await screen.findByText(/copiado/i)).toBeInTheDocument();
  });
});
