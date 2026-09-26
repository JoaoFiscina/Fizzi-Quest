# Guia de composição estética e execução — v23.09.2003.15

Data: 26/09/2026. Estado: **implementado na branch feat/composicao-v15; validação em docs/VALIDATION.md**.
Base de trabalho: implementação v23.09.2003.14. Confirmar integração da base antes de iniciar.
Objetivo: tornar o mundo mais legível e reconhecível em uma imagem parada e dar identidade aos movimentos das criaturas, preservando a escala e o jogo existente.

## 1. Problema e resultado esperado

A v14 tratou a continuidade ambiental. A próxima barreira é a composição: mais quadros ou partículas, sozinhos, não tornam o cenário melhor. O jogador precisa distinguir caminho, obstáculos, serviços, criaturas e destino sem depender de legendas sobre tudo.

Resultado pretendido:
- Vila acolhedora, organizada em torno da guilda e de sua circulação atual.
- Bosque com caminho legível e encontros destacados sobre vegetação menos contrastada.
- Quatro monstros reconhecíveis pela silhueta, mesmo sem nome ou cor.
- Mapa de regiões centralizado, com relação clara entre locais existentes e futuros.
- Ganho visível em comparação equivalente antes/depois, no zoom que o jogador já usa.

## 2. Escopo e limite de complexidade

Complexidade alvo: média, predominantemente apresentação. Três entregas obrigatórias: composição dos locais existentes, criaturas e mapa de consulta.

Incluído:
1. Ajustes de contorno, sombra, contraste e distribuição de decoração não sólida.
2. Redesenho dos quatro monstros dentro dos envelopes atuais.
3. Idle próprio por espécie e poses curtas de reação/ataque sobre os eventos existentes.
4. Organização visual do mapa de regiões e seus estados.
5. Evidências comparáveis, testes de regressão e documentação.

Fora desta versão: regiões jogáveis novas, mudança de rotas/colisões, respawn variável, patrulhamento, iluminação dinâmica, shaders, ciclo dia/noite, novos atributos, slots, habilidades, balanceamento de treino ou migração de save. Reformulação ampla das transições de combate é opcional e deve sair do escopo se exigir novo sistema.

Não aumentar zoom para tornar a mudança mais aparente. Não redesenhar o protagonista nesta entrega; usá-lo como referência de escala e contraste. Não adicionar bibliotecas de renderização.

## 3. Direção de arte

### Linguagem

Fantasia de aventura em floresta, vista superior, pixel art artesanal. Preservar grade de 16 px, dimensões dos sprites, nearest-neighbor e coordenadas inteiras. Usar os verdes, ocres, areia e azul-petróleo existentes; extrair as cores do código antes de escolher variações.

### Hierarquia de leitura

1. Protagonista e ameaça próxima: contorno e silhueta mais claros.
2. Caminho, saída e pontos de interação: formas reconhecíveis e separação do chão.
3. Massas do cenário: árvores, água e construções organizam o espaço.
4. Pequenos detalhes: apoio visual discreto, sem ocupar toda superfície.

Aplicar primeiro massas e valores claro/escuro; depois materiais; por último detalhes. Se a leitura depender de partículas, o desenho-base ainda não está aprovado.

### Regras de material

| Material | Tratamento planejado | Evitar |
| --- | --- | --- |
| Grama | Base estável, grupos pequenos de tons próximos | Ruído de pixels em todos os tiles |
| Caminho | Centro relativamente limpo, bordas irregulares de 1–2 px | Pintar falso obstáculo ou estreitar a área caminhável |
| Folhagem | Volume por blocos de sombra e luz, contorno interrompido com intenção | Pontos claros igualmente distribuídos |
| Pedra | Planos angulares, sombra inferior e poucas fissuras | Textura que se confunda com olhos/itens |
| Madeira | Direção de tábuas e bordas gastas discretas | Listras de alto contraste em toda a construção |
| Água | Manter ondas e continuidade da v14; margem visual coerente | Trocar movimento contínuo por eventos ocasionais |
| Fogo | Manter base fixa e silhueta variável da v14 | Aumentar luz global, tremor ou partículas para chamar atenção |

Adotar luz sugerida do alto à esquerda para novos retoques, conferindo compatibilidade com a arte existente. Sombras são desenhadas, sem sistema de iluminação. Reservar dourado principalmente a interações, recompensas e sinais relevantes.

## 4. Composição da vila

Preservar posições lógicas de guilda, comerciante, descanso, lago e saída leste.

