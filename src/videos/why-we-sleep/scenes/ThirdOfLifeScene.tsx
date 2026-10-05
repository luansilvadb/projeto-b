import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { taperPath } from "../../../art/shapes";
import { Camera, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, person, savanna } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LifeBar, STANDING } from "../parts/LifeBar";
import { LossBadge, PREY, Prey, type Loss } from "../parts/Prey";
import { Savanna } from "../parts/Savanna";

type BarShotProps = {
  /** Quadro do plano em que o terço escurece e ganha nome. */
  readonly thirdAt: number;
};

/** A pessoa em pé, e a vida dela numa barra que passa atrás, na altura do peito; um terço escurece. */
const BarShot: React.FC<BarShotProps> = ({ thirdAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <LifeBar
        drawn={ramp(frame, 0, 0.7 * fps)}
        asleep={ramp(frame, thirdAt, 0.7 * fps)}
        thirdAt={thirdAt + 0.4 * fps}
      />
      <SvgLayer>
        <IdeaShadow hue="peach" x={STANDING.x} y={STANDING.y + 6} width={380} />
      </SvgLayer>
      <Place
        x={STANDING.x}
        y={STANDING.y}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Pop at={0} from={0.8} origin="bottom">
          <Person
            height={STANDING.height}
            colors={person}
            expression={frame >= thirdAt ? "surprised" : "curious"}
            blink={blink(seconds, "you")}
          />
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

// O bicho dorme no meio do quadro, com a árvore atrás dele e os ícones por cima.
const NIGHT = framing([PREY.x + 60, PREY.y - 250], 1.5);
const TREE = { x: PREY.x + 330, height: 450, canopy: 760 };
const BADGE = { y: PREY.y - 330, gap: 200, size: 160 };
const LOSSES: readonly Loss[] = ["food", "mate", "watch"];
const STRIKE_DELAY_SECONDS = 0.35;

type LossesShotProps = {
  /** Quadro do plano em que cada ícone acende, na ordem da fala: comer, reproduzir, perceber. */
  readonly at: readonly [number, number, number];
};

/** De noite, o antílope dorme enroscado sob uma árvore; o que ele deixa de fazer acende e é riscado. */
const LossesShot: React.FC<LossesShotProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const ground = PREY.y - 20;
  const canopy = `M${TREE.x - TREE.canopy / 2},${ground - TREE.height + 60} C${TREE.x - TREE.canopy * 0.3},${ground - TREE.height - 60} ${TREE.x + TREE.canopy * 0.35},${ground - TREE.height - 80} ${TREE.x + TREE.canopy / 2 + 30},${ground - TREE.height + 50} C${TREE.x + TREE.canopy * 0.2},${ground - TREE.height + 100} ${TREE.x - TREE.canopy * 0.2},${ground - TREE.height + 100} ${TREE.x - TREE.canopy / 2},${ground - TREE.height + 60} Z`;
  const trunk = taperPath(
    [TREE.x, ground],
    [TREE.x - 30, ground - TREE.height * 0.6],
    [TREE.x + 20, ground - TREE.height + 40],
    64,
    30,
  );
  const canopyAt = [TREE.x + 15, ground - TREE.height + 96];

  return (
    <AbsoluteFill>
      <Camera {...NIGHT}>
        <Savanna daylight={0} orb={0.3}>
          {/* A acácia sob a qual ele dorme: o tronco e a copa chata, na cor das árvores da noite. */}
          <SvgLayer>
            {/*
              O luar: a copa tem quase a cor do céu e sumia. Atrás dela vai a
              mesma silhueta um tom acima, maior, e outra na cor da lua,
              deslocada para o lado de onde a luz vem, que sobra como borda.
            */}
            <path
              d={canopy}
              fill={savanna.night.far}
              transform={`translate(${canopyAt[0]} ${canopyAt[1]}) scale(1.08 1.3) translate(${-canopyAt[0]} ${-canopyAt[1]})`}
            />
            <path
              d={canopy}
              fill={ink.moon}
              opacity={0.8}
              transform="translate(-9 -10)"
            />
            <path
              d={trunk}
              fill={ink.moon}
              opacity={0.5}
              transform="translate(-8 0)"
            />
            <g fill={savanna.night.trees}>
              <path d={trunk} />
              <path
                d={taperPath(
                  [TREE.x - 12, ground - TREE.height * 0.55],
                  [TREE.x - 120, ground - TREE.height * 0.8],
                  [TREE.x - 220, ground - TREE.height + 30],
                  30,
                  14,
                )}
              />
              <path d={canopy} />
            </g>
          </SvgLayer>
          <Prey daylight={0} rest={1} asleep={1} seconds={seconds} />
          {LOSSES.map((loss, index) => (
            <Place key={loss} x={PREY.x + (index - 1) * BADGE.gap} y={BADGE.y}>
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
        </Savanna>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

export const ThirdOfLifeScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="um terço da vida">
      <BarShot thirdAt={cue(scene, "terço")} />
    </Shot>
    <Shot range={shots[1]} name="o que o bicho deixa de fazer dormindo">
      <LossesShot
        at={[
          cue(scene, "comer") - shots[1].from,
          cue(scene, "reproduzir") - shots[1].from,
          cue(scene, "perceber") - shots[1].from,
        ]}
      />
    </Shot>
  </>
);
