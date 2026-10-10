# Animação das cenas

Dá tempo a uma imagem que já existe. Depende de duas coisas concretas: a composição do trecho estável o bastante para testar a hipótese de movimento (o que aparece, quem é cada figura, o texto de tela), e o tempo real da fala, em `public/videos/<vídeo>/narration.json`, quando o movimento depende dela. Uma cena pode ser animada sem que os outros planos do vídeo estejam compostos; a que ainda não tem composição que se sustente parada volta ao quadro (`etapas/animatic.md`), porque movimento não salva quadro fraco. Aqui se descobre e se executa o tempo dessa imagem: quando cada mudança acontece, como o corpo conta a ação, o que fica parado, para onde o olho vai, como os planos se ligam, onde a ênfase ajuda e que ritmo o vídeo ganha em movimento.

O caminho é o do animatic: uma hipótese de movimento, um trecho inteiro, o render, o que se viu, e só então o resto do vídeo.

Leia a skill `remotion-best-practices` (regras de `remotion-markup`) antes de escrever. O essencial: todo movimento sai de `useCurrentFrame()` com `interpolate()` e `Easing`; transições e animações de CSS não renderizam; prefira as propriedades `scale`, `translate` e `rotate` a `transform`.

## Começar pelo trecho de maior risco

Quando há uma dúvida de movimento que pesa, comece pelo menor trecho que a concentra, com tudo o que nela interage: a fala, a atuação, a pausa, a câmera, a passagem, a ênfase. Câmera testada sem a atuação, ou efeito sem o impacto, não responde nada.

- **Escolha pelo risco, não pela ordem**: a primeira atuação importante do protagonista, a passagem mais difícil, o plano em que câmera e personagem se mexem juntos, a ação que precisa parecer pesada, o momento que define o andamento.
- **Do menor tamanho que contém a causa, a mudança e a consequência**: um plano, dois, três segundos, quinze. Não se anima uma cena inteira só porque o arquivo é uma cena.
- **Renderize cedo**, com `pnpm scene`, enquanto mudar a linguagem de movimento ainda é barato, e leia o trecho como `critica-movimento` descreve.
- **Conserte ali antes de multiplicar.** É nesse trecho que se descobre que as ações estão rígidas, que tudo usa a mesma curva, que a câmera não para, que as figuras deslizam ou que as pausas foram preenchidas sem causa.

Sem dúvida desse tamanho (a linguagem de movimento já foi provada num trecho aceito do mesmo vídeo), não há trecho de prova: anime.

## Partitura

A partitura (`entrevista-movimento`) fica em `src/videos/<vídeo>/score.md`, uma seção por cena (o `id` dela) e um item por plano, e vai para o git: é o que o `motion-designer` recebe, o que o `critico-de-movimento` lê e o que a skill `diretor-de-som` usa.

Ela é escrita aos poucos, por trecho, por cena ou por família de movimento, e não o vídeo inteiro antes de qualquer código. Antes de animar um trecho, basta o que é preciso para animar:

- **o que acontece e com que intenção** ("a moeda bate na porta, e o impacto precisa ser sentido"; "a câmera revela que há muitos outros"; "ela percebe o perigo antes de correr");
- **a causa**: a deixa de cada mudança (`sincronia`), e as relações de tempo que importam.

O número mudo que o usuário aceitou na lista (`entrevista-movimento`) já chega escrito na seção da cena, e é animado sobre as poses de extremo dele (`etapas/animatic.md`).

Os tempos das palavras vêm de `public/videos/<vídeo>/narration.json`; `scripts/check-script.ts` mostra a duração de cada plano. A deixa é âncora, não coreografia palavra por palavra: a imagem acompanha o sentido da fala.

Tempos, curvas, técnica de passagem, amplitude e ênfase são o estado atual da execução. Nascem no render e são escritos depois dele. Quando a animação acha coisa melhor que o escrito (o movimento de 0,4 s que funciona em 0,8 s, a varredura que vira transformação mantendo a mesma relação), fica o que funciona e a partitura é atualizada: não se conserta o vídeo para obedecer ao documento. O que muda a intenção vai ao usuário (`entrevista-movimento`).

## Expandir

Depois que o trecho funciona, veja o que nele vale repetir, e com que alcance: a atuação de um personagem, o comportamento da câmera, a intensidade geral, o jeito de ligar planos, a decisão de deixar as pausas imóveis. O que se leva adiante é o princípio provado, não a técnica: a porta que ficou pesada com uma curva não faz dela a curva das portas.

