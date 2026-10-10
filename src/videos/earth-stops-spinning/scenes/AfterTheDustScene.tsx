import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, storm } from "../palette";
import { Globe } from "../parts/Globe";
import { Frame, Push, SpaceBackdrop, Svg } from "../parts/kit";
import { Lever } from "../parts/Lever";
import { STAGE } from "./SwitchOffScene";

// Os dois continentes deste plano, em unidades do disco (raio 100), cada um
// com o meio dele: é em volta do meio, na linha do equador, que a terra seca muda.
const LANDS = [
  {
    at: -40,
    d: "M -20 -50 C 0 -70 30 -60 35 -35 C 40 -15 15 -5 20 15 C 25 35 40 50 30 70 C 20 80 5 60 0 40 C -5 20 -20 10 -25 -10 C -30 -30 -30 -40 -20 -50 Z",
  },
  {
    at: 48,
    d: "M -32 -60 C -2 -75 38 -65 48 -40 C 56 -20 33 -10 23 5 C 16 20 23 45 8 55 C -7 62 -17 40 -22 20 C -26 0 -47 -5 -47 -25 C -47 -45 -42 -55 -32 -60 Z",
  },
] as const;
// Onde a água assenta: a terra seca fica mais larga na cintura e mais curta para os polos.
const SETTLED = { wide: 1.2, tall: 0.74 } as const;

type Props = {
  /** O quadro em que o mar assenta, e o quadro em que o contorno antigo aparece. */
  readonly settleAt: number;
  readonly ghostAt: number;
};

/** A Terra parada e quieta, com a alavanca desligada: a poeira baixa, e o mar assenta fora do contorno antigo. */
const NewWaterline: React.FC<Props> = ({ settleAt, ghostAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const { earth: globe, lever } = STAGE;
  const k = globe.r / 100;
  // O mar ainda vai e volta, cada vez menos, e para quando a fala diz que assenta.
  const calm = ramp(frame, 0, settleAt + 0.4 * fps);
  const slosh = 7 * (1 - calm) * wave(seconds, 1.6);
  const moved = ramp(frame, settleAt - 0.8 * fps, 1.6 * fps);
  const ghost = ramp(frame, ghostAt, 0.5 * fps);
  const dusty = 1 - ramp(frame, 0, settleAt);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[960, globe.cy]} to={1.04}>
        <Svg>
          <Globe {...globe} bare shade={0.36}>
            {LANDS.map(({ at, d }) => (
              <g key={at} transform={`translate(${at + slosh} 0)`}>
                {/* A terra seca de agora, e a espuma na beira. */}
                <path
                  d={d}
                  transform={`scale(${mix(1, SETTLED.wide, moved)} ${mix(1, SETTLED.tall, moved)})`}
                  fill={earth.land}
                  stroke={earth.waterLight}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                />
              </g>
            ))}
            {/* O contorno de antes, que não se mexe. */}
            {LANDS.map(({ at, d }) => (
              <path
                key={at}
                d={d}
                transform={`translate(${at} 0)`}
                fill="none"
                stroke={earth.ghost}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeDasharray="5 5"
                opacity={ghost}
              />
            ))}
          </Globe>
          {/* A poeira do primeiro dia, baixando em volta da Terra. */}
          <circle cx={globe.cx} cy={globe.cy} r={globe.r + 16} fill="none" stroke={storm.dust} strokeWidth={30} opacity={0.14 * dusty} />
          {Array.from({ length: 34 }, (_, index) => {
            const pick = (trait: string) => random(`after-dust-${trait}-${index}`);
            const turn = pick("turn") * Math.PI * 2;
            const reach = globe.r * (0.5 + 0.72 * pick("reach"));
            return (
              <circle
                key={index}
                cx={globe.cx + reach * Math.cos(turn) + 5 * k * wave(seconds, 4, pick("phase"))}
                cy={globe.cy + reach * Math.sin(turn) + (16 + 30 * pick("fall")) * seconds}
                r={5 + 9 * pick("size")}
                fill={pick("tone") > 0.5 ? storm.dust : storm.dustDeep}
                opacity={(0.3 + 0.4 * pick("opacity")) * dusty}
              />
            );
          })}
          <Lever {...lever} on={0} />
        </Svg>
      </Push>
    </Frame>
  );
};

export const AfterTheDustScene: React.FC<SceneProps> = ({ scene, shots }) => (
  // O desenho da troca de experimento (a alavanca religada, depois baixada aos poucos) ainda
  // não existe: até lá, o plano antigo cobre os dois do roteiro.
  <Shot range={{ from: shots[0].from, to: shots[1].to }} name="o mar assenta em outro lugar">
    <NewWaterline settleAt={cue(scene, "enfim")} ghostAt={cue(scene, "mar")} />
  </Shot>
);
