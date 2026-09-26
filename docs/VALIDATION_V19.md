# Validação — v23.09.2003.19

## Escopo

Botas no nível 5 e a habilidade ativa Impulso da Trilha. A entrega preserva o formato do save, o combate, as animações ambientais e a lógica de atualização introduzida na v18.

## Resultado local

- `npm test`: 46 testes de domínio aprovados.
- `npm run build`: TypeScript e Vite aprovados; o aviso de chunk grande do Phaser permanece conhecido.
- `npm run test:e2e`: 24 cenários E2E aprovados, incluindo animações, jornadas antigas, atualização de versão e os dois cenários novos da v19.
- `tests/e2e/v19.spec.ts`: cobre desbloqueio/compra/equipagem de Botas e ativação, custo, não acúmulo, velocidade e expiração do Impulso.

## Critérios de aceite

- [x] Botas não aparecem como equipáveis antes do nível 5.
- [x] Save antigo recebe `boots: null` sem perder dados.
- [x] Botas entram em loja, mochila, ficha, HUD e backup.
- [x] Impulso custa 1 fôlego, aplica +5% por 5 segundos no rank 1 e não acumula.
- [x] A expiração usa relógio do navegador e remove o estado visual mesmo com variação de frames.
- [x] O efeito fica restrito ao mapa e é limpo ao entrar em combate.
- [ ] Validar níveis 10 e 20 com o piloto de balanceamento.
- [ ] Confirmar o domínio oficial após o PR.

## Evidências

As capturas específicas da v19 ficam em [`evidence/v23.09.2003.19/`](evidence/v23.09.2003.19/). A validação histórica de animação e atualização está em [`VALIDATION.md`](VALIDATION.md) e `evidence/v23.09.2003.18/`.
