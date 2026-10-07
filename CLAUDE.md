# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Vídeos educativos de ciência em motion graphics feitos em código (Remotion 4, React 19, TypeScript), com narração em voz clonada (OmniVoice), conferência por Whisper e trilha gerada (ACE-Step). Tudo roda na máquina local (Windows, GPU NVIDIA). Um vídeo é produzido em oito etapas com três aprovações do usuário e dois aceites (animação e som).

Leia o `README.md` antes de tocar em vídeo, etapa ou convenção: ele guarda a tabela das etapas (skill, procedimento, comando, resultado), o mapa das pastas e as convenções. Este arquivo não as repete.

## Ponytail

Ao escrever, alterar, revisar ou projetar código (e ao escolher dependências), aplique a skill `ponytail` no modo `full`: a solução mais simples que funciona, sem abstração especulativa, reaproveitando o que já existe no repositório, depois a stdlib, o recurso nativo e as dependências já instaladas, nesta ordem. Fica ativa em toda resposta até o usuário dizer "stop ponytail" ou "normal mode". Não vale para pesquisa, roteiro, narração e demais conteúdo dos vídeos, que não são código. A skill é global, em `~/.claude/skills/ponytail/`.

## Comandos

`<vídeo>` é o nome da pasta em `src/videos/`, que é também o id da composição no Remotion e o primeiro argumento de todo script.

```bash
pnpm dev                      # Remotion Studio
pnpm lint                     # eslint src scripts && tsc
pnpm test                     # vitest + pytest de tools/narration e de tools/music

pnpm vitest run src/narration/script.test.ts        # um arquivo de teste
pnpm vitest run -t "nome do teste"                  # um teste pelo nome
uv run --project tools/narration pytest tools/narration/test_pitch.py -q   # um teste Python
uv run --project tools/sound pytest tools/music -q   # os de tools/music rodam no ambiente de tools/sound

pnpm check-script <vídeo>     # valida script.json
pnpm narrate <vídeo>          # gera a narração (frases já geradas vêm do cache)
pnpm voice <vídeo>            # estúdio de voz: escolher tomadas de ouvido
pnpm stills <vídeo> [quadros] # PNGs em out/stills/<vídeo>/; sem quadros, um por plano
pnpm critique <vídeo|arquivo> [animatic|som]   # mede o render (ou o som dele) contra a faixa dos vídeos de referência
pnpm music <vídeo> [semente]  # trilha
pnpm render <vídeo>           # out/<vídeo>.mp4
pnpm sound <vídeo> out/<vídeo>.som.mp3   # só o som (voz, trilha e efeitos), em minutos
```

- `pnpm critique <vídeo>` lê `out/<vídeo>.mp4`, então pede um `pnpm render` antes; com `animatic`, as medidas de movimento ainda não reprovam. Com `som`, separa o áudio em voz, música e efeitos na GPU e guarda a separação em `out/som/<nome>/`: apague a pasta para medir de novo um arquivo que mudou. O `pnpm sound` tem configuração própria (`remotion.sound.config.ts`), porque a de `remotion.config.ts` fixa o h264 e recusa uma saída em mp3.
- `pnpm render` não dá o arquivo de entrega: `out/<vídeo>.final.mp4` sai do ffmpeg com `loudnorm`, no passo a passo de `.claude/skills/producao/etapas/corte-final.md`.
- O Vitest só inclui `src/**/*.test.ts` e `scripts/**/*.test.ts`; sem isso rodaria os testes das ferramentas clonadas em `vendor/`.
- Código mudou: `pnpm lint` e `pnpm test`. Etapa de vídeo mudou: o comando dela na tabela do `README.md`.
- `pnpm setup:tools` baixa cerca de 20 GB de modelos; `pnpm narrate`, `pnpm music` e `pnpm render` usam a GPU e levam minutos. `pnpm sfx` é o único comando que depende de serviço externo (`FREESOUND_API_KEY` no `.env`).
- O `tsc` roda com `noUnusedLocals`: uma variável ou um import sem uso derruba o `pnpm lint`.
- As versões de `remotion` e `@remotion/*` são fixas e iguais; atualize só com `pnpm run upgrade` (e a lista `minimumReleaseAgeExclude` em `pnpm-workspace.yaml` acompanha). O Dependabot ignora o Remotion por isso, e separa `torch` e `torchaudio` num PR à parte, porque mudam a voz gerada e pedem teste na GPU.

## Arquitetura

### O roteiro manda, a narração dá o tempo

O fluxo de dados de um vídeo:

1. `src/videos/<vídeo>/script.json` é a fonte: cenas (`id`, `narration`, `shots`, `holdMs`), a trilha (`music`: leitos, momentos, níveis e silêncios) e os efeitos sonoros (`sfx`). `src/narration/script.ts` define o tipo e valida (`parseScript`); cada plano depois do primeiro começa numa palavra da narração (`cue`, com `occurrence` quando a palavra se repete).
2. `pnpm narrate` gera o áudio frase a frase pelo worker Python (`tools/narration/`, chamado por `scripts/lib/voice-worker.ts`), transcreve cada tomada com o Whisper e grava `public/videos/<vídeo>/narration.json`: o manifesto com o arquivo e o instante de cada palavra.
3. No Remotion, `narratedVideoMetadata` (`src/video/metadata.ts`) busca o manifesto e o `music.json` no `calculateMetadata`, confere que o manifesto bate com o roteiro e devolve a duração da composição. Sem narração, a composição não monta.
4. `buildTimeline` (`src/narration/timeline.ts`) converte o manifesto em quadros: duração de cada cena, quadro de cada palavra, trechos de fala. `shotRanges` dá o trecho de cada plano.
5. `NarratedVideo` (`src/video/NarratedVideo.tsx`) monta as cenas em `Series`, toca as frases, a trilha e os efeitos, e passa a cada cena `SceneProps`: `scene` (os tempos) e `shots` (os trechos dos planos).

