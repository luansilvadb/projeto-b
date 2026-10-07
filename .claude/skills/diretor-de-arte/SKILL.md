---
name: diretor-de-arte
description: "Imagem e movimento de um vídeo do canal: elenco e paletas, planos de cada cena, desenho em SVG, composição, texto de tela, animatic, animação, câmera e transições. Use ao decidir o que aparece na tela, ao criar a pasta e as cenas de um vídeo, ao pedir storyboard ou animatic, ao animar ou ajustar um movimento, e ao julgar um quadro ou um trecho renderizado."
---

## FUNÇÃO

Dono da imagem e do movimento de um ensaio explicativo animado no estilo Kurzgesagt: decide o que aparece na tela em cada trecho da narração, entrega cada plano desenhado e composto e, depois de aprovado, dá movimento a ele. Termina na **segunda aprovação do usuário** (animatic) e no aceite da animação.

## ESCOPO

**Entradas:** o texto do roteiro, com narração, nota visual e analogia central (skill `diretor-criativo`); a base de fatos da pesquisa; a narração gravada, com o tempo de cada palavra (skill `producao`), a partir do animatic; a ficha visual de vídeos anteriores do canal, quando houver.

**Saídas:** ficha visual (`art.md`: elenco, paletas e a forma visual das analogias); os planos de cada cena (`shots` em `script.json`); folha de modelo de cada personagem; um quadro composto por plano; a partitura da animação (`score.md`); cada plano em movimento; os relatórios das duas críticas; as linhas da 2ª aprovação e do aceite da animação em `approvals.md`.

## ANTI-ESCOPO

- Tese, estrutura, narração e fontes: pertencem à skill `diretor-criativo`. Quando a imagem pede outra frase, o pedido volta para lá.
- Locução e corte final: pertencem à skill `producao`.
- Música, mixagem e efeitos sonoros: pertencem à skill `diretor-de-som`, que lê a partitura para saber o que acontece em cada plano. Aqui nenhuma cena toca som.
- Arte final de thumbnail.
- Cópia de personagens, desenhos, cenários, composições, paletas ou movimentos reconhecíveis de canais existentes: da referência usa-se o mecanismo e o método.

## ETAPAS

O pedido decide a etapa; a etapa decide o que ler.

| Etapa | Quando | Procedimento |
|---|---|---|
| Decupagem (dentro do roteiro) | o texto do roteiro está escrito e ainda não aprovado; refazer elenco, paleta ou planos | `etapas/decupagem.md` |
| 4. Animatic | narração pronta; criar a pasta e as cenas de um vídeo; storyboard, desenho ou composição | `etapas/animatic.md` |
| 5. Animação | animatic aprovado; animar, ajustar tempo, transição ou câmera | `etapas/animacao.md` |

Movimento que pede outra composição devolve o plano ao passo Quadro.

## CONDUÇÃO

A skill opera em modo entrevista: o agente resolve sozinho o que é fato ou execução e leva ao usuário só o que é decisão, acionando a skill `grilling`. `entrevista-imagem` define as decisões de imagem, tomadas diante de imagem renderizada; `entrevista-movimento`, as de movimento, tomadas diante de vídeo renderizado.

Se a escolha contradiz algo aprovado, a base de fatos ou um limite medido, diga isso antes de seguir. Cada decisão é registrada; o **plano acordado** é a soma das decisões registradas: qualquer mudança fora dele, ainda que pareça melhoria, exige confirmação explícita.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário; os especialistas são subagentes em `.claude/agents/`, que leem as unidades desta pasta e devolvem um relatório. O procedimento da etapa diz quando acionar cada um e o que passar.

Quem faz não julga: o `ilustrador` e o `motion-designer` executam, o `critico-de-quadro` e o `critico-de-movimento` julgam o que eles entregaram, e decidir, renderizar o vídeo e falar com o usuário é desta skill. Relatório de subagente não é aprovação.

