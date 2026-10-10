# Ficha visual — O que acontece se a Terra parar de girar?

Estado atual da direção de arte, depois de o vídeo inteiro ganhar imagem (2026-10-10). Os compromissos abaixo ainda são hipótese: o usuário não os viu. No mesmo dia o roteiro foi reescrito para ser entendido por quem chega sem saber nada: a seção "Pendências da reescrita", no fim, lista o que a imagem ainda deve à fala nova. A folha de conferência é a composição `terra-elenco` (quadros em `out/earth-stops-spinning/conceito/`).

## Compromissos

Nenhum foi decidido pelo usuário ainda. São as hipóteses com que os planos foram escritos (69, depois da reescrita).

- **Quem conduz.** A Vigília, da trupe do canal, faz "você": mora na casa de São Paulo, toma café na janela e é quem opera a alavanca do giro. Ela nunca fala.
- **Quem mais tem rosto.** Só o Explorador, o segundo ator da trupe, de gorro e casaco: é quem está perto do polo. A Terra, o Sol, a Lua e o outro planeta não têm rosto: são objetos, e um rosto daria à Terra uma intenção que o vídeo não afirma.
- **A forma da rotação.** A rotação é uma coisa que se liga e desliga: uma alavanca grande, com a placa "rotação" (a palavra da narração), ao lado da Terra. Ela aparece no gancho e é puxada de uma vez na parada. Em `after-the-dust` o experimento é refeito: ela volta para ligado e desce devagar, e é isso que mostra que são dois experimentos, o de repente e o aos poucos. Fica desligada enquanto o mundo está parado, volta para ligado quando o vídeo passa ao que é real e fecha o vídeo ligada. É o que separa o experimento mental do mundo de verdade.
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
- A fileira de globos simulados resume os modelos em quatro etiquetas de giro em relação às estrelas ("16 dias", "64 dias", "128 dias", "256 dias"); a vaga vazia fica entre as duas últimas, onde a conta a põe quando o dia é contado pelo Sol (196 e 848 dias), e por isso a etiqueta dela diz "dia de um ano pelo Sol". Os estudos rodaram mais casos.
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

## Pendências da reescrita

A narração mudou em 2026-10-10 e ainda não foi gerada. As cenas em código tiveram só as deixas e os planos ajustados à fala nova, sem render: o movimento fino depende do tempo real da fala. O que a imagem ainda deve ao texto, por cena:

- **Saíram do roteiro**, com os desenhos deles (no git): `what-spin-does`, `straight-wind`, `magnetic-field` e `earthquake`; o plano das duas bacias de `new-map`; o reservatório de luz de `why-not-stop`; as bandeiras de prazo de `map-limit`.
- **`how-fast`, planos 2 e 3**: a seta "leste" na Terra e o carrinho a 100 km/h ao lado do velocímetro de 1.670 km/h. A comparação com o carro é da fala e ainda não está na tela.
- **`feel-nothing`**: a cozinha ganha rodas e estrada em "ônibus", com "comparação".
- **`the-rule`, plano 2 (novo)**: o ônibus-cozinha freia, e a Vigília e o café seguem para a frente; a palavra "inércia" na tela. Hoje a hesitação do plano 1 segura a tela durante essa fala. É o desenho que mais pesa: a regra do vídeo inteiro é entendida aqui.
- **`after-the-dust` (dois planos novos)**: a Terra volta inteira, a alavanca vai para ligado e desce devagar, sem poeira nem tranco. Hoje a cena ainda mostra a poeira baixando sobre a Terra parada, que é a imagem do experimento anterior.
- **`water-piled` e `water-leaves`**: as setas para longe do eixo; o mar sem a camada mais espessa no equador e sem o colchete de espessura; em `water-leaves`, a água descendo do equador aos polos, sem as setas de gravidade mais grossas nos polos.
- **`map-limit`, plano 3**: só a linha do tempo e a interrogação (feito).
- **`never`, plano 2**: a etiqueta da barra passou a "dia de um mês e meio: pelo menos 50 bilhões de anos (extrapolação)"; a régua continua indo até 100 bilhões, e a barra que a atravessa inteira afirma mais do que a etiqueta.
- **`year-long-day`, planos 1 e 2 (novos)**: a Terra de hoje girando, com a casinha passando do claro ao escuro; depois os dois movimentos na mesma imagem, cada um com a etiqueta dele ("rotação: 1 dia", "volta em torno do Sol: 1 ano"), e a rotação se apagando em "desligou". Hoje a janela com o Sol parado segura a tela nesses dois trechos.
- **`not-the-moon`**: os globos passaram a ser o plano 2 e os termômetros sem número, o 3. Nos globos, falta o ar subindo no lado claro e descendo no escuro, e o escudo de nuvens em "nuvens" (o desenho existia em `straight-wind`). A vaga do dia de um ano saiu da fileira e deve voltar no plano dos termômetros, em "nenhuma", com a etiqueta "dia de um ano pelo Sol".
- **`you-too`, plano 3**: a fala diz que a construção "pode" se rasgar; a imagem mostra como fato. A caixa de correio, presa ao solo, sai voando com o que não está preso.
- **`still-spinning`, plano 2**: saíram as setas do vento; falta a linha entre o lado claro e o escuro passando pela casinha, para "alterna o dia e a noite".
- **`the-pole`, número mudo**: o horizonte "vazio e quieto" também se lê como "ali está tudo bem"; a fala diz que quem está lá escapa "pelo menos do tranco".
- **Planos longos**: o `pnpm check-script` acusa 20 planos com mais de 8 s; os maiores estão em `year-long-day`.
