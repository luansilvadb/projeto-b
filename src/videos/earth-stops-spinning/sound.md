# Som — O que acontece se a Terra parar de girar?

> A narração foi reescrita em 2026-10-10 e ainda não foi gerada. Os tempos, a duração e os efeitos abaixo são da fala anterior: a cena `earthquake` saiu (e o efeito dela), e as âncoras de `the-rule` e `map-limit` mudaram de palavra em `script.json` ("pare" e "provisório"). A trilha pede `pnpm music` de novo depois da voz.

## Estado

Hipótese de 2026-10-10, sobre a narração gravada (7 min 59 s). Nada aqui foi ouvido pelo usuário: a identidade da trilha neste vídeo, os níveis e os efeitos são propostas até a escuta do conjunto.

## Decisões do usuário que este mapa segue

- A música do canal é o piano de cinema mudo (2026-10-09, escolhida de ouvido num trecho de 12 s). A dúvida que ela deixou aberta é deste vídeo: sob quase oito minutos de fala, o piano acompanha ou cansa?
- A linguagem de efeitos é a do cinema mudo; "não é vídeo infantil".

## Arco

- `switch-off`: 6 s sem fala depois da frase, para a vinheta; o piano vai sozinho ao primeiro plano.
- `the-pole`: 7 s sem fala para o número mudo do Explorador; é o piano que conduz a cena.
- `map-limit`, `another-planet` e `only-clue`: respiros de 1 a 1,5 s, curtos demais para a música subir.

## Mapa

### Leitos

| Parte | Trecho | Descrição | Andamento / tom |
|---|---|---|---|
| A | do começo a `the-pole` (0:00 a 2:59) | playful silent film comedy score, bouncy ragtime stride left hand, cheeky staccato melody, light and charming, comedic timing with small pauses, solo upright piano, vintage 1920s cinema pianist, instrumental | 104 bpm / C major |
| B | de `after-the-dust` ao fim (2:59 a 7:59) | curious unhurried silent film score, gentle stride left hand, wandering thoughtful melody in the middle register, light and warm, small pauses, solo upright piano, vintage 1920s cinema pianist, instrumental | 104 bpm / C major |

São duas partes porque uma só não cabe no limite da geração. A troca fica em `after-the-dust`, depois do silêncio do polo, onde o vídeo sai da parada e passa ao planeta parado: a música perde o salto do ragtime e fica mais calma, com o mesmo piano, o mesmo andamento e o mesmo tom.

### Níveis e silêncios

| Trecho | Execução | Motivo |
|---|---|---|
| vídeo inteiro, sob a fala | `recuo`, 17 dB abaixo da voz | o piano é articulado e disputa com a fala mais do que um leito de cordas; no vídeo do sono o usuário confirmou a música nessa distância |
| os 6 s da vinheta e os 7 s do polo | primeiro plano, pelo runtime | silêncios de fala de 2 s ou mais |

Sem silêncio de música e sem momentos.

### Efeitos

Só usos que o catálogo já tem (`src/audio/sfx.ts`); nenhum arquivo novo foi buscado.

| Cena | Acontecimento | Uso | Nível | Âncora |
|---|---|---|---|---|
| `the-rule` | a rocha trava com um tranco | `boxDrop` | normal | a segunda "para" |
| `you-too` | a Vigília é arremessada | `whoosh` | normal | "arremessado" |
| `the-pole` | o solavanco do tranco, no número mudo | `headTap` | normal | 6,4 s antes do fim da cena (0,6 s de silêncio) |
| `the-pole` | o gole da caneca cai na neve | `splash` | leve | 5,9 s antes do fim da cena |
| `new-map` | o navio assenta na lama | `softLanding` | leve | "vira", 0,2 s depois |
| `map-limit` | o carimbo "provisório" bate | `stamp` | normal | "enquanto" |
| `another-planet` | a batida do outro planeta | `boxDrop` | normal | "batida" |
| `earthquake` | o tapa do tremor | `headTap` | normal | "violentas" |
| `subscribe` | o clique no botão | `headTap` | leve | "inscreva" |

O `boxDrop` parte 0,68 s antes da palavra: o arquivo tem 0,55 s de quase silêncio antes do impacto.

Pendentes, sem som no catálogo: a vinheta (`switch-off`), a fita e o ponteiro de `how-fast`, o anemômetro e o vento de `wind`, o tranco na cozinha e a casa se soltando em `you-too`, a alavanca (em `the-rule` e `why-not-stop`), a centrífuga de `water-piled`, o freio raspando de `the-moon-brake`, e os dois acentos do cinema mudo (o apito de êmbolo e o bloco de madeira, Freesound 517633 e 692819), que o número mudo do polo pediria. Entram quando forem baixados e ouvidos.

## Para o ouvido do usuário

1. Sob a fala, o piano acompanha ou cansa? Soa como cinema mudo, ou como desenho para criança?
2. Em 2:59, a música se desenvolveu, ou começou outra?
3. No polo (2:52 a 2:59), o piano sozinho sustenta os 7 s?
4. Os nove efeitos caem no instante do que se vê?
