# Plano v23.09.2003.19 — Botas e Impulso da Trilha

## 1. Objetivo da etapa

Adicionar o único slot de **Botas** previsto no roadmap e uma habilidade ativa de exploração liberada no nível 5. A habilidade aumenta temporariamente a velocidade do personagem no mapa, consumindo 1 ponto de fôlego. A etapa deve ampliar a sensação de progressão sem alterar combate, iniciativa, dano, colisões, diagonais, animações ambientais ou o formato do save de forma destrutiva.

Complexidade alvo: **média-alta, porém limitada**. Há um slot de equipamento e um efeito temporário de runtime. Não incluir Capa, Runa, novas áreas, patrulha, respawn variável ou redesenho de animações nesta versão.

## 2. Estado de referência

- Base oficial: v23.09.2003.18, com atualização de versão, preferência de movimento e save local preservado.
- A velocidade atual é calculada em `World` a partir de `56 + min(18, Agilidade × 1,2)`.
- Habilidades atuais são ações de combate (`Action`) com custo de fôlego e desbloqueio por nível.
- Equipamentos usam `items[id].slot`, `slotUnlockLevel`, loja, mochila, ficha, HUD e validação de backup.
- A habilidade nova não deve ser colocada em `Action`: ela ocorre na exploração, não consome rodada e não modifica a ordem de combate.

## 3. Botas — proposta funcional

### Desbloqueio e catálogo

Proposta para o piloto: liberar o slot no **nível 5**, alinhado ao primeiro nível da habilidade. O nível e os preços só ficam definitivos depois da simulação econômica.

- Adicionar `boots` ao conjunto de slots e ao `Save` como `ItemId | null`.
- Migrar saves anteriores com `boots: null`; manter `saveVersion` compatível e rejeitar somente estruturas realmente inválidas.
- Começar com dois itens, por exemplo uma Bota de Caminhada e uma Bota do Vento, com bônus pequenos e explícitos de Agilidade.
- Usar o mesmo caminho já validado: catálogo → loja → compra bloqueada → mochila → equipar → ficha/HUD → backup/reload.
- O bônus de Agilidade reaproveita a fórmula existente de velocidade; não criar uma segunda fórmula paralela.
- Exibir a tag **Botas**, estado **Equipado**, nível exigido e bônus no cartão compacto. O HUD pode mostrar um quarto/quinto indicador somente se couber nos quatro tamanhos de validação.

### Limites

Não permitir duas botas, empilhamento do mesmo item ou compra antes do nível. Não alterar a velocidade máxima diretamente no catálogo; o efeito passa por Agilidade e pela fórmula já existente.

## 4. Habilidade ativa — Impulso da Trilha

Nome de trabalho: **Impulso da Trilha**. O nome pode ser trocado no piloto sem mudar a regra.

### Progressão

Desbloqueia no nível 5 e sobe um rank a cada cinco níveis:

```text
rank = floor((nível - 5) / 5) + 1, para nível >= 5
bônus percentual = rank × 5%
duração = 5 + (rank - 1) × 2 segundos
custo = 1 ponto de fôlego
```

| Nível do personagem | Rank | Bônus de velocidade | Duração |
| ---: | ---: | ---: | ---: |
| 1–4 | bloqueada | — | — |
| 5–9 | 1 | +5% | 5 s |
| 10–14 | 2 | +10% | 7 s |
| 15–19 | 3 | +15% | 9 s |
| 20–24 | 4 | +20% | 11 s |

Os níveis acima de 20 seguem a mesma progressão inicialmente, mas devem ser simulados antes de abrir novos conteúdos. Não aplicar teto artificial nesta versão; revisar o crescimento depois do teste nos níveis 10 e 20.

### Comportamento

- Disponível somente na exploração do mapa, quando não há batalha, modal bloqueante ou transição de mapa.
- Ao ativar, validar nível e fôlego; consumir exatamente 1 fôlego em uma transação do `Store` e iniciar um efeito temporário no `World`.
- Aplicar o multiplicador à velocidade final do mapa: `velocidadeAtual × (1 + bônus)`. Não alterar `stats(s).speed`, atributos salvos, iniciativa, dano ou velocidade de combate.
- Não acumular ativações. Enquanto o Impulso estiver ativo, o botão fica desabilitado e o tempo restante é exibido; após expirar, pode ser ativado novamente se houver fôlego.
- Se a ativação falhar, não gastar fôlego. Recarregar a página encerra o efeito temporário; o fôlego já consumido permanece salvo.
- Movimento diagonal continua normalizado depois do multiplicador. Colisões continuam usando os mesmos limites e deslizamento por eixo.