1. **Guilda como referência:** reforçar leitura do telhado/entrada e sua sombra. Manter o acesso e o mestre visíveis.
2. **Circulação:** limpar ruído do centro dos caminhos; concentrar pequenas irregularidades nas bordas. A saída leste deve continuar percebida como passagem.
3. **Loja:** distinguir banca de árvore/construção com ocre e silhueta do toldo, sem crescer o sprite.
4. **Descanso:** aproveitar o contraste quente da fogueira sobre chão calmo; não acrescentar um painel permanente.
5. **Lago:** melhorar a continuidade visual da margem dentro dos limites sólidos existentes.
6. **Vegetação:** variar grupos decorativos dentro do espaço disponível. Não mover árvores sólidas para compor uma imagem mais bonita.

Aceite visual: em captura sem menus, guilda, loja, descanso e saída devem ser localizáveis sem sobreposição de etiquetas. Verificar também quando o protagonista se aproxima desses elementos.

## 5. Composição do bosque

Preservar a bifurcação, o baú, o chefe, os encontros e a matriz de colisão atual.

1. Tratar o caminho como continuidade visual desde a entrada até a bifurcação.
2. Dar ao fundo menos contraste local que às criaturas; reduzir detalhes diretamente atrás dos encontros.
3. Diferenciar os dois braços por decoração e material já existente: mais pedra perto do Besouro; folhagem e tons frios discretos perto da Mariposa.
4. Destacar o trecho do Guardião por massa de sombra e vegetação existente, com espaço visual em torno da silhueta.
5. Conservar o baú identificável na rota, sem brilho contínuo obrigatório.
6. Garantir que árvores em primeiro plano não escondam o protagonista ou sinais de interação de modo persistente.

Variação decorativa deve ser determinística por coordenada/tipo: reload e retorno ao mapa preservam a composição. Reutilizar texturas; não criar uma textura exclusiva para cada tile.

## 6. Modelamento das criaturas

Dimensões atuais verificadas em polishArt.ts: Broto, Besouro e Mariposa 32×32; Guardião 48×52. São envelopes de textura, não autorização para ampliar hitboxes. Manter origem, ponto de apoio, escala e encontro.

| Criatura | Silhueta e material | Idle planejado | Ataque/reação planejados |
| --- | --- | --- | --- |
| Broto Errante | Corpo compacto, folhas separadas do rosto e raízes reconhecíveis | Folha inclina 1 px, corpo respira discretamente e retorna à pose neutra | Inclinação curta para atacar; folhas cedem ao receber impacto |
| Besouro de Pedra | Corpo baixo e largo, carapaça com planos, patas separadas | Pequeno ajuste alternado das patas com carapaça estável | Pose fechada para proteção; avanço curto no ataque; recuo rígido no dano |
| Mariposa da Névoa | Corpo central fino, asas simétricas com espaços negativos | Abrir/fechar asas mudando seu contorno; evitar apenas trocar cores | Fechamento breve e abertura na ação; reação curta das asas |
| Guardião de Musgo | Massa alta e pesada, ombros distintos, musgo separável da pedra | Respiração lenta e discreta, peso estável na base | Preparação legível seguida de ação curta; resposta contida ao impacto |

### Produção dos quadros

1. Desenhar e avaliar a pose neutra das quatro espécies antes de animar.
2. Produzir folha de silhuetas monocromáticas, folha em cores e visão sobre o terreno real.
3. Fazer primeiro o Broto completo como prova de linguagem; aplicar as regras aprovadas às demais espécies.
4. Usar inicialmente quatro quadros de idle por espécie. Pausa no quadro neutro pode variar por espécie, sem criar objetos ou timers a cada ciclo.
5. Reações/ataques: começar com duas poses adicionais e reutilizar o controlador de apresentação existente. Criar mais quadros somente se o movimento não ficar legível.
6. Não esticar o sprite inteiro com escala fracionária para simular respiração. Alterar o desenho dentro da textura.

Faixas iniciais para ajuste perceptivo, não números finais: Broto 2–3 FPS, Besouro 2–3 FPS com pausa maior, Mariposa 4–6 FPS com batida suave, Guardião 1–2 FPS com repouso longo. A transição do último quadro ao primeiro não pode produzir salto.

### Combate e movimento reduzido

