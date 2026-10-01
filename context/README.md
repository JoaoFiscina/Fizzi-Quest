# Contexto do projeto — Fizzi Quest

Esta pasta é a memória operacional do jogo. Atualize-a a cada versão antes de encerrar uma etapa.

## Versão corrente

`v23.09.2003.21` — movimentação dos monstros comuns em validação nesta branch. A versão oficial permanece `v23.09.2003.20` até integração e verificação do domínio. Estado em `ESTADO_ATUAL.md` e plano em `PLANO_V21_MOVIMENTACAO_MONSTROS.md`.

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
│   ├── PLANO_V21_MOVIMENTACAO_MONSTROS.md ← próxima etapa: patrulha e repouso
│   ├── PLANO_IMPORTACAO_COMPACTA_PR.md ← resposta curta da IA e bônus de recorde
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
- Próxima prioridade após a v20: movimentação dos três monstros comuns na v21. Cada um terá área/raio predefinido e ciclos variáveis de pausa e caminhada.
- Ao descansar, monstros comuns poderão trocar entre si pontos de repouso compatíveis, sem sobrepor obstáculos ou o jogador.
- Boss derrotado como encontro raro fica para etapa posterior, pois exige distinguir instâncias do mesmo tipo no save e no combate.
- Elevar em versão futura o teto do ganho de velocidade de navegação por Agilidade; medir o efeito com Botas e Impulso antes de escolher o novo limite.
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
