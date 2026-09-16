# Estado atual — v23.09.2003.8

## Feito

- Reversão estética e alinhamento visual com a foto de referência (v23.09.2003.4);
- Remoção de ruídos de textura e alterações visuais indesejadas em herói, monstros, árvores e terrenos;
- Restauração dos rótulos "Vida" e "Fôlego" no HUD, armas e ícones limpos em `main.ts` e `style.css`;
- scaffold Vite/TypeScript/Phaser com configuração de saída `dist` para Vercel;
- mapa de vila e bosque, colisões simples, transição leste/oeste, NPCs e encontros visíveis;
- combate determinístico e recompensas únicas por inimigo;
- schema de importação com limites, data, categorias, séries, cardio e pendências;
- cálculo diário proporcional em centésimos, deduplicação, edição e remoção;
- Store com save versionado, snapshot anterior, backup e restauração;

## Verificado nesta etapa (v23.09.2003.8)

- Todos os 28 testes de domínio unitários aprovados (`npm test`).
- Build executado com sucesso sem erros (`npm run build`).

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
