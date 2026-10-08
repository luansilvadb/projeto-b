# Tasks

O trabalho de imagem segue a skill `diretor-de-arte`. `<cena>` é o `id` do roteiro; os quadros de conferência saem de `pnpm scene why-we-sleep <cena>` e `pnpm stills why-we-sleep`.

## 1. Elefanta

- [x] 1.1 Criar a branch `acabamento-unico` a partir de `main`; conferir com `git status` que a árvore está limpa das mudanças desta tarefa
- [x] 1.2 Em `src/art/Elephant.tsx`, apagar o desenho antigo e a prop `finish`, deixando a construção do piloto como a única; conferir que `ElephantFinish` deixou de existir e que o arquivo não tem mais ramo por `finish`
- [x] 1.3 Em `palette.ts`, dar às cores do acabamento os nomes `elephant` e `elephantNight` e apagar `elephantFinish` e `elephantNightFinish`; atualizar `Herd.tsx` (uma mistura dia/noite só), `Timeline.tsx`, `MaybeBrainScene`, `OlderThanBrainScene`, `OneOfThemScene`, `SoFarScene` e `Rats.tsx`; conferir com `pnpm lint`
- [x] 1.4 Em `Elephant.test.ts`, apagar o teste da tromba do animatic e manter o da construção única; conferir com `pnpm vitest run src/art/Elephant.test.ts`
- [x] 1.5 `ElephantSheet.tsx` passa a mostrar uma versão só, de dia e de noite; conferir abrindo o still da composição `elefanta`
- [x] 1.6 Renderizar `elephants`, `maybe-brain` e `so-far` e conferir, nos quadros, que a elefanta é idêntica à do render de 2026-10-07

## 2. Pessoa

- [x] 2.1 Em `src/art/Person.tsx`, apagar a construção antiga e a prop `finish`, mantendo `lean`; tirar o atributo `finish` de `ElephantAwakeScene`, `MaybeBrainScene`, `OneOfThemScene`, `WhatItIsScene` e `Bed.tsx`; conferir com `pnpm lint`
- [x] 2.2 Renderizar as cenas que já usavam a construção nova (`elephant-awake`, `maybe-brain`, `one-of-them`, `what-it-is`) e conferir que os quadros não mudaram
- [x] 2.3 Conferir e corrigir as poses de `third-of-life`, `two-hours` e `unknown-cause`: em cada plano com a pessoa, nenhum membro solto ou atravessando o tronco, e o gesto no alvo de antes
- [x] 2.4 Conferir e corrigir `parts/Chalkboard.tsx` (o braço erguido para o quadro) nos renders de `biggest-mistake`, `forced-awake` e `tonight`
- [x] 2.5 Conferir e corrigir `parts/TankShot.tsx` (a pesquisadora, a prancheta, a rede) nos renders de `maybe-brain`, `jellyfish-night`, `jellyfish-platform`, `jellyfish-debt` e `older-than-brain`
- [x] 2.6 Conferir e corrigir `parts/Gardner.tsx` e `parts/CoffeeTable.tsx` nos renders de `sleep-debt`, `awake-record`, `gardner-hours`, `gardner-sleeps` e `so-far`: Gardner, os dois amigos, Dement e quem senta à mesa
- [x] 2.7 Conferir e corrigir `parts/ShopInside.tsx` e as três cenas do estoque (`stockroom`, `stockroom-night`, `stockroom-solid`): a lojista com a caixa e os fregueses
- [x] 2.8 Conferir e corrigir `memory-test` e `memory-result`: os pesquisadores entregando a lista e as duas pessoas
- [x] 2.9 `PersonSheet.tsx` passa a mostrar uma fileira só, nas cinco poses; conferir abrindo o still da composição `pessoa`
- [x] 2.10 Acionar o `critico-de-quadro` sobre os quadros de todas as cenas dos itens 2.3 a 2.8, com a pergunta da construção única e da pose contra a ficha; corrigir o que for bloqueante ou relevante e anexar o relatório à conversa
- [x] 2.11 Em `art.md`, reescrever a silhueta da pessoa no Elenco (tronco em feijão, pescoço, quadril, sapato em cunha) e tirar do "Piloto do polimento" o que deixou de valer para a pessoa e para a elefanta ("a adoção nas cenas, não"); conferir que o texto descreve o que os quadros mostram

