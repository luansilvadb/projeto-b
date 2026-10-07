## PERGUNTA
Que paletas o vídeo usa, e quando troca de uma para outra?

## RESPOSTA

**A cor serve quando:**

- **O assunto se separa do fundo**, em valor e em matiz, e o maior contraste do quadro fica no ponto focal.
- **Superfícies vizinhas continuam separáveis.** Quando duas áreas grandes que se tocam (a água e a areia, o chão e a parede) ficam na mesma cor, o quadro vira uma cor só, por mais colorido que seja o assunto: foi a lagoa de noite, com água e areia índigo, que caiu a 2,1 cores por quadro. O que as separa pode ser o matiz, o valor, a saturação, a luz ou a borda.
- **A cor que significa continua significando.** A cor ligada a um conceito (o perigo, um dos lados de uma disputa) vale enquanto o sentido é o mesmo; quando ele muda, a mudança de cor acontece à vista, para o espectador acompanhar.
- **Toda troca de cor diz que algo mudou**: o lugar, o estado, a ideia ou o foco. Troca sem motivo é ruído, e uma ideia nova pode manter o fundo quando a continuidade vale mais.
- **Sombra e luz têm cor.** Saem da paleta e da luz da cena. Preto ou branco por cima, em transparência, lê como véu colado no desenho.
- **Quem volta é reconhecido pela cor.** Cada figura do elenco tem as suas, registradas, e elas funcionam em todo modo em que a figura aparece.
- **Toda cor vem das paletas registradas.** Cor escrita solta num desenho quebra a constância no plano seguinte.

**Modo.** Uma paleta com significado: um conjunto de cores que volta e diz ao espectador onde ele está, em que estado ou em que camada da explicação. Ele o aprende cedo, e o modo só troca quando o lugar ou o sentido troca. Os dois que a referência alterna, e que o canal já usou:

- **Mundo**: o que se vê de fora. Fundo claro, pastel saturado, luz do dia.
- **Por dentro**: o mecanismo, o microscópico, o pensamento. Fundo escuro em índigo ou roxo, formas em cor de néon, coisas que brilham.

O que define o modo é o que ele separa, não a claridade: o mundo de noite é escuro, e o assunto pode pedir outros modos (a analogia, o dado, o sonho).

**Identidade do canal.** A cor é saturada e tem matiz nos dois extremos: o escuro é azul profundo, índigo ou roxo, e o claro é pastel (ciano, amarelo quente, menta, rosa). Preto, cinza e branco puros ficam para o assunto que os pede, como o espaço. Um tema grave não troca essa linguagem por cor lavada.

**Papéis da cor num plano.** Um vocabulário para ler o quadro, não uma cota a preencher:

| Papel | O que é |
|---|---|
| Fundo | uma cor e suas vizinhas em degradê; a maior área do quadro |
| Assunto | o que se destaca do fundo em valor e em matiz |
| Acento | uma cor pequena e saturada, no ponto para onde o olho deve ir |
| Neutros | claro e escuro para olhos, texto e brilho |

**Técnicas que já serviram**, cada uma para um problema. São possibilidades:

| Problema | Uma saída | De onde vem |
|---|---|---|
| O espectador precisa notar que a ideia mudou, sem corte | dentro do mesmo modo, o fundo muda de matiz: a troca avisa "ponto novo" | não registrada |
| Um conceito cresce na fala | a cor dele cresce em área: começa como acento e chega a ser o fundo | um vídeo sobre gordura, adotado pelo usuário |
| Tema grave | o peso vem do fundo escuro, da silhueta e do vermelho, com a saturação mantida | o mesmo vídeo |
| Dar cor à sombra e à luz | a sombra é o tom base mais escuro, puxado para o frio (azul, roxo); a luz, mais clara e puxada para o quente | não registrada |
| A figura entra noutro modo | repintada na paleta dele: a versão néon, a silhueta de uma cor | não registrada |

**Medidas da referência** (evidência: situam e não reprovam por si; as faixas são as do `pnpm critique`). Um quadro tem em média 4,4 cores, e a dominante ocupa cerca de metade dele. O fundo é claro em 42% do tempo, médio em 16% e escuro em 39%; 69% dos fundos escuros são azuis ou azul-violeta. A cor dominante troca 11 vezes por minuto. No vídeo inteiro, a família de cor mais comum fica com 26% das cores vivas. Como ler: poucas cores num quadro pedem conferir se o assunto se separa e se duas superfícies colapsaram; muitas, se ainda há um foco; uma família dominando o vídeo, se os lugares e as ideias estão se distinguindo.

## DEPENDÊNCIAS
- elenco: fornece as figuras, cujas cores precisam funcionar em todos os modos.
- entrevista-imagem: define o que, numa paleta, é decisão do usuário (os modos e o que as cores significam) e o que é refino.

## LIMITES
- Sombra, brilho e borda de luz como forma pertencem a `forma`; luz de cenário, a `cenario`.
- Se a figura continua reconhecível entre modos é conferido em `personagem`.

## EXEMPLO
> Vídeo sobre por que dormimos, três modos:
>
> | Modo | Quando | Fundo | Assunto | Acento |
> |---|---|---|---|---|
> | lagoa de dia | a água-viva acordada | ciano claro a azul médio | coral e creme | amarelo |
> | lagoa de noite | ela dorme | índigo a azul profundo | coral apagado, brilho ciano | amarelo pálido |
> | a loja | a analogia do sono | lilás claro, depois roxo quando fecha | azul e listras coral | luz amarela da vitrine |
