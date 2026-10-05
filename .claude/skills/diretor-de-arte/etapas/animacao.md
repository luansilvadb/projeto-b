# Animação das cenas

Quinta etapa, depois do animatic aprovado: a 2ª aprovação está em `src/videos/<vídeo>/approvals.md`, sem reabertura; se não estiver, pergunte ao usuário. Aqui cada plano ganha movimento e acabamento. A composição já foi aprovada: mude posição, tamanho ou conteúdo só se a animação pedir, e avise o usuário quando mudar.

O conhecimento de como animar está nas unidades de movimento desta skill, lidas passo a passo pela ordem de injeção de `SKILL.md`: as da Partitura no passo 1, as do Movimento no passo 2 e `critica-movimento` no passo 3; as do passo seguinte, só ao chegar nele. Este arquivo diz onde esse conhecimento vira código neste projeto.

Leia a skill `remotion-best-practices` (regras de `remotion-markup`) antes de escrever. O essencial: todo movimento sai de `useCurrentFrame()` com `interpolate()` e `Easing`; transições e animações de CSS não renderizam; prefira as propriedades `scale`, `translate` e `rotate` a `transform`.

## Passo 1: partitura

Antes do código, a partitura de cada plano (`tempo/sincronia`): o que entra, muda ou sai, em que palavra, por quanto tempo, e onde cabe som. Os tempos das palavras vêm de `public/videos/<vídeo>/narration.json`; `scripts/check-script.ts` mostra a duração de cada plano. Registre a partitura em `src/videos/<vídeo>/score.md`, uma seção por cena (o `id` dela) e um item por plano, e siga por ela. Ela vai para o git: é o que o usuário aprova, o que o `motion-designer` recebe e o que o `critico-de-movimento` confere. As imagens e os vídeos de comparação das decisões continuam em `out/conceito/<vídeo>/`.

## Passo 2: movimento, com os primitivos do projeto

Com a partitura aprovada, quem anima em volume é o subagente `motion-designer`: um disparo por cena, com a pasta do vídeo, a cena, a partitura dela e a lista dos arquivos que ele pode tocar; em paralelo, só com listas que não se cruzam. Um primitivo novo em `src/components/` e a transição que atravessa duas cenas são feitos por você, antes ou depois dos disparos. As regras abaixo valem para ele e para o que você ajustar à mão.

Cada plano é um componente pequeno dentro de `<Shot range={shots[i]}>` (`src/video/Shot.tsx`): dentro dele `useCurrentFrame()` conta a partir do começo do plano, e `useShotLength()` (do mesmo arquivo) dá a duração dele. Não use `useVideoConfig().durationInFrames` para isso: num plano que divide o palco com o seguinte ele vem esticado pelos quadros da passagem, e o que termina "no fim do plano" pula na troca. As deixas vêm de `cue(scene, "palavra")` (`src/components/timing.ts`, já com a antecipação de alguns quadros), descontando `shots[i].from` quando o plano não é o primeiro da cena. Os limites dos planos já antecipam a palavra de deixa (`CUE_LEAD_FRAMES` em `src/narration/timeline.ts`).

Os primitivos valem para todo vídeo e moram em `src/`. O que a tabela cita em `parts/` é do `why-we-sleep` (`src/videos/why-we-sleep/parts/`) e serve de exemplo: cada vídeo escreve os seus.

