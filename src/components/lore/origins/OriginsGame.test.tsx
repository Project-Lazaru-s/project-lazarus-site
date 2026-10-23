import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { origins } from "@/content/origins";
import { decodeSave, SAVE_KEY } from "@/lib/lore/origins";
import { OriginsGame } from "./OriginsGame";

const game = () => screen.getByRole("region", { name: origins.title });

/** Clica nas falas e cartões até aparecer o portão (ou o item recuperado). */
function advanceUntil(label: RegExp) {
  for (let i = 0; i < 120; i++) {
    if (screen.queryByRole("group", { name: label })) return screen.getByRole("group", { name: label });
    const next = screen.queryByRole("button", { name: /^continuar|ler a parte/i });
    if (!next) break;
    fireEvent.click(next);
  }
  return screen.getByRole("group", { name: label });
}

function openHaven() {
  fireEvent.click(screen.getByRole("button", { name: /abrir o arquivo/i }));
  fireEvent.click(screen.getByRole("button", { name: /abrir a pasta haven/i }));
  act(() => vi.runAllTimers()); // a capa da pasta abre antes da história
}

const give = (gate: HTMLElement, group: string, n: number) => {
  for (let i = 0; i < n; i++) fireEvent.click(within(gate).getByRole("button", { name: `Dar um balde para ${group}` }));
};

describe("OriginsGame", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("opens on the desk with four folders; only Haven can be opened for now", () => {
    render(<OriginsGame />);
    expect(within(game()).getByRole("link", { name: /ler sem jogar/i })).toHaveAttribute(
      "href",
      "/lore/antes-das-bandeiras/leitura",
    );
    fireEvent.click(screen.getByRole("button", { name: /abrir o arquivo/i }));
    expect(screen.getByRole("heading", { name: /escolha uma pasta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /abrir a pasta haven/i })).toBeEnabled();
    for (const name of ["Rovers", "Wardens", "Military"])
      expect(screen.getByRole("button", { name: `${name}: pasta em recuperação` })).toBeDisabled();
  });

  it("the well notebook refuses an empty share and signs a rule once every bucket is given", () => {
    render(<OriginsGame />);
    openHaven();
    expect(screen.getByRole("heading", { name: /o poço/i })).toBeInTheDocument();
    const well = advanceUntil(/caderno do poço/i);
    give(well, "Idosos", 4);
    give(well, "Feridos", 3);
    give(well, "Crianças", 3);
    expect(within(well).getByText(/ninguém pode sair sem nada/i)).toBeInTheDocument();
    expect(within(well).queryByRole("button", { name: /assinar/i })).not.toBeInTheDocument();
    fireEvent.click(within(well).getByRole("button", { name: "Tirar um balde de Idosos" }));
    give(well, "Quem busca água", 1);
    expect(within(well).getByText(/regra do poço/i)).toBeInTheDocument();
    fireEvent.click(within(well).getByRole("button", { name: /assinar a regra/i }));
    expect(screen.getByText(/página do dossiê recuperada/i)).toBeInTheDocument();
  });

  it("plays Haven to the end, stamps the folder as read and saves it", () => {
    render(<OriginsGame />);
    openHaven();

    const well = advanceUntil(/caderno do poço/i);
    for (const g of ["Idosos", "Feridos", "Crianças", "Quem busca água"])
      give(well, g, g === "Idosos" || g === "Feridos" ? 3 : 2);
    fireEvent.click(within(well).getByRole("button", { name: /assinar a regra/i }));

    const ward = advanceUntil(/triagem da enfermaria/i);
    const route = { cama: /cama da enfermaria/i, febre: /observação/i };
    const order = ["cama", "febre", "febre", "cama"] as const;
    fireEvent.click(within(ward).getByRole("button", { name: /examinar/i }));
    fireEvent.click(within(ward).getByRole("button", { name: route.febre })); // errado: sem febre
    expect(within(ward).getByText(/precisa da cama/i)).toBeInTheDocument();
    for (const ward_ of order) {
      if (within(ward).queryByRole("button", { name: /examinar/i }))
        fireEvent.click(within(ward).getByRole("button", { name: /examinar/i }));
      fireEvent.click(within(ward).getByRole("button", { name: route[ward_] }));
    }
    fireEvent.click(within(ward).getByRole("button", { name: /^continuar/i }));

    const trade = advanceUntil(/banca de trocas/i);
    fireEvent.click(within(trade).getByRole("button", { name: "Nada" }));
    expect(within(trade).getByText(/não se enche por bondade/i)).toBeInTheDocument();
    fireEvent.click(within(trade).getByRole("button", { name: "Sementes" }));
    fireEvent.click(within(trade).getByRole("button", { name: /levar a criança/i }));
    fireEvent.click(within(trade).getByRole("button", { name: /abrir a banca/i }));

    advanceUntil(/o caderno do poço/i);
    fireEvent.click(screen.getByRole("button", { name: /devolver a pasta/i }));
    expect(screen.getByRole("heading", { name: /escolha uma pasta/i })).toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: /abrir a pasta haven/i })).getByText("Lido")).toBeInTheDocument();
    expect(decodeSave(localStorage.getItem(SAVE_KEY)!)).toEqual({ open: null, at: {}, done: ["haven"] });
  });

  it("goes back to the desk mid-folder and offers to continue where you stopped", () => {
    render(<OriginsGame />);
    openHaven();
    fireEvent.click(screen.getByRole("button", { name: /ler a parte i/i }));
    fireEvent.click(screen.getByRole("button", { name: /voltar às pastas/i }));
    expect(screen.getByText(/em andamento/i)).toBeInTheDocument();
    expect(decodeSave(localStorage.getItem(SAVE_KEY)!)).toMatchObject({ open: null, at: { haven: 1 } });
  });
});
