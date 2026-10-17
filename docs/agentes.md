# Agentes, skills e especialistas

## Onde fica o conhecimento

`.agents/` é a fonte canônica do conhecimento local de agentes:

- `.agents/skills/` guarda os workflows de produção e suas unidades (`SKILL.md`, `etapas/`, `equipe/` e afins);
- `.agents/agents/*.md` guarda a fonte central em Markdown dos oito especialistas.

`.claude/` e `.codex/` são diretórios separados, com os formatos que cada ferramenta espera. As pastas `.claude/skills/` e `.codex/skills/` são links simbólicos relativos para `../.agents/skills`, então ambas usam as skills da fonte central. Em `.claude/agents/` ficam cópias Markdown geradas para Claude Code; em `.codex/agents/` ficam definições TOML geradas para Codex.

Edite apenas os Markdown em `.agents/agents/`. Depois de uma mudança, execute `pnpm agents:sync` para atualizar os dois destinos. `pnpm agents:check` confere se as cópias estão atualizadas sem escrever. Os arquivos dentro de `.claude/agents/` e `.codex/agents/` são gerados: não os edite manualmente.

O repositório não tem arquivo de instruções na raiz (`AGENTS.md`, `CLAUDE.md`): o conhecimento do projeto está no `README.md`, em `docs/` e nas skills. Quem trabalha no repositório deve ler o `README.md` e as páginas de `docs/` pertinentes antes de tocar em vídeo ou convenção.

## As seis skills de produção

O pedido determina o dono, e a skill dona determina o conhecimento e o procedimento. A tabela de trabalhos, donos e artefatos está no `README.md`.

- `diretor-de-pauta`: o ponto de partida (briefing, tema ou premissa) e `pauta.md`.
- `diretor-criativo`: pesquisa, ângulo ou frase de intenção, história, estrutura e roteiro.
- `diretor-de-arte`: intenção visual, desenho, composição, movimento e a imagem do cartaz ou da thumbnail.
- `diretor-de-som`: intenção de som, música, níveis, silêncios e efeitos.
- `diretor-publicacao`: o pacote de saída pelo destino.
- `diretor-producao`: plano de tempo, voz, operação das ferramentas, arquivo final e acervo.

Regras de uso:

- Quando um trabalho toca o ponto de partida, texto, imagem, som, pacote de saída ou operação, use a skill dona daquele artefato e carregue só as unidades que ele pede, em vez de improvisar o procedimento.
- Nas unidades, `DEPENDÊNCIAS` são pré-leituras obrigatórias e diretas; não siga as dependências delas em cadeia, salvo quando a tarefa precisar dessas regras. `REFERÊNCIAS` só entram quando o caso as aciona.
- Uma tarefa isolada ("corrija o instante deste efeito", "revise o título do YouTube", "renderize estas cenas") vai direto ao dono, sem percorrer nada antes por rito.
- O que um trabalho precisa para começar são os artefatos que produzem evidência válida para ele (um `script.json` válido para a voz, o tempo real da fala para o movimento fino, o instante da ação para um efeito, roteiro e pesquisa atuais para a publicação), e nunca a posição numa sequência nem o aceite de outra disciplina. Não existe etapa corrente, aprovação pendente nem estado global do vídeo.
- Quando a mudança pedida é de outro artefato, ela pertence ao dono dele.
- O que é comum às seis direções nos dois modos (frase de intenção, donos, handoff, gravidade e rodadas) está em `.agents/skills/diretor-producao/equipe/protocolo.md`. Cada `SKILL.md` diz o que é decisão do canal, e portanto repertório no modo `jam`, e o que é ofício e vale nos dois.

## Especialistas (subagentes)

As skills dirigem na conversa; os especialistas que levantam, executam e julgam são subagentes em `.agents/agents/`, acionados por elas e sem o contexto de quem fez o trabalho: `pesquisador`, `checador` e `editor` (do `diretor-criativo`; o `checador` volta no corte final, acionado pela `diretor-producao`), `ilustrador`, `motion-designer`, `critico-de-quadro` e `critico-de-movimento` (do `diretor-de-arte`), `critico-de-som` (do `diretor-de-som`). Servem aos dois modos.

Os Markdown canônicos em `.agents/agents/` incluem o frontmatter usado por Claude, como `name`, `description` e `tools`. O gerador copia cada arquivo para `.claude/agents/<nome>.md` e cria `.codex/agents/<nome>.toml` com `name`, `description` e `developer_instructions` contendo o corpo Markdown após o frontmatter. Assim o texto das instruções é mantido em um lugar só, e cada ferramenta recebe seu formato nativo.

## Skills globais (fora do repositório)

A instalação pessoal é separada do repositório: `~/.agents/skills/` é a fonte física das skills globais compartilhadas, e `~/.claude/skills/` é um link simbólico para essa fonte. Edite e instale na fonte; não crie links individuais nem substitua o link da pasta por uma pasta comum.

Usadas por este projeto, e mantidas fora dele:

- `creator`: cria e poda as skills de produção;
- `grilling`: a entrevista ramo a ramo que `diretor-criativo`, `diretor-de-arte` e `diretor-de-som` acionam pelas unidades de `conducao/`;
- `ponytail` (e `ponytail-*`): a regra de código descrita em [convencoes.md](convencoes.md);
- `remotion-best-practices`: vem do Remotion, é atualizada com ele e não deve ser editada à mão.

As skills sincronizadas, de plugins e de sistema continuam mantidas pelos aplicativos em seus próprios caminhos.
