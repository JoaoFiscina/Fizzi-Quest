# v23.09.2003.22 — Guardião como encontro raro

Estado: **implementada na branch `feat/v22-guardiao-raro`; validação em `docs/VALIDATION_V22.md`; publicação pendente**. Base: `main`, v23.09.2003.21, PR #14 integrado em 01/10/2026 (`49acd8b4e427161b0fc916bb386202aa13aae3b5`); título, rodapé e entrada na aventura conferidos no domínio oficial. Seguir [MOLDE_EXPANSAO.md](MOLDE_EXPANSAO.md).

## Objetivo e limite de complexidade

Depois de vencer o Guardião original, o jogador poderá reencontrar um **Guardião errante** raro ao descansar. Ele ocupará uma área de patrulha do bosque como os monstros comuns. Complexidade **alta**, limitada a um sistema: identidade e persistência dos encontros. Preservar sprites, água, fogo, folhas, cadências de animação, combate por turnos, equipamentos e treinos.

Ficam para outras etapas: aumento do teto de velocidade por Agilidade, Capa, Runas, novos mapas, novas habilidades e reformulação gráfica. Não implementar tudo junto para compensar o trabalho de migração.

## Diagnóstico da base

- `Save.defeated` registra tipos (`EnemyId`), não encontros individuais.
- `startBattle` bloqueia tipos já derrotados; `Battle.enemy` identifica somente o tipo.
- A vitória no Guardião entrega o progresso da missão, e `rest` preserva sua derrota.
- `World.enemySprites` e atores de patrulha são indexados por tipo; usar somente `guardian` para a nova criatura pode ocultar, duplicar ou confundir o encontro original.
- `monsterRestCycle` varia de 0 a 5: serve à permutação de âncoras, mas não deve ser a única identidade de uma aparição persistida.

Por isso, liberar novamente `guardian` em `defeated` não é uma solução segura.

## Regras propostas para o piloto

1. Desbloquear a possibilidade após a **vitória no Guardião original**, mesmo se a entrega do emblema ainda estiver pendente. A missão continua em seu estado anterior.
2. Um descanso efetivo gera uma distribuição nova. Reutilizar o evento de `rest` já existente, inclusive recuperação após derrota; no máximo um sorteio por execução. Abrir menus, mudar de mapa ou recarregar não sorteia.
3. Probabilidade inicial: **10% por descanso elegível**, parametrizada e provisória. Uma sequência determinística avança com cada descanso e seu estado fica salvo. Não usar relógio, renderização ou `Math.random()` a cada frame como fonte do resultado.
4. No máximo um Guardião errante por distribuição. Substituir um dos três slots comuns em uma âncora compatível; os outros dois permanecem. O slot comum volta na próxima distribuição sem raro. Não sobrepor monstros nem ampliar a população inicial.
5. Ao vencer, ocultar somente essa instância até o próximo descanso. Fugir mantém a mesma instância disponível e reinicia seu combate conforme a regra atual. Reload e troca de mapa preservam presença/derrota, não a posição transitória da patrulha.
6. O boss original permanece derrotado e não volta ao posto. Guardião errante não entrega emblema, não reinicia missão nem repete recompensa da guilda.
7. Piloto reutiliza atributos/ataques do Guardião atual. Recompensa inicial de aventura: **60 XP, 25 ouro, 3 materiais**, aplicada uma vez por vitória, com o multiplicador DEV já existente. Simular o retorno médio de descansos repetidos antes de fechar estes valores; não adicionar drops ou bônus de treino.
8. Nome visível **Guardião errante** na interação e no combate. Usar a aparência atual; testar se essa identificação basta na escala real antes de propor outro recurso visual.

## Estrutura técnica prevista

### Domínio de encontros

Criar `src/domain/encounters.ts` com configuração, resolução determinística da distribuição, desbloqueio e consulta de instância. Separar **tipo** (`guardian`, usado para estatísticas/arte) de **identidade** (por exemplo `guardian-original` ou `rare-<contador>`). Esses nomes são proposta, não API já implementada.

Manter o estado raro pequeno: contador/estado do gerador, slot escolhido, identificador e derrota da instância atual. Não guardar listas ilimitadas de aparições passadas. Validar limites numéricos e enumerações no importador. Não alterar os identificadores de itens ou registros de treino.

### Save e compatibilidade

Adicionar campos compatíveis com defaults explícitos ao `Save`, `freshSave` e schema de `src/application/store.ts`. Manter `defeated` legado como registro dos encontros originais enquanto adaptadores resolvem as identidades. Preferir migração aditiva; decidir a versão do save pelo contrato efetivamente implementado, independentemente de v22.

