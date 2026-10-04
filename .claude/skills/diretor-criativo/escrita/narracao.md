---
name: narracao
description: Define as regras de frase, ritmo e vocabulário de um texto escrito para ser ouvido uma única vez.
---

## PERGUNTA
Como escrever um texto feito para ser ouvido?

## RESPOSTA

**Premissa.** O espectador ouve uma vez, na velocidade do narrador, sem poder reler. Toda regra abaixo decorre disso.

**Frase:**

- Uma ideia por frase. Se há "que", "o qual" e "sendo que" na mesma frase, divida.
- Sujeito e verbo próximos e no começo; a informação nova vai para o fim, onde a voz cai.
- Voz ativa e verbos concretos: "a estrela engole o planeta", não "ocorre a absorção do planeta".
- Frases de tamanhos variados: duas ou três médias, depois uma curta que pousa a ideia.
- Presente do indicativo como tempo padrão.

**Perfil de frase medido no canal** (em inglês; as medidas em português, com as faixas que o `pnpm check-script` confere, estão em `explicacao`):

| Medida | Mediana |
|---|---|
| Palavras por frase | 15 |
| Frases de até 6 palavras | 11% |
| Frases de 25 palavras ou mais | 15% |
| Perguntas por minuto | 0,5 |
| Números por minuto | 2,2 |

O texto não é feito de frases curtas: é feito de frases médias, com uma muito curta a cada nove ou dez. Frase de uma ou duas palavras ("Ah. Ah, não.") marca a reviravolta; por isso é rara. Frase longa é permitida quando é uma enumeração em que cada item cabe numa respiração.

**Vocabulário:**

- Palavra comum sempre que existir. Termo técnico só entra quando será reutilizado; nesse caso é explicado antes de ser nomeado ("essa fronteira tem nome: horizonte de eventos").
- Um nome por coisa. Trocar por sinônimo faz o ouvinte achar que é outra coisa.
- Concreto antes do abstrato: primeiro o exemplo, depois o conceito.
- Sem siglas não explicadas e sem parênteses; o que está entre parênteses não se narra.

**Números:**

- No máximo um número relevante por frase, e cerca de dois por minuto de narração. Mais que isso só em arcos de escada de escala, ou num bloco que responde a uma pergunta anunciada com números de uma medida só, sobre os mesmos elementos, conforme `explicacao`.
- Arredondado e dito por extenso do jeito que se fala ("quase quatro milhões").
- Todo número grande ganha referência de comparação logo em seguida.

**Citação:**

- Diga quem falou, pelo nome, antes da fala: "um pesquisador" sem nome soa como enfeite, e o espectador não tem como conferir.
- O anúncio termina em dois-pontos e a fala citada vem depois dele: a voz para em suspenso e o ouvinte entende que as próximas palavras são de outra pessoa.
- Cite o que a pessoa disse. Se a frase original não cabe na voz, diga que é um resumo ("ele dizia que...") em vez de pôr palavras na boca dela.
- Nome estrangeiro vai escrito como se pronuncia na narração; a grafia correta vai para a tela e para o registro do roteiro.

**Ritmo e encadeamento:**

- Cada bloco termina com uma frase que puxa o próximo: pergunta, "mas", consequência.
- Conectores falados ("só que", "então", "acontece que") em vez de escritos ("entretanto", "outrossim", "dessa forma").
- Repetição deliberada de uma palavra-chave ajuda o ouvido; repetição acidental cansa.
- Pausas são escritas com ponto e quebra de linha, não com reticências. O dois-pontos também é pausa, com a voz em suspenso: use-o antes de uma citação ou do que a frase anuncia, e troque-o por vírgula onde a frase deve correr de um fôlego.
- A virada com "mas" é o motor do texto: cada explicação dura até encontrar seu problema. Se dois blocos seguidos não têm um "mas", um "só que" ou equivalente, o texto virou exposição.
- A pergunta do espectador pode ser feita pelo narrador ("ok, mas por que não ir mais rápido?"), cerca de uma a cada dois minutos; ela marca a troca de assunto melhor que um conector.

**Procedimento:**

1. Escreva bloco a bloco, respeitando função e orçamento de palavras definidos na estrutura.
2. Releia cada bloco em voz alta mentalmente: onde faltaria ar ou a língua tropeçaria, reescreva.
3. Corte toda frase cuja ausência não seria notada.
4. Confira o bloco contra a ficha de voz.

## DEPENDÊNCIAS
- explicacao: fornece o assunto de cada bloco, a cadeia de causas e o dispositivo do vídeo; a frase só é escrita depois deles.
- arco: fornece função, cadeia de perguntas e orçamento de cada bloco.
- voz: fornece a ficha de voz que a narração deve respeitar.

## LIMITES
- Não inserir afirmação fora da base de fatos durante a escrita; se faltar, volte a `levantamento`.
- Analogias, humor e notas visuais têm unidades próprias.

## EXEMPLO
> Antes: "A fotossíntese, processo pelo qual os organismos autotróficos convertem energia luminosa em energia química, é fundamental para a manutenção da vida."
> Depois: "Uma folha faz algo que nenhuma fábrica humana consegue. Ela pega luz, ar e água. E transforma em comida."
