export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  changes: string[];
};
// Catalog of implemented deliveries, newest first. Never add planned features here.
export const releaseNotes: readonly ReleaseNote[] = [
  {
    version: "v23.09.2003.23",
    date: "01/10/2026",
    title: "Passo Ágil e Diário da Jornada",
    changes: [
      "Velocidade base cresce com Agilidade até 100 px/s. Impulso pode ultrapassar esse teto.",
      "Diário de versões nos Ajustes, com histórico das entregas e destaque da versão instalada.",
    ],
  },
  {
    version: "v23.09.2003.22",
    date: "01/10/2026",
    title: "Guardião Errante",
    changes: [
      "Após vencer o Guardião original, descansar pode trazer uma aparição rara que patrulha o bosque.",
      "Aparição e derrota ficam salvas; missão e emblema não se repetem.",
    ],
  },
  {
    version: "v23.09.2003.21",
    date: "01/10/2026",
    title: "Bosque em Movimento",
    changes: [
      "Monstros comuns caminham em pequenas áreas e trocam pontos de repouso ao descansar.",
    ],
  },
  {
    version: "v23.09.2003.20",
    date: "26/09/2026",
    title: "Campo de Testes",
    changes: [
      "Modo DEV23 permite testar XP, ouro e atributos em uma cópia separada da aventura.",
    ],
  },
  {
    version: "v23.09.2003.19",
    date: "26/09/2026",
    title: "Botas e Impulso da Trilha",
    changes: [
      "Botas e habilidade ativa de velocidade liberadas no nível 5; Impulso custa 1 fôlego e cresce a cada cinco níveis.",
    ],
  },
  {
    version: "v23.09.2003.18",
    date: "26/09/2026",
    title: "Jogo Sempre Atual",
    changes: [
      "Aviso e botão para atualizar preservando o progresso; explicação e escolha das animações no aparelho.",
    ],
  },
  {
    version: "v23.09.2003.17",
    date: "26/09/2026",
    title: "Anel e Treino Compacto",
    changes: [
      "Anel no nível 4, resposta curta de treino por IA e bônus limitado de recordes pessoais.",
    ],
  },
  {
    version: "v23.09.2003.16",
    date: "26/09/2026",
    title: "Força do Treino",
    changes: [
      "Treinos passam a favorecer atributos e conceder menos XP, mantendo sua contribuição em níveis altos.",
      "Habilidades explicam custos e próximos desbloqueios.",
    ],
  },
  {
    version: "v23.09.2003.15",
    date: "26/09/2026",
    title: "Identidade do Bosque",
    changes: [
      "Cenários e monstros refinados, poses de combate próprias e mapa regional reorganizado.",
    ],
  },
  {
    version: "v23.09.2003.14",
    date: "26/09/2026",
    title: "Água, Fogo e Brisa",
    changes: [
      "Água e fogo contínuos, brisas ocasionais e preferência de movimento persistente.",
    ],
  },
  {
    version: "v23.09.2003.13",
    date: "17/09/2026",
    title: "Ambientação do Terreno",
    changes: [
      "Detalhes ambientais de água, vegetação e fogo; base das melhorias de continuidade da v14.",
    ],
  },
  {
    version: "v23.09.2003.12",
    date: "17/09/2026",
    title: "Caminhos Diagonais",
    changes: [
      "Movimento em oito direções, controles diagonais e poses coerentes com a caminhada.",
    ],
  },
  {
    version: "v23.09.2003.11",
    date: "17/09/2026",
    title: "Mochila e Manual",
    changes: [
      "Itens agrupados e identificados por tipo; tutorial consultável com explicação de Defesa.",
    ],
  },
  {
    version: "v23.09.2003.10",
    date: "15/09/2026",
    title: "Treino à Aventura",
    changes: [
      "Modelo de análise por IA, revisão dos ganhos antes de importar e ficha detalhada do personagem.",
    ],
  },
  {
    version: "v23.09.2003.9",
    date: "15/09/2026",
    title: "Retorno à Trilha",
    changes: [
      "Restauração visual do terreno, personagens, ambientação e HUD de equipamentos.",
    ],
  },
  {
    version: "v23.09.2003.8",
    date: "15/09/2026",
    title: "Visual Essencial",
    changes: [
      "Retorno à referência visual, com sprites mais limpos e HUD compacto.",
    ],
  },
  {
    version: "v23.09.2003.6",
    date: "15/09/2026",
    title: "Vida em Pixels",
    changes: [
      "Ciclos do aventureiro e monstros, menus e barras de vida/fôlego reorganizados.",
    ],
  },
  {
    version: "v23.09.2003.4",
    date: "15/09/2026",
    title: "Equipar e Explorar",
    changes: [
      "Slots de escudo e armadura, velocidade por Agilidade e variação dos pontos de encontro.",
    ],
  },
  {
    version: "v23.09.2003.3",
    date: "15/09/2026",
    title: "Mapa e Enquadramento",
    changes: [
      "Mapa centralizado, regiões futuras bloqueadas, loja compacta e HUD revisado.",
    ],
  },
  {
    version: "v23.09.2003.2",
    date: "15/09/2026",
    title: "Primeiro Polimento",
    changes: [
      "Versão visível, HUD móvel, ciclos ambientais e apresentação do combate salvo.",
    ],
  },
  {
    version: "v23.09.2003.1",
    date: "14/09/2026",
    title: "A Trilha Esquecida",
    changes: [
      "Primeiro ciclo de treino, exploração, combate, equipamentos, missão e progresso salvo.",
    ],
  },
];
