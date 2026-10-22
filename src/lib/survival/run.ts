// Reducer da partida: aplica a ação, desbloqueia conquistas e cuida de nova partida e de carregar.
import { unlockedBy } from "./achievements";
import { initialSurvival, survivalReducer, type SurvivalAction, type SurvivalState } from "./survival";

export type RunAction = SurvivalAction | { type: "reset" } | { type: "load"; state: SurvivalState };

export function runReducer(state: SurvivalState, action: RunAction): SurvivalState {
  if (action.type === "reset") {
    return { ...initialSurvival, sound: state.sound, achievements: state.achievements };
  }
  if (action.type === "load") return action.state;

  const next = survivalReducer(state, action);
  const fresh = unlockedBy(next).filter((id) => !next.achievements.includes(id));
  if (fresh.length === 0) return next;

  let n = next.toasts.at(-1)?.n ?? 0;
  return {
    ...next,
    achievements: [...next.achievements, ...fresh],
    toasts: [...next.toasts, ...fresh.map((id) => ({ id, n: ++n }))],
  };
}
