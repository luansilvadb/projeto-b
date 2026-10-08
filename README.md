# projeto-b

Vídeos educativos de ciência em motion graphics feitos em código. Os agentes pesquisam, escrevem, narram, animam, sonorizam e renderizam; uma pessoa decide o que o vídeo quer dizer, julga o que só o olho e o ouvido julgam, e publica.

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

### Links simbólicos no Windows

Os caminhos de compatibilidade dos agentes são links relativos: `.claude` aponta para `.agents`, e `CLAUDE.md` aponta para `AGENTS.md`. No Windows, habilite o Modo de Desenvolvedor nas configurações do sistema ou use uma conta com permissão para criar links simbólicos. O Git também precisa de `core.symlinks=true` ao materializar o checkout.

Para um clone novo, substitua `URL_DO_REPOSITORIO` pelo endereço do repositório:

```powershell
git -c core.symlinks=true clone URL_DO_REPOSITORIO projeto-b
Set-Location projeto-b
git config --local core.symlinks true
Get-Item -Force -LiteralPath .claude,CLAUDE.md | Select-Object Name,LinkType,Target
```

O resultado deve mostrar `SymbolicLink` com destinos `.agents` e `AGENTS.md`, sem caminho absoluto. A configuração local vale só para este checkout; não é necessário alterar a configuração global do Git.

Se o clone foi feito com suporte a symlinks desabilitado, os dois caminhos podem ser arquivos de texto contendo apenas seus destinos. Habilitar a opção depois não os converte automaticamente. Na raiz do checkout, confira primeiro que `.agents` e `AGENTS.md` contêm o conhecimento completo. O trecho abaixo só remove os dois arquivos de texto com os destinos esperados; interrompe se encontrar diretórios, links existentes ou outro conteúdo:

```powershell
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath .agents -PathType Container) -or
    -not (Test-Path -LiteralPath AGENTS.md -PathType Leaf)) {
    throw 'Os destinos canônicos precisam existir antes da recuperação.'
}
foreach ($entry in @(
    @{ Path = '.claude'; Target = '.agents' }
    @{ Path = 'CLAUDE.md'; Target = 'AGENTS.md' }
)) {
    $item = Get-Item -Force -LiteralPath $entry.Path
    if ($item.PSIsContainer -or $item.LinkType -or
        (Get-Content -Raw -LiteralPath $entry.Path).Trim() -ne $entry.Target) {
        throw "Preserve $($entry.Path): não é o arquivo de texto esperado."
    }
}
git config --local core.symlinks true
Remove-Item -LiteralPath .claude,CLAUDE.md
New-Item -ItemType SymbolicLink -Path .claude -Target .agents
New-Item -ItemType SymbolicLink -Path CLAUDE.md -Target AGENTS.md
Get-Item -Force -LiteralPath .claude,CLAUDE.md | Select-Object Name,LinkType,Target
```

Se a criação for recusada, corrija a permissão de links e repita a criação dos links faltantes. Preserve sempre os destinos canônicos; os links não exigem cópias nem sincronização de arquivos.

## Conhecimento dos agentes

`.agents/` é a fonte canônica do conhecimento local: `skills/` guarda os workflows e suas unidades, `agents/` guarda as oito definições de especialistas e `commands/opsx/` guarda os seis comandos do Claude. As instruções compartilhadas ficam em `AGENTS.md` na raiz. Edite os destinos canônicos; `.claude` e `CLAUDE.md` são apenas os links de compatibilidade descritos acima.

