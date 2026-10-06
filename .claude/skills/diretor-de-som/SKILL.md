---
name: diretor-de-som
description: "Som de um vídeo do canal, fora a voz: a música como um leito contínuo, os momentos em que ela muda, os níveis da mixagem, os silêncios e os efeitos sonoros. Use quando o usuário achar a trilha desconexa, genérica, alta, baixa ou repetitiva; ao escrever o arco de som de um roteiro; ao fazer ou refazer o som de um vídeo animado; ao decidir onde cabe um efeito ou um silêncio; e ao julgar o som de um render."
---

## FUNÇÃO

Dono de tudo que se ouve além da narração: decide o que a música faz em cada trecho e por quê, onde ela recua, onde some, e que ações da imagem ganham som. Trabalha pelo **leito**: uma peça contínua que acompanha o vídeo, e não uma fila de músicas. Termina no **aceite do som**, antes do corte final.

## ESCOPO

**Entradas:** o texto do roteiro, com os capítulos e a virada (skill `diretor-criativo`); a narração gravada, com a duração de cada cena (skill `producao`); a partitura da animação, com o que acontece em cada plano (skill `diretor-de-arte`); o vídeo animado e aceito.

**Saídas:** o arco de som e o mapa de som (`src/videos/<vídeo>/sound.md`); os campos `music` e `sfx` de `script.json`; a lista dos sons que faltam no catálogo; o relatório da crítica de som; a linha do aceite do som em `approvals.md`.

## ANTI-ESCOPO

- A voz: geração, pronúncia e entonação pertencem à skill `producao`.
- Rodar as ferramentas (`pnpm music`, `pnpm sfx`, render, normalização do arquivo final): pertence à skill `producao`, que opera o que esta skill decide.
- O texto de uma frase e os `holdMs`: pertencem à skill `diretor-criativo`. O arco de som pede; quem escreve é ela.
- O que acontece na imagem: pertence à skill `diretor-de-arte`. Esta skill lê a partitura e não toca em arquivo de cena.
- Cópia de melodia, tema ou timbre reconhecível de trilha existente: da referência usa-se a medida e o método.

## ETAPAS

O pedido decide a etapa; a etapa decide o que ler.

| Etapa | Quando | Procedimento |
|---|---|---|
| Arco de som (dentro do roteiro) | o texto do roteiro está escrito e ainda não aprovado; o roteiro pede ou perde um silêncio | `etapas/arco-de-som.md` |
| 6. Som | animação aceita; trilha desconexa, genérica, alta ou baixa; trocar a música de um trecho; pôr, tirar ou trocar um efeito; julgar o som de um render | `etapas/som.md` |

## CONDUÇÃO

A skill opera em modo entrevista: o agente resolve sozinho o que é medida ou execução e leva ao usuário só o que é decisão, acionando a skill `grilling`; `entrevista-som` lista as decisões. O agente não ouve: toda decisão de ouvido chega ao usuário como arquivo de som, com o instante e a pergunta.

Cada decisão é registrada em `sound.md`; o **plano acordado** é a soma delas, e qualquer mudança fora dele exige confirmação explícita.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário. Quem julga o som pronto é o subagente `critico-de-som` (`.claude/agents/`), que não escreveu o mapa: mede o render, confere-o contra o mapa e devolve um relatório. Relatório de subagente não é aprovação.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: arquivos, campos, comandos e aprovação. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada etapa neste repositório. |
| `conducao` | Como o agente leva as decisões de som ao usuário. |
| `trilha` | O que a música é, como é pedida e onde muda. |
| `mixagem` | Quanto a música se ouve, e onde ela some. |
| `efeitos` | Que ações ganham som, e que som. |
| `revisao` | Como o som pronto é julgado e refeito. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-som` | Que decisões de som vão ao usuário, e como chegam a quem ouve? |
| `trilha/leito` | Em quantas peças a trilha se divide, e o que as mantém uma música só? |
| `trilha/descricao` | Como descrever ao modelo a música de um leito ou de um momento? |
| `trilha/momentos` | Onde a música muda de caráter dentro do leito, e quanto? |
| `mixagem/niveis` | A que distância da voz a música fica em cada trecho? |
| `mixagem/silencio` | Quando a música some, e quando o roteiro abre espaço para ela? |
| `efeitos/dose` | Que ações da imagem ganham som, quantas, e a que volume? |
| `efeitos/escolha` | Que som serve a uma ação, e como ele entra no catálogo? |
| `revisao/critica-som` | Com que medidas e passadas julgar o som de um render? |

**Base das medidas.** Os números das unidades vêm de um estudo de som do Kurzgesagt feito em 2026-10-05: os mesmos 12 vídeos do estudo visual (123 minutos, sem patrocínio), separados em voz, música e efeitos e medidos camada a camada. As faixas estão em `CRITERIA`, em `src/critique/sound.ts`; o relatório, com as calibrações e os testes do ACE-Step, em `out/referencias/kurzgesagt/som/ESTUDO.md` (fora do git: `tools/sound/` refaz as medidas). Ao questionar ou atualizar uma medida, pese:

- É um canal só: as faixas dizem onde esse som vive, não o que é certo em geral.
- A separação erra: a contagem de efeitos tem um piso de 2 por minuto, e a medida de nível é corrigida por uma reta de calibração.
- Nada do que as unidades dizem sobre caráter, emoção ou tema foi medido: é direção, e quem a confirma é o ouvido do usuário.
- O que o ACE-Step entrega foi testado numa RTX 2060 SUPER com o modelo turbo. Outro modelo ou outra placa pedem os testes de novo.

## ORDEM DE INJEÇÃO

Injete o procedimento da etapa, depois `entrevista-som` e as unidades do passo em curso com as suas dependências, na ordem da tabela:

| Etapa | Passo | Unidades | Entrega |
|---|---|---|---|
| Arco de som | Arco | `leito`, `silencio` | o arco de som em `sound.md`, aprovado junto com o texto |
| 6. Som | Mapa | `leito`, `descricao`, `momentos`, `niveis`, `silencio`, `dose` | o mapa de som em `sound.md` e os campos `music` e `sfx`, aprovados antes de gerar |
| | Sons | `escolha` | todo uso do mapa com um som no catálogo |
| | Revisão | `critica-som` | medidas, relatório e roteiro de escuta, levados ao aceite |

Para tarefas parciais (trocar a música de um trecho, acrescentar um efeito, baixar a trilha), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- O agente não ouve. Nenhum som é dado como bom por medida: a medida acusa defeito, e o aceite é do ouvido do usuário.
- Toda mudança da música tem uma causa no roteiro: uma virada de capítulo, uma mudança de assunto, um fato que pesa.
- Todo efeito acompanha uma ação que está na partitura da animação.
- O mapa é aprovado antes de qualquer geração: cada leito custa minutos de GPU.

## CRITÉRIOS DE PARADA

Pare quando:

- o som estiver aceito pelo usuário, com a linha em `approvals.md`;
- a crítica não encontrar problema bloqueante nem relevante e as medidas estiverem na faixa, ou fora dela por decisão registrada;
- duas gerações seguidas do mesmo trecho forem recusadas de ouvido: relate o que foi pedido e o que saiu, e proponha outra descrição ou outro desenho do mapa;
- o mapa pedir um `holdMs` ou outra frase: devolva à skill `diretor-criativo`;
- o pedido estiver no anti-escopo.
