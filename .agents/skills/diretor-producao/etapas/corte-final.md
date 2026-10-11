# Montagem do arquivo final

Monta e confere o **arquivo final atual**: o que sai daqui é `out/<vídeo>/<vídeo>.final.mp4`, o arquivo que vai para o YouTube, feito dos artefatos como estão agora. O destino vem do briefing (`diretor-de-pauta/briefing.md`); sem briefing, é o YouTube. Quando o destino inclui um evento, o arquivo dele sai deste mesmo, em "Destino jam", abaixo. Não pergunta por onde o vídeo passou: pergunta se o que vai ser montado existe e corresponde ao roteiro atual.

## 1. O que a montagem precisa

Confira antes do render pesado: descobrir um artefato faltando depois de meia hora de render é meia hora perdida.

- **Requisitos do destino**: com briefing, a duração estimada cabe no limite que ele dá, e a especificação do arquivo é uma que a montagem atende (`plano.md`, "O que não se negocia"). O que não cabe é dito agora, com o dono, e não depois do render.
- **Roteiro**: `pnpm check-script <vídeo>` passa.
- **Narração**: rode `pnpm narrate <vídeo>`. Com tudo em cache ele só repete o resumo, e isso mostra que a narração é a do roteiro atual; frase alterada é gerada ali. Cada frase que o resumo acusa (difere do roteiro, fim cortado) precisa ter sido ouvida pelo usuário, como em `narracao.md`.
- **Cenas**: as de `out/<vídeo>/cenas/` existem e têm a duração atual. O `pnpm join` acusa a que falta e a que ficou com a duração antiga: renderize essas com `pnpm scene`.
- **Som**: o que o roteiro pede existe? Com `music` no roteiro, `public/videos/<vídeo>/music.json` e os arquivos da trilha, gerados sobre a duração atual da narração (`trilha.md`); sem eles o vídeo renderiza sem música. Os efeitos de `sfx` já estão cobertos pelo `check-script`, que recusa o uso fora do catálogo.
- **Fatos**: acione o subagente `checador` com o nome da pasta do vídeo. Ele confere cada afirmação da fala e da tela contra `research.md`. Nenhuma pode voltar *não verificada*: a que voltar é do texto, cujo dono é a skill `diretor-criativo`. No curta de ficção sem afirmação sobre o mundo real, não há `research.md` e o `checador` não é acionado (`diretor-criativo/estrutura/narrativa.md`).
- **Código**: se o código mudou desde a última validação, rode `pnpm lint` e `pnpm test` (`AGENTS.md`).
- **Erro técnico conhecido**: nada que já se sabe quebrado (um render que falha, uma cena sem componente) segue para a montagem.

Pronto quando: cada artefato existe e corresponde ao estado atual. O que falta é dito com o dono dele (a frase, a cena, a trilha), e a montagem espera por esse artefato, e não por um aceite.

## 2. Render

`pnpm join <vídeo>` monta `out/<vídeo>/<vídeo>.mp4` com as cenas já renderizadas (`pnpm scene`) e o som (`pnpm sound`), em segundos, e acusa a cena que falta ou que ficou com a duração antiga. Sem as cenas, `pnpm render <vídeo> out/<vídeo>/<vídeo>.mp4` renderiza o vídeo inteiro de uma vez. O tempo do render depende da máquina: a taxa do primeiro render, em quadros por segundo, estima o restante (ela muda com a máquina, e não se leva a taxa de uma para outra).

## 3. Volume

