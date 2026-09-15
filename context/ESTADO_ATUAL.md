# Estado atual — v23.09.2003.7

## Feito

- scaffold Vite/TypeScript/Phaser com configuração de saída `dist` para Vercel;
- mapa de vila e bosque, colisões simples, transição leste/oeste, NPCs e encontros visíveis;
- combate determinístico e recompensas únicas por inimigo;
- schema de importação com limites, data, categorias, séries, cardio e pendências;
- cálculo diário proporcional em centésimos, deduplicação, edição e remoção;
- Store com save versionado, snapshot anterior, backup e restauração;
- HUD responsivo de 2 colunas com barras de 8px e valor inline, menu nav com ícone+label e direcional D-pad touch responsivo.
- Câmera com zoom inteiro e enquadramento simétrico.
- Ciclos de idle de 3 quadros para o herói (respiração e piscar) e 6 quadros dedicados para cada espécie de monstro.
- Transição de caminhada com passada completa (4 quadros por direção) com elevação e oscilação alternada de pernas/braços.
- Loja e mochila em formato de cards com badges de estado (equipado/disponível).
- Suporte a equipamentos em 4 slots (arma, escudo, armadura e acessório) e velocidade baseada no atributo Agilidade.
- Spawn determinístico dos inimigos com leve variância visual.
- Refinamentos ambientais (água e fogo com funções senoidais de 8 quadros) e animações avançadas (Squash & Stretch em monstros, respiração e capa do herói).

## Verificado nesta etapa (v23.09.2003.7)

- Dependências instaladas; TypeScript e build Vite executados com sucesso.
- Refinamentos ambientais: água e fogo usam funções senoidais de 8 quadros.
- Monstros usam Squash & Stretch. Herói respira e balança a capa na idle.
- Testes E2E (Playwright) verificam frames (`world.ts` / `main.ts`).
- HUD atualizado para painéis glassmorphism escuros, ícones textuais limpos e barras flat, removendo os emojis antigos.
- 28 testes de domínio passando (equipamentos, offsets, atributos, save e migrações).
- 6 testes End-to-End (Playwright) validados no Chromium sem regressões.
- HUD, modais de personagem/mochila e D-pad reestruturados e testados em resoluções de desktop e mobile.

## Melhorias visuais

- HUD com painéis glassmorphism escuros, ícones textuais limpos e barras flat.
- Menus de ação (Personagem, Treinos, Mochila, Mapa, Ajustes) com ícones e rótulos integrados.
- Modais com header em degradê e detalhe dourado, botão fechar circular e cartões para itens de mochila.
- Animação do aventureiro com ciclo Idle (3 quadros) e Walk (4 quadros por direção).
- Sprites de monstros com quadros específicos de respiro e movimentação fluida via animações nativas do Phaser 3.
- `prefers-reduced-motion` respeitado e persistência de save preservada integralmente.

## Ainda não concluído

- Repositório remoto no GitHub sincronizado; deploy na Vercel a ser atualizado.
- Áudio, PWA/offline e atalho de força.
- Backlog futuro: spawn dinâmico de monstros com patrulhamento (pós primeira derrota) e balanceamento visual detalhado dos tiles do mapa.


Veja `docs/VALIDATION.md` para comandos, cobertura e limitações.
