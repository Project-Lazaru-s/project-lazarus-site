import type { Dossier } from "./origins";

// Arquivo 03, "Os Hostis": como os grupos hostis começaram, cada um ajudando ou sobrevivendo até cruzar uma linha.
// Fonte: Documents/Project Lazarus/Lore/01. Origens das faccoes (05 a 14). Aqui fica a versão enxuta para o jogo.

export const hostis = {
  slug: "os-hostis",
  title: "Os Hostis",
  subtitle: "Quando pararam de escrever recibos",
  intro:
    "Nenhum deles começou como inimigo. Um quadro de alertas guarda o que viajantes deixaram para trás: uma plaqueta militar, um aviso escrito à mão e um mapa com oito pichações. Descubra em que momento cada grupo cruzou a linha.",
  cover: "/images/lore/hostis/quadro-alertas.png",
};

const GANGS_BG = "/images/factions/gangues.png";

const desertores: Dossier = {
  id: "desertores",
  name: "Desertores",
  title: "O posto depois da ordem",
  need: "Romperam com o posto ao qual pertenciam",
  photo: "/images/factions/cenas/desertores.png",
  focus: "45% 60%",
  ambience: "/sounds/lore/amb-desertores.mp3",
  parts: [
    {
      id: "radio",
      numeral: "I",
      title: "A ordem que não chegou",
      when: "Fim da primeira semana · um posto na estrada",
      image: "/images/lore/hostis/desertores-posto.png",
      scenes: [
        {
          text: "No posto, a última ordem mandava manter a estrada livre até chegar uma equipe de substituição. A equipe nunca veio.",
          image: "/images/lore/hostis/desertores-posto.png",
          alt: "À noite, num posto militar isolado, um soldado escuta o rádio de campanha enquanto outros dividem um único prato perto de um barril em chamas.",
        },
        "O rádio ficou ligado por três dias, chiando entre pedidos de socorro e mensagens repetidas. Os soldados seguiram as escalas mesmo com uma refeição por turno.",
      ],
      gate: "radio",
      quote:
        "Quando abriram a caixa de remédios para um ferido da própria unidade, metade tinha sido levada para outra missão. Ninguém repôs.",
      note: "Três dias chamando a substituição. Nenhuma resposta. Uma refeição por turno.",
      after: [],
    },
    {
      id: "madrugada",
      numeral: "II",
      title: "A madrugada",
      when: "Dias depois · a mesma barreira",
      image: "/images/lore/hostis/desertores-partida.png",
      scenes: [
        "Uma patrulha voltou da busca por combustível com dois civis e uma notícia: a estrada de abastecimento terminava num bloqueio tomado por infectados.",
        {
          text: "O comandante quis manter a barreira. Alguns queriam escoltar os civis até um abrigo. Outros propuseram partir enquanto ainda havia veículo.",
          image: "/images/lore/hostis/desertores-partida.png",
          alt: "Ao amanhecer, seis soldados com armas, mapa e caixas sobem num caminhão e deixam o posto; quem ficou observa da barreira.",
        },
        "Na madrugada, o comandante morreu numa inspeção externa. O sargento que assumiu não tinha como confirmar a ordem antiga nem pedir outra.",
      ],
      gate: "madrugada",
      quote:
        "Saíram seis soldados com armas, mapa, rádio e parte das caixas. Prometeram voltar depois de abrir caminho. Não voltaram.",
      note: "Livro de serviço: seis saídas, nenhum retorno. O posto ficou com quem escolheu ficar.",
      after: ["Fora do posto, os seis descobriram que o uniforme abria portas e fechava conversas."],
    },
    {
      id: "patrulha",
      numeral: "III",
      title: "Recibos",
      when: "Semanas depois · a estrada",
      image: "/images/lore/hostis/desertores-pedagio.png",
      scenes: [
        {
          text: "Num depósito, conseguiram comida mostrando a identificação. Em outro, exigiram comida apontando uma arma. Na primeira semana ainda chamavam aquilo de requisição. Depois pararam de escrever recibos.",
          image: "/images/lore/hostis/desertores-pedagio.png",
          alt: "Numa barreira de estrada, homens de farda gasta e insígnias arrancadas cobram pedágio de uma família de viajantes.",
        },
        "Outros desertores surgiram por motivos diferentes: medo, recusa a uma quarentena, busca por familiares, roubo. Alguns largaram as insígnias; outros mantiveram disciplina e caixas militares para controlar uma estrada.",
        "De longe, parecem uma patrulha Military. De perto, faltam identificação verificável, prestação de contas e propósito comum.",
      ],
      gate: "patrulha",
      quote:
        "O mesmo uniforme, em outro lugar, ainda pertence a soldados que escoltam civis. Confundir os dois é um risco real para quem viaja.",
      note: "Procure a identificação, o recibo e o propósito. O uniforme sozinho não diz nada.",
      after: [],
    },
  ],
  trace: {
    title: "O livro de serviço",
    text: "Termina com a saída de seis soldados e a promessa de retorno. A primeira página do livro-caixa do esconderijo reaproveita o verso desse registro.",
  },
};

