# Roadmap auditado de implementações futuras

Data da organização: 26/09/2026. Base de implementação: `v23.09.2003.15`.

Este documento registra intenções futuras. Um item só muda para concluído depois de implementação, testes e inspeção visual. Cada etapa deve manter saves existentes e receber uma versão `v23.09.2003.x` própria.

O roteiro de execução e publicação de cada etapa está em [`MOLDE_EXPANSAO.md`](MOLDE_EXPANSAO.md).

## Diagnóstico da base atual

| Área             | O que já existe                                                                       | Próxima evolução                                                                        |
| ---------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tipos de item    | Catálogo com `slot`: `weapon`, `shield`, `armor` e `accessory`                        | Exibir tags em português e organizar a mochila usando esse dado                         |
| Equipamentos     | Arma, escudo e armadura no HUD; pingentes no slot de acessório                        | Melhorar leitura, filtros e indicação de equipado                                       |
| Caminhada        | Quatro quadros por direção e idle                                                     | Refinar o ciclo e aplicá-lo às opções masculina e feminina                              |
| Mundo e monstros | Água, fogo, vento, bandeiras, árvores e monstros possuem ciclos básicos               | Variar ritmo, adicionar pausas ocasionais e reforçar identidade de cada criatura        |
| Zoom             | Escala inteira automática conforme a viewport                                         | Permitir preferência do jogador sem revelar área fora do mapa                           |
| Treinos          | XP, ouro e atributos com confiança, caps e redutor por atributo total                 | Dar mais peso aos atributos, reduzir XP e retirar o redutor ligado a nível/equipamentos |
| Habilidades      | Golpe pesado e recuperação iniciais; corte veloz no nível 2; impacto firme no nível 3 | Mostrar progressão, próximo desbloqueio e uso recomendado                               |
| Tutorial         | Orientação inicial curta                                                              | Criar uma aba consultável, com foco inicial em Defesa                                   |
| Mochila          | Lista única de itens com botão de equipar                                             | Agrupar, ordenar e identificar categorias e estado                                      |

## Etapa 1 — mochila, tags e tutorial — concluída na v23.09.2003.11

Objetivo: tornar sistemas existentes compreensíveis antes de adicionar mais conteúdo.

### Tags dos itens

- Usar `items[id].slot` como fonte única; não duplicar a categoria dentro do save.
- Mapear a interface para **Arma**, **Escudo**, **Armadura** e **Pingente**.
- Exibir a tag na loja, mochila, detalhes e tela do personagem.
- Manter bônus e regras de equipar separados da aparência da tag.

### Organização da mochila

- Mostrar primeiro os itens equipados.
- Agrupar ou filtrar por Armas, Escudos, Armaduras e Pingentes.
- Exibir nome, categoria, bônus e estado **Equipado** no mesmo cartão.
- Manter cartões compactos no celular e evitar espaços vazios grandes.
- Preparar a interface para novos itens sem alterar IDs existentes.

### Aba Tutorial

- Criar acesso permanente no menu, com tópicos curtos e expansíveis.
- Explicar movimento, interação, atributos, fôlego, equipamentos, treinos e progressão.
- Explicar Defesa conforme a regra real: age antes do inimigo, não custa fôlego e reduz pela metade o ataque recebido naquela rodada.
- Explicar intenção inimiga e os casos de carapaça/preparo.
- Mostrar somente instruções que correspondam ao comportamento implementado.

### Aceite

- Todo item mostra exatamente uma categoria correta.
- O jogador identifica rapidamente itens equipados e disponíveis.
- O tutorial explica Defesa sem exigir iniciar um combate.
- Save anterior abre sem migração destrutiva.

## Etapa 2 — zoom, personagem e diagonais — concluída na v23.09.2003.12

Objetivo: oferecer conforto visual e escolha cosmética sem mudar colisões ou atributos.

### Zoom personalizável

- Oferecer opções simples, como **Afastado**, **Padrão** e **Próximo**.
- Converter a preferência para escalas inteiras compatíveis com pixel art.
- Limitar cada opção conforme a viewport para não mostrar vazio fora do mapa.
- Recentralizar câmera e padding após resize ou mudança de mapa.
- Persistir a preferência e oferecer restauração do padrão.

