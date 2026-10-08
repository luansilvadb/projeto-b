# Design

## Context

Ver `proposal.md` para o pedido e `specs/agent-guidance/spec.md` para o contrato global. A change de 08/10 está arquivada; o contrato local continua válido.

Inventário observado em `C:/Users/Luan/` em 08/10/2026:

- `.agents/skills/` tem duas instalações pessoais diretas (`find-skills` e `skill-creator`), `synced` e `.trash`.
- `.claude/skills/` tem nove instalações pessoais diretas: as mesmas duas, as seis `ponytail*` e `remotion-best-practices`; também tem `synced` e `.trash`.
- `.codex/skills/` contém `grilling` como instalação pessoal direta, além de `.system`, skills ChatCut e metadados próprios. A versão pessoal de `grilling` difere da versão em `.agents/skills/synced`.
- `.agents/.skill-lock.json` já registra as duas skills pessoais compartilhadas e a família `ponytail`. Não é uma fonte de instruções e não será reescrito nesta migração.
- `.codex/AGENTS.md` e `.claude/CLAUDE.md` são arquivos regulares vazios; `.agents/AGENTS.md` não existe. `CODEX_HOME` não está definido e não foi encontrado `.codex/AGENTS.override.md`.
- As árvores globais de skills não têm links. As duas `synced` têm arquivos e instruções diferentes, inclusive para navegador e uso do computador; isso é evidência para preservar instalações por cliente.
- `.claude` guarda configurações, plugins, sessões, histórico e caches. Não foram encontradas pastas globais `agents/` ou `commands/` para migrar.

As diferenças pessoais são específicas: `find-skills` cita fontes de busca diferentes; `skill-creator` troca nomes de agentes e ambientes no Markdown, mas os scripts auxiliares das duas instalações são iguais e executam `claude -p`. Essa adaptação textual não tornou os scripts nativos do Codex.

## Goals / Non-Goals

**Goals:**

- Ter uma fonte física para cada skill pessoal e para as instruções globais, sem copiar regras de vídeo para outros projetos.
- Manter os clientes capazes de descobrir as skills pelos seus caminhos usuais, com links simbólicos relativos verificáveis.
- Permitir migração e rollback seletivos, preservando o trabalho em andamento neste checkout e o estado dos clientes.

**Non-Goals:**

- Unificar as versões gerenciadas em `synced`, mover plugins, skills de sistema ou ChatCut, ou reorganizar as lixeiras.
- Converter ferramentas de avaliação de skills para o Codex, registrar subagentes nativos ou criar agentes/comandos globais ausentes.
- Editar regras técnicas de `remotion-best-practices`, instalar dependências, configurar Git/Windows globalmente ou criar um sincronizador permanente.
- Alterar arquivos históricos de outras changes ou implementar a migração durante a criação desta proposta.

## Decisions

### 1. Fontes canônicas e links relativos por entrada

```text
~/.agents/
  AGENTS.md                         arquivo regular
  skills/<10 skills pessoais>/      diretórios regulares
  skills/synced/                    instalação gerenciada existente
~/.codex/
  AGENTS.md -> ../.agents/AGENTS.md
  skills/                           diretório físico, sem grilling pessoal
~/.claude/
  CLAUDE.md -> ../.agents/AGENTS.md
  skills/                           diretório físico
    <nome> -> ../../.agents/skills/<nome>
    synced/                         instalação gerenciada existente
    .trash/                         preservada
```

Ao contrário do projeto, linkar `.claude` inteira confundiria conhecimento compartilhado com estado privado do aplicativo. Linkar a raiz `skills` inteira também faria os dois clientes escreverem na mesma `synced`. Por isso são dez links individuais no Claude e dois links de arquivo para instruções. Não se usam junctions nem hard links como fallback.

O Codex descobre a fonte pessoal em `~/.agents/skills`; não precisa de outro link em `.codex/skills/grilling`, que manteria uma entrada redundante. As versões de mesmo nome em `synced`, plugins ou no próprio projeto permanecem; a mudança não promete eliminar todas as repetições de nomes no seletor de skills.

### 2. Conteúdo compartilhado com operações específicas explícitas

Usar as instalações existentes de `.agents` como base para `find-skills` e `skill-creator`, reconciliando seus Markdown com as cópias do Claude antes de substituir qualquer origem. Preservar os recursos auxiliares completos, já iguais nas duas instalações.

Em `find-skills`, manter referências válidas de busca sem renomear URLs por substituição do nome do agente; uma referência duvidosa deve ser verificada em sua origem antes de entrar na versão consolidada. Em `skill-creator`, usar linguagem que contemple os dois agentes nas orientações gerais e identificar o CLI do Claude nas operações de avaliação e otimização que efetivamente o chamam. Não adaptar scripts nem inventar um comando `Codex -p`.

Mover as seis `ponytail*`, `remotion-best-practices` e a `grilling` pessoal com todos os arquivos, preservando o conteúdo. A origem externa continua dona das regras de Remotion. A versão sincronizada de `grilling` não participa da comparação para escolher a versão pessoal.

### 3. Instruções globais sem novas políticas

Criar `~/.agents/AGENTS.md` regular com uma apresentação curta da finalidade compartilhada e dos caminhos canônicos. Como as origens estão vazias, não transplantar `D:/projeto-b/AGENTS.md`, tornar Ponytail obrigatório globalmente nem acrescentar preferências não pedidas. Se houver novas instruções globais no momento da execução, preservar e reconciliar esse conteúdo em vez de usar o inventário antigo como autorização para substituí-lo.

