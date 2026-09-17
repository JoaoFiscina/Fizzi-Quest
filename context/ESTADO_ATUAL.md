# Estado atual — v23.09.2003.11

## Feito nesta versão

- catálogo com tipo visual de cada peça: Arma, Escudo, Armadura, Broche ou Pingente;
- regras de equipamento continuam usando os slots internos existentes, sem duplicar estado no save;
- mochila com resumo do conjunto equipado, grupos por slot e peça ativa no início de cada grupo;
- cartões compactos com tipo, nome, bônus e estado de equipamento;
- loja atualizada com as mesmas tags, incluindo Consumível para poção;
- nova aba Tutorial no menu principal;
- tópicos sobre Defesa, intenção inimiga, Fôlego, habilidades, atributos, equipamentos, treinos e exploração;
- ajuda de Defesa acessível dentro do combate sem alterar a rodada;
- layout responsivo verificado em desktop e 390×844.

## Estado funcional preservado

- fluxo de treino real por IA externa com validação, prévia e histórico;
- vila e bosque, colisões, transição, NPCs e encontros;
- combate determinístico e recompensa única;
- pontuação, maestria, XP, loja, inventário, missão e backup;
- save v1 compatível, sem novos campos obrigatórios nesta versão;
- Vite, TypeScript e Phaser com saída `dist` para Vercel.

## Verificação

- `npm test`: 34 testes aprovados;
- `npm run build`: aprovado;
- `npm run test:e2e`: 9 testes aprovados;
- jornada específica verifica quatro grupos, tipos, itens equipados e tutorial;
- ajuda contextual de Defesa testada durante batalha;
- capturas de mochila e tutorial inspecionadas em desktop e mobile;
- branch de entrega: `feat/mochila-tutorial-v23.09.2003.11`;
- produção permanece em `v23.09.2003.10` até integração e deployment.

## Riscos e limites

- navegador móvel emulado não substitui Safari/iOS e Android físicos;
- a mochila pode precisar de filtros quando o catálogo crescer muito além dos dez itens atuais;
- o tutorial descreve apenas regras implementadas e precisará acompanhar futuros rebalanceamentos;
- o bundle principal do Phaser permanece grande, embora o build seja válido;
- o mapa prévio funcional ainda precisa de uma passada estética própria;
- a IA é externa; o jogo não envia imagens nem chama uma API por conta própria.

## Próxima etapa

A `v23.09.2003.12` deve implementar zoom personalizável e escolha cosmética de personagem masculino ou feminino, preservando hitbox, velocidade e saves antigos.

Consulte `docs/VALIDATION.md` para os comandos e `context/PROXIMOS_PASSOS.md` para o backlog.
