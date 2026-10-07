## PERGUNTA
Onde cada decisão do texto fica registrada, e como os blocos se ligam às cenas do roteiro?

## RESPOSTA

**Dois arquivos, um sentido cada.** Na pasta do vídeo:

- `script.json` guarda o texto que vale: a narração, os planos e as fontes de cada cena. O formato dele está em `etapas/roteiro.md`.
- `script.md` guarda as decisões atuais do vídeo, as do usuário e as do agente: é contra ele que o texto é conferido. Ele nunca leva narração; uma frase copiada para cá envelhece na primeira reescrita.

**Bloco e cena.** As unidades falam em bloco; o roteiro tem cenas. Um bloco é um grupo de cenas vizinhas com uma ideia e um assunto visual. A tabela de estrutura lista, em cada bloco, os `id` das cenas dele, na ordem do roteiro. Toda cena pertence a um bloco, e a um só.

**Formato de `script.md`:**

```markdown
# <título de trabalho>

- Tese: <uma frase>
- Promessa: <uma pergunta>
- Idioma: <idioma>
- Duração-alvo: <minutos>
- Molde: <o de `moldes`> / Forma de arco: <a de `arco`>
- Tensão: era de esperar <X>, e no entanto <Y>
- Mapa: <como quem assiste percebe o caminho (`ouvinte`): as partes, na ordem, quando são ditas, e o que o vídeo promete para o fim>
- Fechamento: <a sensação e a moral de `fechamento`, e o trecho do gancho a que a última frase responde>
- Analogia central: <a analogia e os blocos em que volta>
- Elementos: <os poucos que o vídeo usa; o que saiu da pesquisa>

## Voz
<a ficha de voz de `voz`>

## Estrutura

| Bloco | Capítulo | Função | Pergunta que responde → que abre | Nota visual | Cenas |
|---|---|---|---|---|---|
| <n> | <título exibido na tela> | <fase do arco> | <pergunta> → <pergunta> | <a de `indicacao-visual`> | `<id>`, `<id>` |

## Fio
<a ficha do fio de `fio`>

## Grafias de pronúncia
- <como está em `narration`> = <grafia correta, a que vai para a tela>

## Simplificações
- Bloco <n>: <o que foi simplificado e o que ficou de fora>

## Contas
- Bloco <n>: <analogia ou número derivado> = <valores usados e cálculo>

## Título e thumbnail
- <título> / <conceito de thumbnail>; escolhido: <qual>
```

- O gancho é um bloco sem capítulo. O bloco sem fala traz a cena com `holdMs` e a nota visual.
- `Simplificações`, `Contas` e `Grafias de pronúncia` só aparecem quando houver itens.
- O porquê de uma decisão (o que ela evita, a troca aceita, a ressalva) fica na linha dela quando ajuda a reescrita seguinte a não repetir o erro. O que a decisão era antes fica no git.

**Lista de fontes.** É o nome que as unidades dão a três lugares: as fontes numeradas de `research.md`, o campo `sources` de cada cena em `script.json` e as seções `Simplificações` e `Contas` daqui. A situação de cada afirmação (verificada, simplificada) vem do relatório de `checagem`, e não é copiada.

**Procedimento:**

1. Crie `script.md` com o cabeçalho quando houver um ângulo de trabalho. Pronto quando tese, promessa, idioma e duração-alvo estão escritos.
2. Acrescente cada decisão no passo em que ela é tomada: voz, estrutura, fio, analogia central. Pronto quando toda decisão já tomada tem a sua linha, e a tomada com o usuário leva a data e o porquê (`entrevista`).
3. Com `script.json` escrito, preencha a coluna Cenas. Pronto quando todo `id` do roteiro aparece em exatamente um bloco, na ordem do roteiro: é o que o `pnpm check-script` confere, lendo os `id` entre crases da última coluna.
4. A cada reescrita que troque uma decisão, substitua a linha dela pelo estado atual, na mesma rodada.

## LIMITES
- O conteúdo de cada seção é da unidade que o modelo nomeia, lida no passo dela; aqui só se decide onde ele fica.
- Sem narração, sem colunas de tempo e sem planos: o texto e os `shots` moram em `script.json`.
- As aprovações do usuário não são registradas aqui: vão para `approvals.md`, conforme o procedimento da etapa.
- O registro acompanha a melhor solução atual; a alternativa recusada fica no git.

## EXEMPLO
```markdown
## Estrutura

| Bloco | Capítulo | Função | Pergunta que responde → que abre | Nota visual | Cenas |
|---|---|---|---|---|---|
| 1 | (gancho) | gancho | — → por que ninguém parou de dormir? | Água-viva pulsando no fundo; o contador cai de 58 para 39 quando escurece. | `jellyfish-pulse`, `thirty-nine`, `no-brain` |
| 2 | Uma péssima ideia | fundamento | o que o sono custa? → alguém escapou? | A loja que baixa a porta toda noite; volta até o bloco 10. | `sleep-cost`, `shop-closes` |
```
