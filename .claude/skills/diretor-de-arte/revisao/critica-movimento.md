## PERGUNTA
Como julgar o movimento, com medidas e quadros consecutivos?

## RESPOSTA

**Quando aplicar.** Sobre cada plano assim que ele se move, e sobre o trecho inteiro antes de levá-lo ao usuário.

**Postura.** A crítica olha como espectador que vê o vídeo uma vez. Julga o movimento em sequência, nunca um quadro só nem o código. Sobre o trecho inteiro, as medidas, as tiras e as passadas (passos 1 a 3 do procedimento, a partir do vídeo já renderizado) são de quem não animou; renderizar e refazer (passos 4 a 6), de quem dirige.

**Como ver.** Movimento não aparece num quadro. Dois instrumentos:

1. **Tira de quadros consecutivos**: um trecho de 2 a 6 s a 8 ou 10 quadros por segundo, lado a lado, com o tempo em cada quadro. É nela que se vê preparo, ação e assentamento, se algo pulou de lugar, se um elemento entrou antes da palavra, se há quadros iguais.
2. **O vídeo**, para o que a tira não mostra: ritmo, peso, se o olho acompanha.

**Passadas, nesta ordem.** Um problema de nível superior invalida o polimento dos níveis abaixo.

1. **Sincronia**
   - Cada mudança tem causa à vista e chega com ela, sem parecer atrasada nem adiantada?
   - O que entra junto é um acontecimento só, e o que são dois se distingue?
   - O trecho sem novidade tem função, e a última informação teve tempo de ser percebida?
2. **Entradas e estados**
   - O que surge tem sobra e assenta? Texto entra por máscara ou espaçamento?
   - Algum estado troca em corte seco dentro do plano?
   - A família entra escalonada?
3. **Pausa viva**
   - Há dois quadros iguais em qualquer tira?
   - Os ciclos estão fora de fase entre vizinhos?
4. **Atuação**
   - Cada ação tem preparo, ação e assentamento?
   - A pose nova se lê em silhueta? A expressão mudou antes, durante e depois?
   - Quem vê a ação reage, e reage depois dela?
5. **Câmera e transições**
   - O movimento de câmera tem motivo, e o espectador sabe o que acompanhar até a chegada? A orientação se mantém, e nada do que o plano ainda precisa se perde?
   - A ponte da transição é contínua? Algo pulou de lugar entre os planos?
   - O texto esperou a imagem assentar?
6. **Ênfase**
   - Todo recurso acompanha uma ação? Há mais de dois por plano?
7. **Fidelidade à composição**
   - O movimento devolveu cada plano ao quadro aprovado? O que mudou foi confirmado?

**Medidas.** As de `critica-quadro` e mais três, que só valem com o vídeo em movimento: tempo com a tela quase parada (menos de 1% do quadro muda entre quadros vizinhos), tempo com mais de 10% do quadro em movimento e tempo até 40% do quadro ser outro. As faixas são as de `CRITERIA` em `src/critique/reference.ts`, impressas pelo `pnpm critique`.

As medidas são tiradas a 320 por 180 pixels, 10 quadros por segundo: enxergam movimento de câmera e de objetos grandes, e pausa viva só quando ela desloca bordas (respiração de 2% da altura, bobina de 9 px, luz que tremula um quarto, moldura que balança); degradê que se move e partícula de 3 px ficam abaixo delas. Um vídeo pode estar vivo e ainda ficar fora da faixa na segunda medida se nada grande se move; aí a questão é de atuação e de câmera motivada (recuo quando entra mais um item, aproximação para reação, deslize para seguir quem anda), não de pausa viva. As faixas vêm de vídeos inteiros: um trecho calmo (o gancho, uma explicação) pode ficar abaixo da segunda medida sem que o vídeo inteiro fique; nele, a medida orienta e as passadas decidem.

Além do total, um **mapa segundo a segundo** da fração de quadros quase parados e em movimento grande diz em que plano o problema está; é por ele que se corrige o plano, e não o vídeo inteiro.

**Medida não é qualidade.** Elas acusam o vídeo congelado. Um vídeo que treme o tempo todo passa em todas e cansa. As passadas mandam, e a medida fora da faixa tem a autoridade que `critica-quadro` lhe dá: diz onde olhar. Vá ao mapa segundo a segundo, às tiras e ao vídeo daquele trecho e classifique o defeito que se vê, pela passada dele; sem defeito, a medida vai ao relatório com o motivo.

**Classificação dos problemas:**

- **Bloqueante**: mudança sem causa, ou tão longe dela que a relação se perde; estado trocando em corte; quadros iguais numa tira; ação sem os três tempos; ponte de transição quebrada. Refazer é obrigatório.
- **Relevante**: curva dura (uma ação que termina em um décimo do tempo escrito), sobra demais, família em uníssono, câmera que perde o foco, recurso solto. Refazer, salvo custo desproporcional; o que ficar, relatar com o mapa segundo a segundo.
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
> Plano 3, "a lagoa escurece", 1,2 s — critério: estado em corte (o contador "39" aparece inteiro no quadro em que a varredura termina). Classificação: bloqueante. Ação: o contador entra com sobra 0,3 s depois de a borda sair pelo chão; não altera nada aprovado.
