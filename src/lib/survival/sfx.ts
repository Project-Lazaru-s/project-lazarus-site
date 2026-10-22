// Efeitos sonoros (gerados com o ElevenLabs). Só tocam com o som ligado pelo visitante.

export const SOUNDS = {
  radioStatic: "/sounds/radio-static.mp3",
  gunshot: "/sounds/gunshot.mp3",
  headshot: "/sounds/headshot.mp3",
  bulletHit: "/sounds/bullet-hit.mp3",
  dryFire: "/sounds/dry-fire.mp3",
  hordeGroans: "/sounds/horde-groans.mp3",
  barricadeBreach: "/sounds/barricade-breach.mp3",
  zombieAlert: "/sounds/zombie-alert.mp3",
  glassCrunch: "/sounds/glass-crunch.mp3",
  knifeStab: "/sounds/knife-stab.mp3",
  zombieBite: "/sounds/zombie-bite.mp3",
  lockPin: "/sounds/lock-pin.mp3",
  lockpickBreak: "/sounds/lockpick-break.mp3",
  chestOpen: "/sounds/chest-open.mp3",
  drink: "/sounds/drink.mp3",
  cabinetSearch: "/sounds/cabinet-search.mp3",
  deathSting: "/sounds/death-sting.mp3",
  huntersArrive: "/sounds/hunters-arrive.mp3",
  achievement: "/sounds/achievement.mp3",
} as const;

export type SoundName = keyof typeof SOUNDS;
export type Sfx = { preload: () => void; play: (name: SoundName, volume?: number) => void };

export function createSfx(AudioCtor: typeof Audio | undefined): Sfx {
  const loaded = new Map<SoundName, HTMLAudioElement>();
  const load = (name: SoundName) => {
    let audio = loaded.get(name);
    if (!audio && AudioCtor) {
      audio = new AudioCtor(SOUNDS[name]);
      audio.preload = "auto";
      loaded.set(name, audio);
    }
    return audio;
  };

  return {
    preload: () => (Object.keys(SOUNDS) as SoundName[]).forEach(load),
    play: (name, volume = 1) => {
      const copy = load(name)?.cloneNode() as HTMLAudioElement | undefined;
      if (!copy) return;
      copy.volume = volume;
      copy.play()?.catch(() => {});
    },
  };
}
