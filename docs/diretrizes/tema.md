# Escolha do tema (modo `canal`)

A escolha do tema de um vídeo do canal parte de evidência de procura, dentro do nicho, e fica registrada na pasta do vídeo. O procedimento fica em `.agents/skills/diretor-de-pauta/`; aqui estão os critérios.

## Dono e limite

A skill `diretor-de-pauta` é a dona da escolha. Ela entrega o tema, o termo buscado que o título vai carregar e a evidência de procura, e para aí: recorte, tese e promessa são do `diretor-criativo`; título, descrição e tags, do `diretor-publicacao`. Um recorte que ajude a defender um candidato é anotado como argumento, marcado como ainda não pesquisado.

## Filtro do nicho

Antes de qualquer medição, reprova o tema que não cumpre as três condições: ser uma pergunta de curiosidade que um leigo digita, ter resposta em ciência de base firme e ser perene. Reprova também as três exclusões: conselho (dieta, treino, suplemento, remédio), notícia ou moda do momento, e ciência disputada no centro do assunto. O motivo é dito.

Qualquer área serve (corpo, bichos, espaço, física, Terra), sem preferência. Dificuldade de encenar com a trupe não reprova; o encaixe visual só desempata candidatos de procura parecida.

## Candidatos

- Saem do que o público digita: as sugestões de busca do YouTube em pt-BR para frases-semente de curiosidade, guardadas nas palavras em que apareceram, e os finalistas dos `pauta.md` dos vídeos anteriores (com as medições antigas e a data à vista).
- Uma ideia que existe só como frase de recorte, que ninguém digita, não é medida assim: procura-se o termo que o público usa para o mesmo assunto.

## Medição

- Um termo por medição. Vários termos colados numa busca: a medição é descartada e refeita.
- Volume no menor nível do painel com oferta forte (vídeos que respondem o termo com muitas views): mede-se a versão curta do assunto antes de descartar. Com oferta também fraca, descarta-se sem nova medição, com o motivo dito.
- O agente levanta sozinho candidatos, oferta (quem responde, com que views, tamanho de canal, idade e formato) e pontos fora da curva. Volume e competição são pedidos ao usuário só para os termos que passaram no nicho: no máximo cinco, cada um numa busca separada, com os campos do painel a devolver.
- Se a busca do YouTube não é legível de forma confiável pelo agente, a oferta é pedida ao usuário e a limitação é dita, sem estimar.
- Campo do painel com valor implausível (por exemplo, média de assinantes na casa das centenas de milhões) é descartado em todos os candidatos e o descarte é dito.

## Conferência da base e comparação

- Antes de apresentar finalistas, uma conferência leve: o assunto tem resposta estabelecida (revisão ou livro-texto) ou é disputado no centro? Não abre `research.md` nem registra fonte por afirmação. Disputado no centro sai pelo nicho.
- Comparação lado a lado, sem nota mínima além do corte de volume. Ordem de peso (proposta, ainda não provada por um vídeo publicado): views dos vídeos que já respondem o termo, ponto fora da curva de canal pequeno, volume e competição, brecha no formato, desempates. Nota de palavra-chave menor com views muito maiores pode ganhar, com a razão dita.

## Quem escolhe e onde fica

- De dois a quatro finalistas, em tabela, com medições, marca da base e recomendação com o motivo. O agente para; o usuário escolhe. Nenhum arquivo de vídeo é criado antes da resposta. Descartes por nicho ou corte de volume são feitos sem perguntar, dizendo que foram feitos.
- A escolha vai para `src/videos/<vídeo>/pauta.md`, criado junto com a pasta do vídeo (nome em inglês, escolhido pela skill), com o tema, o termo buscado, as medições com data, o motivo e os finalistas que perderam com os números deles. Um vídeo anterior à skill fica sem `pauta.md`; nenhum é escrito de trás para frente. O termo buscado é entrada do título público.

## Quando o tema não se sustenta

Se a pesquisa mostra que nenhum recorte honesto se sustenta no tema, a decisão volta à `diretor-de-pauta`, que apresenta o próximo finalista de `pauta.md`; a troca é do usuário e fica anotada, com o motivo. Se só um recorte cai e o tema rende outro, nada volta: o `diretor-criativo` redelimita.
