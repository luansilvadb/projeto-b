---
name: diretor-de-arte
description: "Imagem e movimento de um vídeo do canal: elenco e paletas, planos de cada cena, desenho em SVG, composição, texto de tela, animatic, animação, câmera e transições. Use ao decidir o que aparece na tela, ao criar a pasta e as cenas de um vídeo, ao pedir storyboard ou animatic, ao animar ou ajustar um movimento, e ao julgar um quadro ou um trecho renderizado."
---

## FUNÇÃO

Dono da imagem e do movimento de um ensaio explicativo animado no estilo Kurzgesagt: decide o que aparece na tela em cada trecho da narração, entrega cada plano desenhado e composto e dá movimento a ele. Conhece dependências, e não a ordem dos trabalhos do vídeo: um trabalho de imagem ou de movimento começa quando existem os artefatos que a dúvida visual atual pede, e termina quando ela está resolvida.

## ESCOPO

**Entradas possíveis**, e cada trabalho usa só as que a sua dúvida exige: o texto do roteiro, inteiro ou o trecho em jogo, com a narração e, quando houver, as notas visuais e a analogia condutora (skill `diretor-criativo`); a base de fatos da pesquisa; a narração gravada, com o tempo de cada palavra (skill `producao`), quando a composição precisa montar ou o movimento depende do tempo real da fala; a ficha visual de vídeos anteriores do canal, quando houver.

**Saídas:** ficha visual (`art.md`: elenco, paletas e a forma visual das analogias); os planos de cada cena (`shots` em `script.json`); folha de modelo de cada personagem que volta; um quadro composto por plano; a partitura da animação (`score.md`); cada plano em movimento; os relatórios das duas críticas.

## ANTI-ESCOPO

- Tese, estrutura, narração e fontes: pertencem à skill `diretor-criativo`. Quando a imagem pede outra frase, o pedido volta para lá.
- Locução e corte final: pertencem à skill `producao`.
- Música, mixagem e efeitos sonoros: pertencem à skill `diretor-de-som`, que lê a partitura para saber o que acontece em cada plano. Aqui nenhuma cena toca som.
- Arte final de thumbnail.
- Cópia de personagens, desenhos, cenários, composições, paletas ou movimentos reconhecíveis de canais existentes: da referência usa-se o mecanismo e o método.

## ETAPAS

O pedido decide o trabalho; o trabalho decide o que ler. O que falta para começar é sempre um artefato (o trecho de texto, a narração gravada, a composição do plano), e nunca o aceite de outra disciplina nem o resto do vídeo pronto: uma prova visual cabe antes do roteiro completo, e uma cena pode ser animada sem que as outras estejam compostas.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Decupagem | há texto, de um trecho ou do roteiro, que precisa de imagem: prova visual de uma incerteza; `shots` de todas as cenas, que o `pnpm narrate` exige; refazer elenco, paleta ou planos | `etapas/decupagem.md` |
| Animatic: desenho e quadro | há `shots` para o trecho e, para a composição montar, a narração gravada; criar a pasta e as cenas de um vídeo; storyboard, desenho ou composição | `etapas/animatic.md` |
| Animação: movimento | a composição do trecho está estável o bastante para testar a hipótese de movimento, e existe o tempo real da fala de que ele depende; animar, ajustar tempo, transição ou câmera | `etapas/animacao.md` |

Movimento que pede outra composição, e não só um refino dela, devolve o plano ao passo Quadro.

## CONDUÇÃO

A skill opera em modo entrevista: o agente resolve sozinho o que é fato ou execução e leva ao usuário só o que é decisão, com a profundidade que ela pede: a entrevista da skill `grilling` fica para a que é ambígua ou mexe na identidade. `entrevista-imagem` define as decisões de imagem, tomadas diante de imagem renderizada; `entrevista-movimento`, as de movimento, tomadas diante de vídeo renderizado.

Se a escolha contradiz uma decisão que o usuário já tomou, a base de fatos ou um limite medido, diga isso antes de seguir. As decisões dele ficam em `art.md` e em `score.md`, e a soma delas é o **plano acordado**: qualquer mudança numa decisão material já tomada pelo usuário, ainda que pareça melhoria, exige confirmação explícita. Refinar a execução sem mudar a decisão não exige: a fronteira é a de `entrevista-imagem` e a de `entrevista-movimento`.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário; os especialistas são subagentes em `.claude/agents/`, que leem as unidades desta pasta e devolvem um relatório. O procedimento do trabalho diz quando acionar cada um e o que passar.

