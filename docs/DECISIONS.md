# Decisões — v23.09.2003.5

## Refinamento Visual (v23.09.2003.5)

### Sprite do herói
- Aumentado de 3 para 5 frames por direção (frame 0 = idle; frames 1–4 = ciclo completo de passada).
- Altura do canvas aumentada de 28 para 30 px para acomodar a sombra de contato no chão (elipse escura em y=28–29), sem alterar o grid de colisão.
- Braços passam a alternar de forma independente das pernas (armL/-R contrapostos), imitando caminhada real.
- Mais detalhe de volume: contorno escuro explícito na cabeça, reflexo claro e sombra lateral no casaco, bochechas.
- Sobrance lha fina adicionada para direcionamento visual.
- NPCs (mestre, mercador) seguem o mesmo padrão para coerência.

### Animações
- `idle` desacelerou de 2 para 1.5 fps (respiração mais credível).
- `walk` usa agora os 4 frames distintos (1→2→3→4) sem repetir o frame 0 como divisor; frameRate 5 ≈ 64 px/s em sincronia com a velocidade base do jogador.

### HUD e modais
- Ícones de recursos diferenciados: 🪙 ouro, ◈ materiais, ⬡ poções — silhuetas distintas sem depender apenas de cor.
- Botão Fechar redesenhado: fundo #2a5448 com borda sutil, sem o outline amarelo que competia com o tom de recompensa.
- Botão "Alocar +1" recebe classe `alloc-btn` e cor verde-ativa (#3b6e58) quando disponível; desativado volta ao opaco padrão.
- Botão "Equipado" recebe classe `equipped-state`: verde escuro (#2e5a3a) e texto verde-claro, lido imediatamente como "já concluído", não "bloquedo".
- Divisores entre atributos trocados de linha cinza sólida por pontilhado `repeating-linear-gradient` na paleta paper/dourado.
- D-pad: leve gradiente, box-shadow de 3 px e :active rebaixa 2 px para dar feedback tátil sem mudar layout.
- Nav buttons: padding ligeiramente aumentado e border-color integrada à paleta verde.

## Decisões anteriores


## Preservação e arquitetura

O projeto existente foi estendido, sem substituir seus sistemas. `Store` continua responsável pelas transações e save v1. `act()` retorna eventos de apresentação em ordem de resolução; esses eventos são efêmeros e não são armazenados como comandos reaplicáveis.

`main.ts` resolve e persiste antes de chamar `BattlePresentation.play()`. Uma cópia visual do save anima barras; ela nunca escreve de volta no estado do domínio. Recarregar mostra o estado definitivo. Redimensionar destrói a apresentação antiga e resolve suas esperas pendentes para não prender os botões.

## Arte e tela

Mantidos tiles de 16 px e tamanhos das texturas existentes. Assets gerados em código, com detalhes adicionados em `polishArt.ts`; texturas ambientais têm quatro quadros. Sprites de monstros oscilam visualmente sem mudar as entidades usadas para interação.

O combate usa composição distinta para desktop e vertical, deixando os atores fora do painel de comandos. O mapa usa escala inteira suficiente para preencher a tela, e o cenário e os objetos têm camadas separadas.

## Versão e continuidade

`src/version.ts` é a fonte da versão pública. A versão do jogo não obriga migração do save. O índice principal é `context/README.md`; `contexto/README.md` apenas aponta para ele. `AGENTS.md` pede leitura desses registros e atualização das evidências por entrega.

## Próximo passo concreto

Validar a jornada do chefe → emblema → guilda e suas recompensas únicas, antes de ampliar conteúdo. Depois completar posto de vigia, atalho e arte dos monstros secundários. Não há deployment nem repositório remoto confirmado.
