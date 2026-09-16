export const TRAINING_AI_PROMPT = `ANALISE ESTE TREINO PARA O FIZZI QUEST.

Leia apenas as informações realmente presentes nas imagens ou no texto que eu enviar. Não invente carga, repetição, duração, distância, pace, intensidade, PR ou progressão.

Considere, quando existirem: modalidade, duração, exercícios, séries, cargas, repetições, volume, distância, pace, velocidade, inclinação, intensidade/RPE, PRs e comparação com treinos anteriores.

Classifique a qualidade dos dados como "low", "medium" ou "high":
- low: descrição curta, sem métricas suficientes;
- medium: duração e algumas métricas verificáveis;
- high: dados que permitem avaliar volume, intensidade ou progressão com segurança.

Sugira XP, ouro e ganhos nos atributos atuais do jogo: strength (Força), vigor (Vigor), agility (Agilidade) e breath (Fôlego). Não converta carga diretamente em atributo. Valorize progressão e PRs, use retornos decrescentes e seja conservador nos atributos. Um registro low pode receber XP e ouro, mas deve receber pouco ou nenhum atributo.

O Fizzi Quest recalculará e limitará todas as recompensas. Use números sem unidades nos campos numéricos e ponto como separador decimal.

No final, responda SOMENTE com um JSON válido neste formato, sem markdown e sem explicações depois dele:

{
  "type": "fizzi_workout",
  "version": 1,
  "id": "workout-AAAA-MM-DD-HHMM",
  "date": "AAAA-MM-DD",
  "summary": "Resumo curto do treino",
  "confidence": "low | medium | high",
  "workout": {
    "modality": "strength | running | walking | cycling | hybrid | other",
    "duration_min": 55,
    "sets": 20,
    "volume_kg": 6165.5,
    "prs": 9,
    "distance_km": 5,
    "pace": "5:24 min/km",
    "intensity_rpe": 8,
    "exercises": [
      {
        "name": "Agachamento hack",
        "sets": [
          { "weight": 20, "reps": 10 },
          { "weight": 30, "reps": 10 }
        ]
      }
    ],
    "notes": "Somente observações presentes na fonte"
  },
  "rewards": {
    "xp": 340,
    "gold": 72,
    "attributes": {
      "strength": 0.18,
      "vigor": 0.11,
      "agility": 0.04,
      "breath": 0
    }
  },
  "progression": {
    "prs": 9,
    "notes": "Progressão observada, se houver"
  }
}

Remova campos opcionais sem informação em vez de preenchê-los por suposição. Mantenha sempre type, version, id, date, summary, confidence, workout.modality, rewards e progression.`;
