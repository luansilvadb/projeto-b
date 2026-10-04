# Até quem não tem cérebro dorme

Registro da direção criativa. O texto que vale para a produção é o de `script.json`; aqui ficam as decisões.

- Tese: dormir custa caro e é perigoso, era de esperar que algum animal tivesse parado, e nenhum parou; o sono faz algo de que o corpo não abre mão, e a ciência ainda não sabe dizer exatamente o quê.
- Promessa: por que nenhum animal conseguiu parar de dormir?
- Idioma: pt-BR
- Duração-alvo: cerca de 10 min (1.770 palavras, com a chamada); acima do alvo do canal por decisão do usuário em 2026-10-04
- Molde: mistério da ciência (`diretor-criativo/escrita/explicacao`), o do vídeo do paradoxo de Peto.
- Tensão: era de esperar que algum animal tivesse parado de dormir, e no entanto nenhum parou.
- Mapa: cinco partes, ditas na cena `five-parts`: o que o sono custa; três jeitos de tentar escapar dele (dormir menos, não ter cérebro, ficar acordado à força); o que o sono faz. Promete para o fim o que o sono faz de tão importante.
- Fechamento: a sensação é fazer parte de algo muito antigo; a moral, que o terço da vida que parece perdido é o que nenhum animal conseguiu largar. A última frase responde a "um terço da vida" e ao "maior erro" do gancho. Virada de clareza.
- Analogia central: o cérebro como uma loja que fecha para arrumar (bloco 6 e fechamento). A dívida de sono é anunciada como comparação no bloco 2 ("como quem cobra uma dívida") e volta como "cobrança".
- Elementos: quem assiste, as duas elefantas, a água-viva Cassiopea, os ratos de Rechtschaffen e Randy Gardner. Saíram a fragata, o golfinho, a poda de sinapses, a hidra, as moscas, a adenosina, a insônia familiar fatal e os números de pulsos.
- Vinheta: depois do gancho, a narração se cala por 6 s (`holdMs` na cena `bad-idea`) e entra a vinheta do canal (`src/vignette/`), igual em todo vídeo: a câmera recua de dentro de uma célula até o planeta no espaço, que fica como símbolo do canal. Ela não mostra o título do vídeo. A descrição completa está em `art.md`; o jingle fica para a etapa de trilha.

## Voz

Narrador em off que conta, no tom de "A história não contada da JBS", do Spotniks: alguém que apurou a história e a conta com calma. Quem assiste entra no gancho, nas oito horas e no fecho, onde o pronome passa a "nós"; humor seco de passagem, dentro da frase do fato; forma literal fora das duas comparações; frases médias encadeadas. O narrador não diz "eu".

## Estrutura

| Bloco | Capítulo | Ideia nova | Abre em | Nota visual | Cenas |
|---|---|---|---|---|---|
| 1 | (gancho) | dormir custa caro e ninguém largou | um terço da vida de quem assiste | A pessoa e a barra de uma vida com um terço escuro; Rechtschaffen no quadro-negro; o pedestal "acordado 24 h", que fica vazio. | `third-of-life`, `eight-hours`, `biggest-mistake`, `rats-promise`, `should-have`, `bad-idea` |
| 2 | O que o sono custa | o corpo cobra o sono que faltou | o bicho que se deita de noite | O bicho que dorme na savana, com olhos acesos no capim; a conta de sono carimbada "cobrado", guardada num bolso. | `five-parts`, `night-falls`, `last-to-know`, `sleep-debt`, `debt-test`, `debt-paid` |
| 3 | Quem chegou mais perto | a elefanta dorme duas horas | "então é só dormir menos" | As duas elefantas e a régua de 24 horas: a barra "2 h" contra a "8 h" da pessoa. | `almost-escaped`, `elephants`, `elephant-quarter`, `elephant-caveat`, `elephant-awake`, `none-zeroed` |
| 4 | Mais velho que o cérebro | a água-viva sem cérebro dorme | "então a culpa é do cérebro" | A água-viva na lagoa, de dia e de noite, e no tanque do laboratório; a conta sai do bolso. | `maybe-brain`, `jellyfish-pulse`, `jellyfish-night`, `jellyfish-platform`, `jellyfish-sleeps`, `older-than-brain` |
| 5 | E se alguém forçar? | os ratos de Rechtschaffen; Randy Gardner | "e se simplesmente não deixar dormir?" | Os dez ratos nos discos sobre a água; Randy Gardner e o contador que sobe até "264 h". | `rats-question`, `rats-awake`, `rats-control`, `unknown-cause`, `awake-record`, `gardner-hours`, `record-closed`, `record-broken`, `so-far` |
| 6 | O que ele faz | o estoque (memória) e a faxina (limpeza) | "mas o que o sono está fazendo?" | A loja de porta baixada, com a lojista: as caixas do estoque e a vassoura. | `but-what`, `memory-test`, `memory-result`, `stockroom`, `stockroom-night`, `stockroom-solid`, `cleaning`, `cleaning-flow`, `cleaning-dispute`, `cleaning-open`, `brainless-question`, `many-reasons` |
| 7 | (fecho) | nenhuma | o fim da procura, visto inteiro | O pedestal ainda vazio e a linha do tempo; a pessoa entre a elefanta e a água-viva; a loja com a interrogação; o quadro-negro do gancho, de onde o carimbo "erro?" se apaga; a pessoa dormindo. | `nobody-escaped`, `one-of-them`, `still-unknown`, `what-it-is`, `tonight` |
| 8 | (chamada) | nenhuma | a sensação do fecho | Os três dormindo lado a lado; o planeta da vinheta. | `subscribe` |

