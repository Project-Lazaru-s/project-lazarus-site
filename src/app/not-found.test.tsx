import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import NotFound from "./not-found";

it("tells the visitor the page is gone, in PT-BR, with a way home", () => {
  render(<NotFound />);
  expect(screen.getByRole("heading", { name: /não encontrada/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /voltar ao início/i })).toHaveAttribute("href", "/");
});
