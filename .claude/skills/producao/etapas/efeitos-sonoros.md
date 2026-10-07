# Efeitos sonoros de um vídeo

Parte da sexta etapa, o som. Roda quando a skill `diretor-de-som` entrega a lista dos usos que faltam no catálogo: cada item diz o que acontece na imagem (uma porta que desce, uma moeda que cai). Onde o som toca, em que nível e por quê é decisão de lá (`diretor-de-som/efeitos/dose`); aqui se acha o som.

## O catálogo

Fica em `src/audio/sfx.ts`: cada efeito tem o nome do uso (`shutterDown`, e não o id do arquivo), o arquivo e o pico de volume dele. Os arquivos ficam em `public/sfx/freesound/`. Antes de buscar, confira se um uso do catálogo já serve: se serve, é ele, sem busca e sem consulta ao usuário. O catálogo existe para que a escuta feita uma vez valha em todo vídeo.

## Buscar

Só CC0, até 10 s:

```bash
pnpm sfx "<busca em inglês>"   # lista id, duração, nota e link de cada candidato
pnpm sfx <id>                  # baixa para public/sfx/freesound/<id>.ogg e imprime a linha do catálogo
```

## Escolher

Descarte pelos critérios de `diretor-de-som/efeitos/escolha`. O agente não ouve os que sobram: mostre ao usuário de dois a quatro links por uso, com a ação ("a porta de enrolar desce"), e pergunte qual soa como ela. A resposta é o ouvido que faltava para dizer que arquivo realiza o uso, e não uma aprovação: não vai a `approvals.md`. Só então baixe e cole no catálogo a linha que o comando imprime, trocando `<uso>` pelo nome do uso.

Pronto quando: todo uso da lista tem um som que o usuário ouviu como a ação, baixado e no catálogo, e `pnpm lint` passa. Devolva à skill `diretor-de-som` o `name` de cada um.

## Volume

Efeito nenhum tem volume ajustado à mão. A montagem põe o pico de cada um a uma distância da voz, pelo nível que o roteiro dá ao efeito (`SFX_LEVELS`, em `src/audio/sfx.ts`). Se o usuário achar os efeitos altos ou baixos de modo geral, é ali que se muda.
