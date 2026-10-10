# topic-selection Specification

## Purpose

Permite escolher o tema de um vídeo com evidência de procura, dentro do nicho do canal, e deixar essa escolha registrada na pasta do vídeo para quem pesquisa, escreve e publica.

## Requirements

### Requirement: Dono da escolha do tema
A skill `diretor-de-pauta` SHALL ser a dona da escolha do tema de um vídeo e entregar o tema, o termo buscado que o título vai carregar e a evidência de procura. Ela SHALL parar aí: recorte, tese e promessa são do `diretor-criativo`, e título, descrição e tags, do `diretor-publicacao`.

#### Scenario: Pedido de ideia para um vídeo novo
- **WHEN** o usuário pede um tema para o próximo vídeo
- **THEN** o trabalho é conduzido pela `diretor-de-pauta`
- **AND** a entrega é um tema com termo buscado e evidência de procura, sem tese nem roteiro

#### Scenario: Recorte anotado como argumento
- **WHEN** um recorte possível ajuda a defender um candidato
- **THEN** ele é anotado como argumento a favor do tema, marcado como ainda não pesquisado
- **AND** a decisão sobre o recorte continua com o `diretor-criativo`

### Requirement: Filtro do nicho
A skill SHALL reprovar, antes de qualquer medição, o tema que não cumpre as três condições do nicho: ser uma pergunta de curiosidade que um leigo digita, ter resposta em ciência de base firme e ser perene. Ela SHALL reprovar também o que cai numa das três exclusões: conselho, notícia ou moda do momento, e ciência disputada no centro do assunto.

#### Scenario: Tema de conselho
- **WHEN** quem busca o tema quer saber o que fazer (dieta, treino, suplemento, remédio)
- **THEN** o tema sai antes de ser medido, e o motivo é dito

#### Scenario: Tema de qualquer área da ciência
- **WHEN** um candidato cumpre as três condições e é de corpo, bichos, espaço, física ou Terra
- **THEN** ele segue para o levantamento, sem preferência por área

#### Scenario: Encaixe na linguagem visual
- **WHEN** um candidato cumpre o nicho mas é difícil de encenar com a trupe por dentro
- **THEN** ele não é reprovado por isso
- **AND** o encaixe visual só entra como desempate entre candidatos de procura parecida

### Requirement: Candidatos vêm do que o público digita
A skill SHALL levantar candidatos como termos de busca que o público já digita, e não como recortes escritos pelo agente. Ela SHALL partir também dos finalistas registrados nos `pauta.md` dos vídeos anteriores.

#### Scenario: Levantamento a partir de frases-semente
- **WHEN** o levantamento começa
- **THEN** os candidatos saem das sugestões de busca do YouTube em pt-BR para frases-semente de curiosidade
- **AND** cada candidato é guardado nas palavras em que apareceu

#### Scenario: Recorte sem termo
- **WHEN** uma ideia existe só como frase de recorte que ninguém digita
- **THEN** ela não é medida nessa forma
- **AND** procura-se o termo que o público usa para o mesmo assunto

#### Scenario: Finalistas de uma escolha anterior
- **WHEN** existe `pauta.md` de um vídeo anterior com finalistas que perderam
- **THEN** eles entram como candidatos, com as medições antigas e a data delas à vista

### Requirement: Um termo por medição
Cada medição de volume SHALL ser de um termo só. Um termo com volume no menor nível do painel e oferta forte SHALL ser medido de novo na versão curta antes de sair, para separar a frase que ninguém digita do assunto que ninguém procura.

#### Scenario: Vários termos numa busca
- **WHEN** vários termos foram medidos colados numa única busca
- **THEN** a medição é descartada e refeita com um termo por busca

#### Scenario: Volume mínimo com oferta forte
- **WHEN** a pergunta inteira dá o menor nível de volume e os vídeos que a respondem têm muitas views
- **THEN** a versão curta do assunto é medida antes de o candidato ser descartado

#### Scenario: Volume mínimo com oferta fraca
- **WHEN** a pergunta inteira dá o menor nível de volume e a oferta também é fraca
- **THEN** o candidato é descartado sem nova medição, com o motivo dito

### Requirement: Divisão do levantamento entre agente e usuário
O agente SHALL levantar sozinho os candidatos, a oferta (quem já responde o termo, com que views, tamanho de canal, idade e formato) e os pontos fora da curva, antes de pedir qualquer medição. O volume e a competição SHALL ser pedidos ao usuário só para os termos que passaram no nicho, em lista curta, com os campos a ler.

#### Scenario: Pedido de medição ao usuário
- **WHEN** o agente pede o volume ao usuário
- **THEN** a lista tem no máximo cinco termos, já filtrados pelo nicho
- **AND** diz que cada termo vai numa busca separada e quais campos do painel devolver

