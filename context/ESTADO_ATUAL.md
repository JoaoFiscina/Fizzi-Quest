# Estado atual — v23.09.2003.13

## Classificação

P2 — complexidade média, concentrada em apresentação ambiental e desempenho.

## Feito nesta versão

- controlador ambiental reutilizável com um único timer por mapa;
- ciclos finitos e ocasionais para água, fogo, árvores, tufos de grama, vento e bandeiras;
- atrasos iniciais e intervalos diferentes entre objetos semelhantes;
- limite rígido de dois efeitos simultâneos no modo normal;
- folhas no bosque e poeira na vila reutilizam sprites pré-criados e aparecem raramente;
- `prefers-reduced-motion` desativa folhas, poeira, árvores, vegetação e bandeiras animadas;
- movimento reduzido mantém apenas água e fogo, com menor probabilidade, intervalos 2,8 vezes maiores e limite de um ciclo;
- troca de mapa e encerramento da cena removem o timer anterior;
- diagnósticos testáveis expõem modo, quantidade ativa, limite e estado do timer;
- nenhuma biblioteca foi adicionada.

## Preservação confirmada

- formato do save e versão de save inalterados;
- posições lógicas, hitboxes, colisões e spawns inalterados;
- velocidade reta, velocidade diagonal e zoom inalterados;
- encontros, combate, recompensas, inventário, equipamentos e progressão inalterados;
- animações ambientais não movimentam entidades lógicas.

## Frequência e limites

- água: intervalo individual de 7 a 15 segundos, 55% de ativação;
- fogo: 3,2 a 7,2 segundos, 82% de ativação;
- árvores: 9 a 19 segundos, 48% de ativação;
- grama e vento: 6,5 a 14,5 segundos, 58% de ativação;
- bandeiras: 5,2 a 12,5 segundos, 68% de ativação;
- folhas e poeira: 12 a 22 segundos, 35% de ativação;
- máximo normal: dois ciclos ativos; máximo reduzido: um ciclo essencial.

Cada objeto possui seu próprio próximo horário. Falhar a probabilidade agenda uma nova tentativa, preservando pausas reais.

## Verificação

- `npm test`: 34 testes aprovados;
- `npm run build`: aprovado, sem dependências novas;
- `npm run test:e2e`: 12 testes aprovados, incluindo controlador, fases, limpeza de timer, movimento reduzido, movimento diagonal e matriz visual;
- evidências finais: `docs/evidence/v23.09.2003.13/`;
- PR [#6](https://github.com/JoaoFiscina/Fizzi-Quest/pull/6) integrado à `main` no commit `7eac6d8`;
- deployment de produção aprovado pela Vercel;
- domínio fixo respondeu HTTP 200 com a versão e o controlador ambiental no bundle.

## Riscos e limites

- navegador móvel emulado não substitui Safari/iOS e Android físicos;
- os ciclos são propositalmente discretos e podem não aparecer em toda captura isolada;
- o bundle principal do Phaser continua grande; a ambientação acrescentou apenas código e texturas Canvas pequenas;
- a configuração de redução de movimento é lida ao iniciar a cena e exige reload se a preferência do sistema mudar durante a sessão;
- a auditoria posterior encontrou uma regressão perceptiva: na prévia inspecionada, movimento reduzido estava ativo e suprimiu quase toda a ambientação;
- as evidências parado/ciclo do bosque são byte a byte idênticas; consulte `DIAGNOSTICO_GRAFICO_V13.md`.

## Próxima etapa

A `v23.09.2003.14` deve recuperar a fundação visual: água e fogo contínuos, categorias de movimento separadas, escolha explícita de animações e validação temporal perceptível. Criaturas e mapa passam para a versão 15.

Consulte `docs/VALIDATION.md` para os comandos e `context/PROXIMOS_PASSOS.md` para a fila.
