# Partitura da animação — O que acontece se a Terra parar de girar?

O que cada plano faz em movimento: o que entra, muda ou sai, e em que palavra. É o estado atual da execução, escrito depois de as cenas existirem; nenhuma linha daqui foi decidida pelo usuário ainda.

## Como ler

- Uma seção por cena (o `id` do roteiro), um item por plano, contado de 0 como em `shots`.
- A palavra entre aspas é a deixa: o movimento começa 4 quadros antes dela (`cue`, em `src/components/timing.ts`). Nenhum instante é fixo; tudo acompanha a narração.
- "Som" marca uma ação que pode soar; o que soa de fato está em `sound.md`.

## Andamento

Calmo, de quem conta. A energia sobe só na parada (`the-rule` 1 a `you-too`) e na batida do outro planeta. Todo plano entra por corte: a passagem que o roteiro pede por câmera ou transformação acontece dentro do plano que chega (a câmera parte mais aberta ou mais fechada e assenta em 0,6 s, ou a forma anterior é redesenhada e vira a nova). Plano parado ganha a aproximação lenta de 4% a 8%. Quem está de pé respira e pisca; o globo gira a uma volta a cada 14 s quando o giro está ligado.

> As deixas de `how-fast`, `feel-nothing`, `the-rule`, `you-too`, `sea-moves`, `after-the-dust`, `water-piled`, `water-leaves`, `year-long-day`, `not-the-moon`, `never` e `still-spinning` foram conferidas com a fala real, em quadros parados. Nenhuma cena foi vista em movimento ainda.

## one-turn

- 0: a Terra gira devagar; a casinha entra pela borda escura e chega à luz. A câmera aproxima 5%.
- 1: o Sol sobe no vidro o plano inteiro; em "Sol" a Vigília ergue o olhar da xícara para ele. O vapor do café sobe.

## switch-off

- 0: a Vigília olha a Terra por cima do ombro; em "desligar" põe as duas mãos na haste. No silêncio de 6 s, a vinheta do canal. Som: a vinheta.

## how-fast

- 0: em "velocidade" o velocímetro apagado entra na parede, e ela se vira para ele.
- 1: em "volta" a fita dá a volta no equador em 1,4 s, e "40.000 km" entra em "quarenta"; em "percorre" o ponteiro do relógio varre e para antes de fechar; "quase 24 h" em "dia"; em "solo", a seta curva sobre o equador, e a etiqueta "leste" 0,5 s depois, um nada antes da palavra (fica 1,5 s na tela). Som: a fita correndo.
- 2: o boneco dá a volta com a Terra; no segundo "dá" o velocímetro acende e sobe até "1.670 km/h". Em "carro" o carrinho vermelho entra no ponto de largada, com "100 km/h", e os dois partem juntos: a linha fica branca por onde o boneco passou e vermelha por onde o carro passou. De "levaria" a "dezessete" o contador sobe de "1 dia" a "quase 17 dias". Som: o ponteiro subindo.

## by-latitude

- 0: os círculos entram em "lugar", "perto" e "polos", com as contas na mesma longitude: a do equador corre mais.
- 1: a câmera fecha; a casinha anda no círculo dela; entram "equador, 1.670 km/h" e, em "cerca", "São Paulo, cerca de 1.500 km/h".
- 2: o disco de gelo anda um quarto de volta para leste, com um raio marcado para o olho seguir, e o Explorador gira junto: começa de três quartos para oeste, passa de frente no meio do plano, com a caneca diante do peito, e chega a três quartos para leste; "0 km/h" em "gira".

## feel-nothing

- 0: quatro setas iguais para leste entram em "solo", "ar", "mar" e "casa"; em "mesma" o velocímetro pulsa; em "sem" ela olha o café, liso. Em "ônibus" a casa sobe, ganha rodas, cabine e estrada, e o quadro abre; "comparação" entra 0,4 s depois. Em "café" ela confere o café de novo; em "freia" ergue os olhos e olha para a frente.

## the-rule

