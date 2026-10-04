# Base empírica da imagem e do movimento

De onde vêm os números e os padrões citados nas unidades, e o que eles não provam. Leia antes de questionar ou atualizar uma medida.

## O estudo

Os números e padrões citados nas unidades vêm de um estudo do canal Kurzgesagt feito em 2026-10-02: medidas quadro a quadro de 12 vídeos publicados entre março de 2025 e setembro de 2026 (123 minutos de conteúdo, sem patrocínio), leitura de 332 planos em três quadros cada, cinco trechos lidos com a legenda sob cada quadro e nove trechos lidos em quadros consecutivos (de 4 a 12 quadros por segundo).

Em 2026-10-04, um vídeo do mesmo canal sobre gordura corporal (novembro de 2025, 9 minutos sem patrocínio) foi lido inteiro, um quadro a cada 2 segundos. Dele vêm o cenário-âncora (`encenacao`), os estados do personagem (`elenco`), a cor que cresce em área (`cor`) e a onomatopeia (`texto`). Por decisão do usuário, onde as unidades contrariavam esse vídeo, ele passou a valer: tema grave saturado e com rosto (`cor`, `elenco`), olhos em tudo que age por dentro (`elenco`), assunto sozinho no centro e figuras que flutuam com halo (`composicao`), etiquetas e números que se acumulam (`texto`, `dado`). É evidência de um vídeo só, salvo o assunto no centro, conferido depois em 72 quadros de quatro dos 12 vídeos.

Também em 2026-10-04, um trecho de 27 segundos de um vídeo do canal sobre formigas (2019, de 2:12 a 2:39) foi lido em quadros a cada meio segundo. Dele vem o percurso (`encenacao`, `planos`): um cenário só, que a câmera atravessa de estação em estação. É evidência de um trecho só.

## Medianas das medidas

As faixas que o `pnpm critique` confere estão em `CRITERIA`, em `src/critique/reference.ts`. As medianas dos 12 vídeos, que o código não guarda:

| Medida | Mediana |
|---|---|
| Área do quadro com desenho | 57% |
| Cores por quadro | 4,4 |
| Trocas da cor dominante por minuto | 11 |
| Peso da família de cor mais comum | 26% |
| Tempo com a tela quase parada | 10% |
| Tempo com mais de 10% do quadro em movimento | 43% |
| Tempo até 40% do quadro ser outro | 2,0 s |

## Ressalvas que valem para todas as unidades

- É um canal só, em vídeos recentes, de temas variados (corpo, bichos, plantas, espaço, economia). As faixas dizem onde esse estilo vive, não o que é certo em geral.
- A leitura dos planos foi feita por um leitor só, em três quadros por plano; ela conta composições por baixo.
- As medidas são tiradas de quadros de 320×180 a 10 por segundo e não separam movimento de câmera de movimento de personagem; movimento lento e pequeno fica abaixo do que elas enxergam.
- A referência é renderizada a 60 quadros por segundo; os tempos de movimento valem em segundos, não em quadros.
- Os ritmos de fala são de narração em inglês e servem como ordem de grandeza para o português.
- As unidades registram mecanismos e medidas, nunca personagens, composições, paletas ou movimentos reconhecíveis do canal.
