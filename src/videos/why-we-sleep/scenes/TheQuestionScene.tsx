import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Earth } from "../../../art/Earth";
import {
  Build,
  Camera,
  cameraBetween,
  framing,
  Layer,
  type CameraState,
} from "../../../components/Camera";
import { FlatStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { POP_SECONDS } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import { FPS, HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { Vignette } from "../../../vignette/Vignette";
import { pedestal } from "../palette";
import { questionPop } from "../parts/IconRow";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  CLOSE_SIGN,
  Magnifier,
  SEARCH_GLOBE,
  SEARCH_PUSH,
  SEARCH_SIGN,
  searchSpin,
  searchWander,
} from "../parts/Search";
import { PEDESTAL_HEIGHT, VacantSign } from "../parts/VacantSign";
import script from "../script.json";

/**
 * Quanto a vinheta dura: o silêncio que o roteiro reserva para ela no fim
 * desta cena.
 */
export const VIGNETTE_FRAMES = Math.round(
  ((script.scenes.find((scene) => scene.id === "the-question")?.holdMs ?? 0) /
    1000) *
    FPS,
);

const CENTER = [WIDTH / 2, HEIGHT / 2] as const;
// A câmera parte de onde o plano aberto da procura a deixou e chega ao
// pedestal de perto: o mesmo pedestal, que vai parar onde `CLOSE_SIGN` manda.
const NEARER = CLOSE_SIGN.scale / SEARCH_SIGN.scale;
const WIDE = framing(CENTER, 1 + SEARCH_PUSH, CENTER);
const CLOSE = framing([SEARCH_SIGN.x, SEARCH_SIGN.y], NEARER, [
  CLOSE_SIGN.x,
  CLOSE_SIGN.y,
]);
const ARRIVE_SECONDS = 0.8;
// O globo está mais perto de quem assiste que o pedestal: sai do quadro mais depressa que ele.
const GLOBE_DEPTH = 1.4;
// Depois de chegar, a câmera continua se aproximando devagar do lugar vazio, até a vinheta abrir.
const PUSH = { by: 0.05, focus: [960, 420], seconds: 4 } as const;
// O centro do contorno tracejado, no plano aberto.
const SLOT = [
  SEARCH_SIGN.x,
  SEARCH_SIGN.y - (PEDESTAL_HEIGHT + 174) * SEARCH_SIGN.scale,
] as const;
// A lupa sobre o globo e sobre o lugar vazio: o raio da lente em cada um, no plano aberto.
const LENS = { searching: 130, found: 310 / NEARER };
const LENS_SECONDS = 0.9;
// A lupa insiste: o cabo sobe, passa do ponto e volta um pouco.
const INSIST = { degrees: -15, back: 4, frames: 9, settle: 6 };
// No caminho a lupa é levada com o cabo erguido e sobe um pouco, em arco: com o
// cabo pendurado a 45°, ele passava por cima da placa "acordado 24 h" ao chegar.
const CARRY = { degrees: -32, lift: 40 };

/** A câmera `camera` com uma aproximação a mais, de `zoom` vezes, em volta do ponto `focus` do quadro. */
const pushedIn = (
  camera: CameraState,
  focus: readonly [number, number],
  zoom: number,
): CameraState => ({
  x: zoom * camera.x + (zoom - 1) * (focus[0] - CENTER[0]),
  y: zoom * camera.y + (zoom - 1) * (focus[1] - CENTER[1]),
  zoom: zoom * camera.zoom,
});

type EmptyShotProps = {
  /** Quadros do plano em que a interrogação aparece sobre o lugar vazio e em que a lupa insiste. */
  readonly questionAt: number;
  readonly insistAt: number;
};

/**
 * A câmera deixa o globo e chega ao pedestal "acordado 24 h"; a lupa vem com
 * ela e para sobre o lugar vazio, que continua vazio, com a pergunta em cima.
 * É o mesmo palco do plano aberto: nada é redesenhado, só a câmera anda.
 */
const EmptyShot: React.FC<EmptyShotProps> = ({ questionAt, insistAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const arrived = ramp(frame, 0, ARRIVE_SECONDS * fps);
  const camera = pushedIn(
    cameraBetween(WIDE, CLOSE, arrived),
    PUSH.focus,
    1 + PUSH.by * linear(frame, ARRIVE_SECONDS * fps, PUSH.seconds * fps),
  );
  // A lupa continua o vaivém do plano aberto enquanto vai até o lugar vazio; lá, só paira.
  const found = ramp(frame, 0, LENS_SECONDS * fps);
  const wander = searchWander(seconds);
  const carried = Math.sin(Math.PI * found);
  const lens = [
    mix(wander[0], SLOT[0], found) + 4 * found * wave(seconds, 3.7),
    mix(wander[1], SLOT[1], found) +
      5 * found * wave(seconds, 2.9, 0.3) -
      CARRY.lift * carried,
  ];
  // A interrogação estoura: cresce de 0,7 a 1,08 e assenta, à vista, e não só pela opacidade.
  const asked = questionPop(frame, questionAt, POP_SECONDS * fps);
  const tilt =
    CARRY.degrees * carried +
    INSIST.degrees * ramp(frame, insistAt, INSIST.frames) +
    INSIST.back * ramp(frame, insistAt + INSIST.frames, INSIST.settle);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.38]} />}>
        {/* Aqui não há chão para subir: o que está no palco já estava, e a câmera é que se move. */}
        <Build>
          <Camera {...camera}>
            {/* O globo só existe até sair do quadro, levado pela câmera. */}
            {arrived < 1 ? (
              <Layer depth={mix(1, GLOBE_DEPTH, arrived)}>
                <SvgLayer>
                  <IdeaShadow
                    hue="mint"
                    x={SEARCH_GLOBE.x}
                    y={SEARCH_GLOBE.y + SEARCH_GLOBE.radius + 60}
                    width={SEARCH_GLOBE.radius * 1.5}
                  />
                </SvgLayer>
                <Place x={SEARCH_GLOBE.x} y={SEARCH_GLOBE.y}>
                  <Earth
                    radius={SEARCH_GLOBE.radius}
                    spin={searchSpin(seconds)}
                  />
                </Place>
              </Layer>
            ) : null}
            <Layer depth={1}>
              <VacantSign {...SEARCH_SIGN} />
              <Place x={SLOT[0]} y={SLOT[1]}>
                <div
                  style={{ opacity: asked.opacity, scale: `${asked.scale}` }}
                >
                  <div
                    style={{
                      fontFamily: typography.family,
                      fontWeight: 900,
                      fontSize: (typography.size.display * 2) / NEARER,
                      lineHeight: 1,
                      color: pedestal.shade,
                      // A pergunta não fica parada: balança de leve dentro da lente.
                      rotate: `${3 * wave(seconds, 3.3)}deg`,
                    }}
                  >
                    ?
                  </div>
                </div>
              </Place>
              <Magnifier
                x={lens[0]}
                y={lens[1]}
                size={mix(LENS.searching, LENS.found, found)}
                tilt={tilt}
              />
            </Layer>
          </Camera>
        </Build>
      </FlatStage>
      <Grain />
    </AbsoluteFill>
  );
};

