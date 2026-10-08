# Proposal

## Why

A segunda varredura ponytail do repositório inteiro (auditoria de 2026-10-08, depois da `poda-do-excesso`) achou 7 sobras que a primeira não pegou: uma duplicata literal e uma reescrita de um helper compartilhado, cinco props que nenhuma cena passa e quatro `export` sem consumidor fora do próprio arquivo. Nada disso é comportamento; é peso de manutenção e superfície que parece ser preciso entender.

## What Changes

Cada item traz a evidência de que é seguro; a ordem é a da auditoria, do maior corte ao menor.

1. **`Sooner` fica um só.** O de `scenes/MaybeBrainScene.tsx` é exportado e importado por nove cenas; `scenes/BiggestMistakeScene.tsx` traz uma cópia literal dele e `scenes/TimeToFixScene.tsx`, uma reescrita com dois extras (`backdrop`, `late`). Os extras viram props opcionais do compartilhado, as duas cópias locais saem e as cenas que as usam importam o de `MaybeBrainScene`.
2. **As props mortas saem.** `top`/`bottom` do `Backdrop`, `from` do `SlowPush`, `drift` do `Cast`, `opacity` do `Grain` e `seconds` do `Pop`: nenhuma chamada no repositório as passa (grep limpo, incluindo testes e folhas de modelo), e o valor padrão passa para o corpo do componente.
3. **Quatro `export` sem consumidor externo saem**, mantendo o símbolo no próprio arquivo: `Hasten` (`scenes/MemoryTestScene.tsx`), `risenAt` (`scenes/ElephantsScene.tsx`), `AntelopeProps` (`src/art/Antelope.tsx`) e `MUSIC_LEVELS` (`src/narration/script.ts`).

Nada de comportamento observável muda: os renders saem iguais, os testes continuam passando e nenhuma especificação de comportamento é tocada. Por isso a mudança declara `skip_specs: true` no `.openspec.yaml`.

Fora do escopo: qualquer defeito de correção, segurança ou desempenho que a auditoria não levanta; e mudanças de conteúdo, roteiro, arte ou som.

## Capabilities

### New Capabilities

Nenhuma. É refatoração (`skip_specs: true`): as specs descrevem comportamento, e nenhum muda.

### Modified Capabilities

Nenhuma.

## Impact

- Vídeo (skill `diretor-de-arte`): `src/components/Backdrop.tsx`, `src/components/Cast.tsx`, `src/components/Grain.tsx`, `src/components/Pop.tsx`, `src/components/SlowPush.tsx`, `src/videos/why-we-sleep/scenes/MaybeBrainScene.tsx`, `scenes/BiggestMistakeScene.tsx`, `scenes/TimeToFixScene.tsx`, `scenes/MemoryTestScene.tsx`, `scenes/ElephantsScene.tsx`, `src/art/Antelope.tsx` e `src/narration/script.ts`.
- Nada em `public/`, `out/`, roteiro, arte ou som.
- Conferência: `pnpm lint` e `pnpm test` passam; `pnpm scene why-we-sleep biggest-mistake time-to-fix` sai como antes (o `Sooner` local é a mesma fórmula do compartilhado).
