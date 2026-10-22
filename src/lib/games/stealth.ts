// Silêncio: atravessar uma rua com infectados sem ser percebido (Lazarus Stealth).
// Unidades: a rua tem STREET_LENGTH "blocos"; o tempo é em segundos.

export const STREET_LENGTH = 100;
export const TIME_LIMIT = 12;

export type Gait = "still" | "crouch" | "walk" | "run";
export type Detection = "calmo" | "atenção" | "investigando" | "avistado";
export type StealthZombie = { x: number; awareness: number };
export type StealthState = {
  x: number;
  time: number;
  gait: Gait;
  zombies: StealthZombie[];
  glass: number[];
  status: "playing" | "won" | "spotted" | "timeout";
};

const SPEED: Record<Gait, number> = { still: 0, crouch: 10, walk: 18, run: 30 };
const NOISE: Record<Gait, number> = { still: 0, crouch: 4, walk: 12, run: 24 };
const GLASS_EXTRA = { crouched: 3, standing: 8 };
const GLASS_REACH = 4;
const HEARING_GAIN = 110; // atenção/s com passos normais colados no zumbi; escala com o volume
const CALM_DOWN = 25; // atenção perdida por segundo em silêncio

export function isOnGlass(glass: number[], x: number) {
  return glass.some((g) => Math.abs(g - x) <= GLASS_REACH);
}

export function noiseRadius(gait: Gait, onGlass: boolean) {
  if (gait === "still") return 0;
  if (!onGlass) return NOISE[gait];
  return NOISE[gait] + (gait === "crouch" ? GLASS_EXTRA.crouched : GLASS_EXTRA.standing);
}

export function detection(awareness: number): Detection {
  if (awareness >= 100) return "avistado";
  if (awareness >= 60) return "investigando";
  if (awareness >= 30) return "atenção";
  return "calmo";
}

export function createStealth(): StealthState {
  return {
    x: 0,
    time: 0,
    gait: "still",
    zombies: [30, 55, 78].map((x) => ({ x, awareness: 0 })),
    glass: [50, 81],
    status: "playing",
  };
}

export function stepStealth(state: StealthState, gait: Gait, dt: number): StealthState {
  if (state.status !== "playing") return state;

  const x = Math.min(STREET_LENGTH, state.x + SPEED[gait] * dt);
  const radius = noiseRadius(gait, isOnGlass(state.glass, x));

  const zombies = state.zombies.map((z) => {
    const distance = Math.abs(z.x - x);
    const heard = radius > 0 && distance <= radius;
    const loudness = radius / NOISE.walk;
    const delta = heard ? HEARING_GAIN * loudness * (1 - distance / (radius + 1)) : -CALM_DOWN;
    return { ...z, awareness: Math.min(100, Math.max(0, z.awareness + delta * dt)) };
  });

  const time = state.time + dt;
  const status = zombies.some((z) => z.awareness >= 100)
    ? "spotted"
    : x >= STREET_LENGTH
      ? "won"
      : time >= TIME_LIMIT
        ? "timeout"
        : "playing";

  return { ...state, x, time, gait, zombies, status };
}
