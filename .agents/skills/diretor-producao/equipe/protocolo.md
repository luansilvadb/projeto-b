## PERGUNTA
Como as seis direções trabalham como uma equipe: que frase as alinha, quem é dono de quê, como um artefato passa de uma para outra, que problema para o trabalho e quantas rodadas cabem no prazo?

## RESPOSTA

Vale nos dois modos do briefing (`diretor-de-pauta/briefing.md`). Não cria fila, estado nem aprovação: cada direção continua começando quando existe o artefato que dá evidência válida para o trabalho dela.

**Frase de intenção.** Uma frase que diz o que quem assiste deve entender ou sentir ao fim, e por qual meio. É decisão do usuário, formulada com o `diretor-criativo` e guardada em `script.md`: no modo `canal`, a tese e a promessa já a dizem, e a linha `Intenção` é opcional; no modo `jam`, ela é a linha `Intenção` do cabeçalho. As outras direções a traduzem cedo, em uma linha cada, no próprio arquivo:

| Direção | Onde | O que a linha diz |
|---|---|---|
| `diretor-de-arte` | `art.md`, linha "Intenção visual" | a metáfora ou a imagem central que carrega a ideia, e o que muda na tela quando a história vira |
| `diretor-de-som` | `sound.md`, seção "Arco" | o que o som faz pela intenção, e onde ele muda ou se cala |

A linha é hipótese barata, e não marco: nasce com o que já se sabe, muda quando a imagem ou o som real mostram coisa melhor, e ninguém espera por ela. O teste: a linha serviria igual a outro filme? Então ainda não diz nada.

**Viradas.** Os pontos em que o filme muda o que se sabe, se sente ou se espera são as linhas "O que muda" da tabela `## Estrutura` de `script.md`, do `diretor-criativo`. Imagem e som respondem às mesmas viradas, e não cada um às suas: para cada uma, `art.md` ou `score.md` e `sound.md` dizem o que muda ali, ou que nada muda de propósito. A metáfora que a fala usa, a que a imagem desenha e o que o som sugere são a mesma relação. Quando duas direções puxam para lados opostos na mesma virada (a imagem acelera onde a música repousa), as duas resolvem contra a frase de intenção; se as duas soluções fariam filmes diferentes, a escolha é do usuário.

**Donos.** Cada artefato tem um dono, e a mudança num artefato alheio é pedida a ele:

| Artefato | Dono |
|---|---|
| `pauta.md`: briefing, tema ou premissa | `diretor-de-pauta` |
| `research.md`, `script.md`, e em `script.json` a narração, o `holdMs` e as fontes | `diretor-criativo` |
| `shots` de `script.json`, `art.md`, `score.md`, as cenas, a imagem do cartaz ou da thumbnail | `diretor-de-arte` |
| `sound.md`, e em `script.json` os campos `music` e `sfx` | `diretor-de-som` |
| a voz e a trilha geradas, o arquivo de entrega, o acervo e o plano de tempo, dito na conversa | `diretor-producao` |
| `publication.md`: o pacote de cada destino, com o texto, os créditos, os direitos e a checklist | `diretor-publicacao` |

**Handoff.** Passa um artefato, e nunca um aceite. Quem entrega diz na conversa, em poucas linhas:

1. o que está pronto, com o caminho;
2. o que nele é compromisso (decisão do usuário, requisito do briefing) e o que é hipótese;
3. o que ficou aberto, com a gravidade;
4. o que precisa voltar, e para quem.

O pedido de mudança que volta ao dono leva o trecho, o que se perde e a saída que resolveria. Nada disso é gravado em arquivo de estado: o compromisso mora no arquivo do dono, e o resto vale só para a passagem.

**Gravidade.** É a das críticas (`diretor-criativo/revisao/critica.md`, `diretor-de-arte/revisao/critica-quadro.md` e `diretor-de-arte/revisao/critica-movimento.md`, `diretor-de-som/revisao/critica-som.md`), com o mesmo nome em toda direção:

