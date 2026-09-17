export type TutorialTopic = {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
};

export const TUTORIAL_TOPICS: TutorialTopic[] = [
  {
    id: "defense",
    title: "Defesa e intenção inimiga",
    summary: "Quando defender e quanto dano a guarda reduz.",
    paragraphs: [
      "Defender age antes do inimigo, não custa Fôlego e reduz aproximadamente pela metade o ataque recebido naquela rodada. O valor é arredondado para cima.",
      "Leia a intenção acima dos comandos. O Besouro fecha a carapaça em rodadas alternadas; o Guardião prepara raízes antes do golpe mais forte. Defender no momento certo preserva Vida para as rodadas perigosas.",
    ],
  },
  {
    id: "stamina",
    title: "Fôlego e habilidades",
    summary: "Custos, recuperação e desbloqueios atuais.",
    paragraphs: [
      "Ataque normal e Defesa não gastam Fôlego. Golpe pesado custa 3, Corte veloz custa 2 e Impacto firme custa 4. Recuperar fôlego restaura até 4 pontos sem ultrapassar o máximo.",
      "Corte veloz é liberado no nível 2 e Impacto firme no nível 3. Subir de nível também concede pontos permanentes para distribuir nos atributos.",
    ],
  },
  {
    id: "attributes",
    title: "Atributos",
    summary: "O efeito de Força, Vigor, Agilidade e Fôlego.",
    paragraphs: [
      "Força aumenta o ataque. Vigor melhora Vida máxima e Defesa. Agilidade influencia a ordem do combate e a velocidade no mapa. Fôlego aumenta o recurso disponível para habilidades.",
      "A tela do personagem separa Base, Treinos, Pontos e Equipamentos para mostrar de onde vem cada valor.",
    ],
  },
  {
    id: "equipment",
    title: "Equipamentos e mochila",
    summary: "Slots, bônus e troca de peças.",
    paragraphs: [
      "Cada equipamento ocupa um slot: Arma, Escudo, Armadura ou Acessório. Broches e pingentes usam o slot de Acessório. Equipar uma peça substitui somente a peça do mesmo slot.",
      "Os bônus aparecem no cartão do item. Algumas peças fortes podem reduzir Agilidade, então compare os efeitos antes de equipar.",
    ],
  },
  {
    id: "training",
    title: "Treinos reais",
    summary: "Como transformar o treino em progressão segura.",
    paragraphs: [
      "Copie o modelo do Diário de treinos, envie à IA externa junto com seu treino e cole no jogo o JSON recebido. A prévia não altera o save.",
      "O Fizzi Quest recalcula confiança, aplica limites por sessão e por dia e bloqueia duplicatas antes de conceder XP, ouro e atributos.",
    ],
  },
  {
    id: "exploration",
    title: "Exploração e controles",
    summary: "Movimento, interação, descanso e progresso.",
    paragraphs: [
      "Use WASD ou as setas para mover e E ou Espaço para interagir. No celular, use o direcional e o botão contextual. Esc fecha menus.",
      "A fogueira recupera Vida e Fôlego e faz criaturas comuns retornarem. Derrotas não apagam treino, equipamentos, XP, ouro ou materiais.",
    ],
  },
];
