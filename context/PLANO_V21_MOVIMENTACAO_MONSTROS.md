# Plano de execução — v23.09.2003.21: movimentação dos monstros

Estado: **implementado nesta branch, em validação**. Base oficial confirmada: v23.09.2003.20. Objetivo central: fazer os três monstros comuns do bosque caminharem em pequenas áreas próprias, com pausas de duração variável, e redistribuir seus pontos de repouso após descansar. Manter o Guardião no posto de vigia nesta etapa.

## Problema observável e resultado esperado

Hoje `makeMap(true)` define uma posição fixa para Broto, Besouro, Mariposa e Guardião. `World.build()` desloca cada sprite uma única vez em até cinco pixels, mas `World.update()` só movimenta o jogador. A aproximação e o botão **E** consultam `mapData.entities`, portanto uma animação que mexesse apenas no sprite criaria encontros no lugar antigo.

Na v21, o jogador deverá ver cada criatura comum alternar entre observar o ambiente e caminhar poucos passos dentro de uma área reconhecível. A indicação de interação acompanha a posição atual. Após descansar, as criaturas comuns reaparecem e podem trocar entre si pontos de repouso válidos; nenhuma criatura aparece sobre árvore, rocha, jogador ou outra criatura. O Guardião continua reconhecível e parado no posto.

## Escopo e limite de complexidade

1. **Áreas de patrulha:** Broto, Besouro e Mariposa têm identidade estável, centro de repouso, raio máximo e pontos candidatos caminháveis. Definir os valores com um piloto em escala real; começar pelo Broto. Preservar os caminhos centrais e a leitura da direção de cada encontro.
2. **Ciclos variáveis:** usar uma máquina de estados `idle → walk → idle`, com duração escolhida por gerador pseudoaleatório determinístico por criatura e ciclo. A variação deve ser perceptível sem sincronizar as três criaturas. Caminhada curta, sem perseguir o jogador e sem teleporte durante a exploração.
3. **Colisão e posição:** verificar destino e segmentos com `walkable`; não atravessar terreno sólido, outro monstro ou o espaço imediato do jogador. Ao falhar, escolher outro ponto ou descansar. O sprite e a área de interação compartilham a mesma posição de runtime.
4. **Combate e derrota:** congelar o monstro ao iniciar encontro; ao vencer, ocultar aquela criatura usando o `defeated` atual. Fuga/derrota mantêm uma posição válida. O combate por turnos e suas recompensas não mudam.
5. **Descanso:** somente a ação da fogueira redistribui os centros dos três monstros comuns. Persistir uma pequena ordem/permutação de pontos no save, com migração de saves antigos para a ordem original. Cada posição continua com exatamente um ocupante; o Guardião não participa.
6. **Acessibilidade e desempenho:** `motion: reduced` mantém monstros em repouso e interação correta. Pausar a simulação em modal, combate e aba em segundo plano; ao voltar, não aplicar um salto equivalente ao tempo ausente. Não criar um timer Phaser por monstro a cada frame nem reconstruir sprites continuamente.

Ficam fora da v21: perseguição, ataque automático ao tocar, novos monstros, mudanças no combate, nova área, novo slot, novos sprites e aumento do limite de velocidade por Agilidade. A possibilidade de Guardião raro após a derrota passa para um plano posterior: hoje `defeated` e `startBattle` tratam `guardian` por tipo, então um encontro raro da mesma espécie precisará de identidade de instância e regra própria de desbloqueio/respawn. Misturar isso com patrulha e migração elevaria o risco da versão.

## Contrato técnico proposto

| Camada | Mudança prevista | Invariante |
| --- | --- | --- |
| `src/game/maps.ts` | Definir identificador e configuração de patrulha para cada monstro comum; preservar os pontos originais como âncoras | `walkable` aceita todos os pontos escolhidos |
| `src/game/monsterMovement.ts` (novo) | Funções puras para escolher próximo estado/destino e avançar um passo por delta limitado | Mesmo estado, seed e delta produzem mesmo resultado |
| `src/game/world.ts` | Manter atores de runtime com posição atual, sprite e fase; atualizar movimento e proximidade pelo ator | O encontro aparece onde a criatura está visível |
| `src/domain/game.ts` | Acrescentar estado mínimo da redistribuição ao save e avançá-lo no descanso | `defeated`, missão e recompensa continuam com a semântica atual |
| `src/application/store.ts` | Validar/migrar o campo opcional de ordem dos repousos | Save e backup da v20 abrem sem perda |
| `src/main.ts` | Exibir texto de descanso coerente com a redistribuição, se ocorrer | A ação persiste antes de atualizar o mapa |

