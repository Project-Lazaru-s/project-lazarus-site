import type { SoundName } from "@/lib/survival/sfx";
import { script, type StoryState } from "./story";

// Som de fundo de "O Início do Caos": a música e um ambiente por ato, cada um em loop, com crossfade.
// Os efeitos curtos ficam em SOUNDS (lib/survival/sfx), junto dos outros sons do site.

/** Trilha da história inteira, em loop (composta pelo autor do modpack). */
export const MUSIC = "/sounds/lore/music.mp3";

/** Ambiente de cada ato, por baixo da música (ElevenLabs, loops de 20s). */
export const AMBIENCE: (string | null)[] = [
  "/sounds/lore/amb-hospital.mp3",
  "/sounds/lore/amb-city.mp3",
  "/sounds/lore/amb-camp.mp3",
  "/sounds/lore/amb-checkpoint.mp3",
  "/sounds/lore/amb-dawn.mp3",
];

const FADE_MS = 1500;
const TICK_MS = 50;

export type AmbiencePlayer = { play: (src: string, volume?: number) => void; stop: () => void };

/** Leva o volume de um elemento até `to` em FADE_MS; ao chegar em 0, pausa. */
function fade(el: HTMLAudioElement, to: number) {
  const from = el.volume;
  const steps = FADE_MS / TICK_MS;
  let i = 0;
  const id = setInterval(() => {
    i++;
    el.volume = Math.min(1, Math.max(0, from + ((to - from) * i) / steps));
    if (i >= steps) {
      clearInterval(id);
      if (to === 0) el.pause();
    }
  }, TICK_MS);
  return () => clearInterval(id);
}

export function createAmbience(AudioCtor: typeof Audio | undefined): AmbiencePlayer {
  let current: { src: string; el: HTMLAudioElement; cancel: () => void } | null = null;

  const fadeOut = () => {
    if (!current) return;
    current.cancel();
    fade(current.el, 0);
    current = null;
  };

  return {
    play: (src, volume = 0.35) => {
      if (!AudioCtor || current?.src === src) return;
      fadeOut();
      const el = new AudioCtor(src);
      el.loop = true;
      el.volume = 0;
      el.play()?.catch(() => {});
      current = { src, el, cancel: fade(el, volume) };
    },
    stop: fadeOut,
  };
}

export type Cue = { name: SoundName; volume: number };

/** O que toca quando a história anda de `prev` para `next` (sem `prev`: começo ou retomada). */
export function cuesFor(next: StoryState, prev?: StoryState): Cue[] {
  if (prev && prev.at === next.at) return [];
  const step = script[next.at];
  const before = script[next.at - 1];
  switch (step.kind) {
    case "act":
      return [{ name: "loreAct", volume: 0.6 }];
    case "line":
      // A fala logo depois de um portão é a página recuperada.
      return prev && before?.kind === "gate"
        ? [{ name: "lorePage", volume: 0.6 }]
        : [{ name: "lorePencil", volume: 0.25 }];
    case "gate":
      return step.gate === "estrada" ? [{ name: "loreMap", volume: 0.6 }] : [];
    case "end":
      return [{ name: "loreEnding", volume: 0.7 }];
  }
}
