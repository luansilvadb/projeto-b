import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Expression } from "../../../art/Person";
import { Sfx } from "../../../audio/Sfx";
import {
  Build,
  framing,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, clamp01 } from "../../../components/timing";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { markFor } from "../../../video/stage";
import { coin } from "../palette";
import {
  Bedroom,
  EmptyDisc,
  Friend,
  Gardner,
  ROOM,
  RoomSet,
  TossedCoin,
} from "../parts/Gardner";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Tag } from "../parts/Tag";
import { Ahead, Early, flash, shake } from "./MaybeBrainScene";

// O bloco de Gardner é lilás: a blusa laranja dele some no pêssego.
const HUE = "lilac";

type Point = readonly [number, number];

/** Um olhar que muda de alvo: `[quadro, x, y]`. O primeiro é de onde parte; cada um dos seguintes é alcançado em `frames` quadros. */
type Glance = readonly [at: number, x: number, y: number];

/** Para onde os olhos estão num quadro, passando de um alvo ao seguinte com peso, e não num quadro só. */
export const glance = (
  frame: number,
  keys: readonly Glance[],
  frames = 5,
): Point =>
  keys.slice(1).reduce<Point>(
    (from, [at, x, y]) => {
      const t = ramp(frame, at, frames);
      return [mix(from[0], x, t), mix(from[1], y, t)];
    },
    [keys[0][1], keys[0][2]],
  );