#### Scenario: Oferta que o agente não consegue ler
- **WHEN** a busca do YouTube não se deixa ler de forma confiável pelo agente
- **THEN** a oferta passa a ser pedida ao usuário, pelos campos de views do painel
- **AND** a limitação é dita, em vez de a oferta ser estimada

### Requirement: Campo inválido não entra na comparação
Um campo do painel com valor implausível SHALL ser descartado da comparação e apontado ao usuário, em vez de pesar na escolha.

#### Scenario: Média de assinantes impossível
- **WHEN** o painel devolve uma média de assinantes na casa das centenas de milhões
- **THEN** o campo é ignorado em todos os candidatos e o descarte é dito

### Requirement: Conferência leve da base
Antes de apresentar os finalistas, a skill SHALL conferir, para cada um, se o assunto tem resposta estabelecida ou é disputado no centro. A conferência SHALL ser leve: não abre `research.md` nem registra fonte por afirmação.

#### Scenario: Finalista de base firme
- **WHEN** o finalista tem resposta estabelecida em revisão ou livro-texto
- **THEN** a tabela de finalistas o marca como de base firme

#### Scenario: Finalista disputado no centro
- **WHEN** a resposta central do assunto é disputa ou quase só hipótese
- **THEN** o candidato sai pelo nicho, com o motivo dito

### Requirement: Comparação entre candidatos
Os candidatos SHALL ser comparados lado a lado, sem nota mínima além do corte de volume. A ordem de peso SHALL ser: views dos vídeos que já respondem o termo, ponto fora da curva de canal pequeno, volume e competição, brecha no formato, e por último os desempates.

#### Scenario: Nota menor com mais views
- **WHEN** um candidato tem nota de palavra-chave um pouco menor e views médias dos resultados muito maiores
- **THEN** a recomendação pode ficar com ele, com a razão dita

#### Scenario: Ordem de peso ainda não provada
- **WHEN** nenhum vídeo escolhido por essa ordem foi publicado
- **THEN** a ordem aparece na skill marcada como proposta

### Requirement: O usuário escolhe o tema
A skill SHALL apresentar de dois a quatro finalistas numa tabela, com a recomendação do agente e o motivo, e parar. O tema SHALL ser escolhido pelo usuário.

#### Scenario: Finalistas apresentados
- **WHEN** o levantamento e as medições terminam
- **THEN** o usuário recebe a tabela com as medições, a marca da base e a recomendação
- **AND** nenhum arquivo de vídeo é criado antes da resposta dele

#### Scenario: Descarte sem consulta
- **WHEN** um candidato reprova no nicho ou no corte de volume
- **THEN** o agente o descarta sem perguntar e diz que descartou

### Requirement: Registro em pauta.md
A escolha SHALL ficar em `src/videos/<vídeo>/pauta.md`, criado pela `diretor-de-pauta` junto com a pasta do vídeo, cujo nome em inglês ela escolhe. O arquivo SHALL guardar o tema, o termo buscado, as medições com data, o motivo da escolha e os finalistas que perderam com os números deles.

#### Scenario: Tema escolhido
- **WHEN** o usuário escolhe um finalista
- **THEN** a pasta do vídeo existe com um `pauta.md` que tem os cinco itens
- **AND** toda medição traz a data em que foi feita

#### Scenario: Vídeo anterior à skill
- **WHEN** um vídeo foi escolhido antes de a skill existir
- **THEN** ele fica sem `pauta.md`, e nenhum é escrito de trás para frente

#### Scenario: Título do vídeo
- **WHEN** o `diretor-publicacao` escreve o título público
- **THEN** o termo buscado de `pauta.md` é uma das entradas dele

### Requirement: Volta quando o tema não se sustenta
Quando a pesquisa de fatos mostrar que o tema inteiro não sustenta um vídeo honesto, a decisão SHALL voltar à `diretor-de-pauta`, que apresenta ao usuário o próximo finalista de `pauta.md`. A troca SHALL ser decidida pelo usuário e anotada no arquivo, com o motivo.

#### Scenario: Tema cai na pesquisa
- **WHEN** o `diretor-criativo` relata que nenhum recorte honesto se sustenta no tema
- **THEN** o usuário recebe o próximo finalista já medido
- **AND** `pauta.md` passa a dizer por que o primeiro caiu

#### Scenario: Recorte cai, tema fica
- **WHEN** a pesquisa derruba um recorte mas o tema ainda rende outro
- **THEN** nada volta à `diretor-de-pauta`, e o `diretor-criativo` redelimita dentro do tema
