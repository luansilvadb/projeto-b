---
name: pausa-viva
description: Define o movimento de quem não está agindo: ciclos de respiração, balanço, piscar e deriva que impedem qualquer quadro de congelar.
---

## PERGUNTA
O que se move quando nada acontece?

## RESPOSTA

**O que a referência faz.** Nada congela. Dos dez planos lidos que pareciam parados em três quadros, oito tinham de 5% a 10% do quadro em movimento o tempo todo. Numa pausa de reação de 1,5 s, a figura ainda respira e muda o peso de um pé para o outro; a planta balança; o primeiro plano desfocado desliza; o fundo radial gira devagar. O vídeo inteiro fica quase parado só 10% do tempo (de 4% a 28%).

**Ciclos.** O movimento de pausa é cíclico, pequeno e dessincronizado:

| Quem | Ciclo | Amplitude | Período |
|---|---|---|---|
| Pessoa em pé | respira: o tronco sobe e os ombros abrem; o peso troca de pé | 2% a 3% da altura | 3 a 5 s |
| Pessoa | pisca | pálpebra fecha e abre em 4 quadros | a cada 2 a 5 s, sorteado |
| Pessoa | o olhar passeia: a pupila muda de alvo | poucos pixels | a cada 1,5 a 3 s |
| Bicho que nada | o corpo ondula; as nadadeiras batem; o corpo sobe e desce | 3% a 6% da altura | 1,5 a 3 s |
| Bicho que voa | as asas batem ou o corpo plana com inclinação que varia | 4° a 8° | 1 a 2 s |
| Água-viva, planta, alga | pulsa ou balança na corrente; cada braço com a própria fase | 5% a 10% | 2 a 6 s |
| Cenário | partículas derivam; água ondula; luz pisca de leve; estrelas cintilam | 1 a 3 pixels | contínuo |
| Luz | halo respira; chama ou lâmpada tremula | 10% a 20% da opacidade | 1 a 4 s |
| Câmera | aproxima-se ou desliza, devagar | 3% a 6% por plano | o plano inteiro |

**Fase.** Vizinhos nunca se movem juntos: cada ciclo começa num ponto diferente, sorteado por semente fixa. Três bichos respirando em uníssono viram um mecanismo.

**Quem está dormindo** respira mais devagar e fundo (período de 4 a 6 s), com a cabeça pendendo um pouco mais a cada expiração, e solta "z" que sobem e crescem.

**Quem espera** (uma reação que vem na próxima deixa) faz uma coisa pequena e lenta: muda o peso, vira a cabeça, mexe a cauda.

**Procedimento:**

1. Liste o que está no plano e dê um ciclo a cada coisa, pela tabela.
2. Dê uma fase diferente a cada um, por semente.
3. Confira os buracos da partitura (mais de 1,5 s sem mudança): a pausa viva precisa estar lá.
4. Renderize uma tira de 2 s a 8 quadros por segundo e confira: há dois quadros iguais?

## DEPENDÊNCIAS
- sincronia: fornece os buracos da partitura que a pausa viva preenche.

## LIMITES
- Pausa viva não é ação: amplitude pequena, sem significado. Se a figura precisa dizer algo com o corpo, é `acao`.
- Não deixar o ciclo competir com a entrada: quando um elemento entra ao lado, o vizinho mantém o ciclo, sem reagir, a menos que a partitura peça.

## EXEMPLO
> O peixe parado olhando a água-viva: o corpo sobe e desce 5 px em 3,1 s; a cauda bate 6° em 0,9 s; a pupila segue um anel que passa a cada 1 s; a cada 3 s, uma piscada de 4 quadros. A água-viva pulsa no próprio ritmo, com os braços balançando em fases diferentes. O plâncton deriva. Nenhum quadro é igual ao anterior.
