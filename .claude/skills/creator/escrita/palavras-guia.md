---
name: palavras-guia
description: "Palavra-guia: como ancorar um comportamento numa palavra que o modelo já conhece e instruir pelo positivo em vez da proibição."
---

## PERGUNTA
Como ancorar um comportamento em poucas palavras, sem proibir?

## RESPOSTA

Uma **palavra-guia** é um conceito compacto que já vive no pré-treino do modelo e com o qual o agente pensa enquanto executa o documento (*lição*, *névoa de guerra*, *bala traçante*). Repetida como token, nunca como frase, ela acumula uma definição distribuída e ancora uma região inteira de comportamento com o mínimo de tokens, recrutando o que o modelo já sabe. Cunhar a sua funciona se você a definir com clareza, mas uma palavra inventada recruta nada: você paga em tokens de definição o que uma palavra do pré-treino dá de graça. Procure primeiro uma palavra que já existe.

Ela ancora duas vezes:

- **No corpo, a execução.** O agente recorre ao mesmo comportamento sempre que a palavra aparece; dentro de referência plana, ela concentra a atenção numa classe de coisa a procurar.
- **No ponteiro, a invocação.** Quando a mesma palavra vive nos seus prompts, nos seus documentos e no seu código, o agente liga essa linguagem compartilhada ao material e o alcança com mais confiabilidade.

Cace oportunidades de refatorar com palavras-guia: uma tríade soletrada em três lugares, um ponteiro que gasta uma frase para apontar uma ideia. Cada uma é um trecho pedindo para virar um token só. Você ganha duas vezes: menos tokens e um gancho mais afiado para o agente pendurar o raciocínio. Parta do princípio de que todo documento carrega repetições que uma palavra-guia aposenta, e vá achá-las.

**Negação** é o modo de falha ao lado desta alavanca: conduzir por proibição arrasta o comportamento proibido para o contexto e o deixa *mais* disponível. *Não pense num elefante*, e só resta o elefante: a negação é um modificador fraco que o conceito fortemente ativado atropela, e a proibição é lida pela metade como instrução de fazer. Instrua pelo **positivo**: declare o comportamento-alvo ("escreva comentários de uma linha") e o proibido nem é dito. Uma proibição só merece lugar como trava dura que você não consegue formular no positivo; mesmo assim, acompanhe-a do alvo positivo, para a atenção pousar no que fazer.

## DEPENDÊNCIAS
- ponteiros: o ponteiro de contexto, onde a palavra-guia ancora a invocação.

## EXEMPLO
> "rápido, determinístico, de baixo custo" → *enxuto* (um ciclo *enxuto*).
> "um ciclo em que você confia" → *vermelho*, que troca um portão difuso por um estado binário observável (o ciclo fica *vermelho* no defeito, ou não fica).
