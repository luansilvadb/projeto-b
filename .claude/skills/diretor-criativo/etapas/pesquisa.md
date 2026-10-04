# Pesquisa de um vídeo

Primeira etapa da produção. O que sai daqui é `src/videos/<vídeo>/research.md`: a lista de fatos que o roteiro pode usar, cada um ligado a uma fonte numerada. O diferencial do canal é estar certo, e o usuário aprova o roteiro conferindo essas fontes, então um fato sem fonte vale menos que nenhum fato.

## Como trabalhar

1. Combine com o usuário o nome da pasta do vídeo: inglês, minúsculas e hifens (`sunlight-travel-time`). Esse nome vira o id da composição e o argumento de todos os comandos.
2. Defina a ideia central em uma frase: o que a pessoa deve entender ao fim do vídeo. Ela decide o que entra e o que fica de fora.
3. Liste as perguntas do tema (passos 1 e 2 de `pesquisa/levantamento`) e acione um subagente `pesquisador` por pergunta, em paralelo, passando a pergunta, a ideia central e o caminho de `research.md`, quando ele já existir. Para um fato avulso que o roteiro pediu, pesquise você mesmo, por `levantamento`.
4. Antes de gravar um fato, cobre de cada relatório: a fonte aberta, com a frase ou o número conferido nela (resultado de busca resumido não é a fonte; página que não abriu é dita na entrada da fonte); a conta de cada número derivado, para quem revisa conseguir refazê-la; a expectativa que cada fato surpreendente quebra e o termo de comparação de cada número. O que vier como *não verificado* entra em "Pontos em aberto", nunca em "Fatos".
5. Registre o que é incerto ou disputado, e o que é uma simplificação aceitável. O roteiro decide como falar disso; a pesquisa não esconde.

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

Não escreva narração nem descreva cenas. Separar pesquisa de roteiro evita que uma frase bonita arraste um fato fraco para dentro do vídeo. Quando a pesquisa estiver pronta, mostre ao usuário a ideia central, os fatos mais fortes e os pontos em aberto, e siga para a etapa `roteiro`.