As dez skills locais são `diretor-criativo`, `diretor-de-arte`, `diretor-de-som`, `producao`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-propose`, `openspec-sync-specs` e `openspec-update-change`. A `creator` e a `grilling` ficam na instalação global compartilhada.

O Codex descobre as skills em `.agents/skills/` e lê `AGENTS.md`; o Claude Code acessa o mesmo conteúdo pelos links. As definições Markdown de especialistas e os comandos `/opsx:*` mantêm o formato do Claude: centralizá-los não os registra automaticamente como subagentes ou comandos nativos do Codex. Skills globais externas, como `ponytail` e `remotion-best-practices`, continuam em suas instalações fora do projeto. Depois da migração, abra novas sessões para carregar o novo inventário.

### Conhecimento global compartilhado

A instalação pessoal é separada do repositório: `~/.agents/skills/` é a fonte física das skills globais compartilhadas. O Codex as descobre nesse diretório; a própria pasta `~/.claude/skills/` é um link simbólico para essa fonte. Adicionar, alterar ou remover uma skill na fonte se reflete automaticamente no caminho do Claude.

As 11 skills pessoais compartilhadas são `creator`, `find-skills`, `skill-creator`, `grilling`, `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review` e `remotion-best-practices`. Elas continuam externas ao projeto; o conteúdo técnico da skill de Remotion é mantido pela origem, não editado à mão. A `grilling` global pessoal está em `.agents/skills`, sem outra instalação pessoal em `.codex/skills/grilling`.

As pastas globais `.claude` e `.codex` continuam físicas; o link é a pasta `.claude/skills`. Ela compartilha toda a árvore de `.agents/skills`, incluindo `synced`. As skills sincronizadas continuam mantidas pelos aplicativos; plugins, skills de sistema e ChatCut ficam nos caminhos gerenciados pelo aplicativo. As versões locais e gerenciadas podem ter o mesmo nome de uma skill pessoal.

Edite a fonte em `~/.agents/skills/`. Para instalar uma skill pessoal nova, coloque ali o diretório completo; não crie links individuais nem substitua o link da pasta por uma pasta comum. Não substitua uma entrada existente antes de comparar e preservar seu conteúdo. Depois de atualizar por um instalador, confira se ele preservou o link da pasta; preserve e revise qualquer cópia física antes de restabelecer o link. Os scripts de avaliação de `skill-creator` ainda dependem de `claude -p`, mesmo quando a skill é consultada pelo Codex.

Para conferir o link da pasta no Windows:

```powershell
Get-Item -Force -LiteralPath (Join-Path $env:USERPROFILE '.claude/skills') |
    Select-Object FullName,LinkType,Target
