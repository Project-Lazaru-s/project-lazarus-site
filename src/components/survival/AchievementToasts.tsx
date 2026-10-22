"use client";

import { useEffect, useRef } from "react";
import { achievement } from "@/lib/survival/achievements";
import { useSfx, useSurvival } from "./SurvivalProvider";

const VISIBLE = 3;

/** Avisos de conquista; cada um some sozinho pela animação CSS. */
export function AchievementToasts() {
  const { state } = useSurvival();
  const play = useSfx();
  const announced = useRef(state.toasts.length);

  useEffect(() => {
    if (state.toasts.length > announced.current) play("achievement");
    announced.current = state.toasts.length;
  }, [state.toasts.length, play]);

  return (
    <ol
      aria-label="Conquistas desbloqueadas"
      role="log"
      className="pointer-events-none fixed inset-x-2 bottom-16 z-50 space-y-2 sm:top-20 sm:right-4 sm:bottom-auto sm:left-auto sm:w-72"
    >
      {state.toasts.slice(-VISIBLE).map(({ id, n }) => {
        const a = achievement(id);
        if (!a) return null;
        return (
          <li
            key={n}
            className="achievement-toast plate flex items-center gap-2 rounded-sm p-2 text-asphalt-deep sm:gap-3 sm:p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.icon} alt="" className="h-8 w-8 shrink-0 object-contain pixelated sm:h-10 sm:w-10" />
            <div>
              <p className="font-stencil text-[10px] tracking-[0.25em]">CONQUISTA</p>
              <p className="font-stencil text-base leading-tight text-lazarus sm:text-lg">{a.title}</p>
              <p className="text-xs text-asphalt-deep/70 max-sm:hidden">{a.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
