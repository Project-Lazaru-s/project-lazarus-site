import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LorePage from "./page";

describe("/lore", () => {
  it("opens O Início do Caos", () => {
    render(<LorePage />);
    expect(screen.getByRole("link", { name: /o início do caos/i })).toHaveAttribute("href", "/lore/o-inicio-do-caos");
    expect(screen.getByText(/5 atos/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /ler sem jogar/i })[0]).toHaveAttribute(
      "href",
      "/lore/o-inicio-do-caos/leitura",
    );
  });

  it("opens Antes das Bandeiras, the faction origins", () => {
    render(<LorePage />);
    expect(screen.getByRole("link", { name: /antes das bandeiras/i })).toHaveAttribute(
      "href",
      "/lore/antes-das-bandeiras",
    );
    expect(screen.getByText(/arquivo 02 · 4 dossiês de origem/i)).toBeInTheDocument();
  });

  it("shows sealed files that cannot be opened yet", () => {
    render(<LorePage />);
    const sealed = screen.getAllByRole("article", { name: /lacrado/i });
    expect(sealed.length).toBeGreaterThan(0);
    for (const card of sealed) expect(card.querySelector("a")).toBeNull();
  });
});