### Interface

- Mostrar a habilidade na ficha com rank atual, requisito, custo e próxima melhoria.
- No mapa, oferecer um controle acessível **Impulso · 1** (ou o custo atual), com estado bloqueado antes do nível 5, sem fôlego e durante batalha.
- Exibir feedback curto ao ativar: `Impulso da Trilha: +5% por 5 s` (valores dinâmicos).
- Mostrar uma barra/contador discreto de duração e o fôlego atualizado no HUD; não cobrir o direcional em 390×844.
- Atalho de teclado só deve ser adicionado se houver uma indicação visível e uma alternativa por ponteiro/toque; não depender apenas de tecla.

## 5. Arquitetura prevista

### Domínio e save

- Criar uma função pura para calcular rank, percentual e duração a partir de `stats(s).level`.
- Adicionar `boots` ao tipo `Save`, schema, migração lazy, validação, `stats`, compra e equipamento.
- Manter o efeito ativo fora do `Save`, em estado transitório de `World` ou controlador de exploração. Assim, backup/reload não precisa gravar tempo de relógio nem expirar efeitos por data.
- Se a validação revelar que o contador precisa sobreviver à troca de cena, persistir apenas um estado claramente versionado; a escolha padrão é não persistir.

### Apresentação

- Implementar `activateTrailImpulse()` no limite entre UI e `World`; a UI não deve editar diretamente a velocidade.
- Fazer `World` calcular a velocidade base uma vez por sincronização e aplicar o multiplicador enquanto `performance.now()` estiver dentro do prazo.
- Limpar o timer no shutdown, troca de mapa, batalha e reload. Não criar timers por frame; usar um único estado temporal já existente ou um timer cancelável.
- Usar apenas um feedback visual leve e autoral, se necessário. Não alterar água, fogo, folhas, árvores ou ciclos dos monstros.

## 6. Execução em piloto

1. Criar save sintético de nível 5 sem Botas e confirmar bloqueio da habilidade.
2. Liberar o slot, comprar/equipar uma Bota e comparar a velocidade base antes/depois.
3. Ativar Impulso com 1 fôlego; medir deslocamento reto e diagonal durante 5 segundos.
4. Repetir nos níveis 10 e 20 para conferir +10%/7 s e +20%/11 s.
5. Testar expiração, segunda ativação, batalha, troca de mapa, reload e backup.
6. Só depois expandir os cartões, textos e catálogo para todos os fluxos.

## 7. Critérios de aceite

- Saves da v18 abrem com `boots: null`, sem perda de Anel, treino, posição ou preferências.
- Botas obedecem ao nível, preço, slot único, compra, equipar, mochila, HUD, ficha e backup.
- A habilidade fica bloqueada até o nível 5 e melhora exatamente nos níveis 10, 15, 20.
- Cada ativação válida gasta 1 fôlego, aumenta a velocidade pelo percentual correto e termina no segundo correto; falhas não gastam recurso.
- Não há acúmulo, alteração de iniciativa/dano, mudança de colisão ou aceleração diagonal indevida.
- Desktop e mobile em 390×844, 430×932, 1366×768 e 1920×1080 não apresentam rolagem horizontal nem controle inacessível.
- `npm test`, `npm run build`, `npm run test:e2e`, migração de save e capturas antes/depois passam.
- O ciclo ambiental da v18 continua igual por pelo menos 30 segundos; a nova habilidade não cria timers ambientais extras.

## 8. Fora do escopo e próximo passo

Ficam para v20 a Capa, para v21 a Runa e, depois, respawn variável, patrulhamento, novas áreas, refinamento de monstros e evolução estética maior do mapa. Após validar Botas e Impulso em uso real, recalibrar custo/duração antes de adicionar novos multiplicadores.
