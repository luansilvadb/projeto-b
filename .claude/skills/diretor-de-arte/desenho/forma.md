## PERGUNTA
Como construir qualquer coisa em formas chapadas, em SVG?

## RESPOSTA

**Linguagem de forma.** Lida em recortes da referência em resolução nativa:

- **Sem linha de contorno.** As formas se separam por cor e por valor.
- **Cantos arredondados e curvas.** Quase nada é reta com quina viva.
- **Preenchimento chapado.** O volume vem de empilhar formas, não de degradê: tom base, uma forma de sombra e, às vezes, uma de brilho. Degradê fica para fundo, céu, água, chão e brilho de luz.
- **Padrão interno em poucos tons**: manchas, listras e dobras em três ou quatro tons vizinhos, agrupados.
- **Borda de luz**: uma faixa clara no lado da silhueta voltado para a luz.
- **Luz como material.** O assunto do plano está sempre sob luz que se vê. O que emite (astro, lâmpada, tela, brasa, o que acende por dentro) leva quatro camadas: centro mais claro que a borda, em degradê radial dentro da silhueta; crescente de luz na borda; halo saturado em volta; raios largos e translúcidos atrás. O que não emite recebe a luz de quem emite: uma faixa da cor do vizinho no lado voltado para ele, e a sombra projetada no chão ou no fundo.
- **Superfície viva.** A área grande de um assunto (o disco de um astro, o dorso de um bicho, a copa, a água) é coberta por um espalhamento de formas pequenas em três tons vizinhos: anéis concêntricos, manchas, pontilhado, bolhas que ultrapassam a borda da silhueta. De 40 a 150 formas, em três tamanhos, mais densas perto da borda e do ponto focal, com zonas de descanso entre os grupos.

**Acabamento.** O que separa o desenho polido do desenho correto, lido em recortes 1:1 de um vídeo de referência ao lado dos nossos:

- **Degraus aninhados.** Toda forma clara ou importante vem dentro de um ou dois aros da mesma forma, cada um mais largo e um tom mais perto do fundo: a mancha amarela tem aro laranja, que tem aro vermelho. É o brilho feito de chapado, e vale para mancha, faixa, olho de tempestade, nuvem e chama.
- **Sombra troca de matiz.** O lado de sombra de uma parte é outra cor, vizinha no círculo: lavanda com sombra violeta, amarelo com sombra laranja, branco com sombra azulada. Um assunto tem de quatro a seis matizes; o tom base só escurecido, ou o cinza, lê como desenho sem tinta.
- **Volume por cima do padrão.** Duas formas grandes cobrem o corpo inteiro, recortadas na silhueta: um disco claro e translúcido, com metade do tamanho do corpo, deslocado para o lado da luz, e um crescente escuro no lado oposto. O padrão continua visível por baixo das duas.
- **Borda com caráter.** O limite entre duas cores ondula, engrossa e afina, e solta satélites: uma gota ao lado da faixa, um ponto ao lado da mancha. Duas formas que se encontram (perna e barriga, pescoço e tronco) se fundem em curva.
- **Peso.** O traço é gordo e de ponta redonda: membro de figura pequena, de 16 a 24 pixels num quadro de 1080; detalhe (bigode, capim, pálpebra fechada, chifre), de 8 para cima.
- **Apoio acabado.** Objeto de cena e peça de esquema também levam dois tons e um filete de luz na aresta voltada para a fonte: a tecla tem a lateral mais escura, o cubo tem três faces e o filete no topo.
- **Limpeza.** Partícula, estrela e poeira ficam atrás do assunto, nunca sobre ele.

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

Abaixo da faixa, o desenho parece ícone. Acima, o detalhe compete com a leitura. O espalhamento da superfície viva conta como uma forma só: é textura, lida de uma vez.

**Técnicas em SVG:**

- **Silhueta orgânica**: `path` com curvas Bézier. Elipse mais retângulos lê como boneco de blocos.
- **Tubo que afina** (braço, caule, tentáculo, raiz, cauda): uma forma fechada ao longo de uma curva, com a largura diminuindo da base à ponta. Uma função gera todos.
- **Recorte**: `clipPath` com a silhueta mantém padrão, sombra e brilho dentro do corpo.
- **Sombra e borda de luz**: a própria silhueta repetida, deslocada alguns pixels e recortada, em outra cor.
- **Repetição com sorteio fixo**: manchas, folhas, escamas e cachos saem de um laço com sorteio de semente fixa, para o desenho ser o mesmo em todo render. Organize em grupos legíveis (um grande cercado de menores), não em distribuição uniforme.
- **Brilho de luz**: núcleo quase branco e halo em degradê radial, que sai sem desfoque. Desfoque grande custa caro no render.
- **Aro**: a mesma forma desenhada de novo por baixo, mais larga (traço grosso da cor do aro, com junção redonda), uma vez por degrau.
- **Espessura mínima**: nenhum traço ou detalhe com menos de 8 pixels num quadro de 1080 de altura; o fino some na compressão do vídeo e lê como rascunho.

**Desenhe pensando em mover.** O que vai mexer (olho, braço, sino, porta) é um grupo separado, com o ponto de giro no lugar da articulação e um parâmetro nomeado para o quanto abre, dobra ou contrai. Nada que precise se mover fica fundido numa forma só.

**Erros que denunciam desenho fraco:**

- silhueta de primitivas duras, simétrica e parada;
- todas as formas do mesmo tamanho;
- cor única, sem sombra nem brilho; sombra que é só o tom base mais escuro;
- forma clara sem aro; borda reta e lisa entre duas cores; quina onde duas partes se encontram;
- traço fino; partícula por cima do assunto;
- preto ou branco transparente no lugar de sombra e luz;
- degradê dentro de objeto que não emite luz;
- detalhe fino e espalhado por igual, sem grupo nem descanso;
- assunto de superfície lisa, numa cena sem fonte de luz à vista;
- o desenho flutuando, sem sombra de contato nem halo.

**Procedimento:**

1. Levante na pesquisa como a coisa é de verdade e escolha os três traços que a tornam reconhecível.
2. Desenhe a silhueta e aplique o teste.
3. Construa na ordem do método.
4. Renderize o desenho sozinho, no tamanho em que será usado, sobre o fundo claro e sobre o fundo escuro do vídeo.
5. Abra a imagem e compare com o orçamento e com a lista de erros. Depois recorte um quarto do quadro em tamanho real (960 por 540, sem reduzir), ponha ao lado de um recorte de `out/referencias/hfz4uDuicaQ/recortes/` e confira o acabamento item a item: o polimento não aparece no quadro reduzido.
6. Corrija e renderize de novo. O julgamento é sempre da imagem, nunca do código.
7. Guarde o desenho como peça reutilizável, com os parâmetros do que se move.

## DEPENDÊNCIAS
- cor: fornece as cores de cada modo; nenhum desenho inventa cor.

## LIMITES
- Rosto, expressão e pose pertencem a `personagem`; fundo e profundidade, a `cenario`.

## EXEMPLO
> Elefante de perfil.
> Fraco: uma elipse, um círculo, quatro retângulos e um traço para a tromba. Sete formas, uma cor.
> Construído: silhueta em curva única, com a corcova do dorso e a testa alta; orelha grande como forma própria, um tom acima; tromba em tubo que afina, com dobras na base; pernas em tubo, as de trás mais escuras; sombra sob a barriga e atrás da orelha; brilho no dorso; olho pequeno com pálpebra; unhas claras; sombra de contato. Cerca de 35 formas, quatro tons de uma cor e um acento.
