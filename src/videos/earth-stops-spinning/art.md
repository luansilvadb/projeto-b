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
- **Desenho**: o de `src/art/Vigilia.tsx`, sem mudança. Objeto de cena: a xícara de café, que volta do gancho ao fechamento e mostra se o chão está liso ou não.
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
- Em `another-planet`, a Terra girando em outro eixo, em tracejado, é ilustração: a fonte diz só que a batida mudaria o jeito de ela girar.
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
| `sea-moves` | "1.670 km/h" pequeno, andando com a água. A régua em branco, com a interrogação, é quem diz que a altura não tem conta. |
| `after-the-dust` | Dois planos novos: a alavanca volta para ligado e a poeira some ("de novo"); depois desce em cinco dentes e a Terra freia sem tranco ("aos poucos, em décadas"). Em "mar", o contorno antigo fica em tracejado, com duas setas do equador para os polos. |
| `water-piled` | A reta tracejada da roupa que tenta seguir em frente e a parede que acende; câmera lenta nesse trecho. O tambor vira a Terra vista do polo, com as setas da gravidade no lugar da parede. De lado: setas tracejadas para longe do eixo, maiores no equador, e uma marca sem seta em cada polo. O mar tem a mesma espessura em toda a volta. |
| `water-leaves` | A rocha continua larga no equador (contorno aceso). Um círculo tracejado na distância do polo serve de nível: o equador passa dele ("alto"), os polos ficam nele ("baixo"). A água termina em dois oceanos polares, com uma faixa seca no equador. |
| `map-limit` | A Terra perde a largura do equador, com o contorno de hoje em tracejado e a faixa "de milhares a milhões de anos". O plano final é o mapa de novo, com "simulação", "provisório" e o selo. |
| `year-long-day` | Quatro planos: a Terra de lado com a casinha passando por "dia" e "noite"; os dois movimentos com as etiquetas "rotação: 1 dia" e "volta em torno do Sol: 1 ano", e a primeira riscada e cinza em "desligou"; a bandeirinha apontando para a "estrela"; o calendário em anel. |
| `not-the-moon` | Três planos na ordem da fala: a Lua com números e a Terra com interrogações; a Terra parada com o lado claro laranja ("mais quente que hoje") e o escuro azul ("mais frio que hoje"); o globo de 128 dias com o laço do ar e o escudo de nuvens. |
| `corals` | A etiqueta "1 ano" nas duas faixas, que é o que diz que o coral também marca o ano. |
| `never` | Um ponto marcado na Terra passa várias vezes pela Lua. Plano novo, visto de cima: a Terra desacelera até o ponto ficar sempre de frente para a Lua, a sapata se solta, e as duas seguem girando ("sincronizadas, não parada", "1 dia = 47 dias de hoje"). A régua de tempo não tem graduação: a barra do freio sai do quadro ("no mínimo, dezenas de bilhões de anos (extrapolação)") e a do Sol é curta ("menos de 8 bilhões"). |
| `still-spinning` | A noite é uma fatia a oeste; a casinha cruza a linha do escuro para o claro em "noite". A luz deste plano vem da direita. |

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
- Ainda em aberto, sem conserto:
  - `water-leaves`, plano 2: a borda da faixa seca é reta (mudar pede mexer em `parts/CutEarth.tsx`).
  - `water-piled`, plano 3: os últimos 6 s, depois de "água", têm só as setas pulsando.
  - `not-the-moon`, plano 3: depois de "sombra" são 6,5 s só com o laço e as nuvens; a frase final cai sobre o globo "giro de 128 dias".
  - `feel-nothing`: os primeiros 4 s são um quadro imóvel, e a cozinha vira ônibus em 0,5 s.
  - As outras cenas redesenhadas (`how-fast`, `you-too`, `not-to-space`, `sea-moves`, `not-the-moon`, `corals`, `still-spinning`) não passaram por crítica de movimento.
- Ações que o roteiro não pede e entraram na freada do ônibus: a mão que procura onde se agarrar, o gole de café que vai ao lado dela, a mancha na parede e a batida amortecida. São decisão do usuário.