const hollow: Dossier = {
  id: "hollow",
  name: "The Hollow",
  title: "O lugar onde ninguém respondia",
  need: "A fome num abrigo fechado",
  photo: "/images/factions/cenas/the-hollow.png",
  focus: "50% 50%",
  ambience: "/sounds/lore/amb-hollow.mp3",
  parts: [
    {
      id: "conta",
      numeral: "I",
      title: "A conta na parede",
      when: "Começo do colapso · um subsolo",
      image: "/images/lore/hostis/hollow-subsolo.png",
      scenes: [
        {
          text: "O primeiro abrigo de The Hollow não tinha nome. Era um subsolo com grades, uma despensa e uma entrada estreita o bastante para ser defendida.",
          image: "/images/lore/hostis/hollow-subsolo.png",
          alt: "Num subsolo de concreto iluminado por velas, onze sobreviventes sentados em colchões; na parede, fileiras de riscos contando porções.",
        },
        "Do lado de fora havia infectados. Do lado de dentro, onze pessoas e comida para quatro dias. Alguém anotou a divisão das porções na parede.",
      ],
      gate: "conta",
      quote: "A conta parou de fechar. Ninguém veio buscá-los.",
      note: "Onze pessoas, comida para quatro dias. Os riscos da parede param no meio de um dia.",
      after: [],
    },
    {
      id: "versoes",
      numeral: "II",
      title: "Duas versões",
      when: "Meses depois · dois relatos",
      image: "/images/factions/cenas/the-hollow.png",
      scenes: [
        "Os sobreviventes não concordam sobre o que aconteceu depois. Uma mulher que escapou disse que comeram um corpo encontrado na sala de manutenção.",
        "Um homem capturado meses depois jurou que o corpo já estava morto e que todos haviam consentido.",
      ],
      gate: "versoes",
      quote: "Nenhum dos dois explicou os prisioneiros que surgiram mais tarde.",
      note: "O que os dois admitem: onze pessoas, a comida no fim, um corpo. O resto é defesa.",
      after: [
        "Quando voltaram à superfície, parte do grupo tinha aprendido a tratar pessoas isoladas como estoque possível.",
      ],
    },
    {
      id: "luz",
      numeral: "III",
      title: "Não siga a luz",
      when: "Depois · o oco de um prédio",
      image: "/images/lore/hostis/hollow-luz.png",
      scenes: [
        {
          text: "Voltavam ao subsolo antes do amanhecer. Usavam velas onde não havia luz elétrica e deixavam ossos e marcas nas passagens para que estranhos acreditassem entrar num lugar proibido.",
          image: "/images/lore/hostis/hollow-luz.png",
          alt: "No oco escuro de um prédio em ruínas, uma trilha de velas desce a escada entre símbolos pintados; um viajante hesita na entrada com uma lanterna.",
        },
        "A palavra Hollow apareceu primeiro num aviso de quem escapou: “Não sigam a luz no oco do prédio.” Os integrantes adotaram o nome, ou perceberam que o medo já trabalhava por eles.",
      ],
      gate: "luz",
      quote:
        "Não é preciso saber quem acredita nos símbolos para entender o perigo. Por baixo deles, a parede guarda uma mudança humana, não uma força sobrenatural.",
      note: "Não siga velas. Por baixo dos símbolos, só contas de porções.",
      after: [
        {
          text: "A caça acontece à noite, contra quem se separa do grupo. Não há comércio com The Hollow: o que oferecem como orientação pode ser uma rota para o próprio covil.",
          image: "/images/lore/hostis/hollow-parede.png",
          alt: "Parede de subsolo à luz de vela: riscos antigos de porções aparecem onde os símbolos pintados por cima foram raspados.",
        },
        "A origem na fome não absolve o que fizeram depois. Outros abrigos também passaram fome e não transformaram o desespero em método.",
      ],
    },
  ],
  trace: {
    title: "A parede do primeiro subsolo",
    text: "Marcas antigas de porções divididas, quase encobertas por símbolos posteriores. A diferença entre as duas camadas revela uma mudança humana.",
  },
};

