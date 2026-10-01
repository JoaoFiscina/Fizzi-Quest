# Expansão do Fizzi Quest — áreas, missões e criaturas

Plano elaborado após a implementação da v23.09.2003.22 em 01/10/2026. **Conteúdo futuro, ainda não implementado**. Numeração de cada entrega será definida ao abrir sua branch. Seguir [MOLDE_EXPANSAO.md](MOLDE_EXPANSAO.md) e [GUIA_QUALIDADE_EXPANSAO.md](GUIA_QUALIDADE_EXPANSAO.md).

## Direção de produto

Continuar o mesmo RPG de exploração e combate por turnos. Expandir a trilha recuperada para uma região marcada pelo abandono, com viajantes, ruínas e um ambiente que sugira histórias anteriores. Tom mais maduro significa diálogos sóbrios, motivos compreensíveis, tensão moderada e consequências locais; não exige violência gráfica, cinismo, punição do treino ou perder progresso. Manter português claro e sessões de 5–15 minutos.

O treino continua apoiando o personagem durante toda a progressão. Novos inimigos devem oferecer decisões táticas, não depender de grind excessivo ou de valores DEV. Reutilizar a identidade de encontros da v22, o combate determinístico, a patrulha limitada, o catálogo de equipamento e a composição visual aprovada.

## Fila e limites de cada entrega

Correções que bloqueiem jogo/save vêm primeiro. A v22 termina em revisão; depois vêm velocidade/Impulso e Diário de versões, já priorizados. Capa e Runas permanecem no backlog: não são requisito para abrir a primeira área e não entram junto de migração de mapas ou missões.

| Ordem da expansão | Prioridade         | Entrega                                    | Complexidade | Dependência e limite                                                                                  |
| ----------------- | ------------------ | ------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------- |
| E1                | Alta para expansão | Fundação de áreas e objetivos              | Alta         | Uma migração aditiva; adaptar Vila/Bosque existentes, sem nova área ou arte grande.                   |
| E2                | Alta para expansão | Área piloto: Margem do Ribeirão            | Alta         | E1 validada. Uma área compacta, missão linear simples, um monstro novo reutilizando ações existentes. |
| E3                | Média              | Missões secundárias e identidade narrativa | Média        | E2 estável. Duas missões curtas usando objetivos da fundação; nenhum sistema de diálogo ramificado.   |
| E4                | Média              | Área: Pedreira Velha                       | Alta         | E2/E3 estáveis. Layout, uma missão e um inimigo novo; boss separado.                                  |
| E5                | Média              | Boss da Pedreira e conclusão do arco       | Média-alta   | E4 validada. Um boss com intenção legível, uma conclusão e balanceamento; sem novo mapa.              |
| E6                | Baixa, futura      | Santuário das Raízes                       | Alta         | Só planejar em detalhe após o piloto das duas áreas; orçamento e progressão ainda abertos.            |

Uma entrega de alta complexidade é exclusiva. Mesmo E2 deve ser dividida se a área exigir nova mecânica de água, efeito de status ou migração adicional. Água inicialmente é obstáculo/cenário; sem natação, pesca ou clima dinâmico. Não prometer prazo nem número de versão antes de fechar escopo.

## E1 — fundação compatível, antes de ampliar

Problema atual: `Save.map` aceita somente `village`/`forest`; mapa e missão principal dependem de condições específicas. Expandir copiando esses condicionais produziria transições e recompensas inconsistentes.

1. Criar catálogo de áreas com IDs estáveis, nome, tamanho, pontos de entrada/saída e requisitos. Adaptar os dois mapas atuais preservando seus IDs, posições, colisões e arte.
2. Modelar transições explícitas: entrada segura, retorno à área anterior, bloqueio durante batalha e limite de câmera. Substituir gradualmente condições de borda por portas definidas; não reescrever o renderer inteiro.
3. Criar registro pequeno de missões/objetivos com IDs estáveis e estados não iniciada/ativa/concluída/recompensa entregue. Resolver eventos de interação, vitória e entrega no domínio; cada prêmio é idempotente.
4. Migrar a missão do emblema e saves antigos sem conceder novamente recompensa. Guardar legado suficiente para importações compatíveis e testar missão em cada estado, inclusive batalha em andamento.
5. Mapas futuros aparecem bloqueados com motivo claro, sem portal que leve a cenário incompleto.

Aceite: Vila/Bosque têm o mesmo fluxo jogável; ida/volta, recuperação após derrota, reload e backup funcionam. Testes de mapa, missão, vitória rara/original e isolamento DEV aprovados. E1 entrega infraestrutura sem anunciar uma região jogável nova.

## E2 — Margem do Ribeirão: piloto de expansão perceptível