As notas visuais resumem os planos em `script.json`. Os das cenas novas ou refeitas na sétima versão passaram pela decupagem em 2026-10-04 e estão descritos em `art.md`, na seção da sétima versão.

## Fio

- Refrão: "ninguém conseguiu parar", dito com o que cada bloco provou. 1ª volta: nenhum animal sem sono foi encontrado. 2ª: a que chegou mais perto parou em duas horas. 3ª: nem sem cérebro. 4ª: os três jeitos de escapar falharam. 5ª: não se conhece nenhum animal que tenha conseguido, e nós somos um desses animais.
- Ideias novas, na ordem: o custo (180), a dívida (150), a elefanta (170), a água-viva (210), os ratos (160), Gardner (140), a memória (190) e a limpeza (145). Na revisão de 2026-10-04 o usuário decidiu expandir Gardner, a memória e a limpeza, que estavam abaixo das 150 palavras: Gardner ganhou a cobrança das catorze horas e o que veio depois do recorde; a memória, o experimento de 1924 antes da loja; a limpeza, o mecanismo, a contestação com o seu número e a crítica a ela.
- Vereditos: um por bloco, sempre depois da série de fatos. Bloco 1: "Até hoje, nenhum foi encontrado." Bloco 2: o sono atrasado é cobrado, e você já pagou essa conta. Bloco 3: ela chegou a duas horas, e parou aí. Bloco 4: nem quem não tem cérebro conseguiu parar. Bloco 5: os três jeitos de escapar falharam; dos bichos mantidos acordados à força, os ratos não aguentaram, e ninguém achou a causa; com gente, ninguém levou o teste até o fim. Bloco 6, dito na última cena dele (`many-reasons`): a resposta da memória é a mais sólida das duas, a da faxina está em disputa, e cada uma pode ser só uma parte do que o sono faz. Bloco 7: pelo que se viu, tudo indica que o sono não é um erro.
- Promessas: os ratos de Rechtschaffen, plantada no gancho ("esse experimento volta mais adiante") e cobrada no bloco 5, redizendo quem ele é ("o pesquisador da frase do maior erro"), com o que a cobrança acrescenta: os dez morreram e ninguém achou a causa. A dívida de sono, plantada no bloco 2 ("essa regra volta no segundo jeito de escapar") e cobrada no bloco 4, redizendo a regra, quando a água-viva mantida acordada de noite cochila no dia seguinte: é o sinal que prova que ela dorme.
- Personagens: Allan Rechtschaffen (pioneiro da pesquisa do sono; a frase do "maior erro" no gancho, os dez ratos de 1989 no bloco 5). As duas elefantas (matriarcas selvagens, acompanhadas por 35 dias; duas horas de sono por dia e até 46 horas seguidas acordadas). A água-viva Cassiopea (passa a vida pousada de cabeça para baixo; em 2017 tiraram a plataforma de baixo dela e ela boiou até cinco segundos antes de reagir). Randy Gardner (17 anos em dezembro de 1963, quando decidiu; o recorde é de janeiro de 1964, 264 horas acordado sob o olhar de William Dement, 14 horas de sono depois; o recorde dele caiu em duas semanas, o último reconhecido é de 1986, com quase 19 dias, e depois disso o livro dos recordes parou de acompanhar a tentativa. O ano em que parou fica fora da fala: 1997 segundo o Guinness, 1996 segundo a NPR).
- Caso corrente: as oito horas de quem assiste. Servem à conta do terço da vida (bloco 1), à medida da elefanta (bloco 3) e ao fecho.
- Saídas concedidas: bloco 3, "então é só dormir menos" (tem bicho que dorme muito menos); bloco 4, "a culpa é do cérebro" (parece razoável, e foi testado); bloco 5, "e se não deixar dormir?" (foi feito).

## Grafias de pronúncia

- "Álan Réctchafen" = Allan Rechtschaffen
- "Rêndi Gárdner" = Randy Gardner
- "Uíliam Dement" = William Dement
- "Cáltec" = Caltech
- "Cassiopéia" = Cassiopea
- "trêze" = treze

## Título e thumbnail

- Título: "Até quem não tem cérebro dorme", mantido pelo usuário em 2026-10-04, na 1ª aprovação. A justificativa da época era a última imagem da sexta versão, a água-viva dormindo; na sétima, a última imagem do fecho é a pessoa dormindo.
- Thumbnail: o conceito ainda é o da primeira versão; a rever com o usuário.

