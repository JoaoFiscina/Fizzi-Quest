# Plano de melhoria geral — auditoria de 18/11/2026

Base auditada: `v23.09.2003.23` (main `0a1f238`). Método: leitura de `context/`, specs e código (`world.ts`, `battlePresentation.ts`, `maps.ts`, `ambient.ts`, `store.ts`, `main.ts`, CSS) e capturas reais (Playwright/Edge headless) da vila, do bosque e do combate em 1366×768 e 390×844. Viewport emulado, não aparelho físico.

Nada aqui foi implementado. Cada bloco vira versão própria seguindo `MOLDE_EXPANSAO.md`, preservando saves, domínio determinístico e as animações aprovadas.

## 1. Diagnóstico

### Robustez e fluidez (técnico)

| # | Achado | Evidência | Efeito |
|---|--------|-----------|--------|
| T1 | Jogo morre se o canvas nasce com tamanho 0 | Painel oculto: `Framebuffer status: Incomplete Attachment` no boot do WebGL; mundo fica vazio sem recuperação | Tela verde vazia em abas em segundo plano/iframes/webviews |
| T2 | `store.persist()` a cada 1,5 s durante a caminhada | `world.ts` `update()`; `persist()` lê o save anterior, faz `JSON.parse` + validação zod e duas gravações | Micro-travadas periódicas no celular |
| T3 | `sync()` roda em todo frame | Recalcula visibilidade de todos os inimigos, textura do baú, tint das bandeiras, velocidade | Custo constante sem mudança de estado |
| T4 | Mapa montado com um sprite por tile + overlays | ~1.120 tiles no bosque mais bordas/pedras/decoração | Mais draw calls e GC em cada troca de mapa |
| T5 | `foreground.sort("depth")` e busca do "perto" com `map/filter` todo frame | `update()` | Alocações por frame |
| T6 | Delta limitado a 35 ms | `Math.min(delta, 35)` | Abaixo de ~28 fps o personagem anda mais devagar em vez de compensar |
| T7 | Câmera com lerp 0,15 + `roundPixels` + posição arredondada | `startFollow(..., 0.15, 0.15)` | Tremido de 1 px do herói/cenário ao andar |
| T8 | Colisão por 4 cantos sem deslize | `walkable()` | Herói "engancha" em quinas de árvores/casa |
| T9 | `main.ts` com 1.801 linhas e DOM refeito via `replaceChildren` | `battle()`, `renderHUD()` | Impede transições (barras, modais) e dificulta manutenção |

### Gráficos

| # | Achado | Onde |
|---|--------|------|
| G1 | Bosque usa a mesma grama e a mesma árvore da vila, em grade regular (`x,y` ímpares) | `maps.ts` laço de árvores; captura do bosque |
| G2 | "Bosque das Brumas" não tem bruma, sombra de copa nem variação de luz | `world.ts` |
| G3 | Uma única árvore; faltam arbustos, tocos, cogumelos, raízes, troncos caídos | `art.ts`/`polishArt.ts` |
| G4 | Caminho com bordas retas e cantos quadrados; sem transição grama→terra nem cantos internos/externos | `path-edge-*` |
| G5 | Personagens e monstros sem sombra no chão (árvores e pedras têm) | Capturas |
| G6 | Marcadores ◆ $ ♨ ◇ em fonte Georgia sobre pixel art | `build()` |
| G7 | Combate: fundo de retângulos lisos + muro de árvores tingidas; faixa vazia embaixo no desktop | `BattlePresentation` |
| G8 | Combate: textos em Arial; aviso "CARAPAÇA" sobrepõe o número "PREPARA" | Captura `desk-battle-hit` |
| G9 | Combate: herói é um quadro estático de costas; sem idle; inimigo sem barra de vida no palco | `hero-1-0` |
| G10 | Título do local sobrepõe o telhado da guilda (celular e desktop) | Capturas da vila |
| G11 | Tela de entrada sobre fundo liso, com o HUD aparecendo por trás e versão repetida duas vezes | Captura da intro |

### Animação e game feel

| # | Achado |
|---|--------|
| A1 | Entrada no combate é corte seco (sem flash, sem transição) e a saída reconstrói o mapa |
| A2 | Troca vila↔bosque é teleporte com fade-in de 200 ms e nenhum fade-out |
| A3 | Barras de vida/fôlego saltam; não há animação de dano nem "barra fantasma" |
| A4 | Golpe sem impacto: falta tremor de câmera, hit-stop curto, partículas e knockback |
| A5 | Ambiente agenda no máximo 2 efeitos simultâneos; o mundo parece parado em telas grandes |
| A6 | Andar não gera poeira nem pegadas; não há resposta visual ao chegar perto de algo além do botão |
| A7 | Modais e menus abrem sem transição (CSS sem `@keyframes`) |
| A8 | Monstros patrulham sem virar de direção nem reagir ao jogador (olhar, "!") |

### Funcionalidade e UX

