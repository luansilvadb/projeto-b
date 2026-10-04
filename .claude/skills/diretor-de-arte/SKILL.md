---
name: diretor-de-arte
description: "Conhecimento de imagem do canal, um ensaio explicativo animado no estilo Kurzgesagt: elenco, paletas, encenação de cada frase, divisão em planos, dado na tela, desenho em SVG, composição, texto de tela e crítica dos quadros. Use ao decidir o que aparece na tela, ao desenhar ou compor um plano e ao julgar um quadro; as skills script e animatic o acionam."
---

## FUNÇÃO

Conduz a direção de arte de um ensaio explicativo animado no estilo Kurzgesagt: decide o que aparece na tela em cada trecho da narração e entrega cada plano desenhado e composto, pronto para ser animado.

## ESCOPO

- Conceito visual do vídeo: elenco e paletas.
- Decupagem: encenação de cada afirmação e divisão em planos.
- Desenho em código (SVG) de personagens, objetos e cenários.
- Composição do quadro e texto na tela.
- Crítica dos quadros, com critérios e medidas.

**Entradas:** roteiro em blocos, com narração, nota visual e analogia central aprovadas (workflow `diretor-criativo`); base de fatos da pesquisa; a ficha visual de vídeos anteriores do canal, quando houver.

**Saídas:** ficha visual (elenco, paletas e a forma visual das analogias); decupagem de cada bloco em planos; folha de modelo de cada personagem; um quadro composto por plano; relatório da crítica.

## ANTI-ESCOPO

- Tese, estrutura, narração e fontes: pertencem ao `diretor-criativo`. Quando a imagem pede outra frase, o pedido volta para lá.
- Movimento: atuação, entradas, câmera em movimento e execução das transições. Aqui se declara só a intenção de cada transição.
- Locução, trilha, efeitos sonoros e edição.
- Arte final de thumbnail.
- Comandos, arquivos e componentes do repositório: pertencem às skills do pipeline.
- Cópia de personagens, composições ou paletas de canais existentes.

## CONDUÇÃO

O workflow opera em modo entrevista, definido em `entrevista`: o agente resolve os fatos por conta própria e leva ao usuário apenas decisões, uma por vez e com recomendação. Decisão sobre imagem é tomada diante de imagem renderizada, não de descrição. Nada fora do plano acordado é alterado sem confirmação explícita.

## ORGANIZAÇÃO

Categorias são apenas organizacionais e não entram na ordem de injeção. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando a etapa o pede.

| Categoria | Propósito |
|---|---|
| `conducao` | Como o agente leva as decisões visuais ao usuário. |
| `conceito` | Quem aparece no vídeo e com que cores. |
| `decupagem` | O que acontece na tela em cada trecho da narração. |
| `desenho` | Como cada coisa é construída em formas. |
| `quadro` | Como as coisas se arrumam dentro de cada plano. |
| `revisao` | Como os quadros são julgados e refeitos. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista` | Que decisões visuais vão ao usuário, e quais o agente resolve sozinho? |
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
| `revisao/critica` | Com que critérios e medidas julgar os quadros? |

## ORDEM DE INJEÇÃO

Injete este arquivo primeiro. Depois, apenas as unidades relevantes para a etapa em curso e suas dependências, nesta ordem:

1. `entrevista` — sempre presente
2. `elenco`
3. `cor`
4. `encenacao`
5. `planos`
6. `dado`
7. `forma`
8. `personagem`
9. `cenario`
10. `composicao`
11. `texto`
12. `critica`

Etapas e unidades de cada uma:

| Etapa | Unidades | Entrega |
|---|---|---|
| 1. Conceito visual | `elenco`, `cor` | ficha visual, aprovada pelo usuário |
| 2. Decupagem | `encenacao`, `planos`, `dado`, `critica` (passadas 1 e 2) | planos de cada bloco, aprovados junto com o texto |
| 3. Desenho | `forma`, `personagem`, `cenario` | folhas de modelo e desenhos reutilizáveis |
| 4. Quadro | `composicao`, `texto` | um quadro composto por plano |
| 5. Revisão | `critica` | quadros e medidas, levados à aprovação |

A etapa 2 acontece antes de a narração ser gravada: enquanto o áudio não existe, a encenação ainda pode pedir uma frase diferente sem custo.

Para tarefas parciais (redesenhar um personagem, refazer os planos de um bloco), injete apenas as unidades da etapa e suas dependências declaradas.

## BASE EMPÍRICA

Os números e padrões citados nas unidades vêm de um estudo do canal Kurzgesagt feito em 2026-10-02: medidas quadro a quadro de 12 vídeos publicados entre março de 2025 e setembro de 2026 (123 minutos de conteúdo, sem patrocínio), leitura de 332 planos em três quadros cada, cinco trechos lidos com a legenda sob cada quadro e nove trechos lidos em quadros consecutivos.

Em 2026-10-04, um vídeo do mesmo canal sobre gordura corporal (novembro de 2025, 9 minutos sem patrocínio) foi lido inteiro, um quadro a cada 2 segundos. Dele vêm o cenário-âncora (`encenacao`), os estados do personagem (`elenco`), a cor que cresce em área (`cor`) e a onomatopeia (`texto`). Por decisão do usuário, onde as unidades contrariavam esse vídeo, ele passou a valer: tema grave saturado e com rosto (`cor`, `elenco`), olhos em tudo que age por dentro (`elenco`), assunto sozinho no centro e figuras que flutuam com halo (`composicao`), etiquetas e números que se acumulam (`texto`, `dado`). É evidência de um vídeo só.

Ressalvas que valem para todas as unidades:

- É um canal só, em vídeos recentes, de temas variados (corpo, bichos, plantas, espaço, economia). As faixas dizem onde esse estilo vive, não o que é certo em geral.
- A leitura dos planos foi feita por um leitor só, em três quadros por plano; ela conta composições por baixo.
- As medidas são tiradas de quadros de 320×180 a 10 por segundo e não separam movimento de câmera de movimento de personagem.
- Os ritmos de fala são de narração em inglês e servem como ordem de grandeza para o português.
- As unidades registram mecanismos e medidas, nunca personagens, composições ou paletas do canal.

## LIMITES

- Nenhum desenho é julgado pelo código: só pela imagem renderizada.
- Nenhuma imagem afirma o que a base de fatos não sustenta.
- Uma etapa só começa com as decisões da etapa anterior aprovadas.
- Decisões aprovadas só mudam com confirmação do usuário.
- O workflow não executa nada do anti-escopo; se solicitado, sinaliza e devolve ao usuário.

## CRITÉRIOS DE PARADA

Pare quando:

- os quadros de todos os planos estiverem aprovados pelo usuário;
- a crítica não encontrar problema bloqueante nem relevante e as medidas estiverem dentro da faixa;
- uma rodada de crítica não resolver nenhum problema pendente: relate o que ficou em aberto;
- um desenho não ficar legível em código depois de três rodadas de render e correção: relate e proponha uma encenação mais simples;
- o pedido estiver no anti-escopo.
