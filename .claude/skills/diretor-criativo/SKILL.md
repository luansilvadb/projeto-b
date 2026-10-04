---
name: diretor-criativo
description: "Conhecimento de roteiro do canal, um ensaio explicativo animado no estilo Kurzgesagt: pesquisa e checagem, ângulo, voz, gancho, arco, fechamento, narração para o ouvido, analogias, humor, título e thumbnail. Use ao pesquisar um tema e ao escrever, revisar ou criticar um roteiro; as skills research e script o acionam."
---

## FUNÇÃO

Conduz a direção criativa e a escrita de roteiros de ensaio explicativo animado no estilo Kurzgesagt: narração em off sobre um tema complexo, com precisão factual, analogias de escala e indicações visuais por bloco.

## ESCOPO

- Pesquisa do tema, seleção de fontes e checagem factual.
- Definição de ângulo, tese, promessa e voz do projeto.
- Estrutura em blocos, gancho e fechamento.
- Escrita da narração, das analogias, do humor e das notas visuais.
- Revisão crítica e reescrita.
- Título e conceito de thumbnail.

**Entradas:** tema (obrigatório); idioma (padrão pt-BR); duração-alvo (padrão 10–14 minutos); material de referência, quando houver.

**Saídas:** roteiro em blocos com narração e nota visual, lista de fontes, e pares de título com conceito de thumbnail.

## ANTI-ESCOPO

- Decupagem em planos, direção de arte e design de personagem: pertencem ao workflow `diretor-de-arte`, que parte do roteiro em blocos e devolve a este workflow os pedidos de mudança de texto que a imagem fizer.
- Arte final de thumbnail.
- Locução, trilha, desenho de som, animação e edição.
- Descrição, tags, SEO, calendário e estratégia de canal.
- Outros formatos de roteiro (ficção, publicidade, vídeo curto, vlog).
- Imitação de bordões ou frases reconhecíveis de canais existentes.

## CONDUÇÃO

O workflow opera em modo entrevista, definido em `entrevista`: o agente resolve os fatos por conta própria e leva ao usuário apenas decisões, uma por vez e com recomendação. Nada fora do plano acordado é alterado sem confirmação explícita.

## ORGANIZAÇÃO

Categorias são apenas organizacionais e não entram na ordem de injeção. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando a etapa o pede.

| Categoria | Propósito |
|---|---|
| `conducao` | Como o agente interage com o usuário ao longo do trabalho. |
| `pesquisa` | De onde vêm os fatos e como são verificados. |
| `conceito` | O que o vídeo afirma e com que voz. |
| `estrutura` | Como o vídeo é organizado, aberto e encerrado. |
| `escrita` | Como o texto, as analogias, o humor, as notas visuais e o documento final são produzidos. |
| `revisao` | Como o rascunho é julgado e reescrito. |
| `embalagem` | Como a promessa do vídeo vira título e thumbnail. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista` | Como levar as decisões criativas ao usuário, uma por vez e com recomendação? |
| `pesquisa/levantamento` | Como pesquisar o tema e selecionar fontes confiáveis? |
| `pesquisa/checagem` | Como verificar cada afirmação factual e tratar incerteza e simplificação? |
| `conceito/angulo` | Qual é o ângulo, a tese e a promessa que justificam o vídeo? |
| `conceito/voz` | Como definir a voz do projeto a partir dos mecanismos do estilo? |
| `estrutura/arco` | Como organizar o vídeo em blocos, do gancho ao fechamento? |
| `estrutura/gancho` | Como abrir o vídeo para criar a pergunta que segura o espectador nos primeiros 30 segundos? |
| `estrutura/fechamento` | Como encerrar com a virada reflexiva que dá sentido ao tema, sem moralismo nem falso otimismo? |
| `escrita/explicacao` | Como fazer o texto explicar para quem assiste, em vez de relatar fatos? |
| `escrita/narracao` | Como escrever um texto feito para ser ouvido? |
| `escrita/analogias` | Como tornar escala e abstração compreensíveis e desenháveis? |
| `escrita/humor` | Quando e como usar humor seco e alívio cômico sem minar a credibilidade? |
| `escrita/indicacao-visual` | O que a nota visual de cada bloco deve dizer, e o que não deve? |
| `escrita/formato` | Qual é o formato do roteiro final e da lista de fontes? |
| `revisao/critica` | Com que critérios julgar o rascunho e decidir o que reescrever? |
| `embalagem/titulo-e-thumbnail` | Como derivar título e conceito de thumbnail da promessa do vídeo? |

## ORDEM DE INJEÇÃO

Injete este arquivo primeiro. Depois, apenas as unidades relevantes para a etapa em curso e suas dependências, nesta ordem:

1. `entrevista` — sempre presente
2. `levantamento`
3. `checagem`
4. `angulo`
5. `voz`
6. `arco`
7. `gancho`
8. `fechamento`
9. `explicacao`
10. `narracao`
11. `analogias`
12. `humor`
13. `indicacao-visual`
14. `formato`
15. `critica`
16. `titulo-e-thumbnail`

Etapas e unidades de cada uma:

| Etapa | Unidades |
|---|---|
| 1. Pesquisa | `levantamento`, `checagem` |
| 2. Conceito | `angulo`, `voz`, `titulo-e-thumbnail` (primeira versão) |
| 3. Estrutura | `arco`, `gancho`, `fechamento` |
| 4. Escrita | `explicacao`, `narracao`, `analogias`, `humor`, `indicacao-visual`, `formato` |
| 5. Revisão | `checagem`, `critica` |
| 6. Embalagem | `titulo-e-thumbnail` (versão final) |

Para tarefas parciais (revisar um roteiro existente, refazer só o gancho), injete apenas as unidades da etapa e suas dependências declaradas.

## BASE EMPÍRICA

Os números e padrões de estilo citados nas unidades vêm de uma análise do canal Kurzgesagt feita em 2026-10-02: metadados dos 251 vídeos, medição das legendas em inglês de 245 deles e leitura integral de 20 (os 10 mais vistos e os 10 mais recentes entre 8 e 16 minutos).

Ressalvas que valem para todas as unidades:

- As medidas de texto são de narração em inglês e servem como ordem de grandeza para o português.
- As legendas incluem leituras de patrocínio e loja, o que infla a contagem de palavras dos vídeos recentes.
- Visualizações favorecem vídeos antigos; nenhum padrão é tratado como prova de desempenho.
- As unidades registram mecanismos e medidas, nunca frases do canal.

## LIMITES

- Nenhuma afirmação factual sem fonte chega ao roteiro final.
- Uma etapa só começa com as decisões da etapa anterior aprovadas.
- Decisões aprovadas só mudam com confirmação do usuário.
- O workflow não executa nada do anti-escopo; se solicitado, sinaliza e devolve ao usuário.

## CRITÉRIOS DE PARADA

Pare quando:

- o roteiro final, a lista de fontes e o par título/thumbnail estiverem aprovados pelo usuário;
- a revisão não encontrar problema bloqueante nem relevante;
- uma rodada de revisão não resolver nenhum problema pendente: relate o que ficou em aberto;
- a pesquisa não sustentar nenhum ângulo honesto para o tema: relate e proponha redelimitar o tema;
- o pedido estiver no anti-escopo.
