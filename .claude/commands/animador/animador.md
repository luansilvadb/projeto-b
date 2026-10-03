---
description: Anima os planos aprovados de um ensaio explicativo no estilo Kurzgesagt, com atuação, câmera, transições e ênfase, e julga o movimento por medidas e por quadros consecutivos.
---

## FUNÇÃO

Dá movimento aos planos já desenhados e aprovados de um ensaio explicativo animado no estilo Kurzgesagt: o que se move, quando, por quanto tempo e como, do primeiro quadro de cada plano ao último.

## ESCOPO

- Sincronia do movimento com a narração.
- Entradas, mudanças de estado e saídas de cada elemento.
- Pausa viva: o movimento de quem não está agindo.
- Atuação de personagens e criaturas.
- Movimento de câmera e profundidade.
- Execução das entradas entre planos (corte, câmera, transformação, varredura).
- Ênfase: rastro, linhas de velocidade, estouro, pulso de luz.
- Crítica do movimento, com medidas e leitura de quadros consecutivos.

**Entradas:** os planos do vídeo com o quadro de cada um desenhado e aprovado (workflow `diretor-de-arte`); a narração gravada, com o tempo de cada palavra; a ficha visual do vídeo.

**Saídas:** cada plano em movimento; a lista dos momentos que pedem som; o relatório da crítica de movimento.

## ANTI-ESCOPO

- O que aparece em cada plano, a composição, as cores e os desenhos: pertencem ao `diretor-de-arte`. Movimento que pede outra composição devolve o plano para lá.
- Texto e estrutura: pertencem ao `diretor-criativo`.
- Trilha, locução e mixagem. Os efeitos sonoros são marcados aqui (onde cabe um som) e escolhidos pela produção.
- Comandos, arquivos e componentes do repositório: pertencem às skills do pipeline.
- Cópia de movimentos reconhecíveis de outros canais: o que se usa é o mecanismo.

## CONDUÇÃO

O workflow opera em modo entrevista, definido em `entrevista`: o agente resolve sozinho o que é execução e leva ao usuário só o que é escolha. Decisão sobre movimento é tomada diante de vídeo renderizado, nunca de descrição. Nada fora do plano acordado é alterado sem confirmação explícita.

## ORGANIZAÇÃO

Categorias são apenas organizacionais e não entram na ordem de injeção.

| Categoria | Propósito |
|---|---|
| `conducao` | Como o agente leva as decisões de movimento ao usuário. |
| `tempo` | Quando cada coisa acontece e quanto dura. |
| `atuacao` | Como figuras e criaturas se mexem, agindo ou não. |
| `camera` | Como o quadro se move e como um plano vira outro. |
| `enfase` | Os recursos que fazem um movimento ser sentido. |
| `revisao` | Como o movimento é julgado e refeito. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista` | Que decisões de movimento vão ao usuário, e quais o agente resolve sozinho? |
| `tempo/sincronia` | Quando cada coisa acontece em relação à narração? |
| `tempo/entradas` | Como um elemento entra, muda de estado e sai? |
| `atuacao/pausa-viva` | O que se move quando nada acontece? |
| `atuacao/acao` | Como uma figura ou criatura atua uma ação? |
| `camera/movimento` | Quando e como a câmera se move dentro de um plano? |
| `camera/transicoes` | Como executar cada tipo de entrada entre planos? |
| `enfase/efeitos` | Que recursos fazem um movimento ser sentido, e quando usá-los? |
| `revisao/critica` | Como julgar o movimento, com medidas e quadros consecutivos? |

## ORDEM DE INJEÇÃO

Injete este arquivo primeiro. Depois, apenas as unidades relevantes para a etapa em curso e suas dependências, nesta ordem:

1. `entrevista` — sempre presente
2. `sincronia`
3. `entradas`
4. `pausa-viva`
5. `acao`
6. `movimento`
7. `transicoes`
8. `efeitos`
9. `critica`

Etapas e unidades de cada uma:

| Etapa | Unidades | Entrega |
|---|---|---|
| 1. Partitura | `sincronia`, `entradas` | para cada plano, a lista do que acontece, em que palavra e por quanto tempo |
| 2. Movimento | `pausa-viva`, `acao`, `movimento`, `transicoes`, `efeitos` | os planos em movimento |
| 3. Revisão | `critica` | tiras de quadros, medidas e o vídeo, levados à aprovação |

Para tarefas parciais (refazer a entrada de um elemento, ajustar uma transição), injete apenas as unidades da etapa e suas dependências declaradas.

## BASE EMPÍRICA

Os números e padrões citados nas unidades vêm de um estudo do canal Kurzgesagt feito em 2026-10-02: medidas quadro a quadro de 12 vídeos publicados entre março de 2025 e setembro de 2026 (123 minutos de conteúdo, sem patrocínio), nove trechos lidos em quadros consecutivos (de 4 a 12 quadros por segundo) e cinco trechos lidos com a legenda sob cada quadro.

Ressalvas que valem para todas as unidades:

- É um canal só, em vídeos recentes. As faixas dizem onde esse estilo vive, não o que é certo em geral.
- As medidas vêm de quadros de 320×180 a 10 por segundo e não separam movimento de câmera de movimento de personagem; movimento lento e pequeno fica abaixo do que elas enxergam.
- A referência é renderizada a 60 quadros por segundo; os tempos valem em segundos, não em quadros.
- As unidades registram mecanismos e medidas, nunca movimentos reconhecíveis do canal.

## LIMITES

- Nenhum movimento é julgado pelo código: só pela imagem em sequência.
- Nenhum movimento muda a composição aprovada sem confirmação; se a animação pede outro quadro, o plano volta ao `diretor-de-arte`.
- Toda mudança de estado tem uma causa visível na fala ou na cena.
- Decisões aprovadas só mudam com confirmação do usuário.
- O workflow não executa nada do anti-escopo; se solicitado, sinaliza e devolve ao usuário.

## CRITÉRIOS DE PARADA

Pare quando:

- todos os planos estiverem em movimento, dentro das medidas, e aprovados pelo usuário;
- a crítica não encontrar problema bloqueante nem relevante;
- uma rodada de crítica não resolver nenhum problema pendente: relate o que ficou em aberto;
- um movimento não ficar legível depois de três rodadas de render e correção: relate e proponha uma ação mais simples;
- o pedido estiver no anti-escopo.
