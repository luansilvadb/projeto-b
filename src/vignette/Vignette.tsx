import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StageContext, type Stage } from "../components/Cast";
import { HEIGHT, WIDTH } from "../format";
import { JOIN_FRAMES } from "../video/stage";
import { CellWorld } from "./CellWorld";
import { CoastWorld, LAGOON_SPOT } from "./CoastWorld";
import { JELLYFISH, LagoonWorld } from "./LagoonWorld";
import { COAST_MARK, PlanetWorld } from "./PlanetWorld";
import type { WorldProps } from "./shapes";
import { clamp } from "../components/timing";

/**
 * A vinheta do canal, a mesma em todo vídeo: uma viagem do minúsculo ao
 * imenso. A câmera recua sem parar: de dentro de uma célula para a água-viva
 * a que ela pertence, no fundo da lagoa; da lagoa para a costa vista do alto;
 * da costa para o planeta no espaço, que assenta no centro como símbolo do
 * canal. Cada mundo cabe dentro do seguinte, numa janela redonda que encolhe
 * até sumir no ponto de onde a câmera saiu.
 */

type Stop = {
  readonly World: React.FC<WorldProps>;
  /** O ponto deste mundo em que o mundo anterior cabe: de onde a câmera veio. */
  readonly from: readonly [number, number];
};

const STOPS: readonly Stop[] = [
  { World: CellWorld, from: [WIDTH / 2, HEIGHT / 2] },
  { World: LagoonWorld, from: [JELLYFISH.x, JELLYFISH.y + 30] },
  { World: CoastWorld, from: [LAGOON_SPOT.x, LAGOON_SPOT.y] },
  { World: PlanetWorld, from: COAST_MARK },
];
// Quantas vezes cada mundo é maior que a janela em que aparece dentro do seguinte.
const ZOOM = 14;
const CENTER = [WIDTH / 2, HEIGHT / 2] as const;
// A janela redonda, medida no mundo de dentro: cobre o quadro inteiro quando ele está no
// tamanho natural e logo se fecha até caber na altura dele, para não mostrar os cantos.
const WINDOW = [HEIGHT * 0.48, Math.hypot(WIDTH, HEIGHT) / 2] as const;
const WINDOW_CLOSED = 0.6;
// A janela some quando já é pequena, para o ponto do próprio mundo tomar o lugar dela.
const WINDOW_FADE = [1, 1.9] as const;
// O tempo da vinheta, em frações dela: o círculo que a abre, a pausa em cada
// mundo, o recuo de um mundo ao seguinte, e o planeta assentando como símbolo.
const IRIS = 0.05;
const FIRST_HOLD = 0.07;
const LEG = 0.2;
const SETTLE = 0.14;
/** Quanto dura o círculo que fecha a vinheta sobre o plano seguinte. */
/** Em quantos quadros o que está desenhado na vinheta sai do palco. */
export const VIGNETTE_LEAVE_FRAMES = 10;
/** O quadro em que o plano seguinte começa a tomar o palco, e aquele em que já o cobriu. */
export const VIGNETTE_HANDOFF_FRAMES = 8;
export const VIGNETTE_COVERED_FRAMES = VIGNETTE_HANDOFF_FRAMES + JOIN_FRAMES;


type VignetteProps = {
  /** O nome do canal, debaixo do símbolo. O canal ainda não tem nome: sem ele, fica só o símbolo. */
  readonly channel?: string;
};

/**
 * A vinheta inteira. Abre num círculo sobre o que estiver por baixo (o último
 * plano do gancho) e termina com o símbolo parado. Dura o trecho em que for
 * posta (um `Sequence`) e não tem fala.
 */
