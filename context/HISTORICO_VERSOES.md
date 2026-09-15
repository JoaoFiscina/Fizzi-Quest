# Histórico de versões

## v23.09.2003.4 — 15/09/2026

Adição dos slots explícitos de equipamento (escudo, armadura) com migração lazy não destrutiva. O HUD exibe a arma, o escudo e a armadura ativamente equipados. Implementação de velocidade de movimento controlada pelo atributo Agilidade (base de 56 px/s até máximo próximo de 82 px/s). O spawn de inimigos ganhou variabilidade determinística restrita a áreas caminháveis sem afetar a lógica base. Todos os 28 testes e o build passam.


## v23.09.2003.3 — 15/09/2026

Correção do enquadramento: o zoom inteiro foi preservado e as sobras agora ficam simétricas quando o mapa é menor que a viewport. O mapa prévio foi reorganizado em rota vertical no celular e trilha central no desktop, mantendo Mina do Eco, Ruínas Altas e Costa Dourada bloqueadas. Loja compacta em cartões, HUD com ouro/materiais/poções, idle de monstros e vento ocasional de terreno. 25 testes de domínio, 6 E2E e build aprovados. O código está sincronizado no GitHub; Vercel é o próximo passo.

## v23.09.2003.2 — 15/09/2026

Testes do ciclo M1 e polimento: versão visível, HUD móvel corrigido, câmera sem áreas vazias, detalhe de personagem/Broto/cenário, quatro ciclos ambientais, idle dos monstros e apresentação de combate orientada a eventos determinísticos já salvos. Backup de combate restaura a cena correspondente. Validação adicional rejeita estados de encontro inconsistentes. Árvore de contexto atualizada; não houve publicação ou merge.

Ver resultados em `docs/VALIDATION.md`. A anotação de instalação ausente na versão anterior está resolvida.

## v23.09.2003.1 — 14/09/2026

Scaffold inicial e implementação integrada do marco Treino à aventura: domínio de treino, progressão, combate, inventário, missão, mapas, arte própria, UI e persistência. Build bloqueado pela instalação ausente das dependências npm; ver `ESTADO_ATUAL.md`.