**Tema:** trilha ribeirinha, ponte de madeira antiga, barranco e um pequeno abrigo de viajantes. Propor mapa inicial do mesmo porte do bosque, evitando câmera nova. Usar margem/água como leitura de rota, com uma clareira de descanso visual e retorno evidente.

**Acesso:** concluir recuperação da trilha/emblema. Nível recomendado provisório 5; comparar personagens treinados e não treinados antes de escolher um requisito rígido. Não bloquear por importação de treino.

**Missão principal — A passagem esquecida:** a guilda pede investigar a ponte; encontrar o marco de pedra e recuperar uma ferramenta no abrigo, protegida por um encontro. Voltar ao responsável abre a passagem narrativa. Objetivos usam interação/vitória/entrega já disponíveis, sem inventário de coleta genérico nesta etapa.

**Criatura piloto — Caranguejo de Cascalho:** silhueta baixa com pinças legíveis, 16 px de grade e mesma escala dos comuns. Reutilizar primeiro defesa alternada do Besouro; diferenciar nome, arte e atributos moderados, sem novo status. Dois pontos de encontro com identidades próprias somente se a fundação suportar duplicatas verificadas. Área de patrulha predefinida e pausa variável.

**Composição:** água contínua, reflexos discretos, vegetação ocasional e bandeira do abrigo segundo o controlador existente. Priorizar contraste de caminho e interação; não acrescentar partículas globais. Som/efeito novo apenas se tiver asset autorizado e orçamento comprovado.

Piloto: construir entrada + uma clareira + um encontro + um objetivo, validar em escala normal, depois completar o mapa. Comparar antes/depois em saves sintéticos de níveis 5/10 com e sem Botas/Impulso. Recompensa provisória de missão deve ficar próxima do esforço do emblema; fixar XP/ouro após medir tempo, dificuldade e economia.

Aceite: ida e volta completas, criatura reconhecível, interação próxima da posição visível, vitória persistida, objetivo e recompensa únicos, água/vegetação contínuas e layout acessível. Evidência desktop e celular emulado; regressão de saves v21/v22 antes do próximo passo.

## E3 — duas histórias pequenas, sem multiplicar sistemas

- **Marcas na margem:** um viajante perdeu a rota para casa; investigar dois marcos e explicar o caminho. Exploração e entrega, sem combate obrigatório.
- **O abrigo silencioso:** verificar o abrigo depois de um desaparecimento de suprimentos. Um encontro existente e retorno ao NPC; recompensa modesta.
- Texto breve, humano e sóbrio: moradores querem manter a passagem segura, não celebram toda vitória. Exemplo de voz: “A ponte ainda aguenta. O caminho até ela é que deixou de ser seguro.”
- Mostrar objetivo atual e motivo do bloqueio, reutilizando Tutorial/Mapa; evitar popups repetitivos. Sem decisões irreversíveis ou ramificações morais nesta etapa.

## E4/E5 — Pedreira Velha e boss em entregas diferentes

**Pedreira Velha:** pedra dessaturada, trilhos interrompidos, ferramentas abandonadas e vegetação recuperando o lugar. Uma rota principal e desvio curto de recompensa; sem labirinto extenso. Missão **O peso do silêncio** investiga por que as cargas não chegam à vila.

**Monstro novo — Vigia de Argila:** corpo angular distinto do Guardião; começar com ações atuais e intenção claramente descrita. Proposta de nível recomendado 8–10, confirmada após E2. Não escolher atributos pelo DEV.

**Boss posterior — Sentinela da Pedreira:** um encontro com preparação e golpe forte legível, aproveitando a sequência do Guardião. Uma vulnerabilidade explícita no turno de preparação pode ser planejada, mas qualquer nova regra de combate terá testes próprios. Fechar o arco com reabertura de uma rota, sem novo equipamento obrigatório. Nova aparição rara desse boss só entra após verificar a fundação v22 com a nova espécie.

## E6 — horizonte, sem execução antecipada

Santuário das Raízes: arquitetura tomada pela floresta, iluminação pontual e criatura própria. Só definir mapas, missões e boss após avaliar se Ribeirão/Pedreira são divertidos e fluidos. Evitar produção de muitos sprites antes da aprovação dos pilotos.

## Validação, documentação e ponto de retomada

Cada entrega registra área, criaturas, missão, migração, orçamento e evidências em sua pasta versionada. Medir cena referência e candidata no mesmo aparelho, modo e viewport; investigar regressão sustentada de frame time antes de aumentar população. Não declarar qualidade por teste de timer sozinho.

Próxima ação de expansão: após estabilizar a v22 e as prioridades anteriores, abrir um plano versionado da **E1**, mapear transições/quest atuais e exportar fixtures antigas. Em seguida usar o guia de qualidade como tutorial de execução. Este plano não altera o tom, mapas ou missões da versão pública atual.
