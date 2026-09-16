# Validação — v23.09.2003.10

Data: 15/09/2026. Ambiente: Windows, Node 24, Microsoft Edge headless via Playwright.

## Comandos executados

- `npm test`: 34 testes unitários e de integração de domínio aprovados.
- `npm run build`: TypeScript estrito e Vite concluídos; saída em `dist`.
- `npm run test:e2e`: 8 testes aprovados para jornada, toque, combate, animações e matriz visual (1,1 min na execução final).

O build emite avisos sobre comentários PURE no Zod e tamanho do bundle do Phaser (~332 KB gzip). Não são erros de compilação.

## Cobertura

- Formato de IA válido, JSON/data inválidos e redução de confiança sem evidências.
- Limites por sessão e por dia, retornos decrescentes e redução proporcional exata de atributos.
- Aplicação e persistência de XP, ouro e atributos; duplicata por ID ou conteúdo bloqueada.
- Migração de save antigo preservando progresso, ouro, arma, escudo e armadura.
- Fixture original: revisão obrigatória, 78 pontos e volume conferido de 2540 kg.
- Limite diário, arredondamento, ordem invertida, aquecimento e carga ausente.
- Rejeição de JSON/versão/data/número inválidos e limite de exercícios.
- Duplicata, edição e remoção com recálculo, backup válido e inválido, falha de quota.
- Combate: defesa prioritária, morte antes da ação, preparo sem dano, habilidades sem recursos, loot único, cura limitada, ordem dos eventos.
- Rotas e pontos interativos alcançáveis; spawn seguro e paredes bloqueadas.
- UI: modelo da IA → JSON → prévia → confirmação → histórico → personagem → reload persistente.
- UI: jornada antiga → bosque → Broto → recompensa → retorno → backup → remoção → restauração.
- UI: compra de poção e descanso; continuação de batalha salva; reload durante animação e vitória sem recompensa duplicada.
- UI: fuga, derrota e redimensionamento durante efeito.
- UI: mapa prévio com três regiões bloqueadas, câmera com padding simétrico, loja compacta e HUD de recursos.

## Inspeção visual

Capturas da vila continuam cobertas em 1920×1080, 1366×768, 1024×768, 430×932 e 390×844. As novas telas de treino e personagem foram verificadas em desktop e em 390×844. A evidência final desta versão fica em `docs/evidence/v23.09.2003.10/`; os testes também geram cópias descartáveis em `test-results/`.

## Limites

- Viewport móvel em Edge não prova comportamento em Safari/iOS ou telefone físico.
- Não foi feito ensaio de performance em aparelho de entrada ou sessão longa.
- Missão completa do chefe, baú e guilda ainda precisam de E2E dedicado.
- Teste de fuga teve inicialmente uma falha no fixture: o save automático de saída substituía o estado inserido com a página ativa. O cenário passou a preparar o save na tela inicial.
- A PR `#2` foi integrada à `main` no commit `30b3323`. A Vercel concluiu o deployment e a URL fixa respondeu `HTTP 200`; o bundle servido contém `v23.09.2003.10`.
