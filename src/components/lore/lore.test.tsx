import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { broadcasts, cancela, roads, threeWays } from "@/content/lore";
import { CancelaVersions } from "./CancelaVersions";
import { EmergencyRadio } from "./EmergencyRadio";
import { RoadChoice } from "./RoadChoice";
import { ThreeWays } from "./ThreeWays";

describe("EmergencyRadio (Ato II)", () => {
  afterEach(() => vi.useRealTimers());

  it("repeats the broadcasts until switched off", () => {
    vi.useFakeTimers();
    render(<EmergencyRadio />);
    expect(screen.getByText(broadcasts[0])).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText(broadcasts[1])).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /desligar/i }));
    expect(screen.queryByText(broadcasts[1])).not.toBeInTheDocument();
    expect(screen.getByText(/silêncio/i)).toBeInTheDocument();
  });
});

describe("ThreeWays (Ato III)", () => {
  it("shows the three words and turns each one into its faction", () => {
    render(<ThreeWays />);
    for (const way of threeWays) {
      fireEvent.click(screen.getByRole("button", { name: `Virar: ${way.word}` }));
      expect(screen.getByRole("heading", { name: way.faction })).toBeInTheDocument();
      expect(screen.getByText(way.cost)).toBeInTheDocument();
    }
  });
});

describe("CancelaVersions (Ato IV)", () => {
  it("keeps the shared facts while switching between the two versions", () => {
    render(<CancelaVersions />);
    const [wardens, rovers] = cancela.versions;
    expect(screen.getByRole("tab", { name: new RegExp(wardens.name) })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(wardens.claims[0]);

    fireEvent.click(screen.getByRole("tab", { name: new RegExp(rovers.name) }));
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent(rovers.claims[0]);
    expect(panel).not.toHaveTextContent(wardens.claims[0]);

    const facts = screen.getByRole("list", { name: /as duas versões concordam/i });
    for (const fact of cancela.facts) expect(within(facts).getByText(fact)).toBeInTheDocument();
  });
});

describe("RoadChoice (Ato V)", () => {
  it("answers the chosen road", () => {
    render(<RoadChoice />);
    expect(screen.queryByText(roads[1].outcome)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: new RegExp(roads[1].label) }));
    expect(screen.getByRole("radio", { name: new RegExp(roads[1].label) })).toBeChecked();
    expect(screen.getByText(roads[1].outcome)).toBeInTheDocument();
  });
});
