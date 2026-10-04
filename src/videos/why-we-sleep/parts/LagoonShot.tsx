import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Fish, type FishMood } from "../../../art/Fish";
import { Camera, type CameraState } from "../../../components/Camera";
import { Grain } from "../../../components/Grain";
import { blink, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { fish as fishColors, ink, jellyfish, lagoon } from "../palette";
import { JELLYFISH_SPOT, Lagoon } from "./Lagoon";
import { PulseRings } from "./PulseRings";
import { type PulseRhythm, pulseCycles, pulseRate, pulseShape } from "./pulse";

export type FishSpot = {
  /** Centro do corpo e comprimento do peixe, no plano do assunto. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly mood?: FishMood;
  readonly look?: readonly [number, number];
  /** Vira o peixe para a direita. */
  readonly flip?: boolean;
  /** Inclinação do corpo, em graus. */
  readonly tilt?: number;
  /** Nadando, a cauda bate depressa; parado, só balança. */
  readonly swimming?: boolean;
  /** Quanto o olho está fechado além do que o humor manda, de 0 a 1. */
  readonly lid?: number;
};

type Time = "day" | "night";

type LagoonShotProps = {
  readonly time: Time;
  /**
   * A noite descendo sobre o dia: entre 0 e 1, a borda está no quadro e a
   * lagoa aparece pintada duas vezes. Vale quando `time` é "night".
   */
  readonly nightfall?: number;
  readonly camera: CameraState;
  /** Ritmo do pulso ao longo do plano. */
  readonly rhythm: readonly PulseRhythm[];
  readonly droop?: number;
  readonly sway?: number;
  readonly nerves?: number;
  /**
   * Quanto ela já chegou ao lugar dela, de 0 a 1. Em 0 vem nadando de cabeça
   * para cima, como qualquer água-viva; no caminho vira e, em 1, está pousada
   * de cabeça para baixo. É como o vídeo apresenta o bicho: sem ver a virada,
   * quem assiste não reconhece uma água-viva na forma pousada.
   */
  readonly landed?: number;
  /** Mostra os anéis que cada pulso solta na água. */
  readonly rings?: boolean;
  readonly fish?: FishSpot;
  /** O que mais houver no plano do assunto, desenhado por cima da água-viva. */
  readonly children?: React.ReactNode;
};

const SWAY_SECONDS = 5;
const BOB_SECONDS = 2.4;
// Do centro do desenho da água-viva até onde o sino encosta na areia, em relação à largura do sino.
const RESTING = 62 / 330;
// De onde ela vem nadando, em relação ao lugar em que pousa, e em que trecho do caminho ela vira.
const SWIM_IN = { x: -520, y: -400 };
const TURNING = [0.4, 0.85] as const;

/**
 * O molde de todo plano da lagoa: o cenário, a água-viva pousada no mesmo
 * lugar e o peixe. De um plano para o outro mudam a hora, a câmera e o que
 * cada um está fazendo; o que ninguém está fazendo, a pausa viva faz.
 */
export const LagoonShot: React.FC<LagoonShotProps> = (props) => {
  const { time, nightfall = 1 } = props;
  if (time === "night" && nightfall < 1) {
    return (
      <AbsoluteFill>
        <LagoonView {...props} time="day" />
        <AbsoluteFill
          style={{ clipPath: `inset(0 0 ${(1 - nightfall) * 100}% 0)` }}
        >
          <LagoonView {...props} time="night" />
        </AbsoluteFill>
        <Grain />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <LagoonView {...props} />
      <Grain />
    </AbsoluteFill>
  );
};

const LagoonView: React.FC<LagoonShotProps> = ({
  time,
  camera,
  rhythm,
  droop = 0,
  sway = 0,
  nerves = 0,
  landed = 1,
  rings = false,
  fish,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const { x, y, width } = JELLYFISH_SPOT;
  const cycles = pulseCycles(frame, fps, rhythm);
  // Ela avança de lado primeiro e só desce no fim, já virada.
  const away = 1 - landed;
  const turned = interpolate(landed, TURNING, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <Camera {...camera}>
      <Lagoon
        colors={lagoon[time]}
        night={time === "night"}
        shadows={[
          // A sombra só cresce quando ela chega perto da areia.
          { x, y: y + width * RESTING, width: width * 1.12 * landed ** 3 },
        ]}
      >
        {rings ? (
          <SvgLayer>
            <PulseRings
              x={x}
              y={y}
              width={width}
              cycles={cycles}
              perMinute={pulseRate(frame, rhythm)}
              color={ink.ring}
            />
          </SvgLayer>
        ) : null}
        <Place
          x={x + SWIM_IN.x * away}
          y={y + SWIM_IN.y * away ** 2}
          style={{ rotate: `${180 * (1 - turned)}deg` }}
        >
          <Cassiopea
            width={width}
            colors={jellyfish[time]}
            pulse={pulseShape(cycles)}
            droop={droop}
            sway={sway + 0.5 * wave(seconds, SWAY_SECONDS)}
            nerves={nerves}
          />
        </Place>
        {fish ? <LagoonFish time={time} seconds={seconds} {...fish} /> : null}
        {children}
      </Lagoon>
    </Camera>
  );
};

type LagoonFishProps = FishSpot & { time: Time; seconds: number };

/** O peixe no seu lugar, com a pausa viva de quem nada: sobe e desce, bate a cauda, pisca. */
const LagoonFish: React.FC<LagoonFishProps> = ({
  time,
  seconds,
  x,
  y,
  width,
  mood,
  look,
  flip = false,
  tilt = 0,
  swimming = false,
  lid = 0,
}) => {
  const asleep = mood === "asleep";
  const tail = swimming
    ? 10 * wave(seconds, 0.4)
    : (asleep ? 1.5 : 4) * wave(seconds, asleep ? 2.6 : 1.1);
  const bob = (asleep ? 3 : 9) * wave(seconds, BOB_SECONDS, 0.3);

  return (
    <Place
      x={x}
      y={y + bob}
      style={{ scale: flip ? "-1 1" : undefined, rotate: `${tilt}deg` }}
    >
      <Fish
        width={width}
        colors={fishColors[time]}
        mood={mood}
        look={look}
        tail={tail}
        blink={Math.max(lid, asleep ? 0 : blink(seconds, "lagoon-fish"))}
      />
    </Place>
  );
};
