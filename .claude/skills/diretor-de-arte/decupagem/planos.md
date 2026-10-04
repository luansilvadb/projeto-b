---
name: planos
description: Define como dividir a narração de um bloco em planos, com deixa, escala, paleta e entrada de cada um.
---

## PERGUNTA
Como dividir a cena em planos, um por oração?

## RESPOSTA

**Plano.** Uma composição: um enquadramento, um lugar, uma paleta e uma ação principal. Quando qualquer um deles muda, é outro plano. Plano não é o mesmo que corte: na referência o corte seco acontece 5 vezes por minuto, e a composição troca cerca de 13 vezes por minuto. A maior parte das trocas é contínua.

**Ritmo.** Uma composição nova a cada 4 ou 5 segundos, o que dá cerca de 12 palavras de narração: uma imagem por oração. Composição que passa de 8 segundos sem mudar é rara; nos trechos longos entre dois cortes, a imagem já era outra a cada quadro lido.

**Regras:**

1. **Uma imagem por oração.** Cada oração com verbo próprio ganha um plano. Orações curtas e paralelas (uma lista) dividem um plano em que cada item entra na sua palavra.
2. **Deixa.** Todo plano, menos o primeiro da cena, começa numa palavra da narração: a primeira da oração ou a que nomeia o que aparece. Escolha uma palavra que ocorra uma vez só no trecho, ou diga qual ocorrência.
3. **Escala.** Quão de perto se vê o assunto:

   | Escala | Mostra | Serve para | Na referência |
   |---|---|---|---|
   | aberto | o lugar inteiro, o assunto pequeno | situar, dar tamanho, respirar | 24% |
   | médio | a figura inteira ou da cintura para cima | a ação | 59% |
   | close | o rosto, a mão, o objeto | emoção e detalhe | 14% |
   | detalhe | um olho, uma textura enchendo o quadro | impacto, estranhamento | 2% |

4. **Alternância.** A mesma escala não se repete em mais de três planos seguidos. O bloco abre situando (aberto) ou intrigando (detalhe), e tem ao menos um close.
5. **Série.** Itens parecidos usam o mesmo molde de composição, trocando o assunto e o matiz do fundo. O molde igual deixa a diferença saltar.
6. **Plano que evolui.** Um processo contínuo fica num plano só, de até uns 15 segundos, desde que o estado da imagem mude a cada oração. Anote cada mudança na encenação.
7. **Entrada.** Como a imagem anterior vira esta:

   | Entrada | O que acontece | Quando usar |
   |---|---|---|
   | corte | troca seca | mudar de lugar, de assunto ou de bloco |
   | câmera | o enquadramento muda dentro do mesmo cenário: aproxima, recua, desliza | seguir a ação, ir ao detalhe, revelar o tamanho |
   | transformação | a imagem anterior vira a nova: o zoom atravessa um objeto, uma forma se converte em outra | ligar duas ideias, entrar em algo |
   | varredura | uma borda atravessa o quadro e revela a nova imagem | repintar a mesma cena em outro modo de cor; passar o tempo |

   Dentro de um bloco, prefira câmera, transformação e varredura. Guarde o corte para a mudança de lugar ou de ideia.
8. **Continuidade.** O que volta, volta igual: mesmo desenho, mesmo lado do quadro, mesma direção do olhar e do movimento.

**Registro de cada plano:**

- **deixa**: a palavra em que começa (o primeiro da cena não tem);
- **encenação**: uma ou duas frases dizendo quem faz o quê e onde, mais o texto de tela, se houver;
- **escala**;
- **paleta**: o modo de cor e o matiz do fundo;
- **entrada**.

**Procedimento:**

1. Parta das orações e da encenação de cada uma, vindas de `encenacao`.
2. Marque a deixa de cada plano.
3. Atribua escala e confira a alternância.
4. Atribua a paleta: o modo vem do lugar; o matiz do fundo troca a cada ideia.
5. Atribua a entrada.
6. Estime a duração de cada plano pelas palavras que ele cobre (cerca de 2,5 por segundo). Mais de 8 segundos: divida, ou descreva a mudança interna. Menos de 2: junte ao vizinho, salvo plano de reação ou de impacto.
7. Leia só a coluna da encenação, de cima a baixo, sem a narração. Ela conta a história?
8. Leve os planos ao usuário junto com o texto do bloco.

## DEPENDÊNCIAS
- encenacao: fornece o que acontece em cada oração.
- cor: fornece os modos e a regra de troca do fundo.
- elenco: fornece quem aparece e como se mantém.

## LIMITES
- A duração real de um plano vem da narração gravada; aqui ela é só estimada.
- A execução do movimento e das entradas não é decidida aqui.
- A narração não é alterada para caber num plano: o pedido volta ao `diretor-criativo`.

## EXEMPLO
> NARRAÇÃO: "Uma água-viva pulsa, de cabeça para baixo. Cinquenta e oito vezes por minuto. Quando a noite chega, ela desacelera. Trinta e nove."
>
> | Deixa | Encenação | Escala | Paleta | Entrada |
> |---|---|---|---|---|
> | (começo) | A lagoa rasa vista de longe, com raízes e luz entrando; a água-viva pousada no fundo, o peixe chegando perto. | aberto | lagoa de dia, ciano | corte |
> | "Cinquenta" | O sino de perto: a cada contração sai um anel na água, e os anéis são contados. Texto: "58 por minuto". | close | lagoa de dia, ciano | câmera |
> | "Quando" | A mesma lagoa escurece da superfície para o fundo; o peixe boceja; os anéis saem mais espaçados. Texto: "39 por minuto". | médio | lagoa de noite, índigo | varredura |
