import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Person } from "../../../art/Person";
import {
  Build,
  Camera,
  cameraBetween,
  framing,
  Layer,
} from "../../../components/Camera";
import {
  FlatStage,
  StageContext,
  Troupe,
  useStage,
} from "../../../components/Cast";
import { Drifters } from "../../../components/Drifters";
import { Grain } from "../../../components/Grain";
import { blink, breath, phaseOf, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, person } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LifeBar, STANDING } from "../parts/LifeBar";
import { LossBadge, PREY, Prey, type Loss } from "../parts/Prey";
import { RichSavannaBackdrop } from "../parts/savanna/RichSavannaReference";

type BarShotProps = {
  /** Quadro do plano em que o terço escurece e ganha nome. */
  readonly thirdAt: number;
};

// A etiqueta espera o terço escurecer um pouco, e a pessoa só reage depois de ver a etiqueta.
const TAG_DELAY_SECONDS = 0.3;
const REACTION_DELAY_FRAMES = 3;
// A barra sai estes quadros depois da marcação: ainda encolhe quando a lua e as nuvens da savana
// apontam embaixo, e o pêssego não fica vazio entre uma coisa e outra.
const BAR_LEAVES_LATE = 3;

/** Atrasa a saída do palco de quem está dentro, em quadros. */
export const LeavingLater: React.FC<{
  by: number;
  children: React.ReactNode;
}> = ({ by, children }) => {
  const stage = useStage();
  const later = useMemo(
    () => ({ ...stage, leave: (delay = 0) => stage.leave(delay + by) }),
    [stage, by],
  );
  return (
    <StageContext.Provider value={later}>{children}</StageContext.Provider>
  );
};

// A aproximação lenta do plano, como a de `SlowPush`: 4% do começo ao fim, em volta do meio do quadro.
const PUSH = { focus: [960, 560], by: 0.04 } as const;
// A câmera do plano (decisão do usuário): aproxima no espanto. A escala
// aprovada não muda: o plano abre este tanto mais aberto, em volta do rosto
// dela, e a câmera chega ao quadro composto, com peso, quando ela se assusta.
const STARTLE_PUSH = { wider: 0.08, face: [960, 400], seconds: 0.6 } as const;

/** A pessoa em pé, e a vida dela numa barra que passa atrás, na altura do peito; um terço escurece. */
const BarShot: React.FC<BarShotProps> = ({ thirdAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
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
  const drift = cameraBetween(
    framing(PUSH.focus, 1, PUSH.focus),
    framing(PUSH.focus, 1 + PUSH.by, PUSH.focus),
    frame / length,
  );
  // A câmera parte junto com o encolher dela e chega depois do pulo.
  const wide =
    1 -
    STARTLE_PUSH.wider *
      (1 - ramp(frame, startleAt - 4, STARTLE_PUSH.seconds * fps));
  const camera = {
    x: wide * drift.x + (wide - 1) * (STARTLE_PUSH.face[0] - 960),
    y: wide * drift.y + (wide - 1) * (STARTLE_PUSH.face[1] - 540),
    zoom: wide * drift.zoom,
  };

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}>
        <Build>
          <Camera {...camera}>
            <Layer depth={1}>
              <Troupe>
                <LeavingLater by={BAR_LEAVES_LATE}>
                  <LifeBar
                    drawn={ramp(frame, 0, 0.7 * fps)}
                    // O terço escurece em 0,7 s, e a borda dele desacelera ao chegar. Com a curva de
                    // peso, quase todo o caminho era andado nos quadros do meio, e parecia escurecer de uma vez.
                    asleep={interpolate(
                      frame,
                      [thirdAt, thirdAt + 0.7 * fps],
                      [0, 1],
                      {
                        ...clamp,
                        easing: Easing.out(Easing.quad),
                      },
                    )}
                    thirdAt={tagAt}
                  />
                </LeavingLater>
                <SvgLayer>
                  <IdeaShadow
                    hue="peach"
                    x={STANDING.x}
                    y={STANDING.y + 6}
                    width={380}
                  />
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
              </Troupe>
            </Layer>
          </Camera>
        </Build>
      </FlatStage>
    </AbsoluteFill>
  );
};

// O bicho dorme no meio do quadro, com a árvore atrás dele e os ícones por cima.
const NIGHT = framing([PREY.x + 60, PREY.y - 250], 1.5);
// A câmera da troca: a savana sobe em camadas de baixo do quadro, e a câmera só fecha um pouco
// sobre o mesmo ponto enquanto ela assenta. Sem deslocamento: um que descesse faria o chão subir,
// passar do lugar e voltar.
const NIGHT_ARRIVAL = framing([PREY.x + 60, PREY.y - 250], 1.5 * 0.94);
const ARRIVAL_SECONDS = 1;
// A aproximação lenta do plano: 4% mais perto no fim, sem mudar o ponto enquadrado.
const NIGHT_CLOSER = framing([PREY.x + 60, PREY.y - 250], 1.5 * 1.04);
// O bicho sobe de pé com o chão. Só com o chão no lugar (0,4 s) ele dobra as pernas e deita, e a
// cabeça pende e o olho fecha no fim da descida: o "dorme enroscado" do roteiro acontece à vista,
// e não escondido atrás da subida do cenário.
const SETTLE = { restAt: 0.4, rest: 0.7, sleepAt: 0.8, sleep: 0.7 };
const BADGE = { y: PREY.y - 330, gap: 200, size: 160 };
const LOSSES: readonly Loss[] = ["food", "mate", "watch"];
const STRIKE_DELAY_SECONDS = 0.35;
// A pausa viva do plano: a copa balança no vento, em volta do alto do tronco,
// e cada ícone flutua no próprio tempo, em pixels e em graus.
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
  return (
    <AbsoluteFill>
      <Camera
        {...cameraBetween(
          cameraBetween(
            NIGHT_ARRIVAL,
            NIGHT,
            ramp(frame, 0, ARRIVAL_SECONDS * fps),
          ),
          NIGHT_CLOSER,
          frame / length,
        )}
      >
        <RichSavannaBackdrop daylight={0} orb={0.303}>
          <Prey
            daylight={0}
            rest={ramp(frame, SETTLE.restAt * fps, SETTLE.rest * fps)}
            asleep={ramp(frame, SETTLE.sleepAt * fps, SETTLE.sleep * fps)}
            seconds={seconds}
          />
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
        </RichSavannaBackdrop>
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

export const ThirdOfLifeScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const lossesAt = [
    cue(scene, "comer") - shots[1].from,
    cue(scene, "reproduzir") - shots[1].from,
    cue(scene, "perceber") - shots[1].from,
  ] as const;
  return (
    <>
      <Shot range={shots[0]} name="um terço da vida">
        <BarShot thirdAt={cue(scene, "terço")} />
      </Shot>
      <Shot range={shots[1]} name="o que o bicho deixa de fazer dormindo">
        <LossesShot at={lossesAt} />
      </Shot>
    </>
  );
};