- 0: em "freada" ela puxa a haste, que cede; em "só" afrouxa; olha a Terra em "planeta" e volta à haste em "assim".
- 1: o ônibus-cozinha corre na estrada por 1 s, com uma seta no teto e outra sobre a Vigília. Em "freia" as rodas travam, a estrada para, a seta do teto encolhe, o velocímetro cai a zero e a frente afunda; o café e a cortina vão para a frente, e ela sai pelo piso na velocidade em que o ônibus vinha (0,27 s). Daí, câmera lenta: ela desliza ao longo do ônibus, inclinada, com a seta dela, e o caminho fica pontilhado atrás; a cortina, o vapor e os traços da seta ficam lentos junto. A seta incha e volta, em 0,5 s, nos dois "continua"; no segundo "nada" a mão de cá procura atrás onde se agarrar, por 1,4 s; em "Tudo" um gole sai da xícara e vai ao lado dela; em "mesma" ela repara nele; em "até" vê a parede da frente e recua o corpo. O tempo volta ao normal 0,6 s antes de "segure": o gole bate na parede e mancha (0,3 s antes), e em "segure" ela chega à parede na velocidade do ônibus, achata contra ela, o ônibus treme e a seta dela acaba; 0,2 s depois ela se solta, de pé, olhando a xícara, e o caminho pontilhado ganha ponta. Em "inércia" a palavra entra, presa ao caminho. Som: a freada ("freia"); o café na parede (0,3 s antes de "segure"); a batida amortecida ("segure").
- 2: em "troque" o ônibus encolhe e pousa sobre a Terra em 0,7 s, virando a casinha, que já leva a seta para leste. Em "Suponha" a casca azul sai e mostra a parte sólida com as três camadas por cima. Em "pare" a parte sólida trava com um solavanco; o ar, o mar e as casinhas seguem para leste, e a seta de cada camada entra em "ar", "água" e no segundo "você"; "só a parte sólida para". Som: o tranco.

## you-too

- 0: em "trava" o chão trava: o café se inclina, a cortina vai para leste, ela se assusta e o corpo passa do pé. Som: o tranco.
- 1: o plano abre em "arremessado" com a rua inteira; 0,27 s depois do corte ela sai de dentro de casa, inteira, com a xícara, e o carro vai junto; "cerca de 1.500 km/h" em "cerca"; o que estava solto segue passando até o corte. Som: a passagem (0,27 s depois do começo do plano).
- 2: a casa range desde o começo do plano; a sapata pulsa em "fundação", a rachadura abre de "resto" em diante, e as paredes e o telhado só se soltam em "seguir", com a moldura da janela. Som: a casa se soltando.

## not-to-space

- 0: ela sai numa curva baixa, rente ao chão, e o caminho fica pontilhado; a seta para cima entra em "cima" e é riscada em "espaço".
- 1: a seta de escape cresce de "escapar" até "preciso" ("11 km/s" em "gravidade"); "mais de 20 vezes" em "vinte"; o toco da rotação sai no segundo "solo" ("0,47 km/s" em "gira") e investe, treme e não passa da marca dele até "equador".

## wind

- 0: o ar varre o chão: as palmeiras deitam, as telhas saem uma a uma em "ar", a do meio é arrancada em "correndo"; a fundação e as pedras ficam; "1.670 km/h" em "mil". Som: o vento.
- 1: a barra do recorde cresce em "rajada" (o plano começa nela), com o anemômetro girando na ponta; "408 km/h" em "quatrocentos" e "ciclone Olivia, 1996" em "ciclone".
- 2: a câmera abre a mesma régua; a segunda barra cresce até quatro vezes a primeira; o anemômetro sai voando; "1.670 km/h". Som: o anemômetro arrancado.

## sea-moves

- 0: o oceano desliza para leste sobre o fundo parado e sobe na borda do continente; as setas entram em "leste"; em "vento", "1.670 km/h" pequeno, andando com a água.
- 1: a água avança pela areia e chega ao lugar da régua em 1,2 s; em "onde" a régua cresce do pé, com a escala em branco, e a interrogação entra 0,3 s depois; as ondas seguem subindo e descendo nela até o corte.

## the-pole

