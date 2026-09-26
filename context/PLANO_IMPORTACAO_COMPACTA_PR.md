# v23.09.2003.17 — importação compacta e bônus de recorde pessoal

Estado: **planejamento detalhado solicitado em 26/09/2026; ainda não implementado**. Complementa `PLANO_V17.md`, que mantém Anel por nível. Base publicada: v23.09.2003.16, PR #9. Este documento não altera o jogo nem registra testes executados da v17.

## Experiência desejada

O jogador escolhe a data do treino no jogo, copia o modelo, cola em uma IA e envia a descrição ou imagem do treino. A IA analisa os dados e retorna somente um JSON curto com ganhos e informações mínimas de controle. O jogador cola a resposta, vê a prévia de atributos/XP e confirma. Não precisa copiar séries, exercícios, cargas, resumo ou análise de volta ao jogo.

O treino detalhado permanece na conversa com a IA. O jogo armazena data, identificador, versão de cálculo, ganhos base, bônus de PR, limites aplicados e recompensa final. A importação detalhada v1 e o histórico anterior continuam compatíveis.

## Diagnóstico da v16

- `src/content/trainingPrompt.ts` exige um JSON extenso, com `workout`, exercícios e progressão, mesmo quando o objetivo do jogador é importar apenas recompensas.
- `parseAiWorkout` e `evidenceConfidence` dependem dessas métricas. Remover os campos sem mudar essa lógica faria o código curto falhar ou receber confiança baixa.
- `workout.prs` e `progression.prs` contam como evidência de confiança. Não há bônus de PR explícito na função de recompensa.
- O fator de atributos 1,25 da v16 precisa continuar exclusivo do caminho legado. Aplicá-lo novamente a ganhos finais calculados pelo novo modelo inflaria a recompensa.
- Um código com apenas números de recompensa não identifica a sessão. É necessário um identificador mínimo para impedir reaplicação acidental.

## Contrato compacto proposto

Exemplo didático, **não importável na v16**:

```json
{"v":2,"id":"ID_COPIADO_DO_JOGO","c":"alta","xp":140,"atributos":{"forca":0.22,"vigor":0.10,"agilidade":0,"folego":0.06},"pr":{"forca":1}}
```

- `v`: versão do contrato, independente da versão do jogo e do save.
- `id`: gerado pelo jogo e copiado literalmente pela IA; não inventado pela IA.
- `c`: confiança declarada pela IA (`baixa`, `media`, `alta`), usada para os limites da sessão. Não significa evidência verificada pelo jogo.
- `xp` e `atributos`: ganhos **base propostos**, já na escala final da v16; não incluem PR nem recebem novamente fator 1,25 no caminho v2.
- `pr`: quantidade de recordes elegíveis por atributo. O jogo calcula o bônus; a IA não pode embuti-lo nos ganhos base e somá-lo novamente.
- Atributos ausentes podem ser normalizados para zero; campos desconhecidos, valores negativos, não finitos e PR fracionário são rejeitados. Preferir nomes legíveis a uma lista de números cuja ordem possa ser confundida.
- Data e vínculo da sessão ficam no rascunho do jogo. O código não repete a descrição. Ouro não é solicitado à IA no formato novo; proposta: derivar localmente `floor(XP_base_aplicado / 3)`, respeitando limites de ouro por confiança e por dia. Isso preserva a economia sem alongar a resposta.

## Modelo copiável mais preciso

O texto copiável deve reunir as regras, a tabela de recompensa e o ID/data do rascunho. Não deve usar um exemplo com PRs fictícios ou misturar corrida e musculação como se todos os campos existissem no treino.

Instruções para a IA:

1. Se o jogador ainda não enviou o treino, pedir o treino; não emitir uma recompensa de exemplo.
2. Usar somente o relato/imagem e comparações fornecidos. Não inventar duração, exercícios, resultados anteriores ou recordes.
3. Determinar confiança com critérios explícitos: baixa para descrição vaga; média quando modalidade e duração ou volume são informados; alta quando há detalhamento suficiente, como séries/cargas/repetições ou tempo/distância. Ausência de uma métrica não deve ser preenchida por suposição.
4. Usar uma tabela de jogo versionada para o orçamento total, com teto de duração em 60 minutos. Não premiar intensidade extrema, dor ou treino excessivo. Isto é uma regra de progressão do jogo, não uma recomendação de exercício.
5. Distribuir o orçamento entre os atributos relacionados ao treino. A soma é única: um treino misto divide o orçamento, não ganha um orçamento completo por modalidade.
6. Identificar PR separadamente, sem incluí-lo nos ganhos base. Não reduzir ganhos por nível ou equipamento do personagem.
7. Responder somente com o JSON compacto, sem descrição dos exercícios, explicação, markdown ou texto adicional.

