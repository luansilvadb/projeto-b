## PERGUNTA
Como dividir a cena em planos de modo que a imagem acompanhe a fala?

## RESPOSTA

**Plano.** Uma composição: um enquadramento, um lugar, uma paleta e uma ação principal. Quando qualquer um deles muda, é outro plano. Plano não é corte: a maior parte das trocas de composição é contínua.

**A decupagem está pronta quando** a coluna da encenação, lida de cima a baixo e sem a narração, conta a história. Quatro resultados a sustentam:

- **A imagem responde à fala.** Quando a ideia, a ação ou o foco mudam, o espectador vê mudar: num plano novo ou dentro do mesmo, com cada mudança escrita na encenação. Toda troca de composição tem um motivo na fala.
- **A distância segue o momento.** A escala vem do que o trecho pede (situar, agir, sentir, estranhar), e por isso varia.
- **A entrada diz quanto mudou.** O corte anuncia outro lugar ou outra ideia; dentro da mesma ideia, a imagem muda sem romper.
- **O que volta, volta igual:** mesmo desenho, mesmo lado do quadro, mesma direção do olhar e do movimento.

**O que o repositório exige:**

- **Deixa.** Todo plano, menos o primeiro da cena, começa numa palavra da narração: aquela em que o espectador já precisa estar vendo a imagem nova. A palavra ocorre uma vez só na cena, ou o registro diz qual ocorrência.
- **Registro.** Cada plano leva a deixa, a encenação (quem faz o quê e onde, o que muda lá dentro e o texto de tela), a escala, a paleta (o modo de cor e o matiz do fundo) e a entrada.
- **Escala:** aberto (o lugar inteiro, o assunto pequeno), médio (a figura inteira ou da cintura para cima), close (o rosto, a mão, o objeto) ou detalhe (um olho, uma textura enchendo o quadro).
- **Entrada:** como a imagem anterior vira esta, em texto livre. O costume são quatro nomes: corte (troca seca), câmera (o enquadramento muda dentro do mesmo cenário), transformação (a imagem anterior vira a nova) e varredura (uma borda atravessa o quadro e revela a nova imagem). A passagem que não cabe neles é dita em poucas palavras.

**Sinais de falha.** Cada um é uma pergunta sobre o trecho, e "está certo assim" é resposta válida, com o motivo: o sinal acusa, e quem decide é o que o trecho pede.

- O `pnpm check-script` marca o plano como longo (mais de 8 segundos estimados): a imagem muda lá dentro, e a encenação diz como?
- O plano dura menos de 2 segundos: dá tempo de ler? Reação e impacto dão.
- Uma oração passa sem que nada mude na tela: o que o espectador olha enquanto ela é dita?
- A mesma escala se repete por vários planos, ou o bloco inteiro não chega perto de nada: a distância está seguindo o momento?
- Tudo entra por corte: o bloco se lê como um lugar e uma ideia, ou como uma fila de quadros?

**Medidas da referência** (evidência: situam a decupagem e não reprovam por si). A composição troca cerca de 13 vezes por minuto, uma a cada 4 ou 5 segundos, e o corte seco acontece 5 vezes por minuto; composição parada por mais de 8 segundos é rara. Escalas: aberto 24%, médio 59%, close 14%, detalhe 2%.

**Heurísticas**, para quando o problema delas aparece:

- **Série.** Itens parecidos no mesmo molde de composição, trocando só o assunto e o matiz do fundo: o molde igual deixa a diferença saltar.
- **Lista.** Orações curtas e paralelas cabem num plano só, com cada item entrando na sua palavra.
- **Percurso** (`encenacao`). Registre um plano por estação, todos com a entrada câmera e no mesmo cenário.
- **Espetáculo** (proposta). Um plano que existe para ser olhado: a câmera vai ao lugar de verdade (a superfície, o interior, a paisagem) e fica, com movimento lento e contínuo e sem texto novo, logo depois da explicação que o prepara. No vídeo de onde vem, dura de 6 a 10 segundos e cai na frase mais curta ou na pausa do bloco. O bloco alterna assim o palco em que se compara e mede (`dado`) e o lugar em que se contempla.

## DEPENDÊNCIAS
- encenacao: fornece o que acontece em cada oração.
- cor: fornece os modos e a regra de troca do fundo.
- elenco: fornece quem aparece e como se mantém.

## LIMITES
- A duração real de um plano vem da narração gravada; antes dela, só há a estimativa do `pnpm check-script`.
- A execução do movimento e das entradas não é decidida aqui.
- A narração não é alterada para caber num plano: o pedido volta ao `diretor-criativo`.

## EXEMPLO
> NARRAÇÃO: "Uma água-viva pulsa, de cabeça para baixo. Cinquenta e oito vezes por minuto. Quando a noite chega, ela desacelera. Trinta e nove."
>
> | Deixa | Encenação | Escala | Paleta | Entrada |
> |---|---|---|---|---|
> | (começo) | A lagoa rasa vista de longe, com raízes e luz entrando; a água-viva pousada no fundo, o peixe chegando perto. | aberto | lagoa de dia, ciano | corte |
> | "Cinquenta" | O sino de perto: a cada contração sai um anel na água, e os anéis são contados. Texto: "58 por minuto". | close | lagoa de dia, ciano | câmera |
> | "Quando" | A mesma lagoa escurece da superfície para o fundo; o peixe boceja; os anéis saem mais espaçados. Texto: "39 por minuto". | médio | lagoa de noite, índigo | varredura |