Os três monstros comuns ainda existem em uma única instância cada. Sua **identidade** (tipo, combate, derrota) fica separada da **âncora atual** (ponto de repouso) e da **posição transitória** (caminhada). Persistir apenas a redistribuição feita no descanso; a posição transitória pode reiniciar na âncora ao recarregar. Isso evita gravar dezenas de coordenadas por segundo. Fazer a escolha de destino com candidatos pré-validados, limites de raio e tentativas finitas; se não houver destino, permanecer em `idle`.

O desenho da cena deve ordenar profundidade por `y` enquanto o monstro caminha. A indicação de **E** usa a distância até a posição atual do ator, com o mesmo alcance de 25 px salvo ajuste testado. Se o jogador iniciar combate, a criatura não muda de lugar enquanto o encontro estiver aberto. `reduced` não deve esconder criatura nem impedir combate.

## Ordem de execução e piloto

| Passo | Trabalho | Prova antes de avançar |
| --- | --- | --- |
| 1. Referência | Salvar cena do bosque da v20 com save sintético, 1366×768 e 390×844, zoom Padrão e modos Completa/Reduzida | Posições, alcance de **E**, save e cadência atual registrados |
| 2. Piloto Broto | Introduzir ator de runtime, raio pequeno, `idle/walk`, colisão e interação móvel apenas no Broto | Observar por 30 s: desloca, para, retorna a caminhar, nunca ativa encontro no ponto antigo |
| 3. Expandir | Configurar Besouro e Mariposa com fases desencontradas; ajustar raios à geografia real | Três ciclos visíveis sem atravessar obstáculos ou bloquear a rota |
| 4. Descanso e save | Redistribuir pontos compatíveis em uma permutação determinística, persistir e migrar v20 | Descansar, sair/entrar no bosque, recarregar, importar backup v20 e repetir sem duplicações |
| 5. Fechar | Estados reduzido, modal, batalha, fuga, vitória, DEV23, versão e contexto | Testes, build, E2E, capturas e revisão do diff aprovados |

Se o piloto mostrar que a troca entre as três âncoras prejudica a leitura do mapa, restringir pares compatíveis e registrar a decisão antes de expandir. Nunca resolver colisão com teleporte visível.

## Aceite e validação

- Cada criatura comum permanece dentro de sua área definida por configuração e executa pelo menos dois ciclos completos de pausa/caminhada em uma observação de 30 s. O ciclo não para após duas mudanças.
- O botão **E** acompanha a posição visível, abre o tipo correto de combate e deixa de apontar para o ponto antigo. Vitória a oculta; descanso a restaura.
- Não há passo dentro de terreno sólido, sobreposição entre criaturas nem salto ao voltar de aba/modal/combate. A contagem de sprites e temporizadores permanece estável por 60 s.
- Descanso altera somente a distribuição permitida; a permutação persiste após reload e não altera missão, inventário, treino, ouro ou XP. Saves e backups anteriores continuam válidos.
- Modos Completa e Reduzida, zoom, teclado, toque e DEV23 continuam utilizáveis. Inspecionar em escala real no desktop e em 390×844; emulação não equivale a aparelho físico.
- Rodar `npm test`, `npm run build`, `npm run test:e2e`, um E2E de 30 s para movimento/interação e um de descanso/reload. Guardar evidências em `docs/evidence/v23.09.2003.21/before/` e `after/`, com seed, save, zoom, viewport e preferência de movimento no README.

## Entrega e continuidade

Implementar em branch própria; só então mudar `src/version.ts` para `v23.09.2003.21`, `package.json`/lockfile, README, histórico e validação. Criar PR após o piloto e a regressão. Integrar e publicar somente quando autorizado, verificar o domínio oficial e registrar o resultado. Na versão posterior, planejar separadamente o Guardião raro. O aumento do teto de velocidade por Agilidade também fica para uma versão de balanceamento posterior, com teste de velocidade normal, diagonal e Impulso da Trilha.
