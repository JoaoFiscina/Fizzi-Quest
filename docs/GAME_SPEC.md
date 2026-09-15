# Fizzi Quest — Documento base para criação no Codex

**Título da primeira alteração:** Fizzi Quest — Treino à aventura  
**Versão do documento:** 1.0 · 15/09/2026  
**Idioma do produto:** português brasileiro  
**Finalidade:** especificação de produto, regras de jogo e contrato técnico para implementar um primeiro ciclo completo jogável.

> Este documento descreve um jogo a construir. Não é uma declaração de funcionalidades já implementadas. Os valores identificados como parâmetros de protótipo foram definidos para tornar a implementação objetiva e podem mudar após testes de diversão.

## 1. Instrução de abertura para o Codex

Leia este documento inteiro antes de implementar. Inspecione primeiro o projeto, seus arquivos AGENTS.md, dependências e estado do Git. Se já houver código, preserve alterações existentes e adapte a estrutura com o menor retrabalho necessário. Se não houver projeto, crie um projeto independente chamado `fizzi-quest`.

Implemente o marco **“Treino à aventura”**: importar um treino, revisar os dados, calcular maestrias, confirmar, explorar uma vila e um bosque, vencer um combate, receber recompensas e retomar o progresso depois de recarregar a página. Entregue algo jogável; uma página com cartões de atributos e botões de simulação não satisfaz esse marco.

Use Phaser, TypeScript e Vite. O jogo deverá rodar no navegador, funcionar com toque e teclado e ficar preparado para hospedagem na Vercel. Não crie uma arquitetura de serviço complexo para esta versão. Utilize as regras e critérios de aceite descritos aqui. Quando faltar uma decisão de baixo impacto, escolha uma solução simples e registre a escolha no README; não interrompa a implementação por pequenos detalhes estéticos.

Não publique, faça merge ou exclua conteúdo automaticamente. Para alterações em um repositório remoto existente, prefira branch e pull request. Não use o repositório pessoal de contexto como repositório do jogo. Não inclua informações pessoais de outros projetos no código.

## 2. Visão do produto

Fizzi Quest é um RPG pessoal de exploração em pixel art, inspirado na leitura visual de jogos portáteis clássicos: mundo visto de cima, mapas pequenos, criaturas reconhecíveis e combate por turnos. A inspiração em Pokémon é de formato e atmosfera; não copiar personagens, criaturas, mapas, música ou outros assets da franquia.

A academia e a corrida alimentam a evolução física do aventureiro. Jogar alimenta a evolução de aventura. O jogador transforma o treino registrado em vantagens concretas para explorar, derrotar criaturas, encontrar equipamentos e reconstruir uma guilda.

**Ciclo principal:** treino real → transcrição organizada → importação e revisão → maestrias físicas → exploração → combate → XP de aventura, ouro e materiais → equipamentos e guilda → nova aventura.

O jogo deve ser divertido em sessões de aproximadamente 5 a 15 minutos. Não precisa ter balanceamento competitivo, ranking, monetização ou quantidade enorme de conteúdo. Precisa transmitir movimento, descoberta e progresso.

### 2.1 Princípios inegociáveis

- O treino melhora o personagem, mas não é necessário treinar para começar ou continuar jogando.
- Ausência, descanso ou derrota não removem maestrias e não quebram sequências punitivas.
- A regra de pontuação pertence ao jogo. O chat entrega dados estruturados, nunca recompensas confiadas sem cálculo.
- Duração da musculação não equivale a minutos de aeróbico.
- Carga × repetições serve para conferir e registrar o treino; não determina XP.
- Preservar o nome e a carga originais de cada exercício. Nunca dobrar automaticamente a carga de halteres.
- O mesmo conjunto de registros de um dia deve gerar o mesmo total, independentemente da ordem de importação.
- Corrigir ou remover um treino deve recalcular a contribuição física, sem criar recompensa duplicada.
- O jogador deve conseguir exportar e restaurar seu progresso.
- A interface de treino deve ser legível. A estética pixelada não pode prejudicar leitura e toque.

### 2.2 Público e uso inicial

Uso pessoal, inicialmente em um aparelho principal, sem login. O registro costuma chegar como print de aplicativo de musculação. O jogador envia esse print ao chat, recebe um JSON, cola no jogo, revisa e confirma. O aplicativo exato não é requisito para construir o MVP.

O progresso é local ao navegador e à origem do site. iPhone, computador, tablet e endereços diferentes não compartilham save automaticamente. Backup permite transferência manual; sincronização em nuvem fica para uma etapa posterior.

## 3. Escopo e marcos

### 3.1 Marco M1 — Treino à aventura

Obrigatório para considerar a primeira entrega concluída:

1. Vila e bosque renderizados no Phaser, personagem controlável, colisões e transição de mapa.
2. Um inimigo funcional: Broto Errante.
3. Combate com atacar, golpe pesado, recuperar fôlego, defender, poção e fugir.
4. Importação JSON com validação, revisão, prévia, confirmação, histórico, edição e remoção.
5. Quatro maestrias físicas e nível de aventureiro separados.
6. XP, ouro e pelo menos uma compra funcional na vila.
7. Salvamento automático, continuar, exportação e restauração de backup.
8. Controles de toque e teclado; interface utilizável em orientação vertical.
9. Testes relevantes da pontuação, importação e persistência, mais verificação do ciclo jogável.

### 3.2 Marco M2 — A trilha esquecida

Completa o primeiro capítulo e o escopo de protótipo mais amplo:

- Besouro de Pedra, Mariposa da Névoa e Guardião de Musgo.
- Bifurcação no bosque, baú único, posto de vigia e emblema da guilda.
- Quatro habilidades e seis equipamentos com efeitos distintos.
- Primeira melhoria visual da guilda e atalho por força.
- Sons e animações adicionais, com opção de desativar áudio.
- Preparação como PWA instalável; funcionamento offline verificado antes de ser anunciado.

