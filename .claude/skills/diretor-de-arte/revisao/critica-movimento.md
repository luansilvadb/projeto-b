## PERGUNTA
Como julgar o movimento, com medidas e quadros consecutivos?

## RESPOSTA

**Quando aplicar.** Sobre cada plano assim que ele se move, e sobre o trecho inteiro antes de levá-lo ao usuário.

**Postura.** A crítica olha como espectador que vê o vídeo uma vez. Julga o movimento em sequência, nunca um quadro só nem o código. Sobre o trecho inteiro, as medidas, as tiras e as passadas (passos 1 a 3 do procedimento, a partir do vídeo já renderizado) são de quem não animou; renderizar e refazer (passos 4 a 6), de quem dirige.

**Como ver.** Movimento não aparece num quadro. Dois instrumentos:

1. **Tira de quadros consecutivos**: um trecho de 2 a 6 s a 8 ou 10 quadros por segundo, lado a lado, com o tempo em cada quadro. É nela que se vê como uma ação começa, acontece e termina, se algo pulou de lugar, se um elemento entrou antes da palavra, se há quadros iguais.
2. **O vídeo**, para o que a tira não mostra: ritmo, peso, se o olho acompanha.

**Passadas, nesta ordem.** Um problema de nível superior invalida o polimento dos níveis abaixo.

1. **Sincronia**
   - Cada mudança tem causa à vista e chega com ela, sem parecer atrasada nem adiantada?
   - O que entra junto é um acontecimento só, e o que são dois se distingue?
   - O trecho sem novidade tem função, e a última informação teve tempo de ser percebida?
2. **Entradas e estados**
   - Entende-se se cada coisa surgiu, chegou de fora, foi revelada ou já estava? O estado final fica claro, e a técnica dá à coisa a matéria que ela tem?
   - Quando é a mesma coisa mudando, ela continua reconhecível? A troca numa batida lê como intenção ou como erro?
   - A curva tem a natureza do movimento? O que entra junto ou em cascata lê como um acontecimento ou como sequência, conforme a intenção?
   - Alguma entrada ou saída escondeu o que ainda precisava ser visto?
   - Sobra, máscara, opacidade, cascata, faixa de duração e saída inversa não reprovam por si: reprova o que não se entendeu.
3. **Pausa viva**
   - Há dois quadros iguais em qualquer tira?
   - Os ciclos estão fora de fase entre vizinhos?
4. **Atuação**
   - Entende-se o que a figura fez e com que intenção? O preparo, a execução e a consequência estão lá quando fazem falta?
   - O corpo participa da ação, ou a figura só desliza? A duração e o fim têm a força e o peso que a ação afirma?
   - Pose e expressão dizem a mesma coisa? A pose nova se lê em silhueta?
   - A reação parece causada pelo que foi percebido? A criatura atua com o corpo que tem, e a deformação a deixa reconhecível?
   - Falta de preparo, de sobra ou de assentamento, reação que começa junto, uma expressão só e medida fora da faixa não reprovam por si: reprova o que não se entendeu.
5. **Câmera e transições**
   - O movimento de câmera tem motivo, e o espectador sabe o que acompanhar até a chegada? A orientação se mantém, e nada do que o plano ainda precisa se perde?
   - Na transição, lê-se de onde se saiu, aonde se chegou e o que liga os dois? O que devia continuar ficou reconhecível, e o que rompeu, rompeu de propósito?
   - A ponte é a mesma do começo ao fim? Algo pulou sem querer de posição, escala, forma ou orientação?
   - A intensidade e a duração têm o tamanho da mudança? A chegada se lê, e o texto continua preso ao que nomeia?
   - O nome da técnica, a faixa de duração e a direção da borda não reprovam por si: reprova o que se perdeu na passagem.
6. **Ênfase**
   - Todo recurso acompanha uma ação? Há mais de dois por plano?
7. **Fidelidade à composição**
   - O movimento devolveu cada plano ao quadro aprovado? O que mudou foi confirmado?

