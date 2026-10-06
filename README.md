# projeto-b

Vídeos educativos de ciência em motion graphics feitos em código. O Claude Code pesquisa, escreve, narra, anima, sonoriza e renderiza; uma pessoa aprova o roteiro, o animatic e o corte final.

Tudo roda na máquina local, sem serviço pago: [Remotion](https://www.remotion.dev) para a animação, OmniVoice para a voz clonada, Whisper para conferir a fala, ACE-Step 1.5 para a trilha e o CDX23 (um Demucs) para medir o som. Os pesos do OmniVoice são de uso não comercial (CC-BY-NC).

## Requisitos

- Windows com GPU NVIDIA de 8 GB de VRAM e 16 GB de RAM
- Node.js 24, pnpm, git, uv e ffmpeg no PATH

## Instalação

```bash
pnpm install
pnpm setup:tools
```

O `setup:tools` clona as ferramentas de IA em `vendor/`, cria os ambientes Python e baixa os modelos do ACE-Step (cerca de 20 GB). Os modelos de voz e de transcrição (mais uns 5 GB) descem no primeiro `pnpm narrate`, e o de separação de som (100 MB), no primeiro `pnpm critique <vídeo> som`. O comando pode ser repetido: cada passo confere se já foi feito.

Para buscar efeitos sonoros no [Freesound](https://freesound.org), copie `.env.example` para `.env` e preencha a chave gratuita. É o único serviço externo do projeto, e só o `pnpm sfx` depende dele.

Para narrar com a sua voz, grave de 5 a 10 segundos em ambiente silencioso e salve em `voice/reference.wav`. Sem esse arquivo a narração não roda.

## Como um vídeo é feito

Cada etapa pertence a uma skill do Claude Code em `.claude/skills/`, que guarda o passo a passo em `etapas/<etapa>.md`.

| Etapa          | Skill              | Procedimento             | Comando                         | Resultado                                          |
| -------------- | ------------------ | ------------------------ | ------------------------------- | -------------------------------------------------- |
| 1. Pesquisa    | `diretor-criativo` | `etapas/pesquisa.md`     |                                 | `research.md`, com fatos e fontes                  |
| 2. Roteiro     | `diretor-criativo` | `etapas/roteiro.md`      | `pnpm check-script <vídeo>`     | `script.json`, com os planos, e a **1ª aprovação** |
| 3. Narração    | `producao`         | `etapas/narracao.md`     | `pnpm narrate <vídeo>`          | áudio e tempo de cada palavra                      |
| 4. Animatic    | `diretor-de-arte`  | `etapas/animatic.md`     | `pnpm stills <vídeo>`           | planos desenhados e a **2ª aprovação**             |
| 5. Animação    | `diretor-de-arte`  | `etapas/animacao.md`     | `pnpm critique <vídeo>`         | planos animados, medidos contra a referência       |
| 6. Som         | `diretor-de-som`   | `etapas/som.md`          | `pnpm music <vídeo> [semente]`  | trilha original, efeitos e o aceite do som         |
| 7. Corte final | `producao`         | `etapas/corte-final.md`  | `pnpm render <vídeo>`           | `out/<vídeo>.final.mp4` e a **3ª aprovação**       |
| 8. Publicação  | `producao`         | `etapas/publicacao.md`   |                                 | `description.md`, com título e fontes              |

`<vídeo>` é o nome da pasta em `src/videos/`. O vídeo `why-we-sleep` serve de modelo.

São quatro skills, uma por dono de entrega: `diretor-criativo` (o texto: pesquisa, ângulo, estrutura e roteiro), `diretor-de-arte` (a imagem e o movimento: elenco, paletas, a divisão de cada cena em planos, desenho, composição e animação), `diretor-de-som` (tudo que se ouve além da voz: a música, os níveis, os silêncios e os efeitos sonoros) e `producao` (a voz e o arquivo final: narração, a operação das ferramentas de som, corte final e a descrição de publicação). Em cada uma, `SKILL.md` leva do pedido à etapa; os arquivos de `etapas/` dizem como rodar a etapa neste repositório; as unidades, nas outras pastas, guardam o conhecimento do estilo. O roteiro é a etapa que cruza skills: antes da 1ª aprovação, o `diretor-criativo` aciona o `diretor-de-arte` para os planos (`etapas/decupagem.md`) e o `diretor-de-som` para o arco de som (`etapas/arco-de-som.md`), de onde saem os silêncios que o som pede ao texto. As skills dirigem na conversa; os especialistas que levantam, executam e julgam são subagentes em `.claude/agents/`, acionados por elas e sem o contexto de quem fez o trabalho: `pesquisador`, `checador` e `editor` (do `diretor-criativo`; o `checador` volta no corte final, acionado pela `producao`), `ilustrador`, `motion-designer`, `critico-de-quadro` e `critico-de-movimento` (do `diretor-de-arte`), `critico-de-som` (do `diretor-de-som`). A skill `remotion-best-practices` vem do Remotion, é atualizada com ele e fica fora do repositório, em `~/.claude/skills/` (global do Claude Code).

Outros comandos: `pnpm dev` abre o Remotion Studio, `pnpm lint` checa tipos e estilo, `pnpm test` roda os testes do código e das ferramentas Python, `pnpm critique <vídeo>` mede o render (movimento, área com desenho e cor) contra a faixa de 12 vídeos de referência, e com `som` no fim mede o som (nível, continuidade e unidade da música, e quantidade de efeitos) contra a faixa dos mesmos 12, `pnpm eval:voice` compara a configuração da voz com variações dela em 16 frases fixas (naturalidade, entonação, altura, cortes e erros de pronúncia), `pnpm sound <vídeo> out/<vídeo>.som.mp3` renderiza só o som do vídeo, `pnpm sfx "<busca>"` lista efeitos sonoros CC0 do Freesound e `pnpm sfx <id>` baixa o escolhido.

## Onde fica cada coisa

```
src/design/          direção de arte: paleta, tipografia, formas e movimento
src/components/      primitivos visuais reutilizáveis
src/art/             desenhos feitos em código
src/audio/           mixagem da trilha e catálogo de efeitos sonoros
src/critique/        medidas do render e as faixas dos vídeos de referência
src/narration/       regras do roteiro e tempos da narração
src/video/           montagem de um vídeo narrado
src/videos/<vídeo>/  pesquisa, roteiro, registros de decisão, aprovações e cenas de cada vídeo
scripts/             os comandos pnpm
tools/               scripts Python que chamam os modelos de voz e de trilha e medem o som
public/fonts/        fontes das direções de arte (OFL)
public/sfx/          efeitos sonoros do Freesound (CC0)
```

Ficam fora do git: `public/videos/` (narração e trilha geradas), `vendor/` (ferramentas clonadas), `voice/` (amostras de voz) e `out/` (renders).

## Convenções

- Nomes de arquivos, código e chaves do roteiro em inglês. Comentários, documentação, o conteúdo dos vídeos e as skills (com as suas etapas e unidades) em português do Brasil.
- O nome da pasta de um vídeo é também o id da composição e o argumento de todos os comandos.
- O que o usuário decidiu fica na pasta do vídeo, no git: `script.md` (as decisões do texto, sem narração), `art.md` (a ficha visual), `score.md` (a partitura da animação) e `sound.md` (o arco e o mapa de som). `out/` guarda só o que pode ser gerado de novo.
- Cada aprovação é uma linha de `src/videos/<vídeo>/approvals.md`, escrita só depois do "sim" do usuário na conversa: `| <1ª: roteiro, 2ª: animatic, aceite da animação, aceite do som ou 3ª: corte final> | <aaaa-mm-dd> | <o que cobriu, e as ressalvas aceitas> |`. Linha nunca é apagada: se o que foi aprovado mudar, entra uma linha `reaberta: <qual>` com o motivo, e a aprovação seguinte é uma linha nova. Vale a última linha de cada aprovação. As numeradas são três; o aceite da animação e o do som ficam, nessa ordem, entre a 2ª e a 3ª.
- Nenhuma cena escreve cor solta. As cores de um vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual dele (`art.md`). Tamanhos de texto, formas e curvas de movimento vêm de `src/design/tokens.ts`.
- A direção de arte base do canal é a `abissal`, em `src/design/tokens.ts`. Ela vale para as cenas que ainda não foram redesenhadas; as cores de cada vídeo ficam na `palette.ts` dele.
- A duração de cada cena vem da narração. Cenas não têm durações fixas.
- A cena é a unidade da fala; a da imagem é o plano. Cada cena do roteiro lista os seus planos (`shots`), e cada plano começa numa palavra da narração.
- O som além da voz é dado do roteiro, e nenhuma cena toca som: a trilha, os momentos dela, os níveis e os silêncios ficam em `music`, e os efeitos, em `sfx`. O volume de cada um é uma distância em dB abaixo da voz (`src/audio/ducking.ts` e `src/audio/sfx.ts`), nunca um número ajustado à mão.
- As versões do Remotion são fixas e iguais em todos os pacotes `@remotion/*`; atualize com `pnpm run upgrade`.
