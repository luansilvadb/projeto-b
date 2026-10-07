## PERGUNTA
Quando a mesma música precisa ficar mais perto ou mais longe da voz, e qual preset realiza isso?

## RESPOSTA

**Princípio.** O nível controla a relação de presença entre a música que já existe e o que precisa ser percebido no trecho; ele não cria conteúdo musical. Use-o quando a música certa está tocando e a distância dela para a voz ou para a imagem está errada naquela região. Nenhuma mudança de nível é obrigatória: um vídeo inteiro em `leito` é um vídeo sem defeito, e a música já muda sozinha, pela composição.

**A intenção vem antes do preset.** Primeiro a relação que a região pede: a fala precisa custar menos esforço; a música precisa ser um pouco mais percebida; a imagem precisa carregar mais da experiência; a música está sumindo ali. Depois, o preset mais próximo. `presente`, `leito` e `recuo` são presets do runtime, e não significados dramáticos: um fato pesado pode funcionar em `leito`, em silêncio, num momento ralo ou em `presente`; uma sequência em que a imagem conduz pode já funcionar em `leito`; o fechamento não pede nível nenhum por ser fechamento. A imagem que conduz com pouca fala e a fala densa sobre uma textura cheia são lugares onde `presente` e `recuo` já serviram, e não gatilhos.

**O que o runtime oferece.** Três presets (`MUSIC_LEVELS`, em `src/narration/script.ts`), cada um uma distância abaixo da voz (`MUSIC_MIX.levelsDb`, em `src/audio/ducking.ts`):

| Preset | Abaixo da voz, hoje | |
|---|---|---|
| `presente` | 10 dB | o mais próximo da voz |
| `leito` | 13 dB | o que vale sem `music.levels` |
| `recuo` | 17 dB | o mais afastado |

- **Os números são a calibração atual dos presets**, tirada da referência, e não três leis de percepção. O mapa escolhe o preset, não o número: não há quarto nível nem dB por trecho.
- **Níveis são deltas.** `music.levels` guarda só os lugares em que a relação precisa diferir de `leito`. Não se escreve `leito` na primeira cena para deixá-lo explícito.
- **A mudança começa numa cena e persiste** até a mudança seguinte. Quando a região termina, a volta é escrita. Não há nível por plano, frase ou palavra.
- **A passagem leva 2 s**, centrada no começo da cena (`levelRampSeconds`). Numa cena muito curta, ou em trocas seguidas, a música pode não chegar a assentar no preset. Isso não é duração mínima: a mudança breve que funciona vale, e quem diz é o som.
- **A distância é entre o volume medido da narração inteira e o de cada parte da trilha**, e não segundo a segundo: por isso vozes e faixas de volumes diferentes caem na mesma relação. Num trecho em que a voz baixa, ou em que a faixa adensa, a mesma distância pode disputar. A medida não vê tudo; o ouvido fecha a dúvida.

**Primeiro plano não é um nível.** No silêncio de fala de 2 s ou mais (`holdMs`, em `silencio`), o runtime leva a música sozinho a 3 dB da voz (`featuredDb`) e depois a devolve ao nível corrente. É outro mecanismo: não se escreve `level` para ele, nem `presente` para reforçá-lo. Na pausa curta entre frases a música segue no nível em que estava, e nenhum `level` imita essa abertura. Num silêncio de música (`music.silences`) ela some, e o nível corrente volta a valer quando ela retorna.

**É mesmo um problema de presença?**

| O que está errado | Ferramenta |
|---|---|
| a música certa, perto ou longe demais | nível |
| a música segue pulsando, densa ou articulada onde devia quase parar | momento (`momentos`) |
| a trilha soa genérica, infantil, de playlist | o leito e a descrição (`leito`, `descricao`) |
| a música devia sumir | silêncio de música (`silencio`) |
| a música devia assumir o primeiro plano | um `holdMs`, pedido ao roteiro (`silencio`) |
| uma ação precisa de impacto | efeito (`dose`) |
| o vídeo inteiro está errado do mesmo jeito | não é o mapa (veja os limites) |

`recuo` não esconde música ruim, e `presente` não dá função a música genérica. Se em `recuo` o ritmo ou o timbre ainda disputam, o problema é do conteúdo: não existe nível mais baixo para tentar.

