import { useCurrentFrame, useVideoConfig } from "remotion";
import { framing } from "../../../components/Camera";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, linear, mix } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, type Wipe } from "../../../video/Shot";
import { BILL_LINES, SleepBill } from "../parts/SleepBill";
import { Critter, DEN, SavannaShot, Thicket } from "./NightFallsScene";

// O dia entra varrendo a noite, do lado em que o sol nasce.
const DAYBREAK: Wipe = { frames: 14, from: "left" };
/**
 * De dia, o bicho fica no terço direito, virado para a conta, que fica no
 * esquerdo, sobre o céu: a cena `sleep-debt` começa neste mesmo enquadramento.
 */
export const OWING = framing([DEN.x, DEN.y - 100], 2.5, [1160, 700]);
/** Onde a conta fica no quadro: o meio do alto do papel. */
export const OWING_BILL = { x: 470, y: 150, scale: 1.2 };

// Em pé ele é alto: o plano fecha até ele ter metade da altura do quadro, com a árvore e a lua por cima.
const VIGIL = framing([DEN.x + 70, DEN.y - 130], 2.7, [900, 620]);

/** A noite inteira de vigia: olhos arregalados, virado para a moita, e a lua atravessa o céu. */
const VigilShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SavannaShot
      camera={VIGIL}
      daylight={0}
      orb={mix(0.28, 0.5, linear(frame, 0, durationInFrames))}
    >
      <Thicket daylight={0} seconds={seconds} />
      <Critter daylight={0} alert flipped seconds={seconds} />
    </SavannaShot>
  );
};

type OwingShotProps = {
  /** Quadro do plano em que a conta aparece e começa a crescer. */
  readonly oweAt: number;
};

/** Amanhece: de olheiras, ele cochila em pé, e a conta de "sono devido" cresce ao lado. */
const OwingShot: React.FC<OwingShotProps> = ({ oweAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  // Ele pende de sono e se segura, cada vez mais fundo: a cabeça nunca volta a ficar erguida.
  const nod =
    0.7 +
    0.2 * linear(frame, 0, durationInFrames) +
    0.1 * wave(seconds, 2.1);

  return (
    <>
      <SavannaShot camera={OWING} daylight={1} orb={0.6}>
        <Thicket daylight={1} seconds={seconds} />
        <Critter daylight={1} nod={nod} tired={1} seconds={seconds} />
      </SavannaShot>
      <Place
        x={OWING_BILL.x}
        y={OWING_BILL.y}
        style={{ translate: "-50% 0", transformOrigin: "50% 0" }}
      >
        <Pop at={oweAt}>
          <SleepBill
            scale={OWING_BILL.scale}
            lines={
              1 +
              (BILL_LINES - 1) *
                linear(frame, oweAt, durationInFrames - oweAt - 0.3 * fps)
            }
          />
        </Pop>
      </Place>
    </>
  );
};

export const SkipANightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot
      range={shots[0]}
      name="a noite inteira de vigia"
      hold={DAYBREAK.frames}
    >
      <VigilShot />
    </Shot>
    <Shot range={shots[1]} name="amanhece, e a conta cresce" wipe={DAYBREAK}>
      <OwingShot oweAt={cue(scene, "cobra") - shots[1].from} />
    </Shot>
  </>
);
