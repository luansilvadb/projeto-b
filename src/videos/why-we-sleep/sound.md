# Som — Algum animal conseguiu parar de dormir?

## Estado

Mapa realizado em 2026-10-08 sobre a narração atual, com 13740 quadros a 30 fps (7:38.00). A escuta do conjunto será feita sobre out/why-we-sleep/why-we-sleep.mp4 e o áudio correspondente out/why-we-sleep/why-we-sleep.som.mp3. Texto, voz, animação e holdMs preservados.

O usuário confirmou que a música já está no fundo nos trechos com e sem efeito e que os dois minutos iniciais da primeira parte nova combinam com a música do fim. Essas observações orientam a implementação; o arquivo final foi conferido tecnicamente e o conjunto aguarda escuta nesta versão.

## Decisões e evidências do usuário

- Ciência para todas as idades, sem timbre de brinquedo: piano de feltro, sintetizador analógico quente e cordas.
- Música no fundo ao longo do vídeo. Em 2026-10-08: “A música já está no fundo”, sobre os testes em recuo (17 dB). Mantida essa distância, abaixo da presença da referência por escolha do usuário; a referência não muda essa intenção.
- Em 2026-10-08, diante da medição de 16,9 dB no conjunto e mínimos de 13,4 dB no fechamento, o usuário escolheu “Preservar a música e ajustar os critérios”: a especificação cobra os 17 dB aplicados pela mixagem; as leituras são investigadas como sensores, e dúvidas de presença vão à escuta do conjunto.
- Identidade da parte inicial nova: “Sim, combina com a música do fim”, em 2026-10-08. Mesma descrição, andamento e tom da segunda parte; só a primeira foi gerada novamente.
- Nove usos novos: “aceito recomendado”, interpretado como o candidato A de cada uso. Uso adicional headTap: “Serve para a batida pequena”. Todos os dez arquivos são CC0; ids e volumes medidos estão no catálogo src/audio/sfx.ts.

## Arco

Um leito contínuo em duas partes por restrição da geração. As duas pedem o mesmo caráter, timbres e tom: piano de feltro, sintetizador quente, cordas, resolução esperançosa e pulso calmo, 96 bpm em dó maior. Nenhum momento na primeira parte. A segunda conserva o momento do fechamento.

A resposta em so-far fica sem música, de 5:38.97 a 5:45.93. A parte seguinte começa em 5:45.93, no fim desse silêncio, com a entrada curta do runtime. A vinheta é o único silêncio de fala com pelo menos dois segundos: 0:39.37 a 0:45.37, onde a música sobe ao primeiro plano. Pausas menores mantêm o fundo.

## Mapa

### Leitos

| Parte | Trecho | Descrição | Andamento / tom | Arquivo e volume medido |
|---|---|---|---|---|
| A | 0:00 a 5:45.93, incluindo a saída no silêncio de so-far | warm hopeful theme, full from the first bar, tender felt piano melody, bowed strings, steady calm pulse, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental | 96 bpm / C major | music.wav / -15.853 LUFS |
| B | 5:45.93 a 7:38.00 | warm hopeful resolution of the same theme, full from the first bar, tender felt piano melody, bowed strings, steady calm pulse, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental | 96 bpm / C major | music-2.wav / -15.307 LUFS |

### Momentos

| Cenas | Instante atual | Função | Descrição |
|---|---|---|---|
| what-it-is a tonight | 7:09.20 a 7:22.83 | acompanhar o fechamento; parte B preservada | the same theme slowed down, felt piano alone playing long notes over a soft string pad, no pulse, tender and still, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental |

### Níveis e silêncios

| Trecho | Execução | Motivo |
|---|---|---|
| vídeo inteiro, sob a fala e nas pausas curtas | recuo, 17 dB abaixo da voz | música no fundo, confirmada pelo usuário |
| 0:39.37 a 0:45.37, vinheta | primeiro plano, 3 dB, com rampas de 0,6 s | silêncio de fala de 6 s |
| 5:38.97 a 5:45.93, so-far | sem música, com rampa de saída/entrada do runtime | a resposta fica exposta à voz |
| últimos 1,5 s | fade out | encerrar sem cortar a faixa |

### Inventário das ações

Leitura dos 108 planos de score.md, com os instantes de contato conferidos no código. A música e as ações de respiração, piscar, vapor e deriva contínua não geram efeitos. Cortes, câmera, simples entrada de texto, desenho dos dados e entradas do palco não são acontecimentos materiais e ficam fora desta tabela.

A âncora é a palavra real da fala (ou o começo/fim do plano quando a ação depende dele); o deslocamento inclui os quatro quadros de antecipação de cue(). Nos movimentos com curva, o evento está no primeiro quadro com progresso, um quadro depois do começo matemático. Contatos usam o quadro do contato.

