# Efeitos sonoros de um vídeo

Roda quando a skill `diretor-de-som` entrega a lista dos usos que faltam no catálogo: cada item diz o que acontece na imagem (uma porta que desce, uma moeda que cai). Onde o som toca, em que nível e por quê é decisão de lá (`diretor-de-som/efeitos/dose`); aqui se acha o som.

## O catálogo

Fica em `src/audio/sfx.ts`: cada efeito tem o nome do uso (`shutterDown`, e não o id do arquivo), o arquivo que hoje o realiza e o pico de volume dele. Os arquivos ficam em `public/sfx/freesound/`. Antes de buscar, confira se um uso do catálogo já serve: se serve, é ele, sem busca e sem consulta ao usuário. O catálogo existe para que a escuta feita uma vez valha em todo vídeo.

O uso vem da skill `diretor-de-som`, e aqui não se troca: se a busca mostra que ele está mal definido, ou que o arquivo de um uso que existe deveria mudar, devolva a ela.

## Buscar

O comando procura no Freesound, só CC0 e só arquivos de até 10 s (o teto é da busca, e não do que um efeito pode durar):

```bash
pnpm sfx "<busca em inglês>"   # lista id, duração, nota, downloads e link de 15 candidatos
pnpm sfx <id>                  # baixa para public/sfx/freesound/<id>.ogg, mede o pico e imprime a linha do catálogo
```

Busque pelo que acontece ("metal shutter rolling down"). Se os resultados não servem, mude os termos e busque de novo: é execução, e não pergunta ao usuário.

## Escolher

Descarte pelo que se lê (`diretor-de-som/efeitos/escolha`): outro acontecimento, fala ou música no nome ou na descrição, duração que não se relaciona com a ação. A nota e os downloads só ordenam o que ouvir primeiro. O agente não ouve os que sobram: leve ao usuário o menor conjunto que resolve a dúvida, com a ação ("a porta de enrolar desce"), e pergunte se soa como ela. Um candidato único basta; vários, só quando a comparação ajuda. O link serve ao que é do som sozinho; o que depende do vídeo (o tamanho diante do desenho, a disputa com a voz) pede o candidato baixado e montado no menor trecho, em `out/rascunho/`.

A resposta é classificação auditiva, e não decisão: o ouvido que faltava para dizer que arquivo realiza o uso. Com ela, cole no catálogo a linha que o `pnpm sfx <id>` imprime, trocando `<uso>` pelo nome do uso, e apague o arquivo baixado que não entrou. Se nenhum candidato realiza o uso depois de buscas diferentes, ele fica pendente: não entra o menos ruim.

Pronto quando: cada uso da lista tem no catálogo um som que o usuário ouviu como a ação, ou foi devolvido como pendente, e `pnpm lint` passa. Devolva à skill `diretor-de-som` o `name` de cada um.

## Volume

Efeito nenhum tem volume ajustado à mão. A montagem põe o pico de cada um a uma distância da voz, pelo nível que o roteiro dá ao efeito (`SFX_LEVELS`, em `src/audio/sfx.ts`). Se o usuário achar os efeitos altos ou baixos de modo geral, é ali que se muda.
