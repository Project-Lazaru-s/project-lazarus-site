export type Faction = {
  slug: string;
  name: string;
  profile: string;
  details: string[];
  /** Folha de skins em pixel art; `illustration` marca arte pintada, que não deve ser pixelada. */
  image?: { src: string; width: number; height: number; alt: string; illustration?: boolean };
};

export const factions: Faction[] = [
  {
    slug: "haven",
    name: "Haven",
    profile: "Refúgio pacífico. Acolhe resgatados, dá pedidos diários e tem comerciante com desconto para aliados.",
    details: [
      "Nunca caça o jogador.",
      "Recebe os inimigos rendidos que você manda para lá.",
      "Vende perdão em troca de comida e ferro.",
    ],
    image: {
      src: "/images/factions/haven-skins.png",
      width: 668,
      height: 502,
      alt: "Skins dos NPCs Haven, de frente e de costas: líder, guarda, armeiro, comerciante, médico e soldado de expedição",
    },
  },
  {
    slug: "rovers",
    name: "Rovers",
    profile: "Nômades e saqueadores organizados, com acampamento de ônibus, tendas e torre.",
    details: ["Rivais dos Wardens.", "Saem em expedições e entram em escaramuças com o forte rival."],
    image: {
      src: "/images/factions/rovers-skins.png",
      width: 668,
      height: 502,
      alt: "Skins dos NPCs Rovers, de frente e de costas: líder, guarda, armeiro, comerciante, médico e soldado de expedição",
    },
  },
  {
    slug: "wardens",
    name: "Wardens",
    profile: "Milícia de forte murado, com arame farpado, bunker e arsenal.",
    details: ["Rivais dos Rovers.", "Saem em expedições e entram em escaramuças com o acampamento rival."],
    image: {
      src: "/images/factions/wardens-skins.png",
      width: 668,
      height: 502,
      alt: "Skins dos NPCs Wardens, de frente e de costas: líder, guarda, armeiro, comerciante, médico e soldado de expedição",
    },
  },
  {
    slug: "military",
    name: "Military",
    profile: "Militares em colapso: postos de controle, quarentenas e um projeto de vacina.",
    details: ["Com os dias, os postos são abandonados.", "Zumbis militares blindados aparecem a partir do dia 12."],
    image: {
      src: "/images/factions/military.png",
      width: 1260,
      height: 410,
      alt: "Skins dos NPCs militares, de frente e de costas",
    },
  },
  {
    slug: "gangues",
    name: "Gangues",
    profile: "8 gangues com nomes gerados por território, com esconderijos em prédios.",
    details: ["Marcam o território com placas “TURF / KEEP OUT”.", "Esconderijos podem ser revelados interrogando rendidos."],
    image: {
      src: "/images/factions/gangues.png",
      width: 1260,
      height: 700,
      alt: "Ilustração de membros de gangues rivais numa rua em ruínas ao pôr do sol, diante de uma placa TURF / KEEP OUT",
      illustration: true,
    },
  },
  {
    slug: "the-hollow",
    name: "The Hollow",
    profile: "Culto canibal. Covis noturnos com prisioneiros enjaulados para resgatar.",
    details: ["Os covis aparecem a partir do dia 12.", "Caçadores e canibais saem a partir do dia 13."],
    image: {
      src: "/images/factions/hollow.png",
      width: 948,
      height: 410,
      alt: "Skins do culto The Hollow: The Preacher, The Butcher e The Hollow-Eyed",
    },
  },
  {
    slug: "desertores",
    name: "Desertores",
    profile: "Ex-militares armados em acampamentos.",
    details: ["Postos abandonados, insígnias rasgadas."],
    image: {
      src: "/images/factions/deserters.png",
      width: 948,
      height: 390,
      alt: "Skins dos desertores: The Sergeant, The Masked One e The Wounded Runaway",
    },
  },
];

export const wantedSystem = [
  "Com reputação até -40, uma facção manda caçadores de recompensa atrás de você.",
  "Os caçadores vão até a última posição em que te perceberam e contam com informantes.",
  "Matar o esquadrão rende reputação com a facção rival e saque.",
  "O Haven vende perdão em troca de comida e ferro.",
];
