# Fizzi Quest — continuidade

Antes de alterar o projeto, leia `context/README.md`, `context/ESTADO_ATUAL.md` e `context/PROXIMOS_PASSOS.md`. O contrato do produto está em `docs/GAME_SPEC.md`; a continuação está em `docs/VISUAL_POLISH_SPEC.md`.

- Fonte da versão pública: `src/version.ts`, formato `v23.09.2003.x`. Incremente x por entrega, mantendo README e histórico coerentes. Save e regras têm versões independentes.
- Preserve saves compatíveis; nenhuma migração destrutiva silenciosa.
- Domínio síncrono e determinístico. Persista a rodada inteira antes de reproduzir `CombatEvent[]`; efeitos não mudam o estado salvo.
- Grade base 16 px, texturas originais geradas no código, nearest-neighbor. Nenhum asset externo sem origem/licença.
- Verifique `npm test`, `npm run build` e `npm run test:e2e` quando alterar domínio ou fluxo jogável. Inspecione capturas; não confunda tamanho de viewport com teste em telefone físico.
- Atualize contexto e evidências reais ao concluir. Não publique ou faça merge sem solicitação. Trabalhe em branch para novas etapas.
