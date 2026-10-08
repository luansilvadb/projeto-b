# Tasks

Cada corte segue a skill dona do artefato: a imagem e o movimento (`diretor-de-arte`) para `src/`, a operação das ferramentas (`producao`) para `tools/` e as dependências. Não há tarefa de texto, voz ou som: nada de conteúdo muda.

## 1. Vídeo (src)

- [x] 1.1 Remover `SleepingElephant` e o tipo de props de `src/videos/why-we-sleep/parts/Herd.tsx`; conferir com `git grep -n "SleepingElephant"` que não sobra referência em `src` e com `pnpm lint` que nada mais o importava
- [x] 1.2 Remover o suporte a varredura de `src/video/Shot.tsx`: o tipo `Wipe`, as props `wipe` e `hold`, `wipeClip`, `Wiping` e os imports que só eles usavam (`Easing`, `interpolate`, `AbsoluteFill`, `clamp`); conferir com `git grep -n "wipe\|hold=" src/videos` que nenhuma cena os passa, com `pnpm lint` e com `pnpm scene why-we-sleep subscribe` que o plano sai como antes (o `wipe` nunca era passado, então nenhum quadro pode mudar)
- [x] 1.3 Remover `FRONT_CLOSE` de `src/videos/why-we-sleep/parts/ShopFront.tsx`; conferir com `git grep -n "FRONT_CLOSE"` que não sobra referência e com `pnpm lint`
- [x] 1.4 Trocar os três `Math.min(1, Math.max(0, …))` por `clamp01` de `src/components/timing.ts` em `parts/Herd.tsx`, `parts/savanna/RichTheme.tsx` e `parts/savanna/RichSavannaReference.tsx`; conferir com `git grep -n "Math.min(1, Math.max(0"` que só o `clamp01` resta e com `pnpm lint`
- [x] 1.5 Remover o `shake` local de `scenes/MaybeBrainScene.tsx` e usar o de `components/timing.ts`, ajustando os imports das dez cenas que o importam de lá (`JellyfishScene`, `JellyfishPlatformScene`, `AwakeRecordScene`, `GardnerHoursScene`, `GardnerSleepsScene`, `MemoryTestScene`, `StillUnknownScene`, `StockroomNightScene`, `StockroomScene`, `StockroomSolidScene`); conferir que a fórmula é a mesma, com `pnpm lint` e com `pnpm scene why-we-sleep maybe-brain jellyfish jellyfish-platform` que os quadros de tremor saem iguais
- [x] 1.6 Trocar `gone` de `scenes/SleepLessScene.tsx` por `drop` de `components/timing.ts`; conferir com `pnpm lint` e com `pnpm scene why-we-sleep sleep-less` que o encolhimento dos ícones sai igual
- [x] 1.7 Mover `luminance` e `contrastRatio` de `src/design/contrast.ts` para dentro de `src/design/contrast.test.ts` e apagar o módulo; conferir com `pnpm vitest run src/design/contrast.test.ts` que as asserções de contraste da paleta continuam passando

## 2. Ferramentas (tools)

- [x] 2.1 Remover `--ranges`, `--cuts`, o `near()` e o bloco de cortes de `tools/sound/measure.py`, deixando `content` como todos os quadros; conferir com `uv run --project tools/sound python tools/sound/measure.py --help` que o uso posicional continua e, sobre uma pasta `som/` já separada em `out/`, com `pnpm critique <arquivo> som` que as medidas saem como antes
- [x] 2.2 Remover `quantize` e `inferenceSteps` do job em `tools/music/generate.py`, usando `gpu.quantization_default` e `INFERENCE_STEPS`; conferir com `uv run --project tools/sound python -m py_compile tools/music/generate.py` e com `uv run --project tools/sound pytest tools/music -q`
- [x] 2.3 Trocar `semitones_from` de `tools/narration/evaluate.py` pelo absoluto de `pitch.semitones_between`, com o mesmo tratamento de `None`; conferir com `uv run --project tools/narration python -m py_compile tools/narration/evaluate.py` e com `git grep -n "12 \* np.log2" tools/narration` que a fórmula fica num lugar só

## 3. Dependências

- [x] 3.1 Conferir de novo `node node_modules/typescript/bin/tsc --noEmit --types "node,react"` sem erro; remover `@types/web` de `package.json`, rodar `pnpm install` e conferir `pnpm lint` e `pnpm test`; se o `tsc` sem o override quebrar, desfazer o item 3.1 e anotar na conversa
- [x] 3.2 Remover `prettier` de `package.json`, rodar `pnpm install` e conferir com `git grep -n "prettier"` que só o `.prettierrc` resta e com `pnpm lint`; se o usuário quiser manter a formatação pelo binário do projeto, desfazer e anotar

## 4. Integração

- [x] 4.1 Rodar `pnpm lint` e `pnpm test` no repositório inteiro e conferir os dois verdes
- [x] 4.2 Renderizar as cenas afetadas pelas remoções e pelo `shake` (`pnpm scene why-we-sleep elephants stockroom-night stockroom-solid subscribe stockroom gardner-sleeps`) e conferir nos quadros que nada mudou em relação aos arquivos atuais de `out/why-we-sleep/cenas/`
- [x] 4.3 Conferir que nenhum caminho de mídia, tempo de fala ou duração de cena mudou: `pnpm check-script why-we-sleep` e `git status` limpo de mudanças em `src/videos/why-we-sleep/script.json`, `public/` e `out/`

## Workflow follow-up

- Fazer um commit por item da lista, quando o usuário pedir, para cada corte poder ser desfeito sozinho.
- Arquivar a mudança depois do aceite do usuário, com `opsx archive`.
