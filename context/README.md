# Contexto do projeto — Fizzi Quest

Esta pasta é a memória operacional do jogo. Atualize-a a cada versão antes de encerrar uma etapa.

## Versão corrente

`v23.09.2003.6` — animações de walk com deslocamento real de 4px por perna; idle genuíno de 3 frames (respiração + piscar); monstros com 6 frames específicos por espécie; HUD compacto em grid 2 colunas; nav com ícone+label; modais com header dourado e atributos com valor em destaque.

## Árvore lógica

```text
fizzi-quest/
├── context/
│   ├── README.md                 ← este mapa e regras de continuidade
│   ├── ESTADO_ATUAL.md           ← o que funciona e o que está incompleto
│   ├── PROXIMOS_PASSOS.md        ← fila priorizada para a próxima sessão
│   ├── DECISOES.md               ← escolhas de produto e engenharia
│   └── HISTORICO_VERSOES.md       ← linha do tempo das versões
├── docs/GAME_SPEC.md             ← contrato original do produto
├── docs/VISUAL_POLISH_SPEC.md    ← pedido de continuação visual
├── docs/VALIDATION.md            ← evidências e limites da verificação
├── docs/DECISIONS.md             ← decisões técnicas e ponto de retomada
└── src/
    ├── domain/                   ← regras puras: treino, progressão, combate
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
