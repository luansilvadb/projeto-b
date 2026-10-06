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
- **Cenários que permanecem** (`sets`): a savana (`night-falls` 1 a 3, `last-to-know`, `skip-a-night` 1 e 2, `sleep-debt` 1; `elephants` 1 a 4, `two-hours` 1 e 2, `elephant-verdict` 1 e 2); a lagoa (`jellyfish` 1 e 2, `jellyfish-night` 1 e 2); o laboratório do tanque (`jellyfish-night` 3, `jellyfish-platform` 1 e 2, `jellyfish-debt` 2 e 3, `older-than-brain` 1); a sala do quadro-negro (`forced-awake` 3 e 4); a bancada dos ratos (`rats-disc` 1 a 3, `rats-result` 1 a 3); o quarto de Gardner (`awake-record` 2 a 4, `gardner-hours` 1); a rua da loja (`but-what` 2 e 3); a loja por dentro (`stockroom` 3, `stockroom-night` 1 e 3); a fila dos ícones em fundo lilás (`debt-returns` 2, `sleep-less` 1; `maybe-brain` 1 e 2; `so-far` 1 a 5).
- **Varreduras do roteiro entre cenas** (`two-hours` 1, `elephant-awake` 1, `jellyfish-night` 1, `skip-a-night` 2): o plano novo redesenha o último quadro do anterior por baixo e a borda passa por cima, em 0,25 s.

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

## Som

A música, os níveis, os silêncios e os efeitos saíram desta partitura em 2026-10-05 e ficam em `sound.md`, da skill `diretor-de-som`. As linhas "Som:" de cada plano, abaixo, são as marcas da época em que a animação foi escrita: valem como registro do que acontece na imagem, e quem decide o que soa é o mapa de som.

## third-of-life

- **Plano 1, médio, corte (3,0 s).** 0,0: a pessoa já está de pé, e a barra da vida se desenha da esquerda para a direita atrás dela (0,7 s). 1,3 "terço": o terço do fim escurece (0,7 s); 1,6: a etiqueta "um terço" estoura e a pessoa se espanta. Vivo: ela respira e pisca. Som: nenhum.
- **Plano 2, médio, corte (7,3 s).** 0,0: noite; o bicho já dorme sob a árvore. 2,4 "comer": o ícone da comida acende e é riscado (0,3 s cada). 3,5 "reproduzir": o do par. 5,1 "perceber": o do olho. Vivo: o bicho ressona, o capim balança, a lua tem halo. Aproximação lenta de 4%. Som: nenhum.

## biggest-mistake

- **Plano 1, médio, corte (4,2 s).** 0,0: Rechtschaffen de frente. 0,8 "Réctchafen": a etiqueta de nome estoura, com a linha. 2,7 "quarenta": as folhas do calendário viram em cascata (10, 20, 30, 40) e param em "44" em 3,3 "quatro" (0,8 s no total). Vivo: ele respira e pisca. Som: nenhum.
- **Plano 2, aberto, câmera (3,6 s).** 0,0: a câmera recua até o corredor (0,8 s). 0,1 "Universidade": a placa da porta estoura. 0,9 "Chicago": ele anda até a porta (1,0 s) e a abre em 2,0 "resumia" (0,6 s). Som: nenhum.
- **Plano 3, close, corte (4,3 s).** 0,1 "se": ele se vira para o quadro e ergue o braço (0,6 s); as aspas se abrem (0,3 s). 0,5 "sono": as linhas de giz se escrevem, uma por oração, até 3,0 "vital". Vivo: o braço oscila de leve. Som: nenhum.
- **Plano 4, aberto, câmera (2,8 s).** 0,0: a câmera recua até o quadro inteiro (0,6 s); a árvore da vida cresce do tronco para os ramos (0,7 s) e os bichos fecham os olhos em cascata. 0,5 "erro": o carimbo recua (0,3 s) e bate em 1,0 "evolução", com um tremor do quadro. Som: o carimbo em 1,0.

## time-to-fix

- **Plano 1, médio, corte (2,5 s).** 0,0: a árvore da vida no fundo lilás. 0,6 "evolução": a tesoura entra pela esquerda (0,5 s) e abre. 1,9 "corrigir": fecha de uma vez, o galho do chifre cai (queda, 0,4 s) e "SNIP" estoura. Som: o corte em 1,9.
- **Plano 2, aberto, corte (5,1 s).** 0,0: o fundo do mar em índigo. 0,6 "sono": o marco da lua acende no começo e a linha do tempo se desenha dali para a direita (1,5 s, com peso). 3,1 "quinhentos": o colchete abre do marco ao fim e a etiqueta estoura (0,3 s). Vivo: a luz tremula na água, o capim balança, plâncton deriva. Som: nenhum.
- **Plano 3, aberto, corte (3,5 s).** 0,1 "Bastava": o globo gira devagar e a lupa passeia sobre ele (velocidade constante). 0,9 "animal": o foco de luz acende sobre o pedestal (0,8 s) e a placa "acordado 24 h" estoura em 1,9 "viver". Vivo: o contorno tracejado pulsa. Som: nenhum.

## the-question

- **Plano 1, close, câmera (10,4 s, com 6 s de silêncio).** 0,0: a câmera chega ao pedestal (0,8 s) e a lupa vem do globo e para sobre o contorno (0,9 s). 1,4 "algum": a interrogação estoura dentro da lente. 3,2 "dormir": a lupa inclina, como quem insiste (0,5 s). 4,4: a fala acaba, e a vinheta do canal abre num círculo sobre o pedestal. Som: o da vinheta, na etapa de trilha.

