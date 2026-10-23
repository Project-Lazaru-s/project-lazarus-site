"use client";

import { useState } from "react";
import { threeWays } from "@/content/lore";

/** Ato III: água, caminho, portão. Cada palavra vira a facção que nasceu dela. */
export function ThreeWays() {
  const [open, setOpen] = useState<string[]>([]);

  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {threeWays.map((way) => {
        const flipped = open.includes(way.word);
        return (
          <li key={way.word} className="reveal faction-card [perspective:1600px]">
            <div className={`faction-card-inner grid ${flipped ? "is-flipped" : ""}`}>
              <button
                type="button"
                inert={flipped}
                aria-label={`Virar: ${way.word}`}
                onClick={() => setOpen([...open, way.word])}
                className="faction-face flex min-h-64 flex-col items-center justify-center gap-3 rounded border border-rust/40 bg-asphalt p-6 [grid-area:1/1] hover:border-sunset"
              >
                <span className="font-hand text-5xl text-plate">{way.word}</span>
                <span className="font-mono text-xs tracking-widest text-plate/50 uppercase">Virar ↻</span>
              </button>
              <div
                inert={!flipped}
                className="faction-face faction-back plate flex min-h-64 flex-col rounded-sm p-6 text-asphalt-deep [grid-area:1/1]"
              >
                <p className="font-hand text-2xl text-asphalt-deep/60">{way.word}</p>
                <h3 className="font-stencil text-3xl text-lazarus">{way.faction}</h3>
                <p className="mt-2 text-sm">{way.origin}</p>
                <p className="mt-auto pt-3 text-sm font-semibold">{way.cost}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
