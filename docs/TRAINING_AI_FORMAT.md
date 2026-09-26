# Treino por IA — contrato compacto v2

## Fluxo principal da v17

1. Em **Treinos**, escolha a data, crie o modelo e copie o prompt com o ID gerado pelo jogo. O rascunho fica no save e no backup até a confirmação; copiar de novo usa o mesmo ID.
2. Cole o prompt em uma IA externa e envie o relato ou imagem do treino na mesma conversa. A IA deve pedir o treino se ainda não recebeu dados.
3. Cole no jogo somente o JSON curto com `v`, `id`, `c`, `xp`, `atributos` e, se houver recorde pessoal demonstrado, `pr`. Um único bloco cercado por crases com `json` também é aceito.
4. Confira a prévia de **Treino**, **Bônus de PR**, **Ajuste de limite** e **Total**. Apenas **Confirmar recompensa** concede os ganhos e consome o rascunho.

```json
{"v":2,"id":"ID_GERADO_PELO_JOGO","c":"alta","xp":140,"atributos":{"forca":0.22,"vigor":0.10,"agilidade":0,"folego":0.06},"pr":{"forca":1}}
```

Esse exemplo ilustra a estrutura; só funciona com o ID de um rascunho real. `c` aceita `baixa`, `media` e `alta`. Atributos e PRs ausentes valem zero. Números negativos, não finitos, PR fracionário e campos desconhecidos são rejeitados. O jogo calcula o ouro a partir do XP base aplicado (`floor(XP/3)`), sujeito aos limites. Não há ouro informado pela IA.

O prompt usa a tabela de orçamento por confiança e duração registrada em `src/content/trainingPrompt.ts`. A IA distribui o orçamento uma vez entre atributos do treino. O jogo não aplica de novo o fator 1,25 do formato v1; ele limita a proposta por confiança, sessão e dia. O valor do personagem ou equipamentos não reduz esse ganho.

Um PR elegível rende **+5 XP e +0,02** no atributo relacionado. No máximo três contam por sessão e por dia; confiança baixa não recebe bônus. O bônus fica fora do teto base diário de 270 XP e 0,60 atributo, até 285 XP e 0,66 atributo no total. O ouro não recebe bônus. O jogo não vê o treino original, portanto verifica estrutura, ID e limites, mas não consegue comprovar que a IA identificou um PR corretamente. Primeiro registro não é PR automático; o prompt pede comparação explícita.

Históricos v1 e saves antigos continuam válidos sem recálculo. Num dia com 450 XP antigos, o ganho base novo é zero; ainda pode haver até 15 XP de PR novo. Respostas v1 detalhadas continuam importáveis. A confirmação é transacional: falha de armazenamento conserva o rascunho e não aplica XP na sessão.

## Formato detalhado v1 — compatibilidade

## Fluxo legado

1. Em **Treinos**, o jogador abre **Copiar modelo para a IA**.
2. Copia o prompt e o envia a uma IA externa junto com prints ou uma descrição do treino.
3. A IA responde com o JSON detalhado `fizzi_workout` v1.
4. O jogador cola o resultado no Fizzi Quest.
5. O jogo valida os dados, recalcula os limites e mostra uma prévia.
6. A confirmação aplica XP, ouro e atributos em uma única gravação.

A IA interpreta o treino e propõe valores. Esse formato continua aceito para resultados gerados com o modelo antigo; o modelo copiável atual usa v2.

## Formato mínimo

```json
{
  "type": "fizzi_workout",
  "version": 1,
  "id": "workout-2026-09-15-1928",
  "date": "2026-09-15",
  "summary": "Treino de membros inferiores",
  "confidence": "high",
  "workout": {
    "modality": "strength"
  },
  "rewards": {
    "xp": 204,
    "gold": 72,
    "attributes": {
      "strength": 0.18,
      "vigor": 0.11,
      "agility": 0.04,
      "breath": 0
    }
  },
  "progression": {}
}
```

Campos opcionais de `workout`: `duration_min`, `sets`, `volume_kg`, `prs`, `distance_km`, `pace`, `intensity_rpe`, `exercises` e `notes`. Os atributos aceitos são somente `strength`, `vigor`, `agility` e `breath`.

## Confiança e evidências

- `low`: descrição curta ou poucas métricas verificáveis.
- `medium`: duração e pelo menos algumas métricas.
- `high`: evidências suficientes para avaliar volume, intensidade ou progressão.

O jogo calcula novamente a confiança. Uma declaração `high` sem evidências é reduzida antes do balanceamento.

## Limites aplicados pelo jogo

| Confiança efetiva | XP por sessão | Ouro por sessão | Atributos por sessão | Por atributo |
| ----------------- | ------------: | --------------: | -------------------: | -----------: |
| Baixa             |            60 |              18 |                 0,02 |         0,02 |
| Média             |           132 |              45 |                 0,23 |         0,15 |
| Alta              |           216 |              80 |                 0,50 |         0,28 |

Limites para novas recompensas no mesmo dia: 270 XP, 100 de ouro e 0,60 somando todos os atributos. Em treinos de confiança média ou alta, a proposta de atributos recebe um fator de 1,25 antes dos limites por atributo, sessão e dia. O valor atual do personagem e os equipamentos não reduzem esse ganho. Se a soma ultrapassar o limite, o jogo reduz os ganhos proporcionalmente.

Recompensas já registradas sob limites anteriores permanecem no save e não são recalculadas. Elas continuam contando para o total daquele dia; quando já excedem um limite novo, um treino adicional recebe zero para o recurso correspondente.

## Proteção e persistência

- JSON inválido, versão desconhecida, datas inválidas e números fora da estrutura são rejeitados.
- Um treino já salvo é detectado pelo `id` externo ou pela impressão estável de data, resumo e conteúdo.
- A prévia não altera o save.
- A confirmação grava recompensa e histórico juntos.
- Registros do formato antigo continuam preservados e aparecem no mesmo histórico.
