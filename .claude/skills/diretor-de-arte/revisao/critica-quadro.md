## PERGUNTA
Com que critérios e medidas julgar os quadros?

## RESPOSTA

**Quando aplicar.** Em três momentos: sobre a decupagem, antes de a narração ser gravada (passadas 1 e 2); sobre cada folha de modelo (passada 5); sobre os quadros compostos de todos os planos (todas as passadas e as medidas).

**Postura.** A crítica olha como um espectador que nunca viu o roteiro. Julga a imagem renderizada, aberta e vista, nunca o código nem a intenção. Sobre os quadros compostos, as passadas e as medidas (passos 2 e 3 do procedimento) são de quem não desenhou; renderizar e refazer (passos 1 e 4 a 6), de quem dirige.

**Passadas, nesta ordem.** Um problema de nível superior invalida o polimento dos níveis abaixo.

1. **Encenação**
   - Sem som e sem etiqueta, o plano diz o que a oração afirma?
   - O meio vem do que se afirma: o acontecimento se vê acontecer, e o esquema ou o dado está onde a relação ou a quantidade é o assunto?
   - Os diagramas passam de 37% dos planos, o teto da referência? Confira se o vídeo está explicando por slide.
   - Há uma figura com olhos na parcela de planos que o tema pede?
2. **Decupagem**
   - A imagem responde quando a ideia, a ação ou o foco mudam, e toda troca de composição tem um motivo na fala?
   - A escala serve ao momento, a entrada diz quanto mudou, e o que volta, volta igual?
   - Cada sinal de falha de `planos` que aparece tem resposta no trecho?
3. **Composição**
   - Há um ponto focal, e só um?
   - O assunto tem o tamanho que a escala pede?
   - Em cinza e pequeno, o assunto ainda salta do fundo?
4. **Cor**
   - O plano está no modo certo? Tem de quatro a cinco cores?
   - O fundo troca de matiz entre ideias vizinhas?
   - O escuro tem cor? O maior contraste está no ponto focal?
5. **Desenho**
   - Construção, julgada na silhueta numa cor só, antes de qualquer outro item desta passada: os cinco itens de `forma` estão lá (a pose conta a cena, junção em curva, membro nasce de massa, o que se repete não é cópia, a linha de cima tem acontecimentos)? Silhueta reprovada é bloqueante, e o resto da passada espera por ela.
   - Cada parte tem base, sombra e, onde cabe, brilho?
   - O assunto tem formas na faixa do orçamento?
   - Registro e contenção, julgados num recorte em tamanho real (um quarto do quadro, sem reduzir) de cada personagem e do assunto de cada cenário: o desenho está no registro certo de `forma`? Aponte cada forma que, tirada, não faria falta em nenhum plano em que a peça aparece: leia esses planos no roteiro antes de apontar. Registro trocado é bloqueante; três ou mais formas sobrando é relevante. A folha de quadros reduzidos não mostra nada disso.
   - O personagem bate com a folha de modelo? Confira o estado do plano pelo nome que a ficha dá, item por item ("dormindo em pé: olho fechado, tromba caída, cabeça pendida" são três conferências). A expressão serve ao momento?
6. **Cenário, profundidade e luz**
   - O fundo liso tem degradê, e trama só onde `cenario` a pede? O cenário tem três camadas ou mais?
   - Há sombra de contato no mundo e halo por dentro? A luz vem de um lado só?
   - No que emite luz e por dentro: há centro claro, aros e halo, e a área grande tem superfície viva?
7. **Texto**
   - Um texto novo por vez, cada um preso ao que nomeia?
   - Conte os textos à vista em cada plano. Mais de cinco é relevante.
   - Alguma frase da narração foi parar na tela?
   - Todo plano que afirma um fato vindo de um estudo tem o selo da fonte no canto?
8. **Fidelidade**
   - A imagem afirma algo que a base de fatos não sustenta?
   - Cada número na tela bate com a fonte?

**Medidas.** Tiradas do vídeo renderizado por `pnpm critique` e comparadas com a faixa dos 12 vídeos de referência. As faixas estão num lugar só, `CRITERIA` em `src/critique/reference.ts`, e saem na tabela do comando:

