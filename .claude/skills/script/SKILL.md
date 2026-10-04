---
name: script
description: Escreve e valida o roteiro de um vídeo (src/videos/<vídeo>/script.json) a partir da pesquisa, cena por cena, com narração, planos, fontes e trilha, e leva o roteiro à primeira aprovação do usuário. Use sempre que o usuário pedir para escrever, revisar, encurtar ou alterar o roteiro, a narração, as cenas ou os planos de um vídeo, ou quando a pesquisa estiver pronta e for hora de transformá-la em vídeo.
---

# Roteiro de um vídeo

Segunda etapa, depois de `research`. O roteiro é o arquivo `src/videos/<vídeo>/script.json`, a fonte de tudo que vem depois: a narração é gerada a partir dele, cada cena ganha um componente, a duração do vídeo sai da fala e cada plano diz o que aparece na tela. Termina na **primeira aprovação do usuário**, que cobre o texto e os planos juntos.

## Formato

Siga `src/videos/demo/script.json`. O tipo e as regras estão em `src/narration/script.ts`.

```json
{
  "title": "Pergunta ou título do vídeo",
  "scenes": [
    {
      "id": "sun",
      "narration": "Exatamente o que é falado. Em uma a três frases.",
      "shots": [
        {
          "staging": "Quem faz o quê, e onde. O texto de tela, se houver.",
          "scale": "wide",
          "palette": "nome de uma paleta da ficha visual",
          "entry": "cut"
        },
        {
          "cue": "três",
          "staging": "O que muda na imagem quando a narração diz \"três\".",
          "scale": "close",
          "palette": "nome de uma paleta da ficha visual",
          "entry": "camera"
        }
      ],
      "sources": [1, 2]
    }
  ],
  "music": { "caption": "calm cinematic ambient, warm synth pads", "bpm": 90, "keyScale": "D minor" }
}
```

- `id`: inglês, minúsculas e hifens, único. Liga a cena ao componente que a desenha.
- `shots`: os planos da cena, na ordem da fala. Veja "Planos", abaixo.
- `sources`: números das fontes em `research.md` que sustentam o que a cena afirma.
- `music.caption`: em inglês, descrevendo gênero, instrumentos e clima. A trilha é sempre instrumental.

## Narração: escreva para o ouvido

A narração é lida literalmente por um modelo de voz, que tropeça em tudo que não é palavra. Por isso `narration` leva o texto como ele soa, e o validador recusa o resto:

- Números por extenso: "cento e cinquenta milhões", não "150 milhões". Escolha a leitura natural ("um milhão e meio").
- Unidades por extenso: "quilômetros por segundo", não "km/s".
- Sem símbolos nem parênteses. Sem siglas em maiúsculas: escreva como se pronuncia ("dê-ene-á") ou como palavra ("Nasa").
- Cada frase com até 280 caracteres e terminando em ponto, exclamação ou interrogação. O modelo gera uma frase por vez e perde qualidade em frases longas.

O número em algarismos, o símbolo e a sigla vão para a tela, descritos na encenação do plano. Assim o espectador ouve "trezentos mil quilômetros por segundo" e lê "300.000 km/s".

Além das regras do validador:

- Antes de qualquer frase, o desenho: a tensão do vídeo ("era de esperar X, e no entanto Y"), o molde, o bloco de fundamento que dá ao espectador a expectativa, os poucos elementos e o veredito de cada bloco, conforme `diretor-criativo/escrita/explicacao`. O usuário aprova a estrutura e uma amostra de um minuto antes do roteiro inteiro. Reescrever frases de um roteiro com o desenho errado não o conserta.
- Frases médias e encadeadas, em português do Brasil falado: a mediana fica perto de 15 palavras, e a frase de até 6 palavras (no máximo uma em sete) vira ou fecha uma ideia, nunca carrega um fato solto. Texto picotado em frases curtas soa como lista e, como o modelo de voz gera uma frase por vez com pausa entre elas, sai monótono e mal-humorado. As regras de frase estão em `diretor-criativo/escrita/narracao` e o perfil medido em `diretor-criativo/escrita/explicacao`.
- A temperatura da voz (contemplativa ou enérgica) é decisão do usuário na ficha de voz do `diretor-criativo`; a narração segue a ficha.
- O gancho segue `diretor-criativo/estrutura/gancho`: uma afirmação que quem assiste reconhece, o que há de estranho nela e a promessa do caminho. A pergunta, quando existe, fecha o gancho.
- A pontuação decide como a frase é falada; a tabela está na skill `narration`. Uma citação se escreve com dois-pontos entre quem falou e o que foi dito.
- A vírgula é uma pausa: o modelo de voz para em cada uma. Só ponha vírgula onde quem fala pararia. "E mesmo assim emagreciam", não "e, mesmo assim, emagreciam", que sai com duas pausas.
- A grafia decide a pronúncia. Se o usuário ouvir uma palavra dita errado, escreva em `narration` como ela deve soar e deixe a grafia correta em `script.md`. O modelo lê "mal-humorado" ligando o "l" à vogal ("malumorado"); "mau-humorado" sai certo. O Whisper não acusa esse tipo de erro, só o ouvido.
- Só afirme o que está em `research.md`. Se faltar um fato, volte à skill `research` em vez de completar de memória.
- Quando a ciência é incerta ou a frase é uma simplificação, diga isso na narração em vez de afirmar com certeza falsa.

