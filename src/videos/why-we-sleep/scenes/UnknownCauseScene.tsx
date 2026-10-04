import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, lab, researcher } from "../palette";
import { LabWall } from "../parts/Laboratory";
import { cue } from "../../../components/timing";

// A prancheta do exame, de perto: cada linha é um órgão examinado, e nenhuma tem resposta.
const BOARD = { x: 900, y: 150, width: 660, height: 820 };
const ROWS = 4;
const ROW_STEP = 130;

type ExamShotProps = {
  /** Quadro do plano em que a interrogação fecha o exame. */
  readonly unknownAt: number;
};

/** A prancheta com todos os itens em branco e uma interrogação no fim; a pesquisadora coça a cabeça. */
const ExamShot: React.FC<ExamShotProps> = ({ unknownAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <SlowPush focus={[1100, 540]} by={0.06} backdrop={<LabWall />}>
        <SvgLayer>
          <rect
            x={BOARD.x}
            y={BOARD.y}
            width={BOARD.width}
            height={BOARD.height}
            rx={36}
            fill={lab.clip}
          />
          <rect
            x={BOARD.x + 30}
            y={BOARD.y + 50}
            width={BOARD.width - 60}
            height={BOARD.height - 80}
            rx={18}
            fill={lab.paper}
          />
          <rect
            x={BOARD.x + BOARD.width / 2 - 90}
            y={BOARD.y - 20}
            width={180}
            height={80}
            rx={22}
            fill={researcher.pantsShade}
          />
          {Array.from({ length: ROWS }, (_, row) => {
            const y = BOARD.y + 170 + row * ROW_STEP;
            return (
              <g key={row}>
                <rect
                  x={BOARD.x + 80}
                  y={y - 34}
                  width={68}
                  height={68}
                  rx={14}
                  fill="none"
                  stroke={lab.clip}
                  strokeWidth={10}
                />
                <rect
                  x={BOARD.x + 190}
                  y={y - 11}
                  width={BOARD.width - 300 - (row % 2) * 80}
                  height={22}
                  rx={11}
                  fill={lab.paperLine}
                />
              </g>
            );
          })}
        </SvgLayer>
        <Place x={BOARD.x + BOARD.width / 2} y={BOARD.y + BOARD.height - 120}>
          <Pop at={unknownAt} from={1.6}>
            <Label size="display" color={ink.tagEdge}>
              ?
            </Label>
          </Pop>
        </Place>
        <Place
          x={470}
          y={1220}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, "researcher")}` }}
        >
          <Person
            height={960}
            colors={researcher}
            bun
            expression="puzzled"
            blink={blink(seconds, "researcher")}
            // A mão sobe até a cabeça e coça.
            frontArm={{
              hand: [-120 + 10 * wave(seconds, 0.5), -560],
              bend: 40,
            }}
          />
        </Place>
        <Grain />
      </SlowPush>
    </AbsoluteFill>
  );
};

export const UnknownCauseScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="ninguém encontrou a causa">
    <ExamShot unknownAt={cue(scene, "ninguém")} />
  </Shot>
);