## five-parts

- **Plano 1, aberto, corte (2,5 s).** 0,0: a vinheta sai e o fundo lilás fica. 0,6 "resposta": os cinco ícones entram apagados, em fila, da esquerda para a direita (0,12 s entre eles). Som: nenhum.
- **Plano 2, médio, câmera (3,3 s).** 0,0: a câmera chega ao primeiro ícone (0,6 s). 0,1 "Primeiro": os olhos no capim acendem (0,3 s) e piscam uma vez em 1,6 "perigoso". Vivo: o capim do ícone balança. Som: nenhum.
- **Plano 3, médio, câmera (2,6 s).** 0,0: a câmera desliza aos três do meio (0,6 s). 0,1 "três": acendem um a um (0,3 s entre eles), cada um com a pílula: a barra da régua encolhe, o contorno do cérebro treme, o despertador chacoalha. Som: nenhum.
- **Plano 4, aberto, câmera (3,3 s).** 0,0: a câmera recua até a fila inteira (0,7 s). 0,1 "fim": a porta da loja acende. 1,0 "sabe": a interrogação estoura sobre ela. Vivo: os cinco pulsam em fases diferentes. Som: nenhum.

## night-falls

- **Plano 1, aberto, corte (4,2 s).** 0,0: a savana ao entardecer. 1,6 "bicho": o bicho entra pela esquerda andando até a árvore (1,8 s). Vivo: o capim e a copa balançam, o sol desce devagar. Som: nenhum.
- **Plano 2, médio, varredura (2,0 s).** 0,0: a noite desce de cima para baixo (0,25 s) enquanto a câmera chega ao bicho (0,7 s). 0,5 "deita": ele dobra as pernas e se deita (0,6 s). 1,0 "fecha": a pálpebra desce (0,3 s). Som: nenhum.
- **Plano 3, close, câmera (4,5 s).** 0,0: a câmera fecha no bicho (0,8 s). 1,0 "horas": "zzz" sobe em três tempos. 2,1 "perceber": o capim atrás dele se abre e fecha (0,6 s), e ele continua igual. Vivo: o flanco sobe e desce. Som: nenhum.

## last-to-know

- **Plano 1, close, câmera (4,0 s).** 0,0: a câmera desliza do bicho para a moita (0,6 s). 0,7 "predador": dois olhos acendem no escuro (0,25 s). 1,1 "chegar": a sombra avança devagar, a velocidade constante, até o fim do plano. 2,4 "demora": uma orelha do bicho se mexe, e mais nada. Som: os olhos em 0,7.

## skip-a-night

- **Plano 1, médio, corte (4,6 s).** 0,0: o bicho em pé, de olhos arregalados, virado para a moita. 1,6 "pular": a lua sobe pelo céu até o meio (2,5 s, constante). 2,8 "acordado": ele vira a cabeça de um lado para o outro, duas vezes (0,5 s cada). Vivo: as orelhas giram. Som: nenhum.
- **Plano 2, médio, varredura (4,6 s).** 0,0: o dia varre da direita (0,25 s). 0,1 "Só": a cabeça dele cai aos poucos (1,2 s) e os joelhos cedem. 0,9 "cobra": a conta "sono devido" desliza para dentro e as linhas se escrevem uma a uma até 3,4 "dívida". 3,6: a cabeça dá um tranco para cima e volta a cair. Som: nenhum.

## sleep-debt

- **Plano 1, close, câmera (6,5 s).** 0,0: a câmera fecha no bicho e na conta (0,7 s). 1,5 "sono": ele oscila (aviso, 0,3 s) e desaba em 1,7 "dorme", com "PLOFT" e poeira; o carimbo "cobrado" bate na conta 0,3 s depois. 3,5 "dorme": o flanco passa a subir e descer mais devagar e mais fundo. 5,0 "acorda": uma orelha treme e para. Som: a queda e o carimbo em 1,7.
- **Plano 2, médio, corte (6,6 s).** 0,0: a pessoa sentada à mesa do café, sonolenta, com o vapor subindo. 0,6 "conhece": a conta carimbada estoura ao lado dela. 3,6 "pesa": a cabeça vai caindo (1,0 s) e encosta na mesa em 4,7; a xícara treme. Vivo: o vapor, a respiração lenta. Som: nenhum.

## debt-test

- **Plano 1, close, corte (4,5 s).** 0,0: a conta carimbada no centro. 1,8 "cobrança": ela ganha a prancheta e o quadrado de marcar (0,6 s). 3,1 "testes": o braço de jaleco entra por baixo com a caneta (0,6 s). Som: nenhum.
- **Plano 2, médio, câmera (6,2 s).** 0,0: a câmera recua e a tela se divide (0,6 s). 0,2 "Compensar": acende o lado do bicho dormindo, com a conta. 2,7 "sinais": o visto se desenha (0,3 s). 4,3 "dormindo": o outro lado acende, mais apagado: o bicho só parado, de olho aberto, e o contorno vazio da conta. Vivo: um ressona, o outro pisca. Som: nenhum.

## debt-returns