Quem produz vê e corrige o próprio trabalho: o `ilustrador` e o `motion-designer` abrem o que fizeram e consertam o que enxergam. A leitura de quem não fez (o `critico-de-quadro`, o `critico-de-movimento`) entra onde a cegueira de quem fez custa caro, nos pontos que o procedimento diz, e não a cada ajuste. Decidir, renderizar o vídeo e falar com o usuário é desta skill. Relatório de subagente não é decisão.

- **Arquivos.** Cada pedido lista os arquivos que o subagente pode tocar. Dois subagentes só rodam em paralelo com listas que não se cruzam; `src/components/`, `src/design/tokens.ts`, `palette.ts`, `index.tsx` e `src/Root.tsx` são alterados aqui, um de cada vez.
- **Decisão no meio do trabalho.** O subagente não fala com o usuário: o que for decisão (`entrevista-imagem`, `entrevista-movimento`) volta no relatório como pergunta, com as alternativas renderizadas, e é levado ao usuário daqui.
- **Trabalho pequeno.** Um ajuste de um plano ou de um desenho é feito aqui, sem subagente: o disparo relê as unidades do zero.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: pastas, componentes e comandos. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada trabalho de imagem e de movimento neste repositório. |
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
| `conducao/entrevista-imagem` | Quando uma escolha visual é do agente, e quando ela muda sentido, identidade ou compromisso o bastante para ser do usuário? |
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
| `revisao/critica-quadro` | Como achar o defeito visual que explica por que um quadro não funciona, e com que evidência confirmá-lo? |

