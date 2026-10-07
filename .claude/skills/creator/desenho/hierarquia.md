## PERGUNTA
Em que degrau cada trecho deve ficar, e o que deve ficar ao lado dele?

## RESPOSTA

Um documento é feito de dois tipos de conteúdo: **passos** (as ações ordenadas que o agente executa) e **referência** (definições, regras e fatos consultados sob demanda). Os dois se misturam livremente: só passos (uma receita), só referência (as regras de uma revisão) ou ambos.

A decisão central é onde cada trecho fica na **hierarquia de informação**, uma escada ordenada pela urgência com que o agente precisa do material:

1. **Passo no arquivo** é o degrau principal: o que o agente faz, em ordem.
2. **Referência no arquivo** é consultada sob demanda. Muitas vezes é um conjunto plano de pares (todas as regras de uma revisão no mesmo degrau), o que é um bom arranjo.
3. **Referência divulgada** fica num arquivo separado, alcançado por um ponteiro de contexto e carregado só quando o ponteiro dispara. Vai de um arquivo irmão na mesma pasta até uma referência externa que mora em qualquer lugar e para a qual qualquer documento pode apontar.

Empurre de menos e o topo incha; empurre demais e você esconde o que o agente de fato precisa.

**Divulgação progressiva** é o movimento escada abaixo, para fora do arquivo principal e para trás de um ponteiro, que mantém o topo legível. Ela protege a hierarquia antes de economizar tokens. Num documento com passos, a referência que deveria estar divulgada os enterra e transforma a atenção a eles em cara ou coroa: é uma alavanca de variância, além de legibilidade.

**Colocalização** é a companheira dentro do arquivo: a escada decide *quão fundo* o trecho fica, a colocalização decide *o que fica ao lado dele*. Mantenha a definição, as regras e as ressalvas de um conceito sob o mesmo título, para que ler uma parte traga as vizinhas. O teste: o documento deve soar como documentação escrita para o agente. Material agrupado soa assim; material espalhado não. (Difere da duplicação, que repete um sentido em dois lugares: o espalhamento fragmenta um sentido por vários.)

**Inchaço** é o modo de falha deste degrau: um documento longo demais, mesmo com cada linha viva e única. A atenção se dilui pelo excesso, e cada linha a mais é uma linha a manter relevante. A cura é a escada e a `divisao`.

**No workflow:** `SKILL.md` ocupa os degraus 1 e 2 (os passos e os ponteiros do índice); cada unidade é referência divulgada, degrau 3. A ordem de injeção de um passo lista só o que todo ramo dele precisa; a unidade que responde a um problema entra pelo ponteiro, quando o problema aparece.

## DEPENDÊNCIAS
- ponteiros: o ponteiro de contexto e o ramo.
- divisao: o corte por ramo e por sequência.
