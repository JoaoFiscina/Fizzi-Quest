# Fizzi Quest — Continuação: polimento visual, animações de cenário e combate

Este prompt complementa o documento-base do projeto (a versão que você já tem, provavelmente salva em `docs/GAME_SPEC.md` ou equivalente). Não é uma reinicialização: é uma continuação. Leia o estado real do projeto antes de escrever qualquer linha.

## 0. Antes de qualquer alteração

- Inspecione o repositório: `git log`, branch atual, `docs/DECISIONS.md` (se existir), README e o código em `src/game/scenes` e `src/game/sprites`.
- Relate objetivamente o que já está implementado e funcional hoje, o que está pela metade e o que ainda não existe, antes de propor o plano de trabalho desta etapa.
- Se `docs/DECISIONS.md` apontar um próximo passo concreto já registrado, priorize-o dentro do plano abaixo em vez de ignorá-lo.
- Preserve todo o código e progresso existentes. Nenhuma reescrita "do zero" de sistemas que já funcionam.

## 1. Ordem de prioridade desta etapa

1. Feche qualquer pendência do marco M1 ("Treino à aventura") que ainda esteja incompleta, se houver. Consulte os critérios de aceite (seção 13 do documento-base) e o roteiro de validação (13.4).
2. Só depois de M1 estar de fato jogável ponta a ponta, aplique o polimento visual e as animações abaixo.
3. Se M1 já estiver fechado, trate isso como parte do polimento previsto no marco M2 (sons e animações adicionais).

Mecânica funcional vem antes de estética. Não deixe o polimento visual travar ou atrasar algo que ainda está quebrado — mas ambos fazem parte desta entrega se o tempo permitir.

## 2. Detalhamento do pixel art

- Mantenha a grade de 16×16 px por tile e o personagem em ~16×24 px, renderização nearest-neighbor, coordenadas inteiras. Não mude a escala-base do jogo.
- Aumente o nível de detalhe dentro dessas dimensões: mais variação de sombreamento, contorno mais definido, silhueta mais legível para cada monstro e elemento de cenário — sem migrar para tiles maiores.
- Use a paleta já registrada no documento-base (verde profundo, folhagem, verde claro, terracota, dourado, azul-petróleo, areia, papel). Pode adicionar tons intermediários dentro dessa família de cores para dar profundidade, mas não introduza uma paleta nova.
- Continue gerando os assets no próprio projeto/código, sem depender de arte externa não licenciada. Qualquer asset externo entra com origem e licença registradas em `ASSET_LICENSES.md`.
- Não copie personagens, criaturas ou estilo de franquias existentes (a referência de formato é Pokémon, mas sem assets ou desenhos derivados).
- Priorize nesta ordem: aventureiro (quatro direções), Broto Errante, tiles centrais da vila e do bosque (árvore, água, caminho, construção da guilda) — antes de detalhar elementos secundários.

## 3. Animações simples de cenário e monstros (fora de combate)

- Adicione ciclos de animação curtos e discretos para dar sensação de mundo vivo: folhagem balançando, água com leve brilho, tremular de tocha/fogueira, bandeira da guilda ao vento.
- Monstros visíveis no mapa (antes do combate começar) ganham uma animação de "parado" simples (leve respiração/oscilação), deixando de parecer estáticos, sem perder a leitura da silhueta.
- Essas animações são puramente visuais: não podem alterar hitbox, posição de colisão, timing de encontro ou qualquer resultado de jogo. Se performance for um problema em aparelhos mais fracos, prefira poucos quadros (2–4) em loop simples a animações complexas.

## 4. Animações de combate

Construa isso como uma camada de apresentação sobre a resolução de combate, que continua síncrona e determinística — sem alterar essa regra:

- A rodada inteira continua calculada no domínio e o próximo estado salvo **antes** de reproduzir qualquer animação. Recarregar a página no meio de uma animação deve retomar o resultado já resolvido, sem duplicar dano, turno ou recompensa.
- Animações não determinam nem alteram dano, ordem de turno ou resultado — só representam visualmente o que o domínio já decidiu.
- Cobrir pelo menos:
  - **Ataque normal e golpe pesado:** pequeno avanço/recuo do atacante, flash no alvo atingido, número de dano legível subindo e desaparecendo.
  - **Defender:** indicação visual clara (brilho/escudo) de que a proteção está ativa.
  - **Poção:** gesto simples de uso e efeito de cura visível, sincronizado com a vida subindo.
  - **Fugir:** transição rápida de saída do combate.
  - **Vitória e derrota:** transição curta e clara antes da tela de recompensa ou do retorno à vila.
  - **Intenção do inimigo** (ex.: Besouro expondo/protegendo a carapaça, Guardião preparando o golpe forte): um indício visual simples além do texto de intenção já previsto.
- Mantenha as animações curtas o bastante para não atrapalhar sessões de 5–15 minutos; o jogador não deve esperar mais do que o necessário para ver o resultado de cada ação.

## 5. O que não muda

- Nenhuma aleatoriedade entra no dano por causa de efeitos visuais.
- Nada de publicar, mergear ou apagar conteúdo automaticamente; para repositório remoto existente, use branch e pull request.
- Não toque no repositório pessoal de contexto do usuário nem inclua dados pessoais de outros projetos no código do jogo.
- Não afirme ter testado no celular, publicado, ou rodado build/teste sem ter executado de fato.

## 6. Relatório ao final desta etapa

Como já previsto no documento-base, ao concluir informe objetivamente:

- O que já funcionava antes desta etapa vs. o que mudou agora.
- Arquivos e módulos criados ou alterados.
- Testes/build realmente executados e o resultado.
- Limitações reais e o que ficou de fora (ex.: algum monstro sem animação nova, algum tile ainda no nível de detalhe anterior).
- Próximo passo recomendado — e, se possível, atualize `docs/DECISIONS.md` com o estado real e o próximo passo concreto.