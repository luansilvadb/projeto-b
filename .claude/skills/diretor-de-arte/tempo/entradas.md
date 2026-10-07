## PERGUNTA
O que faz um elemento aparecer, mudar ou sair de modo que se entenda de onde veio, o que mudou e em que estado terminou?

## RESPOSTA

**Princípio.** Entrar, mudar de estado e sair são caminhos entre dois estados do mesmo plano, e o caminho afirma algo sobre a coisa. O teste, para qualquer um deles: o espectador sabe dizer de onde ela veio, o que mudou nela e como ficou?

**O caminho serve quando:**

- **Lê-se a origem.** Surgir ali, chegar de fora, ser revelado e já estar no lugar são quatro afirmações diferentes. O que já estava quando a câmera chega não entra.
- **O fim diz como a coisa terminou**: assentou, bateu, continuou ou foi interrompida. O estado final é o do quadro aprovado, e fica à vista.
- **A técnica não dá à coisa uma matéria que ela não tem.** Defeito conhecido: o objeto sólido que entra só por opacidade parece fantasma. A opacidade é a entrada certa do que é assim por natureza (luz, atmosfera, lembrança, o que é revelado).
- **Quando é a mesma coisa mudando, ela continua reconhecível.** A pergunta que decide a técnica: o espectador precisa ver o caminho entre os dois estados, ou só perceber que o estado mudou? Se o caminho importa, a coisa vira a outra à vista. Se a mudança é ruptura, piada, ou um antes e depois a comparar, ela pode trocar numa batida, desde que se leia como intenção e não como erro.
- **A curva tem a natureza que a cena afirma** (peso, impacto, constância, elasticidade, queda, precisão de máquina) e não transforma a ação em outra: a curva errada muda quanto tempo a ação parece durar.
- **O tempo entre os elementos diz se são um ou vários** (`sincronia`). Juntos, são um acontecimento; em cascata, uma sequência, uma contagem, uma progressão ou o percurso do olho. Ser vários não é motivo para escalonar. O conjunto chega a tempo de a fala se apoiar nele.
- **Nada esconde o que ainda precisa ser visto**: a entrada não cobre, e a saída não leva.
- **A saída diz que a coisa deixou o estado atual**, sem roubar a atenção do que passa a importar.
- **O texto entra reforçando a função dele, sem atrasar a leitura** nem soltar-se do que nomeia (`texto`). O que precisa ser lido já não espera uma animação de letras.

**Repertório.** Parte-se do que acontece com a coisa; a técnica é uma saída possível, e os números são o que a referência costuma usar:

| O que acontece | Uma saída | Costuma | De onde vem |
|---|---|---|---|
| Um objeto surge no lugar | cresce de 0,6 do tamanho, passa a 1,06 e volta a 1, com a opacidade acompanhando só os primeiros quadros. Também servem: desacelerar sem ultrapassar, esticar e achatar, ou só aparecer, quando a cena pede secura | 0,25 a 0,35 s | referência; aceita no piloto do vídeo do sono, junto com "nada que tem forma entra só por opacidade" |
| Uma etiqueta, um selo ou um número aparece | estoura de 0,7 a 1,08 e assenta; a linha que a prende desenha-se do objeto para ela, junto, com a ponta primeiro | 0,25 s | referência |
| Uma figura chega de fora | entra pelo movimento que a ação pede, a partir de fora do quadro | o tempo de uma travessia | referência |
| Algo nasce de uma causa (partícula, bolha, faísca) | nasce pequeno onde a causa está e cresce enquanto se afasta | | referência |
| Um texto de cartela aparece | as letras em sequência, por máscara que abre ou por espaçamento largo que fecha. Também servem: escala, escrita à vista, opacidade, vir junto com o objeto | 0,35 s por linha | referência, onde texto quase não entra por opacidade |
| Um ambiente muda dentro do plano | acende, escurece, alaga ou se constrói parte a parte | 0,8 a 1,5 s | referência |
| A mesma coisa muda de estado | cor e tamanho interpolam; a forma passa por um estado intermediário que o olho reconhece (a contração do sino, a porta a meio) | 0,4 a 1,2 s; o quadro inteiro escurecer leva mais que um olho fechar | referência; no piloto do vídeo do sono, de andamento contido, nada troca de estado num quadro |
| Uma forma vira outra, e a passagem direta ficaria ambígua | uma silhueta clara de 4 quadros entre as duas | | referência; sem plano nosso aceito |
| Uma quantidade cresce | a barra cresce em cascata, com o número contando junto | | referência |
| Vários entram como sequência (os três selos, os cinco bichos, as moedas) | cascata, na ordem em que a fala ou o olho os percorre | 0,1 a 0,3 s entre si; numa fila que a fala acompanha, de 0,3 a 1 s | referência |
| Os dois lados de uma tela dividida | existem desde a divisão, apagados, e cada um acende na sua palavra | | piloto do vídeo do sono |
| Algo sai | o caminho inverso ao da entrada, mais rápido. Também servem: ser empurrado pelo que entra, ser coberto, atravessar a borda, virar outra coisa, ficar e perder importância, ou ir com a transição | 0,2 s | referência, onde pouca coisa sai antes de o plano acabar |

Os tempos situam e não reprovam. Pesam o tamanho do que muda, a complexidade, a importância, a energia da cena e a distância entre os dois estados. Quando o que ficou acumulado passa a poluir o quadro, quem julga é `composicao`.

**Curvas**, pela natureza do movimento. O nome de cada uma no código está em `etapas/animacao`:

| O movimento | A curva |
|---|---|
| Surge e assenta | com sobra: passa do ponto e volta |
| Chega e para (o peixe que freia, o puxão de uma vez) | chegada rápida, a que cumpre nove décimos do caminho no primeiro décimo do tempo |
| Tem peso (porta, braço, câmera, maré) | acelera e desacelera: a duração escrita é a duração vista |
| Tem velocidade constante por natureza (ponteiro, esteira, sombra que passa) | linear |
| Cai | acelera |
| Para seco, bate e volta, oscila ou atravessa sem assentar | a que termina como a coisa termina: a desaceleração é o fim mais comum, não o único |

Defeito conhecido: a chegada rápida numa porta, num braço ou numa câmera encurta a ação para um décimo da duração escrita, e o resto vira rastejo. Numa entrada, ela pôs o elemento no tamanho já no primeiro quadro, e a entrada leu como só opacidade.

## DEPENDÊNCIAS
- sincronia: fornece quando cada mudança acontece e a relação de tempo entre elas.
- composicao: fornece o estado final de cada elemento, no quadro aprovado.
- texto: fornece a função e o vínculo de cada texto.

## LIMITES
- Como a figura atua ao chegar (andar, nadar, voar) pertence a `acao`.
- A troca do quadro inteiro entre dois planos pertence a `transicoes`. Dentro do plano, um ambiente que acende, cresce ou é revelado é daqui.

## EXEMPLO
> O contador "58 pulsos por minuto". Origem: surge ali, sobre o sino que ele conta. O número cresce de 0,6 a 1,06 e volta, em 9 quadros, em "Cinquenta"; a etiqueta estoura 8 quadros depois, porque é uma segunda informação; a linha se desenha do sino até a etiqueta nos mesmos 8 quadros, com a ponta redonda primeiro, porque as duas são um acontecimento só. Estado final: o número assentado, preso ao sino.
