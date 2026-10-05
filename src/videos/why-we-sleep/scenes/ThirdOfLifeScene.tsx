import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Person } from "../../../art/Person";
import { taperPath } from "../../../art/shapes";
import { Camera, cameraBetween, framing } from "../../../components/Camera";
import { Drifters } from "../../../components/Drifters";
import { Grain } from "../../../components/Grain";
import { blink, breath, phaseOf, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, person, savanna } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LifeBar, STANDING } from "../parts/LifeBar";
import { LossBadge, PREY, Prey, type Loss } from "../parts/Prey";
import { Savanna } from "../parts/Savanna";

type BarShotProps = {
  /** Quadro do plano em que o terço escurece e ganha nome. */
  readonly thirdAt: number;
};

// A etiqueta espera o terço escurecer um pouco, e a pessoa só reage depois de ver a etiqueta.
const TAG_DELAY_SECONDS = 0.3;
const REACTION_DELAY_FRAMES = 3;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A pessoa em pé, e a vida dela numa barra que passa atrás, na altura do peito; um terço escurece. */
const BarShot: React.FC<BarShotProps> = ({ thirdAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const tagAt = thirdAt + TAG_DELAY_SECONDS * fps;
  // O susto, em três tempos: ela encolhe e fecha os olhos, dá um pulinho já de
  // olhos arregalados, e assenta. A expressão troca com a pálpebra fechada.
  const startleAt = tagAt + REACTION_DELAY_FRAMES;
  const beats = [
    startleAt - 4,
    startleAt,
    startleAt + 3,
    startleAt + 7,
    startleAt + 12,
  ];

  return (
    <SlowPush
      focus={[960, 560]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <LifeBar
        drawn={ramp(frame, 0, 0.7 * fps)}
        asleep={ramp(frame, thirdAt, 0.7 * fps)}
        thirdAt={tagAt}
      />
      <SvgLayer>
        <IdeaShadow hue="peach" x={STANDING.x} y={STANDING.y + 6} width={380} />
      </SvgLayer>
      <Place
        x={STANDING.x}
        y={STANDING.y}
        anchor="bottom"
        style={{
          scale: `1 ${breath(seconds, "you") * interpolate(frame, beats, [1, 0.95, 1.05, 0.985, 1], clamp)}`,
          // O `translate` do Place é o que apoia os pés no ponto: o pulo vai junto dele.
          translate: `-50% calc(-100% + ${interpolate(frame, beats, [0, 0, -26, 4, 0], clamp)}px)`,
        }}
      >
        {/* Ela já está de pé quando o vídeo abre: quem entra é a barra, atrás dela. */}
        <Person
          height={STANDING.height}
          colors={person}
          expression={frame >= startleAt ? "surprised" : "curious"}
          blink={Math.max(
            blink(seconds, "you"),
            interpolate(
              frame,
              [startleAt - 3, startleAt, startleAt + 2],
              [0, 1, 0],
              clamp,
            ),
          )}
        />
      </Place>
      <Grain />
    </SlowPush>
  );
};

// O bicho dorme no meio do quadro, com a árvore atrás dele e os ícones por cima.
const NIGHT = framing([PREY.x + 60, PREY.y - 250], 1.5);
// A aproximação lenta do plano: 4% mais perto no fim, sem mudar o ponto enquadrado.
const NIGHT_CLOSER = framing([PREY.x + 60, PREY.y - 250], 1.5 * 1.04);
const TREE = { x: PREY.x + 330, height: 450, canopy: 760 };
const BADGE = { y: PREY.y - 330, gap: 200, size: 160 };
const LOSSES: readonly Loss[] = ["food", "mate", "watch"];
const STRIKE_DELAY_SECONDS = 0.35;
// A pausa viva do plano: a copa balança no vento, em volta do alto do tronco,
// e cada ícone flutua no próprio tempo, em pixels e em graus.
const SWAY = { degrees: 2.2, seconds: 4.1, gust: 0.6 };
const FLOAT = { pixels: 14, degrees: 3, seconds: 2.7 };

type LossesShotProps = {
  /** Quadro do plano em que cada ícone acende, na ordem da fala: comer, reproduzir, perceber. */
  readonly at: readonly [number, number, number];
};

/** De noite, o antílope dorme enroscado sob uma árvore; o que ele deixa de fazer acende e é riscado. */
const LossesShot: React.FC<LossesShotProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = frame / fps;
  const ground = PREY.y - 20;
  const sway = `rotate(${SWAY.degrees * wave(seconds, SWAY.seconds) + SWAY.gust * wave(seconds, 1.9, 0.3)} ${TREE.x} ${ground - TREE.height * 0.5})`;
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
      <Camera {...cameraBetween(NIGHT, NIGHT_CLOSER, frame / length)}>
        <Savanna daylight={0} orb={0.3}>
          {/* A acácia sob a qual ele dorme: o tronco e a copa chata, na cor das árvores da noite. */}
          <SvgLayer>
            {/*
              O luar: a copa tem quase a cor do céu e sumia. Atrás dela vai a
              mesma silhueta um tom acima, maior, e outra na cor da lua,
              deslocada para o lado de onde a luz vem, que sobra como borda.
            */}
            <g transform={sway}>
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
            </g>
            <path
              d={trunk}
              fill={ink.moon}
              opacity={0.5}
              transform="translate(-8 0)"
            />
            <g fill={savanna.night.trees}>
              <path d={trunk} />
              <g transform={sway}>
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
            </g>
          </SvgLayer>
          <Prey daylight={0} rest={1} asleep={1} seconds={seconds} />
          {LOSSES.map((loss, index) => (
            <Place
              key={loss}
              x={PREY.x + (index - 1) * BADGE.gap}
              y={BADGE.y}
              style={{
                translate: `-50% calc(-50% + ${FLOAT.pixels * wave(seconds, FLOAT.seconds, phaseOf(loss))}px)`,
                rotate: `${FLOAT.degrees * wave(seconds, FLOAT.seconds * 1.3, phaseOf(`${loss}-tilt`))}deg`,
              }}
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
        </Savanna>
      </Camera>
      {/* A poeira da noite, à luz da lua: deriva devagar na frente de tudo. */}
      <Drifters
        seed="night-dust"
        count={34}
        color={ink.moon}
        opacity={0.34}
        size={[2, 5]}
        speed={3}
      />
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
