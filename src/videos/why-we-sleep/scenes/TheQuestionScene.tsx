import { Sequence } from "remotion";
import { Grain } from "../../../components/Grain";
import { SlowPush } from "../../../components/SlowPush";
import { cue } from "../../../components/timing";
import { FPS } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Vignette } from "../../../vignette/Vignette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { SearchClose } from "../parts/Search";
import script from "../script.json";

/**
 * Quanto a vinheta dura: o silêncio que o roteiro reserva para ela no fim
 * desta cena. A cena seguinte usa o valor para tirar a vinheta do palco
 * (`VignetteLeaving`).
 */
export const VIGNETTE_FRAMES = Math.round(
  ((script.scenes.find((scene) => scene.id === "the-question")?.holdMs ?? 0) /
    1000) *
    FPS,
);

type EmptyShotProps = {
  /** Quadro do plano em que a interrogação aparece sobre o lugar vazio. */
  readonly questionAt: number;
};

/** A lupa para sobre o pedestal "acordado 24 h": ele continua vazio, e a pergunta fica em cima dele. */
const EmptyShot: React.FC<EmptyShotProps> = ({ questionAt }) => (
  <SlowPush
    focus={[960, 420]}
    by={0.06}
    backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.38]} />}
  >
    <SearchClose questionAt={questionAt} />
    <Grain />
  </SlowPush>
);

export const TheQuestionScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o lugar continua vazio">
      <EmptyShot questionAt={cue(scene, "algum")} />
    </Shot>
    {/* No silêncio depois da fala, a vinheta do canal abre num círculo sobre o plano. */}
    <Sequence
      from={scene.durationInFrames - scene.holdFrames}
      durationInFrames={scene.holdFrames}
      name="vinheta"
    >
      <Vignette />
    </Sequence>
  </>
);
