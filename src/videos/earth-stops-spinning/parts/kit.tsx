import "../../../design/fonts";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Label } from "../../../components/Label";
import { useShotLength } from "../../../video/Shot";
import { shape, typography } from "../../../design/tokens";
import { HEIGHT, WIDTH } from "../../../format";
import {
  home,
  ice,
  idea,
  ink,
  inside,
  sea,
  sourceSeal,
  space,
  storm,
  tags,
  type IdeaHue,
  type TagTone,
} from "../palette";

/**
 * O que todo plano do vídeo usa: a moldura do plano (fundo, desenho, grão), os
 * fundos de cada modo da ficha visual, a etiqueta, o texto dentro de SVG, a
 * interrogação de "não há número" e a seta.
 */

type FrameProps = {
  /** O fundo do modo do plano: um dos `...Backdrop` daqui. */
  readonly backdrop: React.ReactNode;
  readonly children: React.ReactNode;
};

/** Um plano: o fundo, o que está nele e o grão por cima. */
export const Frame: React.FC<FrameProps> = ({ backdrop, children }) => (
  <AbsoluteFill>
    {backdrop}
    {children}
    <Grain />
  </AbsoluteFill>
);

/** SVG do tamanho do quadro, sem palco: as coordenadas dos filhos são pixels do vídeo. */
export const Svg: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => (
  <AbsoluteFill style={style}>
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} overflow="visible">
      {children}
    </svg>
  </AbsoluteFill>
);

const gradient = (tones: readonly [string, string]) =>
  `linear-gradient(${tones[0]}, ${tones[1]})`;

/** `espaco`: índigo com estrelas, e um clarão do lado de onde o Sol bate. */
export const SpaceBackdrop: React.FC<{
  /** De que lado vem a luz, em fração do quadro; sem valor, não há clarão. */
  readonly light?: readonly [number, number];
  readonly stars?: number;
}> = ({ light, stars = 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  return (
    <AbsoluteFill style={{ background: gradient(space.sky) }}>
      {light ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle 900px at ${light[0] * 100}% ${light[1] * 100}%, ${space.glow}55, transparent)`,
          }}
        />
      ) : null}
      <Svg>
        {Array.from({ length: stars }, (_, index) => {
          const pick = (trait: string) => random(`space-${trait}-${index}`);
          return (
            <circle
              key={index}
              cx={pick("x") * WIDTH}
              cy={pick("y") * HEIGHT}
              r={1 + pick("size") * 2.2}
              fill={space.star}
              opacity={
                0.5 +
                0.35 * Math.sin(seconds * (0.6 + pick("speed")) + pick("phase") * 6.28)
              }
            />
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** `ideia`: um degradê liso, uma mancha clara atrás do assunto e os cantos mais escuros. */
export const IdeaBackdrop: React.FC<{
  readonly hue: IdeaHue;
  readonly spot?: readonly [number, number];
}> = ({ hue, spot = [0.5, 0.45] }) => {
  const colors = idea[hue];
  return (
    <AbsoluteFill style={{ background: gradient([colors.top, colors.bottom]) }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 640px at ${spot[0] * 100}% ${spot[1] * 100}%, ${colors.spot}B3, transparent)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 60%, ${colors.contact}26)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** `tempestade`: o céu de poeira, com riscos de vento correndo para leste (a direita do quadro). */
export const StormBackdrop: React.FC<{
  /** Quanto o vento corre, de 0 (poeira parada) a 1. */
  readonly wind?: number;
  /** A altura do horizonte, em pixels; abaixo dele é chão. Sem valor, só céu. */
  readonly horizon?: number;
}> = ({ wind = 1, horizon }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: gradient(storm.sky) }}>
      <Svg>
        {Array.from({ length: 46 }, (_, index) => {
          const pick = (trait: string) => random(`storm-${trait}-${index}`);
          const length = 120 + pick("length") * 420;
          const speed = (40 + pick("speed") * 70) * wind;
          const x = ((pick("x") * (WIDTH + 800) + frame * speed) % (WIDTH + 800)) - 400;
          return (
            <rect
              key={index}
              x={x - length}
              y={pick("y") * (horizon ?? HEIGHT)}
              width={length}
              height={3 + pick("size") * 7}
              rx={4}
              fill={pick("tone") > 0.5 ? storm.dust : storm.dustDeep}
              opacity={(0.25 + 0.4 * pick("opacity")) * Math.min(1, wind + 0.25)}
            />
          );
        })}
        {horizon === undefined ? null : (
          <>
            <rect x={0} y={horizon} width={WIDTH} height={HEIGHT - horizon} fill={storm.ground} />
            <rect x={0} y={horizon + 40} width={WIDTH} height={HEIGHT} fill={storm.groundShade} opacity={0.5} />
          </>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

/** `gelo`: céu claro, morros de gelo ao longe e o chão branco. */
export const IceBackdrop: React.FC<{ readonly horizon?: number }> = ({ horizon = 700 }) => (
  <AbsoluteFill style={{ background: gradient(ice.sky) }}>
    <Svg>
      <path
        d={`M0,${horizon} L0,${horizon - 60} Q240,${horizon - 150} 520,${horizon - 50} Q760,${horizon - 120} 1080,${horizon - 40} Q1400,${horizon - 140} 1920,${horizon - 70} L1920,${horizon} Z`}
        fill={ice.far}
      />
      <rect x={0} y={horizon} width={WIDTH} height={HEIGHT - horizon} fill={ice.ground} />
      <path
        d={`M0,${horizon + 120} Q500,${horizon + 60} 1000,${horizon + 130} T1920,${horizon + 100} L1920,${HEIGHT} L0,${HEIGHT} Z`}
        fill={ice.groundShade}
        opacity={0.6}
      />
    </Svg>
  </AbsoluteFill>
);

/** `mar`: a água turquesa do mapa e do recife. */
export const SeaBackdrop: React.FC = () => (
  <AbsoluteFill style={{ background: gradient(sea.water) }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, ${sea.deep}66)`,
      }}
    />
  </AbsoluteFill>
);

