export type Random = () => number;

/** Gerador determinístico (LCG) para cenas estáticas do prerender, onde Math.random não pode entrar. */
export function seededRandom(seed: number): Random {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