### 3.3 Fora do primeiro protótipo

Login, nuvem, multiplayer, PvP, ranking, pagamentos, loja real, integração automática com apps de treino, OCR dentro do jogo, prescrição de treinos, companion, árvore extensa de talentos, especializações funcionais, geração procedural de dungeons, notificações e cargas especiais de expedição.

A mina e outras ruínas são expansões futuras. Não adicionar botões sem função para simular sistemas concluídos. As especializações como “Guardião” podem surgir depois como títulos e cosméticos, sem condicionar o treino do usuário.

## 4. Mundo e narrativa

**Capítulo inicial:** A trilha esquecida.

O aventureiro chega a uma vila com uma antiga guilda parcialmente abandonada. A passagem para o posto de vigia do bosque foi tomada por criaturas. O emblema da guilda está com o Guardião de Musgo. Recuperá-lo inicia a reconstrução da sede.

Tom acolhedor, aventureiro e levemente bem-humorado. Diálogos curtos, sem longas exposições. A academia aparece nos sistemas de evolução; o mundo deve continuar parecendo um RPG, sem máquinas de musculação obrigatoriamente espalhadas pela floresta.

### 4.1 Vila da Guilda

Mapa proposto de 24 × 20 tiles de 16 px. Coordenadas abaixo são referências de implementação e podem ser ajustadas para composição, mantendo as funções.

| Elemento | Posição aproximada | Função |
|---|---|---|
| Nascimento | (12, 14) | Ponto seguro inicial |
| Guilda | área (9–15, 3–7) | Missão e restauração futura |
| Mestre da guilda | (12, 8) | Conversa e entrega do emblema |
| Loja | área (3–7, 8–11) | Equipamentos e poções |
| Vendedor | (6, 12) | Abre menu da loja |
| Fogueira/banco | (16, 13) | Descanso gratuito |
| Saída leste | (23, 10) | Entra no bosque |

Construções, árvores, água e cercas têm colisão. Portas e passagens devem ter espaço suficiente para o personagem. Interação acontece a até um tile do objeto/NPC, com indicação visual da ação disponível.

### 4.2 Bosque

Mapa proposto de 40 × 28 tiles. Entrada oeste, clareira inicial segura, rota principal legível e bifurcação antes do posto de vigia.

- Entrada: (1, 14); sair à esquerda retorna à vila.
- Broto Errante visível: próximo a (10, 14), fora do ponto de chegada.
- Bifurcação: aproximadamente (19, 14).
- Caminho superior: Besouro e baú em um pequeno desvio.
- Caminho inferior: Mariposa e rota até o posto de vigia.
- Posto de vigia: aproximadamente (35, 12), com encontro do chefe.
- Pedra de atalho: força total ≥ 8 permite abrir uma passagem mais curta; rota alternativa sempre acessível.

Usar encontros visíveis. Aproximar-se e interagir inicia o combate; não iniciar lutas aleatórias a cada poucos passos. Inimigos comuns derrotados reaparecem quando o jogador descansa na vila. A vitória sobre o chefe, o baú e a recompensa da missão são únicos por save.

O spawn após transições nunca deve estar dentro de colisão, sobre o inimigo ou imediatamente sobre o gatilho de retorno.

### 4.3 Missão principal

Estado explícito: `not_started → active → emblem_recovered → completed`.

Falar com o mestre ativa a missão. Se o jogador derrotar o chefe antes da conversa, preservar o emblema e permitir entregar normalmente. O chefe concede o emblema uma única vez. Entregá-lo concede **40 XP de aventura + 30 ouro**, também uma única vez.

Após a entrega, habilitar melhoria da guilda por **30 ouro + 5 materiais**. A melhoria muda um elemento visível da sede e concede **+5 de vida máxima**. É uma compra única, sem apagar o progresso da missão.

## 5. Progressão

### 5.1 Três economias distintas

| Sistema | Fonte | Uso |
|---|---|---|
| Maestrias físicas | Treinos confirmados | Atributos físicos permanentes enquanto o registro estiver válido |
| XP de aventura | Combate e missão | Nível e habilidades |
| Ouro e materiais | Combate, baú e missão | Poções, equipamentos e guilda |

Não conceder ouro diretamente pela importação de treino no MVP.

### 5.2 Atributos

Quatro atributos: **força, vigor, agilidade e fôlego**. Valores base de protótipo: **5 em cada atributo**.

Cada **100 pontos de maestria** num atributo concedem **+1 naquele atributo**. A barra mostra o resto até o próximo ponto. Exemplo: 258,5 pontos de força representam +2 força e uma barra de 58,5/100.

`atributo = 5 + floor(maestria / 100) + pontosLivresAlocados + bônusDeEquipamento`

Equipamentos não alteram o histórico de maestria. Remover um treino pode reduzir os atributos derivados; o jogo deve informar isso na prévia da remoção.

### 5.3 Nível de aventureiro

Começa no nível 1, com 0 XP. Custo para ir do nível L ao seguinte:

`xpNecessário(L) = 50 + 25 × (L − 1)`

Custos iniciais: 50, 75, 100, 125… Manter `adventureXpTotal` como fonte de verdade e derivar nível e progresso. Cada nível acima do primeiro concede **1 ponto livre** para atribuir a qualquer atributo. A alocação exige ponto disponível e é permanente no protótipo. Não conceder outro ponto ao recarregar ou recalcular o mesmo nível.

### 5.4 Estatísticas de combate — parâmetros iniciais

Calcular com atributos totais já incluindo equipamento:

- `vidaMáxima = 30 + 4 × vigor + 5 × (nível − 1) + bônusVidaGuilda`
- `staminaMáxima = 6 + floor(fôlego / 2) + floor((nível − 1) / 2)`
- `ataque = 4 + força + floor((nível − 1) / 2)`
- `defesa = 1 + floor(vigor / 3)`
- `velocidade = agilidade`