Tabela piloto para tornar o cálculo repetível; validar em fixtures antes da publicação:

| Confiança | XP base | Orçamento base de atributos |
| --- | ---: | ---: |
| Baixa | 20 | 0,01 |
| Média | 60 | 0,12 |
| Alta | 100 | 0,30 |

| Duração informada | Acréscimo de XP | Acréscimo no orçamento de atributos |
| --- | ---: | ---: |
| Ausente ou menor que 20 min | 0 | 0 |
| 20–39 min | 20 | 0,04 |
| 40–59 min | 40 | 0,08 |
| 60 min ou mais | 60 | 0,12 |

Aplicar primeiro o teto da confiança: baixa 60 XP/0,02 atributo, média 132 XP/0,23 atributo, alta 216 XP/0,50 atributo; por atributo, 0,02/0,15/0,28. Distribuição inicial por modalidade: musculação 60% Força, 30% Vigor, 10% Fôlego; corrida/ciclismo 60% Fôlego, 25% Vigor, 15% Agilidade; caminhada 50% Fôlego e 50% Vigor. Treino misto combina as proporções por duração conhecida, ou igualmente se não houver divisão. Arredondar para centésimos, redistribuindo excedentes sem ultrapassar os tetos. Para modalidades sem perfil definido, pedir uma descrição mais clara em vez de inventar uma associação.

A precisão aqui significa regras explícitas e resultados previsíveis para o jogo. Não significa medir adaptação física real a partir de um relato. Como o código compacto omite o treino, o jogo consegue conferir estrutura e limites, mas não refazer ou autenticar a análise da IA.

## Bônus de PR: regra piloto explícita

PR significa recorde pessoal. Só contar quando estiver marcado no registro enviado ou quando a comparação anterior/atual fornecida demonstrar melhora sob condições comparáveis. Primeiro registro não é automaticamente PR. Mais carga com menos repetições não é automaticamente melhora; não inferir recorde apenas por uma carga alta.

- Um PR elegível: **+0,02 no atributo relacionado e +5 XP**.
- No máximo **3 PRs recompensados por sessão e por dia**: até +0,06 atributo e +15 XP diários extras.
- Contar um evento uma vez. Não contar o mesmo recorde em `workout` e `progression`, nem cada série de uma mesma melhora como um recorde distinto. No máximo um evento bonificado por exercício/atividade na sessão.
- Recorde de força/carga/repetições comparáveis se relaciona a Força; melhora de tempo/distância em resistência se relaciona a Fôlego. Outros vínculos exigem evidência, sem distribuir todos os PRs pelos quatro atributos.
- Confiança baixa não recebe bônus de PR; mostrar a justificativa na prévia.
- Reservar o bônus fora do teto base para que ele não desapareça quando o treino normal já atingiu o limite. Teto total diário: 270 XP + até 15 XP de PR; 0,60 atributo + até 0,06 de PR. Ouro não recebe bônus de PR.
- A prévia deve mostrar separadamente **Treino**, **Bônus de PR**, **Ajuste de limite** e **Total**. Exemplo: Força +0,22 base +0,02 PR = +0,24; XP 140 +5 = 145.
- Não conceder bônus retroativo ao abrir saves antigos. Guardar o número de PRs efetivamente bonificados e sua distribuição no registro novo; reaplicar caps usando esse histórico, não apenas o número sugerido no código.

Os números são proposta de balanceamento para teste. A publicação depende de simular 0/1/3/10 PRs, vários treinos no dia, teto base já consumido e mistura com registros legados.

## Sessão, duplicatas e recuperação

