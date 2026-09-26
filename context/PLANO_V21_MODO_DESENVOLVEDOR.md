# Plano proposto — v23.09.2003.21: modo desenvolvedor

Estado: **somente planejamento**. Base conhecida: v23.09.2003.19 publicada. A v20 permanece reservada para a movimentação dos monstros, conforme a prioridade já definida pelo jogador. Confirmar a numeração e a base Git ao abrir a implementação.

## Problema e resultado desejado

Hoje é preciso repetir combates, treinos e compras para alcançar um nível ou uma combinação de atributos e ouro. O jogador quer digitar `DEV23` e testar rapidamente o jogo com valores escolhidos por ele.

Resultado perceptível: em **Ajustes → Modo desenvolvedor**, digitar exatamente `DEV23` abre um painel para alterar XP de aventura, ouro e bônus de teste dos quatro atributos. O jogo mostra imediatamente o nível e os valores derivados. Um selo **MODO DEV** fica visível durante toda a sessão. Ao sair, a aventura normal reaparece intacta.

`DEV23` é um atalho de ativação, não uma senha segura: o código de um jogo estático pode ser lido no navegador. A proteção do progresso virá do isolamento entre os dois saves. Não usar esse código como autenticação para placares ou serviços futuros.

## Escopo desta versão

1. **Entrada e saída:** campo `Código de desenvolvedor` em Ajustes; remover espaços nas bordas e aceitar apenas `DEV23` em maiúsculas. O desbloqueio vale para a aba atual por `sessionStorage`. Ao fechar a aba ou escolher **Voltar à aventura normal**, a próxima abertura usa o save normal.
2. **Cópia isolada:** ao ativar pela primeira vez, copiar o save normal já validado para `fizzi-quest.dev.save.v1`; preservar `fizzi-quest.save.v1` e sua cópia `.previous`. Oferecer **Continuar teste** e **Recomeçar teste a partir do progresso normal** quando existir um save de teste. A segunda opção substitui somente a cópia de teste, após mostrar o efeito da ação.
3. **XP:** permitir adicionar XP de aventura, definir XP total e usar atalhos de nível 1, 5, 10 e 20 calculados pela função `level`, sem manter tabela duplicada. Um seletor de ganho `1×`, `2×`, `5×`, `10×` modifica **XP de combate e missão** apenas no save de teste. O log de recompensa deve mostrar o valor realmente concedido. Treinos importados continuam seguindo seus limites e histórico; o painel de adição direta basta para simular avanço rápido sem fabricar treinos.
4. **Ouro:** permitir adicionar ou definir o total de ouro, com prévia do novo valor antes de aplicar.
5. **Atributos:** controlar bônus de teste inteiros e não negativos para Força, Vigor, Agilidade e Fôlego. Mostrar, lado a lado, bônus aplicado e atributo final calculado por `stats`. O bônus não deve falsificar pontos distribuídos, maestrias, equipamento ou histórico de treinos.
6. **Interface:** painel compacto para desktop e celular, com **Aplicar**, **Desfazer última alteração de teste**, **Restaurar valores de teste** e **Voltar à aventura normal**. O selo deve aparecer no HUD e em qualquer modal de configuração para evitar confundir a cópia com o progresso real.

Ficam fora desta versão: edição de inventário, missões, mapa, bosses, probabilidades de spawn, recompensas de treino e parâmetros de combate. Esses controles só devem entrar após o modo básico provar que o isolamento funciona.

## Modelo de dados e regras

