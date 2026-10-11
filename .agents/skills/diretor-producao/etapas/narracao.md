# Narração de um vídeo

O que a geração precisa:

- `src/videos/<vídeo>/script.json` existe e passa no `pnpm check-script <vídeo>`;
- toda cena tem `shots`: o tipo em `src/narration/script.ts` recusa a cena sem plano, e o `pnpm narrate` lê o roteiro por ele;
- o texto está estável o bastante para o custo desta geração: minutos de GPU, e o tempo de tudo que for animado e sonorizado sobre ela.

O terceiro item é juízo de custo, e não um estado guardado em algum lugar: não há campo nem registro que diga "estável". Se você sabe de uma decisão editorial aberta que pode trocar o texto inteiro, diga isso antes de gerar; ela é da skill `diretor-criativo` (`etapas/roteiro.md`, "Antes de gerar a voz do conjunto"). Fora isso, gere: a frase que mudar depois regera só ela.

## Quem mexe no texto

A produção não edita `narration`: palavra, pontuação e redação são do `diretor-criativo`, inclusive a vírgula trocada para a voz respirar e a grafia mudada para a palavra soar certa. O que a produção ajusta é a execução da voz: gerar e regerar tomadas, rejeitar e escolher de ouvido, colar uma frase na seguinte e os parâmetros da voz pelo `narracao-diagnostico.md`. Ela pode propor uma mudança de texto, sem aplicá-la.

Quando o defeito é do texto, devolva ao `diretor-criativo` a frase, o que o usuário ouviu, a medida ou o aviso que localiza o defeito e, se houver, a sugestão. Ele reescreve pela unidade dona e confere a mudança pela tabela de reteste de `etapas/roteiro.md` (na pasta dele, "Depois de corrigir, reteste o risco que a mudança pode ter reintroduzido"); só então o texto entra em `script.json`, e o `pnpm narrate` regera só a frase que mudou. Não é uma etapa nova nem um aceite: é o mesmo caminho de qualquer correção do roteiro.

Antes da primeira geração de um vídeo, diga ao usuário que os pesos do OmniVoice são de uso não comercial (CC-BY-NC): monetizar um vídeo narrado com ele foge da licença, e trocar de modelo depois não muda os vídeos já publicados. Se o vídeo é para monetizar, seguir com esta voz é decisão dele, tomada antes de gerar.

## 1. Gerar

`pnpm narrate <vídeo>` faz, frase por frase do roteiro:

1. Gera o áudio quatro vezes com o OmniVoice na GPU, clonando a voz de `voice/reference.wav`, e mede cada geração: a altura e a curva do fim da frase.
2. Transcreve cada geração com o Whisper, compara com o roteiro e guarda o momento em que cada palavra é falada. A animação usa esses tempos como deixas.
3. Fica com a melhor: sem palavra errada, sem o fim cortado, com a curva que o lugar da frase pede e a altura próxima da amostra. Se a melhor ainda tem defeito, gera outra rodada, até três.

O resultado fica em `public/videos/<vídeo>/`, fora do git e regerável a partir do roteiro: os áudios em `narration/` e o manifesto `narration.json`, que dá a duração de cada cena. Cada frase fica em cache: mudou uma frase do roteiro, só ela é gerada de novo.

## 2. Ler os avisos

Dois avisos do resumo pedem ação:

- **"frase(s) ainda diferem do roteiro"**: depois de três rodadas, o Whisper continua ouvindo algo diferente do que está escrito. O erro pode ser do modelo de voz ou do próprio Whisper, que às vezes erra termos raros. Peça ao usuário para ouvir o arquivo indicado. Pronúncia errada numa tomada só: rejeite-a e gere outra. Pronúncia errada em todas: a grafia decide a pronúncia, e ela é do texto; devolva a palavra ao `diretor-criativo` ("Quem mexe no texto") e rode de novo quando a grafia voltar. Pronúncia certa: registre que o usuário conferiu e siga.
- **"frase(s) com o fim cortado"**: depois de três rodadas, nenhuma geração terminou em silêncio, e a última palavra pode ter saído pela metade. O Whisper não serve de conferência aqui, porque costuma completar a palavra sozinho. Peça ao usuário para ouvir o fim do arquivo indicado. Cortado: rejeite a tomada, gere outras e siga `narracao-diagnostico.md` ("Se o fim de uma frase soar cortado ou sumindo"); se o corte continuar com o texto como está, devolva a frase ao `diretor-criativo` com a medida ("Quem mexe no texto"). Inteiro: registre que o usuário conferiu e siga.

