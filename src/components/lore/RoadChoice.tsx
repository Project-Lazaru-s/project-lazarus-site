"use client";

import { useState } from "react";
import { roads } from "@/content/lore";

/** Ato V: a última folha do caderno. Três caminhos até a cidade; o leitor escolhe por onde começar. */
export function RoadChoice() {
  const [chosen, setChosen] = useState<string>();
  const road = roads.find((r) => r.id === chosen);

  return (
    <fieldset className="lore-paper rounded p-5 text-asphalt-deep sm:p-6">
      <legend className="sr-only">Escolha um caminho até a cidade</legend>
      <p className="font-hand text-2xl text-asphalt-deep/70">três caminhos até a cidade</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {roads.map((r) => (
          <label
            key={r.id}
            className={`cursor-pointer rounded border-2 border-dashed p-4 transition has-[:checked]:border-solid has-[:checked]:border-lazarus has-[:checked]:bg-lazarus/10 ${
              r.id === "desconhecido" ? "border-asphalt-deep/30" : "border-asphalt-deep/40"
            } hover:border-lazarus/60`}
          >
            <input
              type="radio"
              name="caminho"
              value={r.id}
              checked={chosen === r.id}
              onChange={() => setChosen(r.id)}
              className="sr-only"
            />
            <span className="block font-stencil text-2xl">{r.label}</span>
            <span className="mt-1 block text-sm">{r.detail}</span>
          </label>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 min-h-6 font-hand text-2xl text-lazarus">
        {road?.outcome}
      </p>
    </fieldset>
  );
}
