## PERGUNTA
No som, o que o agente resolve sozinho, o que pede só o ouvido do usuário e o que é decisão dele, e como cada coisa chega a quem ouve?

## RESPOSTA

**Princípio.** O usuário não aprova parâmetros de som. Entre soluções que realizam a mesma intenção sonora, o agente projeta, gera, mede e itera; entre intenções válidas que mudam a experiência, o usuário escolhe ouvindo. E, como o agente não ouve, o usuário é também o **ouvido** do trabalho. **Escutar não é decidir**: precisar do ouvido dele para saber se algo funcionou não faz daquilo uma escolha dele.

**Três classes**, e só a terceira é escolha de produto:

- **Execução.** O agente resolve, e muda de novo quando acha melhor: os timbres, o andamento e o tom como hipótese tirada do vídeo, da voz, da partitura e do que o canal já decidiu; a redação da descrição; a semente; onde a troca de leito e a borda de um momento caem; o momento que o roteiro ou a partitura pedem (pesa, abre, rarefaz); o silêncio de música que realiza uma intenção já decidida; o nível que devolve a fala; a primeira dose de efeitos, o efeito local que entra ou sai e o nível `forte` no impacto que a cena prepara; o som do catálogo que já serve ao uso; a costura; a parte gerada de novo porque não realizou o mapa.
- **Evidência auditiva.** O que só o ouvido percebe, pedido com uma pergunta: "soa infantil?", "a troca tem tranco?", "o efeito é do tamanho da ação?", "ficou mais vazio, ou só mais baixo?". A resposta é uma observação sobre o que foi percebido, que volta ao agente. Se confirma o defeito perguntado, o agente corrige; se elimina a dúvida, ela se encerra e nada além disso fica aprovado: o timbre, o andamento e a descrição que a produziram continuam livres para mudar.
- **Decisão.** Duas soluções que funcionam e mudam a emoção principal, a identidade sonora, o grau de presença, o ritmo, o peso, a leitura de uma cena ou um precedente do canal.

**O teste**, diante de duas versões sonoras que funcionam (o de `conducao/entrevista`, na pasta da skill `diretor-criativo`): quem assiste viveria essencialmente a mesma cena, com o mesmo peso, o mesmo ritmo e a mesma leitura? Se sim, é execução. A pergunta ao usuário é sempre sobre a experiência, nunca sobre o parâmetro: urgência ou contemplação, e não 92 ou 98 BPM; clínico ou caloroso, e não o nome do instrumento ou do tom. O silêncio de fala (`holdMs`) passa pelo mesmo teste, julgado no trecho do texto ou no animatic, nunca em dois números de milissegundos (`etapas/arco-de-som.md`).

**Defeito não é opção.** O que a medida ou o runtime acusam (a música cobre a fala, a faixa morre antes da troca, o momento não cabe, o efeito cai no instante errado, o mapa pede uma ação que a partitura não tem) é consertado sem pergunta. Só há A e B quando os dois passam: se um tem buraco, cobre a voz ou contraria uma decisão que o canal já tomou (ciência para adulto, sem timbre de brinquedo), o outro segue sozinho. Decisão anterior é entrada, e não volta a ser perguntada a cada vídeo.

**A medida elimina, não prova gosto.** Entre duas gerações, a que tem buraco de 8 s ou salto de 10 dB sai, e a outra fica como a melhor hipótese técnica; "musicalmente melhor", só o ouvido diz. O agente relata o que mediu e o que a descrição pediu, e o que falta ouvir: "a densidade caiu 30%; falta confirmar se soa triste ou só vazio".

**Artefato antes da pergunta.** A descrição é hipótese de geração: serve ao modelo, que a realiza de modo imprevisível, e ninguém escolhe por ela uma música que ainda não existe. Minutos de GPU se desfazem; uma rodada do usuário sobre abstrações que só o som prova custa mais e dá falsa certeza.

- **O menor som que responde a dúvida**: a identidade, num leito sem momentos nem efeitos; a mudança local, naquele momento; o efeito novo, nos candidatos daquele uso; a costura, no trecho em volta dela.
- **Uma hipótese forte primeiro.** Gere, meça, conserte o que a medida acusa e peça o ouvido só para o que ela não vê. Se funciona, siga.
- **A e B quando a primeira hipótese revelou uma troca real**: duas direções que passam e que, lado a lado, fazem cenas diferentes. Chegam como arquivos do mesmo trecho, com a diferença dita em uma frase de experiência e a recomendação.
- **O que faz duas ideias é a experiência ouvida**, e não o texto. Duas sementes, ou duas descrições com outras palavras, podem ser a mesma intenção: uma segue como hipótese atual e é julgada no contexto do vídeo, sem votação.
- **Perguntar antes de gerar** cabe quando as duas intenções pedem trilhas inteiras diferentes, o trabalho descartado seria grande e a diferença já se diz em termos concretos. "Cada leito custa alguns minutos" não basta.

**O mapa** é o estado atual de como o agente pretende realizar a intenção, e cresce com o que foi ouvido: o leito primeiro, depois o momento onde a mudança é necessária, os níveis onde a fala ou a imagem pedem, os efeitos. Muda quando a geração, a crítica, a escuta ou a animação mostram outra coisa. A ordem (o leito antes dos momentos sobre ele, a partitura antes dos efeitos, o som real antes da escuta) é dependência, e não aprovação.

