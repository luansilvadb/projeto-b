# Tasks

Os itens entre parênteses são os números da auditoria e do `proposal.md`. Seguir os destinos e os invariantes de `design.md`; os arquivos de comparação ficam em `out/rascunho/poda-de-props-e-duplicacoes/`. `specs` está explicitamente dispensado por `skip_specs: true`.

## 1. Props sem uso

- [x] 1.1 (Itens 1, 2, 5) Reconfirmar os usos de `ShopFront`, `ShelfGoods` e `Person`, incluindo spreads, testes e arquivos ocultos, e guardar os quadros de referência necessários antes das edições; conferir que os únicos valores em uso são os defaults e que as referências foram produzidas pelo código atual.
- [x] 1.2 (Item 1) Remover `passing`, `PASSER`, `passerX` e o desenho condicional de `ShopFront`, limpando imports; conferir por busca que não restam referências e por comparação de quadros que a fachada, a fresta e a luz oscilante permanecem iguais.
- [x] 1.3 (Item 2) Simplificar `ShelfGoods` para desenhar `SHELF_ITEMS`, retirando `overflowing`, `trimmed`, `OVERFLOW`, `big` e `BIG_FROM`; atualizar os comentários das prateleiras e conferir posições, raios e cores nos quadros de `stockroom` e `stockroom-night` contra as referências.
- [x] 1.4 (Item 5) Retirar `Person.grumpy`, o default e seu grupo SVG; conferir ausência de referências e igualdade dos quadros dos figurantes, preservando a irritação própria de Gardner e as expressões da folha `pessoa`.

## 2. Interpolação de cores

- [x] 2.1 (Item 4) Mover `blend` para `src/videos/why-we-sleep/palette.ts`, atualizar todos os seus consumidores e substituir as quatro interpolações manuais descritas no design; conferir imports diretos, remoção de `PERSON_KEYS`/`ELEPHANT_KEYS` envolvidos e preservação dos retornos de `dressed` e do clamp de `elephantAt`.
- [x] 2.2 (Item 4) Comparar os resultados anteriores e novos nas paletas reais, em extremos e valores intermediários, incluindo arrays da água-viva; conferir quadros de `one-of-them`, `elephant-awake` e `elephant-verdict` e rodar `pnpm vitest run src/design/contrast.test.ts`, registrando equivalência sem alteração de cor.

## 3. Fórmulas de movimento e câmera

- [x] 3.1 (Item 6) Consolidar `walked` em `src/components/timing.ts`, atualizando as três cenas e mantendo `brake` em `0.75`, `0.7` e `0.84`; conferir os valores nos limites e na junção da frenagem conforme o design, rodar `pnpm vitest run src/components/timing.test.ts` e comparar a chegada/frenagem em `night-falls` com a referência anterior.
- [x] 3.2 (Item 7) Exportar `spin` de `src/art/Vigilia.tsx` e substituir as duas cópias no estudo; preservar `poses.rad`, atualizar imports e conferir rotação nos dois sentidos, `pnpm vitest run src/studies/inside-night/poses.test.ts` e quadros de `vigilia`/`inside-night` contra o estado anterior.
- [x] 3.3 (Item 9) Mover `seenAt` para `src/components/Camera.tsx`, atualizar todos os consumidores e substituir `BiggestMistakeScene.project`; exercitar o helper nos testes de câmera existentes pela relação com `framing`, executar `pnpm vitest run src/components/camera.test.ts` e comparar os quadros de projeção em `biggest-mistake`.

## 4. Pedido único no worker de voz

- [x] 4.1 (Item 8) Alterar juntos `scripts/lib/voice-worker.ts` e `tools/narration/voice_worker.py` para o pedido pendente único e mensagens sem `id`; preservar fila, API, ordem das tomadas, limpeza e rejeições, atualizar os exemplos de protocolo e conferir que os dois lados concordam em `ready`, tomada e `done` com erro opcional.
- [x] 4.2 (Item 8) Criar o teste focado `scripts/lib/voice-worker.test.ts` com processo simulado, sem ampliar a API de produção; verificar serialização de dois pedidos, várias tomadas, erro recuperável seguido de sucesso e saída inesperada do processo, rodando `pnpm vitest run scripts/lib/voice-worker.test.ts`.

## 5. Medição do som

- [x] 5.1 (Item 10) Antes da edição, rodar `tools/sound/measure.py` pelo ambiente `uv` de `tools/sound` sobre `out/why-we-sleep/som/why-we-sleep/stems/why-we-sleep`, com saída na bancada temporária; conferir que o JSON de referência contém `medidas`, `series` e `series.conteudo`.
- [x] 5.2 (Item 10) Eliminar filtros e denominadores baseados na máscara constante `content`, mantendo a série de uns; medir os mesmos stems novamente e comparar todo o JSON, além de conferir o tamanho de `conteudo` para um último segundo incompleto. Aceitar somente resultados equivalentes, sem alterar arredondamentos, limiares ou a referência de som.

## 6. Configuração e assinatura de render

- [x] 6.1 (Item 3) Remover somente as exceções antigas `minimumReleaseAgeExclude` e ajustar a orientação correspondente em `AGENTS.md`; conferir que as exceções removidas não correspondem a versões resolvidas, executar `pnpm install --frozen-lockfile` e verificar que as versões, o lockfile, `allowBuilds` e o override permanecem iguais.
- [x] 6.2 (Item 11) Retirar somente o parâmetro e o repasse de `env` em `renderFrames`; conferir o único chamador e executar `pnpm stills why-we-sleep 30`, verificando o PNG gerado. Preservar `env` em `run`/`runPythonTool` e os dois usos de `ACESTEP_PROJECT_ROOT` em `music.ts`.

## 7. Integração

- [x] 7.1 Executar `pnpm lint` e `pnpm test` depois dos cortes e registrar os resultados; repetir apenas as verificações afetadas por correções posteriores e confirmar que roteiro, decisões dos vídeos e formatos persistidos continuam intactos no diff.
- [x] 7.2 Conferir o diff final contra os 11 itens, registrar a redução líquida real e validar a mudança com `openspec validate poda-de-props-e-duplicacoes --strict --no-interactive`; marcar as tarefas somente com sua evidência de conclusão, mantendo as specs principais sem alteração.