Sons novos A escolhidos pelo usuário em 2026-10-08. headTap foi confirmado pelo usuário como batida pequena em 2026-10-08. A lista anterior tinha nove efeitos; a implementação atual tem 32.

| Cena / plano | Ação | Tipo | Deixa / atraso (ms) | Quadro da cena / vídeo | Uso / nível ou motivo de silêncio | Fonte do instante |
|---|---|---|---|---|---|---|
| third-of-life / 2 | antílope dobra as pernas e deita | corpo | começo do plano 2 / 400 | 102 / 0:03.40 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | ThirdOfLifeScene.tsx: SETTLE.restAt |
| third-of-life / 2 | cabeça pende e olho fecha | corpo | começo do plano 2 / 800 | 114 / 0:03.80 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | ThirdOfLifeScene.tsx: SETTLE.sleepAt |
| biggest-mistake / 1 | folhas viram até 44 anos | objeto | quarenta / -133 | 77 / 0:11.57 | sem som: folhear é abreviação gráfica do tempo, sem reforçar cada década | score.md |
| biggest-mistake / 2 | pesquisador anda até a porta | corpo | Chicago / -133 | 152 / 0:14.07 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| biggest-mistake / 2 | porta do laboratório abre | objeto | resumia / -133 | 182 / 0:15.07 | sem som: abertura tranquila acompanhando a fala; o contato forte deste trecho é o carimbo | score.md |
| biggest-mistake / 4 | carimbo erro? encosta no quadro | impacto | evolução / -33 | 394 / 0:22.13 | stamp / normal | Chalkboard.tsx: STRIKE.fall=3 |
| time-to-fix / 1 | tesoura corta e SNIP aparece | onomatopeia | corrigir / -100 | 54 / 0:25.70 | scissors / normal | TimeToFixScene.tsx: cutAt, Onomatopoeia |
| time-to-fix / 1 | galho cortado começa a cair | objeto | corrigir / -100 | 54 / 0:25.70 | sem som: o corte já tem SNIP; não há impacto final mostrado | TimeToFixScene.tsx: cutAt+1 |
| time-to-fix / 3 | foco acende no pedestal | estado | animal / -133 | 248 / 0:32.17 | sem som: mudança didática de estado, sem contato físico; sem acento adicional sobre a fala | score.md |
| night-falls / 1 | bicho entra andando | corpo | bicho / -133 | 46 / 0:58.57 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| night-falls / 2 | savana escurece no lugar | estado | começo do plano 2 / 0 | 126 / 1:01.23 | sem som: noite contínua, sem a varredura antiga nem uma borda que peça whoosh | score.md |
| night-falls / 2 | bicho deita | corpo | deita / -133 | 138 / 1:01.63 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| night-falls / 2 | olho fecha | corpo | fecha / -133 | 150 / 1:02.03 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| night-falls / 3 | capim abre e fecha atrás do bicho | estado | começo do plano 3 / 1500 | 219 / 1:04.33 | sem som: ameaça discreta; não inventar uma batida nem usar jato ou queda para folhas | score.md |
| last-to-know / 1 | olhos do predador acendem | estado | predador / -133 | 18 / 1:06.17 | sem som: não há contato: o contraste dos olhos basta, sem sinal agudo que faça deles um alarme | score.md |
| last-to-know / 1 | sombra avança | corpo | chegar / -133 | 27 / 1:06.47 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| last-to-know / 1 | orelha do bicho mexe | corpo | demora / -133 | 68 / 1:07.83 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| skip-a-night / 1 | bicho olha de um lado para outro, volta 1 | corpo | acordado / -133 | 80 / 1:12.20 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | SkipANightScene.tsx: LOOK e ABOUT |
| skip-a-night / 1 | bicho olha de um lado para outro, volta 2 | corpo | acordado / 433 | 97 / 1:12.77 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | SkipANightScene.tsx: LOOK e ABOUT |
| skip-a-night / 2 | savana amanhece no lugar | estado | começo do plano 2 / 0 | 137 / 1:14.10 | sem som: luz contínua, sem a varredura antiga | score.md |
| skip-a-night / 2 | cabeça e joelhos cedem | corpo | Só / -133 | 137 / 1:14.10 | sem som: o impacto sonoro fica para a queda que a cena seguinte mostra | score.md |
| skip-a-night / 2 | conta entra e se escreve | objeto | cobra / -133 | 160 / 1:14.87 | sem som: papel gráfico ainda sem dobra ou contato; não usar paperFold numa simples entrada | score.md |
| sleep-debt / 1 | antílope bate no chão e PLOFT aparece | impacto | dorme / 200 | 57 / 1:20.57 | bodyFall / normal | SleepDebtScene.tsx: FALL.seconds=0.33 |
| sleep-debt / 1 | carimbo cobrado bate na conta | impacto | dorme / 700 | 72 / 1:21.07 | stamp / normal | SleepDebtScene.tsx: landAt + stampAfter + STAMP.frames |
| sleep-debt / 1 | flanco enche mais fundo | corpo | dorme (2) / -133 | 101 / 1:22.03 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| sleep-debt / 1 | orelha treme e para | corpo | acorda / -133 | 146 / 1:23.53 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| sleep-debt / 2 | conta viaja até a mesa | objeto | começo do plano 2 / 0 | 194 / 1:25.13 | sem som: transferência gráfica, sem uma nova batida do carimbo | score.md |
| sleep-debt / 2 | cabeça encosta na mesa do café | impacto | pesa / 967 | 330 / 1:29.67 | headTap / normal | SleepDebtScene.tsx: HEAD.give + hold + fall |
| debt-test / 1 | conta vem para o centro | objeto | começo do plano 1 / 0 | 0 / 1:31.77 | sem som: transferência gráfica sem contato | score.md |
| debt-test / 1 | braço entra com a caneta | corpo | testes / -133 | 90 / 1:34.77 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| debt-test / 2 | lado do bicho adormecido acende | estado | começo do plano 2 / 500 | 156 / 1:36.97 | sem som: mudança didática de estado, sem contato físico; sem acento adicional sobre a fala | score.md |
| debt-test / 2 | lado do bicho parado acende | estado | dormindo / -133 | 224 / 1:39.23 | sem som: mudança didática de estado, sem contato físico; sem acento adicional sobre a fala | score.md |
| debt-returns / 1 | conta começa a dobrar para o bolso | objeto | começo do plano 1 / 367 | 11 / 1:42.73 | paperFold / normal | DebtReturnsScene.tsx: FOLD.at=10, primeiro quadro de dobra |
| sleep-less / 1 | régua se estica | objeto | começo do plano 1 / 400 | 12 / 1:46.33 | sem som: mudança didática de estado, sem contato físico; sem acento adicional sobre a fala | score.md |
| elephants / 1 | manada 1 caminha | corpo | começo do plano 1 / 0 | 0 / 1:51.70 | sem som: caminhada contínua e contemplativa; não transformar o plano em sequência de pisadas | ElephantsScene.tsx: WideHerds, WALK.speed*at |
| elephants / 1 | manada 2 caminha | corpo | começo do plano 1 / 0 | 0 / 1:51.70 | sem som: caminhada contínua e contemplativa; não transformar o plano em sequência de pisadas | ElephantsScene.tsx: WideHerds, WALK.speed*at |
| elephants / 1 | elefanta 1 ergue a tromba | corpo | elefantas / -133 | 98 / 1:54.97 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | ElephantsScene.tsx: GREET.gap=12 |
| elephants / 1 | elefanta 2 ergue a tromba | corpo | elefantas / 267 | 110 / 1:55.37 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | ElephantsScene.tsx: GREET.gap=12 |
| elephants / 2 | trombas começam a se estender para o cumprimento | corpo | começo do plano 2 / 767 | 204 / 1:58.50 | sem som: contato macio sem choque; preservar o cumprimento tranquilo | ElephantsScene.tsx: braked(WALK) + TOUCH.after |
| elephants / 3 | tromba desenha o registro | corpo | começo do plano 3 / 0 | 267 / 2:00.60 | sem som: mudança didática de estado, sem contato físico; sem acento adicional sobre a fala | ElephantsScene.tsx: CountShot |
| elephants / 4 | tromba desacelera e para | corpo | começo do plano 4 / 0 | 392 / 2:04.77 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | ElephantsScene.tsx: TrunkShot |
| two-hours / 1 | barra entra na régua | objeto | duas / -133 | 61 / 2:11.50 | sem som: dado gráfico sem impacto; a varredura antiga saiu | score.md |
| elephant-awake / 1 | noite vira dia no lugar | estado | começo do plano 1 / 0 | 0 / 2:19.17 | sem som: luz contínua, sem varredura | score.md |
| elephant-awake / 1 | elefanta começa a andar | corpo | começo do plano 1 / 500 | 15 / 2:19.67 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| elephant-awake / 2 | pessoa entra andando | corpo | você / -133 | 154 / 2:24.30 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| elephant-awake / 2 | pessoa encosta no colchão | impacto | madrugada / 367 | 283 / 2:28.60 | bedFall / leve | ElephantAwakeScene.tsx: LIE.warn + fall |
| elephant-verdict / 1 | savana anoitece | estado | começo do plano 1 / 0 | 0 / 2:30.00 | sem som: luz contínua, sem contato | score.md |
| elephant-verdict / 2 | tromba cai | corpo | nem / -133 | 157 / 2:35.23 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| elephant-verdict / 2 | olho fecha e cabeça pende | corpo | conseguiu / -133 | 178 / 2:35.93 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| maybe-brain / 4 | pesquisadora ajeita a rede | corpo | foi / -133 | 270 / 2:48.03 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish / 1 | água-viva começa a nadar | corpo | Pesquisadores / -133 | 8 / 2:49.87 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish / 1 | água-viva vira para pousar | corpo | água / -133 | 79 / 2:52.23 | sem som: o contato na areia já recebe o som; evitar whoosh na preparação | score.md |
| jellyfish / 1 | água-viva pousa na areia | impacto | Cassiopéia / -100 | 109 / 2:53.23 | softLanding / normal | JellyfishScene.tsx: max(Cassiopéia, água+30) |
| jellyfish / 1 | peixe entra e freia | corpo | Ela / -133 | 141 / 2:54.30 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-night / 1 | lagoa passa à noite | estado | começo do plano 1 / 0 | 0 / 3:05.83 | sem som: escurecimento contínuo, sem varredura | score.md |
| jellyfish-night / 1 | braços caem e pulsos diminuem | corpo | pulsa / -133 | 31 / 3:06.87 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-night / 1 | peixe boceja | corpo | devagar / -133 | 50 / 3:07.50 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-night / 2 | peixe se aproxima | corpo | começo do plano 2 / 2300 | 147 / 3:10.73 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-night / 2 | peixe se afasta | corpo | começo do plano 2 / 2900 | 165 / 3:11.33 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-night / 3 | pesquisadora ergue a prancheta | corpo | pesquisadores / -133 | 242 / 3:13.90 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-platform / 1 | luva alcança a plataforma | corpo | primeiro / -133 | 12 / 3:17.17 | sem som: preparação do puxão que já recebe whoosh | score.md |
| jellyfish-platform / 1 | plataforma é puxada | objeto | tiraram / 67 | 40 / 3:18.10 | whoosh / normal | JellyfishPlatformScene.tsx: pulledAt, REACH + WINDUP |
| jellyfish-platform / 2 | braços abrem ao despertar | corpo | acordar / -133 | 257 / 3:25.33 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| jellyfish-platform / 2 | água-viva vira e nada para o fundo | corpo | acordar / 167 | 266 / 3:25.63 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | JellyfishPlatformScene.tsx: wakeAt+OPEN_SECONDS |
| jellyfish-platform / 3 | mão sacode o ombro, repetição 1 | corpo | chama / -667 | 391 / 3:29.80 | sem som: toque leve sem impacto; a terceira sacudida e a reação são lidas na imagem | JellyfishPlatformScene.tsx: thirdAt e NUDGE.every=9 |
| jellyfish-platform / 3 | mão sacode o ombro, repetição 2 | corpo | chama / -367 | 400 / 3:30.10 | sem som: toque leve sem impacto; a terceira sacudida e a reação são lidas na imagem | JellyfishPlatformScene.tsx: thirdAt e NUDGE.every=9 |
| jellyfish-platform / 3 | mão sacode o ombro, repetição 3 | corpo | chama / -67 | 409 / 3:30.40 | sem som: toque leve sem impacto; a terceira sacudida e a reação são lidas na imagem | JellyfishPlatformScene.tsx: thirdAt e NUDGE.every=9 |
| jellyfish-debt / 1 | conta sai do bolso e se desdobra | objeto | segundo / -100 | 16 / 3:32.67 | paperFold / normal | JellyfishDebtScene.tsx: outAt |
| jellyfish-debt / 1 | carimbo já impresso pisca, primeira vez | estado | cobrança / 0 | 48 / 3:33.73 | sem som: não bate de novo; não repetir stamp num pulso visual | JellyfishDebtScene.tsx: STAMP_LAG=4 |
| jellyfish-debt / 1 | carimbo já impresso pisca, segunda vez | estado | cobrança / 300 | 57 / 3:34.03 | sem som: não há nova batida | JellyfishDebtScene.tsx: stampAt+9 |
| jellyfish-debt / 2 | jato 1 entra no tanque, PSSST | onomatopeia | soltaram / -100 | 126 / 3:36.33 | waterJet / normal | JellyfishDebtScene.tsx: jets, primeiro quadro de reach |
| jellyfish-debt / 2 | jato 2 entra no tanque, PSSST | onomatopeia | tanque / -100 | 170 / 3:37.80 | waterJet / normal | JellyfishDebtScene.tsx: jets, primeiro quadro de reach |
| jellyfish-debt / 2 | jato 3 entra no tanque, PSSST | onomatopeia | água (2) / -100 | 213 / 3:39.23 | waterJet / normal | JellyfishDebtScene.tsx: jets, primeiro quadro de reach |
| jellyfish-debt / 3 | dia nasce no laboratório | estado | começo do plano 3 / 0 | 265 / 3:40.97 | sem som: luz contínua, sem varredura | score.md |
| jellyfish-debt / 3 | braços caem de dia | corpo | ela / -133 | 350 / 3:43.80 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| older-than-brain / 1 | conta dobra e volta ao bolso | objeto | fim do plano 1 / -633 | 61 / 3:47.47 | paperFold / normal | OlderThanBrainScene.tsx: fim do plano − STOW.frames − before |
| older-than-brain / 3 | água-viva pousa ao lado do pedestal | impacto | quem / 567 | 276 / 3:54.63 | softLanding / normal | OlderThanBrainScene.tsx: landAt + LANDING.seconds |
| forced-awake / 2 | despertador toca e TRIIIM aparece | onomatopeia | força / -100 | 68 / 4:00.87 | alarmClock / normal | ForcedAwakeScene.tsx: max(ringAt, TRAVEL.at+frames) |
| forced-awake / 2 | dia 1 é riscado | objeto | Foi / -133 | 94 / 4:01.73 | sem som: marca gráfica do tempo; o som deste plano pertence à campainha | score.md |
| forced-awake / 2 | dia 2 é riscado | objeto | Foi / 267 | 106 / 4:02.13 | sem som: marca gráfica do tempo, sem novo toque | ForcedAwakeScene.tsx: STRIKE.gap=12 |
| rats-disc / 1 | rato do teste sobe no disco | corpo | ratos / 267 | 27 / 4:07.90 | sem som: passo curto, sem queda; preservar o giro como ação sonora principal | score.md |
| rats-disc / 1 | rato de comparação sobe no disco | corpo | ratos / 267 | 27 / 4:07.90 | sem som: passo curto, sem queda | score.md |
| rats-disc / 1 | disco dá o primeiro quarto de volta | objeto | disco / -100 | 85 / 4:09.83 | whoosh / leve | RatsDiscScene.tsx: quarterAt |
| rats-disc / 1 | água da bandeja ondula | estado | água / -133 | 129 / 4:11.30 | sem som: ondulação, sem queda na água; não usar splash | score.md |
| rats-disc / 2 | disco gira para acordar os ratos | objeto | disco (2) / -100 | 254 / 4:15.47 | whoosh / normal | RatsDiscScene.tsx: spinAt |
| rats-disc / 2 | rato do teste anda contra o giro | corpo | dois / -133 | 295 / 4:16.83 | sem som: passos contínuos cobertos pelo som do disco | score.md |
| rats-disc / 2 | rato de comparação anda contra o giro | corpo | dois / -133 | 295 / 4:16.83 | sem som: passos contínuos cobertos pelo som do disco | score.md |
| rats-result / 2 | rato 1 abaixa a cabeça | corpo | morreram / -133 | 152 / 4:30.87 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 2 abaixa a cabeça | corpo | morreram / -33 | 155 / 4:30.97 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 3 abaixa a cabeça | corpo | morreram / 67 | 158 / 4:31.07 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 4 abaixa a cabeça | corpo | morreram / 167 | 161 / 4:31.17 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 5 abaixa a cabeça | corpo | morreram / 267 | 164 / 4:31.27 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 6 abaixa a cabeça | corpo | morreram / 367 | 167 / 4:31.37 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 7 abaixa a cabeça | corpo | morreram / 467 | 170 / 4:31.47 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 8 abaixa a cabeça | corpo | morreram / 567 | 173 / 4:31.57 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 9 abaixa a cabeça | corpo | morreram / 667 | 176 / 4:31.67 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| rats-result / 2 | rato 10 abaixa a cabeça | corpo | morreram / 767 | 179 / 4:31.77 | sem som: passagem austera, sem queda nem impacto: não sonorizar a morte como tombos | RatsResultScene.tsx: max(bowAt, arrive) + BOW.step |
| unknown-cause / 1 | pesquisador leva a mão à cabeça e coça | corpo | sem / 33 | 132 / 4:42.60 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | UnknownCauseScene.tsx: SCRATCH.after=4, primeiro progresso |
| unknown-cause / 2 | rato pousa no prato da balança | objeto | falta / -133 | 236 / 4:46.07 | sem som: balança conceitual, sem choque; nenhum bodyFall no exame | score.md |
| unknown-cause / 2 | despertador pousa no outro prato | objeto | estresse / -133 | 295 / 4:48.03 | sem som: balança conceitual, sem reforçar o apoio como queda pesada | score.md |
| unknown-cause / 2 | despertador treme como símbolo do estresse | objeto | estresse / -133 | 295 / 4:48.03 | sem som: símbolo numa balança conceitual; preservar a comparação sem repetir o alarme literal do experimento | UnknownCauseScene.tsx: Falling e ringing |
| awake-record / 1 | Gardner entra andando | corpo | um / -133 | 41 / 4:52.10 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| awake-record / 4 | moeda bate no chão | impacto | cara / 867 | 450 / 5:05.73 | coinDrop / normal | AwakeRecordScene.tsx: TOSS.at + frames |
| awake-record / 4 | moeda volta a encostar depois do quique | impacto | cara / 1067 | 456 / 5:05.93 | coinDrop / leve | AwakeRecordScene.tsx: TOSS.bounce.frames |
| gardner-hours / 2 | cabeça de Gardner bate na última mesa | impacto | uma (2) / 200 | 321 / 5:18.37 | headTap / normal | GardnerHoursScene.tsx: knockAt=cue(uma,2)+KNOCK.fall |
| gardner-sleeps / 1 | Dement entra com a prancheta | corpo | por / -133 | 30 / 5:20.90 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| gardner-sleeps / 2 | Gardner encosta no colchão | impacto | deitou / 367 | 267 / 5:28.80 | bedFall / normal | GardnerSleepsScene.tsx: max(lieAt,19) + LIE.warn + fall |
| gardner-sleeps / 3 | conta sai do bolso e se abre | objeto | começo do plano 3 / 100 | 344 / 5:31.37 | paperFold / normal | GardnerSleepsScene.tsx: OUT.at=2, primeiro quadro de out |
| gardner-sleeps / 3 | carimbo já impresso pulsa | estado | começo do plano 3 / 767 | 364 / 5:32.03 | sem som: não existe nova batida | GardnerSleepsScene.tsx: OUT.at + OUT.seconds |
| gardner-sleeps / 4 | conta dobra e volta ao bolso | objeto | fim do plano 4 / -367 | 549 / 5:38.20 | paperFold / normal | GardnerSleepsScene.tsx: fim do plano − STOW.before |
| so-far / 1 | água-viva pousa na moldura da lagoa | impacto | começo do plano 1 / 1833 | 55 / 5:40.40 | softLanding / leve | SoFarScene.tsx: BEATS.panels[1] + SINK.frames |
| memory-test / 1 | primeira lista é entregue | objeto | Duas / -133 | 131 / 5:55.77 | sem som: gesto pequeno, papel plano sem dobra; não usar paperFold por ser papel | score.md |
| memory-test / 1 | segunda lista é entregue | objeto | Duas / 67 | 137 / 5:55.97 | sem som: mesmo gesto pequeno, sem contato forte | MemoryTestScene.tsx: GIVE.gap=6 |
| memory-test / 2 | calendário folheia | objeto | todos / -133 | 232 / 5:59.13 | sem som: passagem do tempo didática, sem ruído contínuo sobre a lista falada | score.md |
| memory-result / 3 | estante começa a crescer por prateleira | objeto | resultado / 267 | 285 / 6:11.80 | sem som: construção gráfica abstrata; reservar madeira e papelão às caixas concretas | MemoryResultScene.tsx: max(resultado,CROSS_FRAMES−5) |
| stockroom / 2 | primeiro freguês entra andando | corpo | passa / 0 | 101 / 6:18.07 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | StockroomScene.tsx: max(passa, TURN.keeperAt−2) |
| stockroom / 2 | segundo freguês entra andando | corpo | passa / 200 | 107 / 6:18.27 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | StockroomScene.tsx: walkAt+index*6 |
| stockroom / 2 | caixa 1 encosta na calçada | impacto | recebendo / 200 | 145 / 6:19.53 | boxDrop / normal | StockroomScene.tsx: DELIVERY.after + FALL.frames |
| stockroom / 2 | caixa 2 encosta na calçada | impacto | recebendo / 467 | 153 / 6:19.80 | boxDrop / normal | StockroomScene.tsx: DELIVERY.after + FALL.frames |
| stockroom / 2 | caixa 3 encosta na calçada | impacto | recebendo / 733 | 161 / 6:20.07 | boxDrop / normal | StockroomScene.tsx: DELIVERY.after + FALL.frames |
| stockroom / 3 | lojista atende e freguesa sai | corpo | aberta (2) / 0 | 220 / 6:22.03 | sem som: ação cotidiana contínua; os contatos sonoros são as caixas | StockroomScene.tsx: max(aberta, PASSAGE+8) |
| stockroom / 3 | quarta caixa bate na pilha da entrada | impacto | chega / 200 | 362 / 6:26.77 | boxDrop / normal | StockroomScene.tsx: crateAt + FALL.frames |
| stockroom-night / 1 | porta de enrolar começa a descer | objeto | baixar / -100 | 23 / 6:29.17 | shutterDown / normal | StockroomNightScene.tsx: shutAt |
| stockroom-night / 1 | lojista pega uma caixa | objeto | levar / -133 | 70 / 6:30.73 | sem som: pega sem impacto; a porta e a chegada das caixas já dão materialidade | score.md |
| stockroom-night / 2 | porta desce dentro da lente | objeto | começo do plano 2 / 500 | 180 / 6:34.40 | shutterDown / leve | StockroomNightScene.tsx: DREAM.frontAt=14 |
| stockroom-night / 2 | porta sobe dentro da lente | objeto | começo do plano 2 / 2500 | 240 / 6:36.40 | sem som: abre a demonstração mental, sem repetir a longa descida metálica em sentido oposto | StockroomNightScene.tsx: DREAM.liftLead=20 |
| stockroom-night / 3 | primeira caixa abre | objeto | começo do plano 3 / 667 | 280 / 6:37.73 | sem som: abertura tranquila, sem novo impacto; não usar paperFold em papelão rígido | StockroomNightScene.tsx: SORT.openAt=20 |
| stockroom-night / 3 | caixa é posta na prateleira | objeto | leva / 433 | 347 / 6:39.97 | sem som: apoio cuidadoso, sem queda: não usar boxDrop como substituto | StockroomNightScene.tsx: SORT.shelveAfter=17 |
| stockroom-night / 3 | segunda caixa é levantada | objeto | leva / 1367 | 375 / 6:40.90 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | StockroomNightScene.tsx: SORT.liftAfter=45 |
| stockroom-night / 3 | segunda caixa abre | objeto | leva / 1700 | 385 / 6:41.23 | sem som: mesma abertura tranquila, sem impacto | StockroomNightScene.tsx: SORT.openAfter=55 |
| stockroom-solid / 1 | pessoa acorda e se espreguiça | corpo | sabe / -67 | 28 / 6:44.47 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | StockroomSolidScene.tsx: cue(sabe)+2 |
| nobody-escaped / 1 | foco acende no pedestal vazio | estado | história / -133 | 70 / 6:51.87 | sem som: mudança didática de estado, sem contato físico; sem acento adicional sobre a fala | score.md |
| one-of-them / 1 | elefanta entra andando | corpo | começo do plano 1 / 0 | 0 / 6:53.83 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| one-of-them / 1 | água-viva entra nadando | corpo | começo do plano 1 / 600 | 18 / 6:54.43 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| one-of-them / 1 | pessoa esfrega os olhos e boceja | corpo | larga / -133 | 59 / 6:55.80 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| one-of-them / 2 | pessoa encosta no colchão | impacto | deita / 400 | 127 / 6:58.07 | bedFall / leve | OneOfThemScene.tsx: lieAt=wideAt, LIE.warn=5, fall=11 |
| one-of-them / 2 | elefanta deixa a tromba cair | corpo | elefanta / -133 | 140 / 6:58.50 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| one-of-them / 2 | braços da água-viva caem | corpo | água / -133 | 160 / 6:59.17 | sem som: gesto lento, sem impacto; a imagem sustenta a ação e um som a tornaria mais brusca | score.md |
| still-unknown / 2 | medalhão pousa no cérebro | objeto | resposta / 567 | 118 / 7:04.87 | sem som: encaixe conceitual, sem fingir uma colisão real | StillUnknownScene.tsx: landAt + LANDING.seconds |
| still-unknown / 2 | medalhão tenta pousar e fica no ar | objeto | sem / -400 | 199 / 7:07.57 | sem som: não há contato: nenhum som de pouso | StillUnknownScene.tsx: min(sem,fim−ATTEMPT−SCENERY_LEAD) |
| tonight / 2 | carimbo perde a cor | estado | começo do plano 2 / 333 | 89 / 7:18.17 | sem som: carimbo já impresso, sem nova batida; fechamento tranquilo | score.md |


