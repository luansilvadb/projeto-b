# Design

## Context

Ver `proposal.md — Why`. A auditoria conferiu os consumidores, inclusive testes, arquivos ocultos e props por spread. As três opções visuais removidas têm somente o comportamento padrão em uso. Os helpers repetidos implementam as mesmas fórmulas; a exceção são seus parâmetros locais, que precisam continuar distintos.

O worker TypeScript mantém uma fila de Promises e só escreve um pedido no stdin depois de o anterior terminar. O Python lê essa entrada em série e emite as tomadas antes da mensagem `done`. `content`, em `tools/sound/measure.py`, é uma máscara de uns desde a retirada de `--ranges`. O projeto já tem testes de câmera, curvas e poses, mas não tem teste do protocolo do worker.

## Goals / Non-Goals

**Goals:** reduzir duplicação e opções sem uso mantendo equivalência nos consumidores atuais; conservar os formatos persistidos; deixar cada corte rastreável à numeração da auditoria.

**Non-Goals:** criar biblioteca de animação, reorganizar todas as cenas, generalizar o protocolo de voz ou recalibrar desenhos, música, métricas e modelos. A contagem estimada de linhas não justifica remover documentação útil ou verificações necessárias.

## Decisions

### 1. Apagar somente os ramos sem consumidor — itens 1, 2, 5 e 11

`ShopFront` conserva a fresta de luz e sua oscilação; somente os pés e a sombra controlados por `passing` saem. `ShelfGoods` passa a mapear `SHELF_ITEMS` diretamente, mantendo posição, raio, cor, ordem e as sementes da mercadoria. `Person` mantém os dois olhos do rosto simplificado; somente o grupo de `grumpy` sai. O rosto irritado desenhado por Gardner é independente e continua: isso preserva `shared-drawings`.

O parâmetro `env` sai só de `renderFrames`. `run` e `runPythonTool` continuam aceitando ambiente: `music.ts` usa `ACESTEP_PROJECT_ROOT`. Alternativa descartada: manter props sem chamadas ou uma versão alternativa dos componentes; o git já guarda a implementação anterior.

### 2. Mover os helpers existentes para pontos já compartilhados — itens 4, 6, 7 e 9

| Helper | Destino e consumidores | O que precisa permanecer igual |
| --- | --- | --- |
| `blend` | Mover de `JellyfishScene.tsx` para a `palette.ts` do vídeo; atualizar `JellyfishScene`, `JellyfishNightScene`, `OlderThanBrainScene`, `OneOfThemScene`, `ElephantAwakeScene`, `ElephantVerdictScene` e `parts/Herd.tsx` | A recursão por strings, arrays e objetos, o fallback atual e as chamadas a `interpolateColors`; nas duas `dressed`, os retornos diretos para `pajamas <= 0` e `>= 1`; em `elephantAt`, `clamp01(daylight)` |
| `walked` | Mover a fórmula de `StockroomScene` para `src/components/timing.ts`; importar nas três cenas | Default `brake = 0.75` da loja; `0.7` de `OneOfThemScene`; `WALK.brake = 0.84` de `NightFallsScene`; clamp de `t` e ordem das operações |
| `spin` | Exportar de `src/art/Vigilia.tsx`; importar em `inside-night/poses.ts` e `acting.ts`, que já dependem de `Vigilia` | Graus, sentido da rotação, ordem dos componentes do vetor e fórmulas; manter o `rad` local de `poses.ts`, também usado no apoio dos cascos |
| `seenAt` | Mover de `JellyfishScene.tsx` para `src/components/Camera.tsx`; atualizar os três consumidores atuais e substituir `BiggestMistakeScene.project` | Argumentos `(camera, point)`, centro do quadro, zoom e deslocamento |

O helper movido deixa de ser exportado pela cena antiga: todos os consumidores importam o destino diretamente, sem reexport de compatibilidade. Isso evita acrescentar dependências de `Herd` ou de cenas em outras cenas para uma operação de paleta ou câmera. `palette.ts` já importa os tipos dos desenhos com `import type`, sem dependência de execução nesses desenhos.

Alternativas descartadas: criar módulos genéricos novos para cada fórmula; substituir curvas por uma aproximação de easing; usar `blend` sem os retornos dos extremos de `dressed`. O trabalho é de reúso, com as mesmas entradas e resultados.

### 3. Um único pedido pendente no worker — item 8

Manter `VoiceWorker.ready`, `generate` e `stop`, o processo Python persistente e a fila atual. Substituir `waiting: Map` por uma variável opcional que guarda tomadas, `resolve` e `reject` do pedido ativo. A variável é preenchida antes de escrever no stdin; ao receber `done`, é limpa antes de resolver ou rejeitar a Promise. As tomadas são acumuladas na ordem de chegada. Mensagens de progresso continuam ignoradas.

Remover `nextId` e o campo `id` das mensagens nos dois arquivos, incluindo os exemplos do docstring Python. Conservar os dados de geração e o formato `ready`, tomada, `done` com erro opcional. Uma falha de geração continua rejeitando somente aquele pedido e libera a fila para o próximo; uma saída inesperada do processo continua rejeitando a inicialização ou o pedido ativo conforme o tratamento existente. Não introduzir retries ou novos estados de encerramento nesta poda.

