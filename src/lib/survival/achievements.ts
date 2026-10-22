// Conquistas da landing: cada uma é uma regra sobre o estado da partida.
import { rank, type SurvivalState } from "./survival";

export type Achievement = { id: string; title: string; description: string; icon: string };

type Rule = Achievement & { unlocked: (state: SurvivalState) => boolean };

const icon = (name: string) => `/images/game/${name}.png`;

const RULES: Rule[] = [
  {
    id: "silencio",
    title: "Silêncio absoluto",
    description: "Atravessar a rua sem nenhum infectado investigar.",
    icon: icon("survivor-crouch"),
    unlocked: (s) => s.record.stealthClean,
  },
  {
    id: "boca-fechada",
    title: "Boca fechada",
    description: "Terminar o Fale baixo sem ninguém te ouvir.",
    icon: icon("mic-wave"),
    unlocked: (s) => s.record.voiceQuiet,
  },
  {
    id: "mestre-gazua",
    title: "Mestre da gazua",
    description: "Abrir o baú sem quebrar nenhuma gazua.",
    icon: icon("lockpick"),
    unlocked: (s) => s.record.chest === "picked-clean",
  },
  {
    id: "so-na-cabeca",
    title: "Só na cabeça",
    description: "Conter uma horda sem um tiro no corpo.",
    icon: icon("zombie-front"),
    unlocked: (s) => s.record.cleanHorde,
  },
  {
    id: "muralha",
    title: "Muralha",
    description: "Conter três hordas seguidas.",
    icon: icon("zombie-front-soldier"),
    unlocked: (s) => s.record.hordesHeld >= 3,
  },
  {
    id: "imunizado",
    title: "Imunizado",
    description: "Curar disenteria ou mordida com antibiótico.",
    icon: icon("item-antibiotic"),
    unlocked: (s) => s.record.cured,
  },
  {
    id: "procurado-vivo",
    title: "Procurado e vivo",
    description: "Sobreviver aos caçadores de recompensa.",
    icon: icon("hunter"),
    unlocked: (s) => s.record.huntersSurvived,
  },
  {
    id: "maos-limpas",
    title: "Mãos limpas",
    description: "Chegar ao dia 60 sem matar ninguém.",
    icon: icon("survivor-side"),
    unlocked: (s) => s.day >= 60 && s.kills === 0,
  },
  {
    id: "lenda",
    title: "Lenda de Lazarus",
    description: "Ganhar o título máximo no dossiê.",
    icon: icon("survivor-knife"),
    unlocked: (s) => rank(s) === "Lenda de Lazarus",
  },
];

export const ACHIEVEMENTS: Achievement[] = RULES.map(({ id, title, description, icon }) => ({
  id,
  title,
  description,
  icon,
}));

export const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));

export function achievement(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Ids das conquistas que o estado cumpre. */
export function unlockedBy(state: SurvivalState) {
  return RULES.filter((rule) => rule.unlocked(state)).map((rule) => rule.id);
}