- **A atenção vai para a novidade.** A cena parecida com uma já provada sai depressa. A que traz uma atuação, uma linguagem de câmera ou uma passagem novas é renderizada e olhada cedo.
- **Em volume, quem anima é o subagente `motion-designer`**: um disparo por cena, com a pasta do vídeo, a cena, a partitura dela e a lista dos arquivos que ele pode tocar. Um primitivo novo em `src/components/` e a transição que atravessa duas cenas são feitos por você. Paralelize quando a linguagem já passou por um render, as cenas não dependem da mesma decisão em aberto e as listas não se cruzam: cinco agentes sobre a mesma hipótese de atuação multiplicam o erro dela.
- **A ação vem antes da ênfase.** Primeiro ela funciona sem efeito; se uma propriedade continua fraca, `efeitos` oferece saída.
- **A relação entre dois planos vem antes da técnica da passagem**, que pode ser achada no render.
- **Um refino de composição cabe aqui.** A figura que se desloca um pouco para a câmera não cortá-la continua dizendo o que o quadro dizia. O que muda o foco, a relação ou a identidade segue a fronteira de `entrevista-imagem`.
- **Pare um movimento quando** a intenção se entende, a causa, o peso e o foco funcionam, o defeito que motivou o trabalho sumiu e nada em volta piorou. Não se continua por suavidade, por quadros diferentes, por parecer com a referência ou para usar o que o projeto tem.

## Onde está cada coisa no código

Cada plano é um componente pequeno dentro de `<Shot range={shots[i]}>` (`src/video/Shot.tsx`): dentro dele `useCurrentFrame()` conta a partir do começo do plano, e `useShotLength()` (do mesmo arquivo) dá a duração dele. Não use `useVideoConfig().durationInFrames` para isso: num plano que divide o palco com o seguinte ele vem esticado pelos quadros da passagem, e o que termina "no fim do plano" pula na troca. As deixas vêm de `cue(scene, "palavra")` (`src/components/timing.ts`, já com a antecipação de alguns quadros), descontando `shots[i].from` quando o plano não é o primeiro da cena. Os limites dos planos já antecipam a palavra de deixa (`CUE_LEAD_FRAMES` em `src/narration/timeline.ts`).

O mapa abaixo diz o que já existe. Existir não é motivo para usar: a pausa pode ficar imóvel, a câmera pode ficar parada, e uma solução ainda em teste pode ser escrita na própria cena. Os primitivos valem para todo vídeo e moram em `src/`; o que a tabela cita em `parts/` é do `why-we-sleep` (`src/videos/why-we-sleep/parts/`) e serve de exemplo.

| Para quê | O que já existe |
|---|---|
| Entrada com sobra (`entradas`) | `Pop` e `popScale`/`popOpacity` (`src/components/Pop.tsx`) |
| Curvas (`entradas`, `acao`) | `ramp` (acelera e desacelera: câmera, porta, maré), `settle` (chega depressa e assenta), `linear` (sombra, moeda no ar), `drop` (queda) e `mix`, em `src/components/timing.ts` |
| Movimento residual (`pausa-viva`) | `wave`, `phaseOf`, `breath`, `blink` em `src/components/Idle.tsx`; `Drifters` para partículas do meio; `Person blink`, `Fish tail/blink`, `Cassiopea pulse/sway` |
| Câmera (`movimento`) | `framing`, `cameraBetween`, `Camera` e `Layer` (`src/components/Camera.tsx`); `SlowPush` para a deriva lenta; enquadramentos de um cenário num arquivo só (exemplo: `parts/lagoonCameras.ts`, `LAB` em `parts/Laboratory.tsx`) |
| Passagens (`transicoes`) | corte: dois `Shot`; câmera: `cameraBetween` do enquadramento anterior, no começo do plano novo; varredura: `wipe` no plano novo e `hold` no anterior (`Shot`); transformação: a ponte desenhada nos dois planos (o quadro que encolhe até virar painel, a luz que cresce e vira fundo) |
| Entre cenas | cada cena é uma `Sequence` sem sobreposição: a transição contínua para a primeira imagem de uma cena começa nela, com a imagem anterior redesenhada (exemplo: `nightfall` de `parts/LagoonShot.tsx`, `ShrinkingLab` com `<Sequence from={-n}>` da cena anterior) |

Armadilha conhecida das curvas: `motion.smooth` dos tokens, que é a de `settle`, chega em um décimo do tempo e rasteja o resto; uma porta que desce com ela parece fechar em 0,15 s. Que curva um movimento pede é de `entradas`.

Um movimento vira primitivo em `src/components/` quando a repetição de verdade já mostrou uma abstração estável: a mesma lógica, e não dois deslocamentos parecidos com pesos e fins diferentes. Na dúvida, fica na cena. Lógica de cálculo que não seja trivial (trajetórias, ciclos, tempos) vai para uma função pura com teste, no padrão de `src/narration/` e `src/components/timing.ts`; a que só serve a um vídeo fica em `parts/`, na pasta dele, com o teste ao lado. Um deslocamento ou uma curva de uso único não pede função.