| O que a unidade pede | Onde está |
|---|---|
| Entrada com sobra (`entradas`) | `Pop` e `popScale`/`popOpacity` (`src/components/Pop.tsx`); texto por máscara em `TextReveal` |
| Curvas (`entradas`, `acao`) | `ramp` (peso: câmera, porta, maré), `settle` (chega e assenta), `linear` (sombra, moeda no ar), `drop` (queda) e `mix`, em `src/components/timing.ts` |
| Pausa viva (`pausa-viva`) | `wave`, `phaseOf`, `breath`, `blink` em `src/components/Idle.tsx`; `Drifters` para partículas; `Person blink`, `Fish tail/blink`, `Cassiopea pulse/sway` |
| Câmera (`movimento`) | `framing`, `cameraBetween`, `Camera` e `Layer` (`src/components/Camera.tsx`); `SlowPush` para a aproximação lenta de um plano sem motivo; enquadramentos de um cenário num arquivo só (exemplo: `parts/lagoonCameras.ts`, `LAB` em `parts/Laboratory.tsx`) |
| Transições (`transicoes`) | corte: dois `Shot`; câmera: `cameraBetween` do enquadramento anterior nos primeiros 0,5 a 1 s do plano novo; varredura: `wipe` no plano novo e `hold` no anterior (`Shot`); transformação: o objeto-ponte desenhado nos dois planos (o quadro que encolhe até virar painel, a luz que cresce e vira fundo) |
| Entre cenas | cada cena é uma `Sequence` sem sobreposição: a transição contínua para a primeira imagem de uma cena começa nela, com a imagem anterior redesenhada (exemplo: `nightfall` de `parts/LagoonShot.tsx`, `ShrinkingLab` com `<Sequence from={-n}>` da cena anterior) |

Movimento que se repete em mais de uma cena vira um primitivo em `src/components/`. Lógica de cálculo que não seja trivial (trajetórias, ciclos, tempos) vai para uma função pura com teste, no padrão de `src/narration/` e `src/components/timing.ts`; a que só serve a um vídeo fica em `parts/`, na pasta dele, com o teste ao lado.

A mesma curva não serve para tudo: `motion.smooth` dos tokens chega em um décimo do tempo e rasteja o resto; uma porta que desce com ela parece fechar em 0,15 s. Use `ramp` para o que tem peso e `settle` só para o que chega e para.

## Efeitos sonoros

A partitura marca onde cabe som, e a cena recebe a marca:

```tsx
<Sfx name="<uso>" from={cueFrame(scene, "oito")} />
```

Texto que entra na tela não leva efeito; reserve o som para o que acontece na imagem (impacto, entrada grande, mudança de cenário), e só quando importa, porque efeito demais cansa. Os momentos vão ao usuário antes de qualquer som ser buscado (`entrevista-movimento`).

O `name` é um uso do catálogo (`src/audio/Sfx.tsx`). Buscar, escolher e catalogar um som novo é da skill `producao`, etapa `efeitos-sonoros`: entregue a ela a lista dos usos que faltam, com o que acontece na imagem em cada um.

## Passo 3: revisão (`revisao/critica-movimento`)

```bash
pnpm lint
pnpm test
pnpm render <vídeo>              # ou uma composição de prévia com as cenas do trecho
pnpm critique <vídeo>            # ou pnpm critique out/<arquivo>.mp4
```

Renderize o vídeo e leia as tiras de quadros consecutivos que `critica-movimento` pede; `ffmpeg -ss <s> -t <dur> -i out/<vídeo>.mp4 -vf "fps=8,scale=320:180,tile=6x5" -frames:v 1 tira.png` monta uma. Com uma medida do `pnpm critique` fora da faixa, o mapa segundo a segundo e o conserto de cada medida estão na seção Medidas da mesma unidade.

Com o trecho renderizado e as suas próprias tiras lidas, acione o subagente `critico-de-movimento`, que não animou nada e faz as passadas de `critica-movimento`. Passe o nome da pasta do vídeo, o caminho do MP4, os planos a julgar e a partitura. Ele julga; quem decide e refaz é você, pelos passos 4 a 6 do procedimento de `critica-movimento`, acionando-o de novo só com os planos alterados.

Depois peça ao usuário para assistir, porque ritmo e suavidade só se julgam em movimento, e entregue junto as tiras das transições e as medidas. O "sim" dele é o **aceite da animação**: registre-o em `src/videos/<vídeo>/approvals.md` (formato nas convenções do `README.md`), com cada medida fora da faixa que ele aceitou.

As próximas etapas são a trilha e o corte final, na skill `producao`.
