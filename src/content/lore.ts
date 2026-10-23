// Lore canônica. Fonte completa: Documents/Project Lazarus/Lore (atos I a V).
// Aqui fica a versão enxuta para o site; os fatos não mudam, só o tamanho.

export type ArchiveEntry =
  | { sealed: false; slug: string; title: string; summary: string; acts: number; minutes: number; cover: string }
  | { sealed: true; code: string };

export const archive: ArchiveEntry[] = [
  {
    sealed: false,
    slug: "o-inicio-do-caos",
    title: "O Início do Caos",
    summary:
      "Antes do seu Dia 1: o primeiro caso, o exército e a quarentena, os civis que se organizaram e a noite que separou Rovers e Wardens.",
    acts: 5,
    minutes: 6,
    cover: "/images/lore/cover.png",
  },
  { sealed: true, code: "Arquivo 02" },
  { sealed: true, code: "Arquivo 03" },
];

/** Uma fala da história; com imagem, a ilustração aparece junto dela. */
export type Line = string | { text: string; image: string; alt: string };
export const lineText = (line: Line) => (typeof line === "string" ? line : line.text);

export type Act = {
  id: string;
  numeral: string;
  title: string;
  when: string;
  image: string;
  /** Cenas curtas, antes do documento do ato. Uma cena pode trazer uma ilustração própria. */
  scenes: Line[];
  /** A frase do ato, em destaque. */
  quote: string;
  /** Anotação à mão da enfermeira, na margem do caderno. */
  note: string;
  /** Cenas depois do documento. */
  after: Line[];
  /** O que pode ser encontrado no mundo do jogo. */
  trace: string;
};

