import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { mixPose } from "../../../art/Vigilia";
import { wave } from "../../../components/Idle";
import { popOpacity, popScale } from "../../../components/Pop";
import { cue, ramp } from "../../../components/timing";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, home, ink } from "../palette";
import { CUP, Cup, LOOK_DOWN, Vig } from "../parts/Actor";
import { Gauge } from "../parts/Gauge";
import { Kitchen, KITCHEN } from "../parts/Kitchen";
import { Frame, Push, Svg } from "../parts/kit";
import { alive } from "../parts/SpeedKit";

// A cozinha inteira cabe dentro do quadro, com o telhado em cima e o chão da
// rua embaixo: é o corte da casa. Tudo aqui dentro é desenhado nas medidas da
// cozinha (1920×1080) e encolhido junto.
const CUT = { scale: 0.76, left: 230, top: 152 } as const;
const ROOF = 112;
const WALL = 30;
// O velocímetro da cozinha: o mesmo lugar de `how-fast`. Aceso e sem número: a cozinha é em
// São Paulo, e o número dela só chega em `by-latitude`.
const GAUGE = { x: 300, y: 470, r: 150 } as const;
// A velocidade do chão dela: um pouco abaixo da do equador, que fecha `how-fast` em 0,85.
const GROUND_VALUE = 0.76;

const ARROW = { length: 400, width: 18 } as const;

type FlowProps = {
  /** O começo da seta, na medida da cozinha. */
  readonly x: number;
  readonly y: number;
  /** O quadro em que ela entra. */
  readonly at: number;
};

/**
 * A seta para leste que cada coisa leva: todas do mesmo tamanho, e os traços
 * de todas correm no mesmo passo, que é o que diz "juntos, na mesma velocidade".
 */
const Flow: React.FC<FlowProps> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = ARROW.width * 2.2;
  return (
    <g
      opacity={popOpacity(frame, at, 0.3 * fps)}
      transform={`translate(${x} ${y}) scale(${popScale(frame, at, 0.3 * fps)})`}
    >
      <line
        x1={0}
        y1={0}
        x2={ARROW.length - head}
        y2={0}
        stroke={ink.dark}
        strokeWidth={ARROW.width}
        strokeDasharray="46 26"
        strokeDashoffset={-frame * 5}
      />
      <path
        d={`M${ARROW.length},0 L${ARROW.length - head * 1.6},${-head * 0.8} L${ARROW.length - head * 1.6},${head * 0.8} Z`}
        fill={ink.dark}
      />
    </g>
  );
};

/** O mar pela janela: a faixa de água, com as cristas num vaivém pequeno. */
const SeaOutside: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = KITCHEN.window;
  const level = w.y + w.height * 0.66;
  return (
    <>
      <rect x={w.x} y={level} width={w.width} height={w.y + w.height - level} fill={earth.water} />
      {[0.12, 0.38, 0.62, 0.86].map((at, index) => (
        <path
          key={index}
          d={`M${w.x + w.width * at - 44},${level + 34 + (index % 2) * 54} q22,-16 44,0 q22,16 44,0`}
          fill="none"
          stroke={earth.waterLight}
          strokeWidth={8}
          strokeLinecap="round"
          transform={`translate(${6 * wave(frame / fps, 3.2, index / 4)} 0)`}
        />
      ))}
    </>
  );
};

type Props = {
  /** O quadro em que cada coisa ganha a seta: o chão, o ar, o mar, a casa. */
  readonly at: readonly [number, number, number, number];
  /** Quando a fala chega em "mesma velocidade" e em "sem acelerar". */
  readonly sameAt: number;
  readonly smoothAt: number;
};

/** A cozinha em corte, como um vagão: chão, ar, mar e casa levam a mesma seta, e o café não faz uma onda. */
const Together: React.FC<Props> = ({ at, sameAt, smoothAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Em "sem acelerar nem frear" ela olha o café: liso.
  const watching = ramp(frame, smoothAt, 0.5 * fps);
  const w = KITCHEN.window;
  return (
    <Frame
      backdrop={<AbsoluteFill style={{ background: `linear-gradient(${home.sky[0]}, ${home.sky[1]})` }} />}
    >
      <Push>
        <div
          style={{
            position: "absolute",
            left: CUT.left,
            top: CUT.top,
            width: WIDTH,
            height: HEIGHT,
            transformOrigin: "0 0",
            scale: `${CUT.scale}`,
          }}
        >
          <AbsoluteFill style={{ overflow: "hidden" }}>
            <Kitchen sun={0.72} sunAt={0.7} outside={<SeaOutside />}>
              <g transform={`translate(${GAUGE.x} ${GAUGE.y}) scale(${popScale(frame, sameAt, 0.3 * fps, 1, 1.1)})`}>
                <Gauge x={0} y={0} r={GAUGE.r} value={GROUND_VALUE} lit />
              </g>
              <Vig
                x={KITCHEN.stand[0]}
                y={KITCHEN.stand[1]}
                scale={3.4}
                pose={alive(mixPose(CUP, LOOK_DOWN, watching), frame / fps, "vigilia")}
                shadow={home.contact}
                held={<Cup steam={frame / 9} />}
              />
              {/* O ar: entre ela e a cortina, que não se mexe. */}
              <Flow x={470} y={290} at={at[1]} />
              {/* O mar, no vidro. */}
              <Flow x={w.x + 120} y={w.y + w.height * 0.84} at={at[2]} />
              {/* O chão. */}
              <Flow x={1060} y={KITCHEN.floor + 96} at={at[0]} />
            </Kitchen>
          </AbsoluteFill>
          {/* O corte: as paredes, o telhado e o chão da rua. */}
          <Svg>
            <rect x={-420} y={HEIGHT} width={WIDTH + 840} height={260} fill={home.contact} />
            <rect
              x={-WALL / 2}
              y={-WALL / 2}
              width={WIDTH + WALL}
              height={HEIGHT + WALL}
              fill="none"
              stroke={home.houseWall}
              strokeWidth={WALL}
            />
            <path
              d={`M${-WALL - 40},${-WALL} L80,${-WALL - ROOF} L${WIDTH - 80},${-WALL - ROOF} L${WIDTH + WALL + 40},${-WALL} Z`}
              fill={home.roof}
            />
            {/* A casa inteira. */}
            <Flow x={WIDTH / 2 - ARROW.length / 2} y={-WALL - ROOF / 2} at={at[3]} />
          </Svg>
        </div>
      </Push>
    </Frame>
  );
};

export const FeelNothingScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="tudo vai junto">
    <Together
      at={[cue(scene, "solo"), cue(scene, "ar"), cue(scene, "mar"), cue(scene, "casa")]}
      sameAt={cue(scene, "mesma")}
      smoothAt={cue(scene, "sem")}
    />
  </Shot>
);
