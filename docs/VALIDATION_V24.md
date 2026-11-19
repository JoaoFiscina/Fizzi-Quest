# Validação — v23.09.2003.24 (Trilha Firme)

Etapa 1 do `context/PLANO_MELHORIA_GERAL.md`: robustez e fluidez. Branch `feat/v24-robustez-fluidez` sobre a main `0a1f238` (v23 oficial). Nenhuma mudança em regras, formato de save, arte ou animações.

## O que mudou

| Item | Antes | Agora |
|------|-------|-------|
| Boot | `new Phaser.Game` imediato; com canvas 0×0 o WebGL lançava `Framebuffer status: Incomplete Attachment` e o mundo ficava vazio | Espera tamanho real (`ResizeObserver`); se o WebGL falhar antes da cena, recarrega uma vez em Canvas (`sessionStorage fizzi-quest.renderer`); batalha salva aguarda a cena |
| Salvamento da posição | `persist()` a cada 1,5 s andando, com parse + validação zod do save anterior e duas gravações | Só quando a posição muda: 600 ms parado, 5 s andando, troca de mapa, aba oculta ou `pagehide`. `persist()` não regrava save idêntico e não revalida o que o próprio Store escreveu |
| `sync()` | Todo frame | No `emit` do Store e na batida de 250 ms do HUD; expiração do Impulso continua verificada por frame |
| HUD | DOM reconstruído 4×/s | Reconstruído só quando um valor exibido muda |
| Laço | Delta limitado a 35 ms (herói mais lento abaixo de ~28 fps) | Até 100 ms, com passo fatiado em ≤ 4 px (sem atravessar tiles) |
| Câmera | Lerp 0,15 + `roundPixels` (tremido de 1 px) | Lerp 1, herói e câmera no mesmo pixel inteiro |
| Colisão | Quinas prendiam o herói | Deslize de até 6 px quando só um lado está livre (empate não desliza) |
| Profundidade / proximidade | `sort` e `map/filter` por frame | `sort` só com movimento; busca sem alocação |
| Aviso | "Boas-vindas" continuava no bosque | Limpo ao trocar de mapa |

## Verificações executadas

- `npm test`: **66/66** (60 anteriores + 6 novos em `tests/fluidity.test.ts`: passo livre, passo longo sem atravessar parede, deslize em quina, sem deslize em parede longa, diagonal no mapa real, persistência que não regrava e preserva a cópia anterior válida).
- `npm run build`: aprovado (aviso de chunk do Phaser já existente).
- `npm run test:e2e`: 36 testes (33 anteriores + 3 em `tests/e2e/v24.spec.ts`: boot com canvas oculto, salvamento só depois de parar com aviso limpo na troca de mapa, deslize na quina da guilda). Última execução completa: **36/36**.
- Ajuste de teste: `journey › compra e descanso pela vila` segurava teclas por tempo fixo (350 ms + 2.700 ms). Com o passo agora fiel ao tempo real, a duração real das teclas numa máquina carregada (medida: 350 ms viraram 2,3 s) levava o herói além da fogueira. O teste passou a andar até a posição alvo, mantendo a intenção (comprar, caminhar, descansar).
- Versões nos E2E de Diário e atualização atualizadas para `.24` (manifesto simulado `.25`, 22 entradas no Diário).

### Execuções E2E

1. Primeira bateria completa: invalidada — reaproveitou um servidor Vite que caiu (36 × `ERR_CONNECTION_REFUSED`).
2. Segunda bateria completa (porta 5175, 32,7 min): 30 aprovados, 6 falhas. Uma sondagem diagnóstica rodou em paralelo e sobrecarregou a máquina; 5 falhas foram estouros de tempo/execução lenta e 1 foi o teste da fogueira descrito acima.
3. As 6 reexecutadas isoladamente, após o ajuste: **6/6 aprovadas**.
4. Bateria completa limpa, sem trabalho paralelo: **36/36 aprovados em 6,3 min**.

## Evidências

`docs/evidence/v23.09.2003.24/after/`: `boot-after-hidden.png`, `forest-after-transition.png` e as capturas do Diário/atualização geradas pelos E2E. Viewport emulado; nenhum teste em aparelho físico.

## Limites

- Tremido de câmera e travadas de salvamento foram corrigidos pela causa, mas não houve medição de FPS em celular físico.
- O fallback Canvas só é exercitado quando o WebGL falha de fato; o E2E cobre o caminho do canvas oculto, não uma GPU recusando o contexto.
- A cópia `.previous` agora é a última gravação diferente, não "a gravação imediatamente anterior mesmo se idêntica" — mais útil para recuperação.
- Não publicado. Oficial continua v23.09.2003.23 até merge autorizado e conferência do domínio.
