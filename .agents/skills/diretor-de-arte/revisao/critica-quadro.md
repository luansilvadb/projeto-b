## PERGUNTA
Como achar o defeito visual que explica por que um quadro não funciona, e com que evidência confirmá-lo?

## RESPOSTA

**Princípio.** A crítica olha como um espectador que nunca viu o roteiro, e julga a imagem renderizada, aberta e vista, nunca o código nem a intenção. Procura o defeito mais simples que explica o que não funcionou, na ordem percepção, hipótese, evidência: primeiro algo não se entende ou parece errado, depois se nomeia o que o espectador perdeu, e só então se busca a menor evidência que confirma. Instrumento nenhum é usado para provar que tudo foi conferido.

**O que a crítica garante:**

- **O defeito é nomeado antes de qualquer conserto.** "O olho vai ao cronômetro e não ao bicho", e não "aumente o bicho". A saída é da unidade dona.
- **"Sem defeito" é uma conclusão.** Muitos diagramas num vídeo de relações abstratas que se entende, um personagem de poucas formas que se lê, um quadro vazio em que o vazio serve, um plano sem profundidade que não depende dela, uma medida fora da faixa num trecho que funciona: nenhum defeito, com o motivo em uma linha. Técnica ausente, contagem, faixa e diferença em relação à referência não são defeito por si; defeito é o que o espectador entende errado, deixa de entender ou não reconhece.
- **A leitura principal vem antes do detalhe.** Não se afina a sombra de um plano que não encena a ideia, a cor de um quadro em que o assunto não se acha, nem a textura de uma figura que não se reconhece. Um dado errado não é salvo por uma composição bonita.
- **Julga-se na menor superfície que revela o defeito**: a construção, no recorte; a composição, no quadro; a continuidade de um personagem, em dois ou mais quadros; a repetição, a variedade e a distribuição de cor, na folha do trecho.
- **A evidência responde a uma dúvida.** Recorte, folha, silhueta, comparação e medida são feitos quando há o que perguntar a eles.
- **A correção se confirma no defeito.** Ela está certa quando o quadro novo resolve o que a motivou, sem estragar o que está em volta.
- **A crítica para quando não resta defeito que justifique outra mudança.**
- **Proposta não reprova.** Uma regra marcada como proposta é hipótese em teste: descumpri-la não é defeito, e segui-la mal vai ao relatório como observação para o usuário.

**Instrumentos**, do que manda ao que só explica:

1. **O quadro renderizado**, no tamanho em que será visto, é a evidência principal. O que funciona nele não reprova porque um instrumento parece estranho.
2. **A folha de quadros** do trecho, em ordem, mostra o que só existe entre quadros: repetição, variedade de escala, continuidade, distribuição de cor. Reduzida, ela não mostra construção, registro nem excesso de detalhe.
3. **O recorte em tamanho real** (um quarto do quadro, sem reduzir) mostra a construção, o registro e a contenção de `forma`. **A silhueta numa cor só** mostra se a construção e a pose se sustentam sem a tinta.
4. **O teste do selo** de `composicao` acusa hierarquia fraca; confere-se no quadro antes de apontar.
5. **A ficha e a folha de modelo** (`art.md`) tiram a dúvida de continuidade: é o mesmo personagem, no estado certo? Aprendido no piloto: quando a dúvida é o estado, ele se confere pelo nome que a ficha dá, item por item ("dormindo em pé: olho fechado, tromba caída, cabeça pendida" são três conferências).
6. **O lado a lado com a referência** torna nomeável uma diferença que se sente e não se sabe dizer (por que a figura parece plana, por que o que acende não lê como luz). Os recortes em tamanho real ficam em `out/referencias/0NY2gAftzJE/recortes/` (personagem e mundo) e `out/referencias/hfz4uDuicaQ/recortes/` (o que emite luz), com o vídeo na pasta acima, para tirar outros. Serve para ver o que falta, não para copiar: ser diferente da referência não é defeito.
7. **As medidas** do `pnpm critique` localizam o que está espalhado pelo trecho.
8. **O código**, por último, e só para achar a causa técnica de um defeito já visto.

Sem imagem ainda, na decupagem, a evidência é a coluna da encenação, lida de cima a baixo sem a narração; valem as lentes de encenação e de decupagem.