## Som

Nenhuma cena toca som. Os efeitos são da skill `diretor-de-som`, que os declara no roteiro (`sfx`) a partir da partitura. Por isso, quando uma ação fica pronta, a partitura registra a palavra de deixa e quanto tempo depois dela a coisa acontece (a moeda cai 1 s depois de ser jogada). O instante é escrito depois de a ação funcionar na imagem, e não o contrário. Uma ação que pede som e não tem instante claro na partitura não ganha efeito.

## Ver e conferir

Valide o código pela regra de `AGENTS.md`. Para conferir imagem e movimento:

```bash
pnpm scene <vídeo> <id> [id...]  # só as cenas mexidas, em out/<vídeo>/cenas/<id>.mp4
pnpm critique out/<vídeo>/cenas/<id>.mp4
pnpm join <vídeo>                # o vídeo inteiro, das cenas já renderizadas e do som
pnpm critique <vídeo>
```

O render tem o tamanho da pergunta. O `pnpm scene` é o caminho de todo dia: o trecho de prova, as cenas mexidas, a revisão local. O `pnpm join` entra quando a pergunta é a continuidade entre cenas, o ritmo maior ou a revisão do conjunto. As medidas acompanham a escala: uma trajetória se julga no vídeo e na tira, e a medida do vídeo inteiro não dirige uma microanimação.

Renderize só as cenas que mudaram: um desenho de `src/art/` ou de `parts/` que mudou pede todas as cenas que o usam, e uma frase da narração que mudou pede a cena dela (o `pnpm join` acusa as que ficaram com a duração antiga). Leia o trecho como `critica-movimento` descreve: uma tira esparsa do trecho inteiro e uma densa onde houver dúvida; `ffmpeg -ss <s> -t <dur> -i out/<vídeo>/cenas/<id>.mp4 -vf "fps=8,scale=320:180,tile=6x5" -frames:v 1 tira.png` monta uma. Com uma medida do `pnpm critique` fora da faixa, o mapa segundo a segundo e o que ela enxerga estão na seção Medidas da mesma unidade.

A crítica acontece no caminho, e não só no fim. O subagente `critico-de-movimento`, que não animou nada, entra onde a cegueira de quem fez custa caro: no primeiro trecho, que define a linguagem; quando chega uma atuação, uma câmera ou uma passagem nova; diante de um defeito que não cede; antes de uma decisão que vai ao usuário; e na revisão do vídeo inteiro. O ajuste de dois quadros que você viu e sabe consertar é feito e conferido por você. Passe a ele o nome da pasta do vídeo, o caminho do MP4, os planos a julgar e a partitura. Ele julga; quem decide e refaz é você: os bloqueantes são refeitos, e os relevantes enquanto o retorno compensa; o conserto que muda uma decisão tomada (o que acontece, o foco de um plano, a relação entre dois planos, o que a composição diz) vai antes ao usuário, e o que só refina a execução, não (`entrevista-movimento`). Renderize de novo só as cenas mexidas, confira o defeito que motivou a mudança e acione o subagente de novo só com os planos alterados. Se uma rodada não resolver nenhum defeito, informe ao diretor o que foi tentado e a evidência restante; ele define a próxima hipótese.

O conjunto está pronto para ir ao usuário quando: todo trecho que precisa de movimento o tem, não se conhece defeito que impeça o entendimento, o tempo, a atuação, a câmera e as passagens que importam funcionam em contexto, as decisões que eram do usuário foram tomadas, a partitura diz o que está na tela, e o que resta é polimento de retorno baixo. Não se exige medida dentro da faixa, movimento em todo plano, câmera ativa, efeito, quadros sempre diferentes nem uso de todos os primitivos.

## O conjunto diante do usuário

Só quando o trabalho é a animação do vídeo inteiro: uma cena animada termina na dúvida de movimento dela resolvida, sem passar por aqui. Peça ao usuário para assistir ao vídeo inteiro, porque ritmo, peso e cansaço só ele julga. Chame a atenção dele só para o que pede olhar:

- as decisões novas e os trechos cuja leitura mudou em relação ao animatic;
- os defeitos em aberto, cada um com a evidência dele;
- as medidas fora da faixa que levantaram dúvida.

O que cabe a ele é dizer se o vídeo funciona em movimento, se o ritmo e o peso servem e se as decisões de atuação, câmera e passagem estão certas. O que ele decidir sobre a intenção entra em `score.md`, e em nenhum outro registro. A medida fora da faixa que foi conferida no trecho e não mostrou defeito vai dita na entrega: é sensor, e não pendência que ele precise aceitar. A resposta não congela quadro, tempo fino, amplitude nem técnica equivalente: o refino que preserva a intenção continua valendo (`entrevista-movimento`).
