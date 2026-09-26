# Treino por IA — contrato v1

## Fluxo principal

1. Em **Treinos**, o jogador abre **Copiar modelo para a IA**.
2. Copia o prompt e o envia a uma IA externa junto com prints ou uma descrição do treino.
3. A IA responde somente com o JSON `fizzi_workout` v1.
4. O jogador cola o resultado no Fizzi Quest.
5. O jogo valida os dados, recalcula os limites e mostra uma prévia.
6. A confirmação aplica XP, ouro e atributos em uma única gravação.

A IA interpreta o treino e propõe valores. O Fizzi Quest é a autoridade final da recompensa.

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
