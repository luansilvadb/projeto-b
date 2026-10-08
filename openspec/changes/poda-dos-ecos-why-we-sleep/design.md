# Design

## Context

Veja `proposal.md` para o motivo. O que molda o caminho:

- **A fala dá o tempo.** Mudar uma frase gera de novo o áudio dela, muda a duração da cena e desloca tudo o que vem depois. `pnpm narrate` reaproveita do cache as frases que não mudaram; `pnpm join` recusa a cena cuja duração não bate mais com o render e diz quais rodar em `pnpm scene`.
- **Cada plano começa numa palavra.** Um plano depois do primeiro tem `cue`, e o movimento dentro dele é marcado em palavras; cortar a frase que leva a palavra desmonta o plano. Na primeira rodada isso serviu de motivo para não mexer nas costuras e em `debt-returns`. Na segunda, o plano é que se ajusta ao texto.
- **O texto tem dono e decisões registradas.** A etapa `diretor-criativo/etapas/roteiro` diz que mudar o que o usuário decidiu volta a ele, e que a voz custa e fixa o tempo.
- **A voz clonada tem limites conhecidos**: erra "não" e palavras em "-ão" no fim da frase e "Então" no começo dela. Na primeira rodada ela engoliu o "não" de "se não fosse vital", no meio da frase.
- **A fila dos cinco ícones já existe** nas cenas `five-parts`, `debt-returns`, `sleep-less`, `maybe-brain`, `forced-awake`, `so-far` e `but-what`, com o X e o ícone que acende. É ela que passa a dizer a posição.
- **O bolso é um compromisso de imagem.** A conta é guardada nele em `debt-returns` e em `older-than-brain`, e sai dele em `jellyfish-debt` e em `gardner-sleeps`.
- **`NobodyEscapedScene.tsx` é importada por outras cenas**: `WhatItIsScene` usa a linha do tempo, `StockroomSolidScene` usa o prelúdio da lupa, e `OneOfThemScene` cresce sobre o plano dela.

## Goals / Non-Goals

**Goals:**

- Nenhuma ideia dita duas vezes sem ganho, no roteiro inteiro, conferido por contagem e por uma leitura independente.
- Gastar a voz e a animação uma vez só nesta rodada: todo o texto fecha, e o usuário o lê, antes de qualquer geração.
- Manter os `id` das 42 cenas.

**Non-Goals:**

- Poupar um plano à custa do texto. Onde a frase cortada era o tempo de um plano, o plano é refeito.
- Mudar a estrutura, os fatos, o desenho, a paleta ou o elenco.
- Gerar ou ajustar som: é da mudança `efeitos-em-sincronia-why-we-sleep`.
- Chegar a um número de palavras: a estimativa da proposta não é meta.

## Decisions

### 1. O inventário manda, e não a lista de cenas

A segunda rodada começa refazendo a tabela da proposta sobre o roteiro inteiro: para cada ideia, as cenas em que ela é dita, e para cada volta, o que ela diz de novo. A volta que não diz nada novo sai ou vira imagem. A lista de cenas a reescrever é o resultado disso.

Alternativa descartada: partir de uma lista de cenas, como na primeira rodada. Foi o que deixou Rechtschaffen, as costuras e a cobrança de fora.

### 2. O texto inteiro antes da voz

O roteiro é reescrito de uma vez, conferido (`pnpm check-script`, o `editor` sobre o roteiro inteiro, o `checador` sobre as cenas mudadas) e levado ao usuário em formato de leitura: a narração corrida, do começo ao fim, com o que saiu marcado. Só com o aceite dele a voz é gerada.

O `editor` recebe uma pergunta só: o que quem ouve escuta pela segunda vez. Na primeira rodada ele leu só o fim do vídeo e apontou como menores coisas que o usuário recusou.

### 3. A posição passa para a tela

As aberturas de capítulo perdem a frase de posição, e o primeiro plano delas (a fila dos ícones, com o X no jeito que terminou e o ícone seguinte acendendo) passa a acontecer sobre a primeira frase do jeito novo, ou num silêncio curto antes dela (`holdMs` na cena anterior), o que ler melhor no render.

- `maybe-brain` e `forced-awake`: o plano da fila deixa de ter uma frase só dele.
- `so-far`: o veredito e a resposta; as três molduras acendem sem que a fala nomeie os jeitos. Se o plano ficar corrido, a saída é um silêncio curto, e não uma frase.
- `but-what`: abre pela pergunta nova.

