---
name: entradas
description: Define como um elemento entra na tela, muda de estado e sai, com as curvas, as durações e o escalonamento do estilo.
---

## PERGUNTA
Como um elemento entra, muda de estado e sai?

## RESPOSTA

**O que a referência faz.** Um elemento entra crescendo um pouco além do tamanho final e volta, em 0,25 a 0,35 s. Texto entra por máscara ou por espaçamento que fecha, não por opacidade. Vários elementos entram em fila, 0,3 a 1 s entre si. Um estado vira outro por transformação contínua, não por troca seca: a etiqueta estoura maior e assenta; a forma passa por uma silhueta clara de 4 quadros antes de virar outra; a barra cresce em cascata com o número contando junto.

**Entradas:**

| Elemento | Entra |
|---|---|
| Objeto ou figura que já estava no lugar quando a câmera chega | já está lá; não entra |
| Objeto que surge | cresce de 0,6 ao tamanho, passa de 1,06 e volta a 1, em 0,3 s; a opacidade acompanha só os primeiros quadros |
| Figura que chega | anda, nada ou voa para dentro do quadro, a partir de fora dele, no tempo de uma travessia |
| Etiqueta, selo ou número | estoura de 0,7 a 1,08 e assenta, em 0,25 s; a linha que a prende desenha-se do objeto para ela, junto |
| Texto de cartela | as letras entram em sequência, por máscara que abre ou por espaçamento largo que fecha, em 0,35 s por linha |
| Cenário inteiro (a cena nova) | pela transição do plano, nunca por entrada de elemento |
| Partícula, bolha, faísca | nasce pequena onde a causa está e cresce enquanto se afasta |

**Curvas.** Toda entrada e todo assentamento usam uma curva que desacelera ao chegar; a curva com sobra, para o que surge; a linear só para o que tem velocidade constante por natureza (ponteiro, esteira, sombra que passa); a que acelera, só para a queda. A curva de chegada rápida (a que cumpre nove décimos do caminho no primeiro décimo do tempo) serve a quem chega e para, como o peixe que freia ou o puxão de uma vez; usada numa porta, num braço ou numa câmera, ela encurta a ação para um décimo da duração escrita e o resto vira rastejo. O que tem peso acelera e desacelera: a duração da tabela é a duração vista.

**Mudança de estado.** O elemento não some e volta diferente: ele vira o outro à vista. Cor interpola; tamanho interpola; forma passa por um estado intermediário legível (a silhueta clara, a contração do sino, a porta a meio). A mudança dura de 0,4 a 1,2 s, conforme o tamanho do que muda; o quadro inteiro escurecer leva mais que um olho fechar.

**Escalonamento.** Elementos de uma mesma família (os três selos, os cinco bichos, as moedas) entram em sequência, de 0,1 a 0,3 s entre si, na ordem em que a fala ou o olho os percorre. O último entra antes de a fala passar ao próximo assunto.

**Saídas.** Pouca coisa sai; a maior parte fica até o plano acabar ou até a transição levar tudo. O que sai, sai pelo caminho inverso ao da entrada, mais rápido (0,2 s), ou é empurrado para fora pelo que entra.

**Procedimento:**

1. Para cada mudança da partitura, escolha a entrada pela tabela.
2. Defina o estado inicial (de onde vem, tamanho, opacidade) e o final, já conhecido do quadro aprovado.
3. Escolha a curva: com sobra para o que surge, de chegada rápida para o que chega e para, com peso para o que se desloca, linear só com motivo.
4. Escalone o que é família.
5. Renderize cinco quadros em volta da deixa e confira: o elemento começa a entrar antes da palavra e está inteiro 0,3 s depois dela?

## DEPENDÊNCIAS
- sincronia: fornece a deixa, a ordem e a duração de cada mudança.

## LIMITES
- Não usar opacidade como única entrada de nada que tenha forma: ela faz o elemento parecer fantasma.
- Não trocar estado em corte seco dentro de um plano.
- A execução das entradas entre planos pertence a `transicoes`.

## EXEMPLO
> O contador "58 pulsos por minuto": o número cresce de 0,6 a 1,06 e volta, em 9 quadros, a partir de 4 quadros antes de "Cinquenta"; a etiqueta estoura 8 quadros depois do número; a linha se desenha do sino até a etiqueta nos mesmos 8 quadros, com a ponta redonda aparecendo primeiro.
