# Fizzi Quest

RPG pessoal de exploração em pixel art, construído com Phaser, TypeScript e Vite para o marco **Treino à aventura**.

## Implementação atual — v23.09.2003.20

Já estão implementados os blocos principais do domínio e da experiência:

- vila e bosque gerados em pixel art própria, com colisões, transição e personagem controlável;
- Broto Errante, Besouro de Pedra, Mariposa da Névoa e Guardião de Musgo com combate determinístico por turnos;
- atacar, golpe pesado, recuperar fôlego, defender, poção, fugir e habilidades desbloqueadas por nível;
- fluxo principal de treino real: copiar o modelo para uma IA externa, colar o JSON devolvido, revisar e confirmar a recompensa;
- o modelo novo gera uma resposta curta com XP, atributos e PRs; a análise detalhada fica na conversa com a IA, e o jogo soma um bônus moderado por recorde pessoal;
- validação local de confiança, limites por sessão e por dia e bloqueio de duplicatas; ganhos de treino não diminuem por nível ou equipamento;
- treinos concedem menos XP de aventura e contribuem mais para atributos em confiança média/alta;
- habilidades bloqueadas aparecem com nível, custo de fôlego e função tática antes do desbloqueio;
- tela do personagem com atributos fracionários, origem dos pontos, equipamentos e ganhos recentes;
- mochila agrupada por slot, tipos visíveis em cada equipamento e conjunto equipado em destaque;
- Anel liberado no nível 4, com duas opções na loja, slot próprio na mochila e indicação no HUD;
- Botas liberadas no nível 5, com catálogo próprio, equipagem e bônus na ficha/HUD;
- Impulso da Trilha ativo no nível 5: custa 1 fôlego, dá +5% por 5 segundos no rank 1 e escala a cada cinco níveis apenas durante a exploração;
- modo desenvolvedor `DEV23` em Ajustes: cria uma cópia de teste para ajustar XP, ouro, bônus dos quatro atributos e multiplicador de XP de combate/missão, mantendo a aventura normal separada;
- manual do aventureiro com Defesa, Fôlego, atributos, equipamentos, treinos e exploração;
- escolha cosmética de personagem masculino ou feminino, preservada no save;
- zoom Afastado, Padrão e Próximo com escala inteira e adaptação à viewport;
- movimento diagonal normalizado por teclado e direcional móvel de oito posições;
- ciclos ambientais leves e dessincronizados para água, fogo, árvores, vegetação e bandeiras;
- quatro criaturas redesenhadas com silhuetas e ciclos próprios; poses de combate acompanham os eventos já calculados;
- vila e bosque com caminho, texturas e pontos de referência refinados; mapa regional responsivo distingue locais atuais de regiões futuras;
- folhas e poeira ocasionais com limite de dois efeitos e modo de movimento reduzido;
- aviso quando o aparelho pede movimento reduzido, com atalho para ativar os ciclos completos;
- verificação da versão publicada e botão de atualização quando há arquivos novos, preservando o save local;
- pontuação diária por regrasVersion 1, maestrias separadas de XP de aventura;
- inventário, loja, equipamento, baú, fogueira, missão da guilda e melhoria da sede;
- save versionado em localStorage, cópia anterior, exportação e restauração de backup;
- teclado, toque, layout vertical e HUD DOM sobre o canvas.

## Abrir localmente

```bash
npm install
npm run dev
```

Build para Vercel: `npm run build`, saída `dist`. O endereço oficial é [fizzi-quest.vercel.app](https://fizzi-quest.vercel.app); confirme a versão exibida no rodapé após cada integração à `main`.

Validação: `npm test` e `npm run test:e2e` (Edge via Playwright). Evidências e limites em [`docs/VALIDATION.md`](docs/VALIDATION.md).

Esta versão acrescenta o modo DEV para experimentar progressão e economia sem alterar o save normal. A arte e as cadências ambientais permanecem iguais. A versão pública usa `v23.09.2003.x`; a versão npm equivalente usa SemVer (`23.9.2003-20`).

## Contexto vivo

Consulte [`context/README.md`](context/README.md) antes de continuar. A árvore registra o estado real, os riscos conhecidos e o próximo passo concreto. A especificação integral está em [`docs/GAME_SPEC.md`](docs/GAME_SPEC.md).

## Decisões

- A primeira entrega prioriza um ciclo jogável e usa assets gerados em código para manter a licença simples.
- O estado de jogo fica fora das cenas Phaser; menus e textos ficam no DOM.
- Valores indefinidos no treino permanecem pendências, nunca viram zero automaticamente.
