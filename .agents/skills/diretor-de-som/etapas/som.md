# Som de um vídeo

Aqui o vídeo ganha a música e os efeitos, ou tem o som revisto. Comece pela pergunta: **que artefato a dúvida atual exige?**

- A identidade da música: a intenção do vídeo e o roteiro; às vezes uma amostra da narração.
- A música sincronizada: a duração real de cada cena, que vem da narração gravada.
- O nível contra a voz: a voz e um render do som.
- O efeito numa ação: a ação e o instante dela, na partitura ou na animação.
- A costura, o momento, o conjunto: o áudio gerado; para o conjunto, o render do som inteiro.

Se o artefato falta, diga qual falta; não o adivinhe, e não espere um que a dúvida não usa. Ele não precisa estar aceito por ninguém: um animatic já prova que uma ação pede 800 ms de espaço. Mas uma decisão só se estabiliza até onde os artefatos de que depende estão estáveis: enquanto o instante da ação muda, o `offsetMs` é hipótese; enquanto a narração pode ser regravada, os instantes da trilha também.

O estado do som fica em dois lugares: `src/videos/<vídeo>/sound.md`, o mapa de som com a intenção e o porquê de cada escolha, e os campos `music` e `sfx` de `script.json`, que as ferramentas leem. Os dois guardam a hipótese atual e mudam juntos; o anterior é o git. Quem roda as ferramentas é a skill `producao` (`etapas/trilha.md` e `etapas/efeitos-sonoros.md`).

A única aprovação é o aceite do som, e só quando o trabalho é o conjunto inteiro; o pedido parcial termina na dúvida respondida. O som cresce por risco (`entrevista-som`): o mapa só o bastante para gerar, o menor som que responde a maior dúvida, a medida, o conserto do que ficou provado, o ouvido do usuário para o que só ele percebe, e então a camada seguinte.

## O ciclo

Parta dos compromissos que houver na seção "Arco" de `sound.md` (pode ser uma linha, e o arquivo pode não existir), da duração de cada cena (`public/videos/<vídeo>/narration.json`; `pnpm check-script <vídeo>` a imprime) e da partitura da animação (`score.md`). O que o arco deixou em aberto é completado aqui, e a intenção que ele registrou sem realização ganha a sua. A duração que pede mais de uma parte é restrição da geração (`leito`).

1. **A maior incerteza.** O que, se estiver errado, joga fora o resto? Num vídeo novo costuma ser a identidade da trilha: se o leito pertence ao vídeo.
2. **O mapa que basta.** Escreva em `sound.md` e em `script.json` só o que essa dúvida pede (`leito`, `descricao`). Para a identidade, o leito sozinho: o `caption` que basta para gerar e, de `bpm` e `keyScale`, só o que a hipótese precisa, sem momentos, níveis nem efeitos. Num vídeo que não cabe numa parte, também as trocas (`parts`), que o comando exige: cada uma numa cena em que a costura se defende, e o som gerado pode mudá-la de lugar.
3. **O menor som.** Peça à skill `producao` só o que a dúvida pede: a trilha ainda sem momentos (`pnpm music <vídeo>`; o leito sozinho se ouve em `public/videos/<vídeo>/music.wav`), mais tarde uma parte só (`pnpm music <vídeo> <semente> <parte>`, com as outras já geradas) e, quando a dúvida é contra a voz, o som do vídeo.
4. **Medir e consertar.** O que o contrato e o estado provam como defeito (o `pnpm check-script` recusa, o comando falha, `sound.md` e `script.json` divergem, a parte não cobre o trecho dela) é consertado antes de qualquer escuta, sem pergunta. A medida fora da referência abre uma investigação, e não cria conserto sozinha (`critica-som`).
5. **O ouvido, se for preciso.** Sobrando uma dúvida que só o ouvido resolve e que pesa sobre o que vem depois, leve o arquivo, o instante e a pergunta. A resposta é evidência, e não aceite. O sinal que o estado explica e de que nada depende fecha sem pergunta.
6. **Crescer.** O que funcionou fica, e o mapa ganha a camada seguinte, se o som a pedir: o momento na região em que o leito gerado não realiza o que o vídeo precisa (pode não haver nenhum), os níveis só nas regiões em que a presença do leito gerado está errada (pode não haver nenhum), os efeitos só nos acontecimentos em que a consequência sonora faz trabalho (podem ser poucos, ou nenhum) (`momentos`, `niveis`, `silencio`, `dose`). Volte ao passo 1.

