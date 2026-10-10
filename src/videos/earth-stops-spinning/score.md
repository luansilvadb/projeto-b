# Partitura da animação — O que acontece se a Terra parar de girar?

> A narração foi reescrita em 2026-10-10 e ainda não foi gerada. As deixas abaixo descrevem a execução sobre a fala anterior: quatro cenas saíram (`what-spin-does`, `straight-wind`, `magnetic-field`, `earthquake`), a ordem do bloco da parada mudou e várias palavras de deixa são outras. O que a imagem deve à fala nova está em `art.md`, "Pendências da reescrita"; esta partitura é refeita quando a voz nova existir.

O que cada plano faz em movimento: o que entra, muda ou sai, e em que palavra. É o estado atual da execução, escrito depois de as cenas existirem; nenhuma linha daqui foi decidida pelo usuário ainda.

## Como ler

- Uma seção por cena (o `id` do roteiro), um item por plano, contado de 0 como em `shots`.
- A palavra entre aspas é a deixa: o movimento começa 4 quadros antes dela (`cue`, em `src/components/timing.ts`). Nenhum instante é fixo; tudo acompanha a narração.
- "Som" marca uma ação que pode soar; o que soa de fato está em `sound.md`.

## Andamento

Calmo, de quem conta. A energia sobe só na parada (`the-rule` 1 a `you-too`) e na batida do outro planeta. Todo plano entra por corte: a passagem que o roteiro pede por câmera ou transformação acontece dentro do plano que chega (a câmera parte mais aberta ou mais fechada e assenta em 0,6 s, ou a forma anterior é redesenhada e vira a nova). Plano parado ganha a aproximação lenta de 4% a 8%. Quem está de pé respira e pisca; o globo gira a uma volta a cada 14 s quando o giro está ligado.

## one-turn

- 0: a Terra gira devagar; a casinha entra pela borda escura e chega à luz. A câmera aproxima 5%.
- 1: o Sol sobe no vidro o plano inteiro; em "Sol" a Vigília ergue o olhar da xícara para ele. O vapor do café sobe.

## what-spin-does

- 0: três coisas acendem: o anel do mar na cintura em "mar"; a cintura alarga e os colchetes entram em "alarga"; as setas do vento saem retas em "entorta" e se curvam para leste logo depois.

## switch-off

- 0: a Vigília olha a Terra por cima do ombro; em "desligar" põe as duas mãos na haste. No silêncio de 6 s, a vinheta do canal. Som: a vinheta.

## how-fast

- 0: em "velocidade" o velocímetro apagado entra na parede, e ela se vira para ele.
- 1: em "quarenta" a fita dá a volta no equador e entra "40.000 km"; em "volta" o ponteiro do relógio varre e para antes de fechar: "quase 24 h". Som: a fita correndo.
- 2: o boneco em silhueta dá a volta inteira com a Terra; em "dá" o velocímetro acende e sobe até "1.670 km/h". Som: o ponteiro subindo.

## feel-nothing

- 0: quatro setas iguais para leste entram em "chão", "ar", "mar" e "casa", todas no mesmo passo; a cortina fica parada e o vapor sobe reto; em "sem" ela olha o café, liso.

## by-latitude

- 0: os círculos entram em "lugar", "perto" e "polos", com as contas na mesma longitude: a do equador corre mais.
- 1: a câmera fecha; a casinha anda no círculo dela; entram "equador, 1.670 km/h" e "São Paulo, cerca de 1.500 km/h".
- 2: o disco de gelo anda um quarto de volta para leste, com um raio marcado para o olho seguir, e o Explorador gira junto: começa de três quartos para oeste, passa de frente no meio do plano, com a caneca diante do peito, e chega a três quartos para leste; "0 km/h" em "zero".

## the-rule

