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
      "Antes do seu Dia 1: a primeira ficha, a cidade que parou, três maneiras de sobreviver e a noite da cancela.",
    acts: 5,
    minutes: 6,
    cover: "/images/lore/cover.png",
  },
  { sealed: true, code: "Arquivo 02" },
  { sealed: true, code: "Arquivo 03" },
];

export type Act = {
  id: string;
  numeral: string;
  title: string;
  when: string;
  image: string;
  /** Cenas curtas que aparecem com a rolagem, antes do documento do ato. */
  scenes: string[];
  /** A frase do ato, em destaque. */
  quote: string;
  /** Anotação à mão da enfermeira, na margem do caderno. */
  note: string;
  /** Cenas depois do documento. */
  after: string[];
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
      title: "Os nomes na lista",
      when: "Antes de a cidade admitir que havia uma epidemia",
      image: "/images/lore/ato-1.png",
      scenes: [
        "A primeira anotação não dizia “morto”. Dizia febre, confusão, ferida no antebraço. Era um plantão ruim, mas ainda era um plantão reconhecível.",
        "O paciente morreu antes de conseguir um leito. Quando a enfermeira voltou com o lençol, o corpo estava sentado. Agarrou o punho do auxiliar e não soltou nem depois de cair da maca.",
      ],
      quote: "Movimento após declaração de óbito.",
      note: "quem avisou os outros bairros?",
      after: [
        "Naquela noite, dois bairros sem contato com o paciente relataram o mesmo. Era o primeiro caso que ela podia provar, não o primeiro do mundo.",
        "A ordem de isolamento chegou quando a sala de isolamento já não tinha porta. O transporte especializado nunca veio. Na evacuação, a enfermeira levou um caderno de triagem com os nomes da lista.",
      ],
      trace:
        "A ficha do caso mais antigo da região e a ordem de isolamento: provam que o atendimento falhou antes do apagão. Não revelam paciente zero nem cura.",
    },
    {
      id: "ato-2",
      numeral: "II",
      title: "A cidade que parou",
      when: "As primeiras ondas de evacuação e as semanas de abandono",
      image: "/images/lore/ato-2.png",
      scenes: [
        "A cidade não caiu de uma vez. Os ônibus passaram a sair cheios e voltar vazios. Depois deixaram de voltar.",
        "Um caminhão atravessado para manter um corredor livre às ambulâncias virou parede de metal quando os infectados chegaram pelo cruzamento.",
        "O rádio ainda dava instruções. Nem todas eram falsas; o problema é que perdiam a validade antes de chegar ao próximo bairro.",
      ],
      quote: "Nem toda parede caída foi derrubada por infectados.",
      note: "faltam: gaze, água limpa, luz, descanso",
      after: [
        "Bombas d'água pararam por falta de gente. Prédios queimaram sem pressão nas mangueiras. Postos militares ergueram barreiras: alguns salvaram quarteirões, outros fecharam saídas quando mais se precisava delas.",
        "As ruínas que você vai encontrar nasceram dessa soma. A cidade também foi destruída pelas tentativas de continuar funcionando.",
      ],
      trace:
        "Uma rota de evacuação riscada no mapa leva a carros engavetados e a um posto ainda legível. As ruínas são mais velhas que o seu Dia 1.",
    },
    {
      id: "ato-3",
      numeral: "III",
      title: "Três maneiras de sobreviver",
      when: "Depois que evacuar deixou de ser uma promessa crível",
      image: "/images/lore/ato-3.png",
      scenes: ["Sem evacuação, sobreviver virou três respostas à mesma pergunta: como manter alguém vivo até amanhã?"],
      quote: "Água, caminho, portão.",
      note: "água, caminho, portão",
      after: [
        "Os três chegaram a cooperar. Os Rovers traziam peças e notícias, os Wardens abriam a passagem em horários seguros, Haven recebia os feridos dos dois lados.",
        "Os remanescentes Military ainda mantinham postos e quarentenas, mas não comandavam ninguém. O uniforme não transformava uma facção civil em braço do exército.",
      ],
      trace:
        "O caderno de Haven, um ônibus adaptado e a lista de turnos do forte: origens diferentes, ajuda real e custos reais em cada grupo.",
    },
    {
      id: "ato-4",
      numeral: "IV",
      title: "A noite da cancela",
      when: "Depois de Haven, Rovers e Wardens; antes do seu Dia 1",
      image: "/images/lore/ato-4.png",
      scenes: [
        "Um comboio Rover levava filtros, remédios e combustível para Haven. Num dos carros, uma criança com febre. Na travessia dos Wardens, a cancela não abriu.",
        "O rádio do posto falhou. A triagem não veio. No escuro, infectados se juntavam na estrada. Alguém disparou.",
      ],
      quote: "Nenhum grupo venceu; ambos aprenderam a esperar o pior do outro.",
      note: "duas linhas rasgadas. para onde foram os filtros?",
      after: [
        "A criança chegou viva a Haven. O caderno não diz quem a carregou até lá.",
        "Haven tratou feridos dos dois lados e se recusou a chamar a enfermaria de tribunal.",
      ],
      trace:
        "Ordem de retenção Warden, manifesto Rover incompleto e registro médico de Haven: três versões do mesmo incidente.",
    },
    {
      id: "ato-5",
      numeral: "V",
      title: "Antes do primeiro dia",
      when: "O intervalo final antes de você chegar",
      image: "/images/lore/ato-5.png",
      scenes: [
        "Com as rotas divididas, a cidade ficou maior. Um posto Military ainda respondia pelo rádio; outro repetia a chamada de uma semana atrás. Parte dos soldados largou o uniforme. Parte o manteve para cobrar passagem: os desertores.",
        "Saqueadores tomaram cruzamentos, depósitos e antenas. Bastava um nome pintado na parede.",
      ],
      quote: "Velas, grades, ossos. Os sobreviventes os chamam de The Hollow.",
      note: "três caminhos até a cidade",
      after: [
        "Entre um território e outro, os infectados nunca deixaram de existir: lentos, corredores, rastejantes, alguns ainda presos ao equipamento militar. Um disparo basta para mudar uma rua.",
        "Na última folha do caderno, a enfermeira desenhou três caminhos até a cidade.",
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
      "Um poço atrás de casas ainda de pé. Os vizinhos o defendiam com uma regra: quem bebe ajuda a buscar mais. Viraram enfermaria, horta e um nome para indicar no rádio.",
    cost: "Nunca houve espaço para todos do lado de dentro da paliçada.",
  },
  {
    word: "Caminho",
    faction: "Rovers",
    origin:
      "Motoristas, mecânicos e batedores trocando peças por rotas e combustível por mapas corrigidos. Um ônibus grande demais para as ruas virou oficina e abrigo.",
    cost: "Às vezes vendiam caro. Às vezes levavam remédio a quem não tinha nada.",
  },
  {
    word: "Portão",
    faction: "Wardens",
    origin:
      "Guardas e voluntários que seguraram uma linha quando ninguém sabia para onde evacuar. Muralhas, turnos, revistas e permissões de trânsito.",
    cost: "Dentro da muralha, era proteção. Do lado de fora, a espera tinha outro nome.",
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
