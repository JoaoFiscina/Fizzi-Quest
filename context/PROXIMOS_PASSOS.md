# Próximos passos

Use [`MOLDE_EXPANSAO.md`](MOLDE_EXPANSAO.md) em cada entrega. O roadmap completo está em [`ROADMAP_IMPLEMENTACOES.md`](ROADMAP_IMPLEMENTACOES.md).

## Fila ativa por prioridade e complexidade

Atualização de 01/10/2026: os itens velocidade/Impulso e Diário foram unidos por pedido explícito em **v23 — Passo Ágil e Diário da Jornada**, complexidade média. Implementados em branch sobre v22; teto base100 px/s e Impulso sem teto posterior. Plano [PLANO_V23_PASSO_E_DIARIO.md](PLANO_V23_PASSO_E_DIARIO.md). A v24 planejada não será uma entrega separada. V22→v23 integradas e publicadas. Próxima ação: abrir a fundação de áreas/missões, mantendo as expansões de alta complexidade separadas.

Regra permanente solicitada em 01/10/2026: apresentar sempre prioridade, ordem, complexidade, dependências e limite de escopo. Tarefas muito complexas ficam em versões separadas. Correções que bloqueiem jogo, save ou atualização passam à frente desta fila.

| Ordem | Prioridade         | Entrega                     | Complexidade | Dependência e escopo                                                       |
| ----- | ------------------ | --------------------------- | ------------ | -------------------------------------------------------------------------- |
| 1     | Alta para expansão | Fundação de áreas e missões | Alta         | Próxima etapa exclusiva; migrar áreas/objetivos atuais antes de novo mapa. |
| 2     | Alta para expansão | Margem do Ribeirão          | Alta         | Fundação validada; uma área piloto, missão e criatura.                     |
| 3     | Média              | Histórias da Margem         | Média        | Objetivos existentes; duas histórias curtas e tom mais maduro.             |
| 4     | Média              | Capa                        | Média        | Um slot, catálogo pequeno e fluxo completo.                                |
| 5     | Média              | Pedreira Velha              | Alta         | Área/monstro/missão; boss em entrega posterior.                            |
| 6     | Média              | Sentinela da Pedreira       | Média-alta   | Boss e conclusão do arco, sem mapa novo.                                   |
| 7     | Média              | Runas                       | Média-alta   | Equipamentos estáveis; um slot e efeitos passivos simples.                 |

V22 e v23 publicadas; v24 absorvida. Confirmar os números futuros ao abrir cada etapa. Cada plano novo deve explicar o motivo da prioridade e dividir uma tarefa se a implementação revelar complexidade maior. Preservar as animações aprovadas. Não juntar a v22 com novos slots, expansão gráfica ou balanceamento de velocidade.

V22 implementada: 57 testes, build e 31 E2E aprovados; próxima ação é revisão/integração autorizada. Para a expansão, seguir a fila própria em [PLANO_EXPANSAO_MUNDO.md](PLANO_EXPANSAO_MUNDO.md): fundação compatível (alta) antes de área piloto (alta), histórias (média), Pedreira (alta) e boss separado (média-alta). Tutorial interno: [GUIA_QUALIDADE_EXPANSAO.md](GUIA_QUALIDADE_EXPANSAO.md). Essa fila detalha a expansão futura sem reservá-la toda para uma única versão.

## v23.09.2003.16 — concluída

37 testes de regras, build e 18 jornadas E2E aprovados. Capturas de treino/habilidades conferidas, PR #9 integrado e versão v23.09.2003.16 confirmada no domínio oficial.

## v23.09.2003.17 — Anel, importação compacta e PR

Plano detalhado: [`PLANO_V17.md`](PLANO_V17.md). Complemento: [`PLANO_IMPORTACAO_COMPACTA_PR.md`](PLANO_IMPORTACAO_COMPACTA_PR.md). Dois blocos implementados; validação e integração registradas em `docs/VALIDATION.md` e `ESTADO_ATUAL.md`.

- Anel no nível 4, dois itens, migração de saves, loja, mochila, ficha e HUD implementados.
- Modelo de treino com ID persistente, resposta curta v2, bônus de até três PRs por dia e prévia separada implementados. Formato v1 preservado.
- Testes de domínio, backup, jornada móvel e desktop em `docs/VALIDATION.md`. A avaliação da IA externa com treinos reais ainda depende de observação; o jogo não consegue conferir o relato omitido no código curto.

