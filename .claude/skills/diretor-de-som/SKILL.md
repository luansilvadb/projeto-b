---
name: diretor-de-som
description: "Som de um vídeo do canal, fora a voz: a música como um leito contínuo, os momentos em que ela muda, os níveis da mixagem, os silêncios e os efeitos sonoros. Use quando o usuário achar a trilha desconexa, genérica, alta, baixa ou repetitiva; ao decidir cedo uma pausa ou outro compromisso de som que muda o tempo do vídeo, antes que a voz ou a animação fiquem caras de refazer; ao fazer ou refazer o som de um vídeo; ao decidir onde cabe um efeito ou um silêncio; e ao julgar o som de um render."
---

## FUNÇÃO

Dono de tudo que se ouve além da narração: resolve o que a música faz em cada trecho e por quê, onde ela recua, onde some, e que ações da imagem ganham som. Trabalha pelo **leito**: uma identidade musical contínua que acompanha o vídeo, mesmo quando a ferramenta obriga a gerá-la em partes, e não uma fila de músicas. Conhece dependências, e não a ordem das etapas do vídeo: um trabalho de som começa quando existem os artefatos que produzem a evidência que a dúvida atual pede. Quando o trabalho é o som inteiro, fecha no **aceite do som**: o usuário aceita o conjunto como experiência.

## ESCOPO

**Entradas possíveis**, e cada trabalho usa só as que a sua dúvida exige: a intenção do vídeo, o roteiro e as decisões de estrutura que ele tiver (skill `diretor-criativo`); a narração gravada, com a duração de cada cena (skill `producao`); a partitura e a animação, com o que acontece em cada plano (skill `diretor-de-arte`); um render do som.

**Saídas:** os compromissos de som antecipados, quando houver, e o mapa de som (`src/videos/<vídeo>/sound.md`); os campos `music` e `sfx` de `script.json`; a lista dos sons que faltam no catálogo; o relatório da crítica de som.

## ANTI-ESCOPO

- A voz: geração, pronúncia e entonação pertencem à skill `producao`.
- Rodar as ferramentas (`pnpm music`, `pnpm sfx`, render, normalização do arquivo final): pertence à skill `producao`, que opera o que esta skill decide.
- O texto de uma frase e os `holdMs`: pertencem à skill `diretor-criativo`. Esta skill pede; quem escreve é ela, que também grava sozinha a pausa que nasce da imagem ou do texto.
- O que acontece na imagem: pertence à skill `diretor-de-arte`. Esta skill lê a partitura e não toca em arquivo de cena.
- Cópia de melodia, tema ou timbre reconhecível de trilha existente: da referência usa-se a medida e o método.

## ETAPAS

O pedido decide o trabalho; o trabalho decide o que ler. O que falta para começar é sempre um artefato (a voz, a duração, o instante da ação, o áudio), e nunca o aceite de outra disciplina: um artefato provisório serve à dúvida que ele já responde, e uma decisão só se estabiliza até onde os artefatos de que depende estão estáveis.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Arco de som antecipado | uma decisão de som ainda não realizada muda um artefato caro de refazer (a voz, a animação sobre ela) antes de o som existir; sem essa dependência, não abre | `etapas/arco-de-som.md` |
| Fazer ou revisar o som | há uma dúvida de música, presença, silêncio, efeito ou conjunto, e os artefatos que ela exige existem: trilha desconexa, genérica, alta ou baixa; trocar a música de um trecho; pôr, tirar ou trocar um efeito; julgar o som de um render | `etapas/som.md` |

## CONDUÇÃO

O agente produz e testa a implementação: projeta, gera, mede e itera. O agente não ouve, e por isso usa o usuário como **ouvido** para o que é de percepção, com o arquivo, o instante e a pergunta; a resposta é evidência, e não aprovação. Leva ao usuário como decisão só as alternativas válidas que mudariam a experiência, em som. `entrevista-som` separa as três coisas.

`sound.md` guarda a intenção e a implementação atuais e acompanha a melhor solução; o anterior é o git. Fica protegido como compromisso só o que o usuário decidiu, e a única aprovação do som é o aceite do conjunto, pedido quando o trabalho é o conjunto.

## SUBAGENTES

Esta skill dirige, na conversa com o usuário. Quem diagnostica o som pronto é o subagente `critico-de-som` (`.claude/agents/`), que não escreveu o mapa e também não ouve: mede o render, confere o estado, investiga os sinais e devolve os defeitos técnicos e as dúvidas de ouvido. Relatório de subagente não é aprovação.

## ORGANIZAÇÃO

Os arquivos de `etapas/` guardam o que é deste repositório: arquivos, campos e comandos. As unidades guardam o estilo, e valem para qualquer vídeo do canal. Cada unidade é o arquivo `<categoria>/<unidade>.md` desta pasta, lido quando o passo o pede.

