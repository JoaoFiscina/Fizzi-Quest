# v23.09.2003.23 — Passo Ágil e Diário da Jornada

Pedido de 01/10/2026: juntar o conteúdo planejado para v23/v24. **Uma entrega jogável v23**, v24 absorvida e não criada como versão fictícia. Prioridade alta para velocidade e média para diário; complexidade conjunta média, sem novo sistema estrutural ou migração. Branch `feat/v23-passo-diario` sobre v22 (`4e2a2df`), integrada após a v22 pelos PRs #15/#16; domínio oficial v23 conferido em01/10/2026.

## Regras e organização

1. Velocidade em pixels de mundo por segundo: antes `56 + min(18, Agilidade × 1,2)`, até 74 px/s. Agora `min(100, 56 + Agilidade × 1,2)`, sem salto na faixa inicial.
2. Impulso aplicado **depois** do teto: base100 com +20% vira120 px/s; com +40% vira140 px/s. Custo, duração, ranks, expiração e não acumulação permanecem iguais.
3. Normalização diagonal e passo máximo de simulação preservados; piloto de colisão com velocidade alta e reload sem bônus transitório.
4. Diário como aba nos Ajustes, do mais recente ao mais antigo, data/resumo e versão instalada. Catálogo único em `src/content/releaseNotes.ts`; não inventar versões ausentes ou funcionalidades planejadas. Histórico inclui entregas presentes no build, sem chamar preview de publicação oficial.
5. Tabs acessíveis por clique/teclado e painel rolável pelos Ajustes existentes. Preservar configurações, backup, DEV, save, aparência e animações.

## Arquivos e critérios de aceite

- `src/domain/movement.ts`: regra pura; `world.ts` aplica o resultado.
- `src/content/releaseNotes.ts`, `main.ts`, `polish.css`: catálogo e abas.
- Testes de regras para início/teto/bônus e níveis1/10/20 com equipamento. E2E para runtime100→140, movimento, colisões, reload e diário em390/430/1366/1920.
- `npm test`, build e regressão E2E; capturas inspecionadas e evidência em `docs/evidence/v23.09.2003.23/`.

Não adicionar áreas, missões, slots ou mudar as animações nesta etapa. Próxima prioridade de expansão continua a fundação de áreas/missões, em versão própria; a numeração proposta v25+ será confirmada ao abrir cada etapa. A v23 permanece em branch até autorização de integração, com a v22 como dependência.