Alternativa descartada: tirar os planos da fila junto com as frases. A fila é o mapa na tela, e é ela que permite à fala não repetir.

### 4. `debt-returns` fica sem anúncio

A cena perde "essa cobrança volta duas vezes neste vídeo" e a recapitulação do bloco. O gesto de guardar a conta no bolso continua, sobre a frase que sobrar ou no fim de `debt-test`, e a passagem para o capítulo seguinte continua acontecendo na fila dos ícones. Se nenhuma frase sobrar que diga algo novo, a narração da cena se funde à de `debt-test` e a cena fica como plano de passagem, com o `id` mantido.

O `holdMs` de 1 segundo que a cena tem é do mapa de som e fica onde a passagem ficar.

### 5. Rechtschaffen e o maior erro

- Gancho: como está. É a única apresentação e a única vez que a frase é dita.
- `forced-awake`: os ratos são do laboratório dele, o que é fato da pesquisa e vale dizer; sai o aposto que o reapresenta. A etiqueta de nome e o quadro-negro do gancho, que o plano já mostra, fazem o reconhecimento.
- `tonight`: a resposta parte da ideia ("um erro desses algum animal teria abandonado") com o quadro-negro e o carimbo "erro?" na tela, sem nome e sem a frase. A condição da citação original deixa de ser necessária porque a citação não é mais redita; o `checador` confere a frase nova.

### 6. O que a primeira rodada deixou e continua valendo

- `nobody-escaped` com um plano só, a frase que encerra a procura e 0,7 s de silêncio sobre o pedestal vazio; `one-of-them` com a volta ao "nós".
- `gardner-sleeps` nomeando a cobrança, com a conta saindo do bolso em 2,2 s.
- Em `older-than-brain`, a palavra "sem" da primeira frase é a deixa do gesto de guardar a conta. O corte de "sem cérebro" nessa cena precisa manter uma deixa para o gesto, ou a marcação muda de palavra.
- O `hidden` retirado da sequência da trilha em `NarratedVideo.tsx`.

### 7. A ordem da produção depois do aceite

```
inventário --> texto reescrito --> leitura do usuário
                                        |
                                        v
                                  pnpm narrate
                                        |
                                        v
                  shots e cenas tocadas (pnpm scene, um agente por
                  grupo de cenas, com arquivos que não se cruzam)
                                        |
                                        v
                  pnpm sound + pnpm join, com a trilha que existe
```

A trilha não é gerada: a música fica deslocada em relação às cenas do fim, e isso é esperado. O vídeo montado serve para o usuário julgar texto e imagem; o som é da mudança seguinte, que parte do tempo final desta.

## Risks / Trade-offs

- **O vídeo montado desta rodada tem a música fora de lugar.** → Dito na entrega; o som é refeito na mudança seguinte.
- **Mais cenas reanimadas, entre elas as passagens na fila dos ícones.** → Um trecho de prova primeiro (`maybe-brain`), para ver se a fila sem frase própria se lê, antes de multiplicar; depois o `critico-de-movimento` nas cenas tocadas.
- **Sem a frase de posição, alguém pode se perder entre capítulos.** O roteiro foi escrito para quem assiste com TDAH, e a posição falada era parte disso. → A fila dos ícones fica na tela em toda virada; o `editor` lê o roteiro inteiro com essa pergunta também, e o usuário decide diante do texto.
- **A voz pode errar uma frase nova.** → As frases evitam os tropeços conhecidos; a que o conferidor acusar por palavra trocada no meio é reescrita, como a de `tonight` foi.
- **Terceira entrega do mesmo ajuste.** Pela linha de parada do `CLAUDE.md`, depois de duas recusas a terceira entrega explicita o que resta. → Esta rodada entrega a contagem refeita ao lado do texto, para o que restar ficar à vista.

## Migration Plan

Trabalho na branch `poda-dos-ecos`, que já tem a primeira rodada sem commit. Com o sim do usuário, a primeira rodada é commitada antes de a segunda começar, para que cada uma possa ser desfeita sozinha. Voltar atrás é reverter o commit e rodar `pnpm narrate`, `pnpm scene` das cenas acusadas e `pnpm join`.

## Open Questions

- Se `debt-returns` fica com uma frase ou vira só plano de passagem: sai da reescrita.
- Onde o `holdMs` curto ajuda a fila dos ícones a se ler: sai do render de prova.
