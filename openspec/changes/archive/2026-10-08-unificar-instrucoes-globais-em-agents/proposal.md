# Proposal

## Why

A unificação local de `2026-10-08-unificar-instrucoes-em-agents` deixou as instalações globais fora do escopo. As skills pessoais ainda se dividem entre `~/.agents/skills`, `~/.claude/skills` e `~/.codex/skills`; uma fonte global em `.agents` permite manter o conteúdo uma vez e acessá-lo pelos dois agentes.

## What Changes

- Manter as instruções globais em `~/.agents/AGENTS.md`, com links simbólicos relativos em `~/.codex/AGENTS.md` e `~/.claude/CLAUDE.md`.
- Consolidar as skills pessoais instaladas diretamente em `~/.agents/skills/<nome>/`, incluindo a família `ponytail`, `remotion-best-practices`, `find-skills`, `skill-creator` e `grilling`; oferecer links relativos por skill em `~/.claude/skills/`.
- Reconciliar as duas versões pessoais de `find-skills` e `skill-creator`, preservando recursos auxiliares e distinguindo instruções compartilhadas de operações que dependem do CLI do Claude.
- Preservar as versões de `synced`, as skills de sistema, ChatCut e plugins nos caminhos gerenciados pelos aplicativos. Não substituir as pastas globais `.claude`, `.codex` nem seus diretórios inteiros de skills.
- Atualizar a documentação de manutenção e as referências do projeto às skills pessoais migradas, com inventário, backup, conferência dos links e reversão seletiva.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `agent-guidance`: acrescentar a fonte global de instruções e skills pessoais, os links de compatibilidade e a preservação do conteúdo gerenciado pelos aplicativos, mantendo o contrato local existente.

## Impact

- Esta change guarda o planejamento no repositório, mas sua implementação também modifica os caminhos pessoais explicitamente listados em `C:/Users/Luan/`. Não altera o arquivo histórico da change arquivada.
- Na global: `~/.agents/AGENTS.md`, skills pessoais em `~/.agents/skills/`, seus caminhos de compatibilidade no Claude e a instalação direta de `~/.codex/skills/grilling`.
- No projeto: referências globais em `AGENTS.md` e `README.md`; as referências de etapas que apontam às skills pessoais migradas também serão atualizadas.
- Sem dependência nova, geração de mídia, mudança em código de vídeo, credenciais, configurações dos clientes ou configuração global do Git/Windows. Skills externas não são reescritas em seu conteúdo técnico.
- O usuário pediu criar a spec primeiro e confirmou a preservação das skills gerenciadas pelos aplicativos. A migração fica para um pedido posterior de implementação.