| # | Achado |
|---|--------|
| F1 | Zero áudio (Phaser já inicia com Web Audio) |
| F2 | Direcional na tela aparece também no desktop com teclado (sem `pointer: coarse`) |
| F3 | Toast de boas-vindas fica visível depois de trocar de mapa |
| F4 | HUD + 6 botões ocupam ~20% da altura no celular; botão Impulso bloqueado ocupa espaço desde o nível 1 |
| F5 | Log de combate mostra só a última linha; ação/resultado não ficam claros para quem não olha o palco |
| F6 | Sem suporte a gamepad e sem atalhos de teclado para as ações de combate |

## 2. Plano por etapas

Regra do projeto: prioridade, ordem, complexidade, dependência e limite de escopo. Correções de jogo/save passam à frente da expansão já planejada.

| Ordem | Prioridade | Entrega | Complexidade | Dependência | Itens |
|-------|------------|---------|--------------|-------------|-------|
| 1 | Alta (bloqueio) | **Robustez e fluidez** | Média | Nenhuma | T1, T2, T3, T5, T6, T7, T8, F3 |
| 2 | Alta | **Impacto do combate** | Média | 1 | A1, A3, A4, G8, G9, F5, F6 (atalhos) |
| 3 | Alta | **Bosque com identidade** | Alta | 1 | G1, G2, G3, G4, G5, G6, T4 |
| 4 | Média | **Palco de combate** | Média | 2 | G7, fundo por área, plataforma desenhada, perspectiva |
| 5 | Média | **Mundo vivo** | Média | 3 | A2, A5, A6, A8 |
| 6 | Média | **Som** | Média | 2 | F1 |
| 7 | Média | **Interface e celular** | Média | 1 | G10, G11, F2, F4, A7 |
| 8 | Baixa (técnica) | **Modularizar `main.ts`** | Média-alta | 7 | T9 |

Depois disso, retomar a fila de expansão (`PROXIMOS_PASSOS.md`: fundação de áreas/missões). As etapas 3 e 4 produzem a base de arte/tiles que a Margem do Ribeirão vai reutilizar; vale fazê-las antes.

### Etapa 1 — Robustez e fluidez

