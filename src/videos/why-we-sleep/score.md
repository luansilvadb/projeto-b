# Partitura da animação — Algum animal conseguiu parar de dormir?

O que cada plano faz em movimento: o que entra, muda ou sai, em que palavra e por quanto tempo. É o que o usuário aprova, o que o `motion-designer` recebe e o que o `critico-de-movimento` confere. A composição de cada plano é a do animatic aprovado em 2026-10-04; aqui só entra o movimento.

## Como ler

- Uma seção por cena (o `id` do roteiro), um item por plano, com a escala, a entrada e a duração medidas na narração gravada.
- Os tempos são em segundos a partir do começo do plano. A palavra entre aspas é a deixa; o movimento começa 4 quadros antes dela. O começo de cada plano já antecipa a própria deixa.
- "Vivo" é a pausa viva: o que se mexe quando nada acontece. "Som" marca uma ação que pode soar; o que soa de fato está em `sound.md`.
- Durações da unidade `tempo/sincronia`: entrada de elemento, 0,3 s; ação de personagem, 0,6 a 1,2 s; mudança de cenário, 0,8 a 1,5 s; varredura, 0,25 s. Nos últimos 0,5 s de um plano nada entra.

## Andamento

Contido. A voz é de quem conta com calma, a 158 palavras por minuto, e o vídeo fala de sono: as entradas assentam sem quicar forte, a câmera se move com peso (`ramp`), e o que dorme respira devagar. A energia sobe em três trechos e só neles: o predador da savana, o disco dos ratos e a moeda de Gardner.

## Palco contínuo

Decisão do usuário para o vídeo inteiro: entre dois planos não há transição de quadro. O fundo do plano novo toma a cor dele sobre o anterior, o que está solto encolhe no próprio ponto antes da troca e entra crescendo, e o cenário que os dois planos dividem não sai da tela. É o que `joined` e `sets` fazem em `index.tsx`.

- **Dividem o palco com o anterior** todos os planos, menos: o primeiro do vídeo; `five-parts` 1, que sai da vinheta; e os planos que continuam o anterior no mesmo enquadramento ou que já fazem a própria transformação por dentro (`but-what` 2, `stockroom` 2, `stockroom-night` 1, `forced-awake` 2, `sleep-less` 1).
- **Cenários que permanecem** (`sets`): a savana (`night-falls` 1 a 3, `last-to-know`, `skip-a-night` 1 e 2, `sleep-debt` 1; `elephants` 1 a 4, `two-hours` 1 e 2, `elephant-verdict` 1 e 2); a lagoa (`jellyfish` 1 e 2, `jellyfish-night` 1 e 2); o laboratório do tanque (`jellyfish-night` 3, `jellyfish-platform` 1 e 2, `jellyfish-debt` 2 e 3, `older-than-brain` 1); a sala do quadro-negro (`forced-awake` 2 a 4); a parede do laboratório do exame (`unknown-cause` 1 e 2); o fundo do mar da linha do tempo (`older-than-brain` 2); a bancada dos ratos (`rats-disc` 1 a 3, `rats-result` 1 a 3); o quarto de Gardner (`awake-record` 2 a 4, `gardner-hours` 1); a rua da loja (`but-what` 2 e 3); a loja por dentro (`stockroom` 3, `stockroom-night` 1 e 3); a fila dos ícones em fundo lilás (`debt-returns` 2, `sleep-less` 1; `maybe-brain` 1 e 2; `so-far` 1 a 5).
- **Varreduras: não há mais** (decisão do usuário em 2026-10-07, na revisão de todas as trocas). `two-hours` 1, `elephant-awake` 1, `jellyfish-night` 1, `skip-a-night` 2, `night-falls` 2, `elephants` 4 e `jellyfish-debt` 3 mudam a luz no lugar e o enquadramento pela câmera.

## Decisões do piloto

O gancho e o capítulo 1 foram animados primeiro, criticados duas vezes e aceitos pelo usuário em 2026-10-05. O que ficou decidido ali vale para o vídeo inteiro e ganha da letra de cada plano abaixo:

1. **Pausa viva em todo plano.** Nenhum trecho tem dois quadros iguais: quem está de pé respira e pisca, quem dorme tem o flanco ou o cobertor subindo e descendo, a fila de ícones pulsa em fases, o papel balança, a luz e o capim se mexem.
2. **Deriva lenta de câmera nos planos de fundo liso**, de 3% a 6% ao longo do plano, terminando no quadro composto.
3. **Nenhuma troca deixa a tela vazia.** O que os dois planos têm em comum fica e se transforma, e o elenco do plano novo já está no lugar na primeira palavra dele.
4. **Nada troca de estado num quadro**: expressão, pose e forma passam por um estado intermediário.
5. **Ninguém desliza rígido**: quem anda alterna os membros e sobe e desce a cada passo (`stride` na pessoa, `gait` e `pace` no antílope).
6. **A última mudança de um plano assenta 0,5 s antes da troca.**
7. **Entradas com forma**: nada que tem forma entra só por opacidade.
8. **Um corte de verdade** entre `last-to-know` e `skip-a-night` 1: a vigília abre com o bicho já em pé.
9. **A onomatopeia estoura e sai em cerca de 0,5 s** ("PLOFT", "SNIP", "PSSST", "TRIIIM").
10. **Tela dividida**: os dois lados existem desde a divisão, apagados, e cada um acende na sua palavra.
11. **Cinco câmeras com motivo**, uma por plano: `night-falls` 1 (acompanha o bicho que entra), `time-to-fix` 2 (segue a ponta da linha do tempo), `third-of-life` 1 (aproxima no espanto), `debt-test` 1 (recua quando a prancheta cresce), `debt-returns` 2 (aproxima da régua em "Falta"). Nos outros capítulos, cada plano sem câmera que tenha uma ação a seguir ganha a dele.
12. **A medida "mais de 10% do quadro em movimento"** ficou em 18% no piloto, contra a faixa de 29% a 51%: aceita pelo usuário como preço do andamento contido. A tela quase parada ficou em 7%, dentro da faixa.

Desvios da letra aceitos no piloto: o bicho entra pela direita em `night-falls` 1, em 2,2 s; `sleep-debt` 1 não tem câmera fechando; a poda de `time-to-fix` 1 termina por cima do começo da linha do tempo; `biggest-mistake` 3 para 4 é uma troca com o quadro-negro grande entrando pela direita, e não um recuo; "dorme mais tempo" é o sol andando no céu; a vinheta sai por uma janela redonda que encolhe até o centro.

## Revisão das passagens da abertura — 2026-10-06

Pedido do usuário: animar as trocas, principalmente o começo, que está seco em relação ao restante. Ajuste das duas primeiras passagens: pessoa → savana na deixa “Durante” (3,0 s), e savana → pesquisador no início de `biggest-mistake` (10,27 s). Cada passagem dura 0,8 s, começando 0,4 s antes da deixa e assentando 0,4 s depois. O quadro anterior sobe e o seguinte vem de baixo, com a mesma curva de peso e a borda compartilhada; cenário e elenco permanecem inteiros durante a viagem. A entrada do pesquisador continua o primeiro quadro desenhado no fim da savana. Isso substitui a subida calculada pelas medidas da savana antiga e impede a duplicação da pessoa e a faixa preta na saída do cenário. Enquadramentos finais, deixas e narração preservados. Prévia de revisão em `out/transicoes/abertura-depois.mp4`; aceite deste ajuste ainda pendente.

**Recusada em 2026-10-07.** O usuário viu a passagem pessoa → savana no vídeo e a apontou como "sem motion graphics": dois quadros inteiros empurrados, com a borda reta entre eles. As duas trocas voltaram ao palco comum do vídeo (`OpeningPassage` saiu do código): o que está solto encolhe no ponto, o céu da savana toma a cor no lugar e as camadas dela sobem. A causa da faixa preta que a passagem contornava era o céu do cenário em camadas, que descia junto com as camadas e acabava no horizonte; agora ele é fundo (não desce) e vai até a base do quadro, e isso vale para toda entrada e saída da savana (`night-falls` 1, `sleep-debt` 2, `elephants` 1, `elephant-awake` 2, `elephant-verdict` 1 e 3).

## Revisão de todas as trocas de plano — 2026-10-07

Pedido do usuário, depois de recusar a passagem da abertura: rever as 118 trocas. Três leituras do `critico-de-movimento` (evidências em `out/rascunho/trocas/`) acharam 75 que cumprem o palco único. Decisões do usuário diante do resultado, que valem acima das entradas de cada plano abaixo:

- **Varreduras: saem todas.** Nenhuma troca usa mais a borda reta que cobre o quadro (`Sweep`, `wipe`). Onde a luz muda no mesmo lugar (a noite que cai, o dia que nasce), ela muda no lugar, de forma contínua, com o cenário no palco; onde o enquadramento muda, é a câmera que vai de um ao outro. Vale para `night-falls` 2, `skip-a-night` 2, `elephants` 4, `two-hours` 1, `elephant-awake` 1, `jellyfish-night` 1 e `jellyfish-debt` 3.
- **Círculos: só a lente do sonho fica** (`stockroom-night` 2 e 3), porque é um objeto da cena. O ícone da porta que cresce em `but-what` 2 e o cérebro que abre em `stockroom` 2 passam ao palco comum.
- **`rats-result`: a câmera recua em vez de deslizar de lado.** Os dois ratos ficam no lugar, o disco encolhe sob eles e o terceiro cresce ao lado; depois os três viram parte da fila.
- **Alcance:** consertar tudo o que a revisão apontou, com o polimento.

O que não é decisão, e sim a regra já aceita sendo cumprida: o que é comum a dois planos fica na tela (a água-viva, o tanque, a bancada, a parede do laboratório, os ratos, a dupla de 1924, os três da loja); um cenário entra e sai em camadas, e não como uma chapa que incha; nenhuma troca deixa a tela vazia nem mostra o mesmo elenco duas vezes.

## Som

A música, os níveis, os silêncios e os efeitos saíram desta partitura em 2026-10-05 e ficam em `sound.md`, da skill `diretor-de-som`. As linhas "Som:" de cada plano, abaixo, são as marcas da época em que a animação foi escrita: valem como registro do que acontece na imagem, e quem decide o que soa é o mapa de som.

## third-of-life

- **Plano 1, médio, corte (3,0 s).** 0,0: a pessoa já está de pé, e a barra da vida se desenha da esquerda para a direita atrás dela (0,7 s). 1,3 "terço": o terço do fim escurece (0,7 s); 1,6: a etiqueta "um terço" estoura e a pessoa se espanta. Saída: a pessoa encolhe no ponto de 0,5 a 0,2 s antes da troca, e a barra depois dela, terminando 0,1 s depois da troca, quando a lua da savana já aponta embaixo. Vivo: ela respira e pisca. Som: nenhum.
- **Plano 2, médio, palco comum (6,0 s).** 0,0: o céu da noite toma a cor sobre o pêssego e a savana sobe em camadas (0,9 s), com o bicho de pé em cima do chão; a câmera fecha 6% sobre o mesmo ponto enquanto ela assenta (1,0 s), sem se deslocar. 0,4: com o chão no lugar, o bicho dobra as pernas e deita (0,7 s); 0,8: a cabeça pende e o olho fecha (0,7 s): em 1,5 ele dorme sob a árvore. 2,2 "comer": o ícone da comida acende e é riscado (0,3 s cada). 3,1 "reproduzir": o do par. 4,6 "defesa": o do olho, riscado em 5,1. Vivo: o bicho ressona, o capim balança, a lua tem halo. Aproximação lenta de 4%. Som: nenhum.

## biggest-mistake

- **Plano 1, médio, palco comum (4,2 s).** 0,0: a savana desce em camadas, o fundo do laboratório toma a cor sobre o céu dela, o calendário cresce do prego, inteiro, com os anos na folha (0,4 s), e Rechtschaffen cresce de baixo logo depois (de 0,1 a 0,5 s), de frente. Na saída o calendário encolhe para o prego, também inteiro. 0,8 "Réctchafen": a etiqueta de nome estoura, com a linha. 2,7 "quarenta": as folhas do calendário viram em cascata (10, 20, 30, 40) e param em "44" em 3,3 "quatro" (0,8 s no total). Vivo: ele respira e pisca. Som: nenhum.
- **Plano 2, aberto, câmera (3,6 s).** 0,0: a câmera recua até o corredor (0,8 s). 0,1 "Universidade": a placa da porta estoura. 0,9 "Chicago": ele anda até a porta (1,0 s) e a abre em 2,0 "resumia" (0,6 s). Som: nenhum.
- **Plano 3, close, corte (4,3 s).** 0,1 "se": ele se vira para o quadro e ergue o braço (0,6 s); as aspas se abrem (0,3 s). 0,5 "sono": as linhas de giz se escrevem, uma por oração, até 3,0 "vital". Saída: 0,7 s antes da troca a frase é apagada, e some de vez de 0,5 a 0,2 s antes dela; ele sai do palco encolhendo no próprio ponto, de 0,6 a 0,3 s antes da troca. Vivo: o braço oscila de leve. Som: nenhum.
- **Plano 4, aberto, transformação (2,8 s).** O quadro-negro das aspas é o mesmo deste plano: vazio, cresce e vai para o meio, de onde estava (0,6 s, começando 0,4 s antes da troca e assentando em 0,2), sem um segundo quadro entrar pela direita; a árvore da vida cresce do tronco para os ramos (0,7 s) e os bichos fecham os olhos em cascata. 0,5 "erro": o carimbo recua (0,3 s) e bate em 1,0 "evolução", com um tremor do quadro. Som: o carimbo em 1,0.

## time-to-fix

- **Plano 1, médio, corte (2,5 s).** 0,0: a árvore da vida no fundo lilás. 0,6 "evolução": a tesoura entra pela esquerda (0,5 s) e abre. 1,9 "corrigir": fecha de uma vez, o galho do chifre cai (queda, 0,4 s) e "SNIP" estoura. Som: o corte em 1,9.
- **Plano 2, aberto, corte (5,1 s).** 0,0: o fundo do mar em índigo. 0,6 "sono": o marco da lua acende no começo e a linha do tempo se desenha dali para a direita (1,5 s, com peso). 3,1 "quinhentos": o colchete abre do marco ao fim e a etiqueta estoura (0,3 s). Vivo: a luz tremula na água, o capim balança, plâncton deriva. Saída: o recife, a areia e o capim descem para baixo do quadro como um cenário em camadas (0,8 s, terminando 0,1 s depois da troca), e a água fica; a linha encolhe no ponto e termina 0,1 s depois da troca. Som: nenhum.
- **Plano 3, aberto, palco comum (3,5 s).** 0,0: o fundo menta toma a cor sobre a água já sem recife, e o pedestal, o globo e a lupa crescem, nessa ordem. 0,1 "Bastava": o globo gira devagar e a lupa passeia sobre ele (velocidade constante). 0,9 "animal": o foco de luz acende sobre o pedestal (0,8 s) e a placa "acordado 24 h" estoura em 1,9 "viver". Vivo: o contorno tracejado pulsa. Som: nenhum.

## the-question

- **Plano 1, close, câmera (10,4 s, com 6 s de silêncio).** 0,0: a câmera chega ao pedestal (0,8 s) e a lupa vem do globo e para sobre o contorno (0,9 s). 1,4 "algum": a interrogação estoura dentro da lente. 3,2 "dormir": a lupa inclina, como quem insiste (0,5 s). 4,4: a fala acaba, e a vinheta do canal abre num círculo sobre o pedestal. Som: o da vinheta, na etapa de trilha.

## five-parts

- **Plano 1, aberto, corte (2,5 s).** 0,0: a vinheta sai e o fundo lilás fica. 0,6 "resposta": os cinco ícones entram apagados, em fila, da esquerda para a direita (0,12 s entre eles). Som: nenhum.
- **Plano 2, médio, câmera (3,3 s).** 0,0: a câmera chega ao primeiro ícone (0,6 s). 0,1 "Primeiro": os olhos no capim acendem (0,3 s) e piscam uma vez em 1,6 "perigoso". Vivo: o capim do ícone balança. Som: nenhum.
- **Plano 3, médio, câmera (2,6 s).** 0,0: a câmera desliza aos três do meio (0,6 s). 0,1 "três": acendem um a um (0,3 s entre eles), cada um com a pílula: a barra da régua encolhe, o contorno do cérebro treme, o despertador chacoalha. Som: nenhum.
- **Plano 4, aberto, câmera (3,3 s).** 0,0: a câmera recua até a fila inteira (0,7 s). 0,1 "fim": a porta da loja acende. 1,0 "sabe": a interrogação estoura sobre ela. Vivo: os cinco pulsam em fases diferentes. Som: nenhum.

## night-falls

