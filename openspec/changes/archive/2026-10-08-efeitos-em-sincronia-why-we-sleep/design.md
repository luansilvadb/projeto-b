# Design

## Context

Veja `proposal.md` para o motivo. O que já existe e molda o caminho:

- **Efeitos são dados do roteiro.** `sfx` em `script.json` tem um item por efeito: a cena, a âncora (`cue` com `occurrence`, ou `shot`), `offsetMs`, o `name` de um uso do catálogo e o `level` (`src/narration/script.ts`, `src/audio/sfx.ts`). Nenhuma cena toca som. Repetir um som é escrever mais um item.
- **O catálogo tem quatro sons** (`whoosh`, `splash`, `coinDrop`, `shutterDown`), em `src/audio/sfx.ts`, com os arquivos em `public/sfx/freesound/`. `pnpm sfx "<busca>"` lista candidatos do Freesound e `pnpm sfx <id>` baixa e mede; a chave está no `.env`. Cada som novo é escolhido de ouvido pelo usuário (`producao/etapas/efeitos-sonoros`).
- **A partitura sabe o instante.** `score.md` registra, por plano, a palavra de deixa e quanto depois dela cada ação acontece; as cenas calculam o quadro com `cue(scene, "palavra")`. Em `jellyfish-debt`, plano 2, os jatos entram em "soltaram", "tanque" e "água".
- **A música tem três níveis** sob a fala (`presente` 10 dB, `leito` 13, `recuo` 17, em `MUSIC_MIX.levelsDb`), escolhidos por trecho em `music.levels`. A unidade `mixagem/niveis` diz que não há quarto nível: quando o vídeo inteiro está errado do mesmo jeito, o que muda é a calibração.
- **A trilha tem duas partes**, porque um leito vai até 7 min 20 s. A segunda (`music-2.wav`, dó maior, "warm hopeful resolution of the same theme…") foi gerada na poda e aprovada de ouvido. A primeira (`music.wav`, lá menor, com cinco momentos refeitos por cima) foi recusada.
- **A medida de efeitos erra.** A separação deixa vazar voz e música no canal de efeitos; a contagem tem piso perto de 2 por minuto e não conta os efeitos que existem (`efeitos/dose`).
- **O agente não ouve.** Tamanho de um som, se a música atrapalha e se o conjunto virou massa são do ouvido do usuário.
- **Um defeito recente**: o commit `d9f39ec` escondeu a sequência da trilha e todo render do som saiu sem música até a poda consertar. O som renderizado é sempre conferido num silêncio de fala.

## Goals / Non-Goals

**Goals:**

- Todo acontecimento físico da imagem com som no quadro dele, e toda repetição com a repetição do som.
- A música no fundo, no nível que o usuário aceitar de ouvido, com a identidade que ele aprovou.
- Pouco ouvido gasto: os sons novos em uma sessão, o nível e o leito em outra, o conjunto no fim.

**Non-Goals:**

- Chegar à contagem de efeitos da referência. A dose é a dos acontecimentos que existem; nenhum efeito entra para subir medida.
- Mudar animação, texto ou voz.
- Escrever ferramenta nova de sincronia: a conferência usa o que o repositório tem.

## Decisions

### 1. Esta mudança começa na partitura final

O inventário e todas as âncoras dependem do tempo da fala e de `score.md`. A segunda rodada da `poda-dos-ecos-why-we-sleep` muda os dois em mais de dez cenas. O trabalho aqui começa quando ela está aceita e montada.

O que não depende disso pode andar antes: a busca e a escolha dos sons que já se sabe que faltam, que são do catálogo e não do vídeo.

### 2. O inventário é a partitura lida plano a plano

Para cada plano de `score.md`: as ações, o tipo (impacto, objeto ou corpo que age, mudança de estado do cenário, onomatopeia, gesto pequeno), a palavra de deixa e o atraso, o uso de som, o nível e, quando fica sem som, o motivo. Ele mora em `sound.md`, no lugar das tabelas "Efeitos colocados" e "Efeitos pendentes". O instante que a partitura não dá é medido no código da cena, e não estimado.

Os dois testes de `efeitos/dose` continuam valendo efeito a efeito: o que a ação perde sem o som, e se o som dá à ação uma leitura que a imagem não sustenta. O pedido do usuário decide a dose, mas não põe som em corte, em texto que só entra nem em câmera.

### 3. A âncora de cada efeito é a mesma palavra que a cena usa

O efeito leva o `cue` e a `occurrence` da palavra que dispara a ação no código da cena, e `offsetMs` igual ao atraso da ação em relação a ela. Assim, se a frase muda de tempo, o som anda junto com a imagem. A âncora por `shot` fica para a ação que acontece no começo do plano, sem palavra.

Alternativa descartada: ancorar tudo no começo do plano com um deslocamento medido. Fica certo hoje e erra na próxima regravação.

**Escopo adicional autorizado em 2026-10-08:** as dobras de `older-than-brain` e `gardner-sleeps` dependem do fim do plano. Acrescentar `at: "end"` a `SfxSpec`: com `shot`, usa o fim desse plano; sem `shot`, o fim da cena, sempre sem `cue`. O deslocamento negativo acompanha a nova duração. Validar combinações, testar uma narração com duração diferente e documentar o campo.

### 4. A sincronia é conferida no render, por imagem

Para cada efeito, um script descartável em `out/rascunho/` calcula o quadro em que ele começa (com `sfxEvents`, de `src/audio/sfx.ts`, que é o que a montagem usa) e extrai do vídeo montado esse quadro e o de dois quadros antes, lado a lado, numa folha de contato por cena. A folha é lida: a ação não começou no primeiro e está começando no segundo. O efeito que não passar tem o `offsetMs` corrigido e a folha refeita.