### Personagem masculino ou feminino

- Adicionar uma preferência cosmética versionada ao save; saves antigos recebem o visual atual como padrão.
- Permitir escolha no início e alteração posterior nas opções.
- Usar a mesma hitbox, velocidade, atributos e regras para ambos.
- Criar idle e caminhada nas quatro direções para os dois conjuntos.
- Tratar a escolha somente como aparência, sem bônus de gameplay.

### Movimento composto

- Aceitar duas teclas direcionais simultâneas para as quatro diagonais.
- Disponibilizar oito posições no direcional móvel.
- Normalizar o vetor diagonal para manter a mesma velocidade total da caminhada reta.
- Permitir deslizamento por um eixo quando o outro estiver bloqueado por colisão.

### Aceite

- Zoom muda imediatamente, persiste após reload e permanece centralizado.
- 390×844, 430×932, 1366×768 e 1920×1080 não mostram área vazia indevida.
- Os dois personagens caminham nas quatro direções sem alterar colisão ou velocidade.
- Teclado e toque percorrem diagonais sem bônus de velocidade.

## Etapa 3 — terreno vivo — concluída na v23.09.2003.13

Objetivo: deixar o mundo mais vivo sem produzir ruído visual, mudar gameplay ou elevar o custo em aparelhos modestos.

- Água, fogo, árvores, tufos, vento e bandeiras usam ciclos finitos com fases e pausas individuais.
- O controlador mantém um único timer por mapa, agenda intervalos variados e limita a dois ciclos simultâneos.
- Folhas e poeira usam sprites pré-criados; nenhum objeto é criado continuamente em `update`.
- `prefers-reduced-motion` desativa detalhes decorativos e vegetação animada, limita a um ciclo e mantém apenas água/fogo em frequência reduzida.
- Troca de mapa e encerramento da cena destroem o controlador e removem seu timer.
- Save, colisões, posições, velocidade, zoom, combate e progressão não foram alterados.

### Aceite comprovado

- objetos semelhantes possuem fases diferentes;
- efeitos ativos nunca ultrapassam o limite configurado;
- troca de mapa retorna a um único timer ambiental;
- modo reduzido não mostra folhas ou poeira;
- desktop e 390×844 mantêm HUD, mapa e direcional legíveis.

## Etapa 4 — recuperação da fundação visual — implementada na v23.09.2003.14

Objetivo: corrigir a regressão perceptiva da v13 antes de adicionar mais arte.

- Separar movimentos-base, reações ocasionais e partículas raras.
- Água e fogo repetem continuamente no modo completo, com fases diferentes entre instâncias.
- O limite simultâneo se aplica a árvores, vegetação, bandeiras e partículas, não aos movimentos-base.
- Ajustes oferece **Completa**, **Usar sistema** e **Reduzida**, mostrando a opção ativa.
- Quadros precisam alterar forma, brilho ou ritmo de maneira legível na escala real.
- Testes medem pelo menos 30 segundos sem aceleração e comparam regiões entre quadros.
- Capturas parado/movimento idênticas reprovam a versão visual.

O diagnóstico e a nova régua de aceite estão em [`DIAGNOSTICO_GRAFICO_V13.md`](DIAGNOSTICO_GRAFICO_V13.md).

## Etapa 5 — criaturas e mapa — implementada na v23.09.2003.15

Guia de execução: [`PLANO_V15_COMPOSICAO_ESTETICA.md`](PLANO_V15_COMPOSICAO_ESTETICA.md). Inclui composição estática da vila/bosque, identidade das criaturas e mapa de consulta. Transições amplas de combate ficaram fora para conter a complexidade.

Objetivo: reforçar a identidade das criaturas e a leitura do mapa sem misturar mudanças de combate ou progressão.

- Refinar silhueta e detalhes dos quatro monstros dentro da escala atual.
- Dar idle, pausa e reação visual reconhecíveis para cada espécie.
- Criar ataques visuais que reproduzam eventos já calculados, sem alterar dano, ordem ou persistência.
- Melhorar transições de entrada e saída do combate.
- Respeitar `prefers-reduced-motion` nas reações e transições.
- Remodelar o mapa prévio, centralizar a rota e manter as regiões futuras bloqueadas.
- Preservar hitboxes, posições lógicas, spawns e resultado determinístico.

