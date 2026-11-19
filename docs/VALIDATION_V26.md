# Validação — v23.09.2003.26 (Bosque Vivo)

Etapa 3 do `context/PLANO_MELHORIA_GERAL.md` (bosque com identidade), ampliada a pedido do jogador para refazer a estética mais bruta e melhorar as animações dos personagens. Branch `feat/v26-bosque-identidade` sobre a main com a v25 publicada (`b09b419`). Regras, combate, colisão por tile e formato de save não mudaram.

## O que mudou

| Item | Antes | Agora |
|------|-------|-------|
| Chão | Um sprite por tile + sobreposições de borda (~1.120 objetos no bosque) | Uma textura de canvas por mapa, gerada uma vez e reaproveitada; menos de 80 objetos no `root` do bosque |
| Caminho | Bordas retas com cantos quadrados | Cantos internos e externos arredondados (média em janela de 11 px + ruído), borda escura e grama pisada na transição |
| Grama | Mesma grama clara na vila e no bosque | Tons agrupados por ruído; bosque mais frio e escuro, com manchas de sombra de copa; folhas de capim de 2 px |
| Água | Retângulo sobre a grama | Margem escura de 2 px |
| Árvores | Uma árvore em blocos, em grade (x/y ímpares), sombra retangular | Carvalho, pinheiro e carvalho escuro com contorno, volume e luz no alto à esquerda; copa superior balança 1 px; sombra elíptica |
| Distribuição | Grade regular | Ruído determinístico: menos árvores perto do caminho e mais no fundo do bosque, espaçamento mínimo, deslocamento visual de até 3 px (colisão continua no tile) |
| Vegetação | Só árvores | Arbustos e tocos sólidos por tile; samambaias, cogumelos, flores de sombra, musgo e folhas secas na trilha |
| Bruma | Nenhuma | Duas faixas leves com parallax e deriva lenta; paradas no modo reduzido |
| Personagens | Retângulos sem contorno, passo de 3 quadros | Herói, heroína, mestre e mercador redesenhados nas 4 direções, com contorno; caminhada de 4 quadros (passo, passagem com 1 px de elevação, passo); idle com respiração de 1 px e piscada; capa e bainha da espada |
| Monstros e objetos | Sem contorno, sombra pintada na textura | Contorno de 1 px na cor de contorno da paleta; sombras elípticas numa camada própria, que seguem herói, NPCs e monstros |
| Marcadores | ◆ $ ♨ ◇ em Georgia | Balões pixel 13×14 com ícone (guilda, loja, descanso, baú) e flutuação de 1 px |
| Patrulha | Monstros sempre virados para o mesmo lado | Viram conforme o movimento lateral |

## Verificações executadas

- `npm test`: **66/66** (inclui alcance de todos os pontos interativos, patrulha em terreno livre e spawn seguro no mapa novo).
- `npm run build`: aprovado (aviso de chunk do Phaser já existente).
- `npm run test:e2e` completo (14 min): **39/41**. As duas falhas:
  - `version-update` esperava a versão `.26` numa regex do teste; o teste foi corrigido para simular a `.27`.
  - A patrulha de 30 s do `visual-v15` estourou o tempo limite com a máquina carregada.
- Depois disso, `version-update`, `visual-v15` e `v26` rodaram juntos: 9/10. Os dois testes acima passaram (patrulha em 35 s). A falha foi uma gravação de PNG bloqueada pelo Windows em evidência antiga, e esse teste passou ao rodar de novo. A bateria completa não foi repetida depois das correções.
- `v26.spec` (novo):
  - Vila sem bruma, com 3 marcadores e sombras.
  - Bosque com 2 camadas de bruma, pelo menos 2 espécies e árvores em mais de 4 alinhamentos verticais.
  - Chão desenhado com menos de 80 objetos.
  - Sem erros de página em 1366×768 e 390×844.
  - Folha de sprites gerada.
- Desempenho no Edge sem tela, comparado com a main v25 na mesma máquina:
  - **FPS no bosque:** 74–82 contra 70.
  - **Tarefas longas recorrentes:** de 50 a 160 ms nas duas versões.
  - **Carregamento:** a geração de arte e do chão soma cerca de 1 a 2 s a mais no navegador sem GPU. Medidas isoladas indicam cerca de 50 ms de desenho e contorno; o resto é custo do canvas por software. Não foi medido em celular físico.

## Evidências

`docs/evidence/v23.09.2003.26/after/`: `village-1366.png`, `village-390.png`, `forest-1366.png`, `forest-390.png`, `sprite-sheet.png`, além das capturas regeneradas de combate, Diário e atualização. Antes: `docs/evidence/v23.09.2003.25/after/forest-after-transition.png` e `after-exit-1366.png`. Viewport emulado; nenhum teste em aparelho físico.

## Limites

- Fundo do palco de combate ainda é a fileira de árvores da versão anterior (agora com o carvalho novo); é a etapa 4.
- Poeira ao andar, transição de mapa e "!" dos monstros ficam para a etapa 5.
- Tufos animados antigos recebem só um tom mais frio no bosque.
- Não publicado.
