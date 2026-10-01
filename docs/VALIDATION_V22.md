# Validação — v23.09.2003.22

## Escopo e base

Base `main` v21, commit `2ff42429f432ab3f996915209bc68f722d7ed566`. Branch `feat/v22-guardiao-raro`. Implementação de identidade rara, distribuição persistida por descanso, migração aditiva, patrulha e interação. A arte e os controladores ambientais não foram alterados. Oficial permanece v21 até integração autorizada.

## Resultado em desenvolvimento

- `npm test`: **57/57 aprovados**. Migração de save/batalha v21, unlock, distribuição, persistência, fuga/derrota, vitória única, missão e multiplicador DEV.
- `npm run build`: TypeScript/Vite aprovados; avisos existentes de anotação Zod e tamanho do chunk Phaser.
- Piloto E2E de descanso → mapa → raro → vitória → reload aprovado, incluindo capturas 390×844, 430×932, 1366×768 e 1920×1080. Inspecionadas capturas de mapa móvel e combate desktop; nome raro legível, sem alteração de enquadramento.
- `npm run test:e2e`: **31/31 aprovados** na execução completa (5,3 minutos). Temporal raro: 61 amostras em 60 segundos, mais de cinco posições e múltiplas texturas; três atores de patrulha e água/fogo ativos. As regressões dos três comuns e modo Reduzida também passaram. Depois, o diagnóstico foi reforçado para contar recursivamente todos os objetos dos containers: nova execução isolada aprovada com **1.438 objetos e um timer** estáveis. Nenhum código de gameplay mudou após a regressão completa.

O primeiro teste temporal encontrou uso de uma API de diagnóstico inexistente (`Clock.getAllEvents`), corrigido para contar os eventos ativos do Clock apenas no teste. Isso não alterou o código do jogo. Capturas móveis são de viewport emulado, não telefone físico.

## Simulação de raridade e economia

Seed inicial `0x9e3779b9`, 1.000 descansos elegíveis: **103 aparições (10,3%)**. Chance configurada 10%. O descanso não concede ganho sozinho. Se todas as aparições forem vencidas: média por descanso de 6,18 XP, 2,575 ouro e 0,309 materiais; com multiplicador DEV5, XP médio 30,9. Ganho de ouro/material não recebe multiplicador DEV.

As mesmas distribuições foram verificadas nos níveis 5, 10 e 20 (XP 350/1350/5225), sem depender do atributo ou equipamento. Recompensa mantida em 60 XP/25 ouro/3 materiais. Esta é análise de distribuição/recompensa, não medida de duração de combate ou diversão em aparelho físico; balanceamento prático avançado segue observável após a revisão.

## Persistência e evidência

`rareEncounter` tem seed, contador, slot e derrota atual. Batalha rara tem `encounterId`; batalhas legadas continuam sem esse campo e usam encontro original. Reload/mapa não sorteiam; vitória rara não altera missão/emblema. Recuperação após derrota executa o mesmo descanso do jogo e avança uma distribuição. Identidades inválidas e estados incompatíveis são rejeitados na importação.

Evidências em [evidence/v23.09.2003.22/](evidence/v23.09.2003.22/); referência de arte/mapa da base em [evidence/v23.09.2003.21/](evidence/v23.09.2003.21/). Não se alega nova produção de arte nesta versão. Plano de expansão e guia interno são documentos futuros, sem áreas novas implementadas.

## Integração

[PR #15](https://github.com/JoaoFiscina/Fizzi-Quest/pull/15) aberto, sem conflitos, branch enviada ao GitHub. Check Vercel do commit `6479408`: **success**, [deployment de preview](https://vercel.com/joao-fiscina-s-projects/fizzi-quest/9jPGB8TWSR7c5RkW53fUChesNme9). A verificação jogável foi no ambiente local; o status do preview não equivale a teste de produção. A v22 não está publicada no domínio oficial e não será chamada de oficial antes da conferência após merge autorizado.

## Integração — 01/10/2026

PR #15 integrado à main (b3cf34979890ef396adc5ff93983639d9fc35ef3), seguido pelo PR #16. Conferência pública final no build v23 contendo o Guardião raro. Não houve teste público isolado de v22; resultados de gameplay acima são os checks locais pré-merge.