- 0: em "parada" ela puxa: a haste cede uns 14 graus, com as mãos nela e os dentes cerrados; em "Só" desiste e a haste volta com mola; olha a Terra em "planeta" e volta à haste em "adiante".
- 1: o plano abre na Terra azul do anterior; em 0,5 s a casca sai e mostra a rocha, com as três camadas por cima. Ela puxa, a luz passa a vermelha, e a rocha, que se via girar pelos veios, trava com um solavanco de 3 quadros na segunda "para"; o ar, o mar e as casinhas seguem para leste, uma volta a cada 5 s, até o fim; "só a rocha para". Som: o tranco.

## wind

- 0: o ar varre o chão: as palmeiras deitam, as telhas saem uma a uma em "ar", a do meio é arrancada em "correr"; a fundação e as pedras ficam; "1.670 km/h" em "mil". Som: o vento.
- 1: a barra do recorde cresce em "rajada", com o anemômetro girando na ponta; "408 km/h" em "quatrocentos" e "ciclone Olivia, 1996" em "ciclone".
- 2: a câmera abre a mesma régua; a segunda barra cresce até quatro vezes a primeira; o anemômetro sai voando; "1.670 km/h". Som: o anemômetro arrancado.

## sea-moves

- 0: o oceano desliza para leste sobre o fundo parado e sobe na borda do continente; as setas entram em "leste".
- 1: a água chega ao pé da régua e não assenta: uma onda a cada 1,5 s, cada uma até uma marca diferente, e a régua fica molhada até a mais alta; a escala fica em branco, e a interrogação entra em "conta".

## you-too

- 0: em "solto" o chão trava: o café se inclina, a cortina vai para leste, ela se assusta e o corpo passa do pé. Som: o tranco.
- 1: em "arremessado" ela sai de dentro de casa, inteira, com a xícara; a caixa de correio e o carro vão, o poste fica; "cerca de 1.500 km/h" em "cerca". Som: a passagem.
- 2: desde o começo as paredes rangem em rajadas cada vez mais fortes, o telhado levanta e bate de volta, e duas telhas saem voando; a laje pulsa em "fundação", a rachadura abre em "resto", e as paredes e o telhado saem em "rasgar", com a moldura da janela. Som: a casa se soltando.

## not-to-space

- 0: ela sai numa curva baixa, rente ao chão, e o caminho fica pontilhado; a seta para cima entra em "não" e é riscada em "espaço".
- 1: a seta de escape cresce de "passar" até depois de "segundo" ("11 km/s" em "onze"); o toco do giro sai em "giro" ("0,47 km/s" em "meio") e investe, treme e não passa da marca dele até "equador".

## the-pole

- 0: as setas do arremesso entram uma a uma, do equador ao polo, cada vez menores; no polo, só o ponto.
- 1: o Explorador com a caneca, ao lado da placa "polo, 10 km"; o velocímetro quase no zero e "menos de 3 km/h" em "menos"; o colchete entre duas pegadas em "passo".
- 2: número mudo. Na fala ele se prepara em quatro poses seguradas: nota ("parada"), finca os pés ("tropeço"), abraça o poste com os dois braços, o corpo colado nele (segundo "tranco"), e fecha os olhos e treme ("escapa"). No silêncio de 7 s, em segundos dele: segue tremendo de olhos fechados (até 0,6); o tranco (0,6): a placa e o chão dão um solavanco de 3 quadros, um pé avança e volta em 0,5 s com o corpo atrás, os olhos fechados, e o gole da caneca cai na neve (1,1); pausa imóvel (até 1,7); abre um olho, devagar (1,7); abre o outro (2,5); solta o poste (3,0); esfrega o casaco em três vaivéns (3,5 a 4,3); vira o corpo e o olhar para a direita, o horizonte vazio, com a caneca parada no ar (4,4 a 4,9); só então a câmera abre devagar para a metade vazia do quadro. Som: o solavanco (0,6 s) e o gole na neve (1,1 s).

## after-the-dust

