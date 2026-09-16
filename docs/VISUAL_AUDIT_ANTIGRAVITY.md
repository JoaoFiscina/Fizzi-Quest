# Auditoria visual pós-Antigravity

## Escopo

Comparação entre o marco funcional `346c805` (`v23.09.2003.4`) e o estado recebido em `7d8bde0` (`v23.09.2003.8`). A análise combinou histórico Git, diferenças de código e capturas reais em desktop e celular.

## Diagnóstico

As alterações posteriores ao marco funcional conservaram melhorias importantes de câmera, movimento, equipamentos, velocidade, spawn e responsividade. A direção visual, porém, perdeu coesão:

- o gramado ganhou um padrão repetitivo de blocos 2x2 e excesso de hastes claras;
- o caminho recebeu molduras internas em todas as peças, formando uma grade visível;
- árvores ficaram muito saturadas e geométricas;
- personagens aumentaram e acumularam detalhes que perdem leitura na escala do jogo;
- HUD, navegação e controles passaram a usar brilho, desfoque e gradientes com aparência de painel moderno;
- os seis quadros de animação dos monstros eram cópias idênticas;
- os quadros de vento na grama estavam vazios;
- a animação de árvores repetia continuamente quadros idênticos.

## Decisão por área

| Área | Decisão | Motivo |
| --- | --- | --- |
| Câmera e escala | Manter | Zoom inteiro, pixels alinhados e enquadramento responsivo estão corretos. |
| Movimento e velocidade | Manter | O atributo de agilidade já altera a velocidade com limite seguro. |
| Equipamentos | Manter e tornar visível | Arma, escudo e armadura já fazem parte do domínio, mas sumiram do HUD. |
| Spawn de monstros | Manter | A variação determinística evita saltos entre recargas. |
| Terreno | Restaurar e melhorar | A paleta anterior é mais calma; precisa de bordas, detalhes raros e variedade controlada. |
| Árvores e construções | Restaurar e melhorar | As silhuetas anteriores têm leitura mais orgânica e aceitam pequenos detalhes. |
| Personagens | Restaurar e animar | O desenho compacto é mais legível; os ciclos devem alterar pixels de verdade. |
| Monstros | Refazer animações | Cada espécie precisa de movimento próprio visível. |
| HUD e controles | Restaurar e compactar | A interface deve parecer parte de um RPG e manter o centro do mapa livre. |
| Mapa de regiões | Manter estrutura | As áreas futuras bloqueadas continuam úteis; o acabamento visual segue no backlog. |

## Restrições da restauração

- não remover sistemas recentes;
- não criar regiões ou mecânicas novas;
- não alterar as dimensões dos mapas ou a progressão;
- preservar `pixelArt`, `roundPixels` e renderização sem suavização;
- validar desktop, celular, movimento, toque, menus e combate antes de integrar.