Mudar atributo ou equipamento não cura automaticamente. A vida/stamina atuais permanecem, limitadas ao novo máximo. Descansar na vila restaura ambos gratuitamente. A derrota retorna à vila com ambos restaurados.

Não há perda de treino, equipamento, XP, ouro ou materiais na derrota. A dificuldade inicial deve permitir terminar o capítulo sem treino importado.

## 6. Pontuação dos treinos — rulesVersion 1

Estas regras são regras temáticas de jogo, não avaliação fisiológica, calórica ou recomendação de atividade física.

### 6.1 Distribuição por categoria

| Categoria técnica | Interpretação | Força | Vigor | Agilidade | Fôlego |
|---|---|---:|---:|---:|---:|
| `upper_strength` | Empurrar/puxar e acessórios de superiores | 75% | 25% | 0% | 0% |
| `lower_strength` | Pernas | 40% | 60% | 0% | 0% |
| `core` | Estabilização/core | 20% | 80% | 0% | 0% |
| `running` | Corrida/caminhada registrada como aeróbico | 0% | 0% | 30% | 70% |
| `cycling` | Bicicleta | 0% | 20% | 0% | 80% |

Atividade não mapeada fica pendente de categoria; não usar correspondência inventada. O usuário pode classificar na revisão. A equivalência de caminhada é uma decisão de protótipo para simplificar o primeiro motor; preservar o nome real da atividade.

### 6.2 Limites por data de treino

- Musculação: **30 pontos de presença uma vez por dia + 4 pontos por série de trabalho**, até **20 séries por dia**.
- Sem série de trabalho válida, não há bônus de presença.
- Aquecimentos são preservados, mas não pontuam.
- Aeróbico: **2 pontos por minuto**, até **40 minutos por dia** no conjunto das atividades.
- Teto combinado: **160 pontos por dia**.
- PRs ficam registrados, com **zero bônus na versão 1**.
- Duração total da sessão de musculação não entra no cálculo.
- Usar a data confirmada da sessão, não a data de importação nem a conversão UTC do horário.

### 6.3 Algoritmo exato, independente da ordem

Para cada data, juntar todos os registros confirmados e não removidos. Contar as séries de trabalho por categoria e os minutos de aeróbico por categoria.

1. Seja `S` o total de séries elegíveis. Se `S > 0`, `pontosMusculação = 30 + 4 × min(S, 20)`; caso contrário, zero.
2. Dividir esses pontos proporcionalmente à contagem de séries de cada categoria: `pontosCategoria = pontosMusculação × sériesCategoria / S`.
3. Aplicar o vetor de atributos de cada categoria.
4. Seja `M` o total de minutos válidos de aeróbico. `pontosAeróbico = 2 × min(M, 40)`.
5. Se `M > 0`, distribuir os pontos de aeróbico proporcionalmente aos minutos de cada categoria e aplicar os vetores.
6. Somar os vetores de musculação e aeróbico.
7. Se a soma ultrapassar 160, multiplicar todos os componentes por `160 / soma`.
8. Aplicar a política de precisão abaixo e somar os vetores diários para obter as maestrias totais.

**Por que proporcional?** Contar somente as “primeiras 20 séries” faria a ordem de importação mudar os atributos. Todas as categorias participam proporcionalmente mesmo quando o total excede o limite.

### 6.4 Precisão numérica

Armazenar a contribuição diária final em **centésimos de ponto inteiros**. Fazer os cálculos proporcionais antes do arredondamento final. Converter cada componente em centésimos, truncar, e distribuir os centésimos restantes pelas maiores partes fracionárias. Empates seguem a ordem: força, vigor, agilidade, fôlego.

O alvo de soma é o total diário arredondado ao centésimo. Na interface mostrar até duas casas decimais, com vírgula e sem zeros desnecessários. Essa política mantém o total e evita acumular erro binário em sucessivas edições.

### 6.5 Casos de referência

| Caso | Resultado esperado |
|---|---|
| 12 séries de superiores | 78 pontos: 58,5 força + 19,5 vigor |
| 6 séries superiores + 6 pernas + 20 min corrida | 118 pontos: 44,85 força + 33,15 vigor + 12 agilidade + 28 fôlego |
| 20 séries superiores + 40 min corrida | Total bruto 190; total final 160 após redução proporcional |
| 24 séries em duas importações no mesmo dia | 110 pontos de musculação, sem segunda presença |
| Nenhuma série, apenas aquecimento | Zero musculação |
| 102:09 de musculação, 12 séries superiores, sem aeróbico | Exatamente 78 pontos |
| Mesmo dia importado em ordem invertida | Mesmo vetor final |
| Treino removido | Recalcular o dia e os totais, não apenas subtrair uma recompensa antiga |

No exemplo de 190 pontos brutos, o resultado em centésimos é **69,47 força + 23,16 vigor + 20,21 agilidade + 47,16 fôlego = 160**.

A diferença entre o total anterior e o total recalculado é o que a prévia mostra. Ao atingir um teto, uma nova categoria pode redistribuir atributos: exibir eventuais diferenças negativas com clareza, sem esconder a alteração.

## 7. Contrato de importação

### 7.1 Fluxo operacional

1. Jogador envia print(s) ao chat.
2. Chat transcreve apenas o que consegue identificar, preserva incertezas e entrega JSON de sessão.
3. Jogo recebe o JSON, valida formato e apresenta dados como texto seguro.
4. Jogador confirma data, categorias e tipos de série; corrige campos quando necessário.
5. Jogo mostra volume conferido, pendências, possível duplicata e alteração nas maestrias do dia.
6. Confirmar aplica uma única transação: salvar registro e recalcular maestrias.
7. Histórico permite reabrir, editar ou remover, com prévia do efeito.

Não implementar leitura automática de imagens nesta etapa. Explicar no campo de importação: “Cole o JSON do treino organizado no chat”.

