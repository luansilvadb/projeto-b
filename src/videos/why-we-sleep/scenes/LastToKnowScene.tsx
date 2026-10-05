import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraBetween, framing } from "../../../components/Camera";
import { cue, linear, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import {
  Critter,
  DEN,
  DEN_CLOSE,
  LATE_ORB,
  SavannaShot,
  Stalker,
  THICKET,
  Thicket,
} from "./NightFallsScene";

// A câmera recua do bicho para a moita: ele dormindo de um lado, embaixo, e os olhos do outro, mais altos.
const EYES_SUBJECT = [(DEN.x + THICKET.x) / 2 - 30, DEN.y - 90] as const;
const ON_EYES = framing(EYES_SUBJECT, 3.5, [960, 600]);
/**
 * Onde a câmera está quando o plano acaba: enquanto a sombra avança, ela se
 * aproxima um pouco, o plano inteiro. É o único trecho do capítulo em que a
 * tensão sobe. `skip-a-night` parte daqui.
 */
export const STALKED = framing(EYES_SUBJECT, 3.62, [960, 600]);

// Em quanto tempo a câmera vai do bicho à moita, e os olhos acendem, em segundos.
const SLIDE_SECONDS = 0.6;
const LIGHT_SECONDS = 0.25;
// Os olhos começam a acender antes da palavra, estes quadros além da antecipação de toda deixa:
// acesos em cima dela, pareciam atrasados.
const LIGHT_LEAD_FRAMES = 4;
// Quanto o capim se agita com o predador dentro: pouco quando ele espia, mais quando avança.
const RUSTLE = { lurking: 0.14, advancing: 0.3 };

type EyesShotProps = {
  /** Quadros do plano em que os olhos acendem, em que a sombra começa a avançar e em que a orelha do bicho se mexe. */
  readonly litAt: number;
  readonly nearAt: number;
  readonly earAt: number;
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

/** Dois olhos acendem no capim atrás do bicho, que continua dormindo; a sombra avança devagar. */
const EyesShot: React.FC<EyesShotProps> = ({ litAt, nearAt, earAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A sombra vem a velocidade constante, sem pressa, até o plano acabar: quem tem pressa é quem assiste.
  const out = linear(frame, nearAt, length - nearAt);
  // A orelha dá duas sacudidas e volta a cair; o resto dele não muda.
  const twitch = interpolate(
    frame,
    [earAt, earAt + 3, earAt + 7, earAt + 10, earAt + 16],
    [0, 0.55, 0.1, 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <SavannaShot
      camera={cameraBetween(
        DEN_CLOSE,
        cameraBetween(ON_EYES, STALKED, linear(frame, 0, length)),
        ramp(frame, 0, SLIDE_SECONDS * fps),
      )}
      daylight={0}
      orb={LATE_ORB}
      clock={clock}
    >
      <Thicket
        daylight={0}
        seconds={seconds}
        // O capim só começa a se agitar quando há alguém nele: o plano anterior terminou com ele quieto.
        stir={
          ramp(frame, litAt - 0.2 * fps, 0.4 * fps) *
          (RUSTLE.lurking + RUSTLE.advancing * out)
        }
      >
        <Stalker
          lit={ramp(frame, litAt, LIGHT_SECONDS * fps)}
          out={out}
          // Primeiro os olhos; o vulto em volta deles se define logo depois.
          shown={ramp(frame, litAt, 0.5 * fps)}
          seconds={seconds}
        />
      </Thicket>
      <Critter
        daylight={0}
        rest={1}
        asleep={1}
        ear={twitch}
        seconds={seconds}
      />
    </SavannaShot>
  );
};

export const LastToKnowScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="os olhos no capim">
    <EyesShot
      litAt={cue(scene, "predador") - LIGHT_LEAD_FRAMES}
      nearAt={cue(scene, "chegar")}
      earAt={cue(scene, "demora")}
      clock={scene.from}
    />
  </Shot>
);
