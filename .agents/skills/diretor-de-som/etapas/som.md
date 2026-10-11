# Som de um vídeo

Aqui o vídeo ganha a música e os efeitos, ou tem o som revisto. Comece pela pergunta: **que artefato a dúvida atual exige?**

- A identidade da música: a intenção do vídeo, como `script.md` a registra, e o roteiro; às vezes uma amostra da narração.
- A música sincronizada: a duração real de cada cena, que vem da narração gravada.
- O nível contra a voz: a voz e um render do som.
- O efeito numa ação: a ação e o instante dela, na partitura ou na animação.
- A costura, o momento, o conjunto: o áudio gerado; para o conjunto, o render do som inteiro.

Se o artefato falta, diga qual falta; não o adivinhe, e não espere um que a dúvida não usa. Ele não precisa estar aceito por ninguém: um animatic já prova que uma ação pede 800 ms de espaço. Mas uma decisão só se estabiliza até onde os artefatos de que depende estão estáveis: enquanto o instante da ação muda, o `offsetMs` é hipótese; enquanto a narração pode ser regravada, os instantes da trilha também.

O estado do som fica em dois lugares: `src/videos/<vídeo>/sound.md`, o mapa de som com a intenção e o porquê de cada escolha, e os campos `music` e `sfx` de `script.json`, que as ferramentas leem. Os dois guardam a hipótese atual e mudam juntos; o anterior é o git. Quem roda as ferramentas é a skill `diretor-producao` (`etapas/trilha.md` e `etapas/efeitos-sonoros.md`).

Uma dúvida local termina quando se resolve. Só um pedido que abrange todo o som leva à avaliação do conjunto pelo usuário, conforme `entrevista-som`. O som cresce por risco: o mapa só o bastante para gerar, o menor som que responde à maior dúvida, a medida, o conserto do que ficou provado, a escuta do que só o usuário percebe e, então, a camada seguinte.

## O ciclo

Parta dos compromissos que houver na seção "Arco" de `sound.md` (pode ser uma linha, e o arquivo pode não existir), da duração de cada cena (`public/videos/<vídeo>/narration.json`; `pnpm check-script <vídeo>` a imprime) e da partitura da animação (`score.md`). O que o arco deixou em aberto é completado aqui, e a intenção que ele registrou sem realização ganha a sua. A duração que pede mais de uma parte é restrição da geração (`leito`).

Leia também `src/videos/<vídeo>/script.md`, o registro da direção criativa: a identidade da trilha parte dele, e não do zero. Três coisas vêm de lá, e são do roteiro:

- **A voz**: a seção "Voz", com o tom que este vídeo ajusta (mais grave, mais lúdico, mais contido). O leito não contradiz quem narra.
- **A virada narrativa**: o bloco que a tabela "Estrutura" marca como virada, e as cenas dele. É onde o que se viu passa a significar outra coisa, e o som não a atravessa como se nada tivesse mudado.
- **O compromisso do fechamento**: a linha "Fechamento" e o último bloco antes da chamada, com o que o fim promete e o que não promete (um fim que não promete perigo não ganha música de ameaça).

O som lê essas três como intenção e não as reescreve: a que parecer errada volta à skill `diretor-criativo`. A tradução é daqui, inteira: se a virada pede troca de parte, momento, recuo, silêncio de música ou nada, e que timbre, andamento e nível dizem o tom, decide-se pelo ciclo, com o som para ouvir. `script.md` não prescreve mixagem, e a linha dele que tentar fazê-lo vale como intenção.

1. **A maior incerteza.** O que, se estiver errado, joga fora o resto? Num vídeo novo costuma ser a identidade da trilha: se o leito pertence ao vídeo, isto é, à voz, à virada e ao fechamento que `script.md` registra.
2. **O mapa que basta.** Escreva em `sound.md` e em `script.json` só o que essa dúvida pede (`leito`, `descricao`). Para a identidade, o leito sozinho: o `caption` que basta para gerar e, de `bpm` e `keyScale`, só o que a hipótese precisa, sem momentos, níveis nem efeitos. Num vídeo que não cabe numa parte, também as trocas (`parts`), que o comando exige: cada uma numa cena em que a costura se defende, e o som gerado pode mudá-la de lugar.
3. **O menor som.** Peça à skill `diretor-producao` só o que a dúvida pede: a trilha ainda sem momentos (`pnpm music <vídeo>`; o leito sozinho se ouve em `public/videos/<vídeo>/music.wav`), mais tarde uma parte só (`pnpm music <vídeo> <semente> <parte>`, com as outras já geradas) e, quando a dúvida é contra a voz, o som do vídeo.
4. **Medir e consertar.** O que o contrato e o estado provam como defeito (o `pnpm check-script` recusa, o comando falha, `sound.md` e `script.json` divergem, a parte não cobre o trecho dela) é consertado antes de qualquer escuta, sem pergunta. A medida fora da referência abre uma investigação, e não cria conserto sozinha (`critica-som`).
5. **O ouvido, se for preciso.** Sobrando uma dúvida que só o ouvido resolve e que pesa sobre o que vem depois, leve o arquivo, o instante e a pergunta. Registre a resposta como evidência para a próxima hipótese (`entrevista-som`). O sinal que o estado explica e de que nada depende fecha sem pergunta.
6. **Crescer.** O que funcionou fica, e o mapa ganha a camada seguinte, se o som a pedir: o momento na região em que o leito gerado não realiza o que o vídeo precisa (pode não haver nenhum), os níveis só nas regiões em que a presença do leito gerado está errada (pode não haver nenhum), os efeitos só nos acontecimentos em que a consequência sonora faz trabalho (podem ser poucos, ou nenhum) (`momentos`, `niveis`, `silencio`, `dose`). Volte ao passo 1.

