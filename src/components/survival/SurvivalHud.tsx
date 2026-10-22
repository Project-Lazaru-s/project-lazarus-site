import type { ReactNode } from "react";
import { items } from "@/content/items";
import { isWanted } from "@/lib/games/negotiation";
import {
  conditionMoodles,
  fearMoodle,
  lootForDay,
  needsMoodles,
  threatForDay,
  type Item,
  type SurvivalState,
} from "@/lib/survival/survival";

const moodleColor = { Tense: "text-sunset", Fearful: "text-rust-light", Panicked: "text-lazarus" } as const;
const conditionIcon: Record<string, string> = {
  Sick: "/images/game/moodle-sick.png",
  "Severely Sick": "/images/game/moodle-sick.png",
  Infection: "/images/game/moodle-infection.png",
  Thirsty: "/images/game/water-bottle.png",
  Dehydrated: "/images/game/water-bottle.png",
  Hungry: "/images/game/item-food.png",
  Starving: "/images/game/item-food.png",
};

/** Barra de necessidade (sede/fome), de 0 a 100. */
function NeedBar({ label, value }: { label: string; value: number }) {
  const rounded = Math.round(value);
  const color = rounded <= 25 ? "bg-lazarus" : rounded <= 50 ? "bg-sunset" : "bg-plate/60";
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-plate/60">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        className="h-1.5 flex-1 rounded bg-black/60"
      >
        <div className={`h-full rounded transition-[width] duration-500 ${color}`} style={{ width: `${rounded}%` }} />
      </div>
    </div>
  );
}

const NEED_USE_BELOW = 90; // só oferece beber/comer se fizer diferença

type Props = {
  state: SurvivalState;
  onSedative: () => void;
  onUse?: (item: Item) => void;
  children?: ReactNode;
};

export function SurvivalHud({ state, onSedative, onUse, children }: Props) {
  const moodle = fearMoodle(state.fear);
  const conditions = [...conditionMoodles(state), ...needsMoodles(state)];
  const canDrink = state.inventory.includes("water") && state.thirst < NEED_USE_BELOW;
  const canEat = state.inventory.includes("food") && state.hunger < NEED_USE_BELOW;
  const counts = state.inventory.reduce<Partial<Record<Item, number>>>(
    (acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }),
    {},
  );
  const canCure = conditionMoodles(state).length > 0 && state.inventory.includes("antibiotic");

  return (
    <aside
      role="status"
      aria-label="Status do sobrevivente"
      className="pointer-events-auto fixed bottom-4 left-4 z-30 w-48 rounded border border-rust/50 bg-asphalt-deep/90 p-2.5 font-mono text-[11px] text-plate/80 shadow-lg backdrop-blur"
    >
      <p className="font-stencil text-xl text-plate">Dia {state.day}</p>
      <p>Saque {lootForDay(state.day)}%</p>
      <p className="text-plate/60">{threatForDay(state.day)}</p>
      <div className="mt-2 space-y-1">
        <NeedBar label="Sede" value={state.thirst} />
        <NeedBar label="Fome" value={state.hunger} />
      </div>
      {(canDrink || canEat) && (
        <div className="mt-1.5 flex gap-1">
          {canDrink && (
            <button
              type="button"
              onClick={() => onUse?.("water")}
              className="flex-1 rounded border border-plate/30 px-1 py-0.5 hover:border-sunset hover:text-sunset"
            >
              Beber água
            </button>
          )}
          {canEat && (
            <button
              type="button"
              onClick={() => onUse?.("food")}
              className="flex-1 rounded border border-plate/30 px-1 py-0.5 hover:border-sunset hover:text-sunset"
            >
              Comer
            </button>
          )}
        </div>
      )}
      {isWanted(state.reputation) && (
        <p className="mt-1 rounded bg-lazarus px-1.5 py-0.5 text-center font-semibold tracking-widest text-plate uppercase">
          Procurado · Rovers
        </p>
      )}
      {(state.kills > 0 || state.deaths > 0) && (
        <p className="mt-1 text-plate/60">
          Abates {state.kills} · Mortes {state.deaths}
        </p>
      )}

      {(moodle || conditions.length > 0) && (
        <ul className="mt-2 space-y-1 border-t border-rust/40 pt-2">
          {moodle && (
            <li className="flex items-center justify-between gap-2">
              <span className={`flex items-center gap-1 font-semibold ${moodleColor[moodle]} motion-safe:animate-pulse`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/game/moodle-fear.png" alt="" className="h-4 w-4 pixelated" />
                {moodle}
              </span>
              <button
                type="button"
                onClick={onSedative}
                className="rounded border border-plate/30 px-1.5 py-0.5 hover:border-radio hover:text-radio"
              >
                Sedativo
              </button>
            </li>
          )}
          {conditions.map((condition) => (
            <li key={condition} className="flex items-center gap-1 font-semibold text-grass">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={conditionIcon[condition]} alt="" className="h-4 w-4 pixelated" />
              {condition}
            </li>
          ))}
          {canCure && (
            <li>
              <button
                type="button"
                onClick={() => onUse?.("antibiotic")}
                className="w-full rounded border border-radio/60 px-1.5 py-0.5 text-radio hover:bg-radio/10"
              >
                Usar antibiótico
              </button>
            </li>
          )}
        </ul>
      )}

      {state.inventory.length > 0 && (
        <ul aria-label="Inventário" className="mt-2 flex flex-wrap gap-1 border-t border-rust/40 pt-2">
          {(Object.keys(counts) as Item[]).map((item) => (
            <li key={item} title={items[item].label} className="flex items-center gap-0.5 rounded bg-black/40 px-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={items[item].icon} alt="" className="h-4 w-4 pixelated" />
              <span className="sr-only">{items[item].label}</span>
              {counts[item]! > 1 && <span>×{counts[item]}</span>}
            </li>
          ))}
        </ul>
      )}

      {children && <div className="mt-2 border-t border-rust/40 pt-2">{children}</div>}
    </aside>
  );
}
