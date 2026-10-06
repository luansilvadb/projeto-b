## PERGUNTA
Como descrever ao modelo a música de um leito ou de um momento?

## RESPOSTA

**Princípio.** A descrição é lida ao pé da letra. O gerador recebe o texto como foi escrito (o `pnpm music` desliga a reescrita do ACE-Step, que trocava "suspense contido" por "tímpanos e pratos"), então cada palavra pesa e nenhuma é corrigida.

**As três partes de uma descrição**, nesta ordem, em inglês:

1. **O que a música faz**: o gesto e o humor, em poucas palavras concretas. "curious forward-moving theme, gentle steady pulse, clear melody".
2. **Os timbres de base**: os mesmos dois ou três instrumentos em toda descrição do vídeo, com as mesmas palavras. "felt piano, warm analog synth, string ensemble".
3. **O gênero e o uso**: "cinematic science documentary score, instrumental".

As partes 2 e 3 são o **sufixo** do vídeo: copie-o inteiro em cada leito e em cada momento. É ele que mantém a trilha uma peça só: três descrições de climas diferentes, com o mesmo sufixo, saem a 0,21 oitava uma da outra; sem ele, a 0,64.

**Palavras que funcionam.** Instrumento e modo de tocar ("staccato strings ostinato", "held low string note", "slow swelling pads"), densidade ("sparse", "full"), movimento ("steady pulse", "no pulse"), humor de adulto ("thoughtful", "wary", "tender", "restrained").

**Palavras que atrapalham:**

- as que se contradizem na mesma descrição ("laboratory tension" com "sparkling"; "peaceful night" com "bright");
- as que proíbem a música de mudar ("steady even dynamics") num leito que tem momentos;
- timbre de brinquedo e humor de desenho animado (marimba, kalimba, caixinha de música, "playful", "quirky"): o usuário recusou uma trilha inteira por isso, "o vídeo é para todas as idades, não é vídeo infantil";
- o nome de um artista, de um canal ou de uma trilha.

**Andamento e tom.** `bpm` e `keyScale` vão nos campos próprios, não no texto. O andamento da referência fica entre 112 e 129 bpm; um vídeo de andamento contido pode pedir menos. Um momento não troca o andamento do leito: é o mesmo relógio.

**Teste.** Leia a descrição sem saber do vídeo: ela diz um humor só? Um músico saberia o que tocar? Troque o primeiro terço pelo de outro trecho do mesmo vídeo: o sufixo continua idêntico?

## DEPENDÊNCIAS
- leito: fornece os timbres de base, o andamento e o tom do vídeo.

## LIMITES
- Vocais nunca entram: o comando sempre pede instrumental.
- A descrição não marca tempo ("at one minute the drums enter"): o modelo não obedece a instante escrito. A mudança num instante é um momento (`momentos`).

## EXEMPLO
> Leito: "curious forward-moving theme, gentle steady pulse, clear melody, thoughtful wonder, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental"
> Momento no laboratório: "the same theme tightening, ticking staccato strings ostinato, low felt piano, restrained urgency, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental"