const gang = (
  id: string,
  numeral: string,
  title: string,
  when: string,
  scenes: string[],
  gate: Dossier["parts"][number]["gate"],
  quote: string,
  note: string,
) => ({ id, numeral, title, when, image: GANGS_BG, scenes, gate, quote, note, after: [] });

const gangues: Dossier = {
  id: "gangues",
  name: "As oito gangues",
  title: "A ferramenta é a mesma",
  need: "Cada uma começou ajudando alguém",
  photo: GANGS_BG,
  focus: "50% 50%",
  ambience: "/sounds/lore/amb-city.mp3",
  partLabel: "Caso",
  parts: [
    gang(
      "rust",
      "1",
      "Rust Dogs",
      "Donos do pátio",
      [
        "No pátio de veículos havia lataria para barricadas, peças para negociar e um tanque de combustível. O grupo que ficou passou a cobrar pela entrada, dizendo que a taxa pagava a vigia.",
        "Logo declararam todo veículo abandonado propriedade do pátio, inclusive os que paravam do lado de fora.",
      ],
      "rust",
      "Um caminhão de resgate perdeu os pneus enquanto o motorista negociava água. Na manhã seguinte, alguém pintou Rust Dogs na placa do portão.",
      "Rust Dogs: consertam uma peça e retêm outra. O pátio é a saída da estrada.",
    ),
    gang(
      "lantern",
      "2",
      "Lantern Boys",
      "Luzes na rua apagada",
      [
        "Quando a energia caiu, moradores penduraram lanternas em janelas seguras para guiar quem vinha buscar parentes. Uma luz queria dizer “suba”; duas, “não entre”.",
        "Depois faltou óleo e comida. Os vigias começaram a cobrar pela rota iluminada, e um deles mudou um sinal de propósito.",
      ],
      "lantern",
      "Todos aprenderam que uma luz podia esconder uma escolha. Os mais ousados passaram a acender caminhos até becos onde esperavam armados.",
      "Lantern Boys: uma luz, suba; duas, não entre; a terceira marca é deles.",
    ),
    gang(
      "crowbar",
      "3",
      "Crowbar Saints",
      "Quem abriu a porta",
      [
        "No primeiro incêndio dos galpões, três trabalhadores abriram portas com pés de cabra para tirar gente presa, e deixavam uma marca de metal em cada porta revistada.",
        "Um sobrevivente agradecido escreveu “santos do pé de cabra” na parede. Depois, passaram a abrir qualquer porta, inclusive as que alguém ainda defendia.",
      ],
      "crowbar",
      "Ainda sabem resgatar alguém de um prédio fechado. Também sabem tornar uma porta inútil para quem vive atrás dela.",
      "Crowbar Saints: marcas velhas salvaram gente. Marcas novas cobram.",
    ),
    gang(
      "redtape",
      "4",
      "Red Tape",
      "A licença para passar",
      [
        "O centro de registros sobreviveu à administração. Uma equipe ficou para preservar as listas de evacuação, e as listas ajudaram famílias a encontrar nomes.",
        "Quando os postos oficiais se fragmentaram, um funcionário criou uma autorização de trânsito. O papel não valia nada fora da sala, mas o guarda da saída tinha arma.",
      ],
      "redtape",
      "Faixas vermelhas marcavam as caixas retidas por falta de licença. Quem discutia podia perder a vez, o remédio ou a notícia de um parente.",
      "Red Tape: o mesmo papel, outro preço. Alguns registros ainda são verdadeiros.",
    ),
    gang(
      "gutter",
      "5",
      "Gutter Kings",
      "O caminho sob a rua",
      [
        "Dois trabalhadores de drenagem mostraram aos vizinhos como atravessar um bloqueio pelos canais de manutenção. A primeira travessia foi gratuita; a segunda custou uma lanterna; a terceira, metade da comida de uma família.",
        "Os guias começaram a fechar as passagens alternativas, para que ninguém atravessasse sem eles.",
      ],
      "gutter",
      "Gutter Kings foi primeiro uma provocação escrita numa tampa de bueiro. Eles adotaram o nome e pintaram coroas nas entradas que controlavam.",
      "Gutter Kings: as rotas de graça foram apagadas do mapa, não da cidade.",
    ),
    gang(
      "static",
      "6",
      "Static",
      "A voz depois do chiado",
      [
        "A pequena estação de rádio resistiu ao apagão e transmitia pontos de água, ruas bloqueadas e nomes de desaparecidos. Quem era ajudado trazia uma lata de combustível.",
        "Os guardas contratados passaram a decidir o que ia ao ar. Uma caravana pagou para anunciar uma rota como “corredor seguro”.",
      ],
      "static",
      "Quando uma chamada de socorro atraiu viajantes com suprimentos e ninguém apareceu para resgatá-los, a gangue percebeu que podia escolher quem chegaria até ela.",
      "Static: nem toda voz naquela frequência é deles. Essa dúvida é a arma.",
    ),
    gang(
      "tin",
      "7",
      "Tin Men",
      "Chapas sobre a pele",
      [
        "Uma oficina de chapas cobriu portas, fez proteções para braços e ensinou vizinhos a reforçar carrinhos. Quando o metal acabou, saíram para desmontar telhados e veículos.",
        "Um dia tiraram as placas de uma ambulância sem ver se alguém ainda precisava dela. A pessoa sobreviveu e voltou exigindo as portas. Eles recusaram.",
      ],
      "tin",
      "O apelido Tin Men queria ridicularizar os guardas de chapas desencontradas. Virou bandeira.",
      "Tin Men: a barricada deles é feita de abrigos que eram de outros.",
    ),
    gang(
      "pine",
      "8",
      "Black Pine",
      "A estrada entre árvores",
      [
        "Na borda da cidade, famílias acamparam entre pinheiros porque as árvores escondiam fogueiras. Os primeiros guardas só impediam infectados de entrar.",
        "Uma patrulha encontrou caixas deixadas por uma caravana que fugira à noite. Quando os donos voltaram, ouviram que carga abandonada era estoque comum.",
      ],
      "pine",
      "O argumento virou regra: bastava forçar um viajante a parar, esperar que fugisse com medo e declarar a carga abandonada.",
      "Black Pine: a placa diz estoque comum; o manifesto tem o nome do dono.",
    ),
  ],
  trace: {
    title: "O mapa de território",
    text: "Oito marcas pintadas na mesma cidade. Em todas, uma ferramenta que salvou gente antes de passar a cobrar por isso.",
  },
};

