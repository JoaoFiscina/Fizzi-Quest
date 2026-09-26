# Próximos passos

O plano detalhado da v15 está em [`PLANO_V15_COMPOSICAO_ESTETICA.md`](PLANO_V15_COMPOSICAO_ESTETICA.md). O roadmap completo fica em [`ROADMAP_IMPLEMENTACOES.md`](ROADMAP_IMPLEMENTACOES.md).

Para executar qualquer etapa, usar [`MOLDE_EXPANSAO.md`](MOLDE_EXPANSAO.md): referência antes, piloto, validação adequada e confirmação da versão oficial.

## Entrega atual — v23.09.2003.15

1. Composição estática da vila e do bosque, com rota e pontos de interesse mais legíveis.
2. Quatro monstros redesenhados com ciclos e poses próprios, sem mudar encontros ou combate.
3. Mapa regional responsivo, com Posto como marco do bosque e três regiões futuras bloqueadas.
4. Evidências antes/depois, testes temporais e validação em `docs/VALIDATION.md`.
5. Integração concluída no PR #8 e deploy confirmado no endereço oficial.

## Etapas seguintes
### v23.09.2003.16 — progressão e treino

1. Reduzir o XP concedido pelos treinos e aumentar moderadamente a participação deles nos atributos.
2. Remover o redutor baseado no atributo total do personagem.
3. Manter confiança, limites por sessão/dia e bloqueio de duplicatas.
4. Melhorar a apresentação dos desbloqueios progressivos de habilidades.

### v23.09.2003.17 — desbloqueios de slots e Anel

1. Criar a fundação de slots liberados por nível.
2. Mostrar slots bloqueados e requisitos sem conceder itens inexistentes.
3. Manter Broches e Pingentes no slot atual de Acessório.
4. Adicionar somente Anel para validar migração e balanceamento.

### v23.09.2003.18 — Botas e Capa

1. Adicionar dois slots simples sobre a fundação já testada.
2. Atualizar mochila, loja, personagem, HUD e combinações de bônus.
3. Não incluir Runas nesta versão.

### v23.09.2003.19 — Runas

1. Criar um único slot de Runa com efeitos passivos simples.
2. Isolar condições e combinações para proteger o combate determinístico.
3. Definir níveis e valores finais após simular as versões 17 e 18.

### Etapa posterior — mundo e conteúdo

1. Criar respawn em posições levemente diferentes e patrulhamento em áreas caminháveis.
2. Revisar rota bifurcada, baú, chefe, equipamentos e missão antes de abrir regiões.
3. Continuar calibrando velocidade por Agilidade.
4. Testar produção em Safari/iOS e Android Chrome físicos.

Áudio e PWA continuam opcionais e só devem ser anunciados depois de implementados e verificados.
