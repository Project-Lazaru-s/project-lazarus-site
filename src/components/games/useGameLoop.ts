"use client";

import { useEffect, useRef } from "react";

/** Chama `tick(dt)` a cada frame enquanto `running`; dt em segundos, limitado para abas que voltam do background. */
export function useGameLoop(tick: (dt: number) => void, running: boolean) {
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      tickRef.current(Math.min((now - last) / 1000, 0.1));
      last = now;
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [running]);
}
