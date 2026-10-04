---
name: efeitos-sonoros
description: "Procedimento dos efeitos sonoros neste repositório: como buscar um som CC0 no Freesound, levar os candidatos ao ouvido do usuário e acrescentar o escolhido ao catálogo."
---

# Efeitos sonoros de um vídeo

Roda durante a animação, quando a skill `diretor-de-arte` entrega a lista dos usos que faltam no catálogo: cada item diz o que acontece na imagem (uma porta que desce, uma moeda que cai). Onde o som toca e em que deixa é decisão de lá, já aprovada pelo usuário; aqui se acha o som.

## O catálogo

Fica em `src/audio/Sfx.tsx`, com cada efeito nomeado pelo uso (`shutterDown`, e não o id do arquivo), para que a mesma porta soe igual em todo vídeo. Os arquivos ficam em `public/sfx/freesound/`. Antes de buscar, confira se um uso do catálogo já serve.

## Buscar

Só CC0, até 10 s:

```bash
pnpm sfx "<busca em inglês>"   # lista id, duração, nota e link de cada candidato
pnpm sfx <id>                  # baixa para public/sfx/freesound/<id>.ogg
```

O comando precisa de `FREESOUND_API_KEY` no `.env`.

## Escolher

Você não ouve os sons: descarte pelo nome, pela duração e pela nota, e evite os que se anunciam como gerados por IA. Mostre ao usuário de dois a quatro links por uso e deixe que ele escolha ouvindo. Só então baixe e acrescente o arquivo ao catálogo, com um nome pelo uso.

Pronto quando: todo uso da lista tem um som escolhido pelo usuário, baixado e no catálogo, e `pnpm lint` passa. Devolva à skill `diretor-de-arte` o `name` de cada um.

## Volume

O volume dos efeitos é um só para todos os vídeos (`SFX_VOLUME`, em `src/audio/Sfx.tsx`). Se o usuário achar os efeitos altos ou baixos de modo geral, é ali que se muda; efeito nenhum tem volume ajustado na cena.
