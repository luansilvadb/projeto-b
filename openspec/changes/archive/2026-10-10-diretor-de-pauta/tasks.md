# Tasks

A skill é escrita com a `creator` (`~/.agents/skills/creator/`), no molde das cinco direções. Não há código: `pnpm lint` e `pnpm test` não são afetados. O que não tem lugar fixo durante os testes vai para `out/rascunho/`.

## 1. Provar a leitura da oferta

- [x] 1.1 Para o termo `o que acontece com o corpo após a morte`, ler a página de busca do YouTube pelo agente (busca direta e, se preciso, o navegador) e extrair dos primeiros resultados título, views, canal, tamanho do canal e idade; conferir contra o painel do usuário de 2026-10-10 (views máximas 15,5 mi, médias 2,0 mi) que a ordem de grandeza bate
- [x] 1.2 Repetir com `o que acontece com o corpo em jejum` e anotar na conversa qual caminho funcionou nas duas vezes, ou que nenhum funcionou; o resultado decide o texto da unidade `medida` (leitura pelo agente, ou pedido ao usuário pelos campos de views do painel)
- [x] 1.3 Rodar de novo o autocompletar do YouTube em pt-BR para três frases-semente e conferir que ainda devolve sugestões, para a unidade `candidatos` citar um meio que funciona

## 2. Escrever a skill

- [x] 2.1 Criar `.agents/skills/diretor-de-pauta/SKILL.md` com frontmatter (`name`, `description`), papel e entregas, fora do escopo, índice das quatro unidades e parada; conferir que a skill aparece na lista de skills de uma sessão nova e que `.claude/skills/diretor-de-pauta/SKILL.md` resolve o mesmo arquivo
- [x] 2.2 Escrever `nicho.md` com as três condições, as três exclusões e o encaixe visual como desempate; conferir contra os cenários do requisito "Filtro do nicho" que jejum sai por conselho e que um tema de espaço passa
- [x] 2.3 Escrever `candidatos.md` com as frases-semente, o autocompletar, os finalistas de `pauta.md` anteriores e o material cortado de outros `research.md`; conferir contra "Candidatos vêm do que o público digita" que uma frase de recorte não é medida como termo
- [x] 2.4 Escrever `medida.md` com um termo por busca, a versão curta, a leitura da oferta pelo caminho provado no grupo 1, os campos a ignorar e o pedido ao usuário (até cinco termos, campos a devolver); conferir que os quatro erros de 2026-10-10 listados em `proposal.md` têm cada um a regra que os evita
- [x] 2.5 Escrever `escolha.md` com o corte fixo, a ordem de peso marcada como **proposta**, a conferência leve da base, a tabela de finalistas, o formato de `pauta.md` (decisão 6 de `design.md`) e a volta quando o tema cai; conferir contra os requisitos "Comparação entre candidatos", "O usuário escolhe o tema", "Registro em pauta.md" e "Volta quando o tema não se sustenta"
- [x] 2.6 Passar a skill pela revisão da `creator` e conferir que nenhuma unidade repete regra de outra nem de `diretor-criativo/conceito/angulo`

## 3. Ligar às direções vizinhas

- [x] 3.1 Em `.agents/skills/diretor-criativo/SKILL.md`, dizer na entrada que o tema e o termo buscado vêm de `pauta.md` quando ele existe, pôr a escolha de tema em "Fora do escopo" e completar a parada: tema inteiro sem recorte honesto volta à `diretor-de-pauta`; conferir que a regra "redelimitar o tema" continua valendo para o recorte que cai com o tema de pé
- [x] 3.2 Em `.agents/skills/diretor-publicacao/SKILL.md`, acrescentar `pauta.md` (termo buscado) às entradas; em `embalagem/titulo-e-thumbnail.md`, só se preciso, dizer que o termo buscado é entrada do título e que não vence o teste do vídeo imaginado; conferir que nenhum outro campo do pacote mudou
- [x] 3.3 Em `AGENTS.md`, passar "as cinco direções" a seis em "Como um ajuste é feito", pôr `pauta.md` na lista dos arquivos de decisão e manter "as quatro direções" que acionam a `grilling`; conferir com `git grep -n "cinco direções\|cinco skills" AGENTS.md README.md .agents` que não sobra contagem antiga
- [x] 3.4 Em `README.md`, atualizar a lista das skills locais, a linha nova na tabela "Trabalhos, donos e artefatos" (tema e termo buscado, `diretor-de-pauta`, `pauta.md`), o parágrafo "São cinco skills" e a lista dos arquivos de decisão das convenções; conferir que `CLAUDE.md` continua resolvendo `AGENTS.md` e que a tabela renderiza

## 4. Primeiro caso: o segundo vídeo

- [x] 4.1 Numa sessão nova, pedir um tema e conferir que a `diretor-de-pauta` é carregada e levanta candidatos pelo autocompletar, com os quatro termos de 2026-10-10 entrando como já medidos
- [x] 4.2 Conferir que jejum sai pelo nicho com o motivo dito, que o pedido de medição ao usuário tem no máximo cinco termos e que a tabela de finalistas traz views, pontos fora da curva, volume, competição e a marca da base
- [x] 4.3 Com a escolha do usuário, criar `src/videos/<vídeo>/pauta.md` e conferir os cinco itens do requisito "Registro em pauta.md", com data em toda medição
- [x] 4.4 Anotar na conversa o que o caso mostrou de errado na skill e corrigir a unidade dona, uma correção por commit; conferir com `openspec validate diretor-de-pauta --strict` que a mudança continua válida

## Workflow follow-up

- Arquivar a mudança depois do primeiro caso.
- A ordem de peso continua como proposta até um vídeo escolhido por ela ser publicado e render.
