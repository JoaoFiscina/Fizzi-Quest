# Estado atual — v23.09.2003.16

Implementação concluída na branch `feat/v23.09.2003.16-treinos`; integração à `main` e deploy são confirmados separadamente abaixo. O último endereço oficial verificado antes desta etapa servia a v23.09.2003.15 em `https://fizzi-quest.vercel.app/`.

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

Pendente de confirmação do PR, commit de `main` e deploy. Não tratar a v16 como versão pública até `https://fizzi-quest.vercel.app/` mostrar a versão correta e iniciar o jogo.

## Próximo passo

v23.09.2003.17: Anel liberado por nível, com compra, equipamento, migração e interface, conforme `PLANO_V17.md`. As animações da v15 permanecem fora do escopo.