**Medidas.** As de `critica-quadro` e mais três, que só valem com o vídeo em movimento: tempo com a tela quase parada (menos de 1% do quadro muda entre quadros vizinhos), tempo com mais de 10% do quadro em movimento e tempo até 40% do quadro ser outro. As faixas são as de `CRITERIA` em `src/critique/reference.ts`, impressas pelo `pnpm critique`.

As medidas são tiradas a 320 por 180 pixels, 10 quadros por segundo: enxergam movimento de câmera e de objetos grandes, e pausa viva só quando ela desloca bordas (respiração de 2% da altura, bobina de 9 px, luz que tremula um quarto, moldura que balança); degradê que se move e partícula de 3 px ficam abaixo delas. Um vídeo pode estar vivo e ainda ficar fora da faixa na segunda medida se nada grande se move; aí a questão é de atuação e de câmera motivada (recuo quando entra mais um item, aproximação para reação, deslize para seguir quem anda), não de pausa viva. As faixas vêm de vídeos inteiros: um trecho calmo (o gancho, uma explicação) pode ficar abaixo da segunda medida sem que o vídeo inteiro fique; nele, a medida orienta e as passadas decidem.

Além do total, um **mapa segundo a segundo** da fração de quadros quase parados e em movimento grande diz em que plano o problema está; é por ele que se corrige o plano, e não o vídeo inteiro.

**Medida não é qualidade.** Elas acusam o vídeo congelado. Um vídeo que treme o tempo todo passa em todas e cansa. As passadas mandam, e a medida fora da faixa tem a autoridade que `critica-quadro` lhe dá: diz onde olhar. Vá ao mapa segundo a segundo, às tiras e ao vídeo daquele trecho e classifique o defeito que se vê, pela passada dele; sem defeito, a medida vai ao relatório com o motivo.

**Classificação dos problemas:**

- **Bloqueante**: mudança sem causa, ou tão longe dela que a relação se perde; mudança de estado em que a coisa deixa de ser reconhecida, ou troca seca que lê como erro; quadros iguais numa tira; ação que não se entende, corpo que contradiz a ação, reação que parece vir antes da causa; ponte de transição quebrada. Refazer é obrigatório.
- **Relevante**: curva dura (uma ação que termina em um décimo do tempo escrito), sobra demais, ação que se entende mas não tem o peso ou a força que afirma, sequência que lê como um acontecimento só (ou o contrário), câmera que perde o foco, recurso solto. Refazer, salvo custo desproporcional; o que ficar, relatar com o mapa segundo a segundo.
- **Polimento**: ajuste fino de tempo, amplitude ou fase. Aplicar se não mexer em nada aprovado.

**Procedimento:**

1. Renderize o trecho e tire as medidas, com o mapa segundo a segundo.
2. Para cada plano, renderize uma tira cobrindo cada mudança de estado (da deixa menos 0,3 s até 0,8 s depois) e uma tira de 2 s de pausa; nas transições entre cenas, a tira atravessa o corte.
3. Faça as sete passadas. Registre cada problema com plano, instante, critério violado e classificação.
4. Refaça os bloqueantes e os relevantes que não alteram decisões aprovadas.
5. Leve ao usuário, como decisão, toda mudança em partitura, câmera ou transição aprovadas.
6. Renderize de novo e repita. Se uma rodada não resolver nenhum problema, pare e relate o que ficou em aberto.

**Entrega ao usuário.** O vídeo com a narração, as tiras das transições e das ações principais, a tabela de medidas, os problemas em aberto e o que só ele pode julgar: ritmo, peso e se o vídeo cansa.

## DEPENDÊNCIAS
- sincronia, entradas, pausa-viva, acao, movimento, transicoes, efeitos: fornecem os critérios de cada passada.
- critica-quadro: fornece as medidas de imagem e a autoridade de toda medida.

## LIMITES
- Não julgar por gosto: todo problema aponta um critério violado.
- Não julgar composição, desenho ou cor: pertencem a `critica-quadro`.

## EXEMPLO
> Plano 3, "a lagoa escurece", 1,2 s — critério: origem da entrada (o contador "39" aparece inteiro, sem chegada, no quadro em que a varredura termina, e lê como erro). Classificação: bloqueante. Ação: o contador surge e assenta depois de a borda sair pelo chão; não altera nada aprovado.
