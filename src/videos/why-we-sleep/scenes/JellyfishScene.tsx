import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { Cassiopea } from "../../../art/Cassiopea";
import { cameraBetween, framing } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, jellyfish } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot } from "../parts/LagoonShot";
import { PULSES_AWAKE, pulseShape, steady } from "../parts/pulse";
import { Tag } from "../parts/Tag";

// A lagoa abre deslizando do lado por onde o peixe entra até o enquadramento aberto.
const SLIDE_SECONDS = 1.6;
// A apresentação do bicho: quando ela começa a chegar nadando e quanto leva para pousar, em segundos.
const LANDING = { at: 0.2, seconds: 2.6 };
// O peixe entra pela direita e para ao vê-la.
const FISH_ARRIVES = { x: 1290, y: 560 };
const FISH_SWIM_SECONDS = 0.9;

// A abertura fica mais perto que o plano aberto da lagoa: a água-viva precisa
// de ao menos um quarto da altura do quadro para ser o assunto.
const OPENING = {
  start: framing([1120, 620], 1.5, [960, 580]),
  wide: framing([900, 620], 1.36, [900, 600]),
  end: framing([880, 660], 1.42, [900, 620]),
} as const;

type ArrivalShotProps = {
  /** Quadro do plano em que o peixe entra. */
  readonly fishAt: number;
};

/** A lagoa rasa: ela entra nadando de cabeça para cima, vira e pousa; o peixe entra e para ao vê-la. */
const ArrivalShot: React.FC<ArrivalShotProps> = ({ fishAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const slideFrames = SLIDE_SECONDS * fps;
  const swim = settle(frame, fishAt, FISH_SWIM_SECONDS * fps);
  const camera =
    frame < slideFrames
      ? cameraBetween(OPENING.start, OPENING.wide, ramp(frame, 0, slideFrames))
      : cameraBetween(
          OPENING.wide,
          OPENING.end,
          (frame - slideFrames) / (durationInFrames - slideFrames),
        );

  return (
    <LagoonShot
      time="day"
      camera={camera}
      rhythm={steady(PULSES_AWAKE)}
      landed={ramp(frame, LANDING.at * fps, LANDING.seconds * fps)}
      fish={{
        x: mix(2080, FISH_ARRIVES.x, swim),
        y: mix(610, FISH_ARRIVES.y, swim),
        width: FISH_WATCHING.width,
        look: [-0.8, 0.5],
        swimming: swim < 1,
      }}
    />
  );
};

// A etiqueta fica no vazio à esquerda dela, ligada ao sino por uma linha.
const NAME = { x: 300, y: 540, to: [588, 614] as const };
const CAMERA_SECONDS = 0.6;

type PulseShotProps = {
  /** Quadro do plano em que o nome entra. */
  readonly nameAt: number;
};

/** Ela de perto, pousada, de braços para cima: cada pulso solta um anel na água. */
const PulseShot: React.FC<PulseShotProps> = ({ nameAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <LagoonShot
        time="day"
        // A câmera continua de onde o plano aberto parou.
        camera={cameraBetween(
          OPENING.end,
          LAGOON.medium,
          ramp(frame, 0, CAMERA_SECONDS * fps),
        )}
        rhythm={steady(PULSES_AWAKE)}
        rings
        fish={{ ...FISH_WATCHING, look: [-0.8, 0.4] }}
      />
      <SvgLayer>
        <g opacity={frame >= nameAt + 4 ? 1 : 0}>
          <path
            d={`M${NAME.x + 200},${NAME.y + 30} L${NAME.to[0]},${NAME.to[1]}`}
            stroke={ink.moon}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <circle cx={NAME.to[0]} cy={NAME.to[1]} r={12} fill={ink.moon} />
        </g>
      </SvgLayer>
      <Place x={NAME.x} y={NAME.y}>
        <Pop at={nameAt}>
          <Tag size="label" on="night">
            {/* Nome científico vai em itálico. */}
            <span style={{ fontStyle: "italic" }}>Cassiopea</span>
          </Tag>
        </Pop>
      </Place>
    </AbsoluteFill>
  );
};

const INSIDE = { x: 960, y: 700, width: 1150 };
const NO_BRAIN = { x: 960, y: 330, width: 330 };

type InsideShotProps = {
  /** Quadro do plano em que a rede de neurônios acende. */
  readonly netAt: number;
};

/** Por dentro do sino: o contorno de um cérebro que não está lá e, em volta, a rede de neurônios acesa. */
const InsideShot: React.FC<InsideShotProps> = ({ netAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <SlowPush
      focus={[INSIDE.x, INSIDE.y - 120]}
      by={0.08}
      backdrop={<InsideBackdrop />}
    >
      <Place x={INSIDE.x} y={INSIDE.y}>
        <Cassiopea
          width={INSIDE.width}
          colors={jellyfish.night}
          pulse={pulseShape((seconds * PULSES_AWAKE) / 60)}
          sway={0.5 * wave(seconds, 5)}
          nerves={ramp(frame, netAt, 0.6 * fps)}
        />
      </Place>
      <Place
        x={NO_BRAIN.x}
        y={NO_BRAIN.y + 6 * wave(seconds, 2.4)}
        style={{ rotate: "-6deg" }}
      >
        <Pop at={4}>
          <Brain width={NO_BRAIN.width} color={ink.paper} dashed folds />
        </Pop>
      </Place>
      <Grain />
    </SlowPush>
  );
};

export const JellyfishScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="ela chega nadando, vira e pousa">
        <ArrivalShot
          // O peixe só entra com ela já quase pousada: é ao vê-la que ele para.
          fishAt={Math.max(
            cue(scene, "escolheram"),
            (LANDING.at + LANDING.seconds - 0.4) * fps,
          )}
        />
      </Shot>
      <Shot range={shots[1]} name="de perto: cada pulso, um anel">
        <PulseShot nameAt={0.5 * fps} />
      </Shot>
      <Shot range={shots[2]} name="por dentro: uma rede, sem cérebro">
        <InsideShot netAt={cue(scene, "rede") - shots[2].from} />
      </Shot>
    </>
  );
};