```

O resultado deve mostrar `SymbolicLink` com destino na pasta `~/.agents/skills/`. Links globais exigem a mesma permissão do Windows explicada acima, mas não dependem de uma configuração do Git.

As instruções globais têm uma única fonte regular em `~/.agents/AGENTS.md`, separada do `AGENTS.md` deste repositório:

| Caminho lido pelo cliente | Destino relativo do link |
| ------------------------ | ------------------------ |
| `~/.codex/AGENTS.md` | `../.agents/AGENTS.md` |
| `~/.claude/CLAUDE.md` | `../.agents/AGENTS.md` |

Edite a fonte global para orientações que valem em todos os projetos; as regras de produção deste repositório continuam no arquivo local. Os dois arquivos globais anteriores estavam vazios, então a fonte inicial só explica essa organização. No Codex, um `AGENTS.override.md` não vazio no diretório global tem precedência; com `CODEX_HOME` definido, confira os arquivos nesse diretório efetivo. Não remova um override sem preservar e revisar suas instruções.

```powershell
$codexRoot = if ($env:CODEX_HOME) { $env:CODEX_HOME } else {
    Join-Path $env:USERPROFILE '.codex'
}
$globalInstructionLinks = @(
    (Join-Path $codexRoot 'AGENTS.md'),
    (Join-Path $env:USERPROFILE '.claude/CLAUDE.md')
)
Get-Item -Force -LiteralPath $globalInstructionLinks | Select-Object FullName,LinkType,Target
```

Os dois resultados devem ser `SymbolicLink` para `../.agents/AGENTS.md` nesta instalação. Essa compatibilidade é para Codex e Claude Code locais; não presume o carregamento de links de instruções ou skills pessoais em Cowork ou sessões na nuvem. Abra novas sessões para conferir as fontes das instruções e o inventário de skills; ler o mesmo arquivo pelos links é uma conferência estrutural, não prova de descoberta no cliente.

A migração global guarda o inventário, hashes, origens e referências anteriores em `out/rascunho/unificar-instrucoes-globais-em-agents/`. O `verification.md` dessa pasta descreve os resultados e a reversão seletiva: remova somente os links, sem percorrer seus destinos, e restaure as entradas envolvidas a partir do backup conferido. Preserve edições posteriores nas fontes; não restaure pastas globais inteiras nem use `git reset --hard`. A bancada é temporária: mantenha o backup enquanto precisar dessa reversão e descarte-o quando ela não for mais necessária.

## Trabalhos, donos e artefatos

Cada artefato de um vídeo tem um dono: uma skill compartilhada pelos agentes em `.agents/skills/`, que guarda o procedimento de cada trabalho em `etapas/`.

| Trabalho           | Dono               | Artefatos                                                         | Procedimentos (`etapas/`)                                   | Comandos                                                      | Dependências reais comuns                                              |
| ------------------ | ------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| pesquisa e texto   | `diretor-criativo` | `research.md`, `script.md`, `script.json`                         | `pesquisa.md`, `roteiro.md`                                 | `pnpm check-script`                                           | evidência factual para o que o texto afirma                            |
| imagem e movimento | `diretor-de-arte`  | `art.md`, os `shots` de `script.json`, as cenas, `score.md`       | `decupagem.md`, `animatic.md`, `animacao.md`                | `pnpm stills`, `pnpm scene`, `pnpm critique`                  | o texto e os fatos do trecho; o tempo real da fala, quando o movimento depende dele |
| voz e operação     | `producao`         | a narração e o manifesto, `voice.json`, a trilha gerada, os renders | `narracao.md`, `trilha.md`, `efeitos-sonoros.md`            | `pnpm narrate`, `pnpm voice`, `pnpm music`, `pnpm sfx`        | o artefato que o comando consome                                       |
| som                | `diretor-de-som`   | `sound.md`, os campos `music` e `sfx` de `script.json`            | `arco-de-som.md`, `som.md`                                  | `pnpm critique <vídeo> som`                                   | a voz, a duração ou o instante da ação, conforme a dúvida              |
| arquivo final      | `producao`         | `out/<vídeo>/<vídeo>.final.mp4`, `description.md`                 | `corte-final.md`, `publicacao.md`                           | `pnpm join`, `pnpm render`, `pnpm sound`                      | os artefatos atuais que serão montados                                 |

`<vídeo>` é o nome da pasta em `src/videos/`. O vídeo `why-we-sleep` serve de modelo.

**Esses trabalhos se relacionam por dependências de artefato, não por uma fila fixa; uma prova visual, sonora ou factual pode acontecer cedo se resolver a maior incerteza atual.** A tabela não é ordem, e nenhum trabalho espera o aceite de outro. As dependências que existem são concretas: a voz precisa de um `script.json` válido, com `shots` em toda cena; a composição só monta com a narração gravada; o movimento fino precisa do tempo real da fala; a trilha sincronizada, da duração de cada cena; um efeito, do instante da ação; a montagem, do que vai ser montado; a descrição, das fontes e do texto atual. Um ajuste num vídeo pronto vai direto à skill dona do artefato, e quando a mudança pedida é de outro artefato, ela pertence ao dono dele.

São quatro skills, uma por dono de artefato: `diretor-criativo` (o texto: pesquisa, ângulo, estrutura e roteiro), `diretor-de-arte` (a imagem e o movimento: elenco, paletas, a divisão de cada cena em planos, desenho, composição e animação), `diretor-de-som` (tudo que se ouve além da voz: a música, os níveis, os silêncios e os efeitos sonoros) e `producao` (a voz e o arquivo final: narração, a operação das ferramentas de som, a montagem e a descrição de publicação). Em cada uma, `SKILL.md` leva do pedido ao trabalho e ao que ler; os arquivos de `etapas/` dizem como fazer cada trabalho neste repositório; as unidades, nas outras pastas, guardam o conhecimento do estilo. O roteiro é o artefato em que as skills se cruzam: o `diretor-criativo` aciona o `diretor-de-arte` (`etapas/decupagem.md`) cedo, para uma prova visual, quando o texto depende de uma imagem incerta, e para os planos de todas as cenas, que o `pnpm narrate` exige; o `diretor-de-som` (`etapas/arco-de-som.md`) entra quando um silêncio muda o tempo do vídeo e sai mais barato decidido antes da voz. As skills dirigem na conversa; os especialistas que levantam, executam e julgam são subagentes em `.agents/agents/`, acionados por elas e sem o contexto de quem fez o trabalho: `pesquisador`, `checador` e `editor` (do `diretor-criativo`; o `checador` volta na montagem do arquivo final, acionado pela `producao`), `ilustrador`, `motion-designer`, `critico-de-quadro` e `critico-de-movimento` (do `diretor-de-arte`), `critico-de-som` (do `diretor-de-som`). A skill `remotion-best-practices` vem do Remotion, é atualizada com ele e fica fora do repositório, em `~/.agents/skills/` (global compartilhada pelos agentes).

Outros comandos: `pnpm dev` abre o Remotion Studio, `pnpm lint` checa tipos e estilo, `pnpm test` roda os testes do código e das ferramentas Python, `pnpm critique <vídeo>` mede o render (movimento, área com desenho e cor) contra a faixa de 12 vídeos de referência, e com `som` no fim mede o som (nível, continuidade e unidade da música, e quantidade de efeitos) contra a faixa dos mesmos 12, `pnpm eval:voice` compara a configuração da voz com variações dela em 16 frases fixas (naturalidade, entonação, altura, cortes e erros de pronúncia), `pnpm scene <vídeo> <id>` renderiza só uma cena, `pnpm join <vídeo>` monta o vídeo inteiro com as cenas já renderizadas e o som, `pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3` renderiza só o som do vídeo, `pnpm sfx "<busca>"` lista efeitos sonoros CC0 do Freesound e `pnpm sfx <id>` baixa o escolhido.

## Onde fica cada coisa

```
.agents/skills/     skills locais e suas unidades de conhecimento
.agents/agents/     definições Markdown dos especialistas do Claude
.agents/commands/   comandos do Claude (opsx/)
AGENTS.md           instruções compartilhadas dos agentes
.claude             link relativo para .agents
CLAUDE.md           link relativo para AGENTS.md
src/design/          direção de arte: paleta, tipografia, formas e movimento
src/components/      primitivos visuais reutilizáveis
src/art/             desenhos feitos em código
src/audio/           mixagem da trilha e catálogo de efeitos sonoros
src/critique/        medidas do render e as faixas dos vídeos de referência
src/narration/       regras do roteiro e tempos da narração
src/video/           montagem de um vídeo narrado
src/videos/<vídeo>/  pesquisa, roteiro, registros de decisão e cenas de cada vídeo
scripts/             os comandos pnpm
tools/               scripts Python que chamam os modelos de voz e de trilha e medem o som
public/fonts/        fontes das direções de arte (OFL)
public/sfx/          efeitos sonoros do Freesound (CC0)
```

Ficam fora do git: `public/videos/` (narração e trilha geradas), `vendor/` (ferramentas clonadas), `voice/` (amostras de voz), `out/` e `acervo/`.

`out/` é a bancada: tudo nela pode ser gerado de novo, cada arquivo tem um lugar e é sobrescrito a cada vez.

```
out/<vídeo>/               tudo de um vídeo
  <vídeo>.mp4              o vídeo inteiro (pnpm join), o som (.som.mp3) e o de entrega (.final.mp4)
  cenas/<id>.mp4           cada cena como está agora (pnpm scene)
  stills/                  um quadro por plano (pnpm stills)
  tiras/                   as tiras de quadros da crítica de movimento
  conceito/                as imagens das decisões de arte
  som/                     a separação e as medidas do som (pnpm critique ... som)
  trilha/                  as trilhas geradas e comparadas
