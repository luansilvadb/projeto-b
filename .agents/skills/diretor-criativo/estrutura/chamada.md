## PERGUNTA
Como fazer o único pedido do vídeo depois que a entrega terminou, sem transformar o fechamento em argumento de venda nem criar uma segunda conclusão?

## RESPOSTA

**Compromisso do canal.** Todo vídeo termina com uma chamada, que pede para curtir e se inscrever (decisão do usuário em 2026-10-04). É o único momento de pedido do vídeo (`ouvinte`): curtir e se inscrever vão juntos, uma vez, no fim. Isso não se pergunta de novo a cada vídeo.

**O que precisa funcionar:**

- **O vídeo já terminou quando o pedido começa.** A chamada não completa a tese, não traz fato novo, não acrescenta moral nem resolve o que o fechamento deixou por resolver: se uma frase dela é indispensável à entrega, é do `fechamento`. E o pedido não atropela a última frase do vídeo.
- **Fica claro de imediato o que se pede**, sem várias instruções, escolhas ou explicação de plataforma. Quem assiste acabou de concluir o vídeo.
- **O pedido não usa o fim do vídeo como alavanca.** "Se isso fez você valorizar a vida, deixe o seu like" transforma o fechamento em venda. Um corte limpo, em que se percebe que o vídeo acabou e agora vem o pedido, respeita mais o fim do que uma ponte forçada.
- **Pede, e não cobra.** Sem culpa ("não custa nada", "se você chegou até aqui"), sem urgência fabricada, sem suspense reaberto sobre um próximo vídeo.
- **É o mesmo narrador** (`voz`), e não um locutor de anúncio. A frase se ouve como as outras (`narracao`).
- **É verdadeira.** O benefício dito é consequência razoável do gesto, e a chamada só promete um próximo vídeo que existe ou está decidido.
- **Dura o que o pedido precisa.** Uma frase pode bastar.

**Estável por escolha.** Aqui a consistência é virtude: a chamada tem função conhecida e secundária, e o objetivo é tirar o pedido do caminho do vídeo. A formulação que funcionou é reusada, e não reinventada a cada roteiro. Ela muda quando o padrão entra de modo abrupto depois deste fim, contraria o tom dele, ou quando há um próximo vídeo decidido a citar.

**Repertório.** Só o pedido é indispensável. O resto fica quando faz trabalho, e o teste de cada um é tirá-lo: se a chamada só ficou mais curta, ele sai.

- **Ponte**: uma primeira oração que parte de onde o vídeo deixou quem assiste e chega ao canal ("Se quiser continuar explorando perguntas assim..."). Serve quando o fim deixa uma curiosidade leve que a comporta.
- **Motivo**: o que o gesto faz, dito com simplicidade (acompanhar os próximos vídeos, ajudar o canal a continuar).
- **Agradecimento**: "obrigado por assistir", quando combina com a voz e não alonga.
- **"Nós"**, quando tem dono claro ("isso ajuda a gente a continuar"). O pedido direto, sem primeira pessoa, vale igual.

Na referência, os dois vídeos de `fechamento` fazem ponte, pedido, motivo e agradecimento, nessa ordem; a chamada deles tem 127 palavras porque também apresenta produtos, e por isso não serve de medida para a do canal.

**No repositório.** A chamada é a última cena do roteiro, e é uma cena própria porque é a cena anterior que leva o silêncio (`holdMs`) que deixa o fim assentar. Esse silêncio é proposto aqui, como hipótese narrativa: o tempo que este fim pede antes do pedido, gravado em `script.json` antes de haver som para ouvir. A skill `diretor-de-som` o confere com o áudio e a mixagem reais (`etapas/som.md`, na pasta dela) e, se a pausa atropela o fim ou sobra, devolve a cena, os milissegundos e o motivo. Quem altera o `holdMs` é sempre esta skill, que também diz não ao pedido que desfaz o sentido do fechamento; o que a música faz dentro da pausa (segue, vai à frente, some) é do som, e ele altera sem passar por aqui. Na tabela de estrutura de `script.md`, por convenção, ela é o último bloco, "(chamada)".

**Quando volta ao usuário** (`entrevista`): quando muda o que se pede (comentar, compartilhar), quantos pedidos há, a intensidade, ou entra apoio financeiro, produto, patrocínio ou a promessa fixa de um próximo vídeo. A redação, a ponte, o motivo, o agradecimento e o tamanho são do agente.

## DEPENDÊNCIAS
- ouvinte: fornece o princípio de um pedido só.
- fechamento: fornece o fim do vídeo, depois do qual a chamada começa.
- voz, narracao: fornecem quem fala e como a frase soa.

## LIMITES
- Botões, setas e animação de inscrição pertencem à skill `diretor-de-arte`.
- Patrocínio, loja e apoio financeiro ficam fora até o usuário decidir que o canal os tem.

## EXEMPLO
> "Se gostou do vídeo, curta e se inscreva para acompanhar os próximos. Obrigado por assistir."
