export type LazarusMod = {
  slug: string;
  name: string;
  version: string;
  summary: string;
  features: string[];
  repo: string;
  banner: string;
  /** Âncora da seção da landing onde o mod vira minigame. */
  play?: string;
};

const mod = (slug: string, data: Omit<LazarusMod, "slug" | "repo" | "banner">): LazarusMod => ({
  slug,
  repo: `https://github.com/Project-Lazaru-s/lazarus-${slug}`,
  banner: `/images/banners/${slug}.png`,
  ...data,
});

export const lazarusMods: LazarusMod[] = [
  mod("events", {
    play: "horda",
    name: "Lazarus Events",
    version: "1.4.1",
    summary:
      "Encontros e eventos no mapa: esconderijos, ninhos, zonas de gás, quedas de helicóptero, quarentenas, bases de facções e sistema de procurado.",
    features: [
      "Eventos anunciados por rádio no chat, com coordenadas aproximadas.",
      "Resgates, última defesa, falso sinal de rádio, sinalizadores e comboios.",
      "Quedas de helicóptero e zonas de gás no metrô, que pedem máscara com filtro.",
      "Quarentenas militares, postos abandonados, ninhos e zonas infestadas.",
      "Bases das facções geradas no mundo, com expedições e escaramuças entre rivais.",
      "Sistema de procurado: caçadores de recompensa atrás de quem desce a -40 de reputação.",
      "Mineiros perdidos e gás no metrô, por FSantiago75.",
    ],
  }),
  mod("npcs", {
    play: "rovers",
    name: "Lazarus NPCs",
    version: "1.20.0",
    summary:
      "Sobreviventes com profissão, trocas, facções, reputação, diálogos, missões, NPCs armados e rendição; trava de armas e acessórios por habilidade.",
    features: [
      "Líder, guarda, armeiro, comerciante, médico e soldado de expedição, com skins próprias.",
      "Facções com reputação de -100 a +100.",
      "Trocas, diálogos, missões e um diário com a localização das tarefas.",
      "NPCs atiram com armas do TaCZ, usam cobertura, flanqueiam e sobem escadas.",
      "Inimigos rendidos podem ser interrogados, soltos ou mandados ao Haven.",
      "Armas de fogo e acessórios só podem ser fabricados com o nível de habilidade certo.",
    ],
  }),
  mod("stealth", {
    play: "silencio",
    name: "Lazarus Stealth",
    version: "0.3.0",
    summary:
      "Percepção dos infectados e de humanos, ruído (inclusive a voz), finalização furtiva e árvore Furtividade.",
    features: [
      "Postura, cobertura, luz, peso e barulho decidem se você é percebido.",
      "Passos em vidro ou metal fazem mais barulho que na grama; correr sobe um nível de ruído.",
      "Tiros atraem infectados de longe; com silenciador, o alcance cai bastante.",
      "Sua voz no Simple Voice Chat vira ruído: falar chama a 10 blocos, gritar a 18, sussurrar a cerca de 2,5.",
      "Finalização furtiva por trás.",
      "Ícone de detecção no HUD: atenção, investigando e avistado.",
    ],
  }),
  mod("moodles", {
    play: "sede",
    name: "Lazarus Moodles",
    version: "1.17.0",
    summary: "Moodles de medo, dor, exaustão, alívio, sangramento, infecção e disenteria; sedativos; árvore Coragem.",
    features: [
      "Medo (Tense, Fearful, Panicked): mira tremendo, respiração pesada, visão escurecendo.",
      "Dor e exaustão com efeitos reais na mira e na stamina.",
      "Alívio depois de escapar de um susto, com bônus temporários.",
      "Água contaminada causa disenteria: Queasy, Sick e, desidratado, Severely Sick.",
      "Sedativos zeram o medo por 3 minutos e cobram abstinência depois.",
      "Árvore Coragem para resistir ao pânico.",
    ],
  }),
  mod("wrecks", {
    name: "Lazarus Wrecks",
    version: "0.3.0",
    summary: "Veículos abandonados do Immersive Vehicles nas ruas; árvore Mecânica.",
    features: [
      "Carros largados nas ruas das cidades, com combustível e peças.",
      "Árvore Mecânica: consertar veículos, funilaria, ligação direta e economia de combustível.",
    ],
  }),
  mod("maps", {
    play: "mapa",
    name: "Lazarus Maps",
    version: "0.3.0",
    summary: "Mapas desenhados à mão, anotações, paleta e GPS.",
    features: ["Mapas de papel com anotações à mão.", "Paleta de 8 cores.", "GPS."],
  }),
  mod("scarcity", {
    play: "farmacia",
    name: "Lazarus Scarcity",
    version: "0.2.0",
    summary: "Saque cada vez mais escasso com os dias.",
    features: [
      "O saque comum cai para 72% no dia 7, 42% no dia 15 e 25% no dia 40.",
      "Locais arriscados seguram mais: 86%, 62% e 45%.",
    ],
  }),
  mod("status", {
    play: "dossie",
    name: "Lazarus Status",
    version: "1.1.2",
    summary: "Painel de status do sobrevivente: dias, abates e mortes.",
    features: ["Dias sobrevividos, abates e mortes num painel só."],
  }),
];

export function getMod(slug: string) {
  return lazarusMods.find((m) => m.slug === slug);
}
