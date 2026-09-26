import type { TrainingDraft } from "../domain/compactWorkouts";

/** Contract v2: the detailed workout stays in the AI conversation. */
export function trainingPrompt(draft: TrainingDraft) {
  return `FIZZI QUEST — ANALISE MEU TREINO REAL E DEVOLVA SOMENTE O CÓDIGO CURTO.

ID da sessão: ${draft.id}
Data já escolhida no jogo: ${draft.date}

Se ainda não enviei o relato, print ou dados do treino, peça esses dados antes de gerar o código. Use apenas informações presentes. Não invente duração, séries, cargas, distância, resultados anteriores nem recordes. Isto é progressão de um jogo, não prescrição de exercício. Não premie dor, intensidade extrema ou excesso.

Confiança: "baixa" para relato vago; "media" quando modalidade e duração ou volume estão claros; "alta" quando existem detalhes suficientes como séries/cargas/repetições ou tempo/distância. Nunca eleve a confiança por suposição.

Orçamento base (XP / soma dos atributos): baixa 20 / 0.01, media 60 / 0.12, alta 100 / 0.30. Duração informada acrescenta: menos de 20 min ou ausente +0 / 0; 20–39 min +20 / 0.04; 40–59 min +40 / 0.08; 60 min ou mais +60 / 0.12. Duração acima de 60 não aumenta o orçamento. Tetos finais por confiança: baixa 60 XP / 0.02 atributo / 0.02 por atributo; media 132 / 0.23 / 0.15; alta 216 / 0.50 / 0.28. Use centésimos nos atributos.

Distribua o orçamento UMA vez conforme o treino: musculação 60% Força, 30% Vigor, 10% Fôlego; corrida ou ciclismo 60% Fôlego, 25% Vigor, 15% Agilidade; caminhada 50% Fôlego, 50% Vigor. Treino misto divide o orçamento entre modalidades pela duração conhecida ou igualmente se ela faltar. Não conceda orçamento completo para cada modalidade. Se a modalidade não permitir associação, peça esclarecimento.

PR significa recorde pessoal. Conte apenas recorde explícito no relato ou melhora demonstrada contra resultado anterior comparável. Primeiro registro não é PR automático; carga maior com menos repetições não basta. Conte cada melhora uma vez por exercício/atividade. Relacione carga/força a forca e resistência/tempo a folego. Não embuta bônus de PR em xp ou atributos: o jogo soma +5 XP e +0.02 no atributo correspondente por PR elegível, até 3 no dia. Se não houver prova, omita pr ou use {}.

Retorne SOMENTE um JSON válido, sem markdown, texto ou descrição do treino. Copie o ID literalmente. Use ponto decimal e apenas estas chaves:
{"v":2,"id":"${draft.id}","c":"alta","xp":140,"atributos":{"forca":0.22,"vigor":0.10,"agilidade":0,"folego":0.06},"pr":{}}

O exemplo de números serve só para mostrar a estrutura. Calcule os números a partir do treino que eu enviar. Atributos ausentes podem ser omitidos. Não repita o exemplo se ainda não houver treino.`;
}