- **Plano 1, close, câmera (3,2 s).** 0,0: a conta aberta. 0,6 "cobrança": ela dobra em dois tempos (0,5 s) e vai para o bolso, que surge no canto (0,6 s, com peso); a ponta fica de fora. 1,4 "duas": o bolso dá duas batidas pequenas. Som: a conta no bolso em 1,1.
- **Plano 2, médio, corte (6,1 s).** 0,0: a fila dos ícones no centro; o bolso continua no canto. 0,2 "Dormir": os olhos no capim ganham o visto (0,3 s). 3,7 "Falta": a régua, "1", acende e cresce até 1,3 (0,5 s). Vivo: a fila pulsa. Som: nenhum.

## sleep-less

- **Plano 1, médio, transformação (3,2 s).** 0,0: a régua do ícone sai da fila, que encolhe e some (0,5 s), e sobe para cima da pessoa, que já dorme na cama. 0,9 "jeito": a régua se estica até virar a régua de 24 horas (0,8 s), com as marcas entrando da esquerda para a direita. Vivo: o cobertor sobe e desce. Som: nenhum.
- **Plano 2, médio, câmera (4,9 s).** 0,0: a cama cresce e a régua sobe (0,6 s). 0,1 "Você": a barra dela se enche até as oito horas (0,7 s, em cascata). 1,0 "oito": "8 h" estoura na ponta. 2,4 "tem": o lugar vago, mais curto, se desenha em tracejado por baixo (0,5 s). Som: nenhum.

## elephants

- **Plano 1, aberto, corte (6,0 s).** 0,0: a savana de dia. 0,6 "dois": as duas manadas entram, uma de cada lado, andando (até o fim do plano). 3,4 "elefantas": as duas da frente levantam a tromba, uma depois da outra. Vivo: orelhas abanam, poeira nos pés. Som: nenhum.
- **Plano 2, close, câmera (2,8 s).** 0,0: a câmera chega às duas (0,7 s). 0,1 "matriarca": param frente a frente e encostam as trombas (0,8 s). Vivo: piscam, as orelhas abanam. Som: nenhum.
- **Plano 3, médio, câmera (4,2 s).** 0,0: a câmera recua (0,6 s). 0,1 "mediram": a tromba de uma delas se mexe sem parar, e uma linha fina sai dela e desenha o registro. 2,5 "trinta": o calendário de 35 dias estoura no canto e se preenche (1,2 s, em cascata), com o sol e a lua passando. Som: nenhum.
- **Plano 4, close, varredura (4,7 s).** 0,0: a noite varre (0,25 s) e a câmera fecha na tromba (0,7 s). 0,1 "Tromba": a tromba desacelera e para (0,8 s). 1,1 "cinco": o cronômetro estoura ao lado e corre até "5 min" (1,5 s). 3,5 "sono": a pálpebra desce. Som: nenhum.

## two-hours

- **Plano 1, médio, varredura (6,3 s).** 0,0: a régua de 24 horas entra por cima da elefanta que dorme em pé. 2,2 "duas": a barra dela entra no lugar vago e para em "2 h" (0,5 s); a etiqueta estoura em 2,5. 3,8 "menores": a barra pisca uma vez. Vivo: ela respira, a tromba pende, a lua tem halo. Som: nenhum.
- **Plano 2, close, câmera (3,4 s).** 0,0: a câmera fecha nas duas barras (0,6 s). 0,7 "dorme": a barra dela se copia uma, duas, três vezes ao longo da barra "8 h" (0,25 s entre as cópias). 1,2 "quarto": a etiqueta "um quarto" estoura. Som: nenhum.

## elephant-awake

- **Plano 1, aberto, varredura (5,0 s).** 0,0: o dia varre. 0,4: a elefanta anda de olhos abertos, e o sol e a lua passam duas vezes pelo céu, constantes, até o fim do plano; a faixa de dois dias se enche junto. 2,1 "quarenta": a etiqueta "46 h acordada" estoura, presa à faixa. Som: nenhum.
- **Plano 2, médio, corte (5,8 s).** 0,0: a faixa de três dias. 0,3 "você": a pessoa entra andando pela esquerda. 1,9 "segunda": a etiqueta estoura quando ela passa; "terça" em 3,2; "quarta" em 4,7. Ela vai curvando e arrastando os pés a cada dia; em 4,1 "madrugada" chega à cama e deita (0,7 s). A linha coral do tempo acordada cresce atrás dela. Som: nenhum.

## elephant-verdict

- **Plano 1, médio, corte (4,0 s).** 0,0: as duas elefantas, pequenas, de noite. 1,0 "duas": a etiqueta "só duas" estoura. 2,0 "pouco": sobre elas, a ponta da barra "2 h" fica tracejada e a interrogação estoura, balançando. Som: nenhum.
- **Plano 2, médio, câmera (3,3 s).** 0,0: a câmera chega a uma delas (0,6 s). 0,1 "Mesmo": ela para de andar. 1,7 "sempre": a tromba cai (0,8 s) e o olho fecha em 2,6 "dormir". Som: nenhum.
- **Plano 3, close, corte (4,9 s).** 0,0: a régua de perto. 1,6 "perto": a barra "2 h" encolhe um pouco na direção do zero, treme e para (0,8 s). 3,2 "parou": o contorno do zero, vazio, pisca à esquerda dela. Som: nenhum.
- **Plano 4, aberto, câmera (3,3 s).** 0,0: a câmera recua até o pedestal (0,7 s). 0,5 "elefanta": ela já dorme ao lado dele. 1,7 "parar": o foco de luz pisca sobre o contorno vazio. Vivo: ela respira. Som: nenhum.

