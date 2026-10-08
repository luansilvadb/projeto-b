# Algum animal conseguiu parar de dormir?

Registro da direção criativa. O texto que vale para a produção é o de `script.json`; aqui ficam as decisões.

- Tese: dormir custa caro e é perigoso, e mesmo assim nenhum animal conhecido parou de dormir.
- Promessa: algum animal conseguiu parar de dormir?
- Idioma: pt-BR
- Duração-alvo: cerca de 7 min na voz real (1.155 palavras depois da poda de 2026-10-08; eram perto de 1.420)
- Molde: mistério da ciência (`diretor-criativo/estrutura/moldes`) / Forma de arco: problema e opções
- Tensão: era de esperar que algum animal tivesse parado de dormir, e no entanto nenhum parou.
- Mapa: cinco partes, ditas uma vez, na cena `five-parts`: por que dormir é perigoso; três jeitos de tentar escapar do sono; o que já se sabe sobre o que o sono faz. Depois disso a fala só apresenta cada jeito novo ("o segundo jeito é…"), sem dizer que o anterior falhou: quem mostra a posição é a fila dos cinco ícones, com o X e o ícone que acende.
- Fechamento: a sensação é fazer parte de algo muito antigo; a moral, dita em `what-it-is`, é que o terço da vida que parecia perdido é o que nenhum animal conseguiu largar. Virada de clareza. `tonight` responde ao "erro" do gancho numa frase, sem recitar a citação nem o nome de quem a disse: o quadro-negro, na tela, faz a ligação.
- Analogia central: a dívida de sono ("o corpo cobra, como quem cobra uma dívida"), explicada uma vez, no bloco 2. Volta pelo nome no bloco 4 ("o segundo teste é a cobrança") e só na tela no bloco 5, com a conta saindo do bolso. A loja é a comparação do bloco da memória (bloco 6), anunciada como comparação.
- Elementos: quem assiste, as duas elefantas, a água-viva Cassiopea, os ratos de Rechtschaffen e Randy Gardner. Saíram a limpeza do cérebro, o recorde que caiu em duas semanas, a fragata, o golfinho, a poda de sinapses, a hidra, as moscas, a adenosina, a insônia familiar fatal e os números de pulsos.
- Vinheta: depois do gancho, a narração se cala por 6 s (`holdMs` na cena `the-question`) e entra a vinheta do canal (`src/vignette/`), igual em todo vídeo. A descrição completa está em `art.md`.

## Voz

Narrador em off que conta, no tom de "A história não contada da JBS", do Spotniks: alguém que apurou a história e a conta com calma. Quem assiste entra em todo bloco: a noite que ele pula e a manhã seguinte (bloco 2), as oito horas dele contra as duas da elefanta (bloco 3), o que ele faz quando escurece (bloco 4), onze daquelas manhãs seguidas (bloco 5), o que ele decorou ontem (bloco 6); no fecho o pronome passa a "nós". Humor seco de passagem, dentro da frase do fato; forma literal fora das duas comparações anunciadas; frases médias encadeadas. O narrador não diz "eu". Nenhuma negação que carregue o sentido fica no fim da frase, porque a voz clonada erra "não" e palavras em "-ão" nesse lugar.

## Estrutura

Os nomes dos capítulos são organização interna: o vídeo não tem cartela, e o mapa é a fila dos cinco ícones de `art.md`.

