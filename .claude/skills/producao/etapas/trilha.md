# Trilha de um vídeo

Sexta etapa. Pode rodar em qualquer momento depois da narração, porque só depende da duração dela.

`pnpm music <vídeo> [semente]` lê a descrição em `music` no roteiro, gera uma faixa instrumental do tamanho do vídeo com o ACE-Step 1.5 na GPU e grava `public/videos/<vídeo>/music.wav` e `music.json`. Sem semente vale a 1; outra semente dá outra música para a mesma descrição. Leva cerca de dois minutos e ocupa quase toda a memória da máquina (uns 11 GB de RAM, mais a GPU).

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

A montagem mede o volume da narração e o da trilha e posiciona a música a uma distância fixa abaixo da voz: 18 dB enquanto alguém fala e 8 dB nos silêncios longos, com rampa suave. Os valores estão em `MUSIC_MIX`, em `src/audio/ducking.ts`, e valem para todos os vídeos: se o usuário achar a trilha alta ou baixa de modo geral, é ali que se muda, e cena nenhuma ajusta volume de trilha.

Se a narração for regerada com outra voz ou mudar de duração, rode `pnpm music` de novo.

## Limite atual

A trilha é gerada numa peça só, de até 8 minutos (o máximo do ACE-Step nesta GPU). Para um vídeo mais longo o comando para e avisa. Trilha em partes, com climas diferentes por trecho, ainda não foi implementada: se precisar, diga ao usuário e combine como seguir antes de improvisar.