Consequências: nenhuma cena tem duração fixa; mudar uma frase do roteiro invalida a narração dela e desloca todos os quadros seguintes, e os momentos da trilha, que caem em segundos, pedem `pnpm music` de novo; nenhuma cena toca som; os caminhos da mídia gerada vêm só de `src/media.ts`, que as composições e os scripts compartilham.

### Como uma cena é escrita

`src/videos/<vídeo>/index.tsx` liga cada `id` do roteiro a um componente (`scenes`) e declara duas decisões de encenação por cena: `joined` (os planos que dividem o palco com o anterior em vez de entrar por corte) e `sets` (o cenário de cada plano; planos seguidos no mesmo cenário não o desmontam). `src/video/stage.ts` transforma isso num plano de palco por trecho, que cada `Shot` lê por contexto.

Dentro da cena (veja `src/videos/why-we-sleep/scenes/ThirdOfLifeScene.tsx`):

- Cada plano é um `<Shot range={shots[i]}>`. Dentro dele, `useCurrentFrame()` conta do começo do plano, não da cena.
- Os instantes vêm da fala: `cue(scene, "palavra")` (`src/components/timing.ts`) dá o quadro da cena em que a palavra soa, já adiantado. Num plano que não é o primeiro, subtraia `shots[i].from`.
- O movimento usa as curvas de `timing.ts` (`ramp`, `settle`, `linear`, `drop`) e os primitivos de `src/components/` (`Place`, `Pop`, `SlowPush`, `Camera`, `Idle`, `SvgLayer`); os desenhos reutilizáveis ficam em `src/art/`, os de um vídeo só em `src/videos/<vídeo>/parts/`.
- Nenhuma cor solta: as cores vêm de `src/videos/<vídeo>/palette.ts`; tamanhos de texto, formas e curvas, de `src/design/tokens.ts`.

Um vídeo novo também entra em `src/Root.tsx` como `Composition` com o `calculateMetadata` dele; o formato (1920×1080, 30 fps) vem de `src/format.ts`. A pasta `design` do `Root.tsx` guarda as composições de conferência, que não são vídeos e não têm narração: a folha da identidade, a amostra de movimento, as folhas de modelo dos personagens, os pilotos de polimento, os estudos de `src/studies/` e a `vinheta` (a vinheta do canal, de `src/vignette/`). O `why-we-sleep` é o vídeo modelo.

### Scripts e ferramentas

`scripts/*.ts` são os comandos pnpm (rodam com `tsx`) e importam a lógica pura de `src/` (`src/narration/`, `src/critique/`, `src/audio/`), que é onde os testes estão. `scripts/lib/tools.ts` roda os processos externos (Remotion, ffmpeg, Python via `uv`); `scripts/lib/videos.ts` lê roteiro e manifesto. `tools/narration/` e `tools/sound/` são projetos `uv` próprios (Python 3.11, torch com CUDA); `tools/music/` roda no ambiente do próprio ACE-Step; `vendor/` guarda as ferramentas clonadas pelo `setup:tools` e os pesos do separador de som.

Detalhes que custam tempo: o `tools/music/generate.py` desliga a reescrita da descrição pelo ACE-Step (`use_cot_caption`), que trocava a música pedida por outra; o `pnpm stills` monta o vídeo com `silent`, porque o Remotion falha ao renderizar quadros avulsos de uma composição com áudio.

### Skills e subagentes

O processo de produção mora em `.claude/skills/`, uma skill por dono de entrega: `diretor-criativo` (texto), `diretor-de-arte` (imagem e movimento), `diretor-de-som` (música, mixagem e efeitos) e `producao` (voz, operação das ferramentas e arquivo final). Em cada uma, `SKILL.md` leva do pedido à etapa, `etapas/<etapa>.md` diz como rodá-la neste repositório e as demais pastas guardam o conhecimento do estilo. As skills dirigem na conversa e acionam os subagentes de `.claude/agents/` para levantar, executar e julgar. Use a skill da etapa em vez de improvisar o procedimento; a skill `creator` é a que cria e poda essas skills, e a `grilling` é a entrevista que as três direções acionam para levar decisões ao usuário. `remotion-best-practices` vem do Remotion e fica fora do repositório, em `~/.claude/skills/`: não edite à mão.

## Convenções que mudam o que se escreve

- Nomes de arquivos, código e chaves do roteiro em inglês. Comentários, documentação, conteúdo dos vídeos e skills em português do Brasil.
- Os comentários do código explicam o porquê (a decisão, o workaround), com densidade alta; siga o padrão dos arquivos vizinhos.
- As decisões do usuário ficam na pasta do vídeo, no git: `script.md`, `art.md`, `score.md`, `sound.md`, `approvals.md` e `voice.json` (as tomadas escolhidas de ouvido no `pnpm voice`, que valem acima da escolha automática do `pnpm narrate`). Uma linha de `approvals.md` só é escrita depois do "sim" do usuário na conversa, e nunca é apagada (formato no `README.md`).
- Fora do git: `public/videos/` (narração e trilha), `vendor/`, `voice/` (amostras de voz, dado pessoal), `out/` (renders). Tudo em `out/` e `public/videos/` pode ser gerado de novo.
- Comportamento mudou: os testes e a documentação dele (README, `etapas/`) mudam junto.
