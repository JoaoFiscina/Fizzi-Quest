# Validação — v23.09.2003.23

Entrega unificada de velocidade e Diário de versões (v24 planejada absorvida). Base branch v22, commit `4e2a2df`, PR #15 ainda dependência. Oficial permanece v21 até integração autorizada. Gameplay/artes ambientais da v22 preservados.

## Regras e piloto calculável

Unidade: pixels de mundo por segundo. Base `min(100, 56 + Agilidade × 1,2)`; multiplicador do Impulso vem depois do teto. Agilidade5:62 px/s (igual antes), Agilidade20:80 (antes74), Agilidade50:100; Impulso20%:120,40%:140. Sem teto posterior ao Impulso.

Fixtures nos níveis1/10/20, XP0/1350/5225 e pontos livres em Agilidade: base62/72,8/84,8. Botas do vento adicionam2 de Agilidade nos níveis elegíveis:75,2/87,2. Impulso10%/20% resulta82,72/104,64. Nenhuma mudança no ganho de iniciativa/combate, custo ou duração da habilidade. Fixture nível40 (XP20475,35 pontos em Agilidade) verifica runtime100→140 e reload100 com fôlego gasto salvo.

## Verificações

- `npm test`: **60/60 aprovados**, incluindo ganho/teto/Impulso, níveis e integridade do catálogo de versões.
- `npm run build`: aprovado, com avisos existentes de Zod/chunk Phaser.
- `npm run test:e2e`: **33/33 aprovados** na execução completa (5,4 minutos), incluindo runtime100→140, diagonal, colisão, reload e abas do Diário. Fluxos de animação, encontro raro, treinos, DEV, backup e atualização também aprovados.
- Evidências em `docs/evidence/v23.09.2003.23/after/`, diário nos quatro viewports. Capturas390 e1366 inspecionadas: cartões legíveis, versão instalada destacada, conteúdo rolável e controles acessíveis. Mobile é emulação, não aparelho físico.

Catálogo `src/content/releaseNotes.ts` cobre todas as entregas registradas, sem inventar os sufixos5/7 ou uma v24 entregue. V22/v23 no catálogo representam conteúdo presente no build, sem afirmar que preview foi publicado em produção. Manter o catálogo ao fechar cada entrega e conferir com `HISTORICO_VERSOES.md`.

## Limites e publicação

Não há áreas/missões novas. Save e animações não mudaram. Branch `feat/v23-passo-diario`; PR deverá apontar para a branch v22 enquanto ela não estiver na main, preservando ordem de integração. Não chamar a v23 de oficial antes do merge autorizado e conferência do domínio.

[PR #16](https://github.com/JoaoFiscina/Fizzi-Quest/pull/16) aberto e sem conflitos, base `feat/v22-guardiao-raro` (dependência PR #15). Check Vercel do commit `db4c3d5`: **success**, [preview](https://vercel.com/joao-fiscina-s-projects/fizzi-quest/5ELsNTzX7f6xsFyFj2874yfZrDxY). O fluxo jogável foi verificado localmente; check de preview não substitui conferência do domínio oficial.

## Publicação confirmada — 01/10/2026

PR #15 integrado primeiro (b3cf349), PR #16 redirecionado à main e integrado (dcf05d21fc8c75f1e7fe3431b9be6f3e40697bba). Check Vercel final: success, deployment https://vercel.com/joao-fiscina-s-projects/fizzi-quest/6u9bfG7RiBJqN6VoAdPS9jdtS5ik. No domínio oficial, título/rodapé v23, entrada na aventura, Preferências e Diário conferidos; v23 INSTALADA e histórico v22 visíveis. Smoke test público, sem nova regressão completa. Notas anteriores de preview/publicação pendente são o registro pré-merge.
