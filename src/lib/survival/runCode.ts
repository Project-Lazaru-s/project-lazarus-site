// Código curto da partida para o link compartilhável /dossie/[code].
// A URL é entrada não confiável: tudo é validado e o título é recalculado, nunca lido do link.
import { initialSurvival, type Stomach, type SurvivalState } from "./survival";

const STOMACHS: Stomach[] = ["ok", "sick", "severe"];

// [nome, mínimo, máximo] de cada campo, na ordem do código.
const FIELDS = [
  ["day", 0, 60],
  ["kills", 0, 9999],
  ["deaths", 0, 999],
  ["stealthTenths", 0, 999], // melhor travessia em décimos de segundo; 0 = não jogou
  ["hordesHeld", 0, 999],
  ["takedowns", 0, 999],
  ["lootOpened", 0, 9999],
  ["lootFound", 0, 9999],
  ["reputation", 0, 200], // reputação + 100
  ["flags", 0, 15], // bits: procurado, infectado, estômago (2 bits)
] as const;

export function encodeRun(state: SurvivalState) {
  const { record } = state;
  const flags =
    (record.wanted ? 1 : 0) | (state.infected ? 2 : 0) | (STOMACHS.indexOf(state.stomach) << 2);
  return [
    state.day,
    state.kills,
    state.deaths,
    record.stealthBest === null ? 0 : Math.max(1, Math.round(record.stealthBest * 10)),
    record.hordesHeld,
    record.takedowns,
    record.lootOpened,
    record.lootFound,
    state.reputation + 100,
    flags,
  ]
    .map((n) => n.toString(36))
    .join("-");
}

export function decodeRun(code: string): SurvivalState | null {
  const parts = code.split("-");
  if (parts.length !== FIELDS.length || !parts.every((p) => /^[0-9a-z]{1,4}$/.test(p))) return null;
  const values = parts.map((p) => parseInt(p, 36));
  if (values.some((v, i) => v < FIELDS[i][1] || v > FIELDS[i][2])) return null;

  const [day, kills, deaths, stealthTenths, hordesHeld, takedowns, lootOpened, lootFound, reputation, flags] = values;
  const stomach = STOMACHS[flags >> 2];
  if (lootFound > lootOpened || !stomach) return null;

  return {
    ...initialSurvival,
    day,
    kills,
    deaths,
    reputation: reputation - 100,
    stomach,
    infected: Boolean(flags & 2),
    record: {
      stealthBest: stealthTenths === 0 ? null : stealthTenths / 10,
      hordesHeld,
      takedowns,
      lootOpened,
      lootFound,
      wanted: Boolean(flags & 1),
    },
  };
}
