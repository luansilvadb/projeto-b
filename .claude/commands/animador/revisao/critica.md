---
name: critica
description: Define como julgar o movimento de um vídeo: as passadas, a leitura de tiras de quadros consecutivos, as medidas e o procedimento de refazer.
---

## PERGUNTA
Como julgar o movimento, com medidas e quadros consecutivos?

## RESPOSTA

**Quando aplicar.** Sobre cada plano assim que ele se move, e sobre o trecho inteiro antes de levá-lo ao usuário.

**Postura.** A crítica olha como espectador que vê o vídeo uma vez. Julga o movimento em sequência, nunca um quadro só nem o código.

**Como ver.** Movimento não aparece num quadro. Dois instrumentos:

1. **Tira de quadros consecutivos**: um trecho de 2 a 6 s a 8 ou 10 quadros por segundo, lado a lado, com o tempo em cada quadro. É nela que se vê preparo, ação e assentamento, se algo pulou de lugar, se um elemento entrou antes da palavra, se há quadros iguais.
2. **O vídeo**, para o que a tira não mostra: ritmo, peso, se o olho acompanha.

**Passadas, nesta ordem.** Um problema de nível superior invalida o polimento dos níveis abaixo.

1. **Sincronia**
   - Cada mudança acontece na palavra que a causa, um pouco antes dela?
   - Alguma coisa entra sem causa, ou duas coisas entram juntas sem ser a mesma ação?
   - Há buraco de mais de 1,5 s sem mudança nem pausa viva?
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
   - O ponto focal continua sendo o ponto focal durante o movimento?
   - A ponte da transição é contínua? Algo pulou de lugar entre os planos?
   - O texto esperou a imagem assentar?
6. **Ênfase**
   - Todo recurso acompanha uma ação? Há mais de dois por plano?
7. **Fidelidade à composição**
   - O movimento devolveu cada plano ao quadro aprovado? O que mudou foi confirmado?

**Medidas.** Tiradas do vídeo renderizado, com as mesmas do `diretor-de-arte` e mais estas, que só valem com o vídeo em movimento:

| Medida | Faixa | Mediana |
|---|---|---|
| Tempo com a tela quase parada (menos de 1% do quadro muda entre quadros vizinhos) | 3% a 29% | 10% |
| Tempo com mais de 10% do quadro em movimento | 29% a 51% | 43% |
| Tempo até 40% do quadro ser outro | 1,5 a 4,0 s | 2,0 s |

As medidas são tiradas a 320 por 180 pixels, 10 quadros por segundo: enxergam movimento de câmera e de objetos grandes, e pausa viva só quando ela desloca bordas (respiração de 2% da altura, bobina de 9 px, luz que tremula um quarto, moldura que balança); degradê que se move e partícula de 3 px ficam abaixo delas. Um vídeo pode estar vivo e ainda reprovar na segunda medida se nada grande se move; aí a questão é de atuação e de câmera motivada (recuo quando entra mais um item, aproximação para reação, deslize para seguir quem anda), não de pausa viva. As faixas vêm de vídeos inteiros: um trecho calmo (o gancho, uma explicação) pode ficar abaixo da segunda medida sem que o vídeo inteiro fique; nele, a medida orienta e as passadas decidem.

Além do total, um **mapa segundo a segundo** da fração de quadros quase parados e em movimento grande diz em que plano o problema está; é por ele que se corrige o plano, e não o vídeo inteiro.

**Medida não é qualidade.** Elas acusam o vídeo congelado. Um vídeo que treme o tempo todo passa em todas e cansa. As passadas mandam.

**Classificação dos problemas:**

- **Bloqueante**: mudança fora da deixa; estado trocando em corte; quadros iguais numa tira; ação sem os três tempos; ponte de transição quebrada; medida fora da faixa no vídeo inteiro. Refazer é obrigatório.
- **Relevante**: curva dura (uma ação que termina em um décimo do tempo escrito), sobra demais, família em uníssono, câmera que perde o foco, recurso solto, medida fora da faixa num trecho. Refazer, salvo custo desproporcional; o que ficar, relatar com o mapa segundo a segundo.
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

## LIMITES
- Não julgar por gosto: todo problema aponta um critério violado.
- Não julgar composição, desenho ou cor: pertencem ao `diretor-de-arte`.
- Não alterar decisões aprovadas sem confirmação.

## EXEMPLO
> Plano 3, "a lagoa escurece", 1,2 s — critério: estado em corte (o contador "39" aparece inteiro no quadro em que a varredura termina). Classificação: bloqueante. Ação: o contador entra com sobra 0,3 s depois de a borda sair pelo chão; não altera nada aprovado.
