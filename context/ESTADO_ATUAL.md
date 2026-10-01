# Estado atual — v23.09.2003.23 em validação; oficial v21

Base oficial: v23.09.2003.21 integrada à `main` pelo [PR #14](https://github.com/JoaoFiscina/Fizzi-Quest/pull/14) em 01/10/2026. Merge `49acd8b4e427161b0fc916bb386202aa13aae3b5`; domínio oficial conferido. V22 implementada na branch `feat/v22-guardiao-raro`, ainda sem integração/publicação.

## O que funciona

- Anel no nível 4, treino com resposta JSON curta e bônus limitado de PR da v17 continuam iguais. Não houve mudança no save, nas regras, nos sprites ou nas cadências gráficas.
- Preferência inicial `motion: system`: se o navegador do PC pede movimento reduzido, o jogo explica na intro e nos Ajustes que monstros e folhas param e água/fogo ficam discretos. **Ativar animações completas** escolhe `full` no save e o mundo é reconstruído no modo normal sem recarregar a página.
- `version.json` é gerado pelo build a partir de `src/version.ts`. No início, ao voltar à aba e a cada cinco minutos, o cliente compara a versão publicada. Se for mais nova, exibe **Atualizar jogo**; o clique salva o progresso e abre uma URL renovada. Os Ajustes permitem verificar manualmente.
- Falha de rede na consulta não impede jogar. O botão de atualização não apaga `localStorage`.
- Botas são desbloqueadas no nível 5, com dois itens de catálogo, migração compatível e equipagem no slot próprio.
- Impulso da Trilha libera no nível 5, custa 1 fôlego, aplica o bônus de velocidade apenas no mapa e expira com relógio do navegador; cada rank de cinco níveis acrescenta 5% e 2 segundos.
- `DEV23` em Ajustes cria ou retoma uma cópia de teste. O painel edita XP, ouro, bônus dos quatro atributos e ganho de XP em combate/missão; o HUD mostra MODO DEV e o retorno carrega o save normal.
- Na versão oficial v21, Broto, Besouro e Mariposa caminham em áreas pequenas com pausas variáveis. A interação usa a posição atual. Descansar avança uma permutação persistida de pontos de repouso; saves v20 recebem ciclo zero ao carregar. Guardião permanece fixo.

## Evidência e limites

Validação da v20: 49 testes de regras, build e 26 cenários E2E aprovados; PR #13 integrado e domínio conferido. Na v21, 51 testes de regras e build passaram. A regressão E2E teve 28/29 aprovados de primeira; o único erro era a expectativa desatualizada do teste de versão, corrigida e aprovada isoladamente. A amostra temporal e as capturas foram inspecionadas. O piloto de balanceamento do Impulso nos níveis 10 e 20 segue pendente.

## Retomada

V23 unifica Passo Ágil e Diário da Jornada, absorvendo o conteúdo planejado para v24. Teto base100 px/s, Impulso após o teto, catálogo completo e aba nos Ajustes. Branch `feat/v23-passo-diario` sobre v22; **60 testes, build e33 E2E aprovados**. Plano em `PLANO_V23_PASSO_E_DIARIO.md`, evidências em `docs/VALIDATION_V23.md`. Não há migração ou alteração de animações. Integrar v22 antes da v23 quando autorizado.

V22 implementada: identidade rara independente, chance de 10% por descanso após vitória original, substituição de um slot comum, patrulha/interação, recompensa única e migração compatível. **57 testes de domínio, build e 31 E2E aprovados**, incluindo 60 segundos de continuidade. Ver `docs/VALIDATION_V22.md`. Próxima ação: revisão/PR e integração quando autorizada.

[PR #15](https://github.com/JoaoFiscina/Fizzi-Quest/pull/15) aberto e sem conflitos; check Vercel do commit `6479408` aprovado. Implementação e documentos enviados ao GitHub. Próxima ação operacional: integrar este PR quando solicitado e conferir domínio oficial; não há área nova publicada.

Expansão futura em [PLANO_EXPANSAO_MUNDO.md](PLANO_EXPANSAO_MUNDO.md): fundação de áreas/missões → Ribeirão piloto → histórias secundárias → Pedreira → boss separado. Tutorial interno em [GUIA_QUALIDADE_EXPANSAO.md](GUIA_QUALIDADE_EXPANSAO.md), incluindo direção de tom mais maduro. Nenhuma área nova implementada. Velocidade/Impulso, Diário, Capa e Runas permanecem no backlog priorizado.