1. Gerar um rascunho persistente com ID, data e versão de regras ao preparar o modelo. Copiar novamente usa o mesmo rascunho. Criar outro exige uma ação explícita de novo treino.
2. Ao colar, exigir que o ID corresponda ao rascunho e não esteja aplicado no histórico. Guardar rascunhos em uma estrutura aditiva e preservar sua recuperação em backup quando pendentes.
3. Fechar o modal ou recarregar a página não deve apagar o rascunho. Reimportar um código confirmado não concede nada novamente.
4. Receber código de outro dispositivo ou rascunho desconhecido deve gerar orientação legível para restaurar o backup ou gerar o modelo correspondente. Não associar silenciosamente à data de hoje.
5. Não usar igualdade de recompensas como prova de duplicação: treinos legítimos diferentes podem render os mesmos números.
6. Limitação conhecida: sem o treino original, não é possível detectar com certeza a mesma atividade reenviada sob um novo ID. O jogo é pessoal; prevenir repetição acidental e aplicar limites, sem anunciar autenticação antifraude.

## Importador e persistência

- Criar um schema v2 e manter o v1. Aceitar JSON simples e, por conveniência, um único bloco cercado por crases com `json`; rejeitar vários objetos ou texto ambíguo em vez de escolher silenciosamente um trecho.
- Nunca executar o código colado: `JSON.parse` e validação estrita, sem `eval`.
- Normalizar v2 em um registro próprio com discriminador de versão, sem inventar séries/exercícios para satisfazer o schema v1. Adaptar a ficha e o histórico a ambos os formatos.
- Separar `baseReward`, `prBonus` e `appliedReward`, além da versão de cálculo. Exportação/reload não reprocessam recompensa nem alteram valores históricos.
- Validar dias mistos v1/v2 e limites históricos sem rejeitar os 450 XP/dia legais nas versões antigas. Não aumentar indiscriminadamente o limite de todos os registros antigos para acomodar o bônus novo.
- Em um dia de transição com 450 XP antigos, o saldo de XP base novo é zero. Um bônus novo de PR ainda pode existir: validar separadamente a base histórica e os até 15 XP de bônus registrados, permitindo nesse caso até 465 XP históricos totais, sem transformar 465 no teto das sessões novas. O mesmo princípio vale para atributos base e reserva de PR.
- Confirmar recompensa e consumir rascunho em uma única transação persistida. Falha de gravação não pode marcar a sessão como aplicada.
- Erros devem dizer o campo e como corrigir. A prévia permanece sem efeito até **Confirmar recompensa**.

## Sequência junto ao Anel

A v17 passa a ter complexidade **média-alta**. Executar em dois blocos verificáveis na mesma branch, sem ampliar o catálogo ou acrescentar outro sistema:

1. Bloco Anel: concluir requisito nível 4, dois itens, migração `ring:null`, loja/mochila/ficha/HUD e testes previstos em `PLANO_V17.md`.
2. Bloco treino: schemas v1/v2, rascunho de sessão, tabela do prompt, importador compacto, bônus de PR e prévia/histórico.
3. Integrar ambos e simular sua interação: recompensa pode levar ao nível 4, liberando Anel; equipar Anel não altera ganhos futuros de treino.
4. Publicar somente com os dois blocos aprovados e saves antigos recuperáveis. Botas, Capa, Runas, novas habilidades e qualquer mudança gráfica continuam fora desta etapa.

## Arquivos e aceitação

Arquivos previstos: `src/content/trainingPrompt.ts`, `src/domain/aiWorkouts.ts` (ou módulo v2 separado), `src/application/store.ts`, `src/ui/workouts.ts`, testes de domínio/E2E e `docs/TRAINING_AI_FORMAT.md`. A definição do Anel segue o plano principal. `src/game/` deve permanecer intacto.

Aceitação: copiar modelo → enviar treino → colar resposta curta → revisar base/PR/total → confirmar → recarregar → preservar ganhos; código repetido bloqueado; modelo sem treino pede dados; PR não comprovado não bonifica; limites de sessão/dia e histórico legado preservados; Anel liberado após alcançar nível 4; teste de backup e rejeição sem perda; inspeção em 390×844, 430×932, 1366×768 e 1920×1080; testes, build e versão oficial conferidos.

Fixtures mínimas do prompt: musculação detalhada sem PR, com um PR explícito, corrida com comparação, relato vago, treino misto, métricas faltantes e várias marcações do mesmo recorde. Testar o contrato sintético localmente e distinguir esses testes de uma avaliação real com uma IA externa. Se a análise externa não for testada, registrar essa limitação.
