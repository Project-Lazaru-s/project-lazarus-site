import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SOUNDS } from "@/lib/survival/sfx";
import { ChestGame } from "@/components/games/ChestGame";
import { Radio } from "@/components/radio/Radio";
import { radioChannels } from "@/content/radio";
import { SurvivalProvider, useSfx } from "./SurvivalProvider";

const played: string[] = [];
class FakeAudio {
  preload = "";
  volume = 1;
  constructor(public src = "") {}
  cloneNode() {
    return new FakeAudio(this.src);
  }
  play() {
    played.push(this.src);
    return Promise.resolve();
  }
}

function Shooter() {
  const play = useSfx();
  return <button onClick={() => play("gunshot")}>Atirar</button>;
}

afterEach(() => {
  played.length = 0;
  vi.unstubAllGlobals();
});

describe("useSfx", () => {
  it("stays silent while the sound is off", () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <SurvivalProvider>
        <Shooter />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Atirar" }));
    expect(played).toEqual([]);
  });

  it("plays once the visitor turns the sound on", () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <SurvivalProvider initial={{ sound: true }}>
        <Shooter />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Atirar" }));
    expect(played).toEqual([SOUNDS.gunshot]);
  });
});

describe("sound effects in the encounters", () => {
  it("the chest clicks on a set pin and snaps on a broken lockpick", () => {
    vi.stubGlobal("Audio", FakeAudio);
    vi.spyOn(Math, "random").mockReturnValue(0); // ordem secreta [1, 2, 3, 0]
    render(
      <SurvivalProvider initial={{ sound: true }}>
        <ChestGame />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /usar gazua/i }));
    fireEvent.click(screen.getByRole("button", { name: "Pino 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Pino 1" }));
    expect(played).toEqual([SOUNDS.lockPin, SOUNDS.lockpickBreak]);
    vi.restoreAllMocks();
  });

  it("the radio crackles when tuned", () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <SurvivalProvider initial={{ sound: true }}>
        <Radio />
      </SurvivalProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: radioChannels[2].frequency }));
    expect(played).toEqual([SOUNDS.radioStatic]);
  });
});
