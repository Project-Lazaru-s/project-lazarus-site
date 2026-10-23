import type { Line } from "./lore";

// Arquivo 02, "Antes das Bandeiras": como cada facção central começou durante o colapso, antes do Dia 1.
// Fonte: Documents/Project Lazarus/Lore/01. Origens das faccoes. Aqui fica a versão enxuta para o jogo.

export type FactionId = "haven" | "rovers" | "wardens" | "military";
export type OriginGateId =
  | "poco"
  | "enfermaria"
  | "trocas"
  | "onibus"
  | "tripulacao"
  | "volta"
  | "turnos"
  | "entrada"
  | "retirada"
  | "quarentena"
  | "ordens"
  | "doses";

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

const wardens: Dossier = {
  id: "wardens",
  name: "Wardens",
  title: "A linha que não podia ceder",
  need: "Defender acessos e moradores",
  photo: "/images/factions/cenas/wardens.png",
  focus: "55% 60%",
  ambience: "/sounds/lore/amb-wardens.mp3",
  parts: [
    {
      id: "turnos",
      numeral: "I",
      title: "O portão aberto",
      when: "Começo do colapso · uma rua estreita",
      image: "/images/lore/origens/wardens-portao.png",
      scenes: [
        {
          text: "O lugar que viraria o forte Warden começou com uma rua estreita e uma noite de vigia. Algumas casas tinham sobrevivido ao primeiro incêndio, com água guardada e um depósito de ferramentas.",
          image: "/images/lore/origens/wardens-portao.png",
          alt: "Ao amanhecer, moradores com roupas improvisadas fincam postes e empilham sacos de areia numa rua estreita, diante de duas casas queimadas.",
        },
        "Na primeira tentativa de saída, um portão ficou aberto para um homem atrasado. Atrás dele vieram infectados. Os moradores fecharam a passagem, mas perderam duas casas e quem ainda estava nelas.",
        "No amanhecer seguinte, antigos vigias, gente da manutenção e voluntários fincaram postes, empilharam sacos de areia e ergueram uma guarita. Ninguém se apresentou como governo.",
      ],
      gate: "turnos",
      quote: "Cada morador sabia que dormir sem vigia podia custar outro quarteirão.",
      note: "Quatro turnos, três pessoas. Ninguém vigia dois turnos seguidos.",
      after: [],
    },
    {
      id: "entrada",
      numeral: "II",
      title: "Quem entra",
      when: "Semanas depois · o portão da barricada",
      image: "/images/lore/origens/wardens-registro.png",
      scenes: [
        {
          text: "O problema veio com os vivos. Pessoas pediam entrada para buscar abrigo, trocar comida, encontrar parentes. Algumas estavam feridas; outras escondiam feridas com medo de serem recusadas.",
          image: "/images/lore/origens/wardens-registro.png",
          alt: "Sob uma lona, na chuva, um guarda escreve num livro de entradas enquanto viajantes esperam numa área cercada por cordas e paletes.",
        },
        "Os defensores criaram um registro de entrada, uma área de espera e uma regra de inspeção. Quase tudo era decidido por quem estava no portão naquele turno.",
      ],
      gate: "entrada",
      quote:
        "Foi assim que uma barricada virou autoridade: cada exceção feita na chuva precisava ser explicada ao próximo guarda.",
      note: "Registro, área de espera, revista. Cada erro vira uma regra nova, em outra tinta.",
      after: [
        "O nome Wardens apareceu numa ordem de patrulha escrita à mão. Queria dizer que tinham algo sob guarda: a vida dentro das muralhas.",
        "Com o tempo, isso passou a incluir arsenal, estoque, bunker de comando e rotas de aproximação. Quem vivia dentro aceitava turnos, racionamento e limites de circulação. Quem vinha de fora esperava.",
      ],
    },
    {
      id: "retirada",
      numeral: "III",
      title: "A linha",
      when: "Meses depois · uma retirada",
      image: "/images/lore/origens/wardens-retirada.png",
      scenes: [
        {
          text: "Houve coragem nas guaritas. Durante uma retirada, um Warden manteve uma passagem aberta mesmo sabendo que o barulho atrairia infectados.",
          image: "/images/lore/origens/wardens-retirada.png",
          alt: "À noite, sob um holofote, um guarda civil segura o portão aberto enquanto os últimos sobreviventes correm para dentro, com infectados vindo pela rua.",
        },
        "Segurar demais custava a muralha. Fechar cedo demais custava quem ainda corria na rua.",
      ],
      gate: "retirada",
      quote:
        "Os moradores aprenderam a ligar a própria sobrevivência à disciplina do forte. Os viajantes, a ligar a disciplina a horas perdidas do lado errado do portão.",
      note: "Segurar a passagem até o último entrar. Nem um passo a mais.",
      after: [
        "Houve também decisões injustas: mantas requisitadas de viajantes, uma revista feita tarde demais para salvar um doente, outra cedo demais para manter a confiança de uma família.",
        "Antes da ruptura, os Wardens recebiam peças dos Rovers e liberavam horários de travessia. Haven acolhia seus feridos.",
        "A rivalidade que viria depois não mudaria o motivo da fundação: o medo de ver uma abertura pequena destruir tudo. Mudaria o tamanho da linha que estariam dispostos a traçar.",
      ],
    },
  ],
  trace: {
    title: "O primeiro livro de entradas",
    text: "Regras acrescentadas em tintas diferentes. A página da noite em que o portão ficou aberto guarda os nomes das casas perdidas.",
  },
};