**Lentes.** Cada uma serve a um tipo de sinal, com as perguntas e a unidade dona do critério. Usa-se a do defeito percebido: um quadro não passa por todas.

- **Encenação** (`encenacao`, `dado`, `elenco`), quando a imagem parece não carregar a afirmação. Sem som e sem etiqueta, o plano diz o que a oração afirma? O acontecimento se vê acontecer, e o esquema ou o dado está onde a relação ou a quantidade é o assunto? O rosto afirma só a intenção e a emoção que a base de fatos sustenta, e há alguém onde a explicação depende de alguém viver ou reagir? Sensor: na referência o diagrama vai até 37% dos planos de um vídeo; acima disso, vale conferir se a explicação foi terceirizada a esquemas parados onde o conteúdo pedia acontecimento.
- **Decupagem** (`planos`), quando o plano responde à ideia errada ou a troca de imagem parece sem motivo. A imagem responde quando a ideia, a ação ou o foco mudam? A escala serve ao momento, a entrada diz quanto mudou, e o que volta, volta igual? Os sinais de falha de `planos` dizem onde olhar, e "está certo assim" responde a eles.
- **Composição** (`composicao`), quando o olho não sabe onde pousar ou a relação no espaço fica ambígua. O olho acha o que importa de primeira, e sabe para onde ir depois? O tamanho do assunto serve ao plano, e o vazio tem função? Alguma sobreposição cria outra coisa? O plano se sustenta antes de as coisas entrarem?
- **Cor** (`cor`), quando a figura se perde no fundo ou a cor diz a coisa errada. O assunto se separa do fundo, as superfícies vizinhas se separam entre si, e o maior contraste está no ponto focal? O modo é o do lugar ou do sentido do plano, e a cor que significa algo continua significando? Sombra e luz têm cor?
- **Desenho** (`forma`, `personagem`), quando a figura não se reconhece, parece montada, plana, carregada ou de outra matéria. A construção diz o que a coisa é, e a pose conta a cena? Parece de blocos, repetitiva ou sem volume? Os quatro itens de construção de `forma` explicam por quê, e a falta de um deles, sozinha, não é defeito. O acabamento é o do registro da coisa? Alguma forma, tirada, não faria falta? O orçamento de formas é sensor: diz onde conferir se virou ícone ou se o detalhe compete, e não reprova pela contagem. Quem volta é o mesmo, no estado certo, e a expressão se lê no tamanho em que aparece? Aprendido no piloto: a marca que parece sobrar num plano pode ser o que o olho segue em outro, e por isso se leem no roteiro os planos em que a peça aparece antes de apontar forma sobrando.
- **Lugar e luz** (`cenario`), quando o plano parece sem lugar, o assunto disputa com o fundo ou as coisas flutuam. O plano tem o lugar de que precisa, e o assunto continua a coisa mais fácil de achar? Onde o plano depende de profundidade, ela se lê? A luz é coerente, e o que está no lugar está assentado nele? Cada coisa do ambiente tem um serviço, e o lugar que volta é o mesmo?
- **Texto** (`texto`), quando a leitura, o vínculo ou a função de um texto falham. Cada texto tem função e dono à vista, e o que chega junto se associa sem esforço? Dá para ler no tamanho e no tempo em que aparece, sem cobrir o que precisa ser visto? A tela repete a narração, ou carrega sozinha o que devia estar encenado? Mais de cinco textos à vista passa do limite que o canal fixou (`texto`, vindo de `ouvinte`): vai ao relatório com esse dono, e a gravidade vem do que se perde na leitura, não da contagem.
- **Fidelidade** (a base de fatos, `dado`), quando a imagem pode estar afirmando algo falso. Ela afirma o que a base de fatos não sustenta? Cada número na tela bate com a fonte? A proporção desenhada é a real, e quem é comparado está na mesma régua? Simplificar e estilizar não é mentir: é defeito quando muda a afirmação.

**Gravidade**, pelo que o espectador perde:

