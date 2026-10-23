import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LorePage from "./page";

describe("/lore", () => {
  it("opens O Início do Caos", () => {
    render(<LorePage />);
    expect(screen.getByRole("link", { name: /o início do caos/i })).toHaveAttribute("href", "/lore/o-inicio-do-caos");
    expect(screen.getByText(/5 atos/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ler sem jogar/i })).toHaveAttribute(
      "href",
      "/lore/o-inicio-do-caos/leitura",
    );
  });

  it("shows sealed files that cannot be opened yet", () => {
    render(<LorePage />);
    const sealed = screen.getAllByRole("article", { name: /lacrado/i });
    expect(sealed.length).toBeGreaterThan(0);
    for (const card of sealed) expect(card.querySelector("a")).toBeNull();
  });
});
