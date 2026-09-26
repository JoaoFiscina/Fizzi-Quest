# Próximos passos

Use [`MOLDE_EXPANSAO.md`](MOLDE_EXPANSAO.md) em cada entrega. O roadmap completo está em [`ROADMAP_IMPLEMENTACOES.md`](ROADMAP_IMPLEMENTACOES.md).

## v23.09.2003.16 — concluída

37 testes de regras, build e 18 jornadas E2E aprovados. Capturas de treino/habilidades conferidas, PR #9 integrado e versão v23.09.2003.16 confirmada no domínio oficial.

## v23.09.2003.17 — Anel e desbloqueio por nível

Plano detalhado: [`PLANO_V17.md`](PLANO_V17.md). Complexidade média; um slot funcional novo, dois itens modestos, fundação de requisitos por nível e save compatível.

1. Conferir a economia após a v16 e testar o nível 4 (225 XP acumulados) como requisito do Anel.
2. Migrar saves sem o campo `ring` para `null`; manter Broches e Pingentes no Acessório.
3. Bloquear compra e equipamento antes do nível exigido no domínio e na interface.
4. Mostrar estado do slot em mochila, loja, personagem e HUD; Botas e Capa aparecem apenas como prévia futura.
5. Testar combinações, backup/reload, níveis 3/4 e telas móveis. Preservar todas as animações atuais.

## Depois da v17

- v18: Botas e Capa sobre a fundação validada.
- v19: um slot de Runa e efeitos passivos simples.
- Futuro: respawn variável em pontos caminháveis, patrulhamento e áreas novas; revisar proposta e complexidade antes de abrir cada etapa.
