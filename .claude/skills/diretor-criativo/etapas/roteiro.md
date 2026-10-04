# Roteiro de um vídeo

Segunda etapa, depois de `pesquisa`. O roteiro é o arquivo `src/videos/<vídeo>/script.json`, a fonte de tudo que vem depois: a narração é gerada a partir dele, cada cena ganha um componente, a duração do vídeo sai da fala e cada plano diz o que aparece na tela. Termina na **primeira aprovação do usuário**, que cobre o texto e os planos juntos.

Ao lado dele fica `src/videos/<vídeo>/script.md`, o registro da direção criativa: as decisões que o usuário aprovou (tese, voz, estrutura em blocos com as cenas de cada um, ficha do fio), sem narração. Ele nasce com o ângulo aprovado e é atualizado a cada decisão, conforme `escrita/formato`.

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

- Antes de qualquer frase vêm o desenho (`escrita/explicacao`) e a ficha do fio (`escrita/fio`), na ordem de injeção do `SKILL.md`. O usuário aprova a estrutura, a ficha do fio e uma amostra de um minuto antes do roteiro inteiro.
- As frases médias e encadeadas de `escrita/narracao` pesam em dobro aqui: o modelo de voz gera uma frase por vez, com pausa entre elas, e texto picotado em frases curtas sai monótono e mal-humorado.
- A pontuação decide como a frase é falada; a tabela está na etapa `narracao` da skill `producao`. Uma citação se escreve com dois-pontos entre quem falou e o que foi dito.
- A vírgula é uma pausa: o modelo de voz para em cada uma. Só ponha vírgula onde quem fala pararia. "E mesmo assim emagreciam", não "e, mesmo assim, emagreciam", que sai com duas pausas.
- A grafia decide a pronúncia. Se o usuário ouvir uma palavra dita errado, escreva em `narration` como ela deve soar e deixe a grafia correta em `script.md`, na seção de grafias de pronúncia. O modelo lê "mal-humorado" ligando o "l" à vogal ("malumorado"); "mau-humorado" sai certo. O Whisper não acusa esse tipo de erro, só o ouvido.
- Só afirme o que está em `research.md`. Se faltar um fato, volte à etapa `pesquisa` em vez de completar de memória.

## Cenas

Uma cena é um trecho da narração, de uma a três frases, que o áudio trata como um bloco: uma frase nunca se divide entre duas cenas. Uma cena pode pedir silêncio depois da fala com `holdMs` (até 8000): a imagem segue sem narração, só com a trilha. É assim que se faz a vinheta do título depois do gancho. A cena não é a unidade da imagem. Quem troca a imagem é o plano.

## Planos

Um plano é uma composição: o que fica na tela enquanto um trecho da cena é falado. Os planos vêm da skill `diretor-de-arte`: com o texto escrito e antes da aprovação, acione-a na etapa de decupagem (`etapas/decupagem.md`, na pasta dela), que decide elenco e paletas com o usuário, grava a ficha visual em `art.md` e devolve os planos de cada cena. Os campos de `shots` e os valores que o validador aceita estão lá, no passo 2.

A imagem troca a cada oração, não a cada cena.

Mexer nos planos nunca regera áudio. Mexer numa frase, sim: se a encenação pedir outra frase, a hora de mudar é agora.

## Validar

```bash
pnpm check-script <vídeo>
```

Confere todas as regras, lista os problemas de uma vez e estima a duração de cada cena, de cada plano e do vídeo. No fim imprime o **perfil da narração** contra os vídeos de referência (tamanho de frase, frases curtas e longas, "você" ou "nós" e conectivos a cada 100 palavras). Medida FORA quer dizer que o texto relata em vez de explicar: volte à unidade `escrita/explicacao`, que manda rever o assunto e a cadeia de causas, e não trocar palavras. Não gere a voz com o perfil fora da faixa sem o usuário saber. O alvo do canal é de 6 a 10 minutos. Ele também aponta os planos longos, tratados na decupagem conforme a unidade `planos` da skill `diretor-de-arte`. Por fim confere `script.md` contra o roteiro e falha se alguma cena estiver fora da tabela de estrutura, em dois blocos ou fora de ordem; sem `script.md`, só avisa. Corrija até passar antes de mostrar ao usuário.

## Checagem e crítica independentes

Com o validador passando, o roteiro vai a dois subagentes que não viram o texto ser escrito. Acione os dois na mesma mensagem, passando o nome da pasta do vídeo:

- `checador`: classifica cada afirmação da fala e da tela contra `research.md` (unidade `pesquisa/checagem`).
- `editor`: faz as passadas de `revisao/critica` e devolve os problemas por cena. Ele confere contra `script.md`: antes de acioná-lo, a coluna Cenas da estrutura está preenchida. Passe a ele só a decisão aprovada que ainda não estiver lá.

Eles julgam; quem decide e reescreve é você, pelos passos 2 a 5 do procedimento de `revisao/critica`. A lista **Para o diretor de arte** que o `editor` devolve vai à skill `diretor-de-arte` (etapa de decupagem), que refaz os planos apontados antes da aprovação. A cada rodada, rode o validador e acione de novo os dois, o `checador` só com as cenas alteradas; além do que a crítica exige, não pode restar afirmação *não verificada*.

## Primeira aprovação

Junto com o roteiro, entregue o total do `checador`, as simplificações que ele apontou e os problemas do `editor` que ficaram em aberto.

Mostre o roteiro em formato de leitura, não o JSON: para cada cena, a narração, os planos (deixa, encenação, escala, paleta e entrada) e as fontes, com o título e o link de cada uma, tirados de `research.md`. Informe a duração estimada, o tempo médio de cada plano e aponte qualquer simplificação ou ponto incerto.

Peça a aprovação explicitamente e só siga para a narração (skill `producao`) depois dela. Com o "sim" do usuário, registre a 1ª aprovação em `src/videos/<vídeo>/approvals.md` (o formato está nas convenções do `README.md`). Mudar o roteiro depois custa caro: cada frase alterada regera áudio, e cada plano alterado refaz desenho; se mudar, registre a reabertura no mesmo arquivo.
