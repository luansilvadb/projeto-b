# projeto-b

Vídeos educativos de ciência em motion graphics feitos em código. O Claude Code pesquisa, escreve, narra, anima e renderiza; uma pessoa aprova o roteiro, o animatic e o corte final.

Tudo roda na máquina local, sem serviço pago: [Remotion](https://www.remotion.dev) para a animação, OmniVoice para a voz clonada, Whisper para conferir a fala e ACE-Step 1.5 para a trilha. Os pesos do OmniVoice são de uso não comercial (CC-BY-NC).

## Requisitos

- Windows com GPU NVIDIA de 8 GB de VRAM e 16 GB de RAM
- Node.js 24, pnpm, git, uv e ffmpeg no PATH

## Instalação

```bash
pnpm install
pnpm setup:tools
```

O `setup:tools` clona as ferramentas de IA em `vendor/`, cria os ambientes Python e baixa os modelos do ACE-Step (cerca de 20 GB). Os modelos de voz e de transcrição (mais uns 5 GB) descem no primeiro `pnpm narrate`. O comando pode ser repetido: cada passo confere se já foi feito.

Para buscar efeitos sonoros no [Freesound](https://freesound.org), copie `.env.example` para `.env` e preencha a chave gratuita. É o único serviço externo do projeto, e só o `pnpm sfx` depende dele.

Para narrar com a sua voz, grave de 5 a 10 segundos em ambiente silencioso e salve em `voice/reference.wav`. Sem esse arquivo a narração usa uma voz provisória, que serve para testar e não para publicar.

## Como um vídeo é feito

Cada etapa tem uma skill do Claude Code em `.claude/skills/` com o passo a passo.

| Etapa          | Skill       | Comando                         | Resultado                                    |
| -------------- | ----------- | ------------------------------- | -------------------------------------------- |
| 1. Pesquisa    | `research`  |                                 | `research.md`, com fatos e fontes            |
| 2. Roteiro     | `script`    | `pnpm check-script <vídeo>`     | `script.json` e a **1ª aprovação**           |
| 3. Narração    | `narration` | `pnpm narrate <vídeo>`          | áudio e tempo de cada palavra                |
| 4. Animatic    | `animatic`  | `pnpm stills <vídeo>`           | cenas compostas e a **2ª aprovação**         |
| 5. Animação    | `animation` | `pnpm stills <vídeo> <quadros>` | cenas animadas                               |
| 6. Trilha      | `music`     | `pnpm music <vídeo> [semente]`  | trilha instrumental original                 |
| 7. Corte final | `final-cut` | `pnpm render <vídeo>`           | `out/<vídeo>.final.mp4` e a **3ª aprovação** |

`<vídeo>` é o nome da pasta em `src/videos/`. O vídeo `demo` percorre o caminho inteiro e serve de modelo.

Outros comandos: `pnpm dev` abre o Remotion Studio, `pnpm lint` checa tipos e estilo, `pnpm test` roda os testes do código e das ferramentas Python, `pnpm sfx "<busca>"` lista efeitos sonoros CC0 do Freesound e `pnpm sfx <id>` baixa o escolhido, `pnpm identity` renderiza as direções de arte candidatas lado a lado em `out/identity/comparison.png`.

## Onde fica cada coisa

```
src/design/          direção de arte: paleta, tipografia, formas e movimento
src/components/      primitivos visuais reutilizáveis
src/art/             desenhos feitos em código
src/audio/           mixagem da trilha e efeitos sonoros
src/narration/       regras do roteiro e tempos da narração
src/video/           montagem de um vídeo narrado
src/videos/<vídeo>/  pesquisa, roteiro e cenas de cada vídeo
scripts/             os comandos pnpm
tools/               scripts Python que chamam os modelos de voz e de trilha
public/fonts/        fontes das direções de arte (OFL)
public/sfx/          efeitos sonoros do Freesound (CC0)
```

Ficam fora do git: `public/videos/` (narração e trilha geradas), `vendor/` (ferramentas clonadas), `voice/` (amostras de voz) e `out/` (renders).

## Convenções

- Nomes de arquivos, código, chaves do roteiro e skills em inglês. Comentários, documentação e o conteúdo dos vídeos em português do Brasil.
- O nome da pasta de um vídeo é também o id da composição e o argumento de todos os comandos.
- Cores, tamanhos de texto, formas e curvas de movimento vêm de `src/design/tokens.ts`, nunca de valores soltos numa cena. A identidade visual ainda está em escolha entre três direções candidatas em `src/design/directions/`; `tokens.ts` expõe a ativa, e a pasta `design` do Studio mostra a folha de identidade e a amostra de movimento dela.
- A duração de cada cena vem da narração. Cenas não têm durações fixas.
- O volume da trilha é calculado em relação ao da voz (`src/audio/ducking.ts`), não ajustado cena a cena.
- As versões do Remotion são fixas e iguais em todos os pacotes `@remotion/*`; atualize com `pnpm run upgrade`.
