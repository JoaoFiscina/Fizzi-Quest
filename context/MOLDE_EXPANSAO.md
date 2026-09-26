# Molde de expansão do Fizzi Quest

Registrado em 26/09/2026 após a v23.09.2003.15. Use este roteiro em cada nova versão `v23.09.2003.x`, adaptando as evidências ao tipo de mudança. O objetivo é manter uma `main` jogável, mostrar progresso perceptível e deixar um ponto de retomada claro.

## 1. Abrir a etapa

1. Ler `AGENTS.md`, `context/README.md`, `ESTADO_ATUAL.md`, `PROXIMOS_PASSOS.md` e o plano da etapa anterior.
2. Conferir `git status`, branch, commit de `main`, PRs em aberto, versão exibida em `src/version.ts` e versão servida no link oficial.
3. Escolher **um objetivo central** e classificar a complexidade. Seguir a regra do roadmap: no máximo um sistema estrutural novo por versão; não juntar uma migração de save, uma alteração grande de combate e uma expansão gráfica.
4. Escrever um plano versionado em `context/`: problema observável, resultado desejado, escopo, exclusões, arquivos prováveis, riscos e critérios de aceite. Manter a versão anterior intacta até a nova passar.
5. Trabalhar em branch própria a partir da base confirmada. Preservar alterações do usuário e não sobrescrever trabalho em andamento.

## 2. Registrar a referência antes de mudar

- **Visual:** capturar antes/depois com o mesmo save sintético, posição, zoom, viewport e modo de movimento. Registrar também a escala real de jogo; ampliação inteira de sprites é evidência complementar.
- **Regras e progressão:** guardar cenários calculáveis antes/depois. Para treinos, comparar níveis 1, 10 e 20, com e sem equipamento, além dos limites por sessão/dia.
- **Interface:** capturar o fluxo atual em desktop e celular emulado, incluindo estados vazios, bloqueados e de erro relevantes.
- **Save:** exportar um save sintético da versão anterior e verificar como ele abre na nova implementação.

Pôr as evidências em `docs/evidence/<versão>/before/` e registrar as condições de captura no README da pasta. Nunca usar treino ou dado pessoal real como fixture.

## 3. Fazer um piloto e só então expandir

Implementar primeiro um caso representativo e examiná-lo no jogo. Na v15, o piloto estático mostrou se a silhueta do Broto e a leitura do terreno melhoravam na escala normal antes de redesenhar as quatro criaturas. Em versões de regras, o equivalente é simular um treino e uma progressão inteira antes de ajustar todas as tabelas. Corrigir o piloto até cumprir o critério de aceite, depois repetir o padrão no restante do escopo.

Separar regras, save e apresentação. Combate resolve e persiste antes de exibir efeitos; animações não definem dano ou recompensa. Sprites seguem a grade de 16 px, nearest-neighbor e assets autorais; registrar origem/licença se um asset externo for aprovado. Mudanças de save exigem migração explícita e teste de backup/reload.

## 4. Validar a mudança real

Executar `npm test`, `npm run build` e `npm run test:e2e` para alterações de domínio ou fluxo jogável. Corrigir falhas antes da integração. Para alterações somente documentais, conferir links, consistência e `git diff --check`.

Além dos testes automáticos, usar a régua específica:

| Tipo de etapa | Evidência obrigatória |
| --- | --- |
| Arte e mapa | Pares antes/depois na mesma condição, inspeção na escala real, leitura de personagem, rota e interação em desktop e celular emulado |
| Animação | Pelo menos 30 segundos na cadência real; quadros mudam e retornam à pose; posições e contagens de objetos/timers permanecem estáveis; modo Reduzida verificado |
| Treino/balanceamento | Simulações de personagem inicial e avançado; ganho bruto, caps e duplicatas; efeito sobre atributos, XP e duração da progressão |
| Equipamentos/slots | Compra, mochila, equipar, HUD, combinações de bônus, nível bloqueado/desbloqueado, migração e backup |
| Interface | Estados e ações em 390×844, 430×932, 1366×768 e 1920×1080; sem rolagem horizontal ou controle inacessível |

Diferença de pixels ou teste de timer comprova uma alteração técnica, não qualidade percebida. Descrever o que ficou mais legível e o que ainda precisa melhorar. Distinguir emulação de teste em aparelho físico. Não repetir toda a bateria após formatação ou documentação se nenhuma regra mudou.

## 5. Fechar a versão sem perder contexto

1. Atualizar `src/version.ts`, `package.json`/lockfile, README e `HISTORICO_VERSOES.md` quando houver nova entrega jogável. Versão pública e versão do save são independentes.
2. Escrever `docs/VALIDATION.md` com comandos executados, resultados reais, capturas, limitações e condição de reprodução. Arquivar a validação anterior se for sobrescrita.
3. Atualizar `ESTADO_ATUAL.md`, `PROXIMOS_PASSOS.md`, `ROADMAP_IMPLEMENTACOES.md` e o plano versionado; marcar **feito**, **parcial** ou **pendente** de acordo com a evidência.
4. Revisar `git diff --check`, mudanças involuntárias e a árvore de contexto. Criar PR com problema, comportamento final e testes.
5. Com autorização para integrar, conferir checks e conflitos, integrar na `main`, aguardar o deploy e abrir o domínio oficial. Verificar HTTP, versão no título/rodapé e um fluxo jogável, não apenas o status “Ready”. Registrar commit/PR/deploy no contexto.

Se a publicação falhar, registrar estado exato e conservar a versão pública anterior como referência. Só chamar uma versão de oficial quando o endereço fixo servir o build correto.

## Ficha para copiar no início da próxima versão

```text
Versão proposta:
Base Git e versão oficial confirmadas:
Objetivo central:
Complexidade e motivo:
Fora do escopo:
Comportamento atual e evidência antes:
Resultado perceptível esperado:
Piloto mínimo:
Arquivos/sistemas previstos:
Risco de save, gameplay e desempenho:
Critérios de aceite:
Testes e evidências adequados:
Estado da integração/publicação:
Próximo passo após esta versão:
```

Para a v23.09.2003.16, iniciar com as simulações de treino dos níveis 1, 10 e 20. As faixas de XP e atributos no roadmap são hipóteses de calibração, não números aprovados.
