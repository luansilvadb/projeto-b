# Decupagem de um vídeo

Acontece dentro da etapa de roteiro, acionada pela skill `diretor-criativo` com o texto escrito e ainda não aprovado. O que sai daqui é a ficha visual, `src/videos/<vídeo>/art.md`, e os planos de cada cena, o campo `shots` de `src/videos/<vídeo>/script.json`. Os dois são aprovados junto com o texto, na **primeira aprovação**, que é pedida lá.

É a única etapa em que a imagem ainda pode pedir outra frase sem custo: a narração não foi gravada. Mexer nos planos nunca regera áudio; mexer numa frase, depois da narração, sim.

## Passo 1: conceito visual

Unidades `entrevista-imagem`, `elenco` e `cor`. Parta de `script.md` (a analogia central e a nota visual de cada bloco) e de `research.md` (como as coisas são de verdade). Elenco e paletas são decisões do usuário, uma por vez, diante de imagem renderizada; as alternativas vão para `out/<vídeo>/conceito/`, numeradas na ordem em que foram mostradas.

Grave cada decisão em `art.md`, com a data e o arquivo da comparação que a sustentou; `src/videos/why-we-sleep/art.md` é o modelo.

Pronto quando: `art.md` tem o elenco, com a ficha de cada personagem, as paletas, com a regra de troca, e a forma visual da analogia central, todos aprovados.

## Passo 2: planos

Unidades `encenacao`, `planos` e `dado`. Para cada cena de `script.json`, encene cada oração e divida a cena em planos. Cada plano de `shots` leva o que a unidade `planos` registra, nos campos e valores que o validador aceita:

| Campo | O que é | Valores |
|---|---|---|
| `cue` | a deixa: palavra da narração da cena em que o plano começa | o primeiro plano da cena não leva; os outros, sempre |
| `occurrence` | qual ocorrência da palavra, quando ela se repete na cena | opcional; começa em 1 |
| `staging` | a encenação: quem faz o quê, e onde, mais o texto de tela | texto |
| `scale` | a escala | `wide` (aberto), `medium` (médio), `close`, `detail` (detalhe) |
| `palette` | a paleta do plano | um nome de `art.md` |
| `entry` | a entrada: como a imagem anterior vira esta | `cut` (corte), `camera` (câmera), `transform` (transformação), `wipe` (varredura) |

Quando a encenação pede outra frase, o pedido volta ao `diretor-criativo`, com a oração, o que a imagem não consegue mostrar e a frase que resolveria.

Pronto quando: toda cena tem `shots`, todo plano depois do primeiro tem `cue`, e cada `palette` existe em `art.md`.

## Passo 3: conferir

```bash
pnpm check-script <vídeo>
```

Ele recusa plano sem deixa ou com deixa que não está na narração, estima a duração de cada plano e aponta os que passam do limite de `planos`: trate cada um pelo passo 6 do procedimento dela.

Depois faça as passadas 1 e 2 de `critica-quadro` sobre os planos escritos, lendo só a coluna da encenação, sem a narração. Aqui não há subagente: ainda não existe imagem para um crítico abrir.

Pronto quando: o comando passa, nenhum plano longo ficou sem divisão ou sem justificativa, e as duas passadas não acham bloqueante.

## Entrega

Devolva ao `diretor-criativo` os planos de cada cena, o tempo médio por plano que o comando imprime, as frases que a imagem pediu para mudar e o que ficou em aberto nas duas passadas. Quem mostra o roteiro ao usuário e registra a 1ª aprovação é ele.
