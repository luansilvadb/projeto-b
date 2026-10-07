## PERGUNTA
Quando uma região da parte merece um repaint local, e onde ele começa e termina?

## RESPOSTA

**Princípio.** Um **momento** é um repaint local de uma parte que já existe: cabe quando uma região delimitada precisa de outro estado musical e, depois dela, a trilha deve continuar como a mesma parte. O momento muda uma região; a parte muda o que continua dali em diante.

O estado musical é mais que o humor: densidade, energia, registro, pulso, textura, articulação, espaço, peso, sensação de movimento. Um momento pode manter a emoção e só rarefazer, abrir espaço ou suspender o pulso.

**O que a ferramenta faz.** O ACE-Step recompõe a região com o áudio de fora dela como contexto. O arquivo continua sendo a mesma parte, e fora da região o material fica como estava: por isso o momento serve à mudança temporária. Os limites são mecânica (`src/audio/parts.ts`), e o `pnpm music` recusa o que não cabe:

- **De 3 a 90 s.**
- **Em limite de cena**: do começo da cena `from` ao fim da cena `to`, ou da própria `from`. Não começa no meio de uma frase nem num segundo qualquer.
- **Ao menos 5 s depois do início da parte em que está**: o repaint precisa de áudio antes dele. No segundo zero o modelo abriu com 4 s de silêncio e 14 s de notas soltas.
- **Dentro de uma parte só**: o momento pertence à parte em que começa e não atravessa a troca. Termine antes, mova a fronteira ou redesenhe a parte.

Os 5 s são restrição de contexto, e não de estilo: um momento aos 7 s da parte, que o comando aceita e que faz trabalho, vale. A abertura que precisa nascer em outro estado é descrita na própria parte (`descricao`), ou a transformação espera o contexto. Uma parte curta pode não ter espaço para contexto, duração mínima e borda seguinte: não force. O que não está aqui (uma combinação incomum, um encaixe no limite), o comando prova.

"Voltar" também é mecânica: o material de fora continua, mas a entrada e a saída podem ser ouvidas como costura. Tecnicamente voltou não quer dizer que integrou.

**A ferramenta que o trecho pede.** O momento não é o único recurso que age num instante. O que é só dele: recompor o conteúdo musical de uma região sem trocar a parte inteira.

| O trabalho | Ferramenta |
|---|---|
| outro conteúdo musical numa região, e a volta à parte | momento |
| a transformação continua dali em diante, ou não cabe num repaint | parte (`leito`) |
| a mesma música, mais presente ou mais recuada | nível (`niveis`) |
| a ausência em si | silêncio (`silencio`) |
| o acento de uma ação pontual | efeito (`dose`) |

Não se refaz um trecho só para baixar o volume, nem se pede "sparse" para imitar um silêncio; a rarefação em que a música precisa continuar existindo é momento. Não se transforma a trilha por um impacto de 200 ms.

**Quando cabe.** O teste: se o repaint não existir e o leito tocar normalmente, o que a cena perde? Contraste, espaço, peso, impulso, suspensão, transformação. Se nada que importe, não há momento. A pergunta que o define: que propriedade desta região precisa diferir do leito a ponto de justificar um repaint?

- **A causa está no vídeo inteiro**, e não só no texto: narração, imagem, movimento, estrutura, ritmo, consequência, mudança de percepção. A narração segue explicativa enquanto a animação entra numa célula ou debaixo d'água; uma sequência acelera, rarefaz ou fica quase imóvel. Nenhuma palavra precisa dizer "agora mudou".
- **Pistas, e não gatilhos**: capítulo, assunto, lugar, personagem, experimento, fato que pesa, fechamento. São onde olhar. Há capítulo novo sem mudança musical e mudança musical no meio de um capítulo; um repaint a cada assunto é a playlist de volta, dentro do mesmo arquivo (`leito`). O fato grave pode pedir o leito contínuo, um recuo, um silêncio ou nada. O fechamento pode seguir no leito.
- **A categoria não decide**: frase de efeito, piada e corte costumam pedir silêncio, nível, efeito ou nada, e nenhum cria momento por existir. Mas um trecho cômico de 15 s que pede outro estado e volta, ou a região construída em torno de uma frase, pode ser momento. Decide a função e a duração.
- **Corte não é gatilho**: na referência os cortes não coincidem com as mudanças da música mais do que o acaso. Uma sequência visual inteira é outra coisa, e pode ser causa.
- **O leito já muda sozinho**: a peça gerada tem estrutura própria. O momento existe para a transformação localizada que precisa ser controlada, e não para a música ficar menos repetitiva.

Zero momentos é uma resposta correta: o leito que já conduz o vídeo não é trilha sem direção. Um basta quando só uma região pede. Muitos passam quando cada um faz trabalho e o conjunto continua uma música só.

**A região.** A menor em que o estado precisa ser diferente, dentro dos limites: menos custo, menos borda, menos risco para a identidade. Uma cena só basta, se tem 3 s. Não corte a transformação que precisa durar.

**Quanto muda.** O repaint transforma o leito, e não o troca pela "música da cena". O resultado precisa soar pertencente, ou deliberadamente transformado, e quem diz é `leito`. Mudar muito o material aumenta o risco de costura e de perda de identidade:

| Transformação pedida | O que saiu no teste |
|---|---|
| moderada ("the same theme, sparse, held strings") | as notas caem de 5,4 para 3 por segundo, o timbre escurece meia oitava, e as costuras saltam 2,6 e 0,7 dB |
| grande ("underwater, no drums", sem sinais de identidade) | costura de 9,4 dB na saída, e a variação de timbre da faixa vai a 0,98 oitava, três vezes o teto da referência |

A lição é atenção, e não proibição: a mudança maior pede mais cuidado com a borda. Tirar a percussão, trazer uma textura ou largar um instrumento vale quando o som continua pertencendo à trilha. "the same theme" e o sufixo são a linguagem de menor risco achada (`descricao`): técnica, e não requisito.

A forma não decide para nenhum lado. O momento que obedece à descrição e estoura a costura falhou; o de mesmos instrumentos cuja borda soa outra música, também. O de uma cena, sem "the same theme", com outro instrumento, que realiza a transformação e integra, passou.

**Sensores.** Dizem onde investigar, e não se passa ou falha:

- **A música da referência muda de seção a cada 20 s**, mais ou menos. Descreve a música, e não a quantidade de repaints: uma faixa gerada muda por dentro sem momento nenhum.
- **A dose do piloto**: de três a sete momentos num vídeo de 9 minutos. É a realização daquele vídeo. Dois não pedem um terceiro; oito chamam atenção e não reprovam.
- **A parte do vídeo refeita.** Perto ou além da metade, pergunte: estou corrigindo um trecho, ou redesenhando a música por remendos? Momento não é remendo de base ruim: o que pede outro pulso, outra textura ou outra densidade quase por inteiro acusa a descrição da parte, a identidade ou a falta de uma parte nova. A porcentagem não reprova.
- **O salto nas bordas e a variação de timbre** (`critica-som`). O número isolado não condena o que soa natural.
- **Volume e custo, observados nesta máquina**: cada repaint baixou a faixa inteira em cerca de 1 dB, que o comando mede e a mixagem corrige pelo valor real, e custa de três a quatro minutos de GPU. Podem mudar com o modelo e a configuração. São razão para testar a menor região e não gerar momento sem função.

**Vizinhos.** Dois momentos colados são válidos: o segundo é composto com o primeiro como contexto. Vale perguntar se ainda são dois (funções diferentes, o segundo depende do primeiro) ou se a região virou fragmento.

**Quando sai ou vira outra coisa.**

- O leito sozinho realiza a região sem perda que importe: retire o momento.
- Vira **parte**, como hipótese: a transformação precisa continuar além da região, passa de 90 s, repaints seguidos reconstroem quase tudo, o repaint não chega ao novo estado ou a costura continua ruim. Não se encadeiam três repaints de 90 s para evitar uma parte.

**Procedimento.** É investigação, e não cota. Nada obriga a prever os momentos antes de ouvir o leito: o mapa cresce pelo que o som mostra.

1. Parta do leito gerado e do vídeo, e localize a região em que o estado atual da música não realiza a experiência.
2. Nível, silêncio, efeito ou parte fazem melhor esse trabalho?
3. Delimite a menor região válida e escreva o que muda nela (`descricao`).
4. Gere só aquela parte e meça as bordas e a realização.
5. Leve ao ouvido só a dúvida que a medida não resolve (`entrevista-som`): se o estado pretendido se ouve, se a borda integra. A existência de um momento não é pergunta ao usuário.
6. Fique com ele se o vídeo perde algo sem ele.

Em `script.json` o momento é `from`, `to` e `caption`, e nada mais; a região, a intenção e o porquê dos momentos que existem ficam em `sound.md`. O cogitado e descartado é do git.

## DEPENDÊNCIAS
- leito: fornece a parte dentro da qual o momento é refeito, e o teste de identidade da transformação.
- descricao: que propriedades pedir no repaint, e o sufixo.
- entrevista-som: quando a dúvida de um momento vai ao ouvido do usuário.

## LIMITES
- Sem trabalho que se perceba na experiência do vídeo, não há momento.
- O modelo não põe um acento num segundo dentro do trecho: o que cai no instante é o começo e o fim dele. O acento de uma ação é do efeito sonoro (`efeitos/dose`).
- "O tema volta" quer dizer o mesmo leito de volta, não uma melodia repetida em outro arranjo: o teste de `cover` deu parentesco de harmonia de 0,4 numa escala em que 1 é idêntico, e não foi adotado.

## EXEMPLO
> Cenas `rats-result` e `unknown-cause` (25 s): os ratos mantidos acordados morrem, e ninguém acha a causa.
> Sem o momento, o pulso de relógio do laboratório toca sobre o fato mais pesado do vídeo. Recuar o nível deixaria o pulso tocando, e a cena pede música quase parada, não ausência. Depois das duas cenas, a trilha segue como antes.
> Momento: "the same theme almost still, one held low string note, a few distant felt piano notes, grave and quiet, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental"
>
> Outro vídeo, de 4 minutos: o leito gerado já abre, adensa e assenta com o percurso, e nenhuma região perde nada sem repaint. Zero momentos.
