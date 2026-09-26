# Estado atual — v23.09.2003.20 publicada

Base: v23.09.2003.20 integrada à `main` pelo PR #13. O domínio oficial `https://fizzi-quest.vercel.app/` mostrou a v20 e o campo DEV23 em Ajustes após o merge.

## O que funciona

- Anel no nível 4, treino com resposta JSON curta e bônus limitado de PR da v17 continuam iguais. Não houve mudança no save, nas regras, nos sprites ou nas cadências gráficas.
- Preferência inicial `motion: system`: se o navegador do PC pede movimento reduzido, o jogo explica na intro e nos Ajustes que monstros e folhas param e água/fogo ficam discretos. **Ativar animações completas** escolhe `full` no save e o mundo é reconstruído no modo normal sem recarregar a página.
- `version.json` é gerado pelo build a partir de `src/version.ts`. No início, ao voltar à aba e a cada cinco minutos, o cliente compara a versão publicada. Se for mais nova, exibe **Atualizar jogo**; o clique salva o progresso e abre uma URL renovada. Os Ajustes permitem verificar manualmente.
- Falha de rede na consulta não impede jogar. O botão de atualização não apaga `localStorage`.
- Botas são desbloqueadas no nível 5, com dois itens de catálogo, migração compatível e equipagem no slot próprio.
- Impulso da Trilha libera no nível 5, custa 1 fôlego, aplica o bônus de velocidade apenas no mapa e expira com relógio do navegador; cada rank de cinco níveis acrescenta 5% e 2 segundos.
- `DEV23` em Ajustes cria ou retoma uma cópia de teste. O painel edita XP, ouro, bônus dos quatro atributos e ganho de XP em combate/missão; o HUD mostra MODO DEV e o retorno carrega o save normal.

## Evidência e limites

Validação da v20: 49 testes de regras, build e 26 cenários E2E aprovados; capturas de desktop e celular emulado inspecionadas. PR #13 integrado e domínio oficial conferido na v20. O piloto de balanceamento do Impulso nos níveis 10 e 20 segue pendente.

## Retomada

Abrir a v21 de movimentação de monstros com raio, ciclos variáveis e spawn raro de bosses. Usar o modo DEV para testar o Impulso nos níveis 10 e 20. Roadmap e fila em `PROXIMOS_PASSOS.md` e `ROADMAP_IMPLEMENTACOES.md`.