/** A entrada com forma, sem opacidade: de 0 até passar um pouco do tamanho, e assenta. */
export const grown = (frame: number, at: number, frames = 11): number =>
  interpolate(frame, [at, at + frames * 0.7, at + frames], [0, 1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

/** O ponto do cenário que a câmera mostra num ponto da tela: o contrário do enquadramento. */
const unseen = (camera: CameraState, screen: Point): Point => [
  WIDTH / 2 + (screen[0] + camera.x - WIDTH / 2) / camera.zoom,
  HEIGHT / 2 + (screen[1] + camera.y - HEIGHT / 2) / camera.zoom,
];

/**
 * A câmera de um plano do quarto: o enquadramento composto, ao qual ela chega
 * no fim do plano, vindo de um pouco mais longe (a deriva lenta, decisão 2 do
 * piloto). A chegada do enquadramento anterior é do palco (`sets`). `hold` é o
 * ponto da tela que não se mexe na deriva: o centro, ou a borda que não pode
 * mostrar o que está fora do quadro composto.
 */
export const settling = (
  focus: Point,
  zoom: number,
  t: number,
  by = 0.035,
  hold: Point = [WIDTH / 2, HEIGHT / 2],
): CameraState =>
  framing(
    [
      focus[0] + (hold[0] - WIDTH / 2) / zoom,
      focus[1] + (hold[1] - HEIGHT / 2) / zoom,
    ],
    zoom * (1 - by * (1 - Math.min(1, t))),
    hold,
  );

/** Parado em pé, Gardner troca o peso de um pé para o outro: quanto o corpo pende, em graus. */
export const shifting = (seconds: number): number =>
  0.9 * wave(seconds, 5.3, 0.3);

/** A troca de expressão sob a pálpebra: fecha, troca no meio e abre. Devolve a piscada e se a expressão nova já vale. */
export const swapUnderLid = (
  frame: number,
  at: number,
  frames = 6,
): { readonly lid: number; readonly done: boolean } => ({
  lid: flash(frame, at, frames),
  done: frame >= at + frames / 2,
});

// O disco começa no centro, grande, e vai para o canto de baixo, à esquerda (o selo da fonte ocupa o da direita).
const DISC = {
  from: { x: 960, y: 560, scale: 1.5 },
  to: { x: 310, y: 840, scale: 0.5 },
};
/** Onde Gardner para no plano em que entra: o plano do quarto o recebe daqui. */
const NEWCOMER = { x: 1000, y: 980, height: 720 };
// Ele vem de fora do quadro, pela direita. A partitura dava 0,9 s à entrada; andando, e não deslizando,
// a travessia de meio quadro pede mais: seis passos, a pouco menos de 0,3 s cada.
const WALK = { from: 2260, frames: 50, steps: 6, brake: 7, turn: 8 };
// A câmera acompanha a entrada dele: começa um pouco mais aberta e deslocada para o lado de onde ele vem.
const FOLLOW = { focus: [1420, 620] as const, by: 0.07, rest: 0.02 };
/**
 * O disco abre o plano, e começa a crescer estes quadros antes de a cena
 * chegar: no fim de `unknown-cause`, no lugar em que a balança encolhe.
 */
export const DISC_LEAD = 9;
// Quanto a marcação do elenco é adiantada para isso.
const DISC_SOONER = markFor("actor", DISC.from.x).enterAt + DISC_LEAD;

type DiscPreludeProps = {
  /** Quantos quadros faltam para a cena começar. */
  readonly until: number;
  /** O quadro do vídeo em que a cena começa. */
  readonly clock: number;
};

/**
 * O disco vazio entrando, antes de a cena começar: o último plano de
 * `unknown-cause` o desenha no lugar em que a balança encolhe, e a troca não
 * deixa a parede do laboratório sozinha. O plano abre no estado em que isto parou.
 */
export const DiscPrelude: React.FC<DiscPreludeProps> = ({ until, clock }) => {
  const { fps } = useVideoConfig();
  const seconds = (clock - until) / fps;
  return (
    <Ahead until={until} by={DISC_SOONER}>
      <AbsoluteFill
        style={{
          transformOrigin: `${FOLLOW.focus[0]}px ${FOLLOW.focus[1]}px`,
          // A câmera do plano, onde ela está no primeiro quadro dele.
          scale: `${1 - FOLLOW.by}`,
        }}
      >
        <EmptyDisc
          {...DISC.from}
          turn={(seconds * Math.PI * 2) / 9}
          ripple={wave(seconds, 2.3)}
        />
      </AbsoluteFill>
    </Ahead>
  );
};

type DiscShotProps = {
  /** Quadros do plano em que o disco vai para o canto, em que Gardner começa a entrar e em que a etiqueta de nome entra. */
  readonly awayAt: number;
  readonly walkAt: number;
  readonly nameAt: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
};

/** O disco dos ratos, vazio, encolhe para o canto; no lugar dele entra o rapaz, andando. */
const DiscShot: React.FC<DiscShotProps> = ({
  awayAt,
  walkAt,
  nameAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const away = ramp(frame, awayAt, 0.7 * fps);
  // Ele anda a velocidade quase constante e freia ao chegar.
  const arriveAt = walkAt + WALK.frames;
  const walked =
    1 - (1 - clamp01((frame - walkAt) / WALK.frames)) ** 1.5;
  const x = mix(WALK.from, NEWCOMER.x, walked);
  const gait = clamp01((arriveAt - frame) / WALK.brake);
  // Chegando, vira-se para quem assiste: a meia-volta passa pelo perfil.
  const facing = mix(-1, 1, ramp(frame, arriveAt - 5, WALK.turn));
  const arrived = ramp(frame, arriveAt - 2, 8);
  // "Olha em volta": o disco no canto, o outro lado, e a etiqueta com o nome dele quando ela estoura.
  // Enquanto anda, espelhado, o olhar vai à frente dele.
  const eyes = glance(frame, [
    [0, 0.7, 0],
    [arriveAt - 5, 0, 0],
    [arriveAt + 16, -0.9, 0.35],
    [arriveAt + 40, 0.8, -0.15],
    [nameAt + 4, 0, -1],
    [nameAt + 22, 0, 0],
  ]);
  // A câmera chega quase ao quadro composto quando ele para, e o resto vem devagar, até o fim do plano.
  const settledAt = arriveAt + 10;
  const followed =
    mix(1 - FOLLOW.by, 1 - FOLLOW.rest, ramp(frame, walkAt, WALK.frames + 10)) +
    FOLLOW.rest *
      clamp01((frame - settledAt) / (length - settledAt));

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={HUE} spot={[0.52, 0.5]} />}>
        <AbsoluteFill
          style={{
            transformOrigin: `${FOLLOW.focus[0]}px ${FOLLOW.focus[1]}px`,
            scale: `${followed}`,
          }}
        >
          <Early by={DISC_SOONER}>
            <EmptyDisc
              x={mix(DISC.from.x, DISC.to.x, away)}
              // Vai num arco: sobe um pouco antes de descer para o canto.
              y={
                mix(DISC.from.y, DISC.to.y, away) -
                70 * Math.sin(Math.PI * away)
              }
              scale={mix(DISC.from.scale, DISC.to.scale, away)}
              // No canto, o tampo continua girando devagar, e a água da bandeja mexe.
              turn={(seconds * Math.PI * 2) / 9}
              ripple={wave(seconds, 2.3)}
            />
          </Early>
          {/* Ele é o que este plano e o do quarto têm em comum: não sai, e o outro o leva daqui até o lugar dele. */}
          {stage.handedOver ? null : (
            <Stay>
              <SvgLayer>
                <IdeaShadow hue={HUE} x={x} y={NEWCOMER.y + 6} width={340} />
              </SvgLayer>
              <Gardner
                x={x}
                y={NEWCOMER.y}
                height={NEWCOMER.height}
                facing={facing}
                // Andando, o corpo pende para a frente.
                lean={-3 * gait * (1 - arrived) + shifting(seconds) * arrived}
                stride={{ step: WALK.steps * walked, gait }}
                gaze={eyes}
                blink={blink(seconds, "gardner")}
                breath={mix(1, breath(seconds, "gardner"), arrived)}
              />
            </Stay>
          )}
          <Place x={NEWCOMER.x} y={NEWCOMER.y - NEWCOMER.height - 60}>
            <Pop at={nameAt}>
              <Tag size="note" on={HUE}>
                Randy Gardner
              </Tag>
            </Pop>
          </Place>
        </AbsoluteFill>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// O quarto inteiro; de perto, o cartaz e as três cabeças viradas para ele. O ponto é o que vai para o centro do quadro.
const WHOLE = { focus: [960, 540], zoom: 1 } as const;
const ON_POSTER = { focus: [755, 520], zoom: 1.4 } as const;
const [LEFT, MIDDLE, RIGHT] = ROOM.boys;
const BOYS = ["boy-left", "gardner", "boy-right"] as const;
// Onde fica a cabeça de cada um, para os olhos seguirem a moeda.
const HEADS = ROOM.boys.map(
  (boy) => [boy.x, ROOM.floor - boy.height * 0.71] as const,
);

type RoomProps = {
  readonly camera: CameraState;
  /** Quanto o fundo já tomou a cor dele, e onde fica a mancha clara, em fração do quadro. */
  readonly lit?: number;
  readonly spot?: Point;
  readonly children: React.ReactNode;
};

/**
 * O molde dos planos do quarto: o fundo liso, que não anda com a câmera, e o
 * cenário. O quarto não sobe de baixo do quadro como os cenários em camadas:
 * quem o monta e desmonta são os planos das pontas, à vista.
 */
export const Room: React.FC<RoomProps> = ({
  camera,
  lit = 1,
  spot = [0.34, 0.5],
  children,
}) => {
  const built = useBuild();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: lit }}>
        <IdeaBackdrop hue={HUE} spot={spot} />
      </AbsoluteFill>
      <Build {...built} lit={1} risen={1}>
        <RoomSet camera={camera}>{children}</RoomSet>
      </Build>
      <Grain />
    </AbsoluteFill>
  );
};

