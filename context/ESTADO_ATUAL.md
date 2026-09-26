# Estado atual — v23.09.2003.15

Implementação na branch `feat/composicao-v15`, baseada na v14 integrada à `main`. O estado público deve ser conferido após a integração e deploy da v15.

## Resultado

- Vila e bosque com piso, caminhos, pedras, musgo e pontos de referência revistos dentro das dimensões atuais.
- Broto, Besouro, Mariposa e Guardião redesenhados em pixel art original; pose neutra e quatro quadros de idle por espécie.
- Poses de ataque, impacto, carapaça e preparo consomem apenas os eventos e estados de combate já existentes.
- Preferência de movimento da v14 é respeitada: modo reduzido conserva poses informativas, sem ciclo de idle dos monstros.
- Mapa de consulta agrupa Vila e Bosque na trilha existente; Posto de Vigia aparece como marco do Bosque.
- Mina, Ruínas e Costa seguem como prévias futuras bloqueadas, sem interação ou viagem.
- Save, colisões, posições de encontro, zoom e regras de combate mantidos.

## Plano e evidências

Plano detalhado: `PLANO_V15_COMPOSICAO_ESTETICA.md`.
Comparações e folhas de quadros: `docs/evidence/v23.09.2003.15/`.
Testes e limitações: `docs/VALIDATION.md`.

## Limites

- Sem regiões jogáveis novas ou respawn variável.
- Sem ensaio em telefone físico ou medição de bateria.
- Transições amplas do combate foram adiadas; poses curtas cobrem os estados existentes.

## Próximo passo

v23.09.2003.16: progressão e treino, conforme `PROXIMOS_PASSOS.md`. Primeiro conferir o deploy da v15 no endereço oficial.