O alvo interno de exportação é -14 LUFS, com pico verdadeiro de até -1 dBTP. O player oferece [Volume estável](https://support.google.com/youtube/answer/14106294?hl=en), que atua na reprodução. Normalize:

```bash
ffmpeg -i out/<vídeo>/<vídeo>.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 256k out/<vídeo>/<vídeo>.final.mp4
```

Meça o resultado:

```bash
ffmpeg -hide_banner -nostats -i out/<vídeo>/<vídeo>.final.mp4 -vn -af loudnorm=print_format=summary -f null -
```

Pronto quando: `Input Integrated` está entre -15 e -13 LUFS e `Input True Peak` em até -1 dBTP. A normalização em um passo pode ficar um pouco abaixo do alvo, principalmente em vídeos curtos; se ficar, repita o primeiro comando com `I` ajustado pela diferença (resultado de -15,5 pede `I=-12.5`).

## 4. Verificações no arquivo final

```powershell
# Telas pretas de meio segundo ou mais, e silêncios de dois segundos ou mais.
ffmpeg -hide_banner -nostats -i out/<vídeo>/<vídeo>.final.mp4 -vf blackdetect=d=0.5 -af silencedetect=noise=-50dB:d=2 -f null - 2>&1 | Select-String -Pattern "black_start|silence_start"

# Folha de contato: um quadro a cada 10 segundos.
ffmpeg -y -i out/<vídeo>/<vídeo>.final.mp4 -vf "fps=1/10,scale=480:-1,tile=6x10" -frames:v 1 out/<vídeo>/<vídeo>.sheet.png

# As medidas de imagem e movimento do arquivo final, contra a referência.
pnpm critique out/<vídeo>/<vídeo>.final.mp4
```

Cada instrumento tem só a autoridade que tem:

- **Tela preta e silêncio.** A saída vazia diz que não há nenhum dos dois. Uma linha é conferida contra o estado: o silêncio que o roteiro pede de propósito (um `holdMs`, um silêncio de `music`) não é defeito; o que ninguém pediu é erro técnico, e é consertado.
- **Folha de contato.** Abra e percorra o vídeo inteiro com os olhos: alguma cena vazia, repetida, com texto cortado ou fora do estilo? Ela pega defeito grosseiro, e não julga movimento nem ritmo.
- **Duração.** A do arquivo bate com a soma das cenas da narração. É contrato técnico: se não bate, a montagem está errada.
- **Volume.** A faixa do passo 3 é o alvo interno de exportação; o player oferece Volume estável para ajustar a reprodução.
- **Medidas do `pnpm critique`.** São sensores: investigue no trecho o outlier relevante, pelo mapa segundo a segundo e por uma tira de quadros (a leitura é a de `revisao/critica-movimento`, da skill `diretor-de-arte`). Sem defeito perceptível ou técnico demonstrado, a medida fora da faixa não bloqueia o arquivo final: vai dita na entrega, em uma linha. O defeito que a investigação demonstra é do dono do artefato.

Pronto quando: não há tela preta nem silêncio sem explicação no estado, a folha foi percorrida inteira, a duração bate e cada outlier relevante foi investigado até virar defeito, com dono, ou "sem defeito".

## Destino jam

Só quando o destino do briefing inclui o evento (`jam` ou `jam e youtube`). As especificações são as que o briefing transcreve em "Regras do evento"; nenhuma é suposta, nem tirada de outro evento.

- **O evento não deu especificação de arquivo**: o arquivo enviado é o próprio `.final.mp4`. Diga ao usuário e ao `diretor-publicacao` que a especificação não foi fornecida, para ele conferir no envio.
- **O evento pede o que o `ffmpeg` converte sem mudar a imagem** (contêiner, codec, taxa de bits, volume, resolução menor na mesma proporção, tamanho máximo do arquivo): gere `out/<vídeo>/<vídeo>.jam.mp4` a partir do `.final.mp4` ou, se o volume pedido é outro, de `out/<vídeo>/<vídeo>.mp4`, e meça o resultado contra cada item pedido.
- **O evento pede outra proporção ou outra taxa de quadros**: a montagem não resolve. É mudança de `src/format.ts` e das composições, dita ao usuário no plano, antes das cenas.
- **Duração**: a do arquivo cabe no limite do evento. Passar dele é bloqueante, e o corte é do `diretor-criativo`.
- **Crédito em tela**, quando o evento o exige: o texto é do `diretor-publicacao`, o quadro é do `diretor-de-arte`, e o tempo é do roteiro (o `holdMs` da última cena, de até 8 s).

Com os dois destinos, o `.final.mp4` segue para o YouTube e o `.jam.mp4`, quando existe, para o evento: é o mesmo filme, e nenhum dos dois ganha corte próprio sem decisão do usuário.

Pronto quando: cada item que o evento especificou foi medido no arquivo que vai ser enviado, e o que não foi especificado está dito como tal.

## 5. Entrega

Entregue ao usuário, para ele avaliar o conjunto:

- o caminho de `out/<vídeo>/<vídeo>.final.mp4`, com duração e volume medidos;
- o que foi verificado, que só pega defeito grosseiro, e o que só ele julga: ritmo, voz e música;
- as medidas fora da referência que foram investigadas, e o que se viu no trecho;
- o pacote de cada destino, se está pronto (`src/videos/<vídeo>/publication.md`), produzido pelo `diretor-publicacao`; com evento no destino, o arquivo que vai para ele e o que foi medido contra as especificações fornecidas.

Junto da entrega, faça três perguntas curtas ao usuário, ou ao primeiro ouvinte que ele trouxer, para responder depois de assistir uma vez, sem rever:

1. A abertura prende?
2. Qual ideia principal você consegue repetir depois de assistir?
3. O final fica na memória?

A resposta é comparada com `script.md`: a ideia repetida, com a tese, ou com a frase de intenção no curta; o fim lembrado, com a linha "Fechamento". O retorno vai ao dono pela causa, e não pela pergunta:

- **Roteiro ou gancho** (a abertura não cria razão para ficar, a ideia repetida não é a tese, o fim não diz nada que fique): skill `diretor-criativo`.
- **Execução ou mixagem** (o texto diz e não se ouve ou não se vê): a música cobre a frase ou, só no modo `canal` (o curta do modo `jam` não tem chamada de canon, salvo um pedido final explícito), o silêncio antes da chamada não deixa o fim assentar, ou a chamada o atropela, é da `diretor-de-som`; a voz, o render e o volume, daqui.
- Na dúvida entre as duas causas, leia a frase em `script.json`: se a ideia está clara no texto, o defeito é de execução.

É diagnóstico: a escuta de uma pessoa, que mostra onde olhar. Não pede analytics, não é amostra estatística e não prova retenção; também não é etapa nem aprovação, e o arquivo final não espera por ela. Sem resposta, a entrega vale igual.

O que ele apontar vai ao dono do artefato, e só ele é refeito: a frase é da skill `diretor-criativo`; a imagem e o movimento, da `diretor-de-arte`; a música, o nível e o efeito, da `diretor-de-som`; a voz, o render e o volume, daqui. Depois do conserto, remonte e repita só as verificações que a mudança toca. A avaliação dele não é registrada em arquivo nenhum: o que ele decidir de material mora no arquivo do dono.

Lembre-o da restrição não comercial da voz que a nota local do projeto (`README.md`) registra (CC-BY-NC): é aviso, não licença conferida. Antes de monetizar, confira a licença oficial na fonte vigente, com a aplicação aos pesos e à saída; a decisão sobre a voz foi tomada antes da primeira geração (`narracao.md`), caso pretenda monetizar ou enviar a um evento com regra de licença. A checklist atual do YouTube para divulgação de conteúdo de IA fica com o `diretor-publicacao`.
