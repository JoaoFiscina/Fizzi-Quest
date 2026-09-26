# Estado atual — v23.09.2003.18

Base: v23.09.2003.17 integrada à `main` pelo PR #10. A v18 está na branch `fix/v23.09.2003.18-atualizacao` enquanto ocorre a validação/publicação.

## O que funciona

- Anel no nível 4, treino com resposta JSON curta e bônus limitado de PR da v17 continuam iguais. Não houve mudança no save, nas regras, nos sprites ou nas cadências gráficas.
- Preferência inicial `motion: system`: se o navegador do PC pede movimento reduzido, o jogo explica na intro e nos Ajustes que monstros e folhas param e água/fogo ficam discretos. **Ativar animações completas** escolhe `full` no save e o mundo é reconstruído no modo normal sem recarregar a página.
- `version.json` é gerado pelo build a partir de `src/version.ts`. No início, ao voltar à aba e a cada cinco minutos, o cliente compara a versão publicada. Se for mais nova, exibe **Atualizar jogo**; o clique salva o progresso e abre uma URL renovada. Os Ajustes permitem verificar manualmente.
- Falha de rede na consulta não impede jogar. O botão de atualização não apaga `localStorage`.

## Evidência e limites

44 testes de regras, build e 22 jornadas E2E passaram. A reprodução no Edge emulado confirmou movimento reduzido e retomada dos ciclos; a recarga com manifesto novo simulado preservou o save. Capturas e detalhes em `docs/VALIDATION.md` e `docs/evidence/v23.09.2003.18/`. O modo do PC real do jogador não foi lido; conferir nele se a preferência do navegador é reduzida. O cliente v17 não tem o verificador e precisa de uma recarga inicial para recebê-lo.

## Retomada

Concluir integração e verificação de `https://fizzi-quest.vercel.app/` antes de chamar a v18 de oficial. Depois, observar o equilíbrio do Anel/treino e planejar Botas na v19. Roadmap e plano em `PROXIMOS_PASSOS.md` e `PLANO_V18_ATUALIZACAO_E_MOVIMENTO.md`.