## Versões

- Primeira a terceira: reprovadas pelo usuário. Relatavam fatos sobre bichos sem antes dar ao espectador a expectativa que eles quebram.
- Quarta, estrutura aprovada em 2026-10-03: gancho; vinheta; 1. O que o sono custa; 2. Quem tentou escapar; 3. Mais velho que o cérebro; 4. E se alguém forçar?; 5. Três respostas; fechamento.
- Quinta, aprovada em 2026-10-04: mesma estrutura e mesmos fatos, voz íntima (quem assiste dentro de todo bloco, humor seco de passagem), âncora de procedência na fala e selo da fonte na tela. Texto de leitura em `out/conceito/why-we-sleep/25-roteiro-v5.md`.
- Sexta, aprovada em 2026-10-04: a quinta foi reprovada pelo usuário como texto de IA, embora passasse nas medidas. Reescrita pela unidade `diretor-criativo/escrita/fio`. De 14 achados para 7 ideias; saíram a fragata, o golfinho e a poda de sinapses, e a contestação de 2024 sobre a limpeza virou uma frase. Estrutura e ficha do fio propostas em `out/conceito/why-we-sleep/28-estrutura-v6.md`; texto de leitura em `29-roteiro-v6.md`.
- Revisão da sexta, em 2026-10-04, antes da narração: checagem e crítica independentes acharam 7 afirmações não verificadas e o trecho final ainda em fila. Por decisão do usuário, Gardner, a memória e a limpeza foram expandidas (de 41 para 46 cenas, de 7 min 25 s para 8 min 59 s). Saiu a cena `rats-verdict`; entraram `record-broken`, `memory-test`, `memory-result`, `cleaning-flow`, `cleaning-open` e `brainless-question`. Gardner deixou de ser "quem chegou mais longe": a fonte não sustenta. Também por decisão do usuário: a recomendação de sete horas saiu do fecho e abriu a cena `eight-hours`, no gancho, no lugar de "um adulto dorme de sete a oito horas", que a fonte não diz; e o veredito do bloco 5 deixou de ser geral (a primeira redação, "os únicos forçados foram os ratos", era falsa: moscas, baratas e camundongos também foram privados de sono, e ficou "só bichos de laboratório"). Medida aceita fora da faixa: frases de 25 palavras ou mais em 3% (referência de 6% a 23%), porque as frases que colavam duas ideias foram divididas; o usuário decidiu não recolar.
- Texto da sexta versão revisada aprovado pelo usuário em 2026-10-04, com as simplificações listadas na entrega. No fecho, por decisão dele, `nobody-escaped` passou a vir antes de `tonight`, para responder à água-viva que fecha o bloco 6; o vídeo termina em você, a elefanta e a água-viva dormindo. A decupagem das cenas alteradas e o título foram aprovados no mesmo dia, e a 1ª aprovação está em `approvals.md`.
- Sétima, em 2026-10-04: 1ª aprovação reaberta por decisão do usuário, que fixou a skill `i-have-adhd` como base de todo texto do canal (unidade `diretor-criativo/conceito/ouvinte`). Entraram o mapa de cinco partes (`five-parts`), a posição nas quatro viradas de capítulo ("o primeiro jeito", "o segundo", "o terceiro", "falta a última parte"), as retomadas reditas e a forma literal. O fechamento reprovado, de 67 palavras, deu lugar aos cinco movimentos de `estrutura/fechamento` (alternativa A, escolhida pelo usuário entre duas), e o vídeo ganhou a chamada (`subscribe`), com a redação aprovada pelo usuário. De 46 para 51 cenas. Depois da checagem e da crítica independentes da sétima: seis afirmações não verificadas foram trocadas pela redação que a fonte sustenta ("tudo indica que não é um erro"; "as duas respostas falam do cérebro, que a água-viva não tem"; "para compensar o que faltou"; "de vigia"; os jatos "à noite", sem "a noite toda"; o laboratório sem camas); a decisão de Gardner passou a "no fim de 1963"; o experimento dos ratos passou a ser "da equipe" de Rechtschaffen; o veredito do bloco 6 passou a ser a última cena dele; e o fechamento deixou de listar o que o corpo já disse, com cada retomada redita. Na segunda rodada: a elefanta "chegou mais perto" só "entre os mamíferos"; a faixa de quatro a vinte horas passou a "em geral"; a virada ficou com um veredito só (saiu "não é tempo jogado fora"); e a última frase passou a "Hoje à noite, nós vamos dormir mais uma parte desse terço da vida. Que seja um bom sono."
- Texto e planos da sétima versão aprovados pelo usuário em 2026-10-04; a 1ª aprovação nova está em `approvals.md`. Texto de leitura em `out/conceito/why-we-sleep/31-roteiro-v7.md`.
- 2026-10-04: este registro passou ao formato sem narração. O arquivo anterior, com o texto por bloco da primeira versão, está em `out/conceito/why-we-sleep/30-script-md-anterior.md`.
