import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BrainHalves } from "../../../art/BrainHalves";
import { Dolphin } from "../../../art/Dolphin";
import { Elephant } from "../../../art/Elephant";
import { Frigatebird } from "../../../art/Frigatebird";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import {
  Pop,
  POP_SECONDS,
  popOpacity,
  popScale,
} from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  brainHalves,
  dolphin,
  elephant,
  frigatebird,
  idea,
  ink,
} from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { BAR_STEP, rulerX, SleptBars } from "../parts/SleepRuler";
import { cue } from "../../../components/timing";
import { VacantSign } from "../parts/VacantSign";

const BARS_TOP = 200;
// A câmera dos dois planos da cena: o segundo continua de onde o primeiro parou.
const FOCUS = [960, 540] as const;
const PUSH = 0.04;
// Os três que tentaram escapar, em pessoa, debaixo das barras: cada um com o seu jeito.
const ANIMALS = { y: 980, elephant: 400, bird: 900, dolphin: 1570 };
/** O golfinho não tem barra: tem meio cérebro, que fica em cima dele. */
const HALF = { x: 1570, y: 690, width: 160 };

type TogetherShotProps = {
  /** Quadro do plano em que o meio cérebro do golfinho entra. */
  readonly halfAt: number;
};

/** Os três jeitos lado a lado, debaixo das nossas oito horas: dormir menos, ou dormir pela metade. */
const TogetherShot: React.FC<TogetherShotProps> = ({ halfAt }) => (
  <SlowPush
    focus={[FOCUS[0], FOCUS[1]]}
    by={PUSH}
    backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />}
  >
    <SleptBars
      on="lilac"
      top={BARS_TOP}
      tone={idea.lilac.contact}
      ours={{}}
      elephant={{}}
      frigatebird={{}}
    />
    <SvgLayer>
      <IdeaShadow
        hue="lilac"
        x={ANIMALS.elephant}
        y={ANIMALS.y + 6}
        width={340}
      />
    </SvgLayer>
    <Place x={ANIMALS.elephant} y={ANIMALS.y} anchor="bottom">
      <Elephant width={430} colors={elephant} />
    </Place>
    <Place x={ANIMALS.bird} y={ANIMALS.y - 190}>
      <Frigatebird width={400} colors={frigatebird} />
    </Place>
    <Place x={ANIMALS.dolphin} y={ANIMALS.y - 90}>
      <Dolphin width={420} colors={dolphin} />
    </Place>
    <Place x={HALF.x} y={HALF.y}>
      <Pop at={halfAt}>
        <BrainHalves
          width={HALF.width}
          colors={brainHalves}
          left={0}
          right={1}
        />
      </Pop>
    </Place>
    <Place x={ANIMALS.dolphin} y={ANIMALS.y + 40}>
      <Pop at={halfAt}>
        <Tag size="note" on="lilac">
          pela metade
        </Tag>
      </Pop>
    </Place>
    <Grain />
  </SlowPush>
);

// O zero da régua, onde nenhuma barra parou: o número, debaixo da primeira marca.
const ZERO = { x: rulerX(0), y: BARS_TOP + 2 * BAR_STEP + 140, radius: 62 };
// O pedestal fica à direita e embaixo, fora do caminho da régua.
const SIGN = { x: 1320, y: 985, scale: 0.8 };

type ZeroShotProps = {
  /** Quadro do plano em que o zero ganha o contorno vazio. */
  readonly emptyAt: number;
};

/**
 * As mesmas três barras, no mesmo enquadramento: nenhuma parou no zero, que
 * ganha um contorno vazio; e a placa de quem vive acordado, ainda sem dono.
 */
export const ZeroShot: React.FC<ZeroShotProps> = ({ emptyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush
      focus={[FOCUS[0], FOCUS[1]]}
      from={1 + PUSH}
      by={PUSH}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.5, 0.5]} />}
    >
      <SleptBars
        on="lilac"
        top={BARS_TOP}
        tone={idea.lilac.contact}
        ours={{}}
        elephant={{}}
        frigatebird={{}}
      />
      <SvgLayer>
        <circle
          cx={ZERO.x}
          cy={ZERO.y}
          r={ZERO.radius * popScale(frame, emptyAt, POP_SECONDS * fps)}
          fill="none"
          stroke={ink.tag}
          strokeWidth={10}
          strokeDasharray="22 18"
          strokeLinecap="round"
          opacity={popOpacity(frame, emptyAt, POP_SECONDS * fps)}
        />
      </SvgLayer>
      <VacantSign {...SIGN} light={0.5} />
      <Grain />
    </SlowPush>
  );
};

export const NoneZeroedScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dormir menos, ou pela metade">
      <TogetherShot halfAt={cue(scene, "ou")} />
    </Shot>
    <Shot range={shots[1]} name="ninguém zerou">
      <ZeroShot emptyAt={cue(scene, "zerar") - shots[1].from} />
    </Shot>
  </>
);
