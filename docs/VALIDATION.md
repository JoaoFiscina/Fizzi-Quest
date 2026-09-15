# Validação — v23.09.2003.4

Data: 15/09/2026. Ambiente: Windows, Node 24, Microsoft Edge headless via Playwright.

## Comandos executados

- `npm test`: 28 testes unitários e de integração de domínio aprovados.
- `npm run build`: TypeScript estrito e Vite concluídos; saída em `dist`.
- `npm run test:e2e`: 6 testes de navegador aprovados (1,5 min na execução final).

O build emite avisos sobre comentários PURE no Zod e tamanho do bundle do Phaser (~332 KB gzip). Não são erros de compilação.

## Cobertura

- Fixture original: revisão obrigatória, 78 pontos e volume conferido de 2540 kg.
- Limite diário, arredondamento, ordem invertida, aquecimento e carga ausente.
- Rejeição de JSON/versão/data/número inválidos e limite de exercícios.
- Duplicata, edição e remoção com recálculo, backup válido e inválido, falha de quota.
- Combate: defesa prioritária, morte antes da ação, preparo sem dano, habilidades sem recursos, loot único, cura limitada, ordem dos eventos.
- Rotas e pontos interativos alcançáveis; spawn seguro e paredes bloqueadas.
- UI: importação → revisão → bosque → Broto → recompensa → retorno → reload → backup → remoção → restauração.
- UI: compra de poção e descanso; continuação de batalha salva; reload durante animação e vitória sem recompensa duplicada.
- UI: fuga, derrota e redimensionamento durante efeito.
- UI: mapa prévio com três regiões bloqueadas, câmera com padding simétrico, loja compacta e HUD de recursos.

## Inspeção visual

Capturas de vila, formulário e batalha inspecionadas em 1366×768 e 390×844. Cópias em `docs/evidence/v23.09.2003.2/`. Testes geram novas capturas em `test-results/` (ignorado pelo Git).

## Limites

- Viewport móvel em Edge não prova comportamento em Safari/iOS ou telefone físico.
- Não foi feito ensaio de performance em aparelho de entrada ou sessão longa.
- Missão completa do chefe, baú e guilda ainda precisam de E2E dedicado.
- Teste de fuga teve inicialmente uma falha no fixture: o save automático de saída substituía o estado inserido com a página ativa. O cenário passou a preparar o save na tela inicial.
- GitHub sincronizado em `JoaoFiscina/Fizzi-Quest` na branch `main`; Vercel ainda aguarda o primeiro deployment de produção.
