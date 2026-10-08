# Spec Delta

## Purpose

Garante que um personagem ou um lugar que volta num vídeo seja reconhecido como o mesmo em todas as cenas: uma construção só, sem versões alternativas de desenho convivendo no mesmo vídeo.

## ADDED Requirements

### Requirement: Construção única por personagem
Um personagem que aparece em mais de uma cena de um vídeo SHALL ter a mesma construção em todas elas: as mesmas proporções, a mesma silhueta e as mesmas partes. Pose, expressão, roupa e tamanho no quadro variam com a cena; a construção não.

#### Scenario: A pessoa no começo e no fim do vídeo
- **WHEN** se comparam os quadros da pessoa em `third-of-life` e em `one-of-them`, no render do `why-we-sleep`
- **THEN** o tronco, o pescoço, o quadril, as pernas e os sapatos têm a mesma construção nos dois

#### Scenario: Figurantes feitos da construção da pessoa
- **WHEN** se abrem os quadros de Gardner, de Rechtschaffen, da pesquisadora, da lojista e dos fregueses
- **THEN** todos têm a construção da pessoa, e diferem dela só por cor, cabelo, roupa e acessório

#### Scenario: A elefanta sozinha e na manada
- **WHEN** se comparam a elefanta de `maybe-brain` e as da manada de `elephants`
- **THEN** as duas têm a mesma construção

### Requirement: Cenário único por lugar
Um lugar que aparece em mais de uma cena de um vídeo SHALL ter o mesmo cenário em todas elas: as mesmas camadas e o mesmo desenho de cada elemento. A hora do dia muda a luz e as cores do cenário, e não a construção dele.

#### Scenario: A savana do antílope e a das elefantas
- **WHEN** se comparam um quadro de `night-falls` e um de `elephants`
- **THEN** o céu, as colinas, as acácias, o chão e a vegetação são do mesmo desenho, sob a luz da hora de cada cena

#### Scenario: A luz muda dentro de um plano
- **WHEN** o dia vira noite dentro de um plano da savana, como em `elephant-awake`
- **THEN** as cores passam de um horário ao outro sem troca de desenho num quadro

### Requirement: Sem variante de desenho por cena
Uma cena SHALL NOT escolher entre versões de um mesmo desenho. Um personagem ou um cenário tem uma versão em uso; a versão anterior fica no histórico do repositório, e não ao lado da atual.

#### Scenario: Nenhuma cena pede um acabamento
- **WHEN** se procura no código do vídeo e dos desenhos uma opção que troque a construção de um desenho
- **THEN** não há nenhuma: os desenhos da pessoa, da elefanta, do antílope e da savana não aceitam essa escolha

#### Scenario: A folha de modelo mostra o desenho em uso
- **WHEN** se abre no Studio a folha de modelo de um personagem
- **THEN** ela mostra o desenho que as cenas usam, sem uma fileira da versão anterior

### Requirement: A adoção preserva o que o plano diz
A troca de um desenho pela construção única SHALL manter, em cada plano, o enquadramento, a ação e o que ela aponta ou segura, as deixas da narração e as cores já aprovadas do personagem.

#### Scenario: Um gesto que aponta para algo
- **WHEN** um plano em que a pessoa aponta, segura ou encosta em algo é renderizado com a construção única
- **THEN** a mão termina no mesmo alvo de antes, e nenhum membro atravessa o tronco ou se solta dele

#### Scenario: Os tempos não mudam
- **WHEN** uma cena adotada é renderizada
- **THEN** a duração dela e os instantes de cada entrada são os mesmos de antes da adoção