- desde os quadros parados: área do quadro com desenho, cores por quadro, trocas da cor dominante por minuto e peso da família de cor mais comum;
- só depois de animar: tempo com a tela quase parada, tempo com mais de 10% do quadro em movimento e tempo até 40% do quadro ser outro.

As duas medidas do vídeo inteiro (trocas da cor dominante e peso da família mais comum) só fazem sentido sobre um trecho com mais de um lugar. Um trecho que se passa num lugar só sai da faixa nelas sem ter defeito: o gancho de um vídeo, inteiro numa lagoa, ficou em 67% de uma família e caiu a 36% quando entraram o laboratório e a rua. Meça o trecho de teste inteiro, nunca uma cena isolada.

**Medida não é qualidade.** As medidas acusam o vídeo vazio, parado ou de uma cor só. Um vídeo cheio, colorido e mal encenado passa em todas. Por isso as passadas são obrigatórias, e a encenação vem primeiro. E a faixa é o que os vídeos de referência fazem, não uma exigência do projeto: a medida fora dela diz onde olhar. Abra os quadros do trecho e classifique o defeito que se vê, pela passada dele; sem defeito visível, a medida vai ao relatório com o motivo.

**Lado a lado.** Ponha o quadro ao lado de um da referência do mesmo tipo (personagem, dado, cenário) e nomeie três diferenças; os recortes em tamanho real ficam em `out/referencias/0NY2gAftzJE/recortes/` (personagem e mundo) e `out/referencias/hfz4uDuicaQ/recortes/` (o que emite luz), com o vídeo na pasta acima, para tirar outros. A comparação serve para ver o que falta, não para copiar.

**Propostas não reprovam.** O que uma unidade marca como proposta (`SKILL.md`, Base das medidas) ainda não é critério: descumpri-la não é problema, e segui-la mal vai no relatório como observação para o usuário.

**Classificação dos problemas:**

- **Bloqueante**: o plano é um slide; a imagem afirma um fato falso; o personagem está fora do modelo; a silhueta reprova na construção; o registro está trocado. Refazer é obrigatório.
- **Relevante**: composição, cor, profundidade ou excesso de texto enfraquecem a leitura. Refazer, salvo custo desproporcional.
- **Polimento**: ajuste fino de forma, posição ou tom. Aplicar se não mexer em nada aprovado.

**Procedimento:**

1. Renderize um quadro de cada plano e monte todos numa folha, em ordem.
2. Abra a folha e faça as oito passadas. Registre cada problema com plano, critério violado e classificação.
3. Tire as medidas que já valem na etapa.
4. Refaça os bloqueantes e os relevantes que não alteram decisões aprovadas.
5. Leve ao usuário, como decisão, toda mudança em elenco, paleta, analogia ou plano aprovados.
6. Renderize de novo e repita. Se uma rodada não resolver nenhum problema, pare e relate o que ficou em aberto.

**Entrega ao usuário.** A folha de quadros, a tabela de medidas, os problemas que ficaram em aberto e o que só ele pode julgar: gosto, identidade do canal e o que só aparece em movimento.

## DEPENDÊNCIAS
- encenacao, planos, dado: fornecem os critérios das passadas 1 e 2.
- composicao, cor, forma, personagem, cenario, texto: fornecem os critérios das passadas 3 a 7.
- elenco: fornece as folhas de modelo e a parcela de planos com figura que o tema pede.

## LIMITES
- Não julgar por gosto: todo problema aponta um critério violado.
- Não refazer fatos nem narração aqui: a fidelidade só confere a imagem contra a base de fatos.
- Não julgar movimento; as três últimas medidas só valem com o vídeo animado.

## EXEMPLO
> Plano 4, cena "three-signs" — critério: encenação (três etiquetas em fila ao lado de uma silhueta; sem as etiquetas, o plano não diz nada). Classificação: bloqueante. Ação: encenar cada sinal como acontecimento (a lagoa escurece e ela para; algo a cutuca e ela demora a reagir; no dia seguinte ela pulsa devagar); não altera a narração aprovada.
