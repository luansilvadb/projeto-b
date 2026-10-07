## PERGUNTA
Quando cada coisa acontece em relação à narração?

## RESPOSTA

**Princípio.** Cada movimento tem uma causa na fala ou na cena, e acontece quando a causa aparece. O teste, para qualquer mudança: o espectador sabe dizer por que isso mudou agora?

**A sincronia serve quando:**

- **Toda mudança tem causa à vista.** A causa pode ser uma palavra, uma ação anterior, a reação de alguém, algo que entrou no quadro ou uma expectativa armada antes. O que não tem causa não entra, nem para preencher tempo.
- **A consequência chega com a causa.** O espectador ouve a palavra e vê a coisa, e percebe as duas juntas. Ver antes de ouvir, ou muito depois, só quando é de propósito.
- **O que é um acontecimento só acontece junto, e o que são dois se distingue.** Os dois olhos abrem juntos, a figura e a sombra reagem juntas, as duas barras de uma comparação crescem juntas. Duas novidades sem relação chegam separadas o bastante para serem duas.
- **A ordem que carrega sentido se mantém**: o preparo antes da ação, a reação depois dela.
- **A imagem acompanha o sentido da fala**, não a gramática dela: muda quando a ideia, a ação ou o foco mudam (`planos`). Uma oração pode sustentar o que já está na tela, e outra pode pedir várias mudanças.
- **O tempo sem novidade tem função.** Um **buraco** é o trecho em que nada novo acontece: ele serve a uma reação, a uma espera, à leitura, à contemplação. O que mantém a imagem viva dentro dele é de `pausa-viva`. Buraco que não serve a nada é o plano que morreu.
- **A última informação tem tempo de ser percebida** antes de o plano acabar, a não ser quando ela continua no plano seguinte ou é a própria transição.
- **O plano que evolui tem marcos.** Cada mudança que a encenação escreve cai na deixa dela. Uma transformação contínua pode atravessar várias palavras, com os marcos dela no sentido da fala.
- **O texto chega com o que nomeia**: o nome quando a coisa é apresentada, o número quando a quantidade vira assunto. Quanto tempo ele fica é de `texto`.

**O que o repositório fixa:**

- **A deixa** é a palavra da narração que nomeia ou anuncia a coisa: "cinquenta" dispara o número, "noite" dispara o escurecer, "tiraram" dispara o puxão. O instante dela vem da narração gravada.
- **O adiantamento já está no código.** `cue()` devolve o quadro da palavra 4 quadros antes (`CUE_LEAD_FRAMES`), e o começo de cada plano faz o mesmo: um movimento com aceleração que começa em cima da palavra parece atrasado.
- **A deixa não muda de palavra para caber.** Se o que a encenação pede não cabe no trecho, o plano volta à decupagem (`planos`).
- **A partitura** é onde tudo isso fica escrito, plano a plano; o formato e o lugar dela são de `entrevista-movimento` e da etapa de animação.

**Heurísticas e medidas** (pontos de partida e evidência da referência: situam e não reprovam por si).

- **Densidade.** Na referência há uma mudança na imagem em quase toda oração, os elementos entram de 0,3 a 1 s entre si, e um plano de 6 s tem de três a quatro mudanças de estado. Em 11 s de um plano de humor, cada batida da narração tinha uma ação própria (andar, parar, sentir, esperar, a porta abrir, alguém espiar, o balão estourar).
- **Separar duas mudanças na mesma palavra:** cerca de 0,3 s entre uma e outra.
- **Antecipação.** A ação grande avisa que vem (o braço recua antes de bater, a porta treme antes de descer). O aviso leva cerca de 0,3 s e cabe antes da deixa, e a ação cai nela. Como se atua é de `acao`.
- **Fim do plano.** O que entra nos últimos 0,5 s costuma não ser lido.
- **Buraco.** Passando de 1,5 s sem nada novo, vale perguntar que função o trecho tem.
- **Durações**, cada uma com a unidade que decide:

| Trecho | Costuma durar | Quem decide |
|---|---|---|
| Entrada de um elemento | 0,25 a 0,35 s | `entradas` |
| Ação de personagem, do preparo ao assentar | 0,6 a 1,2 s | `acao` |
| Mudança de estado de um cenário (escurecer, alagar, acender) | 0,8 a 1,5 s | `entradas` |
| Pausa de reação, quase parada | 1 a 1,5 s | `pausa-viva` |
| Rastro ou estouro de ênfase | 0,3 a 0,6 s; um aviso insistente, até 2,5 s | `efeitos` |
| Varredura entre dois estados da mesma cena | 0,25 s | `transicoes` |

A medida comum a todas: tempo bastante para a mudança ser percebida, sem atrasar a fala que a motivou.

## DEPENDÊNCIAS
- encenacao, planos: fornecem o que acontece em cada plano e a deixa de cada um. Os tempos das palavras vêm da narração gravada.

## LIMITES
- Como a figura atua pertence a `acao`; por que e por onde a câmera se move, a `movimento`; que ponte liga dois planos, a `transicoes`. Aqui se decide quando cada uma delas acontece em relação à causa.

## EXEMPLO
> Plano: "A água-viva pulsa, de cabeça para baixo. Cinquenta e oito vezes por minuto." (5,9 s)
> 0,0 s — a lagoa já está lá; o peixe entra nadando pela direita (0,8 s de travessia).
> 1,9 s, "pulsa" — o sino contrai no ritmo; os anéis começam a sair.
> 3,2 s, "Cinquenta" − 4 quadros — o número cresce com sobra (0,3 s); a etiqueta entra 0,3 s depois; a linha até o sino, junto com a etiqueta.
> Até o fim — o peixe acompanha um anel com os olhos (pausa viva).
