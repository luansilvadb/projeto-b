# Som — Algum animal conseguiu parar de dormir?

O arco e o mapa de som do vídeo: o que a música faz em cada trecho, onde ela recua e some, e que ações ganham efeito. É o que a skill `diretor-de-som` decide, o que o `pnpm music` e a montagem leem em `script.json` (`music` e `sfx`) e o que o `critico-de-som` confere.

## Estado

**Piloto da skill `diretor-de-som`, aguardando a escuta do usuário.** O mapa abaixo foi escrito e gerado em 2026-10-06 sem aprovação prévia no papel, por decisão do usuário na entrevista de 2026-10-05 ("paradas: só no piloto"). Nada aqui está aceito: o aceite do som só existe depois do "sim" dele, em `approvals.md`.

Congelados neste piloto, por decisão do usuário: o texto do roteiro e os `holdMs` (a narração e a animação não são reabertas).

## Histórico

- **2026-10-05, primeira trilha.** Uma faixa de fundo única; o usuário recusou três sementes: "a música precisa estar conexa com o vídeo".
- **2026-10-05, dez faixas.** Uma por capítulo, com três silêncios e cinco respiros de 1 s nas viradas. A primeira versão, com marimba, kalimba e caixinha de música, foi recusada: "tá muito infantil; o vídeo é para todas as idades, mesmo feito em vetores não é vídeo infantil". A segunda, com piano, sintetizador e cordas, foi aprovada de ouvido no som do vídeo inteiro.
- **2026-10-05, reaberta pelo usuário.** "A música não tá conexa com o vídeo, me dá impressão que pegou qualquer música ambiente e colocou no vídeo só pra preencher espaço, e essa não é a função de um sonoplasta."
- **2026-10-05 e 06, estudo e piloto.** O estudo de som da referência e os testes do ACE-Step (`out/referencias/kurzgesagt/som/ESTUDO.md`) acharam três causas: o ACE-Step reescrevia a descrição de cada faixa e compunha outra música; dez faixas reescritas davam dez músicas (0,61 oitava de distância de timbre, contra 0,15 a 0,32 dentro de um vídeo da referência); e as faixas morriam nas pontas. O som foi refeito do zero pelo mapa abaixo.

O que continua valendo das decisões antigas: trilha de documentário de ciência para adulto, sem timbre de brinquedo nem clima de desenho animado; piano de feltro, sintetizador analógico quente e cordas como timbres de base.

## Arco

Escrito depois do roteiro aprovado, e por isso sem pedir nada a ele.

- **Timbres de base:** piano de feltro, sintetizador analógico quente, cordas. Em toda descrição: `felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental`.
- **Andamento e tom:** 96 bpm; lá menor no leito A, dó maior (as mesmas notas) no leito B.
- **Dois leitos**, porque o vídeo tem 9 min 09 s e um leito vai até 7 min 20 s. A troca fica na virada do vídeo, em `but-what` ("mas o que o sono faz?").
  - **Leito A**, de 0:00 a 6:37: o tema curioso, que anda para a frente, enquanto o vídeo procura um animal que não dorme.
  - **Leito B**, de 6:37 ao fim: o mesmo tema resolvido e quente, enquanto o vídeo diz para que o sono serve e fecha.
- **Silêncio de música:** um, em `so-far`, da palavra "Para" ao fim da cena (7 s). A resposta do vídeo, "nenhum animal estudado até hoje conseguiu parar de dormir", é dita sem música, e o leito B entra em seguida, sem cruzar com o A.
- **Silêncios de fala** (os `holdMs` que o roteiro já tinha): 6 s em `the-question`, onde a vinheta toca com a música em primeiro plano; 1,5 s em `tonight`, 0,7 s em `nobody-escaped` e 1 s em cinco viradas de capítulo, curtos demais para a música subir, e ela passa por eles no nível em que está.

## Mapa

### Leitos