export const inicioDoCaos = {
  slug: "o-inicio-do-caos",
  title: "O Início do Caos",
  intro:
    "O contador vai mostrar Dia 1. Não é o primeiro dia da infecção, nem da ruína. A cidade já caiu muito antes de você chegar. Isto é o que aconteceu antes.",
  acts: [
    {
      id: "ato-1",
      numeral: "I",
      title: "O primeiro caso",
      when: "Antes de a cidade admitir que havia uma epidemia",
      image: "/images/lore/ato-1.png",
      scenes: [
        "Numa unidade de atendimento, uma enfermeira anota o caso de um homem com febre, confusão e uma ferida no antebraço.",
        "Ele morre antes de conseguir um leito. Minutos depois, o corpo se senta na maca e ataca o auxiliar.",
      ],
      quote: "Movimento após declaração de óbito.",
      note: "quem avisou os outros bairros?",
      after: [
        "Na mesma noite, outros bairros relatam casos iguais, sem nenhum contato com aquele paciente. Ninguém sabe de onde veio nem como se espalha.",
        "A ordem de isolamento chega tarde. A enfermeira foge levando o caderno de triagem com a lista de nomes. É esse caderno que você está lendo.",
      ],
      trace:
        "A ficha do caso mais antigo da região e a ordem de isolamento: provam que o atendimento falhou antes do apagão. Não revelam paciente zero nem cura.",
    },
    {
      id: "ato-2",
      numeral: "II",
      title: "O exército e a quarentena",
      when: "As primeiras semanas",
      image: "/images/lore/ato-2.png",
      scenes: [
        {
          text: "O exército assume a cidade: postos de controle, quarentenas, triagem e rotas de evacuação.",
          image: "/images/lore/quarentena.png",
          alt: "Soldados uniformizados num posto de quarentena, contendo uma fila de civis",
        },
        "A evacuação falha. Ônibus saem cheios e não voltam, ruas travam, e água e energia param por falta de gente para operar.",
        "O rádio continua repetindo instruções que já não valem.",
      ],
      quote: "Nem toda parede caída foi derrubada por infectados.",
      note: "faltam: gaze, água limpa, luz, descanso",
      after: [
        "Aos poucos, o comando central para de responder. Cada posto militar passa a decidir sozinho: alguns protegem civis, outros fecham saídas.",
        "Esses soldados isolados são os Military: o exército de verdade, sem ordens e sem reforço.",
      ],
      trace:
        "Uma rota de evacuação riscada no mapa leva a carros engavetados e a um posto ainda legível. As ruínas são mais velhas que o seu Dia 1.",
    },
    {
      id: "ato-3",
      numeral: "III",
      title: "Os civis se organizam",
      when: "Quando ficou claro que ninguém viria buscar",
      image: "/images/lore/ato-3.png",
      scenes: [
        "Sem resgate, os civis que ficaram se juntaram em três grupos, cada um com uma resposta para a mesma pergunta: como continuar vivo amanhã?",
      ],
      quote: "Água, caminho, portão.",
      note: "água, caminho, portão",
      after: [
        {
          text: "Os Wardens não são o exército: são moradores e seguranças que muraram o próprio bairro e se armaram com o que acharam.",
          image: "/images/lore/wardens-muro.png",
          alt: "Moradores com coletes de obra e armas improvisadas no muro de carros e sacos de areia dos Wardens",
        },
        "No começo, os três cooperavam: os Rovers traziam peças e notícias, os Wardens abriam a passagem em horários seguros e Haven tratava os feridos de todos.",
      ],
      trace:
        "O caderno de Haven, um ônibus adaptado e a lista de turnos do forte: origens diferentes, ajuda real e custos reais em cada grupo.",
    },
    {
      id: "ato-4",
      numeral: "IV",
      title: "A noite da cancela",
      when: "Pouco antes de você chegar",
      image: "/images/lore/ato-4.png",
      scenes: [
        "A estrada para Haven passava pelo portão dos Wardens. Os Rovers precisavam dela aberta para viver; os Wardens só se sentiam seguros com ela fechada.",
        "Numa noite, um comboio Rover chegou com remédios para Haven e uma criança com febre. A regra dos Wardens: deixar a carga do lado de fora e esperar a triagem até de manhã.",
        {
          text: "Os Rovers recusaram. O rádio do posto falhou, infectados se aproximavam, um motorista tentou passar e alguém atirou.",
          image: "/images/lore/cancela-noite.png",
          alt: "Quadrinho em três quadros: o comboio parado na cancela, o tiroteio no escuro e a cancela torta ao amanhecer",
        },
      ],
      quote: "Nenhum grupo venceu; ambos aprenderam a esperar o pior do outro.",
      note: "duas linhas rasgadas. para onde foram os filtros?",
      after: [
        "Morreram um motorista Rover e um guarda Warden, e parte da carga sumiu. A criança chegou viva a Haven. Cada lado culpa o outro até hoje.",
        "Desde então, os Wardens patrulham as rotas e detêm caravanas, e os Rovers abrem caminhos por fora e emboscam patrulhas. Haven trata os feridos dos dois lados.",
      ],
      trace:
        "Ordem de retenção Warden, manifesto Rover incompleto e registro médico de Haven: três versões do mesmo incidente.",
    },
    {
      id: "ato-5",
      numeral: "V",
      title: "O mundo que você encontra",
      when: "O dia antes do seu Dia 1",
      image: "/images/lore/ato-5.png",
      scenes: [
        "O exército encolheu: alguns postos Military ainda ajudam civis, outros ficaram em silêncio.",
        "Desertores, ex-soldados que largaram o comando, cobram passagem com as mesmas armas. Gangues de saqueadores marcam território pintando o nome nos muros.",
      ],
      quote: "Velas, grades, ossos. Os sobreviventes os chamam de The Hollow.",
      note: "três caminhos até a cidade",
      after: [
        "The Hollow é um culto canibal que leva pessoas à noite. E entre todos eles, os infectados continuam lá: lentos, corredores, rastejantes.",
        "Na última folha do caderno, a enfermeira marcou a cidade. O caminho até lá é você quem traça.",
      ],
      trace: "Mapa incompleto, registros militares interrompidos, sinais territoriais e uma chamada de rádio sem fim.",
    },
  ] satisfies Act[],
};

/** Ato I: a ficha de triagem do caso mais antigo da região. */
export const triageSheet = {
  fields: [
    { label: "Paciente", value: "nome incompleto: não respondia" },
    { label: "Queixa", value: "febre, confusão, ferida no antebraço" },
    { label: "Desfecho", value: "óbito", correction: "movimento após declaração de óbito" },
  ],
  stamp: "Ordem de isolamento",
  stampNote: "Evitar contato com fluidos. Aguardar transporte especializado.",
};

/** Ato II: o que o rádio repetia enquanto a cidade parava. */
export const broadcasts = [
  "Ferva a água antes de beber.",
  "Evite aglomerações.",
  "Procure o ponto de triagem mais próximo.",
  "Rota de evacuação: avenida norte.",
];

/** Ato III: as três respostas. */
export const threeWays = [
  {
    word: "Água",
    faction: "Haven",
    origin:
      "Vizinhos em volta de um poço que viraram enfermaria, horta e refúgio. Acolhem quem chega e tratam os feridos.",
    cost: "Nunca houve espaço para todos do lado de dentro.",
  },
  {
    word: "Caminho",
    faction: "Rovers",
    origin:
      "Motoristas, mecânicos e comerciantes que vivem na estrada, levando peças, combustível e remédios entre os grupos.",
    cost: "Só sobrevivem com a estrada aberta.",
  },
  {
    word: "Portão",
    faction: "Wardens",
    origin:
      "Moradores e seguranças que muraram o próprio bairro. Revistam quem entra e controlam quem passa. Não são militares.",
    cost: "Só se sentem seguros com a estrada fechada.",
  },
];