## maybe-brain

- **Plano 1, médio, corte (3,5 s).** 0,0: a fila dos ícones. 1,7 "primeiro": a régua ganha o X (0,3 s, dois traços). 2,5 "limite": o contorno do cérebro, "2", acende. Som: nenhum.
- **Plano 2, close, transformação (2,6 s).** 0,2 "segundo": o contorno sai da fila e cresce até encher o quadro (0,9 s, com peso), e a fila encolhe atrás dele. Vivo: o tracejado gira devagar. Som: nenhum.
- **Plano 3, médio, corte (5,0 s).** 0,1 "elefanta": ela entra e o cérebro dela acende. 1,2 "você": a pessoa entra e o dela acende. 2,2 "pode": a placa "culpado?" desce entre os dois, balança e para (0,8 s). 3,8 "necessidade": os dois olham para a placa. Som: nenhum.
- **Plano 4, médio, corte (2,5 s).** 0,1 "Parece": a pesquisadora aponta o contorno vazio (0,4 s). 1,1 "foi": ajeita a rede de pesca no ombro (0,5 s). Vivo: bolhas no tanque vazio. Som: nenhum.

## jellyfish

- **Plano 1, aberto, corte (8,7 s).** 0,0: a lagoa de dia. 2,3 "pesquisadores": a água-viva entra pela esquerda nadando de cabeça para cima, pulsando (2,0 s). 4,3 "água": ela vira (0,8 s) e pousa na areia em 5,3 "Cassiopéia", com uma nuvem de areia. 6,4 "Ela": o peixe entra pela direita e freia ao vê-la (0,9 s). Vivo: feixes de luz, capim, plâncton. Som: nenhum.
- **Plano 2, médio, câmera (4,4 s).** 0,0: a câmera chega a ela (0,8 s). 0,1 "pousada": a etiqueta "Cassiopea" estoura, com a linha. 2,9 "pulsando": o sino contrai e um anel sai a cada pulso, a 58 por minuto, até o fim. Vivo: o olho do peixe acompanha um anel. Som: nenhum.
- **Plano 3, close, transformação (4,7 s).** 0,0: a câmera atravessa o sino e o fundo passa ao índigo de "por dentro" (0,6 s). 0,1 "cérebro": o contorno tracejado se desenha no meio (0,6 s) e fica vazio. 1,9 "rede": os neurônios acendem em pontos, do centro para as bordas (1,2 s). Vivo: os pontos piscam fora de fase. Som: nenhum.

## jellyfish-night

- **Plano 1, médio, varredura (2,6 s).** 0,0: a noite desce (0,25 s) e os cachos acendem em ciano. 1,2 "pulsa": o ritmo cai para 39 por minuto, os anéis se espaçam e os braços caem (1,2 s). 1,8 "devagar": o peixe boceja. Som: nenhum.
- **Plano 2, close, câmera (3,7 s).** 0,0: a câmera fecha nela (0,7 s). 0,6 "prova": a interrogação estoura, presa a ela, e balança. 2,6 "só": o peixe chega perto, olha e se afasta (1,0 s). Som: nenhum.
- **Plano 3, aberto, corte (4,6 s).** 0,0: o laboratório, com ela no tanque. 1,8 "pesquisadores": a pesquisadora ergue a prancheta (0,5 s). 3,1 "dois": as duas linhas em branco se escrevem, uma depois da outra (0,3 s entre elas). Vivo: bolhas no tanque, a lua na janela. Som: nenhum.

## jellyfish-platform

- **Plano 1, médio, câmera (5,0 s).** 0,0: a câmera chega ao tanque (0,7 s). 0,5 "primeiro": a luva desce e segura a ponta da plataforma (0,6 s). 1,0: aviso, a plataforma recua um pouco (0,3 s). 1,3 "tiraram": é puxada de uma vez para fora (0,4 s). 2,0 "repente": ela fica solta, sobe um pouco e inclina (1,0 s). Som: o puxão em 1,3.
- **Plano 2, close, câmera (5,2 s).** 0,0: a câmera fecha nela (0,6 s); o cronômetro estoura e começa a contar. 1,4 "boiando": ela deriva e gira de leve, sem pulsar. 2,3 "cinco": o cronômetro chega a "5 s" em 3,2. 3,7 "acordar": os braços abrem de uma vez (0,3 s); 4,2 "virar": ela se vira e nada para o fundo (0,8 s). Som: nenhum.
- **Plano 3, médio, corte (5,2 s).** 0,0: a pessoa dorme na cama; o bolso, cheio, no canto; a prancheta no outro. 0,1 "demora": "lenta para reagir" ganha o visto. 2,8 "quando": o braço entra e sacode o ombro dela, três vezes. 3,5 "chama": só no terceiro ela abre os olhos a meio (0,5 s). Som: nenhum.

## jellyfish-debt

- **Plano 1, close, corte (6,5 s).** 0,0: o tanque à direita, o bolso no canto. 1,8 "cobrança": a conta sai do bolso, voa e se abre ao lado do tanque (0,9 s, com peso). 3,0 "regra": as linhas da conta acendem uma a uma. 5,0 "compensa": o carimbo "cobrado" pisca. Som: nenhum.
- **Plano 2, médio, corte (6,3 s).** 0,0: o laboratório de noite, em índigo, o tanque aceso; ela vai deixando os braços cair. 1,8 "soltaram": os jatos entram pela esquerda, com "PSSST" (0,3 s), e ela se ergue e sacode. 3,3 "tanque": segundo jato quando os braços voltam a cair; 4,7 "água": terceiro. Som: os jatos em 1,8.
- **Plano 3, médio, varredura (4,4 s).** 0,0: o dia varre da direita (0,25 s); o sol na janela. 1,2 "hora": ela tenta pulsar no ritmo de dia, e o ritmo cai. 3,0 "ela": os braços caem (0,8 s). 3,3: "cobra depois" ganha o visto. Som: nenhum.