### 7.2 Envelope schemaVersion 1

| Campo | Regra |
|---|---|
| `schemaVersion` | Inteiro 1; rejeitar versões desconhecidas com mensagem clara |
| `sessionId` | Identificador externo opcional; o jogo gera um ID interno próprio |
| `source` | `screenshot`, `manual` ou `export` |
| `sourceApp` | Nome do app ou null |
| `date` | Data real válida YYYY-MM-DD; obrigatória para confirmar |
| `dateYearInferred` | Booleano; true exige confirmação da data |
| `displayedTime` | HH:mm ou null, apenas informativo |
| `durationText` | Texto original ou null, sem converter em cardio |
| `reportedVolumeKg` | Número finito ≥ 0 ou null |
| `reportedPRs` | Inteiro ≥ 0 ou null; informativo |
| `reportedSets` | Inteiro ≥ 0 ou null; informativo |
| `status` | Entrada sempre tratada como rascunho, mesmo que diga confirmed |
| `partial` | Booleano opcional; padrão false; quando true, exigir ciência de que só o trecho visível será contabilizado |
| `exercises` | Array de exercícios, pode ser vazio quando existir cardio |
| `cardio` | Array de atividades aeróbicas; ausente equivale a vazio |
| `reviewNotes` | Array de textos de revisão |

Rejeitar um registro sem exercício e sem cardio. Limitar JSON a 256 KB, até 100 exercícios, até 100 séries por exercício, até 20 atividades aeróbicas e até 200 caracteres por nome. Esses são limites técnicos, não orientação de treino.

### 7.3 Exercícios

Aceitar dois formatos, normalizando internamente para uma lista de séries:

**Formato compacto, compatível com a conversa:** `name`, `equipment`, `category`, `loadKg`, `reps: number[]`, `setType`.

**Formato por série, para cargas variáveis:** `name`, `equipment`, `category`, `sets: [{loadKg, reps, setType}]`.

Não aceitar ambos `sets` e `reps` no mesmo exercício, para evitar dupla contagem. `equipment` é texto informativo. `category` aceita as três categorias de musculação ou null; null exige revisão.

Cada série contém:

- `loadKg`: número finito ≥ 0 ou null. Null significa carga desconhecida; não é zero.
- `reps`: inteiro positivo ou null. Null preserva uma série de duração/isométrica ou informação ausente.
- `durationSeconds`: número positivo opcional para uma série isométrica.
- `setType`: `work`, `warmup` ou `unknown`.

A pontuação depende da série de trabalho confirmada, não da disponibilidade de carga ou repetições. Se a própria existência/quantidade de séries estiver ilegível, o chat não cria séries presumidas. `unknown` exige revisão antes da confirmação. Disponibilizar a ação **“Todas são séries de trabalho”**.

### 7.4 Aeróbico

Cada elemento de `cardio` contém `name`, `category` (`running` ou `cycling`, ou null enquanto pendente), `durationMinutes` (número finito > 0) e `distanceKm` opcional (número ≥ 0 ou null).

Minutos fracionários são permitidos. Distância e ritmo não multiplicam XP. Não derivar minutos de aeróbico a partir da duração global de um print de musculação.

### 7.5 Exemplo real de referência

O bloco abaixo é um rascunho de exemplo, não deve ser aplicado automaticamente no save de um jogador novo. A data precisa ser revisada porque o ano foi inferido no material original. Cargas preservadas como transcritas, sem presumir lado/par.

```json
{
  "schemaVersion": 1,
  "sessionId": "treino-2026-09-14-1137",
  "source": "screenshot",
  "sourceApp": null,
  "date": "2026-09-14",
  "dateYearInferred": true,
  "displayedTime": "11:37",
  "durationText": "102:09",
  "reportedVolumeKg": 2540,
  "reportedPRs": 0,
  "reportedSets": 12,
  "status": "draft",
  "partial": false,
  "exercises": [
    {
      "name": "Desenvolvimento maquina skyfit",
      "equipment": "machine",
      "category": "upper_strength",
      "loadKg": 4,
      "reps": [10, 9, 10],
      "setType": "unknown"
    },
    {
      "name": "Desenvolvimento arnold skyfit",
      "equipment": "dumbbell",
      "category": "upper_strength",
      "loadKg": 16,
      "reps": [8, 7, 6],
      "setType": "unknown"
    },
    {
      "name": "Elevação lateral maquina skyfit",
      "equipment": "machine",
      "category": "upper_strength",
      "loadKg": 24,
      "reps": [9, 8, 8],
      "setType": "unknown"
    },
    {
      "name": "Crucifixo invertido maquina skyfit",
      "equipment": "machine",
      "category": "upper_strength",
      "loadKg": 62,
      "reps": [8, 8, 8],
      "setType": "unknown"
    }
  ],
  "cardio": [],
  "reviewNotes": [
    "Ano inferido: confirmar a data.",
    "Confirmar se as 12 séries são de trabalho.",
    "Carga preservada conforme exibida, sem inferir lado ou par."
  ]
}
```

Conferência: 12 séries, 99 repetições e 2.540 kg de soma das cargas registradas × repetições. Após confirmar data e séries de trabalho: **58,5 força e 19,5 vigor**, supondo nenhum outro treino nessa data.

Se todos os fatores necessários não estiverem disponíveis, mostrar “Volume não conferível com os dados atuais”, sem transformar ausências em zero. Divergência entre volume calculado e informado gera aviso, não ajuste automático. Tolerância de conferência proposta: maior valor entre 1 kg e 1% do volume informado.

### 7.6 Duplicatas, correções e imagens parciais

Gerar `id` interno com UUID. Preservar `externalSessionId` separadamente. Calcular impressão de conteúdo canônico com data, horário disponível, nomes normalizados, cargas, repetições, tipos de série e cardio; ordenar exercícios para que trocar sua ordem não evite a detecção. Preservar repetições de exercícios dentro da sessão: dois exercícios com o mesmo nome não são necessariamente a mesma linha.

