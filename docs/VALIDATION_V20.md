# Validação — v23.09.2003.20

## Escopo

Modo desenvolvedor ativado por `DEV23`, com save local separado, edição de XP/ouro, bônus de atributos e multiplicador de XP de combate/missão. Integrado à `main` pelo PR #13.

## Verificações

- `npm test`: **49/49 aprovados**; inclui isolamento das chaves, importação de backup, prévia de níveis 1/5/10/20, limites e recompensa de combate.
- `npm run build`: compilação TypeScript e build Vite aprovados.
- `npm run test:e2e`: **26/26 cenários aprovados**; inclui entrada/saída do modo DEV, persistência da cópia, XP inválido, painel móvel e regressão do jogo.
- Capturas em [`evidence/v23.09.2003.20/`](evidence/v23.09.2003.20/).

As capturas de desktop e celular emulado foram inspecionadas: painel legível e sem rolagem horizontal. Não houve teste em telefone físico. O código `DEV23` serve como atalho de interface, não como senha segura de um serviço remoto. Após o merge, `https://fizzi-quest.vercel.app/` exibiu `v23.09.2003.20` no título/rodapé e o campo de código em Ajustes.
