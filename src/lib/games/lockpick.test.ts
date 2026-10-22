import { describe, expect, it } from "vitest";
import { createLock, forceLock, LOCKPICKS, pickPin, PINS, type LockState } from "./lockpick";

const known = (order: number[]): LockState => ({ ...createLock(() => 0), order });

describe("createLock", () => {
  it("hides a random order of every pin", () => {
    for (const seed of [0, 0.25, 0.5, 0.99]) {
      const { order } = createLock(() => seed);
      expect([...order].sort()).toEqual(Array.from({ length: PINS }, (_, i) => i));
    }
  });

  it("starts with no pin set and a full set of lockpicks", () => {
    expect(createLock(Math.random)).toMatchObject({ set: 0, picks: LOCKPICKS, status: "picking" });
  });
});

describe("pickPin", () => {
  it("the right pin sets and stays up", () => {
    const lock = pickPin(known([2, 0, 3, 1]), 2);
    expect(lock).toMatchObject({ set: 1, picks: LOCKPICKS, lastWrong: null });
  });

  it("all pins in order open the lock", () => {
    let lock = known([2, 0, 3, 1]);
    for (const pin of [2, 0, 3, 1]) lock = pickPin(lock, pin);
    expect(lock.status).toBe("open");
  });

  it("a wrong pin drops every pin and breaks a lockpick", () => {
    let lock = pickPin(known([2, 0, 3, 1]), 2);
    lock = pickPin(lock, 3);
    expect(lock).toMatchObject({ set: 0, picks: LOCKPICKS - 1, lastWrong: 3 });
  });

  it("touching a pin that is already up does nothing", () => {
    const lock = pickPin(known([2, 0, 3, 1]), 2);
    expect(pickPin(lock, 2)).toBe(lock);
  });

  it("jams when the last lockpick breaks", () => {
    let lock = known([0, 1, 2, 3]);
    for (let i = 0; i < LOCKPICKS; i++) lock = pickPin(lock, 3);
    expect(lock).toMatchObject({ picks: 0, status: "jammed" });
    expect(pickPin(lock, 0)).toBe(lock);
  });

  it("gives enough lockpicks for a careful player on average, not for the unluckiest one", () => {
    // Com memória perfeita, cada posição custa em média metade das alternativas restantes.
    const averageMisses = Array.from({ length: PINS }, (_, i) => (PINS - 1 - i) / 2).reduce((a, b) => a + b);
    const worstCaseMisses = (PINS * (PINS - 1)) / 2;
    expect(LOCKPICKS).toBeGreaterThan(averageMisses);
    expect(LOCKPICKS).toBeLessThan(worstCaseMisses);
  });
});

describe("forceLock", () => {
  it("breaks the lock open, the loud way", () => {
    expect(forceLock(known([0, 1, 2, 3])).status).toBe("forced");
    const open = { ...known([0, 1, 2, 3]), status: "open" as const };
    expect(forceLock(open)).toBe(open);
  });
});
