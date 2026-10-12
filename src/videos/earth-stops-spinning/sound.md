# Som — O que acontece se a Terra parar de girar?

## Estado

Hipótese de 2026-10-11, sobre a narração gravada de 700,87 s (21.026 quadros, 29 cenas). A trilha tem três partes de semente 1: A de 255 s (a de antes, mantida: mesmo arquivo, mesmo md5), B de 245 s, que entra em 251,97 s (`after-the-dust`, 3 s de cruzamento), e C de 210 s, que entra em 493,51 s (`the-moon-case`, 3 s de cruzamento). Com a narração de 700,87 s a parte B passaria a pedir 451 s, e o comando recusa faixa acima de 440 s; por isso nasceu a parte C, com a mesma descrição, o mesmo andamento e o mesmo tom da B (nada do tema, do bpm nem do `recuo` mudou). A troca em `the-moon-case` é a abertura do bloco da temperatura ("Um dia tão longo mexe com a temperatura"). B e C foram geradas de novo (`pnpm music earth-stops-spinning 1 2` e `... 1 3`, 3 min 27 s e 3 min 19 s); a A veio do cache. O som do vídeo saiu de `pnpm sound` (21.026 quadros, 700,87 s), a mesma duração da imagem. Nada aqui foi ouvido pelo usuário nem por este agente: a identidade da trilha, os níveis e os efeitos são propostas até a escuta do conjunto.

## Decisões do usuário que este mapa segue

- A música do canal é o piano de cinema mudo (2026-10-09, escolhida de ouvido num trecho de 12 s). A dúvida que ela deixou aberta é deste vídeo: sob quase onze minutos e meio de fala, o piano acompanha ou cansa?
- A linguagem de efeitos é a do cinema mudo; "não é vídeo infantil".

## Arco

- `switch-off`: 6 s sem fala depois da frase, para a vinheta; o piano vai sozinho ao primeiro plano.
- `the-pole`: 7 s sem fala para o número mudo do Explorador; é o piano que conduz a cena.
- `map-limit`, `another-planet` e `only-clue`: respiros de 1 a 1,5 s, curtos demais para a música subir.

## Mapa

### Leitos

| Parte | Trecho | Descrição | Andamento / tom |
|---|---|---|---|
| A | do começo a `the-pole` (0:00 a 4:12) | playful silent film comedy score, bouncy ragtime stride left hand, cheeky staccato melody, light and charming, comedic timing with small pauses, solo upright piano, vintage 1920s cinema pianist, instrumental | 104 bpm / C major |
| B | de `after-the-dust` a `year-long-day` (4:12 a 8:13) | curious unhurried silent film score, gentle stride left hand, wandering thoughtful melody in the middle register, light and warm, small pauses, solo upright piano, vintage 1920s cinema pianist, instrumental | 104 bpm / C major |
| C | de `the-moon-case` ao fim (8:13 a 11:41) | a mesma descrição da B | 104 bpm / C major |

São três partes porque uma só não cabe no limite da geração (440 s por faixa). A troca fica em `after-the-dust` (251,97 s), logo depois do silêncio do polo, onde o primeiro experimento termina e o segundo, a freada aos poucos, começa (bloco 4): a música perde o salto do ragtime e fica mais calma, com o mesmo piano, o mesmo andamento e o mesmo tom.

### Níveis e silêncios

| Trecho | Execução | Motivo |
|---|---|---|
| vídeo inteiro, sob a fala | `recuo`, 17 dB abaixo da voz | o piano é articulado e disputa com a fala mais do que um leito de cordas; no vídeo do sono o usuário confirmou a música nessa distância |
| os 6 s da vinheta e os 7 s do polo | primeiro plano, pelo runtime | silêncios de fala de 2 s ou mais |

Sem silêncio de música e sem momentos. As deixas de efeito por palavra (`sfx`) não mudaram no roteiro e são recalculadas pelo `pnpm sound` a partir do `narration.json` de agora; nenhum efeito novo entrou.

### Efeitos

Só usos que o catálogo já tem (`src/audio/sfx.ts`); nenhum arquivo novo foi buscado.