- Mesmo ID externo já usado: abrir revisão do registro existente; não adicionar silenciosamente.
- Mesmo conteúdo e data: bloquear nova importação direta e oferecer abrir o existente.
- Mesma data e exercícios semelhantes, com diferença de cargas/horário: avisar possível duplicata; permitir confirmar como sessão distinta.
- Ao editar o próprio registro, excluí-lo da busca de duplicatas consigo mesmo.
- Vários prints sobrepostos devem ser consolidados pelo chat; o jogo não promete detectar sobreposição visual.
- Importação parcial pode ser confirmada após reconhecimento explícito; só o conteúdo presente pontua.
- Completar depois um treino parcial deve atualizar o mesmo registro. Não aplicar uma segunda sessão por padrão.

O histórico mostra data, nome/resumo, séries de trabalho, cardio e **total do dia**. Evitar atribuir a cada sessão uma recompensa definitiva independente: presença e tetos são diários.

## 8. Combate por turnos

### 8.1 Modelo de rodada

Estados: `awaiting_player → resolving → victory | defeat | fled | awaiting_player`.

No início de cada rodada, anunciar a intenção do inimigo. O jogador escolhe uma ação. Desabilitar botões durante a resolução para impedir turno duplo. Habilidades sem recursos e poção sem estoque ficam indisponíveis e não consomem turno.

Prioridade: **fugir → defender → demais ações ordenadas por velocidade**. Empate de velocidade favorece o jogador. Defender ativa antes do ataque inimigo, mesmo contra inimigo mais rápido. Ao morrer, o ator não executa ação pendente. Verificar vida após cada ação.

Fugir funciona sempre no protótipo, inclusive do chefe: encerra sem recompensa, conserva vida/stamina restantes e devolve o jogador a uma posição segura fora do gatilho. Interação explícita impede reencontro instantâneo. O inimigo reinicia com vida cheia no próximo encontro.

### 8.2 Dano e ações

Dano base: `max(1, ataqueAtacante − defesaAlvo)`. Ataques multiplicados usam `max(1, floor(danoBase × multiplicador))`.

| Ação | Regra | Desbloqueio |
|---|---|---|
| Atacar | Dano base, custo zero | Inicial |
| Golpe pesado | 3 stamina, 1,6× dano base | Nível 1 |
| Recuperar fôlego | Recupera 4 stamina até o máximo; ocupa a ação | Nível 1 |
| Defender | Reduz próximo ataque recebido em 50%, arredondando dano para cima | Inicial |
| Poção | Consome 1 unidade e recupera 20 vida até o máximo; ocupa a ação | Estoque disponível |
| Fugir | Encerra encontro sem recompensa | Inicial |
| Corte veloz | 2 stamina, 1,1× dano base; velocidade dessa rodada +5 | Nível 2, M2 |
| Impacto firme | 4 stamina, 1,3× dano; ignora defesa do alvo | Nível 3, M2 |

Golpe pesado, recuperar fôlego, corte veloz e impacto firme são as quatro habilidades. O menu principal é **Atacar · Habilidades · Defender · Item · Fugir**. Abrir/fechar submenu não gasta turno.

Defender não acumula: existe no máximo uma proteção, consumida pelo próximo ataque inimigo. Se o inimigo apenas preparar um golpe, a proteção permanece para o próximo ataque. Acaba ao terminar o encontro.

### 8.3 Inimigos — valores propostos para teste

| Inimigo | Vida | Ataque | Defesa | Velocidade | XP | Ouro | Materiais |
|---|---:|---:|---:|---:|---:|---:|---:|
| Broto Errante | 22 | 6 | 1 | 3 | 15 | 5 | 1 |
| Besouro de Pedra | 32 | 7 | 4 | 2 | 20 | 8 | 1 |
| Mariposa da Névoa | 18 | 7 | 1 | 8 | 18 | 7 | 1 |
| Guardião de Musgo | 65 | 9 | 3 | 4 | 60 | 25 | 3 |

- **Broto:** ataca a cada rodada. Intenção: “Vai investir”.
- **Besouro:** rodadas ímpares usa carapaça e não ataca; defesa +4 durante toda essa rodada. Rodadas pares ataca com defesa normal. Intenção deve revelar carapaça/exposição antes da escolha.
- **Mariposa:** ataque normal; a velocidade maior ensina ordem dos turnos.
- **Guardião:** ciclo de três rodadas: ataque normal → preparar golpe sem dano → ataque de 2× dano base. Intenção: “Reúne raízes para um golpe forte” na preparação e “Golpe de raízes” na execução.

Não usar aleatoriedade no dano inicial; facilita entender e testar. Animações e efeitos não podem determinar resultados. Ataques devem ter pequeno recuo/flash e números de dano legíveis.

### 8.4 Vitória e derrota

Vitória aplica recompensa uma única vez por encontro, mostra painel curto e permite retornar ao mapa. Vida e stamina restantes são mantidas. Novas estatísticas de nível não curam por si mesmas.

Derrota encerra o encontro e retorna à vila. Não penalizar o histórico físico. O chefe nunca precisa exigir um atributo mínimo para ser enfrentado.

## 9. Inventário, loja e baú

Começar com **Lâmina de aprendiz equipada**, **3 poções**, **0 ouro** e **0 materiais**. Inventário guarda IDs do catálogo e quantidades; não confiar em atributos de itens recebidos em importações de treino.

Equipar é permitido fora de combate. Um slot de arma e um de acessório, sem empilhar duas peças no mesmo slot.

