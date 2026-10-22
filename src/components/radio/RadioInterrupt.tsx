"use client";

import { useEffect, useRef } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { interruptFor } from "@/content/radio";

/** Transmissão que corta a página quando o dia chega. O `key` refaz a animação CSS, que some sozinha. */
export function RadioInterrupt() {
  const { state } = useSurvival();
  const play = useSfx();
  const radio = interruptFor(state.day);
  const lastDay = useRef(radio?.day ?? 0);

  useEffect(() => {
    if (radio && radio.day > lastDay.current) play("radioStatic", 0.45);
    lastDay.current = radio?.day ?? 0;
  }, [radio, play]);

  if (!radio) return null;

  const tune = () =>
    document.querySelector<HTMLElement>(`[data-day="${radio.target}"]`)?.scrollIntoView?.({ behavior: "smooth" });

  return (
    <div
      key={radio.day}
      role="log"
      aria-label="Transmissão de rádio"
      className="radio-interrupt fixed inset-x-2 top-16 z-40 rounded text-xs sm:inset-x-auto sm:top-auto sm:right-4 sm:bottom-4 sm:w-80 sm:text-sm border border-radio/50 bg-black/90 p-2 font-mono text-radio sm:p-3 shadow-[0_0_24px_rgb(85_255_85/0.15)]"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/game/radio.png" alt="" className="h-6 w-6 shrink-0 pixelated sm:h-8 sm:w-8" />
        <p className="flex-1 max-sm:line-clamp-2">{radio.message}</p>
      </div>
      <button
        type="button"
        onClick={tune}
        className="mt-2 w-full rounded border border-radio/40 px-2 py-1 text-xs hover:bg-radio/10 max-sm:mt-1.5"
      >
        Sintonizar
      </button>
    </div>
  );
}
