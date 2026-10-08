# Tasks

Cada grupo segue a skill dona do artefato: o texto, `diretor-criativo` (`etapas/roteiro`); a voz e a trilha, `producao`; os planos e as cenas, `diretor-de-arte`; o mapa de som, `diretor-de-som`. O vídeo é sempre `why-we-sleep`.

## 1. Texto

- [x] 1.1 Criar a branch `poda-dos-ecos` a partir de `main` e copiar `out/why-we-sleep/why-we-sleep.mp4` para `out/rascunho/why-we-sleep.antes.mp4`; conferir com `git status` que a árvore está limpa e que a cópia existe
- [x] 1.2 Reescrever em `script.json` a narração de `so-far` (veredito, no máximo o nome de cada jeito, e a resposta abrindo em "Para"), `nobody-escaped` (só a frase que encerra a procura), `one-of-them` (a abertura leva a quarta volta do refrão com o "nós"), `tonight` (a frase de Rechtschaffen como referência, com a condição), `gardner-sleeps` (sem a regra redita) e `older-than-brain` (sem "sem ter cérebro" na primeira frase); conferir que "quinhentos milhões" aparece uma vez na narração e que "nenhum animal estudado até hoje conseguiu parar de dormir" não se repete por inteiro
- [x] 1.3 Ajustar os `shots` das mesmas cenas ao texto novo: `so-far` com três planos, `nobody-escaped` com um, e as palavras de `cue` de `one-of-them`, `tonight` e `gardner-sleeps` tiradas das frases novas; conferir com `pnpm check-script why-we-sleep`
- [x] 1.4 Acionar o `editor` sobre o trecho de `gardner-sleeps` a `subscribe`, com a pergunta do que quem ouve perde ou ouve duas vezes, e o `checador` sobre as seis cenas mudadas; corrigir o que for bloqueante ou relevante e conferir cada cena contra os cenários de `specs/narration-returns/spec.md`
- [x] 1.5 Montar em `out/rascunho/poda-dos-ecos.md` o texto de leitura, com o antes e o depois de cada uma das seis cenas e a contagem de palavras, e levar ao usuário as quatro decisões dele que mudam (a quarta volta do refrão, a recapitulação de `so-far`, a citação de `tonight` e a trilha gerada de novo); seguir só com o aceite, e recusado, reescrever pela linha de parada
- [x] 1.6 Atualizar `script.md`: a quarta volta do refrão e as promessas em `Fio`, a nota visual do bloco 7 em `Estrutura`, a duração-alvo e uma entrada em `Versões` com o que saiu e por quê; conferir que nenhuma linha descreve uma frase que não existe mais

## 2. Voz

- [x] 2.1 Rodar `pnpm narrate why-we-sleep` e conferir na saída que só as frases mudadas foram geradas e as outras vieram do cache
- A conferência de ouvido da frase nova de `tonight` (antiga 2.2) passou para a 7.2: a frase é reescrita na segunda rodada.
- [x] 2.3 Anotar a duração nova do vídeo e de cada uma das seis cenas, a partir de `public/videos/why-we-sleep/narration.json`, para as tarefas de imagem e de som

## 3. Imagem e movimento

