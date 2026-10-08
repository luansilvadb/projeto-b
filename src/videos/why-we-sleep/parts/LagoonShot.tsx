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
import {
  type PulseRhythm,
  pulseCycles,
  pulseFrame,
  pulseRate,
  pulseShape,
} from "./pulse";
import { clamp } from "../../../components/timing";

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
  /** O bocejo chegando, de 0 a 1: a boca abre e a pálpebra desce aos poucos. */
  readonly yawn?: number;
};

type Time = "day" | "night";

type LagoonShotProps = {
  readonly time: Time;
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
  /**
   * O quadro do vídeo em que o plano começa. Com ele, o pulso, os anéis, o
   * peixe e a lagoa contam no relógio do vídeo, e os quadros de `rhythm`, de
   * `ringsFrom` e de `ringsUntil` também são os do vídeo: nada salta quando um
   * plano da lagoa continua o anterior. Sem valor, o relógio é o do plano.
   */
  readonly clock?: number;
  /** Pulsos a somar à contagem; ver `settledPhase`. */
  readonly phase?: number;
  /** Os anéis só saem dos pulsos dados entre estes dois quadros do relógio. Sem valores, de todos. */
  readonly ringsFrom?: number;
  readonly ringsUntil?: number;
  /**
   * A chegada conduzida pela cena, no lugar de `landed`: onde ela está em
   * relação ao lugar de pouso, quanto já virou (0 de cabeça para cima, 1
   * pousada), quanto se inclina na direção em que nada, em graus, e quanto da
   * sombra dela já há na areia.
   */
  readonly arrival?: {
    readonly x: number;
    readonly y: number;
    readonly turned: number;
    readonly lean: number;
    readonly shadow: number;
  };
  /** Sem a água-viva: para a cena que a desenha por cima, a caminho de outro plano. A sombra dela fica. */
  readonly absent?: boolean;
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
export const LagoonShot: React.FC<LagoonShotProps> = (props) => (
  <AbsoluteFill>
    <LagoonView {...props} />
    <Grain />
  </AbsoluteFill>
);

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
  clock = 0,
  phase = 0,
  ringsFrom = -Infinity,
  ringsUntil = Infinity,
  arrival,
  absent = false,
}) => {
  const frame = clock + useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const { x, y, width } = JELLYFISH_SPOT;
  const cycles = phase + pulseCycles(frame, fps, rhythm);
  // Ela avança de lado primeiro e só desce no fim, já virada.
  const away = 1 - landed;
  const turned =
    arrival?.turned ??
    interpolate(landed, TURNING, [0, 1], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    });
  const offset = arrival ?? {
    x: SWIM_IN.x * away,
    y: SWIM_IN.y * away ** 2,
    lean: 0,
    shadow: landed ** 3,
  };

  return (
    <Camera {...camera}>
      <Lagoon
        colors={lagoon[time]}
        night={time === "night"}
        clock={clock}
        shadows={[
          // A sombra só cresce quando ela chega perto da areia.
          { x, y: y + width * RESTING, width: width * 1.12 * offset.shadow },
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
              // A idade de um anel é o tempo desde o pulso que o soltou: não muda quando o ritmo muda.
              ageOf={(ring) => {
                const born = pulseFrame(ring - phase, fps, rhythm);
                return born < ringsFrom || born > ringsUntil
                  ? -1
                  : (frame - born) / fps;
              }}
            />
          </SvgLayer>
        ) : null}
        {absent ? null : (
          <Place
            x={x + offset.x}
            y={y + offset.y}
            style={{ rotate: `${180 * (1 - turned) + offset.lean}deg` }}
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
        )}
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
  yawn = 0,
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
        yawn={yawn}
      />
    </Place>
  );
};
