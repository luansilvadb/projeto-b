## PERGUNTA
Como descobrir o som que realiza um uso, e reaproveitá-lo quando o uso volta?

## RESPOSTA

**Princípio.** O catálogo é memória: guarda uma realização sonora que já provou servir a um uso recorrente, para que o canal não a redescubra a cada vídeo. O **uso** descreve o acontecimento perceptível que o som precisa realizar; o **arquivo** é só a realização atual desse uso. Reutilizar é o padrão; o contexto pode provar que aquele uso não é o mesmo.

Esta unidade recebe de `dose` o uso, com o acontecimento ("`shutterDown`: uma porta de enrolar metálica desce"), e responde só que arquivo o realiza. Se há efeito, em que instante e com que presença já foi decidido lá.

**O que uma entrada diz.** `shutterDown` não diz "este arquivo é obrigatório para toda porta". Diz: "já achamos um arquivo que realizou bem este uso, e vale tentá-lo antes de outra busca". Por isso o uso que volta é usado sem busca, sem nova escuta de rotina e sem pergunta ao usuário; ele é ouvido de novo junto do conjunto, como tudo. Repetir o som de um uso é memória e identidade: buscar outra porta para o canal "não repetir" soa como acaso.

**O tamanho de um uso.** O nome guarda só as propriedades do acontecimento que precisam permanecer para o mesmo som continuar fazendo sentido.

- Amplo demais (`hit`, `door`, `movement`) mistura acontecimentos que se percebem diferentes.
- Específico demais (a moeda azul que cai da esquerda) faz de cada ocorrência um uso único.
- **Sem variante antecipada.** Nada de `coinDropSmall`, `coinDropHeavy` e `coinDropSoft` antes de um vídeo provar que a diferença pede outro arquivo. Comece pelo uso mais simples que funciona. Um uso novo também não precisa prometer que volta: uma entrada pontual é aceitável, e o catálogo cresce sob demanda, e não por planejamento.
- **O uso não é a categoria visual.** Duas varreduras podem fazer trabalhos diferentes (a passagem suave do tempo, o golpe rápido) e pedir usos diferentes; duas ações de desenho diferente podem dividir o mesmo clique de confirmação. A pergunta é se o mesmo arquivo continua realizando a mesma consequência sonora, e não se os dois desenhos se parecem.
- **O nome diz a diferença de uso**, nunca a versão, o fornecedor, o volume ou o instante: nada de `coinDrop2`, `shutterV2`, `freesound325585`, `coinDropLoud`, `coinDropLate`. O nome é o que `script.json` referencia, e renomear um uso que existe mexe em todo vídeo que o usa.

**Quando o contexto pede outro uso.** `coinDrop` serve à moeda pequena que bate na madeira. Uma moeda de toneladas que cai num cofre ainda é "moeda cai" nas palavras, mas a escala, o peso e o material mudaram a experiência: não force o mesmo uso porque os substantivos coincidem. O uso se separa ou se refina quando reutilizar o som muda a leitura ou falha de modo que se percebe.

**O som catalogado que parece falhar.** O usuário ouve o trecho, e o diagnóstico vem antes de qualquer troca:

| O que se percebe | Causa | Onde se conserta |
|---|---|---|
| o som é o certo, mas some ou grita | presença | o `level` do efeito (`dose`) |
| o som é o certo, fora do instante | instante | a âncora e o `offsetMs` (`dose`) |
| o som não parece este acontecimento, só aqui | é outro uso | um uso novo, mais específico |
| o som não serve ao uso em vídeo nenhum | a realização | o arquivo do catálogo |

Trocar o arquivo de um uso muda todo vídeo que o usa, quando for renderizado de novo: não se troca porque um vídeo pede outra coisa. O contrário também vale: o arquivo que é ruim em qualquer contexto é corrigido no catálogo, e não contornado com um uso novo ao lado.

**O teste.** Quando o arquivo toca junto da animação, ele parece pertencer ao acontecimento que o uso nomeia? Pesam, conforme o uso, o material, a escala, a força, a duração, o ataque, a textura, a distância e o humor. São lentes, e não uma lista a cumprir: olhe pelas que importam àquele uso.

- **Tamanho.** Um som tecnicamente certo pode parecer pesado, grande, pequeno ou cartunesco demais para a coisa desenhada. O vetor é limpo e leve, e um som realista e pesado costuma brigar com ele; costuma, e não sempre: o som realista cuja escala, material e tom casam com o desenho serve.
- **Duração.** O corpo do som se relaciona de modo convincente com a ação, e não com um número. O arquivo pode ser mais longo que a ação, se o ataque encaixa e a cauda não atrapalha, ou mais curto, se o uso é só o contato final de um movimento longo. Batidas de até 0,5 s e uma porta de 1,5 s já funcionaram aqui: é repertório, e não limite.
- **Começo.** O arquivo começa onde começa o que ele representa. No impacto, no clique e na batida, silêncio morto antes do ataque torna a sincronia impossível, e o candidato é ruim. O som de algo que se aproxima, cresce ou se desloca pode começar aos poucos: o envelope faz parte da ação.
- **Espaço.** O arquivo não traz acústica, ruído ou contexto que contradiga o vídeo. A sala de igreja numa animação neutra cria um espaço que não existe, e o ruído que denuncia outra gravação cola o som de fora. A cauda, a reverberação e a textura de ambiente que ajudam o acontecimento são válidas: "seco" é o que costuma servir ao efeito pontual, e não uma exigência.
- **Voz ou música no arquivo** trazem um sentido que ninguém controla: descarte.
- **Artefato.** Há glitch, timbre sintético involuntário ou defeito que chama atenção para a origem do arquivo em vez do acontecimento? Se há, falhou.