O ciclo começa na dúvida atual, e não no passo 1 de um vídeo novo: trocar um efeito não volta ao leito, e investigar uma costura não redesenha os níveis. A ordem das camadas é dependência: os momentos são refeitos sobre o leito em que caem, os efeitos são julgados contra o conjunto em que tocam, e o nível depende da música real quando a densidade pesa. Um efeito ou um silêncio que seja a maior incerteza pode ser testado antes. Duas versões que passam e fazem cenas diferentes vão ao usuário em A e B, em `out/rascunho/`; a escolhida entra no mapa.

Um vídeo simples pode fechar em um leito gerado e só nas camadas que pedir; um leito sem momento ou efeito é correto. Um difícil dá mais voltas, cada uma puxada por uma medida ou escuta, não por uma lista.

### O silêncio antes da chamada

A última cena do fechamento leva um `holdMs` que deixa o fim assentar antes do pedido (`estrutura/chamada`, na pasta da skill `diretor-criativo`). Ele chega aqui como hipótese narrativa: a skill `diretor-criativo` o propôs sem ter o som para ouvir. Com o áudio e a mixagem reais, o som confere se a pausa faz o que o fechamento pede: o fim assenta, ou a chamada o atropela, ou a pausa sobra e vira espera (`silencio`).

- **A duração** é corrigida por pedido: entregue à skill `diretor-criativo` a cena, os milissegundos e o que se ouviu. Ela grava o campo em `script.json` e atualiza `script.md`; o som não edita `holdMs`.
- **O que a música faz na pausa** é do som, e ele altera sozinho: segue, vai à frente, some (`music.silences`), ou a parte da chamada entra ali (`"at": "hold"`), em `music` e em `sound.md`.
- A correção que muda o peso ou o tom do fim, ou contraria uma duração que o usuário decidiu, vai a ele antes (`entrevista-som`).

Mudado o `holdMs`, os quadros seguintes se deslocam e os instantes da trilha caem em outro lugar: a trilha é gerada de novo sobre a duração nova.

## O mapa

A seção "Mapa" de `sound.md` tem uma tabela por camada que já existe, e só com o que está em `script.json`:

- **Leitos**: o trecho, o caráter, a descrição.
- **Momentos**: as cenas, a duração, o que a música faz ali e por quê; só os que existem.
- **Níveis e silêncios**: a cena, o nível, por quê.
- **Efeitos**: a cena e o plano, o acontecimento, o uso, o nível; só os que existem; e, à parte, os usos que o catálogo não tem.

Sem descrição recusada, semente tentada nem alternativa perdida. O que o usuário decidiu leva essa marca na linha, para a iteração seguinte não desfazê-lo. `src/videos/why-we-sleep/sound.md` mostra o formato das tabelas; a história do piloto que ele guarda não é modelo.

## O roteiro

Os campos de `script.json`; o tipo e as regras estão em `src/narration/script.ts`, e o `pnpm check-script` recusa o que não fecha.

```json
"music": {
  "caption": "<a primeira parte>",
  "bpm": 96,
  "keyScale": "A minor",
  "parts": [{ "from": "<cena da troca>", "caption": "<a parte seguinte>" }],
  "silences": [{ "from": "<cena>", "cue": "<palavra>" }],
  "moments": [{ "from": "<cena>", "to": "<cena>", "caption": "<o momento>" }],
  "levels": [{ "from": "<cena>", "level": "recuo" }]
},
"sfx": [
  { "scene": "<cena>", "cue": "<palavra>", "offsetMs": -133, "name": "<uso>" },
  { "scene": "<cena>", "shot": 2, "name": "<uso>", "level": "leve" }
]
```

