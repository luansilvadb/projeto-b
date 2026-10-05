import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { person, savanna, sound } from "../palette";
import { CoffeeTable } from "../parts/CoffeeTable";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { SleepBill } from "../parts/SleepBill";
import { Critter, DEN, SavannaShot, Thicket } from "./NightFallsScene";
import {
  billSway,
  drowsyNod,
  MORNING_ORB,
  OWING,
  OWING_BILL,
} from "./SkipANightScene";

/**
 * A deriva lenta dos planos de fundo liso: quanto o quadro se aproxima do
 * assunto do começo ao fim do plano. O plano começa um pouco mais aberto e
 * TERMINA no quadro composto: assim o que ele entrega ao plano seguinte (a
 * conta, o bolso, a fila) está no lugar exato em que o outro o recebe.
 */
export const DRIFT = 0.04;

/** A aproximação da deriva num quadro do plano: de `1 - by`, no começo, a 1, no fim. */
export const driftZoom = (frame: number, length: number, by = DRIFT): number =>
  1 - by * (1 - Math.min(1, Math.max(0, frame / length)));

type Point = readonly [number, number];

/** Onde um ponto do quadro composto aparece na tela, com a deriva em `zoom`. */
export const drifted = (point: Point, focus: Point, zoom: number): Point => [
  focus[0] + (point[0] - focus[0]) * zoom,
  focus[1] + (point[1] - focus[1]) * zoom,
];

/** O contrário: o ponto do quadro composto que, com a deriva em `zoom`, aparece em `point` na tela. */
export const undrifted = (point: Point, focus: Point, zoom: number): Point => [
  focus[0] + (point[0] - focus[0]) / zoom,
  focus[1] + (point[1] - focus[1]) / zoom,
];

type DriftProps = {
  /** O ponto do quadro para o qual o plano se aproxima: o assunto. */
  readonly focus: Point;
  readonly by?: number;
  /** A aproximação fixa, para quem desenha o elenco de um plano antes de ele começar. */
  readonly zoom?: number;
  readonly children: React.ReactNode;
};

/**
 * A deriva de um plano de fundo liso, a velocidade constante. Vai por dentro
 * do `FlatStage`, só em volta do elenco: o fundo fica fora dela, porque um
 * quadro mais aberto que o composto mostraria a borda do fundo. Usa a duração
 * do plano no roteiro, e não a do `Sequence`, que no palco contínuo é maior.
 */
