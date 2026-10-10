# Roteiro de um vídeo

O roteiro é o arquivo `src/videos/<vídeo>/script.json`, a fonte de tudo que se apoia nele: a narração é gerada a partir dele, cada cena ganha um componente, a duração do vídeo sai da fala e cada plano diz o que aparece na tela. Ao lado dele fica `src/videos/<vídeo>/script.md`, o registro das decisões atuais do vídeo (`escrita/formato`).

Um trabalho de roteiro termina quando a dúvida pedida está resolvida: um trecho reescrito e conferido, um gancho que funciona, o texto completo que sustenta o custo da voz.

## Como o roteiro anda

O roteiro cresce de prova para produto, e não de formulário para aprovação: **produza a menor evidência que resolve a maior incerteza atual, expanda o que funcionou, e só uma dependência real obriga a ordem.** A pergunta que volta o tempo todo é qual incerteza ainda pode invalidar trabalho caro.

- **A prova começa onde a dúvida está.** Ela pode estar no ângulo, no gancho, no mecanismo da explicação, no fio, no tom, numa analogia, na estrutura, numa relação visual ou na embalagem, e a prova tem a forma dela: um gancho, o bloco do mecanismo, duas cenas, a analogia aplicada a um trecho, um título, um esquema curto de blocos, uma imagem. O recipiente não importa: a conversa, `out/rascunho/`, ou cenas de verdade em `script.json`, que ficam se funcionam e são substituídas se não. Não há arquivo de rascunho nem versão ao lado: o anterior é o git.
- **A prova serve primeiro a quem escreve.** Escreva, critique, compare, ajuste. Ela vai ao usuário quando revela uma decisão de `conducao/entrevista` (duas maneiras de contar que fariam vídeos diferentes), e não por ter ficado pronta: entre duas boas redações do mesmo mecanismo, escolha. A decisão tomada no caminho atualiza `script.md`, e é só lá que ela fica.
- **Não expanda uma hipótese enquanto uma evidência menor ainda pode mostrar que ela está errada.** Se a dúvida é se o mecanismo se entende, o mecanismo é escrito e julgado antes dos oito minutos em volta dele.
- **Não continue produzindo alternativas depois que a incerteza que as justificava acabou.** Com o compromisso claro, a voz do canal conhecida e o primeiro trecho funcionando, não há prova a fazer: siga escrevendo.
- **Expanda na vertical.** O trecho que já traz a narração, as fontes, o lugar na estrutura e a nota visual, quando há uma, ensina mais que o vídeo inteiro numa camada só, que depois se descobre que não se encena.
- **O artefato ensina, e voltar é o processo.** `escrita/explicacao`, `escrita/fio` e `estrutura/arco` acompanham a escrita, e nenhum precisa estar fechado antes da primeira frase: o arco começa com poucos blocos e o texto mostra a fusão, a divisão e a base que faltava. Um gancho pode mostrar que a promessa é larga demais; a decupagem, que a frase não se encena; a embalagem, que a promessa é difusa.
- **Volte no tamanho do problema**, à unidade dona dele. O fato que falta é pesquisado, registrado em `research.md` e conferido, sem reabrir uma fase de pesquisa. O plano que não encena a frase corrige o trecho.
- **Outra skill entra por dúvida ou por dependência**: quando responde algo que esta não deve resolver, ou quando o próximo artefato depende concretamente da saída dela.
- **Critique onde a cegueira custa, não onde o calendário manda** ("Instrumentos", abaixo).

## O que tranca

São as dependências reais. O resto da ordem é conveniência.