- **Plano 1, aberto, corte (4,2 s).** 0,0: a savana ao entardecer. 1,5 "bicho": o bicho entra pela direita andando até a árvore (2,2 s). Vivo: o capim e a copa balançam, o sol desce devagar. Som: nenhum.
- **Plano 2, médio, câmera (1,6 s).** 0,0: a noite cai no lugar, com a savana no palco: a luz vai do entardecer à noite de forma contínua (0,9 s, com peso), e o céu, o chão, o capim e o bicho escurecem juntos; o sol dá lugar à lua por opacidade. Ao mesmo tempo a câmera chega ao bicho (0,7 s). Sem varredura (revisão das trocas, 2026-10-07). 0,4 "deita": ele dobra as pernas e se deita (0,6 s). 0,8 "fecha": a pálpebra desce (0,3 s); de 1,0 ao fim do plano ele solta um suspiro. Som: nenhum.
- **Plano 3, close, câmera (2,7 s, com 1,5 s de silêncio).** 0,0 "dorme": a câmera fecha no bicho (0,8 s). 0,5: "zzz" sobe em três tempos (0,25 s entre eles). 1,5, já no silêncio: o capim atrás dele se abre e fecha (0,6 s), e ele continua igual. Nos últimos 0,7 s o "zzz" encolhe no ponto. Vivo: o flanco sobe e desce. Som: nenhum.

## last-to-know

- **Plano 1, close, câmera (4,0 s).** 0,0: a câmera desliza do bicho para a moita (0,6 s). 0,7 "predador": dois olhos acendem no escuro (0,25 s). 1,1 "chegar": a sombra avança devagar, a velocidade constante, até o fim do plano. 2,4 "demora": uma orelha do bicho se mexe, e mais nada. Som: os olhos em 0,7.

## skip-a-night

- **Plano 1, médio, corte (4,6 s).** 0,0: o bicho em pé, de olhos arregalados, virado para a moita. 1,6 "pular": a lua sobe pelo céu até o meio (2,5 s, constante). 2,8 "acordado": ele vira a cabeça de um lado para o outro, duas vezes (0,5 s cada). Vivo: as orelhas giram. Som: nenhum.
- **Plano 2, médio, mesma câmera (4,6 s).** 0,0: amanhece no lugar, com a savana no palco: a luz vai da noite ao sol baixo da manhã de forma contínua (1,0 s, com peso), e o céu, o chão, o capim e o bicho clareiam juntos; a lua dá lugar ao sol por opacidade. Sem varredura (revisão das trocas, 2026-10-07). 0,1 "Só": a cabeça dele cai aos poucos (1,2 s) e os joelhos cedem. 0,9 "cobra": a conta "sono devido" desliza para dentro e as linhas se escrevem uma a uma até 3,4 "dívida". 3,6: a cabeça dá um tranco para cima e volta a cair. Som: nenhum.

## sleep-debt

- **Plano 1, close, câmera (6,5 s).** 0,0: a câmera fecha no bicho e na conta (0,7 s). 1,5 "sono": ele oscila (aviso, 0,3 s) e desaba em 1,7 "dorme", com "PLOFT" e poeira; o carimbo "cobrado" bate na conta 0,3 s depois. 3,5 "dorme": o flanco passa a subir e descer mais devagar e mais fundo. 5,0 "acorda": uma orelha treme e para. Som: a queda e o carimbo em 1,7.
- **Plano 2, médio, corte (6,6 s).** -0,1 a 0,3: a pessoa e a mesa do café entram crescendo do próprio ponto, só no fim da descida da savana (a árvore, os morros e o bicho já saíram do quadro; até lá quem segura a tela é a conta); ela fica sentada, sonolenta, com o vapor subindo. 0,0: a conta carimbada, que já estava na tela ao lado do bicho, vai para o lado da mesa num movimento só (0,9 s, com peso), sem sair do quadro: sobe um pouco, encolhe no alto do arco, passa por cima da cabeça dela e pousa à direita, onde `debt-test` a recebe. 3,6 "pesa": a cabeça vai caindo (1,0 s) e encosta na mesa em 4,7; a xícara treme. Vivo: o vapor, a respiração lenta. Som: nenhum.

## debt-test

- **Plano 1, close, corte (4,7 s).** 0,0: a conta carimbada vem do lado da mesa para o centro (0,6 s). 1,7 "cobrança": ela ganha a prancheta e o quadrado de marcar (0,6 s), e a câmera recua. 3,0 "testes": o braço de jaleco entra por baixo com a caneta (0,6 s) e sai antes da troca. Som: nenhum.
- **Plano 2, médio, câmera (5,9 s, com 1 s de silêncio).** 0,0 "bicho": a câmera recua e a tela se divide (0,6 s); 0,5: acende o lado do bicho dormindo, com a conta (1,0 s). 1,8 "sinal": o visto se desenha (0,3 s). 2,8 "dormindo": o outro lado acende (1,0 s): o bicho só parado, de olho aberto, que sacode a orelha, e o contorno vazio da conta, que pulsa uma vez. Nos últimos 0,5 s a metade lilás sai por onde entrou e o bicho encolhe; a ficha fica. Vivo: um ressona, o outro pisca. Som: nenhum.

## debt-returns

A fala só apresenta o primeiro jeito; quem fecha o assunto da cobrança é o gesto do bolso, e quem mostra a posição é a fila.

- **Plano 1, close, câmera (1,3 s).** 0,0: a ficha vem do canto dela no plano anterior e volta a ser só a conta: a prancheta, o prendedor e a linha do quadrado encolhem, opacos, para trás do papel (0,3 s), enquanto a conta cresce até o lugar dela (0,3 s) e o bolso surge ao lado. 0,3: ela dobra em dois tempos (0,3 s) e vai para a boca do bolso (0,3 s, com peso); em 1,0 está guardada, com a ponta de fora, e o bolso dá uma batida pequena. 1,1: o bolso parte para o canto e a fila dos ícones começa a entrar em cascata no lugar dele; os dois terminam no plano seguinte. Os tempos deste plano são quadros fixos da cena, e não deixas. Som: a conta no bolso em 1,0.
- **Plano 2, médio, palco comum (2,3 s).** 0,0 "escapar": o fundo lilás toma a cor; o bolso chega ao canto e a fila termina de entrar (até 0,3). 0,3: os olhos no capim ganham o visto (0,3 s). 0,6 "dormir": a régua, "1", acende (0,3 s) e cresce até 1,3 (0,5 s), e a câmera aproxima dela (0,8 s, assentando em 1,4). Vivo: a fila pulsa e o bolso balança, sossegando nos últimos 0,8 s. Som: nenhum.

## sleep-less

- **Plano 1, médio, transformação (1,2 s).** 0,0: a régua do ícone sai da fila, que encolhe e some com o bolso (0,5 s), e sobe para cima da pessoa, que entra crescendo na cama (até 0,55). 0,3: o disco do ícone se recolhe (0,3 s). 0,4: a régua se estica até virar a régua de 24 horas (0,7 s), com as marcas entrando da esquerda para a direita; "0" e "24 h" estouram nas pontas em 0,8 e 0,9. Vivo: o cobertor sobe e desce. Som: nenhum.
- **Plano 2, médio, câmera (4,6 s).** 0,0 "oito": a cama cresce e a régua sobe (0,6 s), e a barra dela se enche até as oito horas (0,6 s, em cascata). 0,7: "8 h" estoura na ponta. 1,7 "tem": o lugar vago, mais curto, se desenha em tracejado por baixo (0,5 s). Nos últimos 0,5 s a savana de `elephants` sobe por baixo e o que está solto encolhe. Som: nenhum.

## elephants

- **Plano 1, aberto, corte (6,0 s).** 0,0: a savana de dia. 0,6 "dois": as duas manadas entram, uma de cada lado, andando (até o fim do plano). 3,4 "elefantas": as duas da frente levantam a tromba, uma depois da outra. Vivo: orelhas abanam, poeira nos pés. Som: nenhum.
- **Plano 2, close, câmera (2,8 s).** 0,0: a câmera chega às duas (0,7 s). 0,1 "matriarca": param frente a frente e encostam as trombas (0,8 s). Vivo: piscam, as orelhas abanam. Som: nenhum.
- **Plano 3, médio, câmera (4,2 s).** 0,0: a câmera recua (0,6 s). 0,1 "mediram": a tromba de uma delas se mexe sem parar, e uma linha fina sai dela e desenha o registro. 2,5 "trinta": o calendário de 35 dias estoura no canto e se preenche (1,2 s, em cascata), com o sol e a lua passando: dia, noite, dia e noite, a velocidade constante, freando nos últimos 0,8 s. O plano termina de noite (desde 3,2 s), com a lua onde o plano 4 a tem: a luz não muda na troca. Nos últimos 0,3 s o registro e o calendário encolhem no ponto. Som: nenhum.
- **Plano 4, close, câmera (4,7 s).** Sem varredura (revisão das trocas, 2026-10-07): já é noite desde o fim do plano 3. 0,0: a câmera fecha na tromba (0,7 s), e a outra manada recua para fora do quadro. 0,1 "Tromba": a tromba desacelera e para (0,8 s). 1,1 "cinco": o cronômetro estoura ao lado e corre até "5 min" (1,5 s). 3,5 "sono": a pálpebra desce. Nos últimos 0,4 s o cronômetro encolhe no ponto. Som: nenhum.

## two-hours