| Bloco | Capítulo | Função | Pergunta que responde → que abre | Nota visual | Cenas |
|---|---|---|---|---|---|
| 1 | (gancho) | gancho | — → algum animal conseguiu parar de dormir? | A pessoa e a barra de uma vida com um terço escuro; Rechtschaffen no quadro-negro; o pedestal "acordado 24 h", que fica vazio. | `third-of-life`, `biggest-mistake`, `time-to-fix`, `the-question` |
| 2 | 1. Dormir é perigoso | fundamento | o que o sono custa? → dá para escapar dormindo menos? | A fila dos cinco ícones; o bicho que dorme na savana, com olhos acesos no capim; a conta de sono carimbada "cobrado", guardada num bolso. | `five-parts`, `night-falls`, `last-to-know`, `skip-a-night`, `sleep-debt`, `debt-test`, `debt-returns` |
| 3 | 2. Primeira tentativa: dormir menos | escalada | dá para dormir menos? → e sem cérebro? | As duas elefantas e a régua de 24 horas: a barra "2 h" contra a "8 h" da pessoa. | `sleep-less`, `elephants`, `two-hours`, `elephant-awake`, `elephant-verdict` |
| 4 | 3. Segunda tentativa: não ter cérebro | escalada | o sono é coisa do cérebro? → e se alguém for mantido acordado? | A água-viva na lagoa, de dia e de noite, e no tanque do laboratório; a conta sai do bolso. | `maybe-brain`, `jellyfish`, `jellyfish-night`, `jellyfish-platform`, `jellyfish-debt`, `older-than-brain` |
| 5 | 4. Terceira tentativa: ficar acordado à força | escalada | o que acontece com quem é mantido acordado? → então o que o sono faz? | Os ratos no disco sobre a água; Randy Gardner e o contador que sobe até "264 h"; as três molduras e o pedestal vazio. | `forced-awake`, `rats-disc`, `rats-result`, `unknown-cause`, `awake-record`, `gardner-hours`, `gardner-sleeps`, `so-far` |
| 6 | 5. O que o sono faz | virada | o que o sono faz? → e em quem não tem cérebro? | A loja de porta baixada, com a lojista e as caixas do estoque. | `but-what`, `memory-test`, `memory-result`, `stockroom`, `stockroom-night`, `stockroom-solid` |
| 7 | (fechamento) | fechamento | — | O pedestal ainda vazio e a linha do tempo; a pessoa entre a elefanta e a água-viva; a loja com a interrogação; o quadro-negro do gancho, de onde o carimbo "erro?" se apaga; a pessoa dormindo. | `nobody-escaped`, `one-of-them`, `still-unknown`, `what-it-is`, `tonight` |
| 8 | (chamada) | chamada | — | Os três dormindo lado a lado; o planeta da vinheta. | `subscribe` |

## Fio

- Refrão: "conseguiu parar de dormir", em três voltas, cada uma com algo novo. 1ª, fim do bloco 3: nem a elefanta. 2ª, fim do bloco 4: nem quem vive sem cérebro. 3ª, fim do bloco 5: nenhum animal estudado até hoje, que é a resposta à pergunta do gancho e é dita uma vez. O fechamento não repete a frase: "nós somos um dos animais dessa história".
- Ideias novas, na ordem: o perigo e a cobrança (180), a elefanta (175), a água-viva (230), os ratos (165), Gardner (160) e a memória (215).
- Vereditos: os que dizem algo novo. Bloco 3: nem a elefanta conseguiu parar. Bloco 4: nem quem vive sem cérebro conseguiu parar. Bloco 5: nenhum animal estudado até hoje conseguiu parar de dormir, com os três resultados só nas molduras da tela. Bloco 6: dormir ajuda a guardar o que você aprendeu. Bloco 7: ao que parece, o sono está longe de ser um erro. O bloco 2 fica sem veredito falado: o dilema já foi vivido nas cenas.
- Promessas: nenhuma anunciada na fala. A cobrança volta no bloco 4 (a água-viva mantida acordada cochila no dia seguinte), pelo nome, e no bloco 5 (as catorze horas de Gardner, poucas para tantos dias acordado), só pela conta que sai do bolso. A frase do "maior erro" é dita uma vez, no gancho, e respondida no fechamento.
- Personagens: Allan Rechtschaffen (44 anos estudando o sono, na Universidade de Chicago; apresentado uma vez, no gancho, com a frase do "maior erro"; no bloco 5 volta só pelo nome, como dono do laboratório dos dez ratos; no fechamento é o quadro-negro dele que aparece, sem o nome na fala). As duas elefantas (matriarcas selvagens, acompanhadas por 35 dias; duas horas de sono por dia e até 46 horas seguidas acordadas). A água-viva Cassiopea (passa a vida pousada de cabeça para baixo; boiou até cinco segundos antes de reagir). Randy Gardner (17 anos em dezembro de 1963; o cara ou coroa; 264 horas acordado, quatro a mais que o recorde, que fica só na tela; 14 horas de sono depois). William Dement e os autores dos estudos ficam no selo e na etiqueta da tela.
- Caso corrente: as oito horas de quem assiste e a manhã seguinte a uma noite em claro. Servem à conta do terço da vida (bloco 1), à cobrança (bloco 2), à medida da elefanta (bloco 3), às onze manhãs e às catorze horas de Gardner (bloco 5).
- Saídas concedidas: bloco 3, "então é só dormir menos" (tem bicho que dorme bem menos); bloco 4, "a culpa é do cérebro" (parece razoável, e foi testado); bloco 5, "e se não deixar dormir?" (foi feito).

