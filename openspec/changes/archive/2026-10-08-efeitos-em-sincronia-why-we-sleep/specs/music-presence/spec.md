# Spec Delta

## Purpose

Garante que a música de um vídeo fique no fundo: abaixo da fala e dos efeitos o bastante para não disputar com eles, e com uma identidade só do começo ao fim.

## ADDED Requirements

### Requirement: Música bem abaixo da fala
Sob a fala, a mixagem SHALL aplicar pelo menos 17 dB de distância entre os volumes medidos da trilha e da voz em todo o vídeo. A distância final SHALL ser a que o usuário aceitar de ouvido, e pode ser maior. As medidas do render SHALL ser investigadas como sensores, sem substituir a aplicação do nível nem a escuta. Critério ajustado por decisão explícita do usuário em 2026-10-08 para preservar a música atual.

#### Scenario: A medida do vídeo
- **WHEN** se roda `pnpm critique why-we-sleep som` no vídeo montado
- **THEN** a mixagem aplica 17 dB ou mais, inclusive desde o primeiro quadro, e a distância medida é registrada e investigada contra esse estado

#### Scenario: Trecho com medida mais próxima da voz
- **WHEN** se olha o mapa segundo a segundo da medida do som
- **THEN** uma leitura abaixo de 14 dB é investigada contra o nível aplicado, a janela de três segundos e os silêncios de fala autorizados; uma dúvida de presença que reste vai ao ouvido do usuário, e um erro de aplicação é corrigido

### Requirement: Efeito acima da música
Um efeito sonoro SHALL soar mais perto da voz do que a música que toca por baixo dele.

#### Scenario: O efeito normal
- **WHEN** um efeito de nível normal toca sobre a música
- **THEN** o pico dele fica mais perto da voz do que a música naquele trecho

### Requirement: Uma identidade musical só
As partes em que a trilha é gerada SHALL soar como a mesma música: o mesmo caráter, os mesmos timbres e o mesmo tom. Uma parte que o usuário recusou de ouvido SHALL ser gerada de novo com a identidade da parte que ele aceitou.

#### Scenario: O primeiro leito
- **WHEN** o usuário ouve o som do vídeo do começo até `so-far`
- **THEN** ele reconhece a mesma música que aprovou de `but-what` ao fim

#### Scenario: A troca de parte não se ouve como troca de música
- **WHEN** a trilha passa da primeira parte à segunda, depois do silêncio de `so-far`
- **THEN** a variação de timbre do vídeo inteiro mede dentro da faixa de um vídeo só

### Requirement: Onde a música aparece e onde some
A música SHALL ir ao primeiro plano só nos silêncios de fala de dois segundos ou mais que o roteiro pediu, e SHALL sumir nos trechos que o mapa de som marca como silêncio de música.

#### Scenario: A vinheta
- **WHEN** a narração se cala por seis segundos depois da pergunta do gancho
- **THEN** a música sobe ao primeiro plano com a vinheta e volta ao fundo quando a fala recomeça

#### Scenario: A resposta do vídeo
- **WHEN** a resposta à pergunta do gancho é dita, em `so-far`
- **THEN** não há música por baixo dela