Alternativa descartada: manter o mapa para concorrência futura. O processo e a GPU são usados em série, e a fila permanece sendo a garantia dessa serialização. O protocolo é privado e seus dois lados são entregues juntos; `voice.json`, manifestos, caches, sementes e parâmetros do modelo não mudam.

### 4. Eliminar seleções neutras sem mudar a saída do som — item 10

Usar `frames / RATE / 60`, `integrated(voice_m)`, `below[speaking]` e `playing = ~absent`; retirar interseções com `content` e filtros de picos/limites que retêm tudo. `effect_heights` passa a receber `properties["peak_heights"]` diretamente.

Manter `series.conteudo` como uma lista de `1` com o mesmo comprimento de `seconds[::RATE]`, inclusive no último segundo incompleto. Preservar todas as outras chaves, unidades, arredondamentos e regras para valores não finitos. Alternativa descartada: remover a chave JSON por não aparecer no cliente TypeScript; o relatório também é um artefato de conferência.

### 5. Remover só as exceções sem versão correspondente — item 3

Retirar o bloco atual `minimumReleaseAgeExclude`. Preservar `allowBuilds`, o override e as versões exatas do Remotion. Atualizar a frase de `AGENTS.md` para explicar que exceções eventualmente geradas por `pnpm run upgrade` devem ser limitadas às versões necessárias e que entradas obsoletas podem ser removidas. O comando de atualização continua o mesmo; não rodar upgrade nesta mudança.

Alternativa descartada: trocar as entradas por exceções amplas de `@remotion/*`; isso ampliaria uma configuração cuja necessidade não foi observada. Conferir a instalação com o lockfile congelado e sem mudar sua resolução.

### 6. Conferir equivalência com provas proporcionais

- Antes de editar, guardar em `out/rascunho/poda-de-props-e-duplicacoes/` somente as referências necessárias às comparações: valores das fórmulas, quadros escolhidos e JSON do medidor. Nenhuma composição paralela ou flag de versão entra em `src/`.
- Comparar `walked` em `t < 0`, `0`, na junção da frenagem e seus dois lados, `1` e `> 1`, para os três parâmetros; comparar `spin` em zero, ângulos positivos e negativos. Usar os testes de poses existentes para o alcance e a fixação das mãos.
- Conferir `blend` nas paletas reais, no meio e nos extremos, incluindo os arrays da água-viva e a identidade dos retornos de `dressed`. Manter os testes de contraste. Usar a relação inversa com `framing` nos testes de câmera para conferir `seenAt`.
- Cobrir a fila com teste focado em `scripts/lib/voice-worker.test.ts`, usando o Vitest existente e um processo simulado: dois pedidos chamados juntos, várias tomadas, `done`, erro de um pedido seguido de sucesso e encerramento inesperado durante um pedido. Não criar injeção de dependências na API de produção só para o teste. Conferir junto o formato emitido pelo Python.
- Medir antes e depois os mesmos stems já disponíveis em `out/why-we-sleep/som/why-we-sleep/stems/why-we-sleep`, com saída em arquivos distintos na bancada temporária, e comparar o JSON completo. Não separar o áudio de novo nem recalibrar a referência.
- Conferir quadros da fachada, prateleiras, figurantes, passagem para pijama, elefanta entre noite e dia e projeção do quadro-negro; cobrir `stockroom`, `stockroom-night`, `one-of-them`, `elephant-awake`, `elephant-verdict` e `biggest-mistake`. Conferir a frenagem em `night-falls` e as poses de `vigilia`/`inside-night`. Renderizar as cenas ajustadas com `pnpm scene` quando necessário para a conferência do movimento; comparações avulsas ficam em `out/rascunho/`.
- Ao fim, executar `pnpm lint` e `pnpm test`. Sem mudança de roteiro ou mídia de voz/trilha, não é necessário regerar a narração, a trilha ou o vídeo inteiro.

## Risks / Trade-offs

- [Reaparecer um consumidor de uma prop antes da aplicação] → Repetir a busca direcionada antes de remover; se houver uso novo, preservar o comportamento e revisar esse item.
- [Mover um helper criar ciclo de imports ou mudar arredondamento] → Usar os destinos definidos, importar diretamente e manter a fórmula, conferindo os valores e os quadros afetados.
- [Um pedido do worker resolver a Promise errada sem ID] → Preservar a fila e limpar o pedido ativo antes de concluir; testar dois pedidos concorrentes do lado do cliente e uma falha recuperável.
- [Um filtro retirado alterar o relatório] → Comparar todo o JSON sobre os mesmos stems e preservar a série de conteúdo, inclusive seu tamanho.
- [Redução líquida menor que a estimativa após testes e imports] → Relatar o delta real; nenhuma meta de linhas se sobrepõe à equivalência.

## Migration Plan

Aplicar os 11 itens no lugar, com o vínculo à auditoria nas tarefas. Cliente e servidor do worker mudam na mesma unidade de implementação; encerrar uma sessão antiga de `pnpm voice` e iniciá-la de novo depois dessa troca. Não há migração dos arquivos de vídeo ou de escolhas de voz.

A reversão é pelo diff de cada corte no git. Reverter juntos os dois lados do protocolo e cada helper movido com seus consumidores; preservar trabalho posterior e os dados pessoais e gerados. As comparações em `out/rascunho/` podem ser descartadas depois da conferência.