| Cena | Acontecimento | Uso | Nível | Âncora |
|---|---|---|---|---|
| `the-rule` | a batida amortecida do ônibus: ela chega à parede e o ônibus treme | `boxDrop` | normal | "segure", mesmo deslocamento de "pare" (o `hitAt` da cena é a deixa) |
| `the-rule` | a parte sólida trava com um tranco | `boxDrop` | normal | "pare" |
| `you-too` | a Vigília é arremessada | `whoosh` | normal | "arremessado", 0,13 s depois (o arremesso espera 8 quadros para a rua ser vista) |
| `the-pole` | o solavanco do tranco, no número mudo | `headTap` | normal | 6,4 s antes do fim da cena (0,6 s de silêncio) |
| `the-pole` | o gole da caneca cai na neve | `splash` | leve | 5,9 s antes do fim da cena |
| `new-map` | o navio assenta na lama | `softLanding` | leve | "vira", 0,2 s depois |
| `map-limit` | o carimbo "provisório" bate | `stamp` | normal | "vale" |
| `another-planet` | a batida do outro planeta | `boxDrop` | normal | "batida" |
| `subscribe` | o clique no botão | `headTap` | leve | "inscreva" |

O `boxDrop` parte 0,68 s antes da palavra: o arquivo tem 0,55 s de quase silêncio antes do impacto.

Decidido em 2026-10-11: a batida amortecida de "segure" ganha o mesmo `boxDrop` do "pare", porque o ônibus e a Terra são a mesma regra (mesmo acontecimento, mesmo uso). Ficam sem som, por remoção: o café na parede, que a imagem e a fala carregam, e o tremor do ônibus, que acompanha a batida. Sem decisão, só pela falta de arquivo: a freada do ônibus ("freia"), a alavanca voltando ("repetir") e descendo em cinco dentes em `after-the-dust`; a sapata se soltando em `never`.

Pendentes, sem som no catálogo: a vinheta (`switch-off`), a fita e o ponteiro de `how-fast`, o anemômetro e o vento de `wind`, o tranco na cozinha e a casa se soltando em `you-too`, a alavanca (em `the-rule` e `why-not-stop`), a centrífuga de `water-piled`, o freio raspando de `the-moon-brake`, e os dois acentos do cinema mudo (o apito de êmbolo e o bloco de madeira, Freesound 517633 e 692819), que o número mudo do polo pediria. Entram quando forem baixados e ouvidos.

## Para o ouvido do usuário

1. Sob a fala, o piano acompanha ou cansa? Soa como cinema mudo, ou como desenho para criança?
2. Em 4:12, a música se desenvolveu, ou começou outra?
3. No polo (4:05 a 4:12), o piano sozinho sustenta os 7 s?
4. Os nove efeitos caem no instante do que se vê?

## Medidas desta rodada (2026-10-11, som de 700,87 s)

Cobertura da trilha até o fim: `music-3.wav` tem 210 s e entra em 493,51 s, então vai a 703,5 s, além do fim do vídeo mais a sobra de 2 s (702,87 s); `music-2.wav` (245 s a partir de 251,97 s) vai a 496,97 s, depois do começo da C mais os 3 s de cruzamento. O stem de música que o separador tirou do `.som.mp3` novo mede de -41 a -50 dB por segundo em 485, 490, 495, 500, 600, 680, 690, 695 e 698 s (em 700 s, -50,8 dB: a saída do fim); no mapa segundo a segundo, a música fica de 16 a 19 dB abaixo da voz nos últimos 20 s.

`pnpm critique <som> som`: música sob a fala 16,0 dB abaixo da voz (faixa 9,0 a 15,0), efeitos que se ouvem 2,0 por minuto (faixa 4,4 a 12,3), pico do efeito 15,2 dB abaixo da voz (faixa 11,5 a 14,7); o resto dentro (tempo sem música 0,4%). As três fora de faixa são escolha: o `recuo` de 17 dB é decisão do usuário para o piano; os efeitos são poucos de propósito, e quatro deles em `leve` ficam abaixo do que o separador enxerga; o pico vem dos `leve`. Nenhum efeito entrou para subir o número.
