# Design

## Context

Motivação e escopo: `proposal.md`. Requisitos: `specs/shared-drawings/spec.md`. O que o código mostra hoje:

- **Elefanta** (`src/art/Elephant.tsx`): `finish?: ElephantFinish` escolhe entre dois desenhos e dois jogos de cor. Todo uso em cena já passa `finish`; o desenho antigo só aparece na folha `ElephantSheet`, que compara os dois. `Elephant.test.ts` testa a ponta da tromba das duas versões.
- **Pessoa** (`src/art/Person.tsx`): `finish?: boolean` troca tronco, pernas, sapatos, largura dos braços, o braço de trás em repouso e a postura de quem boceja ou dorme em pé; `lean` só vale com ela. Passam `finish`: `ElephantAwakeScene`, `MaybeBrainScene`, `OneOfThemScene`, `WhatItIsScene` e `parts/Bed.tsx`. Não passam: `ThirdOfLifeScene`, `TwoHoursScene`, `UnknownCauseScene`, `StockroomScene`, `StockroomNightScene`, `StockroomSolidScene`, `MemoryTestScene`, `MemoryResultScene`, e as peças `Gardner`, `Chalkboard`, `CoffeeTable`, `ShopInside`, `TankShot`. A cabeça, o rosto e os ombros são iguais nas duas versões.
- **Antílope** (`src/art/Antelope.tsx`): a prop `finish` existe e já não muda nada; `Prey` e `Timeline` ainda a passam.
- **Savana**: três implementações. `parts/Savanna.tsx` (das elefantas, com a chave `finish`), usada só por `SavannaStage`, em `ElephantsScene.tsx`, de onde `TwoHoursScene`, `ElephantAwakeScene` e `ElephantVerdictScene` a importam. `RichSavannaBackdrop`, em `src/studies/savanna-reference/`, usada por `NightFallsScene` e `ThirdOfLifeScene`, com cores em `richPalette.ts` e `nightPalette.ts`, fora de `palette.ts`. E `SunsetPilot.tsx`, o piloto anterior, com as cores `sunset`, sem uso em cena.
- A savana em camadas tem dois horários, entardecer e noite, e troca de um para o outro num corte (`night={daylight < 0.25}`). A das elefantas tem dia, entardecer e noite, mistura as cores de forma contínua (`blend`), carrega a luz e o astro de um plano ao seguinte (`useCarriedNumber`), sobe e desce com o palco (`useBuild`) e aceita desenho extra no céu (`sky`).

Restrições: o desenho é julgado só pela imagem renderizada; cores vêm de `palette.ts`; um ajuste é feito no lugar e o "antes" é o git; `noUnusedLocals` derruba o lint por import sem uso.

## Goals / Non-Goals

**Goals:**

- Um caminho de desenho por personagem e por cenário, sem ramo morto.
- Trocar o ponto único de cada coisa (o desenho, o `SavannaStage`) em vez de editar cada cena, sempre que o render confirmar que basta.
- Manter o palco contínuo das cenas das elefantas ao trocar o cenário delas.

**Non-Goals:**

- Redesenhar qualquer personagem: a construção adotada é a que o piloto já aprovou.
- Tocar `src/studies/savanna-reference/SavannaReference.tsx`, o primeiro estudo, que não é usado por cena nenhuma.
- Luz por lugar no elenco, cenários novos, movimento, som.

## Decisions

**1. Apagar o ramo antigo primeiro, e consertar as poses depois.**
Na pessoa e na elefanta, a construção do piloto vira o corpo do componente e a prop `finish` some; as cenas que a passavam perdem o atributo. As 13 adoções da pessoa acontecem de uma vez, e o trabalho passa a ser renderizar cada cena e corrigir a pose que quebrou.
Alternativa: passar `finish` cena a cena e remover a chave no fim. Recusada: escreve 13 atributos só para apagá-los, e mantém a chave viva durante o trabalho inteiro, que é o defeito que a mudança conserta. O "antes" de cada pose está no git.

**2. `lean` continua como prop.** É pose, não versão: diz quanto o corpo pende, e as cenas a usam para contar sono e peso.

**3. As cores da elefanta: as do acabamento tomam os nomes `elephant` e `elephantNight`.** O tipo `ElephantFinish` vira o `ElephantColors`, e `elephantFinish`/`elephantNightFinish` deixam de existir. `Herd.tsx` fica com uma mistura dia/noite em vez de duas. Quem usa `elephant` para outra coisa (`Rats.tsx` importa a cor) é conferido no render.

