import type { ReactNode } from "react";
import { fearMoodle, lootForDay, threatForDay, type SurvivalState } from "@/lib/survival/survival";

const moodleColor = { Tense: "text-sunset", Fearful: "text-rust-light", Panicked: "text-lazarus" } as const;

type Props = { state: SurvivalState; onSedative: () => void; children?: ReactNode };

export function SurvivalHud({ state, onSedative, children }: Props) {
  const moodle = fearMoodle(state.fear);
  return (
    <aside
      role="status"
      aria-label="Status do sobrevivente"
      className="pointer-events-auto fixed bottom-4 left-4 z-30 w-52 rounded border border-rust/50 bg-asphalt-deep/90 p-3 font-mono text-xs text-plate/80 shadow-lg backdrop-blur"
    >
      <p className="font-stencil text-2xl text-plate">Dia {state.day}</p>
      <p>Saque {lootForDay(state.day)}%</p>
      <p className="text-plate/60">{threatForDay(state.day)}</p>
      {(state.kills > 0 || state.deaths > 0) && (
        <p className="mt-1 text-plate/60">
          Abates {state.kills} · Mortes {state.deaths}
        </p>
      )}
      {moodle && (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-rust/40 pt-2">
          <span className={`font-semibold ${moodleColor[moodle]} motion-safe:animate-pulse`}>{moodle}</span>
          <button
            type="button"
            onClick={onSedative}
            className="rounded border border-plate/30 px-2 py-0.5 hover:border-radio hover:text-radio"
          >
            Sedativo
          </button>
        </div>
      )}
      {children && <div className="mt-2 border-t border-rust/40 pt-2">{children}</div>}
    </aside>
  );
}
