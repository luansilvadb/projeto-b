## PERGUNTA
Como arrumar o quadro para o olho achar o assunto?

## RESPOSTA

**Um quadro serve quando:**

- **O olho acha o que importa de primeira.** O **ponto focal** é o que o quadro manda ver antes de tudo (o rosto, a mão que age, o objeto de que a frase fala), e o resto cede a ele. Quando a relação entre dois é o próprio assunto (um confronto, uma comparação), o quadro pode ter dois polos, desde que se leia o que os liga.
- **O quadro tem uma ordem de leitura.** Depois do ponto focal, o olho sabe para onde ir. Linhas do cenário, o olhar dos personagens e o gesto das mãos conduzem, inclusive para fora do quadro, quando é lá que está o que vem (o que chega, a ameaça, o plano seguinte). O defeito é a direção que tira o olho do assunto sem querer.
- **O tamanho do assunto serve ao que o plano pede.** A escala vem de `planos`; aqui ela vira enquadramento. O erro que mais se repete é o assunto tímido: tudo em tamanho médio para pequeno, no centro, com sobra em volta. Se a escala pedida não funciona no quadro, o conflito volta a `planos`.
- **O vazio é composição, não sobra.** Espaço vazio isola, dá escala, deixa lugar para onde alguém olha ou anda, segura uma espera. Vazio que não faz nada disso é assunto que ficou pequeno.
- **A posição mostra a relação.** O que pertence junto parece junto, por proximidade ou alinhamento, e o que é separado tem um vazio claro entre si. A distância também fala, quando ela é a relação.
- **A figura se separa do fundo.** Como, em cor, é de `cor`; em lugar e profundidade, de `cenario`.
- **Nenhuma sobreposição cria outra coisa.** Um objeto parcialmente coberto por outro vira parte dele: um braço atrás de um cronômetro grande leu como cabo de lupa. Isolando o assunto, ele ainda é o que era? Se não, a saída pode ser afastar, trocar a ordem ou tirar o que está atrás.
- **O plano se sustenta em todos os estados.** O quadro final é a composição completa, e o inicial, antes de as coisas entrarem, não deixa um buraco evidente.
- **Texto e rosto ficam dentro da margem segura**, a de `safeArea` em `src/design/tokens.ts`.

**Teste do selo.** Veja o quadro em tons de cinza e pequeno, do tamanho de um selo: o assunto ainda salta? Ele acusa hierarquia fraca, silhueta confusa e contraste baixo. É um diagnóstico: a composição cuja hierarquia vem da cor, e que se lê no vídeo, não reprova por ele.

**Repertório.** São possibilidades, cada uma para um problema:

| Problema | Uma saída | De onde vem |
|---|---|---|
| Onde pôr o assunto que está sozinho | no centro, grande | um vídeo sobre gordura, adotado pelo usuário e conferido em 72 quadros de quatro vídeos: de 35 com um assunto só, 30 o traziam no centro |
| Dois no quadro (quem age e quem reage), ou um olhar que pede espaço | cada um num terço; sobra do lado para onde se olha ou se anda | referência |
| A figura não se solta do fundo | some um sinal: valor (claro sobre escuro, ou o contrário), matiz distante do fundo, o assunto nítido sobre fundo simples, a borda de luz no lado da fonte | não registrada |
| O que está por dentro não tem chão | as coisas flutuam, presas ao fundo por um halo de luz própria | o mesmo vídeo sobre gordura |
| Confronto, causa e reação, dentro e fora | tela dividida em diagonal | referência |
| Comparar dois casos | tela dividida na vertical | referência |
| Mostrar outra escala ou o interior de algo | janela ou lente, em círculo ou forma orgânica | referência |
| Pensamento, lembrança, previsão | quadro dentro do quadro: tela, bolha, painel | referência |
| Vários instantes ou reações de uma vez | painéis de quadrinhos | referência |
| Pôr o espectador na situação | ponto de vista, com as mãos em primeiro plano | referência |

**Medidas da referência** (evidência: situam e não reprovam por si). Quanto o assunto ocupa da altura do quadro, por escala: no aberto, de 10% a 25%, isolado por contraste; no médio, de 30% a 60%; no close, mais de 60%, com a cabeça ou o objeto podendo ser cortado pela borda; no detalhe, uma parte enche o quadro. Pouco mais da metade do quadro tem desenho, e a faixa é a do `pnpm critique`: ocupação baixa pede conferir se o vazio tem função ou se o assunto ficou tímido.

## DEPENDÊNCIAS
- planos: fornece a encenação e a escala de cada plano.
- personagem: fornece as poses e a direção do olhar.
- cenario: fornece o lugar em que o assunto se assenta.
- cor: fornece o contraste entre assunto e fundo.

## LIMITES
- O conteúdo e a forma do texto de tela pertencem a `texto`.
- Quando e como as coisas entram e saem do plano não é decidido aqui.

## EXEMPLO
> Plano: a água-viva pousada, o peixe olhando, médio.
> Fraco: a água-viva pequena no centro de baixo, o contador no alto à direita, dois terços do quadro vazios.
> Composto: a água-viva ocupa metade da altura, no terço esquerdo; o peixe no terço direito, um pouco acima, olhando para ela; os feixes de luz descem em diagonal até o sino; a etiqueta fica no vazio entre os dois, ligada ao sino por uma linha.
