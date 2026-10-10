---
name: diretor-de-pauta
description: "Escolha do tema de um vídeo: nicho do canal, o que o público busca, quem já responde e o registro da escolha. Use quando faltar ideia de vídeo, para comparar temas ou medir a procura de um."
---

## Papel e entregas

Dono da escolha do tema. O usuário escolhe; esta skill leva a ele finalistas com evidência de procura.

Entrega em `src/videos/<vídeo>/pauta.md`: o tema, o termo buscado que o título vai carregar, as medições datadas, o motivo e os finalistas que perderam. A pasta do vídeo nasce aqui, com nome em inglês, que vira o id da composição e o primeiro argumento de todo comando.

## Fora do escopo

- Recorte, tese, promessa e pesquisa de fatos: `diretor-criativo`. Um recorte possível pode ser anotado como argumento a favor de um tema, marcado como não pesquisado; ele não é decisão.
- Título, descrição e tags: `diretor-publicacao`, que recebe o termo buscado.
- Desempenho de vídeo publicado, calendário e estratégia de canal.
- Prever viral: mede-se procura, oferta e ponto fora da curva.

## Trabalho

1. **Candidatos.** Levante termos que o público digita e passe cada um pelo nicho. Pronto quando há de cinco a dez candidatos que passam, cada um nas palavras em que apareceu.
2. **Oferta.** Leia quem já responde cada candidato e marque os pontos fora da curva. Pronto quando cada candidato tem views, canal, inscritos, idade e formato dos primeiros resultados, ou a limitação dita.
3. **Volume.** Peça ao usuário o volume e a competição dos até cinco melhores, um termo por busca. Pronto quando cada um tem os dois níveis, e o que deu o menor volume com oferta forte foi medido de novo na versão curta.
4. **Base.** Confira se cada finalista tem resposta estabelecida. Pronto quando cada um está marcado "firme" ou saiu.
5. **Escolha.** Apresente de dois a quatro finalistas numa tabela, com a recomendação e o motivo, e pare. Pronto quando o usuário escolheu e `pauta.md` existe.

Os passos 1, 2 e 4 são do agente e vêm antes de qualquer pedido ao usuário além do volume. Um candidato que reprova no nicho ou no corte de volume sai sem consulta, com o motivo dito. Pedido localizado ("mede a procura deste termo", "esse tema é do canal?") vai direto à unidade dele.

## Índice de unidades

| Unidade | Pergunta | Leia quando |
|---|---|---|
| `nicho` | Este tema é do canal? | Um candidato aparece, antes de medi-lo. |
| `candidatos` | De onde saem os temas a medir? | O levantamento começa. |
| `medida` | O que cada número diz, e qual não vale? | For ler a oferta, pedir o volume ou interpretar um painel. |
| `escolha` | Qual tema ganha, e o que fica registrado? | Houver candidatos medidos, ou um tema escolhido cair na pesquisa. |

## Parada

A escolha termina quando o usuário escolheu um finalista e `pauta.md` está escrito; daí o tema segue para o `diretor-criativo`. Se nenhum candidato passa no nicho e no corte de volume, diga isso e levante outra rodada de sementes, em vez de afrouxar o filtro.
