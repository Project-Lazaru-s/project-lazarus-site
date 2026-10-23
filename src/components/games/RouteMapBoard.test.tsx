import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteMapBoard } from "./RouteMapBoard";

const ROWS = ["S.#", "..W", "..G"];
const board = () => screen.getByRole("application", { name: "Mapa de teste" });
const key = (k: string) => fireEvent.keyDown(board(), { key: k });

describe("RouteMapBoard", () => {
  it("draws with the arrow keys, ignores obstacles and reports the arrival once", () => {
    const onArrive = vi.fn();
    const sfx = vi.fn();
    render(<RouteMapBoard rows={ROWS} label="Mapa de teste" goalLabel="ao posto" onArrive={onArrive} sfx={sfx} />);
    key("ArrowRight");
    key("ArrowRight"); // ruína: não anda
    expect(screen.getByText("1 quadrados")).toBeInTheDocument();
    key("ArrowDown");
    key("ArrowDown");
    key("ArrowRight");
    expect(onArrive).toHaveBeenCalledTimes(1);
    expect(onArrive.mock.calls[0][0]).toMatchObject({ steps: 4 });
    expect(screen.getByText(/você chegou ao posto/i)).toBeInTheDocument();
    expect(sfx).toHaveBeenCalledWith("loreStamp", expect.any(Number));
  });

  it("erases the last stretch and starts over", () => {
    render(<RouteMapBoard rows={ROWS} label="Mapa de teste" goalLabel="ao posto" onArrive={() => {}} />);
    key("ArrowDown");
    key("ArrowDown");
    fireEvent.click(screen.getByRole("button", { name: "Apagar trecho" }));
    expect(screen.getByText("1 quadrados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));
    expect(screen.getByText("0 quadrados")).toBeInTheDocument();
  });

  it("shows GPS coordinates once the pencil moves, and offers the 8-color palette for notes", () => {
    render(<RouteMapBoard rows={ROWS} label="Mapa de teste" goalLabel="ao posto" onArrive={() => {}} />);
    expect(screen.getByText("GPS sem sinal")).toBeInTheDocument();
    key("ArrowDown");
    expect(screen.getByText("X -480 · Z 1208")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Anotar" }));
    expect(screen.getAllByRole("button", { name: /^cor \d$/i })).toHaveLength(8);
  });
});
