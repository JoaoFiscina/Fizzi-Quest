# Estado atual — v23.09.2003.19

Base: v23.09.2003.18 integrada à `main` pelo PR #11. Este ramo implementa a v23.09.2003.19 e aguarda validação final, PR e confirmação no domínio oficial.

## O que funciona

- Anel no nível 4, treino com resposta JSON curta e bônus limitado de PR da v17 continuam iguais. Não houve mudança no save, nas regras, nos sprites ou nas cadências gráficas.
- Preferência inicial `motion: system`: se o navegador do PC pede movimento reduzido, o jogo explica na intro e nos Ajustes que monstros e folhas param e água/fogo ficam discretos. **Ativar animações completas** escolhe `full` no save e o mundo é reconstruído no modo normal sem recarregar a página.
- `version.json` é gerado pelo build a partir de `src/version.ts`. No início, ao voltar à aba e a cada cinco minutos, o cliente compara a versão publicada. Se for mais nova, exibe **Atualizar jogo**; o clique salva o progresso e abre uma URL renovada. Os Ajustes permitem verificar manualmente.
- Falha de rede na consulta não impede jogar. O botão de atualização não apaga `localStorage`.
- Botas são desbloqueadas no nível 5, com dois itens de catálogo, migração compatível e equipagem no slot próprio.
- Impulso da Trilha libera no nível 5, custa 1 fôlego, aplica o bônus de velocidade apenas no mapa e expira com relógio do navegador; cada rank de cinco níveis acrescenta 5% e 2 segundos.

## Evidência e limites

46 testes de regras, build e 24 jornadas E2E passaram; a expiração do Impulso usa relógio do navegador para continuar correta quando a cadência de frames varia. Capturas e detalhes da entrega estão em `docs/VALIDATION_V19.md` e `docs/evidence/v23.09.2003.19/`. Falta somente enviar o commit ao GitHub e confirmar a produção.

## Retomada

Concluir a regressão/publicação da v19. Depois abrir o plano de movimentação de monstros com raio, ciclos variáveis e spawn raro de bosses. Roadmap e fila em `PROXIMOS_PASSOS.md` e `ROADMAP_IMPLEMENTACOES.md`.
