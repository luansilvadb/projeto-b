import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import {
  Cast,
  FlatStage,
  Stay,
  Troupe,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe, useShotLength } from "../../../video/Shot";
import { ink, sound } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { BENCH_Y, LAB, TANK_CENTER, Tank } from "../parts/Laboratory";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  type PulseRhythm,
  settledPhase,
  steady,
} from "../parts/pulse";
import {
  BILL_LINES,
  BILL_WIDTH,
  BillToPocket,
  POCKET_CORNER,
  billHeight,
} from "../parts/SleepBill";
import { Jets, RESTING_Y, TankJellyfish, TankShot } from "../parts/TankShot";
import { NEVER, Preluded, Sooner, flash } from "./MaybeBrainScene";
import { Sweep } from "./NightFallsScene";
import { billSway } from "./SkipANightScene";
import { Drift } from "./SleepDebtScene";

// A conta se abre à esquerda; o tanque fica à direita dela, menor que no laboratório, sob o bolso do canto.
const BILL = { x: 440, y: 200, scale: 1.36 };
const SMALL_TANK = { scale: 0.86, x: 60, y: 96 };
const OUT_SECONDS = 0.9;
// Onde o quadro se divide entre a conta e o bolso, para cada um sair de cena em volta do próprio ponto.
const SPLIT_X = 1500;
// As linhas da conta, nas medidas do desenho dela: onde a primeira fica, o passo, onde o traço começa e o comprimento de cada um.
const ENTRY = {
  first: 156,
  step: 56,
  from: 90,
  width: BILL_WIDTH - 130,
  lengths: [0.86, 0.62, 0.94, 0.7, 0.8],
};
// As linhas acendem uma a uma, com este intervalo em quadros; o carimbo pisca duas vezes.
const LINE_EVERY = 6;
// O tanque abre o plano: entra no primeiro quadro.
const TANK_SOONER = 8;

type BillShotProps = {
  /** Quadros do plano em que a conta sai do bolso, em que as linhas acendem e em que o carimbo pisca. */
  readonly outAt: number;
  readonly linesAt: number;
  readonly stampAt: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
};