**Nível e momento são eixos diferentes.** O momento muda o que a música toca; o nível, quanto ela se ouve. Um não exige o outro: um repaint pode funcionar em `leito`, e a mesma música pode pedir outra distância sem repaint nenhum. Quando a região pede os dois, o nível é julgado contra o som real do momento gerado, e não contra o nome do preset, porque a densidade muda o que ele produz: um momento ralo em `recuo` pode sumir, um cheio em `presente` pode disputar.

**Os três defeitos**, que são de escuta, e não de número:

1. **A fala ficou difícil**: quem ouve se esforça, perde uma palavra ou tem a atenção puxada sem intenção.
2. **A música não faz o trabalho dela**: some, ou vira massa. A 18 dB da voz, num piloto, ela virou "uma massa que qualquer faixa preencheria". Onde deve existir, precisa estar presente o bastante para cumprir a função.
3. **Ouve-se a operação do volume**: a mudança de presença é percebida como alguém mexendo no botão, e não como consequência do vídeo. Subindo 8 dB em cada pausa longa da fala, o usuário ouviu "um som que abre e abafa o tempo todo". O defeito é a modulação sem função ou nervosa, e não o volume fazer trabalho: aproximar a música quando a imagem assume, ou recuá-la sob uma fala delicada, é uso legítimo.

**Teste de remoção**, para cada mudança: se ela sair e o trecho ficar em `leito`, o que piora? Se nada que se perceba, ela sai.

**O que a referência faz** (sensor: chama a escuta, não reprova):

- A música fica 13 dB abaixo da voz (de 9 a 15 entre os vídeos).
- Dentro de um vídeo, passa 80% do tempo sob a fala numa faixa de 7 dB (de 4,5 a 9,6), com 0,6 virada de volume por minuto (de 0,3 a 1,1). Ela não sobe nas pausas da fala.

Os dados sustentam o padrão conservador: presença estável, sem nível escrito onde nada pede. Fora da faixa, as perguntas são: a fala ficou difícil? a música sumiu? há razão local? a separação mediu direito? As faixas são do vídeo inteiro, e não de um trecho: `recuo`, a 17 dB, fica fora dos 9 a 15 por projeto, e ir de `presente` a `recuo` já percorre 7 dB. `presente`, a 10 dB, está dentro da faixa e ainda assim pode disputar numa faixa densa. A quantidade de mudanças não reprova: zero, uma ou sete podem estar certas; muitas só aumentam a chance de se ouvir a operação, ou de o mapa estar compensando uma música errada.

**Procedimento:**

1. Ouça e meça o vídeo em `leito`, com os momentos que já existem.
2. Ache as regiões em que a música certa está na distância errada, e confirme que o problema é de presença.
3. Escolha o preset mais próximo; registre a mudança e, se a região termina, a volta.
4. Meça de novo e leve o trecho ao ouvido. A mudança fica se melhora a relação sem que se ouça a operação.

**Em `sound.md`**, cada mudança leva a intenção, e não só o preset, para depois se poder ver se o preset era a realização certa. Só as mudanças que existem: nada de trecho que ficou em `leito` nem de mudança considerada e descartada.

## DEPENDÊNCIAS
- momentos: fornece a ferramenta do conteúdo musical, e o som contra o qual o nível é julgado.
- silencio: fornece os dois silêncios e o que a música faz, sozinha, em cada um.

## LIMITES
- Os três presets, os dB, a rampa e o primeiro plano automático são do runtime: o mapa não inventa nível, distância nem fronteira dentro da cena.
- "A trilha está alta" ou "baixa" no vídeo inteiro não se resolve enchendo `music.levels` de correções locais. Descubra antes de onde vem: do arquivo gerado, da medida e da calibração dela, ou dos presets. A correção dos presets é do runtime, vale para todos os vídeos e pode mexer no que já estava certo.

## EXEMPLO
> `rats-result` → `recuo`: a textura disputa com a frase; a música fica, com menos presença.
> `awake-record` → `leito`: a região terminou.
>
> ```json
> "levels": [
>   { "from": "rats-result", "level": "recuo" },
>   { "from": "awake-record", "level": "leito" }
> ]
> ```