Nenhuma dessas lentes salva o arquivo que não soa como o acontecimento.

**O que o agente sabe, e o que só o ouvido sabe.** O agente descarta pelo que realmente tem: a licença, a duração, o formato, e o nome e a descrição quando mostram outro acontecimento, ou fala e música. Nome é pista de busca, e não evidência: "big metal shutter clean" não prova que o som é grande, metálico nem limpo. Nota e downloads medem popularidade, e servem no máximo para ordenar o que ouvir primeiro: o de nota 5,0 pode soar errado para a ação, e o de 3,5, perfeito. Ataque, espaço, peso e tamanho não se afirmam sem ouvir.

**Quantos candidatos.** O menor conjunto que resolve a dúvida, sem cota:

- **Um**, quando só um sobrou plausível: "isto soa como uma porta de enrolar metálica descendo?". Com o "sim", acabou. Não se busca um segundo para haver comparação, nem se leva um candidato inferior para completar A e B. Um só ainda precisa do ouvido quando o uso é novo: sobrar sozinho não prova que ele realiza o uso.
- **Vários**, quando há realizações plausíveis cuja diferença só se percebe lado a lado: os que cobrem as alternativas que importam. De cinco plausíveis, se dois já as cobrem, vão dois.
- **Nenhum**, quando nenhum serve: o uso fica pendente. Não se escolhe o menos ruim.

**Link ou trecho.** O link do Freesound basta para o que é do som sozinho (isto soa como moeda? é uma porta?). O que depende do vídeo (o tamanho diante do desenho, a disputa com a voz e a música, a comicidade, o encaixe no tempo) pede o menor trecho com o candidato por cima da cena, em `out/rascunho/`, e nunca o vídeo inteiro. O candidato que soa bem sozinho e pesa demais no trecho não é promovido.

**A pergunta ao usuário** é sobre o que se percebe: "soa como uma porta metálica descendo?", "parece grande demais para o desenho?", "o clique soa físico ou cartunesco?". Nunca sobre o arquivo: a duração, a nota, o id. A resposta é classificação de ouvido ("B parece mais a porta"): o catálogo aprende que B realiza o uso, e nada vai a `approvals.md`. Vira decisão só quando os candidatos realizam a ação e o que os separa é a linguagem de efeitos do canal (discreta, cartunesca, pesada) (`entrevista-som`). Usos novos independentes vão numa rodada só, cada um com a sua pergunta, e não "aprova esses sons?"; o uso que põe em dúvida a linguagem dos demais vai antes.

**Procedimento.** Adapta-se ao caso; o que não muda é a ordem das provas:

1. Confira o catálogo. O uso que existe e serve é reutilizado.
2. Para o que falta, busque pelo acontecimento ("metal shutter rolling down", e não "cool transition sound"). Em inglês, porque é como o Freesound responde melhor. A busca que falha não condena o uso: troque os termos, tire a palavra específica demais, tente outro material, outra ação ou a consequência física. Traduzir o uso em busca é execução, e não se pergunta ao usuário.
3. Descarte o que o agente pode descartar.
4. Leve ao ouvido o menor conjunto, em link ou em trecho.
5. Se nenhum realiza, volte ao passo 2. Se a busca mostra que o uso está mal definido, ele volta a `dose`.
6. Promova ao catálogo o que foi comprovado: o nome do uso, o arquivo e o pico medido. Baixar antes, para montar um trecho, é permitido; o que não se faz é promover pelo nome ou pela busca. O arquivo baixado que não foi promovido é apagado.

Pronto quando: cada uso que a entrega pede tem uma realização no catálogo ou está dito como pendente, e todo uso novo promovido passou pelo ouvido naquilo que o agente não podia saber.

## DEPENDÊNCIAS
- dose: fornece o uso de cada efeito, com o acontecimento, e conserta o que é de presença ou de instante.
- entrevista-som: fornece a fronteira entre a classificação de ouvido e a decisão sobre a linguagem de efeitos.

## LIMITES
- Só domínio público (CC0): o canal não deve crédito a ninguém por efeito. É regra de publicação, e a ferramenta recusa o resto.
- `pnpm sfx` busca hoje no Freesound, só arquivos de até 10 s. É o alcance da ferramenta, e não a definição de efeito: o uso que pedir mais esbarra nela, e fica pendente.
- O catálogo tem um arquivo por uso e guarda só o estado atual: sem candidatos, recusados nem substituídos. O anterior é o git.
- `peakLufs` é o pico medido pelo `pnpm sfx <id>`, dado técnico com que a mixagem põe o efeito à distância da voz. Não se adultera, e não existe arquivo em versão baixa ou alta: a presença é do mapa. A mixagem nunca amplifica: o arquivo gravado baixo a ponto de sumir até em `forte` é uma realização defeituosa, e é trocado.
- O agente não ouve: não afirma ataque, espaço, peso nem tamanho de um arquivo.

## EXEMPLO
> Uso novo, `stamp`: "o carimbo bate no quadro-negro". Busca: "rubber stamp hit". Descartados pelo que se lê: um de 9 s chamado "office ambience with stamping", um com "voice" na descrição. Sobram dois, de 0,3 e de 0,8 s, e os links vão ao usuário: "qual soa como um carimbo batendo em madeira?". "O segundo; o primeiro parece um clique de mouse." O de 0,8 s entra no catálogo, e a cauda dele não é defeito.
>
> No vídeo seguinte, um selo bate num envelope: o mesmo contato, o mesmo `stamp`, sem busca e sem pergunta. Mais adiante, uma prensa de toneladas esmaga um carro, e `stamp` soa minúsculo no trecho: o som não está ruim, o acontecimento é outro. Nasce `pressCrush`, e `stamp` fica como está.
