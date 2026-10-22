// Gazua no cadeado (Locks Reforged, no modpack): pinos numa ordem secreta.
// O pino certo trava em cima; o errado derruba todos e quebra uma gazua.
import type { Random } from "./random";

export const PINS = 4;
export const LOCKPICKS = 4; // dá para abrir com atenção, mas não chutando à toa

export type LockState = {
  order: number[];
  set: number;
  picks: number;
  lastWrong: number | null;
  status: "picking" | "open" | "jammed" | "forced";
};

export function createLock(random: Random): LockState {
  const order = Array.from({ length: PINS }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { order, set: 0, picks: LOCKPICKS, lastWrong: null, status: "picking" };
}

export function isPinSet(lock: LockState, pin: number) {
  return lock.order.slice(0, lock.set).includes(pin);
}

export function pickPin(lock: LockState, pin: number): LockState {
  if (lock.status !== "picking" || isPinSet(lock, pin)) return lock;
  if (lock.order[lock.set] === pin) {
    const set = lock.set + 1;
    return { ...lock, set, lastWrong: null, status: set === PINS ? "open" : "picking" };
  }
  const picks = lock.picks - 1;
  return { ...lock, set: 0, picks, lastWrong: pin, status: picks === 0 ? "jammed" : "picking" };
}

/** Arrombar: abre sempre, mas faz barulho. */
export function forceLock(lock: LockState): LockState {
  return lock.status === "open" || lock.status === "forced" ? lock : { ...lock, status: "forced" };
}
