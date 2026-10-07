# Roteiro de um vídeo

Segunda etapa, depois de `pesquisa`. O roteiro é o arquivo `src/videos/<vídeo>/script.json`, a fonte de tudo que vem depois: a narração é gerada a partir dele, cada cena ganha um componente, a duração do vídeo sai da fala e cada plano diz o que aparece na tela. Termina na **primeira aprovação do usuário**, que cobre o texto e os planos juntos.

Ao lado dele fica `src/videos/<vídeo>/script.md`, o registro das decisões atuais do vídeo (`escrita/formato`).

## Formato

Siga `src/videos/why-we-sleep/script.json`. O tipo e as regras estão em `src/narration/script.ts`.

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
  ]
}
```

- `id`: inglês, minúsculas e hifens, único. Liga a cena ao componente que a desenha.
- `shots`: os planos da cena, na ordem da fala. Veja "Planos", abaixo.
- `sources`: números das fontes em `research.md` que sustentam o que a cena afirma.
- `music` e `sfx`, a trilha e os efeitos, são escritos depois, pela skill `diretor-de-som`. Com o texto pronto e antes da aprovação, acione-a para o arco de som (`diretor-de-som/etapas/arco-de-som.md`): é dele que saem os `holdMs` que o som pede.

## Narração: escreva para o ouvido

A narração é lida literalmente por um modelo de voz, que tropeça em tudo que não é palavra. Por isso `narration` leva o texto como ele soa, e o validador recusa o resto:

- Números por extenso: "cento e cinquenta milhões", não "150 milhões". Escolha a leitura natural ("um milhão e meio").
- Unidades por extenso: "quilômetros por segundo", não "km/s".
- Sem símbolos nem parênteses. Sem siglas em maiúsculas: escreva como se pronuncia ("dê-ene-á") ou como palavra ("Nasa").
- Cada frase com até 280 caracteres e terminando em ponto, exclamação ou interrogação. O modelo gera uma frase por vez e perde qualidade em frases longas.

O número em algarismos, o símbolo e a sigla vão para a tela, descritos na encenação do plano. Assim o espectador ouve "trezentos mil quilômetros por segundo" e lê "300.000 km/s".

Além das regras do validador:

- O desenho (`escrita/explicacao`) e o fio (`escrita/fio`) vêm antes do roteiro inteiro. Um trecho curto pode ser escrito antes deles, para testá-los, e o que ele mostrar volta a eles. Antes do roteiro inteiro, uma amostra curta prova a maneira de contar e é mostrada ao usuário, com as decisões que ela pôs em jogo (`conducao/entrevista`); a estrutura e o fio seguem acompanhando o que o texto mostrar.
- O modelo de voz gera uma frase por vez, com pausa entre elas, e o raciocínio picotado em frases curtas sai monótono e mal-humorado: o encadeamento de `escrita/narracao` pesa em dobro aqui.
- A pontuação decide como a frase é falada; a tabela está na etapa `narracao` da skill `producao`.
- A vírgula é uma pausa: o modelo de voz para em cada uma. Só ponha vírgula onde quem fala pararia. "E mesmo assim emagreciam", não "e, mesmo assim, emagreciam", que sai com duas pausas.
- A grafia decide a pronúncia. Se o usuário ouvir uma palavra dita errado, escreva em `narration` como ela deve soar e deixe a grafia correta em `script.md`, na seção de grafias de pronúncia. O modelo lê "mal-humorado" ligando o "l" à vogal ("malumorado"); "mau-humorado" sai certo. O Whisper não acusa esse tipo de erro, só o ouvido.
- Só afirme o que está em `research.md`. Se faltar um fato, volte à etapa `pesquisa` em vez de completar de memória.

## Cenas

Uma cena é um trecho da narração, de uma a três frases, que o áudio trata como um bloco: uma frase nunca se divide entre duas cenas. Uma cena pode pedir silêncio depois da fala com `holdMs` (até 8000): a imagem segue sem narração, só com a trilha. É assim que se faz a vinheta do título depois do gancho. A cena não é a unidade da imagem. Quem troca a imagem é o plano.

## Planos

Um plano é uma composição: o que fica na tela enquanto um trecho da cena é falado. Os planos vêm da skill `diretor-de-arte`: com o texto escrito e antes da aprovação, acione-a na etapa de decupagem (`etapas/decupagem.md`, na pasta dela). Ela descobre a direção visual que basta para o animatic começar, leva ao usuário só o que a `entrevista-imagem` dela define como decisão, grava a ficha visual em `art.md` e devolve os planos de cada cena, os compromissos visuais assumidos, as frases que a imagem pediu para mudar e as hipóteses que o animatic vai testar. Os campos de `shots` e o que o validador aceita em cada um estão lá, no passo 2: `entry` é texto, e `cut` e `camera`, no exemplo acima, são o costume.

## Validar

```bash
pnpm check-script <vídeo>
```

O comando dá dois tipos de resposta, com autoridades diferentes.

**Erro**, o que ele recusa: as regras do formato e da narração (`src/narration/script.ts`), listadas de uma vez, e `script.md` contra o roteiro, quando alguma cena está fora da tabela de estrutura, em dois blocos ou fora de ordem (sem `script.md`, só avisa). Corrija até passar antes de mostrar ao usuário.

**Sinal**, o que ele só imprime: a duração estimada de cada cena, de cada plano e do vídeo (o alvo do canal é de 6 a 10 minutos), os planos longos, tratados na decupagem conforme a unidade `planos` da skill `diretor-de-arte`, e o **perfil da narração** contra os vídeos de referência. Medida FORA diz onde olhar e não reprova o texto: leia e ouça o trecho. O defeito que a leitura confirma é corrigido pela unidade dona (`escrita/explicacao` se é a relação, `escrita/fio` se é a continuidade, `escrita/narracao` se é a frase); sem defeito, o texto segue, e a medida vai no relato da primeira aprovação, para o usuário saber dela antes de a voz ser gerada.

## Checagem e crítica independentes

Com o validador passando, o roteiro vai a dois subagentes que não viram o texto ser escrito. Acione os dois na mesma mensagem, passando o nome da pasta do vídeo:

- `checador`: classifica cada afirmação da fala e da tela contra `research.md` (unidade `pesquisa/checagem`).
- `editor`: lê o texto como quem ouve uma vez e devolve o que o ouvinte perde, por cena, ou diz que não há defeito (`revisao/critica`). Ele lê `script.md` para saber o que o vídeo quer dizer: antes de acioná-lo, `script.md` está em dia com as decisões atuais, e a coluna Cenas da estrutura, preenchida. Ele também julga um trecho (o gancho, um bloco, a amostra): passe as cenas.

Eles julgam; quem decide e reescreve é você. Diante de cada defeito do `editor`, a pergunta é a de `conducao/entrevista`: o conserto preserva a decisão atual, ou pede uma nova? Se preserva, reescreva pela unidade dona, atacando a perda que o diagnóstico nomeia; se pede, leve ao usuário. A lista **Para o diretor de arte** vai à skill `diretor-de-arte` (etapa de decupagem), que refaz os planos apontados antes da aprovação. A cada rodada, rode o validador e acione de novo os dois, só com as cenas alteradas e as que dependem delas. O bloqueante é resolvido, o relevante é corrigido enquanto o retorno paga (critérios de parada do `SKILL.md`), e não pode restar afirmação *não verificada*.

## Primeira aprovação

Junto com o roteiro, entregue o total do `checador`, as simplificações que ele apontou e os problemas do `editor` que ficaram em aberto.

Mostre o roteiro em formato de leitura, não o JSON: para cada cena, a narração, os planos (deixa, encenação, escala, paleta e entrada) e as fontes, com o título e o link de cada uma, tirados de `research.md`. Informe a duração estimada, o tempo médio de cada plano e aponte qualquer simplificação ou ponto incerto.

Peça a aprovação explicitamente e só siga para a narração (skill `producao`) depois dela. Com o "sim" do usuário, registre a 1ª aprovação em `src/videos/<vídeo>/approvals.md` (o formato está nas convenções do `README.md`). A aprovação fixa o que o vídeo diz, não a frase (`conducao/entrevista`): a reescrita que preserva a decisão segue sem nova aprovação, passa de novo pelo `checador` e é relatada ao usuário. Depois da narração ela custa: cada frase alterada regera áudio, e cada plano alterado refaz desenho. A mudança de decisão volta ao usuário e é registrada como reabertura no mesmo arquivo.
