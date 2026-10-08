# Tasks

O som segue a skill `diretor-de-som` (`etapas/som.md`), e a operação das ferramentas, a skill `producao` (`etapas/efeitos-sonoros.md`, `etapas/trilha.md`). O vídeo é sempre `why-we-sleep`. O que é do ouvido vai ao usuário com o arquivo, o instante e a pergunta.

## 1. Sons que já se sabe que faltam

Pode andar antes de a poda terminar: é do catálogo, e não do tempo do vídeo.

- [x] 1.1 Para cada uso pendente de `sound.md` (carimbo, jato de água, papel dobrado, despertador de corda, tesoura, queda de corpo em terra, queda em colchão, pouso na areia, caixa de papelão pousando), buscar com `pnpm sfx "<busca em inglês>"` e reduzir a um candidato, ou dois quando a comparação ajuda; conferir que cada uso tem candidato ou foi marcado sem resultado depois de duas buscas diferentes
- [x] 1.2 Montar em `out/rascunho/sons-novos.md` a lista para a escuta: o uso, a ação e a cena, o link e a duração de cada candidato; levar ao usuário e anotar a resposta de cada uso
- [x] 1.3 Corrigir o medidor para completar a janela de 400 ms com silêncio apenas durante a medição, acrescentar teste de áudio curto e documentar o comportamento (escopo autorizado em 2026-10-08); para cada som aprovado, rodar `pnpm sfx <id>` novamente e colar em `SFX`, em `src/audio/sfx.ts`, a linha impressa com o nome do uso; apagar de `public/sfx/freesound/` os baixados que não entraram; conferir com `pnpm lint` e `pnpm vitest run src/audio/sfx.test.ts scripts/lib/loudness.test.ts`

## 2. Inventário

- [x] 2.1 Conferir que a segunda rodada de `poda-dos-ecos-why-we-sleep` está aceita e montada (`out/why-we-sleep/why-we-sleep.mp4` com a duração da narração atual); se não estiver, parar aqui e dizer o que falta
- [x] 2.2 Ler `score.md` plano a plano e escrever em `sound.md` o inventário, no lugar de "Efeitos colocados" e "Efeitos pendentes": a ação, o tipo, a palavra de deixa e o atraso, o uso, o nível e, quando fica sem som, o motivo; conferir que toda ação repetida tem uma linha por repetição e que nenhuma linha marca corte, texto que só entra ou câmera
- [x] 2.3 Para as ações cujo instante a partitura não dá, medir no código da cena a palavra e o atraso; conferir que nenhuma linha do inventário ficou com instante estimado
- [x] 2.4 Buscar e levar à escuta os usos novos que o inventário achou além dos do grupo 1, pelo mesmo caminho das tarefas 1.1 a 1.3

## 3. Música

- [x] 3.1 Em `script.json`, pôr o vídeo inteiro em `recuo` (`music.levels` a partir de `third-of-life`, mantendo a vinheta e o silêncio de `so-far`); conferir com `pnpm check-script why-we-sleep`
- [x] 3.2 Renderizar o som de um trecho com fala e efeitos e de um sem efeitos, em `out/rascunho/`, e conferir num silêncio de fala que a música está no arquivo; levar os dois ao usuário com a pergunta se a música ainda atrapalha
- [x] 3.3 Se ele pedir mais baixa: descer juntos os três níveis de `MUSIC_MIX.levelsDb`, tirar o `recuo` geral do roteiro, atualizar o teste de `src/audio/` e a tabela de `diretor-de-som/mixagem/niveis.md`, e repetir a 3.2; conferir com `pnpm lint` e `pnpm test`. Se ele aceitar em 17 dB, marcar esta tarefa como não necessária, com a resposta dele — não necessária: em 2026-10-08 o usuário ouviu os dois trechos e respondeu "A música já está no fundo".
- [x] 3.4 Em `script.json`, dar à primeira parte da trilha a descrição, o andamento e o tom da segunda e tirar os cinco momentos dela; conferir com `pnpm check-script why-we-sleep`
- [x] 3.5 Com os outros programas fechados e nenhum render em paralelo, rodar `pnpm music why-we-sleep 1 1`; conferir na saída que só a primeira parte foi gerada e que `music.json` manteve a segunda
- [x] 3.6 Renderizar o som dos dois primeiros minutos e levar ao usuário com a pergunta se é a mesma música que ele aprovou no fim; recusada, repetir a 3.5 com outra semente, e depois de duas recusas dizer que a linha de parada chegou e o que resta

## 4. Efeitos em sincronia

- [x] 4.1 Acrescentar a âncora `at: "end"` com validação, teste de duração alterada e documentação (escopo autorizado em 2026-10-08); escrever em `script.json` um item de `sfx` por linha do inventário que tem som, com a mesma âncora que a cena usa e `offsetMs` igual ao atraso da ação; os três jatos de `jellyfish-debt` em "soltaram", "tanque" e "água"; conferir com `pnpm check-script why-we-sleep`
- [x] 4.2 Renderizar o som (`pnpm sound why-we-sleep out/why-we-sleep/why-we-sleep.som.mp3`) e montar (`pnpm join why-we-sleep`); conferir num silêncio de fala que a música está no arquivo
- [x] 4.3 Com um script descartável em `out/rascunho/`, calcular com `sfxEvents` o quadro de cada efeito e montar, por cena, a folha de contato com esse quadro e o de dois quadros antes; ler cada folha e conferir que a ação começa entre um e outro
- [x] 4.4 Corrigir o `offsetMs` dos efeitos que não passaram e repetir a 4.2 e a 4.3 só para as cenas deles, até toda folha passar
- [x] 4.5 Passar os testes de remoção, de conjunto e de lacuna de `efeitos/dose` sobre a lista final; tirar o efeito que não acrescenta e anotar no inventário o motivo

## 5. Conjunto

- [x] 5.1 Limpar o cache em `out/why-we-sleep/som/` e rodar `pnpm critique why-we-sleep som`; conferir os cenários de `specs/music-presence/spec.md` contra as medidas e o mapa segundo a segundo (a remoção foi bloqueada pela revisão automática; preservar a pasta anterior em `out/rascunho/` realiza a mesma limpeza sem apagá-la)
- [x] 5.2 Acionar o `critico-de-som` sobre o som novo, com o mapa de `sound.md`; corrigir o que for defeito técnico e juntar as dúvidas de ouvido que ele localizar
- [x] 5.3 Atualizar `sound.md`: o estado, o arco (um leito em duas partes, sem momentos na primeira), os níveis, o inventário final com os instantes do vídeo montado, os usos pendentes e as medidas; registrar que a música abaixo da faixa da referência é decisão do usuário; conferir que nenhum instante escrito é de uma versão anterior
- [x] 5.4 `pnpm lint` e `pnpm test` passam
- [x] 5.5 Levar o vídeo ao usuário para a escuta do conjunto, com as dúvidas de ouvido do crítico (arquivo, instante e pergunta), os usos que ficaram sem som e a contagem de efeitos de antes e de depois

## Workflow follow-up

- Com o som aceito, fazer a pergunta da retrospectiva: se música no fundo e efeito em toda ação que se vê valem para os próximos vídeos. Com o "sim", a lição entra em `diretor-de-som/efeitos/dose` e em `mixagem/niveis`, num commit só.
- Arquivar a mudança depois do aceite do usuário.
