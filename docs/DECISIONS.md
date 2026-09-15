# Decisões — v23.09.2003.2

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
