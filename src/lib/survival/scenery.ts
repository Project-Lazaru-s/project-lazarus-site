// Cenário da landing: céu que escurece com os dias, cidade em parallax e zumbis na beirada.
import { seededRandom } from "@/lib/games/random";

export const MAX_AMBIENT = 12;

// Quantos infectados andam na beirada a partir de cada dia (segue a tabela de ameaça).
const AMBIENT_BY_DAY: [fromDay: number, count: number][] = [
  [60, MAX_AMBIENT],
  [45, 11],
  [30, 9],
  [20, 7],
  [12, 5],
  [10, 4],
  [6, 2],
  [3, 1],
  [0, 0],
];

export function ambientZombieCount(day: number) {
  return AMBIENT_BY_DAY.find(([from]) => day >= from)![1];
}

export type AmbientZombie = {
  id: number;
  kind: "walker" | "runner";
  direction: 1 | -1;
  /** Segundos para atravessar a tela. */
  duration: number;
  /** Atraso negativo: já começa no meio do caminho, sem fila na entrada. */
  delay: number;
  /** Altura extra em px, para não andarem todos na mesma linha. */
  lift: number;
};

const RUNNERS_FROM_DAY = 6;

/** Infectados determinísticos (mesmo resultado no servidor e no navegador). */
export function ambientZombies(day: number, count: number): AmbientZombie[] {
  return Array.from({ length: count }, (_, id) => {
    const random = seededRandom(id * 7919 + 13);
    const kind = day >= RUNNERS_FROM_DAY && id % 3 === 1 ? "runner" : "walker";
    const duration = kind === "runner" ? 14 + random() * 6 : 38 + random() * 22;
    return {
      id,
      kind,
      direction: random() < 0.5 ? 1 : -1,
      duration,
      delay: -random() * duration,
      lift: Math.round(random() * 10),
    };
  });
}

/** Deslocamento horizontal de uma camada (px), voltando ao início a cada `tile` px. */
export function drift(scrollY: number, speed: number, tile: number) {
  const offset = (scrollY * speed) % tile;
  return offset === 0 ? 0 : -offset;
}

type Rgb = [number, number, number];
const SUNSET: { top: Rgb; bottom: Rgb } = { top: [58, 29, 16], bottom: [217, 130, 43] };
const NIGHT: { top: Rgb; bottom: Rgb } = { top: [5, 7, 13], bottom: [18, 24, 38] };

const mix = (a: Rgb, b: Rgb, t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(" ")})`;

/** Céu do dia: pôr do sol no Dia 0, noite fechada no Dia 60. */
export function skyAt(day: number) {
  const t = Math.min(Math.max(day / 60, 0), 1);
  return { top: mix(SUNSET.top, NIGHT.top, t), bottom: mix(SUNSET.bottom, NIGHT.bottom, t) };
}
