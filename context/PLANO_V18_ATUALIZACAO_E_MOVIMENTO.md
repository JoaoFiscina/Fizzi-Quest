# Plano v23.09.2003.18 — versão no navegador e animações no PC

## Diagnóstico e referência

O relato é específico: no celular monstros e folhas se animam, água e fogo fluem; no PC esses efeitos param ou ficam discretos. O jogo usa `motion: system` como padrão. Se o navegador do PC informa `prefers-reduced-motion: reduce`, `World` desliga idle dos monstros e o controlador ambiental desliga folhas e vegetação, enquanto água/fogo usam dois quadros suaves. Essa é uma explicação compatível com todos os sintomas, mas a preferência real do PC do jogador ainda precisa ser conferida nele. Não há service worker no projeto. A versão fica no rodapé, porém o cliente não consulta a versão servida nem oferece recarga dirigida. O histórico de treinos não controla essas animações.

## Objetivo, complexidade e escopo

Etapa pequena de diagnóstico e interface, sem novos itens, arte ou mudança de save. Tornar explícito quando o sistema do aparelho reduz as animações, dar acesso direto a **Animações completas** sem obrigar a alterar a acessibilidade do Windows e permitir verificar/instalar uma versão nova no próprio jogo.

- Gerar `version.json` no build a partir da mesma constante da interface, com leitura sem cache.
- Consultar no início, ao voltar à aba e periodicamente; mostrar aviso e botão só se houver versão diferente. Oferecer verificação manual nos Ajustes.
- Salvar o progresso antes da navegação para URL com parâmetro de atualização, sem apagar armazenamento local.
- Mostrar aviso contextual de movimento reduzido e atalho para **Completa**. Conservar as escolhas **Usar sistema** e **Reduzida**.

## Aceite e evidências

- Em desktop com `prefers-reduced-motion: reduce`, o jogo explica por que monstros/folhas não se movem; um clique em **Ativar animações completas** muda o modo em tempo real e persiste após reload.
- Em desktop sem preferência reduzida e em viewport móvel, o aviso contextual não aparece indevidamente.
- Quando `version.json` anuncia versão nova, aparece botão de atualização; ao usá-lo, a URL evita HTML antigo e o save continua íntegro. Falha de rede não bloqueia o jogo.
- `npm test`, build e E2E de PC/móvel passam. Registrar limites: emulação não mede o PC físico do jogador nem cabeçalhos reais da produção.

## Fora do escopo / próximo passo

Não alterar os quadros ou cadências de animação que o jogador aprovou. Mover Botas para v19, Capa para v20 e Runa para v21 após observar o balanço.