/** `por-dentro`: o índigo escuro do interior da Terra. */
export const InsideBackdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle 900px at 50% 50%, ${inside.background[0]}, ${inside.background[1]})`,
    }}
  />
);

/** `casa` sem cozinha: a parede quente, para um objeto de casa em close. */
export const HomeBackdrop: React.FC = () => (
  <AbsoluteFill style={{ background: gradient(home.wall) }} />
);

type TagProps = {
  /** A família do fundo: `dark` sobre o espaço e o interior, `light` sobre fundo claro, `warm` sobre a poeira. */
  readonly on: TagTone;
  readonly size?: keyof typeof typography.size;
  readonly children: React.ReactNode;
};

/** A etiqueta do vídeo: uma pílula na cor que combina com o fundo do plano. Posicione com `Place`. */
export const Tag: React.FC<TagProps> = ({ on, size = "note", children }) => (
  <Label size={size} color={tags[on].text} tag={tags[on].fill} radius={999}>
    {children}
  </Label>
);

type SvgTextProps = {
  readonly x: number;
  readonly y: number;
  readonly size?: keyof typeof typography.size | number;
  readonly fill?: string;
  readonly anchor?: "start" | "middle" | "end";
  readonly opacity?: number;
  readonly children: React.ReactNode;
};

/** Texto dentro de um SVG, na fonte do canal: para o número preso ao que mede. */
export const SvgText: React.FC<SvgTextProps> = ({
  x,
  y,
  size = "note",
  fill = ink.paper,
  anchor = "middle",
  opacity,
  children,
}) => (
  <text
    x={x}
    y={y}
    fontFamily={typography.family}
    fontWeight={typography.weight}
    fontSize={typeof size === "number" ? size : typography.size[size]}
    fill={fill}
    textAnchor={anchor}
    dominantBaseline="central"
    opacity={opacity}
  >
    {children}
  </text>
);

/** A interrogação de onde não há número: grande, num disco, balançando um nada. Vai dentro de um SVG. */
export const Question: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly fill?: string;
  readonly color?: string;
}> = ({ x, y, size = 120, fill = tags.dark.fill, color = tags.dark.text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = 6 * Math.sin((frame / fps) * 2.1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt.toFixed(2)})`}>
      <circle r={size / 2} fill={fill} />
      <SvgText x={0} y={size * 0.03} size={size * 0.7} fill={color}>
        ?
      </SvgText>
    </g>
  );
};

/** Uma seta reta de `from` a `to`, com a ponta em triângulo. Vai dentro de um SVG. */
export const Arrow: React.FC<{
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
  readonly color?: string;
  readonly width?: number;
  /** Quanto dela já foi desenhado, de 0 a 1. */
  readonly drawn?: number;
  readonly dashed?: boolean;
  readonly opacity?: number;
}> = ({ from, to, color = ink.accent, width = 12, drawn = 1, dashed = false, opacity = 1 }) => {
  if (drawn <= 0) {
    return null;
  }
  const tip: readonly [number, number] = [
    from[0] + (to[0] - from[0]) * drawn,
    from[1] + (to[1] - from[1]) * drawn,
  ];
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  const head = width * 2.2;
  return (
    <g opacity={opacity}>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={tip[0]}
        y2={tip[1]}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? `${width * 1.5} ${width * 2}` : undefined}
      />
      <path
        d={`M${head},0 L${-head * 0.6},${-head * 0.8} L${-head * 0.6},${head * 0.8} Z`}
        fill={color}
        transform={`translate(${tip[0]} ${tip[1]}) rotate(${angle})`}
      />
    </g>
  );
};

/**
 * O selo da fonte: fica no canto de baixo, à direita, enquanto o plano afirma
 * o que aquele estudo mediu ou calculou. Vai solto dentro do plano, por cima.
 */
export const SourceSeal: React.FC<{
  readonly children: string;
  /** O plano anterior já mostrava este mesmo selo: ele continua lá, sem entrar de novo. */
  readonly steady?: boolean;
}> = ({ children, steady = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: `${shape.safeArea.y * 0.5}px ${shape.safeArea.x * 0.5}px`,
        opacity: steady ? 1 : Math.min(1, Math.max(0, (frame - 0.2 * fps) / (0.4 * fps))),
        pointerEvents: "none",
      }}
    >
      <Label size="seal" color={sourceSeal.text} tag={sourceSeal.fill} radius={999}>
        {children}
      </Label>
    </AbsoluteFill>
  );
};

/**
 * A câmera de um plano: vai do enquadramento `from` ao `to` ao longo do plano
 * inteiro (ou do trecho `progress`, de 0 a 1, que quem chama calcula), em volta
 * do ponto `focus`. Com `from` maior que 1 e `to` 1, chega; com `to` um pouco
 * maior que `from`, é a aproximação lenta que impede o quadro de congelar.
 */
export const Push: React.FC<{
  readonly focus?: readonly [number, number];
  readonly from?: number;
  readonly to?: number;
  readonly progress?: number;
  readonly children: React.ReactNode;
}> = ({ focus = [WIDTH / 2, HEIGHT / 2], from = 1, to = 1.04, progress, children }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const t = progress ?? frame / length;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
        scale: `${from * (to / from) ** Math.min(1, Math.max(0, t))}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