/** A conta carimbada sai do bolso marcado no canto e se abre ao lado do tanque. */
const BillShot: React.FC<BillShotProps> = ({
  outAt,
  linesAt,
  stampAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  const outFrames = OUT_SECONDS * fps;
  const out = ramp(frame, outAt, outFrames);
  const floor = BENCH_Y + SMALL_TANK.y;
  const tank: readonly [number, number] = [TANK_CENTER + SMALL_TANK.x, floor];
  const height = billHeight(BILL_LINES) * BILL.scale;
  const left = BILL.x - (BILL_WIDTH * BILL.scale) / 2;
  // O caminho de `debt-returns`, ao contrário: o maço sai do bolso, viaja e se desdobra. Aberta, a conta balança.
  const bill = (
    <BillToPocket
      from={[BILL.x, BILL.y]}
      scale={BILL.scale}
      progress={1 - out}
      creased
      tilt={billSway(seconds + 0.9) * ramp(frame, outAt + outFrames, 12)}
      pocketTilt={2 * billSway(seconds)}
      stamp={
        1 - 0.25 * (flash(frame, stampAt, 8) + flash(frame, stampAt + 9, 8))
      }
    />
  );

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.62, 0.55]} />}>
        <Sooner by={TANK_SOONER}>
          <Drift focus={tank}>
            <Cast origin={tank}>
              <SvgLayer>
                <IdeaShadow hue="peach" x={tank[0]} y={floor + 8} width={860} />
              </SvgLayer>
              <AbsoluteFill
                style={{
                  transformOrigin: `${TANK_CENTER}px ${BENCH_Y}px`,
                  translate: `${SMALL_TANK.x}px ${SMALL_TANK.y}px`,
                  scale: `${SMALL_TANK.scale}`,
                }}
              >
                <Tank platform={TANK_CENTER} clock={clock}>
                  {/* Ela entra e sai com o tanque, e não por conta própria. */}
                  <Troupe cast={false}>
                    <TankJellyfish
                      droop={0.15}
                      rhythm={steady(PULSES_AWAKE)}
                      clock={clock}
                    />
                  </Troupe>
                </Tank>
              </AbsoluteFill>
            </Cast>
          </Drift>
        </Sooner>
        {/* A conta e o bolso são um desenho só, para o papel passar por trás da frente do bolso. O bolso já estava no
            palco; no fim, cada um sai em volta do próprio ponto, e por isso o quadro é desenhado em duas metades. */}
        <Stay only="entering">
          <Cast origin={[BILL.x, BILL.y + height / 2]}>
            <AbsoluteFill
              style={{ clipPath: `inset(0 ${1920 - SPLIT_X}px 0 0)` }}
            >
              {bill}
              {/* As linhas acendem uma a uma: um clarão corre por cima de cada traço. */}
              {out >= 1 ? (
                <SvgLayer>
                  {ENTRY.lengths.map((length, index) => {
                    const lit = flash(
                      frame,
                      linesAt + index * LINE_EVERY,
                      2 * LINE_EVERY,
                    );
                    return lit > 0 ? (
                      <rect
                        key={index}
                        x={left + (ENTRY.from - 6) * BILL.scale}
                        y={
                          BILL.y +
                          (ENTRY.first + ENTRY.step * index - 14) * BILL.scale
                        }
                        width={(ENTRY.width * length + 12) * BILL.scale * lit}
                        height={28 * BILL.scale}
                        rx={14 * BILL.scale}
                        fill={ink.ring}
                        opacity={0.75 * lit}
                      />
                    ) : null;
                  })}
                </SvgLayer>
              ) : null}
            </AbsoluteFill>
          </Cast>
          <Cast origin={[POCKET_CORNER.x, POCKET_CORNER.y]}>
            <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${SPLIT_X}px)` }}>
              {bill}
            </AbsoluteFill>
          </Cast>
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// Um jato: quantos quadros leva para chegar nela, quanto dura e quanto leva para recolher.
const JET = { reach: 9, lasts: 22, back: 8 };
// Depois de cada jato ela fica desperta por este tempo, em quadros, e então os braços voltam a cair.
const ROUSED = { after: 6, lasts: 30 };
// Quanto os braços caem entre um jato e outro, e quanto sobem quando a água bate.
const DROOP = { awake: 0.12, falling: 0.8 };
// Quanto a água a sacode.
const SHAKE = { degrees: 2.4, seconds: 0.18 };
const HISS = { x: 420, y: 330, frames: 15 };
// A aproximação lenta dos dois planos do laboratório, um depois do outro.
const LAB_LATER = framing([TANK_CENTER, 600], 1.05, [TANK_CENTER, 600]);

/** O ritmo do pulso nos dois planos do laboratório, em quadros do vídeo: cai com os braços, sobe a cada jato, e de dia cai de vez. */
const kept = (
  clock: number,
  jets: readonly number[],
  napAt: number,
): readonly PulseRhythm[] => [
  { from: 0, perMinute: PULSES_AWAKE },
  { from: clock + 20, perMinute: PULSES_ASLEEP },
  ...jets.flatMap((at, index) => [
    { from: clock + at + ROUSED.after, perMinute: PULSES_AWAKE },
    ...(index < jets.length - 1
      ? [
          {
            from: clock + at + ROUSED.after + ROUSED.lasts,
            perMinute: PULSES_ASLEEP,
          },
        ]
      : []),
  ]),
  { from: napAt, perMinute: PULSES_ASLEEP },
];

type Kept = {
  /** Quadros do plano dos jatos em que cada um entra. */
  readonly jets: readonly number[];
  readonly rhythm: readonly PulseRhythm[];
  readonly phase: number;
};

type NightTankProps = Kept & {
  /** O quadro do plano dos jatos que é desenhado: o plano seguinte o redesenha depois do fim, por baixo da varredura. */
  readonly at: number;
  /** A duração do plano dos jatos, e o quadro do vídeo em que começa o plano que o desenha. */
  readonly length: number;
  readonly clock: number;
  /** Quanto a luz já apagou, de 0 a 1. */
  readonly dark?: number;
};

/** O laboratório de noite, em índigo, e o tanque aceso: os jatos de água a cutucam cada vez que os braços caem. */
const NightTank: React.FC<NightTankProps> = ({
  at,
  length,
  clock,
  jets,
  rhythm,
  phase,
  dark = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (clock + frame) / fps;
  // Cada jato chega depressa, fica e recolhe.
  const reach = Math.max(
    ...jets.map(
      (jet) => settle(at, jet, JET.reach) - ramp(at, jet + JET.lasts, JET.back),
    ),
  );
  // Os braços caem devagar até o jato seguinte; quando a água bate, sobem de uma vez.
  const droop = jets.reduce(
    (fallen, jet, index) => {
      const next = jets[index + 1] ?? Infinity;
      const up = ramp(at, jet + ROUSED.after, 10);
      const down =
        next === Infinity
          ? 0
          : ramp(
              at,
              jet + ROUSED.after + ROUSED.lasts,
              next - jet - ROUSED.after - ROUSED.lasts,
            );
      return mix(mix(fallen, DROOP.awake, up), DROOP.falling, down);
    },
    mix(DROOP.awake, DROOP.falling, ramp(at, 10, jets[0] - 14)),
  );
  const hit = Math.max(0, reach - 0.6) / 0.4;

  return (
    <TankShot
      camera={cameraBetween(
        LAB.medium,
        LAB.mediumEnd,
        Math.min(1, at / length),
      )}
      hour="night"
      lightsOff={[TANK_CENTER / 1920, 0.5]}
      dark={dark}
      platform={TANK_CENTER}
      clock={clock}
    >
      <TankJellyfish
        x={TANK_CENTER + 5 * hit * wave(seconds, SHAKE.seconds)}
        tilt={SHAKE.degrees * hit * wave(seconds, SHAKE.seconds)}
        droop={droop}
        rhythm={rhythm}
        phase={phase}
        clock={clock}
      />
      <Jets reach={reach} />
    </TankShot>
  );
};

type JetsShotProps = Kept & { readonly clock: number };

/** De noite, os três jatos: cada um com o seu "PSSST", que estoura e sai em meio segundo. */
const JetsShot: React.FC<JetsShotProps> = ({ clock, ...keptAwake }) => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const length = useShotLength();
  const hiss = keptAwake.jets.find(
    (jet) => frame >= jet && frame < jet + HISS.frames,
  );

  return (
    <AbsoluteFill>
      <NightTank
        {...keptAwake}
        at={frame}
        length={length}
        clock={clock}
        // A luz apaga junto com a chegada do laboratório, e não antes dele.
        dark={stage.enter()}
      />
      {hiss === undefined ? null : (
        <div
          style={{
            position: "absolute",
            left: HISS.x,
            top: HISS.y,
            translate: "-50% -50%",
            // Sai pelo caminho da entrada, mais depressa.
            scale: `${1 - ramp(frame, hiss + HISS.frames - 4, 4)}`,
          }}
        >
          <Onomatopoeia
            at={hiss}
            size={120}
            color={sound.cool}
            edge={sound.edge}
            tilt={-8}
          >
            PSSST
          </Onomatopoeia>
        </div>
      )}
    </AbsoluteFill>
  );
};

// O dia varre a noite do laboratório, do lado da janela.
const DAYBREAK: Wipe = { frames: 8, from: "right" };

type NapShotProps = Kept & {
  /** Quadros do plano em que o ritmo cai, em que os braços caem e em que "cobra depois" ganha o visto. */
  readonly slowAt: number;
  readonly fallAt: number;
  readonly checkAt: number;
  /** A duração do plano dos jatos, que este redesenha por baixo da varredura. */
  readonly before: number;
  readonly clock: number;
};

/** De dia, no mesmo tanque, com sol na janela: ela tenta pulsar no ritmo de dia, o ritmo cai e ela cochila. A prancheta ganha o segundo visto. */
const NapShot: React.FC<NapShotProps> = ({
  slowAt,
  fallAt,
  checkAt,
  before,
  clock,
  ...keptAwake
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();

  return (
    <Sweep
      wipe={DAYBREAK}
      under={
        // A noite do plano anterior, depois do último quadro dele.
        <Stay>
          <NightTank
            {...keptAwake}
            at={before + frame}
            length={before}
            clock={clock}
          />
        </Stay>
      }
    >
      <TankShot
        camera={cameraBetween(LAB.mediumEnd, LAB_LATER, frame / length)}
        hour="day"
        researcher={[1, ramp(frame, checkAt, 0.3 * fps)]}
        platform={TANK_CENTER}
        clock={clock}
      >
        <TankJellyfish
          y={RESTING_Y}
          droop={mix(
            mix(DROOP.awake, 0.45, ramp(frame, slowAt, 0.6 * fps)),
            1,
            ramp(frame, fallAt, 0.8 * fps),
          )}
          rhythm={keptAwake.rhythm}
          phase={keptAwake.phase}
          clock={clock}
        />
      </TankShot>
    </Sweep>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `jellyfish-platform` o desenha com `Prelude`, e o tanque já cresce enquanto a cama encolhe. `clock` é o quadro do vídeo em que a cena começa.
 */
/** Quantos quadros antes da cena o tanque começa a crescer: antes disso a cama ainda ocupa o lugar dele. */
export const BILL_LEAD = 4;

export const JellyfishDebtOpening: React.FC<{ clock: number }> = ({
  clock,
}) => (
  <BillShot
    outAt={NEVER}
    linesAt={NEVER + 100}
    stampAt={NEVER + 200}
    clock={clock}
  />
);

export const JellyfishDebtScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const jetsFrom = shots[1].from;
  const jets = [
    cue(scene, "soltaram") - jetsFrom,
    cue(scene, "tanque") - jetsFrom,
    cue(scene, "água", 2) - jetsFrom,
  ];
  // De dia ela ainda pulsa no ritmo de acordada até pouco depois de "hora"; aí o ritmo cai.
  const slowAt = cue(scene, "hora") - shots[2].from + 0.3 * fps;
  const rhythm = kept(
    scene.from + jetsFrom,
    jets,
    scene.from + shots[2].from + slowAt,
  );
  const keptAwake = { jets, rhythm, phase: settledPhase(fps, rhythm) };
  const fallAt = cue(scene, "ela") - shots[2].from;
  return (
    <>
      <Shot range={shots[0]} name="a conta sai do bolso, ao lado do tanque">
        <Preluded lead={BILL_LEAD}>
          <BillShot
            outAt={cue(scene, "cobrança")}
            linesAt={cue(scene, "regra")}
            stampAt={cue(scene, "compensa")}
            clock={scene.from}
          />
        </Preluded>
      </Shot>
      <Shot range={shots[1]} name="de noite, os jatos no tanque">
        <JetsShot {...keptAwake} clock={scene.from + jetsFrom} />
      </Shot>
      <Shot range={shots[2]} name="de dia, ela cochila">
        <NapShot
          {...keptAwake}
          slowAt={slowAt}
          fallAt={fallAt}
          checkAt={fallAt + 0.3 * fps}
          before={shots[2].from - jetsFrom}
          clock={scene.from + shots[2].from}
        />
      </Shot>
      {/* O primeiro jato. */}
    </>
  );
};