- [x] 3.1 `SoFarScene.tsx`: três planos (a fila com o X, as três molduras acendendo em sequência num plano aberto, o pedestal com a lupa); atualizar `joined` e `sets` de `so-far` em `index.tsx`; conferir com `pnpm scene why-we-sleep so-far` que as três molduras estão legíveis enquanto o veredito é dito
- [x] 3.2 `NobodyEscapedScene.tsx`: tirar o plano da linha do tempo, mantendo os exports `LineGroup`, `SeaStage` e `SearchPrelude`; atualizar o selo, `joined` e `sets` da cena em `index.tsx`; conferir com `pnpm lint` e com `pnpm scene why-we-sleep stockroom-solid nobody-escaped what-it-is` que a lupa entra como antes e que a linha do tempo de `what-it-is` não mudou
- [x] 3.3 `OneOfThemScene.tsx`: refazer a entrada a partir do palco do pedestal, no lugar da saída da linha do tempo, e as marcações sobre a abertura nova; conferir com `pnpm scene why-we-sleep nobody-escaped one-of-them` que nenhum quadro da troca fica só com o fundo
- [x] 3.4 `TonightScene.tsx`: refazer as marcações dos planos 1 a 3 sobre a frase nova (a etiqueta de nome, o braço erguido, o carimbo que treme e perde a cor); conferir com `pnpm scene why-we-sleep tonight` que o carimbo fecha quando o erro é dito e perde a cor na resposta
- [x] 3.5 `GardnerSleepsScene.tsx`: refazer as marcações do plano 3 sobre a frase curta; renderizar `gardner-sleeps` e `older-than-brain` e conferir que nenhum movimento ficou cortado pelo fim do plano
- [x] 3.6 Atualizar `score.md` nas seções `so-far`, `nobody-escaped`, `one-of-them`, `tonight`, `gardner-sleeps` e `older-than-brain`, e a lista de cenários que permanecem; conferir que os tempos escritos são os dos renders
- [x] 3.7 Acionar o `critico-de-movimento` sobre `so-far`, `nobody-escaped`, `one-of-them` e `tonight`, e o `critico-de-quadro` sobre os planos novos de `so-far`; corrigir o que for bloqueante ou relevante

## 4. Som

- [x] 4.1 Gerar de novo só a segunda parte da trilha, pela etapa `producao/etapas/trilha` (`pnpm music why-we-sleep 1 2`), mantendo o arquivo da primeira; conferir que `public/videos/why-we-sleep/music.json` dá à segunda parte o instante em que `but-what` começa na narração nova
- [x] 4.2 Rodar `pnpm sound why-we-sleep out/why-we-sleep/why-we-sleep.som.mp3`, apagar `out/why-we-sleep/som/` e rodar `pnpm critique why-we-sleep som`; conferir as medidas contra as registradas em `sound.md` e que o silêncio de `so-far` vai de "Para" ao fim da cena
- [x] 4.3 Atualizar em `sound.md` os instantes do mapa, a duração do silêncio de `so-far` e o som julgado; conferir que nenhum instante escrito é do vídeo antigo
- [x] 4.4 Levar o som ao usuário para ouvir; recusada a trilha, o conserto é de `diretor-de-som`, com outra semente na parte recusada

## 5. Conjunto

- [x] 5.1 Rodar `pnpm join why-we-sleep`; se ele acusar cenas com a duração antiga, rodar `pnpm scene` nelas e juntar de novo, até sair `out/why-we-sleep/why-we-sleep.mp4`
- [x] 5.2 `pnpm lint` e `pnpm test` passam
- [x] 5.3 Rodar `pnpm critique why-we-sleep` e conferir no trecho cada medida que saiu da faixa em relação ao render anterior
- [x] 5.4 Ler a narração final contra todos os cenários de `specs/narration-returns/spec.md` e anotar na conversa o resultado de cada um
- [x] 5.5 Levar o vídeo ao usuário ao lado de `out/rascunho/why-we-sleep.antes.mp4`, com a duração de antes e de depois e o que ficou de fora (a estrutura, as costuras e `debt-returns`)

## 6. Segunda rodada: texto do roteiro inteiro

Os grupos 1 a 5 são a primeira rodada, que o usuário recusou por ainda repetir. Daqui em diante vale a spec revista.

