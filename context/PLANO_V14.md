# Plano de execução — v23.09.2003.14
Data: 26/09/2026. Complexidade P2. Branch: feat/fundacao-visual-v14.

## 1. Recuperar a continuidade
- Água e fogo repetem continuamente; não disputam o orçamento de dois efeitos ocasionais.
- Fases próprias por instância evitam reinícios simultâneos.
- Árvores, grama e bandeiras continuam ocasionais, com ciclos completos.
- Somente objetos no enquadramento disputam a fila ocasional.
- Cancelar animações e timer ao reconstruir o mapa; remover o listener de resize ao encerrar.

## 2. Modelamento visual
- Preservar a grade, a paleta verde/ocre e as dimensões atuais.
- Água: cristas quebradas e sombras de onda, movidas dentro do tile.
- Fogo: duas línguas com silhueta e altura variáveis sobre base fixa.
- Árvores: copa deslocada um pixel por quadro dentro da textura; tronco fixo.
- Gerar folha visual comparável com os quatro quadros de água, fogo, árvore, grama e bandeira.
- Não confundir alteração de textura com alteração de posição lógica.

## 3. Preferência explícita
- Ajustes: Completa, Usar sistema, Reduzida e descrição do modo efetivo.
- Padrão compatível: Usar sistema; migração acrescenta somente a preferência.
- Completa permite ao jogador substituir a preferência detectada.
- Reduzida mantém água/fogo a 1 FPS, sem vegetação ou partículas ocasionais.
- Aplicação imediata, persistência, reload e acompanhamento da preferência do sistema.

## 4. Aceite real
- Testar mais de 30 segundos sem acelerar scheduler.
- Água/fogo precisam permanecer em reprodução em todas as amostras.
- Todos os objetos essenciais precisam mudar de quadro.
- Contagem de objetos e posições precisa permanecer constante.
- Verificar save antigo, diálogos, movimento diagonal, zoom e troca de mapa.
- Inspecionar folha de sprites e capturas desktop/mobile.
- Registrar limitações: teste móvel emulado, sem medição de bateria em aparelho físico.

## Entrega
Atualizar versão, histórico, estado, roadmap e evidências. Criaturas/mapa seguem na versão 15.
