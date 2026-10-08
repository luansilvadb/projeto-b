# Publicação de um vídeo

O que sai daqui é `src/videos/<vídeo>/description.md`: o título final e a descrição que o usuário cola no YouTube. Depende das fontes de onde ela é montada: `script.json`, `script.md` e `research.md` como estão agora, que precisam ser os do vídeo que vai ao ar. A descrição pode ser escrita antes de o arquivo final existir; se o texto mudar depois, ela é montada de novo. O acervo, no fim, é que precisa do arquivo final atual (`out/<vídeo>/<vídeo>.final.mp4`).

Aqui se monta, não se escreve: toda frase vem do que o roteiro e a pesquisa já dizem.

## De onde vem cada parte

| Parte | Fonte |
|---|---|
| Título | `title` de `script.json`. Se a embalagem ainda tem uma escolha aberta com o usuário, ela é da skill `diretor-criativo` (`embalagem/titulo-e-thumbnail`): a descrição usa o título que resultar. |
| Abertura | Duas linhas, as únicas visíveis antes de "mostrar mais": dão uma razão fiel para assistir, tirada do gancho do roteiro, coerente com a embalagem e com o compromisso do vídeo. |
| Fontes | As de `research.md` que alguma cena cita no campo `sources` de `script.json`, com instituição ou autor, título e link, na ordem e com o número de `research.md`. |
| Simplificações | A seção `Simplificações` de `script.md` e os pontos em aberto de `research.md` que o vídeo toca, uma linha cada. |
| Créditos | Narração com voz sintética clonada; trilha original gerada com ACE-Step; efeitos sonoros do Freesound (CC0). |

Uma frase que não está em nenhuma dessas fontes é texto novo: peça-a à skill `diretor-criativo`.

## Formato

```markdown
# <título>

<abertura, duas linhas>

## Fontes

1. <instituição ou autor>, "<título>". <URL>

## O que simplificamos

- <simplificação ou ponto em aberto>

## Créditos

- <uma linha por item>
```

## Conferir

- Toda fonte citada por uma cena está na descrição, e nenhuma que cena nenhuma cita.
- Todo link é o de `research.md`, sem alteração.
- O título é o de `script.json`, e a abertura não afirma nada além do roteiro.

## Acervo

Com o vídeo no ar, copie para `acervo/<vídeo>/` o que foi publicado: `out/<vídeo>/<vídeo>.final.mp4`, a pasta `public/videos/<vídeo>/` (a narração e a trilha), a thumbnail e um PNG de cada folha de modelo dos personagens (`pnpm exec remotion still <folha> acervo/<vídeo>/<folha>.png`). A pasta é escrita uma vez e não é sobrescrita: é a única cópia do que foi ao ar que não depende de gerar de novo.

Pronto quando: as três conferências passam e o usuário leu a descrição. Entregue o caminho do arquivo e lembre-o de que a marcação de conteúdo sintético no YouTube é dele (os avisos estão em `corte-final.md`).
