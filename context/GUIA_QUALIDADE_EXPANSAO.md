# Tutorial interno — manter a qualidade ao expandir

Guia para o próximo agente/Codex. Criado em 01/10/2026 a pedido do jogador. Ler junto de [MOLDE_EXPANSAO.md](MOLDE_EXPANSAO.md) e [PLANO_EXPANSAO_MUNDO.md](PLANO_EXPANSAO_MUNDO.md). É um procedimento, não uma declaração de conteúdo pronto.

## 1. Retomar sem perder decisões

Ler `AGENTS.md`, índice do contexto, estado e fila. Confirmar Git, versão pública e arquivos realmente existentes. Escolher um objetivo, prioridade e complexidade; no máximo um sistema estrutural por versão. Preservar alterações locais. Exportar fixtures sintéticas e capturar referência na escala real antes de programar.

O contrato é: domínio determinístico em `src/domain`, save validado em `src/application/store.ts`, mapa em `src/game/maps.ts`, adaptação em `world.ts` e menus DOM em `main.ts`. `encounters.ts` separa tipo/identidade; não usar o tipo de inimigo como identificador único para novos encontros.

## 2. Copiar características, sem copiar bugs

Antes de criar criatura/área, inspecionar `monsterArt.ts`, `polishArt.ts`, `art.ts`, `ambient.ts`, `monsterMovement.ts` e `battlePresentation.ts`. Registrar dimensões, paleta, número de quadros, taxa e origem dos sprites do caso mais próximo. Reutilizar o sistema, não espalhar uma cópia do loop de atualização em cada mapa.

- Grade base 16 px, posições inteiras no desenho, nearest-neighbor, sem suavização de pixel.
- Silhuetas diferentes primeiro; cor é apoio, não única distinção. Contraste suficiente com chão e vegetação. Evitar detalhe de um pixel que vira ruído na escala real.
- Mesmo ponto de apoio e volume entre quadros; corpo não salta involuntariamente nem muda de tamanho. Guardar pose base e quadros de transição/retorno.
- Manter escala protagonista/comum/boss, perspectiva, direção da luz e profundidade por Y. Não aumentar zoom para esconder falta de definição.
- Assets autorais gerados no projeto; qualquer recurso externo exige origem/licença registrada.

## 3. Criatura piloto: da forma ao encontro

1. Desenhar uma pose estática e olhar dentro do mapa, com o personagem ao lado. Aprovar leitura em desktop e celular emulado antes de desenhar todas as poses.
2. Criar ciclo de idle com respiração e pequeno gesto próprio; preservar anatomia e retornar à pose. Reutilizar registro de animações existente. Não mudar cadências das criaturas aprovadas sem motivo e comparação.
3. Animação contínua deve repetir indefinidamente. Animação ocasional retorna à pose e fica disponível para ativação futura; não parar após dois ciclos nem remover seu registro.
4. Definir âncora, raio, terreno caminhável, velocidade/pausa e espaçamento. Tipo determina arte/estatísticas; identidade determina presença/derrota/interação. Interação segue a posição atual.
5. Conectar batalha, intenção, vitória/fuga/derrota e recompensa persistida antes dos efeitos. Testar um fluxo completo antes de produzir mais criaturas.

## 4. Cenário e efeitos: preservar a ambientação aprovada

Água/fogo usam ciclos contínuos; árvores/grama/folhas usam agenda ocasional limitada. `AmbientController` mantém um timer por mapa e limite de alvos ativos. Reutilizar fases diferentes por posição para não sincronizar toda a paisagem. Nenhum efeito altera colisão, dano, XP ou save.

Ao trocar mapa, destruir controlador, sprites descartáveis, tweens e listeners anteriores. Não criar timer por tile nem acumular partículas a cada `update`. Evitar animação incidental em todo objeto; preservar pausa visual e leitura da rota. Modos Completa/Reduzida devem continuar explícitos nos Ajustes; no reduzido a interação funciona mesmo quando criaturas não se movem.

Golpes usam efeitos breves e contidos de `battlePresentation.ts`; não ocultar vida, intenção ou alvo com shake/flash. Não introduzir câmera, pós-processamento ou filtros diferentes para uma única área sem um piloto de desempenho.

## 5. Área piloto e missão

Começar com entrada, retorno, um espaço de encontro e um objetivo. Verificar colisões, profundidade, câmera, zoom e posição segura em reload/derrota. Depois adicionar desvio, decoração e restante da missão. Uma área precisa ter função de exploração e uma leitura própria, não apenas recolorir o bosque.

Missões recebem ID estável, objetivos verificáveis e recompensa entregue uma vez. Salvar progresso antes da mensagem/efeito. Não vincular desbloqueio a uma frase de diálogo ou ao sprite estar visível. Não reutilizar o estado da missão do emblema para novas histórias. Estados vazios/bloqueados indicam motivo e próximo objetivo.

## 6. Tom um pouco mais maduro

Manter acolhimento e clareza, acrescentando história e tensão: recuperação de rotas, trabalho interrompido, memória de moradores, ruínas e natureza retomando lugares. Diálogos curtos com propósito; nomes concretos e descrições que sugerem passado. Evitar diminutivos excessivos, felicitações automáticas e exposição longa.

Arte continua pixel art: maturidade vem de composição, paleta moderada, luz localizada e silhueta, não de escurecer toda a tela ou adicionar gore. Recompensas reconhecem esforço sem infantilizar; derrota preserva progresso e explica recuperação. Treino permanece positivo e participativo.

## 7. Portão de qualidade antes de expandir

- Mesmo save sintético, posição, zoom, viewport e modo para referência/candidato; imagem ampliada só complementa a escala real.
- Quatro layouts: 390×844, 430×932, 1366×768, 1920×1080. Registrar que mobile é emulado.
- Pelo menos 30 segundos para quadros, patrulha e reativações ocasionais; 60 segundos para contagem estável de sprites/timers. Verificar retorno da aba, modal, batalha e troca de mapa, sem saltos ou duplicatas.
- Olhar capturas e fluxo real: personagem, rota, inimigo e botão de interação precisam ser legíveis. Diferença de pixels não demonstra melhora estética.
- `npm test`, build e E2E para gameplay; migrar/exportar/importar save antigo, preservar batalhas e testar DEV separado.
- Comparar economia e dificuldade em níveis relevantes com e sem treino/equipamento. Se conteúdo só for viável no DEV, corrigir antes de ampliar.
- Registrar resultado real, limitações, versão, plano, histórico e próximos passos. Criar PR; integrar com autorização e conferir domínio oficial.

## Ficha obrigatória de cada novo conteúdo

```text
Entrega / prioridade / complexidade:
Área / missão / criatura / IDs estáveis:
Referência reaproveitada e arquivos:
Função no jogo e nível recomendado:
Dimensões / paleta / silhueta / apoio / profundidade:
Quadros / taxa / repetição / retorno / modo reduzido:
Âncora / raio / pausa / velocidade / interação:
Intenção / combate / recompensa / persistência:
Colisão / câmera / entrada / retorno / derrota:
Orçamento de sprites / timers / efeitos:
Fixtures / capturas / testes / limitações:
Aceite perceptível / revisão / publicação:
```

Se o piloto falhar, corrigir o piloto. Não produzir três áreas ou um catálogo inteiro para depois descobrir que a câmera, o save ou o ciclo de animação não funciona.
