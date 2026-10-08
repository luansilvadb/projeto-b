# Design

## Context

Ver `proposal.md` para a motivação e `specs/agent-guidance/spec.md` para o contrato.

O checkout Windows tem `.claude/` como diretório físico versionado: 12 skills, oito definições de subagentes e seis comandos em `commands/opsx/`. `.agents/` ainda não está versionado e contém as seis skills do OpenSpec e o marcador `skills/.openspec-target`, com valor `codex`. A comparação das seis skills mostrou igualdade depois de normalizar exclusivamente os nomes de invocação: `/opsx:*` nas cópias do Claude e `$openspec-* (Codex) or /openspec-* (other agents)` nas de `.agents`.

Há um `CLAUDE.md` regular na raiz e nenhum `AGENTS.md`. README, skills e especialistas apontam a `.claude/` e a `CLAUDE.md`; há também referências a skills globais em `~/.claude/skills/`. Outras changes do OpenSpec contêm menções históricas a `CLAUDE.md`, que continuarão resolvendo pelo link.

O Modo de Desenvolvedor do Windows está habilitado; `core.symlinks=false` está definido em `.git/config`. Isso permite preparar a criação de links sem alterar a configuração global, mas o suporte efetivo deve ser conferido durante a migração. Existem alterações em andamento em vídeos e em outras changes; a migração deve preservar esse estado.

## Goals / Non-Goals

**Goals:**

- Usar arquivos físicos canônicos em `.agents/` e um `AGENTS.md` regular na raiz, com links relativos para as interfaces do Claude.
- Preservar o conteúdo e os procedimentos existentes, limitando as adaptações a apresentação, referências de manutenção e invocações compartilhadas do OpenSpec.
- Permitir conferir a migração por inventário, destinos dos links e comparação de conteúdo, sem renderizar vídeos.

**Non-Goals:**

- Converter as definições Markdown de subagentes ou os comandos `/opsx:*` em configurações nativas do Codex.
- Migrar, instalar ou modificar skills globais como `ponytail` e `remotion-best-practices`.
- Alterar políticas de produção, mudanças de vídeo em andamento, configurações globais do Git/Windows ou o gerador do OpenSpec.
- Introduzir um sistema de sincronização, gerador de cópias ou script permanente de bootstrap.

## Decisions

### 1. Link da pasta inteira

A estrutura final será:

```text
.agents/
  skills/
    .openspec-target
    <12 skills e seus arquivos auxiliares>
  agents/
    <8 definicoes Markdown>
  commands/
    opsx/
      <6 comandos Markdown>
.claude --> .agents
AGENTS.md
CLAUDE.md --> AGENTS.md
```

O link `.claude` terá destino literal `.agents`, e `CLAUDE.md` terá destino literal `AGENTS.md`, relativos à raiz. Linkar a pasta inteira atende ao pedido e evita manter links por subdiretório. Links absolutos prenderiam o checkout a esta máquina; cópias exigiriam sincronização. Junctions e hard links não serão usados como substitutos silenciosos: o contrato pede links simbólicos e o Git precisa preservar seus destinos.

As escritas de manutenção serão feitas pelos caminhos canônicos. O Claude pode recusar edição através de um symlink; abrir o destino real resolve isso sem outra cópia.

### 2. Consolidação sem perda de conteúdo

Manter as seis skills OpenSpec de `.agents/skills/` e seu marcador `codex`. Mover as seis skills exclusivas de `.claude/skills/`, com todas as unidades auxiliares; mover `agents/` e `commands/` inteiros. Comparar as duplicatas antes de descartá-las; qualquer diferença nova além das invocações deve ser reconciliada antes de remover a cópia antiga.

Os comandos de `commands/opsx/` continuam com seus nomes e formato do Claude. Mantê-los não duplica a fonte de uma skill: são interfaces de comando existentes, centralizadas em `.agents/commands/`, cuja conversão para wrappers não faz parte desta mudança. Usar as skills específicas do Claude como base perderia a nomenclatura compartilhada já disponível em `.agents`.

### 3. AGENTS.md físico, CLAUDE.md como compatibilidade

Mover o conteúdo atual para `AGENTS.md`; ajustar o título e a apresentação para instruções de agentes do projeto e atualizar referências locais. Não reescrever as regras de produção. Criar o link `CLAUDE.md` só depois de conferir que o destino está completo.

Uma alternativa compatível com Claude seria um arquivo com `@AGENTS.md`, especialmente em Windows sem suporte a links. Aqui o link é coerente com a estrutura escolhida e a preparação do Git é necessária de qualquer modo para `.claude`; não haverá duas versões mantidas das instruções.

O limite de compatibilidade é explícito: o Codex descobre instruções e skills compartilhadas, enquanto os arquivos Markdown de especialistas permanecem disponíveis para leitura e para uso pelo Claude. A mudança não promete registro automático desses especialistas como subagentes nativos do Codex.

### 4. Referências locais e externas

Atualizar as referências locais no `AGENTS.md`, no README e nos arquivos migrados, incluindo as menções a `CLAUDE.md` em `producao`, `creator`, `ilustrador` e `motion-designer`. O README explicará o papel dos dois links e como manter os destinos.

