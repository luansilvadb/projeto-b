import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { IconRow } from "../parts/IconRow";
import { BillPocket, BillToPocket, POCKET_CORNER } from "../parts/SleepBill";
import { ROW_HUE } from "./FivePartsScene";

// De perto: a conta à esquerda e o bolso, grande, à direita. No fim do plano o bolso vai para o canto.
const BILL = { x: 540, y: 180, scale: 1.45 };
const BIG_POCKET = { x: 1220, y: 640, scale: 3 };

/** A conta "cobrado" é dobrada e guardada no bolso, que vai para o canto da tela e fica lá. */
const PocketShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // Dobra e entra no bolso na primeira metade; o bolso só sai do centro no fim.
  const stowed = ramp(frame, 0.3 * fps, 1.3 * fps);
  const cornered = ramp(frame, durationInFrames - 0.8 * fps, 0.6 * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.62, 0.55]} />
      <BillToPocket
        from={[BILL.x, BILL.y]}
        scale={BILL.scale}
        progress={stowed}
        pocket={{
          x: mix(BIG_POCKET.x, POCKET_CORNER.x, cornered),
          y: mix(BIG_POCKET.y, POCKET_CORNER.y, cornered),
          scale: mix(BIG_POCKET.scale, POCKET_CORNER.scale, cornered),
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const ROW = { x: 960, y: 560, scale: 1.12 };

type MapShotProps = {
  /** Quadros do plano em que os olhos ganham o visto e em que a régua acende. */
  readonly checkAt: number;
  readonly nextAt: number;
};

/** A fila volta: os olhos no capim ganham um visto, e a régua, "1", acende e cresce. */
const MapShot: React.FC<MapShotProps> = ({ checkAt, nextAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.36, 0.5]} />
      <IconRow
        {...ROW}
        hue={ROW_HUE}
        states={{
          eyes: frame >= checkAt ? "check" : "on",
          ruler: frame >= nextAt ? "on" : "off",
        }}
        since={{ eyes: checkAt, ruler: nextAt }}
        grow={{ ruler: mix(1, 1.3, ramp(frame, nextAt, 0.5 * fps)) }}
      />
      {/* O bolso da conta, marcado no canto. Daqui em diante ele só volta nos planos que falam da conta. */}
      <Place x={POCKET_CORNER.x} y={POCKET_CORNER.y}>
        <BillPocket scale={POCKET_CORNER.scale} />
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const DebtReturnsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a conta vai para o bolso">
      <PocketShot />
    </Shot>
    <Shot range={shots[1]} name="os olhos ganham o visto; a régua acende">
      <MapShot
        checkAt={cue(scene, "perigoso") - shots[1].from}
        nextAt={cue(scene, "Falta") - shots[1].from}
      />
    </Shot>
  </>
);
