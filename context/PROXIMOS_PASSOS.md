# Próximos passos

Use [`MOLDE_EXPANSAO.md`](MOLDE_EXPANSAO.md) em cada entrega. O roadmap completo está em [`ROADMAP_IMPLEMENTACOES.md`](ROADMAP_IMPLEMENTACOES.md).

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
- v21: movimentação dos monstros comuns. Plano detalhado em [`PLANO_V21_MOVIMENTACAO_MONSTROS.md`](PLANO_V21_MOVIMENTACAO_MONSTROS.md): áreas limitadas, ciclos variáveis de pausa/caminhada, interação na posição atual e troca persistida de pontos de repouso ao descansar. O Guardião permanece fixo nesta etapa.
- Versão posterior: Guardião derrotado como encontro raro. Exige separar a instância do boss original da aparição rara no save e no combate; definir frequência e regras de respawn antes de implementar.
- Versão posterior de balanceamento: elevar o teto atual de contribuição da Agilidade para velocidade de navegação (`56 + min(18, Agilidade × 1,2)`), após medir deslocamento em níveis 1/10/20, com Botas e Impulso, em reta e diagonal. Preservar controle e colisões; não incluir na v21.
- Depois: Capa e Runa em versões separadas, com numeração confirmada ao abrir cada etapa.
- Depois: respawn variável em pontos caminháveis e áreas novas; revisar proposta e complexidade antes de abrir cada etapa.
