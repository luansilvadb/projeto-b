## PERGUNTA
Que texto entra na tela, e preso a quê?

## RESPOSTA

**Um texto serve quando:**

- **Ele acrescenta, e a imagem encena.** O texto dá o nome, a precisão, a unidade, a fonte, o escopo ou um som. A ação, a relação e a quantidade continuam desenhadas: o plano que só se entende lendo o que deveria estar acontecendo volta para `encenacao`. Não volta o que é escrito por natureza: um nome, um número exato, uma palavra, uma citação curta.
- **A tela não repete a narração.** Frase da narração, inteira ou resumida, parágrafo e lista de tópicos são legenda do que a imagem deixou de mostrar.
- **Cada texto tem dono à vista.** É inequívoco a que ele se refere, por proximidade, alinhamento, um conector ou por estar escrito na própria coisa. O conector não cria outra leitura nem cobre o que precisa ser visto, como um rosto.
- **O que chega junto se associa sem esforço.** O espectador liga cada informação nova ao seu referente sem ter de escolher entre várias. Duas chegam juntas quando a relação entre elas é o que se quer mostrar; fora isso, cada uma entra na sua palavra.
- **Dá para ler**, no tamanho, no contraste e no tempo em que aparece, numa tela de celular. O fundo sob o texto é estável, e a cor de um texto solto responde ao que está atrás dele: uma cor fixa para o vídeo inteiro some na primeira vez que o fundo troca.
- **O texto não toma o quadro.** É tão curto quanto a função permite e não cobre o ponto focal, a não ser quando ele mesmo é o ponto focal (um número, uma palavra, uma cartela). Se não cabe sem desmontar a composição, é a solução que muda.
- **Nenhum fato nasce numa etiqueta.** Nome, número e fonte batem com a base de fatos, e a fonte e a ressalva de escopo ficam à vista enquanto a afirmação a que pertencem vale.
- **O texto do mundo parece do mundo**: está na placa, na tela ou no rótulo como estaria de verdade, e não esconde ali a explicação que o plano devia mostrar.

**O que o canal e o repositório fixam:**

- **A letra.** Uma família só, com os tamanhos de `src/design/tokens.ts`; o menor deles, o do selo, é o piso de leitura em celular.
- **Mais de cinco textos à vista é sensor de carga, não teto.** Confira simultaneidade, vínculo e legibilidade; agrupe quando isso resolver uma dificuldade real. Cortar informação que muda o que a tela afirma é decisão do usuário.
- **A margem segura** de `composicao`.
- **A tela escreve como se escreve.** O que a narração soletra para a voz vira a grafia de verdade: "dê-ene-á" é "DNA". Nome científico vai em itálico, sob o nome comum.

**Repertório**, pela função que o texto cumpre. São formas que já serviram; outra que cumpra a função também serve:

| Função | Uma forma | Observação |
|---|---|---|
| Nomear | etiqueta: pílula de cor sólida com texto claro, ligada ao objeto por linha fina e ponto, do lado livre do quadro | costuma entrar quando a narração nomeia a coisa pela primeira vez |
| Nomear, sobre fundo liso | **sublinhado** (proposta): o nome em letra clara sobre um sublinhado fino, que dobra e segue até o objeto, com a medida do item embaixo, menor e mais apagada | um vídeo de espaço |
| Quantificar | o valor preso ao que mede por colchete, régua ou seta, ou escrito num objeto da cena | qual número e em que forma é de `dado` |
| Listar | as etiquetas entram uma a uma, cada qual na sua palavra, e se acumulam no quadro | um vídeo sobre gordura, adotado pelo usuário |
| Dar fala ou pensamento | balão sem palavras: rabiscos na língua própria dos personagens (sinais abstratos, que não parecem letra nem número), ou o desenho do que a figura pensa ou quer | decisão do usuário em 2026-10-09: os personagens não conversam, e o balão é raro (`pantomima`); não carrega informação de que o vídeo depende |
| Fazer ouvir | onomatopeia: letras grossas em arco ou inclinadas, de cor quente com contorno, saindo de quem faz o som | só som (riso, mordida, ronco, batida); o mesmo vídeo sobre gordura |
| Pertencer à cena | placa, tela, rótulo, cartaz | pode carregar a piada |
| Orientar | cartela de capítulo, desenhada com elementos do tema; quando o roteiro anuncia um mapa ("pergunta 1 de 3"), traz o número, a pergunta e a marca de progresso | a estrutura vem do roteiro: o texto não a cria |
| Dar fonte, escopo ou data | selo pequeno no canto, com autor e ano, que fica enquanto vale | num trecho que segue no mesmo estudo, um selo que permanece basta |

**Medidas e heurísticas** (evidência e pontos de partida: situam e não reprovam por si). Na referência há texto em 42% dos planos lidos, de 20% a 67% conforme o vídeo; quase sempre é pouco e preso a alguma coisa, e texto solto é quase só a cartela. A etiqueta tem de uma a três palavras, e a onomatopeia uma. A pílula mede de 3% a 5% da altura do quadro. Tempo de leitura, como ponto de partida: um segundo mais um terço de segundo por palavra, mais quando a palavra é rara ou há o que comparar. Proposta, do mesmo vídeo de espaço: teto de 4% da altura para a etiqueta e de 5% para o número em destaque, porque etiqueta maior disputa o quadro com o desenho.

## DEPENDÊNCIAS
- planos: fornece a encenação de cada plano, onde o texto de tela é anotado.
- dado: fornece os números e a forma como são mostrados.
- composicao: fornece o ponto focal, os vazios do quadro e a margem segura.
- ouvinte (skill `diretor-criativo`, `conceito/ouvinte`): fornece o sensor de carga para itens simultâneos.

## LIMITES
- A entrada e a saída do texto em movimento não são decididas aqui.
- O conteúdo factual vem da pesquisa e do roteiro.
- Qual número, com que unidade e em que relação pertence a `dado`.

## EXEMPLO
> Plano: a planta primitiva diante da paisagem.
> Fraco: "As primeiras plantas tinham só 30 centímetros de altura" escrito no alto do quadro.
> Preso: um colchete vermelho sobe do chão até a ponta da planta e termina na etiqueta "0,3 m"; embaixo, uma pílula verde com o nome da planta.
