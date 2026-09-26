# Validação — v23.09.2003.16

Data: 26/09/2026. Ambiente: Windows, Edge headless, Phaser/TypeScript/Vite. Referência anterior: [`VALIDATION_V15.md`](VALIDATION_V15.md).

## Resultado técnico

- `npm test`: 37 testes aprovados. Inclui seis simulações do mesmo treino nos níveis 1, 10 e 20, com e sem equipamentos; todos geram **216 XP e +0,28 Força** no caso sintético de alta confiança, apesar de atributos iniciais diferentes.
- `npm run build`: aprovado com a versão `v23.09.2003.16` no bundle. JavaScript próprio 56,83 KB gzip e Phaser 332,17 KB gzip. O aviso de chunk grande do Phaser e os avisos de comentários do Zod não interrompem o build.
- `npm run test:e2e`: **18 testes aprovados em 3,4 minutos**, usando Vite isolado na porta 5188 e `FIZZI_REUSE_TEST_SERVER=1`. A suíte cobre treino/recarga, habilidades nos níveis 1–3, mochila, loja, mapa, combate, responsividade e os testes temporais de animação existentes.
- `npx prettier --write` aplicado aos arquivos TS/CSS alterados; `git diff --check` integra a revisão final antes do commit.

## Comparação de recompensa

| Confiança | XP por sessão v15 → v16 | Atributos por sessão v15 → v16 |
| --- | ---: | ---: |
| Baixa | 100 → 60 | 0,02 → 0,02 |
| Média | 220 → 132 | 0,18 → 0,23 |
| Alta | 360 → 216 | 0,40 → 0,50 |

O teto diário passou de 450 para 270 XP e de 0,50 para 0,60 atributo. Em confiança média/alta, a proposta de atributo é multiplicada por 1,25 antes dos tetos. O teste de regressão carregou um dia válido da v15 com 450 XP e 0,50 atributo, preservou os registros e aplicou um treino novo sem exceder o teto novo. ID e impressão do treino continuam bloqueando duplicatas.

## Inspeção da interface

As capturas em [`evidence/v23.09.2003.16/`](evidence/v23.09.2003.16/) usam treino e saves sintéticos. A prévia de treino mostra XP/atributos efetivos e a separação entre proposta da IA e validação do jogo. Em 390×844, o submenu de combate exibe os quatro cartões, requisitos e botão **Voltar** sem corte. A ficha indica o próximo desbloqueio ou informa quando as habilidades existentes já estão disponíveis. Os testes de matriz anteriores verificaram 390×844, 430×932, 1366×768 e 1920×1080; as animações da v15 permaneceram nos mesmos arquivos.

## Nota sobre a execução E2E no Windows

Quando o Playwright iniciava Vite como processo filho, os 18 casos terminavam, mas o comando ficava aberto no encerramento. O teste final usou um servidor Vite iniciado separadamente na porta 5188; o Playwright reutilizou somente esse servidor e terminou com código 0. `playwright.config.ts` aceita `FIZZI_TEST_PORT` para impedir ligação acidental à prévia do usuário na porta 5173. A pasta de evidências da v15, regravada pelos testes visuais, foi restaurada antes do commit.

## Limites

- Os tamanhos de viewport são emulação em desktop; não houve teste em telefone físico.
- A IA externa não foi chamada; fixtures sintéticas verificam o JSON e a validação local.
- A calibração foi conferida nos limites e em personagens de três níveis, mas o ritmo de meses de treino e aventura ainda precisa de observação no uso real.
- Nenhum código de sprites, mapas, movimento ou animações foi alterado nesta versão.

## Produção

PR #9 integrado à `main` no commit `5aeca54e447bfd23cab4615f71f3a251257ee549`. O check Vercel passou. Em 26/09/2026, o domínio `https://fizzi-quest.vercel.app/` exibiu título e rodapé `v23.09.2003.16`, com a vila renderizada na tela inicial. Não iniciei uma aventura nesse navegador para evitar alterar um save existente.