type BoyShadowsProps = {
  /** Onde Gardner está e a altura dele; os amigos ficam nos lugares do quarto. */
  readonly middle: { readonly x: number; readonly height: number };
  /** Quanto cada amigo já entrou, de 0 a 1. */
  readonly friends?: readonly [number, number];
};

const BoyShadows: React.FC<BoyShadowsProps> = ({
  middle,
  friends = [1, 1],
}) => (
  <SvgLayer>
    <IdeaShadow
      hue={HUE}
      x={LEFT.x}
      y={ROOM.floor + 6}
      width={LEFT.height * 0.46 * friends[0]}
    />
    <IdeaShadow
      hue={HUE}
      x={middle.x}
      y={ROOM.floor + 6}
      width={middle.height * 0.46}
    />
    <IdeaShadow
      hue={HUE}
      x={RIGHT.x}
      y={ROOM.floor + 6}
      width={RIGHT.height * 0.46 * friends[1]}
    />
  </SvgLayer>
);

// O quarto se monta em volta dele: o chão sobe, e ele vai do meio do quadro para o lugar dele, menor.
const REFRAME = { frames: 18, floor: 200 };
// Os amigos entram um depois do outro, com este intervalo em quadros.
const FRIEND_GAP = 6;

type CalendarShotProps = {
  /** Quadros do plano em que o calendário estoura, em que "17 anos" entra e em que os amigos chegam. */
  readonly calendarAt: number;
  readonly ageAt: number;
  readonly friendsAt: number;
  readonly clock: number;
};

