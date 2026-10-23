import { SIDES } from "./enlist";

/** Dial do rádio de recrutamento: três facções escondidas entre 85 e 125 MHz. */
export const DIAL = { min: 85, max: 125, step: 0.1, start: 95.6, width: 1.5 };

export const STATIONS = SIDES.filter((s) => s.freq !== null);

/** A estação mais próxima e a força do sinal (0 = só estática, 1 = limpo). */
export function tune(freq: number) {
  const station = STATIONS.reduce((a, b) => (Math.abs(b.freq - freq) < Math.abs(a.freq - freq) ? b : a));
  const strength = Math.max(0, 1 - Math.abs(freq - station.freq) / DIAL.width);
  return { station, strength, locked: strength >= 0.9 };
}

/** Troca letras por estática conforme o sinal some. Determinístico, para não piscar a cada render. */
export function staticky(text: string, strength: number) {
  return [...text].map((c, i) => (c !== " " && ((i * 7) % 10) / 10 >= strength ? "▒" : c)).join("");
}
