"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { SoundName } from "@/lib/survival/sfx";

/** Toca um efeito (ou nada, com o som desligado). Os portões pegam daqui, sem prop drilling. */
export const LoreSfx = createContext<(name: SoundName, volume?: number) => void>(() => {});
export const useLoreSfx = () => useContext(LoreSfx);

const PREF = "lazarus:lore:sound";
const CHANGED = "lazarus:lore:sound-changed";

function read() {
  try {
    return localStorage.getItem(PREF) ?? "1";
  } catch {
    return "1";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  return () => window.removeEventListener(CHANGED, onChange);
}

/**
 * Preferência de som do jogo, lembrada neste navegador. Ligado por padrão: o jogo só começa
 * depois de um clique em "Novo jogo", então o navegador já permite tocar áudio.
 */
export function useSoundPref(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, read, () => "1") === "1";
  const set = (next: boolean) => {
    try {
      localStorage.setItem(PREF, next ? "1" : "0");
    } catch {
      // Sem armazenamento, vale até recarregar.
    }
    window.dispatchEvent(new Event(CHANGED));
  };
  return [on, set];
}

export function SoundButton({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className="rounded border border-plate/30 bg-black/50 px-3 py-1.5 font-mono text-xs text-plate/70 hover:border-sunset hover:text-sunset pointer-coarse:min-h-11"
    >
      {on ? "Som ligado" : "Som desligado"}
    </button>
  );
}
