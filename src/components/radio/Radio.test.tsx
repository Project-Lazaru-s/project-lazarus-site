import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { radioChannels, typed } from "@/content/radio";
import { Radio } from "./Radio";

describe("typed", () => {
  it("reveals the message at a fixed speed", () => {
    expect(typed("kssh...", 0, 40)).toBe("");
    expect(typed("kssh...", 100, 40)).toBe("kssh");
    expect(typed("kssh...", 10_000, 40)).toBe("kssh...");
  });
});

describe("Radio", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("has a tuning button per channel", () => {
    render(<Radio />);
    for (const channel of radioChannels) {
      expect(screen.getByRole("button", { name: channel.frequency })).toBeInTheDocument();
    }
  });

  it("types the intercepted message of the tuned channel and links to it", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Radio />);
    const channel = radioChannels[1];
    await user.click(screen.getByRole("button", { name: channel.frequency }));
    expect(screen.getByRole("button", { name: channel.frequency })).toHaveAttribute("aria-pressed", "true");

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText(channel.message, { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /saiba mais/i })).toHaveAttribute("href", channel.href);
  });

  it("exposes the whole message to screen readers right away", () => {
    render(<Radio />);
    expect(screen.getByRole("log", { name: /rádio/i })).toHaveAttribute("aria-label", expect.stringContaining("Rádio"));
    expect(screen.getByText(radioChannels[0].message, { selector: ".sr-only" })).toBeInTheDocument();
  });
});
