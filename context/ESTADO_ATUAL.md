# Estado atual — v23.09.2003.17

Versão v17 integrada à `main` pelo PR #10 (`932bf7d67388728b3274d3f799747317b6dba643`) e confirmada no domínio oficial em 26/09/2026. Base anterior: v23.09.2003.16, PR #9.

## O que funciona

- Anel tem slot próprio, visível na mochila desde o início e liberado no nível 4 (225 XP acumulados). Loja e domínio bloqueiam compra/equipamento antes do nível. Anel de cobre dá +1 Força por 35 ouro; Anel da brisa dá +1 Agilidade por 40 ouro. Broches e Pingentes continuam em Acessório.
- Save v16 sem `ring` ou `pendingTraining` migra com `null`; chave e versões do save continuam iguais. Backups inválidos não substituem o progresso. Combate, XP antigo e animações não foram recalculados.
- O jogo cria um rascunho com ID/data, copia um modelo preciso e aceita JSON compacto v2. Prévia separa treino, bônus de PR, ajustes e total. Confirmar aplica a recompensa e consome o rascunho no mesmo save; duplicatas por ID são barradas.
- PR elegível sugerido pela IA dá +5 XP e +0,02 no atributo relacionado, limitado a três por sessão e dia. Confiança baixa não recebe bônus. Importação detalhada v1 e histórico anterior continuam aceitos.

## Limites e retomada

O código curto omite o treino original. O jogo valida estrutura, ID, limites e persistência, mas a evidência de PR depende da análise externa; não há autenticação do treino. O prompt e os testes foram verificados com dados sintéticos, sem consulta real a uma IA externa. Observar o balanceamento antes de abrir Botas na v18.

Planos: `PLANO_V17.md` e `PLANO_IMPORTACAO_COMPACTA_PR.md`. Contrato em `docs/TRAINING_AI_FORMAT.md`. Validação em `docs/VALIDATION.md`. Próxima etapa em `PROXIMOS_PASSOS.md`.

## Integração e produção

O endereço fixo `https://fizzi-quest.vercel.app/` exibiu `Fizzi Quest · v23.09.2003.17` no título e `v23.09.2003.17` no rodapé. A vila renderizou, **Nova aventura** iniciou normalmente e o Diário mostrou o fluxo novo **Escolha a data do treino → Criar modelo → prompt com ID**. O check Vercel do commit da branch passou antes do merge. Não foi feita uma análise real por IA externa na produção.