Evitar substituição textual indiscriminada de `.claude`: referências globais `~/.claude/skills/` continuam apontando às instalações externas existentes. Não editar artefatos de outras changes; as referências históricas a `CLAUDE.md` continuam válidas pelo link. Referências a `.claude` na documentação de compatibilidade são intencionais.

### 5. Git e preparação no Windows

Na implementação, configurar `git config --local core.symlinks true` neste checkout e conferir que links reais podem ser criados. Os destinos relativos devem ser representados no Git como symlinks, modo `120000`, enquanto os arquivos de `.agents/` e `AGENTS.md` são arquivos regulares. Verificar essa representação com um índice temporário ou outro ambiente isolado, preservando o staging do usuário e sem criar commit.

Documentar no README a necessidade de Modo de Desenvolvedor ou permissão equivalente, `core.symlinks=true` durante o clone/checkout e a inspeção de `LinkType`/destino em PowerShell. Explicar que habilitar a opção depois de um clone que já materializou links como texto exige restaurar os caminhos de compatibilidade com cuidado, preservando os destinos canônicos. Não usar `git reset --hard` como preparação.

Se faltar permissão, interromper a etapa dos links com diagnóstico acionável e conservar os arquivos. Não substituir a fonte canônica por cópias ou alterar configuração global como fallback.

### 6. Verificação proporcional

Conferir a presença das 12 skills e respectivas unidades, das oito definições e dos seis comandos; comparar conteúdo antes/depois, descontando somente as adaptações planejadas. Confirmar destinos relativos, igualdade de leitura pelas duas interfaces e ausência de referências locais antigas fora das exceções documentadas.

A estrutura fica pronta para descoberta no início de novas sessões. A comprovação de carregamento por cada cliente deve ser registrada quando ele estiver disponível; ausência do cliente é uma limitação de verificação, não autorização para instalar ferramentas ou declarar um teste de sessão aprovado. Conferência de arquivos e frontmatter não equivale a um teste de descoberta em sessão real.

Executar `openspec validate unificar-instrucoes-em-agents --strict` e revisar o diff limitado ao escopo. Esta mudança não toca código de vídeo; `pnpm lint`, `pnpm test`, geração de mídia e testes novos que apenas espelhem a estrutura não acrescentam evidência necessária.

## Risks / Trade-offs

- [Clone Windows restaura symlinks como texto] --> Documentar a preparação antes do clone, habilitar suporte local neste checkout e verificar modo Git e destinos efetivos.
- [Remoção perde skill ainda não versionada ou arquivo auxiliar] --> Registrar inventário e guardar cópia temporária restrita aos arquivos da migração em `out/rascunho/` antes de mover; só remover a origem depois de conferir a transferência.
- [Substituição altera referências globais] --> Atualizar apenas referências locais identificadas e conferir as exceções `~/.claude/skills/`.
- [Ferramenta escreve settings específicos do Claude através do link] --> A escrita chega a `.agents/`; documentar que o diretório é canônico. Não introduzir settings novos nesta migração.
- [Uma futura atualização do OpenSpec altera arquivos compartilhados] --> Executar a manutenção sobre os destinos canônicos, revisar o diff das skills e preservar as invocações dos dois agentes. Não executar `openspec update` como parte desta migração.
- [Confusão entre conteúdo compartilhado e subagentes nativos] --> Explicitar no README o limite de compatibilidade, preservando as definições existentes sem prometer execução nativa no Codex.

## Migration Plan

1. Registrar inventário, estado do Git e valor anterior de `core.symlinks`; guardar cópia temporária dos arquivos envolvidos, inclusive `.agents/` ainda não versionado.
2. Habilitar o suporte local de symlinks e confirmar a permissão antes de substituir os caminhos existentes.
3. Consolidar skills em `.agents/` e mover definições e comandos, conferindo arquivos auxiliares. Criar `AGENTS.md` a partir do conteúdo preservado de `CLAUDE.md`.
4. Atualizar referências e documentação, remover apenas as origens já conferidas e criar os dois links relativos. Verificar que todas as operações de movimentação e remoção se limitam ao checkout e não seguem links para apagar destinos.
5. Executar as conferências estruturais, de conteúdo e de representação no Git; registrar qualquer limite do teste em clientes reais. Entregar o diff sem commit e sem alterar o staging do usuário.

**Rollback:** remover somente os dois links, sem percorrer os destinos; restaurar seletivamente os arquivos envolvidos a partir da cópia temporária e o valor local anterior de `core.symlinks`. Preservar o conteúdo original não versionado de `.agents/` e todas as alterações alheias. Não usar restauração global do checkout. A cópia temporária serve à reversão da migração e não é uma segunda fonte mantida.

## References

- [Instruções AGENTS.md do Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
- [Skills do Codex e diretórios de descoberta](https://learn.chatgpt.com/docs/build-skills).
- [Claude Code: arquivo compartilhado e symlinks no Windows](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools).
- [Claude Code: skills de projeto e links](https://code.claude.com/docs/en/skills).
