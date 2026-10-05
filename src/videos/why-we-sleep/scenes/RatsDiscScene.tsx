import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { sound, tags } from "../palette";
import { BENCH_Y } from "../parts/Laboratory";
import {
  discRatSpot,
  LabPlaque,
  RatDisc,
  RatLab,
  type RatState,
} from "../parts/Rats";
import { Tag } from "../parts/Tag";

// O aparelho sobre a bancada, um pouco à direita; a placa do laboratório fica na parede, à esquerda.
const DISC_AT = { x: 1260, y: BENCH_Y + 50, scale: 1 };
const PLAQUE = { x: 420, y: 390 };
const CONTROL = discRatSpot(1, DISC_AT);
/** Os três enquadramentos do mesmo cenário: a bancada inteira, o disco de perto e o rato de comparação. */
const WIDE = framing([960, 540], 1);
const CLOSE = framing([DISC_AT.x, 640], 1.9, [960, 580]);
// O quadro vai da borda direita da placa (que, cortada, disputaria com a etiqueta) ao fim da parede, em 1920.
const MEDIUM = framing([1338, 600], 1.65, [960, 600]);
// Uma volta do disco, em segundos, e quanto ele leva os ratos para a borda antes de eles andarem.
const TURN_SECONDS = 3.2;
const CARRIED = 54;

type DiscShotProps = {
  readonly camera: CameraState;
  readonly rats: readonly [RatState, RatState];
  /** Quadro do plano em que o disco começa a girar; sem valor, fica parado. */
  readonly spinAt?: number;
  /** Quadro do plano em que os dois começam a andar. */
  readonly walkAt?: number;
  /** O que fica preso ao cenário, por cima do aparelho: a etiqueta, o ronco. */
  readonly children?: React.ReactNode;
};

/** O disco sobre a bandeja de água, com os dois ratos em cima, no laboratório de Chicago. */
const DiscShot: React.FC<DiscShotProps> = ({
  camera,
  rats,
  spinAt,
  walkAt,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const spun =
    spinAt === undefined ? 0 : Math.max(0, frame - spinAt) / fps / TURN_SECONDS;
  // O giro leva os dois para a borda; quando eles andam, voltam quase ao lugar.
  const carried =
    spinAt === undefined
      ? 0
      : CARRIED *
        (ramp(frame, spinAt, 0.8 * fps) -
          0.7 * ramp(frame, walkAt ?? spinAt, 0.8 * fps));

  return (
    <RatLab camera={camera} wall={<LabPlaque {...PLAQUE} />}>
      <RatDisc
        {...DISC_AT}
        rats={rats}
        turn={spun}
        carried={carried}
        step={walkAt === undefined ? 0 : ramp(frame, walkAt, 0.3 * fps)}
        seconds={seconds}
        // O disco e os dois ratos são o assunto dos três planos da cena: de perto, com volume.
        close
      />
      {children}
    </RatLab>
  );
};

type AwakeShotProps = {
  /** Quadros do plano em que o rato do teste pesca de sono, fecha os olhos, e em que o disco gira e os dois andam. */
  readonly drowsyAt: number;
  readonly asleepAt: number;
  readonly spinAt: number;
  readonly walkAt: number;
};

/** De perto: o rato do teste fecha os olhos, o disco gira e leva os dois para a borda, e eles andam. */
const AwakeShot: React.FC<AwakeShotProps> = ({
  drowsyAt,
  asleepAt,
  spinAt,
  walkAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const test: RatState =
    frame >= spinAt + 0.3 * fps
      ? "awake"
      : frame >= asleepAt
        ? "asleep"
        : frame >= drowsyAt
          ? "sleepy"
          : "awake";

  return (
    <DiscShot
      camera={cameraBetween(WIDE, CLOSE, ramp(frame, 0, 0.8 * fps))}
      rats={[test, "awake"]}
      spinAt={spinAt}
      walkAt={walkAt}
    />
  );
};

type ControlShotProps = {
  /** Quadros do plano em que a etiqueta entra e em que o rato de comparação cochila. */
  readonly tagAt: number;
  readonly napAt: number;
};

/** O outro rato ganha a etiqueta "comparação": no mesmo disco, ele cochila enquanto o primeiro está de olhos abertos. */
const ControlShot: React.FC<ControlShotProps> = ({ tagAt, napAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const napping = frame >= napAt;
  const tag = { x: CONTROL.x + 90, y: CONTROL.top - 130 };

  return (
    <DiscShot
      camera={cameraBetween(CLOSE, MEDIUM, ramp(frame, 0, 0.7 * fps))}
      rats={["awake", napping ? "asleep" : "sleepy"]}
    >
      {frame >= tagAt ? (
        <SvgLayer>
          <path
            d={`M${tag.x - 30},${tag.y + 30} L${CONTROL.x - 20},${CONTROL.top + 6}`}
            stroke={tags.mint.fill}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <circle
            cx={CONTROL.x - 20}
            cy={CONTROL.top + 6}
            r={9}
            fill={tags.mint.fill}
          />
        </SvgLayer>
      ) : null}
      {/* A etiqueta está no cenário: desfaz a aproximação da câmera para ficar no tamanho de etiqueta. */}
      <Place x={tag.x} y={tag.y} style={{ scale: `${1 / MEDIUM.zoom}` }}>
        <Pop at={tagAt}>
          <Tag size="note" on="mint">
            comparação
          </Tag>
        </Pop>
      </Place>
      <Place
        x={CONTROL.x + 190}
        y={CONTROL.top + 10}
        style={{ scale: `${1 / MEDIUM.zoom}` }}
      >
        <Onomatopoeia
          at={napAt}
          size={84}
          color={sound.warm}
          edge={sound.edge}
          tilt={12}
          fade={0.22}
        >
          ZZZ
        </Onomatopoeia>
      </Place>
    </DiscShot>
  );
};

export const RatsDiscScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="um disco sobre a bandeja de água, dois ratos">
      <DiscShot camera={WIDE} rats={["awake", "awake"]} />
    </Shot>
    <Shot
      range={shots[1]}
      name="ele fecha os olhos, o disco gira, os dois andam"
    >
      <AwakeShot
        drowsyAt={cue(scene, "começava") - shots[1].from}
        asleepAt={cue(scene, "adormecer") - shots[1].from}
        spinAt={cue(scene, "girava") - shots[1].from}
        walkAt={cue(scene, "andar") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="o outro rato é a comparação">
      <ControlShot
        tagAt={cue(scene, "comparação") - shots[2].from}
        napAt={cue(scene, "dormir") - shots[2].from}
      />
    </Shot>
  </>
);
