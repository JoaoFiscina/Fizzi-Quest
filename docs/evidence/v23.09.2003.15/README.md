# Evidências visuais da v23.09.2003.15

`before/` foi capturado na base v14 (`a069445` + documentação da v15, sem mudanças gráficas). `after/` foi capturado na implementação v15. Ambos usam save sintético, Edge headless, viewport 1366×768, zoom Afastado e movimento Reduzida para estabilizar a comparação estática. Os mesmos pares registram vila, bosque, bifurcação e mapa de regiões.

`after/mobile-world.png`, `after/map-mobile-top.png` e `after/map-mobile.png` mostram a emulação 390×844. A última imagem mostra a parte inferior do mapa rolável. Não representa teste físico em celular.

`after/monster-frames.png` reúne os quatro quadros de idle de Broto, Besouro, Mariposa e Guardião em ampliação inteira sem interpolação. `after/battle-beetle.png` e `after/battle-guardian.png` mostram as poses de carapaça e preparo. `after/monster-cadence.json` contém 31 amostras em intervalos de um segundo, com chave de textura, posição lógica e estado da animação de água/fogo.

Inspeção: as criaturas se separam melhor por forma; o mapa esclarece Vila → Bosque → Posto e reúne regiões futuras em uma faixa bloqueada. Caminhos e personagens permanecem legíveis na escala normal. O ganho de cenário é moderado; uma ampliação do mundo ou novos biomas não fazia parte desta entrega.