Saves v21 sem campos novos carregam **sem raro e sem sorteio automático**. Derrota legada de `guardian` desbloqueia a possibilidade no próximo descanso. Batalhas antigas com apenas `enemy` são associadas ao encontro original, preservando HP, rodada, log e status. Backup/importação/reload e saves DEV precisam passar pelos mesmos validadores.

### Combate e aplicação

Passar a identidade ao iniciar batalha e persistir sua origem em `Battle`. Resolver atributos pelo tipo. Na vitória, registrar derrota por identidade e aplicar XP/ouro/material uma única vez; missão depende da origem original. Revisar todas as chamadas de `startBattle`, o término do combate, fechamento da vitória e recuperação após derrota. Persistir a rodada antes dos efeitos, como hoje.

### Mundo e interface

Em `src/game/world.ts`, mapear sprites e entidades pela identidade e resolver textura pelo tipo. Distribuição rara usa a mesma fundação de `src/game/monsterMovement.ts`, com raio/caminhabilidade/evitação e movimento reduzido preservados. Interação acompanha posição atual e transporta identidade correta ao combate. Em `src/ui`, mostrar nome do encontro sem expor dados técnicos. Reconstruir o mapa somente quando a distribuição mudar; não criar temporizadores por criatura.

## Ordem de execução

1. Confirmar base e abrir branch da v22. Capturar referências v21 com saves sintéticos: antes do boss, emblema pendente, missão concluída e batalha em andamento.
2. Escrever funções puras de identidade/distribuição e migração. Testar os casos legado/original/raro antes de tocar o mapa.
3. Fazer **um piloto** de Guardião errante com seed conhecida. Percorrer descanso → bosque → interação → batalha → vitória → reload. Conferir que a guilda e o boss original continuam corretos.
4. Conectar distribuição normal e raro ao mundo; preservar as três âncoras e adaptar UI. Conferir movimento por 30 segundos, colisão e interação na escala real.
5. Medir economia em simulação de pelo menos 1.000 descansos, níveis 5/10/20, com e sem DEV. Conferir distribuição real, tempo/recompensa e exploração por descanso repetido. Alterar chance/recompensa apenas com resultado registrado.
6. Validar regressão, saves e telas. Somente após aprovação fechar versão22 em `src/version.ts`, package/lock, histórico e contexto; abrir PR com evidências reais. Publicar após autorização e conferir domínio oficial.

## Critérios de aceite e testes

- Antes de vencer o original: nenhum raro, mesmo com fixture que força resultado elegível. Depois de vencer: seed conhecida reproduz raro; outra reproduz distribuição normal.
- Sem reroll por reload, modal ou mapa; descanso avança uma única distribuição. Recuperação após derrota tem comportamento documentado e testado.
- Slot substituído não renderiza seu comum; próximo descanso o restaura conforme distribuição. Limite de um raro e ausência de sobreposição/duplicação.
- Vitória rara concede somente sua recompensa uma vez; fecha/reabre/reload não repete pagamento. Missão e emblema não mudam. Fugir e perder não registram vitória.
- Save v21 e batalha antiga mantêm progresso. Backup exportado/importado preserva encontro e derrota. DEV não modifica o save normal.
- Testes de domínio para migração, RNG, derrota e recompensas; `npm test`, `npm run build`, `npm run test:e2e` com jornadas original e rara completas.
- Capturas em 390×844, 430×932, 1366×768 e 1920×1080; zoom disponível e movimento Completa/Reduzida. Temporal de 30 s para patrulha e animação; 60 s com contagem estável de sprites/timers. Emulação de celular deve ser identificada como tal.
- Evidências em `docs/evidence/v23.09.2003.22/`, validação em `docs/VALIDATION_V22.md`, com seed, save sintético e resultados reais. No domínio oficial, verificar versão, entrada, encontro e continuidade do save.

## Riscos e ponto de retomada

Maior risco: confundir o tipo Guardião com duas origens distintas e repetir missão/recompensa. Mitigar com identidade no domínio antes do piloto visual. Outros riscos: reroll infinito, batalha legada perdida, criatura oculta por chave duplicada e ganho excessivo de ouro por descansos; cobrir pelos critérios acima.

**Próxima ação concreta:** concluir checks, revisar e abrir PR da v22. Identidade/distribuição, migração e fluxo raro implementados. Expansão futura e tutorial interno em `PLANO_EXPANSAO_MUNDO.md` e `GUIA_QUALIDADE_EXPANSAO.md`; novas áreas não implementadas.

Após a v22: etapa proposta de balanceamento da velocidade por Agilidade, incluindo o piloto pendente do Impulso nos níveis 10 e 20. Comparar a fórmula atual `56 + min(18, Agilidade × 1,2)` com tetos candidatos, reta/diagonal, Botas, Impulso e colisão; escolher limite por evidência. Capa e Runa continuam em entregas separadas.
