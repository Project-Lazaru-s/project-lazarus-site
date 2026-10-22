// Finalização furtiva (Lazarus Stealth): acertar o momento por trás do infectado.

export const TAKEDOWN_ROUNDS = 3;
export type TakedownRound = { speed: number; window: number };
export type TakedownState = { rounds: TakedownRound[]; results: boolean[]; done: boolean };

/** Posição do marcador (0 a 1) após `t` segundos, indo e voltando `speed` vezes por segundo. */
export function markerAt(t: number, speed: number) {
  const phase = (t * speed * 2) % 2;
  return phase <= 1 ? phase : 2 - phase;
}

export function createTakedown(): TakedownState {
  return {
    rounds: [
      { speed: 0.8, window: 0.26 },
      { speed: 1.1, window: 0.19 },
      { speed: 1.45, window: 0.13 },
    ],
    results: [],
    done: false,
  };
}

/** Golpe com o marcador em `position`: acerta se cair na janela central. */
export function tryTakedown(state: TakedownState, position: number): TakedownState {
  if (state.done) return state;
  const round = state.rounds[state.results.length];
  const hit = Math.abs(position - 0.5) <= round.window / 2;
  const results = [...state.results, hit];
  return { ...state, results, done: results.length === state.rounds.length };
}
