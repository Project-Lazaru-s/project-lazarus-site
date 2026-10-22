import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectedHud, SurvivalProvider } from "@/components/survival/SurvivalProvider";
import { VoiceGame } from "./VoiceGame";

const mic = vi.hoisted(() => ({ onLoudness: (() => {}) as (rms: number) => void, stop: vi.fn(), fail: false }));
vi.mock("@/lib/survival/microphone", () => ({
  startMicrophone: vi.fn(async (onLoudness: (rms: number) => void) => {
    if (mic.fail) throw new Error("NotAllowedError");
    mic.onLoudness = onLoudness;
    return { stop: mic.stop };
  }),
}));

beforeEach(() => {
  mic.fail = false;
  mic.stop.mockClear();
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
});
afterEach(() => vi.useRealTimers());

async function start() {
  render(
    <SurvivalProvider>
      <VoiceGame />
      <ConnectedHud />
    </SurvivalProvider>,
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /começar/i }));
  });
}

const scene = () => screen.getByRole("application", { name: /sua voz/i });
const alerted = () => within(scene()).queryAllByText("!").length;

describe("VoiceGame", () => {
  it("only asks for the microphone after the visitor starts", async () => {
    const { startMicrophone } = await import("@/lib/survival/microphone");
    render(
      <SurvivalProvider>
        <VoiceGame />
      </SurvivalProvider>,
    );
    expect(startMicrophone).not.toHaveBeenCalled();
    expect(screen.getByText(/nada é gravado/i)).toBeInTheDocument();
  });

  it("a shout is heard by every infected, a whisper by none", async () => {
    await start();
    act(() => mic.onLoudness(0.03));
    expect(within(scene()).getByText("Sussurro")).toBeInTheDocument();
    expect(alerted()).toBe(0);

    act(() => mic.onLoudness(0.5));
    expect(within(scene()).getByText("Grito")).toBeInTheDocument();
    expect(alerted()).toBe(3);
  });

  it("works without a microphone, with buttons", async () => {
    mic.fail = true;
    await start();
    expect(screen.getByText(/sem microfone/i)).toBeInTheDocument();
    fireEvent.pointerDown(within(scene()).getByRole("button", { name: /^falar$/i }));
    expect(within(scene()).getByText("Fala")).toBeInTheDocument();
    expect(alerted()).toBe(2);
  });

  it("releases the microphone and reports who heard you", async () => {
    await start();
    act(() => mic.onLoudness(0.5));
    fireEvent.click(screen.getByRole("button", { name: /encerrar/i }));
    expect(mic.stop).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /3 ouviram/i })).toBeInTheDocument();
  });
});