O destino `.agents/AGENTS.md` é uma escolha de organização; o Codex continua lendo pelo caminho documentado em seu diretório global, e o Claude pelo arquivo global `CLAUDE.md`. Conferir novamente o `CODEX_HOME` efetivo e eventual `AGENTS.override.md` antes da execução: um override não vazio pode impedir o carregamento da fonte compartilhada e não será apagado silenciosamente.

### 4. Atualizações e documentação

Atualizar apenas as referências globais das skills migradas em `AGENTS.md`, `README.md` e `.agents/agents/{ilustrador,motion-designer}.md`. Mantê-las externas ao projeto. O link local `CLAUDE.md` já encaminha essas mudanças ao mesmo `AGENTS.md`.

O README terá uma seção global separada da preparação do checkout: fontes, destinos literais, inspeção com PowerShell, manutenção no destino real e limites das skills gerenciadas. Instalar skills pessoais no destino canônico e criar o link individual correspondente; após atualização por um instalador, conferir se ele preservou o link ou materializou outra cópia. Não criar daemon, bootstrap ou alteração de metadados dos aplicativos para impor esse comportamento.

### 5. Verificação proporcional e limites

Comparar hashes e inventários dos arquivos pessoais transferidos, descontando apenas a reconciliação documentada de dois `SKILL.md`. Conferir tipo e destino literal de cada link e igualdade de leitura pelo caminho canônico e de compatibilidade. Verificar que as árvores excluídas não mudaram; logs ativos dos aplicativos podem mudar por uso normal e não devem ser interpretados como escrita da migração.

Documentação oficial confirma a descoberta de skills em `~/.agents/skills` pelo Codex e suporte a diretórios de skills simbólicos nos dois agentes. Isso não substitui teste de sessão. Registrar a descoberta das skills pessoais em novas sessões do Codex e Claude Code quando os clientes estiverem disponíveis, sem criar conteúdo fictício nas instruções para fazê-las aparecer no teste. O arquivo global curto comprova a leitura quando o cliente reporta suas fontes.

O contrato cobre os clientes locais Codex e Claude Code. A documentação do Claude informa que sessões Cowork no desktop podem ignorar instruções globais em symlink e não carregam as skills pessoais locais; essa compatibilidade não é prometida.

Não há mudança no código de vídeo: não são necessários render, `pnpm lint` nem `pnpm test`. Validar esta change com `openspec validate unificar-instrucoes-globais-em-agents --strict` e revisar somente seu escopo, sem commit ou alteração do staging do usuário.

## Risks / Trade-offs

- [Instalador recria uma cópia física] → Conferir links após atualizações e manter os destinos como fonte; não alterar silenciosamente instaladores ou metadados.
- [Diferença pessoal é descartada] → Comparar conteúdo antes da consolidação, registrar as adaptações e guardar backup conferido.
- [Sessão ou sincronizador muda arquivos durante a migração] → Revalidar o inventário imediatamente antes de substituir cada entrada; se o conteúdo mudou, reconciliar antes de prosseguir.
- [Symlink não é permitido ou não é carregado pelo cliente] → Preservar/restaurar as origens e reportar o resultado; não declarar sucesso com base apenas em hashes.
- [Remoção percorre um link ou perde o destino] → Resolver e conferir os caminhos absolutos; remover somente a entrada de compatibilidade, nunca apagar recursivamente uma raiz global.

## Migration Plan

1. Depois de um pedido de implementação, revalidar os dez diretórios pessoais, os dois arquivos globais e os caminhos excluídos. Registrar os caminhos absolutos exatos antes de qualquer movimentação.
2. Guardar cópia dos arquivos envolvidos e o inventário/hash em `out/rascunho/unificar-instrucoes-globais-em-agents/`, conferindo a recuperação; não copiar credenciais, sessões nem árvores gerenciadas. Testar a criação de um link temporário na bancada antes de substituir as origens.
3. Reconciliar as duas skills duplicadas, transferir as demais para `.agents/skills` e conferir recursos auxiliares. Criar a fonte global de instruções preservando o conteúdo atual.
4. Substituir somente as entradas pessoais conferidas pelos links individuais e os dois arquivos globais pelos links de instruções. Remover a instalação antiga de `grilling` no Codex apenas depois da conferência da transferência.
5. Atualizar as referências do projeto e a documentação; executar conferências de conteúdo, links e descoberta em clientes disponíveis. Registrar evidência e limitações em `out/rascunho/unificar-instrucoes-globais-em-agents/verification.md`.

**Rollback:** remover somente os links criados, sem seguir seus destinos; restaurar os arquivos e diretórios substituídos a partir da cópia conferida. Reverter seletivamente a reconciliação e a documentação desta migração, preservando quaisquer edições posteriores e alterações alheias. Restaurar a ausência original de `.agents/AGENTS.md` se não houver novo conteúdo a preservar. O backup é temporário e não uma segunda fonte mantida.

## References

- [Codex: instruções globais e precedência](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
- [Codex: descoberta global de skills e suporte a symlinks](https://learn.chatgpt.com/docs/build-skills).
- [Claude Code: instruções pessoais e limites de Cowork](https://code.claude.com/docs/en/memory).
- [Claude Code: skills pessoais, symlinks e diretório reservado synced](https://code.claude.com/docs/en/skills).
