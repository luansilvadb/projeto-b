---
name: formato
description: Define o formato do roteiro final e da lista de fontes entregues ao usuário.
---

## PERGUNTA
Qual é o formato do roteiro final e da lista de fontes?

## RESPOSTA

**Entrega.** Um único documento Markdown com três partes, nesta ordem: cabeçalho, roteiro e lista de fontes.

**1. Cabeçalho**

```markdown
# <título de trabalho>

- Tese: <uma frase>
- Promessa: <uma pergunta>
- Idioma: <idioma>
- Duração estimada: <minutos> (<total de palavras de narração> palavras)
- Voz: <posição resumida nas variáveis da ficha de voz>
```

**2. Roteiro**

Os blocos ficam agrupados em capítulos. Um bloco por seção, numerado em sequência ao longo do roteiro inteiro, sem reiniciar a cada capítulo:

```markdown
# CAPÍTULO <n> — <título exibido na tela>

## BLOCO <n> — <título de trabalho>

NARRAÇÃO
<texto, uma frase ou unidade de respiração por linha>

VISUAL
<nota visual de uma a três linhas>
```

- O título do capítulo é o texto que aparece na tela; não é narrado.
- O gancho vem antes do primeiro capítulo, sem cabeçalho de capítulo.
- O título do bloco é interno; não é narrado nem exibido.
- Bloco sem fala traz só a seção `VISUAL`.
- A narração contém só o que será dito: sem rubricas, parênteses ou marcações de fonte.
- Números são escritos como serão falados.
- A duração estimada usa cerca de 150 palavras por minuto, contando apenas a narração.

**3. Lista de fontes**

```markdown
# FONTES

| Bloco | Afirmação | Fonte | Ano | Situação |
|---|---|---|---|---|
| <n> | <afirmação como aparece no roteiro> | <fonte> | <ano> | verificada / simplificada |

## SIMPLIFICAÇÕES

- Bloco <n>: <o que foi simplificado e o que ficou de fora>

## CONTAS

- Bloco <n>: <analogia> = <valores usados e cálculo>
```

- Toda afirmação factual do roteiro tem linha na tabela.
- `SIMPLIFICAÇÕES` e `CONTAS` só aparecem quando houver itens.

**Arquivo.** Salvo onde o usuário indicar; sem indicação, pergunte antes de gravar.

## DEPENDÊNCIAS
- arco: fornece a divisão em capítulos e seus títulos.
- narracao: fornece o texto de cada bloco.
- indicacao-visual: fornece a nota visual de cada bloco.
- checagem: fornece a situação de cada afirmação, as simplificações e as contas.

## LIMITES
- Sem colunas de tempo, numeração de cenas ou descrição de áudio; o formato não é storyboard.
- Nenhuma linha com situação *não verificada* na entrega final.

## EXEMPLO
```markdown
# CAPÍTULO 1 — Você não entende o tamanho disso

## BLOCO 3 — A escala

NARRAÇÃO
Se o Sol fosse uma porta,
a Terra seria uma moeda
caída no chão.

VISUAL
Porta gigante; zoom contínuo até a moeda no rodapé.
```
