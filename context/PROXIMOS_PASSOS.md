# Próximos passos

O plano detalhado e os critérios de aceite ficam em [`ROADMAP_IMPLEMENTACOES.md`](ROADMAP_IMPLEMENTACOES.md). Esta página mantém a ordem prática de execução.

## Próxima etapa recomendada

### v23.09.2003.14 — recuperação da fundação visual

1. Separar movimentos-base, reações ocasionais e partículas raras.
2. Restaurar água e fogo contínuos no modo completo, com fases diferentes.
3. Limitar somente reações e partículas, sem interromper movimentos-base.
4. Adicionar escolha Completa, Usar sistema ou Reduzida em Ajustes.
5. Tornar os quadros mais legíveis e validar 30 segundos na cadência real.
6. Exigir comparação temporal com diferença visual mensurável.
7. Consultar [`DIAGNOSTICO_GRAFICO_V13.md`](DIAGNOSTICO_GRAFICO_V13.md).

## Concluído na v23.09.2003.13

1. Água, fogo, árvores, vegetação e bandeiras usam ciclos finitos e dessincronizados.
2. Folhas e poeira aparecem raramente por sprites pré-criados.
3. Um controlador mantém pausas, probabilidade e limite de efeitos.
4. Troca de mapa cancela o timer anterior.
5. Movimento reduzido elimina detalhes decorativos e limita ciclos essenciais.
6. Gameplay, colisões e save foram preservados.

## Etapas seguintes

### v23.09.2003.15 — criaturas e mapa

1. Refinar a pixel art dos monstros sem aumentar a escala ou mudar hitboxes.
2. Dar idle, pausa, reação e ataque visual próprios para cada espécie.
3. Melhorar transições do combate e respeitar movimento reduzido.
4. Remodelar o mapa prévio com áreas futuras bloqueadas e centralizadas.

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