### Aceite

- capturas estáticas distinguem as criaturas pela forma;
- cada espécie possui ritmo visual próprio;
- reload durante apresentação não duplica dano nem recompensa;
- mapa prévio permanece legível em desktop e celular;
- áreas inexistentes continuam bloqueadas.

## Etapa 6 — balanceamento dos treinos e habilidades — implementada na v23.09.2003.16

Objetivo: fazer o treino participar mais da identidade física do personagem sem substituir a aventura.

### Novo princípio dos treinos

- Reduzir o XP de aventura concedido pelo treino; combate, missões e exploração continuam sendo as principais fontes de nível.
- Aumentar moderadamente o orçamento de atributos dos treinos detalhados.
- Remover o redutor atual calculado a partir do atributo total do personagem.
- Um treino equivalente deve conceder o mesmo ganho bruto de atributo independentemente do nível e dos equipamentos atuais.
- Equipamentos continuam sendo uma camada separada e temporária; não diminuem recompensas futuras de treino.
- Manter confiança efetiva, caps por sessão/dia, validação local e proteção contra duplicação.
- Simular progressão em personagens iniciais e avançados antes de definir números finais.

### Meta inicial para calibração

- Testar redução de aproximadamente 35% a 45% no XP de treino.
- Testar aumento de aproximadamente 20% a 30% nos limites de atributos de confiança média/alta.
- Comparar o mesmo treino nos níveis 1, 10 e 20, com e sem equipamentos.
- Confirmar que o ganho bruto não muda entre esses cenários e que caps diários continuam funcionando.

Essas faixas são hipóteses para teste, não valores finais aprovados.

Resultado da calibração: XP por sessão 60/132/216 (baixa/média/alta) e 270 por dia; teto de atributos 0,23 na média, 0,50 na alta e 0,60 por dia, com fator 1,25 para propostas média/alta. O redutor por atributo total foi retirado. Saves antigos conservam recompensas históricas. Simulações de níveis 1, 10 e 20 com e sem equipamento, 37 testes de domínio e 18 jornadas E2E passaram. Arte e animações não mudaram. Ver `PLANO_V16.md` e `docs/VALIDATION.md`.

### Habilidades progressivas

- Manter Corte veloz no nível 2 e Impacto firme no nível 3.
- Mostrar habilidades bloqueadas, requisito e próximo desbloqueio.
- Explicar custo de fôlego e função tática de cada ação.
- Avaliar novas habilidades somente após o conteúdo existente estar validado.

## Etapa 7 — mundo persistente e conteúdo existente

- Implementar respawn somente após definir tempo, limites e pontos caminháveis.
- Variar levemente a posição de retorno sem permitir spawn em obstáculos ou sobre o jogador.
- Adicionar patrulhamento curto sem misturar estado lógico e efeitos visuais.
- Completar e testar rota bifurcada, baú, chefe, guilda e recompensas únicas.
- Reavaliar a velocidade por Agilidade junto ao zoom e ao tamanho das áreas.

## Etapas 8 a 10 — novos slots liberados por nível

Esta expansão será dividida para que cada versão mantenha complexidade média, migração verificável e balanceamento compreensível. Os níveis são hipóteses iniciais para teste.

### v23.09.2003.17 — Anel, importação compacta e PR

Complexidade revisada: média-alta. Implementação da v17 concluída em dois blocos: Anel no nível 4 e importação compacta com bônus de PR. Testes e publicação devem ser conferidos em `docs/VALIDATION.md` e `ESTADO_ATUAL.md`.

- Criar metadados de requisito de nível por slot sem armazenar regras duplicadas no save.
- Mostrar slots futuros bloqueados, nível necessário e prévia do benefício.
- Manter o slot atual de Acessório para Broches e Pingentes.
- Adicionar somente o slot **Anel** e um catálogo pequeno para validar compra, equipar, backup e migração.
- Definir tratamento compatível para peças antigas que já estejam equipadas.
- IA analisa o relato fora do jogo e devolve somente ganhos e metadados mínimos em JSON compacto. Conservar importação v1 e recompensas históricas.
- Bônus de recorde pessoal aparece separado na prévia; proposta inicial de +0,02 atributo e +5 XP por PR, limitado a três no dia. Calibrar antes de publicar.