const military: Dossier = {
  id: "military",
  name: "Military",
  title: "As ordens que pararam de chegar",
  need: "Continuar a resposta de emergência",
  photo: "/images/factions/cenas/military.png",
  focus: "40% 55%",
  ambience: "/sounds/lore/amb-military.mp3",
  parts: [
    {
      id: "quarentena",
      numeral: "I",
      title: "O posto",
      when: "Primeiros dias do surto · um posto de triagem",
      image: "/images/lore/origens/military-posto.png",
      scenes: [
        {
          text: "Military já existia antes do surto. O que precisou nascer durante ele foi um jeito de continuar trabalhando quando as ordens deixaram de corresponder ao terreno.",
          image: "/images/lore/origens/military-posto.png",
          alt: "Um posto militar de triagem com tendas brancas e arame farpado; uma equipe de máscara de gás pinta um X na porta de um prédio fechado.",
        },
        "As primeiras equipes instalaram postos de triagem, abriram corredores para ambulâncias e protegeram entregas de água e remédios. Tinham equipamento, treinamento e uma vantagem curta: ainda sabiam a quem pedir reforço.",
        "A lista da manhã cabia numa folha: manter a barreira, contar filtros, verificar a quadra. As equipes de quarentena marcavam os prédios que ninguém deveria abrir sem proteção.",
      ],
      gate: "quarentena",
      quote: "A rotina continuava porque salvava vidas.",
      note: "Prédio com sinal de infecção recebe a marca. Prédio com gente viva recebe visita.",
      after: [],
    },
    {
      id: "ordens",
      numeral: "II",
      title: "Duas ordens",
      when: "Uma noite · o rádio do posto",
      image: "/images/lore/origens/military-radio.png",
      scenes: [
        {
          text: "À tarde, uma chamada mandou buscar uma amostra em outra área. À noite, o rádio trouxe uma ordem para evacuar o posto.",
          image: "/images/lore/origens/military-radio.png",
          alt: "Numa tenda de comando à noite, um operador de rádio escreve enquanto o comandante encara duas ordens presas lado a lado num quadro de avisos.",
        },
        "Minutos depois, outra ordem, pela mesma frequência: não abandonar a barreira. Ainda havia civis na rua interna.",
      ],
      gate: "ordens",
      quote: "No dia seguinte, a frequência que enviara as duas ordens estava muda.",
      note: "Duas ordens no mesmo quadro. Embaixo, a lápis: retirar os civis da rua interna primeiro.",
      after: [
        "O equipamento também criava distância. Civis viam uniformes e esperavam respostas que aqueles soldados não tinham. Alguns respondiam com sinceridade; outros repetiam comunicados vencidos.",
      ],
    },
    {
      id: "doses",
      numeral: "III",
      title: "Cada dose",
      when: "Semanas depois · um posto isolado",
      image: "/images/lore/origens/military-doses.png",
      scenes: [
        {
          text: "Sem reforço, o posto passou a viver de contagem. Guardas se revezavam, e o médico de campo tratava quem conseguia alcançar a tenda.",
          image: "/images/lore/origens/military-doses.png",
          alt: "Numa tenda médica, um médico e um soldado contam filtros e anotam num livro; ao lado, uma caixa térmica aberta com poucos frascos de soro.",
        },
        "A amostra recolhida servia a uma pesquisa limitada. O soro experimental era tentativa, não cura. Cada dose tinha destinatário, e cada filtro precisava ser contado.",
      ],
      gate: "doses",
      quote: "A falha da rede de comando não tornou todos os militares iguais.",
      note: "Filtros e doses: a conta fecha todo dia, mesmo quando ninguém mais pede o relatório.",
      after: [
        "Em certos lugares, a barreira que protegia um bairro impedia a saída de outro. Uma boa decisão local podia receber, horas depois, uma notícia que a tornava cruel.",
        "Postos caíram ou foram abandonados. Uma parte da tropa continuou cooperando com sobreviventes. Outra desertou.",
        "Military, no mundo que você encontra, é o conjunto desigual dos que ainda usam a estrutura de um posto para conter, proteger ou estudar o que podem.",
      ],
    },
  ],
  trace: {
    title: "Duas ordens no quadro de avisos",
    text: "Duas ordens incompatíveis presas ao mesmo quadro, com uma anotação à mão sobre a retirada dos civis. O carimbo não prova quem ainda controlava a frequência naquela noite.",
  },
};

export const dossiers: Dossier[] = [haven, rovers, wardens, military];

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

