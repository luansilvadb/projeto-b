# Trilha de um vídeo

Parte da sexta etapa, o som. O que a música faz em cada trecho é decisão da skill `diretor-de-som`, escrita no campo `music` do roteiro e aprovada pelo usuário antes de chegar aqui (`diretor-de-som/etapas/som.md`). Aqui se gera, se mede e se entrega para ouvir.

## Gerar

`pnpm music <vídeo> [semente] [parte]` lê `music` no roteiro e a duração de cada cena na narração, gera cada leito com o ACE-Step 1.5 na GPU e grava `public/videos/<vídeo>/music.wav`, `music-2.wav` e `music.json`. Sem semente vale a 1; outra semente dá outra música para a mesma descrição.

Cada leito é uma geração de até 7 minutos e 20 s, seguida de uma passada por momento (`music.moments`), que refaz só aquele trecho. Conte de quatro a cinco minutos por leito e de três a quatro por momento, e quase toda a memória da máquina (uns 11 GB de RAM, mais a GPU): um vídeo de 9 minutos com seis momentos leva perto de meia hora. Cada momento roda num processo próprio, porque vários seguidos no mesmo derrubam o Python. O comando para antes de gerar se um leito passa do limite, se um momento não cabe (de 3 a 90 s, dentro de um leito só, e não no começo dele) ou se uma cena do roteiro não está na narração.

Um leito ou um momento não agradou: `pnpm music <vídeo> <semente> <parte>` gera só aquela parte de novo, com os momentos dela, e mantém as outras.

Três coisas que o comando faz e que custaram caro descobrir:

- **Não deixa o modelo reescrever a descrição.** O ACE-Step, por padrão, troca o texto recebido por um dele antes de gerar. Com isso ligado, a direção aprovada nunca chegava à música.
- **Pede a faixa com sobra e corta as pontas** (`tools/music/trim.py`). Uma faixa gerada demora de 10 a 35 s para chegar ao corpo e morre nos últimos 5 a 10 s.
- **Mede o volume de cada faixa depois dos momentos**, porque cada passada baixa a faixa em cerca de 1 dB.

Se a narração for regerada com outra voz ou mudar de duração, rode `pnpm music` de novo: os momentos caem em segundos, e os segundos mudaram.

## Entregar para ouvir

O som do vídeo sem a imagem (voz, trilha e efeitos já mixados) sai em minutos:

```bash
pnpm sound <vídeo> out/<vídeo>.som.mp3
```

Entregue o caminho à skill `diretor-de-som`, que mede (`pnpm critique out/<vídeo>.som.mp3 som`), aciona o crítico e leva o som ao usuário com o roteiro de escuta.

Pronto quando: `music.json` existe, o som do vídeo foi renderizado e o caminho foi entregue.

## Mixagem

A montagem mede o volume da narração e o de cada faixa e põe a música a uma distância da voz, em dB: a do nível que o roteiro escolhe para o trecho (`music.levels`; sem escolha, `leito`) e, nos silêncios de fala de 2 s ou mais, a do primeiro plano. Os valores estão em `MUSIC_MIX` (`src/audio/ducking.ts`) e os tempos de troca em `MUSIC_PARTS` (`src/audio/parts.ts`), e valem para todos os vídeos: se o usuário achar a trilha alta ou baixa de modo geral, é ali que se muda.

## O que a ferramenta não faz

- Não põe um acento num segundo dentro de uma faixa: o que cai no instante é o começo e o fim de um momento, e o efeito sonoro.
- Não repete uma melodia de uma faixa em outra.
- As marcações de estrutura do ACE-Step (`[Intro]`, `[Build]`) falham nesta instalação com valores inválidos; o comando não as usa.

Os testes que sustentam isso estão em `out/referencias/kurzgesagt/som/ESTUDO.md`.