- Manter o save normal no formato atual. Criar um envelope de teste discriminado, por exemplo `{ mode: "dev", version: 1, save: Save, bonuses: Vector, xpMultiplier: number }`, em chave local separada. `validateDevSave` valida o envelope e o `Save` interno; `validateSave` usado para backups normais rejeita explicitamente um envelope DEV.
- Selecionar o armazenamento ativo **antes** de construir `Store` e `World`. Trocar entre normal e DEV por recarga controlada, após persistir o estado da origem. `sessionStorage` guarda só a escolha da aba, nunca o código ou valores do jogo. Ao sair, a cópia DEV pode ficar disponível para testes futuros, mas não é carregada automaticamente como aventura normal.
- Aplicar mudanças em uma única operação atômica no save DEV: ler campos, validar limites, calcular prévia, criar próxima cópia, validar novamente e só então persistir/atualizar HUD e mundo. Erro de armazenamento deixa a versão anterior utilizável.
- Sugestão de limites iniciais para o piloto: XP total e ouro entre 0 e 1.000.000; bônus de teste entre 0 e 30 por atributo; multiplicador apenas nas quatro opções acima. Ajustar os limites depois do piloto visual e de desempenho, se houver motivo.
- A regra atual exige `pontos distribuídos ≤ nível − 1`. Se um XP total menor violar isso, bloquear a alteração com mensagem clara e oferecer **Zerar pontos distribuídos na cópia de teste** como ação separada. Não reduzir pontos automaticamente.
- Quando Vigor/Fôlego ou nível baixarem, limitar vida/fôlego atual aos máximos recalculados. Ao subir, manter os recursos atuais e oferecer recuperação pelo descanso existente; não curar silenciosamente.
- Calcular atributos e recursos pelo mesmo caminho usado no jogo. O bônus DEV entra como parcela explicitamente rotulada no detalhamento de `stats`; ouro e XP alteram apenas a cópia DEV. O multiplicador deve ser passado como regra de recompensa ao domínio para que XP salvo, mensagem de vitória e eventos concordem. Bônus de treino não entra no multiplicador.
- Exportação do DEV, se oferecida, deve usar nome/aviso **BACKUP DE TESTE** e marcador que impeça a importação acidental como save normal. O botão comum de exportação deve indicar qual modo está ativo.

## Arquivos e ordem de execução previstos

| Passo | Alteração | Evidência antes de avançar |
| --- | --- | --- |
| 1. Isolamento | Adaptador de armazenamento e seletor de modo na inicialização; migração da cópia DEV | Save normal idêntico antes/depois de entrar, recarregar e sair |
| 2. Regras | Validação dos comandos DEV, bônus em atributos, prévia de `stats`, limites de XP/ouro | Níveis 1, 5, 10 e 20; compra, combate e recursos válidos |
| 3. Ganho de XP | Política DEV para XP de combate/missão e texto de recompensa consistente | Vitória e missão dão exatamente o XP mostrado; treino permanece coerente |
| 4. UI | Entrada `DEV23`, painel, selo, botões de aplicar/desfazer/retornar | Fluxo legível em 390×844 e 1366×768, sem controle cortado |
| 5. Fechamento | Versão, histórico, contexto, evidências, PR | Testes, build, E2E e inspeção manual aprovados |

Arquivos prováveis: `src/main.ts`, `src/application/store.ts`, um controlador DEV novo em `src/application/`, `src/domain/game.ts`, `src/style.css`/`src/polish.css`, `tests/domain.test.ts` e `tests/e2e/`. A implementação deve manter o estado do jogo fora da cena Phaser; a cena apenas recebe a atualização de velocidade/visual já derivada do estado.

## Piloto e critérios de aceite

Piloto mínimo: copiar um save sintético nível 1 com 20 ouro, ativar DEV, definir XP para nível 5, adicionar 100 ouro, dar +4 de Agilidade e vencer um Broto com multiplicador `2×`. Confirmar a evolução, a velocidade, o log de XP, a compra possível e a volta ao save normal original.

- Código errado não ativa o modo; `DEV23` ativa somente a cópia isolada.
- Save normal, backup normal e histórico de treinos permanecem byte a byte iguais após testes DEV, saída e recarga.
- Atributo final, nível, pontos livres, vida/fôlego máximos, ouro e XP exibidos coincidem com o estado persistido.
- Reduzir XP a um nível incompatível com pontos distribuídos mostra erro e não salva estado parcial.
- Multiplicador afeta somente recompensa de aventura no modo DEV; mensagens e estado salvo apresentam o mesmo ganho.
- Combate em andamento impede edição de valores até sua conclusão ou saída segura do encontro.
- Importar um backup DEV no modo normal é recusado com explicação, sem substituir o progresso.
- Testar recarga, fechamento/retorno à aba, armazenamento ilegível, desktop e celular emulado. Executar `npm test`, `npm run build`, `npm run test:e2e` e inspecionar capturas do painel e do HUD nos dois modos.

## Prioridade e complexidade

Complexidade estimada: **média-alta**. O risco principal está na consistência entre progressão, atributos derivados e dois armazenamentos, não no campo `DEV23`. Fazer esta entrega sozinha após a v20 de movimentação dos monstros. Capa e Runa permanecem no backlog e recebem número definitivo apenas quando essa base for validada.