- Dano, ordem, recompensa e persistência continuam definidos pelo domínio antes da animação.
- Consumir os CombatEvent existentes. Usar o estado real de carapaça/preparo, sem inferi-lo do quadro atual.
- Preparação do Guardião deve concordar com o texto de intenção; nunca revelar outra rodada ou sugerir dano inexistente.
- Hipótese de duração para movimentos adicionais: 150–350 ms por reação/ação; não acumular esperas novas sobre as já existentes.
- Usar a preferência efetiva Completa/Sistema/Reduzida da v14; não consultar apenas a preferência do navegador em um módulo isolado.
- No modo reduzido: pose neutra no mundo, troca direta para poses informativas no combate, texto e números preservados; sem oscilação, flash repetitivo ou tremor.
- Cancelamento, fuga, vitória, derrota e reload devem deixar a cena em estado consistente.

## 7. Mapa de regiões: composição e semântica

O mapa é uma consulta. Não é minimapa de coordenadas e não deve teletransportar.

Estrutura pretendida:

```text
Vila da Guilda ── trilha existente ── Bosque das Brumas
                                      └─ Posto de Vigia
                                         (ponto do bosque)

Em outra faixa visual, claramente futura:
Mina do Eco · Ruínas Altas · Costa Dourada [bloqueadas]
```

O Posto de Vigia representa um marco dentro do bosque atual; não apresentar como terceira área jogável independente. Conferir os estados de perigo/recuperado com a derrota do Guardião. Não usar “Passagem tomada” como se uma rota existente estivesse funcionalmente bloqueada sem regra correspondente.

### Aparência

- Superfície de papel/areia com borda discreta, verde profundo no texto e traço ocre nas rotas.
- Ícones pequenos desenhados com a linguagem do jogo: guilda, árvores, vigia; padronizar cadeado em vez de depender de emoji de cada sistema.
- Um conjunto principal centralizado; nomes próximos dos símbolos; espaço livre entre nós e conectores.
- Posição atual: marcador + texto “Você está aqui”, sem depender só de cor.
- Futuras: símbolo de cadeado, texto “Região futura — indisponível” e contraste suficiente para leitura. Sem botão, hover ou seta que sugira viagem habilitada.
- Não inventar a geografia ou conexões definitivas das regiões futuras; sua faixa funciona como prévia de conteúdo.

### Layout

- Desktop: rota conhecida horizontal, marcos relacionados agrupados e futuras abaixo.
- Mobile: fluxo vertical da mesma informação; sem coordenadas absolutas copiadas do desktop.
- Proposta técnica: CSS Grid para os nós em DOM; conectores decorativos por CSS ou SVG simples. Evitar nova biblioteca de grafos/canvas para texto.
- Alinhar conectores a âncoras dos nós, não a deslocamentos globais arbitrários.
- Conteúdo completo sem rolagem horizontal; modal com rolagem vertical se necessário, botão fechar sempre alcançável.
- Foco visível, Escape/fechar e bloqueio do movimento do jogo enquanto o modal está aberto.

## 8. Plano técnico e ordem de execução

| Fase | Trabalho | Arquivos candidatos | Condição para avançar |
| --- | --- | --- | --- |
| 0. Base | Conferir Git, versão e integração da v14; capturar vila/bosque/mapa nas mesmas condições | context/, src/version.ts, testes existentes | Baseline identificada por commit, save de teste, viewport, zoom e modo de movimento |
| 1. Desenho estático | Folhas comparativas e retoque de um trecho da vila e um do bosque | src/game/art.ts, src/game/polishArt.ts | Mudança legível sem animação e sem aumento de escala |
| 2. Cenários | Aplicar contraste, bordas e detalhes aprovados aos dois locais | art.ts, polishArt.ts, world.ts se necessário | Caminhos e interações claros; mesma matriz de colisão |
| 3. Criaturas | Broto piloto; quatro poses neutras; idles; reações curtas | polishArt.ts, art.ts, world.ts, battlePresentation.ts | Cada espécie reconhecível; sem drift visual ou lógico |
| 4. Mapa | Ajustar composição, relações e estados existentes | src/main.ts (worldMap), src/polish.css | Centralizado e legível nas quatro viewports; futuras indisponíveis |
| 5. Aceite | Comparação visual, testes temporais e regressão | tests/, docs/evidence/v23.09.2003.15/ | Critérios abaixo atendidos e limitações registradas |
| 6. Registro | Atualizar versão e contexto apenas ao concluir implementação | src/version.ts, package*, README, context/, docs/VALIDATION.md | Resultado real descrito; PR revisável; publicação tratada separadamente |

Não editar matrizes de mapa para compensar problemas de arte. Se uma mudança visual exigir reposicionar elemento sólido, registrá-la para outra etapa. Se o desenho do mapa exigir extração de componente, limitar a extração a essa superfície, sem refatorar toda a interface.

