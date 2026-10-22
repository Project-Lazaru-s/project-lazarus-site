import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { progression } from "@/content/progression";
import ProgressionPage from "./page";

describe("/progressao", () => {
  it("renders the stages as an ordered timeline", () => {
    render(<ProgressionPage />);
    const items = within(screen.getByRole("list", { name: /linha do tempo/i })).getAllByRole("listitem", {
      name: /dia/i,
    });
    expect(items.map((item) => item.getAttribute("aria-label"))).toEqual(progression.map((s) => s.label));
  });

  it("shows how loot shrinks", () => {
    render(<ProgressionPage />);
    expect(screen.getByText(/25% \/ 45% a partir do dia 40/)).toBeInTheDocument();
  });
});
