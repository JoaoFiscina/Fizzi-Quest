# Estado atual — v23.09.2003.23 publicada

Em 01/10/2026, PR #15 (v22) integrado: `b3cf34979890ef396adc5ff93983639d9fc35ef3`; depois PR #16 (v23): `dcf05d21fc8c75f1e7fe3431b9be6f3e40697bba`. Main local sincronizada. Check Vercel do merge final aprovado.

## Versão oficial confirmada

https://fizzi-quest.vercel.app/ abriu com título e rodapé v23.09.2003.23. Continuar aventura carregou o bosque/HUD. Ajustes mostrou Preferências e Diário, com a v23 marcada como INSTALADA e a v22 no histórico. Smoke test público de versão/entrada/menu; regressão de gameplay realizada antes do merge, sem repetir toda a bateria nesta integração.

## O que foi entregue

- V22: Guardião errante raro após vencer o original, chance de10% por descanso, distribuição/derrota persistidas, patrulha/interação e recompensa única. Missão/emblema preservados; saves/batalhas antigos compatíveis.
- V23 unificada com o conteúdo planejado para v24: velocidade base até100 px/s; Impulso multiplica depois do teto e pode ultrapassá-lo. Diário das entregas nos Ajustes, datas e versão instalada.
- Botas, Anel, treino compacto e PRs, DEV23 isolado, diagonais, aparência, zoom, botão de atualização e animações aprovadas preservados.

## Evidências e limites

V22:57 testes/build/31 E2E aprovados. V23:60 testes/build/33 E2E aprovados, diário em quatro viewports e runtime100→140. Mobile emulado, não aparelho físico. Ver `docs/VALIDATION_V22.md` e `docs/VALIDATION_V23.md`. V22 foi integrada antes da v23; a conferência pública final é do build v23 contendo ambas.

## Próxima ação

Abrir o plano versionado da fundação de áreas/missões conforme `PLANO_EXPANSAO_MUNDO.md`, usando `GUIA_QUALIDADE_EXPANSAO.md` e `MOLDE_EXPANSAO.md`. Prioridade alta para expansão, complexidade alta, versão exclusiva. Nenhuma área nova foi implementada. Capa, Runas e áreas/bosses seguintes continuam separados por complexidade. Não criar v24 fictícia: conteúdo absorvido na v23; confirmar numeração da próxima entrega ao abrir a etapa.
