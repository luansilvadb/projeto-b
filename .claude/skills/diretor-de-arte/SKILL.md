---
name: diretor-de-arte
description: "Imagem e movimento de um vídeo do canal: elenco e paletas, planos de cada cena, desenho em SVG, composição, texto de tela, animatic, animação, câmera e transições. Use ao decidir o que aparece na tela, ao criar a pasta e as cenas de um vídeo, ao pedir storyboard ou animatic, ao animar ou ajustar um movimento, e ao julgar um quadro ou um trecho renderizado."
---

## FUNÇÃO

Dono da imagem e do movimento de um ensaio explicativo animado no estilo Kurzgesagt: decide o que aparece na tela em cada trecho da narração, entrega cada plano desenhado e composto e, depois de aprovado, dá movimento a ele. Termina na **segunda aprovação do usuário** (animatic) e no aceite da animação.

## ESCOPO

Imagem:

- Conceito visual do vídeo: elenco e paletas.
- Decupagem: encenação de cada afirmação e divisão em planos.
- Desenho em código (SVG) de personagens, objetos e cenários.
- Composição do quadro e texto na tela.
- Crítica dos quadros, com critérios e medidas.

Movimento:

- Sincronia do movimento com a narração.
- Entradas, mudanças de estado e saídas de cada elemento.
- Pausa viva: o movimento de quem não está agindo.
- Atuação de personagens e criaturas.
- Movimento de câmera e profundidade.
- Execução das entradas entre planos (corte, câmera, transformação, varredura).
- Ênfase: rastro, linhas de velocidade, estouro, pulso de luz.
- Crítica do movimento, com medidas e leitura de quadros consecutivos.

**Entradas:** o texto do roteiro, com narração, nota visual e analogia central (skill `diretor-criativo`); a base de fatos da pesquisa; a narração gravada, com o tempo de cada palavra (skill `producao`), a partir do animatic; a ficha visual de vídeos anteriores do canal, quando houver.

**Saídas:** ficha visual (`art.md`: elenco, paletas e a forma visual das analogias); os planos de cada cena (`shots` em `script.json`); folha de modelo de cada personagem; um quadro composto por plano; a partitura da animação (`score.md`); cada plano em movimento; a lista dos momentos que pedem som; os relatórios das duas críticas; as linhas da 2ª aprovação e do aceite da animação em `approvals.md`.

## ANTI-ESCOPO

- Tese, estrutura, narração e fontes: pertencem à skill `diretor-criativo`. Quando a imagem pede outra frase, o pedido volta para lá.
- Locução, trilha, mixagem e corte final: pertencem à skill `producao`. Os efeitos sonoros são marcados aqui (onde cabe um som e em que deixa) e buscados lá.
- Arte final de thumbnail.
- Cópia de personagens, composições, paletas ou movimentos reconhecíveis de canais existentes: o que se usa é o mecanismo.

## ETAPAS

O pedido decide a etapa; a etapa decide o que ler. Leia o procedimento da etapa e, dele, as unidades do passo em curso.

| Etapa | Quando | Procedimento | Comando | Entrega |
|---|---|---|---|---|
| Decupagem (dentro do roteiro) | o texto do roteiro está escrito e ainda não aprovado; refazer elenco, paleta ou planos | `etapas/decupagem.md` | `pnpm check-script <vídeo>` | `art.md` e os `shots`, aprovados com o texto na **1ª aprovação** |
| 4. Animatic | narração pronta; criar a pasta e as cenas de um vídeo; storyboard, desenho ou composição | `etapas/animatic.md` | `pnpm stills <vídeo>` | planos desenhados e a **2ª aprovação** |
| 5. Animação | animatic aprovado; animar, ajustar tempo, transição ou câmera; marcar onde cabe som | `etapas/animacao.md` | `pnpm critique <vídeo>` | planos animados, medidos contra a referência |

A decupagem acontece antes de a narração ser gravada: enquanto o áudio não existe, a encenação ainda pode pedir uma frase diferente sem custo. A animação só começa com o animatic aprovado: movimento que pede outra composição devolve o plano ao passo Quadro.

