# agent-guidance Specification

## Purpose

Permite manter as instruções e as skills locais do projeto em uma fonte canônica compartilhada por Claude Code e Codex, preservando os caminhos de compatibilidade do Claude.

## Requirements

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

### Requirement: Fonte canônica de instruções globais
As instruções globais compartilhadas SHALL ter uma única fonte regular em `~/.agents/AGENTS.md`. `~/.codex/AGENTS.md` e `~/.claude/CLAUDE.md` SHALL ser links simbólicos relativos para essa fonte, preservando as instruções globais existentes sem incorporar regras específicas deste projeto.

#### Scenario: Consulta pelas interfaces dos agentes
- **WHEN** se lê qualquer um dos dois arquivos globais de compatibilidade
- **THEN** o conteúdo corresponde ao arquivo regular em `~/.agents/AGENTS.md`
- **AND** ambos os links têm destino literal `../.agents/AGENTS.md`

#### Scenario: Instruções globais inicialmente vazias
- **WHEN** os dois arquivos de origem não contêm instruções
- **THEN** a fonte registra somente sua finalidade e os caminhos de manutenção
- **AND** não recebe preferências novas nem regras de produção deste repositório

### Requirement: Skills pessoais globais em uma fonte compartilhada
As skills pessoais instaladas diretamente SHALL ter sua fonte regular em `~/.agents/skills/<nome>/`, com `SKILL.md` e os recursos auxiliares preservados. O Claude SHALL acessá-las por links simbólicos relativos individuais em `~/.claude/skills/<nome>/`; o Codex SHALL usar a descoberta global em `.agents/skills`.

#### Scenario: Inventário pessoal depois da migração
- **WHEN** se confere o inventário pessoal consolidado
- **THEN** ele contém `find-skills`, `skill-creator`, `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`, `remotion-best-practices` e `grilling`
- **AND** cada caminho correspondente no Claude resolve ao destino `../../.agents/skills/<nome>`

#### Scenario: Skill pessoal instalada diretamente no Codex
- **WHEN** `grilling` é transferida de `~/.codex/skills/grilling` para a fonte canônica
- **THEN** o conteúdo pessoal fica disponível em `~/.agents/skills/grilling`
- **AND** não sobra uma segunda instalação pessoal ou link redundante em `~/.codex/skills/grilling`
- **AND** a versão sincronizada de mesmo nome permanece fora desta consolidação

### Requirement: Consolidação global preserva diferenças e limites dos clientes
A consolidação SHALL preservar o conteúdo exclusivo de cada skill pessoal e reconciliar suas diferenças antes de substituir as origens. A versão compartilhada SHALL identificar operações específicas de um cliente com seus requisitos reais, sem prometer que trocar o nome do agente torna um CLI ou formato compatível.

#### Scenario: Duas versões pessoais de uma skill
- **WHEN** `find-skills` ou `skill-creator` possui conteúdo diferente nas instalações pessoais
- **THEN** a versão canônica preserva as orientações úteis dos dois agentes e os arquivos auxiliares
- **AND** a migração registra as diferenças reconciliadas em vez de escolher uma cópia por data ou descartar a outra sem comparação

#### Scenario: Avaliação de skills depende do CLI do Claude
- **WHEN** a versão compartilhada de `skill-creator` descreve scripts que executam `claude -p`
- **THEN** ela informa esse requisito mesmo quando lida pelo Codex
- **AND** não o substitui por um comando fictício equivalente do Codex

### Requirement: Preservação das instalações gerenciadas e do estado dos aplicativos
A unificação global SHALL manter físicos os diretórios `.claude`, `.codex` e suas raízes de skills. `synced`, lixeiras, skills de sistema, ChatCut, plugins, metadados dos instaladores, sessões, configurações e credenciais SHALL permanecer fora da consolidação pessoal e conservar seus caminhos e conteúdo.

#### Scenario: Atualização de skills sincronizadas
- **WHEN** um aplicativo acessa sua árvore `skills/synced`
- **THEN** encontra a árvore própria que existia antes da migração
- **AND** diferenças de conteúdo entre os aplicativos não são fundidas nem redirecionadas à árvore do outro cliente

#### Scenario: Estado específico de cada agente
- **WHEN** se substituem os arquivos de instruções ou as entradas individuais de skills pessoais
- **THEN** nenhum diretório global inteiro é substituído por um link
- **AND** os demais arquivos dos aplicativos permanecem intactos

### Requirement: Migração global verificável e reversível
A migração global SHALL preservar uma cópia conferida dos arquivos envolvidos antes de substituir origens e verificar os links, o conteúdo e o inventário resultantes. Em caso de falha, SHALL permitir restaurar somente os caminhos alterados, sem remover destinos através de links nem modificar configurações globais como alternativa.

#### Scenario: Falta de permissão para links no Windows
- **WHEN** não se consegue criar ou verificar um link simbólico
- **THEN** os caminhos envolvidos conservam ou recuperam seu conteúdo anterior
- **AND** a execução relata o requisito faltante sem usar cópias permanentes, junctions ou hard links como substituição

#### Scenario: Comprovação de carregamento
- **WHEN** a migração apresenta seus resultados
- **THEN** distingue a conferência de arquivos dos testes em novas sessões dos dois agentes
- **AND** registra como limitação qualquer cliente ou teste de descoberta indisponível

### Requirement: Documentação distingue fontes globais e locais
A documentação de manutenção SHALL distinguir `.agents/` e `AGENTS.md` do repositório de `~/.agents/` e `~/.agents/AGENTS.md` globais. As referências às skills pessoais migradas SHALL apontar à fonte global canônica e explicar os links de compatibilidade e as exceções gerenciadas pelos aplicativos.

#### Scenario: Consulta à skill externa de Remotion
- **WHEN** o README, as instruções ou um especialista do projeto aponta a `remotion-best-practices`
- **THEN** a referência identifica `~/.agents/skills/remotion-best-practices/` como instalação externa ao projeto
- **AND** o conteúdo técnico da skill externa permanece mantido por sua origem

#### Scenario: Instalação ou atualização futura
- **WHEN** um mantenedor consulta como manter as skills pessoais compartilhadas
- **THEN** a documentação indica a fonte em `~/.agents/skills/` e os links individuais no Claude
- **AND** explica que instalações ou atualizações devem preservar essa estrutura e conferir se recriaram cópias físicas