### v23.09.2003.18 — atualização e diagnóstico de animações

Ver `PLANO_V18_ATUALIZACAO_E_MOVIMENTO.md`: versão publicada detectável, botão de atualização e explicação da preferência de movimento reduzido no PC. Sem alteração da arte e do save.

### v23.09.2003.19 — Botas

Complexidade alvo: média-alta, limitada a um slot e uma habilidade temporária de exploração.

- Adicionar somente **Botas** sobre a fundação validada na versão anterior.
- Relacionar Botas a Agilidade sem alterar novamente a fórmula de deslocamento; validar o ganho real no mapa.
- Atualizar mochila, HUD resumido, personagem, loja e testes de combinações.
- Adicionar **Impulso da Trilha** no nível 5, com rank a cada cinco níveis: +5% de velocidade e 5 s no primeiro rank, acrescentando +5% e +2 s por rank; custo de 1 fôlego, somente no mapa e sem acumular.
- Manter o efeito em runtime, fora do save, e testar reload, troca de mapa, batalha, diagonais e expiração.
- Limitar esta versão a Botas, habilidade ativa e balanceamento; não incluir Capa, Runas, novas áreas ou nova camada de animações.

### v23.09.2003.20 — modo desenvolvedor

Plano detalhado: [`PLANO_V20_MODO_DESENVOLVEDOR.md`](PLANO_V20_MODO_DESENVOLVEDOR.md). O jogador antecipou esta etapa. Ativar por `DEV23`, editar XP de aventura, ouro e bônus dos quatro atributos e testar ganhos de XP em combate/missão. Save DEV separado, selo visível e retorno ao progresso normal intacto. PR #13 integrado; versão pública confirmada.

### v23.09.2003.21 — movimentação de monstros

Plano detalhado: [`PLANO_V21_MOVIMENTACAO_MONSTROS.md`](PLANO_V21_MOVIMENTACAO_MONSTROS.md). Publicada em 01/10/2026, PR #14 integrado e domínio oficial conferido. Complexidade: alta, por envolver simulação, colisões, interação e migração mínima do save. Evidências em `docs/VALIDATION_V21.md`.

- Dar a cada monstro comum uma área de movimentação predefinida, com centro, raio e pontos caminháveis; o Guardião permanece fixo.
- Executar ciclos variáveis de descanso e caminhada, mantendo o monstro dentro do raio e evitando obstáculos/jogador.
- Permitir troca de ponto de spawn entre monstros comuns ao descansar, com regras determinísticas e sem duplicação indevida.
- Deixar o boss raro para etapa posterior: a estrutura atual registra derrota por tipo, então a aparição rara precisará de identidade de instância independente do boss original.
- Validar em mapa, combate, reload, movimento reduzido e 30 segundos de observação real antes de integrar.

### v23.09.2003.22 — Guardião raro (implementada em branch)

Plano detalhado: [PLANO_V22_GUARDIAO_RARO.md](PLANO_V22_GUARDIAO_RARO.md). Complexidade alta e um único sistema estrutural: identidade de encontros. Implementação concluída; validação e revisão em `docs/VALIDATION_V22.md`.

- Desbloquear após vencer o boss original; gerar no máximo uma aparição rara persistida por descanso, substituindo um slot comum.
- Separar identidade e tipo, preservar missão/batalhas antigas e impedir reroll por reload ou mapa.
- Chance inicial de 10% e recompensas existentes do Guardião são hipóteses de piloto; validar economia e possíveis repetições antes de fechar.
- Reutilizar sprites e patrulha existentes. Não alterar animações ambientais ou adicionar equipamentos nesta etapa.

### v23 — Passo Ágil e Diário da Jornada (unificada, publicada em01/10/2026)