- **Plano 1, médio, câmera (6,3 s).** Sem varredura (revisão das trocas, 2026-10-07): é a mesma savana, de noite, e a mesma elefanta do close da tromba, virada para a direita como lá. 0,0: a câmera recua da tromba até ela inteira (0,8 s, com peso); ela vai do lugar e do tamanho que tinha na manada aos deste plano junto com a câmera, e a lua anda um pouco para a direita. 0,5: a régua de 24 horas entra por cima dela (0,5 s), depois a nossa barra e o lugar vago (até 1,5 s). 2,2 "duas": a barra dela entra no lugar vago e para em "2 h" (0,5 s); a etiqueta estoura em 2,5. 3,8 "menores": a barra pisca uma vez. Vivo: ela respira, a tromba pende, a lua tem halo. Som: nenhum.
- **Plano 2, close, câmera (3,4 s).** 0,0: a câmera fecha nas duas barras (0,6 s). 0,7 "dorme": a barra dela se copia uma, duas, três vezes ao longo da barra "8 h" (0,25 s entre as cópias). 1,2 "quarto": a etiqueta "um quarto" estoura. Nos últimos 0,3 s as barras, a régua e as etiquetas encolhem no ponto. Som: nenhum.

## elephant-awake

- **Plano 1, aberto, câmera (5,0 s).** Sem varredura (revisão das trocas, 2026-10-07): é a mesma savana e a mesma elefanta que dormia em pé. 0,0: a noite vira dia no lugar (0,7 s): a lua acaba de se pôr à direita, o céu passa pelo amanhecer e o sol nasce à esquerda. Ao mesmo tempo a câmera vai do enquadramento de perto ao aberto (0,7 s, com peso), a elefanta vai do lugar e do tamanho antigos aos novos e abre os olhos (0,1 a 0,4 s). 0,5: ela começa a andar, para a direita (a direção do tempo na faixa e a da pessoa do plano 2), e a câmera a acompanha. O sol e a lua passam duas vezes pelo céu, constantes, até o fim do plano; a faixa de dois dias entra em 0,7 s e se enche junto. 2,1 "quarenta": a etiqueta "46 h acordada" estoura, presa à faixa. Saída (segunda rodada da revisão): em −1,0 s a etiqueta e em −0,97 s a faixa de dois dias encolhem no ponto (0,3 s); de −0,87 s em diante a savana desce com a elefanta, devagar e acelerando, e a segunda noite acaba: a lua se põe e o céu vai ao amanhecer (de −0,73 s a +0,07 s). A faixa de três dias só cresce em −0,37 s, com a elefanta já abaixo do lugar dela, e a cama em −0,27 s: nunca há duas faixas na tela, e o pêssego do plano 2 toma a cor sobre o céu quente. Som: nenhum.
- **Plano 2, médio, corte (5,8 s).** 0,0: a faixa de três dias. 0,3 "você": a pessoa entra andando pela esquerda. 1,9 "segunda": a etiqueta estoura quando ela passa; "terça" em 3,2; "quarta" em 4,7. Ela vai curvando e arrastando os pés a cada dia; em 4,1 "madrugada" chega à cama e deita (0,7 s). A linha coral do tempo acordada cresce atrás dela. Saída (segunda rodada da revisão): as etiquetas encolhem de −0,6 s a −0,33 s, a faixa e a cama de −0,4 s a −0,2 s; a savana de `elephant-verdict` só começa a subir em −0,33 s, no entardecer. Som: nenhum.

## elephant-verdict

- **Plano 1, médio, corte (4,0 s).** 0,0: as duas elefantas, pequenas, de noite, andando para a direita (a da frente é a que para ao lado do pedestal no plano 2). A savana entra no entardecer e anoitece no lugar (de −0,33 s a 0,67 s): o céu quente toma a cor sobre o pêssego, escurece, e a lua nasce à esquerda e sobe até o lugar dela. 0,8 "duas": a etiqueta "só duas" estoura. 1,9 "pouco": sobre elas, a ponta da barra "2 h" fica tracejada e a interrogação estoura, balançando. Nos últimos 0,67 s a savana desce com a de trás; a da frente não desce: freia (0,53 s) e vai do lugar e do tamanho que tem na savana aos do plano 2, à esquerda do pedestal (0,6 s, com peso), ainda com a pintura de noite. Som: nenhum.
- **Plano 2, aberto, palco (5,0 s, com 1 s de silêncio).** 0,0: a elefanta já está no lugar, acordada, e clareia junto com o menta, que toma a cor sobre o céu da noite (0,87 s). 0,1: o pedestal "acordado 24 h" cresce do chão ao lado dela (0,47 s). 1,2 "nem": a tromba cai (0,8 s). 1,9 "conseguiu": o olho fecha e a cabeça pende (0,4 s): ela adormece aqui, onde a fala a nomeia. 2,4 "parar": o foco de luz pisca duas vezes sobre o contorno vazio (0,53 s). De 2,9 a 4,4: ela dorme, parada (a fala acaba em 3,4). Nos últimos 0,67 s ela e o pedestal encolhem no ponto, nesta ordem, e nos últimos 0,3 s a fila de `maybe-brain` já entra por baixo. Vivo: ela respira, a orelha mexe, o tracejado do pedestal gira. Som: nenhum.

## maybe-brain

A fala abre no jeito novo, sem dizer que o anterior acabou: quem diz é o X na fila.

- **Plano 1, médio, corte (1,3 s).** 0,0: a fila dos ícones, que vinha entrando em cascata desde 0,3 s antes, com a régua "1" acesa; o lilás toma a cor sobre o menta (0,87 s). 0,5 (no começo de "segundo", com a fila assentada desde 0,27): a régua ganha o X e apaga (0,3 s). 0,77 (dentro de "segundo"): o contorno do cérebro, "2", acende (0,3 s) e cresce até o fim do plano (0,5 s). Som: nenhum.
- **Plano 2, close, transformação (1,7 s).** 0,07 "viver": o contorno sai da fila e cresce até encher o quadro (0,9 s, com peso), e a fila encolhe atrás dele. Vivo: o tracejado gira devagar. Som: nenhum.
- **Plano 3, médio, corte (5,0 s).** 0,0 "elefanta": ela entra e o disco pousa na cabeça dela, onde o cérebro acende (0,4 s). 0,8 "você": a pessoa entra e o dela acende. 2,0 "pode": a placa "culpado?" desce entre os dois, balança e para (0,8 s). 3,6 "necessidade": os dois olham para a placa. Nos últimos 0,3 s, com a pessoa acabando de encolher, a pesquisadora do plano 4 já cresce no ponto dela. Som: nenhum.
- **Plano 4, médio, palco (2,6 s).** 0,0: a pesquisadora, que já vinha crescendo desde 0,3 s antes, assenta (0,1 s), e o laboratório sobe atrás dela. 0,27 "Parece": ela aponta o contorno vazio (0,4 s). 1,0 "foi": ajeita a rede de pesca no ombro (0,5 s). Vivo: bolhas no tanque vazio. Som: nenhum.

## jellyfish

- **Plano 1, aberto, corte (7,1 s).** 0,0: a lagoa de dia. 0,27 "Pesquisadores": a água-viva começa a nadar de fora do quadro, pela esquerda, de cabeça para cima, pulsando; aponta na borda perto de 1,0. 2,6 "água": ela vira (0,8 s) e pousa na areia em 3,6 "Cassiopéia", com uma nuvem de areia. 4,7 "Ela": o peixe entra pela direita e freia ao vê-la (0,9 s). Vivo: feixes de luz, capim, plâncton. Som: nenhum.
- **Plano 2, médio, câmera (4,4 s).** 0,0: a câmera chega a ela (0,8 s). 0,1 "pousada": a etiqueta "Cassiopea" estoura, com a linha. 2,9 "pulsando": o sino contrai e um anel sai a cada pulso, a 58 por minuto, até o fim. Vivo: o olho do peixe acompanha um anel. Som: nenhum.
- **Plano 3, close, transformação (4,7 s).** 0,0: a câmera atravessa o sino e o fundo passa ao índigo de "por dentro" (0,6 s). 0,1 "cérebro": o contorno tracejado se desenha no meio (0,6 s) e fica vazio. 1,9 "rede": os neurônios acendem em pontos, do centro para as bordas (1,2 s). Nos últimos 0,33 s o contorno encolhe no próprio ponto: é o que está solto, e a cena seguinte recua daqui. Vivo: os pontos piscam fora de fase. Som: nenhum.

## jellyfish-night