/** O quarto: o calendário de dezembro de 1963 na parede, "17 anos" sobre ele, e os dois amigos, um de cada lado. */
const CalendarShot: React.FC<CalendarShotProps> = ({
  calendarAt,
  ageAt,
  friendsAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const length = useShotLength();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const camera = settling(WHOLE.focus, WHOLE.zoom, frame / length);
  // Ele chega como o plano anterior o deixou, no meio do quadro, e vai para o lugar dele no quarto.
  const placed = ramp(frame, 0, REFRAME.frames);
  const from = unseen(camera, [NEWCOMER.x, NEWCOMER.y]);
  const middle = {
    x: mix(from[0], MIDDLE.x, placed),
    y: mix(from[1], ROOM.floor, placed),
    height: mix(NEWCOMER.height / camera.zoom, MIDDLE.height, placed),
  };
  const rightAt = friendsAt + FRIEND_GAP;
  // Ele olha o calendário quando ele estoura, a etiqueta dele, e cada amigo que chega.
  const eyes = glance(frame, [
    [0, 0, 0],
    [calendarAt + 4, 1, -0.3],
    [calendarAt + 34, 0, 0],
    [ageAt + 4, 0, -1],
    [ageAt + 24, 0, 0],
    [friendsAt + 3, -1, 0.05],
    [rightAt + 4, 1, 0.05],
    [rightAt + 14, 0, 0],
  ]);

  return (
    <Room camera={camera} lit={stage.enter()}>
      <Bedroom
        hue={HUE}
        on={HUE}
        // O cartaz só entra no plano seguinte, na palavra dele.
        posterAt={length * 2}
        calendarAt={calendarAt}
        sunk={REFRAME.floor * (1 - ramp(frame, 0, REFRAME.frames - 4))}
        seconds={seconds}
      />
      <BoyShadows
        middle={middle}
        friends={[grown(frame, friendsAt), grown(frame, rightAt)]}
      />
      <Friend
        {...LEFT}
        y={ROOM.floor}
        which={0}
        enter={friendsAt}
        gaze={[0, 0]}
        blink={blink(seconds, BOYS[0])}
        breath={breath(seconds, BOYS[0])}
      />
      <Friend
        {...RIGHT}
        y={ROOM.floor}
        which={1}
        enter={rightAt}
        gaze={[0, 0]}
        blink={blink(seconds, BOYS[2])}
        breath={breath(seconds, BOYS[2])}
      />
      <Gardner
        id={BOYS[1]}
        {...middle}
        gaze={eyes}
        blink={blink(seconds, "gardner")}
        breath={breath(seconds, "gardner")}
        lean={shifting(seconds)}
        nameAt={ageAt}
        name="17 anos"
        on={HUE}
      />
    </Room>
  );
};

// O cartaz estoura com a câmera já perto; as cabeças viram para ele logo depois, uma de cada vez.
const POSTER = { notBefore: 16, look: 5, stagger: 2 };
// Para onde eles olham: o cartaz fica à direita dos três, no alto.
const AT_POSTER = [1, -0.55] as const;

type PosterShotProps = {
  /** Quadro do plano em que o cartaz estoura. */
  readonly posterAt: number;
  readonly clock: number;
};

/** De perto, o cartaz "recorde: 260 h" estoura na parede, e os três viram a cabeça para ele. */
const PosterShot: React.FC<PosterShotProps> = ({ posterAt, clock }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  // Cada um fecha os olhos, vira e abre já olhando para o cartaz.
  const turned = BOYS.map((boy, index) => {
    const at = posterAt + POSTER.look + index * POSTER.stagger;
    const swap = swapUnderLid(frame, at);
    return {
      expression: (swap.done ? "curious" : "neutral") as Expression,
      blink: Math.max(blink(seconds, boy), swap.lid),
      gaze: glance(frame, [
        [0, 0, 0],
        [at + 1, ...AT_POSTER],
      ]),
      breath: breath(seconds, boy),
    };
  });

  return (
    <Room
      // A deriva segura a borda direita: mais aberto, o quadro mostraria a ponta do calendário.
      camera={settling(ON_POSTER.focus, ON_POSTER.zoom, frame / length, 0.03, [
        WIDTH,
        HEIGHT / 2,
      ])}
    >
      <Bedroom hue={HUE} on={HUE} posterAt={posterAt} seconds={seconds} />
      <BoyShadows middle={MIDDLE} />
      <Friend {...LEFT} y={ROOM.floor} which={0} {...turned[0]} />
      <Friend {...RIGHT} y={ROOM.floor} which={1} {...turned[2]} />
      <Gardner
        id={BOYS[1]}
        {...MIDDLE}
        y={ROOM.floor}
        {...turned[1]}
        lean={shifting(seconds)}
        // "17 anos" sai quando a câmera parte para o cartaz.
        nameAt={-1000}
        name="17 anos"
        nameGone={ramp(frame, 0, 6)}
        on={HUE}
      />
    </Room>
  );
};

// A moeda: o amigo de verde ergue a mão (aviso), joga, e ela sobe girando por cima de Gardner e cai
// entre ele e o outro amigo, onde quica uma vez e deita. Tempos em quadros do plano.
const TOSS = {
  shown: 1,
  at: 6,
  frames: 24,
  apex: 150,
  land: [706, 938] as const,
  rest: [722, 938] as const,
  bounce: { frames: 6, height: 34 },
  // No ar ela dá duas voltas; deitada no chão, fica quase de perfil.
  flat: 1.2,
  turns: 2,
};
// A mão que joga, nas unidades do desenho da pessoa: solta, sobe com a moeda, recua, estala para cima e volta.
const FLICK = {
  frames: [0, 2, 4, 6, 9, 20],
  x: [100, 114, 112, 126, 122, 100],
  y: [-214, -250, -232, -326, -300, -214],
  bend: [73, 56, 60, 18, 26, 73],
};
// Onde fica a mão de quem joga, no quarto: a figura tem 650 unidades de altura.
const tosser = (hand: Point): Point => [
  LEFT.x + (hand[0] * LEFT.height) / 650,
  ROOM.floor + (hand[1] * LEFT.height) / 650,
];
// Os riscos do impacto no chão, e o rastro da moeda no ar: quantas cópias e a opacidade da primeira.
const BURST = { rays: 6, frames: 9, from: 30, to: 86 };
const TRAIL = { copies: 3, opacity: 0.32 };
// Apontar: o braço sobe com sobra (0,3 s); o segundo amigo, dois quadros depois.
const POINT = { frames: 9, over: 1.12, stagger: 2 };
// O espanto de Gardner: congela, fecha os olhos e os arregala, com um pulinho.
const SHOCK = { freeze: 3, jump: [0, 3, 7, 13], size: [1, 0.96, 1.06, 1] };

type CoinShotProps = {
  /** Quadros do plano em que os amigos apontam e em que Gardner arregala os olhos. */
  readonly pointAt: number;
  readonly shockAt: number;
  readonly clock: number;
};

/** Onde a moeda está, e quanto girou, num quadro do plano. */
const coinAt = (frame: number, hand: Point) => {
  const t = frame - TOSS.at;
  if (t <= 0) {
    // Na mão: pousada sobre o polegar.
    return { x: hand[0], y: hand[1] - 34, spin: TOSS.flat, air: false };
  }
  const start = tosser([FLICK.x[3], FLICK.y[3]]);
  const from: Point = [start[0], start[1] - 34];
  if (t >= TOSS.frames) {
    // No chão: quica uma vez, anda um nada e deita, bamboleando.
    const hop = Math.min(1, (t - TOSS.frames) / TOSS.bounce.frames);
    return {
      x: mix(TOSS.land[0], TOSS.rest[0], hop),
      y: TOSS.land[1] - TOSS.bounce.height * Math.sin(Math.PI * hop),
      spin: TOSS.flat + shake(frame, TOSS.at + TOSS.frames, 14, 0.45, 2),
      air: false,
    };
  }
  // No ar, a queda de verdade: sobe perdendo velocidade, para no alto e cai ganhando.
  const rise = Math.sqrt(from[1] - TOSS.apex);
  const fall = Math.sqrt(TOSS.land[1] - TOSS.apex);
  const top = (TOSS.frames * rise) / (rise + fall);
  const gravity = (from[1] - TOSS.apex) / top ** 2;
  const along = t / TOSS.frames;
  return {
    x: mix(from[0], TOSS.land[0], along),
    y: TOSS.apex + gravity * (t - top) ** 2,
    spin: TOSS.flat + (1 - along) * TOSS.turns * Math.PI * 2,
    air: true,
  };
};

/** Para onde alguém olha para ver um ponto do quarto, de -1 a 1 em cada eixo. */
const toward = (head: Point, point: Point): Point => {
  const reach = Math.hypot(point[0] - head[0], point[1] - head[1]) || 1;
  return [(point[0] - head[0]) / reach, (point[1] - head[1]) / reach];
};

/** Cara ou coroa: a moeda sobe girando e cai, os dois amigos apontam para Gardner, e ele arregala os olhos. */
const CoinShot: React.FC<CoinShotProps> = ({ pointAt, shockAt, clock }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const clamp = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  const landAt = TOSS.at + TOSS.frames;
  const flick = (values: readonly number[]) =>
    interpolate(frame, FLICK.frames, values, {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    });
  const arm = {
    hand: [flick(FLICK.x), flick(FLICK.y)] as const,
    bend: flick(FLICK.bend),
  };
  const hand = tosser(arm.hand);
  const tossed = coinAt(frame, hand);
  const spot: Point = [tossed.x, tossed.y];
  // Os três acompanham a moeda com os olhos, a partir do cartaz, para onde olhavam.
  const tracking = ramp(frame, 0, 5);
  const watching = (index: number): Point => {
    const at = toward(HEADS[index], spot);
    return [
      mix(AT_POSTER[0], at[0], tracking),
      mix(AT_POSTER[1], at[1], tracking),
    ];
  };
  // Os amigos olham a moeda no chão, e então para ele, apontando: o da esquerda primeiro.
  const friend = (index: 0 | 2) => {
    const at = pointAt + (index === 0 ? 0 : POINT.stagger);
    const swap = swapUnderLid(frame, at - 2);
    const look = watching(index);
    const turned = ramp(frame, at, 5);
    const him = toward(HEADS[index], [MIDDLE.x, HEADS[1][1] + 40]);
    return {
      expression: (swap.done ? "neutral" : "curious") as Expression,
      blink: Math.max(blink(seconds, BOYS[index]), swap.lid),
      gaze: [
        mix(look[0], him[0], turned),
        mix(look[1], him[1], turned),
      ] as const,
      reach: interpolate(
        frame,
        [at, at + POINT.frames * 0.65, at + POINT.frames],
        [0, POINT.over, 1],
        { ...clamp, easing: Easing.out(Easing.quad) },
      ),
      breath: breath(seconds, BOYS[index]),
    };
  };
  // Gardner olha a moeda cair, vê um dedo, vê o outro, e só então entende.
  const frozen = shockAt + SHOCK.freeze;
  const shock = swapUnderLid(frame, frozen, 6);
  const coinEyes = watching(1);
  const around = glance(
    frame,
    [
      [0, coinEyes[0], coinEyes[1]],
      [pointAt + 5, -1, 0.1],
      [pointAt + 12, 1, 0.1],
      [frozen + 2, 0, 0],
    ],
    4,
  );
  const jump = interpolate(
    frame,
    SHOCK.jump.map((at) => frozen + 3 + at),
    SHOCK.size,
    clamp,
  );
  const burst = (frame - landAt) / BURST.frames;

  return (
    <Room camera={settling(WHOLE.focus, WHOLE.zoom, frame / length, 0.03)}>
      <Bedroom hue={HUE} on={HUE} seconds={seconds} />
      <BoyShadows middle={MIDDLE} />
      <Friend
        {...LEFT}
        y={ROOM.floor}
        which={0}
        backArm={arm}
        pointing="right"
        {...friend(0)}
      />
      <Friend
        {...RIGHT}
        y={ROOM.floor}
        which={1}
        pointing="left"
        {...friend(2)}
      />
      <Gardner
        id={BOYS[1]}
        {...MIDDLE}
        y={ROOM.floor}
        expression={shock.done ? "surprised" : "curious"}
        gaze={shock.done ? undefined : around}
        blink={Math.max(
          blink(seconds, "gardner"),
          shock.lid,
          // A moeda desce rente ao nariz dele: ele pisca.
          flash(frame, TOSS.at + TOSS.frames - 9, 6),
        )}
        breath={breath(seconds, "gardner") * jump}
        lean={shifting(seconds)}
      />
      {/* O rastro da moeda no ar: cópias dela onde estava nos quadros anteriores. */}
      {tossed.air
        ? Array.from({ length: TRAIL.copies }, (_, copy) => {
            const before = coinAt(frame - copy - 1, hand);
            return before.air ? (
              <div
                key={copy}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: TRAIL.opacity * (1 - copy / TRAIL.copies),
                }}
              >
                <TossedCoin x={before.x} y={before.y} spin={before.spin} />
              </div>
            ) : null;
          })
        : null}
      {frame >= TOSS.shown ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${spot[0]}px ${spot[1]}px`,
            // Ela aparece na mão que sobe, e achata um quadro ao bater no chão.
            scale: `${grown(frame, TOSS.shown, 5)} ${interpolate(frame, [landAt - 1, landAt, landAt + 3], [1, 0.7, 1], clamp)}`,
          }}
        >
          <TossedCoin x={spot[0]} y={spot[1]} spin={tossed.spin} />
        </div>
      ) : null}
      {burst > 0 && burst < 1 ? (
        // O estouro do impacto: riscos curtos, na cor da moeda, que crescem e somem.
        <SvgLayer>
          <g
            stroke={coin.face}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={1 - burst ** 2}
          >
            {Array.from({ length: BURST.rays }, (_, ray) => {
              // Só para cima e para os lados: embaixo está o chão.
              const angle = Math.PI * (1.08 + (0.84 * ray) / (BURST.rays - 1));
              const near = mix(BURST.from, BURST.to - 26, burst);
              const far = mix(BURST.from + 12, BURST.to, burst ** 0.6);
              return (
                <line
                  key={ray}
                  x1={TOSS.land[0] + near * Math.cos(angle)}
                  y1={TOSS.land[1] + near * Math.sin(angle)}
                  x2={TOSS.land[0] + far * Math.cos(angle)}
                  y2={TOSS.land[1] + far * Math.sin(angle)}
                />
              );
            })}
          </g>
        </SvgLayer>
      ) : null}
    </Room>
  );
};

type LeavingFriendsProps = {
  /** O tempo do vídeo, em segundos, e quanto eles já saíram, de 0 a 1. */
  readonly seconds: number;
  readonly gone: number;
};

/**
 * Os dois amigos como o plano da moeda os deixa, apontando para Gardner: o
 * plano da vigília os desenha nos primeiros quadros dele, encolhendo nos
 * próprios pés. (Sem identidade no palco: quem tem é tirado em quatro quadros.)
 */
export const LeavingFriends: React.FC<LeavingFriendsProps> = ({
  seconds,
  gone,
}) => (
  <>
    {([0, 2] as const).map((index) => {
      const boy = ROOM.boys[index];
      return (
        <AbsoluteFill
          key={index}
          style={{
            transformOrigin: `${boy.x}px ${ROOM.floor}px`,
            scale: `${1 - gone}`,
          }}
        >
          <SvgLayer>
            <IdeaShadow
              hue={HUE}
              x={boy.x}
              y={ROOM.floor + 6}
              width={boy.height * 0.46}
            />
          </SvgLayer>
          <Friend
            {...boy}
            y={ROOM.floor}
            which={index === 0 ? 0 : 1}
            pointing={index === 0 ? "right" : "left"}
            gaze={toward(HEADS[index], [MIDDLE.x, HEADS[1][1] + 40])}
            blink={blink(seconds, BOYS[index])}
            breath={breath(seconds, BOYS[index])}
          />
        </AbsoluteFill>
      );
    })}
  </>
);

/** Onde a moeda fica deitada no fim do plano: o plano seguinte a tira dali. */
export const COIN_REST = { x: TOSS.rest[0], y: TOSS.rest[1], spin: TOSS.flat };
/** O quadro do plano da moeda em que ela bate no chão. */
const COIN_LANDS = TOSS.at + TOSS.frames;

export const AwakeRecordScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const room = shots[1].from;
  const coinFrom = shots[3].from;
  // Os amigos chegam um pouco antes da palavra deles, para estarem no lugar meio segundo antes de a câmera partir.
  const friendsAt = Math.min(
    cue(scene, "dois") - room,
    shots[1].to - room - 0.5 * fps - 11 - FRIEND_GAP,
  );
  // Os dedos sobem com a moeda já no chão.
  const pointAt = Math.max(cue(scene, "cobaia") - coinFrom, COIN_LANDS + 3);
  return (
    <>
      <Shot range={shots[0]} name="o disco vazio sai; entra Randy Gardner">
        <DiscShot
          awayAt={cue(scene, "gente")}
          walkAt={cue(scene, "documentados")}
          nameAt={cue(scene, "Rêndi")}
          clock={scene.from}
        />
      </Shot>
      <Shot range={shots[1]} name="três rapazes no quarto, dezembro de 1963">
        <CalendarShot
          calendarAt={REFRAME.frames - 4}
          ageAt={cue(scene, "dezessete") - room}
          friendsAt={friendsAt}
          clock={scene.from + room}
        />
      </Shot>
      <Shot range={shots[2]} name="de perto, o cartaz do recorde">
        <PosterShot
          posterAt={Math.max(
            cue(scene, "recorde") - shots[2].from,
            POSTER.notBefore,
          )}
          clock={scene.from + shots[2].from}
        />
      </Shot>
      <Shot range={shots[3]} name="cara ou coroa: a cobaia é ele">
        <CoinShot
          pointAt={pointAt}
          shockAt={Math.max(cue(scene, "sendo") - coinFrom, pointAt + 14)}
          clock={scene.from + coinFrom}
        />
      </Shot>
      {/* A moeda bate no chão. */}
      <Sfx name="coinDrop" from={coinFrom + COIN_LANDS} />
    </>
  );
};