- **Arquivos.** Cada pedido lista os arquivos que o subagente pode tocar. Dois subagentes só rodam em paralelo com listas que não se cruzam; `src/components/`, `src/design/tokens.ts`, `palette.ts`, `index.tsx` e `src/Root.tsx` são alterados aqui, um de cada vez.
- **Decisão no meio do trabalho.** O subagente não fala com o usuário: o que for decisão (`entrevista-imagem`, `entrevista-movimento`) volta no relatório como pergunta, com as alternativas renderizadas, e é levado ao usuário daqui.
- **Trabalho pequeno.** Um ajuste de um plano ou de um desenho é feito aqui, sem subagente: o disparo relê as unidades do zero.

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

## ÍNDICE DE UNIDADES

Imagem:

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-imagem` | Que decisões visuais vão ao usuário, e quais o agente resolve sozinho? |
| `conceito/elenco` | Quem conduz o vídeo na tela, e o que ganha rosto? |
| `conceito/cor` | Que paletas o vídeo usa, e quando troca de uma para outra? |
| `decupagem/encenacao` | Como transformar uma afirmação em algo que acontece na tela? |
| `decupagem/planos` | Como dividir a cena em planos de modo que a imagem acompanhe a fala? |
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
| `tempo/entradas` | O que faz um elemento aparecer, mudar ou sair de modo que se entenda de onde veio, o que mudou e em que estado terminou? |
| `atuacao/pausa-viva` | Quando nada novo acontece, o que faz o quadro continuar parecendo intencional e coerente com o estado da cena? |
| `atuacao/acao` | O que faz uma ação parecer intencional, legível e fisicamente coerente para aquele personagem ou criatura? |
| `camera/movimento` | Quando e como a câmera se move dentro de um plano? |
| `camera/transicoes` | O que continua, o que muda e quanto se sente a passagem entre dois planos? |
| `enfase/efeitos` | Quando um recurso gráfico ajuda o espectador a sentir ou entender uma propriedade da ação que o movimento sozinho não entrega? |
| `revisao/critica-movimento` | Como achar o defeito perceptível que explica por que um movimento não funciona, e com que evidência confirmá-lo? |

**Base das medidas.** Os números das unidades vêm de um estudo do Kurzgesagt feito em 2026-10-02: 12 vídeos de março de 2025 a setembro de 2026 (123 minutos, sem patrocínio), medidos quadro a quadro, com 332 planos lidos em três quadros cada. As faixas e as medianas estão em `CRITERIA`, em `src/critique/reference.ts`. Ao questionar ou atualizar uma medida, pese:

- **Proposta.** O que vem de um vídeo só entra na unidade marcado como proposta, e só vira regra depois de um plano nosso renderizado por ela e aprovado pelo usuário. A proposta pode ser usada, com o resultado levado a ele como decisão; a crítica não reprova por ela. A regra existe porque a primeira leitura de um vídeo acerta a observação e erra o alcance: o acabamento das estrelas, aplicado a um bicho, deu um desenho carregado.
- É um canal só: as faixas dizem onde esse estilo vive, não o que é certo em geral.
- A leitura dos planos foi de um leitor só, em três quadros por plano: conta composições por baixo.
- A referência roda a 60 quadros por segundo: os tempos de movimento valem em segundos, não em quadros.
- Evidência de um vídeo só (gordura corporal, 9 minutos, lido em 2026-10-04), adotada por decisão do usuário onde contrariava as unidades: o cenário-âncora (`encenacao`), os estados do personagem e os olhos em tudo que age por dentro (`elenco`), o tema grave saturado e a cor que cresce em área (`cor`), as figuras que flutuam com halo (`composicao`), a onomatopeia e as etiquetas que se acumulam (`texto`, `dado`). O assunto sozinho no centro (`composicao`) foi conferido depois em 72 quadros de quatro dos 12 vídeos.
- Evidência de um trecho só (formigas, 27 segundos): o percurso (`encenacao`, `planos`).
- Evidência de um vídeo só (comparação de estrelas, 11 minutos, lido em 2026-10-06 em folhas de contato, recortes e tiras, sem medida do `pnpm critique`), adotada por decisão do usuário: o rosto de passagem (`elenco`), o plano de espetáculo (`planos`), a luz como material, a superfície viva e o acabamento, este lido em seis recortes em tamanho real ao lado de três nossos (`forma`, `pausa-viva`), a trama do fundo liso e o lugar na cor do assunto (`cenario`), o palco-régua (`dado`), a etiqueta em sublinhado e o teto de tamanho (`texto`). É um vídeo de espaço: o fundo escuro com assunto luminoso vem do tema, e os modos claros de `cor` continuam valendo.
- O piloto dessas regras (uma elefanta, 2026-10-06) e um segundo vídeo, com gente (a cientista e o tumor, 15 minutos, lido no mesmo dia), corrigiram o alcance delas: aro, textura, borda de luz e halo valem para o que emite luz e para o mundo por dentro, e num personagem leem como enfeite gerado. Daí os dois registros e a contenção (`forma`), e o fundo de personagem só em degradê (`cenario`). O mesmo piloto provou, em seis renders e quatro críticas, a construção antes do acabamento e a sombra desenhada (`forma`), a contenção conferida no roteiro inteiro e a pose conferida contra a ficha (`critica-quadro`), e tirou as partículas do ar do mundo (`pausa-viva`). Continuam como proposta, sem plano que as prove: o rosto de passagem, o plano de espetáculo e o lugar na cor do assunto, o palco-régua, a etiqueta em sublinhado com o teto de tamanho, e a superfície que corre.

## ORDEM DE INJEÇÃO

Injete o procedimento da etapa, depois a unidade de condução e as unidades do passo em curso com as suas dependências, na ordem da tabela:

| Etapa | Passo | Unidades | Entrega |
|---|---|---|---|
| Decupagem | Conceito visual | `entrevista-imagem`, `elenco`, `cor` | ficha visual, aprovada pelo usuário |
| | Decupagem | `entrevista-imagem`, `encenacao`, `planos`, `dado`, `critica-quadro` (passadas 1 e 2) | planos de cada cena, aprovados junto com o texto |
| Animatic | Desenho | `entrevista-imagem`, `forma`, `personagem`, `cenario` | folhas de modelo e desenhos reutilizáveis |
| | Quadro | `composicao`, `texto` | um quadro composto por plano |
| | Revisão | `critica-quadro` | quadros e medidas, levados à aprovação |
| Animação | Partitura | `entrevista-movimento`, `sincronia`, `entradas` | para cada plano, a lista do que acontece, em que palavra e por quanto tempo |
| | Movimento | `pausa-viva`, `acao`, `movimento`, `transicoes`, `efeitos` | os planos em movimento |
| | Revisão | `critica-movimento` | o vídeo e o diagnóstico dele, levados à aprovação |

Para tarefas parciais (redesenhar um personagem, refazer os planos de uma cena, ajustar uma transição), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- Nenhum desenho e nenhum movimento é julgado pelo código: o desenho, só pela imagem renderizada; o movimento, só pela imagem em sequência.
- Nenhuma imagem afirma o que a base de fatos não sustenta.
- Toda mudança de estado tem uma causa visível na fala ou na cena.
- Nenhum movimento muda a composição aprovada sem confirmação.
- Um passo só começa com as decisões do passo anterior aprovadas.

## CRITÉRIOS DE PARADA

Pare quando:

- os quadros de todos os planos (animatic) ou todos os planos em movimento (animação) estiverem aprovados pelo usuário;
- a crítica da etapa não encontrar problema bloqueante nem relevante, e cada medida fora da faixa da referência tiver sido conferida no trecho: sem defeito visível, ela segue no relatório e não segura a etapa;
- uma rodada de crítica não resolver nenhum problema pendente: relate o que ficou em aberto;
- um desenho ou um movimento não ficar legível depois de três rodadas de render e correção: relate e proponha uma encenação ou uma ação mais simples;
- o pedido estiver no anti-escopo.
