## PERGUNTA
Como construir o fundo e a profundidade?

## RESPOSTA

**Um cenário serve quando:**

- **O plano tem o lugar de que precisa, e não mais.** A pergunta é quanto contexto espacial este plano pede: isolar o assunto, situá-lo num lugar, mostrar que são muitos, ou uma mistura disso. O fundo pode ser quase nada quando o lugar não acrescenta.
- **O assunto continua a coisa mais fácil de achar.** O fundo cede a ele em contraste, saturação e detalhe, e nada atrás dele disputa a silhueta: na savana do piloto, o morro atrás do assunto saiu a pedido do usuário. Atrás de um personagem o fundo fica quieto, porque é o vazio que deixa a figura falar: o mesmo piloto deixou o fundo de personagem só em degradê. Teste: com o assunto no lugar, ele ainda é o maior contraste do quadro?
- **Cada coisa do ambiente tem um serviço**: dizer onde se está, dar escala, contar algo da situação ou enquadrar. O fundo não conserta um assunto pequeno ou fraco: isso se resolve em `composicao`, antes de qualquer enfeite.
- **A profundidade se lê quando o plano depende dela.** O que está perto e o que está longe se distinguem sem esforço.
- **A luz é coerente.** Sombras, brilhos e bordas de luz concordam com o lugar de onde a luz vem. Um lugar pode ter mais de uma fonte (o sol e a vitrine, o que brilha por dentro), desde que o espectador não receba sinais contrários.
- **O que está no lugar está assentado nele.** No mundo, a figura pisa em algo ou tem a sombra de contato que a prende ao chão.
- **O lugar que volta é o mesmo lugar**, reconhecível mesmo em outra hora do dia ou em outro modo de cor.

**O que o repositório exige:**

- **Custo.** Desfoque pesa no render. A distância e a moldura podem recuar por cor, valor e degradê; quando o desfoque for a melhor saída, ele fica em camada que não muda de quadro para quadro.
- **Camadas separadas onde a câmera passa.** O que vai se mover em velocidades diferentes com a câmera (`movimento`) é desenhado em camadas distintas.
- **Quando o mesmo lugar volta, a geometria dele não é copiada.** Duas cópias divergem no primeiro ajuste; a mesma peça recebe o que muda (a hora, o modo de cor).

**Repertório.** São famílias de solução e possibilidades, sem ordem e sem cota.

Fundos:

| Família | Serve para | Como costuma ser |
|---|---|---|
| Liso | isolar: dado, esquema, personagem sozinho, piada rápida | um degradê, de duas paradas atrás de um personagem |
| Cenário | situar: abertura de bloco, lugar citado na fala, a vida de quem protagoniza | camadas a distâncias diferentes |
| Padrão | dizer "muitos": células, leitos, multidão | o mesmo elemento repetido até encher o quadro, com um diferente, que é o foco (a unidade repetida de `forma`) |

Camadas de que um cenário pode ser feito, do fundo para a frente. Ele usa as que servem ao plano:

- **céu ou fundo**: degradê, com a fonte de luz marcada por um brilho;
- **distância**: silhuetas grandes e simples, perto da cor do fundo, com pouca saturação e pouco contraste;
- **plano médio**: onde está o assunto, com contraste e saturação plenos;
- **chão**: dois ou três tons, com ondulação;
- **moldura de primeiro plano**: formas escuras, cortadas pela borda do quadro, em um ou dois cantos.

Sinais de profundidade. Um basta quando é claro; na dúvida, some outro:

- **sobreposição**: o que está na frente cobre parte do que está atrás;
- **tamanho**: o mesmo objeto, menor com a distância;
- **valor e saturação**: quanto mais longe, mais perto da cor do fundo;
- **nitidez**: o assunto nítido, a moldura e a distância mais moles;
- **detalhe**: padrão e textura só onde está o assunto.

Outras saídas:

| Problema | Uma saída | De onde vem |
|---|---|---|
| Dizer onde se está | poucos objetos de ambiente (uma janela, uma planta, uma placa), em dois ou três tons e com menos contraste que o assunto | não registrada |
| Dizer de onde a luz vem | o brilho no céu, feixes diagonais translúcidos, a borda de luz nos objetos do lado dela | não registrada |
| Que ponto de vista | frontal ou de perfil na maior parte; isométrica para um "mundo de esquema", com os objetos pousados num piso; de cima ou de baixo como variação | não registrada |
| O fundo liso do palco em que se compara e mede (`dado`), ou do mundo por dentro | trama: grade em perspectiva, manchas do mesmo matiz | um vídeo de espaço, com o alcance corrigido pelo piloto |
| Dar ênfase a um plano | vinheta, ou raios saindo do centro | não registrada |
| O lugar do plano de espetáculo (`planos`) | **o lugar toma a cor do assunto** (proposta): o cenário inteiro na família de cor de quem emite a luz, com nuvens e manchas em três ou quatro tons dela, do quase preto ao saturado, e as mais escuras em primeiro plano cobrindo parte do assunto | o mesmo vídeo de espaço |

**Medidas da referência** (evidência: situam e não reprovam por si). O fundo é liso em 61% do tempo, cenário construído em 33% e padrão em 5%. A área do quadro com desenho é de 48% nos planos de fundo liso, 72% nos de cenário e 81% nos de padrão, e fica entre 40% e 68% no vídeo inteiro; ocupação baixa é assunto de `composicao`.

## DEPENDÊNCIAS
- cor: fornece o degradê e as cores de cada modo.
- forma: fornece a construção dos objetos de ambiente e da unidade repetida.

## LIMITES
- Tamanho, posição e ocupação do assunto pertencem a `composicao`.
- O movimento de câmera entre as camadas não é decidido aqui.

## EXEMPLO
> Lagoa rasa, de dia, para a abertura.
> Céu: degradê de água, de ciano claro em cima a azul médio embaixo, com o brilho do sol no alto. Distância: recife em silhuetas claras e desfocadas; raízes de mangue descendo pelas laterais. Plano médio: a água-viva e o peixe. Chão: areia em três tons, ondulações e pedras, sombra de contato sob o sino. Moldura: capim-marinho escuro e desfocado nos cantos de baixo. Luz: feixes diagonais vindos do alto, à esquerda; borda clara no lado esquerdo do sino.
