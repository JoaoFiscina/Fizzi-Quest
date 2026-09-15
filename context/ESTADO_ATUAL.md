# Estado atual — v23.09.2003.3

## Feito

- scaffold Vite/TypeScript/Phaser com configuração de saída `dist` para Vercel;
- mapa de vila e bosque, colisões simples, transição leste/oeste, NPCs e encontros visíveis;
- combate determinístico e recompensas únicas por inimigo;
- schema de importação com limites, data, categorias, séries, cardio e pendências;
- cálculo diário proporcional em centésimos, deduplicação, edição e remoção;
- Store com save versionado, snapshot anterior, backup e restauração;
- HUD responsivo, menus de personagem/treinos/mochila/configurações e direcional de toque.
- Câmera com zoom inteiro aprovado e margens simétricas para mapas menores; `data-camera-padding` registra o enquadramento.
- Ciclos de idle dos quatro monstros, vento ocasional em grama/árvores/bandeiras e mapa prévio com regiões futuras bloqueadas.
- Loja reorganizada em cartões compactos e HUD com ouro, materiais e poções.

## Verificado nesta etapa

- Dependências instaladas; TypeScript e build Vite executados com sucesso.
- 25 testes de domínio: pontuação, teto/ordem, validação, histórico, backup, quota, combate, compra e rotas.
- Ciclo no navegador: importar fixture e revisar → explorar → vencer Broto → retornar → reload → exportar/remover/restaurar.
- Loja e fogueira exercitadas na UI. Reload durante animação preserva a rodada já calculada e não duplica loot.
- Capturas de desktop 1366×768 e viewport móvel 390×844 inspecionadas. Não equivale a teste em telefone físico.
- Resultado final: 25 testes de domínio + 6 E2E aprovados; build concluído.

## Melhorias visuais

- HUD e menu sem sobreposição no viewport móvel; câmera preenche a tela com escala inteira e centraliza sobras.
- Mais detalhe em aventureiro, Broto, árvore e guilda; animações de água, fogo, bandeiras e folhagem; idle dos monstros sem mover coordenadas de gameplay.
- `CombatEvent[]` alimenta apresentação separada: avanço/recuo, flash de alvo, dano flutuante, cura, guarda, preparação, fuga, vitória e derrota.
- Toda rodada é persistida antes dos efeitos. Durante os efeitos, a UI usa uma cópia descartável para atualizar barras no momento visual correto.
- `prefers-reduced-motion` reduz efeitos; redimensionamento encerra efeitos antigos e reconstrói a cena.
- Versão exibida no jogo a partir de `src/version.ts`.

## Ainda não concluído

- Repositório remoto GitHub e deployment Vercel. Só há Git local; nenhuma URL pública foi criada.
- Áudio, PWA/offline e atalho de força. Posto de vigia ainda não tem composição própria.
- Commit local pronto: `087a186 feat: centralizar mapa e compactar HUD v23.09.2003.3`.
- Repositório GitHub criado e sincronizado: `JoaoFiscina/Fizzi-Quest`, branch `main`, commit remoto `6e07c67`.
- Deployment Vercel ainda não foi criado; o `vercel.json` já define Vite, `npm run build` e saída `dist`.
- Backlog: estética do mapa, variações de spawn, HUD de arma/escudo/armadura, velocidade por atributo e pixel art mais definida dos monstros.
- Balanceamento de uma sessão longa e verificação em iPhone/Android reais.

Veja `docs/VALIDATION.md` para comandos, cobertura e limitações.