## older-than-brain

- **Plano 1, close, câmera (3,7 s).** 0,0: a câmera fecha no tanque (0,6 s). 1,6 "dois": os dois vistos da prancheta piscam, um depois do outro. 3,0 "cérebro": a conta dobra e volta para o bolso (0,7 s). Vivo: ela pulsa devagar. Som: nenhum.
- **Plano 2, aberto, corte (5,9 s).** 0,0: a linha do tempo, com o marco "sono" no começo. 0,4 "pesquisadores": a água-viva estoura logo depois do marco. 2,3 "sono": o marco pulsa. 4,2 "antes": o marco "cérebro" acende mais adiante, e um arco liga os dois, do sono para o cérebro (0,6 s). Som: nenhum.
- **Plano 3, médio, corte (3,8 s).** 0,0: o pedestal vazio no meio. 0,3 "quem": a água-viva pousa de um lado, dormindo; a elefanta já dorme do outro. 1,6 "conseguiu": o foco de luz pisca sobre o contorno vazio. Vivo: as duas respiram em fases diferentes. Som: nenhum.

## forced-awake

- **Plano 1, médio, corte (2,8 s).** 0,0: a fila dos ícones. 0,5 "segundo": o contorno do cérebro ganha o X. 1,6 "falhou": o despertador, "3", acende e chacoalha. Som: nenhum.
- **Plano 2, médio, transformação (2,7 s).** 0,0: o ícone do despertador sai da fila e vira o despertador que uma mão segura sobre o rato (0,6 s); a fila some. 0,8 "que": ele toca, com "TRIIIM" e riscos (0,4 s); o rato abre os olhos a meio. 1,4 "acordado": o calendário atrás risca um dia, e outro. Som: o despertador em 0,8.
- **Plano 3, close, corte (2,7 s).** 0,1 "Foi": os dez ratos entram em cascata, em duas fileiras (0,08 s entre eles). 1,4 "dez": erguem o corpo e olham para cima, juntos (0,4 s). Vivo: os bigodes tremem. Som: nenhum.
- **Plano 4, aberto, câmera (6,5 s).** 0,0: a câmera sobe e recua até Rechtschaffen e o quadro-negro (0,9 s). 0,9 "Álan": a etiqueta de nome estoura. 4,5 "maior": ele aponta o carimbo "erro?", que pisca. Vivo: ele respira, os ratos se mexem. Som: nenhum.

## rats-disc

- **Plano 1, aberto, corte (5,1 s).** 0,0: a bancada, a placa do laboratório. 0,6 "ratos": os dois ratos sobem no disco (0,8 s). 2,9 "disco": o disco dá um quarto de volta, devagar. 4,3 "água": a água da bandeja ondula. Som: nenhum.
- **Plano 2, close, câmera (7,5 s).** 0,0: a câmera fecha no rato do teste (0,7 s). 1,7 "começava": a pálpebra dele desce aos poucos (1,2 s) e a cabeça pende. 3,4 "disco": o disco gira (aviso de 0,2 s, giro de 0,8 s) e leva os dois para a beirada. 4,8 "dois": os dois andam contra o giro, com os passos marcados. 6,3 "fora": param, de olhos abertos. Som: o disco em 3,4.
- **Plano 3, médio, câmera (6,1 s).** 0,0: a câmera recua para os dois (0,6 s). 0,1 "outro": a etiqueta "comparação" estoura sobre o segundo. 3,1 "dormir": ele fecha os olhos e ressona, "zzz". 4,2 "primeiro": o do teste o olha, de olhos arregalados. Som: nenhum.

## rats-result

- **Plano 1, close, câmera (3,8 s).** 0,0: os ratos de comparação. 1,9 "continuaram": o visto verde estoura; eles se limpam e farejam. Vivo: bigodes, orelhas. Som: nenhum.
- **Plano 2, médio, câmera (4,3 s).** 0,0: a câmera desliza aos dez, em fila, sob o calendário (0,7 s). 0,3 "impedidos": o calendário começa a se preencher, um dia de cada vez. 1,4 "morreram": os ratos baixam a cabeça em cascata. Sem estouro e sem tremor: o plano fica quieto. Som: nenhum.
- **Plano 3, médio, câmera (4,3 s).** 0,9 "onze": o aro e "dia 11" estouram; o primeiro rato vira silhueta apagada (0,6 s). Os outros viram um a um até 2,6 "pouco": o aro e "dia 32", e o último. A cor sai devagar, sem queda. Som: nenhum.

## unknown-cause

- **Plano 1, close, câmera (6,5 s).** 0,0: a prancheta de exame. 1,7 "procurou": os itens ganham visto, um a um (0,25 s entre eles). 3,2 "causa": a linha "causa da morte" fica em branco e o lápis para sobre ela. 4,6 "sem": a interrogação estoura; Rechtschaffen coça a cabeça (0,8 s). Som: nenhum.
- **Plano 2, médio, corte (6,3 s).** 0,0: a balança vazia. 1,8 "falta": o rato de olho fechado pousa num prato e a etiqueta "sem sono" estoura; a balança pende. 3,8 "estresse": o despertador pousa no outro, com a etiqueta; ela pende para lá. Até o fim: oscila devagar e não assenta. Som: nenhum.