- 0: de "perto" a "devagar", as setas do arremesso entram uma a uma, do equador ao polo, cada vez menores; no polo, só o ponto.
- 1: o Explorador com a caneca, ao lado da placa "polo, 10 km"; o velocímetro quase no zero e "menos de 3 km/h" no segundo "devagar"; o colchete entre duas pegadas em "caminhando".
- 2: número mudo. Na fala ele se prepara em quatro poses seguradas: nota ("parada"), finca os pés ("tropeço"), abraça o poste com os dois braços, o corpo colado nele ("escapa"), e fecha os olhos e treme ("tranco"). No silêncio de 7 s, em segundos dele: segue tremendo de olhos fechados (até 0,6); o tranco (0,6): a placa e o chão dão um solavanco de 3 quadros, um pé avança e volta em 0,5 s com o corpo atrás, os olhos fechados, e o gole da caneca cai na neve (1,1); pausa imóvel (até 1,7); abre um olho, devagar (1,7); abre o outro (2,5); solta o poste (3,0); esfrega o casaco em três vaivéns (3,5 a 4,3); vira o corpo e o olhar para a direita, o horizonte vazio, com a caneca parada no ar (4,4 a 4,9); só então a câmera abre devagar para a metade vazia do quadro. Som: o solavanco (0,6 s) e o gole na neve (1,1 s).

## after-the-dust

- 0: a Terra parada sob o véu de poeira, luz vermelha, a Vigília olhando o estrago. Ela põe as mãos na haste e, em "repetir", a alavanca vai a ligado em 0,5 s: a poeira some, a luz fica verde, a Terra retoma o giro; "de novo" 0,5 s depois. Som: a alavanca.
- 1: de "perdendo" em diante a alavanca desce em cinco dentes e a Terra freia sem tranco; "aos poucos, em décadas" em "décadas"; no terceiro "para" a alavanca chega a desligado e a Terra para. Em "mar" a câmera aproxima, o contorno antigo fica em tracejado, a terra seca muda em 2,6 s e duas setas se desenham do equador para os polos. Som: os dentes da alavanca.

## the-bulge

- 0: a cintura alarga em "larga" e entra "exagerado"; os dois raios saem do centro em "centro"; no segundo "equador" a cópia do raio do polo deita sobre o do equador; em "vinte" o pedaço a mais acende: "21 km".

## water-piled

- 0: a Terra em corte, larga no equador, com "exagerado"; a seta do giro se desenha acima do polo de "foi" a "rotação".
- 1: em "depressa" o tambor acelera e a roupa vai para a parede. Em "tenta", câmera lenta: as outras peças cedem, e a reta tracejada sai da peça coral e atravessa a parede; em "parede" o trecho da parede à frente dela acende; em "espremida" o tambor volta a correr, a roupa se achata, e a Vigília se espanta. Som: a centrífuga.
- 2: o tambor funde na Terra vista do polo, e a peça vira um ponto no equador, com a reta. Em "gravidade", oito setas apontam para dentro, no lugar da parede. Em "equador", fusão de 0,35 s para o corte de lado, com as setas tracejadas para longe do eixo e "exagerado"; em "nula", uma marca sem seta em cada polo; em "mantém" as setas pulsam; em "água" o mar aparece, com a mesma espessura em toda a volta.

## water-leaves

- 0: a Terra chega girando, com a seta do giro acima do polo; em "rotação" ela freia em 1,2 s e a seta se recolhe; as setas tracejadas encolhem até sumir em "curva". Em "gravidade", oito setas iguais apontam para dentro em 0,4 s, uma em cada polo, uma em cada ponta do equador e as do meio, e pulsam. Em "mantém" a água do equador balança por 1,4 s (afina e engrossa três vezes, e os polos fazem o contrário). Em "sólida" o contorno da rocha acende e as setas da gravidade esmaecem; 0,5 s antes do segundo "água" as setas e o contorno saem, e na palavra a água começa a deixar o equador, devagar, até o corte.
- 1: os dois raios voltam e um círculo tracejado, na distância do polo, dá a volta inteira. A água desce o plano inteiro: até "alto" a do equador afina até acabar, e na palavra a rocha aponta ali e o pedaço a mais acende, com "alto"; daí a faixa seca alarga no mesmo passo, passando por "21 km mais perto do centro" ("vinte") e por "baixo" nos dois polos ("baixo"), e completa 0,4 s depois de "desce": dois oceanos polares e a faixa seca no equador, parados 1,2 s até o corte.

