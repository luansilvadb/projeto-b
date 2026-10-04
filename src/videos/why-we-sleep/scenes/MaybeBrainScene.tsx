import { Tag } from "../parts/Tag";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { cue, ramp } from "../../../components/timing";

const SUSPECT = { x: 620, y: 500, width: 640 };
/** O bicho sem cérebro, que ainda não tem rosto: só o lugar dele. */
const NOBODY = { x: 1380, y: 520, rx: 230, ry: 250 };

type SuspectShotProps = {
  /** Quadros do plano em que o cérebro vira suspeito e em que o lugar vazio entra. */
  readonly blamedAt: number;
  readonly nobodyAt: number;
};

/** O suspeito: o cérebro, com a placa "culpado?"; ao lado, o lugar de um bicho sem cérebro. */
const SuspectShot: React.FC<SuspectShotProps> = ({ blamedAt, nobodyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <>
      <SlowPush
        focus={[960, 540]}
        backdrop={<IdeaBackdrop hue="peach" spot={[0.32, 0.46]} />}
      >
        {/* O foco de luz do interrogatório sobre o suspeito. */}
        <SvgLayer>
          <path
            d={`M${SUSPECT.x - 120},-40 L${SUSPECT.x + 120},-40 L${SUSPECT.x + 420},${SUSPECT.y + 300} L${SUSPECT.x - 420},${SUSPECT.y + 300} Z`}
            fill={ink.paper}
            opacity={0.3}
          />
        </SvgLayer>
        <Place x={SUSPECT.x} y={SUSPECT.y + 8 * wave(seconds, 3.2)}>
          <Brain
            width={SUSPECT.width}
            color={ink.tagEdge}
            fill={ink.tag}
            eyes={[ink.paper, ink.dark]}
            folds
          />
        </Place>
        <Place x={SUSPECT.x} y={SUSPECT.y + 330} style={{ rotate: "-5deg" }}>
          <Pop at={blamedAt} from={1.5}>
            <Tag size="label" on="peach">
              culpado?
            </Tag>
          </Pop>
        </Place>
        <SvgLayer>
          <ellipse
            cx={NOBODY.x}
            cy={NOBODY.y}
            rx={NOBODY.rx}
            ry={NOBODY.ry}
            fill="none"
            stroke={idea.peach.contact}
            strokeWidth={10}
            strokeDasharray="30 26"
            strokeLinecap="round"
            opacity={ramp(frame, nobodyAt, 0.3 * fps)}
          />
        </SvgLayer>
        <Place x={NOBODY.x} y={NOBODY.y + 330}>
          <Pop at={nobodyAt + 0.3 * fps}>
            <Tag size="note" on="peach">
              sem cérebro
            </Tag>
          </Pop>
        </Place>
        <Grain />
      </SlowPush>
    </>
  );
};

export const MaybeBrainScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="o cérebro é o culpado?">
    <SuspectShot
      blamedAt={cue(scene, "exigência")}
      nobodyAt={cue(scene, "bicho")}
    />
  </Shot>
);
