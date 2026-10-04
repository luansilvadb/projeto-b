# Diagnóstico da voz

O que já foi medido e decidido de ouvido com esta voz. Leia a seção da reclamação antes de mexer em qualquer parâmetro.

## Se a voz soar sem energia ou mal-humorada

Aconteceu no primeiro vídeo, e as causas foram três, nesta ordem de peso:

- **O texto.** Roteiro picotado em frases curtas sai como uma fila de afirmações que caem no fim, porque cada frase é gerada à parte e separada por uma pausa. Antes de mexer na voz, confira o perfil de frase do roteiro (skill `script`).
- **A amostra.** O modelo copia o humor da gravação junto com o timbre. A primeira amostra era uma frase de conto lida de forma contemplativa (altura mediana de 92 Hz, entonação de 5,0 semitons); a atual é um trecho da leitura animada do próprio roteiro (149 Hz na gravação inteira, 6,5 semitons no recorte). A gravação completa do usuário fica em `voice/voz_propria.wav`, e `voice/reference.wav` é um recorte de 9,6 s dela; a amostra antiga está em `voice/reference-contemplativa.wav`.
- **A velocidade.** Com `speed: 0.9` a fala soava arrastada; o usuário escolheu de ouvido `speed: 1`, entre três configurações geradas com a amostra nova.

Para comparar de ouvido, `pnpm eval:voice <configuração...>` gera só as configurações pedidas; as primeiras frases de teste são o gancho do vídeo em ordem, para a comparação ser ouvida como um trecho contínuo (frases soltas e fora de ordem não deixam julgar a narração).

Com a amostra nova, a altura varia mais de uma frase para outra (2,4 semitons de distância média à amostra, contra 0,8 com a antiga) e o Whisper erra mais palavras por frase. O usuário ainda não reclamou disso; se reclamar, aumente `takesPerAttempt` ou teste outro recorte da gravação.

## Se a voz soar robótica ou diferente da amostra

Você não ouve o áudio: peça ao usuário para dizer o que soa diferente, e meça antes de mexer. O que já se sabe desta voz:

- O que o usuário chama de robótico é entonação monótona. A amostra varia 4,9 semitons em torno da própria mediana; o OmniVoice puro devolve 3,3, e isso ele rejeitou. Com `intonation: 1.3` em `VOICE_MODEL` (`scripts/lib/voice.ts`), a amostra vai para o modelo com a entonação ampliada e o clone sai com cerca de 4,0, que ele aprovou. Com 1,45 a fala fica mais viva, mas a altura passa a variar demais de uma frase para outra.
- A altura muda de uma geração para outra. Por isso cada frase é gerada `takesPerAttempt` vezes e fica a mais próxima da amostra entre as que saíram inteiras. Nas três frases do demo isso deixa cada frase a menos de meio semitom dela; numa avaliação com 16 frases a média foi 0,8 semitom, com uma frase acima de 2. Se o usuário notar a altura mudando de uma frase para outra, aumente `takesPerAttempt`: com duas gerações a média era 1,4 semitom. Custa tempo de geração na mesma proporção.
- Os demais parâmetros do modelo (passos, orientação, temperatura) não mudaram timbre, altura nem entonação nas medidas. `VOICE_MODEL` (`scripts/lib/voice.ts`) usa os padrões do modelo, que o autor recomenda para a melhor qualidade (issue 237 do repositório `k2-fsa/OmniVoice`).
- `pnpm eval:voice` compara a configuração atual com variações de um parâmetro em 16 frases fixas, com as mesmas sementes, e guarda áudios e medidas em `out/eval-voice/`. Use antes de mudar qualquer valor de `VOICE_MODEL`. Na avaliação de outubro de 2026, nenhuma variação ficou mais natural que a atual: sem ampliar a entonação (`intonation: 1.0`) ela cai para 3,7 semitons; `numStep: 64` dobra o tempo sem ganho; `speed: 1.0` deixa só 75% das frases inteiras; `classTemperature: 1.0` piora. `classTemperature: 0.5` deixa a entonação mais viva (4,7 contra 4,3 semitons) sem piorar o resto, mas o usuário ainda não a aprovou de ouvido. `precision: "float32"` não chegou a ser medida.
- A nota de naturalidade do `eval:voice` (UTMOS) não acompanha o ouvido do usuário em português: gerações de nota baixa soaram boas e uma de nota alta tinha defeito. Sirva-se das outras medidas (frases inteiras, altura, entonação, erros) e leve os áudios para ele ouvir; não decida pela nota.
- O que o usuário ouviu como artificial nessa avaliação foi prosódia, não timbre: tom de pergunta antes de uma vírgula, pausa em vírgula desnecessária, palavra dita errado. O tom varia de uma geração para outra; a pausa e a pronúncia se corrigem no texto (skill `script`, seção da narração).
- O modelo gera a 24 kHz: o brilho acima de 12 kHz que a amostra tiver não aparece no clone.

Outros modelos já foram testados com esta amostra e descartados pelo usuário, de ouvido: Chatterbox pt-BR (outra pessoa, robótico), Qwen3-TTS (sotaque de Portugal) e F5-TTS pt-BR (altura errada e palavras trocadas).

## Se o fim de uma frase soar cortado ou sumindo

Você não ouve o áudio: peça ao usuário a frase e a palavra, e meça o fim do arquivo antes de mexer. O que já se sabe:

- O OmniVoice gera cada frase com uma duração fixa, que ele estima pelo número de letras do texto em relação à amostra. Quando a fala não cabe, ela vai até o último instante do áudio e a última sílaba sai cortada. É defeito conhecido do modelo (issue 245 do repositório `k2-fsa/OmniVoice`), sem correção na versão 0.2.1.
- O sinal de que a frase saiu inteira é o áudio cru do modelo terminar em silêncio (`tools/narration/silence.py`). Só essas gerações entram na escolha.
- `speed` abaixo de 1 em `VOICE_MODEL` (`scripts/lib/voice.ts`) dá folga à duração e deixa a fala mais lenta (0,9 dá uns 7%). Hoje o valor é 1, por escolha de ouvido do usuário: a folga saiu, e o que protege contra o corte é descartar as gerações cortadas. Numa avaliação com 16 frases, terminaram inteiras 38% das gerações sem folga, 66% com 0,9 e 78% com 0,85 (fala 11% mais lenta); com 0,8 não melhora. Mesmo com folga uma parte das gerações sai cortada: o que resolve é descartá-las, não só a folga.
- O pós-processamento padrão do OmniVoice aplica um fade de 0,1 s no fim do áudio, que apagava a última sílaba das gerações cortadas. O `tts.py` pede o áudio cru e corta ele mesmo o silêncio das pontas.