- 0: a poeira baixa; o mar vai e volta até "assenta", e a linha da água fica fora do contorno antigo, que aparece em tracejado a partir de "não".

## the-bulge

- 0: a cintura alarga em "espalha" e entra "exagerado"; os dois raios saem do centro em "centro"; em "equador" a cópia do raio do polo deita sobre o do equador; em "vinte" o pedaço a mais acende: "21 km".

## water-piled

- 0: a câmera chega de perto e abre; a camada de mar veste a Terra em "mar"; duas setas para fora em "empurra".
- 1: a roupa vai do meio do tambor para a parede em "roupa", e a máquina treme; a Vigília espia, os olhos seguindo a roupa. Som: a centrífuga.
- 2: o tambor vira a Terra no mesmo círculo; a cintura abre e o calombo cresce em "calombo".

## water-leaves

- 0: a Terra freia até parar; o calombo balança em "nada" e escorre para os polos a partir de "escorre".
- 1: a câmera fecha no quarto de cima do corte; os dois raios voltam; "21 km mais perto do centro" em "perto"; em "puxam", seta grossa no polo e fina no equador.

## two-oceans

- 0: o controle "giro" desce desde "computador"; "simulação" em "simulou".
- 1: o mapa cresce da tela até o quadro e se redesenha: o equador seca do meio para fora e os dois oceanos escurecem; uma seta tracejada percorre a faixa de terra em "faixa".

## new-map

- 0: a câmera sobe para o norte, com as planícies ainda secas; "norte do Canadá" e "norte da Sibéria" entram nas próprias palavras, e a água avança sobre elas até cobri-las em "debaixo".
- 1: o resto de água escoa até "vira", a lama rachada aparece e o navio assenta torto. Som: o navio assentando.
- 2: a linha da mesma altura sai em "altura", o nível do sul desce em "sul", e a régua com "1.400 m" entra em "mil".

## map-limit

- 0: as margens do mapa ficam tracejadas em "vale", com o tracejado correndo, e o carimbo "provisório" bate em "enquanto" e quica uma vez. Som: o carimbo.
- 1: a Terra em corte se arredonda ao longo do plano; rachaduras crescem na cintura, com dois tremores, o segundo em "terremotos".
- 2: a interrogação já está no quadro e oscila; a linha do tempo se desenha da esquerda para a direita, com um marcador que vai e vem sem pousar; as bandeiras entram em "milhares" e "milhões". No segundo de silêncio, só as flâmulas e o marcador se mexem.

## year-long-day

- 0: a janela vazia, com o Sol parado no vidro; só o clarão respira.
- 1: a Terra dá a volta no Sol sem girar; a bandeira aponta sempre para o mesmo lado, acesa em meia volta e apagada na outra.
- 2: o rastro engrossa e se parte em doze meses, seis claros e seis escuros; a Terra segue no mesmo passo do plano anterior, e quem acompanha a fala é o anel: a metade clara incha primeiro, a escura no segundo "seis".

## the-moon-case

- 0: abre colado no chão cinza, com a linha da sombra andando, sem se reconhecer a Lua; a câmera abre até a Lua inteira em "Lua"; as etiquetas entram em "dia" e "noite".
- 1: o termômetro sobe a "120 °C"; em "cai" a sombra varre o chão e a coluna desce a "−130 °C".

## not-the-moon

- 0: em "ar" a camada de ar surge só na Terra; em "calor" manchas saem do lado claro e se gastam até o escuro.
- 1: o termômetro da Lua vai e volta entre os dois números; os dois da Terra ficam vazios, com interrogações.
- 2: os quatro globos giram cada um no ritmo do rótulo; a vaga "dia de um ano" entra em "nenhum", entre 128 e 256 dias.

## straight-wind

