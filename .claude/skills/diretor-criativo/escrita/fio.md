---
name: fio
description: "Fio: o que faz o texto soar contado por alguém, e não montado frase a frase. Demora, veredito ganho, refrão, promessa plantada e cobrada, personagem com detalhe, caso corrente, conta em voz alta e saída concedida."
---

## PERGUNTA
Como contar o vídeo de modo que cada trecho segure o seguinte, em vez de entregar uma fila de fatos bem-acabados?

## RESPOSTA

**O defeito que esta unidade evita.** Um roteiro pode cumprir `explicacao`, passar em todas as medidas do `pnpm check-script` e ainda soar como texto de IA. Foi o que aconteceu com a quinta versão do `why-we-sleep`: cada achado recebia uma frase polida e um fecho de efeito, e o texto seguia para o próximo, com uma frase de efeito a cada 60 palavras. O ouvinte reconhece a fila.

**Base.** Dois vídeos indicados pelo usuário em 2026-10-04, com estudo em `referencias/`, na pasta desta skill: "A história não contada da JBS", do Spotniks (`narracao-jbs.md`), e "O que as BETS fazem com o seu CÉREBRO", do Ciência Todo Dia (`narracao-bets.md`). O primeiro é um narrador em off que conta, e dá o tom do canal. O segundo é um apresentador que conversa, e dá os mecanismos de argumento.

O **fio** é o que o espectador segura do primeiro ao último minuto. Quatro mecanismos estão nos dois vídeos e valem para todo roteiro; os outros dependem do que o trecho faz.

### Em todo roteiro

**1. Demora.** Cada ideia nova fica na tela e na fala até assentar: o caso concreto, a regra geral e a consequência para quem assiste, antes de a próxima entrar.

- Orçamento: ao menos 150 palavras por ideia nova. Um vídeo de oito minutos carrega de seis a oito ideias. As que sobram na pesquisa são corte, e o corte é decisão do usuário.

**2. Veredito ganho.** A frase de efeito é a leitura do narrador sobre a prova que ele acabou de mostrar. Primeiro vem o fato seco, em série e sem adjetivo (quem, quando, quanto, o que fez); depois, uma frase só. "Dezessete reuniões, três dias de intervalo, trinta bilhões na conta de luz. Uma mera coincidência." A mesma frase, depois de um fato só, é enfeite.

- Entre uma frase de efeito e a seguinte, ao menos 150 palavras de fato concreto. Na referência é uma a cada 180.
- A ironia vem de pôr dois fatos lado a lado e parar ("Uma juíza mandou incluir a empresa em cinco dias. O governo não cumpriu."). O narrador mostra; o espectador conclui.

**3. Refrão.** A tese numa frase de até oito palavras ("a casa nunca perde") ou numa moldura que volta com conteúdo novo ("essa é a história de...", no começo; "no fim, essa não é uma história sobre X, é sobre Y", no fim). Ele aparece depois da prova, nunca antes, e é o veredito dos blocos que provam a tese. Uma palavra pode fazer o mesmo trabalho: "sócio" volta quatro vezes no vídeo da JBS, cada vez com o Estado em outra posição.

- De três a cinco voltas no vídeo. Cada volta diz mais do que a anterior.

**4. Promessa plantada e cobrada.** O narrador marca algo que vai importar ("e essa distinção é importante"; "esse 'em teoria' volta") e, minutos depois, cobra pelo nome, redizendo o que plantou, conforme `ouvinte`. A cobrança traz o que o espectador não tinha quando a promessa foi plantada.

- De uma a três por vídeo, com um a dez minutos entre plantar e cobrar. Toda promessa plantada é cobrada.

### Quando o trecho conta o que alguém fez

**5. Personagem com detalhe.** Quem volta no vídeo ganha nome, ano, lugar e um detalhe pequeno de que o argumento não precisa: "nesse tempo ele abatia cinco cabeças de gado por dia"; "ficou seis meses preso e emagreceu vinte quilos". Vale para pessoa, bicho e instituição ("essa é a hora de apresentar outro personagem"). É o detalhe que faz o texto parecer apurado, e ele entra como uma oração da frase que carrega o fato, conforme `ouvinte`. "Um grupo de pesquisadores" e "um rapaz" são ninguém.

- Até quatro personagens, conforme os poucos elementos de `explicacao`. Cada um com ao menos um detalhe da base de fatos.
- A história é contada na ordem em que aconteceu, com o sujeito repetido pelo nome.

### Quando o trecho argumenta com quem assiste

