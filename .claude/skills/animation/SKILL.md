---
name: animation
description: Anima as cenas já aprovadas de um vídeo: movimento sincronizado com a narração, transições entre planos, câmera, pausa viva, efeitos e efeitos sonoros, conferindo o resultado em tiras de quadros e nas medidas de movimento. Use sempre que o animatic estiver aprovado e for hora de dar vida às cenas, ou quando o usuário pedir para animar, melhorar o movimento, ajustar o tempo de uma entrada, adicionar efeito sonoro ou dar mais acabamento a uma cena.
---

# Animação das cenas

Quinta etapa, depois do animatic aprovado. Aqui cada plano ganha movimento e acabamento. A composição já foi aprovada: mude posição, tamanho ou conteúdo só se a animação pedir, e avise o usuário quando mudar.

O conhecimento de como animar está no workflow `animador` (`.claude/commands/animador/`): leia `animador.md` e injete as unidades na ordem que ele indica (`sincronia`, `entradas`, `pausa-viva`, `acao`, `movimento`, `transicoes`, `efeitos`, `critica`). Esta skill diz onde esse conhecimento vira código neste projeto.

Leia a skill `remotion-best-practices` (regras de `remotion-markup`) antes de escrever. O essencial: todo movimento sai de `useCurrentFrame()` com `interpolate()` e `Easing`; transições e animações de CSS não renderizam; prefira as propriedades `scale`, `translate` e `rotate` a `transform`.

## Etapa 1: partitura

Antes do código, a partitura de cada plano (`animador/tempo/sincronia`): o que entra, muda ou sai, em que palavra, por quanto tempo, e onde cabe som. Os tempos das palavras vêm de `public/videos/<vídeo>/narration.json`; `scripts/check-script.ts` mostra a duração de cada plano. Registre a partitura em `out/conceito/<vídeo>/<n>-partitura.md` e siga por ela.

## Etapa 2: movimento, com os primitivos do projeto

Cada plano é um componente pequeno dentro de `<Shot range={shots[i]}>` (`src/video/Shot.tsx`): dentro dele `useCurrentFrame()` conta a partir do começo do plano, e `useVideoConfig().durationInFrames` é a duração do plano. As deixas vêm de `cue(scene, "palavra")` (`parts/timing.ts`, já com a antecipação de alguns quadros), descontando `shots[i].from` quando o plano não é o primeiro da cena. Os limites dos planos já antecipam a palavra de deixa (`CUE_LEAD_FRAMES` em `src/narration/timeline.ts`).

| O que a unidade pede | Onde está |
|---|---|
| Entrada com sobra (`entradas`) | `Pop` e `popScale`/`popOpacity` (`src/components/Pop.tsx`); texto por máscara em `TextReveal` |
| Curvas (`entradas`, `acao`) | `ramp` (peso: câmera, porta, maré), `settle` (chega e assenta), `linear` (sombra, moeda no ar), `drop` (queda), em `parts/timing.ts` |
| Pausa viva (`pausa-viva`) | `wave`, `phaseOf`, `breath`, `blink` em `src/components/Idle.tsx`; `Drifters` para partículas; `Person blink`, `Fish tail/blink`, `Cassiopea pulse/sway` |
| Câmera (`movimento`) | `framing`, `cameraBetween`, `Camera` e `Layer` (`src/components/Camera.tsx`); `SlowPush` para a aproximação lenta de um plano sem motivo; enquadramentos de um cenário num arquivo só (`parts/lagoonCameras.ts`, `LAB` em `parts/Laboratory.tsx`) |
| Transições (`transicoes`) | corte: dois `Shot`; câmera: `cameraBetween` do enquadramento anterior nos primeiros 0,5 a 1 s do plano novo; varredura: `wipe` no plano novo e `hold` no anterior (`Shot`); transformação: o objeto-ponte desenhado nos dois planos (o quadro que encolhe até virar painel, a luz que cresce e vira fundo) |
| Entre cenas | cada cena é uma `Sequence` sem sobreposição: a transição contínua para a primeira imagem de uma cena começa nela, com a imagem anterior redesenhada (`nightfall` do `LagoonShot`, `ShrinkingLab` com `<Sequence from={-n}>` da cena anterior) |

Movimento que se repete em mais de uma cena vira um primitivo em `src/components/`. Lógica de cálculo que não seja trivial (trajetórias, ciclos, tempos) vai para uma função pura com teste, no padrão de `src/narration/` e `parts/timing.ts`.

A mesma curva não serve para tudo: `motion.smooth` dos tokens chega em um décimo do tempo e rasteja o resto; uma porta que desce com ela parece fechar em 0,15 s. Use `ramp` para o que tem peso e `settle` só para o que chega e para.

## Efeitos sonoros

```tsx
<Sfx name="<uso>" from={cueFrame(scene, "oito")} />
```

O catálogo fica em `src/audio/Sfx.tsx`, com cada efeito nomeado pelo uso, e começa vazio. Os arquivos ficam em `public/sfx/freesound/`. Texto que entra na tela não leva efeito; reserve o som para o que acontece na imagem (impacto, entrada grande, mudança de cenário), e só quando importa, porque efeito demais cansa. A partitura já marca onde cabe som.

Para um uso novo, busque no Freesound (só CC0, até 10 s):

```bash
pnpm sfx "<busca em inglês>"   # lista id, duração, nota e link de cada candidato
pnpm sfx <id>                  # baixa para public/sfx/freesound/<id>.ogg
```

Você não ouve os sons: descarte pelo nome, pela duração e pela nota, evite os que se anunciam como gerados por IA, mostre os links ao usuário e deixe que ele escolha ouvindo. Só então baixe e acrescente o arquivo ao catálogo, com um nome pelo uso. O comando precisa de `FREESOUND_API_KEY` no `.env`.

## Etapa 3: revisão (`animador/revisao/critica`)

```bash
pnpm lint
pnpm test
pnpm render <vídeo>              # ou uma composição de prévia com as cenas do trecho
pnpm critique <vídeo>            # ou pnpm critique out/<arquivo>.mp4
```

Movimento não aparece num quadro só: renderize o vídeo e leia **tiras de quadros consecutivos** (5 a 10 por segundo, com o tempo em cada um) cobrindo cada transição e cada ação; `ffmpeg -ss <s> -t <dur> -i out/<vídeo>.mp4 -vf "fps=5,scale=320:180,tile=6x5" -frames:v 1 tira.png` serve. Procure: ponte que pula de lugar na transição, elemento que some no corte, texto que entra durante o movimento da câmera, ação que termina antes de começar (curva errada), quadro igual ao anterior.

`pnpm critique` mede o movimento contra os vídeos de referência: tela quase parada, tempo com mais de 10% do quadro em movimento e renovação da imagem. Com uma medida fora, ache onde pelo mapa segundo a segundo (quase parado em que trecho?) e corrija o plano, não o vídeo inteiro. A tela quase parada se resolve com pausa viva de amplitude suficiente para ser vista em 320 px de largura: respiração de 2% da altura, bobina de 9 px, luz que tremula 25%, moldura que balança; o movimento grande se resolve com câmera motivada (recuo quando entra mais um item, aproximação para reação, deslize para seguir quem anda).

Depois peça ao usuário para assistir, porque ritmo e suavidade só se julgam em movimento, e entregue junto as tiras das transições e as medidas.

A próxima etapa é `music`, e depois `final-cut`.
