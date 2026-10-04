---
name: acao
description: "Define como uma figura ou criatura executa uma ação legível: os três tempos, a mudança de pose e expressão, a reação e a deformação."
---

## PERGUNTA
Como uma figura ou criatura atua uma ação?

## RESPOSTA

**O que a referência faz.** Dentro de um plano de 3 a 6 s, a figura muda de pose e de expressão entre o começo, o meio e o fim: preparo, ação, desfecho. Num plano de 6 s de uma jogadora, a expressão trocou quatro vezes e o golpe teve recuo do braço (0,3 s), batida (1 a 2 quadros a 60 por segundo) e sobra (o braço passa do ponto e volta). Dois leões-marinhos esticam o pescoço antes de bater e encolhem depois. Uma pessoa anda, para, sente dor por 2,5 s com uma estrela vermelha piscando, fica 1,5 s quase parada, e só então a porta abre.

**Os três tempos.** Toda ação tem:

1. **Preparo** (0,2 a 0,4 s): o corpo vai na direção contrária. O braço recua, o corpo abaixa, os olhos fecham antes de arregalar.
2. **Ação** (2 a 4 quadros a 30 por segundo): o movimento em si, rápido. Nos quadros do meio o corpo pode se esticar na direção do movimento.
3. **Assentamento** (0,3 a 0,5 s): passa do ponto final e volta, com a sobra diminuindo. O que bate treme; o que para balança.

**Pose.** A ação é uma mudança de pose, não um deslocamento da mesma pose. Mãos, cabeça e tronco trocam de posição; a linha de ação muda de curva. Pose nova se lê em silhueta.

**Expressão.** Muda antes da ação (a intenção), no auge (o esforço) e depois (a reação ao resultado). Um plano de personagem tem de duas a quatro expressões. A troca de expressão é uma ação pequena: pálpebras, sobrancelhas e boca mudam em 3 a 5 quadros, não de uma vez.

**Reação.** Quem vê algo acontecer reage em dois tempos: congela por 2 a 4 quadros (o susto) e então muda de pose e expressão (0,3 s). A reação chega depois da causa, nunca junto.

**Criaturas.** O bicho atua com o que tem: o peixe com os olhos, a cauda e a posição do corpo; a água-viva com o ritmo do pulso e a abertura dos braços; o pássaro com a inclinação das asas. Um bicho que acorda abre o que estava recolhido; um que dorme recolhe.

**Deformação.** O corpo mole se estica na aceleração e se achata no impacto: de 5% a 12%, só nos 2 a 3 quadros do extremo, voltando logo. Objetos rígidos não deformam; tremem.

**Locomoção.** Andar: o corpo sobe e desce a cada passo (0,4 a 0,5 s por passo), os braços alternam; o fundo passa. Nadar: ondulação da cauda e avanço em pulsos. Voar: planar com inclinação, batida ocasional. A travessia de um quadro leva de 1 a 2 s.

**Procedimento:**

1. Para cada ação da partitura, escreva os três tempos com as poses de preparo, ação e assentamento.
2. Marque a expressão antes, durante e depois.
3. Se há quem veja a ação, marque a reação dois a quatro quadros após o auge.
4. Decida a deformação, se o corpo é mole.
5. Renderize uma tira a 10 quadros por segundo cobrindo a ação inteira e confira: dá para apontar o preparo, a ação e o assentamento? A pose nova se lê em silhueta?

## DEPENDÊNCIAS
- sincronia: fornece a deixa de cada ação e o tempo que ela tem.
- entradas: fornece as curvas de assentamento.

## LIMITES
- Ação que o texto não pede e que acrescenta sentido é decisão do usuário (`entrevista-movimento`).
- Não deslizar uma figura rígida pelo quadro como se fosse ação: isso é um ícone se movendo.
- A pose em si (como se desenha) pertence a `personagem`; aqui se decide a sequência de poses.

## EXEMPLO
> A lojista baixa a porta. Preparo: ela boceja (olhos fechando, boca abrindo, 0,8 s) e ergue o braço até a borda da porta (0,3 s). Ação: puxa; a porta desce em 1,3 s com o braço acompanhando até a altura do quadril. Assentamento: a porta bate no chão e treme 3 quadros; ela solta o braço, que balança e para. Expressão: sono, esforço breve, alívio.
