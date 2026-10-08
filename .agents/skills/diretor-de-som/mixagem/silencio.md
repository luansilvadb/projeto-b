## PERGUNTA
Quando a música some, e quando o roteiro abre espaço para ela?

## RESPOSTA

**Princípio.** Um silêncio quebra a continuidade entre voz, música e imagem, e por isso muda muito a relação entre elas. A ausência precisa fazer um trabalho que quem assiste percebe. Nenhum silêncio é obrigatório: música do começo ao fim é um vídeo sem defeito, e um vídeo pode não ter pausa nenhuma pedida pelo som.

**Dois silêncios, que não se confundem:**

| | O que é | O que muda | Quando se decide |
|---|---|---|---|
| **Silêncio de fala** (`holdMs` na cena) | a fala para e a imagem segue | a duração do vídeo: desloca todos os quadros seguintes | antes da voz, quando já se sabe que a pausa faz parte da experiência; depois dela ainda muda, mais caro |
| **Silêncio de música** (`music.silences`) | a música some e a fala continua | nada na linha do tempo | na etapa `som`, com o som para ouvir; antes só quando voz nua ou música contínua fazem vídeos diferentes |

`holdMs` é tempo sem fala, e não tempo sem música: as duas medidas não se somam.

**Três testes**, para qualquer um dos dois:

1. **Função.** O que muda para quem assiste quando a voz ou a música some aqui? A imagem ganha espaço, a consequência assenta, a mudança de estado se percebe, uma frase fica exposta, a música passa a ser ouvida, dois trechos se separam. "É uma virada de capítulo" não responde.
2. **Remoção.** Sem esta ausência, o que piora? Se nada que se perceba, ela sai.
3. **Duração**, no `holdMs`: o menor tempo que deixa a função acontecer, e não um valor por categoria. 500 ms para a imagem assentar é uma pausa válida.

O instante se acha pela função, e não por um lugar fixo do roteiro. O vídeo pode não ter pergunta, vinheta nem fim em silêncio. A frase que o vídeo preparou, a vinheta depois do gancho e a última nota antes da chamada são lugares onde um silêncio já funcionou.

**O silêncio de fala.** O limite é do runtime: de 1 a 8000 ms por cena. Também é do runtime o que a música faz hoje: na pausa de 2 s ou mais ela sobe sozinha ao primeiro plano; na mais curta, segue no nível em que estava, porque a rampa não termina de subir e o que se ouve é um soluço de volume. A pausa curta que cumpre a função está certa sem a música subir, e a existência de uma pausa não pede mudança de mixagem.

**O silêncio de música.** Vai da palavra de deixa ao fim da cena; a música some e volta em meio segundo. Como heurística, cobre uma frase (de 4 a 8 s); o que passa disso pede escuta, porque pode soar como defeito. O que vem depois dele é um bom lugar para a troca de leito (`leito`), porque a faixa nova entra sem cruzar com a anterior.

**Em vez de silêncio.** Para um trecho que pede peso sem pedir ausência, um momento ralo (`momentos`) e o nível `recuo` (`niveis`): a música continua, quase parada.

**O que a referência faz** (sensor: chama a escuta, não reprova):

- A música está ausente em 0,5% do tempo (de 0 a 2,4%; há vídeo com música em 100%), com no máximo um trecho de silêncio a cada cinco minutos.
- A fala ocupa 96% do vídeo, com 0,2 pausa de 1 s por minuto.

Um vídeo com outra contagem, em que cada ausência faz o seu trabalho e o som ouvido funciona, não está errado: a medida fora da faixa diz onde ouvir.

**O que deu errado uma vez.** Três silêncios e cinco respiros de 1 s nas viradas de capítulo, num vídeo de 9 minutos, com a música subindo em cada um: 5% do tempo sem música e 2,2 viradas de volume por minuto, o dobro do teto da referência. A música parecia interrompida, e não ausente por um motivo. O defeito era a ausência sem função e a mixagem mexida a cada pausa, e não a contagem.

**Quem decide.** A pausa que preserva a experiência é execução, do agente. A que muda o ritmo, o peso ou o tom do vídeo vai ao usuário (`entrevista-som`).

## DEPENDÊNCIAS
- entrevista-som: fornece o que vai ao usuário e como chega.

## LIMITES
- `holdMs` é do roteiro: esta unidade pede, a skill `diretor-criativo` escreve, e ela também grava sozinha a pausa que nasce da imagem ou do texto.
- Nenhum silêncio para "dar respiro" sem função que se perceba.

## EXEMPLO
> Silêncio de música: em `so-far`, da palavra "Para" ao fim da cena (7 s). "Nenhum animal estudado até hoje conseguiu parar de dormir" é dita sem música, e o leito B entra em seguida.
> Silêncio de fala: 6 s em `the-question`, para a vinheta, com a música à frente; 1,5 s em `tonight`, para o fim assentar, com a música no nível em que estava.
