# Validação — v23.09.2003.17

Data: 26/09/2026. Ambiente: Windows, Edge headless, Phaser/TypeScript/Vite. Base arquivada em [`VALIDATION_V16.md`](VALIDATION_V16.md).

## Resultado técnico

- `npm test`: **44 testes aprovados**. Cobre migração de save v16, compra e equipamento bloqueados no nível 3, liberação aos 225 XP do nível 4, troca de Anel sem empilhar bônus, convivência com Acessório, ID persistente, bônus e limites de PR, dia misto com 450 XP antigos, duplicata, backup, recarga e falha de armazenamento.
- `npm run build`: aprovado com `v23.09.2003.17`. O chunk próprio tem cerca de 59,85 KB gzip; Phaser 332,17 KB gzip. Avisos de comentários Zod e chunk Phaser grande são não bloqueantes.
- `npm run test:e2e`: **19/19 jornadas aprovadas em 3,6 min** com Vite separado na porta 5188. Cobre importação v2, prévia e reload, Anel nível 3/4 e layout, além da suíte anterior de combate, mapa e animação. A primeira execução terminou 18/19 por corrida de estado em um teste visual antigo: a página anterior sobrescreveu o save sintético do Guardião. O teste foi isolado corretamente e a suíte inteira passou. Depois, um teste focal de Anel validou também 430×932 e 1920×1080; dois testes focais validaram as capturas finais de treino.
- `git diff --check`: aprovado. A revisão do diff confirmou que `src/game/`, sprites, mapas e regras de movimento não foram alterados.

## Regras verificadas

O nível 4 começa em 225 XP acumulados. Anel de cobre custa 35 ouro e Anel da brisa custa 40. Um treino de alta confiança proposto com 140 XP, +0,22 Força, +0,10 Vigor e +0,06 Fôlego, mais um PR de Força, mostrou **140 XP e 46 ouro base**, **+5 XP e +0,02 Força de PR**, total **145 XP, 46 ouro e +0,24 Força**. A confirmação persistiu os valores após reload; repetir o mesmo ID foi bloqueado. A prévia não concedeu nada.

Simulação com dez PRs propostos concedeu apenas três (+15 XP/+0,06 atributo). Um segundo treino no mesmo dia respeitou 270 XP base diário, sem novo bônus de PR. Um dia legado com 450 XP preservou esse histórico, bloqueou XP base novo e permitiu somente a reserva de bônus novo. O prompt não reduz ganhos por nível/equipamento; a lógica de importação também não usa esses valores.

## Inspeção visual

Capturas em [`evidence/v23.09.2003.17/`](evidence/v23.09.2003.17/) mostram a prévia curta e o Anel em 390×844, 430×932, 1366×768 e 1920×1080. O slot bloqueado explica o nível exigido; após a compra ele aparece na mochila e no HUD. A prévia móvel mantém o botão de confirmação visível, com base, PR, ajuste e total em ordem. Não houve rolagem horizontal nos tamanhos testados. Emulação de viewport não equivale a teste em telefone físico.

## Limites

- A IA externa não foi consultada com treinos reais. O contrato e os limites foram verificados com entradas sintéticas; a precisão da análise da IA precisa de observação no uso real.
- O jogo não recebe o relato original no formato v2. Ele não verifica se o recorde declarado foi realmente demonstrado; apenas limita e registra a sugestão. Um novo ID pode representar a mesma atividade, portanto a proteção de duplicata evita reaplicação acidental do mesmo código, não autentica exercícios.
- Os 35/40 ouro e o nível 4 foram avaliados com ganhos sintéticos de treino e combate, mas ainda precisam de avaliação do ritmo de jogo real.

## Produção

PR #10 integrado à `main` no commit `932bf7d67388728b3274d3f799747317b6dba643`. O check Vercel da branch passou. Em 26/09/2026, o endereço `https://fizzi-quest.vercel.app/` exibiu título e rodapé `v23.09.2003.17`; a vila carregou, a aventura iniciou e o Diário abriu o novo prompt com ID/data. A navegação de produção foi feita em uma sessão limpa do navegador interno. Não foi importado treino sintético no domínio público.
