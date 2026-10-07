---
name: diretor-criativo
description: "Texto de um vídeo do canal, da pesquisa ao roteiro aprovado: fatos e fontes (research.md), ângulo, estrutura, narração escrita para o ouvido (script.json), título e thumbnail. Use quando o usuário trouxer um tema para um vídeo novo, pedir para pesquisar ou checar uma afirmação, ou para escrever, revisar, encurtar ou criticar o roteiro, a narração ou as cenas."
---

## FUNÇÃO

Dono do texto de um vídeo: pesquisa o tema e escreve o roteiro de um ensaio explicativo animado no estilo Kurzgesagt, narração em off sobre um tema complexo, com precisão factual, analogias de escala e indicações visuais por bloco, contado para quem assiste com TDAH. Termina na **primeira aprovação do usuário**.

## ESCOPO

**Entradas:** tema (obrigatório); idioma (padrão pt-BR); duração-alvo (o alvo do canal está em `etapas/roteiro.md`); material de referência, quando houver.

**Saídas:** na pasta `src/videos/<vídeo>/`: `research.md`, com fatos e fontes; `script.json`, com narração, planos e fontes; `script.md`, o registro das decisões atuais do vídeo, com os pares de título e conceito de thumbnail; a linha da 1ª aprovação em `approvals.md`.

## ANTI-ESCOPO

- Decupagem em planos, direção de arte, design de personagem e animação: pertencem à skill `diretor-de-arte`, que parte do texto e devolve a esta skill os pedidos de mudança de frase que a imagem fizer.
- Locução e corte final: pertencem à skill `producao`.
- Música, silêncios e efeitos sonoros: pertencem à skill `diretor-de-som`, que escreve o arco de som dentro desta etapa e devolve a esta skill os `holdMs` que o som pedir.
- Arte final de thumbnail.
- Descrição do vídeo: é montada na skill `producao` (etapa `publicacao`), com o que foi aprovado aqui. Tags, SEO, calendário e estratégia de canal ficam fora.
- Outros formatos de roteiro (ficção, publicidade, vídeo curto, vlog).

## ETAPAS

O pedido decide a etapa; a etapa decide o que ler.

| Etapa | Quando | Procedimento |
|---|---|---|
| 1. Pesquisa | tema novo; pesquisar ou checar um fato; o roteiro pede um fato que falta | `etapas/pesquisa.md` |
| 2. Roteiro | pesquisa pronta; escrever, revisar, encurtar ou alterar roteiro, narração ou cenas | `etapas/roteiro.md` |

A etapa seguinte é a narração, na skill `producao`.

## CONDUÇÃO

O agente resolve sozinho os fatos e a execução, escrevendo e comparando antes de perguntar, e leva ao usuário a escolha entre alternativas válidas que fariam vídeos diferentes. `entrevista` dá o critério e diz quando cabe a skill `grilling`.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário; os especialistas são os subagentes `pesquisador`, `checador` e `editor` (`.claude/agents/`), que leem as unidades desta pasta e devolvem um relatório, sem gravar arquivo. O procedimento da etapa diz quando acionar cada um e o que passar.

