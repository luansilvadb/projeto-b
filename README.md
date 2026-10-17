# projeto-b

Vídeos educativos de ciência em motion graphics feitos em código e, com as mesmas ferramentas, curtas narrativos de ficção com narração em off para um evento (Film Jam). Os agentes pesquisam, escrevem, narram, animam, sonorizam e renderizam; uma pessoa decide o que o vídeo quer dizer, julga o que só o olho e o ouvido julgam, e publica ou envia.

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

### Skills compartilhadas e agentes gerados

`.claude/` e `.codex/` são diretórios próprios para os formatos de cada ferramenta. As pastas `.claude/skills/` e `.codex/skills/` são links simbólicos relativos para `../.agents/skills`, mantendo uma única cópia das skills locais. No Windows, habilite o Modo de Desenvolvedor ou use uma conta com permissão para criar links simbólicos; configure `core.symlinks=true` ao materializar o checkout.

Para um clone novo, substitua `URL_DO_REPOSITORIO` pelo endereço do repositório:

```powershell
git -c core.symlinks=true clone URL_DO_REPOSITORIO projeto-b
Set-Location projeto-b
git config --local core.symlinks true
Get-Item -Force -LiteralPath .claude\skills, .codex\skills | Select-Object Name,LinkType,Target
```

Os destinos dos especialistas são gerados a partir de `.agents/agents/*.md`. Execute `pnpm agents:sync` depois de editar a fonte; `pnpm agents:check` verifica as cópias sem escrever. Não edite manualmente `.claude/agents/` nem `.codex/agents/`.

## Conhecimento dos agentes

O repositório não tem arquivo de instruções na raiz: o conhecimento do projeto está neste `README.md`, em `docs/` e nas skills. `.agents/skills/` guarda os workflows de produção e suas unidades; `.agents/agents/*.md` é a fonte central em Markdown das oito definições de especialistas. `pnpm agents:sync` gera `.claude/agents/*.md` e `.codex/agents/*.toml` em seus formatos nativos, e `pnpm agents:check` detecta saídas desatualizadas sem escrever. Edite sempre os arquivos Markdown em `.agents/agents/`. Quem trabalha no repositório deve ler o `README.md` e as páginas de `docs/` pertinentes antes de tocar em vídeo ou convenção.

As seis skills locais são `diretor-de-pauta`, `diretor-criativo`, `diretor-de-arte`, `diretor-de-som`, `diretor-publicacao` e `diretor-producao`. Skills globais, como `creator`, `grilling`, `ponytail` e `remotion-best-practices`, ficam na instalação pessoal em `~/.agents/skills/`, fora do projeto (a de Remotion vem da origem e não é editada à mão). As definições canônicas dos especialistas estão em Markdown em `.agents/agents/`. O gerador mantém a cópia Markdown usada pelo Claude em `.claude/agents/` e cria os TOMLs do Codex em `.codex/agents/`; os detalhes de uso estão em [`docs/agentes.md`](docs/agentes.md).

## Trabalhos, donos e artefatos

Cada artefato de um vídeo tem um dono: uma skill compartilhada pelos agentes em `.agents/skills/`, que guarda o procedimento de cada trabalho em `etapas/`.

O projeto tem dois modos, e o briefing diz qual vale: `canal`, o vídeo educativo de ciência para o YouTube, e `jam`, o curta de ficção com narração em off, obrigatória, feito para um evento. Sem briefing, o modo é `canal` e o destino é o YouTube, e nada muda para os vídeos do canal. O briefing é a seção `## Briefing` de `pauta.md`, e é dado de partida, não estado: o modo diz que regras valem; o destino (o evento, o YouTube ou os dois) decide o pacote de saída e o arquivo de entrega; o prazo, quando o usuário o dá, alimenta o plano de tempo; os recursos e as regras do evento são transcritos como ele os forneceu, e o que falta fica "não fornecido". A fonte é `.agents/skills/diretor-de-pauta/briefing.md`. No modo `jam`, as decisões do canal (a trupe, a voz do canal, o humor na imagem, o piano de cinema mudo) são repertório, e não regra, o curta não tem chamada, e a identidade é a do próprio filme; o ofício vale nos dois, e cada `SKILL.md` diz o que é uma coisa e outra. O formato (1920×1080, 30 fps) e a narração em uma voz só são os mesmos nos dois modos.

