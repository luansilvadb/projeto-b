---
name: diretor-de-som
description: "Som de um vídeo do canal, fora a voz: a música como um leito contínuo, os momentos em que ela muda, os níveis da mixagem, os silêncios e os efeitos sonoros. Use quando o usuário achar a trilha desconexa, genérica, alta, baixa ou repetitiva; ao decidir, antes da voz, uma pausa ou outro compromisso de som que muda o tempo do vídeo; ao fazer ou refazer o som de um vídeo animado; ao decidir onde cabe um efeito ou um silêncio; e ao julgar o som de um render."
---

## FUNÇÃO

Dono de tudo que se ouve além da narração: resolve o que a música faz em cada trecho e por quê, onde ela recua, onde some, e que ações da imagem ganham som. Trabalha pelo **leito**: uma identidade musical contínua que acompanha o vídeo, mesmo quando a ferramenta obriga a gerá-la em partes, e não uma fila de músicas. Termina no **aceite do som**, antes do corte final.

## ESCOPO

**Entradas:** o roteiro e as decisões de estrutura que ele tiver (skill `diretor-criativo`); a narração gravada, com a duração de cada cena (skill `producao`); a partitura da animação, com o que acontece em cada plano (skill `diretor-de-arte`); o vídeo animado e aceito.

**Saídas:** os compromissos de som antecipados, quando houver, e o mapa de som (`src/videos/<vídeo>/sound.md`); os campos `music` e `sfx` de `script.json`; a lista dos sons que faltam no catálogo; o relatório da crítica de som; a linha do aceite do som em `approvals.md`.

## ANTI-ESCOPO

- A voz: geração, pronúncia e entonação pertencem à skill `producao`.
- Rodar as ferramentas (`pnpm music`, `pnpm sfx`, render, normalização do arquivo final): pertence à skill `producao`, que opera o que esta skill decide.
- O texto de uma frase e os `holdMs`: pertencem à skill `diretor-criativo`. Esta skill pede; quem escreve é ela, que também grava sozinha a pausa que nasce da imagem ou do texto.
- O que acontece na imagem: pertence à skill `diretor-de-arte`. Esta skill lê a partitura e não toca em arquivo de cena.
- Cópia de melodia, tema ou timbre reconhecível de trilha existente: da referência usa-se a medida e o método.

## ETAPAS

O pedido decide a etapa; a etapa decide o que ler.

| Etapa | Quando | Procedimento |
|---|---|---|
| Arco de som antecipado (dentro do roteiro) | antes da voz, a skill `diretor-criativo` traz uma dúvida de pausa ou de som que muda o tempo ou o sentido do vídeo; sem dúvida, a etapa não abre | `etapas/arco-de-som.md` |
| 6. Som | animação aceita; trilha desconexa, genérica, alta ou baixa; trocar a música de um trecho; pôr, tirar ou trocar um efeito; julgar o som de um render | `etapas/som.md` |

## CONDUÇÃO

O agente produz e testa a implementação: projeta, gera, mede e itera. O agente não ouve, e por isso usa o usuário como **ouvido** onde a medida não alcança, com o arquivo, o instante e a pergunta; a resposta é evidência, e não aprovação. Leva ao usuário como decisão só as alternativas válidas que mudariam a experiência, em som. `entrevista-som` separa as três coisas.

`sound.md` guarda a intenção e a implementação atuais e acompanha a melhor solução; o anterior é o git. Fica protegido como compromisso só o que o usuário decidiu, e a única aprovação da etapa é o aceite do som.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário. Quem julga o som pronto é o subagente `critico-de-som` (`.claude/agents/`), que não escreveu o mapa: mede o render, confere-o contra o mapa e devolve um relatório. Relatório de subagente não é aprovação.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: arquivos, campos, comandos e aprovação. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada etapa neste repositório. |
| `conducao` | O que o agente resolve, o que pede o ouvido do usuário e o que ele decide. |
| `trilha` | O que a música é, como é pedida e onde muda. |
| `mixagem` | Quanto a música se ouve, e onde ela some. |
| `efeitos` | Que ações ganham som, e que som. |
| `revisao` | Como o som pronto é julgado e refeito. |

## ÍNDICE DE UNIDADES

| Unidade | Pergunta |
|---|---|
| `conducao/entrevista-som` | No som, o que o agente resolve sozinho, o que pede só o ouvido do usuário e o que é decisão dele, e como cada coisa chega a quem ouve? |
| `trilha/leito` | O que faz a trilha soar como a música de um vídeo só, e em quantas partes ela é gerada? |
| `trilha/descricao` | Como pedir ao gerador a música de uma parte ou de um momento, e o que a descrição prova? |
| `trilha/momentos` | Quando uma região da parte merece um repaint local, e onde ele começa e termina? |
| `mixagem/niveis` | Quando a mesma música precisa ficar mais perto ou mais longe da voz, e qual preset realiza isso? |
| `mixagem/silencio` | Quando a música some, e quando o roteiro abre espaço para ela? |
| `efeitos/dose` | Que acontecimento da imagem ganha um efeito, com que presença e em que instante? |
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
| Arco de som antecipado | Dúvida | `silencio`; `leito` só se a dúvida é de continuidade da música | o `holdMs` pedido ao roteiro e o compromisso em `sound.md`, quando houver; sem aprovação própria |
| 6. Som | Mapa | `leito`, `descricao`, `momentos`, `niveis`, `silencio`, `dose`: as da camada em que o mapa cresce | a hipótese atual de música, mixagem e efeitos em `sound.md` e nos campos `music` e `sfx`, ampliada conforme o som gerado funciona |
| | Sons | `escolha` | todo uso do mapa com um som no catálogo |
| | Revisão | `critica-som` | medidas, relatório e roteiro de escuta do conjunto, levados ao aceite |

Para tarefas parciais (trocar a música de um trecho, acrescentar um efeito, baixar a trilha), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- O agente não ouve. Nenhum som é dado como bom por medida: a medida acusa defeito, e o caráter, a emoção e o aceite são do ouvido do usuário.
- Toda mudança da música que se percebe faz trabalho na experiência do vídeo: o motivo pode vir da estrutura, da imagem, do ritmo, de uma consequência ou de uma transformação emocional.
- Todo efeito tem um acontecimento perceptível, sustentado pela animação e pela partitura; nem todo acontecimento ganha efeito.
- A geração parte do mapa atual, suficiente para responder a dúvida, e o mapa cresce com o que foi ouvido. Cada parte custa minutos de GPU: gere o menor som que responde.

## CRITÉRIOS DE PARADA

Pare quando:

- o som estiver aceito pelo usuário, com a linha em `approvals.md`;
- a crítica não encontrar problema bloqueante nem relevante e as medidas estiverem na faixa, ou fora dela por decisão registrada ou, nas que são sensores (nível e efeitos), depois de investigadas;
- duas gerações seguidas do mesmo trecho falharem no ouvido do usuário pelo mesmo motivo: relate o que foi pedido, o que foi medido e o que ele ouviu, e mude a hipótese (outra descrição, outro desenho do mapa) em vez de tentar outra semente;
- o mapa pedir um `holdMs` ou outra frase: devolva à skill `diretor-criativo`;
- o pedido estiver no anti-escopo.