Status: publicada como `v23.09.2003.24 — Trilha Firme` (PR #17, merge `f87a3fb`, 18/11/2026); evidências em `docs/VALIDATION_V24.md`. Diferenças do plano: o fallback recarrega a página uma vez em Canvas (mais seguro que reaproveitar a cena destruída) e o HUD, que reconstruía o DOM 4×/s, também passou a só reconstruir quando um valor exibido muda.

- Boot: esperar o contêiner ter tamanho > 0 (`ResizeObserver`) antes de criar o `Phaser.Game`; em caso de falha do WebGL, recriar com `Phaser.CANVAS`. E2E com contêiner inicialmente oculto.
- Persistência: gravar posição só se mudou, com debounce (ex. 3 s parado ou troca de mapa/`visibilitychange`/`pagehide`). Validar o save anterior apenas quando o snapshot `.previous` for realmente renovado (ex. por transação), não em cada passo.
- `sync()` orientado a evento: chamar ao receber `store.emit()` e a cada mudança de mapa, não no `update()`. Expiração do Impulso por timer.
- Laço: limitar delta a ~100 ms (protege abas pausadas) e subdividir o passo de colisão em fatias ≤ 4 px.
- Câmera: seguir com lerp 1 (ou deadzone pequena) e arredondar só a câmera; manter o herói em coordenada inteira. Conferir tremido em zoom 2–5.
- Colisão: deslize em quinas (se o eixo bloqueado tem 1 canto livre, empurrar ≤ 1 px no eixo perpendicular).
- Ordenação de profundidade só quando algo se mover; busca do "perto" sem alocar arrays.
- Toast limpo na troca de mapa.
- Aceite: sem erro no boot oculto; perfil de 30 s andando sem picos de `persist`; mesmos resultados nos testes de domínio.

### Etapa 2 — Impacto do combate (somente apresentação)

Status: publicada como `v23.09.2003.25 — Golpe Certeiro` (PR #18, merge `dfe2af3`, 19/11/2026); evidências em `docs/VALIDATION_V25.md`. Ajuste ao plano: o log já mostrava todas as linhas da rodada (o diagnóstico F5 estava impreciso), então ganhou destaque das linhas novas em vez de mais linhas. Achado extra corrigido: o combate sempre mostrava o visual masculino.

- Transição de entrada: flash + íris/mosaico de 300–400 ms; saída com fade. Respeitar modo reduzido (fade simples).
- Golpe: hit-stop de 60–80 ms, tremor de câmera proporcional (pesado > normal), knockback do alvo, 4–6 partículas pixel geradas em código, número de dano com "pop" e fonte pixel própria (bitmap gerado no código, sem asset externo).
- Barras: vida do inimigo também no palco; barras DOM com transição e "barra fantasma" que desce depois do dano. Exige atualizar a barra em vez de recriá-la.
- Fila de avisos no palco (intenção x números flutuantes não se sobrepõem; intenção some enquanto os números tocam).
- Herói com idle de costas (2–3 quadros) e pose de ataque.
- Log com as 3 últimas linhas e destaque da mais nova.
- Atalhos: 1–5 / A, H, D, I, F para as ações; Esc fecha habilidades.
- Duração total por rodada ≤ ~900 ms no modo completo. Invariante mantida: rodada persistida antes de `play()`; reload no meio não duplica nada (já há E2E — estender).

### Etapa 3 — Bosque com identidade

Status: implementada como `v23.09.2003.26 — Bosque Vivo` em `feat/v26-bosque-identidade` (19/11/2026); evidências em `docs/VALIDATION_V26.md`. Ampliação pedida pelo jogador: personagens redesenhados (4 direções, caminhada de 4 quadros, respiração e piscada) e contorno em monstros/objetos. Diferenças do plano: o chão vira uma textura de canvas por mapa (em vez de Tilemap) e o autotile do caminho é calculado por pixel (média em janela + ruído), o que arredonda cantos internos e externos sem tiles extras; a bruma usa duas faixas com parallax.

- Paleta do bosque: grama mais fria/escura e 2 variações de árvore (pinheiro largo e carvalho) + arbustos, tocos, cogumelos e flores de sombra, dentro da paleta registrada.
- Distribuição por ruído determinístico (semente fixa) em vez de grade; clareiras mais densas nas bordas, mais livres perto dos caminhos. Hitbox continua em tiles; testes de caminhabilidade para pontos de repouso/patrulha.
- Autotile simples de 16 px para o caminho (cantos internos/externos, transição grama→terra) — vale para vila e bosque.
- Bruma: 2–3 camadas de névoa semitransparente com parallax lento sobre o bosque; desligada/estática no modo reduzido.
- Sombras elípticas sob herói, NPCs e monstros.
- Marcadores de interação como ícones pixel (balão 8×8) em vez de texto Georgia.
- Assar a camada de chão em `RenderTexture`/Tilemap por mapa (T4).
- Aceite: capturas comparativas antes/depois nos 4 viewports; FPS igual ou melhor.

### Etapa 4 — Palco de combate

- Fundo por área em 3 planos (céu/copas distantes, árvores médias, chão com textura) com o mesmo pixel art do mapa, em escala inteira.
- Plataformas desenhadas (grama com borda) no lugar das elipses lisas; inimigo levemente menor (profundidade).
- Desktop: preencher a faixa vazia inferior; painel sem cobrir o inimigo.
- Variante para o Guardião (luz mais dourada) e para o raro.

### Etapa 5 — Mundo vivo

- Troca de mapa com fade-out → fade-in (≈ 250 ms cada) e entrada pelo lado correto.
- Ambiente: limite de efeitos simultâneos proporcional à área visível (ex. 2 no celular, 4–5 no desktop); vagalumes no bosque, fumaça na chaminé da guilda.
- Poeira ao andar/parar, folhas pisadas na grama alta.
- Monstros viram para a direção do movimento e mostram "!"/olhar quando o herói chega perto (só visual, sem mudar regra de encontro).

### Etapa 6 — Som

- Efeitos sintetizados com Web Audio no código (passo, golpe, dano, cura, vitória, menu, moeda) — sem asset externo, coerente com a regra de licença.
- Trilhas ambientes curtas e procedurais por área (opcional nesta etapa).
- Controles em Ajustes: volume geral, efeitos, música, mudo; preferência no save com padrão compatível (mudo até o primeiro gesto).

### Etapa 7 — Interface e celular

- Direcional só em `pointer: coarse` (com opção manual em Ajustes).
- HUD compacto no celular (recolhível), menu agrupado em um botão "Menu" com os 6 itens; Impulso oculto até o nível 5.
- Título do local como faixa que aparece ao entrar no mapa e some em 2 s.
- Intro com o mundo animado ao fundo (câmera lenta pela vila), sem HUD por trás, versão mostrada uma vez.
- Transições de modal (abrir/fechar 150 ms) respeitando `prefers-reduced-motion`.

### Etapa 8 — Modularizar `main.ts`

- Separar em `ui/hud.ts`, `ui/battlePanel.ts`, `ui/settings.ts`, `ui/equipment.ts`, `ui/devPanel.ts`, `ui/intro.ts`, mantendo comportamento idêntico (E2E como rede de segurança). Atualizar elementos existentes em vez de recriar quando houver animação.

## 3. Validação comum

`npm test`, `npm run build`, `npm run test:e2e` em toda etapa que mexe em fluxo jogável; capturas em 1366×768, 1024×768, 768×1024 e 390×844 antes/depois; modo reduzido conferido; registrar no `VALIDATION_*` da versão. Teste em celular físico continua pendente e deve ser declarado como tal.