## 3. Savana

- [x] 3.1 Mover por `git mv` `RichSavannaReference.tsx`, `RichScenery.tsx`, `RichTheme.tsx`, `NightSky.tsx` e `RichAntelope.tsx` para `src/videos/why-we-sleep/parts/savanna/`; atualizar os imports de `Root.tsx`, `NightFallsScene` e `ThirdOfLifeScene`; conferir com `pnpm lint` e renderizando `night-falls` sem diferença nos quadros
- [x] 3.2 Levar as cores de `richPalette.ts` e `nightPalette.ts` para `palette.ts`, como os jogos `dusk` e `night` de `savanna`, e apagar os dois arquivos; conferir com `pnpm lint` e com `night-falls` e `third-of-life` renderizados sem diferença
- [x] 3.3 Acrescentar o jogo `day`, com os matizes do `savana-dia` aprovado distribuídos pelas camadas, e fazer o cenário misturar os três jogos de forma contínua por `daylight`, com sol, lua e estrelas entrando por opacidade; conferir numa tira de quadros de dia a noite, em `out/rascunho/`, que nenhum quadro troca de desenho e que o meio não fica barrento
- [x] 3.4 Dar ao cenário único o que `SavannaStage` usa hoje: luz e astro carregados entre planos, subida e descida com o palco e desenho extra no céu; mover `SAVANNA_GROUND_Y` e `SavannaShadow` para `parts/savanna/` e atualizar `Herd`, `Prey` e `NightFallsScene`; conferir com `pnpm lint`
- [ ] 3.5 Renderizar um quadro de prova de `elephants`, plano 1, com a manada na savana em camadas de dia, em `out/rascunho/`, ao lado do quadro atual; levar ao usuário como decisão de imagem e registrar a resposta em `art.md`. Recusado, ajustar o jogo `day` pela regra da linha de parada antes de seguir
- [ ] 3.6 Com o aceite, trocar o cenário dentro de `SavannaStage` e renderizar `elephants`, `two-hours`, `elephant-awake` e `elephant-verdict`; conferir que as trocas entre planos da savana não desmontam o cenário e que a luz continua de onde estava
- [ ] 3.7 Apagar `parts/Savanna.tsx`, `savannaFinish`, `sunset`, `SunsetPilot.tsx` e a composição dele em `Root.tsx`; tirar `finish` de `Antelope.tsx`, `Prey.tsx`, `Timeline.tsx`, `NightFallsScene`, `DebtTestScene` e `AntelopeSheet.tsx`; conferir que `grep -rn "finish" src` não devolve nenhuma prop de desenho e que `pnpm lint` passa
- [ ] 3.8 Acionar o `critico-de-quadro` sobre os quadros das quatro cenas das elefantas e das cenas do antílope, com a pergunta do cenário único e da elefanta contra o fundo; corrigir o que for bloqueante ou relevante
- [ ] 3.9 Atualizar `src/studies/savanna-reference/README.md` (fica só o primeiro estudo, e diz onde a savana do vídeo mora) e, em `art.md`, a tabela do capítulo 2 e o trecho da consistência do antílope, para dizer que a savana é uma só para o antílope e para as elefantas; conferir que os comandos do README rodam como escritos

## 4. Conjunto

- [ ] 4.1 `pnpm lint` e `pnpm test` passam
- [ ] 4.2 Renderizar as cenas que ainda não foram renderizadas depois das mudanças e rodar `pnpm join why-we-sleep`; conferir que a duração de `out/why-we-sleep/why-we-sleep.mp4` é a mesma do render de 2026-10-07 (571,98 s)
- [ ] 4.3 Montar em `out/rascunho/` a folha de contato do vídeo novo e conferir, contra os cenários da spec, que a pessoa e a savana têm uma construção só do começo ao fim
- [ ] 4.4 `pnpm critique why-we-sleep` e conferir no trecho cada medida que saiu da faixa em relação ao render anterior
- [ ] 4.5 Levar o vídeo ao usuário com o que mudou e o que ficou para a segunda mudança (os lugares)

## Workflow follow-up

- Arquivar a mudança depois do aceite do usuário.
- Abrir a segunda mudança: lugares em camadas para o laboratório, a bancada dos ratos, o quarto de Gardner, a sala de 1924 e o quarto de "você".