| Equipamento | Slot | Efeito | Preço |
|---|---|---|---:|
| Lâmina de aprendiz | Arma | Sem bônus; item inicial | Não vendida |
| Espada de ferro | Arma | +2 força | 30 ouro |
| Adaga da trilha | Arma | +1 força, +2 agilidade | 30 ouro |
| Martelo de pedra | Arma | +4 força, −1 agilidade | 45 ouro |
| Broche de musgo | Acessório | +2 vigor | 25 ouro |
| Pingente do vento | Acessório | +2 fôlego | 25 ouro |

Poção: **8 ouro** por unidade. Sem venda de itens no protótipo. Equipamento permanente já adquirido não pode ser comprado outra vez. Ouro nunca fica negativo. Uma compra atualiza custo e item atomicamente.

Baú do bosque: **15 ouro + 1 poção**, uma única vez. Mostrar aberto depois da coleta. Interagir novamente informa que está vazio.

## 10. Interface e navegação

### 10.1 Estrutura

Tela inicial com título, “Nova aventura” se não houver save e “Continuar aventura” quando houver. Havendo save, novo jogo exige exportar opcionalmente e confirmar substituição; nunca apagar ao clicar em continuar.

Durante o jogo, manter o mapa como foco. HUD compacto de vida, stamina, nível e ouro. Acesso a **Personagem**, **Treinos**, **Mochila** e **Configurações** por menu. Menus pausam movimento e encontros. Não permitir importar, equipar ou restaurar backup no meio de um turno de combate.

### 10.2 Telas obrigatórias

| Tela | Conteúdo e comportamento |
|---|---|
| Mundo | Mapa, personagem, HUD, interação contextual e controle de toque |
| Personagem | Nível, XP, quatro atributos com origem dos bônus, barras de maestria e alocação de pontos |
| Treinos | Histórico por data, importar e abrir registros |
| Revisão | Campos editáveis, classificação das séries, data, avisos, prévia de diferenças e confirmação |
| Combate | Inimigo, vida, intenção, ações, recursos e registro curto da rodada |
| Mochila | Itens possuídos, equipamento atual e equipar |
| Loja | Preço, saldo, efeito e comprar |
| Configurações | Volume/som, controles, exportar/restaurar backup e novo jogo |

Textos propostos:

- Sucesso: “Treino registrado! 12 séries contabilizadas. Força +58,5 · Vigor +19,5.”
- Duplicata: “Esse treino já está no histórico. Quer abrir o registro?”
- Data inferida: “Confirme a data antes de registrar.”
- Tipo desconhecido: “Há séries sem classificação. Marque trabalho ou aquecimento.”
- Teto: “O limite de pontos deste dia foi aplicado. Veja a distribuição abaixo.”
- Falha ao salvar: “Não foi possível salvar no aparelho. Exporte um backup antes de sair.”

Dados externos devem ser inseridos como texto, nunca HTML executável. Erros de JSON devem orientar o usuário sem mostrar stack traces.

### 10.3 Controles

- Teclado: WASD ou setas movem; E ou Espaço interage; Esc fecha menu; Enter confirma opção focada.
- Toque: direcional de quatro sentidos à esquerda e botão de interação à direita, áreas de toque de pelo menos 44 × 44 CSS px.
- Movimento sem diagonal no protótipo; velocidade sugerida de 64 pixels do mundo por segundo.
- Não capturar atalhos do jogo enquanto um campo de texto estiver focado.
- Limpar teclas pressionadas em blur, troca de mapa ou abertura de menu.
- Usar safe-area no celular e impedir que o dedo no direcional role a página.
- Botões possuem foco visível; cor não é o único indicador de vida, recurso ou ação indisponível.
- Modal de revisão longo deve rolar, mantendo confirmação acessível.

## 11. Direção de arte e som

Visão superior, tiles de 16 × 16 px e personagem de aproximadamente 16 × 24 px, quatro direções e três quadros de caminhada por direção. Usar renderização nearest-neighbor e coordenadas inteiras para preservar pixels.

Paleta proposta:

| Uso | Cor |
|---|---|
| Verde profundo / contorno | `#183D35` |
| Folhagem principal | `#3F6B46` |
| Verde claro | `#91AA62` |
| Terracota | `#B66A49` |
| Dourado / recompensa | `#D7B768` |
| Azul-petróleo | `#245568` |
| Areia / caminhos | `#D6C395` |
| Papel / painéis claros | `#F1E6CA` |

Vila acolhedora, árvores de silhueta simples, sombras curtas, telhados terracota, pedra coberta de musgo. Inimigos devem ser distinguíveis por forma além da cor. A interface pode combinar títulos pixelados com fonte comum legível nos dados de treino.

Priorizar um conjunto pequeno coerente. Se assets externos não estiverem disponíveis, gerar tiles e sprites próprios em código, com composição pixelada real. Não representar todo o jogo por emojis, fotografias ou cartões de dashboard. Registrar origem e licença de qualquer asset externo em `ASSET_LICENSES.md`.

Referências visuais mencionadas no chat anterior não estão anexadas a este documento. Não alegar que seus sprites já existem. A paleta e as instruções desta seção são suficientes para começar.

Sons opcionais no M1: passo discreto, interação, ataque, dano, recompensa e subir de nível. Iniciar áudio somente após gesto do usuário; incluir silenciar. M2 pode usar música de vila e bosque, sem autoplay antes da interação.

## 12. Arquitetura técnica

### 12.1 Stack e separação

- **Phaser:** mapa, sprites, colisões, câmera, animações e apresentação de combate.
- **TypeScript:** regras de domínio e aplicação, com verificação estrita.
- **Vite:** desenvolvimento e build web.
- **HTML/CSS sobre o canvas:** formulários, histórico, menus e acessibilidade.
- **Persistência local:** adapter central, inicialmente localStorage com snapshot JSON versionado e cópia anterior.
- **GitHub:** versionamento do código, em repositório próprio.
- **Vercel:** destino de hospedagem escolhido, com publicação somente quando solicitada.