## awake-record

- **Plano 1, médio, corte (6,3 s).** 0,0: o disco dos ratos, vazio, no centro. 0,7 "gente": ele encolhe para o canto (0,7 s). 2,5 "documentados": Gardner entra andando pela direita (0,9 s). 5,0 "Rêndi": a etiqueta de nome estoura. Vivo: ele respira e olha em volta. Som: nenhum.
- **Plano 2, médio, corte (6,4 s).** 0,0: o quarto. 0,1 "dezembro": o calendário de dezembro de 1963 estoura na parede. 3,4 "dezessete": a etiqueta "17 anos" estoura sobre Gardner. 5,5 "dois": os amigos entram, um de cada lado (0,6 s cada). Som: nenhum.
- **Plano 3, close, câmera (2,8 s).** 0,0: a câmera chega ao cartaz (0,6 s). 0,5 "recorde": o cartaz "recorde: 260 h" estoura; os três viram a cabeça para ele (0,3 s). Som: nenhum.
- **Plano 4, médio, câmera (2,9 s).** 0,0: a câmera volta aos três (0,5 s). 0,1 "cara": a moeda sobe girando e cai (0,9 s, com queda). 1,1 "cobaia": os dois amigos apontam para Gardner (0,3 s), que arregala os olhos em 1,6. Som: a moeda em 0,1.

## gardner-hours

- **Plano 1, close, câmera (6,1 s).** 0,0: a câmera fecha em Gardner e no contador (0,6 s). 0,9 "ficou": o contador corre de 236 para 264 (3,0 s, constante), e as olheiras dele crescem junto. 4,1 "quatro": ao passar de 260 o visor fica coral e dá um pulo. O calendário vira de dezembro para janeiro em 2,0. Som: nenhum.
- **Plano 2, aberto, transformação (6,1 s).** 0,0: o quarto encolhe e some no fundo menta (0,5 s). 0,1 "onze": as onze mesas entram uma a uma, da esquerda para a direita e de cima para baixo (0,15 s entre elas), cada uma com ele mais caído. 4,4 "uma": na última, a cabeça encosta na mesa. Vivo: o vapor de cada xícara. Som: nenhum.

## gardner-sleeps

- **Plano 1, médio, câmera (7,7 s).** 0,0: Gardner de pé, oscilando. 1,4 "pesquisador": Dement entra pela direita com a prancheta, e a etiqueta de nome estoura em 2,0. 3,6 "náusea": o balão do enjoo estoura. 4,5 "memória": o do branco. 6,7 "irritado": o da raiva. A cada balão, Gardner muda de pose. Som: nenhum.
- **Plano 2, médio, câmera (5,5 s).** 0,0: a cama, o relógio e a régua com a barra "8 h"; o bolso, cheio, no canto. 0,8 "deitou": ele desaba na cama (0,6 s), com "ZZZ". 2,0 "catorze": o ponteiro do relógio dá a volta e passa dela (1,2 s, constante), e a barra dele cresce na régua até passar da "8 h". 4,6 "oito": a barra "8 h" pisca. Som: nenhum.
- **Plano 3, médio, câmera (5,6 s).** 0,0: a cama desce e cresce (0,6 s). 0,1 "cobrança": a conta sai do bolso e se abre ao lado da cama (0,9 s). 3,1 "compensa": o carimbo "cobrado" pisca. 4,5 "agora": a conta inclina na direção dele. Som: nenhum.
- **Plano 4, close, câmera (5,8 s).** 0,0: a câmera fecha na conta (0,7 s). 2,2 "hora": as onze luas são riscadas uma a uma, de um lado. 3,3 "catorze": "14 h" estoura do outro. 4,4 "onze": as luas piscam juntas. Som: nenhum.
- **Plano 5, close, câmera (3,7 s).** 1,9 "sono": a seta desce de "14 h" (0,5 s) e a etiqueta "mais fundo" estoura em 2,2. 3,0: o bolso surge ao lado da conta. Som: nenhum.

## so-far

- **Plano 1, aberto, corte (2,3 s).** 0,0: a fila dos ícones no alto e as três molduras apagadas embaixo. 0,6 "três": o despertador ganha o X (0,3 s). 1,6 "falharam": os três X piscam juntos. Som: nenhum.
- **Plano 2, médio, câmera (3,2 s).** 0,0: a fila sai por cima (0,4 s) e a câmera chega à moldura "1". 0,1 "Dormindo": a moldura acende, e a elefanta e a barra entram em 1,4 "elefanta". Som: nenhum.
- **Plano 3, close, câmera (3,2 s).** 0,0: a câmera desliza à moldura "2" (0,6 s). 0,1 "Sem": acende, e a água-viva entra, de braços caídos, em 1,2 "água". Vivo: ela pulsa devagar. Som: nenhum.
- **Plano 4, médio, câmera (7,3 s).** 0,0: a câmera desliza à moldura "3" (0,6 s). 0,1 "mantidos": acende. 2,2 "ratos": o disco entra, com o rato do teste em silhueta. 4,2 "Gárdner": a cama entra com ele dormindo, e o relógio "14 h" estoura em 5,5. Som: nenhum.
- **Plano 5, aberto, câmera (6,8 s).** 0,0: a câmera recua até as três molduras (0,8 s) e o fundo passa ao menta. 0,1 "pergunta": o pedestal sobe embaixo delas (0,7 s). 1,7 "resposta": a lupa do gancho entra e pousa ao lado dele. 2,6 "nenhum": o foco de luz acende sobre o contorno vazio, que fica vazio. Som: nenhum.

