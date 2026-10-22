"use client";

import { useState } from "react";
import { items } from "@/content/items";
import { conditionMoodles, rank, shareText } from "@/lib/survival/survival";
import { useSurvival } from "./SurvivalProvider";

const seconds = (value: number) => `${value.toFixed(1).replace(".", ",")} s`;

/** Ficha final do visitante, no estilo do painel do Lazarus Status. */
export function Dossier() {
  const { state } = useSurvival();
  const [shared, setShared] = useState(false);
  const { record } = state;
  const conditions = conditionMoodles(state);

  const rows: [string, string | number][] = [
    ["Dias", state.day],
    ["Abates", state.kills],
    ["Mortes", state.deaths],
    ["Melhor travessia", record.stealthBest === null ? "—" : seconds(record.stealthBest)],
    ["Hordas contidas", record.hordesHeld],
    ["Finalizações", record.takedowns],
    ["Saque", record.lootOpened ? `${record.lootFound} de ${record.lootOpened}` : "—"],
    ["Condição", conditions.length ? conditions.join(", ") : "Saudável"],
    ["Mochila", state.inventory.length ? state.inventory.map((i) => items[i].label).join(", ") : "Vazia"],
  ];

  const share = async () => {
    const text = shareText(state, window.location.origin);
    if (navigator.share) await navigator.share({ text }).catch(() => {});
    else await navigator.clipboard?.writeText(text);
    setShared(true);
  };

  return (
    <div className="plate rounded-sm p-5 text-asphalt-deep">
      <p className="font-stencil text-xs tracking-[0.3em]">LAZARUS STATUS</p>
      <h3 className="font-stencil text-4xl text-lazarus">{rank(state)}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="border-b border-asphalt-deep/15 py-1">
            <dt className="text-[10px] tracking-widest text-asphalt-deep/60 uppercase">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={share}
          className="rounded bg-asphalt-deep px-4 py-2 text-sm font-semibold text-plate hover:bg-asphalt"
        >
          Compartilhar
        </button>
        {shared && (
          <span role="status" className="text-sm">
            Copiado. Desafie alguém.
          </span>
        )}
      </div>
    </div>
  );
}
