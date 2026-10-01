# Validação — v23.09.2003.18

Data: 26/09/2026. Ambiente: Windows, Edge headless, Phaser/TypeScript/Vite. A validação anterior está em [`VALIDATION_V17.md`](VALIDATION_V17.md).

## Resultado técnico

- `npm test`: **44/44** regras aprovadas; save, treino e combate preservados.
- `npm run build`: aprovado. `dist/version.json` contém `v23.09.2003.18`, a mesma constante do título e rodapé; Vite gera arquivos CSS/JS com hash. Avisos anteriores de Zod e chunk Phaser grande continuam não bloqueantes.
- `npm run test:e2e`: **22/22** jornadas aprovadas em 4,2 min, incluindo os três cenários novos. Após ajustar o layout dos Ajustes, os três cenários novos passaram novamente.
- `git diff --check`: aprovado antes do PR.

## Diagnóstico e comportamento verificado

Com o navegador em `prefers-reduced-motion: reduce` e preferência do save `system`, a página informa por que monstros e folhas param e água/fogo ficam suaves. Clicar **Ativar animações completas** põe o controlador ambiental no modo normal sem reiniciar o jogo; no bosque, o sprite de monstro volta a executar seu ciclo. A escolha persiste após reload. O teste anterior de 30 segundos confirmou que água/fogo continuam mudando quadros e retornando à pose, sem multiplicar timers.

O teste de versão simulou um manifesto `v23.09.2003.19` e encontrou o aviso **Atualizar jogo**. O clique navegou para URL com parâmetro de versão e timestamp, e o `localStorage` do save permaneceu idêntico. Com manifesto da versão instalada, não há aviso e a verificação manual responde que ela já está atualizada. Falha de consulta não bloqueia o jogo. Esses testes usam manifesto simulado; publicação no Vercel ainda exige verificação no domínio oficial.

## Inspeção visual

Capturas em [`evidence/v23.09.2003.18/`](evidence/v23.09.2003.18/) mostram intro e Ajustes com movimento reduzido no PC, aviso de atualização em 1366×768 e 390×844, e verificação manual em desktop e móvel. O botão de backup deixou de cobrir a seção de versão. Não houve alteração nos sprites, cadências ou layouts do mundo. Viewport emulado não equivale ao aparelho físico do jogador.

## Limites

A preferência real de movimento no PC do jogador e seus cabeçalhos de cache não são acessíveis neste ambiente; a causa foi reproduzida por emulação e combina com o relato, mas precisa ser conferida naquele navegador. Um cliente antigo que ainda não contém o verificador precisa ser recarregado uma vez para receber este recurso. O aviso detecta uma versão mais nova do manifesto; ele não verifica separadamente se cada arquivo local do navegador foi servido do cache.

## Integração e produção

Pendente: registrar PR, commit de merge, verificação do manifesto e título no domínio oficial.
