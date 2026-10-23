export type Faction = {
  slug: string;
  name: string;
  profile: string;
  details: string[];
  /** Ilustração cinematográfica da facção, inspirada nas skins. */
  image?: { src: string; width: number; height: number; alt: string };
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
      src: "/images/factions/cenas/haven.png",
      width: 1672,
      height: 941,
      alt: "Refúgio Haven ao entardecer: estufa, horta, comerciante na barraca, guarda no muro de madeira e médica tratando um sobrevivente resgatado",
    },
  },
  {
    slug: "rovers",
    name: "Rovers",
    profile: "Nômades e saqueadores organizados, com acampamento de ônibus, tendas e torre.",
    details: ["Rivais dos Wardens.", "Saem em expedições e entram em escaramuças com o forte rival."],
    image: {
      src: "/images/factions/cenas/rovers.png",
      width: 1672,
      height: 941,
      alt: "Acampamento Rovers de ônibus e tendas ao pôr do sol, com torre de sucata, fogueira e comboio carregando o saque",
    },
  },
  {
    slug: "wardens",
    name: "Wardens",
    profile: "Milícia de forte murado, com arame farpado, bunker e arsenal.",
    details: ["Rivais dos Rovers.", "Saem em expedições e entram em escaramuças com o acampamento rival."],
    image: {
      src: "/images/factions/cenas/wardens.png",
      width: 1672,
      height: 941,
      alt: "Portão do forte Wardens à noite: arame farpado, holofote e guardas revistando um estranho diante do arsenal",
    },
  },
  {
    slug: "military",
    name: "Military",
    profile: "Militares em colapso: postos de controle, quarentenas e um projeto de vacina.",
    details: ["Com os dias, os postos são abandonados.", "Zumbis militares blindados aparecem a partir do dia 12."],
    image: {
      src: "/images/factions/cenas/military.png",
      width: 1672,
      height: 941,
      alt: "Posto de quarentena militar em colapso: laboratório da vacina, médico atendendo um ferido e soldados segurando a cerca contra a horda",
    },
  },
  {
    slug: "gangues",
    name: "Gangues",
    profile: "8 gangues com nomes gerados por território, com esconderijos em prédios.",
    details: [
      "Marcam o território com placas “TURF / KEEP OUT”.",
      "Esconderijos podem ser revelados interrogando rendidos.",
    ],
    image: {
      src: "/images/factions/gangues.png",
      width: 1260,
      height: 700,
      alt: "Ilustração de membros de gangues rivais numa rua em ruínas ao pôr do sol, diante de uma placa TURF / KEEP OUT",
    },
  },
  {
    slug: "the-hollow",
    name: "The Hollow",
    profile: "Culto canibal. Covis noturnos com prisioneiros enjaulados para resgatar.",
    details: ["Os covis aparecem a partir do dia 12.", "Caçadores e canibais saem a partir do dia 13."],
    image: {
      src: "/images/factions/cenas/the-hollow.png",
      width: 1672,
      height: 941,
      alt: "Covil do culto The Hollow à luz de velas: The Preacher de braços abertos entre The Butcher e The Hollow-Eyed, com prisioneiros em jaulas ao fundo",
    },
  },
  {
    slug: "desertores",
    name: "Desertores",
    profile: "Ex-militares armados em acampamentos.",
    details: ["Postos abandonados, insígnias rasgadas."],
    image: {
      src: "/images/factions/cenas/desertores.png",
      width: 1672,
      height: 941,
      alt: "Acampamento de desertores no mato, ao lado de um posto abandonado: The Sergeant de guarda, caminhão militar roubado e o fugitivo ferido sendo tratado",
    },
  },
];

export const wantedSystem = [
  "Com reputação até -40, uma facção manda caçadores de recompensa atrás de você.",
  "Os caçadores vão até a última posição em que te perceberam e contam com informantes.",
  "Matar o esquadrão rende reputação com a facção rival e saque.",
  "O Haven vende perdão em troca de comida e ferro.",
];
