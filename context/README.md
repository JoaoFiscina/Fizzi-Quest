# Contexto do projeto — Fizzi Quest

Esta pasta é a memória operacional do jogo. Atualize-a a cada versão antes de encerrar uma etapa.

## Versão corrente

`v23.09.2003.23` — velocidade e Diário publicados na main pelo PR #16, após o PR #15 da v22, em 01/10/2026. Plano em [PLANO_V23_PASSO_E_DIARIO.md](PLANO_V23_PASSO_E_DIARIO.md); v24 proposta foi absorvida. Oficial v23 confirmada no título, rodapé, entrada e Diário dos Ajustes.

`v23.09.2003.22` — Guardião raro integrado pelo PR #15, incluído no build oficial v23. Estado em `ESTADO_ATUAL.md`; plano em [`PLANO_V22_GUARDIAO_RARO.md`](PLANO_V22_GUARDIAO_RARO.md). Expansão futura em [`PLANO_EXPANSAO_MUNDO.md`](PLANO_EXPANSAO_MUNDO.md), com tutorial em [`GUIA_QUALIDADE_EXPANSAO.md`](GUIA_QUALIDADE_EXPANSAO.md).

## Árvore lógica

```text
fizzi-quest/
├── context/
│   ├── README.md                 ← este mapa e regras de continuidade
│   ├── ESTADO_ATUAL.md           ← o que funciona e o que está incompleto
│   ├── PROXIMOS_PASSOS.md        ← fila priorizada para a próxima sessão
│   ├── PLANO_V15_COMPOSICAO_ESTETICA.md ← plano executado da v15
│   ├── PLANO_V16.md             ← balanço de treino e habilidades
│   ├── PLANO_V17.md             ← Anel e integração do treino compacto
│   ├── PLANO_V18_ATUALIZACAO_E_MOVIMENTO.md ← diagnóstico PC/celular e atualização
│   ├── PLANO_V19_BOTAS_E_IMPULSO.md ← Botas e habilidade ativa de velocidade
│   ├── PLANO_V20_MODO_DESENVOLVEDOR.md ← DEV23 para testes isolados
│   ├── PLANO_V21_MOVIMENTACAO_MONSTROS.md ← patrulha e repouso publicados
│   ├── PLANO_V22_GUARDIAO_RARO.md ← próximo update: encontros raros persistentes
│   ├── PLANO_IMPORTACAO_COMPACTA_PR.md ← resposta curta da IA e bônus de recorde
│   ├── MOLDE_EXPANSAO.md         ← roteiro reutilizável para novas versões
│   ├── PLANO_V23_PASSO_E_DIARIO.md ← velocidade e Diário na mesma entrega
│   ├── PLANO_EXPANSAO_MUNDO.md   ← áreas, missões, criaturas e prioridades futuras
│   ├── GUIA_QUALIDADE_EXPANSAO.md ← tutorial interno de arte, animações e tom
│   ├── ROADMAP_IMPLEMENTACOES.md ← plano auditado das próximas melhorias
│   ├── DIAGNOSTICO_GRAFICO_V13.md ← causa da regressão visual e nova régua de aceite
│   ├── DECISOES.md               ← escolhas de produto e engenharia
│   └── HISTORICO_VERSOES.md       ← linha do tempo das versões
├── docs/GAME_SPEC.md             ← contrato original do produto
├── docs/TRAINING_AI_FORMAT.md    ← contrato JSON, limites e fluxo do treino por IA
├── docs/VISUAL_POLISH_SPEC.md    ← pedido de continuação visual
├── docs/VISUAL_AUDIT_ANTIGRAVITY.md ← auditoria e decisões da restauração
├── docs/VALIDATION.md            ← evidências e limites da verificação
├── docs/VALIDATION_V15.md        ← validação arquivada da versão anterior
├── docs/VALIDATION_V16.md        ← validação arquivada da v16
├── docs/DECISIONS.md             ← decisões técnicas e ponto de retomada
└── src/
    ├── domain/                   ← regras puras: treino, progressão, combate
    ├── content/                  ← prompt copiável para a IA externa
    ├── application/              ← Store, save e comandos de estado
    ├── game/                     ← Phaser, mapas, sprites e controles
    └── ui/                       ← menus e revisão de treino em DOM
```

## Backlog visual e de gameplay

- Continuar a estética do mundo quando novas áreas jogáveis forem planejadas.
- Avaliar futuro refinamento do protagonista e de tiles secundários na escala atual.
- V21 publicada: três monstros comuns patrulham áreas limitadas e trocam pontos de repouso ao descansar, com interação sincronizada.
- Próxima prioridade, v22: Guardião errante raro após vencer o original. Identidade independente, sorteio persistido por descanso, missão preservada e no máximo um raro. Ver plano detalhado; chance e recompensa são hipóteses de piloto.
- Elevar em versão futura o teto do ganho de velocidade de navegação por Agilidade; medir o efeito com Botas e Impulso antes de escolher o novo limite.
- Adicionar futuramente o **Diário de versões** nos Ajustes com todas as atualizações publicadas; pedido de 01/10/2026 registrado no roadmap, fora da v22.
- Modo desenvolvedor `DEV23` implementado na v20: XP, ouro e bônus de atributos em um save de teste separado. Ver `PLANO_V20_MODO_DESENVOLVEDOR.md`.

## Regra de continuidade

1. Ler este arquivo e `ESTADO_ATUAL.md` antes de alterar código.
2. Conferir `PROXIMOS_PASSOS.md` e escolher o primeiro item ainda aberto.
3. Executar validações reais; registrar falhas, não suposições.
4. Incrementar a versão no README, no histórico e na interface quando uma etapa for concluída.
5. Atualizar o próximo passo antes de parar.
6. Abrir a próxima versão com `MOLDE_EXPANSAO.md` e adaptar sua validação ao tipo de mudança.

## Limites

Não declarar “publicado”, “testado no celular”, “offline” ou “funciona no GitHub” sem evidência. A pasta `contexto/` é apenas um atalho em português para este índice. Consulte `AGENTS.md` para as regras de continuidade.
