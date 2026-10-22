import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SoundToggle } from "./SoundToggle";

const ambience = { setFear: vi.fn(), stop: vi.fn() };
vi.mock("@/lib/survival/ambience", () => ({ startAmbience: vi.fn(() => ambience) }));

describe("SoundToggle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts muted and only plays after the visitor asks", async () => {
    const { startAmbience } = await import("@/lib/survival/ambience");
    const onChange = vi.fn();
    const { rerender } = render(<SoundToggle on={false} fear={0} onChange={onChange} />);
    const button = screen.getByRole("button", { name: /som/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(startAmbience).not.toHaveBeenCalled();

    await userEvent.click(button);
    expect(startAmbience).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(true);
    rerender(<SoundToggle on fear={0} onChange={onChange} />);
    expect(screen.getByRole("button", { name: /som/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("feeds fear to the heartbeat and stops when muted again", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SoundToggle on={false} fear={0} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /som/i }));
    rerender(<SoundToggle on fear={80} onChange={onChange} />);
    expect(ambience.setFear).toHaveBeenLastCalledWith(80);

    await userEvent.click(screen.getByRole("button", { name: /som/i }));
    expect(ambience.stop).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
