# Validação — v23.09.2003.21

## Escopo

Patrulha de Broto, Besouro e Mariposa no bosque, interação na posição atual, troca determinística e persistida dos pontos de repouso a cada descanso. Guardião fixo; combate, recompensas, sprites e cadências ambientais preservados. A versão oficial é a v21 após integração e verificação em 01/10/2026.

## Verificações

- `npm test`: **51/51 aprovados**; inclui ciclos, caminhabilidade, raio, permutação e regressão de regras.
- `npm run build`: TypeScript e Vite aprovados.
- `npm run test:e2e`: **28/29 aprovados** na execução completa; o único erro foi uma expectativa antiga do teste de atualização (`v21` em vez de `v22`). Corrigida a expectativa, o cenário falho passou isoladamente. Assim, os **29 cenários** têm resultado aprovado no código final; não houve nova execução completa após a correção apenas do teste.
- Evidências em [`evidence/v23.09.2003.21/`](evidence/v23.09.2003.21/).

Na amostra de 30 segundos, Broto ocupou 19 posições, Besouro 17, Mariposa 13 e Guardião permaneceu em uma; água/fogo continuaram ativos. As capturas foram inspecionadas: bosque e HUD permanecem legíveis em 1366×768 e 390×844, com interação disponível junto ao Broto. O teste móvel usa viewport emulado, não telefone físico. Saves v20 sem `monsterRestCycle` carregam com ciclo zero; descanso persiste ciclo um e, após reload, troca as âncoras sem duplicar criaturas.

## Integração e publicação — 01/10/2026

- [PR #14](https://github.com/JoaoFiscina/Fizzi-Quest/pull/14) integrado com autorização do jogador. Merge: `49acd8b4e427161b0fc916bb386202aa13aae3b5`.
- Check Vercel do merge: **success**. [Deployment](https://vercel.com/joao-fiscina-s-projects/fizzi-quest/CnhC5ZL7fiz4VfbRKWsZHyAqdRyf).
- Em [fizzi-quest.vercel.app](https://fizzi-quest.vercel.app/), navegador abriu com título e rodapé v23.09.2003.21. **Continuar aventura** fechou a intro e mostrou HUD e controles do bosque.
- Esta conferência pública é um smoke test de entrada/versão; a evidência de patrulha e combate é a bateria anterior. Não houve repetição completa da regressão nesta integração, que não alterou gameplay.