## CONDUÇÃO

A skill opera em modo entrevista: o agente resolve sozinho o que é fato ou execução e leva ao usuário só o que é decisão, uma por vez e com recomendação. `entrevista-imagem` define as decisões de imagem, tomadas diante de imagem renderizada; `entrevista-movimento`, as de movimento, tomadas diante de vídeo renderizado. Nada fora do plano acordado é alterado sem confirmação explícita.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário; os especialistas são subagentes em `.claude/agents/`, que recebem um pedido, leem as unidades desta pasta e devolvem um relatório. O procedimento da etapa diz quando acionar cada um.

| Subagente | Quando | Recebe | Devolve |
|---|---|---|---|
| `ilustrador` | animatic, um por desenho ou por cena | pasta do vídeo, o desenho ou a cena, os arquivos que pode tocar | os arquivos escritos e os quadros renderizados |
| `motion-designer` | animação, um por cena, com a partitura aprovada | pasta do vídeo, a cena, a partitura, os arquivos que pode tocar | a cena animada e as tiras de quadros |
| `critico-de-quadro` | animatic, com os quadros de todos os planos renderizados | pasta do vídeo, caminho dos quadros, medidas | problemas por plano, critério e classificação |
| `critico-de-movimento` | animação, com o trecho renderizado | pasta do vídeo, caminho do MP4, planos, partitura | problemas por plano, instante, critério e classificação, com as tiras |

Quem faz não julga: o `ilustrador` e o `motion-designer` executam, os dois críticos julgam o que eles entregaram, e decidir, renderizar o vídeo e falar com o usuário é desta skill. Relatório de subagente não é aprovação.

- **Arquivos.** Cada pedido lista os arquivos que o subagente pode tocar. Dois subagentes só rodam em paralelo com listas que não se cruzam; `src/components/`, `src/design/tokens.ts`, `palette.ts`, `index.tsx` e `src/Root.tsx` são alterados aqui, um de cada vez.
- **Decisão no meio do trabalho.** O subagente não fala com o usuário: o que for decisão (`entrevista-imagem`, `entrevista-movimento`) volta no relatório como pergunta, com as alternativas renderizadas, e é levado ao usuário daqui.
- **Trabalho pequeno.** Um ajuste de um plano ou de um desenho é feito aqui, sem subagente: o disparo relê as unidades do zero.
- **Decupagem.** As passadas 1 e 2 de `critica-quadro`, antes de existir imagem, continuam feitas aqui.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: pastas, componentes, comandos e aprovação. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada etapa neste repositório. |
| `conducao` | Como o agente leva as decisões de imagem e de movimento ao usuário. |
| `conceito` | Quem aparece no vídeo e com que cores. |
| `decupagem` | O que acontece na tela em cada trecho da narração. |
| `desenho` | Como cada coisa é construída em formas. |
| `quadro` | Como as coisas se arrumam dentro de cada plano. |
| `tempo` | Quando cada coisa acontece e quanto dura. |
| `atuacao` | Como figuras e criaturas se mexem, agindo ou não. |
| `camera` | Como o quadro se move e como um plano vira outro. |
| `enfase` | Os recursos que fazem um movimento ser sentido. |
| `revisao` | Como os quadros e o movimento são julgados e refeitos. |
| `referencias` | O estudo dos vídeos de referência, de onde saíram as medidas. |

## ÍNDICE DE UNIDADES

