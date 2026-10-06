## PERGUNTA
Quando a música some, e quando o roteiro abre espaço para ela?

## RESPOSTA

**Princípio.** Silêncio é o recurso mais forte do som e o mais caro: só pesa porque é raro. Um vídeo tem lugar para um, às vezes dois.

**O que a referência faz.** A música está ausente em 0,5% do tempo (de 0 a 2,4%), com no máximo um trecho de silêncio a cada cinco minutos. A fala ocupa 96% do vídeo, com 0,2 pausa de 1 s por minuto: não há respiro nas viradas de capítulo.

**O que deu errado quando não foi assim.** Três silêncios e cinco respiros de 1 s num vídeo de 9 minutos deram 5% do tempo sem música e 2,2 viradas de volume por minuto, o dobro do teto da referência. A música parecia interrompida, e não ausente por um motivo.

**Dois tipos de espaço**, que não se confundem:

| | O que é | Onde vai | Quanto |
|---|---|---|---|
| **Silêncio de música** (`music.silences`) | a música some e a fala continua | sobre a frase que o vídeo inteiro preparou: a resposta, o fato que desmonta tudo | um por vídeo; dois se o vídeo passa de 8 minutos |
| **Silêncio de fala** (`holdMs` na cena) | a fala para e a música vai ao primeiro plano | a vinheta depois do gancho; a última nota antes da chamada | de 2 a 8 s; no máximo três por vídeo |

**O silêncio de música.** Vai da palavra de deixa ao fim da cena; a música some e volta em meio segundo. Dura uma frase (de 4 a 8 s): mais que isso soa como defeito. O que vem depois dele é o melhor lugar para a troca de leito (`leito`), porque a faixa nova entra sem cruzar com a anterior.

**O silêncio de fala.** Só o de 2 s ou mais leva a música ao primeiro plano. Um respiro de 1 s não dá tempo de a música subir e descer: vira um soluço de volume. Se o roteiro tem respiros curtos, a música passa por eles no nível em que estava.

**Em vez de silêncio.** Para um trecho que pede peso mas não é a frase central, use um momento ralo (`momentos`) e o nível `recuo` (`niveis`): a música continua, quase parada.

**Procedimento, no arco de som:**

1. Ache a frase central do vídeo: a que responde à pergunta do gancho. É a candidata ao silêncio de música.
2. Ache onde a música precisa ser ouvida sozinha: a vinheta e o fim. Peça à skill `diretor-criativo` o `holdMs` de cada um, com a duração.
3. Some: o tempo sem música fica abaixo de 2,4% do vídeo.
4. Leve ao usuário cada silêncio, com a frase e o motivo: `holdMs` alonga o vídeo e mexe na narração.

## DEPENDÊNCIAS
- diretor-criativo/estrutura/arco: fornece a virada e a frase central.

## LIMITES
- `holdMs` é do roteiro: esta unidade pede, a skill `diretor-criativo` escreve, e depois da narração gravada cada um novo desloca todos os quadros seguintes.
- Nenhum silêncio para "dar respiro" sem frase ou imagem que o justifique.

## EXEMPLO
> Silêncio de música: em `so-far`, da palavra "Para" ao fim da cena (7 s). "Nenhum animal estudado até hoje conseguiu parar de dormir" é dita sem música, e o leito B entra em seguida.
> Silêncio de fala: 6 s em `the-question`, para a vinheta; 1,5 s em `tonight`, que é curto para a música subir e fica como está.
