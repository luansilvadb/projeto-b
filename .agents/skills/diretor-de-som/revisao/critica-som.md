## PERGUNTA
Como distinguir, no som de um render, o defeito técnico, o sinal de medida e a dúvida que só o ouvido resolve?

## RESPOSTA

**Quando aplicar.** Sobre o som do vídeo inteiro, depois de gerado e mixado, antes do aceite; depois de um conserto, só no trecho alterado e no contexto de que ele depende.

**Princípio.** A crítica não ouve, e por isso não transforma uma medida numa percepção. **Medida localiza; contrato prova; ouvido percebe.** Ela prova o que se prova sem ouvido, usa as medidas para localizar uma dúvida e, quando o usuário já disse o que ouviu, trabalha na ordem percepção, hipótese, evidência. **Sem perda demonstrada, não há defeito.**

**Três saídas**, e só a primeira é defeito sem o ouvido:

- **Defeito técnico confirmado.** O que se demonstra sem julgamento auditivo: `sound.md` e `script.json` dizem estados diferentes (um nível, um efeito, uma troca); o `pnpm check-script` recusa o roteiro; o efeito está programado longe do instante que a partitura dá ao acontecimento; o arquivo de um uso pedido não existe; uma parte termina antes do trecho que deveria cobrir, e a ausência se vê no arquivo da trilha ou no render, e não só numa faixa de referência; há ausência de música comprovada onde nada no estado atual pede silêncio; o runtime não realizou o que realiza de forma determinística. É consertado sem voto do usuário.
- **Sinal.** Uma medida ou uma diferença que diz "vale investigar aqui": 0,41 oitava de variação de timbre, 8 ou 18 dB entre música e voz, 12 viradas por minuto, poucos ou muitos efeitos, um salto de 7 dB numa borda, um momento em que o detector não acha mudança de seção, o tempo sem música acima da referência. Sinal não tem gravidade.
- **Dúvida de ouvido.** A resposta que falta é uma percepção: a troca parece outra música? a fala ficou difícil? a música desapareceu? a borda chama atenção? o efeito é do tamanho da ação? a sequência parece vazia? Vai ao roteiro de escuta só quando pesa.

**O que a crítica garante:**

- **Nenhuma percepção é fingida.** Quem não ouviu não escreve "soa como playlist", "a música cobre a fala", "a borda tem tranco", "o efeito pesa", "faltou materialidade", "ficou triste". Escreve o que mediu e o que falta ouvir: "8 dB, abaixo da referência: levanta a dúvida sobre a fala; a crítica não sabe se há disputa"; "18 dB: a música está mais afastada que a referência; se o trabalho dela ali depende de presença, ouvir se ela desaparece". A percepção que o usuário já deu é dado, e não é perguntada de novo.
- **"Sem defeito" é uma conclusão**, e leva o motivo quando havia sinal. Timbre a 0,45 numa transformação que o usuário ouve como desenvolvimento; `recuo` a 17 dB, que é o preset pedido; poucos efeitos num trecho em que nenhuma ação perdeu consequência; 7 dB numa borda que não se nota; um momento sutil que o detector não vê e o ouvido reconhece; 5% sem música em silêncios deliberados que funcionam. Faixa, contagem, heurística e técnica ausente não reprovam.
- **Medida na faixa não salva.** Timbre a 0,25 e o usuário ouve outra música; música a 13 dB e ele perde palavras; 9 efeitos por minuto e tudo soa clique sem dono; 3 dB numa borda e ele ouve o tranco; 0,5% sem música e há um buraco de 2 s numa costura: defeito.
- **O mapa é hipótese, não especificação.** `sound.md` diz que experiência se tentava realizar, e não cobra seção detectada, queda de tantos por cento nem timbre. O som que realiza a intenção por outro mecanismo não tem defeito, e o mapa é que acompanha o produto. O que se cobra do mapa é coerência: ele e `script.json` guardam a mesma hipótese atual.
- **A causa vem antes do sintoma.** Não se afina o nível de um leito errado nem o instante de um efeito cujo uso está errado. A crítica procura a menor causa que explica a perda ou a dúvida.
- **Uma pergunta resolve uma dúvida que pesa.** Antes de escrevê-la: o estado ou o arquivo já explicam o sinal? A mudança foi deliberada? Outra série fecha a dúvida? O trecho já foi ouvido nesse contexto? Algo adiante depende da resposta? Sinal explicado e sem perda plausível fecha em "sem defeito": o usuário não audita sete medidas.
- **A crítica diagnostica, não conserta.** Nomeia a perda ou a dúvida, a hipótese, a evidência e a unidade dona. Semente, descrição, decibel, instrumento e efeito a acrescentar são de quem dirige. No defeito técnico, diz a causa ("a âncora do efeito aponta para outro acontecimento").
- **A correção se confirma no defeito.** Repete-se só a evidência que o mostrou, no trecho e no que depende dele (refeita a parte B, a costura dela), sem reabrir as outras lentes.
- **A crítica termina** quando não há defeito técnico demonstrado nem hipótese que pese ainda sem a evidência de que precisa, e cada sinal restante está explicado ou virou pergunta de ouvido. Não quando as medidas passam.

