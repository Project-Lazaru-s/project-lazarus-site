import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { factions } from "@/content/factions";
import { FactionCard } from "./FactionCard";

const haven = factions.find((f) => f.slug === "haven")!;
const face = (name: string) => document.querySelector<HTMLElement>(`[data-face="${name}"]`)!;

describe("FactionCard", () => {
  it("shows the profile on the front and keeps the back out of reach", () => {
    render(<FactionCard faction={haven} />);
    expect(within(face("front")).getByText(haven.profile)).toBeInTheDocument();
    expect(face("back")).toHaveAttribute("inert");
    expect(face("front")).not.toHaveAttribute("inert");
  });

  it("flips to the details and back", () => {
    render(<FactionCard faction={haven} />);
    const flip = screen.getByRole("button", { name: /ver detalhes de haven/i });
    fireEvent.click(flip);
    expect(flip).toHaveAttribute("aria-pressed", "true");
    expect(face("front")).toHaveAttribute("inert");
    expect(within(face("back")).getByText(haven.details[0])).toBeInTheDocument();

    fireEvent.click(within(face("back")).getByRole("button", { name: /voltar/i }));
    expect(face("back")).toHaveAttribute("inert");
  });

  it("shows where the reputation turns into a bounty", () => {
    render(<FactionCard faction={haven} />);
    const scale = within(face("back")).getByRole("img", { name: /reputação/i });
    expect(scale).toHaveAccessibleName(/-100 a \+100.*procurado em -40/i);
  });
});