- **Bloqueante**: perde-se o indispensável. Além do que cada crítica lista, é bloqueante o que descumpre um requisito do briefing ou do destino (a duração máxima, o formato pedido, o crédito obrigatório, o direito de uso que não está assegurado), o erro de fato em não ficção e o que quebra uma ferramenta. É resolvido sempre: consertando, simplificando ou cortando o trecho. Prazo nenhum o dispensa.
- **Relevante**: o filme funciona, com perda de força, clareza ou naturalidade. É corrigido enquanto o retorno paga e o plano comporta; o que fica vai dito na entrega.
- **Polimento**: o trecho já funciona. Só com folga.

**Rodadas.** A regra do repositório é a linha de parada do `AGENTS.md`: depois de duas recusas do usuário no mesmo ajuste, a terceira entrega encerra com a ressalva dita. Com prazo no briefing, o limite aperta com o nível de polimento do plano (`etapas/plano.md`), e vale também para as rodadas de crítica dos subagentes:

| Nível do plano | O que cada rodada conserta | Rodadas por ajuste |
|---|---|---|
| essencial | só bloqueante | uma; o que não cedeu é simplificado ou cortado |
| acabado | bloqueante e o relevante que o plano comporta | duas |
| polido | a regra do repositório | a linha de parada |

Atingido o limite, em qualquer nível, diga que a linha chegou, explicite o defeito que resta e proponha ao usuário o encerramento, com a ressalva dita na conversa, como manda o `AGENTS.md`: o ajuste não é encerrado em silêncio.

A ressalva serve à recusa de polimento: o usuário não quer mais uma rodada, e o que resta é relevante ou de polimento. Ela não serve ao bloqueante. Um bloqueante ainda pendente quando o limite chega não vira entrega pronta com ressalva: a entrega sai como **impedida**, com o defeito, o dono, o que o resolveria (trocar o elemento, uma decisão do usuário, uma ferramenta, um corte) e o que falta. Se o bloqueante não cabe no plano, a saída é simplificar ou cortar o trecho, como a tabela diz; declarar o ajuste encerrado não resolve.

A rodada que não resolve defeito nenhum não se repete: troca-se a hipótese ou simplifica-se. O limite mede esforço de polimento, e nunca autoriza entregar com bloqueante.

**Referência de ofício.** A equipe usa Kurzgesagt – In a Nutshell como referência de cinco princípios (decisão do usuário em 2026-10-11), cada um traduzido para a identidade do próprio projeto:

| Princípio | O que se aprende | Dono da tradução |
|---|---|---|
| clareza da ideia | um filme sustenta uma ideia que se diz em uma frase | `diretor-criativo` |
| metáforas visuais | a relação abstrata vira uma imagem que se entende sem legenda | `diretor-de-arte`, com as analogias do `diretor-criativo` |
| unidade artística | elenco, forma e cor parecem de um filme só | `diretor-de-arte` |
| ritmo | a informação chega na medida em que se acompanha, com respiros | as três direções, nas viradas |
| desenho de som | música e efeitos servem à fala e à ação, e o silêncio tem função | `diretor-de-som` |

Aprende-se o método, e não a obra: personagens, traço, paletas, composições, vinheta, temas musicais, timbre e bordões da referência não são reproduzidos, e nenhum arquivo dela é usado. As faixas medidas nela (`pnpm critique`, `pnpm check-script`) são sensores do modo `canal`; fora dele situam, e não reprovam.

## DEPENDÊNCIAS
- `diretor-de-pauta/briefing.md`: fornece o modo, o destino, o prazo e os requisitos que fazem um problema ser bloqueante.

## LIMITES
- Este protocolo não substitui o procedimento de cada direção nem a condução dela com o usuário: diz só o que é comum às seis.
- Quem decide o nível de polimento é o plano; quem decide o que o filme diz é o usuário.