| Leito | Trecho | Descrição |
|---|---|---|
| A | `third-of-life` a `so-far` | curious forward-moving theme, gentle steady pulse, clear melody, thoughtful wonder |
| B | `but-what` a `subscribe` | warm hopeful resolution of the same theme, full from the first bar, tender felt piano melody, bowed strings, steady calm pulse |

### Momentos

| Cenas | Instante | O que a música faz | Por quê |
|---|---|---|---|
| `night-falls` a `last-to-know` | 0:58 a 1:13 | o tema abafado e desconfiado: cordas graves seguradas, pulso lento, piano espaçado | a noite cai na savana e o predador chega; era um silêncio no mapa antigo |
| `elephants` a `elephant-awake` | 2:04 a 2:43 | o tema largo e quente: acordes longos de cordas, devagar e aberto | as elefantas na savana de dia, o capítulo mais calmo |
| `jellyfish` a `jellyfish-debt` | 3:13 a 4:14 | o tema sem peso: pads lentos, sub-grave suave, piano ralo, sem percussão | a lagoa e o bicho sem cérebro |
| `forced-awake` a `rats-disc` | 4:29 a 5:02 | o tema apertando: ostinato de cordas em staccato, piano grave, urgência contida | o laboratório e o disco que não deixa dormir |
| `rats-result` a `unknown-cause` | 5:02 a 5:27 | o tema reduzido a uma nota grave segurada e a notas de piano espaçadas, sem pulso | os ratos morrem e ninguém acha a causa; o fato mais pesado do vídeo |
| `what-it-is` a `tonight` | 8:21 a 8:54 | o tema desacelerado: piano sozinho em notas longas sobre um pad de cordas, sem pulso | o fechamento, até "que seja um bom sono" |

O gancho não tem momento: um trecho refeito no segundo zero não tem música antes dele, e na primeira geração abriu o vídeo com 4 s de silêncio.

### Níveis e silêncios

| Cena | Nível | Por quê |
|---|---|---|
| vídeo inteiro | `leito`, 13 dB abaixo da voz | a referência; a trilha antiga ficava a 18 |
| `the-question`, os 6 s de silêncio de fala | primeiro plano, 3 dB | a vinheta |
| `so-far`, de "Para" ao fim | sem música | a resposta do vídeo |
| `tonight` | `recuo` | a última fala, dita baixo |
| `subscribe` | `leito` | a chamada |

Saíram do mapa antigo: o silêncio de `last-to-know` (virou momento), o de `rats-result` (virou momento, sem `recuo`: os dois juntos fizeram a música sumir na segunda geração), e a subida da música nos cinco respiros de 1 s e no de 1,5 s de `tonight`.

### Efeitos colocados

Nove, com os quatro sons que o catálogo tem. Os cinco primeiros da lista de baixo estavam em tags nas cenas e tocam nos mesmos quadros.

| Cena, plano | Ação | Uso | Nível |
|---|---|---|---|
| `jellyfish-platform` 1 | a plataforma é puxada | `whoosh` | normal |
| `jellyfish-debt` 2 | o primeiro jato de água | `splash` | normal |
| `rats-disc` 2 | o disco gira | `whoosh` | normal |
| `awake-record` 4 | a moeda cai | `coinDrop` | normal |
| `stockroom-night` 1 | a porta de enrolar desce | `shutterDown` | normal |
| `skip-a-night` 2 | o dia varre o quadro | `whoosh` | leve |
| `two-hours` 1 | a régua entra em varredura | `whoosh` | leve |
| `elephant-awake` 1 | o dia varre o quadro | `whoosh` | leve |
| `jellyfish-night` 1 | a noite desce | `whoosh` | leve |

### Efeitos pendentes

São 0,9 por minuto; a referência tem de 4,4 a 12,3. Chegar lá pede sons novos, e cada som é escolhido de ouvido pelo usuário (`diretor-de-som/efeitos/escolha`). A dose (ralo, médio ou cheio) também é decisão dele.

Ações da partitura que pedem som e não têm um no catálogo:

