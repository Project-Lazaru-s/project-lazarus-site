import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadingTips } from "@/content/tips";
import { BOOT_KEY, BOOT_MS, bootScript } from "./boot";
import { BootScreen } from "./BootScreen";

const html = document.documentElement;

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  html.removeAttribute("data-boot");
});
afterEach(() => vi.useRealTimers());

describe("loadingTips", () => {
  it("are real tips, never about alpha builds", () => {
    expect(loadingTips.length).toBeGreaterThan(3);
    expect(JSON.stringify(loadingTips).toLowerCase()).not.toContain("alpha");
  });
});

describe("bootScript", () => {
  it("only asks for the boot screen on the first page of the session", () => {
    new Function(bootScript)();
    expect(html.hasAttribute("data-boot")).toBe(true);
    // Marca na hora: sair antes do fim da animação não faz a tela voltar na próxima página.
    expect(sessionStorage.getItem(BOOT_KEY)).toBe("1");

    html.removeAttribute("data-boot");
    sessionStorage.setItem(BOOT_KEY, "1");
    new Function(bootScript)();
    expect(html.hasAttribute("data-boot")).toBe(false);
  });
});

describe("BootScreen", () => {
  it("goes away by itself", () => {
    html.setAttribute("data-boot", "");
    render(<BootScreen />);
    expect(screen.getByText(/gerando mundo/i)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(BOOT_MS + 50);
    });
    expect(html.hasAttribute("data-boot")).toBe(false);
  });

  it("can be skipped", () => {
    html.setAttribute("data-boot", "");
    render(<BootScreen />);
    fireEvent.click(screen.getByRole("button", { name: /pular/i }));
    expect(html.hasAttribute("data-boot")).toBe(false);
  });

  it("shows a real tip", () => {
    html.setAttribute("data-boot", "");
    render(<BootScreen />);
    expect(loadingTips.some((tip) => screen.queryByText(tip))).toBe(true);
  });
});
