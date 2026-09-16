# Estado atual — v23.09.2003.10

## Feito nesta versão

- fluxo único de treino real: copiar o modelo, usar uma IA externa, colar o JSON, revisar e confirmar;
- contrato JSON v1 estável, com ID, data, confiança, treino, recompensas e progressão;
- correção automática da confiança conforme as evidências realmente recebidas;
- limites por sessão e por dia, retornos decrescentes para atributos altos e bloqueio por ID ou conteúdo duplicado;
- aplicação atômica de XP, ouro e atributos, com histórico persistente e compatível com saves antigos;
- histórico antigo preservado e apresentado junto aos registros do fluxo atual;
- tela do personagem com valor fracionário, barra para o próximo ponto, origem dos atributos, equipamentos e ganhos recentes;
- prévia e confirmação responsivas, com feedback discreto após a recompensa.

## Estado funcional preservado

- Vite, TypeScript e Phaser com saída `dist` para Vercel;
- vila e bosque, colisões, transição, NPCs e encontros;
- combate determinístico e recompensa única;
- importação e revisão de treino pela IA externa;
- pontuação, maestria, XP, loja, inventário, missão e backup;
- save versionado com migração não destrutiva.

## Verificação

- `npm test`: 34 testes aprovados;
- `npm run build`: aprovado;
- `npm run test:e2e`: 8 testes aprovados;
- fluxo principal verificado do prompt até o reload com recompensa persistida;
- inspeção visual das telas de prompt, prévia, resultado e personagem em desktop e mobile;
- PR `#2` integrada à `main` no commit `30b3323`;
- deployment de produção concluído pela Vercel;
- URL fixa respondeu `HTTP 200` e o bundle publicado contém `v23.09.2003.10`.

## Riscos e limites

- navegador móvel emulado não substitui Safari/iOS e Android físicos;
- a arte continua gerada em código e tem limite de detalhe por sprite;
- o bundle principal do Phaser permanece grande, embora o build seja válido;
- o mapa prévio funcional ainda precisa de uma passada estética própria.
- a IA é externa; o jogo não envia imagens nem chama uma API por conta própria.

## Planejamento futuro registrado

- O roadmap consolidado está em `context/ROADMAP_IMPLEMENTACOES.md`.
- A próxima implementação proposta é `v23.09.2003.11`: tags de tipo, mochila organizada e aba Tutorial.
- As etapas posteriores cobrem zoom, escolha visual do personagem, ambientação, novo equilíbrio dos treinos, habilidades progressivas, respawn e patrulhamento.
- Este planejamento não alterou o comportamento publicado da `v23.09.2003.10`.

Consulte `docs/VALIDATION.md` para os comandos e `context/PROXIMOS_PASSOS.md` para o backlog.
