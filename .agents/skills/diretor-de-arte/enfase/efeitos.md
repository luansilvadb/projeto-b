## PERGUNTA
Quando um recurso gráfico ajuda o espectador a sentir ou entender uma propriedade da ação que o movimento sozinho não entrega?

## RESPOSTA

**Princípio.** O efeito reforça uma propriedade que a ação já tem (velocidade, direção, caminho, contato, força, energia, um estado de quem sente) e que o movimento, no tempo que tem, não entrega com força bastante. Ele não substitui a atuação nem inventa ação. Dois testes, para qualquer recurso: tirando-o, a ação ainda se entende? E, tirando-o, alguma coisa piora? Se a ação some sem ele, o problema é de `acao`; se nada piora, ele sobra.

**O efeito serve quando:**

- **Sabe-se dizer que propriedade ele deixa mais clara.** A técnica sai da propriedade, e não do nome do acontecimento: nem toda coisa rápida pede rastro, nem todo impacto pede estouro, e o caminho que já se lê não precisa de arco.
- **Ele nasce da ação.** Aparece onde e quando a causa está, e vai embora com ela. O que persiste porque o fenômeno persiste (a chama, a luz que pisca, a dor que dura) é estado, e não ênfase: é de `pausa-viva` ou de `acao`.
- **Forma, direção, tamanho e duração são os do fenômeno.** O rastro fica no caminho, o estouro sai do ponto de contato, e a presença do recurso tem o tamanho da ação: o estouro de uma moeda é pequeno, o de uma porta batendo, grande.
- **Ele não muda o que a coisa parece ser.** Riscos conhecidos: a cópia translúcida faz fantasma, o halo faz o objeto emitir luz, o esticar faz borracha, a poeira põe partícula num ar que não tem, o borrão em excesso desmancha a forma.
- **Ele não faz entender algo falso**: um impacto onde não houve contato, uma direção que não é a do movimento, uma ação encoberta por ele.
- **Ele cede ao foco.** Em contraste, tamanho, duração e posição, o efeito não vira o assunto por acidente, nem puxa o olho para a periferia (`composicao`).
- **A ênfase funciona por contraste.** Quando todo acontecimento recebe o mesmo peso gráfico, nenhum parece especial: efeito em tudo é efeito em nada. Um plano pode não ter nenhum.
- **Recursos somados dizem coisas diferentes.** O rastro mostra o caminho, as linhas a velocidade, o estouro o contato: juntos no mesmo arremesso, cada um acrescenta uma leitura. Três que dizem "forte" do mesmo jeito só engrossam o ruído.
- **Ele pertence ao vídeo.** As cores saem da paleta e da ficha visual (`cor`), com contraste bastante sobre o fundo, sem criar um sentido de cor que o vídeo não tem.
- **No texto, só quando o texto participa do acontecimento.** Etiqueta e número que só chegam como informação não ganham rastro nem estouro: isso lhes dá uma ação física que não têm. O texto que é batido, atravessado ou estourado na cena pode ganhar.

**Repertório.** Parte-se da propriedade que não se lê; o recurso é uma saída possível, e os números são o que a referência costuma usar:

| O que não se lê sozinho | Uma saída | Costuma | De onde vem |
|---|---|---|---|
| O caminho e a direção de algo rápido demais para o olho seguir | rastro: cópias do objeto, cada uma mais transparente, atrás dele | de 2 a 4 cópias, só enquanto se move; em deslocamento de mais de meio quadro em meio segundo | referência: o objeto arremessado |
| A velocidade | linhas finas e curtas, paralelas ao caminho, atrás do objeto. Servem também ao chicote de câmera (`movimento`) | de 3 a 6 traços, de 4 a 6 pixels num quadro de 1080, por 2 a 4 quadros | referência |
| O caminho, quando ele importa para entender a ação (arremesso, salto, queda) | arco: a linha pontilhada que o objeto deixa | até o objeto pousar | referência |
| O instante e a força de um contato | estouro: riscos curtos que saem do ponto, crescem e somem. Também servem: o tremor, a mudança de pose, um corte | de 6 a 8 riscos, 0,3 s | referência |
| Um estado de quem sente (dor, susto, dúvida que insiste), quando o rosto e o corpo já o mostram e ele precisa durar | aviso: uma forma de alerta (estrela, raio) que pisca atrás de quem sente, lida como sinal e não como objeto da cena | 1 a 2,5 s | referência: a estrela vermelha atrás da cabeça, por 2,5 s |
| O quadro deve deixar de ser lugar e virar ênfase em torno do assunto (esforço, revelação) | raios radiais: fundo de triângulos saindo do centro, girando devagar. Vale perguntar se melhora a leitura ou só anuncia que "isto é importante" | enquanto o momento dura | referência |
| Posições separadas fariam o movimento parecer quebrado ou lento | borrão: o objeto, ou o quadro inteiro no chicote, esticado na direção do movimento. Falha quando encobre o que precisava ser visto | nos 2 a 3 quadros mais rápidos | referência |
| A emissão muda (algo nasce, acende, bate, descarrega) | pulso de luz: o halo cresce e volta, em quem emite luz. A fonte estável acende e fica | 0,3 a 1 s por pulso | referência: núcleo quase branco e halo |
| Uma forma vira outra, e a passagem direta ficaria ambígua | a silhueta clara: é de `entradas` e `transicoes` | | |
| O extremo de uma ação de corpo mole | esticar e achatar: é de `acao` | | |

**Medidas e heurísticas** (evidência e pontos de partida: situam e não reprovam por si). Na referência nenhum recurso aparece sozinho, cada um acompanha uma ação; costuma haver um por ação, dois quando se completam, e até dois momentos com recurso num plano de 5 s. Na cor, o ponto de partida é o estouro na cor do acento ou do objeto, o rastro na cor do objeto e a luz na cor de brilho do modo, sem branco puro sobre fundo claro nem preto. Na partitura do vídeo do sono, o plano em que os ratos morrem fica sem estouro e sem tremor, de propósito.

## DEPENDÊNCIAS
- acao: fornece a ação que o recurso reforça e os quadros do extremo dela.
- sincronia: fornece quando o recurso aparece em relação à causa.
- entradas: fornece como o recurso cresce e some.
- cor: fornece a paleta e o que cada cor significa no vídeo.
- composicao: fornece o foco a que o efeito cede.

## LIMITES
- Nenhum recurso conserta uma ação que não se lê: ela volta a `acao`.
- Recurso não é textura de pausa: o que continua sem acontecimento é de `pausa-viva`.

## EXEMPLO
> A moeda chega à porta fechada. O caminho importa (ela vem de fora do quadro, e é pequena): arco pontilhado desde a borda. A velocidade do fim não se lê em tão poucos quadros: rastro de três cópias nos últimos 4 quadros antes da batida. O contato é o acontecimento: estouro de seis riscos na cor da moeda, por 0,3 s, no ponto em que ela bate. Depois ela cai até a calçada, achata um quadro e assenta, sem mais nada: a queda já se lê.
