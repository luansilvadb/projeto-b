---
name: script
description: Escreve e valida o roteiro de um vídeo (src/videos/<vídeo>/script.json) a partir da pesquisa, cena por cena, com narração, descrição visual, fontes e trilha, e leva o roteiro à primeira aprovação do usuário. Use sempre que o usuário pedir para escrever, revisar, encurtar ou alterar o roteiro, a narração ou as cenas de um vídeo, ou quando a pesquisa estiver pronta e for hora de transformá-la em vídeo.
---

# Roteiro de um vídeo

Segunda etapa, depois de `research`. O roteiro é o arquivo `src/videos/<vídeo>/script.json`, a fonte de tudo que vem depois: a narração é gerada a partir dele, cada cena ganha um componente e a duração do vídeo sai da fala. Termina na **primeira aprovação do usuário**.

## Formato

Siga `src/videos/demo/script.json`. O tipo e as regras estão em `src/narration/script.ts`.

```json
{
  "title": "Pergunta ou título do vídeo",
  "scenes": [
    {
      "id": "sun",
      "narration": "Exatamente o que é falado.",
      "visual": "O que aparece, e em que palavra da narração cada elemento entra.",
      "sources": [1, 2]
    }
  ],
  "music": { "caption": "calm cinematic ambient, warm synth pads", "bpm": 90, "keyScale": "D minor" }
}
```

- `id`: inglês, minúsculas e hifens, único. Liga a cena ao componente que a desenha.
- `sources`: números das fontes em `research.md` que sustentam o que a cena afirma.
- `music.caption`: em inglês, descrevendo gênero, instrumentos e clima. A trilha é sempre instrumental.

## Narração: escreva para o ouvido

A narração é lida literalmente por um modelo de voz, que tropeça em tudo que não é palavra. Por isso `narration` leva o texto como ele soa, e o validador recusa o resto:

- Números por extenso: "cento e cinquenta milhões", não "150 milhões". Escolha a leitura natural ("um milhão e meio").
- Unidades por extenso: "quilômetros por segundo", não "km/s".
- Sem símbolos nem parênteses. Sem siglas em maiúsculas: escreva como se pronuncia ("dê-ene-á") ou como palavra ("Nasa").
- Cada frase com até 280 caracteres e terminando em ponto, exclamação ou interrogação. O modelo gera uma frase por vez e perde qualidade em frases longas.

O número em algarismos, o símbolo e a sigla vão para a tela, descritos em `visual`. Assim o espectador ouve "trezentos mil quilômetros por segundo" e lê "300.000 km/s".

Além das regras do validador:

- Uma ideia por frase, frases curtas, português do Brasil falado. Fale com o espectador ("você").
- Abra com uma pergunta ou um fato que crie curiosidade nos primeiros segundos.
- Só afirme o que está em `research.md`. Se faltar um fato, volte à skill `research` em vez de completar de memória.
- Quando a ciência é incerta ou a frase é uma simplificação, diga isso na narração em vez de afirmar com certeza falsa.

## Cenas

Uma cena é uma ideia visual: de uma a três frases. Cena longa demais vira imagem parada; cena curta demais não dá tempo de ler a tela.

Em `visual`, descreva o que aparece e amarre cada entrada a uma palavra da narração ("o número surge quando a narração diz 'oito'"). A animação usa essas palavras como deixas, então escolha palavras que aparecem uma vez só na cena.

Prefira o que código desenha bem: formas geométricas, diagramas, trajetórias, escalas, contagens, muitos elementos repetidos. Ilustração orgânica detalhada é o ponto fraco do canal hoje.

## Validar

```bash
pnpm check-script <vídeo>
```

Confere todas as regras, lista os problemas de uma vez e estima a duração de cada cena e do vídeo. O alvo do canal é de 6 a 10 minutos. Corrija até passar antes de mostrar ao usuário.

## Primeira aprovação

Mostre o roteiro em formato de leitura, não o JSON: para cada cena, a narração, o que aparece na tela e as fontes (com o título e o link de cada uma, tirados de `research.md`). Informe a duração estimada e aponte qualquer simplificação ou ponto incerto.

Peça a aprovação explicitamente e só siga para `narration` depois dela. Mudar o roteiro depois custa caro: cada frase alterada regera áudio, e cena alterada refaz animação.