export const hostileDossiers: Dossier[] = [desertores, hollow, gangues];

/** Emblema pintado de cada gangue, na ordem dos casos. */
export const gangEmblems: Record<string, string> = {
  rust: "/images/lore/hostis/gangues/rust-dogs.png",
  lantern: "/images/lore/hostis/gangues/lantern-boys.png",
  crowbar: "/images/lore/hostis/gangues/crowbar-saints.png",
  redtape: "/images/lore/hostis/gangues/red-tape.png",
  gutter: "/images/lore/hostis/gangues/gutter-kings.png",
  static: "/images/lore/hostis/gangues/static.png",
  tin: "/images/lore/hostis/gangues/tin-men.png",
  pine: "/images/lore/hostis/gangues/black-pine.png",
};

export const hostileEpilogue = [
  "Nenhum desses grupos começou como hostil. Um posto esperou uma ordem que não veio. Um abrigo dividiu a comida até a conta parar de fechar. Oito ruas organizaram ajuda antes de cobrar por ela.",
  "A diferença entre eles e quem resistiu não está na fome nem no medo. Está na escolha que veio depois.",
  "Quando você encontrar um uniforme sem nome, uma luz no oco de um prédio ou uma pichação numa esquina, lembre de onde cada um começou e do que escolheu.",
];

// ---------- Portões dos Desertores ----------

/** Parte I: três dias chamando a substituição. A comida cai a cada dia. */
export const radioDays = [
  { day: 1, meals: 3, reply: "…repetindo: manter a estrada livre. Substituição a caminho." },
  { day: 2, meals: 2, reply: "…pedido de socorro de outra área. Ninguém responde ao posto." },
  { day: 3, meals: 1, reply: "…só chiado." },
] as const;
export const medicineBox = [
  { item: "Ataduras", taken: false },
  { item: "Antibiótico", taken: true },
  { item: "Analgésico", taken: true },
  { item: "Soro fisiológico", taken: false },
  { item: "Kit de sutura", taken: true },
  { item: "Antisséptico", taken: false },
] as const;

