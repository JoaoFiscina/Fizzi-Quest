# Validação — v23.09.2003.14
Data: 26/09/2026. Windows, Edge headless, Phaser/TypeScript/Vite.

## Resultado
- npm test: 34 testes aprovados; inclui migração da preferência ausente para system.
- npm run build: aprovado; JavaScript próprio 55,16 KB gzip (v13: 54,58 KB).
- npm run test:e2e: 13 testes aprovados.
- Teste temporal adicional sem aceleração: 55 amostras a intervalos de 557 ms, total superior a 30 segundos.
- Todas as amostras mantiveram água/fogo em reprodução; cada sprite essencial mudou de quadro.
- Posições e quantidade de objetos constantes; um timer e no máximo dois ciclos ocasionais.
- Escolha Completa funciona mesmo com preferência de sistema reduzida; persiste após reload.
- Usar sistema acompanha mudança de preferência do navegador sem reload.
- Reduzida mantém efeitos essenciais suaves e desativa partículas.
- Comparação dos pixels das texturas comprova quadros diferentes para água, fogo, árvore, grama e bandeira.
- Inspeção desktop/mobile e folha de sprites.

## Evidências
docs/evidence/v23.09.2003.14/:
- cadence.json: amostras temporais reais;
- sprite-reference.png: folha dos quadros autorais;
- desktop-time-10.png e desktop-time-11.png: estados temporais;
- water-*.png e fire-*.png: recortes renderizados usados no teste de diferença;
- desktop-settings.png, mobile-world.png, mobile-reduced-settings.png.

## Limites
- Mobile emulado não comprova Safari/iOS ou Android físico.
- Sem ensaio de bateria ou benchmark de aparelho de entrada.
- Água/fogo reduzidos têm somente dois quadros a 1 FPS; esta é uma escolha acessível explícita.
- Avisos conhecidos de comentários PURE do Zod e chunk Phaser permanecem.
- Esta entrega está preparada em branch; o domínio público ainda não foi atualizado.
