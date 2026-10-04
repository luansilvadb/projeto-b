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

| Etapa          | Skill       | Comando                         | Resultado                                          |
| -------------- | ----------- | ------------------------------- | -------------------------------------------------- |
| 1. Pesquisa    | `research`  |                                 | `research.md`, com fatos e fontes                  |
| 2. Roteiro     | `script`    | `pnpm check-script <vídeo>`     | `script.json`, com os planos, e a **1ª aprovação** |
| 3. Narração    | `narration` | `pnpm narrate <vídeo>`          | áudio e tempo de cada palavra                      |
| 4. Animatic    | `animatic`  | `pnpm stills <vídeo>`           | planos desenhados e a **2ª aprovação**             |
| 5. Animação    | `animation` | `pnpm critique <vídeo>`         | planos animados, medidos contra a referência       |
| 6. Trilha      | `music`     | `pnpm music <vídeo> [semente]`  | trilha instrumental original                       |
| 7. Corte final | `final-cut` | `pnpm render <vídeo>`           | `out/<vídeo>.final.mp4` e a **3ª aprovação**       |

`<vídeo>` é o nome da pasta em `src/videos/`. O vídeo `demo` percorre o caminho inteiro e serve de modelo.

As skills dizem como rodar cada etapa neste repositório. O conhecimento do estilo fica em três skills de conhecimento, também em `.claude/skills/`, que as skills das etapas acionam: `diretor-criativo` (ângulo, estrutura e texto do roteiro), `diretor-de-arte` (elenco, paletas, a divisão de cada cena em planos, desenho e composição) e `animador` (sincronia com a fala, entradas, pausa viva, ação, câmera, transições e efeitos).

Outros comandos: `pnpm dev` abre o Remotion Studio, `pnpm lint` checa tipos e estilo, `pnpm test` roda os testes do código e das ferramentas Python, `pnpm critique <vídeo>` mede o render (movimento, área com desenho e cor) contra a faixa de 12 vídeos de referência, `pnpm eval:voice` compara a configuração da voz com variações dela em 16 frases fixas (naturalidade, entonação, altura, cortes e erros de pronúncia), `pnpm sfx "<busca>"` lista efeitos sonoros CC0 do Freesound e `pnpm sfx <id>` baixa o escolhido, `pnpm identity` renderiza as direções de arte candidatas lado a lado em `out/identity/comparison.png`.

## Onde fica cada coisa

```
src/design/          direção de arte: paleta, tipografia, formas e movimento
src/components/      primitivos visuais reutilizáveis
src/art/             desenhos feitos em código
src/audio/           mixagem da trilha e efeitos sonoros
src/critique/        medidas do render e as faixas dos vídeos de referência
src/narration/       regras do roteiro e tempos da narração
src/video/           montagem de um vídeo narrado
src/videos/<vídeo>/  pesquisa, ficha visual, roteiro e cenas de cada vídeo
scripts/             os comandos pnpm
tools/               scripts Python que chamam os modelos de voz e de trilha
public/fonts/        fontes das direções de arte (OFL)
public/sfx/          efeitos sonoros do Freesound (CC0)
```

Ficam fora do git: `public/videos/` (narração e trilha geradas), `vendor/` (ferramentas clonadas), `voice/` (amostras de voz) e `out/` (renders).

## Convenções

- Nomes de arquivos, código, chaves do roteiro e skills em inglês. Comentários, documentação e o conteúdo dos vídeos em português do Brasil.
- O nome da pasta de um vídeo é também o id da composição e o argumento de todos os comandos.
- Nenhuma cena escreve cor solta. As cores de um vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual dele (`art.md`). Tamanhos de texto, formas e curvas de movimento vêm de `src/design/tokens.ts`.
- A identidade visual do canal ainda está em escolha entre três direções candidatas em `src/design/directions/`; `tokens.ts` expõe a ativa. Elas valem para o vídeo `demo` e para as cenas que ainda não foram redesenhadas; o que fazer com elas agora que as cores são por vídeo está em aberto.
- A duração de cada cena vem da narração. Cenas não têm durações fixas.
- A cena é a unidade da fala; a da imagem é o plano. Cada cena do roteiro lista os seus planos (`shots`), e cada plano começa numa palavra da narração.
- O volume da trilha é calculado em relação ao da voz (`src/audio/ducking.ts`), não ajustado cena a cena.
- As versões do Remotion são fixas e iguais em todos os pacotes `@remotion/*`; atualize com `pnpm run upgrade`.