- **Fato.** Só afirme o que está em `research.md`, ou diga a incerteza como incerteza (`pesquisa/checagem`). Nada se completa de memória.
- **`script.json` é o texto que vale.** Nenhum outro arquivo guarda narração.
- **Toda cena tem `shots` válidos antes da voz.** O tipo em `src/narration/script.ts` recusa a cena sem plano, e o `pnpm narrate` lê o roteiro por ele: a decupagem completa é dependência técnica, e não aprovação de imagem.
- **O erro do `pnpm check-script` é corrigido.** Não é preferência.
- **A voz custa, e fixa o tempo.** Não é proibição, é custo: ela é gerada quando o texto e os `shots` de que depende estão estáveis o bastante para pagá-lo ("Antes de gerar a voz do conjunto", abaixo).
- **Mudar o que o usuário decidiu volta a ele** (`conducao/entrevista`).

Num vídeo sem incerteza especial, o caminho é curto: a pesquisa sustenta um compromisso, um trecho-chave é escrito e funciona, o roteiro se expande, a decupagem preenche os planos sem pedir mudança de estrutura, checador e editor conferem o conjunto, os defeitos são corrigidos e retestados só onde mexeram, e o usuário vê o roteiro. Num vídeo difícil entram prova de texto, crítica local, prova de imagem e decisão do usuário no meio do caminho, cada uma chamada por um risco, e nenhuma por lista.

## Formato

Siga `src/videos/why-we-sleep/script.json`. O tipo e as regras estão em `src/narration/script.ts`.