Alternativa descartada: detectar o ataque do som no áudio e comparar com o movimento na imagem. É uma ferramenta nova para um defeito que a folha mostra.

### 5. Sons novos: uma busca por uso, uma sessão de escuta

Os usos que faltam são buscados pelo que acontece ("water jet spray short", "rubber stamp thud"). O que se lê elimina antes: outro acontecimento, fala ou música no nome, duração que não combina com a ação. Sobra um candidato por uso, dois quando a comparação ajuda. O usuário recebe a lista inteira de uma vez, com a ação de cada um e o link, e responde uso a uso. O aprovado entra em `SFX` com a linha que o `pnpm sfx <id>` imprime; o que nenhum candidato realiza fica pendente, e a ação fica sem som.

O jato de água é um uso novo (`waterJet`), diferente do `splash`, que é uma queda na água. Decide-se na escuta se o `splash` continua em algum lugar do vídeo.

**Escopo adicional autorizado em 2026-10-08:** corrigir `measurePeakLoudness`, em `scripts/lib/loudness.ts`, para completar a entrada da medição com 400 ms de silêncio. Os candidatos de tesoura e pouso têm menos de 400 ms e hoje recebem apenas a leitura inicial de −120,7 LUFS, que elimina a atenuação na mixagem. O arquivo tocado não muda. Um teste com áudio curto cobre a janela, o procedimento de efeitos documenta o comportamento e os nove sons são medidos novamente antes de entrar no catálogo.

### 6. Música: primeiro o nível que não pede código

O vídeo inteiro passa a `recuo` (17 dB) em `music.levels`, o que é só roteiro. O usuário ouve um trecho com fala e efeitos nesse nível. Se ainda atrapalhar, a calibração muda: os três níveis de `MUSIC_MIX.levelsDb` descem juntos (por exemplo `presente` 14, `leito` 18, `recuo` 22), o vídeo volta a não escrever nível, e o teste de `src/audio/` e a unidade `mixagem/niveis` acompanham. A calibração vale para todos os vídeos, e por isso é decisão dele, tomada de ouvido.

A vinheta continua em primeiro plano (o mecanismo dos silêncios de fala de 2 s ou mais não é um nível). O silêncio de música em `so-far` continua.

Alternativa descartada: criar um quarto nível. A unidade diz por que não, e aqui o vídeo inteiro pede a mesma coisa.

**Critérios ajustados por decisão do usuário em 2026-10-08:** preservar o recuo de 17 dB já ouvido. A medição deu 16,94 dB calibrados e mínimos de 13,39 dB no fechamento; não são, sozinhos, falhas de aplicação. O requisito passa a cobrar os 17 dB aplicados pela mixagem, com a medida como sensor investigado e as dúvidas restantes no roteiro de escuta. As janelas de 46–47 s ainda carregam a vinheta anterior (medição de três segundos), embora o ganho do trecho novo já corresponda ao recuo. A rampa indevida na mudança de nível do quadro zero foi corrigida com teste, como defeito técnico encontrado pela tarefa 5.2.

### 7. O primeiro leito com a identidade do segundo

A primeira parte é gerada de novo com a descrição, o andamento e o tom da segunda, que o usuário aprovou, e sem momentos: `music.moments` fica só com o do fechamento, que é da segunda parte. Com a música no fundo e os efeitos ligando som e imagem, os cinco repaints da primeira parte deixam de ter função, e eram a origem dos saltos de volume registrados em `sound.md`.

Gera-se com `pnpm music why-we-sleep <semente> 1`, que mantém a segunda parte. Começa pela semente 1. O usuário ouve os dois primeiros minutos do som; recusada, outra semente. Depois de duas recusas vale a linha de parada do `CLAUDE.md`.

Alternativa descartada: manter lá menor e a descrição "curious forward-moving theme" e só trocar de semente. Seria repetir a música que ele chamou de péssima com outra sorte.

### 8. A ordem

```
(antes)  busca e escolha dos sons que já faltam ----+
                                                    |
poda aceita --> inventário na partitura final ------+--> sfx no roteiro
                     |                                        |
                     +--> nível da música (ouvido) --+        v
                     +--> primeiro leito (ouvido) ---+--> pnpm sound
                                                             |
                                             folha de sincronia, medida,
                                             critico-de-som, escuta do conjunto
```

Música e efeitos não dependem um do outro. A memória da máquina não comporta a geração da trilha junto com renders: uma coisa de cada vez.

## Risks / Trade-offs

- **Efeitos demais sobre a fala viram massa ou disputam com a voz.** → Os testes de remoção e de conjunto de `efeitos/dose`; `leve` nos gestos pequenos; a escuta do conjunto pelo usuário.
- **Nenhum som bom para um uso no Freesound CC0.** → O uso fica pendente e a ação sem som; não entra o menos ruim.
- **A música baixa demais deixa o vídeo vazio onde não há efeito.** → A escuta do nível é feita num trecho com e num sem efeitos; o `critico-de-som` aponta os trechos sem música nem efeito.
- **O primeiro leito novo pode ser recusado de novo.** → Semente nova, e a linha de parada depois de duas recusas.
- **A medida fica fora da faixa da referência de propósito** (música a mais de 15 dB). → Dito em `sound.md` como decisão do usuário, para a crítica não tratar como defeito.
- **A contagem de efeitos não confirma o trabalho.** → A conferência é a folha de sincronia e o inventário, e não a medida.
- **A geração da trilha foi interrompida uma vez por falta de memória.** → Rodar com os outros programas fechados e sem render em paralelo.

## Open Questions

- Quantos usos novos o inventário pede além dos dez já listados: sai da leitura da partitura final.
- Se o `whoosh` das quatro varreduras de cenário continua, agora que cada cena tem mais sons: decide a escuta do conjunto.