Não é necessário React para este escopo. Se o projeto existente já o usar, pode mantê-lo para UI. Domínio não depende de Phaser, DOM, relógio global ou armazenamento. Injetar RNG apenas se aleatoriedade entrar depois.

Estrutura sugerida:

```text
fizzi-quest/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  README.md
  AGENTS.md
  ASSET_LICENSES.md
  docs/
    GAME_SPEC.md
    DECISIONS.md
  public/
    assets/
  src/
    main.ts
    content/
      enemies.ts
      items.ts
      skills.ts
      maps.ts
      balance.ts
    domain/
      workouts.ts
      scoring.ts
      progression.ts
      combat.ts
      inventory.ts
      quests.ts
    application/
      store.ts
      commands.ts
    persistence/
      save.ts
      migrations.ts
      validation.ts
    game/
      scenes/
        BootScene.ts
        VillageScene.ts
        ForestScene.ts
        BattleScene.ts
      sprites/
      controls.ts
    ui/
      menus.ts
      workouts.ts
      styles.css
    fixtures/
      shoulder-workout.draft.json
  tests/
    scoring.test.ts
    workouts.test.ts
    combat.test.ts
    persistence.test.ts
    journey.spec.ts
```

Essa estrutura é uma proposta organizacional, não motivo para criar dezenas de arquivos vazios. Manter módulos pequenos com responsabilidade clara e catálogo separado de regras.

### 12.2 Estado persistido

Um `GameSave` deve conter pelo menos:

- `saveVersion: 1`, `rulesVersion: 1`, `updatedAt`.
- Perfil do personagem, XP total de aventura, pontos alocados, vida e stamina atuais.
- Inventário, slots de equipamento, ouro e materiais.
- Registros de treino confirmados, IDs internos/externos, metadados de revisão e datas de edição.
- Localização: mapa, posição e direção.
- Missão principal, baús abertos, inimigos derrotados desde o descanso e melhoria da guilda.
- Encontro atual, se houver: ID único, inimigo, HP, rodada, proteção e fase.
- Configurações de áudio e controles.

Maestrias, nível e estatísticas são derivados. Podem ter cache, mas devem ser reconstruíveis dos dados de origem. Nunca manter totais independentes que crescem a cada abertura da tela.

### 12.3 Comandos de aplicação

Centralizar mutações: `confirmWorkout`, `updateWorkout`, `removeWorkout`, `allocatePoint`, `startEncounter`, `chooseBattleAction`, `buyItem`, `equipItem`, `openChest`, `completeQuest`, `rest`, `restoreBackup`.

Cada comando valida pré-condições, produz o próximo estado, tenta persistir e só então atualiza a UI com sucesso. Uma falha de armazenamento não pode mostrar “salvo” nem descartar o estado anterior. O botão de exportar deve continuar disponível.

Ao resolver combate, calcular toda a rodada de forma síncrona no domínio e salvar o próximo estado coerente antes de reproduzir suas animações. Recarregar no meio da animação retoma o resultado resolvido, sem reaplicar recompensa. Vitória pode ser salva junto com concessão de loot e marcação de encerramento do encontro em uma única transação lógica.

Salvar localização ao mudar de mapa e periodicamente com debounce; não gravar a cada frame. Antes de exportar, capturar a posição atual. Suspender o jogo quando a aba ficar oculta.

### 12.4 Save e backup

Usar uma chave estável, por exemplo `fizzi-quest:save:v1`, e uma chave de snapshot anterior. Validar schema, tipos, limites, IDs de catálogo, arrays, estados da missão e coerência de pontos alocados antes de aceitar um save externo.

- Primeira abertura sem save: criar estado inicial.
- Save principal corrompido: tentar snapshot anterior e informar recuperação.
- Ambos inválidos: oferecer importação de backup ou novo jogo, sem sobrescrever silenciosamente os bytes existentes.
- Save de versão futura: rejeitar com explicação; não “migrar” por adivinhação.
- Exportação: arquivo JSON com versão, data e todos os dados necessários à retomada.
- Restauração: validar integralmente antes de modificar o jogo; mostrar resumo e pedir confirmação da substituição; oferecer exportar o save atual.
- Limitar arquivo de backup a 5 MB no MVP, com erro legível.

Versões futuras de pontuação não devem reescrever o histórico silenciosamente. A versão 1 aceita somente `rulesVersion: 1`; uma migração futura exige decisão explícita sobre recalcular ou preservar a regra dos registros antigos.

### 12.5 Build e execução

Criar scripts `dev`, `build`, `preview`, `test` e `test:e2e`. O build executa verificação TypeScript antes de empacotar. Usar lockfile e dependências instaladas reais, sem presumir versões atuais a partir deste documento.

Configuração esperada de publicação: build `npm run build`, diretório `dist`. Não incluir segredos ou tokens no frontend. O funcionamento local e build devem ser verificados antes de solicitar qualquer publicação.

Se o ambiente estiver sem acesso às dependências, escrever os arquivos necessários e relatar a limitação, sem alegar que build e testes rodaram. Não trocar a plataforma de hospedagem nem publicar em outro serviço sem instrução do usuário.

## 13. Critérios de aceite e testes

### 13.1 Domínio de treino e pontuação

- O fixture real gera 78 pontos depois da revisão e não gera cardio por sua duração.
- JSON malformado, NaN/Infinity, tipos incorretos, data inexistente, negativos e arrays acima dos limites são rejeitados.
- Série com carga null continua podendo pontuar após confirmação como trabalho.
- Tipo unknown e categoria pendente bloqueiam confirmação até a revisão.
- Aquecimento não conta. Presença não aparece em dia sem série elegível.
- Duas sessões na mesma data compartilham limite de séries, minutos e presença.
- Importar as mesmas sessões em ordem inversa gera o mesmo resultado, inclusive sob o teto de 160.
- Centésimos somam exatamente o total diário.
- Correção e remoção recalculam o dia e não alteram XP de aventura ou ouro.
- Duplicata exata não cria registro novo nem pontos extras.
- Nome de exercício contendo marcação HTML aparece como texto inerte.

