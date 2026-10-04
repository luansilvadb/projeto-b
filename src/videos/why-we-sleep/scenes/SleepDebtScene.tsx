import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, sound } from "../palette";
import { PREY, Prey } from "../parts/Prey";
import { cue, drop, linear, ramp } from "../../../components/timing";
import { SavannaShot } from "./ElephantsScene";

const MEDIUM = framing([PREY.x + 120, PREY.y - 230], 1.35);
const CLOSE = framing([PREY.x + 60, PREY.y - 210], 1.5);
/** A conta do sono devido: uma tira de papel ao lado do bicho, que cresce para baixo. */
const BILL = { x: PREY.x + 330, y: PREY.y - 470, width: 150, lines: 6 };
const LINE_HEIGHT = 46;

type BillProps = {
  /** Quantas linhas já foram lançadas, de 0 a `BILL.lines`. */
  readonly lines: number;
};

const Bill: React.FC<BillProps> = ({ lines }) => (
  <SvgLayer>
    <rect
      x={BILL.x - BILL.width / 2}
      y={BILL.y}
      width={BILL.width}
      height={50 + LINE_HEIGHT * lines}
      rx={10}
      fill={ink.paper}
    />
    {Array.from({ length: Math.ceil(lines) }, (_, index) => (
      <rect
        key={index}
        x={BILL.x - BILL.width / 2 + 22}
        y={BILL.y + 40 + LINE_HEIGHT * index}
        width={(BILL.width - 44) * Math.min(1, lines - index)}
        height={12}
        rx={6}
        fill={ink.dark}
        opacity={0.55}
      />
    ))}
  </SvgLayer>
);

type OwingShotProps = {
  /** Quadro do plano em que a conta começa a crescer. */
  readonly oweAt: number;
};

/** De dia, sem ter dormido: o antílope cochila em pé enquanto a conta cresce. */
const OwingShot: React.FC<OwingShotProps> = ({ oweAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  // Ele pende de sono e se segura, cada vez mais fundo.
  const nod =
    (0.35 + 0.45 * linear(frame, 0, durationInFrames)) *
    (0.5 + 0.5 * wave(seconds, 2.1));

  return (
    <SavannaShot camera={MEDIUM} daylight={1} orb={0.3}>
      <Prey daylight={1} asleep={nod} tired={1} seconds={seconds} />
      <Bill
        lines={BILL.lines * linear(frame, oweAt, durationInFrames - oweAt)}
      />
      <Place x={BILL.x} y={BILL.y - 44}>
        <Pop at={oweAt}>
          <Tag size="note" on="peach">
            sono devido
          </Tag>
        </Pop>
      </Place>
    </SavannaShot>
  );
};

type PayingShotProps = {
  /** Quadro do plano em que o carimbo entra. */
  readonly paidAt: number;
};

/** O corpo cobra: ele desaba dormindo em pleno dia. */
const PayingShot: React.FC<PayingShotProps> = ({ paidAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const fallen = drop(frame, 0, 0.45 * fps);

  return (
    <SavannaShot
      camera={cameraBetween(MEDIUM, CLOSE, ramp(frame, 0, durationInFrames))}
      daylight={1}
      orb={0.34}
    >
      <Prey daylight={1} rest={fallen} asleep={1} tired={1} seconds={seconds} />
      <Place x={PREY.x - 250} y={PREY.y - 330}>
        <Onomatopoeia
          at={0.4 * fps}
          size={110}
          color={sound.hot}
          edge={sound.edge}
          tilt={-14}
        >
          PLOFT
        </Onomatopoeia>
      </Place>
      <Bill lines={BILL.lines} />
      <Place x={BILL.x} y={BILL.y + 170} style={{ rotate: "-12deg" }}>
        <Pop at={paidAt} from={1.6}>
          <Label size="note" color={ink.paper} tag={ink.tagEdge}>
            cobrado
          </Label>
        </Pop>
      </Place>
    </SavannaShot>
  );
};

export const SleepDebtScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="quem não dorme fica devendo">
      <OwingShot oweAt={cue(scene, "devendo")} />
    </Shot>
    <Shot range={shots[1]} name="o corpo cobra a conta">
      <PayingShot paidAt={cue(scene, "depois") - shots[1].from} />
    </Shot>
  </>
);