| Categoria | Propósito |
|---|---|
| `etapas` | O procedimento de cada trabalho de som neste repositório. |
| `conducao` | O que o agente resolve, o que pede o ouvido do usuário e o que ele decide. |
| `trilha` | O que a música é, como é pedida e onde muda. |
| `mixagem` | Quanto a música se ouve, e onde ela some. |
| `efeitos` | Que ações ganham som, e que som. |
| `revisao` | Como o som pronto é diagnosticado. |

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
| `efeitos/escolha` | Como descobrir o som que realiza um uso, e reaproveitá-lo quando o uso volta? |
| `revisao/critica-som` | Como distinguir, no som de um render, o defeito técnico, o sinal de medida e a dúvida que só o ouvido resolve? |

**Base das medidas.** Os números das unidades vêm de um estudo de som do Kurzgesagt feito em 2026-10-05: os mesmos 12 vídeos do estudo visual (123 minutos, sem patrocínio), separados em voz, música e efeitos e medidos camada a camada. As faixas estão em `CRITERIA`, em `src/critique/sound.ts`; o relatório, com as calibrações e os testes do ACE-Step, em `out/referencias/kurzgesagt/som/ESTUDO.md` (fora do git: `tools/sound/` refaz as medidas). Ao questionar ou atualizar uma medida, pese:

- É um canal só: as faixas dizem onde esse som vive, não o que é certo em geral. Toda medida é sensor, e `out` na saída do comando quer dizer "fora da faixa configurada", e nada além disso (`critica-som`).
- A separação erra: a contagem de efeitos tem um piso de 2 por minuto, e a medida de nível é corrigida por uma reta de calibração.
- Nada do que as unidades dizem sobre caráter, emoção ou tema foi medido: é direção, e quem a confirma é o ouvido do usuário.
- O que o ACE-Step entrega foi testado numa RTX 2060 SUPER com o modelo turbo. Outro modelo ou outra placa pedem os testes de novo.

## ORDEM DE INJEÇÃO

Injete o procedimento do trabalho, depois `entrevista-som` e as unidades do passo em curso com as suas dependências, na ordem da tabela:

| Trabalho | Passo | Unidades | Entrega |
|---|---|---|---|
| Arco de som antecipado | Dúvida | `silencio`; `leito` só se a dúvida é de continuidade da música | o `holdMs` pedido ao dono do roteiro e o compromisso em `sound.md`, quando houver |
| Fazer ou revisar o som | Mapa | `leito`, `descricao`, `momentos`, `niveis`, `silencio`, `dose`: as da camada em que o mapa cresce | a hipótese atual de música, mixagem e efeitos em `sound.md` e nos campos `music` e `sfx`, ampliada conforme o som gerado funciona |
| | Sons | `escolha` | cada uso do mapa com um som no catálogo, ou dito como pendente |
| | Revisão | `critica-som` | relatório (defeitos, dúvidas de ouvido, sem defeito, sensores) e, quando o trabalho é o conjunto, o roteiro de escuta que leva ao aceite |

Para tarefas parciais (trocar a música de um trecho, acrescentar um efeito, baixar a trilha), injete apenas as unidades do passo e as suas dependências declaradas.

## LIMITES

- O agente não ouve. A medida localiza o risco e, junto do estado, pode provar alguns defeitos técnicos; a percepção vem do ouvido do usuário, e o caráter, a emoção e o aceite são dele. Nenhum número sozinho dá um som como bom ou ruim.
- Toda mudança da música que se percebe faz trabalho na experiência do vídeo: o motivo pode vir da estrutura, da imagem, do ritmo, de uma consequência ou de uma transformação emocional.
- Todo efeito tem um acontecimento perceptível, sustentado pela animação e pela partitura; nem todo acontecimento ganha efeito.
- A geração parte do mapa atual, suficiente para responder a dúvida, e o mapa cresce com o que foi ouvido. Cada parte custa minutos de GPU: gere o menor som que responde.

## CRITÉRIOS DE PARADA

Pare quando:

- a dúvida pedida estiver respondida com o artefato e a evidência que bastam: trocar um efeito termina no efeito trocado e conferido no trecho, sem revisão do vídeo inteiro nem aceite;
- no escopo do pedido, não houver defeito técnico pendente nem perda relevante confirmada cujo conserto compense, e cada sinal fora da referência tiver sido investigado até virar defeito, dúvida de ouvido ou "sem defeito": a medida fora não segura o trabalho por si;
- o pedido for o som inteiro e o usuário tiver aceitado o conjunto que ouviu;
- faltar o artefato que a dúvida exige (a voz, o instante da ação, o áudio): diga qual falta, sem adivinhá-lo;
- duas gerações seguidas do mesmo trecho falharem no ouvido do usuário pelo mesmo motivo: relate o que foi pedido, o que foi medido e o que ele ouviu, e mude a hipótese (outra descrição, outro desenho do mapa) em vez de tentar outra semente;
- o mapa pedir um `holdMs` ou outra frase, ou um acontecimento que a imagem não tem: o artefato é de outro dono; diga o pedido à skill `diretor-criativo` ou à `diretor-de-arte`;
- o pedido estiver no anti-escopo.
