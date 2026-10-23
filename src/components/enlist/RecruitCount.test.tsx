import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const stats = vi.hoisted(() => ({ getRecruitStats: vi.fn() }));
vi.mock("@/lib/enlist/stats", () => stats);

const { RecruitCount } = await import("./RecruitCount");

describe("RecruitCount", () => {
  it("shows the total and the count per side", async () => {
    stats.getRecruitStats.mockResolvedValue({
      total: 5,
      bySide: { f873: 1, f1041: 3, f1215: 1, solo: 0 },
    });
    render((await RecruitCount())!);
    expect(screen.getByRole("heading", { name: /sinais que responderam/i }).nextElementSibling).toHaveTextContent("5");
    expect(screen.getByText("104.1 · Bando").nextElementSibling).toHaveTextContent("3");
  });

  it("hides itself without a database or before the first form", async () => {
    stats.getRecruitStats.mockResolvedValue(null);
    expect(await RecruitCount()).toBeNull();
    stats.getRecruitStats.mockResolvedValue({ total: 0, bySide: {} });
    expect(await RecruitCount()).toBeNull();
  });
});
