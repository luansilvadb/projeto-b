# Ficha visual — O que acontece se a Terra parar de girar?

Estado atual da direção de arte, depois de o vídeo inteiro ganhar imagem (2026-10-10). Os compromissos abaixo ainda são hipótese: o usuário não os viu. No mesmo dia o roteiro foi reescrito para ser entendido por quem chega sem saber nada, e as cenas foram redesenhadas para a fala nova: a seção "Depois da reescrita", no fim, diz o que mudou e o que ainda falta conferir. A folha de conferência é a composição `terra-elenco` (quadros em `out/earth-stops-spinning/conceito/`).

## Compromissos

Nenhum foi decidido pelo usuário ainda. São as hipóteses com que os planos foram escritos (69, depois da reescrita).

- **Quem conduz.** A Vigília, da trupe do canal, faz "você": mora na casa de São Paulo, toma café na janela e é quem opera a alavanca do giro. Ela nunca fala.
- **Quem mais tem rosto.** Só o Explorador, o segundo ator da trupe, de gorro e casaco: é quem está perto do polo. A Terra, o Sol, a Lua e o outro planeta não têm rosto: são objetos, e um rosto daria à Terra uma intenção que o vídeo não afirma.
- **A forma da rotação.** A rotação é uma coisa que se liga e desliga: uma alavanca grande, com a placa "rotação" (a palavra da narração), ao lado da Terra. Ela aparece no gancho e é puxada de uma vez na parada. Em `after-the-dust` o experimento é refeito: ela volta para ligado e desce devagar, e é isso que mostra que são dois experimentos, o de repente e o aos poucos. Fica desligada enquanto o mundo está parado, volta para ligado quando o vídeo passa ao que é real e fecha o vídeo ligada. É o que separa o experimento mental do mundo de verdade.
- **A ponte do ônibus para a Terra.** Em `the-rule`, o ônibus encolhe, pousa sobre a Terra e vira a casinha da Vigília: é o que diz que a regra é a mesma.
- **O ônibus é a casa.** A comparação da narração (em estrada lisa não se sente a velocidade; na freada, quem está de pé continua indo) é feita com a cozinha da Vigília, que ganha rodas em `feel-nothing` e freia em `the-rule`. Leva "comparação". O gesto da freada (ela e o café vão para a frente) é o mesmo de `you-too`, quando o chão trava.
- **O que as cores dizem.** O modo troca quando o lugar troca: a Terra vista de fora, a casa de quem assiste, o chão durante a parada, o gelo do polo, o mapa do mundo parado, o fundo liso em que se mede e compara, e o interior da Terra.
- **Onde não há número, a tela mostra interrogação.** O avanço do mar, a temperatura da Terra parada e o prazo de a parte sólida se ajustar não ganham valor nem desenho de resultado.
- **O que é modelo ou comparação leva etiqueta.** "Simulação" no mapa dos dois oceanos, "provisório" quando a rocha começa a se arredondar, "comparação" no ônibus, na máquina de lavar e no freio da Lua, "exagerado" na largura da Terra no equador.
- **Selo da fonte** nos planos que afirmam o que um estudo mediu ou calculou, como no vídeo do sono.

## Elenco

### Vigília ("você")

- **Papel**: protagonista. Vive a casa, o café, o ônibus e o arremesso, e opera a alavanca.
- **Desenho**: o de `src/art/Vigilia.tsx`, sem mudança no desenho; só a borda de luz quente do rosto está desligada neste vídeo (abaixo). Objeto de cena: a xícara de café, que volta do gancho ao fechamento e mostra se o chão está liso ou não.
- **Sem a borda quente (11/10/2026)**: o usuário apontou, em 00:08 (cozinha, com a caneca) e 00:21 (junto à alavanca "rotação"), um crescente creme na lateral direita da cabeça, que lia-se como uma aba solta. A origem é o campo `warm` das cores de `src/art/Vigilia.tsx` (o caminho `M35,-2Q51,-50 23,-107…` da borda de luz quente no rosto, `#ffe3a0`), presente em toda pose. Nas duas paletas deste vídeo (`vigilia` e `explorer`, em `palette.ts`) `warm` virou `"none"`: o caminho não desenha e a barriga, o corpo turquesa, a borda fria à esquerda, o rosto, as mãos e os cascos claros e a caneca ficam como estavam. O desenho compartilhado e os outros vídeos não mudam. Vale para todas as cenas com a Vigília ou o Explorador (`one-turn`, `by-latitude`, `the-rule`, `you-too`, `the-pole`, `feel-nothing`, `how-fast`, `only-clue`, `still-spinning`, `water-piled`, `another-planet`, `not-to-space`, `switch-off`, `why-not-stop`, `wind`, `after-the-dust`, `subscribe`).
- **Nunca**: fala; aparece ferida. No arremesso de `you-too` ela sai de quadro inteira, com a xícara; em `not-to-space` fica à vista até o fim, rente ao chão, porque o plano afirma que ela não vai para o espaço.