out/referencias/           os estudos dos vídeos de referência, de todo vídeo
out/ferramentas/           avaliação da voz e testes da trilha, de nenhum vídeo
out/rascunho/              o que não tem lugar acima; pode ser apagada inteira
```

`acervo/<vídeo>/` guarda o que foi ao ar, copiado uma vez na publicação e nunca sobrescrito: o vídeo de entrega, a narração, a trilha, a thumbnail e as folhas de modelo dos personagens.

## Convenções

- Nomes de arquivos, código e chaves do roteiro em inglês. Comentários, documentação, o conteúdo dos vídeos e as skills (com as suas etapas e unidades) em português do Brasil.
- O nome da pasta de um vídeo é também o id da composição e o argumento de todos os comandos.
- O que o usuário decidiu fica na pasta do vídeo, no git, no arquivo do dono: `script.md` (as decisões do texto, sem narração), `art.md` (a ficha visual), `score.md` (a partitura da animação), `sound.md` (o arco e o mapa de som) e `voice.json` (as tomadas de voz escolhidas de ouvido). A execução equivalente pode mudar; a decisão material que o usuário já tomou não é alterada em silêncio. `out/` guarda só o que pode ser gerado de novo.
- Os arquivos `src/videos/<vídeo>/approvals.md` que existem são histórico legado dos vídeos feitos sob o processo antigo, de aprovações numeradas. Ficam como estão: não são apagados nem migrados, nada os consulta para decidir se um trabalho pode começar, e nenhuma linha nova é escrita neles. Um vídeo novo não tem esse arquivo, e não há outro registro global no lugar dele.
- Nenhuma cena escreve cor solta. As cores de um vídeo ficam em `src/videos/<vídeo>/palette.ts`, com os modos e o elenco da ficha visual dele (`art.md`). Tamanhos de texto, formas e curvas de movimento vêm de `src/design/tokens.ts`.
- A direção de arte base do canal é a `abissal`, em `src/design/tokens.ts`. Ela vale para as cenas que ainda não foram redesenhadas; as cores de cada vídeo ficam na `palette.ts` dele.
- A duração de cada cena vem da narração. Cenas não têm durações fixas.
- A cena é a unidade da fala; a da imagem é o plano. Cada cena do roteiro lista os seus planos (`shots`), e cada plano começa numa palavra da narração.
- O som além da voz é dado do roteiro, e nenhuma cena toca som: a trilha, os momentos dela, os níveis e os silêncios ficam em `music`, e os efeitos, em `sfx`. O volume de cada um é uma distância em dB abaixo da voz (`src/audio/ducking.ts` e `src/audio/sfx.ts`), nunca um número ajustado à mão.
  Um efeito usa a palavra `cue`, o começo do plano `shot` ou o começo da cena. Com `at: "end"`, usa o fim do plano indicado ou, sem `shot`, o fim da cena; não combina com `cue`. O `offsetMs` desloca dessa âncora até a ação, inclusive para antes do fim.
- As versões do Remotion são fixas e iguais em todos os pacotes `@remotion/*`; atualize com `pnpm run upgrade`.
