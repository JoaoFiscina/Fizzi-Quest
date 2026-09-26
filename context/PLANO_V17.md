# Fizzi Quest — plano da v23.09.2003.17: Anel, treino compacto e PR

Estado: **implementado e em validação para publicação em 26/09/2026**. A v16 foi publicada pelo PR #9. Esta versão acrescenta Anel no nível 4 e o fluxo compacto descrito em [`PLANO_IMPORTACAO_COMPACTA_PR.md`](PLANO_IMPORTACAO_COMPACTA_PR.md). Resultados e limites ficam em `docs/VALIDATION.md`; o status do domínio oficial fica em `ESTADO_ATUAL.md`.

## Objetivo e limite da versão

Dar ao jogador um próximo marco de equipamento depois das habilidades iniciais: o slot **Anel** aparece desde o início, explica seu requisito e pode ser usado a partir do nível 4. A fundação de requisitos por nível deve servir às próximas versões sem gravar regras duplicadas no save. Broches e Pingentes continuam compartilhando o slot **Acessório**. O jogo recebe somente um novo slot funcional e dois anéis; Botas, Capa e Runas aparecem apenas como prévia do plano futuro.

Complexidade revisada: **média-alta**, por combinar Anel com a importação compacta e o bônus de PR solicitados. Executar os dois blocos em commits verificáveis, seguindo o complemento do plano. Preservar sprites, ciclos de animação, regras de movimento, mapas, encontros, ordem de combate e recompensas já gravadas. Não acrescentar outros slots funcionais nesta versão.

## Referência e decisão de progressão

1. Antes de editar, confirmar branch, commit da v16, versão no endereço oficial e estado limpo do checkout. Usar um save sintético v16 e capturar mochila, loja, personagem e HUD em nível 1 e nível 4, em desktop e celular emulado.
2. A fórmula atual em `src/domain/game.ts` cobra `50 + 25 × (nível − 1)` XP por nível. Assim, nível 2 começa em 50 XP, nível 3 em 125 XP e **nível 4 em 225 XP acumulados**. Confirmar que a v16 preservou essa fórmula antes de implementar. O nível 4 segue as habilidades liberadas nos níveis 2 e 3.
3. Considerar nível 4 uma hipótese de balanceamento a validar com simulações de progressão após os ajustes de XP da v16. Se o tempo para atingir esse marco ficar excessivo, ajustar o requisito antes da entrega e registrar a razão; não mudar a curva geral de XP para acomodar apenas o Anel.
4. Registrar no plano e nas evidências a disponibilidade real de ouro nessa etapa. Os anéis devem ser escolhas modestas, sem exigir repetição desproporcional de combates ou treinos.

## Regra e catálogo

1. Definir um tipo único de slot a partir de `items[id].slot` e metadados centrais de desbloqueio, por exemplo `slotUnlockLevel`: Arma, Escudo, Armadura e Acessório no nível 1; Anel no nível 4. A interface e `equip` consultam a mesma função, como `isSlotUnlocked(save, slot)`.
2. Acrescentar o campo `ring: ItemId | null` ao save, iniciando em `null`. Somente itens com `slot: "ring"` podem ocupá-lo. Equipar outro Anel substitui o anterior, sem empilhar bônus. Manter os IDs, tipos e slots de `moss` (Broche) e `wind` (Pingente).
3. Catálogo piloto proposto, sujeito ao confronto com a economia da v16:

   | Item | Bônus | Preço inicial | Papel |
   | --- | --- | ---: | --- |
   | Anel de cobre | +1 Força | 35 ouro | Escolha simples para ataque. |
   | Anel da brisa | +1 Agilidade | 40 ouro | Pequeno ganho de velocidade, sujeito ao limite já existente. |

   Esses bônus reutilizam atributos existentes e não introduzem efeito passivo, turno extra, multiplicador ou nova regra de combate. Testar combinações com arma, escudo, armadura e Acessório para evitar um salto dominante.
4. Na loja, mostrar Anéis e o requisito enquanto bloqueados; desabilitar compra e equipar antes do nível 4, com texto claro. Repetir a verificação em `buy` e `equip`, pois `Store.transact` não chama `validateSave` após cada mutação. O domínio, e não apenas o botão, deve impedir ações inválidas.
5. A soma de atributos em `stats` inclui o Anel uma única vez, com origem visível em “Equipamentos”. `clampResources` continua impedindo cura automática ao equipar ou trocar uma peça.

## Migração e integridade do save

