---
name: diretor-de-arte
description: "Direção de imagem e movimento para vídeos: elenco, paleta, planos, desenho, composição e animação. Use para criar ou ajustar cenas, storyboards e animatics, animar movimentos ou revisar quadros e renders."
---

## FUNÇÃO

Dono do que aparece e se move em cada trecho: decide a encenação, compõe e anima os planos. Trabalha com o texto e a narração disponíveis para responder à dúvida visual atual.

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

Escolha o procedimento pela dúvida atual. Em tarefa localizada, leia só as seções pertinentes e as unidades que respondem ao problema, com dependências diretas; use o fluxo completo para criar ou revisar o conjunto.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Decupagem | há texto, de um trecho ou do roteiro, que precisa de imagem: prova visual de uma incerteza; `shots` de todas as cenas, que o `pnpm narrate` exige; refazer elenco, paleta ou planos | `etapas/decupagem.md` |
| Animatic: desenho e quadro | há `shots` para o trecho e, para a composição montar, a narração gravada; criar a pasta e as cenas de um vídeo; storyboard, desenho ou composição | `etapas/animatic.md` |
| Animação: movimento | a composição do trecho está estável o bastante para testar a hipótese de movimento, e existe o tempo real da fala de que ele depende; animar, ajustar tempo, transição ou câmera | `etapas/animacao.md` |

Movimento que pede outra composição, e não só um refino dela, devolve o plano ao passo Quadro.

## CONDUÇÃO

Ajustes de execução ficam com o agente. Sinalize contradições com decisões do usuário, fatos ou limites medidos. Confirme mudanças materiais de sentido, identidade ou compromisso, registradas em `art.md` e `score.md`; leia a entrevista da camada quando uma alternativa válida as puder mudar.

## SUBAGENTES

Acione `ilustrador`, `motion-designer` e os críticos só nos casos definidos pelos procedimentos. Eles entregam evidência; esta skill decide e fala com o usuário. Dê a cada subagente uma lista de arquivos; paralelize listas sem interseção. Altere em série `src/components/`, `src/design/tokens.ts`, `palette.ts`, `index.tsx` e `src/Root.tsx`.

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
| `conducao/entrevista-imagem` | Que escolha visual cabe ao usuário? |
| `conceito/elenco` | Quem aparece, e quem ganha rosto? |
| `conceito/cor` | Que paletas o vídeo usa? |
| `decupagem/encenacao` | Como a afirmação acontece na tela? |
| `decupagem/planos` | Onde dividir a cena em planos? |
| `decupagem/dado` | Como mostrar número, escala e comparação? |
| `desenho/forma` | Como construir formas chapadas? |
| `desenho/personagem` | Como desenhar e posar personagens? |
| `desenho/cenario` | Como mostrar lugar e profundidade? |
| `quadro/composicao` | Como o olho acha o assunto? |
| `quadro/texto` | Que texto entra, e a que se prende? |
| `revisao/critica-quadro` | Que defeito visual há, e qual evidência o confirma? |

Movimento:

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-movimento` | Que decisão de movimento cabe ao usuário? |
| `tempo/sincronia` | Quando cada coisa acontece? |
| `tempo/entradas` | Como algo aparece, muda ou sai? |
| `atuacao/pausa-viva` | O que mantém a pausa coerente? |
| `atuacao/acao` | Como a ação fica legível e coerente? |
| `camera/movimento` | Quando e como mover a câmera? |
| `camera/transicoes` | O que liga dois planos? |
| `enfase/efeitos` | Que propriedade do movimento pede ênfase? |
| `revisao/critica-movimento` | Que defeito de movimento há, e qual evidência o confirma? |

**Referências e propostas.** As medidas são sensores, não metas. Evidência de um vídeo só fica marcada como `proposta` na unidade: pode orientar um teste, mas não reprova. Vira regra se um plano feito com ela for aceito de primeira; se for recusado, sai. Contexto e alcance ficam junto da regra.

## ORDEM DE INJEÇÃO

Para um ajuste localizado, leia a seção pertinente do procedimento e só a unidade que responde ao defeito, com dependências diretas. Leia `entrevista-imagem` ou `entrevista-movimento` apenas se a alternativa puder mudar compromisso do usuário. A tabela cobre o trabalho completo:

| Trabalho | Passo | Unidades | Entrega |
|---|---|---|---|
| Decupagem | Conceito visual | `elenco`, `cor` | ficha visual: os compromissos do vídeo e o estado atual da solução |
| | Decupagem | `encenacao`, `planos`, `dado`, `critica-quadro` (lentes de encenação e decupagem) | os planos do trecho ou de cada cena, em `script.json` |
| Animatic | Desenho | `forma`, `personagem`, `cenario` | os desenhos que o vídeo usa, e a folha de modelo de quem volta |
| | Quadro | `composicao`, `texto` | um quadro composto por plano |
| | Revisão | `critica-quadro` | os quadros e o diagnóstico deles; quando o trabalho é o conjunto, o que só o usuário julga, levado a ele |
| Animação | Partitura | `sincronia`, `entradas` | o que acontece em cada plano, com que causa e com que intenção; os tempos entram depois do render |
| | Movimento | `pausa-viva`, `acao`, `movimento`, `transicoes`, `efeitos` | os planos em movimento |
| | Revisão | `critica-movimento` | o trecho ou o vídeo e o diagnóstico dele; quando o trabalho é o conjunto, o que só o usuário julga, levado a ele |

Em tarefas parciais, não injete o pacote inteiro do passo. Leia o princípio comum e só a lente ou seção da unidade que cobre o defeito; use a unidade inteira quando o pedido percorrer sua pergunta central toda.

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