## but-what

- **Plano 1, médio, corte (3,0 s).** 0,0: a fila dos ícones, com os três do meio riscados. 0,9 "última": a porta da loja acende e cresce (0,5 s). Som: nenhum.
- **Plano 2, médio, transformação (6,0 s).** 0,0: o ícone cresce até virar a porta baixada, e a rua de noite se monta em volta (1,0 s); a fila some. 1,0 "consegue": a luz por baixo da porta oscila. 3,3 "faz": uma sombra passa por trás da fresta (1,2 s, constante). Vivo: a lâmpada da rua, a lua. Som: nenhum.
- **Plano 3, close, câmera (7,2 s).** 0,0: a câmera chega à porta (0,8 s). 1,4 "está": a interrogação estoura na porta. 3,0 "parte": o medalhão da caixa de estoque acende sobre ela (0,4 s). 6,0 "memória": o medalhão pulsa. Som: nenhum.

## memory-test

- **Plano 1, médio, corte (5,8 s).** 0,0: a sala, a mesa. 1,9 "mil": o calendário "1924" estoura na parede. 4,5 "Duas": os dois pesquisadores entregam uma lista a cada pessoa (0,7 s, uma depois da outra). Vivo: respiram, piscam. Som: nenhum.
- **Plano 2, close, câmera (5,1 s).** 0,0: a câmera fecha na lista (0,7 s). 0,8 "sílabas": as sílabas se escrevem uma a uma (0,1 s entre elas). 2,1 "todos": o calendário atrás folheia, constante, até 3,8 "meses". Vivo: o olho de quem lê percorre a lista. Som: nenhum.

## memory-result

- **Plano 1, médio, corte (6,4 s).** 0,0: a tela dividida, os dois lados apagados. 1,2 "dormiam": acende o lado de quem dorme, com a lista na cabeceira e "ZZZ". 4,0 "passavam": acende o outro, com a mesma pessoa acordada e o relógio correndo as mesmas horas. Som: nenhum.
- **Plano 2, close, câmera (4,4 s).** 0,0: a câmera chega às duas listas (0,6 s). 0,5 "dormiam": na de quem ficou acordado, as sílabas apagam uma a uma (0,1 s entre elas); na outra, menos. 1,1 "esqueciam": a etiqueta "de 1 a 8 h depois" estoura. 2,9 "só": "só duas" estoura sobre as duas pessoas. Som: nenhum.
- **Plano 3, aberto, câmera (3,2 s).** 0,0: a câmera recua (0,6 s). 0,2 "resultado": a estante cresce do chão, prateleira por prateleira (1,2 s). 1,5 "século": a etiqueta "mais de 100 anos de pesquisa" estoura. Som: nenhum.

## stockroom

- **Plano 1, médio, transformação (2,7 s).** 0,0: a lista acesa sobe até a cabeça de perfil (0,7 s). 1,6 "cérebro": o cérebro acende dentro dela (0,4 s). Som: nenhum.
- **Plano 2, aberto, transformação (3,7 s).** 0,0: a câmera entra no cérebro, que se abre e vira a fachada da loja (0,9 s, pela silhueta clara). 0,7 "passa": dois fregueses entram andando. 1,9 "recebendo": três caixas descem à porta, uma a uma (com queda). Vivo: o toldo balança. Som: nenhum.
- **Plano 3, médio, câmera (7,3 s).** 0,0: a câmera entra na loja (0,8 s). 1,0 "aberta": a lojista atende um freguês, que sai, e entra outro (1,5 s cada). 3,4 "guardar": ela olha para as caixas e é chamada de volta. 5,5 "chega": mais uma caixa na pilha da entrada, que balança. Som: nenhum.

## stockroom-night

- **Plano 1, médio, varredura (5,5 s).** 0,9 "baixar": a porta de enrolar desce com peso (1,0 s), e a noite desce com ela. 2,5 "levar": a lojista pega uma caixa e anda até o depósito (1,5 s); volta para outra. Vivo: a lâmpada. Som: a porta em 0,9.
- **Plano 2, médio, transformação (3,2 s).** 0,0: a loja encolhe até caber na lente que sai da cabeça de quem dorme na cama (0,8 s). 1,0 "cérebro": a lente pulsa. Vivo: o cobertor sobe e desce, "ZZZ". Som: nenhum.
- **Plano 3, close, câmera (6,5 s).** 0,0: a câmera volta à loja, perto da lojista (0,7 s). 0,1 "repassa": ela abre uma caixa, e a lembrança sobe e brilha (0,8 s). 2,5 "leva": ela a põe na prateleira do fundo, e a câmera recua. 3,7 "provisório": a etiqueta estoura na entrada; 5,1 "longo": "longo prazo", no depósito. Som: nenhum.

## stockroom-solid