### Explorador (perto do polo)

- **Papel**: quem vive a parada onde ela é quase nada. Aparece em `by-latitude` e em `the-pole`, e precisa ser reconhecido como o mesmo.
- **Desenho**: a mesma construção chibi da Vigília (`src/art/Vigilia.tsx`), de casaco coral, para saltar do gelo, luvas e pernas ameixa, gorro ameixa de faixa amarela com pompom branco, óculos de neve erguidos na faixa e cachecol amarelo, que é o que diz que o corpo coral é casaco; leva uma caneca amarela. Está em `parts/Actor.tsx` (`Explorer`) e na folha `terra-elenco`. O usuário ainda não o viu: é a primeira coisa a mostrar.
- **Poses do número mudo**: moram em `scenes/ThePoleScene.tsx` (nota, finca os pés, abraça o poste, fecha os olhos, o passo, confere com um olho, solta, esfrega o casaco, olha longe).
- **Nunca**: fala.

### Sem rosto

A Terra (`src/art/Earth.tsx`), o Sol (`src/art/Sun.tsx`), a Lua, o outro planeta, o coral e o boneco do equador de `how-fast`, que é uma silhueta.

## Paletas

| Nome (em `palette`) | Quando vale | Fundo | Assunto | Acento |
|---|---|---|---|---|
| `espaco` | a Terra vista de fora, girando ou parada; a Lua; o Sol | índigo a azul profundo, com estrelas | a Terra azul e verde, a rocha em corte | amarelo do Sol e da alavanca |
| `casa` | a vida de quem assiste: a cozinha, a janela, a máquina de lavar | pastel quente de manhã | o verde-água da Vigília | o café e o Sol na janela |
| `tempestade` | o chão durante a parada | ocre e laranja de poeira | o que é arrastado, em silhueta escura | o que fica preso ao chão, claro |
| `gelo` | perto do polo | ciano muito claro e branco azulado | o casaco do Explorador | a placa coral |
| `mar` | o mundo parado em mapa e o recife dos corais | turquesa e areia | os continentes e os dois oceanos | o tracejado do que é provisório |
| `ideia` | medir e comparar: réguas, barras, relógios, linhas do tempo | liso, um matiz por ideia | a barra ou o objeto medido | a barra que importa |

Os valores ficam para `palette.ts`, no animatic.

## Réguas que voltam

- **Os três círculos de latitude** (equador, São Paulo, polo), na mesma Terra de lado: `by-latitude` e `the-pole`.
- **Os dois raios** que saem do centro da Terra: `the-bulge` e `water-leaves`.
- **O relógio de um dia**, de onde saem as lascas: `the-moon-brake` e `corals`.
- **O ônibus-cozinha**: `feel-nothing` e `the-rule`.
- **A janela da cozinha**: `one-turn`, `another-planet`, `only-clue` e `subscribe`.

## Simplificações da imagem

