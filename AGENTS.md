# AGENTS.md

Este arquivo reúne as instruções compartilhadas por Codex, Claude Code e outros agentes ao trabalhar neste repositório. Mantenha as instruções em `AGENTS.md` e o conhecimento local em `.agents/`; `CLAUDE.md` e `.claude` são links de compatibilidade para esses destinos.

## Projeto

Vídeos educativos de ciência em motion graphics feitos em código (Remotion 4, React 19, TypeScript), com narração em voz clonada (OmniVoice), conferência por Whisper e trilha gerada (ACE-Step). Tudo roda na máquina local (Windows, GPU NVIDIA). O repositório reúne o que um vídeo pede: pesquisa e roteiro, voz, desenho e animação, som, montagem e arquivo de entrega. Esses trabalhos se ligam pelos artefatos que cada um consome, e não por uma fila: não existe etapa corrente, aprovação pendente nem estado global do vídeo.

Leia o `README.md` antes de tocar em vídeo ou convenção: ele guarda o mapa das pastas, os comandos, os artefatos de um vídeo com o dono de cada um e as convenções técnicas. Este arquivo não as repete.

## Ponytail

Ao escrever, alterar, revisar ou projetar código (e ao escolher dependências), aplique a skill `ponytail` no modo `full`: a solução mais simples que funciona, sem abstração especulativa, reaproveitando o que já existe no repositório, depois a stdlib, o recurso nativo e as dependências já instaladas, nesta ordem. Fica ativa em toda resposta até o usuário dizer "stop ponytail" ou "normal mode". Não vale para pesquisa, roteiro, narração e demais conteúdo dos vídeos, que não são código. A skill é global, em `~/.agents/skills/ponytail/`.

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
pnpm stills <vídeo> [quadros] # PNGs em out/<vídeo>/stills/; sem quadros, um por plano
pnpm critique <vídeo|arquivo> [animatic|som]   # mede o render (ou o som dele) contra a faixa dos vídeos de referência
pnpm music <vídeo> [semente]  # trilha
pnpm scene <vídeo> <id> [id...]   # renderiza só essas cenas, em out/<vídeo>/cenas/<id>.mp4
pnpm join <vídeo>             # o vídeo inteiro, das cenas já renderizadas e do som: out/<vídeo>/<vídeo>.mp4
pnpm render <vídeo> out/<vídeo>/<vídeo>.mp4   # o vídeo inteiro de uma vez, em cerca de meia hora
pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3   # só o som (voz, trilha e efeitos), em minutos
```

- `pnpm critique <vídeo>` lê `out/<vídeo>/<vídeo>.mp4`, então pede um `pnpm join` (ou um `pnpm render`) antes; com `animatic`, as medidas de movimento ainda não valem. Medida fora da faixa não é erro do comando: ele só falha quando não consegue medir. Com `som`, separa o áudio em voz, música e efeitos na GPU e guarda a separação em `som/<nome>/`, ao lado do arquivo medido: apague a pasta para medir de novo um arquivo que mudou. O `pnpm sound` tem configuração própria (`remotion.sound.config.ts`), porque a de `remotion.config.ts` fixa o h264 e recusa uma saída em mp3.
- `pnpm render` não dá o arquivo de entrega: `out/<vídeo>/<vídeo>.final.mp4` sai do ffmpeg com `loudnorm`, no passo a passo de `.agents/skills/diretor-producao/etapas/corte-final.md`.
- O Vitest só inclui `src/**/*.test.ts` e `scripts/**/*.test.ts`; sem isso rodaria os testes das ferramentas clonadas em `vendor/`.
- Código mudou: `pnpm lint` e `pnpm test`. Artefato de vídeo mudou: o comando que o confere, na tabela do `README.md`.
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

O conhecimento de produção mora em `.agents/skills/`, uma skill por dono de artefato: `diretor-criativo` (texto e fatos), `diretor-de-arte` (imagem e movimento), `diretor-de-som` (música, mixagem e efeitos), `diretor-publicacao` (pacote do YouTube) e `diretor-producao` (voz, operação das ferramentas, arquivo final e acervo). Em cada uma, `SKILL.md` leva do pedido ao trabalho e ao que ler, os arquivos de `etapas/` dizem como fazer cada trabalho neste repositório e as demais pastas guardam o conhecimento do estilo. As skills dirigem na conversa e acionam os subagentes de `.agents/agents/` para levantar, executar e julgar.

O pedido determina o dono, e a skill dona determina o conhecimento e o procedimento: quando um trabalho toca texto, imagem, som, publicação ou operação, use a skill dona daquele artefato e carregue só as unidades que ele pede, em vez de improvisar o procedimento. Uma tarefa isolada ("corrija o instante deste efeito", "essa causalidade não está sustentada", "revise o título do YouTube", "renderize estas cenas") vai direto ao dono, sem percorrer nada antes por rito. O que um trabalho precisa para começar são os artefatos que produzem evidência válida para ele (um `script.json` válido para a voz, o tempo real da fala para o movimento fino, o instante da ação para um efeito, roteiro e pesquisa atuais para a publicação), e nunca a posição numa sequência nem o aceite de outra disciplina. Quando a mudança pedida é de outro artefato, ela pertence ao dono dele.

A skill `creator`, em `~/.agents/skills/creator/`, cria e poda essas skills; a `grilling`, em `~/.agents/skills/grilling/`, é a entrevista que as quatro direções acionam para levar decisões ao usuário. Ambas são globais, fora do repositório. `remotion-best-practices` também é global, em `~/.agents/skills/remotion-best-practices/`, e vem do Remotion: não edite à mão. A organização dos links globais é definida em `~/.agents/AGENTS.md`.

As seis skills OpenSpec também são globais, em `~/.agents/skills/`: `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-propose`, `openspec-sync-specs` e `openspec-update-change`. Use essas fontes ao trabalhar com OpenSpec; os artefatos do projeto continuam em `openspec/`, e os comandos do Claude em `.agents/commands/opsx/`.

## Convenções que mudam o que se escreve

- Nomes de arquivos, código e chaves do roteiro em inglês. Comentários, documentação, conteúdo dos vídeos e skills em português do Brasil.
- Os comentários do código explicam o porquê (a decisão, o workaround), com densidade alta; siga o padrão dos arquivos vizinhos.
- As decisões do usuário ficam na pasta do vídeo, no git, cada uma no arquivo do dono: `script.md` (texto), `publication.md` (pacote público), `art.md` (imagem), `score.md` (movimento), `sound.md` (som) e `voice.json` (as tomadas escolhidas de ouvido no `pnpm voice`, que valem acima da escolha automática do `pnpm narrate`). A execução equivalente pode mudar; a decisão material que o usuário já tomou não é alterada em silêncio. Não há registro global de decisões nem de estado.
- Os arquivos `approvals.md` que existem são histórico legado dos vídeos feitos sob o processo antigo: não são apagados nem migrados, e não são fonte de estado, gate nem pré-condição de trabalho novo. Nada os consulta, e nada escreve linha nova neles.
- Fora do git: `public/videos/` (narração e trilha), `vendor/`, `voice/` (amostras de voz, dado pessoal), `out/` (a bancada: renders e conferências) e `acervo/` (o que foi publicado). Tudo em `out/` e `public/videos/` pode ser gerado de novo.
- Comportamento mudou: os testes e a documentação dele (README, `etapas/`) mudam junto.

## Como um ajuste é feito

Valem para as cinco direções, em toda conversa.

- **No lugar.** Um ajuste edita o arquivo da cena ou do desenho, e o "antes" é o git. Nada de versão ao lado atrás de uma chave, nem de composição paralela para depois ligar cena a cena: isso só cabe a um desenho que ainda não existe em cena nenhuma. O ajuste é visto com `pnpm scene <vídeo> <id>`, que leva segundos por cena, e o vídeo inteiro sai de `pnpm join`.
- **Um endereço por arquivo.** O que um comando grava em `out/` tem lugar fixo e é sobrescrito (o mapa está no `README.md`). O que não tem lugar (comparação lado a lado, script avulso, teste) vai para `out/rascunho/`, que pode ser apagada inteira a qualquer hora.
- **Linha de parada.** A régua de uma cena é o trecho do mesmo vídeo que o usuário já aceitou (sem ele, o último vídeo publicado), não o canal de referência: a referência ensina método e não reprova cena. Depois de duas recusas do usuário no mesmo ajuste, diga que a linha chegou, explicite o defeito que resta e proponha encerrar na terceira entrega com a ressalva à vista, dita na conversa: o defeito vira lição candidata. Não vale para o que quebra o entendimento (imagem que contradiz a narração, texto ilegível, erro de fato), que é consertado sempre.
- **Retrospectiva.** Quando o usuário aceita algo que antes recusou, a diferença entre a primeira entrega e a aceita é uma lição. Pergunte em uma linha, na língua do produto (o que se vê ou se ouve, nunca o texto da skill), se ela vale para os próximos vídeos. Com o "sim": se a unidade dona do assunto já dizia aquilo, reescreva o trecho que não foi seguido; se não dizia, acrescente a lição marcada como **proposta**. A proposta pode ser usada, e a crítica não reprova por ela; vira regra quando um produto feito por ela é aceito de primeira, e sai quando é recusado. Uma lição por commit, para poder ser desfeita sozinha. O que foi aceito de primeira não gera pergunta.
