# Trilha de um vídeo

Sexta etapa. Pode rodar em qualquer momento depois da narração, porque só depende da duração dela.

`pnpm music <vídeo> [semente] [parte]` lê a descrição em `music` no roteiro, gera uma faixa instrumental do tamanho do vídeo com o ACE-Step 1.5 na GPU e grava `public/videos/<vídeo>/music.wav` e `music.json` (com a trilha em partes, uma faixa por parte: veja a última seção). Sem semente vale a 1; outra semente dá outra música para a mesma descrição. Leva cerca de dois minutos e ocupa quase toda a memória da máquina (uns 11 GB de RAM, mais a GPU).

## A descrição

Fica no roteiro, e é direção criativa, então combine com o usuário:

```json
"music": {
  "caption": "calm cinematic ambient electronic, warm analog synth pads, soft plucked arpeggio, curious and hopeful mood",
  "bpm": 90,
  "keyScale": "D minor"
}
```

- `caption` em inglês: gênero, instrumentos, clima e para que serve ("science documentary underscore"). Descrições específicas e coerentes funcionam melhor que vagas ou contraditórias. Vocais nunca entram: o comando sempre pede instrumental.
- `bpm` e `keyScale` são opcionais; sem eles o modelo escolhe.

Trilha de vídeo narrado serve à fala: prefira texturas contínuas e poucos elementos a melodias marcantes que disputem atenção com a voz.

## Avaliar

Diga ao usuário onde está o arquivo e peça para ouvir; para ouvir no contexto, renderize (`pnpm render <vídeo>`). Se não agradar, mude a semente primeiro (mesma ideia, outra execução) e a descrição depois (outra ideia). Cada tentativa custa dois minutos, então proponha duas ou três sementes de uma vez quando o usuário quiser escolher.

Pronto quando: o usuário ouviu a trilha e a aceitou.

## Mixagem

A montagem mede o volume da narração e o da trilha e posiciona a música a uma distância fixa abaixo da voz: 18 dB no vídeo inteiro, com fala ou nas pausas entre as frases, e 3 dB nos silêncios que o roteiro pediu (`holdMs`), onde a música é o assunto, com rampa suave. A trilha não sobe a cada pausa da fala: isso já foi feito (8 dB nas pausas longas) e o usuário ouviu como um som que abre e abafa o tempo todo, e não como música baixa. Os valores estão em `MUSIC_MIX`, em `src/audio/ducking.ts`, e valem para todos os vídeos: se o usuário achar a trilha alta ou baixa de modo geral, é ali que se muda, e cena nenhuma ajusta volume de trilha.

Se a narração for regerada com outra voz ou mudar de duração, rode `pnpm music` de novo.

## A trilha em partes: uma música por momento do vídeo

Uma faixa única, do começo ao fim, é música de fundo: não sabe onde está a vinheta nem onde o vídeo vira. A trilha que acompanha o vídeo é dividida no roteiro, e o mapa dela (que faixa em que trecho, onde a música sobe e onde some) é direção criativa: escreva-o, leve ao usuário e só gere depois do "sim". O do `why-we-sleep` está em `score.md`, na seção "Mapa da trilha", e serve de modelo. A divisão também é obrigatória num vídeo de mais de 8 minutos, que é o máximo do ACE-Step por faixa nesta GPU: o comando para antes de gerar e pede a divisão.

```json
"music": {
  "caption": "curious sparse opening, ...",
  "bpm": 96,
  "keyScale": "A minor",
  "parts": [
    { "from": "the-question", "at": "hold", "caption": "bright full main theme, ..." },
    { "from": "five-parts", "caption": "light playful ...", "bpm": 96 }
  ],
  "silences": [
    { "from": "last-to-know" },
    { "from": "rats-result", "cue": "morreram" }
  ]
}
```

- A descrição de `music` é a da primeira faixa. Cada item de `parts` começa uma faixa nova na cena `from`, com `caption`, `bpm` e `keyScale` próprios; o que faltar vem de `music`. Para as faixas soarem como uma trilha só, repita em todas o tom (ou o relativo) e dois ou três timbres de base. O modelo não continua uma faixa na outra nem repete uma melodia: "o tema volta" quer dizer o mesmo timbre e o mesmo clima.
- Sem `at`, a faixa entra na primeira palavra da cena e cruza com a anterior em 3 segundos, por baixo da fala. Com `"at": "hold"`, entra no silêncio do fim da cena (`holdMs`), em meio segundo, e é ouvida em primeiro plano: é assim que se faz a vinheta e a virada de um capítulo. Um roteiro sem silêncio nas viradas não deixa a música aparecer; 1 segundo de `holdMs` no fim da cena que fecha o capítulo resolve, e é decisão do usuário, porque alonga o vídeo.
- `silences` são os trechos sem música, para o silêncio pesar: a cena inteira, ou da palavra `cue` (com `occurrence` quando ela se repete) até o fim da cena. A trilha some e volta em meio segundo. A faixa que entra na volta de um silêncio não cruza com a anterior.
- O `pnpm check-script` recusa a troca numa cena que não existe, fora de ordem, ou no silêncio de uma cena sem `holdMs`. Mudou um `holdMs`? Rode `pnpm narrate` (as frases vêm do cache) antes do `pnpm music`.
- O ACE-Step não põe um acento num segundo exato dentro de uma faixa. A sincronia com a imagem vem de onde cada faixa começa, do volume e dos efeitos sonoros: não prometa mais que isso.

O comando gera uma parte por vez, com a mesma semente em todas, e grava `music.wav`, `music-2.wav` e assim por diante; o `music.json` guarda o volume, o instante e a entrada de cada uma. Conte de um a dois minutos por parte. Uma faixa não agradou: `pnpm music <vídeo> <semente> <parte>` gera só ela de novo, com outra semente, e mantém as outras. Os tempos e os níveis estão em `MUSIC_PARTS` (`src/audio/parts.ts`) e em `MUSIC_MIX`.

Para o usuário julgar a trilha no contexto sem esperar o render do vídeo, gere só o som (a voz e a trilha já mixadas): `npx remotion render <vídeo> out/<vídeo>.som.mp3`.