Pronto quando: cada frase acusada foi ouvida pelo usuário, e corrigida ou registrada como conferida.

## 3. Conferir de ouvido no estúdio de voz

O modelo só recebe texto, e a entonação muda de uma geração para outra. Os limites da escolha automática (`src/narration/takes.ts`) ainda não foram calibrados contra o ouvido do usuário, então a narração passa por uma conferência dele, feita para custar uns dez minutos por vídeo.

`pnpm voice <vídeo>` abre uma página em `http://localhost:4747`, com o modelo de voz e o Whisper carregados uma vez (cerca de 7,6 GB dos 8 GB da placa; feche com Ctrl+C). O fluxo do usuário:

1. **Ouvir tudo**: o botão toca o vídeo inteiro, frase a frase, com as pausas que ele vai ter. A frase que está tocando fica destacada.
2. **Marcar**: na frase que soou errada, a tecla M (ou "✗ soou errado"). A escuta não para.
3. **Regerar marcadas**: a escolha automática decide de novo cada frase marcada, deixando de fora a tomada rejeitada e gerando uma rodada nova quando preciso (cerca de 30 s por rodada). A página passa a mostrar só as regeradas, para ouvir de novo. Repita até não marcar nenhuma.

A frase que o usuário diz estar mal escrita volta ao `diretor-criativo` na primeira vez, sem gastar tomadas nela: outra tomada não conserta o texto. A frase com três tomadas rejeitadas ganha o aviso "pede reescrita", que é o mesmo retorno para o caso em que ninguém tinha apontado o texto. Nos dois, o caminho é o de "Quem mexe no texto", e o usuário fica sabendo o que mudou.

Pronto quando: o usuário ouviu o vídeo inteiro e a última escuta terminou sem frase marcada.

## 4. Conferir as cenas

Depois de regerar, as cenas mudam de duração e as deixas mudam de quadro. A animação se ajusta sozinha, porque lê esses tempos do manifesto; ainda assim confira os quadros com `pnpm stills <vídeo>`. Se o texto mudou, a mudança veio do `diretor-criativo`: rode antes `pnpm check-script <vídeo>`.

## A pontuação é o comando da voz

O texto é cortado em unidades de fala (`splitUtterances`, em `src/narration/text.ts`), cada uma gerada sozinha, e a escolha automática procura a curva que a pontuação pede:

| Pontuação | O que a voz faz |
|---|---|
| ponto, exclamação | fecha: a frase é gerada sozinha, termina caindo, e vem a pausa de 0,35 s |
| dois-pontos | para em suspenso: o que vem antes é gerado sozinho, termina sem cair, e vem a mesma pausa. Serve para anunciar uma citação, uma explicação ou um item |
| reticências | para em suspenso, como o dois-pontos |
| vírgula, travessão | não corta a geração: as duas partes vão juntas para o modelo, que faz uma pausa curta ali, dentro do mesmo fôlego |
| interrogação | a curva fica por conta do modelo |

Onde a vírgula entra é critério de um lugar só: a etapa `roteiro` da skill `diretor-criativo` ("Narração: escreva para o ouvido"), só onde quem fala pararia. A tabela diz o que a voz faz com cada sinal; ela serve para diagnosticar, e não autoriza a produção a trocar o sinal.

- Fala emendada onde devia haver pausa, ou picada onde devia correr: a causa costuma ser a pontuação, e não a tomada. Devolva ao `diretor-criativo` a frase e o sinal que a tabela aponta ("Quem mexe no texto").
- Frase de ligação, a que precisa sustentar a entonação: da execução, cole-a na próxima, o que muda a curva que a escolha automática procura. Se não bastar, a saída é de pontuação (vírgula ou travessão, que fazem das duas partes uma geração só, ou dois-pontos, que gera a primeira sozinha e em suspenso) e vai como proposta ao `diretor-criativo`.
- A voz costuma errar "não" e palavras terminadas em "-ão" perto do fim da frase, e "Então" no começo. Quando o conferidor acusar uma dessas e as tomadas novas não resolverem, devolva a frase ao `diretor-criativo` com esse diagnóstico.