| Cena, plano | Ação | Uso que falta |
|---|---|---|
| `biggest-mistake` 4, `tonight` 3 | o carimbo "erro?" bate no quadro-negro; perde a cor | carimbo |
| `sleep-debt` 1 | o carimbo "cobrado" bate na conta | carimbo |
| `time-to-fix` 1 | a tesoura corta o galho ("SNIP") | tesoura |
| `sleep-debt` 1 | o bicho desaba ("PLOFT") | queda de corpo no chão de terra |
| `debt-returns` 1, `older-than-brain` 1 | a conta dobra e entra no bolso | papel dobrado |
| `forced-awake` 2 | o despertador toca ("TRIIIM") | despertador de corda |
| `jellyfish-debt` 2 | o segundo e o terceiro jato ("PSSST") | jato de água (o `splash` é uma queda na água) |
| `jellyfish` 1 | a água-viva pousa na areia | pouso macio na areia |
| `stockroom` 2 | três caixas descem à porta | caixa de papelão pousando |
| `gardner-sleeps` 2 | Gardner desaba na cama | queda em colchão |
| vários | o visto que se desenha; o X que risca um ícone | risco de giz ou de caneta, um som para a família |
| vários | a etiqueta ou o número que estoura | estouro curto, um som para a família (hoje a regra do canal é texto sem som; a referência não foi medida nisso) |

O efeito dos olhos que acendem em `last-to-know` (um acento curto e agudo) também espera um som.

## Depois da poda dos ecos (2026-10-08)

A narração encurtou 23 s do capítulo de Gardner ao fim, e o vídeo passou a 9 min 09 s. O leito A é o mesmo arquivo do piloto, usado até 6:37; os momentos dele não mudaram de instante. O leito B foi gerado de novo (semente 1), com o momento do fechamento, porque `nobody-escaped` e `tonight` encurtaram antes dele. O silêncio de `so-far` continua indo de "Para" ao fim da cena (6,9 s).

Medidas do som novo (`pnpm critique why-we-sleep som`): música 13,7 dB abaixo da voz; 9,3 dB do trecho mais presente ao mais recuado (era 7,3; a faixa vai a 9,6); 1,2% do tempo sem música; 1,0 virada de volume por minuto; variação de timbre de 0,19 oitava (era 0,27). As duas medidas de efeitos continuam fora da faixa, pelo mesmo motivo do piloto. O leito B novo ainda não foi ouvido pelo usuário.

## Crítica do piloto (2026-10-06)

Som julgado: `out/why-we-sleep.som.mp3`, com a trilha da semente 1 e dois momentos refeitos com a semente 2. O `critico-de-som` julgou a versão anterior a esse conserto; as medidas abaixo são da versão final.

| Medida | Trilha antiga | Piloto | Referência |
|---|---|---|---|
| Música abaixo da voz, sob a fala | 18,1 dB | 13,8 dB | 9 a 15 |
| Do trecho mais presente ao mais recuado | 13,2 dB | 7,3 dB | 4,5 a 9,6 |
| Tempo sem música | 5,1% | 1,2% | até 2,4% |
| Viradas de volume por minuto | 2,2 | 0,9 | até 1,1 |
| Variação de timbre ao longo do vídeo | 0,43 oitava | 0,27 | 0,15 a 0,32 |
| Efeitos que se ouvem, por minuto | 1,9 | 2,0 | 4,4 ou mais |
| Pico do efeito abaixo da voz | 14,1 dB | 16,2 dB | 11,5 a 14,7 |

As duas últimas estão fora da faixa e medem o piso de vazamento da separação, não os nove efeitos colocados: faltam sons no catálogo.

**Consertado depois da crítica.** O bloqueante: em `rats-result` a música sumia de 5:06 a 5:22 e estourava 10 dB acima do leito em 5:23. A descrição pedia "very quiet" e o nível `recuo` tirava mais 4 dB. O momento foi refeito com outra descrição e o `recuo` saiu.

**Em aberto, para o ouvido do usuário decidir se pede outra geração:**

