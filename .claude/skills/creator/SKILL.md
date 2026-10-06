---
name: creator
description: "Cria, melhora e refatora workflows de agente (uma skill com SKILL.md e unidades de conhecimento) a partir de um domínio, projeto ou codebase. Use quando o usuário pedir para criar ou reorganizar um workflow, extrair padrões para as unidades, ou podar e validar documentos de skill."
---

## FUNÇÃO E ESCOPO

Transforma um domínio, projeto ou codebase em um workflow acionável e suas unidades de conhecimento. Não use para executar tarefas do domínio ou substituir um workflow especializado.

## PRINCÍPIO

`DOMÍNIO → PERGUNTAS → LACUNAS → UNIDADES → ESTRUTURA → VALIDAÇÃO`

Cada unidade responde a uma pergunta cognitiva central. Crie categorias e unidades por necessidade, cada uma com propósito claro.

## FLUXO

1. Defina objetivo, escopo, anti-escopo, entradas, saídas, regras, exceções e restrições.
2. Gere as perguntas que o agente deve responder para realizar o objetivo.
3. Compare com as unidades existentes; marque lacunas, redundâncias e conteúdo fora do escopo. Atualize, consolide ou remova unidades; redundâncias, conteúdos fora do escopo e falhas na validação final ainda sem solução são ajustes pendentes.
4. Para cada lacuna, defina ou reutilize a categoria adequada e crie uma unidade.
5. Valide cada unidade. Repita os passos 2 a 5 enquanto houver lacunas ou ajustes pendentes.
6. Gere ou atualize `SKILL.md`, o índice de categorias e unidades e a ordem de injeção; valide a árvore completa. Se falhar, corrija a causa e retome os passos 2 a 6; se não for possível, sinalize e pare.

## VALIDAÇÃO DE UNIDADE

A unidade deve:

- responder a uma pergunta central;
- ser concreta, aplicável e estar no escopo;
- não duplicar outra unidade;
- declarar dependências e limites relevantes;
- ter a sua linha do índice redigida como ponteiro (`ponteiros`);
- encerrar cada passo num critério de conclusão (`criterios`);
- passar, frase a frase, nos quatro testes de `poda`.

Se falhar, corrija ou recrie a unidade antes de continuar.

## PARADA

Pare quando não houver lacunas relevantes nem ajustes pendentes, quando uma iteração não gerar unidade nova nem resolver ajuste pendente, ou quando uma unidade não puder ser validada: sinalize-a.

## ESTRUTURA

`skills/<workflow-name>/SKILL.md` na raiz; cada unidade em `skills/<workflow-name>/<categoria>/<unidade>.md`.

## SKILL.md

O workflow criado ou atualizado deve declarar função, escopo, anti-escopo, organização das categorias, ordem de injeção, índice das categorias (propósito) e unidades (nome + pergunta), limites e critérios de parada. O conhecimento mora nas unidades; `SKILL.md` aponta para ele. Só `SKILL.md` é registrado como skill e leva frontmatter: `name` e uma `description` redigida como ponteiro (`ponteiros`), o que o workflow sabe e quando acioná-lo. As unidades são arquivos de apoio sem frontmatter, lidos quando a etapa pede; o ponteiro de cada uma é a sua linha do índice.

Categorias são apenas organizacionais e não entram na ordem de injeção. Injete `SKILL.md` primeiro e, depois, apenas as unidades relevantes e suas dependências, respeitando a ordem de dependência.

## TEMPLATE DA UNIDADE

```markdown
## PERGUNTA
<uma única pergunta central>

## RESPOSTA
<regras, critérios, procedimentos ou conhecimento acionável>

## DEPENDÊNCIAS (se houver)
- <unidade>: <o que fornece>

## LIMITES (se houver)
- <restrição ou anti-uso>

## EXEMPLO (se necessário)
<exemplo curto>
```

## VALIDAÇÃO FINAL

- cobertura suficiente e sem redundância;
- categorias e arquivos justificados;
- dependências e injeção claras, sem ciclo;
- `SKILL.md` com tudo o que a seção `SKILL.md` exige;
- toda unidade do índice existe e todo arquivo de unidade está no índice;
- a `description` de `SKILL.md` com dois-pontos está entre aspas: sem elas o YAML falha e a descrição some;
- nenhuma unidade inválida nem arquivo vazio.

## ORGANIZAÇÃO

| Categoria | Propósito |
|---|---|
| `desenho` | Onde cada material fica e como o agente o alcança. |
| `escrita` | Como cada frase é redigida e o que é cortado. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `desenho/cargas` | Que custo cada documento e cada ponteiro cobra, e de quem? |
| `desenho/ponteiros` | Como redigir a referência que leva o agente a um material fora do contexto? |
| `desenho/hierarquia` | Em que degrau cada trecho deve ficar, e o que deve ficar ao lado dele? |
| `desenho/divisao` | Quando vale dividir um documento em dois? |
| `escrita/criterios` | Como encerrar um passo para que o agente saiba quando terminou e quanto se exige dele? |
| `escrita/palavras-guia` | Como ancorar um comportamento em poucas palavras, sem proibir? |
| `escrita/poda` | O que cortar de um documento já escrito, e com que teste? |

## ORDEM DE INJEÇÃO

| Passo do fluxo | Unidades |
|---|---|
| 1 a 3. Mapear o domínio | `hierarquia`, `divisao` |
| 4. Criar unidade | `ponteiros`, `criterios`, `palavras-guia` |
| 5. Validar unidade | `criterios`, `poda` |
| 6. Gerar `SKILL.md` e validar a árvore | `cargas`, `ponteiros`, `hierarquia`, `divisao`, `poda` |
