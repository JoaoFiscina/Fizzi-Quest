# Próximos passos

## Fechamento de v23.09.2003.9

1. Revisar a PR `#1` e a preview da Vercel da branch `visual/restauracao-pos-antigravity`.
2. Comparar a preview e as capturas em `docs/evidence/v23.09.2003.9/` com a produção atual.
3. Integrar na `main` somente após aprovação visual.
4. Confirmar o deployment automático da `main` na Vercel e testar a URL pública.

## Melhorias futuras registradas pelo usuário

1. Melhorar esteticamente o mapa prévio, com rota legível e áreas inexistentes claramente bloqueadas.
2. Refinar a definição em pixel art dos monstros sem aumentar demais os sprites.
3. Criar respawn de monstros em posições levemente diferentes após a primeira derrota.
4. Adicionar patrulhamento leve de monstros em áreas caminháveis.
5. Ampliar o HUD de equipamentos quando novos slots entrarem no jogo; por enquanto manter arma, escudo e armadura.
6. Continuar calibrando a velocidade por atributo sem permitir deslocamento exagerado.
7. Adicionar animações de ataque na apresentação de combate.
8. Testar em Safari/iOS e Android Chrome físicos.

## Depois do polimento atual

Rota bifurcada, baú, chefe, equipamentos e missão já têm implementação inicial. Revisar e completar esses sistemas antes de criar regiões novas. Áudio e PWA continuam opcionais e só devem ser anunciados depois de implementados e verificados.
