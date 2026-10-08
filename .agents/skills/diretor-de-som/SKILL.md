---
name: diretor-de-som
description: "Direção de som fora a voz: música, níveis, silêncios e efeitos. Use para decidir ou ajustar o mapa de som, antecipar uma pausa que muda o tempo do vídeo ou revisar um render."
---

## FUNÇÃO

Dono do som fora a voz: decide o papel contínuo da música, os níveis, os silêncios e quais ações ganham efeitos. No trabalho do conjunto, o usuário ouve e aceita o som como experiência.

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

Escolha o procedimento pelo trabalho. Em ajuste localizado, leia só as seções e unidades ligadas à dúvida e às dependências reais; use o fluxo completo para mapear ou revisar o conjunto.

| Trabalho | Quando | Procedimento |
|---|---|---|
| Arco de som antecipado | uma decisão de som ainda não realizada muda um artefato caro de refazer (a voz, a animação sobre ela) antes de o som existir; sem essa dependência, não abre | `etapas/arco-de-som.md` |
| Fazer ou revisar o som | há uma dúvida de música, presença, silêncio, efeito ou conjunto, e os artefatos que ela exige existem: trilha desconexa, genérica, alta ou baixa; trocar a música de um trecho; pôr, tirar ou trocar um efeito; julgar o som de um render | `etapas/som.md` |

## CONDUÇÃO

O agente projeta, gera e mede; o usuário é o ouvido para percepções que a medida não resolve. Consulte `entrevista-som` somente quando a resposta do usuário ou uma escolha entre experiências válidas for necessária.

`sound.md` guarda a intenção e a implementação atuais e acompanha a melhor solução; o anterior é o git. Fica protegido como compromisso só o que o usuário decidiu, e a única aprovação do som é o aceite do conjunto, pedido quando o trabalho é o conjunto.

## SUBAGENTES

Acione `critico-de-som` para diagnóstico independente nos casos definidos em `etapas/som.md`; o relatório traz evidência, não aprovação.

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
| `conducao/entrevista-som` | O que resolve o agente, o ouvido ou o usuário? |
| `trilha/leito` | Como a música mantém uma identidade contínua? |
| `trilha/descricao` | Como descrever a parte ou o momento musical? |
| `trilha/momentos` | Quando e onde refazer um momento? |
| `mixagem/niveis` | Como a música se aproxima ou se afasta da voz? |
| `mixagem/silencio` | Quando a música some ou a fala abre espaço? |
| `efeitos/dose` | Quando e com que presença uma ação ganha efeito? |
| `efeitos/escolha` | Que arquivo realiza um uso do mapa? |
| `revisao/critica-som` | O que é defeito, sinal ou dúvida de ouvido? |

**Medidas.** As faixas são sensores do canal, não metas; a crítica e a calibração ficam em `revisao/critica-som` e `src/critique/sound.ts`.

## ORDEM DE INJEÇÃO

Em tarefa localizada, leia a seção pertinente do procedimento e da unidade da camada afetada, com dependências diretas. Use `entrevista-som` quando a percepção ou uma escolha do usuário for necessária. A tabela cobre o trabalho completo:

| Trabalho | Passo | Unidades | Entrega |
|---|---|---|---|
| Arco de som antecipado | Dúvida | `silencio`; `leito` para continuidade musical | o `holdMs` pedido ao dono do roteiro e o compromisso em `sound.md`, quando houver |
| Fazer ou revisar o som | Mapa | `leito`, `descricao`, `momentos`, `niveis`, `silencio`, `dose`: as da camada em que o mapa cresce | a hipótese atual de música, mixagem e efeitos em `sound.md` e nos campos `music` e `sfx`, ampliada conforme o som gerado funciona |
| | Sons | `escolha` | cada uso do mapa com um som no catálogo, ou dito como pendente |
| | Revisão | `critica-som` | relatório (defeitos, dúvidas de ouvido, sem defeito, sensores) e, quando o trabalho é o conjunto, o roteiro de escuta que leva ao aceite |

Em tarefas parciais (um efeito, um nível, uma costura), não injete todas as camadas do mapa. Leia a seção da unidade que responde à dúvida e suas dependências; na crítica, só a lente ou sensor pertinente.

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