// ---------- Portões dos Wardens ----------

/** Parte I: quatro turnos da noite, três pessoas de vigia. */
export const watchSlots = ["Anoitecer", "Meia-noite", "Madrugada", "Amanhecer"] as const;
export const watchers = [
  { id: "nogueira", who: "Nogueira", line: "ex-vigia de condomínio" },
  { id: "ivete", who: "Ivete", line: "da manutenção" },
  { id: "caio", who: "Caio", line: "voluntário" },
] as const;

/** Parte II: quem chega ao portão. Errar não trava o portão: escreve uma regra nova no livro. */
export const entryBaseRules = ["Todo nome vai para o registro de entrada.", "Quem não entra fica na área de espera."];
export const UNINSPECTED_RULE = "Ninguém entra sem revista.";
export const arrivals = [
  {
    id: "familia",
    who: "Uma família com duas crianças",
    ask: "Pedem abrigo antes de escurecer.",
    found: "Ninguém ferido. Uma mala e um cobertor.",
    answer: "entra",
    rule: "Revistado e limpo, entra antes do anoitecer.",
  },
  {
    id: "troca",
    who: "Um homem com um saco de batatas",
    ask: "Quer trocar comida por remédio.",
    found: "Esconde a mão na manga. A atadura está úmida.",
    answer: "espera",
    rule: "Ferida escondida espera do lado de fora até alguém de Haven examinar.",
  },
  {
    id: "atrasado",
    who: "Um viajante atrasado",
    ask: "Chama pelo nome de um morador depois do toque de recolher.",
    found: "Escuro demais para revistar. Atrás dele, a rua geme.",
    answer: "espera",
    rule: "Depois do toque de recolher, o portão não abre. Nem para quem chama pelo nome.",
  },
] as const;

/** Parte III: a retirada. Cada vez que o guarda segura o portão, entra um sobrevivente e a horda avança. */
export const RETREAT = { survivors: 4, distance: 6, approach: [1, 1, 1, 1, 2, 2] } as const;

// ---------- Portões de Military ----------

/** Parte I: o relatório da quadra. Marcar só onde há sinal de infecção. */
export const blockBuildings = [
  { id: "padaria", label: "Padaria", report: "Porta arrombada por dentro. Arranhões no vidro.", infected: true },
  { id: "escola", label: "Escola", report: "Doze famílias abrigadas. Pediram água ontem.", infected: false },
  { id: "farmacia", label: "Farmácia", report: "Silêncio de dia, batidas na porta à noite.", infected: true },
  { id: "oficina", label: "Oficina", report: "Vazia. O dono saiu com a família no primeiro dia.", infected: false },
  {
    id: "predio",
    label: "Prédio azul",
    report: "Janelas pregadas por dentro. Ninguém responde, alguém geme.",
    infected: true,
  },
  { id: "igreja", label: "Igreja", report: "Um idoso e o neto. Pedem notícias do posto.", infected: false },
] as const;

/** Parte II: o que fazer com as duas ordens. */
export const orderChoices = [
  {
    id: "evacuar",
    label: "Evacuar o posto agora",
    ok: false,
    reply: "A rua interna ainda tem civis. Sair agora é deixá-los atrás da barreira.",
  },
  {
    id: "barreira",
    label: "Manter a barreira e esperar",
    ok: false,
    reply: "A barreira fica de pé e prende os civis do lado de dentro.",
  },
  {
    id: "retirar",
    label: "Ficar até retirar os civis da rua interna",
    ok: true,
    reply: "O comandante fica. A última família passa a barreira antes do amanhecer.",
  },
] as const;

/** Parte III: o livro de estoque. A conta precisa fechar. */
export const ledger = [
  {
    id: "filtros",
    label: "Filtros",
    start: 12,
    entries: [
      { text: "Entregues à rua norte", delta: -4 },
      { text: "Trocados na barreira por notícias", delta: -3 },
      { text: "Recuperados de uma ambulância", delta: 2 },
      { text: "Quebrado na limpeza", delta: -1 },
    ],
  },
  {
    id: "doses",
    label: "Doses de soro",
    start: 3,
    entries: [
      { text: "Aplicada no cabo Prado (tentativa, registrada)", delta: -1 },
      { text: "Enviada junto com a amostra", delta: -1 },
    ],
  },
] as const;

/** Epílogo, depois das quatro pastas. */
export const epilogue = [
  "Quatro necessidades, quatro começos. Haven dividiu a água. Os Rovers mantiveram a estrada aberta. Os Wardens fecharam a linha. Military continuou contando filtros quando as ordens pararam.",
  "Por um tempo, essas necessidades se completaram: peças dos Rovers passavam pelo forte, Haven tratava feridos de todos os lados, e os postos ainda protegiam entregas.",
  "Depois veio a Noite da Cancela. Uma estrada aberta e uma estrada fechada não cabiam mais no mesmo mapa.",
  "O resto está no Arquivo 01. O seu Dia 1 começa depois disso.",
];