Movimento:

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-movimento` | Quando uma decisão de movimento é do agente, e quando ela muda intenção, sentido ou compromisso o bastante para ser do usuário? |
| `tempo/sincronia` | Quando cada coisa acontece em relação à narração? |
| `tempo/entradas` | O que faz um elemento aparecer, mudar ou sair de modo que se entenda de onde veio, o que mudou e em que estado terminou? |
| `atuacao/pausa-viva` | Quando nada novo acontece, o que faz o quadro continuar parecendo intencional e coerente com o estado da cena? |
| `atuacao/acao` | O que faz uma ação parecer intencional, legível e fisicamente coerente para aquele personagem ou criatura? |
| `camera/movimento` | Quando e como a câmera se move dentro de um plano? |
| `camera/transicoes` | O que continua, o que muda e quanto se sente a passagem entre dois planos? |
| `enfase/efeitos` | Quando um recurso gráfico ajuda o espectador a sentir ou entender uma propriedade da ação que o movimento sozinho não entrega? |
| `revisao/critica-movimento` | Como achar o defeito perceptível que explica por que um movimento não funciona, e com que evidência confirmá-lo? |

**Base das medidas.** Os números das unidades vêm de um estudo do Kurzgesagt feito em 2026-10-02: 12 vídeos de março de 2025 a setembro de 2026 (123 minutos, sem patrocínio), medidos quadro a quadro, com 332 planos lidos em três quadros cada. As faixas e as medianas estão em `CRITERIA`, em `src/critique/reference.ts`. Ao questionar ou atualizar uma medida, pese:

- **Proposta.** O que vem de um vídeo só entra na unidade marcado como proposta, e só vira regra depois de um plano nosso renderizado por ela e aceito pelo usuário. A proposta pode ser usada, com o resultado levado a ele como decisão; a crítica não reprova por ela. A regra existe porque a primeira leitura de um vídeo acerta a observação e erra o alcance: o acabamento das estrelas, aplicado a um bicho, deu um desenho carregado.
- É um canal só: as faixas dizem onde esse estilo vive, não o que é certo em geral.
- A leitura dos planos foi de um leitor só, em três quadros por plano: conta composições por baixo.
- A referência roda a 60 quadros por segundo: os tempos de movimento valem em segundos, não em quadros.
- Evidência de um vídeo só (gordura corporal, 9 minutos, lido em 2026-10-04), adotada por decisão do usuário onde contrariava as unidades: o cenário-âncora (`encenacao`), os estados do personagem e os olhos em tudo que age por dentro (`elenco`), o tema grave saturado e a cor que cresce em área (`cor`), as figuras que flutuam com halo (`composicao`), a onomatopeia e as etiquetas que se acumulam (`texto`, `dado`). O assunto sozinho no centro (`composicao`) foi conferido depois em 72 quadros de quatro dos 12 vídeos.
- Evidência de um trecho só (formigas, 27 segundos): o percurso (`encenacao`, `planos`).
- Evidência de um vídeo só (comparação de estrelas, 11 minutos, lido em 2026-10-06 em folhas de contato, recortes e tiras, sem medida do `pnpm critique`), adotada por decisão do usuário: o rosto de passagem (`elenco`), o plano de espetáculo (`planos`), a luz como material, a superfície viva e o acabamento, este lido em seis recortes em tamanho real ao lado de três nossos (`forma`, `pausa-viva`), a trama do fundo liso e o lugar na cor do assunto (`cenario`), o palco-régua (`dado`), a etiqueta em sublinhado e o teto de tamanho (`texto`). É um vídeo de espaço: o fundo escuro com assunto luminoso vem do tema, e os modos claros de `cor` continuam valendo.
- O piloto dessas regras (uma elefanta, 2026-10-06) e um segundo vídeo, com gente (a cientista e o tumor, 15 minutos, lido no mesmo dia), corrigiram o alcance delas: aro, textura, borda de luz e halo valem para o que emite luz e para o mundo por dentro, e num personagem leem como enfeite gerado. Daí os dois registros e a contenção (`forma`), e o fundo de personagem só em degradê (`cenario`). O mesmo piloto provou, em seis renders e quatro críticas, a construção antes do acabamento e a sombra desenhada (`forma`), a contenção conferida no roteiro inteiro e a pose conferida contra a ficha (`critica-quadro`), e tirou as partículas do ar do mundo (`pausa-viva`). Continuam como proposta, sem plano que as prove: o rosto de passagem, o plano de espetáculo e o lugar na cor do assunto, o palco-régua, a etiqueta em sublinhado com o teto de tamanho, e a superfície que corre.

## ORDEM DE INJEÇÃO

Injete o procedimento do trabalho, depois a unidade de condução e as unidades do passo em curso com as suas dependências. A tabela diz o que ler para cada trabalho; não é uma fila em que o passo de cima precisa estar fechado:

| Trabalho | Passo | Unidades | Entrega |
|---|---|---|---|
| Decupagem | Conceito visual | `entrevista-imagem`, `elenco`, `cor` | ficha visual: os compromissos do vídeo e o estado atual da solução |
| | Decupagem | `entrevista-imagem`, `encenacao`, `planos`, `dado`, `critica-quadro` (lentes de encenação e de decupagem) | os planos do trecho ou de cada cena, em `script.json` |
| Animatic | Desenho | `entrevista-imagem`, `forma`, `personagem`, `cenario` | os desenhos que o vídeo usa, e a folha de modelo de quem volta |
| | Quadro | `composicao`, `texto` | um quadro composto por plano |
| | Revisão | `critica-quadro` | os quadros e o diagnóstico deles; quando o trabalho é o conjunto, o que só o usuário julga, levado a ele |
| Animação | Partitura | `entrevista-movimento`, `sincronia`, `entradas` | o que acontece em cada plano, com que causa e com que intenção; os tempos entram depois do render |
| | Movimento | `pausa-viva`, `acao`, `movimento`, `transicoes`, `efeitos` | os planos em movimento |
| | Revisão | `critica-movimento` | o trecho ou o vídeo e o diagnóstico dele; quando o trabalho é o conjunto, o que só o usuário julga, levado a ele |

Para tarefas parciais (redesenhar um personagem, refazer os planos de uma cena, ajustar uma transição), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- Nenhum desenho e nenhum movimento é julgado pelo código: o desenho, só pela imagem renderizada; o movimento, só pela imagem em sequência.
- Nenhuma imagem afirma o que a base de fatos não sustenta.
- Toda mudança de estado tem uma causa visível na fala ou na cena.
- Nenhum movimento muda o que a composição diz (o foco, a relação, o tamanho do assunto no plano) sem confirmação.
- Um passo começa quando há o bastante para produzir a evidência dele. Se a evidência pede outra decisão num passo anterior, volta-se a ele: mudar o sentido ou a identidade é do usuário, e refinar não (`entrevista-imagem`, `entrevista-movimento`).

## CRITÉRIOS DE PARADA

Pare quando:

- a dúvida visual pedida estiver resolvida com a evidência que basta: uma cena, um plano ou um ajuste termina no trecho renderizado e conferido, sem revisão do vídeo inteiro nem aceite do conjunto;
- o pedido for o conjunto (o animatic ou a animação do vídeo inteiro), não restar defeito material e as decisões do conjunto que pertencem de fato ao usuário estiverem resolvidas;
- no escopo do pedido, não restar defeito bloqueante, nem relevante cujo conserto compense, e cada medida fora da faixa da referência tiver sido conferida no trecho: sem defeito visível, ela segue no relatório e não segura o trabalho;
- faltar o artefato que a dúvida exige (a frase, a narração gravada, a composição do plano): diga qual falta e de quem é, sem adivinhá-lo;
- uma rodada de crítica não resolver nenhum problema pendente: relate o que ficou em aberto;
- um desenho ou um movimento não ficar legível depois de três rodadas de render e correção: relate e proponha uma encenação ou uma ação mais simples;
- o pedido estiver no anti-escopo.
