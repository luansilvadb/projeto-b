# Som de um vídeo

Sexta etapa, depois da animação aceita: o aceite da animação está em `src/videos/<vídeo>/approvals.md`, sem reabertura; se não estiver, pergunte ao usuário. Aqui o vídeo ganha a música e os efeitos. Termina no **aceite do som**.

O que esta etapa decide fica em dois lugares: `src/videos/<vídeo>/sound.md`, o mapa de som com o porquê de cada decisão, e os campos `music` e `sfx` de `script.json`, que as ferramentas leem. Quem roda as ferramentas é a skill `producao` (`etapas/trilha.md` e `etapas/efeitos-sonoros.md`).

## Passo 1: mapa de som

Unidades `entrevista-som`, `leito`, `descricao`, `momentos`, `niveis`, `silencio` e `dose`. Parta dos compromissos antecipados que houver na seção "Arco" de `sound.md` (pode ser uma linha, e o arquivo pode não existir), da duração de cada cena (`public/videos/<vídeo>/narration.json`; `pnpm check-script <vídeo>` a imprime) e da partitura da animação (`score.md`).

É aqui, com a voz real e a animação aceita, que se decidem os timbres, o andamento, o tom, os leitos e o silêncio de música: o que o arco antecipado deixou em aberto é completado agora, e a intenção que ele registrou sem realização ganha a sua. A duração que pede mais de um leito é restrição desta etapa (`leito`).

Escreva em `sound.md` a seção "Mapa", com uma tabela por camada; `src/videos/why-we-sleep/sound.md` é o modelo:

- **Leitos**: o trecho, o caráter, a descrição.
- **Momentos**: as cenas, a duração, o que a música faz e por quê.
- **Níveis e silêncios**: a cena, o nível, por quê.
- **Efeitos**: a cena e o plano, a ação, o uso, o nível; e, à parte, os usos que o catálogo não tem.

Leve o mapa ao usuário pela `entrevista-som` e só passe ao roteiro depois do "sim".

## Passo 2: o roteiro

Os campos de `script.json`; o tipo e as regras estão em `src/narration/script.ts`, e o `pnpm check-script` recusa o que não fecha.

```json
"music": {
  "caption": "<o leito A>",
  "bpm": 96,
  "keyScale": "A minor",
  "parts": [{ "from": "<cena da troca>", "caption": "<o leito B>", "keyScale": "C major" }],
  "silences": [{ "from": "<cena>", "cue": "<palavra>" }],
  "moments": [{ "from": "<cena>", "to": "<cena>", "caption": "<o momento>" }],
  "levels": [{ "from": "<cena>", "level": "recuo" }]
},
"sfx": [
  { "scene": "<cena>", "cue": "<palavra>", "offsetMs": -133, "name": "<uso>" },
  { "scene": "<cena>", "shot": 2, "name": "<uso>", "level": "leve" }
]
```

- `parts`: cada item começa um leito na cena `from`. Sem `at`, a faixa cruza com a anterior em 3 s, por baixo da fala; depois de um silêncio de música, entra sem cruzar. `"at": "hold"` a faz entrar no silêncio de fala do fim da cena.
- `moments`: do começo da cena `from` ao fim da cena `to` (ou da própria `from`), de 3 a 90 s, dentro de um leito só.
- `levels`: o nível vale da cena `from` até a mudança seguinte; para voltar, escreva a volta (`"level": "leito"`).
- `sfx`: o efeito toca na palavra `cue` (com `occurrence` quando ela se repete), ou no começo do plano `shot` (contado de 1), ou no começo da cena; `offsetMs` desloca. A imagem antecipa a palavra em 4 quadros: para o som cair junto com um movimento disparado pela mesma palavra, use `"offsetMs": -133`. `name` é um uso do catálogo (`src/audio/sfx.ts`).

Uma ação cujo instante só existe no código da cena (o fim de uma queda, o terceiro de três jatos) é ancorada no plano ou na palavra mais próxima, com o `offsetMs` medido na partitura.

## Passo 3: sons que faltam

Unidade `escolha`. Entregue à skill `producao` (`etapas/efeitos-sonoros.md`) a lista dos usos que o catálogo não tem, com a ação de cada um; ela busca, leva os candidatos ao usuário e devolve o `name`. Um efeito sem som no catálogo fica fora de `sfx` e anotado em `sound.md` como pendente.

## Passo 4: gerar e ouvir

Peça à skill `producao` a trilha (`pnpm music <vídeo>`) e o som do vídeo sem a imagem, que sai em minutos:

```bash
pnpm sound <vídeo> out/<vídeo>/<vídeo>.som.mp3
```

## Passo 5: revisão (`revisao/critica-som`)

```bash
pnpm critique out/<vídeo>/<vídeo>.som.mp3 som
```

Leia você mesmo a tabela e o mapa segundo a segundo (`out/<vídeo>/som/<vídeo>.som/medidas.json`) e depois acione o subagente `critico-de-som`, que não escreveu o mapa. Passe o nome da pasta do vídeo e o caminho do arquivo de som. Ele julga; quem decide e refaz é você, pelos passos 4 a 6 do procedimento de `critica-som`. Uma faixa ou um momento ruim é gerado de novo sozinho, com outra semente: `pnpm music <vídeo> <semente> <parte>`.

Depois entregue ao usuário o arquivo de som, as medidas e o roteiro de escuta (`entrevista-som`). O "sim" dele é o **aceite do som**: registre-o em `approvals.md` (formato nas convenções do `README.md`), com cada medida fora da faixa que ele aceitou e cada efeito pendente.

A próxima etapa é o corte final, na skill `producao`.
