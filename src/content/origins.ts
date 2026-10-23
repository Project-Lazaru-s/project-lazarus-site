import type { Line } from "./lore";

// Arquivo 02, "Antes das Bandeiras": como cada facção central começou durante o colapso, antes do Dia 1.
// Fonte: Documents/Project Lazarus/Lore/01. Origens das faccoes. Aqui fica a versão enxuta para o jogo.

export type FactionId = "haven" | "rovers" | "wardens" | "military";
export type OriginGateId = "poco" | "enfermaria" | "trocas" | "onibus" | "tripulacao" | "volta";

export type Part = {
  id: string;
  numeral: string;
  title: string;
  when: string;
  image: string;
  scenes: Line[];
  gate: OriginGateId;
  quote: string;
  /** Anotação que entra no dossiê ao passar pelo portão da parte. */
  note: string;
  after: Line[];
};

export type Dossier = {
  id: FactionId;
  name: string;
  title: string;
  /** Necessidade que formou o grupo (guia das origens). */
  need: string;
  photo: string;
  focus: string;
  ambience: string | null;
  /** Vazio enquanto o dossiê não foi escrito: a pasta aparece lacrada. */
  parts: Part[];
  trace: { title: string; text: string } | null;
};

export const origins = {
  slug: "antes-das-bandeiras",
  title: "Antes das Bandeiras",
  intro:
    "Antes de existir facção, existia uma necessidade: água, estrada, muro, ordem. Quatro pastas recuperadas contam como Haven, Rovers, Wardens e Military começaram, muito antes do seu Dia 1.",
  cover: "/images/lore/origens/capa-origens.png",
};

const haven: Dossier = {
  id: "haven",
  name: "Haven",
  title: "A água que se divide",
  need: "Água, atendimento e abrigo",
  photo: "/images/factions/cenas/haven.png",
  focus: "50% 55%",
  ambience: "/sounds/lore/amb-haven.mp3",
  parts: [
    {
      id: "poco",
      numeral: "I",
      title: "O poço",
      when: "Semanas depois do surto · uma rua sem água",
      image: "/images/lore/origens/haven-poco.png",
      scenes: [
        {
          text: "O primeiro portão de Haven não foi feito para barrar gente. Era uma porta de quintal reforçada para que os infectados não alcançassem o poço.",
          image: "/images/lore/origens/haven-poco.png",
          alt: "À noite, vizinhos com baldes se espremem em volta de um poço de pedra enquanto uma mulher prega tábuas numa paliçada baixa.",
        },
        "As casas ao redor perderam a luz, depois o telefone, depois a água tratada. Quando a torneira da última cozinha secou, a rua inteira lembrou do mesmo poço.",
        "A fila virou aglomeração. A aglomeração trouxe gritos. Os gritos trouxeram infectados.",
        "Uma vizinha que consertava cercas ergueu uma paliçada baixa com tábuas das casas vazias. Outra abriu um caderno para marcar quem recebia água e quem ia buscá-la.",
      ],
      gate: "poco",
      quote: "Uma regra imperfeita ainda era melhor que uma briga.",
      note: "Caderno do poço: cada nome, cada balde. Ninguém sai sem nada.",
      after: [
        "Idosos e feridos não podiam trabalhar como os outros. Quem ajudava às vezes chegava exausto demais. Mesmo assim, havia água para mais um dia.",
      ],
    },
    {
      id: "enfermaria",
      numeral: "II",
      title: "A enfermaria",
      when: "Dias depois · uma sala seca",
      image: "/images/lore/origens/haven-enfermaria.png",
      scenes: [
        {
          text: "Uma enfermeira chegou com um caderno de triagem retirado de uma unidade de atendimento evacuada. Não trouxe remédios suficientes. Trouxe nomes.",
          image: "/images/lore/origens/haven-enfermaria.png",
          alt: "Uma sala iluminada por velas com camas emprestadas; a enfermeira consulta um caderno e um lençol pendurado separa dois pacientes com febre.",
        },
        "Desaparecidos, feridos, gente que prometia voltar com a família. Ela transformou uma sala seca em enfermaria e pediu camas a quem podia ceder.",
        "A primeira regra era separar a febre. Um caso escondido podia esvaziar a rua inteira.",
      ],
      gate: "enfermaria",
      quote: "O abrigo cresceu ao redor de uma rotina: cuidar de quem entrava e lembrar de quem tinha saído.",
      note: "Febre vai para trás do lençol. Ferida vai para a cama. Todo nome vai para o caderno.",
      after: [],
    },
    {
      id: "trocas",
      numeral: "III",
      title: "A banca de trocas",
      when: "Uma manhã · no portão do quintal",
      image: "/images/lore/origens/haven-trocas.png",
      scenes: [
        {
          text: "O primeiro conflito sério veio com um grupo de viajantes. Pediram água para levar embora.",
          image: "/images/lore/origens/haven-trocas.png",
          alt: "No portão da paliçada, viajantes cansados encaram dois guardas do poço; sobre uma porta apoiada em barris há sementes, um filtro e um mapa.",
        },
        "Os guardas do poço queriam cobrar: as reservas não se enchiam por bondade. A enfermeira queria tratar uma criança que vinha no colo de um deles.",
        "A decisão não podia ficar com uma pessoa só. Precisava ser tomada diante de todos que dividiam o poço.",
      ],
      gate: "trocas",
      quote: "Haven não virou um lugar sem portas. Virou um lugar onde cada decisão é assumida diante de todos.",
      note: "Banca de trocas: água por sementes, filtros ou rotas. O preço se discute em voz alta.",
      after: [
        "Alguém escreveu Haven numa placa para orientar uma chamada de rádio. O nome prometia mais do que podiam garantir, mas era melhor do que transmitir “as casas atrás da rua bloqueada”.",
        "Vieram camas, horta, fogueira, uma paliçada maior e turnos de guarda. Cada melhoria custou horas que poderiam ter sido gastas procurando comida.",
        "A neutralidade nasceu da mesma conta: se a enfermaria perguntasse primeiro pela bandeira de cada ferido, logo ninguém levaria feridos até ela.",
      ],
    },
  ],
  trace: {
    title: "O caderno do poço",
    text: "Nomes de quem tirou água e de quem nunca voltou para buscar sua parte. Ao lado, a lista médica guarda nomes vindos de grupos rivais.",
  },
};

