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

1. Gera o áudio quatro vezes com o OmniVoice na GPU, clonando a voz de `voice/reference.wav`, e mede cada geração: a altura e a curva do fim da frase.
2. Transcreve cada geração com o Whisper, compara com o roteiro e guarda o momento em que cada palavra é falada. A animação usa esses tempos como deixas.
3. Fica com a melhor: sem palavra errada, sem o fim cortado, com a curva que o lugar da frase pede e a altura próxima da amostra. Se a melhor ainda tem defeito, gera outra rodada, até três.

As escolhas que o usuário fez de ouvido no estúdio de voz (veja abaixo) valem acima dessa escolha.

O resultado fica em `public/videos/<vídeo>/`: os áudios em `narration/` e o manifesto `narration.json`, que dá a duração de cada cena. Essa pasta não vai para o git; ela é regerável a partir do roteiro.

Cada frase fica em cache. Mudou uma frase do roteiro, só ela é gerada de novo, então rode o comando sem medo depois de qualquer ajuste. A primeira execução baixa cerca de 5 GB de modelos.

## Ler o resultado

O comando termina com um resumo. Três avisos pedem ação:

**"frase(s) ainda diferem do roteiro"**: depois de três rodadas de tomadas, o Whisper continua ouvindo algo diferente do que está escrito. Pode ser erro do modelo de voz ou do próprio Whisper, que às vezes erra termos raros. Você não tem como ouvir o áudio: peça ao usuário para ouvir o arquivo indicado. Se a pronúncia estiver errada, mude a grafia em `narration` para como a palavra deve soar e rode de novo. Se estiver certa, registre que o usuário conferiu e siga.

**"frase(s) com o fim cortado"**: depois de três rodadas, nenhuma geração da frase terminou em silêncio, e a última palavra pode ter saído pela metade. O Whisper não serve de conferência aqui, porque costuma completar a palavra sozinho. Peça ao usuário para ouvir o fim do arquivo indicado. Se estiver cortado, mude o texto da frase em `narration` (qualquer mudança gera outra fala) e rode de novo. Se estiver inteiro, registre que o usuário conferiu e siga.

**"voz provisória"**: não existe `voice/reference.wav`, e a narração saiu com a amostra de teste. Serve para montar e revisar o vídeo, não para publicar. A skill `final-cut` barra o corte final nesse estado.

## Conferir de ouvido: o estúdio de voz

O modelo só recebe texto, e a entonação muda de uma geração para outra. A escolha automática (`src/narration/takes.ts`) fica com a tomada sem defeito cuja curva do fim serve à frase: a afirmação fecha caindo, a frase colada na seguinte fica em suspenso. Os limites dessa regra ainda não foram calibrados contra o ouvido do usuário, então a narração passa por uma conferência dele, feita para custar uns dez minutos por vídeo:

```bash
pnpm voice <vídeo>
```

Abre uma página em `http://localhost:4747`, com o modelo de voz e o Whisper carregados uma vez (cerca de 7,6 GB dos 8 GB da placa: não rode `pnpm narrate` nem um render ao mesmo tempo, e feche com Ctrl+C).

**O fluxo normal, em três passos:**

1. **Ouvir tudo**: o botão toca o vídeo inteiro, frase a frase, com as pausas que ele vai ter. A frase que está tocando fica destacada.
2. **Marcar**: na frase que soou errada, a tecla M (ou "✗ soou errado"). A escuta não para.
3. **Regerar marcadas**: a escolha automática decide de novo cada frase marcada, deixando de fora a tomada rejeitada e gerando uma rodada nova quando preciso (cerca de 30 s por rodada). A página passa a mostrar só as regeradas, para ouvir de novo. Repita até não marcar nenhuma.

A frase com três tomadas rejeitadas ganha o aviso "pede reescrita": o problema é do texto, e a correção é do roteiro, não de mais tomadas. Reescreva-a (pelo `diretor-criativo`, mantendo o sentido e as deixas) e avise o usuário do que mudou.

**O caso difícil**, em "editar à mão" de cada frase: editar o texto (vai direto para `script.json`; a página recusa a edição que deixaria o roteiro inválido e diz por quê), gerar tomadas, ouvir cada uma sozinha ou em contexto, usar a que soou certa e colar a frase na seguinte, o que encurta a pausa de 0,35 s (ou de 1 s, entre duas cenas) para 0,12 s.

**A pontuação é o comando da voz.** O texto é cortado em unidades de fala (`splitUtterances`, em `src/narration/text.ts`), cada uma gerada sozinha, e a escolha automática procura a curva que a pontuação pede:

| Pontuação | O que a voz faz |
|---|---|
| ponto, exclamação | fecha: a frase é gerada sozinha, termina caindo, e vem a pausa de 0,35 s |
| dois-pontos | para em suspenso: o que vem antes é gerado sozinho, termina sem cair, e vem a mesma pausa. Serve para anunciar uma citação, uma explicação ou um item |
| reticências | para em suspenso, como o dois-pontos |
| vírgula, travessão | um fôlego só: as duas partes vão juntas para o modelo |
| interrogação | a curva fica por conta do modelo |

Quando a fala sai emendada onde devia haver pausa, ou picada onde devia correr, a primeira correção é a pontuação do roteiro, não a tomada.

Para a frase de ligação, a que precisa sustentar a entonação: trocar o ponto por vírgula, dois-pontos ou travessão (as duas partes viram uma geração só); ou colar na próxima, que também muda a curva que a escolha automática procura.

**Onde tudo fica.** As escolhas vão para `src/videos/<vídeo>/voice.json`, que vai para o git e o `pnpm narrate` respeita: `takes` (escolhidas à mão), `rejected` (rejeitadas de ouvido) e `tight` (coladas). Todas as tomadas geradas ficam em `public/videos/<vídeo>/takes/`, fora do git; a narração as reaproveita, então rodar de novo depois de uma rejeição não gera o que já existe.

**O laço de melhoria.** `rejected` é o registro de onde a regra de escolha errou. Quando houver rejeições de alguns vídeos, compare a curva das tomadas rejeitadas com a das aceitas (as medidas `ending` e `pitchOffset` estão em cada tomada guardada) e ajuste os limites em `takes.ts`, com teste. A meta é o usuário marcar cada vez menos.

Onde a voz costuma errar a palavra: "não" e palavras terminadas em "-ão" perto do fim da frase, e "Então" no começo. Quando o conferidor acusar uma dessas e as tomadas novas não resolverem, mude a redação.

Depois de editar texto no estúdio, a cena pode precisar de ajuste: a duração muda e as deixas se movem. Rode `pnpm check-script <vídeo>` e confira os quadros.

## Amostra de voz

O modelo usa `voice/reference.wav` inteira, e o tom da gravação passa para a narração. A amostra deve ter de 5 a 10 segundos, em ambiente silencioso, lida no tom de narrador que o usuário quer para o canal; mais longa que isso, a geração fica lenta e o clone piora. A pasta `voice/` não vai para o git. Trocar a amostra regera a narração inteira na execução seguinte.

O modelo precisa também do texto dito na amostra. Na primeira narração com uma amostra nova, o comando a transcreve com o Whisper e guarda o texto em `voice/reference.json`. Confira esse texto: se houver palavra errada, corrija o campo `text` à mão.

Os pesos do OmniVoice são de uso não comercial (CC-BY-NC). O usuário escolheu o modelo sabendo disso; a skill `final-cut` o lembra na hora de publicar.

## Se o usuário reclamar da voz

Você não ouve o áudio: peça a frase e o que soa errado, e meça antes de mexer. O que já foi medido, testado e descartado com esta voz está em `diagnostico.md`, nesta pasta, uma seção por reclamação: voz sem energia ou mal-humorada, voz robótica ou diferente da amostra, fim de frase cortado ou sumindo. Leia a seção antes de mudar `VOICE_MODEL`, a amostra ou o texto.

## Ritmo

As pausas entre frases e entre cenas estão em `PACING`, em `src/narration/manifest.ts`. Valem para todos os vídeos; mexa ali só se o ritmo geral do canal precisar mudar, e avise o usuário. Para mudar o ritmo de um trecho, mude o texto: frases mais curtas, ou uma cena dividida em duas. O `speed` de `VOICE_MODEL` muda a velocidade da fala, mas existe para a frase caber inteira (`diagnostico.md`); mudar ele regera a narração de todos os vídeos.

## Cuidados

- A GPU tem 8 GB: não rode `pnpm narrate` e `pnpm music` ao mesmo tempo.
- Se o render ou o Studio disser que a narração está desatualizada, é porque o roteiro mudou depois dela. Rode `pnpm narrate <vídeo>` de novo.
- Depois de regerar, as cenas mudam de duração e as deixas mudam de quadro. A animação se ajusta sozinha, porque lê esses tempos do manifesto; ainda assim confira os quadros com `pnpm stills <vídeo>`.