**6. Caso corrente.** Um caso concreto, com números redondos, montado uma vez e levado até o fim (o jogo do time A contra o time B, a aposta de mil reais). Toda ideia nova passa primeiro por ele, antes de qualquer dado real. Até três por vídeo, cada um servindo a duas ideias ou mais; o inventado é anunciado como suposição ("vamos supor").

**7. Conta em voz alta.** O número que importa é calculado com o espectador, com valores do caso corrente e uma operação por frase: "cem dividido por noventa dá mais ou menos um vírgula onze". É a exceção à regra de um número por frase de `narracao`.

**8. Saída concedida.** O bloco abre com a saída que o espectador tentaria ali, dá a ela o que ela tem de verdadeiro ("e é verdade"; "existe, sim, um caso em que funciona") e a segue até onde ela fecha. Uma depois da outra, as saídas são o caminho do vídeo.

**Ficha do fio.** Escrita antes de qualquer frase e levada ao usuário junto com a estrutura:

```markdown
- Refrão: <a frase, a moldura ou a palavra>, e o que cada volta acrescenta
- Ideias novas, na ordem: <ideia> (<palavras>)
- Vereditos: <bloco>: <o fato em série que vem antes> -> <a frase>
- Promessas: <o que é plantado, em que bloco> -> <onde é cobrada, e o que a cobrança acrescenta>
- Personagens: <nome>: <ano, lugar, detalhe>, e os blocos em que volta
- Casos correntes e saídas, se o vídeo argumenta: <caso>: <ideias a que serve>; <bloco>: <saída> -> <o que é concedido> -> <onde fecha>
```

**Procedimento:**

1. Conte as ideias novas do arco e divida o orçamento de palavras por elas. Pronto quando toda ideia tem 150 palavras ou mais, ou o corte das que sobram foi levado ao usuário.
2. Escreva o refrão. Pronto quando cada volta está presa a um bloco e diz mais do que a anterior.
3. Para cada bloco, liste os fatos secos que ele mostra e, só depois, o veredito. Pronto quando todo veredito tem a sua série escrita antes dele.
4. Escolha os personagens e, na base de fatos, o detalhe de cada um. Pronto quando ninguém que volta no vídeo está sem nome e sem detalhe.
5. Marque as promessas. Pronto quando cada uma tem o bloco em que é plantada, o bloco em que é cobrada e o que a cobrança acrescenta.
6. Nos blocos que argumentam, escolha o caso corrente e a saída que abre cada um. Pronto quando toda ideia desses blocos entra por um caso.
7. Preencha a ficha do fio e leve-a ao usuário, com a estrutura. Só depois escreva as frases, conforme `narracao`.

## DEPENDÊNCIAS
- ouvinte: fornece a regra de redizer, que a cobrança da promessa cumpre, e a do desvio dentro da frase, que o detalhe cumpre.
- arco: fornece os blocos, a cadeia de perguntas e o orçamento de palavras.
- explicacao: fornece a tensão e os poucos elementos; o fio é construído sobre eles.
- moldes: fornece o molde.
- checagem: confere o detalhe de cada personagem, as contas do caso corrente e o que cada concessão afirma.

## LIMITES
- O narrador do canal conta em off e não diz "eu" (decisão do usuário em 2026-10-04). As retomadas viram "lembra de...", "essa distinção volta", "vamos voltar a...".
- Os mecanismos são o que se usa; frases, exemplos e refrões das referências ficam com elas.
- Detalhe de personagem só entra se estiver na base de fatos. Detalhe inventado para dar cor é fabricação.
- O caso corrente inventado não sustenta afirmação: o que ele ilustra precisa estar na base de fatos.
- Nome próprio entra na fala de quem volta no vídeo ou é citado; quem aparece uma vez fica no selo da tela. Nome estrangeiro vai escrito como se pronuncia.

## EXEMPLO
> Fila: "Com gente, ninguém nunca levou isso até o fim. Quem chegou mais longe foi um rapaz de dezessete anos. Ele ficou onze dias acordado. Então nem pense nisso."
> Fio (exemplo de forma; cada afirmação precisa estar na base de fatos antes de entrar num roteiro): "Em mil novecentos e sessenta e quatro, Rêndi Gárdner tinha dezessete anos e ficou acordado sob a observação de um pesquisador do sono, Uíliam Dement. Gárdner passou duzentas e sessenta e quatro horas sem dormir, o que dá onze dias. Teve náusea, a memória falhou, e ele ficou irritado. Quando se deitou, dormiu catorze horas seguidas. Em mil novecentos e noventa e seis, o livro dos recordes parou de registrar esse tipo de tentativa, por achar perigoso demais. Onze dias é o mais longe que alguém foi sob observação."