- A largura da Terra no equador e a superfície do mar que a acompanha são desenhadas exageradas para se ver, sempre com a etiqueta "exagerado"; a diferença real é de 21 km em 6.378. O mar não é desenhado mais espesso no equador: a fonte sustenta a superfície mais longe do centro, e não uma camada mais grossa.
- As setas do efeito da rotação apontam para longe do eixo, e não do centro da Terra: maiores no equador, nulas nos polos.
- O mapa dos dois oceanos é esquemático: continentes em manchas simples, só com os cinco traços que o texto do estudo sustenta (dois oceanos polares; faixa de terra contínua no equador; norte do Canadá e da Sibéria submersos; fundo do mar equatorial emerso; oceano do sul 1.400 m mais baixo). Os mapas originais não foram lidos.
- O navio encalhado no fundo seco do equador é ilustração: a fonte só diz que águas rasas emergem.
- O coral é um coral genérico; a fonte não diz a espécie.
- A fileira de globos simulados resume os modelos em quatro etiquetas de giro em relação às estrelas ("16 dias", "64 dias", "128 dias", "256 dias"). O globo que cresce para mostrar o ar e as nuvens é o de 128 dias: os modelos só mostram essa circulação a partir de giros de 64 dias. A vaga do "dia de um ano" saiu: o limite é dito na fala e mostrado pelos termômetros sem número. Os estudos rodaram mais casos.
- O laço do ar mostra também a volta fria rente ao chão, que a fala não diz; vem dos mesmos modelos.
- O laço do ar na Terra parada vem de modelos de rotação lenta, e não deste caso.
- O arremesso da Vigília é cartum: ninguém aparece ferido.
- A alavanca e a Vigília ao lado da Terra são o palco do experimento, e não um lugar.
- A Terra em corte é desenhada metade vista de fora, metade em corte, para o giro continuar à vista.
- Em `the-rule`, o ar, o mar e as casinhas são três faixas em latitudes diferentes sobre a parte sólida nua; não quer dizer que haja ar só no norte e casas só no sul.
- Os calombos de maré de `the-moon-brake` e de `never` são mar, na cor do mar, exagerados, com uma chapa fina de sapata por fora; levam "comparação".
- A ilha sob o ponto do Japão, em `earthquake`, é uma mancha esquemática, sem litoral.
- As linhas do coral em corte são amostra (na proporção de 400 para 365); a contagem está na etiqueta.
- O Sol inchado ao lado da régua de tempo está fora de escala.
- A Terra se arredondando em `map-limit` vem de uma fonte de divulgação que trata da parada de repente; o ritmo do ajuste não tem fonte, e o plano não o sugere.
- Em `another-planet`, a Terra girando em outro eixo, em tracejado, é ilustração: a fonte diz só que a batida mudaria o jeito de ela girar. A fala termina em "e a Terra continuasse girando", e a imagem do eixo torto segue girando (o giro só muda de ritmo).
- Em `water-piled`, a cintura da rocha que "acende" de "rocha" a "mole" é ilustração do "ela cede num tempo muito longo": a fonte (viscosidade, estudo [17]) fala em escala geológica, e a tela não dá prazo.
- Em `water-leaves`, a faixa seca do equador tem a linha d'água ondulada e uma orla clara; as duas bordas são a mesma latitude, e a ondulação é só desenho.
- Em `map-limit`, a faixa do prazo não tem número para a Terra parada; a nota de 3 mil anos é a escala de tempo do estudo de 1967 para a Terra de hoje, não o prazo da Terra parada, e o rótulo diz isso ("Terra de hoje: escala de 3 mil anos, não o prazo"). "De milhares a milhões de anos" saiu da tela com a fala.
- Em `not-the-moon`, a última frase já não compara extremos: o globo (de 128 dias, modelo) não ganha halo mais leve que o da Lua, porque nenhuma fonte compara a Terra parada com a Lua; só a Lua volta, como o caso sem ar. A etiqueta do globo passou a "modelo: giro de 128 dias", para a última frase não o ler como a Terra parada; a Lua entra em "Lua" (a terceira), com "Lua: sem ar".
- O relógio de "quase 24 h" para em 96,5% da volta, para a fresta se ver; o valor real seria 99,7%.

## Número mudo

Um só, em `the-pole`, com 7 s sem fala: o Explorador se prepara para o pior, e o que chega é um tropeço; depois ele se vira devagar para o horizonte, vazio e quieto. Fica entendido que ali o tranco foi quase nada, e que o depois está em aberto. A poeira no horizonte, da primeira decupagem, saiu: nenhuma fonte descreve o que chega ao polo.

## Depois da reescrita

As cenas abaixo foram redesenhadas em 2026-10-10 para a narração nova e conferidas em quadros parados. O usuário ainda não viu nenhuma delas.

