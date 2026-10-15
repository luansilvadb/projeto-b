# Arquitetura

## O roteiro manda, a narração dá o tempo

O fluxo de dados de um vídeo:

1. `src/videos/<vídeo>/script.json` é a fonte: cenas (`id`, `narration`, `shots`, `holdMs`), a trilha (`music`: leitos, momentos, níveis e silêncios) e os efeitos sonoros (`sfx`). `src/narration/script.ts` define o tipo e valida (`parseScript`); cada plano depois do primeiro começa numa palavra da narração (`cue`, com `occurrence` quando a palavra se repete).
2. `pnpm narrate` gera o áudio frase a frase pelo worker Python (`tools/narration/`, chamado por `scripts/lib/voice-worker.ts`), transcreve cada tomada com o Whisper e grava `public/videos/<vídeo>/narration.json`: o manifesto com o arquivo e o instante de cada palavra.
3. No Remotion, `narratedVideoMetadata` (`src/video/metadata.ts`) busca o manifesto e o `music.json` no `calculateMetadata`, confere que o manifesto bate com o roteiro e devolve a duração da composição. Sem narração, a composição não monta.
4. `buildTimeline` (`src/narration/timeline.ts`) converte o manifesto em quadros: duração de cada cena, quadro de cada palavra, trechos de fala. `shotRanges` dá o trecho de cada plano.
5. `NarratedVideo` (`src/video/NarratedVideo.tsx`) monta as cenas em `Series`, toca as frases, a trilha e os efeitos, e passa a cada cena `SceneProps`: `scene` (os tempos) e `shots` (os trechos dos planos).

Consequências:

- nenhuma cena tem duração fixa;
- mudar uma frase do roteiro invalida a narração dela e desloca todos os quadros seguintes, e os momentos da trilha, que caem em segundos, pedem `pnpm music` de novo;
- nenhuma cena toca som;
- os caminhos da mídia gerada vêm só de `src/media.ts`, que as composições e os scripts compartilham.

## Como uma cena é escrita

`src/videos/<vídeo>/index.tsx` liga cada `id` do roteiro a um componente (`scenes`) e declara duas decisões de encenação por cena: `joined` (os planos que dividem o palco com o anterior em vez de entrar por corte) e `sets` (o cenário de cada plano; planos seguidos no mesmo cenário não o desmontam). `src/video/stage.ts` transforma isso num plano de palco por trecho, que cada `Shot` lê por contexto.

Dentro da cena (veja `src/videos/why-we-sleep/scenes/ThirdOfLifeScene.tsx`):

- Cada plano é um `<Shot range={shots[i]}>`. Dentro dele, `useCurrentFrame()` conta do começo do plano, não da cena.
- Os instantes vêm da fala: `cue(scene, "palavra")` (`src/components/timing.ts`) dá o quadro da cena em que a palavra soa, já adiantado. Num plano que não é o primeiro, subtraia `shots[i].from`.
- O movimento usa as curvas de `timing.ts` (`ramp`, `settle`, `linear`, `drop`) e os primitivos de `src/components/` (`Place`, `Pop`, `SlowPush`, `Camera`, `Idle`, `SvgLayer`); os desenhos reutilizáveis ficam em `src/art/`, os de um vídeo só em `src/videos/<vídeo>/parts/`.
- Nenhuma cor solta: as cores vêm de `src/videos/<vídeo>/palette.ts`; tamanhos de texto, formas e curvas, de `src/design/tokens.ts`.

Um vídeo novo também entra em `src/Root.tsx` como `Composition` com o `calculateMetadata` dele; o formato (1920×1080, 30 fps) vem de `src/format.ts`. A pasta `design` do `Root.tsx` guarda as composições de conferência, que não são vídeos e não têm narração: a folha da identidade, a amostra de movimento, as folhas de modelo dos personagens, os pilotos de polimento, os estudos de `src/studies/` e a `vinheta` (a vinheta do canal, de `src/vignette/`). O `why-we-sleep` é o vídeo modelo.

## Scripts e ferramentas

`scripts/*.ts` são os comandos pnpm (rodam com `tsx`) e importam a lógica pura de `src/` (`src/narration/`, `src/critique/`, `src/audio/`), que é onde os testes estão. `scripts/lib/tools.ts` roda os processos externos (Remotion, ffmpeg, Python via `uv`); `scripts/lib/videos.ts` lê roteiro e manifesto. `tools/narration/` e `tools/sound/` são projetos `uv` próprios (Python 3.11, torch com CUDA); `tools/music/` roda no ambiente do próprio ACE-Step; `vendor/` guarda as ferramentas clonadas pelo `setup:tools` e os pesos do separador de som.

Detalhes que custam tempo:

- `tools/music/generate.py` desliga a reescrita da descrição pelo ACE-Step (`use_cot_caption`), que trocava a música pedida por outra.
- `pnpm stills` monta o vídeo com `silent`, porque o Remotion falha ao renderizar quadros avulsos de uma composição com áudio.
