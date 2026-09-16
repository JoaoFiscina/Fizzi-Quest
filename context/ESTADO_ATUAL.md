# Estado atual — v23.09.2003.9

## Feito nesta versão

- auditoria do intervalo `346c805..7d8bde0`, documentada em `docs/VISUAL_AUDIT_ANTIGRAVITY.md`;
- branch isolada `visual/restauracao-pos-antigravity`, sem reset ou rollback destrutivo;
- restauração da paleta natural, das árvores orgânicas, das construções e dos personagens compactos;
- retirada do padrão ruidoso do gramado e da grade interna dos caminhos;
- bordas de caminho, pedrinhas, tufos, flores e rochas com distribuição determinística;
- animações reais de água, fogo, vento, bandeiras, árvores, personagem e quatro monstros;
- HUD compacto com vida, fôlego, arma, escudo, armadura, ouro, materiais e poções;
- câmera inteira, suave e centralizada preservada;
- velocidade por agilidade, equipamentos, spawn seguro e sistemas de gameplay preservados.

## Estado funcional preservado

- Vite, TypeScript e Phaser com saída `dist` para Vercel;
- vila e bosque, colisões, transição, NPCs e encontros;
- combate determinístico e recompensa única;
- importação e revisão de treino;
- pontuação, maestria, XP, loja, inventário, missão e backup;
- save versionado com migração não destrutiva.

## Verificação

- `npm test`: 28 testes de domínio aprovados;
- `npm run build`: aprovado;
- `npm run test:e2e`: 8 testes aprovados, incluindo troca real de quadros e matriz visual;
- inspeção manual concluída em 1920×1080, 1366×768, 1024×768, 390×844 e 430×932;
- commit `5aee6df` enviado ao GitHub na branch `visual/restauracao-pos-antigravity`;
- a branch ainda não foi integrada à `main` nem publicada na produção.

## Riscos e limites

- navegador móvel emulado não substitui Safari/iOS e Android físicos;
- a arte continua gerada em código e tem limite de detalhe por sprite;
- o bundle principal do Phaser permanece grande, embora o build seja válido;
- o mapa prévio funcional ainda precisa de uma passada estética própria.

Consulte `docs/VALIDATION.md` para os comandos e `context/PROXIMOS_PASSOS.md` para o backlog.