| Trabalho           | Dono               | Artefatos                                                         | Procedimentos (`etapas/`)                                   | Comandos                                                      | Dependências reais comuns                                              |
| ------------------ | ------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ponto de partida   | `diretor-de-pauta` | `pauta.md`: o briefing, quando há; no modo `canal`, tema, termo buscado, medições e finalistas; no modo `jam`, a premissa e as que perderam; a pasta do vídeo | `SKILL.md`, `briefing.md`; modo `canal`: `nicho.md`, `candidatos.md`, `medida.md`, `escolha.md`; modo `jam`: `premissa.md` | — | modo `canal`: o que o público busca e quem já responde; o volume, medido pelo usuário. Modo `jam`: o pedido e as regras do evento que o usuário forneceu |
| pesquisa e texto   | `diretor-criativo` | `research.md` (quando há afirmação factual), `script.md`, `script.json` | `pesquisa.md`, `roteiro.md`; no modo `jam`, antes, `estrutura/narrativa.md` | `pnpm check-script`                                           | o tema ou a premissa de `pauta.md`; evidência factual para o que o texto afirma, e na ficção só para o que ela afirma do mundo real |
| imagem e movimento | `diretor-de-arte`  | `art.md`, os `shots` de `script.json`, as cenas, `score.md`, a imagem do cartaz ou da thumbnail | `decupagem.md`, `animatic.md`, `animacao.md`; `quadro/cartaz.md` | `pnpm stills`, `pnpm scene`, `pnpm critique`                  | o texto e os fatos do trecho; o tempo real da fala, quando o movimento depende dele; o conceito da imagem, de `publication.md` |
| voz e operação     | `diretor-producao`         | a narração e o manifesto, `voice.json`, a trilha gerada, os renders; o plano de tempo, dito na conversa | `narracao.md`, `trilha.md`, `efeitos-sonoros.md`; `plano.md` | `pnpm narrate`, `pnpm voice`, `pnpm music`, `pnpm sfx`        | o artefato que o comando consome; o prazo do briefing, para o plano    |
| som                | `diretor-de-som`   | `sound.md`, os campos `music` e `sfx` de `script.json`            | `arco-de-som.md`, `som.md`                                  | `pnpm critique <vídeo> som`                                   | a voz, a duração ou o instante da ação, conforme a dúvida              |
| pacote de saída    | `diretor-publicacao` | `publication.md`, por destino. YouTube: título público, descrição, tags, capítulos, conceito e prompt de thumbnail. Evento: sinopse, créditos, direitos e licenças e as especificações que o evento forneceu | `SKILL.md`, `embalagem/titulo-e-thumbnail.md`, `submissao/pacote-de-evento.md` | — | o destino e as regras do evento, do briefing; `script.md`, `script.json` e, quando existe, `research.md`; narração para os timestamps; o arquivo de entrega medido, para a ficha técnica |
| arquivo final      | `diretor-producao`         | `out/<vídeo>/<vídeo>.final.mp4`, o `.jam.mp4` quando o evento pede outra especificação, `acervo/<vídeo>/` | `corte-final.md`, `acervo.md`                                | `pnpm join`, `pnpm render`, `pnpm sound`                      | os artefatos atuais que serão montados; o destino e as especificações do briefing |

`<vídeo>` é o nome da pasta em `src/videos/`, também quando o produto é um curta. O vídeo `why-we-sleep` serve de modelo do modo `canal`.

