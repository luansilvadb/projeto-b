---
name: cor
description: Define as paletas do vídeo, o significado de cada uma e as regras de cor dentro de um quadro e de um plano para o outro.
---

## PERGUNTA
Que paletas o vídeo usa, e quando troca de uma para outra?

## RESPOSTA

**O que a referência faz.** Um quadro tem em média 4,4 cores, e a cor dominante ocupa cerca de metade dele. O fundo é claro em 42% do tempo, médio em 16% e escuro em 39%. A cor dominante troca 11 vezes por minuto. No vídeo inteiro, a família de cor mais comum fica com 26% das cores vivas: nenhum vídeo é de uma cor só. As faixas dessas três medidas são as que o `pnpm critique` confere.

**Paleta de plano.** Quatro papéis:

| Papel | O que é |
|---|---|
| Fundo | uma cor e suas vizinhas em degradê; a maior área do quadro |
| Assunto | uma ou duas cores que se destacam do fundo em valor e em matiz |
| Acento | uma cor pequena e saturada, no ponto para onde o olho deve ir |
| Neutros | claro e escuro para olhos, texto e brilho |

**Modo.** Uma paleta com significado: diz ao espectador onde ele está. A referência alterna dois grandes modos:

- **Mundo**: o que se vê de fora. Fundo claro, pastel saturado, luz do dia.
- **Por dentro**: o mecanismo, o microscópico, o pensamento. Fundo escuro em índigo ou roxo, formas em cor de néon, coisas que brilham.

Cada vídeo define de dois a quatro modos. O espectador os aprende no primeiro minuto, e o modo só troca quando o lugar ou o sentido troca.

**Regras:**

1. **Fundo escuro tem cor.** Azul profundo, índigo ou roxo: escuro, mas com o matiz visível. Na referência, 69% dos fundos escuros são azuis ou azul-violeta; preto e cinza aparecem quase só num vídeo sobre o espaço.
2. **Fundo claro é pastel saturado**: ciano, amarelo quente, menta, rosa. Branco puro quase não aparece.
3. **De quatro a cinco cores por quadro**: o fundo, duas ou três no assunto, um acento. Menos de três é monocromático; mais de seis vira ruído.
4. **O assunto se separa do fundo** por valor (claro sobre escuro ou o contrário) e por matiz distante. O maior contraste do quadro fica no ponto focal.
5. **A cor do fundo troca a cada ideia.** Dentro do mesmo modo, planos vizinhos mudam o matiz do fundo; a troca de cor avisa "ponto novo" como um corte avisaria.
6. **Sombra e luz têm matiz.** A sombra é o tom base mais escuro e puxado para o frio (azul, roxo); a luz, mais clara e puxada para o quente. Nunca preto ou branco por cima em transparência.
7. **Cada personagem tem as suas cores** e as mantém dentro de um modo. Quando o modo troca, ele é repintado na paleta do modo (versão néon, silhueta de uma cor).
8. **Cor com significado não muda.** A cor ligada a um conceito (o perigo, um dos lados de uma disputa) vale para o vídeo inteiro. Quando o conceito cresce na fala, a cor dele cresce em área: começa como acento e chega a ser o fundo.
9. **Tema grave** mantém a saturação. O peso vem do fundo escuro, da silhueta e do vermelho, nunca de cor lavada.
10. **Chão e fundo não dividem o matiz.** Onde há chão (areia, calçada, piso), ele fica numa família de cor diferente da do fundo atrás dele. Com os dois no mesmo matiz o quadro vira uma cor só, por mais colorido que seja o assunto: foi o caso da lagoa de noite com água e areia índigo, que caiu a 2,1 cores por quadro.

**Procedimento:**

1. Liste os lugares do roteiro (o mundo, por dentro, a analogia, o dado) e dê um modo a cada um.
2. Para cada modo, escolha o matiz do fundo e derive o resto: degradê do fundo, cores do assunto, acento, cor de texto e de etiqueta.
3. Percorra os blocos e atribua a cada um o modo e o matiz do fundo. Blocos vizinhos precisam diferir.
4. Confira o conjunto: nenhuma família de cor domina o vídeo, e claro e escuro se alternam.
5. Renderize uma faixa com os fundos na ordem do vídeo e o protagonista pintado em cada modo.
6. Leve a faixa ao usuário, como decisão, e registre as paletas na ficha visual.

**Onde as cores moram.** Toda cor usada num desenho vem das paletas registradas. Cor escrita solta num desenho quebra a constância no plano seguinte.

## DEPENDÊNCIAS
- elenco: fornece os personagens, cujas cores próprias precisam funcionar em todos os modos.
- entrevista-imagem: define que as paletas são decisão do usuário.

## LIMITES
- Sombra, brilho e borda de luz como forma pertencem a `forma`; luz de cenário, a `cenario`.
- Nenhuma paleta é copiada de outro canal: o que se usa é o mecanismo (modos, troca por ideia, contraste no foco).

## EXEMPLO
> Vídeo sobre por que dormimos, três modos:
>
> | Modo | Quando | Fundo | Assunto | Acento |
> |---|---|---|---|---|
> | lagoa de dia | a água-viva acordada | ciano claro a azul médio | coral e creme | amarelo |
> | lagoa de noite | ela dorme | índigo a azul profundo | coral apagado, brilho ciano | amarelo pálido |
> | a loja | a analogia do sono | lilás claro, depois roxo quando fecha | azul e listras coral | luz amarela da vitrine |