export const Vignette: React.FC<VignetteProps> = ({ channel }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const time = frame / durationInFrames;
  // Em que mundo a câmera está: 0 é a célula enchendo o quadro, 3 é o planeta.
  // Cada recuo arranca devagar, corre no meio e freia ao chegar, para o mundo ser visto.
  const journey = STOPS.slice(1).reduce(
    (sum, _, leg) =>
      sum +
      interpolate(
        time,
        [FIRST_HOLD + leg * LEG, FIRST_HOLD + (leg + 1) * LEG],
        [0, 1],
        { ...clamp, easing: Easing.inOut(Easing.cubic) },
      ),
    0,
  );
  const outer = Math.min(STOPS.length - 1, Math.ceil(journey));
  // O mundo de fora, do tamanho natural até `ZOOM` vezes maior; o de dentro é `ZOOM` vezes menor.
  const scale = ZOOM ** (outer - journey);
  const { World: Outer, from } = STOPS[outer];
  const Inner = outer > 0 ? STOPS[outer - 1].World : null;
  // Um zoom em volta de um ponto fixo: com o mundo de fora no tamanho máximo,
  // o ponto de onde a câmera veio fica no centro do quadro.
  const fixed = [0, 1].map(
    (axis) => (CENTER[axis] - ZOOM * from[axis]) / (1 - ZOOM),
  );
  const window = [0, 1].map(
    (axis) => fixed[axis] + scale * (from[axis] - fixed[axis]),
  );
  const settleAt = FIRST_HOLD + (STOPS.length - 1) * LEG;
  const settled = interpolate(time, [settleAt, settleAt + SETTLE], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const opening = interpolate(time, [0, IRIS], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        clipPath: `circle(${opening * Math.hypot(WIDTH, HEIGHT) * 0.6}px at 50% 50%)`,
      }}
    >
      <AbsoluteFill
        style={{
          scale: `${scale}`,
          transformOrigin: `${fixed[0]}px ${fixed[1]}px`,
        }}
      >
        {outer === STOPS.length - 1 ? (
          <PlanetWorld seconds={seconds} settled={settled} channel={channel} />
        ) : (
          <Outer seconds={seconds} />
        )}
      </AbsoluteFill>
      {Inner && scale > WINDOW_FADE[0] ? (
        <AbsoluteFill
          style={{
            clipPath: `circle(${(interpolate(scale, [ZOOM * WINDOW_CLOSED, ZOOM], WINDOW, clamp) * scale) / ZOOM}px at ${window[0]}px ${window[1]}px)`,
            opacity: interpolate(scale, WINDOW_FADE, [0, 1], clamp),
          }}
        >
          <AbsoluteFill
            style={{
              translate: `${window[0] - CENTER[0]}px ${window[1] - CENTER[1]}px`,
              scale: `${scale / ZOOM}`,
            }}
          >
            <Inner seconds={seconds} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

type VignetteLeavingProps = VignetteProps & {
  /** Quantos quadros a vinheta durou: a saída parte do último deles. */
  readonly frames: number;
};

/**
 * A vinheta saindo do palco, para pôr por baixo do começo do plano seguinte.
 * É o mesmo palco: o céu dela fica como fundo, o planeta e o que mais estiver
 * desenhado encolhem e saem, e o plano seguinte toma o lugar por cima. Não há
 * recorte nem efeito por cima das duas imagens.
 */
export const VignetteLeaving: React.FC<VignetteLeavingProps> = ({
  frames,
  channel,
}) => {
  const frame = useCurrentFrame();
  const stage = useMemo<Stage>(
    () => ({
      enter: () => 1,
      // Tudo sai junto e logo: o plano seguinte começa a cobrir o palco em seguida.
      leave: () =>
        interpolate(frame, [0, VIGNETTE_LEAVE_FRAMES], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.cubic),
        }),
      handedOver: false,
      cast: true,
    }),
    [frame],
  );
  if (frame >= VIGNETTE_COVERED_FRAMES) {
    return null;
  }
  return (
    <StageContext.Provider value={stage}>
      <Sequence durationInFrames={frames} layout="none">
        <Freeze frame={frames - 1}>
          <Vignette channel={channel} />
        </Freeze>
      </Sequence>
    </StageContext.Provider>
  );
};