/** Parte II: as três posições na madrugada. Ouvir todas antes de assinar a saída. */
export const dawnPositions = [
  {
    id: "barreira",
    who: "O comandante",
    says: "Manter a barreira. A ordem foi manter a estrada livre, e ninguém nos tirou dela.",
  },
  {
    id: "escolta",
    who: "A cabo Lima",
    says: "Escoltar os dois civis até um abrigo. Para isso o posto existe.",
  },
  {
    id: "partir",
    who: "O sargento Vaz",
    says: "Partir enquanto ainda temos veículo. A substituição não vem.",
  },
] as const;

/** Parte III: quatro grupos de farda na estrada. Patrulha de verdade ou desertores? */
export const patrols = [
  {
    id: "barreira",
    who: "Quatro soldados numa barreira",
    signs: [
      "Plaquetas com nome e unidade",
      "Escoltam uma família até o posto",
      "O cabo anota a passagem e dá um recibo",
    ],
    answer: "military",
  },
  {
    id: "ponte",
    who: "Três homens de farda numa ponte",
    signs: [
      "Insígnias arrancadas",
      "Cobram duas latas por pessoa",
      "Placa de segurança de um posto que fechou há meses",
    ],
    answer: "desertores",
  },
  {
    id: "dupla",
    who: "Uma dupla de uniforme limpo",
    signs: [
      "Dizem ser de um posto que não sabem nomear",
      "Pedem para revistar a carga “por segurança”",
      "Não anotam nada",
    ],
    answer: "desertores",
  },
  {
    id: "sargento",
    who: "Um sargento ferido e dois soldados",
    signs: [
      "Identificação com foto e posto",
      "Pedem água e oferecem escolta em troca",
      "Registram o acordo no livro de serviço",
    ],
    answer: "military",
  },
] as const;
export const patrolReplies = {
  military: "Eles têm identificação e prestam contas. Fugir deles é perder uma escolta.",
  desertores: "Uniforme sem identificação e sem recibo. Parar ali é pagar pedágio.",
} as const;

// ---------- Portões de The Hollow ----------

/** Parte I: onze pessoas e comida para quatro dias inteiros. */
export const SHELTER = { people: 11, stock: 44, half: 6 } as const;

/** Parte II: frases dos dois relatos. Só valem as que os dois admitem. */
export const testimonies = [
  { text: "Eram onze no subsolo.", both: true, reply: "" },
  { text: "A comida acabou.", both: true, reply: "" },
  { text: "Havia um corpo na sala de manutenção.", both: true, reply: "" },
  { text: "O corpo já estava morto.", both: false, reply: "Só o homem capturado diz isso." },
  { text: "Todos consentiram.", both: false, reply: "Só o homem capturado diz isso." },
  { text: "Os prisioneiros vieram depois, por acaso.", both: false, reply: "Nenhum dos dois explica os prisioneiros." },
] as const;

/** Parte III: três passagens no oco do prédio. A luz é a isca. */
export const passages = [
  {
    safe: "Escada escura, com corrente de ar vindo de fora",
    lure: "Corredor com velas acesas no chão",
  },
  {
    safe: "Passagem com goteira e eco de rua",
    lure: "Sala com velas recém-acesas e um prato de comida",
  },
  {
    safe: "Porta de serviço sem marca nenhuma",
    lure: "Corredor com ossos arrumados em fila",
  },
] as const;
export const WALL_SYMBOLS = 6;

// ---------- Casos das gangues ----------

export type PickCase = {
  docs: string[];
  question: string;
  options: { label: string; ok: boolean; reply: string }[];
};

