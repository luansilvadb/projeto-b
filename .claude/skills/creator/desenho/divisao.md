## PERGUNTA
Quando vale dividir um documento em dois?

## RESPOSTA

Dividir um documento em dois gasta uma das duas cargas, então divida só quando o corte se paga.

**Por ramo.** Divida onde execuções diferentes tomam caminhos diferentes: o que só alguns ramos alcançam vai para um arquivo próprio atrás de um ponteiro, e o arquivo principal fica com o que todo ramo precisa. O corte se paga quando o ramo pesa mais que a linha do ponteiro que o alcança.

**Por sequência.** Divida uma série de passos onde os passos seguintes tentam o agente a apressar o passo à sua frente. Mantê-los fora de vista produz mais trabalho de campo na tarefa atual. Cuidado com o inverso: fundir sequências expõe a cada passo os que vêm depois e convida à conclusão prematura.

## DEPENDÊNCIAS
- cargas: as duas cargas que a divisão gasta.
- ponteiros: o ramo e o ponteiro de contexto que o alcança.
- criterios: conclusão prematura e trabalho de campo.