| Cena | O que mudou na imagem |
|---|---|
| `how-fast` | A seta "leste" sobre o equador. Um carrinho vermelho a "100 km/h" larga com o boneco e fica nos 6% da volta, com o contador "quase 17 dias"; a linha fica branca por onde o boneco passou e vermelha por onde o carro passou. |
| `feel-nothing` | A cozinha vira ônibus em "ônibus" (rodas, cabine, estrada), com "comparação"; o interior não muda. |
| `the-rule` | Plano novo: o ônibus freia, a Vigília e o café seguem para a frente, com a seta dela e a palavra "inércia". O velocímetro da parede cai a zero na freada. Depois o ônibus pousa na Terra e vira a casinha, e a parte sólida trava. |
| `you-too` | Saíram a caixa de correio e o poste. A casa range e racha durante a fala e só se solta em "seguir". |
| `not-to-space` | A seta para cima entra em "cima"; "mais de 20 vezes" entre as duas setas da régua. |
| `sea-moves` | "1.670 km/h" pequeno, andando com a água, a partir de "velocidade". A régua em branco, com a interrogação, é quem diz que a altura não tem conta. |
| `after-the-dust` | Dois planos novos: a alavanca volta para ligado e a poeira some ("de novo"); depois desce em cinco dentes e a Terra freia sem tranco ("aos poucos, em décadas"). Em "mar", o contorno antigo fica em tracejado; a terra seca e as duas setas do equador para os polos correm juntas de "sai" a logo depois de "polos". |
| `another-planet` | Plano 3 abre em "girando", com a xícara na mão (já não "parada no ar"); o eixo torto continua girando no plano 2. |
| `the-moon-case` | A etiqueta do termômetro diz "exemplo medido" (os 120 °C e −130 °C são um exemplo do cartaz da NASA/LRO, que diz "perto do equador" e acrescenta que os polos são mais frios (−250 °C); a ficha da NASA dá até 95 K, cerca de −178 °C, à noite no equador). |
| `water-piled` | A reta tracejada da roupa que tenta seguir em frente e a parede que acende; câmera lenta nesse trecho. O tambor vira a Terra vista do polo, com as setas da gravidade no lugar da parede. De lado: setas tracejadas para longe do eixo, maiores no equador, e uma marca sem seta em cada polo. O mar tem a mesma espessura em toda a volta. Em "afastada" entra o círculo tracejado do polo, e em "rocha" a cintura da rocha acende devagar até "mole" (a rocha acompanha a água). |
| `water-leaves` | A rocha continua larga no equador (contorno aceso). Um círculo tracejado na distância do polo serve de nível: o equador passa dele ("alto"), os polos ficam nele ("baixo"). A água termina em dois oceanos polares, com uma faixa seca no equador, de linha d'água ondulada e orla clara (antes, bordas retas). |
| `map-limit` | A Terra perde a largura do equador, com o contorno de hoje em tracejado e a faixa do prazo sem número. O plano final é o mapa de novo, com "simulação", "provisório" e o selo. |
| `year-long-day` | Quatro planos: a Terra de lado com a casinha passando por "dia" e "noite"; os dois movimentos com as etiquetas "rotação: 1 dia" e "volta em torno do Sol: 1 ano", e a primeira riscada e cinza em "desligou"; a bandeirinha apontando para a "estrela"; o calendário em anel. |
| `not-the-moon` | Três planos na ordem da fala: a Lua com números e a Terra com interrogações; a Terra parada com o lado claro laranja ("mais quente que hoje") e o escuro azul ("mais frio que hoje"); o globo de 128 dias com o laço do ar e o escudo de nuvens, que incha de "nuvens" a "sombra". Na última frase o globo não ganha cor nem escala: só a Lua volta à direita, com halo de dia e de noite, sem número, e a etiqueta "Lua: sem ar". |
| `corals` | Na ordem da fala nova: o recife só cresce uma linha por dia (sem idade); em "contar" entra a lupa; "1 ano" nomeia a faixa em "ano"; "há 400 milhões de anos" entra em "centenas"; "cerca de 400 linhas" e "365 linhas" (e não "dias"). |
| `map-limit` | A faixa do prazo diz "o prazo, nenhuma fonte que achamos diz" com a interrogação; em "três", "Terra de hoje: escala de 3 mil anos, não o prazo". |
| `feel-nothing` | Ela toma um gole de café em "sente"; a cozinha vira ônibus em cerca de 1,2 s e a estrada pega velocidade aos poucos. |
| `never` | Um ponto marcado na Terra passa várias vezes pela Lua. Plano novo, visto de cima: a Terra desacelera até o ponto ficar sempre de frente para a Lua, a sapata se solta, e as duas seguem girando ("sincronizadas, não parada", "1 dia = 47 dias de hoje"). A régua de tempo não tem graduação: a barra do freio sai do quadro ("no mínimo, dezenas de bilhões de anos (extrapolação)") e a do Sol é curta ("menos de 8 bilhões"). |
| `still-spinning` | O mar acende como uma cinta larga no equador. A noite é uma fatia a oeste; a casinha cruza a linha do escuro para o claro em "noite". A luz deste plano vem da direita. |

### Decisões que são do usuário

