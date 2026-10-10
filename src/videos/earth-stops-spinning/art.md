# Ficha visual — O que acontece se a Terra parar de girar?

Estado atual da direção de arte, depois de o vídeo inteiro ganhar imagem (2026-10-10). Os compromissos abaixo ainda são hipótese: o usuário não os viu. A folha de conferência é a composição `terra-elenco` (quadros em `out/earth-stops-spinning/conceito/`).

## Compromissos

Nenhum foi decidido pelo usuário ainda. São as hipóteses com que os 79 planos foram escritos.

- **Quem conduz.** A Vigília, da trupe do canal, faz "você": mora na casa de São Paulo, toma café na janela e é quem opera a alavanca do giro. Ela nunca fala.
- **Quem mais tem rosto.** Só o Explorador, o segundo ator da trupe, de gorro e casaco: é quem está perto do polo. A Terra, o Sol, a Lua e o outro planeta não têm rosto: são objetos, e um rosto daria à Terra uma intenção que o vídeo não afirma.
- **A forma do giro.** O giro é uma coisa que se liga e desliga: uma alavanca grande, com a placa "giro", ao lado da Terra. Ela aparece no gancho, é puxada na parada, fica desligada enquanto o mundo está parado, volta para ligado quando o vídeo passa ao que é real e fecha o vídeo ligada. É o que separa o experimento mental do mundo de verdade.
- **O que as cores dizem.** O modo troca quando o lugar troca: a Terra vista de fora, a casa de quem assiste, o chão durante a parada, o gelo do polo, o mapa do mundo parado, o fundo liso em que se mede e compara, e o interior da Terra.
- **Onde não há número, a tela mostra interrogação.** O avanço do mar, a temperatura da Terra parada e o campo magnético sem giro não ganham valor nem desenho de resultado.
- **O que é modelo ou comparação leva etiqueta.** "Simulação" no mapa dos dois oceanos, "provisório" quando a rocha começa a se arredondar, "comparação" na máquina de lavar e no freio da Lua, "exagerado" na cintura da Terra.
- **Selo da fonte** nos planos que afirmam o que um estudo mediu ou calculou, como no vídeo do sono.

## Elenco

### Vigília ("você")

- **Papel**: protagonista. Vive a casa, o café e o arremesso, e opera a alavanca.
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
| `por-dentro` | o interior da Terra, até o núcleo | índigo escuro | o ferro líquido em laranja | as linhas do campo, em ciano |

Os valores ficam para `palette.ts`, no animatic.

## Réguas que voltam

- **Os três círculos de latitude** (equador, São Paulo, polo), na mesma Terra de lado: `by-latitude` e `the-pole`.
- **Os dois raios** que saem do centro da Terra: `the-bulge` e `water-leaves`.
- **O relógio de um dia**, de onde saem as lascas: `earthquake`, `the-moon-brake` e `corals`.
- **As setas do vento** do gancho: `what-spin-does`, `straight-wind` e `still-spinning`.
- **A janela da cozinha**: `one-turn`, `year-long-day`, `another-planet`, `only-clue` e `subscribe`.

## Simplificações da imagem

- A cintura da Terra e o calombo de água são desenhados exagerados para se ver, sempre com a etiqueta "exagerado"; a diferença real é de 21 km em 6.378.
- O mapa dos dois oceanos é esquemático: continentes em manchas simples, só com os cinco traços que o texto do estudo sustenta (dois oceanos polares; faixa de terra contínua no equador; norte do Canadá e da Sibéria submersos; fundo do mar equatorial emerso; oceano do sul 1.400 m mais baixo). Os mapas originais não foram lidos.
- O navio encalhado no fundo seco do equador é ilustração: a fonte só diz que águas rasas emergem.
- O coral é um coral genérico; a fonte não diz a espécie.
- A fileira de globos simulados resume os modelos em quatro etiquetas de giro ("16 dias", "64 dias", "128 dias", "256 dias"); a vaga vazia do "dia de um ano" fica entre as duas últimas, onde a conta a põe. Os estudos rodaram mais casos.
- O laço do ar na Terra parada vem de modelos de rotação lenta, e não deste caso.
- O arremesso da Vigília é cartum: ninguém aparece ferido.
- A alavanca e a Vigília ao lado da Terra são o palco do experimento, e não um lugar.
- A Terra em corte é desenhada metade vista de fora, metade em corte, para o giro continuar à vista.
- Em `the-rule`, o ar, o mar e as casinhas são três faixas em latitudes diferentes sobre a rocha nua; não quer dizer que haja ar só no norte e casas só no sul.
- Em `after-the-dust`, a água já assenta mais larga para os polos, o que antecipa `water-leaves`.
- Os calombos de maré de `the-moon-brake` e de `never` são mar, na cor do mar, exagerados, com uma chapa fina de sapata por fora; levam "comparação".
- A ilha sob o ponto do Japão, em `earthquake`, é uma mancha esquemática, sem litoral.
- As linhas do coral em corte são amostra (na proporção de 400 para 365); a contagem está na etiqueta.
- A bacia do sul é desenhada mais larga; a fonte diz que ela tem capacidade maior, e não largura.
- O degrau de 1.400 m entre as bacias, o Sol inchado ao lado da régua de tempo e o reservatório de luz estão fora de escala.
- O relógio de "quase 24 h" para em 96,5% da volta, para a fresta se ver; o valor real seria 99,7%.
- Em `magnetic-field`, uma seta em volta do eixo diz se a Terra do corte gira ou está parada; o roteiro não a pede.

## Número mudo

Um só, em `the-pole`, com 7 s sem fala: o Explorador se prepara para o pior, e o que chega é um tropeço; depois ele se vira devagar para o horizonte, vazio e quieto. Fica entendido que ali o tranco foi quase nada, e que o depois está em aberto. A poeira no horizonte, da primeira decupagem, saiu: nenhuma fonte descreve o que chega ao polo.
