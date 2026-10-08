# Proposal

## Why

A varredura ponytail do repositório inteiro (auditoria de 2026-10-08) achou 12 cortes seguros: código morto, flags e configs que ninguém usa, helpers que duplicam equivalentes que já existem no repositório e duas dependências de desenvolvimento sem uso. Nada disso é comportamento: é peso de manutenção que engana quem lê o código e aumenta a superfície que parece ser preciso entender.

## What Changes

Cada item abaixo traz a evidência de que é seguro; a ordem é a da auditoria, do maior corte ao menor.

1. **`SleepingElephant` sai.** O componente e o tipo de props em `parts/Herd.tsx` não são importados nem usados em lugar nenhum (`git grep` limpo).
2. **A varredura (`wipe`) e o `hold` saem do `Shot`.** Nenhuma cena passa `wipe` nem `hold`; `score.md` registra que as varreduras "saem todas". Saem o tipo `Wipe`, as props, `wipeClip`, `Wiping` e os imports que só eles usavam.
3. **`--ranges` e `--cuts` saem do `tools/sound/measure.py`.** Nenhum script nem skill os passa; eram do estudo de referência, já documentado. `content` vira `np.ones(frames)` e o bloco de cortes e o `near()` saem.
4. **`src/design/contrast.ts` sai.** `contrastRatio` só é chamado pelo próprio teste; a lógica passa para `contrast.test.ts`, que é o único consumidor.
5. **`shake` local sai.** O de `MaybeBrainScene.tsx` é cópia literal do `shake` de `components/timing.ts`; as cenas que o importam de lá passam a importar de `timing`.
6. **`FRONT_CLOSE` sai.** A constante de enquadramento em `parts/ShopFront.tsx` não é lida nem importada.
7. **`gone` vira `drop`.** O envelope de saída de `SleepLessScene.tsx` é exatamente o `drop` de `components/timing`.
8. **`quantize` e `inferenceSteps` saem do job.** Nenhum chamador os define; valem `gpu.quantization_default` e `INFERENCE_STEPS`, como hoje de fato acontece.
9. **`semitones_from` sai.** O absoluto de semitons em `evaluate.py` refaz `pitch.semitones_between`.
10. **`@types/web` sai das devDependencies.** `tsc --noEmit --types node,react` passa sem ele.
11. **`prettier` sai das devDependencies.** Nenhum script, plugin ou config o invoca; o `.prettierrc` sozinho não o usa.
12. **`Math.min(1, Math.max(0, …))` vira `clamp01`** em `parts/Herd.tsx`, `parts/savanna/RichTheme.tsx` e `parts/savanna/RichSavannaReference.tsx`.

Nada de comportamento observável muda: os renders saem iguais, os testes continuam passando e nenhuma especificação de comportamento é tocada. Por isso a mudança declara `skip_specs: true` no `.openspec.yaml`.

Fora do escopo: qualquer defeito de correção, segurança ou desempenho que a auditoria não levanta; e mudanças de conteúdo, roteiro, arte ou som.

## Capabilities

### New Capabilities

Nenhuma. É refatoração e ferramenta (`skip_specs: true`): as specs descrevem comportamento, e nenhum muda.

### Modified Capabilities

Nenhuma.

## Impact

- Vídeo: `src/video/Shot.tsx` (props `wipe`/`hold`), `src/videos/why-we-sleep/parts/Herd.tsx`, `parts/ShopFront.tsx`, `parts/savanna/RichTheme.tsx`, `parts/savanna/RichSavannaReference.tsx`, `scenes/MaybeBrainScene.tsx` e as dez cenas que importam `shake` de lá (`JellyfishScene`, `JellyfishPlatformScene`, `AwakeRecordScene`, `GardnerHoursScene`, `GardnerSleepsScene`, `MemoryTestScene`, `StillUnknownScene`, `StockroomNightScene`, `StockroomScene`, `StockroomSolidScene`), além de `scenes/SleepLessScene.tsx`.
- Ferramentas: `tools/sound/measure.py`, `tools/music/generate.py`, `tools/narration/evaluate.py`.
- Design: `src/design/contrast.ts` (sai), `src/design/contrast.test.ts` (recebe a lógica).
- Dependências: `package.json` perde `@types/web` e `prettier` (2 devDependencies).
- Nada em `public/`, `out/`, roteiro, arte ou som.
- Conferência: `pnpm lint` e `pnpm test` passam; `pnpm scene why-we-sleep maybe-brain` e uma cena com `Herd`/`ShopFront` saem como antes.