O ciclo começa na dúvida atual, e não no passo 1 de um vídeo novo: trocar um efeito não volta ao leito, e investigar uma costura não redesenha os níveis. A ordem das camadas é dependência: os momentos são refeitos sobre o leito em que caem, os efeitos são julgados contra o conjunto em que tocam, e o nível depende da música real quando a densidade pesa. Um efeito ou um silêncio que seja a maior incerteza pode ser testado antes. Duas versões que passam e fazem cenas diferentes vão ao usuário em A e B, em `out/rascunho/`; a escolhida entra no mapa.

Um vídeo simples fecha em um leito gerado, uma escuta curta, as camadas que ele pedir (um leito sem momento nenhum é um resultado correto), o conjunto e o aceite. Um difícil dá mais voltas, e cada uma nasce de uma medida ou de uma escuta, e não de uma lista.

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

Unidade `escolha`. O catálogo guarda o arquivo que hoje realiza cada uso. O uso que ele já tem é reutilizado, sem consulta, e nenhum uso novo nasce para aumentar a quantidade de efeitos. Entregue à skill `producao` (`etapas/efeitos-sonoros.md`) a lista dos que faltam, com a ação de cada um; ela busca, filtra, leva ao ouvido do usuário o candidato ou os candidatos que sobram e devolve o `name`. Um efeito sem som no catálogo fica fora de `sfx` e anotado em `sound.md` como pendente.

## O conjunto

Com o mapa realizado, peça à skill `producao` o que falta da trilha e o som do vídeo sem a imagem, que sai em minutos:

```bash
pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3
```

## Revisão e aceite (`revisao/critica-som`)

```bash
pnpm critique out/<vídeo>/<vídeo>.som.mp3 som
```

Leia você mesmo a tabela e, onde ela levantar uma pergunta, as séries segundo a segundo (`out/<vídeo>/som/<vídeo>.som/medidas.json`); depois acione o subagente `critico-de-som`, que não escreveu o mapa. Passe o nome da pasta do vídeo, o caminho do arquivo de som e o que o usuário já disse ter ouvido. Ele diagnostica de forma independente e não ouve; você interpreta o relatório, escolhe a hipótese e refaz pela unidade dona.

- **Defeito técnico confirmado**: conserte, sem pergunta. Uma parte ou um momento que não realizou o estado é gerado de novo sozinho, com outra semente (`pnpm music <vídeo> <semente> <parte>`); se duas sementes falharem pelo mesmo motivo, muda a descrição ou o desenho do mapa.
- **Dúvida de ouvido**: vai ao roteiro de escuta se pesa. A gravidade e o conserto vêm com a resposta.
- **Sem defeito**: segue. A medida fica no relatório.

Depois de um conserto, confira só a evidência que mostrou o defeito, no trecho alterado e no que depende dele. A revisão do som inteiro cabe quando o trabalho é o conjunto, antes do aceite; um trecho revisto pede só o trecho e o contexto de que ele depende.

Quando o trabalho é o conjunto, entregue ao usuário o arquivo de som e o roteiro de escuta (`entrevista-som`): as dúvidas que só o ouvido fecha, as decisões em aberto e a pergunta do todo. As medidas vão junto como contexto, e o roteiro não nasce de cada uma que saiu da referência. O "sim" dele é o **aceite do som**: responde se o conjunto funciona como experiência, e fixa o que ele aceitou ouvir, com as decisões de experiência que tomou e cada efeito pendente. Medida fora da referência não entra no aceite como exceção: é diagnóstico, e fica no relatório. Um número só entra quando ele mesmo foi a decisão.

Depois do aceite, a correção que preserva o que ele aceitou ouvir entra e é conferida no trecho, sem outro aceite; a que muda a experiência volta a ele (`entrevista-som`).

Ao terminar, devolva o estado atual: os artefatos, as decisões e as dúvidas que sobraram.
