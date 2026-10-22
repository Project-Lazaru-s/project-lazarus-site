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
    <ol aria-label="Conquistas desbloqueadas" role="log" className="pointer-events-none fixed top-20 right-4 z-50 w-72 space-y-2">
      {state.toasts.slice(-VISIBLE).map(({ id, n }) => {
        const a = achievement(id);
        if (!a) return null;
        return (
          <li key={n} className="achievement-toast plate flex items-center gap-3 rounded-sm p-3 text-asphalt-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.icon} alt="" className="h-10 w-10 object-contain pixelated" />
            <div>
              <p className="font-stencil text-[10px] tracking-[0.25em]">CONQUISTA</p>
              <p className="font-stencil text-lg leading-tight text-lazarus">{a.title}</p>
              <p className="text-xs text-asphalt-deep/70">{a.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
