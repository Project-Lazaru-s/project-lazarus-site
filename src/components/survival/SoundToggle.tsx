"use client";

import { useEffect, useRef } from "react";
import { startAmbience, type Ambience } from "@/lib/survival/ambience";

type Props = { on: boolean; fear: number; onChange: (on: boolean) => void };

export function SoundToggle({ on, fear, onChange }: Props) {
  const ambience = useRef<Ambience | null>(null);

  useEffect(() => {
    ambience.current?.setFear(fear);
  }, [fear, on]);

  useEffect(() => () => ambience.current?.stop(), []);

  // O áudio só pode começar dentro do clique (política de autoplay dos navegadores).
  const toggle = () => {
    if (on) {
      ambience.current?.stop();
      ambience.current = null;
    } else {
      ambience.current = startAmbience();
    }
    onChange(!on);
  };

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      className="rounded border border-plate/30 px-2 py-0.5 text-plate/70 hover:text-plate"
    >
      {on ? "Som ligado" : "Som desligado"}
    </button>
  );
}
