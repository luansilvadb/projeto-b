import { useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { framing } from "../../../components/Camera";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { cue, drop, mix } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink } from "../palette";
import { AnswerIcon } from "../parts/AnswerIcon";
import { JELLYFISH_SPOT } from "../parts/Lagoon";
import { LagoonShot } from "../parts/LagoonShot";
import { PULSES_ASLEEP, steady } from "../parts/pulse";
import { FRONT, FRONT_OPENING, ShopFront } from "../parts/ShopFront";

/** A loja por fora, de porta baixada e luz acesa lá dentro, ainda com a interrogação. */
const StillAskingShot: React.FC = () => (
  <ShopFront time="night" shutter={1} busy>
    <Place x={FRONT.x} y={FRONT_OPENING.y + FRONT_OPENING.height / 2 - 10}>
      <Label size="display" color={ink.moon}>
        ?
      </Label>
    </Place>
  </ShopFront>
);

// A água-viva fica embaixo, à esquerda; o lugar do cérebro que ela não tem, ao lado dela.
const BELOW = framing([JELLYFISH_SPOT.x, JELLYFISH_SPOT.y], 1.55, [700, 860]);
const BRAIN = { x: 700, y: 270, width: 560 };
const MISSING = { x: 1330, y: 640, width: 420 };
const MEDALLION = 190;

type FitsShotProps = {
  /** Quadros do plano em que o medalhão pousa no cérebro e em que o contorno vazio aparece. */
  readonly landAt: number;
  readonly missingAt: number;
};

/** A resposta da memória cabe num cérebro; embaixo, a água-viva dorme sem ter um. */
const FitsShot: React.FC<FitsShotProps> = ({ landAt, missingAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const landed = drop(frame, landAt, 0.4 * fps);

  return (
    <>
      <LagoonShot
        time="night"
        camera={BELOW}
        rhythm={steady(PULSES_ASLEEP)}
        droop={0.8}
      />
      {/* Por cima da lagoa, fora da câmera: o cérebro com o medalhão, e o contorno do que falta nela. */}
      <Place x={BRAIN.x} y={BRAIN.y}>
        <Brain width={BRAIN.width} color={ink.glow} folds />
      </Place>
      <Place
        x={BRAIN.x - 10}
        y={mix(BRAIN.y - 280, BRAIN.y - 26, landed)}
        style={{ opacity: Math.min(1, landed * 4) }}
      >
        <AnswerIcon answer="stock" size={MEDALLION} />
      </Place>
      <Place x={MISSING.x} y={MISSING.y}>
        <Pop at={missingAt}>
          <Brain width={MISSING.width} color={ink.paper} dashed folds />
        </Pop>
      </Place>
    </>
  );
};

export const StillUnknownScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a loja ainda com a interrogação">
      <StillAskingShot />
    </Shot>
    <Shot range={shots[1]} name="a resposta cabe num cérebro; ela não tem um">
      <FitsShot
        landAt={cue(scene, "memória") - shots[1].from}
        missingAt={cue(scene, "sem") - shots[1].from}
      />
    </Shot>
  </>
);