### 13.2 Combate e progressão

- Dano mínimo 1; defender reduz o próximo ataque uma única vez.
- Defender funciona antes do ataque mesmo contra velocidade superior.
- Falta de stamina ou item não consome rodada.
- Personagem morto não executa ataque pendente.
- Preparação do chefe é anunciada e não causa dano.
- Vitória/baú/missão não concedem recompensa duas vezes depois de recarregar.
- Derrota conserva progressão e retorna à vila com recursos restaurados.
- Subir de nível concede um ponto livre por nível, sem duplicação.
- Trocar equipamentos não cura nem cria bônus acumulados no estado base.

### 13.3 Persistência e UI

- Fechar e reabrir preserva treino, maestrias, posição segura, inventário e missão.
- Backup exportado e restaurado reproduz os mesmos valores e flags.
- Backup inválido não substitui um save válido.
- Falha de quota/armazenamento mostra erro e permite exportar.
- Recarregar durante combate retoma estado coerente sem duplicar turno/recompensa.
- Digitar no JSON não move o personagem.
- Colisões impedem atravessar paredes; saídas funcionam nos dois sentidos.
- Toque permite mover, interagir, importar e lutar sem teclado físico.
- Verificar layouts de 390 × 844 e 1366 × 768, sem corte de botões ou rolagem horizontal involuntária.

### 13.4 Roteiro de validação do primeiro marco

1. Iniciar save vazio e entrar na vila.
2. Abrir Treinos, colar fixture e constatar as pendências.
3. Confirmar data e marcar todas as séries como trabalho.
4. Conferir +58,5 força e +19,5 vigor; confirmar.
5. Voltar ao personagem e observar as duas barras, ainda sem incremento de atributo inteiro.
6. Entrar no bosque e vencer o Broto.
7. Conferir +15 XP, +5 ouro e +1 material, uma única vez.
8. Retornar à vila e descansar.
9. Recarregar: treino e recompensas continuam presentes.
10. Exportar backup, remover treino e verificar maestrias zeradas, preservando XP/loot.
11. Restaurar backup após confirmação e conferir a recuperação das maestrias.
12. Tentar reimportar o fixture e verificar bloqueio de duplicação.

Usar testes unitários para regras e pelo menos um teste de integração/E2E para o ciclo de importação e persistência. O cenário visual e o controle por toque precisam de inspeção real em navegador; testes de domínio não substituem essa verificação.

## 14. Ordem de implementação recomendada

1. **Preparação:** verificar ambiente e instruções; criar scaffold, documentos e configuração de build.
2. **Domínio:** schemas de treino, normalização, algoritmo diário, fixture e testes dos limites.
3. **Estado:** comandos de aplicação, save versionado, recuperação e backup.
4. **UI de treino:** colar, revisar, prévia, histórico, editar e remover.
5. **Mundo:** assets próprios/coerentes, vila, bosque, personagem, câmera e colisões.
6. **Combate:** Broto, regras de rodada, recompensas e retomada.
7. **Integração M1:** personagem, loja mínima, controles de toque e roteiro de validação completo.
8. **Capítulo M2:** três inimigos restantes, chefe, missão, baú, equipamentos e guilda.
9. **Polimento:** áudio, feedback, acessibilidade, responsividade e PWA quando testável.

Não gastar a primeira entrega inteira em menus ou arte conceitual. Fechar M1 antes de expandir conteúdo. Se o trabalho precisar de mais de uma sessão, deixar `docs/DECISIONS.md` com estado real, último teste executado e próximo passo concreto.

## 15. Relatório esperado do Codex

Ao concluir uma etapa, informar de forma objetiva:

- Título da alteração.
- O que já funciona e como abrir/jogar.
- Arquivos e módulos principais criados ou alterados.
- Testes/build realmente executados e resultados.
- Limitações reais, funcionalidades ainda fora do marco e decisões novas.
- Próximo marco recomendado.

Não dizer “publicado”, “sincronizado”, “testado no celular” ou “funciona offline” sem evidência correspondente. Não inventar URL de jogo ou repositório.

## 16. Decisões registradas e espaço para evolução

### 16.1 Decisões provenientes da conversa

Jogo pessoal web; nome provisório Fizzi Quest; Codex + GitHub + Vercel; Phaser + TypeScript; pixel art superior; um aventureiro inicialmente; treino por JSON revisado; quatro maestrias; nível de aventura separado; presença diária de musculação; limites de séries/minutos/pontos; PR sem bônus no primeiro protótipo; salvar localmente e permitir backup; sem punição por descanso ou derrota.

### 16.2 Decisões acrescentadas neste documento para fechar lacunas

São escolhas de protótipo, revisáveis após jogar:

- Distribuição proporcional dos limites diários e uso de centésimos.
- Valores base, fórmulas de combate, custos de nível, loot, preços e efeitos dos equipamentos.
- Prioridade especial de defender e fuga sempre bem-sucedida.
- Encontros visíveis por interação, respawn após descanso e flags de recompensa única.
- Coordenadas aproximadas, dimensões dos mapas e velocidade de movimento.
- Extensão do contrato para cargas por série, cardio, treinos parciais e séries isométricas.
- Implementação em dois marcos para terminar primeiro um ciclo completo.

### 16.3 Melhorias futuras que não devem atrasar M1

Sincronização com conta, integração com exportações do aplicativo utilizado, novas regiões, companheiro, especializações cosméticas, progressão pessoal comparada de forma consistente, expedições especiais, editor visual de treino e acessibilidade ampliada do mapa.

Nenhuma dessas melhorias deve exigir que o usuário aumente volume, carga ou frequência para ter acesso ao jogo normal. Evolução de gameplay deve ser calibrada pela diversão, preservando descanso e autonomia do jogador.
