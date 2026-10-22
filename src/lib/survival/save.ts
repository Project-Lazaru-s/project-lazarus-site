// Partida salva no navegador. O que vem do localStorage é entrada não confiável:
// cada campo é validado, e se algo não fecha o save inteiro é descartado.
import { ACHIEVEMENT_IDS } from "./achievements";
import { initialSurvival, type Item, type Stomach, type SurvivalState } from "./survival";

export const SAVE_KEY = "lazarus:run:v1";

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;

const ITEMS: Item[] = ["antibiotic", "painkiller", "bandage", "water", "ammo"];
const STOMACHS: Stomach[] = ["ok", "sick", "severe"];
const CHESTS: unknown[] = [null, "forced", "picked", "picked-clean"];
const FLAGS = ["stealthClean", "cleanHorde", "wanted", "huntersSurvived", "voiceQuiet", "cured"];

const int = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

function valid(raw: unknown): raw is SurvivalState {
  if (typeof raw !== "object" || raw === null) return false;
  const s = raw as Record<string, unknown>;
  const r = s.record as Record<string, unknown> | null | undefined;
  if (typeof r !== "object" || r === null) return false;
  return (
    int(s.day, 0, 60) &&
    typeof s.fear === "number" &&
    s.fear >= 0 &&
    s.fear <= 100 &&
    int(s.kills, 0, 99_999) &&
    int(s.deaths, 0, 99_999) &&
    int(s.reputation, -100, 100) &&
    Array.isArray(s.inventory) &&
    s.inventory.every((i) => ITEMS.includes(i)) &&
    STOMACHS.includes(s.stomach as Stomach) &&
    typeof s.infected === "boolean" &&
    Array.isArray(s.achievements) &&
    (r.stealthBest === null || (typeof r.stealthBest === "number" && r.stealthBest > 0)) &&
    int(r.hordesHeld, 0, 999) &&
    int(r.takedowns, 0, 999) &&
    int(r.lootOpened, 0, 99_999) &&
    int(r.lootFound, 0, r.lootOpened as number) &&
    CHESTS.includes(r.chest) &&
    FLAGS.every((k) => typeof r[k] === "boolean")
  );
}

export function saveRun(storage: Storage, state: SurvivalState) {
  // Avisos são efêmeros e o som exige um clique para voltar: nenhum dos dois é salvo.
  const run: Partial<SurvivalState> = { ...state };
  delete run.toasts;
  delete run.sound;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(run));
  } catch {
    // Navegação privada ou cota cheia: a partida só não fica salva.
  }
}

export function loadRun(storage: Storage): SurvivalState | null {
  let raw: unknown;
  try {
    const text = storage.getItem(SAVE_KEY);
    if (!text) return null;
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!valid(raw)) return null;
  return {
    ...initialSurvival,
    ...raw,
    record: { ...initialSurvival.record, ...raw.record },
    achievements: raw.achievements.filter((id) => ACHIEVEMENT_IDS.has(id)),
    sound: false,
    toasts: [],
  };
}

export function clearRun(storage: Storage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // Mesmo caso do saveRun.
  }
}

/** Vale a pena oferecer "continuar"? */
export function hasProgress(state: SurvivalState) {
  return state.day > 0 || state.kills > 0 || state.deaths > 0 || state.achievements.length > 0;
}