/** Ato IV: o que as duas versões admitem, e o que cada uma conta. */
export const cancela = {
  facts: [
    "A cancela não abriu.",
    "Houve tiros.",
    "Morreram um motorista Rover e um guarda Warden.",
    "Parte da carga sumiu.",
  ],
  versions: [
    {
      id: "wardens",
      side: "Wardens",
      name: "Violação da Linha",
      document: "Ordem de retenção",
      claims: [
        "Retenção temporária da carga, conforme protocolo.",
        "O comboio forçou uma área de contenção.",
        "Um guarda viu uma arma no carro.",
      ],
      consequence: "Caravanas sem autorização serão detidas. Rotas perto do forte terão patrulha.",
    },
    {
      id: "rovers",
      side: "Rovers",
      name: "Noite da Cancela",
      document: "Manifesto de carga (linhas rasgadas)",
      claims: ["Tomada de carga.", "Um pedido de socorro usado para confiscar remédios.", "O tiro saiu da guarita."],
      consequence: "Mapear caminhos fora do controle Warden. Encontrar o que foi tirado do comboio.",
    },
  ],
};

/** Ato V: os nomes pintados nas paredes (os mesmos das gangues do Lazarus NPCs). */
export const gangs = [
  "Rust Dogs",
  "Lantern Boys",
  "Crowbar Saints",
  "Red Tape",
  "Gutter Kings",
  "Static",
  "Tin Men",
  "Black Pine",
];

export type Road = { id: string; label: string; detail: string; outcome: string };

/** Ato V: os três caminhos da última folha do caderno. */
export const roads: Road[] = [
  {
    id: "wardens",
    label: "O mais curto",
    detail: "Passa pela área patrulhada pelos Wardens.",
    outcome: "Você vai pelo caminho curto. Papéis prontos e mãos à vista.",
  },
  {
    id: "rovers",
    label: "O mais longo",
    detail: "Depende de uma rota Rover que talvez já tenha mudado.",
    outcome: "Você vai pela rota longa. Se ela ainda existir, alguém no ônibus vai querer algo em troca.",
  },
  {
    id: "desconhecido",
    label: "?",
    detail: "Termina num ponto de interrogação.",
    outcome: "Você vai pelo caminho sem nome. Ninguém voltou para dizer onde ele termina.",
  },
];

export const dayOne = {
  radio: "No rádio, uma voz pede ajuda sem dizer o nome. O sinal cai antes das coordenadas.",
  closing:
    "Não é o primeiro dia da infecção, da ruína, de Haven, dos Rovers ou dos Wardens. É o primeiro dia que você conseguiu sobreviver.",
};

/** Página "Quem é quem" do caderno: cada grupo aparece a partir do ato (índice) em que a história o apresenta. */
export const whoIsWho = [
  {
    name: "Military",
    image: "/images/factions/cenas/military.png",
    act: 1,
    who: "O exército de verdade: soldados que ficaram nos postos de controle e quarentenas quando o comando parou de responder.",
    relation: "Não comandam nenhum grupo civil. Alguns postos ainda ajudam; outros sumiram.",
  },
  {
    name: "Haven",
    image: "/images/factions/cenas/haven.png",
    act: 2,
    who: "Civis em volta de um poço que viraram enfermaria e refúgio.",
    relation: "Acolhe e trata gente dos dois lados da rivalidade.",
  },
  {
    name: "Rovers",
    image: "/images/factions/cenas/rovers.png",
    act: 2,
    who: "Motoristas, mecânicos e comerciantes que vivem na estrada.",
    relation: "Rivais dos Wardens desde a noite da cancela.",
  },
  {
    name: "Wardens",
    image: "/images/factions/cenas/wardens.png",
    act: 2,
    who: "Moradores e seguranças de um bairro murado. Civis armados, não militares.",
    relation: "Rivais dos Rovers desde a noite da cancela.",
  },
  {
    name: "Desertores",
    image: "/images/factions/cenas/desertores.png",
    act: 4,
    who: "Ex-soldados que largaram o comando e cobram passagem com as armas do exército.",
    relation: "Não representam os Military que ainda ajudam.",
  },
  {
    name: "Gangues",
    image: "/images/factions/gangues.png",
    act: 4,
    who: "Saqueadores que tomaram cruzamentos e depósitos e pintam o nome nos muros.",
    relation: "Cada gangue por si; nenhum território é seguro.",
  },
  {
    name: "The Hollow",
    image: "/images/factions/cenas/the-hollow.png",
    act: 4,
    who: "Um culto canibal que leva pessoas à noite.",
    relation: "Inimigo de todos.",
  },
];