export const Drift: React.FC<DriftProps> = ({
  focus,
  by = DRIFT,
  zoom,
  children,
}) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
        scale: `${zoom ?? driftZoom(frame, length, by)}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

type GrowProps = {
  /** Quadro, no tempo de quem o contém, em que o elemento começa a crescer, e em quantos quadros chega. */
  readonly at: number;
  readonly frames?: number;
  /** De onde cresce: do centro, ou dos pés para quem está em pé no chão. */
  readonly origin?: "center" | "bottom";
  readonly children: React.ReactNode;
};

/**
 * A entrada de quem tem forma: cresce do próprio ponto, do nada até passar um
 * pouco do tamanho, e assenta. Não usa opacidade, e a curva distribui o
 * crescimento pelos quadros todos (a de `Pop` chega no primeiro décimo do
 * tempo, e a entrada acaba parecendo uma fusão).
 */
export const Grow: React.FC<GrowProps> = ({
  at,
  frames = 11,
  origin = "center",
  children,
}) => {
  const frame = useCurrentFrame();
  const size = interpolate(
    frame,
    [at, at + frames * 0.7, at + frames],
    [0, 1.06, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );
  return (
    <div
      style={{
        scale: `${size}`,
        transformOrigin: origin === "bottom" ? "50% 100%" : undefined,
      }}
    >
      {children}
    </div>
  );
};

const PLOFT = { x: 930, y: 350 };
// "PLOFT" é onomatopeia: estoura na batida e sai logo, em 0,5 s ao todo.
const PLOFT_FRAMES = { shown: 10, leaving: 6 };

// A queda: o aviso antes dela, a descida e o intervalo até o carimbo bater, em segundos.
const FALL = { warning: 0.3, seconds: 0.33, stampAfter: 0.3 };
// A poeira do impacto: quantos tufos para cada lado e quanto duram.
const DUST = { puffs: 3, seconds: 0.55 };
// O carimbo: de que tamanho vem, em quantos quadros desce, e a sobra da batida (afunda e volta).
const STAMP = { from: 2.3, frames: 6, sink: 0.88, back: 5 };
// "Dorme mais tempo": o sol anda no céu, à vista, enquanto ele continua no chão.
const LONGER = { orb: 0.05, seconds: 1.2 };
// "Mais fundo": um suspiro que enche o flanco, e o corpo assenta mais baixo do que estava.
const DEEPER = { sigh: 0.07, sighSeconds: 1.1, sink: 0.05 };
// "Acorda menos": a orelha treme, o olho abre uma fresta, a cabeça ergue um nada, e tudo volta.
const STIR = { head: -7, frames: [0, 5, 13, 22] as const };

type DustProps = {
  /** Quanto da poeira já passou, de 0 (o corpo bate no chão) a 1 (sumiu). */
  readonly t: number;
};

/**
 * A poeira que o corpo levanta ao desabar: nasce pequena sob ele e cresce
 * enquanto se afasta. Não lê o quadro por conta própria: dentro do cenário o
 * relógio é o do vídeo, e não o do plano.
 */
const Dust: React.FC<DustProps> = ({ t }) => {
  if (t <= 0 || t >= 1) {
    return null;
  }
  const away = Easing.out(Easing.cubic)(t);

  return (
    <SvgLayer>
      {[-1, 1].flatMap((side) =>
        Array.from({ length: DUST.puffs }, (_, index) => (
          <circle
            key={`${side}-${index}`}
            cx={DEN.x + side * (70 + (34 + 22 * index) * away)}
            cy={DEN.y - 4 - (8 + 14 * index) * away}
            r={3 + (9 - 2 * index) * away}
            fill={savanna.day.sun}
            opacity={0.75 * (1 - t)}
          />
        )),
      )}
    </SvgLayer>
  );
};

const TABLE = { x: 800, y: 1010, height: 700 };
/** Onde a conta carimbada fica ao lado da mesa: `debt-test` a recebe daqui. */
export const TABLE_BILL = { x: 1500, y: 190, scale: 1.15 };
// O ponto para o qual o plano da mesa deriva: o rosto de quem está sentado.
const TABLE_FOCUS = [820, 560] as const;
// A pessoa entra crescendo nos últimos quadros do plano da savana, enquanto o
// cenário desce: na primeira palavra do plano dela, já está sentada.
const SEATED_BEFORE_FRAMES = 14;
// Em quantos quadros a conta desliza do lado do bicho para o lado da mesa.
const BILL_SLIDE_FRAMES = 20;
// A cabeça que pesa, em quadros a partir da deixa: cede, segura, e então cai até o tampo; a batida a faz quicar.
const HEAD = { give: 13, hold: 6, fall: 14, bounce: 7, lids: 14 };

type SeatedProps = {
  /** Quanto a cabeça já caiu, de 0 a 1, e se o rosto já é o de quem dorme. */
  readonly slump: number;
  readonly asleep: boolean;
  /** Quanto as pálpebras já desceram além da piscada, de 0 a 1. */
  readonly lids: number;
  readonly mugShake: number;
  /** O tempo do plano da mesa, em segundos: negativo enquanto ela ainda entra, no fim do plano anterior. */
  readonly seconds: number;
};

/** A pessoa à mesa do café, com a pausa viva dela: respira, pisca, cabeceia de leve, e o vapor sobe. */
const Seated: React.FC<SeatedProps> = ({
  slump,
  asleep,
  lids,
  mugShake,
  seconds,
}) => (
  <CoffeeTable
    colors={person}
    hue="peach"
    height={TABLE.height}
    // Sonolenta, a cabeça cede um pouco e volta, devagar, até a hora de cair de vez.
    slump={slump + 0.03 * (1 - slump) * (0.5 + 0.5 * wave(seconds, 3.1, 0.75))}
    asleep={asleep}
    seconds={seconds}
    blink={Math.max(blink(seconds, "you"), lids)}
    // Dormindo, a respiração fica mais funda e mais lenta.
    breath={1 + mix(0.022, 0.04, slump) * wave(seconds, 4.2)}
    mugShake={mugShake}
    softSteam
  />
);

type PayingShotProps = {
  /** Quadros do plano em que ele desaba, em que o sono dura mais, em que fica fundo e em que ele quase acorda. */
  readonly fallAt: number;
  readonly longerAt: number;
  readonly deepAt: number;
  readonly stirAt: number;
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

/** O corpo cobra: ele desaba dormindo em pleno dia, e a conta ganha o carimbo. */
const PayingShot: React.FC<PayingShotProps> = ({
  fallAt,
  longerAt,
  deepAt,
  stirAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const warnAt = fallAt - FALL.warning * fps;
  const landAt = fallAt + FALL.seconds * fps;
  const stampAt = landAt + FALL.stampAfter * fps;
  const hitAt = stampAt + STAMP.frames;
  const clamp = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  // O aviso: ele balança para um lado, para o outro, e vai.
  const lean = interpolate(
    frame,
    [warnAt, warnAt + 4, fallAt - 1, fallAt + 3, landAt],
    [0, 4, -3, -6, 0],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  // O corpo achata no chão por dois quadros e volta.
  const impact = interpolate(
    frame,
    [landAt - 1, landAt + 1, landAt + 8],
    [1, 0.88, 1],
    clamp,
  );
  // O carimbo vem de cima, grande e já sólido, acelera até o papel, afunda um pouco e volta.
  const stampSize = interpolate(
    frame,
    [stampAt, hitAt, hitAt + 2, hitAt + STAMP.back],
    [STAMP.from, 1, STAMP.sink, 1],
    {
      ...clamp,
      easing: (t) => (frame < hitAt ? Easing.in(Easing.quad)(t) : t),
    },
  );
  // O papel treme com a batida.
  const hit = (frame - hitAt) / (0.3 * fps);
  const shudder =
    hit <= 0 || hit >= 1 ? 0 : 2.2 * (1 - hit) * Math.sin(hit * Math.PI * 5);
  // As três mudanças que a fala lista, uma por oração.
  const longer = ramp(frame, longerAt, LONGER.seconds * fps);
  const sigh = (frame - deepAt) / (DEEPER.sighSeconds * fps);
  const deeper =
    (sigh <= 0 || sigh >= 1 ? 0 : DEEPER.sigh * Math.sin(Math.PI * sigh) ** 2) -
    DEEPER.sink * ramp(frame, deepAt + 0.4 * fps, 0.9 * fps);
  const stirring = interpolate(
    frame,
    STIR.frames.map((at) => stirAt + at),
    [0, 1, 1, 0],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  const twitch = interpolate(
    frame,
    [stirAt, stirAt + 3, stirAt + 7, stirAt + 10, stirAt + 16],
    [0, 0.7, 0.15, 0.5, 0],
    clamp,
  );
  // "PLOFT" estoura com a batida e sai pelo caminho da entrada, mais depressa.
  const ploftGone = interpolate(
    frame,
    [
      landAt + PLOFT_FRAMES.shown,
      landAt + PLOFT_FRAMES.shown + PLOFT_FRAMES.leaving,
    ],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.quad) },
  );
  const seatAt = length - SEATED_BEFORE_FRAMES;

  return (
    <>
      <SavannaShot
        camera={OWING}
        daylight={1}
        orb={MORNING_ORB.to + LONGER.orb * longer}
        clock={clock}
      >
        <Thicket daylight={1} seconds={seconds} />
        <Critter
          daylight={1}
          // Ele chega como o plano anterior o deixou: cochilando em pé.
          // Na queda o cochilo vira sono: o olho fecha antes, e o pescoço se solta no caminho.
          nod={drowsyNod(seconds) * (1 - ramp(frame, fallAt + 2, 0.27 * fps))}
          rest={drop(frame, fallAt, FALL.seconds * fps)}
          asleep={ramp(frame, fallAt - 3, 0.2 * fps)}
          tired={1}
          lean={lean}
          squash={impact * (1 + deeper)}
          deep={ramp(frame, deepAt, 1.2 * fps)}
          ear={twitch}
          peek={stirring}
          head={STIR.head * stirring}
          seconds={seconds}
        />
        <Dust t={(frame - landAt) / (DUST.seconds * fps)} />
      </SavannaShot>
      {ploftGone < 1 ? (
        <Stay>
          <Place
            x={PLOFT.x}
            y={PLOFT.y - 30 * ploftGone}
            style={{ scale: `${1 - ploftGone}` }}
          >
            <Onomatopoeia
              at={landAt}
              size={110}
              color={sound.hot}
              edge={sound.edge}
              tilt={-14}
            >
              PLOFT
            </Onomatopoeia>
          </Place>
        </Stay>
      ) : null}
      {/* A conta é o que os dois planos têm em comum: não sai com a savana. Quando o plano da mesa chega, é ele quem a desenha. */}
      {stage.handedOver ? null : (
        <Stay>
          <Place
            x={OWING_BILL.x}
            y={OWING_BILL.y}
            style={{
              translate: "-50% 0",
              transformOrigin: "50% 0",
              rotate: `${billSway(seconds) + shudder}deg`,
            }}
          >
            <SleepBill
              scale={OWING_BILL.scale}
              stamp={linear(frame, stampAt, 2)}
              stampSize={stampSize}
            />
          </Place>
        </Stay>
      )}
      {/* Quem está à mesa do plano seguinte entra aqui, enquanto a savana desce: a fala dele já a encontra sentada. */}
      {frame >= seatAt && !stage.handedOver ? (
        <Stay>
          <Drift focus={TABLE_FOCUS} zoom={1 - DRIFT}>
            <Place x={TABLE.x} y={TABLE.y}>
              <Grow at={seatAt}>
                <Seated
                  slump={0}
                  asleep={false}
                  lids={0}
                  mugShake={0}
                  seconds={(frame - length) / fps}
                />
              </Grow>
            </Place>
          </Drift>
        </Stay>
      ) : null}
    </>
  );
};

type MorningShotProps = {
  /** Quadro do plano em que a cabeça começa a cair. */
  readonly dropAt: number;
  /** O quadro do vídeo em que o plano começa: o relógio do balanço da conta. */
  readonly clock: number;
};

/** A manhã depois da noite em claro: a pessoa, de olheiras, deixa a cabeça cair ao lado da xícara. */
const MorningShot: React.FC<MorningShotProps> = ({ dropAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = frame / fps;
  // A cabeça pesa: cede, segura um instante, e então cai de vez até o tampo, onde quica uma vez.
  const fallAt = dropAt + HEAD.give + HEAD.hold;
  const knockAt = fallAt + HEAD.fall;
  const bounce = (frame - knockAt) / HEAD.bounce;
  const slump =
    0.3 * ramp(frame, dropAt, HEAD.give) -
    0.05 * ramp(frame, dropAt + HEAD.give, HEAD.hold) +
    0.75 * drop(frame, fallAt, HEAD.fall) -
    (bounce <= 0 || bounce >= 1 ? 0 : 0.05 * Math.sin(Math.PI * bounce));
  // A xícara treme com a batida.
  const knock = (frame - knockAt) / (0.4 * fps);
  const rattle =
    knock <= 0 || knock >= 1
      ? 0
      : 7 * (1 - knock) * Math.sin(knock * Math.PI * 6);
  // A conta vem do lado do bicho, onde o plano anterior a deixou, para o lado da mesa.
  const slid = ramp(frame, 0, BILL_SLIDE_FRAMES);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.42, 0.5]} />}>
        {/* A conta continua no plano seguinte: não sai com este, e quando o outro chega é ele quem a desenha.
            Vai por trás de quem está sentado: no caminho de um lado ao outro, passa atrás da cabeça. */}
        {stage.handedOver ? null : (
          <Stay>
            <Place
              x={mix(OWING_BILL.x, TABLE_BILL.x, slid)}
              y={mix(OWING_BILL.y, TABLE_BILL.y, slid)}
              style={{
                translate: "-50% 0",
                transformOrigin: "50% 0",
                rotate: `${billSway((clock + frame) / fps)}deg`,
              }}
            >
              <SleepBill
                scale={
                  OWING_BILL.scale *
                  (TABLE_BILL.scale / OWING_BILL.scale) ** slid
                }
                stamp={1}
              />
            </Place>
          </Stay>
        )}
        {/* Ela já estava sentada quando o plano chegou: não entra de novo; sai com ele. */}
        <Stay only="entering">
          <Drift focus={TABLE_FOCUS}>
            <Place x={TABLE.x} y={TABLE.y}>
              <Seated
                slump={slump}
                // As pálpebras descem antes; o rosto de quem dorme só entra com o olho já
                // fechado, no quadro em que a cabeça bate no tampo.
                asleep={frame >= knockAt}
                lids={ramp(frame, dropAt + 2, HEAD.lids)}
                mugShake={rattle}
                seconds={seconds}
              />
            </Place>
          </Drift>
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const SleepDebtScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="ele desaba, e a conta é cobrada">
      <PayingShot
        fallAt={cue(scene, "dorme")}
        longerAt={cue(scene, "tempo")}
        deepAt={cue(scene, "dorme", 2)}
        stirAt={cue(scene, "acorda")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="a pessoa na mesa do café">
      <MorningShot
        dropAt={cue(scene, "pesa") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
