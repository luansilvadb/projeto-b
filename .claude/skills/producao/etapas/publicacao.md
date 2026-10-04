# Publicação de um vídeo

Oitava etapa, depois da terceira aprovação, registrada em `src/videos/<vídeo>/approvals.md`; sem a linha dela, volte ao `corte-final`. O que sai daqui é `src/videos/<vídeo>/description.md`: o título final e a descrição que o usuário cola no YouTube.

Esta etapa monta, não escreve: toda frase vem do que já foi aprovado.

## De onde vem cada parte

| Parte | Fonte |
|---|---|
| Título | `title` de `script.json`. Se o usuário ainda não escolheu entre os pares de título e thumbnail, a escolha é da skill `diretor-criativo` (`embalagem/titulo-e-thumbnail`), antes desta etapa. |
| Abertura | Duas linhas, as únicas visíveis antes de "mostrar mais": a promessa do vídeo, como ela está no gancho aprovado. Abre a pergunta e não entrega a resposta. |
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

Pronto quando: as três conferências passam e o usuário leu a descrição. Entregue o caminho do arquivo e lembre-o de que a marcação de conteúdo sintético no YouTube é dele (os avisos estão em `corte-final.md`).
