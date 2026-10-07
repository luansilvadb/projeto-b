# Arco de som antecipado

Acontece dentro da etapa de roteiro, quando a skill `diretor-criativo` traz uma dúvida de som que vale resolver antes da voz. Antes da voz, o som resolve só o que ficaria mais caro ou impossível de descobrir depois dela. **Abrir esta etapa não obriga a desenhar o som**: timbres, andamento, tom, leitos, momentos, níveis, silêncio de música e efeitos esperam a etapa `som`, que tem a voz real, a duração real das cenas, a animação aceita e um som que o usuário consegue ouvir.

Não é um marco: a **primeira aprovação**, pedida lá, não espera esta etapa nem ganha uma aprovação de som ao lado.

## A dúvida

Comece pela dúvida que foi trazida, e não por campos a preencher: **o próximo artefato caro (a voz, e a animação sobre ela) depende desta decisão agora?**

- **Depende, quando muda a linha do tempo.** É o caso do `holdMs`: o tempo sem fala no fim de uma cena, que desloca todos os quadros seguintes.
- **Depende, quando muda a experiência que vai à primeira aprovação.** É a exceção: duas versões válidas do mesmo trecho que fazem vídeos diferentes (a frase dita em voz nua, como choque, ou sobre a música, contemplativa).
- **Não depende: adie.** "Vai ser preciso escolher um dia" não é dependência, mesmo que o campo exista em `sound.md`. Decisão que só o ouvido julga não melhora por ser tomada no papel: espera o som.

Se a dúvida se desfaz na análise (o `holdMs` que o roteiro já tem resolve; o efeito é da imagem e não do som), a etapa termina ali, sem arquivo e sem pedido. O som não inventa pausa para justificar a entrada: um vídeo pode chegar à primeira aprovação com zero `holdMs` pedidos pelo som, sem `sound.md` e sem nenhuma pergunta de som ao usuário.

## O `holdMs`

Unidade `silencio`, para os testes de função, de remoção e de duração. `leito` só entra quando a dúvida é de continuidade da música e precisa mesmo ser antecipada; a duração estimada que vai pedir mais de uma geração é restrição da etapa `som`, e não decide aqui o caráter nem o ponto de troca dos leitos.

- O valor é uma hipótese: o menor tempo que deixa a função acontecer. O animatic e a animação o corrigem depois; fica mais caro, e continua permitido (`etapas/roteiro.md`, na pasta da skill `diretor-criativo`).
- O limite é do runtime: inteiro de 1 a 8000 ms (`MAX_HOLD_MS`, em `src/narration/script.ts`). O que pede mais que isso pede outra cena ou outro desenho do trecho. Não há mínimo.
- A pausa não decide a mixagem. O que a música faz nela (segue no leito, recua, vai à frente) é da etapa `som`; registre só se a intenção já faz parte do sentido.
- Entregue à skill `diretor-criativo` a cena, os milissegundos e o motivo. Quem grava o campo em `script.json` é ela, que também grava sozinha o `holdMs` que nasce da imagem ou do texto, sem passar por aqui.

## Quem decide

O agente resolve a pausa que preserva a experiência do vídeo: a duração local, o tempo que a imagem ou a consequência pede, o ajuste dentro do limite. Vai ao usuário a escolha entre alternativas válidas que mudam o ritmo, o peso ou o tom do vídeo, contrariam uma duração registrada ou criam custo relevante (`entrevista-som`; o teste é o de `conducao/entrevista`, na pasta da skill `diretor-criativo`).

A escolha chega no menor artefato que mostra a troca: o trecho do texto, ou o animatic. Nunca dois números de milissegundos sem nada para ver ou ouvir. Se só o som real permite julgar, ela é adiada para a etapa `som`.

## O registro

`sound.md` guarda o estado atual, como `script.md`: os compromissos de som que outra etapa não deve redescobrir. Nasce parcial, e pode ser uma linha só; não nasce quando nada precisa sobreviver. Sem campo vazio, decisão prevista, alternativa recusada nem história: o histórico é o git. `src/videos/why-we-sleep/sound.md` guarda também a história do piloto e não é modelo de quantidade.

Entra na seção "Arco" o que muda a linha do tempo ou uma relação de som que faz parte do sentido, e que, esquecido, mudaria o vídeo. A intenção pode ficar sem a realização; "a trilha acompanha a emoção" não é compromisso.

```markdown
## Arco

- `the-question`: 5 s sem fala depois da pergunta, para a vinheta.
- `rats-result`: quando o resultado chega, o som perde impulso. Recuo, silêncio ou música rala: decide a etapa `som`.
```

Pronto quando a dúvida que abriu a etapa está resolvida o bastante para o roteiro seguir: o `holdMs`, se houve, tem valor, motivo e está em `script.json`, ou foi dispensado; a escolha que era do usuário foi feita por ele; e o que precisa sobreviver está em `sound.md`. Nada mais precisa existir.