- `caption` é o único campo obrigatório de `music`. `bpm` e `keyScale` são opcionais, na trilha e em cada parte, que herda da trilha o que não declara.
- `parts`: cada item começa uma parte na cena `from`. Sem `at`, a faixa cruza com a anterior em 3 s, por baixo da fala; depois de um silêncio de música, entra sem cruzar. `"at": "hold"` a faz entrar no silêncio de fala do fim da cena.
- `moments`: do começo da cena `from` ao fim da cena `to` (ou da própria `from`), de 3 a 90 s, dentro de uma parte só e começando ao menos 5 s depois do início dela. O campo é opcional.
- `levels`: o nível vale da cena `from` até a mudança seguinte; para voltar, escreva a volta (`"level": "leito"`).
  Quando `from` é a primeira cena, o nível já vale desde o primeiro quadro; só as mudanças posteriores fazem a rampa entre níveis.
- `sfx`: o efeito toca na palavra `cue` (com `occurrence` quando ela se repete), ou no começo do plano `shot` (contado de 1), ou no começo da cena; `cue` e `shot` não convivem. `offsetMs`, inteiro, desloca da âncora ao acontecimento real, e vem da partitura da ação (`dose`), e não de um valor padrão. O `-133` do exemplo é um caso: as cenas adiantam a imagem em 4 quadros em relação à palavra (`CUE_LEAD_FRAMES`), e o movimento disparado no instante da deixa começa 133 ms antes dela. Sem `level`, vale `normal`. `name` é um uso do catálogo (`src/audio/sfx.ts`).

Um acontecimento cujo instante só existe no código da cena (o fim de uma queda, o terceiro de três jatos) é ancorado no plano ou na palavra mais próxima, com o `offsetMs` medido na partitura.
Para uma ação calculada a partir do fim, use `at: "end"`: com `shot`, ancora no fim desse plano; sem ele, no fim da cena. Não combina com `cue`. Um `offsetMs` negativo mantém a distância até o fim mesmo quando a narração muda a duração.

## Sons que faltam

Unidade `escolha`. O catálogo guarda o arquivo que hoje realiza cada uso. O uso que ele já tem é reutilizado, sem consulta, e nenhum uso novo nasce para aumentar a quantidade de efeitos. Entregue à skill `diretor-producao` (`etapas/efeitos-sonoros.md`) a lista dos que faltam, com a ação de cada um; ela busca, filtra, leva ao ouvido do usuário o candidato ou os candidatos que sobram e devolve o `name`. Um efeito sem som no catálogo fica fora de `sfx` e anotado em `sound.md` como pendente.

## O conjunto

Com o mapa realizado, peça à skill `diretor-producao` o que falta da trilha e o som do vídeo sem a imagem, que sai em minutos:

```bash
pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3
```

## Revisão do som (`revisao/critica-som`)

```bash
pnpm critique out/<vídeo>/<vídeo>.som.mp3 som
```

Leia você mesmo a tabela e, onde ela levantar uma pergunta, as séries segundo a segundo (`out/<vídeo>/som/<vídeo>.som/medidas.json`); depois acione o subagente `critico-de-som`, que não escreveu o mapa. Passe o nome da pasta do vídeo, o caminho do arquivo de som e o que o usuário já disse ter ouvido. Ele diagnostica de forma independente e não ouve; você interpreta o relatório, escolhe a hipótese e refaz pela unidade dona.

- **Defeito técnico confirmado**: conserte, sem pergunta. Uma parte ou um momento que não realizou o estado é gerado de novo sozinho, com outra semente (`pnpm music <vídeo> <semente> <parte>`); se duas sementes falharem pelo mesmo motivo, muda a descrição ou o desenho do mapa.
- **Dúvida de ouvido**: vai ao roteiro de escuta se pesa. A gravidade e o conserto vêm com a resposta.
- **Sem defeito**: segue. A medida fica no relatório.

Depois de um conserto, confira só a evidência que mostrou o defeito, no trecho alterado e no que depende dele. Se a tarefa abrange todo o som, revise o conjunto antes de apresentá-lo ao usuário; um ajuste local pede só o trecho e o contexto de que depende.

Se a tarefa abrange todo o som, entregue o áudio com o roteiro de escuta (`entrevista-som`), as decisões ainda abertas e uma pergunta sobre o conjunto. As medidas entram como contexto; as que saem da referência não viram escolhas nem exceções.

Para correções após a avaliação do conjunto, siga em `entrevista-som` a regra para mudanças que preservam ou alteram a experiência.

Ao terminar, devolva o estado atual: os artefatos, as decisões e as dúvidas que sobraram.
