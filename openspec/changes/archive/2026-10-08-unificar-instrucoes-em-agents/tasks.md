# Tasks

## 1. Preparação e suporte a links

- [x] 1.1 Registrar o estado do Git, o valor local de `core.symlinks` e o inventário dos arquivos envolvidos; guardar cópia temporária de `.agents/`, `.claude/` e `CLAUDE.md` em `out/rascunho/`, verificando a igualdade de conteúdo e incluindo os arquivos não versionados.
- [x] 1.2 Habilitar `core.symlinks=true` somente neste checkout e conferir a permissão de criação de links simbólicos em um local temporário da bancada; verificar o link e seu destino com PowerShell, sem alterar configuração global ou remover caminhos existentes em caso de falha.
- [x] 1.3 Documentar no README a preparação do Windows/Git antes do clone, a recuperação cuidadosa de links materializados como texto e a verificação de `LinkType`/destino; conferir que os comandos documentados usam configuração local ou por comando e não descartam alterações do checkout.

## 2. Consolidação do conhecimento em .agents

- [x] 2.1 Consolidar as seis skills duplicadas do OpenSpec mantendo as versões de `.agents/skills/` e `.openspec-target`; verificar que as únicas diferenças descartadas são as invocações específicas do Claude, preservando qualquer conteúdo novo encontrado na execução.
- [x] 2.2 Mover `creator`, `diretor-criativo`, `diretor-de-arte`, `diretor-de-som`, `grilling` e `producao`, com todas as unidades auxiliares, para `.agents/skills/`; comparar o inventário e o conteúdo com a cópia de segurança e conferir as 12 skills e seus frontmatters.
- [x] 2.3 Mover as oito definições de subagentes e os seis comandos `commands/opsx/` para `.agents/`; verificar igualdade de conteúdo antes das adaptações de referências e preservar nomes e formato dos comandos existentes.
- [x] 2.4 Atualizar as referências locais das skills e definições de subagentes para `.agents/` e `AGENTS.md`, mantendo referências globais externas; conferir os destinos dos caminhos alterados e revisar as ocorrências restantes de `.claude` e `CLAUDE.md` contra as exceções do design.
- [x] 2.5 Atualizar no README a localização canônica das skills, dos especialistas e dos comandos, com o limite de compatibilidade entre clientes; verificar que a documentação cobre os 12 nomes locais e não promete registro automático dos especialistas Markdown como subagentes nativos do Codex.

## 3. Instruções compartilhadas e caminhos de compatibilidade

- [x] 3.1 Criar `AGENTS.md` regular a partir do conteúdo preservado de `CLAUDE.md`, ajustando título, apresentação e referências locais; comparar o diff com a origem e verificar que comandos e regras de produção não foram alterados.
- [x] 3.2 Substituir `.claude` por um link simbólico relativo para `.agents`, após conferir a transferência de todos os arquivos; verificar `LinkType=SymbolicLink`, destino literal `.agents` e igualdade de leitura de skills, subagentes e comandos pelas duas interfaces.
- [x] 3.3 Substituir `CLAUDE.md` por um link simbólico relativo para `AGENTS.md`; verificar destino literal `AGENTS.md`, igualdade de leitura e que o destino é um arquivo regular completo.
- [x] 3.4 Documentar no README os dois links e a manutenção pelos destinos canônicos; conferir que o mapa de pastas e as referências locais usam `.agents/` e `AGENTS.md`, preservando as menções explicativas aos caminhos de compatibilidade.

## 4. Verificação integrada da migração

- [x] 4.1 Verificar, em índice Git temporário ou ambiente isolado, que `.claude` e `CLAUDE.md` são representados como modo `120000` com destinos relativos e que os arquivos canônicos são regulares; demonstrar que o índice de staging do usuário não mudou e que os links continuam resolvendo em outra localização preparada.
- [x] 4.2 Conferir o inventário final, os frontmatters, os caminhos canônicos e a identidade de conteúdo acessível pelos links; registrar a descoberta em nova sessão do Codex e a leitura pelo Claude quando os clientes estiverem disponíveis, ou registrar explicitamente a limitação sem declarar um teste de cliente aprovado.
- [x] 4.3 Executar `openspec validate unificar-instrucoes-em-agents --strict` e revisar o diff da migração; verificar que as alterações se limitam aos caminhos planejados e à configuração local de symlinks, preservando as mudanças preexistentes dos vídeos e de outras changes.

## Evidências de verificação

- Inventário final: 12 skills, oito definições de subagentes, seis comandos e 99 arquivos canônicos em `.agents/`. Conteúdo comparado à cópia de segurança, descontando apenas as adaptações previstas de referências e apresentação.
- `.claude` e `CLAUDE.md` são links simbólicos com destinos relativos `.agents` e `AGENTS.md`; a leitura por cada link é idêntica à do destino.
- Git isolado: os dois links têm modo `120000`; checkout em outra pasta manteve destinos e conteúdo, descontando a conversão CRLF/LF do Git. O procedimento do README recuperou os links materializados como texto. Nenhum commit criado.
- Codex: processo novo de app-server, `skills/list` com `forceReload`, reconheceu as 12 skills locais habilitadas sem erros; nenhuma requisição de modelo foi feita nesse teste.
- Claude Code 2.1.294: a tentativa de teste de sessão sem ferramentas retornou HTTP 429, `usage_limit_reached` (limite semanal). O teste de carregamento no cliente não pôde ser aprovado; a leitura dos arquivos através dos links foi verificada independentemente.
- Cópia de segurança e resultados locais: `out/rascunho/unificar-instrucoes-em-agents/`, fora do Git.
