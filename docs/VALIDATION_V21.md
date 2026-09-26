# Validação — v23.09.2003.21

## Escopo

Patrulha de Broto, Besouro e Mariposa no bosque, interação na posição atual, troca determinística e persistida dos pontos de repouso a cada descanso. Guardião fixo; combate, recompensas, sprites e cadências ambientais preservados. A versão oficial continua na v20 até integração e deploy da v21.

## Verificações

- `npm test`: **51/51 aprovados**; inclui ciclos, caminhabilidade, raio, permutação e regressão de regras.
- `npm run build`: TypeScript e Vite aprovados.
- `npm run test:e2e`: **28/29 aprovados** na execução completa; o único erro foi uma expectativa antiga do teste de atualização (`v21` em vez de `v22`). Corrigida a expectativa, o cenário falho passou isoladamente. Assim, os **29 cenários** têm resultado aprovado no código final; não houve nova execução completa após a correção apenas do teste.
- Evidências em [`evidence/v23.09.2003.21/`](evidence/v23.09.2003.21/).

Na amostra de 30 segundos, Broto ocupou 19 posições, Besouro 17, Mariposa 13 e Guardião permaneceu em uma; água/fogo continuaram ativos. As capturas foram inspecionadas: bosque e HUD permanecem legíveis em 1366×768 e 390×844, com interação disponível junto ao Broto. O teste móvel usa viewport emulado, não telefone físico. Saves v20 sem `monsterRestCycle` carregam com ciclo zero; descanso persiste ciclo um e, após reload, troca as âncoras sem duplicar criaturas. Não declarar publicação antes de abrir o domínio oficial na v21.
