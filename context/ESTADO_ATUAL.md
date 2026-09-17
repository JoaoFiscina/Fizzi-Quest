# Estado atual — v23.09.2003.12

## Feito nesta versão

- escolha cosmética de personagem masculino ou feminino em Configurações;
- dois conjuntos de pixel art com idle e caminhada nas quatro direções;
- mesma hitbox, velocidade, atributos e equipamentos para os dois visuais;
- zoom Afastado, Padrão e Próximo com escala inteira e centralização recalculada;
- preferências de aparência e zoom persistidas no save;
- migração automática: saves antigos recebem aparência masculina e zoom padrão;
- movimento diagonal por combinações de WASD ou setas;
- velocidade diagonal normalizada para não superar a caminhada reta;
- colisão por eixo, permitindo deslizar ao longo de paredes;
- direcional móvel com oito posições e alvos de toque de 44 px;
- tutorial atualizado com aparência, câmera e movimento composto.

## Estado funcional preservado

- fluxo de treino real por IA externa com validação, prévia e histórico;
- mochila organizada, tipos de item e Manual do aventureiro;
- vila e bosque, colisões, transição, NPCs e encontros;
- combate determinístico e recompensa única;
- pontuação, maestria, XP, loja, missão e backup;
- Vite, TypeScript e Phaser com saída `dist` para Vercel.

## Verificação

- `npm test`: 34 testes aprovados;
- `npm run build`: aprovado;
- `npm run test:e2e`: 10 testes aprovados;
- migração de save antigo verifica os padrões de aparência e zoom;
- E2E confirma zoom 2/3/4, troca para o visual feminino e persistência após reload;
- E2E confirma deslocamento nos dois eixos e limita a distância diagonal;
- direcional móvel e Configurações inspecionados em 390×844;
- PR [#5](https://github.com/JoaoFiscina/Fizzi-Quest/pull/5) integrado à `main` no commit `f57b19a`;
- deployment de produção aprovado pela Vercel;
- domínio fixo respondeu HTTP 200 com o bundle da `v23.09.2003.12`.

## Riscos e limites

- navegador móvel emulado não substitui Safari/iOS e Android físicos;
- no celular, Afastado e Padrão podem coincidir quando 2× já é o mínimo seguro;
- personagens usam quatro direções visuais; diagonais reutilizam a orientação vertical correspondente;
- o bundle principal do Phaser permanece grande, embora o build seja válido;
- o mapa prévio funcional ainda precisa de uma passada estética própria.

## Próxima etapa

A `v23.09.2003.13` deve melhorar ambientação, identidade dos monstros, ataques e mapa prévio. Novos slots por nível foram divididos entre as versões 15 a 17 para respeitar o limite de complexidade por entrega.

Consulte `docs/VALIDATION.md` para os comandos e `context/PROXIMOS_PASSOS.md` para o backlog.
