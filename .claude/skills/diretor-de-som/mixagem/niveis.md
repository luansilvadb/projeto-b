## PERGUNTA
A que distância da voz a música fica em cada trecho?

## RESPOSTA

**Princípio.** A música é um leito **firme**: fica perto da voz o bastante para se ouvir o tempo todo, e quase não se mexe. O volume não é o recurso de expressão; a composição é (`momentos`).

**O que a referência faz.** A música fica 13 dB abaixo da voz (de 9 a 15 entre os vídeos). Dentro de um vídeo, passa 80% do tempo sob a fala numa faixa de 7 dB (de 4,5 a 9,6), com 0,6 virada de volume por minuto (de 0,3 a 1,1). Ela não sobe nas pausas da fala.

**O que deu errado quando não foi assim.** A 18 dB da voz, a música vira uma massa que qualquer faixa preencheria. Subindo 8 dB em cada pausa longa da fala, o usuário ouviu "um som que abre e abafa o tempo todo".

**Os níveis.** O mapa escolhe um por trecho; sem escolha, vale `leito`. Os valores estão em `MUSIC_MIX` (`src/audio/ducking.ts`) e valem para todo vídeo.

| Nível | Abaixo da voz | Quando |
|---|---|---|
| `presente` | 10 dB | um trecho em que a imagem conduz e a fala é rala: uma lista que se acende, uma viagem, uma contagem |
| `leito` | 13 dB | o vídeo inteiro, salvo motivo |
| `recuo` | 17 dB | a fala diz o fato mais pesado ou a explicação mais densa do vídeo; o fechamento, quando a voz baixa |
| primeiro plano | 3 dB | automático, nos silêncios de 2 s ou mais que o roteiro pede (`silencio`): a vinheta, a última nota |

A passagem de um nível a outro leva 2 s, centrada no começo da cena.

**Dose.** De duas a seis mudanças de nível num vídeo de 9 minutos. Mais que isso volta a ser o som que abre e abafa.

**Nível e momento juntos.** Um momento ralo (uma nota segurada) com o nível `recuo` some; um momento cheio com `presente` cobre a fala. Decida primeiro o momento e só mude o nível se o trecho ainda pedir.

**Procedimento:**

1. Deixe o vídeo inteiro em `leito`.
2. Marque até três trechos em que a fala precisa de espaço: `recuo`.
3. Marque até dois em que a imagem conduz: `presente`.
4. Para cada marca, registre no mapa a cena em que o nível muda e a cena em que volta.

## DEPENDÊNCIAS
- momentos: fornece o que a música faz no trecho, que vem antes do nível.
- silencio: fornece os silêncios em que a música vai ao primeiro plano.

## LIMITES
- Nenhum nível por plano nem por frase: a menor unidade é a cena, e o normal é um capítulo.
- "A trilha está alta" ou "baixa" de modo geral se resolve em `MUSIC_MIX`, para todos os vídeos, e não no mapa de um.

## EXEMPLO
> `rats-result` → `recuo` (os ratos morrem; a música já está numa nota só).
> `awake-record` → `leito` (o caso de Gardner começa, com humor).
> `tonight` → `recuo` (a última fala do vídeo, dita baixo).
> `subscribe` → `leito`.
