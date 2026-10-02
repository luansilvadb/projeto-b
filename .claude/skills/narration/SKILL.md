---
name: narration
description: Gera a narração de um vídeo com a voz clonada localmente (OmniVoice), confere cada frase com o Whisper e grava o tempo de cada palavra. Use sempre que for preciso gerar ou regerar a narração depois de um roteiro aprovado ou alterado, corrigir uma palavra mal pronunciada, trocar a amostra de voz, ou quando um render reclamar de narração ausente ou desatualizada.
---

# Narração de um vídeo

Terceira etapa, depois do roteiro aprovado (`script`). Um comando faz tudo:

```bash
pnpm narrate <vídeo>
```

O que ele faz, frase por frase do roteiro:

1. Gera o áudio quatro vezes com o OmniVoice na GPU, clonando a voz de `voice/reference.wav`. Descarta as gerações em que a fala saiu cortada no fim e fica, entre as inteiras, com a de altura mais próxima da amostra.
2. Transcreve o áudio com o Whisper e compara com o roteiro. Se alguma palavra saiu diferente, ou se nenhuma das quatro gerações saiu inteira, gera de novo com outras sementes, até três tentativas, e fica com a melhor.
3. Guarda o momento em que cada palavra é falada. A animação usa esses tempos como deixas.

O resultado fica em `public/videos/<vídeo>/`: os áudios em `narration/` e o manifesto `narration.json`, que dá a duração de cada cena. Essa pasta não vai para o git; ela é regerável a partir do roteiro.

Cada frase fica em cache. Mudou uma frase do roteiro, só ela é gerada de novo, então rode o comando sem medo depois de qualquer ajuste. A primeira execução baixa cerca de 5 GB de modelos.

## Ler o resultado

O comando termina com um resumo. Três avisos pedem ação:

**"frase(s) ainda diferem do roteiro"**: depois de três tentativas, o Whisper continua ouvindo algo diferente do que está escrito. Pode ser erro do modelo de voz ou do próprio Whisper, que às vezes erra termos raros. Você não tem como ouvir o áudio: peça ao usuário para ouvir o arquivo indicado. Se a pronúncia estiver errada, mude a grafia em `narration` para como a palavra deve soar e rode de novo. Se estiver certa, registre que o usuário conferiu e siga.

**"frase(s) com o fim cortado"**: depois de três tentativas, nenhuma geração da frase terminou em silêncio, e a última palavra pode ter saído pela metade. O Whisper não serve de conferência aqui, porque costuma completar a palavra sozinho. Peça ao usuário para ouvir o fim do arquivo indicado. Se estiver cortado, mude o texto da frase em `narration` (qualquer mudança gera outra fala) e rode de novo. Se estiver inteiro, registre que o usuário conferiu e siga.

**"voz provisória"**: não existe `voice/reference.wav`, e a narração saiu com a amostra de teste. Serve para montar e revisar o vídeo, não para publicar. A skill `final-cut` barra o corte final nesse estado.

## Amostra de voz

O modelo usa `voice/reference.wav` inteira, e o tom da gravação passa para a narração. A amostra deve ter de 5 a 10 segundos, em ambiente silencioso, lida no tom de narrador que o usuário quer para o canal; mais longa que isso, a geração fica lenta e o clone piora. A pasta `voice/` não vai para o git. Trocar a amostra regera a narração inteira na execução seguinte.

O modelo precisa também do texto dito na amostra. Na primeira narração com uma amostra nova, o comando a transcreve com o Whisper e guarda o texto em `voice/reference.json`. Confira esse texto: se houver palavra errada, corrija o campo `text` à mão.

Os pesos do OmniVoice são de uso não comercial (CC-BY-NC). O usuário escolheu o modelo sabendo disso; a skill `final-cut` o lembra na hora de publicar.

## Se a voz soar robótica ou diferente da amostra

Você não ouve o áudio: peça ao usuário para dizer o que soa diferente, e meça antes de mexer. O que já se sabe desta voz:

- O que o usuário chama de robótico é entonação monótona. A amostra varia 4,9 semitons em torno da própria mediana; o OmniVoice puro devolve 3,3, e isso ele rejeitou. Com `intonation: 1.3` em `VOICE_MODEL` (`scripts/narrate.ts`), a amostra vai para o modelo com a entonação ampliada e o clone sai com cerca de 4,0, que ele aprovou. Com 1,45 a fala fica mais viva, mas a altura passa a variar demais de uma frase para outra.
- A altura muda de uma geração para outra. Por isso cada frase é gerada `takesPerAttempt` vezes e fica a mais próxima da amostra entre as que saíram inteiras. Nas três frases do demo isso deixa cada frase a menos de meio semitom dela; numa avaliação com 16 frases a média foi 0,8 semitom, com uma frase acima de 2. Se o usuário notar a altura mudando de uma frase para outra, aumente `takesPerAttempt`: com duas gerações a média era 1,4 semitom. Custa tempo de geração na mesma proporção.
- Os demais parâmetros do modelo (passos, orientação, temperatura) não mudaram timbre, altura nem entonação nas medidas.
- O modelo gera a 24 kHz: o brilho acima de 12 kHz que a amostra tiver não aparece no clone.

Outros modelos já foram testados com esta amostra e descartados pelo usuário, de ouvido: Chatterbox pt-BR (outra pessoa, robótico), Qwen3-TTS (sotaque de Portugal) e F5-TTS pt-BR (altura errada e palavras trocadas).

## Se o fim de uma frase soar cortado ou sumindo

Você não ouve o áudio: peça ao usuário a frase e a palavra, e meça o fim do arquivo antes de mexer. O que já se sabe:

- O OmniVoice gera cada frase com uma duração fixa, que ele estima pelo número de letras do texto em relação à amostra. Quando a fala não cabe, ela vai até o último instante do áudio e a última sílaba sai cortada. É defeito conhecido do modelo (issue 245 do repositório `k2-fsa/OmniVoice`), sem correção na versão 0.2.1.
- O sinal de que a frase saiu inteira é o áudio cru do modelo terminar em silêncio (`tools/narration/silence.py`). Só essas gerações entram na escolha.
- `speed: 0.9` em `VOICE_MODEL` (`scripts/narrate.ts`) dá folga à duração e deixa a fala uns 7% mais lenta. Numa avaliação com 16 frases, terminaram inteiras 38% das gerações sem folga, 66% com 0,9 e 78% com 0,85 (fala 11% mais lenta); com 0,8 não melhora. Mesmo com folga uma parte das gerações sai cortada: o que resolve é descartá-las, não só a folga.
- O pós-processamento padrão do OmniVoice aplica um fade de 0,1 s no fim do áudio, que apagava a última sílaba das gerações cortadas. O `tts.py` pede o áudio cru e corta ele mesmo o silêncio das pontas.

## Ritmo

As pausas entre frases e entre cenas estão em `PACING`, em `src/narration/manifest.ts`. Valem para todos os vídeos; mexa ali só se o ritmo geral do canal precisar mudar, e avise o usuário. Para mudar o ritmo de um trecho, mude o texto: frases mais curtas, ou uma cena dividida em duas. O `speed` de `VOICE_MODEL` muda a velocidade da fala, mas existe para a frase caber inteira (seção acima); mudar ele regera a narração de todos os vídeos.

## Cuidados

- A GPU tem 8 GB: não rode `pnpm narrate` e `pnpm music` ao mesmo tempo.
- Se o render ou o Studio disser que a narração está desatualizada, é porque o roteiro mudou depois dela. Rode `pnpm narrate <vídeo>` de novo.
- Depois de regerar, as cenas mudam de duração e as deixas mudam de quadro. A animação se ajusta sozinha, porque lê esses tempos do manifesto; ainda assim confira os quadros com `pnpm stills <vídeo>`.