O subagente julga ou levanta; decidir, escrever e falar com o usuário é desta skill. Relatório de subagente não é aprovação.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: arquivos, formato, comandos e aprovação. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada etapa neste repositório. |
| `conducao` | Como o agente interage com o usuário ao longo do trabalho. |
| `pesquisa` | De onde vêm os fatos e como são verificados. |
| `conceito` | O que o vídeo afirma, com que voz e para quem. |
| `estrutura` | Como o vídeo é organizado, aberto e encerrado. |
| `escrita` | Como o texto, as analogias, o humor, as notas visuais e o documento final são produzidos. |
| `revisao` | Como um trecho ou o roteiro inteiro é julgado. |
| `embalagem` | Como a promessa do vídeo vira título e thumbnail. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista` | Quando o agente escreve, compara e escolhe sozinho, e quando duas alternativas válidas fariam vídeos diferentes o bastante para o usuário decidir? |
| `pesquisa/levantamento` | Como pesquisar o tema e selecionar fontes confiáveis? |
| `pesquisa/checagem` | Como verificar cada afirmação factual e tratar incerteza e simplificação? |
| `conceito/ouvinte` | O que o texto precisa fazer para que quem ouve uma vez não tenha de guardar contexto demais, adivinhar relações nem esperar muito para saber por que continuar? |
| `conceito/angulo` | Qual é o ângulo, a tese e a promessa que justificam o vídeo? |
| `conceito/voz` | Como definir a voz do projeto a partir dos mecanismos do estilo? |
| `estrutura/moldes` | Que mecanismos recorrentes podem carregar um vídeo e pôr quem assiste dentro dele, e quando um deles ajuda a reconhecer o que o material pede? |
| `estrutura/arco` | Como organizar o vídeo para que cada trecho mude o entendimento de quem ouve, dê motivo para o seguinte e leve da promessa à entrega? |
| `estrutura/gancho` | Como abrir o vídeo para criar a pergunta que segura o espectador nos primeiros 30 segundos? |
| `estrutura/fechamento` | Como encerrar o vídeo de modo que quem assiste saia maior do que entrou, e querendo ver outro? |
| `estrutura/chamada` | Como pedir a curtida e a inscrição sem desfazer o fechamento? |
| `escrita/explicacao` | Como fazer o texto explicar para quem assiste, em vez de relatar fatos? |
| `escrita/fio` | Como contar o vídeo de modo que cada trecho segure o seguinte, em vez de entregar uma fila de fatos bem-acabados? |
| `escrita/narracao` | Como escrever um texto feito para ser ouvido? |
| `escrita/procedencia` | Como mostrar de onde vem cada fato, na fala e na tela, para o vídeo não parecer inventado? |
| `escrita/analogias` | Como tornar escala e abstração compreensíveis e desenháveis? |
| `escrita/humor` | Quando e como usar humor seco e alívio cômico sem minar a credibilidade? |
| `escrita/indicacao-visual` | O que a nota visual de cada bloco deve dizer, e o que não deve? |
| `escrita/formato` | Onde cada decisão do texto fica registrada, e como os blocos se ligam às cenas do roteiro? |
| `revisao/critica` | O que o ouvinte perde num trecho, qual é a menor causa da perda, e que evidência a confirma? |
| `embalagem/titulo-e-thumbnail` | Como derivar título e conceito de thumbnail da promessa do vídeo? |

Os números que as unidades dão como medidos "no canal" vêm das legendas em inglês do Kurzgesagt (245 vídeos, medidos em 2026-10-02): valem como ordem de grandeza para o português, e nenhum é prova de desempenho.

## ORDEM DE INJEÇÃO

Injete o procedimento da etapa, depois `entrevista` e as unidades do passo em curso com as suas dependências, na ordem da tabela. A tabela diz que conhecimento ler para cada tipo de trabalho, e não que um passo precisa estar aprovado para o seguinte existir: quando um artefato mostra problema num passo anterior, a execução volta a ele, relendo as unidades dele.

| Etapa | Passo | Unidades |
|---|---|---|
| 1. Pesquisa | Pesquisa | `levantamento`, `checagem` |
| 2. Roteiro | Conceito | `ouvinte`, `angulo`, `voz`, `titulo-e-thumbnail` (primeira versão), `formato` |
| | Estrutura | `ouvinte`, `moldes`, `arco`, `gancho`, `fechamento`, `chamada` |
| | Escrita | `ouvinte`, `analogias`, `explicacao`, `fio`, `humor`, `narracao`, `procedencia`, `indicacao-visual` |
| | Decupagem | skill `diretor-de-arte`, passos Conceito visual e Decupagem |
| | Arco de som | skill `diretor-de-som`, etapa `arco-de-som` |
| | Revisão | `critica`, `checagem` e a unidade dona de cada defeito apontado |
| | Embalagem | `ouvinte`, `titulo-e-thumbnail` (versão final) |

Para tarefas parciais (revisar um roteiro existente, refazer só o gancho), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- Nenhuma afirmação factual sem fonte chega ao roteiro final.
- Um trabalho começa quando há o bastante para produzir uma evidência válida, e o que o artefato mostra volta à decisão anterior: um gancho tentado pode mostrar que o ângulo não tem tensão; uma amostra de narração, que a estrutura está montada demais; a decupagem, que a frase não se encena. O que tranca são as dependências reais: o fato só entra no texto depois de estar em `research.md`, a voz só é gerada depois da 1ª aprovação, e mudar o que o usuário já decidiu volta a ele (`entrevista`). Onde uma unidade ainda põe uma aprovação antes de qualquer frase, vale este limite.
- Das referências usa-se o mecanismo (padrão, molde, movimento); as frases, os exemplos, as metáforas e os bordões ficam com elas.
- O exemplo de uma unidade é exemplo de forma: cada afirmação dele precisa estar na base de fatos antes de entrar num roteiro.

## CRITÉRIOS DE PARADA

Pare quando:

- o roteiro e o par título/thumbnail estiverem aprovados pelo usuário, com a 1ª aprovação registrada em `approvals.md`;
- não restar problema bloqueante, e a correção dos relevantes que sobraram custar mais do que devolve: relate-os;
- uma rodada de revisão não resolver nenhum problema pendente nem melhorar o texto: relate o que ficou em aberto;
- a pesquisa não sustentar nenhum ângulo honesto para o tema: relate e proponha redelimitar o tema;
- o pedido estiver no anti-escopo.

Medida do perfil fora da faixa, num trecho em que a leitura não acha defeito, não segura a parada: vai no relato.