- **`the-pole`, número mudo.** O horizonte "vazio e quieto" lê-se como "o depois está em aberto" e também como "ali está tudo bem". A fala diz que quem está lá escapa "pelo menos do tranco". Não foi mexido.
- **`how-fast`, o contador.** "Quase 17 dias" aparece ao lado de um carro que andou 6% da volta. A alternativa é acelerar o tempo depois de o boneco fechar a volta e deixar o carro completar a dele enquanto o contador sobe.
- **`the-rule`, o velocímetro na freada.** Em `feel-nothing` ele mede o chão da Terra; na freada passa a medir o ônibus.
- **`water-piled`, a câmera lenta** no tambor, entre "tenta" e "espremida".
- **`never`, a etiqueta "comparação"** só está no plano da sapata encostada, e não no plano da sincronia.
- **Etiquetas que o roteiro não pedia:** "dia", "noite" e "estrela" em `year-long-day`; "1 ano" em `corals`.

### O que falta conferir

- O tempo das doze cenas redesenhadas foi revisto com a voz real, e sete delas (`feel-nothing`, `the-rule`, `after-the-dust`, `water-piled`, `water-leaves`, `year-long-day`, `never`) passaram por uma crítica de movimento sobre o render. Os quatro defeitos relevantes que ela achou foram corrigidos, e só conferidos em quadros parados depois disso:
  - `never`: vista de cima, a Terra freava num sentido, zerava e voltava no outro; agora a Terra e a Lua giram no mesmo sentido o tempo todo, e a Terra só perde velocidade até igualar a da Lua.
  - `year-long-day`: a bandeira fica de frente para o Sol em "frente" e de costas em "costas"; o plano dá uma volta e meia, com a meia volta entre as duas palavras feita como gesto de demonstração. A linha de mira é sempre horizontal, até a marca da estrela na borda.
  - `the-rule`: depois da freada, a Vigília desliza ao longo do ônibus em câmera lenta, com o caminho pontilhado, e a parede da frente a segura em "segure"; o café vai junto e mancha a parede.
  - `water-leaves`: a Terra chega girando e freia em "rotação"; as setas da gravidade entram iguais em toda a volta; a água balança em "mantém"; a descida ocupa o plano 2 inteiro.
- Resolvido em 11/10/2026 (render por `pnpm scene`, crítica em quadros consecutivos por tira e mapa de movimento; o usuário ainda não viu):
  - `water-leaves`: borda seca reta, trocada por linha d'água ondulada com orla.
  - `water-piled`: sem trecho parado (o mapa não acha nenhum de 2 s ou mais); a rocha acompanha a água.
  - `not-the-moon`, plano 3: nuvens que incham ao longo da frase, sombra que se espalha, e a última frase ganha imagem (halos e a Lua).
  - `feel-nothing`: o quadro imóvel ficou com o gole e a calma; a transformação em ônibus passou de 0,5 s para cerca de 1,2 s. Os 3,5 s entre o gole e "solo" ficam parados de propósito: é "não sente nada".
