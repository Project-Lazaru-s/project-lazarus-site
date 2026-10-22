export type System = {
  id: string;
  title: string;
  /** Mod Lazarus responsável, quando houver (slug de content/mods). */
  mod?: string;
  /** Sprite em pixel art de public/images/game. */
  icon: string;
  points: string[];
};

export const systems: System[] = [
  {
    id: "infectados",
    icon: "/images/game/zombie-front.png",
    title: "Infectados e hordas",
    points: [
      "Walkers, runners, crawlers e especiais, além de zumbis vestidos por profissão: civil, policial, bombeiro, operário, hospitalar, militar e SWAT.",
      "Cabeça e corpo separados: tiro na cabeça mata.",
      "Eles ouvem, farejam sangue, seguem a luz e arrombam portas.",
      "Hordas periódicas a partir do dia 10, cada uma 15% maior que a anterior.",
      "Infecção por mordida em 4 estágios; antibióticos curam.",
      "Ninhos de pústulas geram infectados e cercam zonas infestadas.",
    ],
  },
  {
    id: "furtividade",
    icon: "/images/game/survivor-crouch.png",
    title: "Furtividade",
    mod: "stealth",
    points: [
      "Postura, cobertura, luz, peso e barulho decidem se um zumbi te percebe.",
      "Passos em vidro ou metal fazem mais barulho que na grama.",
      "Tiros atraem infectados de longe; silenciadores reduzem o alcance.",
      "Sua voz no Simple Voice Chat vira ruído no jogo. Fale baixo.",
      "Finalização furtiva por trás e ícone de detecção no HUD.",
    ],
  },
  {
    id: "sobrevivencia",
    icon: "/images/game/water-can.png",
    title: "Sobrevivência",
    points: [
      "Sede e temperatura; o calor extremo cobra água, não vida.",
      "Saúde por partes do corpo, sangramento, perna quebrada e dor.",
      "Comida que estraga e dieta.",
      "Água de rio, poça ou caldeirão pode causar disenteria. Água engarrafada ou enlatada é segura.",
      "Stamina, peso, rastejar e escalar.",
      "Reviva aliados; ao morrer, seu corpo guarda o inventário.",
    ],
  },
  {
    id: "mente",
    icon: "/images/game/moodle-fear.png",
    title: "Mente: os moodles",
    mod: "moodles",
    points: [
      "Medo (Tense → Fearful → Panicked): tremor na mira, coração acelerado, visão escurecendo.",
      "Dor: gemidos, zumbido no ouvido, mira instável. Analgésicos aliviam.",
      "Exaustão: piscadas, microcochilos, menos stamina.",
      "Alívio depois de escapar de um susto, com bônus temporários.",
      "Sedativos zeram o medo por 3 minutos e depois cobram abstinência e tolerância.",
    ],
  },
  {
    id: "humanos",
    icon: "/images/game/trader-rovers.png",
    title: "Humanos e facções",
    mod: "npcs",
    points: [
      "Sobreviventes com profissão, skins próprias e equipamento.",
      "Facções com reputação de -100 a +100.",
      "Trocas, diálogos, missões e um diário com a localização das tarefas.",
      "NPCs atiram com armas reais, usam cobertura, flanqueiam e se rendem.",
      "Desça demais na reputação e caçadores de recompensa vêm atrás de você.",
    ],
  },
  {
    id: "eventos",
    icon: "/images/game/radio.png",
    title: "Eventos no mapa",
    mod: "events",
    points: [
      "Anunciados por rádio no chat, com coordenadas aproximadas.",
      "Resgates, última defesa, falso sinal de rádio, sinalizadores e comboios.",
      "Quedas de helicóptero e zonas de gás em espaços fechados e no metrô.",
      "Quarentenas militares, ninhos, esconderijos de gangues e covis do Hollow.",
      "Bases das facções com expedições e escaramuças entre rivais.",
    ],
  },
  {
    id: "mundo",
    icon: "/images/game/chest-closed.png",
    title: "Mundo",
    points: [
      "Cidades inteiras geradas pelo CityWorld: prédios, metrô, ruas.",
      "Saque realista por local: hospital, farmácia, delegacia, mercado.",
      "O saque diminui com os dias.",
      "Veículos abandonados com combustível e peças para consertar.",
      "Mapas de papel com anotações à mão e GPS.",
      "Escuridão real à noite, som 3D com eco e chuva com partículas.",
    ],
  },
];

export type SkillTree = { name: string; idea: string };

export const skillTrees: SkillTree[] = [
  {
    name: "Sobrevivência",
    idea: "1 nível por dia ativo; ramos de temperatura, corpo, imunidade e stamina. Zera ao morrer. Topo exclusivo: Nômade ou Entrincheirado.",
  },
  {
    name: "Ofícios: Armeiro, Cutelaria, Blindagem, Gambiarra",
    idea: "Itens fabricados com qualidade, reparo e desmonte.",
  },
  {
    name: "Armeiro (armas)",
    idea: "Toda arma de fogo e todo acessório precisam de nível: pistolas → SMG/espingardas → fuzis/precisão → metralhadoras → lançadores.",
  },
  {
    name: "Corpo a corpo",
    idea: "Ramos de armas contundentes e de lâmina; exclusivas Brutamontes ou Esgrimista.",
  },
  { name: "Armas de fogo", idea: "Recuo, recarga, disciplina." },
  { name: "Medicina", idea: "Hemostasia, cirurgião." },
  {
    name: "Negociação",
    idea: "Barganha, pechincha, diplomata, intimidar, comandante.",
  },
  {
    name: "Mecânica",
    idea: "Consertar veículos, funilaria, ligação direta, economia de combustível.",
  },
  { name: "Furtividade", idea: "Do Lazarus Stealth." },
  {
    name: "Coragem",
    idea: "Do Lazarus Moodles: resistir ao medo e ao pânico.",
  },
];
