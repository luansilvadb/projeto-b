import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Person } from "../../../art/Person";
import { Silhouette } from "../../../art/Silhouettes";
import {
  Camera,
  Layer,
  cameraBetween,
  framing,
} from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { POP_SECONDS, Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { TextReveal } from "../../../components/TextReveal";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { crowd, ink, jellyfish, person, puzzle } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { LagoonShot } from "../parts/LagoonShot";
import { FIRST_CLUE, PUZZLE, Puzzle, piecePath } from "../parts/Puzzle";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  cue,
  linear,
  mix,
  pulseShape,
  ramp,
  settle,
  steady,
} from "../parts/timing";

// Um pouco mais perto da areia que o plano do título, para o corte não ser um pulo.
const CARD = framing([960, 700], 1.15, [960, 640]);
const CARD_END = framing([960, 700], 1.19, [960, 640]);
// A sombra do predador atravessa o quadro por cima dela, da direita para a esquerda.
const PREDATOR = { from: 2600, to: -800, y: 500, width: 1400, seconds: 2 };
// O peixe dorme onde o plano anterior o deixou.
const FISH_BED = { x: 1092, y: 752 };

type CardShotProps = {
  /** Quadro do plano em que a cartela entra. */
  readonly cardAt: number;
  /** Quadro do plano em que a sombra começa a passar. */
  readonly shadowAt: number;
};

