# Spec Delta

## Purpose

Permite manter as instruções e as skills locais do projeto em uma fonte canônica compartilhada por Claude Code e Codex, preservando os caminhos de compatibilidade do Claude.

## ADDED Requirements

### Requirement: Fonte canônica de conhecimento local
O repositório SHALL manter suas skills, definições de subagentes e comandos locais em `.agents/`, sem cópias independentes desses arquivos em `.claude/`.

#### Scenario: Manutenção de uma skill compartilhada
- **WHEN** um mantenedor consulta a localização de uma skill local de produção ou do OpenSpec
- **THEN** existe uma única versão mantida em `.agents/skills/<nome>/`
- **AND** a leitura pelo caminho equivalente em `.claude/skills/<nome>/` resolve essa mesma versão

### Requirement: Acesso herdado pelo Claude
O caminho `.claude` SHALL ser um link simbólico relativo para `.agents`, permitindo acessar as mesmas skills, definições de subagentes e comandos pelos caminhos usados pelo Claude Code.

#### Scenario: Consulta pelos caminhos de compatibilidade
- **WHEN** se lê uma skill, um subagente ou um comando por `.claude/`
- **THEN** o conteúdo é o do arquivo correspondente em `.agents/`
- **AND** não existe uma segunda cópia que exija sincronização

#### Scenario: Repositório em outro diretório
- **WHEN** o repositório é clonado em outro caminho com suporte a links simbólicos habilitado
- **THEN** `.claude` continua resolvendo a `.agents` desse checkout, sem depender do caminho absoluto da máquina original

### Requirement: Instruções compartilhadas na raiz
O repositório SHALL manter as instruções de trabalho em um arquivo regular `AGENTS.md` na raiz e oferecer `CLAUDE.md` como link simbólico relativo para esse arquivo.

#### Scenario: Leitura por Codex e Claude Code
- **WHEN** o Codex consulta `AGENTS.md` e o Claude Code consulta `CLAUDE.md`
- **THEN** ambos recebem o mesmo conteúdo de instruções do projeto
- **AND** esse conteúdo identifica `AGENTS.md` e `.agents/` como locais de manutenção

### Requirement: Skills locais descobertas pelo Codex
As skills de produção e do OpenSpec SHALL estar disponíveis em `.agents/skills/<nome>/SKILL.md`, mantendo nome e descrição no frontmatter para descoberta pelo Codex, sem exigir configuração de caminhos alternativa.

#### Scenario: Inventário de skills depois da migração
- **WHEN** se inspeciona o diretório de skills locais usado pelo Codex
- **THEN** estão presentes `creator`, `diretor-criativo`, `diretor-de-arte`, `diretor-de-som`, `grilling`, `producao` e as seis skills `openspec-*` já existentes
- **AND** cada skill contém seu `SKILL.md` e os arquivos auxiliares que tinha antes da migração

### Requirement: Referências de manutenção apontam à fonte canônica
O README, as instruções compartilhadas, as skills e as definições de subagentes SHALL usar `.agents/` e `AGENTS.md` para referenciar o conhecimento local mantido no projeto. Menções aos caminhos de compatibilidade SHALL explicar seu papel de links.

#### Scenario: Referência de um especialista ao procedimento
- **WHEN** uma definição de subagente indica a unidade local que deve ser lida
- **THEN** o caminho aponta ao arquivo existente em `.agents/skills/`

#### Scenario: Caminhos globais externos
- **WHEN** uma referência aponta a uma skill externa em `~/.claude/skills/`
- **THEN** ela continua identificada como externa e não é reescrita para um caminho local inexistente

### Requirement: Preservação dos procedimentos existentes
A unificação SHALL preservar as regras e os arquivos auxiliares das skills de produção, as oito definições de subagentes e os seis comandos `/opsx:*`. As seis skills do OpenSpec SHALL ter uma versão compartilhada que descreva as invocações para Codex e outros agentes.

#### Scenario: Consolidação do OpenSpec
- **WHEN** se consulta uma skill do OpenSpec por `.agents/skills/` ou pelo link em `.claude/skills/`
- **THEN** ambos os caminhos apresentam a versão consolidada com as regras existentes e as invocações para os dois tipos de agente

#### Scenario: Preservação da interface do Claude
- **WHEN** se acessam os comandos `apply`, `archive`, `explore`, `propose`, `sync` e `update` em `.claude/commands/opsx/`
- **THEN** os seis arquivos continuam acessíveis, com seus nomes e procedimentos preservados

### Requirement: Preparação reproduzível de links no Windows
O README SHALL explicar como preparar um checkout Windows com suporte a links simbólicos, como garantir que o Git restaure links reais e como verificar os dois links antes de usar os agentes.

#### Scenario: Checkout Windows preparado
- **WHEN** um mantenedor segue a preparação documentada em uma máquina com permissão para criar links simbólicos
- **THEN** `.claude` e `CLAUDE.md` são links utilizáveis para os destinos canônicos, em vez de arquivos de texto contendo apenas o nome do destino

#### Scenario: Máquina sem suporte configurado
- **WHEN** os requisitos para criar ou restaurar links não estão atendidos
- **THEN** a documentação indica o requisito faltante e os passos de preparação
- **AND** não recomenda manter cópias independentes como substituição da fonte canônica