export const pickCases: Record<"rust" | "lantern" | "redtape" | "tin" | "pine", PickCase> = {
  rust: {
    docs: [
      "Ordem de serviço nº 14 · caminhão de resgate: trocar a bateria.",
      "Tabela de taxas de recuperação · caminhão de resgate: 4 pneus.",
    ],
    question: "O que o pátio tirou do caminhão sem ninguém pedir?",
    options: [
      { label: "A bateria", ok: false, reply: "A bateria estava na ordem de serviço. Foi pedida." },
      { label: "Os quatro pneus", ok: true, reply: "Os pneus entraram como “recuperação”. Ninguém pediu." },
      { label: "O combustível", ok: false, reply: "Nenhum papel fala do tanque." },
    ],
  },
  lantern: {
    docs: [
      "Cartão do código: uma lanterna = suba. Duas lanternas = não entre.",
      "Janela A: uma lanterna. Janela B: duas lanternas. Janela C: uma lanterna e uma terceira marca de giz embaixo.",
    ],
    question: "Pelo código original, onde você sobe sem pagar?",
    options: [
      { label: "Janela A", ok: true, reply: "Uma luz, sem marca extra: suba." },
      { label: "Janela B", ok: false, reply: "Duas luzes: não entre." },
      { label: "Janela C", ok: false, reply: "A terceira marca não está no código. É o lugar de cobrança." },
    ],
  },
  redtape: {
    docs: [
      "Licença 0412 · carga: remédios · carimbo do centro de registros · taxa: 2 latas.",
      "Licença 0412 · carga: remédios · carimbo do centro de registros · taxa: 6 latas.",
    ],
    question: "O que muda entre as duas licenças idênticas?",
    options: [
      { label: "O número", ok: false, reply: "As duas são a 0412." },
      { label: "O carimbo", ok: false, reply: "O carimbo é o mesmo. Por isso parece valer." },
      { label: "O preço", ok: true, reply: "O mesmo papel, outro preço. Depende de quem pergunta." },
    ],
  },
  tin: {
    docs: [
      "Ambulância desmontada: portas arrancadas, dobradiças cortadas com alicate.",
      "Guarda dos Tin Men: chapa no peito, ombreira de calha, escudo de tampa de tambor.",
    ],
    question: "Qual peça do guarda veio da ambulância?",
    options: [
      {
        label: "A chapa do peito",
        ok: true,
        reply: "Mesma marca de alicate das dobradiças. Era a porta da ambulância.",
      },
      { label: "A ombreira", ok: false, reply: "Calha de telhado. Marca de serra, não de alicate." },
      { label: "O escudo", ok: false, reply: "Tampa de tambor de óleo, sem marca de alicate." },
    ],
  },
  pine: {
    docs: [
      "Manifesto · Caravana do Sul · 6 caixas · responsável: R. Matos.",
      "Placa na estrada: ESTOQUE COMUM.",
      "Reclamação arquivada sob a caixa: “Exijo minhas 6 caixas.” — R. Matos.",
    ],
    question: "De quem é a carga “abandonada”?",
    options: [
      { label: "Do acampamento", ok: false, reply: "A placa diz isso. O manifesto, não." },
      { label: "De R. Matos, da Caravana do Sul", ok: true, reply: "O nome está no manifesto e na reclamação." },
      { label: "De quem achou primeiro", ok: false, reply: "Foi o argumento deles, não a regra da estrada." },
    ],
  },
};

/** Crowbar Saints: separar as marcas de resgate das de cobrança. */
export const crowbarDoors = [
  { id: "galpao", label: "Galpão 3: marca antiga e enferrujada, cadeado cortado de fora para dentro", bin: "resgate" },
  { id: "casa", label: "Casa habitada: marca nova, cadeado partido durante a noite", bin: "cobranca" },
  { id: "agua", label: "Depósito de água: marca antiga e um bilhete de agradecimento", bin: "resgate" },
  { id: "armazem", label: "Armazém do dono que recusou a taxa: marca recente, riscada a fundo", bin: "cobranca" },
] as const;

/** Gutter Kings: as galerias pagas (=) terminam em grades; a rota gratuita (~) foi apagada do mapa. */
export const GUTTER_MAP = [
  "################",
  "#S=======#######",
  "#~######=#######",
  "#~######=====###",
  "#~##########=###",
  "#~~~~~~~~~~#####",
  "##########~~~~G#",
  "################",
];

/** Static: o anúncio pago e o pedido de socorro de verdade, na mesma faixa do dial. */
export const STATIC_DIAL = { min: 88, max: 108, step: 0.1, start: 92, width: 0.6 } as const;
export const staticStations = [
  { freq: 96, text: "…corredor seguro pela avenida leste. Patrocínio da caravana Ferro Velho…", real: false },
  {
    freq: 101.5,
    text: "…socorro, família presa no mercado da rua 9, entrada pelos fundos, três crianças…",
    real: true,
  },
] as const;