- **Plano 1, médio, câmera (2,6 s).** 0,0: a câmera recua de dentro do sino até o plano médio da lagoa (0,67 s, com peso), e o índigo de "por dentro" abre para a noite dela, com a rede apagando e os cachos acesos em ciano: é o caminho do plano 3 de `jellyfish` ao contrário, sem varredura, e a água-viva não sai da tela. 1,2 "pulsa": o ritmo cai para 39 por minuto, os anéis se espaçam e os braços caem (0,9 s). 1,8 "devagar": o peixe boceja. Som: nenhum.
- **Plano 2, close, câmera (3,8 s).** 0,0 "Mas": a câmera fecha nela (0,7 s). 0,8 "prova": a interrogação estoura, presa a ela, e balança. 2,3: o peixe chega perto, olha, e em 2,9 se afasta. Som: nenhum.
- **Plano 3, aberto, câmera (4,6 s).** 0,0: a câmera acaba de recuar dela até o plano médio do laboratório (o recuo dura 0,87 s e termina em 0,33), o tanque fecha em volta dela, que passa às cores do tanque, e a parede toma a cor sobre a água da lagoa; a água-viva não sai da tela. 1,8 "pesquisadores": a pesquisadora ergue a prancheta (0,5 s). 3,1 "dois": as duas linhas em branco se escrevem, uma depois da outra (0,3 s entre elas). Vivo: bolhas no tanque, a lua na janela. Som: nenhum.

## jellyfish-platform

- **Plano 1, médio, câmera (5,0 s).** 0,0: a câmera chega ao tanque (0,7 s). 0,5 "primeiro": a luva desce e segura a ponta da plataforma (0,6 s). 1,0: aviso, a plataforma recua um pouco (0,3 s). 1,3 "tiraram": é puxada de uma vez para fora (0,4 s). 2,0 "repente": ela fica solta, sobe um pouco e inclina (1,0 s). Som: o puxão em 1,3.
- **Plano 2, close, câmera (5,2 s).** 0,0: a câmera fecha nela (0,6 s); o cronômetro estoura e começa a contar. 1,4 "boiando": ela deriva e gira de leve, sem pulsar. 2,3 "cinco": o cronômetro chega a "5 s" em 3,2. 3,7 "acordar": os braços abrem de uma vez (0,3 s); 4,2 "virar": ela se vira e nada para o fundo (0,8 s). Nos últimos 0,1 s, quando a borda do tanque que desce já passou pelo lugar dela, a cama do plano 3 começa a crescer no ponto dela: a troca não deixa a parede vazia, e a pessoa não aparece dentro da água. Som: nenhum.
- **Plano 3, médio, palco (5,2 s).** 0,0: a cama com a pessoa dormindo, que começou a crescer 0,1 s antes, assenta (0,3 s); o bolso, cheio, entra num canto e a prancheta no outro. 0,1 "demora": "lenta para reagir" ganha o visto. 2,8 "quando": o braço entra e sacode o ombro dela, três vezes. 3,5 "chama": só no terceiro ela abre os olhos a meio (0,5 s). No último 0,07 s, com a cama já quase toda encolhida para o meio dela, o tanque de `jellyfish-debt` nasce no ponto dele, sem cruzar com ela. Som: nenhum.

## jellyfish-debt

- **Plano 1, close, palco (2,5 s).** 0,0: o tanque, que nasceu 0,07 s antes no ponto dele, à direita, acaba de crescer (0,33 s); o bolso fica no canto. 0,5 "segundo": a conta sai do bolso, voa e se abre ao lado do tanque (0,7 s, com peso); o carimbo "cobrado" lê-se de 1,0 a 2,2. 1,2: as linhas acendem uma a uma, depressa (0,1 s entre elas, até 1,7). 1,6 "cobrança": o carimbo pisca duas vezes (0,57 s). É a imagem que lembra a regra que a fala deixou de dizer. Som: nenhum.
- **Plano 2, médio, palco (6,3 s).** 0,0: o tanque do plano 1 fica na tela e vai até o lugar dele na bancada (0,67 s, com peso); só a conta e o bolso encolhem, e a bancada e a janela sobem em volta dele enquanto o escuro índigo toma o quadro, o tanque aceso (0,87 s). Ela vai deixando os braços cair. 1,6 "soltaram": o primeiro jato entra pela esquerda, com "PSSST" (0,3 s), e ela se ergue e sacode. 3,1 "tanque": segundo jato, quando os braços voltam a cair; 4,5 "água": terceiro. Som: os jatos em 1,6, 3,1 e 4,5.
- **Plano 3, médio, luz (4,4 s).** 0,0: o dia nasce no lugar, sem varredura (0,87 s, com peso): o escuro abre, o céu da janela clareia, a lua desce para fora do vidro e o sol sobe; a geometria não se mexe. 0,33: a pesquisadora cresce no ponto dela, com a prancheta (0,37 s). 1,2 "hora": ela tenta pulsar no ritmo de dia, e o ritmo cai. 3,0 "ela": os braços caem (0,8 s). 3,3: "cobra depois" ganha o visto. Som: nenhum.

## older-than-brain

- **Plano 1, close, câmera (2,7 s).** 0,0: a câmera fecha no tanque (0,6 s); o bolso cresce no canto em 0,53 e a conta "cobrado", colada no vidro, em 0,73. 1,6 "dois": os dois vistos da prancheta piscam, um depois do outro (0,53 s). 2,0: com o tanque começando a descer, a conta solta a fita, dobra e vai para o bolso (0,53 s), sem cruzar com os vistos; entra em 2,5, e o bolso, com a ponta de fora, só então encolhe (de 2,6 a 2,9, já sob a água do plano 2). Nos últimos 0,67 s o tanque e a bancada descem de volta dela, que fica na tela. Vivo: ela pulsa devagar. Som: a conta no bolso em 2,5.
- **Plano 2, aberto, palco (5,9 s).** 0,0: o azul do fundo do mar toma a cor sobre o verde do laboratório, e o recife, os morros e a areia sobem em camadas (0,87 s); a água-viva, que não saiu da tela, deriva do lugar do tanque até a linha e passa às cores da noite (0,8 s, com peso); a linha se desenha com o marco "sono" no começo (0,5 s). 2,3 "sono": o marco pulsa. 4,2 "antes": o marco "cérebro" acende mais adiante, e um arco liga os dois, do sono para o cérebro (0,6 s). Nos últimos 0,67 s as marcas, ela e a linha encolhem no próprio ponto, nesta ordem, e o fundo do mar desce em camadas; 0,2 s antes do fim o pedestal e a elefanta do plano 3 já crescem. Som: nenhum.
- **Plano 3, médio, palco (3,8 s).** 0,0: o pedestal vazio no meio e a elefanta dormindo de um lado, que já vinham crescendo desde 0,2 s antes, assentam (0,2 s), e o menta toma a cor sobre a água. 0,3 "quem": a água-viva pousa do outro lado, dormindo. 1,6 "conseguiu": o foco de luz pisca sobre o contorno vazio. Vivo: as duas respiram em fases diferentes. Som: nenhum.

## forced-awake

- **Plano 1, médio, corte (1,4 s).** 0,0: a fila dos ícones, que já vinha entrando por baixo do pedestal, assenta em 0,27 com o contorno do cérebro, "2", aceso. 0,47: o contorno ganha o X, sozinho (0,3 s). 0,77, dentro de "terceiro": o despertador, "3", acende, cresce (0,5 s) e chacoalha até o fim do plano. O plano não tem frase própria: quem diz que o segundo jeito acabou é o X. Som: nenhum.
- **Plano 2, médio, transformação (3,2 s).** 0,0 "ficar": o ícone do despertador sai da fila e vira o despertador que uma mão segura sobre o rato (0,7 s); a fila some. 0,8 "força": ele toca, com "TRIIIM" e riscos (0,5 s); o rato abre os olhos a meio. 1,7 "Foi": o calendário atrás risca um dia, e outro em 2,1. Nos últimos 0,67 s a mão leva o despertador, e o calendário e o rato encolhem no próprio ponto; nos últimos 0,27 s o quadro-negro do plano 3 já cresce na parede, que fica com a bancada. Som: o despertador em 0,8 (2,2 s da cena).
- **Plano 3, aberto, câmera (3,8 s).** 0,0 "ratos": a câmera abre um nada (0,6 s) e a frente escura da bancada desce (o tampo vira o chão); o quadro-negro do gancho, com a árvore e o carimbo "erro?", termina de crescer na parede (0,2 s). 0,1 a 1,1: os dez ratos entram em cascata aos pés do quadro, em duas fileiras (0,08 s entre eles). 0,8 "no": Rechtschaffen cresce dos pés, ao lado do quadro (0,4 s). 1,2: os ratos erguem o corpo e olham para cima, juntos (0,4 s). 2,0 "Álan": a etiqueta de nome estoura. 0,7 s antes do fim a etiqueta encolhe no ponto (0,3 s), antes de a sala descer. A fala não o reapresenta: quem o faz reconhecer é o quadro-negro e a etiqueta. Vivo: ele respira, os ratos farejam. Som: nenhum.

