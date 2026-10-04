---
name: transicoes
description: "Define como executar cada tipo de entrada entre planos: corte, câmera, transformação e varredura, com os tempos e os erros de cada um."
---

## PERGUNTA
Como executar cada tipo de entrada entre planos?

## RESPOSTA

**O que a referência faz.** O corte seco acontece cerca de 5 vezes por minuto; a imagem vira outra cerca de 13 vezes. A maior parte das trocas é contínua: a câmera atravessa um objeto e sai em outro lugar; uma borda diagonal cruza o quadro em 0,25 s e revela a mesma cena pintada de outro modo; a forma passa por uma silhueta clara de 4 quadros e sai transformada; metade da tela entra varrendo pela lateral, com outra cor de fundo e outro personagem, e o balão de fala só aparece depois que a tela assenta.

**Os quatro tipos**, que a decupagem já escolheu para cada plano:

| Entrada | Execução | Dura |
|---|---|---|
| Corte | o último quadro de um plano e o primeiro do seguinte, sem nada entre eles | 0 |
| Câmera | a câmera do plano anterior se move até o enquadramento do novo; o cenário é o mesmo | 0,5 a 1 s, com curva que desacelera |
| Transformação | a imagem anterior vira a nova: zoom que atravessa uma janela, um olho ou uma porta; forma que vira outra por uma silhueta intermediária; o quadro que encolhe para virar um painel | 0,4 a 0,8 s |
| Varredura | uma borda (diagonal, vertical ou um círculo que cresce) revela o plano novo por cima do antigo | 0,25 a 0,4 s |

**Regras do corte.** Cortar na deixa, nunca um pouco depois. Entre dois planos do mesmo cenário, o corte muda a escala ou o ângulo; dois planos quase iguais em corte são um pulo. Nenhum elemento fica no mesmo lugar com outro tamanho de um lado para o outro do corte, salvo intenção.

**Regras da câmera.** O enquadramento final é o quadro aprovado do plano novo. O movimento começa 0,3 s antes da deixa do plano novo e termina nela, ou começa na deixa e termina 0,5 s depois, nunca os dois. Durante o movimento nada entra; o que o plano novo acrescenta entra quando a câmera para.

**Regras da transformação.** O objeto que faz a ponte está nos dois planos: o que a câmera atravessa é o último do plano antigo e o primeiro do novo. A silhueta intermediária tem a cor do brilho do vídeo e dura 4 quadros. O quadro que encolhe para virar painel mantém a proporção.

**Regras da varredura.** A borda tem direção: entra do lado de onde vem a causa (a noite desce de cima; a lateral empurra de um lado). A mesma geometria pintada duas vezes (o dia e a noite da lagoa) é o caso mais limpo: a borda revela a outra pintura e nada mais muda. A varredura pode levar junto uma faixa de brilho na borda.

**O que entra depois.** Em todas as entradas contínuas, texto, etiqueta e balão entram depois que a imagem assenta, nunca durante.

**Procedimento:**

1. Para cada par de planos, leia a entrada escolhida na decupagem.
2. Defina o instante: a deixa do plano novo, com o começo da transição antes ou depois dela, conforme o tipo.
3. Defina a ponte: o que está nos dois lados (a câmera, o objeto atravessado, a borda).
4. Renderize uma tira cobrindo a transição a 10 quadros por segundo e confira: a ponte é contínua? Algum elemento pula de lugar? O texto esperou?

## DEPENDÊNCIAS
- sincronia: fornece a deixa de cada plano.
- movimento: fornece as curvas e os limites do movimento de câmera.
- entradas: fornece a entrada do que surge depois da transição.

## LIMITES
- Mudar o tipo de entrada escolhido na decupagem é decisão do usuário (`entrevista-movimento`).
- A fusão (um quadro que some sobre o outro) não é um tipo deste estilo; não a use no lugar de nenhum dos quatro.

## EXEMPLO
> Do close do sino de dia para a lagoa de noite, entrada por varredura: a borda desce do alto do quadro em 0,3 s, a partir de "Quando", revelando a mesma lagoa pintada de noite; os anéis e a água-viva estão nos dois lados, no mesmo lugar. O contador "39" entra 0,3 s depois de a borda sair pelo chão.