Commits sugeridos na execução futura: composição estática; identidade das criaturas; mapa regional; validação e versão. Cada um deve compilar e evitar regressões. Antes de abrir branch, confirmar se a v14 já está na main; se não estiver, explicitar dependência e evitar duplicar ou sobrescrever a implementação.

## 9. Critérios de aceite e evidências

### Comparação estética

- Pares antes/depois com mesmo save sintético, posição, zoom, viewport e modo de animação.
- Capturas da vila, entrada/bifurcação do bosque, quatro criaturas, combate e mapa de regiões.
- Folha de sprites na escala nativa e ampliada por fator inteiro, sem interpolação.
- Avaliar em imagem parada: hierarquia, silhueta, coerência de material e legibilidade no zoom afastado.
- Registrar julgamento humano além das diferenças de pixels. Pixels diferentes comprovam alteração, não beleza ou legibilidade.
- Reprovar se a melhoria só aparecer em recorte ampliado ou se o cenário competir mais com o personagem.

### Movimento

- Observar ao menos 30 segundos na cadência real, incluindo retorno à pose neutra.
- Separar evidência temporal dos monstros e dos ambientes; água/fogo da v14 não podem regredir.
- Verificar sem aceleração de teste, nos modos Completa e Reduzida e no modo Sistema com as duas preferências do navegador.
- Conferir troca de mapa, abertura/fechamento de menus e reinício: sem duplicação de timers, objetos ou registro de animações.

### Fluxo e responsividade

- Viewports: 390×844, 430×932, 1366×768 e 1920×1080.
- Conferir protagonista junto às bordas, zooms existentes e redimensionamento.
- Percorrer diagonais e interações na guilda, loja, fogueira, baú e encontros.
- Mapa: personagem na vila/no bosque; Guardião vivo/derrotado; futuras continuam bloqueadas.
- Combate: ataque, defesa, poção, golpe pesado, fuga, vitória, derrota e reload durante apresentação, sem duplicar resultado.
- Conferir importação de save antigo, exportação e reload; esta etapa não deve precisar de novo formato de save.

### Desempenho

- Comparar baseline/candidato na mesma máquina, navegador, viewport e cena, após aquecimento.
- Registrar contagem estável de objetos/timers e ausência de alocação de efeitos por frame.
- Medir tempo de frame quando o ambiente permitir. Investigar aumento sustentado superior a 10% em condições equivalentes; repetir medição antes de concluir regressão.
- Não prometer 60 FPS ou desempenho móvel a partir de teste headless. Distinguir emulação de teste em aparelho físico.

### Verificação automatizada futura

Executar npm test, npm run build e npm run test:e2e após a implementação. Acrescentar apenas testes de comportamento relevantes: estados do mapa, compatibilidade da preferência de movimento, continuidade visual e integridade da apresentação. Não criar testes que apenas reproduzam constantes de desenho.

Evidências propostas: before/ e after/, monster-silhouettes.png, monster-frames.png, map-desktop.png, map-mobile.png, temporal.json e README com condições de captura, commit e limitações. Usar saves sintéticos, sem treinos pessoais.

## 10. Riscos e prioridades de corte

| Risco | Como controlar |
| --- | --- |
| Mais detalhes deixam o mundo confuso | Revisar em escala real e reduzir contraste do fundo antes de acrescentar pixels |
| Animação parece deslocar a criatura | Ponto de apoio fixo e comparação de posição/origem por quadro |
| Mapa promete conteúdo inexistente | Separar futuras, sem interação nem rotas definitivas inventadas |
| Escopo cresce com combate | Reutilizar apresentação atual; adiar transições amplas e efeitos extras |
| A melhoria fica sutil demais | Aprovar comparação estática do piloto antes de replicar arte |
| Preferência reduzida volta a ser ignorada | Fonte única da v14 e teste das três opções |

Ordem de corte: partículas novas (não necessárias), transições adicionais, variantes decorativas secundárias. Preservar como núcleo a leitura dos cenários, as quatro silhuetas, idles distintos e o mapa responsivo. Se faltar uma dessas entregas, registrar pendência e não declarar o guia integralmente executado.

## 11. Ponto de retomada

Este documento foi a guia da execução da v15. As fases 0 a 5 foram realizadas, com capturas, sprites autorais, mapa reorganizado e testes. O registro final consta em `docs/VALIDATION.md`; publicação depende do resultado da integração na main.

Retomada: conferir o estado da main e do deploy oficial; em seguida iniciar a v16 de progressão e treino, sem misturar mudanças visuais adicionais.
