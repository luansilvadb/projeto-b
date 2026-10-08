# Tasks

## 1. Preparação e preservação

- [x] 1.1 Revalidar os dez diretórios pessoais e os arquivos de instruções em `C:/Users/Luan/`, o `CODEX_HOME` efetivo e eventual `AGENTS.override.md`; registrar caminhos absolutos, hashes, conteúdo divergente e estado do Git em `out/rascunho/unificar-instrucoes-globais-em-agents/`, verificando que o inventário distingue entradas pessoais de `synced`, `.trash`, sistema, ChatCut e plugins.
- [x] 1.2 Guardar backup dos arquivos pessoais e das referências do projeto que serão alteradas, sem incluir credenciais ou estado dos aplicativos; conferir inventário e hashes contra as origens e registrar os caminhos inicialmente ausentes para permitir reversão seletiva.
- [x] 1.3 Testar um link simbólico relativo temporário na bancada e verificar `LinkType`, destino e leitura com PowerShell; remover apenas o link e interromper antes da substituição das origens se a criação ou leitura falhar, sem alterar configuração global.

## 2. Skills pessoais e links individuais

- [x] 2.1 Consolidar `find-skills` e `skill-creator` em `~/.agents/skills`, reconciliando os Markdown com as versões pessoais do Claude; registrar o diff e conferir os arquivos auxiliares, preservando os comandos reais `claude -p` nas orientações que dependem deles e sem alterar scripts ou URLs por substituição indiscriminada.
- [x] 2.2 Transferir as seis skills `ponytail*`, `remotion-best-practices` e a `grilling` pessoal para `~/.agents/skills`, preservando os recursos; conferir hashes antes de substituir as origens e verificar que o conteúdo técnico de Remotion e as versões sincronizadas não foram editados.
- [x] 2.3 Criar os dez links individuais `~/.claude/skills/<nome> -> ../../.agents/skills/<nome>` e retirar a instalação pessoal já conferida de `~/.codex/skills/grilling`; verificar destino literal, igualdade de leitura e inventário, mantendo físicos os diretórios globais e preservando todas as entradas excluídas.
- [x] 2.4 Atualizar as referências globais em `AGENTS.md`, `README.md` e `.agents/agents/{ilustrador,motion-designer}.md`; documentar a fonte global, os links individuais, as exceções e a conferência após atualizações, verificando o diff para preservar o contrato local e a condição externa das skills.

## 3. Instruções globais compartilhadas

- [x] 3.1 Criar o arquivo regular `~/.agents/AGENTS.md` com finalidade e caminhos de manutenção, preservando qualquer instrução que tenha surgido nas origens; conferir o diff contra o backup para assegurar que nenhuma regra de vídeo nem preferência nova foi incorporada à global.
- [x] 3.2 Substituir os dois arquivos globais pelos links `~/.codex/AGENTS.md` e `~/.claude/CLAUDE.md`, ambos com destino `../.agents/AGENTS.md`; conferir tipo, destino literal e igualdade de leitura, sem apagar um override existente nem mudar configurações dos clientes.
- [x] 3.3 Completar a seção global do README com os caminhos de instruções, a inspeção dos links, a precedência do override do Codex e a reversão seletiva; revisar os destinos documentados contra os links reais e explicitar que a compatibilidade descrita é com Codex e Claude Code locais.

## 4. Conferência integrada

- [x] 4.1 Conferir o resultado contra o inventário e os hashes: dez fontes pessoais, dez links de skills e dois links de instruções, sem mudança nas árvores gerenciadas nem configuração global; registrar a evidência e o procedimento de rollback em `out/rascunho/unificar-instrucoes-globais-em-agents/verification.md`.
- [x] 4.2 Conferir descoberta das skills pessoais e fontes das instruções em novas sessões de Codex e Claude Code disponíveis, distinguindo versões pessoais de versões sincronizadas ou locais de mesmo nome; registrar resultados ou limitações explícitas para cada cliente sem declarar leitura de arquivos como teste de sessão aprovado.
- [x] 4.3 Executar `openspec validate unificar-instrucoes-globais-em-agents --strict` e revisar o diff limitado à migração, verificando que mudanças alheias, staging e histórico arquivado foram preservados; entregar a documentação e a evidência sem criar commit.
