import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { popOpacity, popScale } from "../../../components/Pop";
import { mix } from "../../../components/timing";
import { HEIGHT, WIDTH } from "../../../format";
import { earth, home, ink } from "../palette";
import { Kitchen, KITCHEN } from "./Kitchen";
import { Svg } from "./kit";

/**
 * O ônibus-cozinha: a cozinha da Vigília em corte, dentro de uma casca que é
 * casa (`wheels` 0: telhado de duas águas, assentada no chão) ou ônibus
 * (`wheels` 1: teto baixo, saia, rodas e a estrada passando por baixo). O que
 * está dentro é o mesmo nos dois: é isso que faz a comparação da narração ser
 * com a casa de quem assiste. `feel-nothing` faz a passagem; `the-rule` freia.
 *
 * Tudo é desenhado nas medidas da cozinha (1920×1080) e encolhido junto por
 * `view`; o que as cenas põem por cima (`over`) usa as mesmas medidas.
 */

/** Onde a cozinha fica no quadro: assentada como casa, e mais aberta, com lugar para as rodas e a estrada. */
export const BUS_VIEW = {
  house: { scale: 0.76, left: 230, top: 152 },
  road: { scale: 0.7, left: 240, top: 118 },
} as const;

export type BusView = { readonly scale: number; readonly left: number; readonly top: number };

/** O enquadramento a caminho de casa (0) para ônibus (1). */
export const busView = (t: number): BusView => ({
  scale: mix(BUS_VIEW.house.scale, BUS_VIEW.road.scale, t),
  left: mix(BUS_VIEW.house.left, BUS_VIEW.road.left, t),
  top: mix(BUS_VIEW.house.top, BUS_VIEW.road.top, t),
});

/** Um ponto da cozinha em pixels do quadro: para a etiqueta presa a algo lá dentro. */
export const busPoint = (view: BusView, x: number, y: number): readonly [number, number] => [
  view.left + view.scale * x,
  view.top + view.scale * y,
];

const WALL = 30;
// A altura do telhado da casa e a do teto do ônibus, acima da parede.
const ROOF = { house: 112, bus: 78 } as const;
// Quanto a casa sobe para caber sobre as rodas, o raio delas e onde ficam.
const RIDE = 110;
const WHEEL = { r: 96, at: [330, 1600] } as const;
const SKIRT = 62;
// A cabine, que cresce da parede da frente: a largura dela e, de cima a baixo, o para-brisa.
const CAB = { width: 150, glass: [70, 560] } as const;
// Quanto a estrada anda por quadro, nas medidas da cozinha: o passo de quem viaja.
export const BUS_SPEED = 14;

/** A altura do meio do telhado, para a seta que a casa inteira leva. */
export const roofMid = (wheels: number): number => -WALL - mix(ROOF.house, ROOF.bus, wheels) / 2;

// O velocímetro na parede: o mesmo lugar de `how-fast`. Aceso e sem número: a cozinha é em São Paulo,
// e o número dela só chega em `by-latitude`. Marca um pouco abaixo do equador, que fecha `how-fast` em 0,85.
export const BUS_GAUGE = { x: 300, y: 470, r: 150, value: 0.76 } as const;
// Onde a etiqueta "comparação" fica, nas medidas da cozinha: na parede, acima do velocímetro.
export const BUS_CAVEAT = [300, 150] as const;

/** O comprimento de toda seta para leste. */
export const FLOW_LENGTH = 400;
const ARROW = { length: FLOW_LENGTH, width: 18 } as const;

type FlowProps = {
  /** O começo da seta, na medida da cozinha. */
  readonly x: number;
  readonly y: number;
  /** O quadro em que ela entra. */
  readonly at: number;
  /** O comprimento: encolhe até sumir quando aquilo que a leva para. */
  readonly length?: number;
  readonly color?: string;
};