## Usos pendentes

Nenhum uso sonoro do inventário está sem arquivo. Os gestos sem som na tabela são omissões deliberadas, com motivo; não são sons pendentes. splash continua no catálogo do canal, mas não toca neste vídeo: nenhum jato é uma queda na água. Os whoosh restantes pertencem ao puxão da plataforma e aos dois giros do disco; as varreduras removidas da animação não têm efeito.

## Conferência

O medidor de pico momentâneo completa a janela de 400 ms com silêncio só durante a medição; os arquivos tocados não mudam. Os dez sons foram medidos com esse comportamento. A âncora de fim de plano mantém as duas dobras finais junto da imagem quando a narração muda de duração.

A moeda tinha 100 ms de silêncio antes do som, mais de dois quadros. Esse trecho inaudível foi retirado do arquivo do catálogo; o pico medido novamente foi −28,484 LUFS, mantendo a linha arredondada −28,5. Nenhum evento foi adiantado em relação à imagem. A mudança de nível no quadro zero agora vale desde o primeiro quadro, sem cruzar do padrão durante o primeiro segundo.

O arquivo final tem 13740 quadros e áudio de 458,000 s. Os 32 pares de quadros do vídeo foram lidos em 18 folhas por cena (out/rascunho/sync-sheets/): o quadro anterior ao efeito ainda não mostra o contato ou início, e o quadro do efeito mostra a ação. Os sons foram renderizados e o vídeo montado novamente depois das correções. Música comprovada na vinheta sem fala de 39,8 a 40,8 s: média −31,3 dBFS e pico −17,3 dBFS.

