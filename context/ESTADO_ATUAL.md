# Estado atual — v23.09.2003.14

Implementação na branch feat/fundacao-visual-v14. Produção ainda não atualizada por esta entrega.

## Resultado
- Água e fogo agora são loops permanentes, fora do limite de dois efeitos ocasionais.
- Ondas redesenhadas com cristas e sombras; fogo com duas línguas variáveis.
- Árvores balançam a copa um pixel dentro da textura; o tronco fica fixo.
- Efeitos ocasionais priorizam objetos dentro da câmera e completam seu ciclo.
- Ajustes oferece Completa, Usar sistema e Reduzida, persistidos no save.
- Saves anteriores recebem Usar sistema sem perder progresso.
- Mudanças de preferência são aplicadas imediatamente; modo sistema acompanha alterações do navegador.
- Reduzida mantém água/fogo a 1 FPS e desativa reações decorativas.
- Registro de texturas/animações protegido contra duplicação em reinício.
- Limpeza de timer e listener de redimensionamento ao encerrar a cena.

## Plano e evidências
Plano detalhado: PLANO_V14.md.
Evidências: docs/evidence/v23.09.2003.14/.
Verificações e limitações: docs/VALIDATION.md.

## Limites
- Sem teste físico em Android/iOS ou bateria.
- Esta versão melhora continuidade e leitura dos quadros ambientais; a remodelagem dos monstros pertence à versão 15.
- O aviso de tamanho do chunk Phaser permanece.

## Próximo passo
v23.09.2003.15: criaturas e mapa prévio. Ver PROXIMOS_PASSOS.md.