const rovers: Dossier = {
  id: "rovers",
  name: "Rovers",
  title: "A estrada que ainda existe",
  need: "Manter pessoas e suprimentos em movimento",
  photo: "/images/factions/cenas/rovers.png",
  focus: "45% 60%",
  ambience: "/sounds/lore/amb-rovers.mp3",
  parts: [
    {
      id: "onibus",
      numeral: "I",
      title: "O ônibus",
      when: "Começo do colapso · uma avenida bloqueada",
      image: "/images/lore/origens/rovers-onibus.png",
      scenes: [
        {
          text: "O primeiro comboio Rover nasceu de uma promessa no meio de uma avenida bloqueada: “Se tirarmos esse ônibus daqui, cabem mais pessoas do que nos carros.”",
          image: "/images/lore/origens/rovers-onibus.png",
          alt: "À noite, numa avenida cheia de carros abandonados, uma mecânica trabalha no motor aberto de um ônibus enquanto dois motoristas desenham num mapa molhado.",
        },
        "Não havia plano para atravessar a cidade. Havia um ônibus parado, peças em três carros próximos e gente que não conseguiria caminhar até o próximo abrigo.",
        "Uma mecânica abriu o motor enquanto dois motoristas desenhavam desvios num mapa molhado.",
      ],
      gate: "onibus",
      quote: "Naquela noite, quarenta pessoas dormiram longe da avenida.",
      note: "Bateria do sedã, correia da van, pneu e meio tanque do táxi. Os bancos do fundo viraram depósito.",
      after: [
        "O ônibus saiu depois do anoitecer, lento o bastante para que um infectado o acompanhasse por vários quarteirões. A viagem terminou num pátio de carga, não num lugar seguro.",
      ],
    },
    {
      id: "tripulacao",
      numeral: "II",
      title: "Os que rodam",
      when: "No dia seguinte · um pátio de carga",
      image: "/images/lore/origens/rovers-patio.png",
      scenes: [
        {
          text: "No dia seguinte faltava combustível. Trocaram baterias por um barril, um rádio por notícias de uma ponte, uma carona por bandagens.",
          image: "/images/lore/origens/rovers-patio.png",
          alt: "Num pátio de contêineres, sobreviventes rolam um barril de combustível até a porta do ônibus em troca de baterias, ao lado dos bancos arrancados.",
        },
        "Algumas trocas foram generosas; outras, duras. E o ônibus não levava todo mundo para sempre: precisava de quem soubesse mantê-lo andando.",
      ],
      gate: "tripulacao",
      quote:
        "Quando perguntavam quem podia marcar uma entrega futura, a resposta era “os que rodam”. O nome Rovers ficou.",
      note: "Tripulação: quem dirige, quem conserta, quem negocia e quem escuta. Os outros acompanham parte do caminho.",
      after: [
        "Um acampamento móvel cresceu ao redor da oficina. Sucata virou estoque catalogado, não lixo. As barracas eram montadas onde o ônibus pudesse sair sem manobra longa.",
        "O médico do grupo não prometia hospital. O armeiro não prometia munição infinita. Os dois sabiam que cada serviço dependia de outra viagem.",
      ],
    },
    {
      id: "volta",
      numeral: "III",
      title: "Volta garantida",
      when: "Semanas depois · rotas, não territórios",
      image: "/images/lore/origens/rovers-mapa.png",
      scenes: [
        {
          text: "Os Rovers começaram a registrar rotas em vez de territórios. Uma ponte praticável, um posto com combustível, um prédio com filtros: tudo isso era informação negociável.",
          image: "/images/lore/origens/rovers-mapa.png",
          alt: "Numa bancada de oficina, um mapa de papel com duas rotas a lápis, uma de ida e outra de volta; lá fora, o ônibus e um segundo veículo sendo preparados.",
        },
        "Era tentador vender a mesma rota duas vezes, ou guardar o melhor caminho para si. O grupo escolheu uma regra menos nobre e mais útil.",
        "Quem prometesse uma entrega precisava ter um caminho de ida e outro de volta. O barulho do motor atrai infectados: a rua da ida raramente serve para voltar.",
      ],
      gate: "volta",
      quote:
        "Nem sempre cumpriram a regra. Mas passaram a cobrar de quem a quebrava, porque o próximo comboio pagaria pela desconfiança.",
      note: "Toda entrega tem duas linhas no mapa: a da ida e a da volta garantida.",
      after: [
        "Antes da rivalidade, a caravana negociava com os Wardens: peças e notícias em troca de um acesso vigiado. Também levava suprimentos a Haven quando podia.",
        "A Noite da Cancela romperia essa cooperação mais tarde, mas não criaria os Rovers. Eles já existiam porque, num mundo de ruas fechadas, alguém precisava testar qual estrada continuava aberta.",
      ],
    },
  ],
  trace: {
    title: "O mapa das rotas riscadas",
    text: "Rotas riscadas, preço de combustível nas margens e um desvio marcado como “volta garantida”. O mesmo traço aparece no diário de oficina do ônibus.",
  },
};