## Grafias de pronúncia

- "Álan Réctchafen" = Allan Rechtschaffen
- "Rêndi Gárdner" = Randy Gardner
- "Cáltec" = Caltech
- "Cassiopéia" = Cassiopea

## Simplificações

- Bloco 1: "quase sem defesa" para "produz vulnerabilidade ao ataque de inimigos" (fonte 19); o perigo concreto, o predador, fica para o bloco 2.
- Bloco 1: "um terço da vida" pressupõe oito horas por noite; a recomendação é de sete ou mais. "Bastava um animal aprender a viver acordado" é inferência do roteiro: a fonte só diz que, se o sono não fosse essencial, seria de esperar algum animal sem ele.
- Bloco 2: "dormir é perigoso" fica sem a ressalva da própria revisão, de que em muitas circunstâncias dormir pode ser a escolha menos perigosa.
- Bloco 2: a sonolência da manhã seguinte é dita como "o começo dessa cobrança"; na fonte, a compensação é o sono de recuperação. Compensar o sono perdido é dito como "um dos testes" e como "sinal" do sono; na fonte são três critérios juntos.
- Bloco 3: "você dorme umas oito horas por noite" é pressuposto sobre quem assiste; a fonte recomenda sete ou mais. A tromba parada por cinco minutos "foi contada como sono": o estudo a chama de forte indício, medido sem eletroencefalograma.
- Bloco 4: a demora da água-viva é dita "parecida com a sua" quando alguém chama de madrugada; a fonte não faz a comparação com gente, só define o sono pela resposta reduzida.
- Bloco 4: "a água-viva dorme" para "estado semelhante ao sono", que é como os autores escrevem.
- Blocos 5 e 7: "nenhum animal estudado até hoje conseguiu parar de dormir" para "não há evidência clara de nenhuma espécie que não durma, e os casos apontados como exceção são controversos".
- Bloco 5: os ratos "impedidos de dormir" ainda dormiam ao menos 10% do tempo, em microssonos; "o último, em pouco mais de um mês" lê o extremo da faixa de 11 a 32 dias. A conta de Gardner mostra só a primeira noite de recuperação; "sono mais fundo" é a regra geral da revisão, não uma medida dele.
- Bloco 7: "algum animal já deveria ter se livrado dele" é inferência do roteiro: a fonte diz que, se o sono não fosse essencial, seria de esperar algum animal sem ele.
- Bloco 6: a fala não diz mais que o experimento de 1924 tinha só duas pessoas; a etiqueta "só duas" fica na tela.
- Bloco 6: a loja omite que a fonte situa o processo no sono de ondas lentas e que parte da consolidação também acontece na vigília.

## Contas

- Bloco 1: um terço da vida = 8 h ÷ 24 h.
- Bloco 3: um quarto = 2 h ÷ 8 h. As 46 horas: acordar às 7 h de segunda e somar 46 horas dá 5 h de quarta.
- Bloco 5: onze noites em claro a oito horas dão 88 horas; catorze são 16% disso. Onze dias = 264 h ÷ 24. Quatro horas a mais que o recorde = 264 − 260. Pouco mais de um mês = 32 dias, o último dos dez ratos.

## Título e thumbnail

