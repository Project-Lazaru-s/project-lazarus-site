import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createSfx, SOUNDS } from "./sfx";

class FakeAudio {
  static played: { src: string; volume: number }[] = [];
  static created = 0;
  preload = "";
  volume = 1;
  constructor(public src = "") {
    FakeAudio.created++;
  }
  cloneNode() {
    return new FakeAudio(this.src);
  }
  play() {
    FakeAudio.played.push({ src: this.src, volume: this.volume });
    return Promise.resolve();
  }
}

describe("SOUNDS", () => {
  it("every sound effect file exists", () => {
    for (const src of Object.values(SOUNDS)) {
      expect(existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
    }
  });
});

describe("createSfx", () => {
  it("plays a copy of the sound, so the same effect can overlap", () => {
    FakeAudio.played = [];
    const sfx = createSfx(FakeAudio as unknown as typeof Audio);
    sfx.play("gunshot");
    sfx.play("gunshot", 0.4);
    expect(FakeAudio.played).toEqual([
      { src: SOUNDS.gunshot, volume: 1 },
      { src: SOUNDS.gunshot, volume: 0.4 },
    ]);
  });

  it("loads each file once", () => {
    FakeAudio.created = 0;
    const sfx = createSfx(FakeAudio as unknown as typeof Audio);
    sfx.preload();
    const afterPreload = FakeAudio.created;
    expect(afterPreload).toBe(Object.keys(SOUNDS).length);
    sfx.preload();
    expect(FakeAudio.created).toBe(afterPreload);
  });

  it("ignores browsers that refuse to play", () => {
    class Refusing extends FakeAudio {
      play() {
        return Promise.reject(new Error("NotAllowedError"));
      }
      cloneNode() {
        return new Refusing(this.src);
      }
    }
    const sfx = createSfx(Refusing as unknown as typeof Audio);
    expect(() => sfx.play("radioStatic")).not.toThrow();
  });

  it("does nothing on the server", () => {
    const sfx = createSfx(undefined);
    expect(() => {
      sfx.preload();
      sfx.play("gunshot");
    }).not.toThrow();
    vi.restoreAllMocks();
  });
});
