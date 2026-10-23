import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { inicioDoCaos } from "@/content/lore";
import { AMBIENCE, createAmbience, cuesFor, MUSIC } from "./audio";
import { script } from "./story";

class FakeAudio {
  static all: FakeAudio[] = [];
  loop = false;
  volume = 1;
  paused = true;
  constructor(public src = "") {
    FakeAudio.all.push(this);
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

describe("MUSIC and AMBIENCE", () => {
  it("has the music file and one (optional) bed per act, every file present", () => {
    expect(AMBIENCE).toHaveLength(inicioDoCaos.acts.length);
    for (const src of [MUSIC, ...AMBIENCE]) {
      if (src) expect(existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
    }
  });
});

describe("createAmbience", () => {
  beforeEach(() => {
    FakeAudio.all = [];
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("fades a looping bed in", () => {
    const amb = createAmbience(FakeAudio as unknown as typeof Audio);
    amb.play("/a.mp3", 0.4);
    const [bed] = FakeAudio.all;
    expect(bed).toMatchObject({ src: "/a.mp3", loop: true, paused: false, volume: 0 });
    vi.advanceTimersByTime(2000);
    expect(bed.volume).toBeCloseTo(0.4);
  });

  it("crossfades to the next act and stops the old bed", () => {
    const amb = createAmbience(FakeAudio as unknown as typeof Audio);
    amb.play("/a.mp3", 0.4);
    vi.advanceTimersByTime(2000);
    amb.play("/b.mp3", 0.4);
    vi.advanceTimersByTime(2000);
    const [a, b] = FakeAudio.all;
    expect(a.paused).toBe(true);
    expect(b.volume).toBeCloseTo(0.4);
  });

  it("keeps playing when asked for the same bed again", () => {
    const amb = createAmbience(FakeAudio as unknown as typeof Audio);
    amb.play("/a.mp3", 0.4);
    amb.play("/a.mp3", 0.4);
    expect(FakeAudio.all).toHaveLength(1);
  });

  it("fades out and pauses on stop", () => {
    const amb = createAmbience(FakeAudio as unknown as typeof Audio);
    amb.play("/a.mp3", 0.4);
    vi.advanceTimersByTime(2000);
    amb.stop();
    vi.advanceTimersByTime(2000);
    expect(FakeAudio.all[0].paused).toBe(true);
  });

  it("does nothing without audio support", () => {
    const amb = createAmbience(undefined);
    expect(() => {
      amb.play("/a.mp3");
      amb.stop();
    }).not.toThrow();
  });
});

describe("cuesFor", () => {
  const at = (kind: string, gate?: string) =>
    script.findIndex((s) => s.kind === kind && (!gate || ("gate" in s && s.gate === gate)));

  it("hits the act card, writes each line and turns the page after a gate", () => {
    expect(cuesFor({ at: 0 }).map((c) => c.name)).toEqual(["loreAct"]);
    expect(cuesFor({ at: 1 }, { at: 0 }).map((c) => c.name)).toEqual(["lorePencil"]);
    const gate = at("gate", "triagem");
    expect(cuesFor({ at: gate + 1 }, { at: gate }).map((c) => c.name)).toEqual(["lorePage"]);
  });

  it("unfolds the map at the road and plays the ending", () => {
    const road = at("gate", "estrada");
    expect(cuesFor({ at: road }, { at: road - 1 }).map((c) => c.name)).toEqual(["loreMap"]);
    const end = at("end");
    expect(cuesFor({ at: end, road: "rovers" }, { at: end - 1, road: "rovers" }).map((c) => c.name)).toEqual([
      "loreEnding",
    ]);
  });

  it("stays quiet when nothing moved", () => {
    expect(cuesFor({ at: 3 }, { at: 3 })).toEqual([]);
  });
});
