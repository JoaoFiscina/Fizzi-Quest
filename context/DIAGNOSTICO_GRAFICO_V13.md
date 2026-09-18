# Diagnóstico da barreira gráfica — v23.09.2003.13

Data: 17/09/2026. Escopo: animação ambiental, percepção visual e critérios de validação.

## Conclusão

A versão 13 melhorou a organização técnica dos ciclos, mas piorou a percepção de vida do cenário. O sistema foi otimizado para pausas e limites antes de estabelecer uma base visual perceptível. Água e fogo, que funcionam como movimento permanente do mundo, foram tratados como detalhes ocasionais. No navegador inspecionado, o modo de movimento reduzido ainda desativou silenciosamente quase toda a ambientação.

O relato de que os elementos “mexem duas vezes e param” corresponde ao comportamento implementado; não é impressão do jogador.

## Evidências observadas

1. A prévia inspecionada retornou `prefers-reduced-motion: reduce`.
2. Nesse modo, árvores, grama, bandeiras, folhas e poeira ficam desativadas.
3. Água e fogo recebem intervalos multiplicados por 2,8 e probabilidade multiplicada por 0,35.
4. Em uma janela de 18 segundos, o contador passou de 3 para 4 ativações e os sete pontos de amostragem registraram zero efeitos ativos.
5. Água usa apenas dois quadros a 1 FPS no modo reduzido; fogo volta ao quadro estático após 1,1 segundo.
6. As capturas `v13-desktop-forest-still.png` e `v13-desktop-forest-cycle.png` são byte a byte idênticas, com o mesmo SHA-256. A evidência chamada “cycle” não provou mudança visual no bosque.
7. Antes da v13, água e fogo repetiam continuamente. A versão 13 mudou ambos para `repeat: 0` e passou a submetê-los ao agendador ocasional.

## Causas técnicas

### 1. Categorias visuais misturadas

O controlador usa a mesma política para três funções diferentes:

- movimento-base: água e fogo;
- reações ocasionais: árvores, grama e bandeiras;
- acentos raros: folhas e poeira.

O limite global de dois efeitos funciona para partículas, mas torna água e fogo intermitentes e concorre com todos os outros elementos.

### 2. Movimento reduzido sem escolha dentro do jogo

O jogo lê o sistema operacional/navegador e não informa que entrou nesse modo. Quem deseja animações completas não possui uma opção para substituir a preferência detectada.

### 3. Quadros visualmente fracos

Vários quadros alteram apenas um ou dois pixels de brilho. Isso muda a textura tecnicamente, mas quase desaparece durante a exploração, principalmente junto ao HUD e ao zoom do mapa.

### 4. Testes verificaram o agendador, não a percepção

Os E2E aceleram intervalos para 2,5% do valor real e verificam contadores, limites e timers. Eles provam que o código dispara, mas não que o jogador vê movimento suficiente na cadência de produção.

### 5. Evidência visual sem comparação temporal

Uma captura única não demonstra animação. A versão aceitou arquivos nomeados como ciclo sem exigir diferença de pixels contra o quadro parado.

### 6. Arte gerada diretamente no código dificulta iteração

Canvas em TypeScript funciona para protótipos, mas torna difícil comparar folhas de sprites, revisar silhuetas e aumentar a qualidade quadro a quadro. A evolução gráfica precisa de folhas visuais versionadas e uma referência estética comum.

## Replanejamento recomendado

### v23.09.2003.14 — recuperação da fundação visual

Complexidade alvo: P2.

1. Separar movimento-base, reações ocasionais e partículas raras.
2. Restaurar água e fogo contínuos no modo completo, com fases diferentes entre instâncias.
3. Aplicar o limite simultâneo somente a reações e partículas.
4. Criar em Ajustes a escolha **Completa**, **Usar sistema** e **Reduzida**.
5. Tornar a preferência ativa visível ao jogador.
6. Aumentar a diferença entre quadros sem mudar hitboxes ou posição lógica.
7. Validar a cadência real, sem aceleração, por pelo menos 30 segundos.
8. Gerar comparação temporal e rejeitar evidências “parado/ciclo” idênticas.
9. Criar uma folha de referência visual para água, fogo, árvore, grama e bandeira.

### v23.09.2003.15 — criaturas e mapa

Somente depois da fundação visual ser aprovada:

- refinar silhuetas dos monstros;
- criar idle, reação e ataque por espécie;
- melhorar transições do combate;
- remodelar o mapa prévio.

Treinos passam para a versão 16; Anel para 17; Botas e Capa para 18; Runas para 19.

## Nova régua de aceite gráfico

Uma versão visual só será aceita quando:

1. a diferença for perceptível em velocidade normal, sem modo de teste;
2. água e fogo demonstrarem movimento sustentado no modo completo;
3. o jogador souber qual preferência de movimento está ativa;
4. quadros semelhantes começarem em fases diferentes;
5. comparações parado/movimento tiverem diferença mensurável nas regiões alteradas;
6. houver inspeção humana de desktop e celular;
7. o cenário continuar legível, sem borrar pixel art ou competir com o personagem;
8. desempenho, colisões e gameplay permanecerem estáveis.

## Direção para superar a barreira

O próximo salto não virá de adicionar mais timers. Ele exige uma direção visual explícita, quadros com mudança legível e validação temporal. A arquitetura deve apoiar a arte: água e fogo sustentam a vida do mapa; árvores e vegetação dão ritmo; partículas apenas pontuam a cena.
