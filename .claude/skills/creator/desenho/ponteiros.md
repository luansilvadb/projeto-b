## PERGUNTA
Como redigir a referência que leva o agente a um material fora do contexto?

## RESPOSTA

Um **ponteiro de contexto** é uma referência mantida no contexto do agente que nomeia um material fora dele e codifica a condição para alcançá-lo. A `description` de um workflow é um ponteiro; a linha do índice de `SKILL.md` que nomeia uma unidade é o mesmo objeto; a linha do `CLAUDE.md` que cita um documento também.

A **redação** do ponteiro, e não o seu alvo, decide quando o agente alcança o material e com que confiabilidade. Um alvo indispensável atrás de um ponteiro mal redigido é um defeito de variância: afie a redação primeiro e traga o material para dentro do arquivo só se afiar falhar.

O ponteiro cumpre dois trabalhos: dizer o que o material é e listar os **ramos** que devem levar o agente até ele. Um ramo é um caso distinto que o documento trata, de modo que execuções diferentes tomam caminhos diferentes por ele.

Cada palavra de um ponteiro sempre carregado custa a cada turno, por isso ele merece poda mais dura que o corpo:

- **Palavra-guia na frente.** É no ponteiro que ela faz o trabalho de disparo.
- **Um gatilho por ramo.** Sinônimos que renomeiam um ramo são um ramo escrito duas vezes: funda-os e mantenha só os ramos de fato distintos.
- **Corte a identidade que o corpo já carrega.**

## DEPENDÊNCIAS
- cargas: a carga de contexto que o ponteiro gasta.
