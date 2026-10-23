import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { cancela, gangs, inicioDoCaos, lineText } from "@/content/lore";
import { decodeSave, SAVE_KEY, script } from "@/lib/lore/story";
import { StoryGame } from "./StoryGame";

// A fala inteira fica para leitores de tela; a cópia que vai sendo digitada é aria-hidden.
const line = (text: string) => screen.getByText(text, { ignore: "[aria-hidden=true], [aria-hidden=true] *" });

const game = () => screen.getByRole("region", { name: inicioDoCaos.title });

/** Clica na caixa de diálogo / cartão de ato até aparecer um portão (ou o fim). */
function advanceUntil(label: RegExp) {
  for (let i = 0; i < 80; i++) {
    if (screen.queryByRole("group", { name: label })) return screen.getByRole("group", { name: label });
    const next = screen.queryByRole("button", { name: /continuar|começar o ato/i });
    if (!next) break;
    fireEvent.click(next);
  }
  return screen.getByRole("group", { name: label });
}

describe("StoryGame", () => {
  beforeEach(() => localStorage.clear());

  it("starts on a title screen, with the reading mode one tap away", () => {
    render(<StoryGame />);
    expect(within(game()).getByRole("button", { name: /novo jogo/i })).toBeInTheDocument();
    expect(within(game()).queryByRole("button", { name: /continuar de onde parou/i })).not.toBeInTheDocument();
    expect(within(game()).getByRole("link", { name: /ler sem jogar/i })).toHaveAttribute(
      "href",
      "/lore/o-inicio-do-caos/leitura",
    );
  });

  it("does not move past the triage sheet until it is filled honestly", () => {
    render(<StoryGame />);
    fireEvent.click(screen.getByRole("button", { name: /novo jogo/i }));
    const sheet = advanceUntil(/ficha de triagem/i);

    fireEvent.click(within(sheet).getByRole("button", { name: "óbito" }));
    expect(within(sheet).getByText(/óbito não explica/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^continuar/i })).not.toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole("button", { name: "movimento após declaração de óbito" }));
    fireEvent.click(within(sheet).getByRole("button", { name: /carimbar/i }));
    fireEvent.click(within(sheet).getByRole("button", { name: /^continuar/i }));
    expect(line("Movimento após declaração de óbito.")).toBeInTheDocument();
    expect(screen.getByText(/página recuperada/i)).toBeInTheDocument();
  });

  it("plays all five acts to the reader's Day 1, and saves along the way", () => {
    render(<StoryGame />);
    fireEvent.click(screen.getByRole("button", { name: /novo jogo/i }));

    const sheet = advanceUntil(/ficha de triagem/i);
    fireEvent.click(within(sheet).getByRole("button", { name: "movimento após declaração de óbito" }));
    fireEvent.click(within(sheet).getByRole("button", { name: /carimbar/i }));
    fireEvent.click(within(sheet).getByRole("button", { name: /^continuar/i }));

    const radio = advanceUntil(/rádio de emergência/i);
    fireEvent.change(within(radio).getByRole("slider", { name: /frequência/i }), { target: { value: "93.7" } });
    fireEvent.click(within(radio).getByRole("button", { name: /desligar o rádio/i }));

    const scene = advanceUntil(/investigar/i);
    for (const spot of within(scene).getAllByRole("button", { name: /examinar/i })) fireEvent.click(spot);
    fireEvent.click(within(scene).getByRole("button", { name: /^continuar/i }));

    const night = advanceUntil(/reconstruir a noite/i);
    fireEvent.click(within(night).getAllByRole("button", { name: cancela.versions[1].claims[2] })[0]);
    expect(within(night).getByText(/só um lado diz isso/i)).toBeInTheDocument();
    for (const fact of cancela.facts) fireEvent.click(within(night).getAllByRole("button", { name: fact })[0]);
    fireEvent.click(within(night).getByRole("button", { name: /^continuar/i }));

    const walls = advanceUntil(/paredes/i);
    for (const wall of within(walls).getAllByRole("button", { name: /parede/i })) fireEvent.click(wall);
    for (const gang of gangs) expect(within(walls).getByText(gang)).toBeInTheDocument();
    fireEvent.click(within(walls).getByRole("button", { name: /^continuar/i }));

    const roads = advanceUntil(/três caminhos/i);
    // Rota dos Rovers, pelo norte: 6 para cima, 21 para a direita, 6 para baixo.
    const map = within(roads).getByRole("application", { name: /mapa até a cidade/i });
    const press = (key: string, times: number) => {
      for (let i = 0; i < times; i++) fireEvent.keyDown(map, { key });
    };
    press("ArrowUp", 6);
    press("ArrowRight", 21);
    press("ArrowDown", 6);
    expect(within(roads).getByText(/você vai pela rota longa/i)).toBeInTheDocument();
    fireEvent.click(within(roads).getByRole("button", { name: /seguir por aqui/i }));

    const end = advanceUntil(/seu dia 1/i);
    expect(end).toHaveTextContent("5/5");
    expect(end).toHaveTextContent(/o mais longo/i);
    expect(within(end).getByRole("link", { name: /baixar e começar/i })).toHaveAttribute("href", "/baixar");

    expect(decodeSave(localStorage.getItem(SAVE_KEY)!)).toMatchObject({ road: "rovers" });
  });

  it("offers to continue a saved game", () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, at: 1 }));
    render(<StoryGame />);
    fireEvent.click(screen.getByRole("button", { name: /continuar de onde parou/i }));
    expect(line(lineText(inicioDoCaos.acts[0].scenes[0]))).toBeInTheDocument();
  });

  it("reveals who is who in the notebook as the story introduces each group", () => {
    const act2 = script.findIndex((s) => s.kind === "act" && s.act === 1);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, at: act2 }));
    render(<StoryGame />);
    fireEvent.click(screen.getByRole("button", { name: /continuar de onde parou/i }));
    fireEvent.click(screen.getByRole("button", { name: /caderno/i }));
    fireEvent.click(screen.getByRole("tab", { name: "Quem é quem" }));
    const list = screen.getByRole("list", { name: "Quem é quem" });
    expect(within(list).getByText(/o exército de verdade/i)).toBeInTheDocument();
    expect(within(list).queryByText(/civis armados, não militares/i)).not.toBeInTheDocument();
    expect(within(list).getAllByText(/ainda não apareceu na história/i).length).toBe(6);
  });
});