## rats-disc

- **Plano 1, aberto, corte (5,1 s).** 0,0: a bancada, a placa do laboratório. 0,6 "ratos": os dois ratos sobem no disco (0,8 s). 2,9 "disco": o disco dá um quarto de volta, devagar. 4,3 "água": a água da bandeja ondula. Som: nenhum.
- **Plano 2, close, câmera (7,5 s).** 0,0: a câmera fecha no rato do teste (0,7 s). 1,7 "começava": a pálpebra dele desce aos poucos (1,2 s) e a cabeça pende. 3,4 "disco": o disco gira (aviso de 0,2 s, giro de 0,8 s) e leva os dois para a beirada. 4,8 "dois": os dois andam contra o giro, com os passos marcados. 6,3 "fora": param, de olhos abertos. Som: o disco em 3,4.
- **Plano 3, médio, câmera (6,1 s).** 0,0: a câmera recua para os dois (0,6 s). 0,1 "outro": a etiqueta "comparação" estoura sobre o segundo. 3,1 "dormir": ele fecha os olhos e ressona, "zzz". 4,2 "primeiro": o do teste o olha, de olhos arregalados. Som: nenhum.

## rats-result

- **Plano 1, close, câmera (3,8 s).** 0,0: a câmera fecha nos dois ratos do disco, sem andar de lado (0,7 s); eles ficam onde estão, o disco e a bandeja encolhem sob eles (0,5 s) e os dois pisam na bancada; a etiqueta "comparação" não sai: desce com o rato que ela já nomeava, o que cochila, e fica acima dele, à esquerda do ronco, ligada à cabeça dele pela linha (não pousa no rato do teste); o ronco o acompanha. 0,3: o terceiro rato cresce ao lado. 1,9 "continuaram": o visto verde estoura; eles se limpam e farejam. Vivo: bigodes, orelhas. Som: nenhum.
- **Plano 2, médio, câmera (4,3 s).** 0,0: a câmera recua, em volta do rato do meio, sem andar de lado (0,7 s); o ronco, a etiqueta (com a linha se recolhendo para dentro dela) e o visto encolhem no ponto (0,3 s); os três encolhem até virar três dos dez da fila (os do meio), e o volume deles dá lugar à silhueta no caminho. 0,3 a 0,9: os outros sete crescem ao lado, do meio para as pontas. 0,4: o calendário cresce na parede (0,4 s). 0,7 (depois de "impedidos", com o calendário no lugar): ele começa a se preencher, um dia de cada vez. 1,4 "morreram": os ratos baixam a cabeça em cascata. Sem estouro e sem tremor: o plano fica quieto. Som: nenhum.
- **Plano 3, médio, câmera (4,3 s).** 0,9 "onze": o aro e "dia 11" estouram; o primeiro rato vira silhueta apagada (0,6 s). Os outros viram um a um até 2,6 "pouco": o aro e "dia 32", e o último. A cor sai devagar, sem queda. 0,6 s antes do fim as etiquetas dos dias se recolhem e o calendário encolhe no ponto (0,4 s ao todo): sai antes de Rechtschaffen subir na frente dele. Som: nenhum.

## unknown-cause

- **Plano 1, close, câmera (6,5 s).** 0,0: a prancheta de exame. 1,7 "procurou": os itens ganham visto, um a um (0,25 s entre eles). 3,2 "causa": a linha "causa da morte" fica em branco e o lápis para sobre ela. 4,6 "sem": a interrogação estoura; Rechtschaffen coça a cabeça (0,8 s). Nos últimos 0,6 s ele e a prancheta encolhem no ponto (a prancheta some 3 quadros antes do fim); nos últimos 4 quadros a balança do plano 2 já começa a crescer, e a parede do laboratório fica para ele. Som: nenhum.
- **Plano 2, médio, corte (6,3 s).** 0,0: a parede é a do plano 1 e não sai da tela; a bancada sobe por baixo (0,4 s) e a balança, vazia, continua a crescer no próprio ponto (0,4 s ao todo, começando 4 quadros antes da troca). 1,8 "falta": o rato de olho fechado pousa num prato e a etiqueta "sem sono" estoura; a balança pende. 3,8 "estresse": o despertador pousa no outro, com a etiqueta; ela pende para lá. Até o fim: oscila devagar e não assenta. Som: nenhum.

## awake-record

- **Plano 1, médio, corte (6,3 s).** 0,0: o disco dos ratos, vazio, no centro. 0,57 "gente": ele encolhe para o canto (0,7 s). 1,37 "um": Gardner entra andando pela direita (1,7 s) e para em 3,0, no fim de "documentados". 4,8 "Rêndi": a etiqueta de nome estoura. Vivo: ele respira e olha em volta (o disco em 3,6, o outro lado em 4,4). Som: nenhum.
- **Plano 2, médio, corte (4,4 s).** 0,0: o quarto. 0,1 "dezembro": o calendário de dezembro de 1963 estoura na parede. 3,3 "dezessete": a etiqueta "17 anos" estoura sobre Gardner. 3,6 e 3,8: os amigos entram, um de cada lado (0,4 s cada), antes da palavra deles, que cai no plano 3. Som: nenhum.
- **Plano 3, close, câmera (3,3 s).** 0,0 "decidiu": a câmera chega aos três e à parede (0,6 s); o calendário vai 150 px para a direita enquanto ela fecha (0,5 s) e volta quando ela abre, no plano 4. 0,9 "dois": Gardner olha um amigo e depois o outro (0,6 s). 2,2 "recorde": o cartaz "recorde: 260 h" estoura; os três viram a cabeça para ele (0,3 s). Som: nenhum.
- **Plano 4, médio, câmera (2,9 s).** 0,0: a câmera volta aos três (0,5 s). 0,1 "cara": a moeda sobe girando e cai (0,9 s, com queda). 1,1 "cobaia": os dois amigos apontam para Gardner (0,3 s), que arregala os olhos em 1,6. Som: a moeda em 0,1.

## gardner-hours

- **Plano 1, close, câmera (6,1 s).** 0,0: a câmera fecha em Gardner e no contador (0,6 s). 0,9 "ficou": o contador corre de 236 para 264 (3,0 s, constante), e as olheiras dele crescem junto. 4,1 "quatro": ao passar de 260 o visor fica coral e dá um pulo. O calendário vira de dezembro para janeiro em 2,0. Som: nenhum.
- **Plano 2, aberto, transformação (6,1 s).** 0,0: o quarto encolhe e some no fundo menta (0,5 s). 0,1 "onze": as onze mesas entram uma a uma, da esquerda para a direita e de cima para baixo (0,15 s entre elas), cada uma com ele mais caído. 4,4 "uma": na última, a cabeça encosta na mesa. Vivo: o vapor de cada xícara. Som: nenhum.

## gardner-sleeps

- **Plano 1, médio, câmera (7,7 s).** 0,0: Gardner de pé, oscilando. 1,4 "pesquisador": Dement entra pela direita com a prancheta, e a etiqueta de nome estoura em 2,0. 3,6 "náusea": o balão do enjoo estoura. 4,5 "memória": o do branco. 6,7 "irritado": o da raiva. A cada balão, Gardner muda de pose. Som: nenhum.
- **Plano 2, médio, câmera (3,7 s).** 0,0 "Quando": a cama no meio do quadro e o relógio ao pé dela; o bolso, cheio, no canto. Ele dá o passo para a frente da cama desde o quadro 0 (0,4 s); a cama entra no quadro 4, de um ponto à direita dele, e chega por trás do tronco. 0,7 "deitou": ele balança (0,13 s) e tomba de costas no colchão, onde bate em 1,2 (8,9 s da cena); o cobertor sobe e "ZZZ" sai em 1,4. 1,3 "dormiu": o ponteiro do relógio dá a volta e passa dela (1,0 s, constante). 2,3, com "catorze horas" dito: "14 h" estoura sob o relógio. Som: a queda na cama em 1,2.
- **Plano 3, close, câmera (2,6 s).** 0,0 "pouco": a cama desce para a direita (0,6 s); a conta sai do bolso em 0,07 (11,4 s da cena), cruza por cima da cama e se abre ao lado dela em 0,77, com o carimbo "cobrado" legível de 0,6 a 1,4; o carimbo pisca uma vez em 0,77 (0,27 s). 1,3 "acordado": a conta vem para o meio, cresce e vira (0,6 s; a meia-volta, constante, de 1,37 a 1,8), e a cama e o bolso encolhem no ponto (0,27 s). 1,67 a 2,4: as onze luas são riscadas uma a uma. 2,0: "14 h" estoura do outro lado. A fala não diz "cobrança": quem lembra a regra é o carimbo. Som: a conta saindo do bolso em 0,07.
- **Plano 4, close, câmera (4,7 s, com 1 s de silêncio).** 0,13 "perdido": as onze luas riscadas piscam juntas, duas vezes (até 0,8). 2,0 "sono": a seta desce de "14 h" (0,5 s) e a etiqueta "mais fundo" estoura em 2,3. 3,9: a conta vai um pouco para o lado e o bolso surge no canto (4,0); 4,3: ela entra nele (0,3 s). Nos últimos 0,37 s a fila e as molduras de `so-far` já entram por baixo. Som: nenhum.

