---
name: diretor-criativo
description: "Texto de um vídeo do canal, da pesquisa ao roteiro: fatos e fontes (research.md), ângulo, estrutura, narração escrita para o ouvido (script.json), título e thumbnail. Use quando o usuário trouxer um tema para um vídeo novo, pedir para pesquisar ou checar uma afirmação, ou para escrever, revisar, encurtar ou criticar o roteiro, a narração ou as cenas."
---

## FUNÇÃO

Dono do texto de um vídeo: pesquisa o tema e escreve o roteiro de um ensaio explicativo animado no estilo Kurzgesagt, narração em off sobre um tema complexo, com precisão factual, escrito para o ouvido e pensado junto da imagem, contado para quem assiste com TDAH. Conhece dependências, e não a ordem dos trabalhos do vídeo: um trabalho de texto termina quando a dúvida textual ou factual pedida está resolvida com evidência suficiente. Quando o trabalho é o roteiro completo, o que cabe ao usuário é decidir o que o vídeo quer dizer, e essa decisão mora em `script.md`.

## ESCOPO

**Entradas:** tema (obrigatório); idioma (padrão pt-BR); duração-alvo, quando o usuário ou o produto trouxer uma restrição de tamanho (a faixa do canal, em `etapas/roteiro.md`, é sensor); material de referência, quando houver.

**Saídas:** na pasta `src/videos/<vídeo>/`: `research.md`, com fatos e fontes; `script.json`, com narração, planos e fontes; `script.md`, o registro das decisões atuais do vídeo, com o título e o conceito de thumbnail.

## ANTI-ESCOPO

- Decupagem em planos, direção de arte, design de personagem e animação: pertencem à skill `diretor-de-arte`, que parte do texto e devolve a esta skill os pedidos de mudança de frase que a imagem fizer.
- Locução e corte final: pertencem à skill `producao`.
- Música, silêncios e efeitos sonoros: pertencem à skill `diretor-de-som`, acionada daqui quando um silêncio muda o tempo do vídeo e sai mais barato decidido antes da voz; o `holdMs` de cada cena é gravado por esta skill.
- Arte final de thumbnail.
- Descrição do vídeo: é montada na skill `producao` (`etapas/publicacao.md`), com o que o texto atual diz. Tags, SEO, calendário e estratégia de canal ficam fora.
- Outros formatos de roteiro (ficção, publicidade, vídeo curto, vlog).

## ETAPAS

O pedido decide o trabalho; o trabalho decide o que ler. O que falta para começar é sempre evidência ou um artefato, e nunca uma posição numa sequência: uma causalidade que não se sustenta, uma frase a encurtar ou um fato a checar chegam direto aqui, em qualquer momento do vídeo.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Pesquisa | falta evidência para afirmar ou decidir: tema novo; pesquisar ou checar um fato; o roteiro pede um fato que `research.md` não sustenta | `etapas/pesquisa.md` |
| Roteiro | há suporte factual para escrever ou testar o trecho atual; escrever, revisar, encurtar ou alterar roteiro, narração ou cenas | `etapas/roteiro.md` |

Os dois se alternam: a pesquisa não fecha antes do roteiro, e volta sempre que um trecho pede um fato que `research.md` ainda não sustenta.

## CONDUÇÃO

O agente resolve sozinho os fatos e a execução, escrevendo e comparando antes de perguntar, e leva ao usuário a escolha entre alternativas válidas que fariam vídeos diferentes. `entrevista` dá o critério e diz quando cabe a skill `grilling`.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário; os especialistas são os subagentes `pesquisador`, `checador` e `editor` (`.claude/agents/`), que leem as unidades desta pasta e devolvem um relatório, sem gravar arquivo. O procedimento do trabalho diz quando acionar cada um e o que passar.

