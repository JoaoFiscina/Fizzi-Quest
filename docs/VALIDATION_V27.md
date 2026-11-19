# Validação — v23.09.2003.27 (Criaturas do Bosque)

Pedido do jogador logo após a v26: refazer a estética dos monstros, considerados simples demais. Branch `feat/v27-monstros` sobre a main com a v26 publicada. Só arte: nomes de textura, tamanhos (32×32 e 48×52), poses, dano, intenções e save não mudaram.

## O que mudou

| Criatura | Antes | Agora |
|----------|-------|-------|
| Broto Errante | Bloco com duas folhas retangulares | Bulbo arredondado com barriga clara, caule e duas folhas afiladas com nervura que balançam em ângulo; pés de raiz; olhos grandes com brilho e bochechas. Ataque com folhas erguidas, sobrancelhas e boca aberta; dano com olhos fechados (> <), corpo amassado e lágrima |
| Besouro de Pedra | Retângulos cinza | Carapaça de pedra abaulada com junta central, rachaduras e musgo; cabeça de pedra com chifres curtos, olhos âmbar e mandíbulas; pernas articuladas que alternam; piscada e respiração no idle. Carapaça abaixada com brilho nas bordas e olhos espiando; ataque com mandíbulas abertas e olhos acesos; dano com lasca e rachadura |
| Mariposa da Névoa | Duas asas retangulares | Corpo felpudo com gola, segmentos e antenas plumosas; asas superiores e inferiores com manchas-olho azul-petróleo e dourado. Batida em quatro tempos (fechada, aberta, meia, aberta com antena) e poses de asa dobrada e erguida; poeira de névoa no ataque |
| Guardião de Musgo | Retângulos verdes | Golem de pedra com capa de musgo que escorre, muda com flor no topo, rosto oco com sobrancelha de pedra e olhos dourados, runa no peito; braços em blocos chanfrados com nós dos dedos. Preparo com braços erguidos e runa brilhando; ataque com punhos abaixados e base larga; guarda com braços cruzados; dano com olhos apagados e lascas |

Todas as poses passam pelo contorno automático da v26 e usam a paleta registrada, com tons intermediários.

## Verificações executadas

- `v27.spec` (novo):
  - Gera `monster-sheet.png` com os 8 quadros de cada criatura.
  - Exige contorno nas 4 criaturas e pelo menos 6 quadros diferentes por criatura (os quadros de idle e as poses, entre 8 no total).
  - Mostra o palco de combate de cada criatura sem erros de página.
- `npm test`: **66/66**. Na primeira rodada, 65/66: o teste do Diário compara as notas com `HISTORICO_VERSOES.md`, que ainda não tinha a entrada da v27. Depois de atualizado, passou 3 vezes seguidas.
- `npm run build`: aprovado.
- `npm run test:e2e` completo (6,4 min): **46/46**, sem repetições.

## Evidências

`docs/evidence/v23.09.2003.27/after/`: `monster-sheet.png`, `battle-sprout-1366.png`, `battle-beetle-1366.png`, `battle-moth-1366.png`, `battle-guardian-1366.png` e as capturas regeneradas pelos specs recentes. Viewport emulado; nenhum teste em aparelho físico.

## Limites

- Fundo do palco de combate continua o da etapa anterior (etapa 4 do plano).
- As poses de guarda e preparo do Broto reaproveitam o idle (o domínio nunca as usa).
- Não publicado.