**Instrumentos**, pelo que cada um pode afirmar:

1. **O estado e o contrato** provam: `sound.md`, os campos `music` e `sfx` do roteiro, o `pnpm check-script`, as linhas "Som:" da partitura, os arquivos da trilha e do catálogo. É por aqui que a crítica começa.
2. **As medidas do vídeo** (`pnpm critique <vídeo> som`) localizam: o som é separado em voz, música e efeitos, e cada camada é comparada com a referência.
3. **As séries segundo a segundo**, gravadas junto, dizem onde: a distância da música à voz, a fala, as mudanças de seção, as viradas de volume, os efeitos. São lidas quando há uma pergunta, no trecho dela; nenhuma linha do mapa precisa de um número que a confirme.
4. **O ouvido do usuário** percebe, e é o único que fecha o que é de percepção.

**Origem das faixas.** O estudo de 2026-10-05 mediu 12 vídeos do Kurzgesagt, sem patrocínio (123 minutos), separados em voz, música e efeitos. `CRITERIA` em `src/critique/sound.ts` é a fonte atual; a calibração e os testes do ACE-Step estão em `out/referencias/kurzgesagt/som/ESTUDO.md`. A geração foi testada com ACE-Step Turbo numa RTX 2060 SUPER; mudar modelo ou placa pede repetir os testes.

**Sensores.** Todas as medidas são sensores. `out` na saída do comando quer dizer "fora da faixa configurada", e nada além disso.

| Medida | Referência | Pode ajudar a localizar |
|---|---|---|
| Música abaixo da voz, sob a fala | 9 a 15 dB | uma dúvida sobre a fala (abaixo) ou sobre a presença da música (acima) |
| Do trecho mais presente ao mais recuado | até 9,6 dB | regiões em que a automação pode chamar atenção |
| Tempo sem música | até 2,4% | ausências e costuras a conferir contra o estado |
| Viradas de volume por minuto | até 1,1 | modulação frequente a investigar |
| Variação de timbre ao longo do vídeo | até 0,32 oitava | a fronteira de identidade a ouvir |
| Efeitos que se ouvem, por minuto | 4,4 a 12,3 (o comando só marca abaixo) | acontecimentos sem consequência sonora, ou efeitos acumulados, a comparar com a imagem |
| Pico do efeito abaixo da voz | 11,5 a 14,7 dB | o efeito que pode sumir ou disputar com a voz |

O que pesa ao ler um sensor:

- **A referência não é a especificação do projeto.** São 12 vídeos de um canal: os valores dizem onde aquele som vive.
- **A separação erra.** A contagem de efeitos tem um piso falso de cerca de 2 por minuto, de música e voz que vazam, e por isso localiza uma região, e não conta os efeitos que existem. A medida de nível é corrigida por uma reta de calibração.
- **O timbre** sobe quando um silêncio longo entra na conta e quando a música se transforma por um motivo, e pode ficar na referência numa trilha que o ouvido acha desconexa.
- **O nível local** não prova que o runtime ignorou um preset: o preset é aplicado de forma determinística, e a densidade da música e o erro da separação mexem no número. Com o roteiro certo, a distância que não bate com a esperada é sensor; só vira falha de realização com outra evidência técnica. `recuo`, `forte` e `leve` ficam fora das referências por projeto (`niveis`, `dose`).
- **O salto numa borda.** Mudanças acima de uns 6 dB merecem inspeção, porque já produziram costuras que se notam. O ouvido é que fecha.
- **O total sem música** não diz se os silêncios são deliberados, se a separação falhou ou se há buraco: diz que vale conferir os trechos contra o estado.

**Quando uma medida ajuda a provar.** Só junto do estado: ela aponta o intervalo, e o arquivo da trilha, o render ou o roteiro mostram que o que o estado atual pede não aconteceu. A música ausente por 8 s onde o mapa pede 6 de silêncio e a parte seguinte entra a −40 dB é falha de realização; o mesmo número sem essa conferência é sinal.

**Lentes.** Cada uma serve a um tipo de sinal ou de percepção, com a pergunta e a unidade dona. Usa-se a que explica o que há para investigar: vídeo sem efeitos, sem sinal e sem intenção ali não passa pela de efeitos.