## so-far

- **Plano 1, aberto, corte (3,0 s).** 0,0: a fila dos ícones no alto e as três molduras apagadas embaixo, que já vinham entrando, assentam em 0,33, com o despertador, "3", aceso. 0,53: o despertador ganha o X, sozinho (0,3 s). 0,93: a fila sai por cima (0,4 s) e as três molduras crescem lado a lado até ocupar a largura do quadro (0,6 s). 1,03: a "1" acende, a elefanta cresce do chão, a régua se desenha e "2 h" estoura em 1,5. 1,23: a "2" acende, e a água-viva desce e pousa na areia em 1,9. 1,43: a "3" acende e o disco entra, com o rato do teste em silhueta; 1,63: a cama com o rapaz e o relógio "14 h", juntos. Tudo assentado em 2,0. O plano não tem deixa (a fala é "Para a pergunta do começo, a resposta é que"): a tela carrega os três resultados, que a fala não rediz. Vivo: a elefanta respira, a água-viva pulsa, o disco gira, o rapaz respira. Som: nenhum.
- **Plano 2, aberto, câmera (4,4 s).** 0,0 "nenhum": as três molduras recuam para o alto (0,8 s), o fundo passa ao menta e o "2 h" sai; 0,1: o pedestal "acordado 24 h" sobe embaixo delas (0,7 s). 0,73 "estudado": a lupa do gancho entra do alto e pousa ao lado dele em 1,3. 1,9 "conseguiu": o foco de luz acende sobre o contorno vazio, que fica vazio. Saída: as molduras, o pedestal e a lupa encolhem no próprio ponto sobre a fila de `but-what`, que já entra por baixo. Som: nenhum.

## but-what

- **Plano 1, médio, corte (2,0 s).** 0,0: a fila dos ícones, com os três do meio riscados. 0,53 "que": a porta da loja acende (0,3 s) e cresce (0,5 s). O plano não tem frase própria: a pergunta "E o que o sono faz?" cai sobre a porta acesa. Som: nenhum.
- **Plano 2, médio, palco comum com ponte (2,9 s, mais o silêncio do fim).** 0,0 "Uma": os quatro outros ícones encolhem no ponto (0,35 s); o fundo passa à noite da rua no lugar (0,4 s), o disco do ícone some dentro dela e o anel claro afina até sumir; a loja de verdade cresce com a câmera até a porta em plano médio (0,9 s, com peso), e a rua sobe em camadas em volta dela, de 0,2 a 0,8 s. 0,77: a interrogação estoura na porta. 1,33: o medalhão da caixa de estoque acende sobre ela (0,4 s). 1,63 "memória": o medalhão pulsa uma vez (0,4 s). Saída: a rua desce antes da troca, para a sala de `memory-test` não subir sobre ela. Vivo: a luz por baixo da porta oscila, a lâmpada, a lua. Som: nenhum.

## memory-test

- **Plano 1, médio, corte (5,8 s).** 0,0: a parede toma a cor sobre o céu da rua (0,2 s) e a sala sobe junto, com a mesa e os quatro (do quadro 0 ao 10), com a rua já fora: dois quadros só de fundo, e os quatro aparecem com a parede já quase na cor dela; a cena anterior não desenha mais a sala. 1,9 "mil": o calendário "1924" estoura na parede. 4,5 "Duas": os dois pesquisadores entregam uma lista a cada pessoa (0,7 s, uma depois da outra). Vivo: respiram, piscam. Som: nenhum.
- **Plano 2, close, câmera (5,1 s).** 0,0: a câmera fecha na lista (0,7 s). 0,8 "sílabas": as sílabas se escrevem uma a uma (0,1 s entre elas). 2,1 "todos": o calendário atrás folheia, constante, até 3,8 "meses". Vivo: o olho de quem lê percorre a lista. Som: nenhum.

## memory-result

- **Plano 1, médio, corte (6,4 s).** 0,0: a tela dividida, os dois lados apagados. A lista de perto encolhe, opaca, até a mesa de cabeceira de quem ficou acordada (0,6 s) e toma a penumbra do quarto ao pousar; a outra cresce na mesa de quem dormiu. 1,2 "dormiam": acende o lado de quem dorme, com a lista na cabeceira e "ZZZ". 4,0 "passavam": acende o outro, com a mesma pessoa acordada e o relógio correndo as mesmas horas. Som: nenhum.
- **Plano 2, close, câmera (2,7 s).** 0,0: a câmera chega às duas listas (0,6 s), e as duas pessoas crescem à direita (de 0,3 a 0,7). 0,5: "só duas" estoura sobre as duas pessoas, junto com elas, sem esperar palavra: a fala não diz mais o tamanho da amostra. 0,6, logo que as listas chegam: na de quem ficou acordado, as sílabas apagam uma a uma (0,07 s entre elas); na outra, menos; as duas terminam juntas em 1,23 e ficam lado a lado, já diferentes, até a saída (2,0). 1,2 "esqueciam": o colchete abre, e a etiqueta "de 1 a 8 h depois" estoura em 1,37. Som: nenhum.
- **Plano 3, aberto, câmera (3,3 s).** 0,0: a câmera recua (0,6 s), e as duas pessoas, que ficam no palco, vão da direita para a esquerda (0,5 s). 0,4, depois de "resultado": a estante cresce do chão, prateleira por prateleira (1,1 s), com as duas já fora do lugar dela. 1,4 "século": a etiqueta "mais de 100 anos de pesquisa" estoura. Som: nenhum.

## stockroom

- **Plano 1, médio, transformação (2,7 s).** 0,0: a lista acesa sobe até a cabeça de perfil (0,7 s). 1,6 "cérebro": o cérebro acende dentro dela (0,4 s). Som: nenhum.
- **Plano 2, aberto, palco comum com ponte (3,7 s).** 0,0: a lista e a cabeça encolhem, cada uma no seu ponto (0,3 s); o cérebro, com as lembranças dentro, vai para o meio do quadro (0,4 s); o fundo passa ao céu do dia (0,1 a 0,5 s) e a rua sobe em camadas (0,1 a 0,6 s). 0,3: a fachada da loja cresce no ponto em que o cérebro está, por trás dele (0,35 s, com sobra), e o cérebro encolhe dentro dela (0,35 a 0,6 s): dentro da cabeça há uma loja. A sombra da loja no chão só cresce quando a calçada chega. Nenhum círculo. 0,6 e 0,7: o freguês e a lojista crescem na porta. 0,7 "passa": dois fregueses entram andando. 1,9 "recebendo": três caixas descem à porta, uma a uma (com queda). Vivo: o toldo balança. Som: nenhum.
- **Plano 3, médio, palco comum (7,3 s).** 0,0: a rua desce opaca, com a fachada, as caixas e o freguês de amarelo (0,27 s, acelerando), e a estante, a entrada, o depósito e o chão da loja de dentro sobem opacos (0,6 s); nada passa por meia opacidade. 0,23: com a rua já fora do quadro, a parede de dentro toma a cor sobre o céu (0,33 s), e o véu das prateleiras chega com ela. O freguês de laranja, a freguesa de roxo e a lojista não saem da tela: vão da calçada ao lugar deles no balcão, mudando de tamanho, em 0,67 s (com peso); a freguesa de roxo se vira para o balcão logo que parte (0,1 s) e passa por trás da lojista. Nenhum painel. 1,0 "aberta": a lojista atende um freguês, que sai, e entra outro (1,5 s cada). 3,4 "guardar": ela olha para as caixas e é chamada de volta. 5,5 "chega": mais uma caixa na pilha da entrada, que balança. Som: nenhum.

## stockroom-night

- **Plano 1, médio, varredura (5,5 s).** 0,9 "baixar": a porta de enrolar desce com peso (1,0 s), e a noite desce com ela. 2,5 "levar": a lojista pega uma caixa e anda até o depósito (1,5 s); volta para outra. Vivo: a lâmpada. Som: a porta em 0,9.
- **Plano 2, médio, transformação (3,2 s).** 0,0: a loja encolhe até caber na lente que sai da cabeça de quem dorme na cama (0,67 s). 0,47: dentro da lente, a porta de enrolar desce diante da loja, a velocidade constante (0,47 s), com a barra dela na borda: por cima fica a fachada de porta baixada. 1,0 "cérebro": a lente pulsa. 0,67 s antes da troca: a porta sobe de novo (0,47 s) e descobre a loja de dentro do plano seguinte, com a lente parada. Vivo: o cobertor sobe e desce, "ZZZ". Som: nenhum.
- **Plano 3, close, câmera (6,5 s).** 0,0: a lente, já com a loja de dentro à vista, abre até ela tomar o quadro (0,7 s), perto da lojista. 0,1 "repassa": ela abre uma caixa, e a lembrança sobe e brilha (0,8 s). 2,5 "leva": ela a põe na prateleira do fundo, e a câmera recua. 3,7 "provisório": a etiqueta estoura na entrada; 5,1 "longo": "longo prazo", no depósito. Som: nenhum.