## two-oceans

- 0: o controle "giro" desce desde "computador"; "simulação" em "simulou".
- 1: o mapa cresce da tela até o quadro e se redesenha: o equador seca do meio para fora e os dois oceanos escurecem; uma seta tracejada percorre a faixa de terra em "faixa".

## new-map

- 0: a câmera sobe para o norte, com as planícies ainda secas; "norte do Canadá" e "norte da Sibéria" entram nas próprias palavras, e a água avança sobre elas até cobri-las em "debaixo".
- 1: o resto de água escoa até "vira", a lama rachada aparece e o navio assenta torto. Som: o navio assentando.

## map-limit

- 0: o contorno do mapa fica tracejado em "mapa", e o carimbo "provisório" bate em "vale" e quica uma vez. Som: o carimbo.
- 1: de "perder" a "ajuste" a largura do equador afunda, com o contorno de hoje em tracejado e as rachaduras crescendo; o tremor maior em "terremotos"; em "milhares", a faixa "de milhares a milhões de anos", com a linha pontilhada e a interrogação.
- 2: o mapa inteiro de novo, com "simulação", "provisório" e o selo; a câmera se afasta devagar. No segundo de silêncio, só a câmera.

## year-long-day

- 0: a Terra de lado, com a beira do Sol à esquerda e a metade direita escura; a pílula "dia" no segundo "dia" e "noite" em "noite", quando a casinha cruza a linha da sombra; em "depois" ela cruza de novo, uma volta depois.
- 1: o Sol e a Terra vistos de cima, com a bandeira girando com a Terra. Em "girar", a seta em volta da Terra e "rotação: 1 dia"; no primeiro "volta", a seta na órbita e "volta em torno do Sol: 1 ano". Em "desligou" o giro freia em 0,7 s e para com a bandeira para a direita; a seta dele fica tracejada e cinza, e a etiqueta, cinza e riscada.
- 2: uma demonstração em poses, uma volta e meia ao todo (a volta é um ano: não cabem várias). A Terra vem devagar de baixo do quadro, pela direita e pelo alto. Em "estrela" entra a marca da estrela na borda direita, com a linha de mira saindo da bandeira; a estrela está longe, fora do quadro, então a linha fica sempre na horizontal e a marca sobe e desce com a Terra; a etiqueta "estrela" entra com a marca e some 2 s depois. A Terra freia e assenta à esquerda do Sol, com a bandeira apontada direto para ele, 0,3 s antes de "frente"; de "frente" a "costas" dá meia volta num movimento só (2,5 s, acelerando e freando) e para à direita, com a bandeira oposta ao Sol, por 0,4 s; depois parte do repouso e segue devagar até o alto, o amanhecer, no fim do plano. A bandeira não muda de direção em momento algum.
- 3: o anel vem para o centro em 1,1 s; a metade clara incha em "luz", a escura no segundo "seis". A Terra continua do alto, devagar, no passo em que o plano 2 terminou: anda menos de um terço de volta, sempre na metade clara.

## the-moon-case

- 0: abre colado no chão cinza, com a linha da sombra andando, sem se reconhecer a Lua; a câmera abre até a Lua inteira em "Lua"; as etiquetas entram no segundo "dia" e em "noite".
- 1: o termômetro sobe a "120 °C"; em "cai" a sombra varre o chão e a coluna desce a "−130 °C".

## not-the-moon

- 0: a Lua já abre com o termômetro e os dois números; em "ar" a camada de ar surge só na Terra; em "nenhuma" os dois termômetros vazios da Terra crescem do pé; as interrogações em "número".
- 1: a câmera leva a Terra ao centro; em "esquentar" o ar do lado claro fica laranja e entra "mais quente que hoje"; em "esfriar" o do lado escuro fica azul e entra "mais frio que hoje".
- 2: a fileira de quatro globos já vem entrando no corte; em "mostram" o de 128 dias cresce, e os vizinhos saem; em "contraste" o Sol entra pela esquerda e o lado escuro aparece; no segundo "ar" o traço quente sobe e atravessa por cima até "escuro", desce, e 0,3 s depois o frio volta por baixo, em 0,7 s, fechando o laço antes das nuvens; em "nuvens" o escudo incha na borda virada para o Sol; em "sombra" a sombra cai atrás dele.