- **Estado**, quando o mapa, o roteiro e o render podem não dizer a mesma coisa. Cada nível, parte, silêncio, momento e efeito de `sound.md` está em `script.json`, e o contrário? O contrato fecha? O que existe sem intenção escrita é sinal de estado desatualizado, e não se audita cada linha por isso.
- **Identidade** (`leito`, `descricao`), quando o timbre varia muito, há troca de parte, as descrições dos dois lados têm pouco em comum, ou o usuário diz "outra música". A transformação ainda parece da mesma trilha, ou parece substituição arbitrária? A fronteira e as descrições são a evidência; a resposta é do ouvido.
- **Continuidade e ausência** (`leito`, `silencio`), quando há música ausente, uma parte que morre cedo, uma entrada que demora, ou o usuário nota um buraco. Primeiro o que se prova: o estado pede silêncio ali? O arquivo cobre o trecho? Com a falha comprovada, defeito técnico. Sem ela, a pergunta é de ouvido: a ausência faz trabalho, ou parece falha?
- **Momento** (`momentos`), quando o detector mostra pouca mudança ou mudança demais, a borda tem salto, ou o usuário diz "ficou igual" ou "virou outra música". O estado local que o momento precisava produzir aconteceu, e voltou integrado ao leito? Há evidência de que ele não realizou a intenção? Detector que não vê é sinal.
- **Presença** (`niveis`), quando a distância sai da referência ou varia muito, ou o usuário perde a fala, deixa de ouvir a música ou a ouve bombear. A relação entre fala e música funciona naquele trecho? Não "está entre 9 e 15?".
- **Efeitos** (`dose`, `escolha`), quando a densidade ou o pico são extremos, um efeito está fora da âncora, ou o usuário ouve massa ou uma ação muda. Cada efeito tem dono e acrescenta consequência sem disputar? O instante sai da partitura e é técnico; o tamanho e a falta são de ouvido. Não há piso, teto nem cota.

**Gravidade**, pela perda, e só depois de ela estar demonstrada:

- **Bloqueante**: perde-se algo indispensável. A fala deixa de ser entendida; o áudio esperado some por falha técnica; a identidade quebra a ponto de o vídeo parecer montagem de músicas; um efeito muda a leitura de uma ação crucial; mapa e roteiro divergem numa decisão indispensável.
- **Relevante**: o vídeo se entende, e perde identidade, peso, naturalidade, continuidade, materialidade, presença ou clareza.
- **Polimento**: o som já funciona; é ajuste local.

O defeito técnico recebe gravidade sem ouvido, pelo trabalho que o mapa dava àquele trecho. A dúvida ainda não ouvida não recebe: "salto de 8 dB na borda de `rats-result`; se o ouvido perceber tranco, dono `momentos`", e a gravidade vem com a resposta.

**O relatório** tem o tamanho do diagnóstico.

- **Defeitos confirmados**: o trecho ou o instante, o que se perde, a hipótese de causa, a evidência mínima, a unidade dona, a gravidade, e se o conserto mexeria na identidade, na emoção, na presença, na leitura ou no ritmo que o usuário decidiu. A mudança técnica equivalente não reabre decisão.
- **Dúvidas de ouvido**: o trecho, o sinal que a localizou, por que a resposta importa, a pergunta de sim ou não sobre o que se percebe, a unidade provável se confirmar.
- **Sem defeito**: os sinais investigados que não provaram perda, cada um com o motivo. Com tudo coerente, uma linha: "mapa e `script.json` sem divergência encontrada".
- **Sensores**: a tabela com o valor e a referência, como diagnóstico coletado, e não como aprovado ou reprovado.

## DEPENDÊNCIAS
- leito, descricao, momentos, niveis, silencio, dose, escolha: fornecem a pergunta de cada lente e são as donas dos consertos.
- entrevista-som: fornece o formato do roteiro de escuta e o que volta ao usuário.

## LIMITES
- O que refazer, com que semente ou descrição, e o que levar ao usuário pertencem à etapa (`etapas/som`) e a `entrevista-som`.
- Medida fora da referência num som que funciona fica no relatório: não é exceção a aprovar nem compromisso do produto.

## EXEMPLO
> **Defeito técnico, continuidade.** De 6:44 a 6:52 não há música (8 s). O mapa pede silêncio de 6:39 a 6:50; nos 2 s a mais, o arquivo do leito B entra a −40 dB e leva 10 s para chegar ao corpo. Perde-se a retomada depois do silêncio, que o mapa dá como a virada do vídeo. Dono: `leito`. Relevante. Não mexe em nada decidido.
>
> **Dúvida de ouvido.** 4:25 a 4:32: a variação de timbre (0,47) se concentra na troca de 4:28. A troca é deliberada e as duas descrições guardam o mesmo conjunto; a crítica não sabe se soa como ruptura, e o resto da trilha depende disso. Parece desenvolvimento da mesma música, ou começo de outra? Se outra: `leito`.
>
> **Sem defeito.** `recuo` mede 17 dB de 5:02 a 5:27: é o preset pedido, e mapa e roteiro concordam. Efeitos a 3,1 por minuto: a partitura não tem acontecimento sem som nas regiões vazias.