**Esses trabalhos se relacionam por dependências de artefato, não por uma fila fixa; uma prova visual, sonora, factual ou de pacote de saída pode acontecer cedo se resolver a maior incerteza atual.** A tabela não é ordem, e nenhum trabalho espera o aceite de outra skill. As dependências que existem são concretas: a voz precisa de um `script.json` válido, com `shots` em toda cena; a composição só monta com a narração gravada; o movimento fino precisa do tempo real da fala; a trilha sincronizada, da duração de cada cena; um efeito, do instante da ação; a montagem, do que vai ser montado; o pacote de saída, do destino, do roteiro e, quando há afirmação factual, da pesquisa atuais, e dos tempos reais da narração para os capítulos; a premissa de um curta e o plano de tempo, do briefing. Um ajuste num vídeo pronto vai direto à skill dona do artefato.

São seis skills, uma por dono de artefato: `diretor-de-pauta` (o ponto de partida: o briefing, o tema do canal escolhido pela procura ou a premissa de um curta, e o registro em `pauta.md`), `diretor-criativo` (pesquisa, ângulo ou frase de intenção, história, estrutura e roteiro), `diretor-de-arte` (intenção visual, desenho, composição, movimento e a imagem do cartaz ou da thumbnail), `diretor-de-som` (intenção de som, música, níveis, silêncios e efeitos), `diretor-publicacao` (o pacote de saída pelo destino: o do YouTube, com título, descrição, tags, capítulos, conceito e prompt de thumbnail, e o de submissão a um evento, com sinopse, créditos, direitos e licenças) e `diretor-producao` (plano de tempo pelo prazo do briefing, voz, operação das ferramentas, arquivo final e acervo). `diretor-criativo` recebe o tema ou a premissa da pauta; `diretor-publicacao` recebe a promessa ou a intenção e as fontes do criativo, e da pauta o termo buscado, o destino e as regras do evento; `diretor-producao` guarda os arquivos depois que o usuário publica ou envia. Em cada skill, `SKILL.md` leva do pedido ao trabalho e ao que ler, e o que é comum às seis (frase de intenção, donos, handoff, gravidade e rodadas) está em `.agents/skills/diretor-producao/equipe/protocolo.md`. O roteiro segue como ponto de encontro: o `diretor-criativo` aciona o `diretor-de-arte` (`etapas/decupagem.md`) para provas e planos, e o `diretor-de-som` entra quando um silêncio muda o tempo do vídeo.

As skills dirigem na conversa; os especialistas que levantam, executam e julgam são subagentes em `.agents/agents/`, acionados por elas e sem o contexto de quem fez o trabalho: `pesquisador`, `checador` e `editor` (do `diretor-criativo`; o `checador` volta na montagem final, acionado pela `diretor-producao`), `ilustrador`, `motion-designer`, `critico-de-quadro` e `critico-de-movimento` (do `diretor-de-arte`), `critico-de-som` (do `diretor-de-som`). Os oito servem aos dois modos: no curta, o `pesquisador` e o `checador` só entram para o que o filme afirma como verdade sobre o mundo real. A skill `remotion-best-practices` vem do Remotion, é atualizada com ele e fica fora do repositório, em `~/.agents/skills/`.

Outros comandos: `pnpm dev` abre o Remotion Studio, `pnpm lint` checa tipos e estilo, `pnpm test` roda os testes do código e das ferramentas Python, `pnpm critique <vídeo>` mede o render (movimento, área com desenho e cor) contra a faixa de 12 vídeos de referência, e com `som` no fim mede o som (nível, continuidade e unidade da música, e quantidade de efeitos) contra a faixa dos mesmos 12 (as faixas são sensores do modo `canal`: num curta situam, e não reprovam), `pnpm eval:voice` compara a configuração da voz com variações dela em 16 frases fixas (naturalidade, entonação, altura, cortes e erros de pronúncia), `pnpm scene <vídeo> <id>` renderiza só uma cena, `pnpm join <vídeo>` monta o vídeo inteiro com as cenas já renderizadas e o som, `pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3` renderiza só o som do vídeo, `pnpm sfx "<busca>"` lista efeitos sonoros CC0 do Freesound e `pnpm sfx <id>` baixa o escolhido.