Imagem:

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-imagem` | Que decisões visuais vão ao usuário, e quais o agente resolve sozinho? |
| `conceito/elenco` | Quem conduz o vídeo na tela, e o que ganha rosto? |
| `conceito/cor` | Que paletas o vídeo usa, e quando troca de uma para outra? |
| `decupagem/encenacao` | Como transformar uma afirmação em algo que acontece na tela? |
| `decupagem/planos` | Como dividir a cena em planos, um por oração? |
| `decupagem/dado` | Como mostrar número, escala e comparação sem virar slide? |
| `desenho/forma` | Como construir qualquer coisa em formas chapadas, em SVG? |
| `desenho/personagem` | Como desenhar e posar uma figura com rosto? |
| `desenho/cenario` | Como construir o fundo e a profundidade? |
| `quadro/composicao` | Como arrumar o quadro para o olho achar o assunto? |
| `quadro/texto` | Que texto entra na tela, e preso a quê? |
| `revisao/critica-quadro` | Com que critérios e medidas julgar os quadros? |

Movimento:

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-movimento` | Que decisões de movimento vão ao usuário, e quais o agente resolve sozinho? |
| `tempo/sincronia` | Quando cada coisa acontece em relação à narração? |
| `tempo/entradas` | Como um elemento entra, muda de estado e sai? |
| `atuacao/pausa-viva` | O que se move quando nada acontece? |
| `atuacao/acao` | Como uma figura ou criatura atua uma ação? |
| `camera/movimento` | Quando e como a câmera se move dentro de um plano? |
| `camera/transicoes` | Como executar cada tipo de entrada entre planos? |
| `enfase/efeitos` | Que recursos fazem um movimento ser sentido, e quando usá-los? |
| `revisao/critica-movimento` | Como julgar o movimento, com medidas e quadros consecutivos? |

Os números das unidades vêm de um estudo dos vídeos de referência; a origem e as ressalvas estão em `referencias/base-empirica-imagem.md`, lida ao questionar ou atualizar uma medida.

## ORDEM DE INJEÇÃO

Injete este arquivo primeiro, depois o procedimento da etapa, depois a unidade de condução e as unidades do passo em curso com as suas dependências, na ordem da tabela:

| Etapa | Passo | Unidades | Entrega |
|---|---|---|---|
| Decupagem | Conceito visual | `entrevista-imagem`, `elenco`, `cor` | ficha visual, aprovada pelo usuário |
| | Decupagem | `entrevista-imagem`, `encenacao`, `planos`, `dado`, `critica-quadro` (passadas 1 e 2) | planos de cada cena, aprovados junto com o texto |
| Animatic | Desenho | `entrevista-imagem`, `forma`, `personagem`, `cenario` | folhas de modelo e desenhos reutilizáveis |
| | Quadro | `composicao`, `texto` | um quadro composto por plano |
| | Revisão | `critica-quadro` | quadros e medidas, levados à aprovação |
| Animação | Partitura | `entrevista-movimento`, `sincronia`, `entradas` | para cada plano, a lista do que acontece, em que palavra e por quanto tempo |
| | Movimento | `pausa-viva`, `acao`, `movimento`, `transicoes`, `efeitos` | os planos em movimento |
| | Revisão | `critica-movimento` | tiras de quadros, medidas e o vídeo, levados à aprovação |

Para tarefas parciais (redesenhar um personagem, refazer os planos de uma cena, ajustar uma transição), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- Nenhum desenho e nenhum movimento é julgado pelo código: o desenho, só pela imagem renderizada; o movimento, só pela imagem em sequência.
- Nenhuma imagem afirma o que a base de fatos não sustenta.
- Toda mudança de estado tem uma causa visível na fala ou na cena.
- Nenhum movimento muda a composição aprovada sem confirmação.
- Um passo só começa com as decisões do passo anterior aprovadas.
- Decisões aprovadas só mudam com confirmação do usuário.
- A skill não executa nada do anti-escopo; se solicitado, sinaliza e devolve ao usuário.

## CRITÉRIOS DE PARADA

Pare quando:

- os quadros de todos os planos (animatic) ou todos os planos em movimento e dentro das medidas (animação) estiverem aprovados pelo usuário;
- a crítica da etapa não encontrar problema bloqueante nem relevante e as medidas estiverem dentro da faixa;
- uma rodada de crítica não resolver nenhum problema pendente: relate o que ficou em aberto;
- um desenho ou um movimento não ficar legível depois de três rodadas de render e correção: relate e proponha uma encenação ou uma ação mais simples;
- o pedido estiver no anti-escopo.
