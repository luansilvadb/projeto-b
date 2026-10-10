# Proposal

## Why

A auditoria `ponytail-audit` de 2026-10-10 encontrou opções visuais sem consumidores, fórmulas copiadas e infraestrutura que conserva flexibilidade já sem uso. Os 11 cortes abaixo reduzem o código que precisa ser entendido e mantido, preservando os quadros, a narração e as saídas dos comandos atuais.

## What Changes

A numeração mantém a correspondência com a auditoria. As 232 linhas são uma estimativa de redução líquida, não uma meta de implementação; nenhuma dependência inteira sai.

1. **Retirar `ShopFront.passing`.** As três chamadas em `StockroomScene`, `StillUnknownScene` e `ButWhatScene` omitem a prop. Saem também `PASSER`, `passerX` e o desenho condicional dos pés e da sombra.
2. **Retirar `ShelfGoods.overflowing` e `trimmed`.** As três chamadas, em `StockroomScene` e `StockroomNightScene`, são `<ShelfGoods />`. Saem `OVERFLOW`, `big`, `BIG_FROM` e a lógica de desaparecimento; ficam os mesmos círculos de `SHELF_ITEMS`.
3. **Retirar as exceções antigas do pnpm.** `minimumReleaseAgeExclude` só menciona Remotion 4.0.532/533; `package.json` e `pnpm-lock.yaml` resolvem 4.0.534. As versões e o override de `typescript-eslint` permanecem.
4. **Reutilizar a interpolação de paletas.** Mover o `blend` existente em `JellyfishScene` para `palette.ts`, atualizar seus consumidores e usá-lo nas duas funções `dressed`, em `Herd.elephantAt` e em `ElephantVerdictScene.Front`, preservando os retornos dos extremos e o clamp atual.
5. **Retirar `Person.grumpy`.** Nenhuma chamada, inclusive por spread, fornece a prop. Saem o default e o desenho condicionado a ela; permanecem as expressões usadas, inclusive a irritação própria de Gardner.
6. **Compartilhar `walked`.** Consolidar a mesma fórmula de avanço e frenagem usada em `StockroomScene`, `OneOfThemScene` e `NightFallsScene`, conservando os parâmetros de cada cena.
7. **Compartilhar `spin`.** Exportar a rotação de vetor existente em `Vigilia` e reutilizá-la em `inside-night/poses.ts` e `acting.ts`.
8. **Simplificar os pedidos do worker de voz.** A fila já limita o trabalho a um pedido ativo. Substituir o mapa e os IDs por um único pedido pendente, alterando juntos o cliente TypeScript e o protocolo Python; preservar fila, resultados e tratamento de erros.
9. **Reutilizar `seenAt`.** Consolidar a projeção que `BiggestMistakeScene.project` repete, mantendo a ordem dos argumentos e as fórmulas. O helper existente passa para `components/Camera.tsx`, junto de `framing`.
10. **Simplificar a máscara de conteúdo do medidor de som.** `content` é sempre verdadeiro: retirar as seleções neutras e usar `frames` nos denominadores. Preservar todas as chaves e valores de saída, inclusive `series.conteudo`.
11. **Retirar `renderFrames.env`.** O único chamador, `stills.ts`, passa três argumentos. O `env` de `runPythonTool` continua necessário ao ACE-Step.

Fora do escopo: novos recursos, correções não levantadas na auditoria, alterações de roteiro, desenho, encenação, paletas, parâmetros dos modelos, mídia gerada ou decisões registradas dos vídeos.

## Capabilities

### New Capabilities

Nenhuma. A mudança declara `skip_specs: true`: trata-se de refatoração e limpeza de configuração sem novo comportamento de produto.

### Modified Capabilities

Nenhuma. As exigências de `shared-drawings` continuam valendo; a remoção de `grumpy` não remove a irritação de Gardner descrita nessa spec. `music-presence` e `narration-returns` também permanecem intactas.

## Impact

- Código visual: `src/art/Person.tsx`, `src/art/Vigilia.tsx`, `src/components/timing.ts`, `src/components/Camera.tsx`, `src/studies/inside-night/{poses,acting}.ts` e os arquivos de `src/videos/why-we-sleep/` citados acima, mais os consumidores dos helpers movidos.
- Ferramentas: `scripts/lib/voice-worker.ts`, `tools/narration/voice_worker.py`, `tools/sound/measure.py` e `scripts/lib/tools.ts`. O protocolo privado do worker muda nos dois lados; os comandos e formatos persistidos continuam iguais.
- Configuração e orientação: `pnpm-workspace.yaml` e a frase de `AGENTS.md` que hoje descreve a lista de exceções como permanente. Nenhuma atualização de dependências é necessária.
- Conferência na aplicação: `pnpm lint`, `pnpm test`, regressão focada da fila do worker, equivalência das fórmulas e das medidas de som, além de quadros dos desenhos afetados. Comparações temporárias ficam em `out/rascunho/`.
