# Roadmap auditado de implementações futuras

Data da organização: 15/09/2026. Base atual: `v23.09.2003.12`.

Este documento registra intenções futuras. Um item só muda para concluído depois de implementação, testes e inspeção visual. Cada etapa deve manter saves existentes e receber uma versão `v23.09.2003.x` própria.

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

## Etapa 3 — ambientação, monstros e mapa

Objetivo: deixar o mundo mais vivo sem produzir ruído visual ou custo excessivo.

- Manter animações ambientais ocasionais, com intervalos e fases variadas em vez de movimento contínuo sincronizado.
- Dar a cada monstro idle reconhecível, pequenas reações e ataque visual próprio.
- Refinar silhueta e detalhes em pixel art dentro da escala atual.
- Preservar hitboxes, posição, tempo de encontro e resultado determinístico do combate.
- Respeitar `prefers-reduced-motion` e limitar quadros para aparelhos modestos.
- Melhorar o mapa prévio, a centralização e a leitura das áreas bloqueadas.
- Integrar o antigo plano de animação de ataque nesta etapa.

### Aceite

- Capturas estáticas continuam legíveis e os monstros são distinguíveis pela forma.
- As animações alteram quadros de verdade, mas não deslocam a entidade lógica.
- Reload durante apresentação de combate não duplica dano nem recompensa.

## Etapa 4 — balanceamento dos treinos e habilidades

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
- Comparar cenários com o mesmo treino nos níveis 1, 10 e 20, com e sem equipamentos.
- Confirmar que o ganho bruto do treino não muda entre esses cenários.
- Confirmar que caps diários ainda impedem progressão excessiva por repetição.

Essas faixas são hipóteses para teste, não valores finais aprovados.

### Habilidades progressivas

- Manter os desbloqueios atuais como base: Corte veloz no nível 2 e Impacto firme no nível 3.
- Mostrar habilidades bloqueadas, requisito e próximo desbloqueio na tela do personagem ou tutorial.
- Explicar custo de fôlego e função tática de cada ação.
- Avaliar novos desbloqueios somente após chefe, missão e conteúdo existentes estarem validados.
- Evitar várias habilidades equivalentes que apenas mudem o multiplicador de dano.

### Aceite

- Testes registram os valores antes e depois do balanceamento.
- Nível e equipamento não reduzem a recompensa bruta de um mesmo treino.
- Treino influencia atributos mais do que XP, sem ultrapassar os limites diários.
- O jogador sabe qual habilidade será desbloqueada e como usar Defesa e fôlego.

## Etapa 5 — mundo persistente e conteúdo existente

- Implementar respawn somente após definir tempo, limites e pontos caminháveis.
- Variar levemente a posição de retorno sem permitir spawn em obstáculos ou sobre o jogador.
- Adicionar patrulhamento curto sem alterar a posição lógica durante efeitos visuais.
- Completar e testar rota bifurcada, baú, chefe, guilda e recompensas únicas.
- Reavaliar a velocidade por Agilidade junto ao zoom e ao tamanho das áreas.

## Etapas 6 a 8 — novos slots liberados por nível

Esta expansão será dividida para que cada versão mantenha complexidade média, migração verificável e balanceamento compreensível. Os níveis abaixo são hipóteses iniciais para teste.

### v23.09.2003.15 — fundação de desbloqueios e Anel

Complexidade alvo: média.

- Criar metadados de requisito de nível por slot sem armazenar regras duplicadas no save.
- Mostrar slots futuros bloqueados, nível necessário e prévia do benefício.
- Manter o slot atual de Acessório para Broches e Pingentes.
- Adicionar somente o slot **Anel** e um conjunto pequeno de itens para validar compra, equipar, backup e migração.
- Definir tratamento compatível para peças antigas que já estejam equipadas.

### v23.09.2003.16 — Botas e Capa

Complexidade alvo: média.

- Adicionar **Botas** e **Capa** sobre a fundação validada na versão anterior.
- Relacionar Botas principalmente a deslocamento/Agilidade e Capas a defesa ou utilidade, sem criar bônus dominantes.
- Atualizar mochila, HUD resumido, personagem, loja e testes de combinações.
- Limitar esta versão aos novos slots e ao balanceamento dos itens; não incluir runas.

### v23.09.2003.17 — Runas

Complexidade alvo: média-alta e isolada.

- Tratar Runas separadamente porque podem introduzir efeitos passivos, condições e combinações.
- Começar com um único slot e efeitos simples que reutilizem regras existentes.
- Evitar empilhamento livre ou efeitos que alterem a ordem determinística do combate sem testes próprios.
- Só definir nível de desbloqueio e catálogo final depois das simulações das versões 15 e 16.

### Regra de complexidade por versão

- Uma versão adiciona no máximo um sistema estrutural novo ou dois slots simples apoiados em uma fundação já testada.
- Mudança de save, regra de combate e grande expansão visual não entram juntas na mesma versão.
- Cada novo slot precisa de migração, catálogo, loja, mochila, tela do personagem, backup e E2E antes do próximo.

## Verificação exigida em cada versão

1. `npm test`
2. `npm run build`
3. `npm run test:e2e`
4. Capturas em desktop e mobile das telas alteradas.
5. Teste de reload e migração quando o save mudar.
6. Atualização de `ESTADO_ATUAL.md`, `PROXIMOS_PASSOS.md`, histórico e evidências.
