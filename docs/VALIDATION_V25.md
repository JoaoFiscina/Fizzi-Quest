# Validação — v23.09.2003.25 (Golpe Certeiro)

Etapa 2 do `context/PLANO_MELHORIA_GERAL.md`: impacto do combate. Branch `feat/v25-impacto-combate` sobre a main com a v24 publicada (`93fa5a0`). Somente apresentação: `act()`, dano, ordem de turno, recompensas e formato de save não mudaram.

## Invariante preservada

`resolveRound` continua chamando `store.transact` (resolução + persistência) antes de `battleFeedback`. A apresentação só lê `CombatEvent[]`; números e barras do palco usam os valores dos eventos e voltam ao estado salvo em `sync()` no fim. O E2E existente "rodada salva antes da animação, reload sem duplicação" continua cobrindo reload no meio da animação.

## O que mudou

| Item | Antes | Agora |
|------|-------|-------|
| Entrada | Corte seco para o palco | Clarão + mosaico de blocos que se desfaz a partir do inimigo (~380 ms); herói e inimigo deslizam para a posição. Só em encontro novo/save retomado (`enterBattle`), não em resize ou ao fechar modal |
| Saída | Reconstrução imediata do mapa | Fade de 180 ms antes de reconstruir; fallback de 450 ms se o laço estiver pausado |
| Golpe | Avanço, flash branco e número em Arial | Avanço, pausa de impacto 65 ms (pesado 90), tremor de câmera, recuo do alvo, 6–8 partículas na cor da criatura, número em fonte pixel 5×7 gerada no código com "pop" |
| Vida do inimigo | Só no painel DOM | Também no palco, com faixa fantasma e cor por faixa de vida |
| Barras DOM | Saltavam (recriadas a cada render) | Lembram o valor anterior por chave e animam; faixa fantasma mostra a perda |
| Herói | Quadro fixo de costas, sempre masculino | Idle de costas (2 quadros), passo no ataque e aparência do save |
| Avisos | "CARAPAÇA" sobrepunha "PREPARA" | Aviso de intenção some durante a animação; textos flutuantes empilham sem sobrepor |
| Log | Linhas da rodada sem destaque | Linhas novas entram com fade; a última fica em destaque |
| Teclado | Nenhum atalho | 1–5 (e A/H/D/I/F) no menu principal, dígitos + Esc nos submenus, Enter em "Voltar à aventura"; dica visual escondida em telas de toque e fora do nome acessível |
| Aviso de boas-vindas | Ficava sobre o painel de combate no celular | Some ao iniciar a batalha |

Movimento reduzido: sem mosaico, tremor, pausa, partículas, faixa fantasma ou animação de log; números aparecem e somem rápido.

## Verificações executadas

- `npm test`: **66/66**.
- `npm run build`: aprovado (aviso de chunk do Phaser já existente).
- `npm run test:e2e` completo (11,1 min): **37/38**; a falha era uma corrida no próprio teste novo de movimento reduzido (o número de dano ainda terminava o fade de 160 ms quando o botão reabilitava). Corrigido para aguardar o fade; `v25.spec` rodado 3× seguidas: **6/6**. Os demais 36 testes passaram nessa execução completa sem alteração.
- `v25.spec`: aparência feminina no palco; mosaico removido após a entrada; aviso limpo; atalho `a` resolve a rodada e salva `round 2`; número pixel e faixa fantasma presentes; rodada medida em **907 ms** do toque ao botão reabilitado (inclui latência do Playwright); `2` abre habilidades e `Esc` volta; vitória e `Enter` saem com fade e o mundo volta a aceitar movimento. Movimento reduzido no 390×844: nenhum objeto temporário sobra no palco e o herói usa o quadro estático.
- Capturas inspecionadas (1366×768 e 390×844): entrada no meio do mosaico, golpe com "-8" e faixa fantasma no palco e no painel, segundo golpe com "-4" sobre a heroína.

## Evidências

`docs/evidence/v23.09.2003.25/after/`: `battle-ready-1366.png`, `battle-hit-1366.png`, `after-exit-1366.png`, `battle-reduced-390.png` e as capturas regeneradas do Diário/atualização. Viewport emulado; nenhum teste em aparelho físico.

## Limites

- A dica de atalho some via `pointer: coarse`; em viewport emulado de celular sem toque ela aparece.
- O fundo do palco ainda é o da versão anterior (retângulos + árvores tingidas); é a etapa 4 do plano.
- Tremor e pausa não foram medidos em celular físico.
- Publicação registrada na seção abaixo.

## Publicação confirmada — 19/11/2026

PR #18 integrado na main (merge `dfe2af3`). Checks Vercel aprovados. `https://fizzi-quest.vercel.app/version.json` respondeu `v23.09.2003.25`; o domínio oficial abriu com título `Fizzi Quest · v23.09.2003.25` e sem erros no console. Smoke test público, sem repetir a bateria completa em produção nem entrar em batalha no domínio.