```json
{
  "title": "Pergunta ou título do vídeo",
  "scenes": [
    {
      "id": "sun",
      "narration": "Exatamente o que é falado.",
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
- `music` e `sfx`, a trilha e os efeitos, são escritos depois, pela skill `diretor-de-som`, e a voz não espera por eles.

## Narração: escreva para o ouvido

A narração é lida literalmente por um modelo de voz, que tropeça em tudo que não é palavra. Por isso `narration` leva o texto como ele soa, e o validador recusa o resto:

- Números por extenso: "cento e cinquenta milhões", não "150 milhões". Escolha a leitura natural ("um milhão e meio").
- Unidades por extenso: "quilômetros por segundo", não "km/s".
- Sem símbolos nem parênteses. Sem siglas em maiúsculas: escreva como se pronuncia ("dê-ene-á") ou como palavra ("Nasa").
- Cada frase com até 280 caracteres e terminando em ponto, exclamação ou interrogação. O modelo gera uma frase por vez e perde qualidade em frases longas.

O número em algarismos, o símbolo e a sigla vão para a tela, descritos na encenação do plano. Assim o espectador ouve "trezentos mil quilômetros por segundo" e lê "300.000 km/s".

Além das regras do validador:

- O modelo de voz gera uma frase por vez, com pausa entre elas, e o raciocínio picotado em frases curtas sai monótono e mal-humorado: o encadeamento de `escrita/narracao` pesa em dobro aqui.
- A pontuação decide como a frase é falada; a tabela está em `etapas/narracao.md`, na skill `diretor-producao`.
- A vírgula é uma pausa: o modelo de voz para em cada uma. Só ponha vírgula onde quem fala pararia. "E mesmo assim emagreciam", não "e, mesmo assim, emagreciam", que sai com duas pausas.
- A grafia decide a pronúncia. Se o usuário ouvir uma palavra dita errado, escreva em `narration` como ela deve soar e deixe a grafia correta em `script.md`, na seção de grafias de pronúncia. O modelo lê "mal-humorado" ligando o "l" à vogal ("malumorado"); "mau-humorado" sai certo. O Whisper não acusa esse tipo de erro, só o ouvido.

## Cenas e silêncio

Uma cena é um trecho da narração que o áudio trata como um bloco e que ganha um componente, com as frases que pertencem ao mesmo momento: uma frase nunca se divide entre duas cenas. A cena não é a unidade da imagem. Quem troca a imagem é o plano.

Uma cena pode pedir silêncio depois da fala com `holdMs` (até 8000): a imagem segue sem narração, só com a trilha. É assim que se faz a vinheta do título depois do gancho. Do som, é isto que o texto pode precisar antes da voz, porque muda a linha do tempo; timbre, leitos e desenho da música não seguram o texto nem a voz.

- **O respiro e o número mudo** são do humor do canal (`escrita/humor`) e entram na escrita. O silêncio de fala só existe no fim da cena: toda cena já deixa 0,6 s depois da última palavra, a seguinte abre 0,4 s antes da primeira frase (`PACING`, em `src/narration/manifest.ts`), e o `holdMs` se soma a isso. A frase que pede respiro fecha a cena dela, com o `holdMs` que falta para a reação se ler no mesmo plano; a cena que abre um número leva o tempo dele. O roteiro marca o lugar de cada número, com a nota visual e um tempo provisório; a skill `diretor-de-arte` desenha o que acontece e confirma ou corrige o tempo. O tempo da imagem toma o lugar de texto (`estrutura/arco`): quando um pedido de tempo chega com o texto pronto, é o roteiro que decide o que cede.
- Quando o silêncio já é parte do sentido (a vinheta, a consequência que precisa assentar, a imagem que respira), grave o `holdMs`. Quando a dúvida é de som (quanto dura, onde a música precisa ser ouvida sozinha), acione a skill `diretor-de-som` (`etapas/arco-de-som.md`, na pasta dela). Fora do respiro e do número mudo, sem silêncio pedido por ninguém, não se abre um passo para procurar um.
- O silêncio local que preserva a experiência é execução: os 900 ms para uma consequência assentar e o respiro de uma reação não são pergunta. Vai ao usuário o que muda a experiência (a pausa longa que faz de um fim rápido um fim contemplativo), contraria uma duração-alvo registrada ou cria custo relevante (`conducao/entrevista`), e vão a ele os números mudos, numa lista só ("Antes de gerar a voz do conjunto", abaixo).
- Depois da voz o `holdMs` ainda entra e sai: o áudio das frases vem do cache, e o que custa é o deslocamento de todos os quadros seguintes, com a imagem a conferir. Mais caro não é proibido: a pausa que um render mostra faltar é posta.

## Planos

Um plano é uma composição: o que fica na tela enquanto um trecho da cena é falado. Os planos vêm da skill `diretor-de-arte` (`etapas/decupagem.md`, na pasta dela), que entra de dois modos, por motivos diferentes:

- **Prova visual, por risco.** Quando o vídeo depende de uma imagem que pode não funcionar (uma personificação, uma comparação de espaço, uma analogia difícil de ver), peça a menor prova sobre o trecho em que ela pesa, antes do roteiro inteiro. Se ela muda a interpretação, isso se resolve antes de expandir. Havendo solução visual plausível e nada de estrutural pendurado nela, não há prova a pedir.
- **Decupagem completa, por dependência.** Antes da voz, todas as cenas recebem `shots`: o tipo exige, e é quando a imagem ainda pede outra frase sem regerar áudio. Ela devolve os planos, a ficha visual em `art.md`, os compromissos visuais assumidos, a lista dos números mudos, as frases que a imagem pediu para mudar e as hipóteses que o animatic vai testar.

Os planos que seguem para a voz são hipótese de construção, e não imagem decidida: escala, paleta, entrada, enquadramento, desenho e movimento continuam sendo descobertos no animatic e na animação. Os campos de `shots` e o que o validador aceita em cada um estão no passo 2 de `decupagem.md`: `entry` é texto, e `cut` e `camera`, no exemplo acima, são o costume.

## Instrumentos

Os três estão à mão durante a construção. Nenhum é fase.

### `pnpm check-script <vídeo>`

Rode quando a validade importa: depois de mexer em cenas, deixas ou na tabela de `script.md`, antes de entregar o roteiro a quem depende dele válido (a decupagem, o `editor`, o `pnpm narrate`). Ele dá dois tipos de resposta, com autoridades diferentes.

**Erro**, o que ele recusa: as regras do formato e da narração (`src/narration/script.ts`), listadas de uma vez, e `script.md` contra o roteiro, quando alguma cena está fora da tabela de estrutura, em dois blocos ou fora de ordem (sem `script.md`, só avisa). Corrija até passar.

**Sinal**, o que ele só imprime: a duração estimada de cada cena, de cada plano e do vídeo, já com o `holdMs` de cada cena, os planos longos, tratados na decupagem conforme a unidade `planos` da skill `diretor-de-arte`, e o **perfil da narração** contra os vídeos de referência. Medida FORA diz onde olhar e não reprova o texto: leia e ouça o trecho. O defeito que a leitura confirma é corrigido pela unidade dona (`escrita/explicacao` se é a relação, `escrita/fio` se é a continuidade, `escrita/narracao` se é a frase); sem defeito, o texto segue. O sinal é lido quando ajuda a diagnosticar, e não relatado a cada prova.

A faixa do canal, de 6 a 10 minutos, é referência do sinal. Sem `Duração-alvo` em `script.md`, o roteiro que funciona não é alongado nem cortado para caber nela.

### `checador` e `editor`

Dois subagentes que não viram o texto ser escrito, e é isso que eles valem: quem escreveu não julga o próprio texto. Passe o nome da pasta do vídeo e, na leitura parcial, as cenas.

- `checador`: classifica cada afirmação da fala e da tela contra `research.md` (`pesquisa/checagem`).
- `editor`: lê como quem ouve uma vez e devolve o que o ouvinte perde, ou diz que não há defeito (`revisao/critica`). Ele lê `script.md` para saber o que o vídeo quer dizer: antes de acioná-lo, o registro diz o vídeo atual e a tabela cobre as cenas que ele vai ler.

**No trecho, por risco.** O `checador` entra cedo quando a prova se apoia numa afirmação duvidosa, numa analogia de quantidade, num superlativo ou num mecanismo sensível: confere-se antes de construir em cima. O `editor`, quando uma dúvida de entendimento ou de continuidade não cede à sua leitura, ou quando o trecho vai sustentar muita expansão. O ajuste pequeno que você mesmo vê e sabe consertar é feito e relido por você.

**No conjunto, antes da voz.** O roteiro completo passa uma vez pelos dois, na mesma mensagem: cada um pega uma classe de erro que o outro não vê, e é nessa passada que se garante que não resta afirmação *não verificada*.

**Depois de corrigir, reteste o risco que a mudança pode ter reintroduzido**, e não os dois por rito:

| O que mudou | O que confere |
|---|---|
| a oralidade, com a mesma proposição | o validador e a sua leitura; o `editor`, só se era dele o defeito relevante |
| número, mecanismo, comparação ou grau de certeza | o `checador`, nas cenas afetadas |
| blocos fundidos ou fora da ordem anterior | o `editor`, nas cenas afetadas e nas que dependem delas; o `checador`, só onde uma relação entre fatos mudou |
| a tese ou o recorte | os dois, no conjunto, sobre a versão nova |

"Sem defeito" e "tudo sustentado" encerram a lente: não se abre outra rodada para haver revisão.

Eles julgam; quem decide e reescreve é você. Diante de cada defeito do `editor`, a pergunta é a de `conducao/entrevista`: o conserto preserva a decisão atual, ou pede uma nova? Se preserva, reescreva pela unidade dona, atacando a perda que o diagnóstico nomeia; se pede, leve ao usuário. A lista **Para o diretor de arte** vai à skill `diretor-de-arte`, que revê os planos apontados. O bloqueante é resolvido, e o relevante é corrigido enquanto o retorno paga (critérios de parada do `SKILL.md`).

## Antes de gerar a voz do conjunto

Gerar a voz é caro e fixa o tempo de tudo que é feito sobre ela: depois, mudar uma frase regera o áudio dela e desloca os quadros seguintes. Por isso, antes de gerar a voz do conjunto, confirme que não há decisão editorial material ainda aberta que provavelmente invalide o texto inteiro. Isso não congela a redação nem impede voltar: evita pagar produção sobre uma hipótese ainda fundamentalmente aberta. Não certifica o projeto inteiro, nem pede polimento zerado.

O texto sustenta esse custo quando:

- o texto completo existe, com um compromisso coerente, e `script.md` diz o vídeo atual;
- os fatos da fala e da tela estão sustentados, sem afirmação *não verificada*;
- todas as cenas têm `shots` válidos, as frases que a imagem já mostrou que não se encenam foram resolvidas, e o `pnpm check-script` passa;
- a conferência independente do conjunto não deixou bloqueante, e os relevantes que ficaram custam mais do que devolvem ou vão relatados;
- não há decisão aberta que obrigaria a regravar muito texto se mudasse: a tese, o recorte, a estrutura global, quem narra, a analogia que estrutura o vídeo, o fim, uma simplificação grande. Aberto pode ficar o que é execução: aberto ou médio, uma palavra ou outra, a cor, a transição.

A voz não espera desenho final, folha de modelo, composição, movimento, trilha, efeitos nem thumbnail renderizada.

**A decisão que é do usuário.** Se duas alternativas válidas fariam vídeos diferentes, quem decide é ele, por `conducao/entrevista`, na hora em que a dúvida aparece. No roteiro completo, o que resta a ele é dizer se este é o vídeo que ele quer; lint, checagem e inspeção de plano já têm ferramenta e agente. Mostre, na conversa:

- o roteiro em formato de leitura: a narração como texto corrido, na ordem, e não o JSON nem os campos de cada plano;
- a duração estimada;
- os compromissos de imagem que mudam sentido ou identidade (quem conduz, o que ganhou rosto, a forma da analogia, a relação que uma encenação afirma), resumidos pela intenção;
- os números mudos, numa lista só, como a decupagem a devolve: onde cada um entra, o que acontece nele e quanto dura. Ele corta ou troca de uma vez, antes da voz e de qualquer animação. Se o número cortado deixava uma frase sem desfecho, a frase passa a dizê-lo;
- as simplificações e as incertezas que pesam, e a fonte que limita uma afirmação importante;
- os defeitos relevantes que ficaram de propósito;
- a promessa que a embalagem deve expressar; o `diretor-publicacao` a transforma em título, conceito e prompt da thumbnail;
- as decisões abertas, se houver.

Fica disponível, sem ser imposto: `script.json` com os planos, `art.md`, `research.md` com as fontes de cada cena e o relatório do `checador`. Uma medida entra no relato quando está fora da referência e vale o usuário saber dela antes da voz, ou quando confirmou uma dúvida; fora da faixa sem defeito, é uma linha, e não pendência.

**O que a decisão dele fixa:** o que o vídeo diz, a experiência global, os compromissos visuais que mudam sentido, os números mudos que ficaram (registrados em `score.md`, pela skill `diretor-de-arte`) e a promessa que a embalagem expressa. **O que ela não fixa:** a redação, a duração exata, a escala, a paleta e a entrada de cada plano, a composição, o movimento e a mixagem. A promessa fica em `script.md` (`escrita/formato`); título, conceito e prompt públicos ficam em `publication.md`, do `diretor-publicacao`.

**Depois da voz**, duas perguntas que não se misturam:

- **Precisa do usuário?** Só quando muda uma decisão dele. A frase mais natural, o conectivo e a fusão local entram sem consulta, e `script.md` acompanha. A embalagem que vende a mesma promessa é do `diretor-publicacao`; se exigir outra promessa, volte ao usuário e registre a mudança aceita em `script.md`.
- **Custa produção?** Sim, mesmo sendo refino: a frase alterada regera o áudio dela, desloca os tempos e pede conferir os planos. O custo não pede licença, e não segura o conserto: a frase que o animatic mostra que não se encena é reescrita, e o fato que se descobre errado é corrigido. Não se defende um erro para poupar a voz gerada.

A reescrita volta ao `checador` quando altera uma afirmação, a força dela ou uma comparação; a que só troca a ordem das palavras, não. Quem depende do texto (a voz, os planos, a trilha) responde só à mudança no próprio artefato: a frase regerada, o plano conferido, a duração que mudou. A checagem do conjunto na montagem do arquivo final (skill `diretor-producao`) é a rede.