// No fim do silêncio o símbolo da vinheta já assentou e o quadro quase para:
// a câmera chega um pouco mais perto dele e volta, uma vez, e termina
// exatamente onde estava, que é de onde a cena seguinte tira a vinheta.
const SYMBOL_BREATH = { frames: 48, by: 0.03 };

/** A vinheta com esse último fôlego: dura o trecho em que for posta, como ela. */
const BreathingVignette: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const through = Math.min(
    1,
    Math.max(
      0,
      (frame - (durationInFrames - SYMBOL_BREATH.frames)) /
        SYMBOL_BREATH.frames,
    ),
  );
  return (
    <AbsoluteFill
      style={{
        // Parte e chega parada: meio ciclo de cosseno, de ida e volta.
        scale: `${1 + (SYMBOL_BREATH.by * (1 - Math.cos(2 * Math.PI * through))) / 2}`,
      }}
    >
      <Vignette />
    </AbsoluteFill>
  );
};

export const TheQuestionScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o lugar continua vazio">
      <EmptyShot
        questionAt={cue(scene, "algum")}
        insistAt={cue(scene, "dormir")}
      />
    </Shot>
    {/* No silêncio depois da fala, a vinheta do canal abre num círculo sobre o plano. */}
    <Sequence
      from={scene.durationInFrames - scene.holdFrames}
      durationInFrames={scene.holdFrames}
      name="vinheta"
    >
      <BreathingVignette />
    </Sequence>
  </>
);
