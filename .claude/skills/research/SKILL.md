---
name: research
description: Pesquisa e verifica os fatos de um tema antes de qualquer roteiro, gravando tudo com fontes em src/videos/<vídeo>/research.md. Use sempre que o usuário trouxer um tema para um vídeo novo, pedir para pesquisar ou checar um assunto de ciência, quiser saber se uma afirmação se sustenta, ou quando o roteiro precisar de um fato que ainda não está na pesquisa.
---

# Pesquisa de um vídeo

Primeira etapa da produção. O que sai daqui é `src/videos/<vídeo>/research.md`: a lista de fatos que o roteiro pode usar, cada um ligado a uma fonte numerada. O diferencial do canal é estar certo, e o usuário aprova o roteiro conferindo essas fontes, então um fato sem fonte vale menos que nenhum fato.

Etapas seguintes: `script`, `narration`, `animatic`, `animation`, `music`, `final-cut`.

## Como trabalhar

1. Combine com o usuário o nome da pasta do vídeo: inglês, minúsculas e hifens (`sunlight-travel-time`). Esse nome vira o id da composição e o argumento de todos os comandos.
2. Defina a ideia central em uma frase: o que a pessoa deve entender ao fim do vídeo. Ela decide o que entra e o que fica de fora.
3. Pesquise na web. Prefira fontes primárias e instituições (agências espaciais, institutos de medidas, artigos revisados por pares, livros-texto, órgãos de saúde). Matéria de imprensa e enciclopédia servem para achar a fonte primária, não para substituí-la.
4. Abra a página antes de citar. Um resultado de busca resumido não é a fonte: confirme que a frase ou o número está lá. Se a página não abrir, diga isso na entrada da fonte.
5. Para cada número derivado, escreva a conta. Quem revisa precisa conseguir refazê-la.
6. Registre o que é incerto ou disputado, e o que é uma simplificação aceitável. O roteiro decide como falar disso; a pesquisa não esconde.

## Formato de research.md

Siga `src/videos/demo/research.md`:

```markdown
# Pesquisa: <pergunta ou tema do vídeo>

Ideia central: <uma frase>

## Fatos

- <afirmação, com números e unidades>. [1]
  <conta, quando o número é derivado>. [1] [2]

## Pontos em aberto

- <o que não foi possível confirmar, ou onde as fontes divergem>

## Fontes

1. <instituição ou autor>, "<título>". <URL> (consultada em <dd/mm/aaaa>)
```

Os números das fontes são referenciados pelo campo `sources` de cada cena do roteiro, então não os renumere depois que o roteiro existir; acrescente no fim.

## O que não fazer nesta etapa

Não escreva narração nem descreva cenas. Separar pesquisa de roteiro evita que uma frase bonita arraste um fato fraco para dentro do vídeo. Quando a pesquisa estiver pronta, mostre ao usuário a ideia central, os fatos mais fortes e os pontos em aberto, e siga para a skill `script`.