### Medidas do arquivo atual

Medição nova do MP4, sem cache, em out/why-we-sleep/som/why-we-sleep/medidas.json. O cache anterior foi preservado em out/rascunho/ após a revisão automática bloquear a remoção. A distância da música é calibrada pela reta do projeto.

| Medida | Atual | Referência | Diagnóstico |
|---|---|---|---|
| Música sob a fala | 16,94 dB | 9–15 dB | recuo 17 aplicado desde o começo; presença mais afastada por decisão do usuário |
| Distância entre p10 e p90 | 9,44 dB | até 9,6 dB | sem exceder a faixa |
| Tempo sem música | 1,5% | até 2,4% | retirada em so-far corresponde ao mapa; fontes cobrem as durações |
| Viradas de volume | 1,44/min | até 1,1/min | ganho de fundo constante; vinheta, conteúdo da faixa e janelas explicam sinais; não prova disputa |
| Variação de timbre | 0,17 oitava | até 0,32 | dentro da faixa de uma trilha só; usuário confirmou identidade inicial |
| Efeitos detectados | 2,8/min | 4,4–12,3/min | sensor da separação; há 32 eventos programados, antes eram 9 |
| Pico mediano dos efeitos | 15,0 dB abaixo da voz | 11,5–14,7 | presets normal 13/leve 17 e teto de ganho do arquivo; presença é conferida no conjunto |

