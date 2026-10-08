# Proposal

## Why

O conhecimento do projeto está concentrado em `.claude`, enquanto `.agents` contém apenas cópias das skills do OpenSpec; isso exige manutenção em dois lugares e deixa as skills de produção fora da descoberta padrão do Codex. Unificar os arquivos em `.agents` e as instruções em `AGENTS.md` permite compartilhar o mesmo conteúdo entre Claude Code e Codex.

## What Changes

- Tornar `.agents/` a fonte canônica das skills, das definições de subagentes e dos comandos locais do projeto, reunindo os arquivos hoje presentes em `.claude/`.
- Consolidar as seis skills duplicadas do OpenSpec usando as versões de `.agents/skills/`, que já descrevem invocações para Codex e outros agentes; preservar os comandos `/opsx:*` na pasta canônica `commands/`.
- Substituir a pasta física `.claude/` por um link simbólico relativo para `.agents/`, sem cópias independentes dos mesmos arquivos.
- Migrar o conteúdo de `CLAUDE.md` para um `AGENTS.md` regular na raiz, com apresentação compartilhada e referências canônicas; manter `CLAUDE.md` como link simbólico relativo para `AGENTS.md`.
- Atualizar README, skills e definições de subagentes para usar `.agents/` e `AGENTS.md` nas referências locais de manutenção.
- Documentar os requisitos de links simbólicos no Windows, habilitar `core.symlinks` somente neste checkout durante a implementação e verificar a representação dos links pelo Git.

## Capabilities

### New Capabilities

- `agent-guidance`: descoberta e manutenção de instruções e skills compartilhadas por Claude Code e Codex, com uma fonte canônica e links de compatibilidade.

### Modified Capabilities

Nenhuma. A spec existente `shared-drawings` trata de construção visual dos vídeos e não é afetada.

## Impact

- Arquivos afetados: `.agents/**`, `.claude` como link, `AGENTS.md`, `CLAUDE.md` como link e `README.md`; configuração local do Git apenas para suporte a links.
- Os caminhos antigos continuam acessíveis pelos links. Os nomes e os procedimentos de produção das skills e dos subagentes são preservados.
- A compatibilidade com o Codex cobre o carregamento de `AGENTS.md` e a descoberta das skills em `.agents/skills/`. Os comandos `/opsx:*` e as definições Markdown de subagentes continuam no formato do Claude; não se introduz configuração nativa de subagentes do Codex.
- Não há dependência nova, mudança de código de vídeo, mídia, ferramentas de GPU, configuração global do usuário ou artefatos de outras changes. As skills globais externas permanecem externas.
