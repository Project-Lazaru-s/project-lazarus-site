import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { archive } from "@/lib/lore/hostis";
import { HostisGame } from "./HostisGame";

/** Clica nas falas e cartões até aparecer o portão (ou o item recuperado). */
function advanceUntil(label: RegExp) {
  for (let i = 0; i < 200; i++) {
    if (screen.queryByRole("group", { name: label })) return screen.getByRole("group", { name: label });
    const next = screen.queryByRole("button", { name: /^continuar|^ler (a parte|o caso)/i });
    if (!next) break;
    fireEvent.click(next);
  }
  return screen.getByRole("group", { name: label });
}

const click = (scope: HTMLElement, name: string | RegExp) =>
  fireEvent.click(within(scope).getByRole("button", { name }));

function open(name: string) {
  fireEvent.click(screen.getByRole("button", { name: /olhar o quadro/i }));
  fireEvent.click(screen.getByRole("button", { name: `Investigar: ${name}` }));
  act(() => vi.runAllTimers());
}

function finish() {
  advanceUntil(/^(o livro de serviço|a parede do primeiro subsolo|o mapa de território)$/i);
  fireEvent.click(screen.getByRole("button", { name: /prender no quadro/i }));
}

describe("HostisGame", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("opens on the alert board with the dog tag, the warning and the map", () => {
    render(<HostisGame />);
    fireEvent.click(screen.getByRole("button", { name: /olhar o quadro/i }));
    expect(screen.getByRole("heading", { name: /quadro de alertas/i })).toBeInTheDocument();
    for (const name of ["Desertores", "The Hollow", "As oito gangues"])
      expect(screen.getByRole("button", { name: `Investigar: ${name}` })).toBeEnabled();
    expect(screen.getByText(/não sigam a luz no oco do prédio/i)).toBeInTheDocument();
  });

  it("plays the Deserters: three days of radio, the dawn, and patrol or deserters", () => {
    render(<HostisGame />);
    open("Desertores");

    const radio = advanceUntil(/três dias de rádio/i);
    for (let day = 1; day <= 3; day++) click(radio, `Chamar a substituição (dia ${day})`);
    expect(within(radio).getByText(/só chiado/i)).toBeInTheDocument();
    click(radio, /abrir a caixa de remédios/i);
    click(radio, /^continuar/i);

    const dawn = advanceUntil(/a madrugada no posto/i);
    expect(within(dawn).queryByRole("button", { name: /registrar a saída/i })).not.toBeInTheDocument();
    for (const who of [/comandante/i, /cabo lima/i, /sargento vaz/i]) click(dawn, who);
    click(dawn, /registrar a saída/i);
    click(dawn, /^continuar/i);

    const road = advanceUntil(/patrulha ou desertores/i);
    click(road, "Desertores"); // a primeira é uma patrulha de verdade
    expect(within(road).getByText(/fugir deles é perder uma escolta/i)).toBeInTheDocument();
    for (const answer of ["Patrulha Military", "Desertores", "Desertores", "Patrulha Military"]) click(road, answer);
    click(road, /^continuar/i);

    finish();
    expect(
      within(screen.getByRole("button", { name: "Investigar: Desertores" })).getByText("Investigado"),
    ).toBeInTheDocument();
  });

  it("plays The Hollow: the count stops closing, two versions, and the light is the bait", () => {
    render(<HostisGame />);
    open("The Hollow");

    const wall = advanceUntil(/a conta na parede/i);
    for (let day = 1; day <= 4; day++) click(wall, `Riscar porção inteira (dia ${day})`);
    click(wall, "Riscar porção inteira (dia 5)");
    expect(within(wall).getByText(/a conta não fecha/i)).toBeInTheDocument();
    click(wall, /^continuar/i);

    const versions = advanceUntil(/duas versões/i);
    click(versions, "Todos consentiram.");
    expect(within(versions).getByText(/só o homem capturado/i)).toBeInTheDocument();
    for (const t of ["Eram onze no subsolo.", "A comida acabou.", "Havia um corpo na sala de manutenção."])
      click(versions, t);
    click(versions, /^continuar/i);

    const dark = advanceUntil(/o oco do prédio/i);
    click(dark, /corredor com velas/i);
    expect(within(dark).getByText(/as velas levam ao covil/i)).toBeInTheDocument();
    click(dark, /escada escura/i);
    click(dark, /goteira/i);
    click(dark, /porta de serviço/i);
    for (let i = 1; i <= 6; i++) click(dark, `Raspar o trecho ${i}`);
    expect(within(dark).getByText(/só contas de porções/i)).toBeInTheDocument();
    click(dark, /^continuar/i);

    finish();
    expect(
      within(screen.getByRole("button", { name: "Investigar: The Hollow" })).getByText("Investigado"),
    ).toBeInTheDocument();
  });

  it("plays the eight gang cases and, as the last alert, opens the epilogue", () => {
    localStorage.setItem(
      archive.SAVE_KEY,
      JSON.stringify({ v: 1, open: null, at: {}, done: ["desertores", "hollow"] }),
    );
    render(<HostisGame />);
    open("As oito gangues");

    const pick = (question: RegExp, answer: string) => {
      const c = advanceUntil(question);
      click(c, answer);
      click(c, /fechar o caso/i);
    };
    pick(/tirou do caminhão/i, "Os quatro pneus");
    pick(/sobe sem pagar/i, "Janela A");

    const doors = advanceUntil(/marcas nas portas/i);
    fireEvent.click(within(doors).getAllByRole("button", { name: /^cobrança: galpão/i })[0]);
    expect(within(doors).getByText(/é resgate/i)).toBeInTheDocument();
    for (const [bin, door] of [
      ["Resgate", "Galpão"],
      ["Cobrança", "Casa"],
      ["Resgate", "Depósito"],
      ["Cobrança", "Armazém"],
    ])
      fireEvent.click(within(doors).getByRole("button", { name: new RegExp(`^${bin}: ${door}`) }));
    click(doors, /fechar o caso/i);

    pick(/licenças idênticas/i, "O preço");

    const drain = advanceUntil(/mapa de drenagem/i);
    const board = within(drain).getByRole("application", { name: "Mapa de drenagem" });
    for (const [key, n] of [
      ["ArrowDown", 4],
      ["ArrowRight", 9],
      ["ArrowDown", 1],
      ["ArrowRight", 4],
    ] as const)
      for (let i = 0; i < n; i++) fireEvent.keyDown(board, { key });
    click(drain, /fechar o caso/i);

    const tape = advanceUntil(/a fita da estação/i);
    fireEvent.change(within(tape).getByRole("slider", { name: "Frequência" }), { target: { value: "96" } });
    expect(within(tape).getByText(/anúncio pago. o pedido/i)).toBeInTheDocument();
    fireEvent.change(within(tape).getByRole("slider", { name: "Frequência" }), { target: { value: "101.5" } });
    expect(within(tape).getByText(/mercado da rua 9/i)).toBeInTheDocument();
    click(tape, /fechar o caso/i);

    pick(/veio da ambulância/i, "A chapa do peito");
    pick(/carga “abandonada”/i, "De R. Matos, da Caravana do Sul");

    finish();
    expect(screen.getByRole("heading", { name: /arquivo completo/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /baixar e começar/i })).toHaveAttribute("href", "/baixar");
  });
});
