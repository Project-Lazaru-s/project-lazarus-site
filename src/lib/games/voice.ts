// A sua voz vira ruído (Lazarus Stealth + Simple Voice Chat): o volume do microfone
// vira o raio, em blocos, em que os infectados te ouvem.

export type VoiceLevel = { name: string; radius: number; minRms: number };

// ponytail: limiares fixos de RMS; microfones variam, por isso existe `sensitivity` na UI.
export const VOICE_LEVELS: VoiceLevel[] = [
  { name: "Silêncio", radius: 0, minRms: 0 },
  { name: "Sussurro", radius: 2.5, minRms: 0.015 },
  { name: "Fala", radius: 10, minRms: 0.06 },
  { name: "Grito", radius: 18, minRms: 0.2 },
];

const FADE_PER_SECOND = 20; // blocos por segundo que o raio perde depois que você se cala

export function rms(samples: Float32Array) {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (const s of samples) sum += s * s;
  return Math.sqrt(sum / samples.length);
}

export function voiceLevel(loudness: number, sensitivity = 1) {
  const value = loudness * sensitivity;
  return VOICE_LEVELS.findLast((level) => value >= level.minRms)!;
}

export function smoothRadius(current: number, target: number, dt: number) {
  return target >= current ? target : Math.max(target, current - FADE_PER_SECOND * dt);
}

export function heardBy(distances: number[], radius: number) {
  return distances.map((d) => d <= radius);
}