## why-not-stop

- 0: ela empurra a haste de volta em "religar": a luz passa a verde e a Terra parte de parada e acelera até o ritmo de sempre. Som: a alavanca.

## another-planet

- 0: o outro planeta espia pelo canto e avança em "outro", crescendo.
- 1: o outro planeta continua vindo pelo mesmo canto e encosta na Terra em "batida": riscos de impacto, um tranco, e a Terra tomba para longe da batida e passa a girar em outro eixo, marcado em tracejado; o planeta recua e vira contorno tracejado. Som: a batida.
- 2: ela ergue os olhos da xícara, que para no ar, enquanto o planeta enche o vidro. No silêncio, respira e pisca.

## the-moon-brake

- 0: a Lua chega pela direita e está no lugar em "Lua".
- 1: o mar sobe em dois calombos; em "atrito" cada um vira sapata, com a haste saindo da Lua e faíscas nas pontas. Som: o freio raspando.
- 2: na lupa, em "menos", a lasca vem de fora e encosta depois do risco do fim; a medida entra em "milésimos".

## corals

- 0: as lascas partem do relógio em arco e pousam numa fila que diminui até sumir.
- 1: o Sol cruza o recife seis vezes, e o coral ganha uma linha por passagem; a etiqueta entra em "centenas".
- 2: a mão com a lupa desce pela faixa "1 ano" de "ano" a "quatrocentas", enquanto a etiqueta conta até "cerca de 400 dias"; em "trezentas" a câmera abre e entra o coral de hoje, "365".
- 3: os dois ponteiros andam juntos, uma volta só; o do coral para em 22 h, o de hoje fecha 24 h, e os dois ficam assim até o corte.

## never

- 0: a Lua com a sapata encostada na Terra, que dá uma volta a cada 2,4 s: o ponto marcado nela passa várias vezes pela Lua.
- 1: visto de cima; a câmera abre de 1,3 para 1. A Terra e a Lua giram no mesmo sentido o tempo todo (anti-horário, como o ponto do plano 0 e o tambor de `water-piled`): a Terra abre a cerca de uma volta por segundo e só perde velocidade, sem parar nem voltar, dando duas voltas a mais que a Lua; o ponto marcado vem de trás, passa pela Lua uma vez (1,2 s) e a alcança de novo em "acompanhar", quando as velocidades se igualam e ele trava de frente para ela; de "sem" a "agir" a haste recolhe, as faíscas morrem e a sapata some; em "continuaria", "sincronizadas, não parada", e o conjunto desliza para a esquerda; em "semanas", "1 dia = 47 dias de hoje". As duas seguem girando juntas até o corte.
- 2: a barra do freio cresce e sai do quadro, com a etiqueta em "dezenas"; em "antes" entram a barra do Sol, o selo e a ceninha do Sol com a Terra; "menos de 8 bilhões" em "modelos"; em "incha" o Sol cresce, vermelho, em 1,1 s, e alcança a Terra.

## still-spinning

- 0: em "continuar" ela tira as mãos da haste, bate uma na outra, recua um passo e olha a Terra girar, com um aceno de cabeça.
- 1: o anel do mar acende no equador em "mar"; em "alterna" a noite aparece, uma fatia a oeste, com a casinha dentro; em "noite" a casinha está em cima da linha e sai para o claro; em "leva" a seta para leste; "mais de 1.000 km/h" em "mais".

## only-clue

- 0: ela olha o café em "liso" e o Sol em "Sol"; o Sol sobe até o fim. No silêncio, sorri, respira e pisca.

## subscribe

- 0: plano mais fechado na janela, com a cozinha de noite; a Terra pequena gira no céu.
- 1: o planeta da vinheta já vem entrando e assenta; o cursor clica o botão em "inscreva", que vira "Inscrito"; até o fim o planeta balança, as nuvens passam e um brilho cruza o botão. Som: o clique.