**Percepção, hipótese, artefato.** O usuário nomeia o que percebeu ("está infantil"); o agente diagnostica depois (o registro, a articulação, a melodia, o timbre), muda a menor coisa, gera o menor trecho, mede, e volta ao ouvido só se a questão ainda é de ouvido. A pergunta não traz a solução ("quer tirar o piano?") nem pede ao usuário o instrumento, o tom ou a mixagem: quem traduz "quero que pese mais" é o agente. O detalhe técnico que ele dá por conta própria ("sem bateria") é entrada, usada sem nova entrevista.

**Roteiro de escuta.** Todo pedido de escuta leva o arquivo e os instantes, cada um com uma pergunta de sim ou não sobre o que se percebe. Chega depois da crítica e dos consertos: o usuário ouve a melhor hipótese disponível, e não procura o buraco, o efeito ausente ou o nível fora que a ferramenta já acusa. Pode chegar cedo, sobre um leito só, quando uma dúvida de identidade invalidaria o resto. Entram nele:

- as dúvidas de ouvido ainda abertas (o caráter, a unidade, a naturalidade, se uma transição chama atenção, se o som é do tamanho do desenho);
- os pontos que a crítica marcou e cuja gravidade depende do ouvido, com a medida ao lado;
- as decisões de verdade em aberto, em A e B;
- no som inteiro, uma pergunta para o todo.

Três dúvidas, três instantes; o roteiro não audita cada linha do mapa.

**O som do catálogo.** Para um uso novo, o candidato ou os candidatos que sobram (`escolha`) vão ao usuário porque só ele ouve se soam como a ação. É classificação de ouvido: o resultado é "este arquivo realiza o uso", e o catálogo o guarda para todo vídeo seguinte. O uso que já existe é reutilizado sem consulta; volta ao usuário se o som falha no contexto, ou se o que está em jogo é a linguagem de efeitos do canal (discreta ou cartunesca), que é decisão.

**O aceite do som** é a única aprovação da etapa, pedida sobre o conjunto. Fixa o que o usuário aceitou ouvir: a identidade percebida, a relação entre música e voz, a densidade, os momentos que carregam sentido, a experiência do todo. A semente, a descrição, o andamento, o tom, o arquivo, o dB e as linhas do mapa continuam melhorando. Antes de mexer em som aceito: a mudança preserva o que ele aceitou ouvir? Se preserva (a costura sem salto, a semente que realiza melhor, o efeito alinhado), corrija e confira o trecho afetado, sem reabrir o aceite. Se muda a identidade, a emoção, o ritmo ou a presença, volta a ele.

**Registro.** `sound.md` guarda a intenção e a implementação atuais e acompanha a melhor solução; fica protegido como compromisso só o que o usuário decidiu. A observação de ouvido e a resposta a uma sondagem não vão a `approvals.md`, que recebe o aceite. Descrição e semente tentadas e recusadas são do git.

**A skill `grilling`** é exceção: cabe à decisão que atravessa o vídeo ou o canal e que um som curto não materializa (a identidade musical do canal, a política de efeitos, a intenção afetiva ambígua de um vídeo inteiro). Andamento, uma troca, um efeito, uma semente ou um momento se resolvem gerando e ouvindo.

## LIMITES
- Não afirmar o que não foi ouvido ("ficou quente", "esta semente é melhor"): dizer o que foi medido, o que a descrição pediu e o que falta ouvir.
- Não pedir escuta sem pergunta ("ouve e me diz o que acha").
- Não pedir o aceite sem o roteiro de escuta do conjunto.

## EXEMPLO
> **Execução.** A semente 1 do leito B morre 9 s antes da troca; a 2, não. Segue a 2, sem pergunta. O momento de `rats-result` pedia rarefação e saiu 3 dB mais alto e mais cheio: é gerado de novo.
>
> **Evidência auditiva**, sobre o primeiro leito, antes dos momentos e dos efeitos:
> `public/videos/why-we-sleep/music.wav`, de 0:40 a 1:10 — soa como documentário para adulto, ou como desenho infantil?
> "Infantil": a hipótese é o registro agudo da melodia; outra descrição, outro leito, a mesma pergunta. "Agora não": o mapa cresce a partir dele, sem linha em `approvals.md`.
>
> **Decisão**, em `so-far`, com as duas versões medidas e sem defeito:
> A) `out/rascunho/so-far-a.mp3`: a resposta dita sem música. Chega como choque.
> B) `out/rascunho/so-far-b.mp3`: a música segue, rala. Chega como ternura.
> Recomendo A: o vídeo preparou essa frase por seis minutos. Custo: é o único silêncio do vídeo, e ele se nota.
>
> **Roteiro de escuta** de `out/why-we-sleep/why-we-sleep.som.mp3`:
> 4:28 — entra o laboratório: a mudança soa como outra música?
> 5:02 a 5:27 — a morte dos ratos, em `recuo` (música 17 dB abaixo da voz): a música pesa, ou some?
> Vídeo inteiro — parece uma música feita para este vídeo?
