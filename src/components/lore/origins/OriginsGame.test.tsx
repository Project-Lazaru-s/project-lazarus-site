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

  it("opens on the desk with four folders, all of them open", () => {
    render(<OriginsGame />);
    expect(within(game()).getByRole("link", { name: /ler sem jogar/i })).toHaveAttribute(
      "href",
      "/lore/antes-das-bandeiras/leitura",
    );
    fireEvent.click(screen.getByRole("button", { name: /abrir o arquivo/i }));
    expect(screen.getByRole("heading", { name: /escolha uma pasta/i })).toBeInTheDocument();
    for (const name of ["Haven", "Rovers", "Wardens", "Military"])
      expect(screen.getByRole("button", { name: `Abrir a pasta ${name}` })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /ler o epílogo/i })).not.toBeInTheDocument();
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

  it("plays Rovers: the bus parts, the crew and a way back that is not the way in", () => {
    render(<OriginsGame />);
    fireEvent.click(screen.getByRole("button", { name: /abrir o arquivo/i }));
    fireEvent.click(screen.getByRole("button", { name: /abrir a pasta rovers/i }));
    act(() => vi.runAllTimers());

    const bus = advanceUntil(/tirar o ônibus/i);
    fireEvent.click(within(bus).getByRole("button", { name: /revistar o sedã/i }));
    fireEvent.click(within(bus).getByRole("button", { name: "Pegar pneu" }));
    expect(within(bus).getByText(/furado/i)).toBeInTheDocument();
    fireEvent.click(within(bus).getByRole("button", { name: "Pegar bateria" }));
    fireEvent.click(within(bus).getByRole("button", { name: /revistar a van/i }));
    fireEvent.click(within(bus).getByRole("button", { name: "Pegar correia" }));
    fireEvent.click(within(bus).getByRole("button", { name: /revistar o táxi/i }));
    fireEvent.click(within(bus).getByRole("button", { name: "Pegar pneu" }));
    fireEvent.click(within(bus).getByRole("button", { name: "Pegar combustível" }));
    fireEvent.click(within(bus).getByRole("button", { name: /arrancar os bancos/i }));
    fireEvent.click(within(bus).getByRole("button", { name: /dar a partida/i }));

    const crew = advanceUntil(/tripulação do ônibus/i);
    for (const who of ["Josué", "Célia", "Tânia", "Igor"])
      fireEvent.click(within(crew).getByRole("button", { name: new RegExp(who) }));
    expect(within(crew).getByText(/falta a bordo quem saiba escutar/i)).toBeInTheDocument();
    fireEvent.click(within(crew).getByRole("button", { name: /igor/i }));
    fireEvent.click(within(crew).getByRole("button", { name: /bento/i }));
    fireEvent.click(within(crew).getByRole("button", { name: /fechar a tripulação/i }));

    const route = advanceUntil(/volta garantida/i);
    const press = (name: string, keys: [string, number][]) => {
      const board = within(route).getByRole("application", { name });
      for (const [k, n] of keys) for (let i = 0; i < n; i++) fireEvent.keyDown(board, { key: k });
    };
    press("Mapa da ida", [["ArrowRight", 21]]); // pela rota marcada
    press("Mapa da volta", [["ArrowLeft", 1]]); // a rua da ida está tomada
    expect(within(route).getByText("0 quadrados")).toBeInTheDocument();
    press("Mapa da volta", [
      ["ArrowUp", 4],
      ["ArrowLeft", 21],
      ["ArrowDown", 4],
    ]);
    fireEvent.click(within(route).getByRole("button", { name: /registrar a rota/i }));

    advanceUntil(/o mapa das rotas riscadas/i);
    fireEvent.click(screen.getByRole("button", { name: /devolver a pasta/i }));
    expect(within(screen.getByRole("button", { name: /abrir a pasta rovers/i })).getByText("Lido")).toBeInTheDocument();
  });

  it("plays Wardens: the night watch, the entry book and the retreat", () => {
    render(<OriginsGame />);
    fireEvent.click(screen.getByRole("button", { name: /abrir o arquivo/i }));
    fireEvent.click(screen.getByRole("button", { name: /abrir a pasta wardens/i }));
    act(() => vi.runAllTimers());

    const watch = advanceUntil(/escala de vigia/i);
    const put = (slot: string, who: string) =>
      fireEvent.click(
        within(within(watch).getByRole("radiogroup", { name: `Turno: ${slot}` })).getByRole("radio", { name: who }),
      );
    put("Anoitecer", "Nogueira");
    put("Meia-noite", "Nogueira");
    put("Madrugada", "Ivete");
    put("Amanhecer", "Caio");
    expect(within(watch).getByText(/dois turnos seguidos/i)).toBeInTheDocument();
    put("Meia-noite", "Caio");
    put("Amanhecer", "Nogueira");
    fireEvent.click(within(watch).getByRole("button", { name: /assinar a escala/i }));

    const gate = advanceUntil(/livro de entradas/i);
    const rules = () => within(gate).getByRole("list", { name: /regras do portão/i });
    fireEvent.click(within(gate).getByRole("button", { name: "Abrir o portão" })); // sem revista
    expect(within(rules()).getByText("Ninguém entra sem revista.")).toBeInTheDocument();
    for (const answer of ["Abrir o portão", "Área de espera", "Área de espera"]) {
      fireEvent.click(within(gate).getByRole("button", { name: "Revistar" }));
      fireEvent.click(within(gate).getByRole("button", { name: answer }));
    }
    fireEvent.click(within(gate).getByRole("button", { name: /passar o turno/i }));

    const retreat = advanceUntil(/a retirada/i);
    fireEvent.click(within(retreat).getByRole("button", { name: "Fechar o portão" }));
    expect(within(retreat).getByText(/ficaram 4 do lado de fora/i)).toBeInTheDocument();
    fireEvent.click(within(retreat).getByRole("button", { name: /tentar de novo/i }));
    for (let i = 0; i < 5; i++) fireEvent.click(within(retreat).getByRole("button", { name: "Segurar o portão" }));
    expect(within(retreat).getByText(/um passo a mais/i)).toBeInTheDocument();
    fireEvent.click(within(retreat).getByRole("button", { name: /tentar de novo/i }));
    for (let i = 0; i < 4; i++) fireEvent.click(within(retreat).getByRole("button", { name: "Segurar o portão" }));
    fireEvent.click(within(retreat).getByRole("button", { name: "Fechar o portão" }));
    fireEvent.click(within(retreat).getByRole("button", { name: /^continuar/i }));

    advanceUntil(/o primeiro livro de entradas/i);
    fireEvent.click(screen.getByRole("button", { name: /devolver a pasta/i }));
    expect(
      within(screen.getByRole("button", { name: /abrir a pasta wardens/i })).getByText("Lido"),
    ).toBeInTheDocument();
  });

  it("plays Military and, as the fourth folder, opens the epilogue", () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, open: null, at: {}, done: ["haven", "rovers", "wardens"] }));
    render(<OriginsGame />);
    fireEvent.click(screen.getByRole("button", { name: /abrir o arquivo/i }));
    fireEvent.click(screen.getByRole("button", { name: /abrir a pasta military/i }));
    act(() => vi.runAllTimers());

    const block = advanceUntil(/quarentena da quadra/i);
    for (const b of ["Padaria", "Escola", "Farmácia", "Prédio azul"])
      fireEvent.click(within(block).getByRole("button", { name: `Marcar ${b}` }));
    fireEvent.click(within(block).getByRole("button", { name: /entregar o relatório/i }));
    expect(within(block).getByText(/escola: tem gente viva/i)).toBeInTheDocument();
    fireEvent.click(within(block).getByRole("button", { name: "Tirar a marca de Escola" }));
    fireEvent.click(within(block).getByRole("button", { name: /entregar o relatório/i }));
    fireEvent.click(within(block).getByRole("button", { name: /^continuar/i }));

    const radio = advanceUntil(/duas ordens no rádio/i);
    fireEvent.click(within(radio).getByRole("button", { name: /ouvir o rádio/i }));
    fireEvent.click(within(radio).getByRole("button", { name: /próxima transmissão/i }));
    fireEvent.click(within(radio).getByRole("button", { name: /evacuar o posto agora/i }));
    expect(within(radio).getByText(/deixá-los atrás da barreira/i)).toBeInTheDocument();
    fireEvent.click(within(radio).getByRole("button", { name: /retirar os civis/i }));
    fireEvent.click(within(radio).getByRole("button", { name: /confirmar pela frequência/i }));
    fireEvent.click(within(radio).getByRole("button", { name: /^continuar/i }));

    const book = advanceUntil(/livro de estoque/i);
    fireEvent.click(within(book).getByRole("button", { name: /fechar a conta/i }));
    expect(within(book).getByText(/filtros: a conta não fecha/i)).toBeInTheDocument();
    for (let i = 0; i < 6; i++) fireEvent.click(within(book).getByRole("button", { name: "Menos filtros" }));
    for (let i = 0; i < 2; i++) fireEvent.click(within(book).getByRole("button", { name: "Menos doses de soro" }));
    fireEvent.click(within(book).getByRole("button", { name: /fechar a conta/i }));
    fireEvent.click(within(book).getByRole("button", { name: /assinar o livro/i }));

    advanceUntil(/duas ordens no quadro de avisos/i);
    fireEvent.click(screen.getByRole("button", { name: /devolver a pasta/i }));
    expect(screen.getByRole("heading", { name: /arquivo completo/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /arquivo 01/i })).toHaveAttribute("href", "/lore/o-inicio-do-caos");
    fireEvent.click(screen.getByRole("button", { name: /voltar às pastas/i }));
    expect(screen.getByRole("button", { name: /ler o epílogo/i })).toBeInTheDocument();
  });
});
