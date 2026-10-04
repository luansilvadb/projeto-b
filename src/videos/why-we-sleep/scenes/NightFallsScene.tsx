import { useCurrentFrame, useVideoConfig } from "remotion";
import { Build, cameraBetween, framing } from "../../../components/Camera";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { enterProgress } from "../../../video/stage";
import {
  VIGNETTE_HANDOFF_FRAMES,
  VignetteLeaving,
} from "../../../vignette/Vignette";
import { LossBadge, Lurker, PREY, Prey, type Loss } from "../parts/Prey";
import { cue, linear, mix, ramp } from "../../../components/timing";
import { VIGNETTE_FRAMES } from "./BadIdeaScene";
import { SavannaShot } from "./ElephantsScene";

const WIDE = framing([960, 540], 1);
const WIDE_END = framing([PREY.x, PREY.y - 160], 1.12);
// A entrada no mundo: a câmera chega pelo céu, de perto, e desce até a savana.
// O céu não se mexe; o chão sobe, e o que está perto sobe mais depressa.
const FROM_SKY = { x: 0, y: -640, zoom: 1.35 };
// Como o plano começa: ao entardecer, com o astro baixo, à esquerda.
const ARRIVAL = { daylight: 0.5, orb: 0.3 };
// A lua atravessa o céu sem saltar de um plano para o outro: onde está no fim de cada um.
const ORB = { dusk: 0.5, losses: 0.72 };
/** Onde a lua está quando a cena termina: a cena seguinte, no mesmo lugar, parte daqui. */
export const NIGHT_ORB = ORB.losses;
// Em quanto tempo a câmera vai do plano aberto ao plano médio, sem corte.
const CLOSING_IN_SECONDS = 1;
// De quão longe ele vem andando até o lugar em que se deita.
const WALK_IN = 380;
const LANDING_SECONDS = 1.6;
/** O plano médio do bicho dormindo, com o capim de onde vem o perigo à direita. */
export const PREY_MEDIUM = framing([PREY.x + 150, PREY.y - 190], 1.5);
const BADGE = { y: PREY.y - 400, gap: 190, size: 150 };
const STRIKE_DELAY_SECONDS = 0.35;

/** A savana chegando ao palco depois da vinheta: o céu toma a cor dele e o chão sobe. */
const Arriving: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const arrived = enterProgress(useCurrentFrame(), VIGNETTE_HANDOFF_FRAMES);
  return (
    <Build lit={arrived} risen={arrived} tracked>
      {children}
    </Build>
  );
};

type DuskShotProps = {
  /** Quadros do plano em que ele se deita e em que fecha os olhos. */
  readonly lieAt: number;
  readonly closeAt: number;
};

/** A savana anoitece; o antílope para, se deita e fecha os olhos. */
const DuskShot: React.FC<DuskShotProps> = ({ lieAt, closeAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const daylight = ARRIVAL.daylight * (1 - ramp(frame, 0, 1.4 * fps));
  // Ele chega andando e para um instante antes de se deitar.
  const arrived = linear(frame, 0, Math.max(fps, lieAt - 0.6 * fps));

  return (
    <>
      <SavannaShot
        camera={cameraBetween(
          FROM_SKY,
          cameraBetween(WIDE, WIDE_END, frame / durationInFrames),
          ramp(frame, VIGNETTE_HANDOFF_FRAMES, LANDING_SECONDS * fps),
        )}
        daylight={daylight}
        orb={mix(ARRIVAL.orb, ORB.dusk, linear(frame, 0, durationInFrames))}
      >
        <Prey
          daylight={daylight}
          x={PREY.x + WALK_IN * (1 - arrived)}
          walking={arrived < 1 ? 1 : 0}
          rest={ramp(frame, lieAt, 1.3 * fps)}
          asleep={ramp(frame, closeAt, 0.8 * fps)}
          seconds={seconds}
        />
      </SavannaShot>
    </>
  );
};

const LOSSES: readonly Loss[] = ["food", "mate", "watch"];

type LossBadgesProps = {
  /** Quadro do plano em que cada ícone entra, na ordem da fala. */
  readonly at: readonly [number, number, number];
  /** Quanto os ícones já saíram, de 0 a 1. */
  readonly gone?: number;
};

/** O que ele não faz enquanto dorme: três ícones acendem e são riscados. */
export const LossBadges: React.FC<LossBadgesProps> = ({ at, gone = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {LOSSES.map((loss, index) => (
        <Place
          key={loss}
          x={PREY.x + (index - 1) * BADGE.gap}
          y={BADGE.y}
          style={{ scale: `${1 - gone}` }}
        >
          <Pop at={at[index]}>
            <LossBadge
              loss={loss}
              size={BADGE.size}
              struck={ramp(
                frame,
                at[index] + STRIKE_DELAY_SECONDS * fps,
                0.2 * fps,
              )}
            />
          </Pop>
        </Place>
      ))}
    </>
  );
};

type LossesShotProps = LossBadgesProps & {
  /** Quadro do plano em que o capim se mexe. */
  readonly stirAt: number;
};

/** A câmera chega perto do bicho dormindo, os três ícones acendem, e algo se mexe no capim. */
const LossesShot: React.FC<LossesShotProps> = ({ at, stirAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SavannaShot
      // O plano continua o anterior: a câmera parte de onde ele parou.
      camera={cameraBetween(
        WIDE_END,
        PREY_MEDIUM,
        ramp(frame, 0, CLOSING_IN_SECONDS * fps),
      )}
      daylight={0}
      orb={mix(ORB.dusk, ORB.losses, linear(frame, 0, durationInFrames))}
    >
      <div style={{ opacity: ramp(frame, stirAt, 0.6 * fps) }}>
        <Lurker lit={0} seconds={seconds} />
      </div>
      <Prey daylight={0} rest={1} asleep={1} seconds={seconds} />
      <LossBadges at={at} />
    </SavannaShot>
  );
};

export const NightFallsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a noite cai e ele se deita">
      {/* A vinheta acabou no quadro anterior e divide o palco com este plano:
          o planeta sai, o céu dela fica de fundo e a savana toma o lugar. */}
      <VignetteLeaving frames={VIGNETTE_FRAMES} />
      <Arriving>
        <DuskShot lieAt={cue(scene, "deita")} closeAt={cue(scene, "olhos")} />
      </Arriving>
    </Shot>
    <Shot range={shots[1]} name="o que ele não faz dormindo">
      <LossesShot
        at={[
          cue(scene, "comida") - shots[1].from,
          cue(scene, "reproduz") - shots[1].from,
          cue(scene, "percebe") - shots[1].from,
        ]}
        stirAt={cue(scene, "aproxima") - shots[1].from}
      />
    </Shot>
  </>
);
