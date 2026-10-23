"use client";

import { useEffect, useState } from "react";
import { broadcasts } from "@/content/lore";

const EVERY_MS = 4000;

/** Ato II: o rádio repete instruções que perdem a validade; desligar poupa bateria. */
export function EmergencyRadio() {
  const [on, setOn] = useState(true);
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setLine((n) => (n + 1) % broadcasts.length), EVERY_MS);
    return () => clearInterval(id);
  }, [on]);

  return (
    <figure className="rounded border border-radio/40 bg-black/80 p-4 font-mono text-sm text-radio shadow-[0_0_24px_rgb(85_255_85/0.1)]">
      <figcaption className="flex items-center justify-between gap-3 text-xs text-radio/60 uppercase">
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/game/radio.png" alt="" className="h-6 w-6 pixelated" />
          Aviso público · {on ? "no ar" : "desligado"}
        </span>
        <button
          type="button"
          onClick={() => setOn(!on)}
          className="rounded border border-radio/40 px-2 py-1 hover:bg-radio/10 pointer-coarse:min-h-11 pointer-coarse:px-3"
        >
          {on ? "Desligar (poupar bateria)" : "Ligar"}
        </button>
      </figcaption>
      <p aria-live="polite" className="mt-4 min-h-12 text-base">
        {on ? (
          <span key={line} className="lore-broadcast block">
            <span className="text-radio/60">[AVISO] </span>
            <span>{broadcasts[line]}</span>
          </span>
        ) : (
          <span className="text-plate/50">Silêncio. Não durou.</span>
        )}
      </p>
    </figure>
  );
}