As leituras de 46–47 s na série não representam música ainda em primeiro plano: a janela de 3 s inclui a vinheta anterior, mas o ganho já corresponde ao recuo. Os três primeiros pontos da série ainda não têm a janela preenchida; a fonte e o stem contêm música. O fechamento apresenta leituras de 13,47–13,87 dB em 7:24–7:26 e 7:30–7:34: sinal registrado, com clareza da fala incluída na pergunta do conjunto.

Crítica independente: mapa e roteiro coerentes, arquivos presentes, sem outro defeito técnico encontrado após corrigir a rampa inicial e o início inaudível da moeda. A dobra de 5:38,20 é um uso de papel gravado baixo (ganho limitado a 1), próximo da música numa janela; a medida não prova mascaramento, e a percepção fica no roteiro de escuta.

### Dose

Cada efeito acrescenta contato, peso, materialidade ou força à ação que o inventário nomeia. Corte, câmera e entradas editoriais não têm som. Os efeitos próximos têm donos distintos: corpo/carimbo (0,5 s), moeda/quique (0,2 s), jatos (1,47/1,43 s) e caixas (0,27 s). A percepção das caudas sobrepostas vai à escuta. Regiões sem efeitos têm gestos lentos, representação abstrata ou austeridade dos ratos, com motivos na tabela. Nenhum efeito foi colocado para subir a densidade medida.

### Testes

pnpm lint e pnpm test passaram: 224 testes TypeScript, 12 de narração Python e 6 de música Python. Roteiro válido e openspec validate --strict passou.

## Roteiro de escuta

Arquivo: out/why-we-sleep/why-we-sleep.mp4 (7 min 38 s); áudio correspondente em out/why-we-sleep/why-we-sleep.som.mp3. Nenhum uso pendente de catálogo. Conferir os trechos abaixo e o conjunto; os trechos de identidade e presença já ouvidos não são reabertos.

| Instante atual | Pergunta |
|---|---|
| 3:35–3:42 e 6:19–6:23 | Cada jato e cada caixa continuam associados à ação, mesmo nas sequências rápidas? |
| 5:03–5:08 | O som acompanha a batida e o quique da moeda sem parecer contatos extras? |
| 5:38–5:54 | A dobra do papel se percebe e a música retoma naturalmente depois da frase sem música? |
| vídeo inteiro | A fala continua clara e os efeitos acompanham a imagem sem chamar atenção demais? |