- **Bloqueante**: o quadro diz algo errado, ou deixa de dizer o que precisava. O fato falso, o plano que só se entende lendo, o sujeito que não se reconhece, a relação central que não se vê, o olho levado à coisa errada, o número preso ao objeto errado.
- **Relevante**: a ideia se entende, mas a clareza, a hierarquia, a identidade, a matéria ou a legibilidade ficam enfraquecidas.
- **Polimento**: o quadro já funciona; é ajuste fino.

A mesma falha muda de gravidade conforme a perda. A silhueta que não deixa reconhecer um personagem novo nem a ação dele é defeito de construção, e costuma bloquear, porque nenhum acabamento a conserta (`forma`). O acabamento de quem emite luz num personagem bloqueia quando muda o que ele parece ser, e é relevante quando só o deixa genérico.

**Medidas.** As faixas vêm de 12 vídeos do Kurzgesagt (março de 2025 a setembro de 2026; 123 minutos). A leitura cobriu 332 planos, três quadros por plano, e subconta composições. `CRITERIA` em `src/critique/reference.ts` é a fonte das faixas; o comando imprime:

- desde os quadros parados: área do quadro com desenho, cores por quadro, trocas da cor dominante por minuto e peso da família de cor mais comum;
- só depois de animar: tempo com a tela quase parada, tempo com mais de 10% do quadro em movimento e tempo até 40% do quadro ser outro.

**Medida não é qualidade.** Ela diz onde olhar, e não se o vídeo passou: a faixa é o que os vídeos de referência fazem, não uma exigência do projeto. As medidas acusam o vídeo vazio, parado ou de uma cor só; um vídeo cheio, colorido e mal encenado passa em todas, e por isso o quadro precisa ser visto e o defeito confirmado nele. A coleta é barata e pode ser de rotina; interpreta-se o que saiu da faixa, o que ajuda a localizar um defeito e o que mudou em relação a uma medida anterior do mesmo vídeo. Fora da faixa, abrem-se os quadros do trecho: havendo defeito, ele é nomeado pela lente dele; não havendo, a medida vai ao relatório com o motivo.

As duas medidas do vídeo inteiro (trocas da cor dominante e peso da família mais comum) só fazem sentido sobre um trecho com mais de um lugar. Um trecho que se passa num lugar só sai da faixa nelas sem ter defeito: o gancho de um vídeo, inteiro numa lagoa, ficou em 67% de uma família e caiu a 36% quando entraram o laboratório e a rua. Mede-se o trecho inteiro, nunca uma cena isolada.

**O relatório** tem o tamanho do diagnóstico. Sem defeito, uma linha por trecho julgado, com o motivo onde algo poderia parecer defeito. Cada defeito leva o plano, o que o espectador perde, a evidência mínima que o mostra, a unidade dona e a gravidade, e diz quando o conserto mexeria numa decisão material já tomada pelo usuário. Folha, medida e comparação acompanham só o problema que elas localizaram. O que ninguém além do usuário julga (gosto, identidade do canal) vai dito como tal.

## DEPENDÊNCIAS
- encenacao, planos, dado: fornecem os critérios das lentes de encenação e de decupagem.
- composicao, cor, forma, personagem, cenario, texto: fornecem os critérios das lentes de imagem.
- elenco: fornece a ficha de cada personagem e o critério do rosto.

## LIMITES
- Não julgar por gosto: todo defeito diz o que o espectador perde e aponta a unidade dona.
- Não refazer fatos nem narração aqui: a fidelidade só confere a imagem contra a base de fatos.
- O que só existe no tempo pertence a `critica-movimento`; as três últimas medidas só valem com o vídeo animado.
- O que refazer, o que levar ao usuário e quando renderizar de novo pertencem às etapas (`etapas/decupagem`, `etapas/animatic`) e a `entrevista-imagem`.

## EXEMPLO
> Plano 4, cena "three-signs". O que se perde: sem as três etiquetas em fila ao lado da silhueta, o plano não diz nada; os sinais são lidos, e não vistos. Evidência: o quadro com as etiquetas cobertas. Dono: `encenacao`. Gravidade: bloqueante. Não mexe numa decisão material do texto.
> Trecho do gancho, inteiro na lagoa. O peso da família de cor mais comum sai da faixa, em 67%. Nos quadros, a água-viva e o peixe se soltam do fundo e o olho os acha de primeira: o trecho tem um lugar só. Sem defeito.
