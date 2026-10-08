---
name: diretor-criativo
description: "Pesquisa e roteiro de vídeos educativos: fatos e fontes, ângulo, estrutura, narração, cenas, título e conceito de thumbnail. Use para pesquisar, checar afirmações, escrever ou revisar esses materiais."
---

## FUNÇÃO

Dono da pesquisa, das decisões editoriais e do roteiro. Entrega fatos com fontes e narração escrita para voz, junto das cenas. O usuário decide o que o vídeo quer dizer; essa decisão fica em `script.md`.

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

Escolha o procedimento pela dúvida atual. Em tarefa localizada, leia só a seção pertinente e a unidade que responde à dúvida, com suas dependências; use o fluxo completo para criar ou revisar o roteiro inteiro.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Pesquisa | falta evidência para afirmar ou decidir: tema novo; pesquisar ou checar um fato; o roteiro pede um fato que `research.md` não sustenta | `etapas/pesquisa.md` |
| Roteiro | há suporte factual para escrever ou testar o trecho atual; escrever, revisar, encurtar ou alterar roteiro, narração ou cenas | `etapas/roteiro.md` |

Pesquisa e escrita se alternam: volte à fonte quando um trecho pedir um fato que `research.md` não sustenta.

## CONDUÇÃO

Escreva e compare antes de perguntar. Leia `conducao/entrevista` quando alternativas válidas puderem mudar o vídeo; leve essa decisão ao usuário.

## SUBAGENTES

Acione `pesquisador`, `checador` e `editor` nos casos definidos em `etapas/`. Eles levantam evidência; a decisão, a escrita e a conversa ficam com esta skill.

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
| `conducao/entrevista` | Qual escolha editorial é do usuário? |
| `pesquisa/levantamento` | Que evidência e fonte a afirmação exige? |
| `pesquisa/checagem` | A afirmação é sustentada na força em que é dita? |
| `conceito/ouvinte` | O texto funciona para quem ouve uma vez? |
| `conceito/angulo` | Que vídeo específico o tema sustenta? |
| `conceito/voz` | Quem narra, e para quem? |
| `estrutura/moldes` | Que mecanismo organiza o material? |
| `estrutura/arco` | Como cada trecho muda o entendimento? |
| `estrutura/gancho` | O que a abertura promete? |
| `estrutura/fechamento` | O que o fim entrega? |
| `estrutura/chamada` | Que pedido cabe depois da entrega? |
| `escrita/explicacao` | Como o fato muda o entendimento? |
| `escrita/fio` | O que liga os blocos? |
| `escrita/narracao` | A frase funciona ao ser ouvida? |
| `escrita/procedencia` | Que origem precisa aparecer? |
| `escrita/analogias` | A analogia preserva a relação real? |
| `escrita/humor` | O humor ajuda sem distorcer? |
| `escrita/indicacao-visual` | O que a imagem não pode decidir? |
| `escrita/formato` | Onde ficam as decisões do texto? |
| `revisao/critica` | O que o ouvinte perde? |
| `embalagem/titulo-e-thumbnail` | A promessa corresponde ao vídeo? |

Os números de referência descritos nas unidades são sensores para o português, não provas de desempenho.

## ORDEM DE INJEÇÃO

Para tarefas localizadas, leia apenas a seção pertinente do procedimento e a unidade que responde à dúvida, com dependências diretas. Leia `conducao/entrevista` só quando alternativas válidas puderem mudar o vídeo. A tabela abaixo cobre a criação ou revisão do conjunto inteiro.

| Trabalho | Passo | Unidades |
|---|---|---|
| Pesquisa | Pesquisa | `levantamento`; `checagem` para premissa de risco |
| Roteiro | Conceito | `ouvinte`, `angulo`, `voz`, `titulo-e-thumbnail` (título provisório), `formato` |
| | Estrutura | `ouvinte`, `moldes`, `arco`, `gancho`, `fechamento`, `chamada` |
| | Escrita | `ouvinte`, `analogias`, `explicacao`, `fio`, `humor`, `narracao`, `procedencia`, `indicacao-visual` |
| | Decupagem | skill `diretor-de-arte`, passos Conceito visual e Decupagem: a prova visual quando o risco pede, os planos de todas as cenas, que o `pnpm narrate` exige |
| | Silêncio | skill `diretor-de-som`, `etapas/arco-de-som.md`, quando um silêncio muda o tempo do vídeo e sai mais barato decidido antes da voz |
| | Revisão | `critica`, `checagem` e a unidade dona de cada defeito apontado |
| | Embalagem | `ouvinte`, `titulo-e-thumbnail` (o par) |

Em pedidos parciais (uma afirmação, frase, cena ou título), leia só a seção pertinente do procedimento e da unidade central, com dependências diretas. Numa unidade com várias lentes, use a que corresponde ao sintoma; leia o documento inteiro quando o trabalho cobrir seu fluxo ou pergunta central.

## LIMITES

- Nenhuma afirmação factual sem fonte chega ao roteiro final.
- Um trabalho começa quando há o bastante para produzir uma evidência válida, e o que o artefato mostra volta à decisão anterior: um gancho tentado pode mostrar que a promessa é difusa; uma amostra de narração, que a estrutura está montada demais; a decupagem, que a frase não se encena. O que tranca são as dependências reais: o fato só entra no texto depois de estar em `research.md`, toda cena tem `shots` válidos antes de `pnpm narrate`, e mudar o que o usuário já decidiu volta a ele (`entrevista`).
- Gerar voz é caro e fixa o tempo de tudo que é animado sobre ela: é gerada quando o texto e os `shots` de que ela depende estão estáveis o bastante para justificar esse custo. Isso não torna o texto imutável: a frase que precisa mudar depois muda, e paga o custo dela.
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
