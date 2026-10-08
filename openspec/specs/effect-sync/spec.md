# effect-sync Specification

## Purpose

Garante que os efeitos sonoros de um vídeo falem com a imagem: cada um pertence a um acontecimento que se vê, começa no instante dele e volta quando ele volta.

## Requirements

### Requirement: Efeito no instante do acontecimento
Um efeito sonoro SHALL começar no quadro em que o acontecimento dele se dá na imagem: o contato, no contato; o movimento, no começo do movimento. Ele SHALL NOT começar antes do acontecimento, e o atraso SHALL ser de no máximo dois quadros.

#### Scenario: O quadro do efeito mostra a ação
- **WHEN** se extrai do render o quadro em que um efeito começa e o quadro anterior
- **THEN** a ação do efeito está começando ou acabou de começar nesse quadro, e ainda não tinha começado dois quadros antes

#### Scenario: A moeda de Gardner
- **WHEN** a moeda do cara ou coroa cai, em `awake-record`
- **THEN** o som da moeda começa no quadro em que ela bate, e não na palavra da narração

#### Scenario: A fala muda de tempo
- **WHEN** uma frase da cena é regravada e a ação muda de quadro
- **THEN** o efeito continua começando no quadro da ação

### Requirement: Ação que se repete, som que se repete
Quando um acontecimento com efeito se repete na imagem, cada repetição SHALL ter o som dela, do mesmo uso, no instante dela.

#### Scenario: Os jatos da água-viva
- **WHEN** a água-viva leva os três jatos de água, em `jellyfish-debt`
- **THEN** se ouvem três jatos, cada um começando quando o jato entra no tanque

#### Scenario: O mesmo uso, o mesmo som
- **WHEN** o carimbo bate em `sleep-debt` e em `biggest-mistake`
- **THEN** as duas batidas usam o mesmo som do catálogo

### Requirement: Acontecimento físico tem consequência sonora
Toda ação da partitura com consequência física que se percebe (um impacto, um objeto ou um corpo que age com força, uma mudança de estado do cenário, uma onomatopeia na tela) SHALL ter um efeito, ou o motivo de ficar sem som registrado no mapa de som do vídeo.

#### Scenario: O inventário cobre a partitura
- **WHEN** se compara a partitura do `why-we-sleep` com o mapa de som
- **THEN** cada ação desses tipos está no mapa, com o efeito dela ou com o motivo de não ter

#### Scenario: A onomatopeia na tela
- **WHEN** "PSSST", "SNIP", "PLOFT" ou "TRIIIM" aparece na tela
- **THEN** o som correspondente toca no quadro em que a palavra aparece

#### Scenario: Nenhum efeito sem dono
- **WHEN** se lê a lista de efeitos do vídeo
- **THEN** cada efeito aponta para uma ação que a imagem mostra, e nenhum marca um corte, um texto que só entra ou um movimento de câmera

### Requirement: Som com o tamanho da ação
O som de um uso SHALL ser ouvido pelo usuário como a ação que ele acompanha antes de entrar no catálogo. Um uso sem som aprovado SHALL ficar pendente, e SHALL NOT ser substituído por um som de outro acontecimento.

#### Scenario: O jato não é a queda na água
- **WHEN** o jato de água entra no tanque
- **THEN** o som é o de um jato, e não o da queda na água que o catálogo já tinha

#### Scenario: Uso sem som aprovado
- **WHEN** nenhum candidato soa como a ação depois de buscas diferentes
- **THEN** o uso fica listado como pendente no mapa de som e a ação fica sem efeito
