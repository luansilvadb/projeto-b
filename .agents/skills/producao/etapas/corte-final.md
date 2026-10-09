# Montagem do arquivo final

Monta e confere o **arquivo final atual**: o que sai daqui é `out/<vídeo>/<vídeo>.final.mp4`, o arquivo que vai para o YouTube, feito dos artefatos como estão agora. Não pergunta por onde o vídeo passou: pergunta se o que vai ser montado existe e corresponde ao roteiro atual.

## 1. O que a montagem precisa

Confira antes do render pesado: descobrir um artefato faltando depois de meia hora de render é meia hora perdida.

- **Roteiro**: `pnpm check-script <vídeo>` passa.
- **Narração**: rode `pnpm narrate <vídeo>`. Com tudo em cache ele só repete o resumo, e isso mostra que a narração é a do roteiro atual; frase alterada é gerada ali. Cada frase que o resumo acusa (difere do roteiro, fim cortado) precisa ter sido ouvida pelo usuário, como em `narracao.md`.
- **Cenas**: as de `out/<vídeo>/cenas/` existem e têm a duração atual. O `pnpm join` acusa a que falta e a que ficou com a duração antiga: renderize essas com `pnpm scene`.
- **Som**: o que o roteiro pede existe? Com `music` no roteiro, `public/videos/<vídeo>/music.json` e os arquivos da trilha, gerados sobre a duração atual da narração (`trilha.md`); sem eles o vídeo renderiza sem música. Os efeitos de `sfx` já estão cobertos pelo `check-script`, que recusa o uso fora do catálogo.
- **Fatos**: acione o subagente `checador` com o nome da pasta do vídeo. Ele confere cada afirmação da fala e da tela contra `research.md`. Nenhuma pode voltar *não verificada*: a que voltar é do texto, cujo dono é a skill `diretor-criativo`.
- **Código**: `pnpm lint` e `pnpm test` passam, quando o código mudou desde a última vez em que passaram.
- **Erro técnico conhecido**: nada que já se sabe quebrado (um render que falha, uma cena sem componente) segue para a montagem.

Pronto quando: cada artefato existe e corresponde ao estado atual. O que falta é dito com o dono dele (a frase, a cena, a trilha), e a montagem espera por esse artefato, e não por um aceite.

## 2. Render

`pnpm join <vídeo>` monta `out/<vídeo>/<vídeo>.mp4` com as cenas já renderizadas (`pnpm scene`) e o som (`pnpm sound`), em segundos, e acusa a cena que falta ou que ficou com a duração antiga. Sem as cenas, `pnpm render <vídeo> out/<vídeo>/<vídeo>.mp4` renderiza o vídeo inteiro de uma vez. No PC em que o projeto foi montado (Ryzen 9 5900X) o render faz cerca de 10 quadros por segundo: um vídeo de 10 minutos leva por volta de meia hora.

## 3. Volume

A mixagem do projeto mantém a relação entre voz e trilha, mas o arquivo sai mais baixo que o padrão do YouTube (-14 LUFS). O YouTube abaixa vídeos altos e não levanta os baixos, então um vídeo baixo soa fraco ao lado dos outros. Normalize:

```bash
ffmpeg -i out/<vídeo>/<vídeo>.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 256k out/<vídeo>/<vídeo>.final.mp4
```

Meça o resultado:

```bash
ffmpeg -hide_banner -nostats -i out/<vídeo>/<vídeo>.final.mp4 -vn -af loudnorm=print_format=summary -f null -
```

Pronto quando: `Input Integrated` está entre -15 e -13 LUFS e `Input True Peak` em até -1 dBTP. A normalização em um passo pode ficar um pouco abaixo do alvo, principalmente em vídeos curtos; se ficar, repita o primeiro comando com `I` ajustado pela diferença (resultado de -15,5 pede `I=-12.5`).

## 4. Verificações no arquivo final

```bash
# Telas pretas de meio segundo ou mais, e silêncios de dois segundos ou mais.
ffmpeg -hide_banner -nostats -i out/<vídeo>/<vídeo>.final.mp4 -vf blackdetect=d=0.5 -af silencedetect=noise=-50dB:d=2 -f null - 2>&1 | grep -E "black_start|silence_start"

# Folha de contato: um quadro a cada 10 segundos.
ffmpeg -y -i out/<vídeo>/<vídeo>.final.mp4 -vf "fps=1/10,scale=480:-1,tile=6x10" -frames:v 1 out/<vídeo>/<vídeo>.sheet.png

# As medidas de imagem e movimento do arquivo final, contra a referência.
pnpm critique out/<vídeo>/<vídeo>.final.mp4
```

Cada instrumento tem só a autoridade que tem:

- **Tela preta e silêncio.** A saída vazia diz que não há nenhum dos dois. Uma linha é conferida contra o estado: o silêncio que o roteiro pede de propósito (um `holdMs`, um silêncio de `music`) não é defeito; o que ninguém pediu é erro técnico, e é consertado.
- **Folha de contato.** Abra e percorra o vídeo inteiro com os olhos: alguma cena vazia, repetida, com texto cortado ou fora do estilo? Ela pega defeito grosseiro, e não julga movimento nem ritmo.
- **Duração.** A do arquivo bate com a soma das cenas da narração. É contrato técnico: se não bate, a montagem está errada.
- **Volume.** A faixa do passo 3 é alvo técnico da plataforma.
- **Medidas do `pnpm critique`.** São sensores: investigue no trecho o outlier relevante, pelo mapa segundo a segundo e por uma tira de quadros (a leitura é a de `revisao/critica-movimento`, da skill `diretor-de-arte`). Sem defeito perceptível ou técnico demonstrado, a medida fora da faixa não bloqueia o arquivo final: vai dita na entrega, em uma linha. O defeito que a investigação demonstra é do dono do artefato.

Pronto quando: não há tela preta nem silêncio sem explicação no estado, a folha foi percorrida inteira, a duração bate e cada outlier relevante foi investigado até virar defeito, com dono, ou "sem defeito".

## 5. Entrega

Entregue ao usuário, para ele avaliar o conjunto:

- o caminho de `out/<vídeo>/<vídeo>.final.mp4`, com duração e volume medidos;
- o que foi verificado, que só pega defeito grosseiro, e o que só ele julga: ritmo, voz e música;
- as medidas fora da referência que foram investigadas, e o que se viu no trecho;
- o pacote de publicação com fontes, se está pronto (`src/videos/<vídeo>/publication.md`), produzido pelo `diretor-publicacao`.

O que ele apontar vai ao dono do artefato, e só ele é refeito: a frase é da skill `diretor-criativo`; a imagem e o movimento, da `diretor-de-arte`; a música, o nível e o efeito, da `diretor-de-som`; a voz, o render e o volume, daqui. Depois do conserto, remonte e repita só as verificações que a mudança toca. A avaliação dele não é registrada em arquivo nenhum: o que ele decidir de material mora no arquivo do dono.

Lembre-o da licença não comercial da voz, decidida antes da primeira geração (`narracao.md`), caso pretenda monetizar. A checklist atual do YouTube para divulgação de conteúdo de IA fica com o `diretor-publicacao`.
