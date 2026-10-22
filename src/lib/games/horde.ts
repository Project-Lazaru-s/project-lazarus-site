// Contenção de horda: segurar a barricada contra uma onda (The Hordes + Dual Hitbox Zombies).
// `distance` vai de ~100 (horizonte) até 0 (barricada); o tempo é em segundos.

export type ZombieKind = "walker" | "runner" | "soldier";
export type Part = "head" | "body" | "miss";
export type HordeZombie = { id: number; kind: ZombieKind; lane: number; distance: number; hp: number; helmet: boolean };
export type HordeState = {
  wave: number;
  zombies: HordeZombie[];
  ammo: number;
  shots: number;
  kills: number;
  nextId: number;
  status: "playing" | "held" | "breached";
};
export type Random = () => number;

const SPEED: Record<ZombieKind, number> = { walker: 9, runner: 18, soldier: 7 };
const BODY_HP: Record<ZombieKind, number> = { walker: 3, runner: 2, soldier: 4 };
const HEAD_ROWS = 8 / 32;
const HEAD_HALF_WIDTH = 4 / 16;
const SHOTS_PER_NOISE_SPAWN = 5;
const MAX_JITTER = 0.25;

/** Gerador determinístico (LCG) para a cena estática do prerender, onde Math.random não pode entrar. */
export function seededRandom(seed: number): Random {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function waveSize(wave: number) {
  return Math.ceil(6 * 1.15 ** (wave - 1));
}

function spawn(id: number, kind: ZombieKind, random: Random, distance: number): HordeZombie {
  return { id, kind, lane: 0.1 + random() * 0.8, distance, hp: BODY_HP[kind], helmet: kind === "soldier" };
}

function kindFor(index: number, wave: number): ZombieKind {
  if (index % 4 === 1) return "runner";
  if (wave >= 2 && index % 4 === 3) return "soldier";
  return "walker";
}

export function createHorde(wave: number, random: Random): HordeState {
  const size = waveSize(wave);
  return {
    wave,
    zombies: Array.from({ length: size }, (_, i) => spawn(i, kindFor(i, wave), random, 100 + i * 6)),
    ammo: size * 2 + 4,
    shots: 0,
    kills: 0,
    nextId: size,
    status: "playing",
  };
}

export function nextWave(state: HordeState, random: Random): HordeState {
  const next = createHorde(state.wave + 1, random);
  return { ...next, kills: state.kills };
}

/**
 * Onde o tiro pegou, dado o ponto clicado no sprite (x e y de 0 a 1, y = 0 no topo)
 * e o tremor vertical da mira. A cabeça é o quadrado central de 8x8 no topo.
 */
export function hitPart(xRatio: number, yRatio: number, jitter: number): Part {
  const y = yRatio + jitter;
  if (y < 0 || y > 1) return "miss";
  if (y >= HEAD_ROWS) return "body";
  return Math.abs(xRatio - 0.5) <= HEAD_HALF_WIDTH ? "head" : "miss";
}

/** Tremor da mira causado pelo medo (moodle Fearful/Panicked). */
export function aimJitter(fear: number, random: Random) {
  return (random() * 2 - 1) * (fear / 100) * MAX_JITTER;
}

export function shoot(state: HordeState, id: number, part: Part, random: Random): HordeState {
  if (state.status !== "playing" || state.ammo <= 0) return state;

  let kills = state.kills;
  const zombies = state.zombies.flatMap((z) => {
    if (z.id !== id || part === "miss") return [z];
    if (part === "head" && z.helmet) return [{ ...z, helmet: false }];
    const hp = part === "head" ? 0 : z.hp - 1;
    if (hp > 0) return [{ ...z, hp }];
    kills++;
    return [];
  });

  const shots = state.shots + 1;
  let nextId = state.nextId;
  // Tiros fazem barulho: atraem mais infectados de longe.
  if (shots % SHOTS_PER_NOISE_SPAWN === 0) zombies.push(spawn(nextId++, "walker", random, 110));

  return { ...state, zombies, ammo: state.ammo - 1, shots, kills, nextId };
}

export function stepHorde(state: HordeState, dt: number): HordeState {
  if (state.status !== "playing") return state;
  const zombies = state.zombies.map((z) => ({ ...z, distance: z.distance - SPEED[z.kind] * dt }));
  const status = zombies.some((z) => z.distance <= 0) ? "breached" : zombies.length === 0 ? "held" : "playing";
  return { ...state, zombies, status };
}
