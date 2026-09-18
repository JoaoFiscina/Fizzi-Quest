# Validação — v23.09.2003.13

Data: 17/09/2026. Ambiente: Windows, Node 24, Microsoft Edge headless via Playwright.

## Classificação e escopo

P2 — complexidade média. A entrega altera somente apresentação ambiental. Save, colisões, posições, velocidade, zoom, combate, recompensas, inventário e progressão permanecem iguais.

## Comandos executados

- `npm test`: 34 testes unitários e de integração de domínio aprovados.
- `npm run build`: TypeScript estrito e Vite concluídos; saída em `dist`.
- `npm run test:e2e`: 12 jornadas de navegador aprovadas.

O build mantém o aviso conhecido sobre comentários PURE no Zod e o chunk do Phaser (~332 KB gzip). A ambientação não adiciona bibliotecas; o JavaScript próprio passou de aproximadamente 52,7 KB para 54,6 KB gzip.

## Cobertura ambiental

- Registro único das animações compartilhadas de água, fogo, árvores, vegetação, bandeiras, folhas e poeira.
- Fases individuais diferentes entre objetos semelhantes.
- Intervalos, probabilidades e durações controlados por um único agendador por mapa.
- Máximo de dois ciclos simultâneos no modo normal.
- Troca real da vila para o bosque remove o timer antigo e mantém somente um timer ambiental.
- Reload e reconstruções não multiplicam sprites, animações ou timers.
- `prefers-reduced-motion` desativa folhas, poeira e ciclos não essenciais, usa limite de um efeito e reduz água/fogo.
- Efeitos ambientais usam sprites pré-criados e não criam objetos durante `update`.

## Regressão de gameplay e interface

- 34 testes preservam domínio, save, progressão, treino, combate, inventário e backup.
- Jornada E2E preserva movimento diagonal normalizado por teclado e toque.
- Zoom Afastado, Padrão e Próximo continua centralizado e persistente.
- Transição de mapa, colisões, encontros, compra, descanso, batalha, fuga e derrota continuam aprovados.
- Matriz visual continua cobrindo 1920×1080, 1366×768, 1024×768, 430×932 e 390×844.

## Inspeção visual

Foram inspecionados:

- vila parada e durante ciclo em 1366×768;
- bosque parado e durante ciclo em 1366×768;
- vila com movimento reduzido;
- vila em 390×844 com zoom afastado e ciclo ativo.

As capturas mantêm pixel art nítida, limites do mapa, HUD e direcional sem sobreposição. Os ciclos são discretos e não alteram a leitura quando parados. Evidências: `docs/evidence/v23.09.2003.13/`.

## Limites

- Viewport móvel em Edge não prova comportamento em Safari/iOS ou telefone Android físico.
- A preferência de movimento reduzido é lida ao criar a cena; uma mudança feita no sistema durante a sessão requer reload.
- Um ciclo ocasional pode não aparecer em qualquer captura isolada; os testes também verificam o estado ativo e o contador de ativações.
- Não foi feito ensaio longo de consumo de bateria em aparelho de entrada.
- Criaturas, ataques e mapa prévio permanecem reservados para `v23.09.2003.14`.
- A publicação da `v23.09.2003.13` depende da integração desta branch; a produção permanece em `v23.09.2003.12` neste registro.