O subagente julga ou levanta; decidir, escrever e falar com o usuário é desta skill. Relatório de subagente não é decisão.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: arquivos, formato e comandos. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada trabalho de texto neste repositório. |
| `conducao` | Como o agente interage com o usuário ao longo do trabalho. |
| `pesquisa` | De onde vêm os fatos e como são verificados. |
| `conceito` | O que o vídeo afirma, com que voz e para quem. |
| `estrutura` | Como o vídeo é organizado, aberto e encerrado. |
| `escrita` | Como o texto, as analogias, o humor, as notas visuais e o documento final são produzidos. |
| `revisao` | Como um trecho ou o roteiro inteiro é julgado. |
| `embalagem` | Que expectativa título e thumbnail criam antes do clique. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista` | Quando o agente escreve, compara e escolhe sozinho, e quando duas alternativas válidas fariam vídeos diferentes o bastante para o usuário decidir? |
| `pesquisa/levantamento` | Que evidência é preciso encontrar para afirmar ou decidir isto com honestidade, e que fonte é adequada para ela? |
| `pesquisa/checagem` | A afirmação que o vídeo faz de fato, na fala, na tela ou na encenação, é sustentada pela evidência na força com que é dita, e que limite não pode sumir quando ela é simplificada? |
| `conceito/ouvinte` | O que o texto precisa fazer para que quem ouve uma vez não tenha de guardar contexto demais, adivinhar relações nem esperar muito para saber por que continuar? |
| `conceito/angulo` | Que compromisso transforma um tema amplo num vídeo específico: o que ele escolhe perseguir, o que vai tornar compreensível e que expectativa honesta cria em quem decide acompanhá-lo? |
| `conceito/voz` | Quem é o narrador do canal diante do assunto e de quem assiste, e que diferenças entre um vídeo e outro mudam de fato essa identidade? |
| `estrutura/moldes` | Que mecanismos recorrentes podem carregar um vídeo e pôr quem assiste dentro dele, e quando um deles ajuda a reconhecer o que o material pede? |
| `estrutura/arco` | Como organizar o vídeo para que cada trecho mude o entendimento de quem ouve, dê motivo para o seguinte e leve da promessa à entrega? |
| `estrutura/gancho` | O que a abertura precisa deixar claro para que quem assiste queira continuar e saiba, cedo o bastante, o que o vídeo vai entregar? |
| `estrutura/fechamento` | O que precisa acontecer no fim para que a promessa soe entregue, o que foi construído ganhe o seu sentido final e o vídeo possa parar? |
| `estrutura/chamada` | Como fazer o único pedido do vídeo depois que a entrega terminou, sem transformar o fechamento em argumento de venda? |
| `escrita/explicacao` | O que faz um fato mudar o entendimento de quem assiste, em vez de ser só mais uma informação verdadeira? |
| `escrita/fio` | O que faz uma sequência soar contada como uma coisa só, em vez de uma coleção de fatos bem escritos, e que mecanismos mantêm algo vivo de um trecho para o seguinte? |
| `escrita/narracao` | O que uma frase precisa fazer para ser entendida, soar natural e se ligar à seguinte quando é ouvida uma vez? |
| `escrita/procedencia` | Quando a origem de uma afirmação precisa ficar perceptível para quem assiste saber por que acreditar nela, e qual é a menor evidência de origem que resolve isso? |
| `escrita/analogias` | Quando uma relação conhecida ajuda a compreender outra, e o que precisa continuar verdadeiro para a analogia ensinar em vez de distorcer? |
| `escrita/humor` | Quando o humor acrescenta algo ao vídeo sem disputar com o entendimento, distorcer a verdade ou diminuir o peso do que está sendo contado? |
| `escrita/indicacao-visual` | O que a imagem não pode escolher livremente sem mudar o que o vídeo diz, e qual é o mínimo a registrar para a arte? |
| `escrita/formato` | Que decisões atuais do texto precisam ficar registradas para outra etapa não ter de redescobri-las, onde cada uma fica, e como os blocos se ligam às cenas do roteiro? |
| `revisao/critica` | O que o ouvinte perde num trecho, qual é a menor causa da perda, e que evidência a confirma? |
| `embalagem/titulo-e-thumbnail` | Que expectativa título e thumbnail criam juntos antes do clique, e ela corresponde ao vídeo que existe? |

Os números que as unidades dão como medidos "no canal" vêm das legendas em inglês do Kurzgesagt (245 vídeos, medidos em 2026-10-02): valem como ordem de grandeza para o português, e nenhum é prova de desempenho.

## ORDEM DE INJEÇÃO

Injete o procedimento do trabalho, depois `entrevista` e as unidades do passo em curso com as suas dependências, na ordem da tabela. A tabela diz que conhecimento ler para cada tipo de trabalho, e não que um passo precisa estar fechado para o seguinte existir: quando um artefato mostra problema noutro passo, a execução vai a ele, relendo as unidades dele.

| Trabalho | Passo | Unidades |
|---|---|---|
| Pesquisa | Pesquisa | `levantamento`; `checagem`, quando uma premissa de risco é conferida cedo |
| Roteiro | Conceito | `ouvinte`, `angulo`, `voz`, `titulo-e-thumbnail` (título provisório), `formato` |
| | Estrutura | `ouvinte`, `moldes`, `arco`, `gancho`, `fechamento`, `chamada` |
| | Escrita | `ouvinte`, `analogias`, `explicacao`, `fio`, `humor`, `narracao`, `procedencia`, `indicacao-visual` |
| | Decupagem | skill `diretor-de-arte`, passos Conceito visual e Decupagem: a prova visual quando o risco pede, os planos de todas as cenas, que o `pnpm narrate` exige |
| | Silêncio | skill `diretor-de-som`, `etapas/arco-de-som.md`, quando um silêncio muda o tempo do vídeo e sai mais barato decidido antes da voz |
| | Revisão | `critica`, `checagem` e a unidade dona de cada defeito apontado |
| | Embalagem | `ouvinte`, `titulo-e-thumbnail` (o par) |

Para tarefas parciais (revisar um roteiro existente, refazer só o gancho), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- Nenhuma afirmação factual sem fonte chega ao roteiro final.
- Um trabalho começa quando há o bastante para produzir uma evidência válida, e o que o artefato mostra volta à decisão anterior: um gancho tentado pode mostrar que a promessa é difusa; uma amostra de narração, que a estrutura está montada demais; a decupagem, que a frase não se encena. O que tranca são as dependências reais: o fato só entra no texto depois de estar em `research.md`, toda cena tem `shots` válidos antes de `pnpm narrate`, e mudar o que o usuário já decidiu volta a ele (`entrevista`).
- Gerar voz é caro e fixa o tempo de tudo que é animado sobre ela: é gerada quando o texto e os `shots` de que ela depende estão estáveis o bastante para justificar esse custo. Isso não torna o texto imutável: a frase que precisa mudar depois muda, e paga o custo dela.
- Onde uma unidade ainda fala em aprovação, em "1ª aprovação" ou em `approvals.md` como registro, valem estes limites: os `approvals.md` que existem são histórico legado, nada é escrito neles nem lido deles, e a decisão do usuário mora em `script.md`.
- Das referências usa-se o mecanismo (padrão, molde, movimento); as frases, os exemplos, as metáforas e os bordões ficam com elas.
- O exemplo de uma unidade é exemplo de forma: cada afirmação dele precisa estar na base de fatos antes de entrar num roteiro.

## CRITÉRIOS DE PARADA

Pare quando:

- a dúvida pedida estiver respondida com a evidência que basta: checar uma afirmação termina na afirmação classificada, e reescrever um trecho, no trecho reescrito e conferido, sem revisão do roteiro inteiro;
- o pedido for o roteiro completo, não houver decisão editorial material aberta e o usuário tiver decidido o que era dele: o que o vídeo diz e o que a embalagem vende, e não a redação, a composição nem a execução dos planos (`etapas/roteiro.md`);
- no escopo do pedido, não restar problema bloqueante, e a correção dos relevantes que sobraram custar mais do que devolve: relate-os;
- uma correção não resolver nenhum problema pendente nem melhorar o texto: relate o que ficou em aberto;
- a pesquisa não sustentar nenhum ângulo honesto para o tema: relate e proponha redelimitar o tema;
- o pedido estiver no anti-escopo.

Medida do perfil fora da faixa, num trecho em que a leitura não acha defeito, não segura a parada: vai no relato.
