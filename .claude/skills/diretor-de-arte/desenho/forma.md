---
name: forma
description: Define a linguagem de forma do estilo e o método para construir qualquer desenho em SVG, da silhueta ao detalhe.
---

## PERGUNTA
Como construir qualquer coisa em formas chapadas, em SVG?

## RESPOSTA

**Linguagem de forma.** Lida em recortes da referência em resolução nativa:

- **Sem linha de contorno.** As formas se separam por cor e por valor.
- **Cantos arredondados e curvas.** Quase nada é reta com quina viva.
- **Preenchimento chapado.** O volume vem de empilhar formas, não de degradê: tom base, uma forma de sombra e, às vezes, uma de brilho. Degradê fica para fundo, céu, água, chão e brilho de luz.
- **Padrão interno em poucos tons**: manchas, listras e dobras em três ou quatro tons vizinhos, agrupados.
- **Borda de luz**: uma faixa clara no lado da silhueta voltado para a luz.

**Método, da silhueta ao detalhe:**

1. **Silhueta.** A forma inteira, numa cor só, precisa ser reconhecida. Teste: pinte tudo de uma cor contra o fundo. Ainda se sabe o que é? Se não, o problema está aqui, e detalhe nenhum resolve.
2. **Formas grandes.** De duas a cinco massas que compõem o corpo, em curvas contínuas e proporção desigual (uma grande, uma média, uma pequena).
3. **Formas médias.** As partes e as divisões de cor.
4. **Sombra.** Uma forma por parte, no lado oposto à luz, na cor de sombra que `cor` define para o tom base.
5. **Brilho.** Uma forma pequena no lado da luz: faixa, arco ou ponto.
6. **Padrão e detalhe.** Poucos, grandes e agrupados, concentrados perto do ponto focal. Detalhe espalhado por igual vira confete.
7. **Sombra de contato.** Uma elipse escura e macia onde o objeto toca o chão.

A luz vem de cima e de um lado, o mesmo lado para tudo o que está no plano.

**Orçamento de formas.** Ordem de grandeza, por contagem aproximada em recortes da referência (um peixe protagonista tem cerca de 60 formas; uma pessoa, 35; um pássaro de apoio, 13):

| Papel no plano | Formas |
|---|---|
| Assunto do plano | 30 a 80 |
| Objeto ou figura de apoio | 8 a 20 |
| Figurante e fundo | 3 a 8 |

Abaixo da faixa, o desenho parece ícone. Acima, o detalhe compete com a leitura.

**Técnicas em SVG:**

- **Silhueta orgânica**: `path` com curvas Bézier. Elipse mais retângulos lê como boneco de blocos.
- **Tubo que afina** (braço, caule, tentáculo, raiz, cauda): uma forma fechada ao longo de uma curva, com a largura diminuindo da base à ponta. Uma função gera todos.
- **Recorte**: `clipPath` com a silhueta mantém padrão, sombra e brilho dentro do corpo.
- **Sombra e borda de luz**: a própria silhueta repetida, deslocada alguns pixels e recortada, em outra cor.
- **Repetição com sorteio fixo**: manchas, folhas, escamas e cachos saem de um laço com sorteio de semente fixa, para o desenho ser o mesmo em todo render. Organize em grupos legíveis (um grande cercado de menores), não em distribuição uniforme.
- **Brilho de luz**: núcleo quase branco e halo em degradê radial. Desfoque grande custa caro no render.
- **Espessura mínima**: nenhum traço ou detalhe com menos de 4 pixels num quadro de 1080 de altura; some na compressão do vídeo.

**Desenhe pensando em mover.** O que vai mexer (olho, braço, sino, porta) é um grupo separado, com o ponto de giro no lugar da articulação e um parâmetro nomeado para o quanto abre, dobra ou contrai. Nada que precise se mover fica fundido numa forma só.

**Erros que denunciam desenho fraco:**

- silhueta de primitivas duras, simétrica e parada;
- todas as formas do mesmo tamanho;
- cor única, sem sombra nem brilho;
- preto ou branco transparente no lugar de sombra e luz;
- degradê dentro do objeto;
- detalhe fino e espalhado;
- o desenho flutuando, sem sombra de contato nem halo.

**Procedimento:**

1. Levante na pesquisa como a coisa é de verdade e escolha os três traços que a tornam reconhecível.
2. Desenhe a silhueta e aplique o teste.
3. Construa na ordem do método.
4. Renderize o desenho sozinho, no tamanho em que será usado, sobre o fundo claro e sobre o fundo escuro do vídeo.
5. Abra a imagem e compare com o orçamento, com a lista de erros e, se houver, com um quadro de referência do mesmo tipo.
6. Corrija e renderize de novo. O julgamento é sempre da imagem, nunca do código.
7. Guarde o desenho como peça reutilizável, com os parâmetros do que se move.

## DEPENDÊNCIAS
- cor: fornece as cores de cada modo; nenhum desenho inventa cor.

## LIMITES
- Rosto, expressão e pose pertencem a `personagem`; fundo e profundidade, a `cenario`.
- Nenhum desenho da referência é copiado; o que se usa é o método.

## EXEMPLO
> Elefante de perfil.
> Fraco: uma elipse, um círculo, quatro retângulos e um traço para a tromba. Sete formas, uma cor.
> Construído: silhueta em curva única, com a corcova do dorso e a testa alta; orelha grande como forma própria, um tom acima; tromba em tubo que afina, com dobras na base; pernas em tubo, as de trás mais escuras; sombra sob a barriga e atrás da orelha; brilho no dorso; olho pequeno com pálpebra; unhas claras; sombra de contato. Cerca de 35 formas, quatro tons de uma cor e um acento.
