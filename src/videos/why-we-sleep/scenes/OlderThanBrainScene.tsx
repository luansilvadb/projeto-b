import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant } from "../../../art/Elephant";
import { cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { elephant, jellyfish, lab } from "../palette";
import { Clipboard } from "../parts/Clipboard";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Glove, LAB, TANK_CENTER } from "../parts/Laboratory";
import { PULSES_ASLEEP, pulseCycles, pulseShape, steady } from "../parts/pulse";
import { BillToPocket, billHeight } from "../parts/SleepBill";
import { Timeline } from "../parts/Timeline";
import { TankJellyfish, TankShot } from "../parts/TankShot";
import { VacantSign } from "../parts/VacantSign";

// O tanque de perto, deslocado para a direita: à esquerda dele cabem a prancheta e a conta.
const PROOF = framing([TANK_CENTER, 540], 1.34, [1270, 540]);
const CAMERA_SECONDS = 0.5;
const BOARD = { x: 372, y: 250, scale: 0.86 };
// A conta fica colada no canto do vidro, por cima dele.
const BILL = { x: 640, y: 690, scale: 0.92, lines: 3 };
// O bolso espera no canto de baixo, à esquerda, o único livre: no canto de sempre, em cima à direita, ele pousava
// sobre o canto do tanque e parecia colado no vidro. O selo da fonte ocupa o de baixo à direita.
const POCKET = { x: 236, y: 700, scale: 0.8 };
// Guardar a conta leva este tempo, e acaba no último quadro do plano: curto, para ela ficar presa ao vidro enquanto a fala a cita.
const STOW_SECONDS = 0.7;

/** A prova: ela cochilando no tanque, com a conta "cobrado" colada no vidro e a prancheta de dois vistos ao lado. No fim, a conta volta para o bolso. */
const ProofShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stowAt = durationInFrames - 1 - STOW_SECONDS * fps;
  const stowed = ramp(frame, stowAt, STOW_SECONDS * fps);

  return (
    <AbsoluteFill>
      <TankShot
        camera={cameraBetween(
          LAB.mediumEnd,
          PROOF,
          ramp(frame, 0, CAMERA_SECONDS * fps),
        )}
        hour="day"
        platform={TANK_CENTER}
      >
        <TankJellyfish droop={1} rhythm={steady(PULSES_ASLEEP)} />
      </TankShot>
      <Place x={BOARD.x} y={BOARD.y} style={{ rotate: "-3deg" }}>
        <Clipboard scale={BOARD.scale} checked={[1, 1]} />
      </Place>
      {/* A mão de luva da pesquisadora, que segura a prancheta pelo canto, de fora do quadro. */}
      <SvgLayer>
        <Glove from={[-90, 500]} to={[26, 384]} size={62} />
      </SvgLayer>
      {/* A conta, colada no vidro; no fim do plano ela se dobra e volta para o bolso, de onde saiu em `jellyfish-debt`. */}
      <BillToPocket
        from={[BILL.x, BILL.y - (billHeight(BILL.lines) * BILL.scale) / 2]}
        scale={BILL.scale}
        lines={BILL.lines}
        pocket={POCKET}
        progress={stowed}
      />
      {/* A fita que prende a conta ao vidro: sai quando a conta é tirada. */}
      <SvgLayer>
        <rect
          x={BILL.x - 70}
          y={BILL.y - 180}
          width={140}
          height={46}
          rx={8}
          fill={lab.platformShade}
          opacity={0.9 * (1 - ramp(frame, stowAt - 0.2 * fps, 0.2 * fps))}
          transform={`rotate(-6 ${BILL.x} ${BILL.y - 157})`}
        />
      </SvgLayer>
      <Grain />
    </AbsoluteFill>
  );
};

const GROUND = 930;
const SIGN = { x: 960, y: GROUND, scale: 1 };
const ELEPHANT = { x: 320, width: 560 };
const JELLYFISH = { x: 1530, width: 380 };
// Do centro do desenho da água-viva até onde o sino encosta no chão, em fração da largura do sino.
const RESTING = 124 / 660;

/** O pedestal "acordado 24 h", vazio; a elefanta e a água-viva dormem uma de cada lado dele. */
const VacantShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.4]} />}
    >
      <SvgLayer>
        <IdeaShadow
          hue="mint"
          x={ELEPHANT.x}
          y={GROUND + 6}
          width={ELEPHANT.width * 0.8}
        />
        <IdeaShadow
          hue="mint"
          x={JELLYFISH.x}
          y={GROUND + 6}
          width={JELLYFISH.width * 1.1}
        />
      </SvgLayer>
      <VacantSign {...SIGN} />
      {/* A elefanta olha para o pedestal: o desenho, que olha para a esquerda, é espelhado. */}
      <Place
        x={ELEPHANT.x}
        y={GROUND}
        anchor="bottom"
        style={{
          scale: `-1 ${breath(seconds, "vacant-elephant", { amplitude: 0.012, period: 4.5 })}`,
        }}
      >
        <Elephant
          width={ELEPHANT.width}
          colors={elephant}
          lid={1}
          droop={1}
          ear={0.1}
        />
      </Place>
      <Place x={JELLYFISH.x} y={GROUND - JELLYFISH.width * RESTING}>
        <Cassiopea
          width={JELLYFISH.width}
          colors={jellyfish.day}
          droop={0.9}
          pulse={pulseShape(pulseCycles(frame, fps, steady(PULSES_ASLEEP)))}
          sway={0.4 * wave(seconds, 5)}
        />
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const OlderThanBrainScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="passou nos dois testes">
      <ProofShot />
    </Shot>
    <Shot range={shots[1]} name="o sono antes do primeiro cérebro">
      <Timeline
        jellyfish
        sleepAt={cue(scene, "sono") - shots[1].from}
        brainAt={cue(scene, "antes") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="o pedestal segue vazio">
      <VacantShot />
    </Shot>
  </>
);
