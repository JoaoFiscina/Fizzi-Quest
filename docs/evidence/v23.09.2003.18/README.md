# Evidência visual da v23.09.2003.18

Capturas automáticas de Edge headless com save sintético, zoom padrão e viewport de 1366×768 (PC) ou 390×844 (móvel emulado). Para `pc-motion-*`, o navegador foi configurado com `prefers-reduced-motion: reduce`; para `*-new-version`, a resposta de `/version.json` foi simulada como v23.09.2003.19. As imagens representam o cliente local v18, não a produção nem um telefone físico.

- `pc-motion-reduced.png`: aviso na intro e atalho para ciclos completos.
- `pc-motion-settings.png`: causa explicada nos Ajustes.
- `pc-new-version.png` e `mobile-new-version.png`: aviso de atualização nos dois tamanhos.
- `pc-version-settings.png` e `mobile-version-settings.png`: verificação manual sem sobreposição do botão de backup.

Comportamento temporal e persistência são verificados em `tests/e2e/version-update.spec.ts`, `tests/e2e/visual-v14.spec.ts` e `docs/VALIDATION.md`; uma captura isolada não prova movimento contínuo.