- [x] 6.1 Perguntar ao usuário se a primeira rodada pode ser commitada na branch `poda-dos-ecos`; com o sim, commitar, e conferir com `git status` que a árvore ficou limpa
- [x] 6.2 Refazer o inventário sobre `script.json` inteiro, em `out/rascunho/inventario-ecos.md`: para cada ideia da tabela da proposta e para as que a leitura achar, as cenas em que é dita e o que cada volta diz de novo; conferir que cada requisito de `specs/narration-returns/spec.md` tem as ocorrências dele listadas
- [x] 6.3 Reescrever a narração pelas decisões 3 a 6 do design: as aberturas de `maybe-brain`, `forced-awake`, `so-far` e `but-what` sem frase de posição; `debt-returns` sem anúncio; `jellyfish-debt` sem a regra redita; `forced-awake` e `tonight` sem reapresentar Rechtschaffen nem recitar a frase; `night-falls` e `last-to-know` sem redizer o gancho; `older-than-brain`, as ressalvas e o "terço da vida" pela spec; conferir com `pnpm check-script why-we-sleep`
- [x] 6.4 Ajustar os `shots` das cenas mudadas ao texto novo, mantendo o plano da fila dos ícones em cada virada e o gesto do bolso; conferir com `pnpm check-script why-we-sleep` e que nenhum plano ficou com menos de 1 segundo na estimativa
- [x] 6.5 Refazer a contagem do inventário sobre o texto novo e conferir cada cenário da spec; o que não passar volta à 6.3
- [x] 6.6 Acionar o `editor` sobre o roteiro inteiro, com a pergunta do que quem ouve escuta pela segunda vez e se alguém se perde entre capítulos sem a frase de posição, e o `checador` sobre as cenas mudadas; corrigir o que for bloqueante ou relevante
- [x] 6.7 Montar em `out/rascunho/roteiro-segunda-rodada.md` o roteiro inteiro em formato de leitura, com o que saiu marcado, a contagem de antes e de depois por ideia, a duração estimada e o que ficou de propósito; levar ao usuário e seguir só com o aceite
- [x] 6.8 Atualizar `script.md` (Fio, Voz, Estrutura, Simplificações e uma entrada em Versões com o que saiu e por quê); conferir que nenhuma linha descreve uma frase que não existe mais

## 7. Segunda rodada: voz

- [x] 7.1 Rodar `pnpm narrate why-we-sleep` e conferir na saída que só as frases mudadas foram geradas
- [x] 7.2 Conferir no relatório do Whisper cada frase nova; a que trocar ou perder palavra é reescrita mantendo o sentido, e as que só acusam nome próprio ou "-ão" vão listadas ao usuário com o caminho do arquivo, para o ouvido dele
- [x] 7.3 Anotar a duração nova do vídeo e de cada cena mudada, a partir de `public/videos/why-we-sleep/narration.json`

## 8. Segunda rodada: imagem e movimento

- [x] 8.1 Trecho de prova: `maybe-brain` com a fila dos ícones acontecendo sem frase própria; renderizar com `pnpm scene why-we-sleep maybe-brain` e conferir em tira de quadros que o X e o ícone que acende se leem; se não se lerem, pôr o silêncio curto na cena anterior e renderizar de novo
- [x] 8.2 Com a prova aceita na conferência, ajustar as outras cenas tocadas (um `motion-designer` por grupo de cenas, com listas de arquivos que não se cruzam; `index.tsx` é alterado na conversa); conferir com `pnpm lint` e com `pnpm scene` de cada uma que nenhum movimento é cortado pelo fim de um plano
- [x] 8.3 Conferir em quadros que a conta continua sendo guardada no bolso antes de sair dele em `jellyfish-debt` e em `gardner-sleeps`
- [x] 8.4 Atualizar `score.md` nas seções das cenas tocadas, com os tempos dos renders
- [x] 8.5 Acionar o `critico-de-movimento` sobre as cenas tocadas e as passagens entre capítulos; corrigir o que for bloqueante ou relevante

## 9. Segunda rodada: conjunto

- [x] 9.1 Rodar `pnpm sound why-we-sleep out/why-we-sleep/why-we-sleep.som.mp3` e conferir que a música está no arquivo (o volume num silêncio de fala, como a vinheta)
- [x] 9.2 Rodar `pnpm join why-we-sleep`, renderizando com `pnpm scene` as cenas que ele acusar, até sair o vídeo
- [x] 9.3 `pnpm lint` e `pnpm test` passam
- [x] 9.4 Levar o vídeo ao usuário com a contagem por ideia, a duração de antes e de depois, o aviso de que a música está fora de lugar até a mudança do som, e o que ainda se repete de propósito

## Workflow follow-up

- Abrir a mudança do som, `efeitos-em-sincronia-why-we-sleep`, que parte do tempo final desta: o primeiro leito gerado de novo, a música mais baixa e os efeitos em sincronia com a imagem.
- Com o vídeo aceito, fazer a pergunta da retrospectiva: se a regra de dizer cada ideia uma vez e deixar a posição com a tela vale para os próximos vídeos. Com o "sim", reescrever os trechos de `diretor-criativo/conceito/ouvinte` e `escrita/fio` que ensinam o mapa falado, a frase de posição e a retomada redita, num commit só.
- Arquivar a mudança depois do aceite do usuário.
