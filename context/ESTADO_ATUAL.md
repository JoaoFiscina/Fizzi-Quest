# Estado atual — v23.09.2003.16

Implementação integrada à `main` pelo PR #9 (`5aeca54`). Produção confirmada em `https://fizzi-quest.vercel.app/`: título e rodapé exibem v23.09.2003.16, e o cenário carrega.

## Resultado da v16

- XP por treino limitado a 60/132/216 por sessão e 270 por dia conforme confiança efetiva.
- Atributos de treinos médios/altos recebem fator 1,25 antes dos novos limites por sessão; o teto diário é 0,60.
- O mesmo treino concede os mesmos atributos brutos nos níveis 1, 10 e 20, com e sem equipamentos, quando o histórico diário é igual.
- Saves v15 com recompensas até 450 XP no mesmo dia permanecem aceitos e não são recalculados.
- Tela de combate mostra habilidades bloqueadas, nível, custo e uso. A ficha mostra o próximo desbloqueio.
- Nenhum arquivo de sprites, mapa, movimento ou animação foi alterado.

## Evidência e limites

Plano: `PLANO_V16.md`. Testes e capturas: `docs/VALIDATION.md` e `docs/evidence/v23.09.2003.16/`. A regra de treino continua usando o modelo JSON v1 e IA externa; a validação do jogo decide a recompensa final.

## Integração e produção

PR #9 integrado à `main` no commit `5aeca54e447bfd23cab4615f71f3a251257ee549`. O check Vercel passou. Em 26/09/2026, o navegador abriu o domínio fixo e mostrou `Fizzi Quest · v23.09.2003.16` no título, `v23.09.2003.16` no rodapé e a vila renderizada atrás da tela inicial.

## Próximo passo

v23.09.2003.17: Anel liberado por nível, com compra, equipamento, migração e interface, conforme `PLANO_V17.md`. As animações da v15 permanecem fora do escopo.
