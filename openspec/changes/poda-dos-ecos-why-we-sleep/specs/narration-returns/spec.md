# Spec Delta

## Purpose

Garante que a narração de um vídeo não canse quem ouve com repetição: cada ideia é dita uma vez, o que volta diz algo novo, e a posição no caminho fica com a tela.

## ADDED Requirements

### Requirement: Conclusão dita uma vez por inteiro
Uma conclusão que a narração já disse por inteiro SHALL NOT voltar com as mesmas palavras sem que a mesma frase lhe acrescente algo novo: uma restrição, uma inversão, uma consequência ou um sujeito novo.

#### Scenario: A resposta à pergunta do vídeo
- **WHEN** se procura "nenhum animal estudado até hoje conseguiu parar de dormir" na narração do `why-we-sleep`
- **THEN** ela aparece por inteiro uma vez, no fim do capítulo das três tentativas, e o fechamento volta à procura só para dizer que ela termina sem o animal e que nós somos um dos animais dela

#### Scenario: As voltas do refrão
- **WHEN** se leem em ordem as frases que dizem quem não conseguiu parar de dormir
- **THEN** são três, e cada uma diz algo que a anterior não dizia: a elefanta, quem vive sem cérebro, nenhum animal estudado

#### Scenario: A resposta não vira premissa da frase seguinte
- **WHEN** se lê a abertura de `but-what`, logo depois da resposta de `so-far`
- **THEN** ela abre a pergunta nova, o que o sono faz, sem redizer que nenhum animal consegue parar

### Requirement: Recapitulação sem recontar
Quando a narração fecha um conjunto de capítulos, ela SHALL dizer o que eles estabeleceram juntos, e SHALL NOT repetir o resultado nem o nome de cada um. O resultado de cada capítulo pode continuar na tela.

#### Scenario: O fim das três tentativas
- **WHEN** se lê a narração de `so-far`
- **THEN** ela dá a resposta à pergunta do gancho e mais nada: não diz que os jeitos falharam, não os nomeia e não rediz as duas horas da elefanta, que a água-viva dorme mesmo assim, a morte dos ratos nem as catorze horas de Gardner

#### Scenario: A tela carrega os três resultados
- **WHEN** se abre o render de `so-far`
- **THEN** o X no terceiro ícone e as três molduras, com a elefanta, a água-viva e os ratos com Gardner, estão na tela enquanto a resposta é anunciada

### Requirement: Posição no caminho pela tela
Depois de o mapa do vídeo ser dito uma vez, a narração SHALL NOT redizer a cada capítulo qual parte acabou e qual começa. A tela SHALL mostrar a posição: a parte que terminou, marcada, e a que começa, em destaque.

#### Scenario: A abertura de um capítulo
- **WHEN** se lê a frase que apresenta o primeiro jeito, a primeira de `maybe-brain` e a de `forced-awake`
- **THEN** cada uma apresenta o jeito novo de escapar, sem dizer que o jeito anterior falhou ou teve limite

#### Scenario: A fila dos ícones diz onde o vídeo está
- **WHEN** se abre o primeiro plano de `maybe-brain`, de `forced-awake` e de `so-far`
- **THEN** o ícone do jeito que terminou ganha o X e o do jeito seguinte acende, sem que a fala diga isso

#### Scenario: O mapa é dito uma vez
- **WHEN** se procura na narração do `why-we-sleep` a enumeração das partes do vídeo
- **THEN** ela aparece uma vez, em `five-parts`

### Requirement: Pessoa e citação apresentadas uma vez
Uma pessoa SHALL ser apresentada uma vez, com o que a identifica, e uma citação SHALL ser dita uma vez. Quando voltam, a narração usa no máximo o nome, e a tela faz o resto; ela SHALL NOT redizer quem a pessoa é nem recitar a citação.

#### Scenario: Rechtschaffen no laboratório dos ratos
- **WHEN** Rechtschaffen volta em `forced-awake`
- **THEN** a narração não diz de novo que ele é o pesquisador de Chicago nem que falava no maior erro da evolução

#### Scenario: A resposta ao maior erro
- **WHEN** se lê `tonight`
- **THEN** a narração responde numa frase se o sono é um erro, sem recitar a frase do gancho, sem refazer o raciocínio dela e sem redizer o nome de quem a disse, e o quadro-negro do gancho está na tela

#### Scenario: A frase do maior erro
- **WHEN** se procura "maior erro" na narração do `why-we-sleep`
- **THEN** a expressão aparece uma vez, no gancho

### Requirement: Regra explicada uma vez
Uma regra ou um conceito que a narração já explicou SHALL voltar só pelo nome. A narração SHALL NOT enunciá-lo de novo por extenso nem anunciar que ele vai voltar.

#### Scenario: A cobrança na água-viva e em Gardner
- **WHEN** a cobrança volta em `jellyfish-debt` e em `gardner-sleeps`, com a conta saindo do bolso na tela
- **THEN** a narração no máximo a nomeia, sem redizer que quem perde sono compensa depois; em `gardner-sleeps` quem a traz é só a conta

#### Scenario: Nenhum anúncio de volta
- **WHEN** se procura na narração uma frase que avise que algo vai voltar mais adiante
- **THEN** não há nenhuma

#### Scenario: A regra é explicada no bloco dela
- **WHEN** se contam as frases que explicam que o sono perdido é compensado depois
- **THEN** elas estão todas no bloco 2, de `skip-a-night` a `debt-test`

### Requirement: Fato mostrado uma vez
Um fato que a narração já estabeleceu SHALL NOT ser estabelecido de novo com outras palavras numa cena posterior. Uma ressalva já feita SHALL NOT ser repetida sobre o mesmo ponto.

#### Scenario: O perigo de dormir
- **WHEN** se leem `third-of-life`, `night-falls` e `last-to-know`
- **THEN** só uma delas diz que quem dorme demora a perceber quem chega perto

#### Scenario: As ressalvas
- **WHEN** se procuram "tudo indica" e as frases que dizem que algo ainda não se sabe
- **THEN** cada ressalva aparece uma vez, sobre um ponto diferente

### Requirement: Fechamento que não repete o corpo
O fechamento SHALL trazer do corpo do vídeo só o que muda de sentido ali. Uma frase do fechamento que só repete uma frase anterior, sem juntar, transformar ou responder, SHALL NOT existir.

#### Scenario: Nenhuma cena do fechamento é só repetição
- **WHEN** se lê cada cena do fechamento do `why-we-sleep` ao lado do corpo
- **THEN** cada cena diz ao menos uma coisa que o corpo não disse

#### Scenario: A volta ao gancho
- **WHEN** se procura "terço da vida" na narração
- **THEN** a expressão aparece no gancho e uma vez no fechamento

### Requirement: Número dito uma vez
Um número que a narração já deu SHALL voltar na fala só quando a volta o usa de outro jeito: numa comparação, numa conta ou numa medida nova. A tela pode mostrar o número de novo sem que a fala o repita.

#### Scenario: A idade do sono
- **WHEN** se procura "quinhentos milhões" na narração do `why-we-sleep`
- **THEN** o número é dito uma vez, no gancho, e o fechamento mostra a linha do tempo sem que a fala o repita

#### Scenario: Um número que volta com uso novo
- **WHEN** a manhã seguinte a uma noite em claro volta em `gardner-hours` como "onze daquelas manhãs"
- **THEN** a volta fica, porque mede as 264 horas de Gardner
