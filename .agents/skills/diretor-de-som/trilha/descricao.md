## PERGUNTA
Como pedir ao gerador a música de uma parte ou de um momento, e o que a descrição prova?

## RESPOSTA

**Princípio.** A descrição é uma **hipótese de controle** do gerador: diz, de forma concreta e sem comandos concorrentes, só as propriedades sonoras que precisam sobreviver nesta geração. Ela não é a música nem a prova de que a música foi realizada: quem confirma é o som gerado.

**Cada palavra pesa.** O ACE-Step recebe o texto como foi escrito: `tools/music/generate.py` desliga a reescrita dele (`use_cot_caption`), que trocava "suspense contido" por "tímpanos e pratos". Nada corrige a descrição depois, e cada termo é uma força sobre o modelo. Por isso cada termo está ali porque tenta controlar alguma coisa, e nenhum entra por enfeite.

**Descrição = delta.** O que esta geração precisa realizar que não pode ficar por conta do modelo? Pode ser o gesto, a energia, a densidade, o registro, o pulso, o material (instrumento, modo de tocar, textura), o caráter, o tipo de trilha. Nenhum é obrigatório, não há ordem nem tamanho: "restrained low strings, sparse steady pulse" é uma descrição inteira quando gera o que o vídeo precisa. Ela cresce por evidência: a geração que cai no genérico pede mais uma propriedade concreta, e a que já funciona com cinco termos não ganha o sexto.

- **Uma parte** é uma geração autônoma, sem som em volta: costuma precisar de mais sinais de identidade.
- **Um momento** é refeito dentro do som que já existe, e esse contexto segura parte da identidade: a descrição pede sobretudo o que muda ali, e repete sinais estáveis quando isso ajuda a não perdê-la (`momentos`).

**Controles que já deram efeito** nos testes. É repertório, e não vocabulário autorizado:

- o material e o modo de tocar: "staccato strings ostinato", "held low string note", "slow swelling pads";
- a densidade ("sparse", "full"), o movimento ("steady pulse", "no pulse"), o registro ("low");
- o caráter ("thoughtful", "wary", "tender", "restrained"), quando acrescenta uma direção que as propriedades ainda não dão;
- o tipo de trilha ("cinematic science documentary score"), como pista de função que estreita o que o modelo escolhe;
- poucos timbres nomeados, dois ou três, deram uma identidade mais controlável;
- (proposta) a descrição que deu o piano de cinema mudo que o usuário escolheu (`leito`): "playful silent film comedy score, solo upright piano, bouncy ragtime stride left hand, cheeky staccato melody, light and charming, comedic timing with small pauses, vintage 1920s cinema pianist, instrumental", a 104 bpm em dó maior. O piano é decisão; a descrição é só a que funcionou uma vez, em 42 s.

Onde der, traduza a intenção em propriedades que um músico poderia tocar: "epic" e "emotional" devolvem a escolha ao modelo. As descrições são em inglês, a língua em que tudo isto foi testado.

**O sufixo** é a técnica de estabilização: o conjunto mínimo de sinais que o gerador deve tratar como a identidade do vídeo (timbres, textura, tipo de produção, pulso, o que os testes mostrarem útil), repetido com as mesmas palavras. Três descrições de climas diferentes, com o mesmo sufixo, saíram a 0,21 oitava uma da outra; sem ele, a 0,64. Enquanto a intenção é a mesma, repetir a formulação é o caminho de menor risco conhecido: "warm analog synth" que já dá o mundo certo não vira "soft electronic pads" para variar a redação. A descrição que pede uma transformação pode mudá-lo. Texto estável é controle provável, e não unidade comprovada: duas descrições iguais podem gerar sons que derivam, e duas diferentes, uma evolução que pertence ao vídeo (`leito`).

**Onde uma descrição costuma falhar**, três causas diferentes:

- **Comandos concorrentes.** "laboratory tension" com "sparkling", "peaceful night" com "bright": termos sem relação entre si, que puxam o modelo para lados que se anulam. Emoção composta não é isso: "tender but uneasy" é uma intenção, e o som diz se o modelo a realiza. O teste: os termos conseguem coexistir na mesma música?
- **O termo que congela o que precisa variar.** "steady even dynamics" numa parte que tem momentos.
- **Sinais de infantil.** O canal é ciência para todas as idades, decisão do usuário, que recusou uma trilha inteira: "não é vídeo infantil". Aquela trilha somava timbre de brinquedo (marimba, kalimba, caixinha de música), registro agudo, e "playful" e "quirky" na descrição. Em 2026-10-09 ele escolheu de ouvido o piano de cinema mudo (`leito`), que é saltitante e cômico: a graça e a articulação não são o defeito. O que continua violando a decisão é o resultado soar como desenho para criança, e os sinais de risco são o timbre de brinquedo e o registro agudo: pedem o ouvido, e nenhum reprova pelo nome. Adulto não é um gênero: energia, humor e leveza cabem.

Peça pelo que a música faz: "restrained, low register, sparse" em vez de "not playful", que põe no texto a palavra que se queria fora.

**O que não é da descrição:**

- **Andamento e tom**: `bpm` e `keyScale` são campos próprios e opcionais, e entram quando a hipótese precisa deles (as sementes variam de velocidade e isso atrapalha a intenção), nunca escritos no texto. Os 112 a 129 bpm da referência descrevem aqueles vídeos; o andamento deste sai do vídeo e do som.
- **O momento não tem `bpm` nem `keyScale`**: é refeito dentro da parte, no relógio dela. A mudança que se percebe de impulso, pulso, densidade ou registro (suspender, rarefazer, parecer mais lento) é pedida no texto.
- **O instante**: "drums enter at 30 seconds" não é obedecido. A descrição diz o estado da música no trecho; o que acontece num instante é de um momento, de uma parte, de um nível, de um silêncio ou de um efeito.
- **A voz**: a geração é sempre instrumental, pedida pelo comando. "instrumental" no texto não é o que a garante.
- **O nome** de um artista, de um canal ou de uma trilha: descreva as propriedades.

**Antes de gerar**, perguntas baratas, que melhoram a hipótese e não aprovam música:

- cada termo controla alguma coisa, e nenhum repete o que outro já diz?
- os termos conseguem coexistir?
- algum pede o que é de `bpm`, `keyScale`, momento, parte, nível ou efeito?
- que sinais de identidade precisam ficar, e qual é o delta deste trecho?

**Depois de gerar**, a pergunta que decide: o som realizou o que a descrição precisava controlar? A medida elimina o defeito que conhece, e o ouvido do usuário responde a dúvida que pesa (`entrevista-som`). O usuário diz o que percebeu, e traduzir isso em palavras da descrição é do agente; o instrumento que ele pede por conta própria é entrada para este vídeo.

Quando a descrição for a causa provável, a propriedade pedida pode estar errada, ser pouco concreta, concorrer com outra ou restringir demais. Reescreva o menor trecho que controla o defeito: o som adulto e coerente, mas denso demais, muda o termo de densidade, de pulso ou de registro, e mantém o resto. É para isso que cada termo tem uma função: a falha aponta qual mexer.

## DEPENDÊNCIAS
- leito: fornece a identidade percebida que a descrição tenta realizar e preservar.
- entrevista-som: como a percepção do usuário chega ao agente.

## LIMITES
- A forma não aprova nem reprova. A descrição com sufixo, timbres e tipo de trilha que gera um som infantil, desconexo ou genérico falhou; a de quatro palavras que gera o que o vídeo pede passou.

## EXEMPLO
> Parte: "curious forward-moving theme, gentle steady pulse, clear melody, thoughtful wonder, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental"
> Momento no laboratório, com o sufixo repetido: "the same theme tightening, ticking staccato strings ostinato, low felt piano, restrained urgency, felt piano, warm analog synth, string ensemble, cinematic science documentary score, instrumental"
> Outra parte, curta, que também vale: "restrained low strings, sparse steady pulse, uneasy"
>
> O usuário ouve a primeira e diz "está infantil". Hipótese: "clear melody" com "wonder" levou a melodia ao agudo. Muda só isso: "low unhurried melody" no lugar dos dois termos. O resto da descrição fica, e a mesma pergunta volta ao ouvido.
