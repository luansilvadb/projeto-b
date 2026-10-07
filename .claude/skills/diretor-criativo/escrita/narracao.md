## PERGUNTA
Como escrever um texto feito para ser ouvido?

## RESPOSTA

**Premissa.** O espectador ouve uma vez, na velocidade do narrador, sem poder reler. Toda regra abaixo decorre disso.

**Frase:**

- Uma ideia por frase. Se há "que", "o qual" e "sendo que" na mesma frase, divida.
- Sujeito e verbo próximos e no começo; a informação nova vai para o fim, onde a voz cai.
- Voz ativa e verbos concretos: "a estrela engole o planeta", não "ocorre a absorção do planeta".
- Frase média é o padrão. A curta entra só onde a ideia vira, e o bloco pode terminar numa frase média, no meio do raciocínio que o próximo continua.
- Presente do indicativo como tempo padrão.

**Registro.** O narrador conta em off: é alguém que apurou a história e a conta com calma, e não um apresentador conversando com a câmera. Português do Brasil escrito direto em português, falado e sem gíria (decisões do usuário em 2026-10-04; o tom é o do vídeo da JBS, base de `fio`). O teste de cada frase: um bom narrador de documentário brasileiro diria isso, com essas palavras?

- Frase declarativa, com o sujeito dito pelo nome e repetido quando volta. O que amarra uma frase à outra é a ordem dos fatos e o sujeito em comum; conectivo entra onde há causa ou virada de verdade.
- Palavra que a fala usa: "dá" e não "resulta em", "tem" e não "possui", "todo mundo" e não "a totalidade". "Pra", "pro" e "tá" entram onde a forma inteira soaria dura.
- A passagem é dita em tom de narrador. Quando a virada pede orientação (`ouvinte`), ela diz o que ficou decidido e o que falta: "isso explica quem é quem; falta explicar como".
- A ideia difícil pode ser dita duas vezes, a segunda depois de "ou seja" ou "em outras palavras", com a consequência para quem assiste.
- "Você" aparece onde quem assiste entra na história, conforme `voz`; "a gente" e a fala do espectador ("aí você pensa:") ficam para os trechos que argumentam com ele, conforme `fio`.
- Gíria e interjeição ("tipo", "putz", "pô") ficam fora, pela regra de `humor`.

**Perfil de frase.** O texto não é feito de frases curtas: é feito de frases médias, com uma muito curta a cada nove ou dez. As faixas são as que o `pnpm check-script` confere. Frase de uma ou duas palavras ("Ah. Ah, não.") marca a reviravolta; por isso é rara. Frase longa é permitida quando é uma enumeração em que cada item cabe numa respiração.

**Vocabulário:**

- Palavra comum sempre que existir. Termo técnico só entra quando será reutilizado; nesse caso é explicado antes de ser nomeado ("essa fronteira tem nome: horizonte de eventos").
- Um nome por coisa. Trocar por sinônimo faz o ouvinte achar que é outra coisa.
- Concreto antes do abstrato: primeiro o exemplo, depois o conceito.
- Sem siglas não explicadas e sem parênteses; o que está entre parênteses não se narra.

**Números:**

- No máximo um número relevante por frase, e cerca de dois por minuto de narração. Mais que isso só em arcos de escada de escala, num bloco que responde a uma pergunta anunciada com números de uma medida só, sobre os mesmos elementos, conforme `explicacao`, ou na conta em voz alta de `fio`.
- Arredondado e dito por extenso do jeito que se fala ("quase quatro milhões").
- Todo número grande ganha referência de comparação logo em seguida.

**Citação:**

- Diga quem falou, pelo nome, antes da fala: "um pesquisador" sem nome soa como enfeite, e o espectador não tem como conferir.
- O anúncio termina em dois-pontos e a fala citada vem depois dele: a voz para em suspenso e o ouvinte entende que as próximas palavras são de outra pessoa.
- Cite o que a pessoa disse. Se a frase original não cabe na voz, diga que é um resumo ("ele dizia que...") em vez de pôr palavras na boca dela.
- Nome estrangeiro vai escrito como se pronuncia na narração; a grafia correta vai para a tela e para o registro do roteiro.

**Ritmo e encadeamento:**

- O bloco seguinte abre no que o anterior deixou aberto: a saída que o espectador tentaria, conforme `fio`, ou a consequência do que foi dito.
- Conectores falados ("só que", "então", "acontece que") em vez de escritos ("entretanto", "outrossim", "dessa forma").
- Repetição deliberada de uma palavra-chave ajuda o ouvido; repetição acidental cansa.
- Pausas são escritas com ponto e quebra de linha, não com reticências. O dois-pontos também é pausa, com a voz em suspenso: ele anuncia uma citação ou a fala do espectador ("aí você pensa:"). No resto, a frase corre com vírgula ou "que".
- A virada com "mas" é o motor do texto: cada explicação dura até encontrar seu problema. Se dois blocos seguidos não têm um "mas", um "só que" ou equivalente, o texto virou exposição.
- A pergunta do espectador pode ser feita pelo narrador ("ok, mas por que não ir mais rápido?"), cerca de uma a cada dois minutos; ela marca a troca de assunto melhor que um conector.

**Procedimento:**

1. Escreva bloco a bloco, a partir do que cada um faz na estrutura. A estimativa de palavras orienta, e o texto a corrige.
2. Releia cada bloco em voz alta mentalmente: onde faltaria ar ou a língua tropeçaria, reescreva.
3. Passe cada frase pelo teste do registro. A que o narrador não diria é reescrita como seria dita.
4. Corte a frase de efeito que não foi ganha, conforme `fio`. O fato seco, o detalhe e a retomada que fazem trabalho no fio ficam: são eles que dão tempo ao ouvido.
5. Confira o bloco contra a ficha de voz, o fio e o que `ouvinte` pede do trecho.

## DEPENDÊNCIAS
- ouvinte: fornece para quem o texto é escrito e o que ele precisa de cada trecho.
- explicacao: fornece o assunto de cada bloco, a cadeia de causas e o dispositivo do vídeo; a frase só é escrita depois deles.
- fio: fornece o que fica vivo entre os trechos e os mecanismos escolhidos para sustentá-lo.
- humor: fornece a regra que deixa a gíria de fora.
- arco: fornece o que cada bloco faz, o que o liga ao seguinte e a estimativa de tamanho.
- voz: fornece a ficha de voz que a narração deve respeitar.

## LIMITES
- Não inserir afirmação fora da base de fatos durante a escrita; se faltar, volte a `levantamento`.
- Analogias, humor e notas visuais têm unidades próprias.

## EXEMPLO
> Antes: "A fotossíntese, processo pelo qual os organismos autotróficos convertem energia luminosa em energia química, é fundamental para a manutenção da vida."
> Depois: "Uma folha faz uma coisa que fábrica nenhuma consegue fazer até hoje. Ela pega luz, ar e água e transforma em comida. E é dessa comida que vive quase tudo o que está vivo, inclusive você."