- **Plano 1, aberto, corte (5,4 s).** 0,0: a loja de longe, de porta baixada. 1,4 "comparação": a lupa entra e para sobre ela (0,8 s). 3,7 "ainda": a lupa passeia devagar pela fachada. Vivo: a luz por baixo da porta. Som: nenhum.
- **Plano 2, médio, corte (4,1 s).** 0,0: a pessoa acorda e se espreguiça (0,8 s). 1,3 "ajuda": o balão com a caixa do rosto estoura. 2,7 "você": ela sorri e aponta para o balão. Som: nenhum.

## nobody-escaped

- **Plano 1, médio, corte (4,5 s).** 0,0: o globo sob a lupa e o pedestal, como no gancho. 0,5 "procura": a lupa dá a última volta no globo (constante). 2,5 "termina": ela para e baixa (0,6 s). 3,4 "sem": o foco de luz sobre o pedestal vazio. Som: nenhum.
- **Plano 2, aberto, corte (8,6 s).** 0,0: a linha do tempo inteira. 0,1 "sono": o marco pulsa. 2,8 "quinhentos": o colchete abre do marco ao fim (0,8 s) e a etiqueta estoura. 4,8 "nenhum": a câmera desliza devagar para o fim da linha, até o pedestal vazio, e para em 7,1 "parar". Vivo: a água, a luz. Som: nenhum.

## one-of-them

- **Plano 1, médio, corte (5,9 s).** 0,0: a pessoa no centro. 0,4 "Nós": a elefanta entra de um lado e a água-viva do outro (0,6 s cada, uma depois da outra). 1,1 "um": os três se olham. 4,3 "larga": a pessoa esfrega os olhos e boceja (0,8 s). Som: nenhum.
- **Plano 2, aberto, câmera (3,4 s).** 0,0: a câmera recua (0,7 s) e a cama entra. 0,2 "deita": ela se deita (0,6 s), com "ZZZ". 1,1 "elefanta": a tromba cai e o olho fecha. 1,8 "água": os braços da água-viva caem. Vivo: os três respiram em fases diferentes. Som: nenhum.

## still-unknown

- **Plano 1, médio, corte (3,2 s).** 0,0: a loja por fora, de porta baixada. 0,7 "falta": a interrogação balança sobre ela. Vivo: a luz por baixo da porta. Som: nenhum.
- **Plano 2, close, corte (5,0 s).** 0,1 "resposta": o medalhão da caixa desce e pousa no contorno de um cérebro, onde cabe (0,6 s). 2,7 "água": a câmera desce até a água-viva (0,7 s), com o contorno tracejado do cérebro que ela não tem. 3,8 "sem": o medalhão tenta descer até ela e fica no ar, sem onde pousar. Som: nenhum.

## what-it-is

- **Plano 1, médio, corte (5,3 s).** 0,0: a pessoa e a barra da vida, com o terço escuro. 2,3 "terço": o terço se acende em índigo, com a lua e as estrelas entrando (0,8 s). 3,7 "dormindo": a pessoa olha para ele. Som: nenhum.
- **Plano 2, aberto, corte (6,7 s).** 0,0: a linha do tempo. 0,1 "animais": os bichos dormindo entram ao longo dela, do começo para o fim (0,35 s entre eles), e a cama por último. 4,7 "corpo": a conta "cobrado" estoura no fim da linha. 5,3 "quando": o carimbo pisca. Som: nenhum.

## tonight

- **Plano 1, aberto, corte (6,5 s).** 0,0: o quadro-negro do gancho, com a árvore e o carimbo. 0,7 "Réctchafen": a etiqueta de nome estoura. 3,1 "dizia": ele ergue o braço para o quadro (0,6 s). Vivo: ele respira. Som: nenhum.
- **Plano 2, close, câmera (2,7 s).** 0,0: a câmera fecha no carimbo "erro?" (0,7 s). 0,8 "erro": ele treme uma vez. Som: nenhum.
- **Plano 3, close, transformação (6,1 s).** 0,3 "erro": o carimbo perde a cor aos poucos (1,5 s) e a moldura fica tracejada. 2,0 "abandonado": os bichos da árvore continuam de olhos fechados. 4,6 "longe": a interrogação pequena estoura ao lado do tronco. Som: o carimbo em 0,3.
- **Plano 4, médio, câmera (8,1 s, com 1,5 s de silêncio).** 0,0: o quadro-negro sai e a pessoa aparece na cama, com a janela e a noite (1,0 s). 1,6 "dormir": "ZZZ" sobe. 3,2 "terço": a lua passa devagar pela janela. 5,4 "sono": a aproximação lenta continua até o fim, sem nada novo. Vivo: o cobertor sobe e desce, as estrelas piscam. Som: nenhum.

## subscribe

- **Plano 1, aberto, corte (5,0 s).** 0,0: os três dormindo, lado a lado. Vivo: respiram em fases diferentes. 2,3 "nós": a câmera recua um pouco (1,0 s). Som: nenhum.
- **Plano 2, médio, câmera (2,6 s).** 0,0: os três encolhem e o planeta da vinheta entra e assenta no centro (0,6 s). 0,1 "curta": ele gira devagar. Som: nenhum.
- **Plano 3, médio, câmera (3,4 s).** 0,1 "assim": os cartões saem do planeta um a um e crescem na direção de quem assiste (0,3 s entre eles). Som: nenhum.
- **Plano 4, aberto, câmera (4,2 s).** 0,1 "só": os cartões se recolhem (0,2 s cada, na ordem inversa). 2,0 "Obrigado": o planeta fica sozinho e dá uma volta lenta até o fim. Som: nenhum.