## Cenas

Uma cena é um trecho da narração, de uma a três frases, que o áudio trata como um bloco: uma frase nunca se divide entre duas cenas. Uma cena pode pedir silêncio depois da fala com `holdMs` (até 8000): a imagem segue sem narração, só com a trilha. É assim que se faz a vinheta do título depois do gancho. A cena não é a unidade da imagem. Quem troca a imagem é o plano.

## Planos

Um plano é uma composição: o que fica na tela enquanto um trecho da cena é falado. Os planos vêm da skill `diretor-de-arte`. Com o texto escrito e antes da aprovação, rode as duas primeiras etapas dele:

1. **Conceito visual**: elenco e paletas, decididos com o usuário e gravados na ficha visual do vídeo, `src/videos/<vídeo>/art.md`.
2. **Decupagem**: a encenação de cada oração e a divisão de cada cena em planos.

Cada plano de `shots` leva o que a decupagem registra:

| Campo | O que é | Valores |
|---|---|---|
| `cue` | a deixa: palavra da narração da cena em que o plano começa | o primeiro plano da cena não leva; os outros, sempre |
| `occurrence` | qual ocorrência da palavra, quando ela se repete na cena | opcional; começa em 1 |
| `staging` | a encenação: quem faz o quê, e onde, mais o texto de tela | texto |
| `scale` | a escala | `wide` (aberto), `medium` (médio), `close`, `detail` (detalhe) |
| `palette` | a paleta do plano | um nome da ficha visual |
| `entry` | a entrada: como a imagem anterior vira esta | `cut` (corte), `camera` (câmera), `transform` (transformação), `wipe` (varredura) |

A imagem troca a cada oração, não a cada cena.

Mexer nos planos nunca regera áudio. Mexer numa frase, sim: se a encenação pedir outra frase, a hora de mudar é agora.

## Validar

```bash
pnpm check-script <vídeo>
```

Confere todas as regras, lista os problemas de uma vez e estima a duração de cada cena, de cada plano e do vídeo. No fim imprime o **perfil da narração** contra os vídeos de referência (tamanho de frase, frases curtas e longas, "você" ou "nós" e conectivos a cada 100 palavras). Medida FORA quer dizer que o texto relata em vez de explicar: volte à unidade `diretor-criativo/escrita/explicacao`, que manda rever o assunto e a cadeia de causas, e não trocar palavras. Não gere a voz com o perfil fora da faixa sem o usuário saber. O alvo do canal é de 6 a 10 minutos. Ele também aponta os planos com mais de 8 segundos: divida cada um, ou confirme que a encenação descreve uma imagem que muda dentro dele. Corrija até passar antes de mostrar ao usuário.

## Primeira aprovação

Mostre o roteiro em formato de leitura, não o JSON: para cada cena, a narração, os planos (deixa, encenação, escala, paleta e entrada) e as fontes, com o título e o link de cada uma, tirados de `research.md`. Informe a duração estimada, o tempo médio de cada plano e aponte qualquer simplificação ou ponto incerto.

Peça a aprovação explicitamente e só siga para `narration` depois dela. Mudar o roteiro depois custa caro: cada frase alterada regera áudio, e cada plano alterado refaz desenho.
