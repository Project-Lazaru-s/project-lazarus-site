"use client";

import { useEffect, useRef, useState } from "react";
import { startAmbience, type Ambience } from "@/lib/survival/ambience";

export function SoundToggle({ fear }: { fear: number }) {
  const [on, setOn] = useState(false);
  const ambience = useRef<Ambience | null>(null);

  useEffect(() => {
    ambience.current?.setFear(fear);
  }, [fear, on]);

  useEffect(() => () => ambience.current?.stop(), []);

  const toggle = () => {
    if (on) {
      ambience.current?.stop();
      ambience.current = null;
    } else {
      ambience.current = startAmbience();
    }
    setOn(!on);
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