- Prioridade alta (velocidade) + média (diário); complexidade conjunta média. Pedido explícito para unir o conteúdo proposto para v23/v24, sem criar uma v24 fictícia.
- Implementada velocidade `min(100, 56 + Agilidade × 1,2)` em px/s de mundo; Impulso multiplica depois do teto. Níveis1/10/20, Botas, runtime100→140, diagonal, colisão e reload verificados. Ver `PLANO_V23_PASSO_E_DIARIO.md` e `docs/VALIDATION_V23.md`.
- Aba de Diário nos Ajustes com catálogo das entregas, versão instalada e teclado. Próxima fundação de áreas/missões permanece isolada, com numeração confirmada ao abrir a etapa.

### Versão posterior — Capa

Complexidade alvo: média. Adicionar o slot **Capa** com bônus defensivo moderado, após validar Botas em saves antigos e no celular. A loja, a ficha e o HUD devem continuar compactos.

### Versão posterior — Runas

Complexidade alvo: média-alta e isolada.

- Começar com um único slot e efeitos passivos simples que reutilizem regras existentes.
- Evitar empilhamento livre ou efeitos que alterem a ordem determinística do combate sem testes próprios.
- Definir nível de desbloqueio e catálogo final depois das simulações das versões 17 a 19.

### Regra de complexidade por versão

- Regra permanente do jogador (01/10/2026): todo roteiro apresenta ordem de execução, prioridade atribuída, complexidade e dependências. A fila ativa está em `PROXIMOS_PASSOS.md`; correções de bloqueios ou risco de perda de save têm precedência.
- Classificar como baixa (mudança localizada), média (várias superfícies apoiadas em regras existentes) ou alta (novo sistema, migração ou interação ampla entre sistemas); explicar classificações intermediárias quando úteis.
- Não reunir duas tarefas de alta complexidade na mesma versão. Dividir uma etapa quando o piloto revelar escopo maior; tarefas pequenas só acompanham o objetivo central se não ampliarem o risco ou atrasarem sua validação.
- Uma versão adiciona no máximo um sistema estrutural novo ou dois slots simples apoiados em fundação testada.
- Mudança de save, regra de combate e grande expansão visual não entram juntas.
- Cada novo slot precisa de migração, catálogo, loja, mochila, personagem, backup e E2E antes do próximo.

## Melhoria futura — Diário de versões nos Ajustes

**Implementado na v23 unificada**, junto do ajuste de velocidade, por pedido de 01/10/2026. Plano `PLANO_V23_PASSO_E_DIARIO.md`; validação em `docs/VALIDATION_V23.md`. O texto abaixo preserva os critérios do pedido inicial. Publicação confirmada no build oficial v23, PRs #15/#16 integrados.

Expansão de mundo separada por prioridade/complexidade em [PLANO_EXPANSAO_MUNDO.md](PLANO_EXPANSAO_MUNDO.md), com tutorial de qualidade em [GUIA_QUALIDADE_EXPANSAO.md](GUIA_QUALIDADE_EXPANSAO.md). Não juntar fundação de áreas, expansão gráfica ampla e novo sistema de combate na mesma entrega.

Pedido registrado em 01/10/2026. **Publicado na v23**, fora da v22. Complexidade da interface: baixa a média; entrega unificada com velocidade: média.

- Criar uma aba **Diário de versões** dentro dos Ajustes, com todas as atualizações publicadas, da mais recente para a mais antiga.
- Cada entrada apresenta versão `v23.09.2003.x`, data e resumo claro do que mudou: novidades, correções e ajustes de equilíbrio.
- Destacar a versão instalada e manter consulta compacta, legível e rolável no PC e celular.
- Manter um catálogo único de notas de lançamento e atualizá-lo em cada entrega; conferir as versões históricas com `HISTORICO_VERSOES.md`. Planos ainda não publicados não entram como mudanças entregues.
- Não exigir login ou alterar saves. Validar abertura, rolagem, fechamento e versões históricas sem controles inacessíveis.

## Verificação exigida em cada versão

1. `npm test`
2. `npm run build`
3. `npm run test:e2e`
4. Capturas em desktop e mobile das telas alteradas.
5. Teste de reload e migração quando o save mudar.
6. Atualização de `ESTADO_ATUAL.md`, `PROXIMOS_PASSOS.md`, histórico e evidências.
