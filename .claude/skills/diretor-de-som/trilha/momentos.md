## PERGUNTA
Onde a música muda de caráter dentro do leito, e quanto?

## RESPOSTA

**Princípio.** Um **momento** é um trecho do leito refeito com outra descrição: a música muda de humor ali, no segundo em que a cena começa, e volta a ser o leito no segundo em que a cena acaba. É o único recurso que liga a música a um instante do vídeo sem trocar de faixa.

**O que a ferramenta faz.** Fora do trecho, a faixa fica idêntica; dentro, o modelo compõe de novo com o que vem antes e depois como contexto. Um trecho vai de 3 a 90 s e começa e termina em limite de cena. Nunca começa junto com o leito: sem música antes dele o modelo não tem contexto, e abriu um vídeo com 4 s de silêncio e 14 s de notas soltas. O gancho toca o leito desde o primeiro segundo.

**Onde cabe um momento.** Onde o roteiro muda de assunto ou de peso, e a mudança dura ao menos duas cenas:

- um capítulo com um lugar ou um bicho próprio (a noite na savana, a lagoa, o laboratório);
- um fato que pesa (uma morte, um resultado que desmonta a hipótese);
- o fechamento (o tema devagar, perto de parar).

O que não é momento: uma frase de efeito, uma piada, um corte. A música da referência muda de seção a cada 20 s e os cortes não coincidem com as mudanças mais do que o acaso.

**Quanto muda.** O momento fica no mundo de timbres do leito e varia a **densidade** (quantas notas), o **registro** (grave ou agudo), o **pulso** (com ou sem) e o **modo de tocar**. Não troca os instrumentos.

| Contraste pedido | O que saiu no teste |
|---|---|
| moderado ("the same theme, sparse, held strings") | as notas caem de 5,4 para 3 por segundo, o timbre escurece meia oitava, e as costuras saltam 2,6 e 0,7 dB |
| grande ("underwater, no drums", sem os timbres de base) | costura de 9,4 dB na saída, e a variação de timbre da faixa vai a 0,98 oitava, três vezes o teto da referência |

Por isso a forma de menor risco que se achou para pedir a transformação é começar por "the same theme" e repetir o sufixo do vídeo (`descricao`). É linguagem de prompt que ajudou no trecho refeito, e não garantia de tema mantido: o som em volta também segura a identidade, e quem confirma é o que se ouve.

**Dose.** De três a sete momentos num vídeo de 9 minutos, cobrindo até metade dele; o resto é o leito. Cada momento refeito baixa a faixa inteira em 1 dB, que a mixagem compensa, e custa de três a quatro minutos de GPU.

**Vizinhos.** Dois momentos seguidos, colados, são válidos: o segundo é composto com o primeiro como contexto. Um momento não atravessa a troca de leito.

**Procedimento:**

1. Percorra o roteiro capítulo a capítulo e marque onde o assunto ou o peso muda por duas cenas ou mais.
2. Para cada marca, escreva o que a música faz ali em uma frase, e o porquê.
3. Corte os que não têm causa no texto e os que só repetem o leito.
4. Escreva a descrição de cada um (`descricao`).
5. Confira as durações (de 3 a 90 s) e que nenhum cruza a troca de leito; o `pnpm music` recusa o que não cabe.

## DEPENDÊNCIAS
- leito: fornece a peça dentro da qual o momento é refeito.
- descricao: como pedir ao gerador o estado da música no trecho, e o sufixo.

## LIMITES
- Sem causa no roteiro, não há momento.
- O modelo não põe um acento num segundo dentro do trecho: o que cai no instante é o começo e o fim dele. O acento de uma ação é do efeito sonoro (`efeitos/dose`).
- "O tema volta" quer dizer o mesmo leito de volta, não uma melodia repetida em outro arranjo: o teste de `cover` deu parentesco de harmonia de 0,4 numa escala em que 1 é idêntico, e não foi adotado.

## EXEMPLO
> Cenas `rats-result` e `unknown-cause` (25 s): os ratos mantidos acordados morrem, e ninguém acha a causa.
> Momento: "the same theme almost still, one held low string note, a few distant felt piano notes, grave and quiet, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental"
> Por quê: é o fato mais pesado do vídeo, e o pulso de relógio do laboratório não pode tocar sobre ele.
