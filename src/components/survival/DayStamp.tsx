"use client";

import { useEffect, useRef } from "react";
import { threatForDay } from "@/lib/survival/survival";
import { useSfx, useSurvival } from "./SurvivalProvider";

/** Carimbo de "Dia N" quando o dia vira. O `key` refaz a animação CSS, que termina escondida. */
export function DayStamp() {
  const { state } = useSurvival();
  const play = useSfx();
  const lastDay = useRef(state.day);

  useEffect(() => {
    if (state.day > lastDay.current) play("radioStatic", 0.25);
    lastDay.current = state.day;
  }, [state.day, play]);

  if (state.day === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div key={state.day} className="day-stamp plate rounded-sm px-10 py-5 text-center">
        <p className="font-stencil text-6xl text-lazarus sm:text-8xl">Dia {state.day}</p>
        <p className="mt-1 font-stencil text-lg tracking-[0.3em] text-asphalt-deep uppercase">{threatForDay(state.day)}</p>
      </div>
    </div>
  );
}
