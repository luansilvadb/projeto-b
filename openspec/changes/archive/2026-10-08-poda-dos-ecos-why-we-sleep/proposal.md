# Proposal

## Why

O roteiro do `why-we-sleep` repete as mesmas ideias do começo ao fim, e isso cansa quem ouve e dá motivo para sair do vídeo. O usuário apontou isso duas vezes: primeiro pelos "quinhentos milhões de anos", ditos no gancho e no fechamento; depois da primeira poda, pela frase de Rechtschaffen sobre o maior erro da evolução, que continua voltando. A segunda recusa mostrou que a primeira rodada tratou um sintoma: podou cinco cenas e deixou de fora, para poupar planos já animados, repetições que estão no roteiro inteiro.

A contagem no texto que saiu da primeira rodada:

| Ideia | Cenas em que é dita |
|---|---|
| A posição no caminho ("o primeiro jeito", "o segundo também falhou", "falta…") | 10 |
| A cobrança (a regra é explicada três vezes) | 8 |
| "Parar de dormir" | 6 |
| Sem cérebro (três vezes só em `older-than-brain`) | 5 |
| O perigo de não perceber quem chega | 5 |
| Rechtschaffen e o "maior erro" | 3 |
| "Um terço da vida", "tudo indica", "ainda não se sabe" | 3 cada |

A causa é de método: o roteiro foi escrito com mapa falado, frase de posição a cada virada e retomadas reditas, e a primeira rodada manteve isso.

## What Changes

A mudança passa a ser uma passada no roteiro inteiro, com uma regra: cada ideia é dita uma vez; só volta quando a volta diz algo novo; e quem lembra em que parte do caminho o vídeo está é a tela, com a fila dos cinco ícones, e não a fala.

**Primeira rodada, já aplicada** (cinco cenas, de 1.480 para 1.421 palavras): `so-far` deixou de recontar o resultado de cada capítulo; `nobody-escaped` perdeu os quinhentos milhões e a resposta repetida; `one-of-them` leva a volta ao "nós"; `tonight` e `gardner-sleeps` encurtaram.

**Segunda rodada, a fazer:**

- **Rechtschaffen é apresentado uma vez**, no gancho, com a frase dele. Em `forced-awake` sai o aposto "o pesquisador de Chicago que falava no maior erro da evolução". Em `tonight` a resposta ao "erro" é dita sem recitar a frase nem o nome; o quadro-negro do gancho, na tela, faz a ligação.
- **Cada capítulo abre pelo jeito novo**, sem redizer que o anterior falhou: `maybe-brain` perde "Dormir menos, o primeiro jeito, tem limite", `forced-awake` perde "O segundo jeito também falhou", e `so-far` deixa de nomear os três jeitos, que a primeira rodada tinha posto de volta. O X em cada ícone da fila é quem diz que o jeito falhou.
- **A regra da cobrança é explicada uma vez**, no bloco 2. `debt-returns` perde o anúncio ("essa cobrança volta duas vezes neste vídeo") e a recapitulação; `jellyfish-debt` nomeia a cobrança sem redizer a regra, como `gardner-sleeps` já faz.
- **O perigo de dormir é mostrado uma vez.** `night-falls` e `last-to-know` deixam de redizer o que o gancho disse ("quase sem perceber quem chega perto").
- **`older-than-brain`** diz "sem cérebro" uma vez fora do refrão, sem perder a palavra que dá o tempo do gesto de guardar a conta.
- **`but-what`** deixa de abrir pela resposta que `so-far` acabou de dar ("Se nenhum animal consegue parar").
- **As ressalvas** "tudo indica" e "ainda não se sabe" ficam uma vez cada.
- **"Um terço da vida"** fica no gancho e numa volta só, no fechamento.
- **Depois do texto**: voz das frases mudadas, planos e cenas das cenas tocadas (inclusive as que têm o plano da fila dos ícones), e o vídeo montado com som provisório.

Ficam, por decisão do usuário nesta revisão: o mapa dito uma vez em `five-parts`; as três voltas do refrão (a elefanta, quem vive sem cérebro, nenhum animal estudado), porque cada uma diz algo novo; e a estrutura do vídeo.

A estimativa da segunda rodada é de 150 a 200 palavras a menos, cerca de um minuto, em 12 a 15 cenas.

Fora do escopo:

- **O som.** A música (o primeiro leito, que o usuário recusou; o nível sob a fala) e os efeitos sonoros em sincronia com a imagem são outra mudança, `efeitos-em-sincronia-why-we-sleep`, que vem depois desta porque depende do tempo final da fala. Esta mudança não gera trilha de novo.
- A estrutura do vídeo: a resposta continua no fim do bloco 5 e o bloco da memória continua depois dela.
- Fatos novos, pesquisa, título e thumbnail.

### Decisões do usuário que esta mudança altera

Cada uma está em `script.md`, aprovada na oitava versão. O texto novo vai ao usuário, em formato de leitura, antes de gerar a voz:

- a posição dita a cada virada e as retomadas reditas, que eram o método da sétima versão;
- a promessa plantada "essa cobrança volta duas vezes neste vídeo";
- a frase de Rechtschaffen retomada no bloco 5 e redita no fechamento;
- a recapitulação falada em `so-far` e a quarta volta do refrão.

## Capabilities

### New Capabilities

- `narration-returns`: o que volta na narração de um vídeo diz algo novo; uma conclusão, uma regra, um número e uma pessoa são apresentados uma vez, e a posição no caminho fica com a tela.

### Modified Capabilities

Nenhuma: `shared-drawings` trata de desenho e não muda.

## Impact

- Texto (skill `diretor-criativo`): `src/videos/why-we-sleep/script.json` (a narração de 12 a 15 cenas; as 42 cenas e os `id` ficam) e `script.md` (fio, voz, estrutura, versões).
- Imagem e movimento (skill `diretor-de-arte`): os `shots` e os componentes das cenas tocadas, entre elas as que abrem na fila dos ícones (`debt-returns`, `maybe-brain`, `forced-awake`, `so-far`, `but-what`), e `score.md`. O plano do bolso, em `debt-returns`, precisa continuar existindo: é de lá que a conta sai em `jellyfish-debt` e em `gardner-sleeps`.
- Voz (skill `producao`): `pnpm narrate why-we-sleep` gera as frases mudadas; as outras vêm do cache.
- Som: nenhuma geração nesta mudança. O vídeo é montado com a trilha que existe, para conferir texto e imagem, e os instantes de `sound.md` ficam para a mudança do som.
- Código compartilhado: `src/video/NarratedVideo.tsx` perdeu, na primeira rodada, o `hidden` da sequência da trilha, posto por engano no commit `d9f39ec`, que tirava a música de todo render do som. Testes e dependências: nenhum.
- Skills: com o vídeo aceito, a lição vai às unidades `conceito/ouvinte` e `escrita/fio` da skill `diretor-criativo`, que hoje ensinam o método que produziu a repetição.
