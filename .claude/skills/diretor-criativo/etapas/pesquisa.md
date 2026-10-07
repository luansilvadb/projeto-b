# Pesquisa de um vídeo

Primeira etapa da produção. O que sai daqui é `src/videos/<vídeo>/research.md`: a lista de fatos que o roteiro pode usar, cada um ligado a uma fonte numerada. O diferencial do canal é estar certo, e o usuário aprova o roteiro conferindo essas fontes, então um fato sem fonte vale menos que nenhum fato.

## Como trabalhar

1. Combine com o usuário o nome da pasta do vídeo: inglês, minúsculas e hifens (`sunlight-travel-time`).
2. Defina o foco de partida: o tema, a pergunta inicial e o contexto que o usuário trouxe, o bastante para orientar a busca. Ele é hipótese, e não a tese nem o ângulo do vídeo (`conceito/angulo`): não descarta um fato por não servir a uma conclusão que ainda não foi testada, e a pesquisa pode mudar o recorte.
3. Liste as perguntas do tema (passos 1 e 2 de `pesquisa/levantamento`) e acione um subagente `pesquisador` por pergunta, em paralelo, passando a pergunta, o foco de partida e o caminho de `research.md`, quando ele já existir. Para um fato avulso que o roteiro pediu, pesquise você mesmo, por `levantamento`.
4. Antes de gravar um fato, cobre de cada relatório: a fonte aberta, com a frase ou o número conferido nela (resultado de busca resumido não é a fonte; página que não abriu é dita na entrada da fonte); a conta de cada número derivado, para quem revisa conseguir refazê-la; a expectativa que cada fato surpreendente quebra e o termo de comparação de cada número. O que vier como *não verificado* entra em "Pontos em aberto", nunca em "Fatos".
5. Registre o que é incerto ou disputado, e o que é uma simplificação aceitável. O roteiro decide como falar disso; a pesquisa não esconde.

## Formato de research.md

Siga `src/videos/why-we-sleep/research.md`:

```markdown
# Pesquisa: <pergunta ou tema do vídeo>

Foco de partida: <o que orientou a busca; não é a tese do vídeo>

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

Não escreva narração nem descreva cenas. Separar pesquisa de roteiro evita que uma frase bonita arraste um fato fraco para dentro do vídeo. Quando a pesquisa estiver pronta, mostre ao usuário os fatos mais fortes, os pontos em aberto e o que a base sustenta ou deixou de sustentar em relação ao foco de partida, inclusive quando ela aponta para outra pergunta, e siga para a etapa `roteiro`.