/** Cartela do capítulo pousada na areia; atrás dela, a sombra passa por quem dorme. */
const CardShot: React.FC<CardShotProps> = ({ cardAt, shadowAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const crossing = linear(frame, shadowAt, PREDATOR.seconds * fps);

  return (
    <>
      <LagoonShot
        time="night"
        camera={cameraBetween(CARD, CARD_END, frame / durationInFrames)}
        rhythm={steady(PULSES_ASLEEP)}
        droop={0.8}
        fish={{ ...FISH_BED, width: 110, mood: "asleep", tilt: 10 }}
      >
        <Place
          x={mix(PREDATOR.from, PREDATOR.to, crossing)}
          y={PREDATOR.y + 10 * wave(frame / fps, 1.6)}
          style={{ scale: "-1 1", opacity: 0.75, filter: "blur(6px)" }}
        >
          <Silhouette
            kind="predator"
            width={PREDATOR.width}
            color={crowd.predator}
          />
        </Place>
      </LagoonShot>
      <Place x={960} y={905}>
        <div style={{ filter: `drop-shadow(0 0 22px ${ink.glow})` }}>
          <TextReveal at={cardAt}>
            <Label size="headline" color={ink.moon}>
              Uma péssima ideia
            </Label>
          </TextReveal>
        </div>
      </Place>
    </>
  );
};

// O canto do tabuleiro no quadro, e os pés de quem olha para ele.
const BOARD = { x: 940, y: 210 };
const VIEWER = { x: 470, y: 950, height: 640 };
// Quadros que a peça leva para descer até o buraco.
const DROP_FRAMES = 14;
const DROP_HEIGHT = 520;
const CHEER_SECONDS = 0.3;
// Perto dela e do canto do tabuleiro; depois, o tabuleiro inteiro.
const PUZZLE_CAMERA = {
  person: framing([760, 640], 1.3),
  board: framing([960, 540], 1),
};
const RECEDE_SECONDS = 0.8;

type PuzzleShotProps = {
  /** Quadro do plano em que a pessoa entra. */
  readonly personAt: number;
  /** Quadro do plano em que as peças começam a entrar. */
  readonly piecesAt: number;
  /** Quadro do plano em que a peça da água-viva começa a descer. */
  readonly dropAt: number;
};

/** A pessoa diante do quebra-cabeça das pistas: a peça da água-viva é a primeira a encaixar. */
const PuzzleShot: React.FC<PuzzleShotProps> = ({
  personAt,
  piecesAt,
  dropAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const fits = dropAt + DROP_FRAMES;
  const found = frame >= fits;
  const drop = DROP_HEIGHT * (1 - settle(frame, dropAt, DROP_FRAMES));
  // Ela se anima alguns quadros depois de a peça encaixar.
  const cheer = settle(frame, fits + 3, CHEER_SECONDS * fps);
  // A peça encaixada dá uma pulsada, e ela acena com a cabeça.
  const fitPulse = popScale(frame, fits, POP_SECONDS * fps, 1, 1.08);
  const nod = 4 * Math.sin(Math.PI * settle(frame, fits + 8, 0.5 * fps));
  const [column, row] = FIRST_CLUE;
  const piece = {
    x: BOARD.x + (column + 0.5) * PUZZLE.cell,
    y: BOARD.y + (row + 0.5) * PUZZLE.cell,
  };
  const boardBottom = BOARD.y + PUZZLE.rows * PUZZLE.cell + 26;
  const boardWidth = PUZZLE.columns * PUZZLE.cell;
  // Enquanto pensa, a mão coça a cabeça.
  const scratch = cheer > 0 ? 0 : 6 * wave(seconds, 0.5);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="peach" spot={[0.68, 0.44]} />
      {/* A câmera começa com ela e recua quando o tabuleiro se enche de pistas. */}
      <Camera
        {...cameraBetween(
          PUZZLE_CAMERA.person,
          PUZZLE_CAMERA.board,
          ramp(frame, piecesAt, RECEDE_SECONDS * fps),
        )}
      >
        <Layer depth={1}>
          <SvgLayer>
            <IdeaShadow hue="peach" x={VIEWER.x} y={VIEWER.y + 4} width={300} />
            <IdeaShadow
              hue="peach"
              x={BOARD.x + boardWidth / 2}
              y={VIEWER.y + 4}
              width={boardWidth * 0.9}
            />
            {/* O cavalete que segura o tabuleiro. */}
            {[0.16, 0.84].map((at) => (
              <line
                key={at}
                x1={BOARD.x + boardWidth * at}
                y1={boardBottom - 10}
                x2={BOARD.x + boardWidth * (at < 0.5 ? at - 0.06 : at + 0.06)}
                y2={VIEWER.y}
                stroke={puzzle.board}
                strokeWidth={22}
                strokeLinecap="round"
              />
            ))}
            <g transform={`translate(${BOARD.x} ${BOARD.y})`}>
              <Puzzle found={found} piecesAt={piecesAt} />
              {found || frame < dropAt ? null : (
                <g transform={`translate(0 ${-drop})`}>
                  <path
                    d={piecePath(column, row)}
                    fill={puzzle.pieceShade}
                    transform="translate(0 7)"
                  />
                  <path d={piecePath(column, row)} fill={puzzle.found} />
                </g>
              )}
            </g>
          </SvgLayer>
          {/* A água-viva desenhada na peça: a primeira pista. */}
          {frame < dropAt ? null : (
            <Place
              x={piece.x}
              y={piece.y + 30 - (found ? 0 : drop)}
              style={{ scale: `${fitPulse}` }}
            >
              <Cassiopea
                width={112}
                colors={jellyfish.day}
                pulse={pulseShape((seconds * PULSES_AWAKE) / 60)}
                sway={0.4 * wave(seconds, 3)}
              />
            </Place>
          )}
          <Place
            x={VIEWER.x}
            y={VIEWER.y}
            anchor="bottom"
            style={{
              scale: `1 ${breath(seconds, "viewer")}`,
              rotate: `${nod}deg`,
            }}
          >
            <Pop at={personAt} from={0.8} origin="bottom">
              <Person
                height={VIEWER.height}
                colors={person}
                expression={cheer > 0 ? "curious" : "puzzled"}
                blink={blink(seconds, "viewer")}
                frontArm={
                  cheer > 0
                    ? {
                        hand: mixHand([-96, -560], [-136, -214], cheer),
                        bend: 40,
                      }
                    : { hand: [-96, -560 + scratch], bend: 60 }
                }
                backArm={
                  cheer > 0
                    ? {
                        hand: mixHand([100, -214], [196, -392], cheer),
                        bend: 18,
                      }
                    : undefined
                }
              />
            </Pop>
          </Place>
        </Layer>
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};

/** Uma mão a caminho de uma pose para outra. */
const mixHand = (
  from: readonly [number, number],
  to: readonly [number, number],
  t: number,
): [number, number] => [mix(from[0], to[0], t), mix(from[1], to[1], t)];

export const HonestWarningScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="cartela: uma péssima ideia">
      <CardShot cardAt={cue(scene, "aviso")} shadowAt={cue(scene, "ninguém")} />
    </Shot>
    <Shot range={shots[1]} name="o quebra-cabeça das pistas">
      <PuzzleShot
        personAt={cue(scene, "Mas") - shots[1].from}
        piecesAt={cue(scene, "pistas") - shots[1].from}
        dropAt={cue(scene, "primeira") - shots[1].from}
      />
    </Shot>
  </>
);
