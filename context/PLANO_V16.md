# Fizzi Quest — plano da v23.09.2003.16: treinos e habilidades

Estado: **implementado e validado localmente; publicação pendente**. Base: `v23.09.2003.15` em `main`. Esta etapa altera progressão e explicações de combate, sem editar sprites, mapas, movimento ou ciclos de animação.

## Problema e resultado esperado

O treino atualmente pode conceder até 360 XP em uma sessão e 450 XP no dia, enquanto os atributos têm teto de 0,40 por sessão e 0,50 por dia. O ganho de cada atributo cai quando seu valor total passa de 10; como o total inclui equipamento, vestir uma peça pode diminuir uma recompensa permanente. A interface também oculta Corte veloz e Impacto firme até o desbloqueio, deixando o jogador sem uma previsão clara.

Nesta versão, a aventura deve continuar sendo a principal fonte de nível, e treinos detalhados devem contribuir mais regularmente para os atributos. O mesmo treino deve produzir o mesmo ganho bruto de atributo em personagens de níveis diferentes, com ou sem equipamento, desde que o histórico de treino do dia seja igual. As habilidades bloqueadas devem mostrar nível exigido, custo e uso tático antes de ficarem disponíveis.

## Complexidade e limites

Complexidade **média**: há mudança de balanceamento, validação de backups legados e uma melhoria localizada de interface. Não acrescentar novos atributos ou habilidades, mudar fórmula de nível, alterar combate, itens, loja, save de posição, física ou qualquer animação. A v17 tratará de Anel e desbloqueio de slot separadamente.

## Referência verificável

1. Registrar a fórmula atual de nível e comparar ganhos de um treino sintético de confiança média e outro de confiança alta nos níveis 1, 10 e 20, com e sem equipamentos. Usar o mesmo histórico diário em todos os cenários.
2. Confirmar os limites atuais no código: confiança baixa `100 XP / 0,02 atributo`, média `220 XP / 0,18 atributo`, alta `360 XP / 0,40 atributo`; teto diário `450 XP / 0,50 atributo`. Inspecionar também ouro, confiança efetiva e duplicatas.
3. Guardar fixture sintética de registro antigo com recompensa entre os limites antigos e novos. A restauração precisa aceitar esse registro sem recalculá-lo ou lhe retirar XP/atributos.
4. Capturar a lista atual de ações de combate no nível 1 e a tela de treino em desktop/celular emulado. Não usar treino real nem dados pessoais.

## Implementação em piloto

1. Começar pelo balanceador: retirar o parâmetro de atributos totais e o redutor. Conservar confiança calculada pela evidência, arredondamento determinístico, teto por atributo/sessão/dia, e bloqueio de sessões repetidas.
2. Calibrar inicialmente uma redução de cerca de 35–45% no XP e aumento de cerca de 20–30% nos tetos de atributo médio/alto. Comparar resultado efetivo, não apenas constantes, com a progressão de níveis 1, 10 e 20. Ajustar números para evitar que o teto diário neutralize todo o aumento pretendido.
3. Separar explicitamente **limites para novos treinos** dos **limites históricos aceitos em saves**. A validação de registros anteriores não pode passar a rejeitar recompensas que eram legais na v15. Totais consumidos no dia consideram os registros históricos de forma íntegra.
4. Atualizar o modelo de resposta da IA, exemplo colável e textos de ajuda para que a sugestão de XP e atributos corresponda às novas regras. A IA continua apenas sugerindo; a validação local é autoridade.
5. Mostrar todas as ações na tela de combate. Ações bloqueadas ficam desabilitadas e explicam nível; ações disponíveis mostram custo de fôlego e função. A regra de execução permanece no domínio.

### Calibração escolhida

| Confiança | XP por sessão v15 → v16 | Atributos por sessão v15 → v16 | Por atributo v15 → v16 |
| --- | ---: | ---: | ---: |
| Baixa | 100 → 60 | 0,02 → 0,02 | 0,02 → 0,02 |
| Média | 220 → 132 | 0,18 → 0,23 | 0,12 → 0,15 |
| Alta | 360 → 216 | 0,40 → 0,50 | 0,22 → 0,28 |

O teto diário passa de 450 para 270 XP e de 0,50 para 0,60 atributo; ouro mantém 100. Em confiança média/alta, a proposta de atributos da IA recebe fator 1,25 antes dos tetos. A regra usa apenas o treino e o histórico daquele dia: níveis 1, 10 e 20, com ou sem equipamento, recebem o mesmo ganho bruto em condições idênticas. O save preserva os registros antigos sob a validação histórica de até 450 XP diários.

## Verificação de balanceamento e compatibilidade

- Testes determinísticos devem comparar o mesmo JSON de treino nos níveis 1, 10 e 20, com e sem equipamento, e provar igualdade do ganho bruto de atributo quando o histórico é igual.
- Verificar confiança insuficiente, limite por sessão, múltiplos treinos no mesmo dia, teto diário, duplicata por ID e fingerprint, e valor pedido maior que o permitido.
- Carregar save e backup v15 com recompensas superiores aos novos tetos, preservando os valores gravados. Novo treino no mesmo dia só recebe o saldo restante do teto novo; se já foi excedido, recebe zero para aquele recurso, sem invalidar o save.
- Testar habilidades bloqueadas e desbloqueadas nos níveis 1, 2 e 3. Confirmar que custo, descrição e resultado do combate continuam alinhados.
- Executar `npm test`, `npm run build` e `npm run test:e2e`; conferir visualmente treino e combate em 390×844, 430×932, 1366×768 e 1920×1080. Registrar comandos, números e capturas reais em `docs/VALIDATION.md`.
- Revisar `git diff` para garantir ausência de mudanças em `src/game/` e em CSS de animação. O visual animado aprovado na v15 serve como referência intocada.

## Aceite e publicação

- O treino equivalente não perde atributos por causa de nível ou equipamento; confiança, limites, histórico diário e antirrepetição continuam efetivos.
- O XP de treino cai de modo perceptível e os ganhos de atributos médios/altos crescem moderadamente segundo as simulações registradas.
- Saves antigos, inclusive um treino gravado acima do novo limite, carregam, exportam e restauram sem perda.
- O jogador enxerga próximos desbloqueios de habilidade e entende custo e uso; não consegue executar habilidade bloqueada.
- A v16 recebe versão, histórico, estado e validação próprios, é integrada apenas após todos os testes e tem publicação verificada no endereço fixo antes de ser marcada **oficial**. A v17 começa da v16 validada.
