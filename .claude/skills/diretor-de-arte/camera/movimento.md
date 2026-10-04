---
name: movimento
description: Define quando a câmera se move dentro de um plano, como ela reage ao que acontece e como o parallax dá profundidade.
---

## PERGUNTA
Quando e como a câmera se move dentro de um plano?

## RESPOSTA

**O que a referência faz.** A câmera reage ao conteúdo: recua quando algo cresce e sai do quadro (a última barra de um gráfico), aproxima para a reação de um rosto, corta para mais perto no meio de um plano sem trocar de cenário, chicoteia com borrão quando a ação muda de lugar, e troca o foco (desfoque) para levar a atenção de um elemento a outro. Nos planos sem motivo, ela desliza ou aproxima devagar, o plano inteiro, e as camadas de fundo andam menos que o assunto.

**Movimentos e motivos:**

| Movimento | Motivo | Dura |
|---|---|---|
| Aproximação lenta | o plano inteiro, sem motivo: a vida do quadro | o plano; de 3% a 6% |
| Aproximação para reação | um rosto ou detalhe que vai reagir | 0,4 a 0,8 s; de 20% a 60% |
| Recuo | algo cresce, entra mais um item numa série, a cena se abre | 0,6 a 1,2 s; o que for preciso para caber |
| Deslize | seguir quem anda ou nada; passar de um item ao seguinte numa fila | a velocidade de quem é seguido |
| Corte para mais perto | a mesma cena, de repente mais perto, para uma batida nova da fala | instantâneo; é um corte, não um movimento |
| Chicote | a atenção muda de lugar com violência | 0,2 a 0,3 s, com borrão |
| Troca de foco | levar o olho de um plano de profundidade a outro | 0,5 a 0,8 s |

**Percurso.** Quando a decupagem pede um cenário só, percorrido de estação em estação, a câmera segue um personagem-guia: ele anda, ela acompanha; ele para numa estação, ela assenta ali pelo tempo da oração e segue quando ele segue. O enquadramento muda no caminho (perto no túnel, aberto na batalha), e o recuo final revela onde tudo aquilo ficava. O que encerra o percurso entra de fora do quadro, em outra escala. Num trecho de referência de 27 s não há corte nenhum até essa entrada.

**Curvas.** A câmera acelera e desacelera como um corpo com peso: nunca começa ou para de uma vez, salvo o chicote. A aproximação lenta é tão lenta que só se nota comparando o começo com o fim do plano.

**Parallax.** O cenário é feito de camadas a distâncias diferentes, e cada uma responde ao movimento da câmera conforme a distância: o fundo quase não se move, o assunto acompanha a câmera, a moldura de primeiro plano se move mais que o assunto. É isso que faz um deslize parecer um lugar e não uma pintura.

**Enquadramento é câmera.** O mesmo cenário serve ao plano aberto, ao médio e ao close: a câmera se aproxima e desloca; nada é redesenhado. Por isso o close de uma transição por câmera é a continuação do aberto, e o espectador sente que está no mesmo lugar.

**Limites do movimento:**

- Um movimento por plano, além da aproximação lenta. No percurso, um movimento por estação.
- A câmera não cruza o eixo de uma ação: quem anda para a direita continua indo para a direita depois do corte.
- Nada importante sai do quadro por causa da câmera; recuo e deslize são calculados para o que precisa caber.
- Texto não se move com a câmera: etiqueta e número ficam fixos no quadro, presos ao que nomeiam por uma linha que se estica.

**Procedimento:**

1. Leia a partitura: há algo que cresce, se desloca, ou reage? Esse é o motivo do movimento.
2. Sem motivo, defina a aproximação lenta: de 3% a 6%, da composição aprovada para um pouco mais perto do ponto focal.
3. Com motivo, escolha o movimento pela tabela e o instante pela deixa.
4. Calcule o enquadramento final para o que precisa caber, com a margem segura.
5. Renderize o primeiro quadro, o último e dois do meio: o ponto focal continua sendo o ponto focal nos quatro?

## DEPENDÊNCIAS
- sincronia: fornece a deixa que motiva o movimento.
- entradas: fornece as curvas.

## LIMITES
- Movimento que troca a escala aprovada do plano (um médio que vira close) é decisão do usuário (`entrevista-movimento`).
- A transição entre dois planos pertence a `transicoes`, mesmo quando é feita pela câmera.

## EXEMPLO
> Plano aberto da lagoa, 3,3 s: aproximação lenta de 4% em direção à água-viva. Quando o peixe entra pela direita, a câmera não o segue: ele é que vem até o assunto. Na deixa "pulsa" nada muda na câmera; a transição para o close do sino, no plano seguinte, é que a leva até lá.
