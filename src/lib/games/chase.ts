// 404: você se perdeu e um runner te viu. Cada passada te leva para mais perto da saída.

export const EXIT = 100;
const STRIDE = 6; // quanto cada toque em "Correr" avança
const ZOMBIE_SPEED = 14; // unidades por segundo (é um runner)
const HEAD_START = 30;

export type ChaseState = { you: number; zombie: number; status: "running" | "escaped" | "caught" };

export function createChase(): ChaseState {
  return { you: 0, zombie: -HEAD_START, status: "running" };
}

export function run(state: ChaseState): ChaseState {
  if (state.status !== "running") return state;
  const you = Math.min(EXIT, state.you + STRIDE);
  return { ...state, you, status: you >= EXIT ? "escaped" : "running" };
}

export function stepChase(state: ChaseState, dt: number): ChaseState {
  if (state.status !== "running") return state;
  const zombie = state.zombie + ZOMBIE_SPEED * dt;
  return { ...state, zombie, status: zombie >= state.you ? "caught" : "running" };
}