1. `src/application/store.ts`: adicionar os dois IDs ao enum de itens; ampliar o limite `owned.max(10)` para comportar o catálogo novo; aceitar `ring` ausente como `null` via padrão do schema. Preservar a chave de armazenamento, cópia `.previous`, treinos, XP, ouro, inventário, posição, combate e equipamentos antigos.
2. Validar que um Anel equipado pertence ao inventário, tem `slot: "ring"` e está liberado pelo nível calculado do XP salvo. Uma peça de outro slot em `ring` deve ser rejeitada com mensagem de backup inconsistente. Um Anel adquirido e ainda não equipado pode ficar na mochila em um save importado; isso evita apagar propriedade do jogador.
3. Manter `saveVersion` e `rulesVersion` se a alteração for apenas aditiva e não recalcular treinos anteriores. Se a implementação exigir mudança dessas versões, documentar a migração explicitamente antes de fazê-la. Nunca remover IDs antigos nem converter silenciosamente o Acessório em Anel.
4. Testar um JSON da v16 sem `ring` por carregamento local e por restauração de backup. Confirmar que exportação, recarga e snapshot anterior preservam o Anel depois da compra/equipamento. Um backup inválido não deve substituir o save atual.

## Apresentação nas telas

1. **Mochila:** acrescentar Anel à lista de slots e ao agrupamento de itens. No nível 1, card visível “Anel · desbloqueia no nível 4”; no nível 4, card vazio com acesso aos anéis adquiridos. Indicar qual está equipado. Broche e Pingente permanecem no grupo Acessórios.
2. **Loja:** exibir os dois Anéis com tipo, bônus, preço e requisito. Antes do nível 4, controles bloqueados e texto explicativo; depois, fluxo comum de compra. Evitar espaço vazio ou cartões excessivamente altos no celular.
3. **Personagem:** mostrar Acessório e Anel na linha de equipamentos, o próximo requisito enquanto bloqueado e os bônus no detalhamento dos atributos. Valor total e origem devem concordar com `stats`.
4. **HUD:** preservar os três indicadores atuais de Arma, Escudo e Armadura. Acrescentar indicador compacto de Anel quando o slot estiver liberado, com nome abreviado e título acessível. Conferir que não cubra mapa, controles ou combate no celular.
5. **Prévia futura:** listar Botas e Capa como “Em planejamento”, com benefício esperado em uma frase, sem item, botão de compra, bônus, campo no save ou promessa de nível definitivo. Runas permanecem no roadmap. A prévia não deve parecer um slot utilizável.
6. Atualizar o tutorial de equipamentos com a regra do nível e a distinção entre Acessório e Anel.

## Ordem de execução

1. Preparar um teste de domínio que migra um save v16 sem `ring`, preservando dados, e outro que mostra o limite nível 3/4. Implementar metadados e **um** Anel piloto até estes testes passarem.
2. Integrar o segundo Anel; verificar soma de bônus, substituição sem empilhamento e custo/posse. Cobrir tentativa direta de compra/equipamento bloqueado e backup inconsistente.
3. Atualizar mochila e loja; conferir fluxo manual em desktop e celular emulado. Completar personagem, HUD e tutorial depois que o piloto estiver legível.
4. Adicionar testes E2E para save antigo, estado bloqueado, subida ao nível 4, compra, equipar, troca, exportação/recarga e Acessório simultâneo. Não depender de dados pessoais ou do servidor de IA externa.
5. Implementar e verificar o bloco de importação compacta/PR conforme `PLANO_IMPORTACAO_COMPACTA_PR.md`. Confirmar que um treino pode liberar o Anel ao alcançar nível 4, e que equipá-lo não reduz recompensas futuras.
6. Rodar `npm test`, `npm run build` e `npm run test:e2e`; revisar capturas nas resoluções 390×844, 430×932, 1366×768 e 1920×1080. Usar saves sintéticos idênticos para antes/depois e registrar resultados reais em `docs/VALIDATION.md`.
7. Revisar diff para garantir que `src/game/ambient.ts`, `src/game/art.ts`, `src/game/monsterArt.ts`, `src/game/polishArt.ts` e as regras de movimento não foram alterados. Atualizar versão e contexto somente depois da validação; conferir PR, integração e link oficial conforme `context/MOLDE_EXPANSAO.md`.

## Critérios de aceite

- No nível 3 (125 a 224 XP acumulados), Anel explica “nível 4” e compra/equipamento são bloqueados tanto na UI quanto no domínio; no nível 4 (225 XP ou mais), ambos funcionam.
- Apenas um Anel contribui para atributos. Ele combina com Acessório sem trocar Broche ou Pingente; os demais equipamentos continuam intactos.
- Saves v16 sem `ring` abrem com `ring: null`; save novo e backup restaurado mantêm o item comprado e equipado; backup incoerente é rejeitado sem perda de progresso.
- Mochila, loja, personagem e HUD apresentam estado correto em desktop e celular emulado, sem rolagem horizontal nem controle encoberto.
- Botas e Capa aparecem somente como planos futuros. Animações, mapa, encontros e regras de deslocamento permanecem. Bônus de Agilidade usam a fórmula existente. Recompensas antigas não são recalculadas; novas importações seguem o contrato versionado.
- Modelo da IA devolve resposta curta, importador conserva compatibilidade v1 e prévia apresenta base, bônus de PR e total. O detalhe do treino não precisa voltar ao jogo.
- Testes de domínio, build e jornadas E2E aprovados, com evidências e status de publicação registrados antes de chamar a v17 de oficial.
