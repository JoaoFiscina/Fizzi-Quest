# Fizzi Quest

RPG pessoal de exploração em pixel art, construído com Phaser, TypeScript e Vite para o marco **Treino à aventura**.

## Estado atual — v23.09.2003.11

Já estão implementados os blocos principais do domínio e da experiência:

- vila e bosque gerados em pixel art própria, com colisões, transição e personagem controlável;
- Broto Errante, Besouro de Pedra, Mariposa da Névoa e Guardião de Musgo com combate determinístico por turnos;
- atacar, golpe pesado, recuperar fôlego, defender, poção, fugir e habilidades desbloqueadas por nível;
- fluxo principal de treino real: copiar o modelo para uma IA externa, colar o JSON devolvido, revisar e confirmar a recompensa;
- validação local de confiança, limites por sessão e por dia, retornos decrescentes e bloqueio de duplicatas;
- tela do personagem com atributos fracionários, origem dos pontos, equipamentos e ganhos recentes;
- mochila agrupada por slot, tipos visíveis em cada equipamento e conjunto equipado em destaque;
- manual do aventureiro com Defesa, Fôlego, atributos, equipamentos, treinos e exploração;
- pontuação diária por regrasVersion 1, maestrias separadas de XP de aventura;
- inventário, loja, equipamento, baú, fogueira, missão da guilda e melhoria da sede;
- save versionado em localStorage, cópia anterior, exportação e restauração de backup;
- teclado, toque, layout vertical e HUD DOM sobre o canvas.

## Abrir localmente

```bash
npm install
npm run dev
```

Build para Vercel: `npm run build`, saída `dist`. A versão `v23.09.2003.11` está na `main` e publicada em [fizzi-quest.vercel.app](https://fizzi-quest.vercel.app).

Validação: `npm test` e `npm run test:e2e` (Edge via Playwright). Evidências e limites em [`docs/VALIDATION.md`](docs/VALIDATION.md).

Esta versão organiza equipamentos por categoria e inclui um tutorial consultável sem alterar o formato do save. A versão pública usa `v23.09.2003.x`; a versão npm equivalente usa SemVer (`23.9.2003-11`).

## Contexto vivo

Consulte [`context/README.md`](context/README.md) antes de continuar. A árvore registra o estado real, os riscos conhecidos e o próximo passo concreto. A especificação integral está em [`docs/GAME_SPEC.md`](docs/GAME_SPEC.md).

## Decisões

- A primeira entrega prioriza um ciclo jogável e usa assets gerados em código para manter a licença simples.
- O estado de jogo fica fora das cenas Phaser; menus e textos ficam no DOM.
- Valores indefinidos no treino permanecem pendências, nunca viram zero automaticamente.