/** Ainda sem roteiro: a pasta aparece na mesa, lacrada. */
const sealed = (id: FactionId, name: string, title: string, need: string, photo: string, focus: string): Dossier => ({
  id,
  name,
  title,
  need,
  photo,
  focus,
  ambience: null,
  parts: [],
  trace: null,
});

export const dossiers: Dossier[] = [
  haven,
  rovers,
  sealed(
    "wardens",
    "Wardens",
    "A linha que não podia ceder",
    "Defender acessos e moradores",
    "/images/factions/cenas/wardens.png",
    "55% 60%",
  ),
  sealed(
    "military",
    "Military",
    "As ordens que pararam de chegar",
    "Continuar a resposta de emergência",
    "/images/factions/cenas/military.png",
    "40% 55%",
  ),
];

// ---------- Portões de Haven ----------

/** Parte I: dividir os baldes do dia entre quem precisa. */
export const WELL_BUCKETS = 10;
export const wellGroups = [
  { id: "idosos", label: "Idosos" },
  { id: "feridos", label: "Feridos" },
  { id: "criancas", label: "Crianças" },
  { id: "buscam", label: "Quem busca água" },
] as const;

/** Parte II: quem chega à enfermaria. O sinal só aparece depois de examinar. */
export const patients = [
  {
    id: "arlindo",
    who: "Seu Arlindo, 70 anos",
    sign: "Corte fundo na perna. Testa fria.",
    ward: "cama",
    wrong: "Sem febre, ele não precisa de isolamento. Precisa da cama e de pontos.",
  },
  {
    id: "menina",
    who: "Uma menina de 9 anos",
    sign: "Testa quente e calafrios. Diz que está bem.",
    ward: "febre",
    wrong: "Febre na sala comum pode esvaziar a rua. O lugar dela é atrás do lençol, em observação.",
  },
  {
    id: "rapaz",
    who: "Um rapaz da rua de baixo",
    sign: "Esconde o braço na manga. A pele está quente.",
    ward: "febre",
    wrong: "Quem esconde o braço com febre fica em observação, mesmo jurando que foi um prego.",
  },
  {
    id: "costureira",
    who: "A costureira do número 12",
    sign: "Tornozelo torcido na fuga. Cansada, sem febre.",
    ward: "cama",
    wrong: "Um tornozelo torcido não contamina ninguém. Ela fica na cama.",
  },
] as const;

