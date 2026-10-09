## PERGUNTA
Que decisões atuais do texto precisam ficar registradas para outra etapa não ter de redescobri-las, onde cada uma fica, e como os blocos se ligam às cenas do roteiro?

## RESPOSTA

**Princípio.** O registro segue a decisão; a decisão não nasce para preencher o registro. `script.md` é o cache dos compromissos atuais do vídeo que outra etapa não deve precisar redescobrir. Não é formulário de criação, histórico, lista de conferência nem plano do vídeo.

**Cada coisa num lugar só**, na pasta do vídeo:

| Arquivo | Guarda |
|---|---|
| `script.json` | o texto que vale: narração, planos e fontes de cada cena (`etapas/roteiro.md`) |
| `script.md` | os compromissos atuais que não se rederivam dos outros arquivos, o agrupamento das cenas em blocos e os registros operacionais que outra etapa consome |
| `research.md` | fatos e fontes |
| `art.md`, `score.md`, `sound.md` | as decisões atuais da imagem, do movimento e do som, das skills donas |
| `voice.json` | as tomadas de voz escolhidas de ouvido, da skill `diretor-producao` |
| git | a história: o que a decisão era antes, o que saiu, como se chegou aqui |

`script.md` nunca leva narração: uma frase copiada para cá envelhece na primeira reescrita.

**O que entra.** Uma linha ou seção existe quando, sem ela, um agente futuro perderia uma decisão que não se infere ou um contrato operacional. Quatro testes, um por linha:

- **Rederivação.** Sai com segurança de `script.json`, `research.md`, `art.md`, `sound.md` ou da unidade dona? Então não se copia. A exceção é a escolha entre alternativas igualmente válidas, que é justamente o que o registro fixa.
- **Pressão.** O campo faria alguém inventar uma decisão só para não deixá-lo vazio? Então ele não é fixo: aparece quando a decisão existe.
- **História.** Diz o que vale agora, ou como se chegou aqui? O segundo é do git.
- **Handoff.** Quem recebe só este arquivo sabe o que não pode mudar sem mudar o vídeo? Se não sabe, falta uma decisão, e não necessariamente um campo.

**Bloco e cena.** As unidades falam em bloco; o roteiro tem cenas. Um bloco é um grupo de cenas vizinhas que produz uma mudança reconhecível no que o ouvinte sabe, espera ou pergunta (`arco`). O assunto visual pode coincidir com ele, e não o define. Bloco também não é capítulo: um capítulo pode ter vários blocos, um bloco pode não ter capítulo, um vídeo pode não ter nenhum.

**Mecânica da tabela**, a única parte rígida, conferida pelo `pnpm check-script` (`src/narration/direction.ts`): a seção se chama `## Estrutura`; a primeira linha da tabela é o cabeçalho; os `id` das cenas ficam entre crases na última coluna; toda cena de `script.json` aparece em exatamente um bloco, na ordem do roteiro. As outras colunas não têm requisito mecânico, e o `script.md` escrito com colunas antigas continua válido: muda quando a produção voltar a ele.

**Formato.** No estado completo, o que a crítica integral lê, a base é o título, as três primeiras linhas do cabeçalho e a tabela; durante as provas o arquivo pode ainda não ter todos, e nenhum é preenchido antes de a decisão existir. Todo o resto aparece só quando a decisão existe: linha ou seção vazia não se escreve.

```markdown
# <título de trabalho>

- Tese: <o entendimento que o vídeo estabelece, como está agora (`angulo`)>
- Promessa: <o que o vídeo entrega, como está agora; a fronteira do recorte que tenderia a voltar, numa frase>
- Idioma: <idioma>

## Estrutura

| Bloco | O que muda | Por que o seguinte vem agora | Capítulo | Nota visual | Cenas |
|---|---|---|---|---|---|
| <n> | <a mudança em quem ouve> | <a dependência> | <título exibido, ou —> | <o delta de `indicacao-visual`, ou —> | `<id>`, `<id>` |
```

As colunas:

- **O que muda**: a mudança que define o bloco. Um nome de fase de `arco` cabe aqui quando ajuda ("estabelece o custo do sono (fundamento)"), e não é exigido.
- **Por que o seguinte vem agora**: a dependência, na forma que ela tem: pergunta, consequência, contraste, hipótese, tentativa, sequência no tempo. No último bloco, `—`.
- **Capítulo**: o título exibido na tela, repetido em cada bloco do capítulo; `—` no bloco fora de capítulo e no vídeo sem capítulos.
- **Nota visual**: o que a imagem não pode escolher livremente; `—` quando a arte tem liberdade.
- **Cenas**: a mecânica acima.

A tabela é uma vista do agrupamento, e não o roteiro: fatos, tamanho e duração de cada bloco estão no texto, em `research.md` e na saída do `pnpm check-script`.

O que entra quando existe, e onde:

| Onde | O quê | Quando |
|---|---|---|
| cabeçalho | `Duração-alvo` | o usuário ou o produto impôs um tamanho. A faixa do canal e a duração medida são sensores, e não vêm para cá. |
| cabeçalho | `Molde / Forma de arco` | o nome mantém a coerência ou evita uma regressão (`moldes`, `arco`) |
| cabeçalho | `Tensão` | há uma contradição ou pergunta específica que a reescrita precisa preservar |
| cabeçalho | `Mapa` | o vídeo tem mapa dito, partes enumeradas ou outra convenção de orientação a manter (`ouvinte`) |
| cabeçalho | `Fechamento` | o fim tem um compromisso que tese, promessa e estrutura não deixam evidente: a imagem a que volta, o limite em que termina, o que não resolve além da evidência (`fechamento`) |
| cabeçalho | `Analogia condutora` | uma correspondência atravessa blocos: o que representa o quê, e onde volta (`analogias`) |
| `## Voz` | o que este vídeo ajusta em relação à voz do canal (`voz`) | há ajuste |
| `## Fio` | o refrão, quem ou o que volta, a dívida plantada (`fio`) | é uma decisão que a reescrita precisa manter, e não continuidade que o texto já dá |
| `## Grafias de pronúncia` | `<como está em narration> = <grafia correta, a que vai para a tela>` | a voz pediu outra grafia |
| `## Simplificações` | `Bloco <n>: <o que foi simplificado e o que ficou de fora>` | a simplificação foi assumida; a publicação a lê. Detalhe omitido não é simplificação. |
| `## Contas` | `Bloco <n>: <número derivado> = <valores e cálculo>` | a conta não está inteira em `research.md` e precisa ser refeita na checagem |

O título público, o conceito e o prompt da thumbnail ficam em `publication.md`, sob o dono `diretor-publicacao`; `script.md` mantém só o título de trabalho no cabeçalho e a promessa que a embalagem expressa.

As seções seguem a ordem desta tabela, com `Voz` antes de `Estrutura`.

**O porquê** de uma decisão fica na linha dela quando impede a reescrita seguinte de desfazer uma troca importante ("sem rosto nas pessoas reais: não inventar identidade sem retrato"). Data, quem escolheu e a alternativa recusada não ficam.

**Lista de fontes.** É o nome que as unidades dão a três lugares: as fontes numeradas de `research.md`, o campo `sources` de cada cena em `script.json` e as seções `Simplificações` e `Contas` daqui. A situação de cada afirmação (verificada, simplificada) vem do relatório de `checagem`, e não é copiada.

**Procedimento.** O arquivo acompanha o trabalho, e não o conduz: não há ordem de preenchimento.

1. Quando uma decisão atual precisa sobreviver à reescrita ou à passagem para outra etapa, registre-a no lugar dela. O arquivo pode nascer parcial e ficar parcial enquanto o trabalho é parcial: o teste de um gancho ou de duas alternativas não pede fechamento, mapa nem thumbnail.
2. Havendo cenas e `script.md`, a tabela cobre as cenas que existem agora, cada uma uma vez e na ordem. Ela cresce com o texto, sem bloco futuro.
3. Antes da crítica integral, `Tese` e `Promessa` dizem o vídeo atual, a tabela cobre o roteiro e está registrado o que restringe a leitura. É dependência do `editor`, e não aprovação.
4. Quando a decisão muda, substitua a linha, na mesma rodada. Quando ela deixa de ajudar (o molde nomeado de que o texto não precisa mais), apague.

## LIMITES
- Esta unidade não decide conteúdo: se há tensão, mapa, capítulos, analogia, fio ou que fechamento ter é da unidade dona. Aqui só se diz onde fica quando existe.
- Sem seção genérica de decisões: a decisão global vai no cabeçalho, o ajuste vai na seção da unidade dona, o que é de um bloco vai na linha dele.
- Sem narração, colunas de tempo, planos, elenco, paleta, mapa de som, inventário de elementos nem lista do que saiu.
- Sem registro à parte das decisões do usuário: a decisão atual fica no arquivo do dono, e quando uma formulação equivalente melhora, o arquivo acompanha a melhor solução.

## EXEMPLO
```markdown
# Por que dormimos

- Tese: o sono é tão antigo que veio antes do cérebro.
- Promessa: mostrar o que o sono custa e por que nenhum animal conseguiu largá-lo. Fica fora o que fazer para dormir melhor.
- Idioma: pt-BR
- Fechamento: termina dizendo que a função original segue desconhecida; não transformar hipótese em resposta.

## Estrutura

| Bloco | O que muda | Por que o seguinte vem agora | Capítulo | Nota visual | Cenas |
|---|---|---|---|---|---|
| 1 | Uma água-viva dorme, e não tem cérebro (gancho). | Se nem ela escapou, dormir deve ser barato. Não é. | — | — | `jellyfish-pulse`, `no-brain` |
| 2 | Estabelece o custo do sono. | Mostra o custo → vale testar quem mais precisava escapar dele. | Uma péssima ideia | A loja fechada é o corpo dormindo, e continua sendo quando volta. | `sleep-cost`, `shop-closes` |
```
