## PERGUNTA
Como construir qualquer coisa em formas chapadas, em SVG?

## RESPOSTA

**Linguagem de forma.** A identidade do canal, lida em recortes da referência em resolução nativa: as formas se separam por cor e por valor, sem linha de contorno; cantos arredondados e curvas; preenchimento chapado, com o volume vindo de formas empilhadas (a base, uma sombra e, às vezes, um brilho). Degradê fica para fundo, céu, água, chão e brilho de luz.

**O que o projeto já provou.** As quatro regras abaixo vieram de defeito nosso, visto em render e corrigido até o usuário aprovar (o piloto da elefanta, da pessoa e do antílope: seis renders e quatro críticas). Têm mais peso que qualquer coisa lida na referência.

**1. Construção antes do acabamento.** Nenhum acabamento conserta a construção: no piloto, três rodadas de acabamento sobre uma silhueta fraca deram um desenho carregado e ainda fraco. Por isso a silhueta é uma entrega: renderizada numa cor só, na pose que a cena pede, julgada por quem não desenhou, e nada é pintado antes de ela passar. Ela parte de como a coisa é de verdade, pelos traços que a tornam reconhecível, e pintada de uma cor só contra o fundo ainda diz o que é. Numa figura viva, cinco coisas separaram o bicho do boneco de blocos:

- **A pose conta a cena** sem cor nem rosto (`personagem`): quem dorme pende, quem espera apoia o peso num lado. O corpo se inclina inteiro, dos pés à cabeça: o tronco dobrado sobre pernas a prumo lê como coluna quebrada. Uma inclinação mora num lugar só, no desenho ou na cena; nos dois, elas se somam.
- **Junção em curva.** Onde duas partes se encontram (tromba e testa, perna e barriga, pescoço e ombro), o contorno de uma vira o da outra, sem quina e sem uma forma encostada na outra.
- **Membro nasce de uma massa**: a perna de trás sai de uma coxa, a da frente de um ombro. Membro que sai de um ponto é palito espetado.
- **O que se repete não é cópia.** As quatro pernas, os dois braços, as folhas: cada um com largura, ângulo ou curva própria; os do lado de lá aparecem de verdade, deslocados mais de meia largura, ou somem.
- **A linha de cima tem acontecimentos**: sobe, afunda e cai (a testa, a nuca, o ombro, a sela, a garupa). Um arco só é um balão.

**2. Registro: o acabamento vem do que a coisa é.** Trocar um registro pelo outro foi o erro mais caro do piloto: o acabamento de quem emite luz (aro, textura, prega, borda de luz, halo), posto num personagem sem uma luz na cena que o peça, lê como enfeite gerado.

- **Personagem e mundo** (pessoa, bicho, objeto de cena, lugar). A riqueza vem da cor e do desenho da curva: poucas formas, grandes, de superfície lisa, e a cor separando as partes, cada uma numa família saturada. O personagem inteiro numa família só lê como desenho sem tinta. O sol e a lua de um cenário do mundo ficam simples, um disco com um brilho leve: com anéis em volta, foram recusados pelo usuário.
- **Por dentro, e o que emite luz** (célula, tecido, tumor, astro, brasa, o que acende). A riqueza vem da repetição e do brilho: o que emite luz parece fonte de luz, com o centro mais claro que a borda, e o que é muitos se lê de uma vez, como massa, com um diferente dos outros, que é o foco.

**3. Contenção: cada forma tem um motivo.** Vale para os dois registros. Teste, forma a forma, no recorte em tamanho real: tirando esta, o desenho piora, neste plano ou em outro em que a peça aparece? Se não piora em nenhum, ela sai. A marca que parece sobrar num plano pode ser o que o olho segue em outro: confira nos planos do roteiro antes de cortar. Um desenho de doze formas boas parece mais caprichado que um de setenta.

**4. A sombra é uma forma desenhada**: larga onde cobre, zerando onde encontra outra parte, com a borda acompanhando o volume. Faixa de largura constante lê como listra. A cor dela é a de `cor`.

**O que o repositório e o vídeo exigem:**

- **Espessura mínima.** Nenhum traço ou detalhe com menos de 8 pixels num quadro de 1080 de altura: o fino some na compressão do vídeo e lê como rascunho.
- **O que se move nasce separado.** O que vai mexer (olho, braço, sino, porta) é um grupo próprio, com o ponto de giro no lugar da articulação e um parâmetro nomeado para o quanto abre, dobra ou contrai.
- **O mesmo desenho em todo render.** O que se repete por sorteio (manchas, folhas, escamas) usa semente fixa.
- **Brilho sem desfoque.** O halo é um degradê radial: desfoque grande custa caro no render.
- **Silhueta em `path`**, com curvas Bézier: elipse mais retângulos lê como boneco de blocos. O tubo que afina (braço, caule, tentáculo, cauda) sai de `taperPath`, em `src/art/shapes.ts`.
- **Sombra e padrão recortados** na silhueta da parte, com `clipPath`. A silhueta repetida e deslocada não serve de sombra: dá a faixa de largura constante.