/** Parte III: o que pedir aos viajantes pela água. */
export const tradeOffers = [
  { id: "sementes", label: "Sementes", ok: true, reply: "Sementes viram horta. Água de hoje, comida daqui a meses." },
  { id: "filtro", label: "Um filtro", ok: true, reply: "Um filtro a mais e o poço rende mais baldes limpos." },
  { id: "rota", label: "Uma rota segura", ok: true, reply: "Saber por onde andar vale tanto quanto carregar." },
  { id: "nada", label: "Nada", ok: false, reply: "Os guardas cruzam os braços: o poço não se enche por bondade." },
  {
    id: "tudo",
    label: "Toda a carga",
    ok: false,
    reply: "Pedir tudo é mandar embora. Gente expulsa não volta com notícias.",
  },
] as const;

export const childChoices = [
  {
    id: "agora",
    label: "Levar a criança para a enfermaria agora",
    reply: "A enfermeira já está ajoelhada ao lado dela.",
  },
  {
    id: "votar",
    label: "Discutir a entrada dela com os moradores",
    reply: "A rua decide em voz alta, com a enfermeira no meio da roda. A criança entra.",
  },
] as const;

// ---------- Portões dos Rovers ----------

/** Parte I: o que o ônibus precisa e o que cada carro parado tem (nem tudo presta). */
export const busNeeds = ["bateria", "correia", "pneu", "combustivel"] as const;
export type BusPart = (typeof busNeeds)[number];
export const parkedCars = [
  {
    id: "seda",
    label: "O sedã",
    parts: [
      { part: "bateria", label: "Bateria", ok: true, note: "Carregada. O sedã mal rodou antes de ser largado." },
      { part: "pneu", label: "Pneu", ok: false, note: "Furado. Não aguenta o peso de quarenta pessoas." },
    ],
  },
  {
    id: "van",
    label: "A van",
    parts: [
      { part: "correia", label: "Correia", ok: true, note: "Inteira, do tamanho certo." },
      { part: "combustivel", label: "Combustível", ok: false, note: "Tanque drenado. Alguém chegou antes." },
    ],
  },
  {
    id: "taxi",
    label: "O táxi",
    parts: [
      { part: "bateria", label: "Bateria", ok: false, note: "Morta. Nem acende a luz do painel." },
      { part: "pneu", label: "Pneu", ok: true, note: "Gasto, mas sem furo." },
      { part: "combustivel", label: "Combustível", ok: true, note: "Meio tanque. Dá para sair da avenida." },
    ],
  },
] as const;

/** Parte II: quatro lugares fixos no ônibus. A tripulação precisa dirigir, consertar, negociar e escutar. */
export const BUS_SEATS = 4;
export const crewSkills = ["dirigir", "consertar", "negociar", "escutar"] as const;
export const candidates = [
  { id: "celia", who: "Célia", line: "Abriu o motor na avenida com uma chave de roda.", skill: "consertar" },
  { id: "josue", who: "Josué", line: "Dirigiu ônibus de linha por vinte anos.", skill: "dirigir" },
  { id: "igor", who: "Igor", line: "Carrega dois galões de uma vez. Nunca dirigiu.", skill: "carregar" },
  { id: "tania", who: "Tânia", line: "Era feirante. Trocou o rádio pelas notícias da ponte.", skill: "negociar" },
  { id: "rosa", who: "Rosa", line: "Conhece o bairro inteiro, mas não sai dele.", skill: "conhecer o bairro" },
  { id: "bento", who: "Bento", line: "Caçador. Ouve um infectado antes de vê-lo.", skill: "escutar" },
] as const;
