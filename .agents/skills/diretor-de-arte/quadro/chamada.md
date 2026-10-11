## PERGUNTA
Como a chamada do canal aparece na tela, com botões, setas e a animação de inscrição, sem competir com o pedido nem com o fim do vídeo?

## RESPOSTA

**Escopo.** No modo `canal`, sempre: o texto, a ponte, o motivo e o tamanho do pedido são do `diretor-criativo` (`estrutura/chamada`); aqui é a imagem que acompanha o pedido. No modo `jam`, a exceção é uma só: um pedido final que o usuário pede explicitamente no curta. O texto e a função desse pedido são decisão do `diretor-criativo` (`estrutura/narrativa`); a arte o realiza com os elementos daqui só depois disso, sem trazer a ponte, o motivo ou o pedido do canal. Nada entra no curta por iniciativa da arte, nem como repertório. Uma pendência real sobre texto ou função não reabre a existência do pedido: ele já foi decidido pelo usuário, e a arte espera a fixação antes de desenhar.

**Entrada.** A última cena do roteiro, com o texto da chamada já fixado em `script.json` (a cena anterior leva o `holdMs` que deixa o fim assentar). Sem texto fixado, peça-o ao `diretor-criativo`: não desenhe botão e seta sobre uma frase que ainda pode mudar. A palavra de deixa de cada parte do pedido vem do roteiro (`cue`).

**Saída.** Os `shots` da cena da chamada em `script.json`, com o que cada elemento faz; a partitura de cada elemento em `score.md`, na seção da cena, com a deixa e o instante; `art.md` só se a linguagem da chamada for decisão nova. Os elementos são desenhados com `forma` e as cores da paleta do vídeo, sem cor solta.

**O que precisa funcionar:**

- **O pedido vem depois do fim.** A chamada entra quando o fechamento já foi lido: a última imagem do vídeo fica assentada antes de o botão aparecer, e a cena anterior não sai da tela antes do `holdMs` terminar.
- **Cada elemento representa um pedido que o texto fixa.** Uma seta ou um botão apontando para um pedido, com o texto curto em etiqueta (`quadro/texto`) ao lado. Os pedidos que o texto fixa podem ser representados, cada um com a sua função e a sua deixa: com "curta e se inscreva", o pedido de curtir e o de se inscrever já estão autorizados pelo texto, e a arte pode representar um ou os dois. A arte não acrescenta pedido que o texto não fixa, nem como iniciativa própria; se a imagem pede um pedido a mais, a frase vai ao `diretor-criativo`. Dois apelos visuais disputando a atenção (um botão que pisca junto de uma seta que aponta para outra coisa) são defeito.
- **A deixa é a palavra do pedido.** Botão e seta aparecem quando a narração diz o que apontam, pela palavra de deixa, e não antes dela. A antecipação de quadros que o projeto usa (`tempo/sincronia`) vale aqui também.
- **A inscrição se anima uma vez.** Entra, confirma e fica. Movimento contínuo, pulsação ou tremor que dura a cena inteira disputam com a fala e viram publicidade.
- **Sem urgência nem linguagem de anúncio.** Nada de contagem regressiva, alerta vermelho, selo de promoção ou flash. A chamada usa o mesmo mundo visual do vídeo e não se separa dele como se fosse outro produto.
- **Repete o pedido ou não diz nada.** O texto na tela só repete o que a narração pede. Não acrescenta instrução nova, porque a chamada tem um pedido só (`ouvinte`).
- **Legível no tamanho final.** Botão, seta e texto estão dentro de `shape.safeArea` e nos tamanhos de `typography.size`.

**Ida e volta.**

- **Recebe do `diretor-criativo`**: o texto fixado, as palavras de deixa e o `holdMs` da cena anterior, que é do roteiro.
- **Devolve ao `diretor-criativo`** quando a imagem pede outra frase: o botão só funciona se a narração disser "inscreva-se" e não "assine". Uma seta que aponta para uma palavra que a voz diz tarde demais é, antes de tudo, uma entrada mal posta: a arte realinha a entrada dela para a deixa, com a antecipação que `tempo/sincronia` dá (os quadros antes da palavra e, para um aviso, cerca de 0,3 s antes dela), sem tocar no texto. Devolve quando esse alinhamento exigiria mudar a frase, a ordem das palavras, o sentido narrativo ou o `holdMs`, que são do roteiro. A oração e o que a imagem não consegue mostrar vão com o pedido.
- **Leva ao usuário** só o que muda o pedido: quantos pedidos há, a intensidade, ou algo além de curtir e se inscrever. Isso é decisão do `diretor-criativo` (`estrutura/chamada`, "Quando volta ao usuário"), e a arte não a decide.
- **Entrega ao `diretor-producao`** a cena renderizada, com `pnpm scene <vídeo> <id>`, quando o vídeo inteiro pede a chamada pronta.

**Qualidade verificável:**

- o quadro com o pedido completo é aberto e lido pelo `critico-de-quadro`, ou pela revisão do quadro, com a pergunta "o que se pede e para onde se aponta?";
- o último quadro do fechamento, antes da chamada, é lido sem nenhum elemento de pedido sobreposto;
- a palavra de deixa de cada elemento está nos `shots` e na partitura (`score.md`). O instante da produção sai em milissegundos só de tempos medidos da narração; sem eles, fica declarado como "a medir" e é conferido no render. Tempos simulados ou declarados à mão não são medidos: podem compor uma partitura de **maquete**, identificada como tal no `score.md`, para experimentar disposição e movimento. A maquete não valida a sincronia da produção, não se confunde com os tempos medidos da narração atual e não torna a partitura de produção pronta. Quando houver narração medida, os tempos da maquete são substituídos por ela e a partitura é conferida de novo. Nada disso prova sincronia: ela só se confere no render.

## DEPENDÊNCIAS
- `diretor-criativo/estrutura/chamada.md`: fornece o pedido, sua posição no fim do vídeo e o `holdMs`.
- `quadro/texto.md`: que texto entra na imagem e a que se prende.
- `tempo/sincronia.md`: quando cada elemento acontece em relação à fala.
- `enfase/efeitos.md`: a ênfase da inscrição, quando a animação de uma vez não basta.

## LIMITES
- Texto, ponte, motivo e pedido são do `diretor-criativo`; o áudio da chamada, da `diretor-producao` e do `diretor-de-som`.
- No modo `jam`, só a realização visual de um pedido final explícito já fixado pelo `diretor-criativo` (ver Escopo); nenhum outro elemento de chamada entra no curta.
- Patrocínio, loja e apoio financeiro ficam fora até o usuário decidir que o canal os tem (`diretor-criativo/estrutura/chamada.md`).

## EXEMPLO
> Chamada de 9 s, modo `canal`. O fim é a lagoa acordando, e o `holdMs` de 1,5 s deixa a imagem assentar. Então a narração diz "se inscreva": a seta entra nessa palavra, aponta para um botão de inscrição que se confirma uma vez e fica. Nada pisca. Se a voz disser "assine", a arte devolve a frase ao `diretor-criativo`, porque a seta não aponta para a palavra certa.
