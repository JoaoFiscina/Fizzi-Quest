# Contexto do projeto — Fizzi Quest

Esta pasta é a memória operacional do jogo. Atualize-a a cada versão antes de encerrar uma etapa.

## Versão corrente

`v23.09.2003.16` — calibração do treino e apresentação dos desbloqueios de habilidades. Código implementado em branch; integração e deploy registrados em `ESTADO_ATUAL.md` assim que confirmados. Planos em `PLANO_V16.md` e `PLANO_V17.md`.

## Árvore lógica

```text
fizzi-quest/
├── context/
│   ├── README.md                 ← este mapa e regras de continuidade
│   ├── ESTADO_ATUAL.md           ← o que funciona e o que está incompleto
│   ├── PROXIMOS_PASSOS.md        ← fila priorizada para a próxima sessão
│   ├── PLANO_V15_COMPOSICAO_ESTETICA.md ← plano executado da v15
│   ├── PLANO_V16.md             ← balanço de treino e habilidades
│   ├── PLANO_V17.md             ← próximo slot: Anel
│   ├── MOLDE_EXPANSAO.md         ← roteiro reutilizável para novas versões
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
- Após a primeira morte do monstro, implementar spawn espalhado e movimento de patrulha.

## Regra de continuidade

1. Ler este arquivo e `ESTADO_ATUAL.md` antes de alterar código.
2. Conferir `PROXIMOS_PASSOS.md` e escolher o primeiro item ainda aberto.
3. Executar validações reais; registrar falhas, não suposições.
4. Incrementar a versão no README, no histórico e na interface quando uma etapa for concluída.
5. Atualizar o próximo passo antes de parar.
6. Abrir a próxima versão com `MOLDE_EXPANSAO.md` e adaptar sua validação ao tipo de mudança.

## Limites

Não declarar “publicado”, “testado no celular”, “offline” ou “funciona no GitHub” sem evidência. A pasta `contexto/` é apenas um atalho em português para este índice. Consulte `AGENTS.md` para as regras de continuidade.
