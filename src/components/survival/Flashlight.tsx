"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { isReckless, lightSpeed, NIGHT_FROM_DAY, RECKLESS_FEAR } from "@/lib/survival/flashlight";
import { useSurvival } from "./SurvivalProvider";

const SPOTTED_COOLDOWN_MS = 2000;

/**
 * À noite, a seção fica escura e o cursor vira um facho de luz.
 * Varrer a rua rápido demais chama a atenção deles (e sobe o medo).
 */
export function Flashlight({ children }: { children: ReactNode }) {
  const { state, dispatch } = useSurvival();
  const [lightsOn, setLightsOn] = useState(false);
  const [spotted, setSpotted] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastSpotted = useRef(-Infinity);

  const night = state.day >= NIGHT_FROM_DAY && !lightsOn;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!night || !area.current) return;
    const box = area.current.getBoundingClientRect();
    area.current.style.setProperty("--light-x", `${e.clientX - box.left}px`);
    area.current.style.setProperty("--light-y", `${e.clientY - box.top}px`);

    const now = performance.now();
    const prev = last.current;
    last.current = { x: e.clientX, y: e.clientY, t: now };
    if (!prev) return;
    const speed = lightSpeed(e.clientX - prev.x, e.clientY - prev.y, now - prev.t);
    if (isReckless(speed) && now - lastSpotted.current > SPOTTED_COOLDOWN_MS) {
      lastSpotted.current = now;
      dispatch({ type: "fear", amount: RECKLESS_FEAR });
      setSpotted((n) => n + 1);
    }
  };

  return (
    <div ref={area} onPointerMove={move} className="relative">
      {children}
      {night && (
        <div
          data-flashlight
          aria-hidden
          className="pointer-events-none absolute -inset-4 z-10 rounded"
          style={{
            background:
              "radial-gradient(circle 190px at var(--light-x, 50%) var(--light-y, 50%), transparent 0%, transparent 55%, rgb(3 4 8 / 0.9) 100%)",
          }}
        />
      )}
      {night && spotted > 0 && (
        <p
          key={spotted}
          className="flash-warning pointer-events-none absolute top-2 left-1/2 z-20 -translate-x-1/2 rounded bg-lazarus px-3 py-1 font-mono text-xs text-plate"
        >
          Eles viram a luz.
        </p>
      )}
      {state.day >= NIGHT_FROM_DAY && (
        <button
          type="button"
          onClick={() => setLightsOn((on) => !on)}
          className="absolute -top-9 right-0 z-20 rounded border border-plate/30 bg-asphalt-deep/80 px-2 py-1 font-mono text-xs pointer-coarse:-top-12 pointer-coarse:min-h-11 pointer-coarse:px-3 text-plate/70 hover:text-plate"
        >
          {lightsOn ? "Usar a lanterna" : "Acender a luz"}
        </button>
      )}
    </div>
  );
}