/**
 * A seta para leste que cada coisa leva: todas do mesmo tamanho, e os traços
 * de todas correm no mesmo passo, que é o que diz "juntos, na mesma velocidade".
 * Quem continua depois da freada fica com a mesma seta, no mesmo passo.
 */
export const Flow: React.FC<FlowProps> = ({ x, y, at, length = ARROW.length, color = ink.dark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = ARROW.width * 2.2;
  if (length < head * 1.6) {
    return null;
  }
  return (
    <g
      opacity={popOpacity(frame, at, 0.3 * fps)}
      transform={`translate(${x} ${y}) scale(${popScale(frame, at, 0.3 * fps)})`}
    >
      <line
        x1={0}
        y1={0}
        x2={length - head}
        y2={0}
        stroke={color}
        strokeWidth={ARROW.width}
        strokeDasharray="46 26"
        strokeDashoffset={-frame * 5}
      />
      <path
        d={`M${length},0 L${length - head * 1.6},${-head * 0.8} L${length - head * 1.6},${head * 0.8} Z`}
        fill={color}
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

// As faixas da estrada: o que passa para trás e mostra que o ônibus anda.
const LANE = { every: 320, length: 130 } as const;

type BusProps = {
  readonly view: BusView;
  /** De 0 (a casa, no chão) a 1 (o ônibus, sobre as rodas). Um pouco acima de 1 é a sobra da entrada. */
  readonly wheels: number;
  /** Quanto o ônibus já andou, nas medidas da cozinha: gira as rodas e faz a estrada passar. Parado, não muda. */
  readonly travelled?: number;
  /** Quanto a frente afunda na freada, em graus. */
  readonly pitch?: number;
  /** Quanto a cortina se afasta da vertical, em graus. */
  readonly curtain?: number;
  /** Sem o chão da rua nem a estrada: o ônibus solto, fora do lugar dele. */
  readonly afloat?: boolean;
  /** O que vai por cima da casca, fora da cozinha (a seta do telhado), nas medidas da cozinha. */
  readonly over?: React.ReactNode;
  /** O que está na cozinha, dentro do SVG dela. */
  readonly children?: React.ReactNode;
};

export const Bus: React.FC<BusProps> = ({
  view,
  wheels,
  travelled = 0,
  pitch = 0,
  curtain,
  afloat = false,
  over,
  children,
}) => {
  const shown = Math.min(1, Math.max(0, wheels));
  const ride = RIDE * wheels;
  const ground = HEIGHT + ride;
  const r = WHEEL.r * wheels;
  const roof = mix(ROOF.house, ROOF.bus, shown);
  // O beiral da casa some e as águas do telhado ficam em pé: o teto do ônibus.
  const eave = mix(70, 0, shown);
  const inset = mix(80, 26, shown);
  const skirtTop = HEIGHT + WALL / 2;
  const skirt = SKIRT * shown;
  const cab = CAB.width * shown;
  const turned = (travelled / WHEEL.r) * (180 / Math.PI);
  const slid = (every: number) => -(((travelled % every) + every) % every);
  return (
    <div
      style={{
        position: "absolute",
        left: view.left,
        top: view.top,
        width: WIDTH,
        height: HEIGHT,
        transformOrigin: "0 0",
        scale: `${view.scale}`,
      }}
    >
      {afloat ? null : (
        <Svg>
          {/* O chão da rua, que vira a estrada. */}
          <rect x={-700} y={ground} width={WIDTH + 1400} height={420} fill={home.contact} />
          <g opacity={shown} fill={home.floor}>
            {Array.from({ length: 12 }, (_, index) => (
              <rect
                key={index}
                x={-700 + index * LANE.every + slid(LANE.every)}
                y={ground + 78}
                width={LANE.length}
                height={16}
                rx={8}
              />
            ))}
          </g>
        </Svg>
      )}
      {/* A casca e o que está nela: na freada, a frente afunda em volta da roda da frente. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${WHEEL.at[1]}px ${ground}px`,
          rotate: `${pitch}deg`,
        }}
      >
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Kitchen sun={0.72} sunAt={0.7} curtain={curtain} outside={<SeaOutside />}>
            {children}
          </Kitchen>
        </AbsoluteFill>
        <Svg>
          {/* A cabine: a frente arredondada, com o para-brisa. Sem motorista: o vídeo não ganha outro rosto. */}
          {cab > 0 ? (
            <>
              <path
                d={`M${WIDTH},${-WALL} L${WIDTH + WALL + cab * 0.5},${-WALL} Q${WIDTH + WALL + cab},${-WALL} ${WIDTH + WALL + cab},${CAB.width} L${WIDTH + WALL + cab},${skirtTop + skirt} L${WIDTH},${skirtTop + skirt} Z`}
                fill={home.houseWall}
              />
              <path
                d={`M${WIDTH + WALL},${CAB.glass[0]} L${WIDTH + WALL + cab * 0.5},${CAB.glass[0]} Q${WIDTH + WALL + cab * 0.8},${CAB.glass[0]} ${WIDTH + WALL + cab * 0.8},${CAB.glass[0] + 90} L${WIDTH + WALL + cab * 0.8},${CAB.glass[1]} L${WIDTH + WALL},${CAB.glass[1]} Z`}
                fill={home.sky[0]}
              />
              <circle cx={WIDTH + WALL + cab * 0.62} cy={HEIGHT - 110} r={26 * shown} fill={ink.accent} />
              <rect x={WIDTH + WALL + cab - 30} y={skirtTop + skirt * 0.35} width={52 * shown} height={skirt * 0.65} rx={12} fill={home.frameShade} />
            </>
          ) : null}
          {/* A saia do ônibus, com a lanterna atrás. */}
          {skirt > 0 ? (
            <>
              <rect x={-WALL} y={skirtTop} width={WIDTH + 2 * WALL} height={skirt} fill={home.houseWall} />
              <rect x={-WALL} y={skirtTop + skirt * 0.5} width={WIDTH + 2 * WALL + cab} height={skirt * 0.22} fill={home.roof} />
              <rect x={-WALL - 8} y={HEIGHT - 150} width={16 * shown} height={90} rx={8} fill={home.curtain} />
            </>
          ) : null}
          {/* As paredes e o telhado: o corte da casa. */}
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
            d={`M${-WALL - eave},${-WALL} L${inset},${-WALL - roof} L${WIDTH - inset + cab * 0.6},${-WALL - roof} L${WIDTH + WALL + eave + cab * 0.5},${-WALL} Z`}
            fill={home.roof}
            stroke={home.roof}
            strokeWidth={20 * shown}
            strokeLinejoin="round"
          />
          {/* As rodas: nascem do chão, com a caixa de roda por trás, e giram com o que o ônibus anda. */}
          {r > 0
            ? WHEEL.at.map((x) => {
                const cy = ground - r;
                const arch = r * 1.2;
                return (
                  <g key={x}>
                    <path
                      d={`M${x - arch},${skirtTop + skirt} L${x - arch},${cy} A${arch},${arch} 0 0 1 ${x + arch},${cy} L${x + arch},${skirtTop + skirt} Z`}
                      fill={home.frameShade}
                    />
                    <g transform={`translate(${x} ${cy}) rotate(${turned})`}>
                      <circle r={r} fill={ink.dark} />
                      <circle r={r * 0.56} fill={home.frame} />
                      <g stroke={home.frameShade} strokeWidth={r * 0.16} strokeLinecap="round">
                        <line x1={-r * 0.4} y1={0} x2={r * 0.4} y2={0} />
                        <line x1={0} y1={-r * 0.4} x2={0} y2={r * 0.4} />
                      </g>
                      <circle r={r * 0.16} fill={ink.dark} />
                    </g>
                  </g>
                );
              })
            : null}
          {over}
        </Svg>
      </div>
    </div>
  );
};
