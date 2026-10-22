import type { ReactNode } from "react";
import { items } from "@/content/items";
import { signed } from "@/lib/format";
import { isWanted } from "@/lib/games/negotiation";
import { conditionMoodles, rank, type SurvivalState } from "@/lib/survival/survival";

const seconds = (value: number) => `${value.toFixed(1).replace(".", ",")} s`;

/** Ficha de uma partida, no estilo do painel do Lazarus Status. */
export function DossierCard({ state, children }: { state: SurvivalState; children?: ReactNode }) {
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
    ["Rovers", `${signed(state.reputation)}${isWanted(state.reputation) ? " · procurado" : ""}`],
    ["Condição", conditions.length ? conditions.join(", ") : "Saudável"],
    ["Mochila", state.inventory.length ? state.inventory.map((i) => items[i].label).join(", ") : "Vazia"],
  ];

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
      {children && <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
