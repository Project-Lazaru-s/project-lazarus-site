"use client";

import { useEffect, useRef } from "react";
import { drift, skyAt } from "@/lib/survival/scenery";
import { useSurvival } from "./SurvivalProvider";

// Camadas de 640 px desenhadas em 2x (pixel art), então o padrão se repete a cada 1280 px.
const TILE = 1280;
const LAYERS = [
  { src: "/images/game/city-far.png", height: 192, speed: 0.08, opacity: 0.55 },
  { src: "/images/game/city-near.png", height: 256, speed: 0.22, opacity: 0.85 },
];

/** Céu que escurece com os dias e silhuetas da cidade deslizando com o scroll, atrás do conteúdo. */
export function Scenery() {
  const { state } = useSurvival();
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const sky = skyAt(state.day);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      LAYERS.forEach((layer, i) => {
        const el = layers.current[i];
        if (el) el.style.backgroundPositionX = `${drift(window.scrollY, layer.speed, TILE)}px`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-40 transition-[background] duration-[2000ms]"
        style={{ background: `linear-gradient(to bottom, ${sky.top} 0%, ${sky.bottom} 85%, ${sky.bottom} 100%)` }}
      />
      {LAYERS.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            layers.current[i] = el;
          }}
          className="absolute inset-x-0 bottom-0 bg-repeat-x pixelated"
          style={{
            height: layer.height,
            opacity: layer.opacity,
            backgroundImage: `url(${layer.src})`,
            backgroundSize: `${TILE}px ${layer.height}px`,
          }}
        />
      ))}
      {/* Escurece a base para o texto continuar legível sobre a cidade. */}
      <div className="absolute inset-0 bg-gradient-to-b from-asphalt-deep/30 via-asphalt-deep/60 to-asphalt-deep/40" />
    </div>
  );
}