## stockroom-solid

- **Plano 1, médio, palco comum (6,0 s, com 1 s de silêncio).** A pessoa começa a crescer 0,1 s antes do plano, no meio do que se vê dela, por cima da loja de dentro de `stockroom-night`, que desce: nenhum quadro fica só com o fundo. 0,0: ela ainda dorme, de pé, da cintura para cima. 0,9, depois de "sabe": acorda e se espreguiça (0,8 s). 2,0 "ajuda": o balão com a caixa do rosto estoura. 3,4 "você": ela sorri e aponta para o balão (0,35 s); fica apontando até a saída, no silêncio depois da fala. Saída: ela e o balão encolhem nos últimos 0,6 s; o globo, a lupa e o pedestal de `nobody-escaped` entram por baixo do balão 0,27 s antes da troca. Vivo: respira e pisca, o balão flutua. Som: nenhum.

## nobody-escaped

- **Plano 1, médio, palco comum (4,3 s, com 0,7 s de silêncio).** O globo, a lupa e o pedestal começam a entrar 0,27 s antes do plano, por baixo do balão de `stockroom-solid`. 0,0: o globo sob a lupa e o pedestal, como no gancho; a lupa já dá a última volta no globo (constante, 1,6 s). 1,6 "animais": ela para e baixa (0,6 s). 2,3 "história": o foco de luz sobe sobre o pedestal vazio (0,6 s) e assenta em 2,9; o quadro fica sob o foco por cerca de 0,9 s, no silêncio depois da fala. Saída: o globo e a lupa encolhem primeiro e o pedestal por último, nos últimos 0,6 s; a pessoa de `one-of-them` começa a crescer no centro 0,2 s antes da troca, e nenhum quadro fica só com o fundo. Vivo: o globo gira, a lupa paira. Som: nenhum.

## one-of-them

- **Plano 1, médio, palco comum (3,7 s).** A pessoa começa a crescer 0,2 s antes do plano, dos pés, enquanto o pedestal de `nobody-escaped` encolhe, e está de pé em 0,17. 0,0: a elefanta entra andando pela esquerda (1,5 s) e a água-viva nadando pela direita, de cima (1,0 s, a partir de 0,6). 0,3: a pessoa se vira para a elefanta, que chega; 0,9: pisca e se vira para a água-viva, que desce, e os dois bichos olham para ela; 1,6: volta a ficar de frente. 1,9 "larga": ela esfrega os olhos (1,0 s) e boceja até se deitar. 3,1: a câmera começa a recuar (0,73 s) e a cama cresce atrás dela. Vivo: os três respiram e piscam, a água-viva pulsa. Som: nenhum.
- **Plano 2, aberto, câmera (3,4 s).** 0,0: a câmera termina de recuar (em 0,13), com a cama já no lugar. 0,1 "deita": ela balança e tomba de costas no colchão (0,5 s), o cobertor sobe e o "ZZZ" entra em 0,6. 1,0 "elefanta": a tromba cai e o olho fecha (0,8 s). 1,6 "água": os braços da água-viva caem (0,8 s). Saída: os três encolhem 0,13 s antes da marcação do palco, e a rua da loja começa a subir 0,33 s antes da troca. Vivo: os três respiram em fases diferentes. Som: nenhum.

## still-unknown

- **Plano 1, médio, palco comum (3,2 s).** A rua começa a subir 0,33 s antes do plano (eram 0,53 s: a cama e a água-viva ainda encolhiam em cima do toldo e dos prédios). 0,0: a loja por fora, de porta baixada. 0,7 "falta": a interrogação balança sobre ela. Vivo: a luz por baixo da porta. Som: nenhum.
- **Plano 2, close, palco comum (5,0 s).** A lagoa e o contorno do cérebro começam a entrar 0,13 s antes do plano, sobre a rua que desce: o plano não abre só com a lua e uma lasca do toldo. 0,1 "resposta": o medalhão da caixa desce e pousa no contorno de um cérebro, onde cabe (0,6 s). 2,7 "água": a câmera desce até a água-viva (0,7 s), com o contorno tracejado do cérebro que ela não tem. 3,8 "sem": o medalhão tenta descer até ela e fica no ar, sem onde pousar. Som: nenhum.

## what-it-is

- **Plano 1, médio, palco comum (3,4 s).** A pessoa começa a crescer 0,3 s antes do plano, enquanto o medalhão e o contorno do cérebro encolhem. 0,0: a pessoa, e a barra da vida se desenha (0,5 s). 0,3: a etiqueta "um terço" entra quando a barra chega à ponta escura. 1,2 "vida": o terço se acende em índigo (0,5 s), com a lua e as estrelas entrando até 2,0; o terço fica escuro até aí, para se ver o "antes". 1,6 "parecia": a pessoa olha para ele. Saída: a barra recolhe 0,1 s mais cedo. Som: nenhum.
- **Plano 2, aberto, palco comum (2,6 s).** A água-viva da linha começa a crescer 0,23 s antes do plano, quando a barra acabou de recolher. 0,0 "nenhum": a linha do tempo se desenha (0,5 s). 0,3, 0,6 e 0,9: os bichos dormindo entram ao longo dela, do começo para o fim, e a pessoa na cama por último, no fim da linha; a câmera desliza com eles e para em 1,2. Saída: a linha recolhe para o começo levando todos, o fundo do mar desce em camadas, e o quadro-negro de `tonight` começa a crescer 0,23 s antes da troca. Vivo: os bichos respiram, a água-viva pulsa. Som: nenhum.

## tonight

- **Plano 1, aberto, palco comum (2,9 s).** Ele e o quadro-negro começam a crescer 0,23 s antes do plano, com a linha do tempo ainda encolhendo, e estão inteiros em 0,0: o quadro-negro do gancho, com a árvore de olhos fechados e o carimbo "erro?". 0,1: a etiqueta "Allan Rechtschaffen" estoura, sem esperar palavra, e fica até pouco antes da troca. 0,5 "parece": ele ergue o braço para o quadro (0,6 s). A fala não diz o nome nem recita a frase dele: quem liga ao gancho é o quadro e a etiqueta. Vivo: ele respira, os bichos da árvore ressonam. Som: nenhum.
- **Plano 2, close, câmera (1,7 s).** 0,0 "erro": a câmera fecha no carimbo (0,4 s), e ele sai pela esquerda. 0,33: com a câmera parada, o carimbo perde a cor (0,53 s, constante) e a moldura fica tracejada, enquanto a palavra é dita. 0,83: com a cor já fora, a interrogação pequena estoura ao lado do tronco (0,33 s). De 1,17 a 1,47: o estado final, parado. Saída: o quadro-negro encolhe em volta do carimbo (0,3 s), quando a janela e a cama já apontam. Som: nenhum.
- **Plano 3, médio, câmera (2,9 s, com 1,5 s de silêncio).** 0,0 "seja": o fundo lilás toma a cor sobre o pêssego; a janela e a cama crescem do próprio ponto desde o primeiro quadro (0,4 s). A lua passa devagar pela janela e o "ZZZ" sobe. A fala acaba em 1,4; a aproximação lenta continua pelo silêncio, sem nada novo. Vivo: o cobertor sobe e desce, as estrelas piscam. Som: nenhum.

## subscribe

- **Plano 1, aberto, corte (5,0 s).** 0,0: os três dormindo, lado a lado. Vivo: respiram em fases diferentes. 2,3 "nós": a câmera recua um pouco (1,0 s). Som: nenhum.
- **Plano 2, médio, câmera (2,6 s).** 0,0: os três encolhem e o planeta da vinheta entra e assenta no centro (0,6 s). 0,1 "curta": ele gira devagar. Som: nenhum.
- **Plano 3, médio, câmera (3,4 s).** 0,1 "assim": os cartões saem do planeta um a um e crescem na direção de quem assiste (0,3 s entre eles). Som: nenhum.
- **Plano 4, aberto, câmera (4,2 s).** 0,1 "só": os cartões se recolhem (0,2 s cada, na ordem inversa). 2,0 "Obrigado": o planeta fica sozinho e dá uma volta lenta até o fim. Som: nenhum.