- Cenas sem crítica de movimento antes e agora com ela (`how-fast`, `you-too`, `not-to-space`, `sea-moves`, `not-the-moon`, `corals`, `still-spinning`) e congelamentos de `one-turn`, `you-too` e `after-the-dust`: sem defeito bloqueante nem relevante; os polimentos estão em `out/rascunho/critica/`.
- `after-the-dust`, plano 2, fechado em 11/10/2026 (`pnpm scene`; o usuário ainda não viu). A auditoria achou 3,4 s parados (24,4 a 27,8 s da cena): a terra seca mudava de contorno em 2,6 s a partir de "mar" (22,7 s) e as setas saíam em 1,2 s, e tudo já estava no lugar em 25,3 s, antes de a fala dizer que a água sai do equador ("sai", 23,8 s) e se junta nos polos ("polos", 26,7 s). Agora a câmera chega e o contorno antigo aparece em "mar", e a terra seca e as setas correm em passo constante de "sai" até 0,5 s depois de "polos" (23,8 a 27,2 s): é o mesmo deslocamento que já estava indicado, sem fenômeno nem etiqueta nova. Conferência: o mapa de diferença entre quadros por segundo deu 0,47 / 0,02 / 0,00 / 0,00 antes e 0,42 / 0,03 / 0,03 / 0,03 depois, nas janelas de 1 s que terminam em 24, 25, 26 e 27 s (valor pequeno porque só a terra e as setas mudam num quadro de 1080p); o `critico-de-movimento`, em quadros consecutivos de 22 a 27,9 s, não achou trecho parado nem defeito novo, e anotou que o alargamento da terra é sutil frente ao tracejado (a leitura vem das setas e do verde que invade o contorno): polimento aberto, não bloqueia. Antes em `out/rascunho/after-dust/antes-*.png` e depois em `depois-*.png` (24,4, 25,5, 26,7 e 27,7 s).
- Polimentos da crítica, fechados em 11/10/2026 (`pnpm scene`, quadros consecutivos em `out/rascunho/polish/`; o usuário ainda não viu). Antes → depois, com o tempo da fala real:
  - `how-fast`, plano 2: a fita saía em "volta" (8,6 s), 2,7 s depois de "equador" (5,95 s) e em 1,4 s. Agora sai em "equador" e corre a passo constante até "quarenta" (10,6 s), junto com a frase ("40.000 km" em 10,7 s). Quadros 5,4 a 11,8 s a cada 0,4 s.
  - `corals`, plano 3: o contador usava curva suave e marcava 400 com a lupa parada antes de "quatrocentas" (16,04 s). Agora é linear e chega a 400 em 16,4 s, no meio da palavra (352 em 15,4 s; 383 em 15,9 s).
  - `sea-moves`, plano 1: "1.670 km/h" entrava em "vento" (6,8 s), 0,9 s antes do corte em 7,66 s. Agora entra em "velocidade" (3,4 s) e fica 4 s na tela.
  - `not-to-space`, plano 2: o toco (0,47 km/s, uns 57 px) só encolhia 30% e tremia 4 px, e se lia como uma ponta de seta parada; a janela da tentativa era 0,5 s. Agora estica duas vezes (1,2 e 0,7 km/s, 13 quadros cada, de 10,8 a 11,6 s) e volta à marca, e a etiqueta "0,47 km/s" foi para a direita da ponta mais esticada, que antes passava por baixo dela.
  - `still-spinning`, plano 2: o mar que acende era um aro de 26 px, que sumia no azul do mar. Agora é uma cinta de 80 px no equador, recortada no disco; entra em "mar" (8,5 s) e fica até o fim do plano.
- Conferidos sem alteração, com evidência:
  - `why-not-stop`: a ação (alavanca, olhar) acaba em 2,3 s; dos 2,3 s ao corte (10,3 s) a Terra volta a girar sem parar (mapa de diferença entre quadros constante, 0,2 de média em 8 s) e a Vigília respira e pisca (0,35 de média na metade dela). É a imagem da frase "a Terra de verdade não vai parar": parada de propósito seria o contrário. Mantida.
  - `not-the-moon`, plano 3: "modelo: giro de 128 dias" lê-se inteiro desde que o globo cresce (22,7 s) até o fim do plano, a cerca de um terço da escala. A Lua entra em "mas" (41,45 s, pop de 0,4 s), com "Lua" em 41,6 s, e fica 1,6 s inteira; a palavra "Lua" soa em 42,36 s. Lê-se; mantida.
- Duração das cenas, em quadros a 30 fps (`out/earth-stops-spinning/cenas/<id>.mp4`): `how-fast` 854, `corals` 767, `sea-moves` 448, `not-to-space` 382, `still-spinning` 455, `why-not-stop` 309, `not-the-moon` 1300. Escuta e ritmo ficam com o usuário.
- Ações que o roteiro não pede e entraram na freada do ônibus: a mão que procura onde se agarrar, o gole de café que vai ao lado dela, a mancha na parede e a batida amortecida. São decisão do usuário.

## Correção científica de 11/10/2026 (segunda auditoria)

- `not-the-moon`: sai o halo mais leve do globo contra o da Lua (afirmava que a Terra parada seria menos extrema que a Lua, sem modelo); a Lua volta sozinha, com "Lua: sem ar".
- `map-limit`: a nota diz "Terra de hoje: escala de 3 mil anos, não o prazo".
- `the-moon-case`: a etiqueta diz "exemplo medido".
- `wind`: o selo diz "WMO; Courtney et al., 2012".

## Faixa amarela do chibi (11/10/2026)

- Vigília e Explorador: `warm` é `none` em `palette.ts`; a faixa creme/amarela que cortava o flanco do corpo some e a silhueta fica inteira. Mãos, pés, caneca e acessórios não mudam. As 17 cenas com o chibi foram renderizadas de novo e o arquivo de entrega só trocou a imagem (ver `corte-final.md`). Crítica independente de quadro sobre os 11 comparativos: sem defeito.
