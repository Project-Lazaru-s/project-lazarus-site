import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChaseGame } from "./ChaseGame";

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
afterEach(() => vi.useRealTimers());

function advance(ms: number) {
  for (let i = 0; i < ms / 50; i++) {
    act(() => {
      vi.advanceTimersByTime(50);
    });
  }
}

describe("ChaseGame", () => {
  it("does not chase anyone until they decide to flee", () => {
    render(<ChaseGame />);
    advance(10_000);
    expect(screen.queryByText(/pego/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fugir/i })).toBeInTheDocument();
  });

  it("standing still gets you caught", () => {
    render(<ChaseGame />);
    fireEvent.click(screen.getByRole("button", { name: /fugir/i }));
    advance(4_000);
    expect(screen.getByRole("heading", { name: /pego/i })).toBeInTheDocument();
  });

  it("mashing Correr (or the space bar) gets you out", () => {
    render(<ChaseGame />);
    fireEvent.click(screen.getByRole("button", { name: /fugir/i }));
    const runButton = screen.getByRole("button", { name: /correr/i });
    for (let i = 0; i < 20; i++) {
      if (i % 2) fireEvent.click(runButton);
      else fireEvent.keyDown(window, { key: " " });
      advance(100);
    }
    expect(screen.getByRole("heading", { name: /você escapou/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /seguir para o início/i })).toHaveAttribute("href", "/");
  });
});