- 0: a câmera vai ao globo "256 dias", que cresce até tomar o quadro.
- 1: as setas se curvam em "desvia"; o furacão entra em "furacão", girando no sentido anti-horário.
- 2: as setas se endireitam, o furacão se desmancha e o giro freia; em "some" vira o corte e o laço se desenha: quente sobe no claro e atravessa por cima, frio desce no escuro e volta junto ao chão.
- 3: o escudo de nuvens incha, e em "sombra" a mancha escura cai no chão.

## magnetic-field

- 0: em "costuma" cada linha do campo falha por conta própria, sem sumir; a interrogação entra em "história".
- 1: o ferro borbulha, mais forte em "calor", e as linhas nascem dele em "ferro".
- 2: o ferro continua borbulhando; as linhas ficam em tracejado; a interrogação entra em "nenhum".

## why-not-stop

- 0: ela empurra a haste de volta em "Terra": a luz passa a verde e a Terra parte de parada e acelera até o ritmo de sempre. Som: a alavanca.
- 1: pontos de luz vão do Sol ao reservatório, que enche enquanto o contador corre até "39.000 anos de Sol".

## another-planet

- 0: o outro planeta espia pelo canto e avança em "outro", crescendo.
- 1: o outro planeta continua vindo pelo mesmo canto e encosta na Terra em "batida": riscos de impacto, um tranco, e a Terra tomba para longe da batida e passa a girar em outro eixo, marcado em tracejado; o planeta recua e vira contorno tracejado. Som: a batida.
- 2: ela ergue os olhos da xícara, que para no ar, enquanto o planeta enche o vidro. No silêncio, respira e pisca.

## earthquake

- 0: em "violentas" a Terra leva um tranco curto e segue girando no mesmo passo. Som: o tapa.
- 1: a câmera chega; o ponto do tremor solta três ondas; "2011, magnitude 9" em "dois".
- 2: o ponteiro dá a volta do dia; na lupa, em "menos", a lasca sai do fim do aro; a medida entra em "milionésimos".

## the-moon-brake

- 0: a Lua chega pela direita e está no lugar em "Lua".
- 1: o mar sobe em dois calombos; no segundo "freio" cada um vira sapata, com a haste saindo da Lua e faíscas nas pontas. Som: o freio raspando.
- 2: na lupa, em "quase", a lasca vem de fora e encosta depois do risco do fim; a medida entra em "milésimos".

## corals

- 0: as lascas partem do relógio em arco e pousam numa fila que diminui até sumir.
- 1: o Sol cruza o recife seis vezes, e o coral ganha uma linha por passagem; a etiqueta entra no primeiro "quatrocentos".
- 2: a mão com a lupa desce pela faixa de um ano enquanto a etiqueta conta até "cerca de 400 dias"; em "trezentos" a câmera abre e entra o coral de hoje, "365".
- 3: os dois ponteiros andam juntos, uma volta só; o do coral para em 22 h, o de hoje fecha 24 h, e os dois ficam assim até o corte.

## never

- 0: a Lua com as sapatas encostadas na Terra, que continua girando.
- 1: a barra do freio cresce até o fim da régua em "bilhões".
- 2: a régua sobe para dar lugar à barra do Sol, com 8% da outra; em "incha" o Sol cresce, fica vermelho e alcança a Terra.

## still-spinning

- 0: em "continuar" ela tira as mãos da haste, bate uma na outra, recua um passo e olha a Terra girar, com um aceno de cabeça.
- 1: a composição do gancho: o mar acende em "mar", as setas se curvam em "entorta", a casinha corre para leste em "leva", e "mais de 1.000 km/h" entra em "mais".

## only-clue

- 0: ela olha o café em "liso" e o Sol em "Sol"; o Sol sobe até o fim. No silêncio, sorri, respira e pisca.

## subscribe

- 0: plano mais fechado na janela, com a cozinha de noite; a Terra pequena gira no céu.
- 1: o planeta da vinheta já vem entrando e assenta; o cursor clica o botão em "inscreva", que vira "Inscrito"; até o fim o planeta balança, as nuvens passam e um brilho cruza o botão. Som: o clique.
