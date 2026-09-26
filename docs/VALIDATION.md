# Validação — v23.09.2003.15

Data: 26/09/2026. Ambiente: Windows, Edge headless, Phaser/TypeScript/Vite.

## Resultado técnico

- `npm test`: 34 testes aprovados.
- `npm run build`: aprovado; JavaScript próprio 56,44 KB gzip e Phaser 332,17 KB gzip.
- `npm run test:e2e`: 17 testes aprovados em 3,5 minutos.
- Teste temporal da v15: 31 amostras em intervalos de 1 segundo, cobrindo mais de 30 segundos. Os quatro monstros trocaram de quadro e conservaram a posição lógica; água/fogo continuaram animados.
- Estados de carapaça do Besouro e preparo do Guardião foram conferidos a partir do combate salvo.
- Mapa conferido em 390×844, 430×932, 1366×768 e 1920×1080, com marcadores atuais e regiões futuras bloqueadas.
- Testes legados cobrem save/reload no meio da apresentação, diagonais, zoom, compra, treino e modo de movimento reduzido.

## Inspeção estética

Capturas antes/depois usam o mesmo save sintético, posição, zoom Afastado e preferência Reduzida. Vila, bosque, bifurcação e mapa foram comparados na escala real de jogo. A vila ganhou hierarquia mais clara no piso e nos serviços; o bosque mostra pedra no ramo alto e musgo no ramo baixo. O Broto tem folhas separadas do rosto; o Besouro, carapaça e patas; a Mariposa, asas que mudam de contorno; o Guardião, massa corporal e preparação legível. O mapa elimina a falsa passagem para o Posto e isola as regiões que ainda não existem.

A folha ampliada em escala inteira `after/monster-frames.png` permite avaliar os quatro quadros de cada criatura. Comparação de pixels demonstra mudança, mas o julgamento de leitura foi feito nas capturas de jogo. Centro das rotas e personagens continuam visíveis. Não foi necessário alterar hitbox, matriz de colisão ou escala do mundo.

## Arquivos de evidência

`docs/evidence/v23.09.2003.15/`:

- `before/`: vila, bosque, bifurcação e mapa capturados na base v14;
- `after/`: mesmas capturas na v15; mapa e mundo no celular emulado; poses de combate; folha de quadros;
- `after/monster-cadence.json`: sequência temporal real dos sprites e do ambiente.

## Limites

- Emulação de viewport não equivale a teste em aparelho Android/iOS físico.
- Não houve benchmark confiável de bateria ou FPS em aparelho de entrada.
- Composição de terreno foi refinada dentro da geometria atual; áreas jogáveis novas, patrulhamento e respawn variável pertencem a etapas futuras.
- Transições amplas de entrada e saída do combate foram adiadas para evitar um novo sistema nesta versão. Os eventos existentes ganharam poses curtas.
- O aviso de chunk grande do Phaser permanece; o build é aprovado.
- Histórico da validação anterior: `VALIDATION_V14.md`.

## Produção

PR #8 integrado à `main` no commit `0fed77f`. O check da Vercel passou. Consulta ao endereço oficial retornou HTTP 200 e o bundle serviu `v23.09.2003.15`. Em Edge headless, o título foi `Fizzi Quest · v23.09.2003.15`, o rodapé mostrou a mesma versão e o canvas iniciou após Nova aventura. Captura: `evidence/v23.09.2003.15/after/live-production.png`.
