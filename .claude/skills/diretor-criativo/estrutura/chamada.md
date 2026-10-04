---
name: chamada
description: "Chamada final: o pedido de curtida e inscrição depois do fechamento, com ponte na sensação que o vídeo deixou, um pedido, o motivo e o agradecimento."
---

## PERGUNTA
Como pedir a curtida e a inscrição sem desfazer o fechamento?

## RESPOSTA

**Função.** A chamada converte a vontade de ver mais, que o fechamento deixou, num gesto: curtir e se inscrever (decisão do usuário em 2026-10-04: todo vídeo do canal termina com ela). A base é a chamada dos dois vídeos de `fechamento`.

**Lugar.** Uma cena própria, a última do roteiro, depois da última frase do fechamento e de um silêncio (`holdMs`, cerca de um segundo). Na estrutura de `script.md` ela é o último bloco, "(chamada)".

**Quatro partes, nesta ordem:**

1. **Ponte**: a primeira oração ainda é do vídeo. Ela dá nome à sensação que o fechamento deixou e só então chega ao canal ("Se quiser continuar admirando este mundo...", "Se quiser continuar explorando as maravilhas do universo..."). É a única parte que muda de um vídeo para outro.
2. **Pedido**: curtir e se inscrever, numa frase, na voz do canal ("nós").
3. **Motivo**: o que quem assiste ganha com isso, que é o próximo vídeo; ou o que o gesto faz pelo canal, dito com simplicidade.
4. **Agradecimento**: a última coisa que se ouve.

**Tom.** O pedido é uma oferta: quem só assistiu já ajudou, e a chamada pode dizer isso.

**Tamanho.** De duas a quatro frases, até uns quinze segundos. É estimativa, a calibrar com o usuário no primeiro vídeo; a da referência tem 127 palavras porque apresenta produtos.

**Procedimento:**

1. Escreva a ponte com a sensação nomeada no fechamento aprovado. Pronto quando a oração não serviria a nenhum outro vídeo.
2. Escreva o pedido, o motivo e o agradecimento. Pronto quando cada parte tem a sua frase e a chamada cabe no tamanho.
3. Leve ao usuário: a redação do pedido, do motivo e do agradecimento, depois de aprovada, vale para os vídeos seguintes; só a ponte muda de vídeo para vídeo.

## DEPENDÊNCIAS
- ouvinte: fornece a regra de um pedido só: a chamada é o único gesto que o vídeo pede.
- fechamento: fornece a sensação e a última frase, de que a ponte parte.
- narracao: fornece o registro do narrador em off, que não diz "eu".
- formato: fornece o registro do bloco em `script.md`.

## LIMITES
- A chamada só promete um próximo vídeo que existe ou está decidido.
- Botões, setas e animação de inscrição pertencem à skill `diretor-de-arte`.
- Patrocínio, loja e apoio financeiro ficam fora até o usuário decidir que o canal os tem.
