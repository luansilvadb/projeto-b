# Spec Delta

## ADDED Requirements

### Requirement: Rosto da pessoa guiado pela referência visual

O rosto detalhado da pessoa do `why-we-sleep` SHALL seguir a referência visual escolhida pelo usuário: olhos grandes com brilho, pálpebras suaves, sobrancelhas expressivas, nariz discreto e boca pequena. As bochechas SHALL manter o tom natural da pele, sem rubor decorativo permanente. A figura SHALL conservar sua cabeça, seu cabelo, seu topete e suas cores.

#### Scenario: Rosto sonolento comparado à referência
- **WHEN** se compara um recorte renderizado da pessoa sonolenta com a imagem de referência registrada nesta mudança
- **THEN** a relação entre olhos, pálpebras, sobrancelhas, nariz e boca se aproxima da referência, com uma expressão sonolenta e acolhedora
- **AND** as bochechas do rosto-base conservam o tom natural da pele, sem rubor permanente

#### Scenario: Pessoa e Gardner conservam sua identidade
- **WHEN** se comparam quadros da pessoa e de Gardner com o rosto refinado
- **THEN** ambos usam a mesma construção facial, conservando suas próprias cores, roupa, cabelo e papel no vídeo

### Requirement: Sombra sob a franja específica por personagem

A sombra sob a franja SHALL permanecer no personagem principal e SHALL ficar ausente no pesquisador de cabelos grisalhos.

#### Scenario: Sombra mantida no personagem principal
- **WHEN** o personagem principal aparece com a franja visível
- **THEN** a sombra permanece visível na testa

#### Scenario: Pesquisador grisalho sem sombra na testa
- **WHEN** o pesquisador de cabelos grisalhos aparece com óculos
- **THEN** a testa fica sem a faixa de sombra sob a franja

### Requirement: Expressões preservadas no rosto refinado

O rosto refinado SHALL continuar distinguindo os estados neutro, curioso, dúvida, espanto, sonolento, bocejo, sono e leitura usados no vídeo. A piscada e o olhar direcionado SHALL atuar sobre a mesma construção facial, sem trocar o desenho ou impor a expressão sonolenta aos demais estados.

#### Scenario: Conferência dos estados em tamanho de cena
- **WHEN** se abrem quadros dos estados faciais em close e no tamanho em que aparecem nas cenas
- **THEN** olhos, sobrancelhas e boca tornam os estados distinguíveis e preservam a intenção de cada ação

#### Scenario: Piscada durante o olhar direcionado
- **WHEN** Gardner olha para um objeto e pisca durante um trecho renderizado
- **THEN** as pálpebras fecham e reabrem os mesmos olhos, sem reaparecer o desenho anterior, vazamento de pupila ou salto de posição

### Requirement: Marcas faciais acompanham o rosto refinado

As sombras sob os olhos da pessoa e de Gardner SHALL ser removidas de todas as aparições. O cansaço SHALL continuar legível pelas pálpebras e pela postura. Rubor de estado, boca de irritação e óculos SHALL permanecer alinhados ao rosto refinado quando houver inclinação, piscada ou mudança de expressão, sem duplicar olhos ou boca nem deixar visível o desenho que substituem.

#### Scenario: Sombras sob os olhos removidas em todas as cenas
- **WHEN** a pessoa ou Gardner aparece sonolento em qualquer cena
- **THEN** não há sombras sob os olhos; o cansaço é comunicado pelas pálpebras e pela postura, tanto na mesa do café quanto nas demais aparições

#### Scenario: Irritação e rubor de estado
- **WHEN** Gardner aparece irritado ou com o rosto marcado pelos sintomas do trecho
- **THEN** a boca e o rubor correspondem ao estado encenado, sem uma segunda boca ou manchas cobrindo indevidamente os olhos e o nariz

#### Scenario: Óculos e rosto simplificado
- **WHEN** se abrem quadros do pesquisador com óculos e dos figurantes com rosto simplificado
- **THEN** os óculos permanecem alinhados aos olhos e os figurantes conservam sua simplificação, sem receber o rosto detalhado do protagonista