- "Algum animal conseguiu parar de dormir?" / o pedestal roxo "acordado 24 h", vazio sob o foco de luz, com a elefanta e a água-viva dormindo dos lados; sem texto além da placa.
- "Dormir é o maior erro da evolução?" / a árvore da vida com todos os ramos de olhos fechados e o carimbo "erro?".
- "Até quem não tem cérebro dorme" (o título da sexta e da sétima versão) / a água-viva pousada, com o contorno tracejado do cérebro que não está lá.
- Escolhido: o primeiro, pelo usuário, em 2026-10-04, na 1ª aprovação da oitava versão. É a promessa do vídeo, que ele responde por inteiro, e a thumbnail é o cenário-âncora. O terceiro entregava no título a virada do bloco 4.

## Versões

- Primeira a terceira: reprovadas pelo usuário. Relatavam fatos sobre bichos sem antes dar ao espectador a expectativa que eles quebram.
- Quarta, estrutura aprovada em 2026-10-03: gancho; vinheta; 1. O que o sono custa; 2. Quem tentou escapar; 3. Mais velho que o cérebro; 4. E se alguém forçar?; 5. Três respostas; fechamento.
- Quinta, aprovada em 2026-10-04: mesma estrutura e mesmos fatos, voz íntima, âncora de procedência na fala e selo da fonte na tela. Depois reprovada pelo usuário como texto de IA, embora passasse nas medidas.
- Sexta, aprovada em 2026-10-04: reescrita pela unidade `diretor-criativo/escrita/fio`. De 14 achados para 7 ideias; saíram a fragata, o golfinho e a poda de sinapses. Na revisão antes da narração, por decisão do usuário, Gardner, a memória e a limpeza foram expandidas (46 cenas, 8 min 59 s estimados).
- Sétima, aprovada em 2026-10-04: escrita para o ouvinte de `diretor-criativo/conceito/ouvinte`. Entraram o mapa de cinco partes, a posição em cada virada, as retomadas reditas, o fechamento em cinco movimentos e a chamada. 51 cenas, 1.770 palavras, 10 min 16 s estimados; a narração gerada deu 11 min 11 s, com 27 de 136 frases acusadas pelo Whisper.
- Oitava, em 2026-10-04: 1ª aprovação reaberta por decisão do usuário, para reescrever do zero a partir do Conceito com as skills atualizadas. Decisões dele, uma a uma: ângulo mantido e promessa trocada de "por que nenhum animal conseguiu parar de dormir?" para "algum animal conseguiu parar de dormir?", que o vídeo responde por inteiro; duração-alvo de 9 min na voz real; quem assiste dentro de todo bloco; a limpeza do cérebro fora, com o gancho encurtado, sem a promessa dos ratos, e sem o recorde que caiu em duas semanas; a dívida de sono como analogia central e a loja como comparação do bloco da memória; gancho A e fechamento A, de clareza, escolhidos entre alternativas. De 51 para 42 cenas. O "Então," que abria a pergunta do gancho e a recapitulação saiu, porque a voz clonada erra essa palavra no começo da frase.
- Oitava, primeira rodada de checagem e crítica, em 2026-10-04: 94 afirmações, 2 não verificadas e 18 simplificadas; 1 bloqueante e 14 relevantes. Saíram as duas não verificadas ("é o que você faz quando escurece" e "com gente, ninguém levou esse teste até o fim"); a regra da cobrança deixou de ter recíproca; a elefanta passou a "um dos menores tempos"; o sono dela ganhou o como (a tromba); o bloco 4 perdeu duas frases de efeito e ganhou a premissa da idade do sono; os ratos ganharam a função do par e o motivo do estresse; Gardner perdeu o número do recorde na fala e ganhou a cobrança redita, com a quebra da analogia (ninguém paga hora por hora). O quinto item do mapa passou de "o que o sono faz de tão difícil de largar" a "o que já se sabe sobre o que o sono faz", e "nenhum animal conhecido" a "nenhum animal estudado até hoje", as duas confirmadas pelo usuário na 1ª aprovação.
- Oitava, segunda rodada, em 2026-10-04: o `checador` releu as 31 cenas alteradas (100 afirmações: 78 verificadas, 21 simplificadas, 1 não verificada) e o `editor`, o roteiro inteiro (nenhum bloqueante, 3 relevantes). A não verificada, "ninguém paga hora por hora", deu lugar ao que a fonte sustenta sobre Gardner. Entraram o critério dos cinco minutos da tromba, "o começo dessa cobrança", "um dos sinais", "parecida com a sua", "impedidos de dormir" e "estudada há mais de um século"; o pesquisador que acompanhou Gardner virou oração da frase dos sintomas; saíram cerca de 40 palavras apontadas como sobra. Duas frases do fechamento aprovado mudaram, e o usuário confirmou as duas na 1ª aprovação: "larga o que está fazendo", porque "para" soa como a preposição, e "esse terço da vida que passamos dormindo", que rediz o que foi dito 1.250 palavras antes. Esta última leva de consertos não voltou ao `checador` nem ao `editor`.
- Texto, planos, título e conceito de thumbnail da oitava versão aprovados pelo usuário em 2026-10-04; a 1ª aprovação nova está em `approvals.md`. Texto de leitura em `out/conceito/why-we-sleep/32-roteiro-v8.md`.
- Trilha em dez faixas, uma por momento do vídeo, decidida pelo usuário em 2026-10-05, depois de ele recusar três sementes de uma trilha de fundo em duas faixas longas. O mapa aprovado está em `score.md` ("Mapa da trilha"): as faixas, os silêncios em que a música sobe e os três trechos em que ela some. Para a música ter onde aparecer, cinco cenas que fecham capítulo ganharam 1 segundo sem fala (`holdMs`): `debt-returns`, `elephant-verdict`, `older-than-brain`, `gardner-sleeps` e `stockroom-solid`. O vídeo passou de 9 min 27 s para 9 min 32 s; nenhuma frase mudou.
- Poda dos ecos, aceita pelo usuário em 2026-10-08, depois de ele notar que o vídeo se repetia ("quinhentos milhões de anos aparece no começo e perto do fim"). De 1.480 para 1.421 palavras, em cinco cenas. `so-far` deixou de recontar na fala o resultado de cada capítulo: diz o veredito, o nome dos três jeitos e a resposta, e as três molduras mostram os resultados. `nobody-escaped` ficou só com a frase que encerra a procura; saíram os quinhentos milhões de anos e a resposta repetida, e a quarta volta do refrão passou a "nós somos um dos animais dessa procura", em `one-of-them`. Em `tonight`, a frase de Rechtschaffen volta mais curta e sem o aposto. `gardner-sleeps` nomeia a cobrança sem redizer a regra. `older-than-brain` ficou como estava: o "sem ter cérebro" da primeira frase é a deixa do gesto de guardar a conta no bolso. Ficaram de propósito as costuras entre capítulos e `debt-returns`, que dão o tempo dos planos da fila dos ícones e do bolso, e a estrutura. `nobody-escaped` ganhou 0,7 s sem fala (`holdMs`), para o foco descansar sobre o pedestal vazio. O `editor` não achou defeito relevante; o `checador` leu 38 afirmações, nenhuma errada nem sem fonte.
- Segunda rodada da poda, aceita pelo usuário em 2026-10-08, depois de ele recusar a primeira por ainda repetir ("agora continua em outras partes, como Rechtschaffen sobre o maior erro da evolução"). De 1.421 para 1.156 palavras, em 23 cenas. A regra: cada ideia é dita uma vez, só volta se disser algo novo, e a posição no caminho fica com a fila dos ícones. Saíram as frases de posição entre capítulos, o anúncio "essa cobrança volta duas vezes" e o veredito falado do bloco 2, a regra da cobrança redita na água-viva e em Gardner, a recapitulação de `so-far` (fica só a resposta), o nome e a frase de Rechtschaffen no fechamento, o perigo redito em `night-falls` e as ressalvas repetidas. `debt-returns` passou a apresentar o primeiro jeito, que antes abria `sleep-less`. `night-falls` ganhou 1,5 s sem fala, e o respiro de 1 s de `debt-returns` passou para `debt-test`. Ficaram, por decisão do usuário: o mapa dito uma vez, as três voltas do refrão e a estrutura. O `editor` leu o roteiro inteiro com a pergunta do que se escuta pela segunda vez, e o `checador`, as frases novas.