1. **A morte dos ratos não ficou quieta.** Das três tentativas, uma saiu mais alta que tudo, uma sumiu, e a atual toca cheia (3,6 notas por segundo, 2 dB acima do trecho anterior, entrada com degrau de 7,7 dB na faixa). O `repaint` não deu aqui um meio-termo entre o cheio e o silêncio. Alternativas: devolver o silêncio de música a esse trecho (seria o segundo do vídeo), ou aceitar a música cheia.
2. **O fechamento não muda a música.** Duas descrições e duas sementes: a densidade fica igual (3,9 notas por segundo dentro, 3,7 antes).
3. **O primeiro minuto está baixo.** O leito A toca 4 a 5 dB abaixo do próprio corpo até 1:09, e afunda sob a pergunta do gancho (0:33 a 0:40) antes de a vinheta subir. Conserto: outra semente do leito A, meia hora de GPU.
4. **A música encosta na fala no laboratório.** De 4:34 a 4:57 fica a 7,5 a 8,8 dB da voz, abaixo do piso de 9.
5. **A noite na savana não soa abafada**, e tem um salto de 12 dB em 1:01.
6. **Os momentos saem de 1 a 5 dB mais presentes que o leito**, inclusive os dois que o mapa quer mais calmos (elefantas e lagoa).
7. **O leito B fica 106 s sem mudar de seção** (6:53 a 8:39), e afunda e volta em 8:14 a 8:34.
8. **Três `whoosh` de nível `leve` e o do disco não aparecem na medida** (2:22, 2:32, 3:30, 4:52), e o da plataforma (3:42) é longo e chega 1 a 2 s depois do puxão.

O que a medida diz dos momentos, no conjunto: o `repaint` põe a mudança no segundo certo e sem buraco, mas o que muda é sobretudo o volume; o caráter pedido ("abafado", "largo", "sem peso") a medida não confirma, e só o ouvido diz.

## Roteiro de escuta

Arquivo: `out/why-we-sleep.som.mp3` (voz, trilha e efeitos). O som antigo, para comparar: `out/som/why-we-sleep/antes/why-we-sleep.som.mp3`.

| Instante | O que acontece | Pergunta |
|---|---|---|
| vídeo inteiro | | Parece uma música feita para este vídeo, e uma música só? |
| 0:00 a 0:30 | o gancho, com a música a 16 a 18 dB da voz | Dá para ouvir a música como música, e não como um fundo? |
| 0:30 a 0:48 | a pergunta e a vinheta | A música some sob a pergunta e depois estoura? |
| 0:58 a 1:13 | a noite na savana | A música fica mais desconfiada? Em 1:01 há um acento que assusta? |
| 2:04 a 2:43 | as elefantas | Fica mais larga e calma, ou só mais alta? As costuras se notam? |
| 3:13 a 4:14 | a lagoa | A música fica sem peso? |
| 4:28 a 5:02 | o laboratório | Dá para entender a fala sem esforço? |
| 5:02 a 5:27 | a morte dos ratos | A música pesa, atrapalha, ou devia sumir? |
| 5:27 | começa Gardner | A música volta sem tranco? |
| 6:43 a 6:54 | a resposta sem música, e o leito B | O silêncio pesa? A música nova entra cheia, e parece a mesma, resolvida? |
| 8:14 a 8:34 | o leito B recua e volta | A música afunda e volta? |
| 8:41 a 9:17 | o fechamento | A música muda? Soa terna, e não infantil? A última fala se entende? |
| 1:17, 2:22, 2:32, 3:30 | `whoosh` leve das varreduras | Dá para ouvir? Faz falta? |
| 3:42, 4:05, 4:52, 5:44, 7:46 | plataforma, jato, disco, moeda, porta | Cada som cai junto com a ação e é do tamanho da coisa? |
| vídeo inteiro | 9 efeitos em 9 min 32 s | A imagem se mexe em silêncio demais? Quer a dose ralo, médio ou cheio? |