## v23.09.2003.18 — animações no PC e atualização

Plano: [`PLANO_V18_ATUALIZACAO_E_MOVIMENTO.md`](PLANO_V18_ATUALIZACAO_E_MOVIMENTO.md). O modo do sistema é explicado no início e nos Ajustes; **Completa** permite manter as animações neste aparelho. O build publica `version.json` e o jogo oferece **Atualizar jogo** quando detectar uma versão mais nova, preservando o save. Conferir testes e produção em `docs/VALIDATION.md` e `ESTADO_ATUAL.md`.

## v23.09.2003.19 — Botas e Impulso da Trilha (publicada)

Plano detalhado: [`PLANO_V19_BOTAS_E_IMPULSO.md`](PLANO_V19_BOTAS_E_IMPULSO.md).

- Manter a entrega das Botas como único novo slot estrutural, com proposta de desbloqueio no nível 5, catálogo pequeno, bônus de Agilidade, migração, loja, mochila, ficha, HUD e backup.
- Adicionar a habilidade ativa **Impulso da Trilha** no nível 5: custo de 1 fôlego, +5% por 5 s no rank 1; a cada cinco níveis, +5% e +2 s. Rank, tempo e percentual devem ser calculados por função pura.
- O efeito acontece somente no mapa, não entra em `Action`, não muda combate/iniciativa/dano e não acumula. O tempo ativo fica fora do save; o fôlego gasto permanece salvo.
- Validar piloto nos níveis 5, 10 e 20, movimento reto/diagonal, expiração, reload, batalha, troca de mapa e layouts desktop/mobile antes de integrar.

Implementação realizada: Botas aparecem no nível 5, entram na migração/loja/mochila/ficha/HUD e o Impulso da Trilha custa 1 fôlego, aplica +5% por 5 segundos no rank 1, não acumula e expira com relógio do navegador. PR #12 integrado e versão pública confirmada; detalhes em `docs/VALIDATION_V19.md`. O piloto dos níveis 10 e 20 segue pendente.

## Depois da v19

- v20: modo desenvolvedor `DEV23` antecipado a pedido do jogador. XP, ouro, bônus dos quatro atributos e multiplicador de XP de aventura ficam em save isolado. Plano: [`PLANO_V20_MODO_DESENVOLVEDOR.md`](PLANO_V20_MODO_DESENVOLVEDOR.md). PR #13 integrado; versão pública confirmada.
- v21 publicada: [patrulha e repouso](PLANO_V21_MOVIMENTACAO_MONSTROS.md), PR #14 integrado em 01/10/2026. Vercel aprovado e domínio oficial conferido na v21. Evidências e limites em `docs/VALIDATION_V21.md`.
- **Próximo update, v22:** [Guardião raro](PLANO_V22_GUARDIAO_RARO.md), implementado em branch, aguardando fechamento da validação e revisão. Identidade dos encontros, migração e piloto de descanso/aparição/combate/reload concluídos. Regras: 10% por descanso após vencer o original, substituição de um slot comum, no máximo um raro e nenhuma repetição da missão. Simulação de 1.000 descansos: 103 aparições; descanso sozinho não concede recompensa. Ver `docs/VALIDATION_V22.md`.
- V23 unificada: velocidade base100 px/s, Impulso acima do teto e Diário de versões nos Ajustes implementados em branch. Fora da v22, dependente dela; plano e evidências nos documentos da v23. Após revisão/integração, seguir expansão por etapas.
- Depois: Capa e Runa em versões separadas, com numeração confirmada ao abrir cada etapa.
- Depois: respawn variável em pontos caminháveis e áreas novas; revisar proposta e complexidade antes de abrir cada etapa.

## Integração concluída — 01/10/2026

PRs #15 e #16 integrados; v23 oficial confirmada. A fila de implementação começa agora pela fundação de áreas/missões (alta prioridade para expansão, alta complexidade e entrega exclusiva), usando PLANO_EXPANSAO_MUNDO.md e GUIA_QUALIDADE_EXPANSAO.md. Velocidade/Diário concluídos; v24 absorvida. Os trechos anteriores de validação/integração pendente registram a preparação e foram superados por esta publicação.