**Pronto quando:**

- a silhueta passou sozinha, antes de qualquer pintura;
- renderizado sozinho, no tamanho em que será usado, sobre o fundo claro e sobre o fundo escuro do vídeo, o desenho se lê;
- num recorte de um quarto do quadro em tamanho real, ao lado de um recorte do mesmo registro (`critica-quadro`, Lado a lado), toda forma passa na contenção: o excesso não aparece no quadro reduzido.

**Sinais de desenho fraco**, além dos que as regras já nomeiam: todas as formas do mesmo tamanho; silhueta simétrica e parada; cor única, sem sombra; degradê dentro de objeto que não emite luz; detalhe fino espalhado por igual, sem grupo nem descanso; estrela ou partícula por cima do assunto; o desenho flutuando, sem sombra de contato nem halo.

**Orçamento de formas** (sensor). Ordem de grandeza, por contagem aproximada em recortes da referência: um rosto de perto tem cerca de 15 formas; uma pessoa inteira, 35; um pássaro de apoio, 12.

| Papel no plano | Formas na referência |
|---|---|
| Assunto do plano | 12 a 40 |
| Objeto ou figura de apoio | 8 a 20 |
| Figurante e fundo | 3 a 8 |

Bem abaixo, confira se o desenho virou ícone; acima, confira no recorte se o detalhe compete com a leitura, que é o lado para o qual o projeto mais errou. Quem decide é a contenção, não a contagem. A unidade repetida e o espalhamento contam como uma forma só, lida de uma vez.

**Técnicas e evidência**, para quando o problema delas aparece. São possibilidades, com a origem de cada uma:

| Problema | Uma saída | De onde vem |
|---|---|---|
| O corpo não tem hierarquia | de duas a cinco massas em curvas contínuas, de proporção desigual: uma grande, uma média, uma pequena | referência |
| A figura pequena some | membro de 16 a 24 pixels num quadro de 1080, com ponta redonda | piloto |
| O assunto não prende o olho | um acento: um detalhe pequeno de matiz oposto (o brinco, a unha, o olho) perto do ponto focal | referência |
| Quantas cores no personagem | de quatro a seis famílias no assunto | referência |
| Padrão e detalhe | poucos, grandes e agrupados, em três ou quatro tons vizinhos, perto do ponto focal | referência |
| Brilho feito de chapado | degraus aninhados: a forma clara dentro de um ou dois aros da mesma forma, cada um mais largo e um tom mais perto do fundo. O aro é a mesma forma desenhada de novo por baixo, com traço grosso e junção redonda | um vídeo de espaço, adotado pelo usuário |
| Luz como material, no astro que é o assunto do plano | o crescente de luz na borda, o halo saturado em volta e, no plano de espetáculo, raios largos atrás | o mesmo vídeo |
| Superfície viva, numa área grande por dentro ou que emite luz | um espalhamento em três tons vizinhos (anéis, manchas, pontilhado, bolhas que passam da borda), em três tamanhos, mais denso perto da borda, com zonas de descanso | o mesmo vídeo |
| Unidade repetida (a célula, a escama, o grão) | poucas formas cada, com variação pequena de tamanho, giro e tom, organizadas em grupos (uma grande cercada de menores) | um vídeo com gente e tumor: cada célula são quatro formas aninhadas, e cem delas enchem o quadro |
| Quanto desenhar num rosto | de perto, umas quinze formas, sem borda de luz, mancha, prega nem aro; figurante, dez e nenhum rosto | o mesmo vídeo |

## DEPENDÊNCIAS
- cor: fornece as cores de cada modo e a cor da sombra; nenhum desenho inventa cor.

## LIMITES
- Rosto, expressão e pose pertencem a `personagem`; fundo, profundidade, o lado da luz e a sombra de contato, a `cenario`; onde cabe partícula, a `pausa-viva`.

## EXEMPLO
> Elefanta de perfil.
> Fraco: uma elipse, um círculo, quatro retângulos e um traço para a tromba.
> Carregado: a mesma silhueta, com aro, textura na pele, borda de luz e halo. Foi o piloto antes da correção.
> Construído: a testa em domo, a sela e a garupa na linha de cima; a tromba fundida à testa; as pernas saindo de uma coxa e de um ombro, as do lado de lá deslocadas; a orelha como forma própria, em outra família de cor; uma sombra desenhada por parte.
