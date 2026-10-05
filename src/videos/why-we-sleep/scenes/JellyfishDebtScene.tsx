import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import { sound } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { BENCH_Y, LAB, TANK_CENTER, Tank } from "../parts/Laboratory";
import { PULSES_ASLEEP, PULSES_AWAKE, steady } from "../parts/pulse";
import { BillToPocket } from "../parts/SleepBill";
import { Jets, RESTING_Y, TankJellyfish, TankShot } from "../parts/TankShot";

// A conta se abre à esquerda; o tanque fica à direita dela, menor que no laboratório, sob o bolso do canto.
const BILL = { x: 440, y: 200, scale: 1.36 };
const SMALL_TANK = { scale: 0.86, x: 60, y: 96 };
const OUT_SECONDS = 1.5;

/** A conta carimbada sai do bolso marcado no canto e se abre ao lado do tanque. */
const BillShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = ramp(frame, 0.4 * fps, OUT_SECONDS * fps);
  const floor = BENCH_Y + SMALL_TANK.y;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.62, 0.55]} />
      <SvgLayer>
        <IdeaShadow
          hue="peach"
          x={TANK_CENTER + SMALL_TANK.x}
          y={floor + 8}
          width={860}
        />
      </SvgLayer>
      <AbsoluteFill
        style={{
          transformOrigin: `${TANK_CENTER}px ${BENCH_Y}px`,
          translate: `${SMALL_TANK.x}px ${SMALL_TANK.y}px`,
          scale: `${SMALL_TANK.scale}`,
        }}
      >
        <Tank platform={TANK_CENTER}>
          <TankJellyfish droop={0.15} rhythm={steady(PULSES_AWAKE)} />
        </Tank>
      </AbsoluteFill>
      {/* O caminho de `debt-returns`, ao contrário: o maço sai do bolso, viaja e se desdobra. */}
      <BillToPocket
        from={[BILL.x, BILL.y]}
        scale={BILL.scale}
        progress={1 - out}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const JET_SECONDS = 0.3;
const ROUSE_SECONDS = 0.5;
// Quanto a água a sacode.
const SHAKE = { degrees: 2.4, seconds: 0.18 };
const HISS = { x: 420, y: 330 };

type JetsShotProps = {
  /** Quadro do plano em que os jatos entram. */
  readonly jetsAt: number;
};

/** O laboratório de noite, em índigo, e o tanque aceso: os jatos de água a cutucam e ela não descansa. */
const JetsShot: React.FC<JetsShotProps> = ({ jetsAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const reach = settle(frame, jetsAt, JET_SECONDS * fps);
  const roused = ramp(frame, jetsAt + JET_SECONDS * fps, ROUSE_SECONDS * fps);

  return (
    <AbsoluteFill>
      <TankShot
        camera={cameraBetween(
          LAB.medium,
          LAB.mediumEnd,
          frame / durationInFrames,
        )}
        hour="night"
        lightsOff={[TANK_CENTER / 1920, 0.5]}
        platform={TANK_CENTER}
      >
        <TankJellyfish
          x={TANK_CENTER + (reach >= 1 ? 5 * wave(seconds, SHAKE.seconds) : 0)}
          tilt={reach >= 1 ? SHAKE.degrees * wave(seconds, SHAKE.seconds) : 0}
          droop={mix(0.8, 0.1, roused)}
          rhythm={steady(PULSES_AWAKE)}
        />
        <Jets reach={reach} />
      </TankShot>
      <Place x={HISS.x} y={HISS.y}>
        <Onomatopoeia
          at={jetsAt}
          size={120}
          color={sound.cool}
          edge={sound.edge}
          tilt={-8}
        >
          PSSST
        </Onomatopoeia>
      </Place>
    </AbsoluteFill>
  );
};

type NapShotProps = {
  /** Quadro do plano em que "cobra depois" ganha o visto. */
  readonly checkAt: number;
};

/** De dia, no mesmo tanque, com sol na janela: ela pulsa bem devagar e cochila. A prancheta ganha o segundo visto. */
const NapShot: React.FC<NapShotProps> = ({ checkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <TankShot
      camera={LAB.mediumEnd}
      hour="day"
      researcher={[1, ramp(frame, checkAt, 0.3 * fps)]}
      platform={TANK_CENTER}
    >
      <TankJellyfish y={RESTING_Y} droop={1} rhythm={steady(PULSES_ASLEEP)} />
    </TankShot>
  );
};

// O dia varre a noite do laboratório, do lado da janela.
const DAYBREAK: Wipe = { frames: 12, from: "right" };

export const JellyfishDebtScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a conta sai do bolso, ao lado do tanque">
      <BillShot />
    </Shot>
    <Shot
      range={shots[1]}
      name="de noite, os jatos no tanque"
      hold={DAYBREAK.frames}
    >
      <JetsShot jetsAt={cue(scene, "soltaram") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="de dia, ela cochila" wipe={DAYBREAK}>
      <NapShot checkAt={cue(scene, "cochilava") - shots[2].from} />
    </Shot>
  </>
);
