## PERGUNTA
Quando e como a câmera se move dentro de um plano?

## RESPOSTA

**O movimento de câmera serve quando:**

- **Ele muda o que o espectador percebe.** A câmera se move porque algo cresce, se desloca ou reage, porque a atenção precisa ir a outro lugar ou porque o espaço precisa ser entendido. Quando nada disso acontece, a câmera parada é a solução: movimento não conserta um plano sem ação nem uma composição fraca.
- **O espectador não se perde no caminho.** Durante o movimento ele sabe o que acompanhar, inclusive quando a intenção é levar a atenção de uma coisa a outra.
- **A chegada serve ao novo estado da cena.** O enquadramento final é uma composição (`composicao`), com o que precisa caber dentro da margem segura.
- **A orientação se mantém**: quem está de que lado, e para onde cada coisa vai. Cruzar o eixo de uma ação só quando a travessia acontece à vista ou a desorientação é o que se quer.
- **Nada do que o plano ainda precisa se perde.** Algo sai do quadro quando sair é a ação, não por acidente da câmera.
- **A amplitude e a velocidade têm o tamanho da mudança.** A câmera não disputa a atenção com a ação que deveria ser vista, e movimentos não se somam sem uma intenção que os una.
- **O lugar continua o mesmo lugar.** Entre dois enquadramentos do mesmo espaço a geometria é a mesma, e quando a câmera atravessa um espaço com profundidade as camadas respondem a ela (`cenario`).
- **O texto continua preso ao que nomeia** durante o movimento.

**O que é decisão do usuário.** O movimento que muda o que o plano dá como foco ou importância (um médio que vira close e faz de um detalhe o assunto) vai a ele, por `entrevista-movimento`. Corrigir o enquadramento preservando a função do plano, não.

**Repertório.** Parte-se do que o movimento precisa fazer; a técnica é uma saída possível, e os números são o que a referência costuma usar:

| O que se quer | Uma saída | Costuma | De onde vem |
|---|---|---|---|
| Dar importância a uma reação ou a um detalhe | aproximação | 0,4 a 0,8 s; de 20% a 60% | referência |
| Revelar o contexto, ou acomodar o que cresce (a última barra de um gráfico, mais um item numa série) | recuo. Também resolvem: reorganizar a composição, ou um corte | 0,6 a 1,2 s; o que for preciso para caber | referência |
| Manter a relação com quem se desloca, ou passar de um item ao seguinte numa fila | deslize. Deixar a figura atravessar o quadro parado também comunica distância e direção | a velocidade de quem é seguido | referência |
| Uma mudança brusca de atenção ou de lugar | chicote, com borrão, que deixa claro onde se chegou | 0,2 a 0,3 s | referência |
| Levar o olho de um plano de profundidade a outro, sem mexer no quadro | troca de foco | 0,5 a 0,8 s | referência |
| Uma batida nova da fala, na mesma cena | corte para mais perto. É um corte, e pertence a `transicoes` | instantâneo | referência |
| O plano de fundo liso lê como imagem parada | deriva lenta, tão lenta que só se nota comparando o começo com o fim, terminando no quadro composto | de 3% a 6% ao longo do plano | referência; aceita pelo usuário no piloto do vídeo do sono |
| Várias partes de um mesmo espaço ou processo | percurso contínuo: a câmera segue um personagem-guia, assenta em cada estação pelo tempo da fala e segue quando ele segue; o enquadramento muda no caminho (perto no túnel, aberto na batalha), o recuo final revela onde tudo ficava, e o que encerra entra de fora do quadro, em outra escala | sem corte até essa entrada | um trecho de 27 s da referência |
| O mesmo lugar em aberto, médio e close | reenquadrar o mesmo cenário em vez de redesenhar: o close é a continuação do aberto, e o espectador sente que não saiu do lugar | | referência |
| Que o deslize pareça um lugar, e não uma pintura | parallax: o fundo quase não se move, o assunto acompanha a câmera, a moldura de primeiro plano se move mais que ele | | referência |
| Que curva dar | com peso: a câmera acelera e desacelera, sem começar nem parar de uma vez; o chicote é a exceção | | referência; adotada no vídeo do sono |
| Texto num plano em que a câmera se move | fixo no quadro, preso ao que nomeia por uma linha que se estica. Também servem: preso ao objeto, ou fora de cena durante o movimento | | não registrada |

## DEPENDÊNCIAS
- sincronia: fornece quando o movimento começa e em que deixa chega.
- composicao: fornece o quadro de chegada e a margem segura.
- cenario: fornece as camadas que respondem à câmera.
- entradas: fornece as curvas.

## LIMITES
- A transição entre dois planos pertence a `transicoes`, mesmo quando é feita pela câmera.

## EXEMPLO
> Plano aberto da lagoa, 3,3 s. Quando o peixe entra pela direita, a câmera não o segue: ele é que vem até o assunto. Na deixa "pulsa" nada muda na câmera; a transição para o close do sino, no plano seguinte, é que a leva até lá.
