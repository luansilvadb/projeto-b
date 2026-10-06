# Narração de um vídeo

Terceira etapa, depois do roteiro aprovado (skill `diretor-criativo`): a 1ª aprovação está em `src/videos/<vídeo>/approvals.md`; se não estiver, pergunte ao usuário antes de gerar.

Antes da primeira geração de um vídeo, diga ao usuário que os pesos do OmniVoice são de uso não comercial (CC-BY-NC): monetizar um vídeo narrado com ele foge da licença, e trocar de modelo depois não muda os vídeos já publicados. Se o vídeo é para monetizar, seguir com esta voz é decisão dele, tomada antes de gerar.

## 1. Gerar

`pnpm narrate <vídeo>` faz, frase por frase do roteiro:

1. Gera o áudio quatro vezes com o OmniVoice na GPU, clonando a voz de `voice/reference.wav`, e mede cada geração: a altura e a curva do fim da frase.
2. Transcreve cada geração com o Whisper, compara com o roteiro e guarda o momento em que cada palavra é falada. A animação usa esses tempos como deixas.
3. Fica com a melhor: sem palavra errada, sem o fim cortado, com a curva que o lugar da frase pede e a altura próxima da amostra. Se a melhor ainda tem defeito, gera outra rodada, até três.

O resultado fica em `public/videos/<vídeo>/`, fora do git e regerável a partir do roteiro: os áudios em `narration/` e o manifesto `narration.json`, que dá a duração de cada cena. Cada frase fica em cache: mudou uma frase do roteiro, só ela é gerada de novo.

## 2. Ler os avisos

Dois avisos do resumo pedem ação:

- **"frase(s) ainda diferem do roteiro"**: depois de três rodadas, o Whisper continua ouvindo algo diferente do que está escrito. O erro pode ser do modelo de voz ou do próprio Whisper, que às vezes erra termos raros. Peça ao usuário para ouvir o arquivo indicado. Pronúncia errada: mude a grafia em `narration` para como a palavra deve soar e rode de novo. Pronúncia certa: registre que o usuário conferiu e siga.
- **"frase(s) com o fim cortado"**: depois de três rodadas, nenhuma geração terminou em silêncio, e a última palavra pode ter saído pela metade. O Whisper não serve de conferência aqui, porque costuma completar a palavra sozinho. Peça ao usuário para ouvir o fim do arquivo indicado. Cortado: mude o texto da frase em `narration` (qualquer mudança gera outra fala) e rode de novo. Inteiro: registre que o usuário conferiu e siga.

Pronto quando: cada frase acusada foi ouvida pelo usuário, e corrigida ou registrada como conferida.

## 3. Conferir de ouvido no estúdio de voz

O modelo só recebe texto, e a entonação muda de uma geração para outra. Os limites da escolha automática (`src/narration/takes.ts`) ainda não foram calibrados contra o ouvido do usuário, então a narração passa por uma conferência dele, feita para custar uns dez minutos por vídeo.

`pnpm voice <vídeo>` abre uma página em `http://localhost:4747`, com o modelo de voz e o Whisper carregados uma vez (cerca de 7,6 GB dos 8 GB da placa; feche com Ctrl+C). O fluxo do usuário:

1. **Ouvir tudo**: o botão toca o vídeo inteiro, frase a frase, com as pausas que ele vai ter. A frase que está tocando fica destacada.
2. **Marcar**: na frase que soou errada, a tecla M (ou "✗ soou errado"). A escuta não para.
3. **Regerar marcadas**: a escolha automática decide de novo cada frase marcada, deixando de fora a tomada rejeitada e gerando uma rodada nova quando preciso (cerca de 30 s por rodada). A página passa a mostrar só as regeradas, para ouvir de novo. Repita até não marcar nenhuma.

A frase com três tomadas rejeitadas ganha o aviso "pede reescrita": o problema é do texto, e a correção é do roteiro, não de mais tomadas. Reescreva-a (pelo `diretor-criativo`, mantendo o sentido e as deixas) e avise o usuário do que mudou.

Pronto quando: o usuário ouviu o vídeo inteiro e a última escuta terminou sem frase marcada.

## 4. Conferir as cenas

Depois de regerar, as cenas mudam de duração e as deixas mudam de quadro. A animação se ajusta sozinha, porque lê esses tempos do manifesto; ainda assim confira os quadros com `pnpm stills <vídeo>`. Se o texto foi editado no estúdio, rode antes `pnpm check-script <vídeo>`.

## A pontuação é o comando da voz

O texto é cortado em unidades de fala (`splitUtterances`, em `src/narration/text.ts`), cada uma gerada sozinha, e a escolha automática procura a curva que a pontuação pede:

| Pontuação | O que a voz faz |
|---|---|
| ponto, exclamação | fecha: a frase é gerada sozinha, termina caindo, e vem a pausa de 0,35 s |
| dois-pontos | para em suspenso: o que vem antes é gerado sozinho, termina sem cair, e vem a mesma pausa. Serve para anunciar uma citação, uma explicação ou um item |
| reticências | para em suspenso, como o dois-pontos |
| vírgula, travessão | um fôlego só: as duas partes vão juntas para o modelo |
| interrogação | a curva fica por conta do modelo |

- Fala emendada onde devia haver pausa, ou picada onde devia correr: a primeira correção é a pontuação do roteiro, não a tomada.
- Frase de ligação, a que precisa sustentar a entonação: troque o ponto por vírgula ou travessão (as duas partes viram uma geração só) ou por dois-pontos (a primeira parte é gerada sozinha e termina em suspenso); ou cole-a na próxima, que também muda a curva que a escolha automática procura.
- A voz costuma errar "não" e palavras terminadas em "-ão" perto do fim da frase, e "Então" no começo. Quando o conferidor acusar uma dessas e as tomadas novas não resolverem, mude a redação.