## Onde fica cada coisa

```
.agents/skills/     skills locais e suas unidades de conhecimento
.agents/agents/    fonte central Markdown dos especialistas
.claude/agents/    cópias Markdown geradas para o Claude Code
.claude/skills/    link relativo para ../.agents/skills
.codex/agents/     definições TOML geradas para Codex
.codex/skills/     link relativo para ../.agents/skills
docs/              documentação durável: comandos, arquitetura, convenções e critérios
src/design/        direção de arte: paleta, tipografia, formas e movimento
src/components/    primitivos visuais reutilizáveis
src/art/           desenhos feitos em código
src/studies/       estudos de imagem e de movimento, fora de qualquer vídeo
src/audio/         mixagem da trilha e catálogo de efeitos sonoros
src/critique/      medidas do render e as faixas dos vídeos de referência
src/narration/     regras do roteiro e tempos da narração
src/video/         montagem de um vídeo narrado
src/videos/<vídeo>/ pesquisa, roteiro, registros de decisão e cenas de cada vídeo
scripts/           os comandos pnpm
tools/             scripts Python que chamam os modelos de voz e de trilha e medem o som
public/fonts/      fontes das direções de arte (OFL)
public/sfx/        efeitos sonoros do Freesound (CC0)
```

Ficam fora do git: `public/videos/` (narração e trilha geradas), `vendor/` (ferramentas clonadas), `voice/` (amostras de voz), `out/` e `acervo/`.

`out/` é a bancada: tudo nela pode ser gerado de novo, cada arquivo tem um lugar e é sobrescrito a cada vez.

```
out/<vídeo>/               tudo de um vídeo
  <vídeo>.mp4              o vídeo inteiro (pnpm join), o som (.som.mp3), o de entrega (.final.mp4) e o do evento (.jam.mp4)
  cenas/<id>.mp4           cada cena como está agora (pnpm scene)
  stills/                  um quadro por plano (pnpm stills)
  tiras/                   as tiras de quadros da crítica de movimento
  conceito/                as imagens das decisões de arte e a do cartaz ou da thumbnail
  som/                     a separação e as medidas do som (pnpm critique ... som)
  trilha/                  as trilhas geradas e comparadas
out/referencias/           os estudos dos vídeos de referência, de todo vídeo
out/ferramentas/           avaliação da voz e testes da trilha, de nenhum vídeo
out/rascunho/              o que não tem lugar acima; pode ser apagada inteira
```

`acervo/<vídeo>/` guarda o que foi ao ar, copiado uma vez depois que o usuário publica ou envia ao evento, e nunca sobrescrito: o vídeo de entrega (e o `.jam.mp4`, quando foi ele o enviado), a narração, a trilha, a thumbnail ou o cartaz e as folhas de modelo dos personagens. Com dois destinos, o segundo envio só acrescenta.

## Convenções

As convenções de código e de conteúdo, o lugar de cada decisão, o que fica fora do Git e como um ajuste é feito estão em [`docs/convencoes.md`](docs/convencoes.md); os comandos, em [`docs/comandos.md`](docs/comandos.md); a arquitetura, em [`docs/arquitetura.md`](docs/arquitetura.md); os critérios de narração, desenho, som e escolha do tema, em [`docs/diretrizes/`](docs/README.md). Em resumo: nomes de arquivos, código e chaves do roteiro em inglês, e documentação, conteúdo dos vídeos e skills em português do Brasil; a duração de cada cena vem da narração; nenhuma cena escreve cor solta nem toca som; as decisões do usuário ficam na pasta do vídeo, no arquivo do dono. Não há processo de propostas: uma mudança de critério atualiza a página de `docs/` pertinente e fica no histórico do Git.
