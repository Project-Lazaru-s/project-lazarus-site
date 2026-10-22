import { describe, expect, it } from "vitest";
import { clearRun, hasProgress, loadRun, SAVE_KEY, saveRun } from "./save";
import { initialSurvival, type SurvivalState } from "./survival";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

const run: SurvivalState = {
  ...initialSurvival,
  day: 13,
  kills: 7,
  deaths: 1,
  fear: 40,
  inventory: ["antibiotic", "ammo"],
  stomach: "sick",
  reputation: -30,
  sound: true,
  achievements: ["silencio"],
  toasts: [{ id: "silencio", n: 1 }],
  record: { ...initialSurvival.record, stealthBest: 8.2, stealthClean: true, chest: "forced" },
};

describe("saveRun / loadRun", () => {
  it("round-trips the run", () => {
    const storage = memoryStorage();
    saveRun(storage, run);
    expect(loadRun(storage)).toMatchObject({
      day: 13,
      kills: 7,
      inventory: ["antibiotic", "ammo"],
      stomach: "sick",
      reputation: -30,
      achievements: ["silencio"],
      record: { stealthBest: 8.2, stealthClean: true, chest: "forced" },
    });
  });

  it("never restores sound on (browsers need a click) nor old toasts", () => {
    const storage = memoryStorage();
    saveRun(storage, run);
    expect(loadRun(storage)).toMatchObject({ sound: false, toasts: [] });
  });

  it("returns null when there is nothing saved", () => {
    expect(loadRun(memoryStorage())).toBeNull();
  });

  it.each([
    ["broken JSON", "{nope"],
    ["not an object", "42"],
    ["a day out of range", JSON.stringify({ ...run, day: 999 })],
    ["negative kills", JSON.stringify({ ...run, kills: -1 })],
    ["unknown items", JSON.stringify({ ...run, inventory: ["rocket-launcher"] })],
    ["a bad stomach", JSON.stringify({ ...run, stomach: "fine" })],
  ])("ignores %s", (_, raw) => {
    expect(loadRun(memoryStorage({ [SAVE_KEY]: raw }))).toBeNull();
  });

  it("drops achievements it does not know", () => {
    const storage = memoryStorage({ [SAVE_KEY]: JSON.stringify({ ...run, achievements: ["silencio", "hacker"] }) });
    expect(loadRun(storage)?.achievements).toEqual(["silencio"]);
  });

  it("survives a browser that blocks storage", () => {
    const blocked = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(() => saveRun(blocked, run)).not.toThrow();
    expect(loadRun(blocked)).toBeNull();
    expect(() => clearRun(blocked)).not.toThrow();
  });

  it("clears the saved run", () => {
    const storage = memoryStorage();
    saveRun(storage, run);
    clearRun(storage);
    expect(loadRun(storage)).toBeNull();
  });
});

describe("hasProgress", () => {
  it("is false for a fresh run and true once something happened", () => {
    expect(hasProgress(initialSurvival)).toBe(false);
    expect(hasProgress({ ...initialSurvival, day: 3 })).toBe(true);
    expect(hasProgress({ ...initialSurvival, achievements: ["silencio"] })).toBe(true);
  });
});
