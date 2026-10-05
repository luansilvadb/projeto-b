import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { blink } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, drop, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { person, sound } from "../palette";
import { CoffeeTable } from "../parts/CoffeeTable";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { SleepBill } from "../parts/SleepBill";
import { Critter, SavannaShot, Thicket } from "./NightFallsScene";
import { OWING, OWING_BILL } from "./SkipANightScene";

const PLOFT = { x: 930, y: 350 };

type PayingShotProps = {
  /** Quadro do plano em que o carimbo bate. */
  readonly stampAt: number;
};

/** O corpo cobra: ele desaba dormindo em pleno dia, e a conta ganha o carimbo. */
const PayingShot: React.FC<PayingShotProps> = ({ stampAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const fallAt = 0.3 * fps;

  return (
    <>
      <SavannaShot camera={OWING} daylight={1} orb={0.62}>
        <Thicket daylight={1} seconds={seconds} />
        <Critter
          daylight={1}
          rest={drop(frame, fallAt, 0.35 * fps)}
          asleep={1}
          tired={1}
          seconds={seconds}
        />
      </SavannaShot>
      <Place x={PLOFT.x} y={PLOFT.y}>
        <Onomatopoeia
          at={fallAt + 0.3 * fps}
          size={110}
          color={sound.hot}
          edge={sound.edge}
          tilt={-14}
        >
          PLOFT
        </Onomatopoeia>
      </Place>
      <Place x={OWING_BILL.x} y={OWING_BILL.y} style={{ translate: "-50% 0" }}>
        <SleepBill
          scale={OWING_BILL.scale}
          stamp={settle(frame, stampAt, 0.3 * fps)}
        />
      </Place>
    </>
  );
};

const TABLE = { x: 800, y: 1010, height: 700 };
const TABLE_BILL = { x: 1500, y: 190, scale: 1.15 };

type MorningShotProps = {
  /** Quadros do plano em que a conta aparece e em que a cabeça cai. */
  readonly billAt: number;
  readonly dropAt: number;
};

/** A manhã depois da noite em claro: a pessoa, de olheiras, deixa a cabeça cair ao lado da xícara. */
const MorningShot: React.FC<MorningShotProps> = ({ billAt, dropAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.42, 0.5]} />
      <Place x={TABLE.x} y={TABLE.y}>
        <CoffeeTable
          colors={person}
          hue="peach"
          height={TABLE.height}
          slump={ramp(frame, dropAt, 0.7 * fps)}
          seconds={seconds}
          blink={blink(seconds, "you")}
        />
      </Place>
      <Place
        x={TABLE_BILL.x}
        y={TABLE_BILL.y}
        style={{ translate: "-50% 0", transformOrigin: "50% 0" }}
      >
        <Pop at={billAt}>
          <SleepBill scale={TABLE_BILL.scale} stamp={1} />
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const SleepDebtScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="ele desaba, e a conta é cobrada">
      <PayingShot stampAt={cue(scene, "depois")} />
    </Shot>
    <Shot range={shots[1]} name="a pessoa na mesa do café">
      <MorningShot
        billAt={cue(scene, "cobrança") - shots[1].from}
        dropAt={cue(scene, "pesa") - shots[1].from}
      />
    </Shot>
  </>
);
