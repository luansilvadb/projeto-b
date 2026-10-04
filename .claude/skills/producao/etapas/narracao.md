---
name: narracao
description: "Procedimento da etapa de narração neste repositório: o comando, a leitura dos avisos, a conferência de ouvido no estúdio de voz e a pontuação que comanda a fala."
---

# Narração de um vídeo

Terceira etapa, depois do roteiro aprovado (skill `diretor-criativo`): a 1ª aprovação está em `src/videos/<vídeo>/approvals.md`; se não estiver, pergunte ao usuário antes de gerar.

Antes da primeira geração de um vídeo, diga ao usuário que os pesos do OmniVoice são de uso não comercial (CC-BY-NC): monetizar um vídeo narrado com ele foge da licença, e trocar de modelo depois não muda os vídeos já publicados. Se o vídeo é para monetizar, seguir com esta voz é decisão dele, tomada antes de gerar.

Um comando faz tudo:

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

**"voz provisória"**: não existe `voice/reference.wav`, e a narração saiu com a amostra de teste. Serve para montar e revisar o vídeo, não para publicar. A etapa `corte-final` barra o vídeo nesse estado.

## Conferir de ouvido: o estúdio de voz

O modelo só recebe texto, e a entonação muda de uma geração para outra. A escolha automática (`src/narration/takes.ts`) fica com a tomada sem defeito cuja curva do fim serve à frase: a afirmação fecha caindo, a frase colada na seguinte fica em suspenso. Os limites dessa regra ainda não foram calibrados contra o ouvido do usuário, então a narração passa por uma conferência dele, feita para custar uns dez minutos por vídeo:

```bash
pnpm voice <vídeo>
```

Abre uma página em `http://localhost:4747`, com o modelo de voz e o Whisper carregados uma vez (cerca de 7,6 GB dos 8 GB da placa; feche com Ctrl+C).

**O fluxo normal, em três passos:**

1. **Ouvir tudo**: o botão toca o vídeo inteiro, frase a frase, com as pausas que ele vai ter. A frase que está tocando fica destacada.
2. **Marcar**: na frase que soou errada, a tecla M (ou "✗ soou errado"). A escuta não para.
3. **Regerar marcadas**: a escolha automática decide de novo cada frase marcada, deixando de fora a tomada rejeitada e gerando uma rodada nova quando preciso (cerca de 30 s por rodada). A página passa a mostrar só as regeradas, para ouvir de novo. Repita até não marcar nenhuma.

Fora do fluxo normal, leia a seção do caso em `narracao-voz.md`, nesta pasta: editar uma frase à mão no estúdio, onde ficam as escolhas e as tomadas, ajustar a regra de escolha com as rejeições, trocar a amostra de voz e mudar o ritmo.

A frase com três tomadas rejeitadas ganha o aviso "pede reescrita": o problema é do texto, e a correção é do roteiro, não de mais tomadas. Reescreva-a (pelo `diretor-criativo`, mantendo o sentido e as deixas) e avise o usuário do que mudou.

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

Onde a voz costuma errar a palavra: "não" e palavras terminadas em "-ão" perto do fim da frase, e "Então" no começo. Quando o conferidor acusar uma dessas e as tomadas novas não resolverem, mude a redação.

Depois de editar texto no estúdio, a cena pode precisar de ajuste: a duração muda e as deixas se movem. Rode `pnpm check-script <vídeo>` e confira os quadros.

## Se o usuário reclamar da voz

Você não ouve o áudio: peça a frase e o que soa errado, e meça antes de mexer. O que já foi medido, testado e descartado com esta voz está em `narracao-diagnostico.md`, nesta pasta, uma seção por reclamação: voz sem energia ou mal-humorada, voz robótica ou diferente da amostra, fim de frase cortado ou sumindo. Leia a seção antes de mudar `VOICE_MODEL`, a amostra ou o texto.

## Cuidados

- Se o render ou o Studio disser que a narração está desatualizada, é porque o roteiro mudou depois dela. Rode `pnpm narrate <vídeo>` de novo.
- Depois de regerar, as cenas mudam de duração e as deixas mudam de quadro. A animação se ajusta sozinha, porque lê esses tempos do manifesto; ainda assim confira os quadros com `pnpm stills <vídeo>`.
