# Contexto do projeto — Fizzi Quest

Esta pasta é a memória operacional do jogo. Atualize-a a cada versão antes de encerrar uma etapa.

## Versão corrente

`v23.09.2003.12` — aparência masculina/feminina, zoom personalizável e movimento diagonal normalizado em teclado e toque.

## Árvore lógica

```text
fizzi-quest/
├── context/
│   ├── README.md                 ← este mapa e regras de continuidade
│   ├── ESTADO_ATUAL.md           ← o que funciona e o que está incompleto
│   ├── PROXIMOS_PASSOS.md        ← fila priorizada para a próxima sessão
│   ├── ROADMAP_IMPLEMENTACOES.md ← plano auditado das próximas melhorias
│   ├── DECISOES.md               ← escolhas de produto e engenharia
│   └── HISTORICO_VERSOES.md       ← linha do tempo das versões
├── docs/GAME_SPEC.md             ← contrato original do produto
├── docs/TRAINING_AI_FORMAT.md    ← contrato JSON, limites e fluxo do treino por IA
├── docs/VISUAL_POLISH_SPEC.md    ← pedido de continuação visual
├── docs/VISUAL_AUDIT_ANTIGRAVITY.md ← auditoria e decisões da restauração
├── docs/VALIDATION.md            ← evidências e limites da verificação
├── docs/DECISIONS.md             ← decisões técnicas e ponto de retomada
└── src/
    ├── domain/                   ← regras puras: treino, progressão, combate
    ├── content/                  ← prompt copiável para a IA externa
    ├── application/              ← Store, save e comandos de estado
    ├── game/                     ← Phaser, mapas, sprites e controles
    └── ui/                       ← menus e revisão de treino em DOM
```

## Backlog visual e de gameplay

- Melhorar a estética do mapa prévio sem perder a leitura da rota principal.
- Novas áreas bloqueadas e pixel art mais definida dos monstros e personagens.
- Refinar os tiles e texturas originais geradas no código.
- Após a primeira morte do monstro, implementar spawn espalhado e movimento de patrulha.

## Regra de continuidade

1. Ler este arquivo e `ESTADO_ATUAL.md` antes de alterar código.
2. Conferir `PROXIMOS_PASSOS.md` e escolher o primeiro item ainda aberto.
3. Executar validações reais; registrar falhas, não suposições.
4. Incrementar a versão no README, no histórico e na interface quando uma etapa for concluída.
5. Atualizar o próximo passo antes de parar.

## Limites

Não declarar “publicado”, “testado no celular”, “offline” ou “funciona no GitHub” sem evidência. A pasta `contexto/` é apenas um atalho em português para este índice. Consulte `AGENTS.md` para as regras de continuidade.
