# Tasks

Cada corte segue a skill dona do artefato: a imagem e o movimento (`diretor-de-arte`) para `src/`. Não há tarefa de texto, voz, som ou ferramentas: nada de conteúdo muda.

## 1. O `Sooner` fica um só

- [x] 1.1 Dar ao `Sooner` de `scenes/MaybeBrainScene.tsx` as props opcionais `backdrop` e `late` (mais `by` opcional), com o corpo que hoje está no de `TimeToFixScene.tsx`; conferir com `pnpm lint` e com `pnpm scene why-we-sleep maybe-brain` que os quadros da cena que o importa saem como antes
- [x] 1.2 Remover o `Sooner` local de `scenes/BiggestMistakeScene.tsx` e importar o de `MaybeBrainScene`; conferir com `git grep -n "const Sooner" src/videos/why-we-sleep/scenes` que só resta o compartilhado e com `pnpm scene why-we-sleep biggest-mistake` que os quadros saem iguais
- [x] 1.3 Remover o `Sooner` local de `scenes/TimeToFixScene.tsx` e importar o de `MaybeBrainScene`; conferir com `pnpm lint` (as chamadas `backdrop={BACKDROP_FRAMES}` e `late={TIMELINE_LATE}` continuam valendo) e com `pnpm scene why-we-sleep time-to-fix` que os quadros saem iguais

## 2. As props mortas

- [x] 2.1 Remover `top`/`bottom` de `src/components/Backdrop.tsx`, usando `palette.ink` e `palette.dusk` no corpo; conferir com `git grep -n "<Backdrop" src` que as duas chamadas continuam bare e com `pnpm lint`
- [x] 2.2 Remover `from` de `src/components/SlowPush.tsx`, usando `1` no lugar; conferir com `git grep -n "SlowPush" src` que nenhuma chamada a passa e com `pnpm lint`
- [x] 2.3 Remover `drift` de `src/components/Cast.tsx` (e o `left` que só ele usava), mantendo a escala do `castScale`; conferir com `git grep -n "drift=" src` limpo e com `pnpm lint`
- [x] 2.4 Remover `opacity` de `src/components/Grain.tsx`, deixando `0.14` no corpo; conferir com `git grep -n "<Grain" src` que todas as chamadas são bare e com `pnpm lint`
- [x] 2.5 Remover `seconds` de `src/components/Pop.tsx`, usando `POP_SECONDS` no corpo; conferir com `git grep -n "seconds=" src/videos` que nenhuma chamada a passa e com `pnpm lint`

## 3. Os exports sem consumidor

- [x] 3.1 Tirar o `export` de `Hasten` (`scenes/MemoryTestScene.tsx`), `risenAt` (`scenes/ElephantsScene.tsx`), `AntelopeProps` (`src/art/Antelope.tsx`) e `MUSIC_LEVELS` (`src/narration/script.ts`), mantendo o símbolo no arquivo; conferir com `git grep` dos quatro nomes que fora do arquivo só sobra a própria declaração e com `pnpm lint`

## 4. Integração

- [x] 4.1 Rodar `pnpm lint` e `pnpm test` no repositório inteiro e conferir os dois verdes
- [x] 4.2 Renderizar as cenas afetadas (`pnpm scene why-we-sleep maybe-brain biggest-mistake time-to-fix`) e comparar os quadros com os arquivos atuais de `out/why-we-sleep/cenas/`, se existirem
- [x] 4.3 Conferir que nenhum caminho de mídia, tempo de fala ou duração de cena mudou: `pnpm check-script why-we-sleep` e `git status` limpo de mudanças em `src/videos/why-we-sleep/script.json`, `public/` e `out/`

## Workflow follow-up

- Fazer um commit por item da lista, quando o usuário pedir, para cada corte poder ser desfeito sozinho.
- Arquivar a mudança depois do aceite do usuário, com `opsx archive`.
