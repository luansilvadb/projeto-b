# Referência da voz

Os casos que o fluxo normal de `narracao.md` não percorre, uma seção por caso.

## Editar uma frase à mão no estúdio

Em "editar à mão" de cada frase: editar o texto (vai direto para `script.json`; a página recusa a edição que deixaria o roteiro inválido e diz por quê), gerar tomadas, ouvir cada uma sozinha ou em contexto, usar a que soou certa e colar a frase na seguinte, o que encurta a pausa de 0,35 s (ou de 1 s, entre duas cenas) para 0,12 s.

## Onde ficam as escolhas e as tomadas

As escolhas vão para `src/videos/<vídeo>/voice.json`, que vai para o git e o `pnpm narrate` respeita: `takes` (escolhidas à mão), `rejected` (rejeitadas de ouvido) e `tight` (coladas). Todas as tomadas geradas ficam em `public/videos/<vídeo>/takes/`, fora do git; a narração as reaproveita, então rodar de novo depois de uma rejeição não gera o que já existe.

## Ajustar a regra de escolha

`rejected` é o registro de onde a regra de escolha errou. Quando houver rejeições de alguns vídeos, compare a curva das tomadas rejeitadas com a das aceitas (as medidas `ending` e `pitchOffset` estão em cada tomada guardada) e ajuste os limites em `takes.ts`, com teste. A meta é o usuário marcar cada vez menos.

Pronto quando: cada limite alterado tem teste e `pnpm test` passa.

## Trocar a amostra de voz

O modelo usa `voice/reference.wav` inteira, e o tom da gravação passa para a narração. A amostra deve ter de 5 a 10 segundos, em ambiente silencioso, lida no tom de narrador que o usuário quer para o canal; mais longa que isso, a geração fica lenta e o clone piora. Trocar a amostra regera a narração inteira na execução seguinte.

O modelo precisa também do texto dito na amostra. Na primeira narração com uma amostra nova, o comando a transcreve com o Whisper e guarda o texto em `voice/reference.json`. Confira esse texto: se houver palavra errada, corrija o campo `text` à mão.

Pronto quando: o `text` de `voice/reference.json` diz o que a amostra diz, palavra por palavra.

## Mudar o ritmo

As pausas entre frases e entre cenas estão em `PACING`, em `src/narration/manifest.ts`. Valem para todos os vídeos; mexa ali só se o ritmo geral do canal precisar mudar, e avise o usuário. Para mudar o ritmo de um trecho, mude o texto: frases mais curtas, ou uma cena dividida em duas. O `speed` de `VOICE_MODEL` muda a velocidade da fala, mas existe para a frase caber inteira (`narracao-diagnostico.md`); mudar ele regera a narração de todos os vídeos.
