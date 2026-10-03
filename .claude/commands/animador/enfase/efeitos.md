---
name: efeitos
description: Define os recursos que fazem um movimento ser sentido (rastro, linhas, estouro, luz, borrão) e quando cada um cabe.
---

## PERGUNTA
Que recursos fazem um movimento ser sentido, e quando usá-los?

## RESPOSTA

**O que a referência faz.** Um objeto arremessado deixa cópias translúcidas de si e linhas de arco; um impacto estoura em riscos curtos; uma dor pisca uma estrela vermelha atrás da cabeça por 2,5 s; um fundo de raios radiais gira devagar atrás de quem se esforça; um chicote de câmera borra o quadro inteiro; o que acende tem núcleo quase branco e halo que respira. Nenhum desses recursos aparece sozinho: cada um acompanha uma ação que já existe.

**Os recursos:**

| Recurso | O que é | Quando | Dura |
|---|---|---|---|
| Rastro | de 2 a 4 cópias do objeto, cada uma mais transparente, atrás dele no caminho | deslocamento rápido (mais que meio quadro em meio segundo) | só enquanto se move |
| Linhas de velocidade | de 3 a 6 traços finos paralelos ao caminho, atrás do objeto | o mesmo; e o chicote de câmera | 2 a 4 quadros |
| Arco de trajetória | linha pontilhada que o objeto deixa | arremesso, salto, queda | até o objeto pousar |
| Estouro | de 6 a 8 riscos curtos saindo de um ponto, que crescem e somem | impacto, colisão, estalo | 0,3 s |
| Aviso | uma forma de alerta (estrela, raio) que pisca atrás de quem sente | dor, susto, dúvida repetida | 1 a 2,5 s |
| Raios radiais | fundo de triângulos saindo do centro, girando devagar | esforço, revelação, momento grande | o plano inteiro |
| Borrão de movimento | o objeto (ou o quadro) esticado na direção do movimento | só nos 2 a 3 quadros mais rápidos | 2 a 3 quadros |
| Pulso de luz | o halo de algo aceso cresce e volta | nascer, acender, bater o coração, pulsar | 0,3 a 1 s por pulso |
| Silhueta clara | o objeto inteiro numa cor de brilho, chapado | o meio de uma transformação | 4 quadros |
| Deformação | esticar e achatar | o extremo de uma ação de corpo mole | 2 a 3 quadros |

**Dose.** Um recurso por ação, dois no máximo (rastro e linhas de velocidade juntos no mesmo arremesso). Um plano de 5 s tem no máximo dois momentos com recurso. Efeito em tudo é efeito em nada.

**Cor.** Os recursos usam as cores do vídeo: o estouro na cor do acento ou do objeto; o rastro na cor do objeto; a luz na cor de brilho do modo; o aviso na cor de alerta da ficha visual. Nunca branco puro sobre fundo claro nem preto.

**Escala.** O recurso tem o tamanho da ação: o estouro de uma moeda é pequeno; o de uma porta batendo, grande. Linhas de velocidade são finas (4 a 6 pixels num quadro de 1080) e curtas.

**Procedimento:**

1. Percorra a partitura e marque as ações rápidas, os impactos e o que acende.
2. Dê a cada um o recurso da tabela, respeitando a dose.
3. Defina cor e escala pela ficha visual e pelo tamanho da ação.
4. Renderize os quadros do recurso e confira: ele acompanha a ação, ou aparece sozinho?

## DEPENDÊNCIAS
- acao: fornece as ações que os recursos acompanham e os quadros do extremo.
- entradas: fornece as curvas com que o recurso cresce e some.

## LIMITES
- Nenhum recurso sem ação por baixo.
- Nenhum recurso para texto que entra: etiqueta e número não têm rastro nem estouro.
- Os desenhos dos recursos usam as cores da ficha visual; não há cor própria de efeito.

## EXEMPLO
> A moeda chega à porta fechada: arco pontilhado desde a borda do quadro, rastro de três cópias nos últimos 4 quadros antes do impacto, estouro de seis riscos na cor da moeda por 0,3 s no ponto da batida, e a moeda cai com rastro curto até a calçada, onde achata um quadro e assenta.