**4. A savana em camadas passa a morar em `src/videos/why-we-sleep/parts/savanna/`.** Vão para lá, por `git mv`, `RichSavannaReference.tsx`, `RichScenery.tsx`, `RichTheme.tsx`, `NightSky.tsx` e `RichAntelope.tsx`. As composições de conferência `savanna-rich-*` e `savanna-night-*` continuam no `Root.tsx`, importadas do lugar novo, como já acontece com as folhas de modelo. `src/studies/savanna-reference/` fica só com o primeiro estudo, e o `README.md` dele perde as seções da segunda referência.
Alternativa: `src/art/`. Recusada: é o lugar do que mais de um vídeo usa, e só este usa a savana.

**5. As cores da savana vão para `palette.ts`.** `richPalette.ts` e `nightPalette.ts` viram os jogos `dusk` e `night` de `savanna`, no lugar dos atuais; `savannaFinish` e `sunset` saem.

**6. O dia é um terceiro jogo de cores sobre a mesma geometria.** O tema da savana (`RichTheme`) já entrega a paleta por contexto; acrescenta-se `day`, com os matizes do modo `savana-dia` aprovado (céu pêssego-dourado, chão ocre), distribuídos pelas camadas novas. É o caminho que menos muda a decisão do usuário: as cores ficam, o que muda é o número de camadas. Mesmo assim é levado a ele num quadro renderizado antes da troca nas cenas (ver Riscos).

**7. A luz passa a ser contínua.** O cenário recebe `daylight` de 0 a 1 e mistura os três jogos chave a chave, com o mesmo `blend` de `parts/Savanna.tsx`; a lua, as estrelas e o sol entram por opacidade. É o que `elephant-awake` exige (dois dias passando num plano) e o que o requisito "a luz muda dentro de um plano" pede. O corte em `daylight < 0.25` sai.

**8. O que `SavannaStage` espera do cenário é mantido no cenário único:** a luz e o astro carregados entre planos, a subida e a descida com o palco e o desenho extra no céu. `SAVANNA_GROUND_Y` e `SavannaShadow`, que `Herd`, `Prey` e `NightFallsScene` importam, mudam de arquivo junto, e o resto de `parts/Savanna.tsx` é apagado. A troca nas quatro cenas das elefantas acontece em `SavannaStage`.

**9. `SunsetPilot.tsx` e a composição dele saem.** É uma terceira savana, superada pela segunda referência, sem uso em cena. As folhas `ElephantSheet` e `PersonSheet` passam a mostrar uma versão só.

**10. O trabalho é da skill `diretor-de-arte`, em branch própria.** Ajuste de pose de um plano é feito na conversa; o `critico-de-quadro` lê uma vez os quadros de todas as cenas adotadas, no fim do grupo da pessoa e no fim do grupo da savana, que é onde a cegueira de quem fez custa caro.

## Risks / Trade-offs

- [O usuário recusa a savana de dia em camadas] → O quadro de prova vai a ele antes de qualquer cena das elefantas mudar. Recusado, ajusta-se o jogo `day` pela regra da linha de parada; na terceira entrega, encerra-se com a ressalva dita, e a decisão dele fica registrada em `art.md`. As cenas do antílope não dependem disso.
- [Braços desenhados sobre o tronco antigo ficam soltos ou atravessam o tronco em feijão] → Cada cena adotada é renderizada e aberta; os casos de maior risco são os gestos com alvo (`Chalkboard`, `TankShot`, `ShopInside` com a caixa, `Gardner` oscilando, `CoffeeTable` sentado).
- [A postura nova de quem dorme em pé ou boceja muda um plano que contava com a antiga] → Coberto pela conferência por cena; a pose volta ao que o plano diz por `lean` e pelos braços, sem ramo novo.
- [Entre apagar o ramo e consertar as poses, a branch tem cenas com pose quebrada] → Aceito: nada sai da branch antes do render de conjunto.
- [O cenário em camadas, mais pesado, alonga o render das cenas das elefantas] → Medido no primeiro `pnpm scene`; só vira trabalho se o tempo por cena sair de segundos para minutos.
- [A mistura contínua deixa o meio do caminho entre dois jogos barrento] → Conferido em tiras de quadros de `elephant-awake`; o entardecer no meio do `blend` existe para isso.
- [A elefanta nova, de cor cheia, sobre o cenário em camadas briga com o fundo] → Entra na leitura do `critico-de-quadro` do grupo da savana.

## Migration Plan

Branch `acabamento-unico`, um commit por grupo de tarefas. Sem migração de dados: narração, trilha e tempos não mudam, e tudo em `out/` é gerado de novo. Desfazer é reverter o commit do grupo.
