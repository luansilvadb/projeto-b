import { useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, linear, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, idea, ink, tags } from "../palette";
import { FlungVig } from "../parts/Flung";
import { Globe, House, LatitudeRing } from "../parts/Globe";
import { Arrow, Frame, IdeaBackdrop, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";

// A Terra de lado, tão perto que o chão vira um horizonte curvo: para cima é o
// espaço, e para a direita, leste.
const DOME = { cx: 960, cy: 1720, r: 1120 } as const;
// De onde ela sai e até onde vai, em graus a partir do alto do arco: um trecho
// curto do chão, que cabe inteiro no quadro.
const PATH = { from: -10, to: 21 } as const;
// A terra em que a casa fica, pintada na Terra (em unidades de raio 100): o
// continente do desenho não chega ao alto do arco.
const HOME_LAND =
  "M -56 -104 L 0 -104 C 7 -97 2 -90 -8 -88 C -19 -86 -27 -91 -38 -87 C -48 -84 -58 -92 -56 -104 Z";

/** Um ponto a `height` pixels do chão, a `degrees` do alto do arco. */
const above = (degrees: number, height: number): readonly [number, number] => {
  const turn = (degrees * Math.PI) / 180;
  return [
    DOME.cx + (DOME.r + height) * Math.sin(turn),
    DOME.cy - (DOME.r + height) * Math.cos(turn),
  ];
};

// A curva dela, pelo meio do corpo: rasa, colada ao chão, e não um arco de
// bala. O que a leva é o embalo para leste; para cima ela quase não vai.
const flightPoint = (u: number) =>
  above(PATH.from + (PATH.to - PATH.from) * u, 74 + 34 * Math.sin(Math.PI * u));

/** A Vigília sai rente ao chão, para leste; a seta para o espaço é riscada. */
const LowCurve: React.FC<{ readonly spaceAt: number; readonly strikeAt: number }> = ({
  spaceAt,
  strikeAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Ela leva o plano inteiro no caminho: o assunto não sai de quadro antes do corte.
  const length = useShotLength();
  const flown = linear(frame, 0.15 * fps, length - 0.3 * fps);
  const [x, y] = flightPoint(flown);
  const steps = Math.ceil(flown * 40);
  const trail = Array.from({ length: steps + 1 }, (_, index) =>
    flightPoint((flown * index) / Math.max(1, steps)).join(","),
  ).join(" ");
  const home = above(PATH.from, 0);
  const up = [above(PATH.from, 120), above(PATH.from, 540)] as const;
  const cross = above(PATH.from, 350);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.9, 0.1]} />}>
      <Push focus={[960, 640]} to={1.04}>
        <Svg>
          <Globe {...DOME} spin={0.08} caps={false} shade={0.16}>
            <path d={HOME_LAND} fill={earth.land} />
          </Globe>
          <House x={home[0]} y={home[1]} size={86} rotate={PATH.from} />
          {/* O caminho que ela fez fica desenhado: baixo, acompanhando o chão. */}
          <polyline
            points={trail}
            fill="none"
            stroke={ink.accent}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray="4 26"
          />
          <FlungVig
            x={x}
            y={y + 70}
            scale={1}
            tumble={PATH.from + (PATH.to - PATH.from) * flown + 30 * flown}
          />
          {/* O caminho que não acontece: para cima, rumo ao espaço. */}
          <Arrow
            from={up[0]}
            to={up[1]}
            color={ink.paper}
            width={12}
            dashed
            drawn={settle(frame, spaceAt, 0.35 * fps)}
          />
          <g
            transform={`translate(${cross[0]} ${cross[1]}) scale(${popScale(frame, strikeAt, 0.3 * fps)})`}
            opacity={popOpacity(frame, strikeAt, 0.3 * fps)}
            stroke={ink.stop}
            strokeWidth={22}
            strokeLinecap="round"
          >
            <path d="M-62,-62 L62,62 M62,-62 L-62,62" />
          </g>
        </Svg>
      </Push>
    </Frame>
  );
};

// A régua das duas velocidades: onde é o zero, e quantos pixels vale 1 km/s.
const RULE = { zero: 380, perKm: 122, escape: 11, spin: 0.47, thick: 54 } as const;

/** Uma seta cheia da régua, do zero até `value`, com a ponta exatamente no valor. */
const Speed: React.FC<{
  readonly y: number;
  readonly value: number;
  readonly color: string;
}> = ({ y, value, color }) => {
  if (value <= 0) {
    return null;
  }
  const tip = RULE.zero + value * RULE.perKm;
  const neck = Math.max(RULE.zero, tip - RULE.thick);
  return (
    <path
      d={`M${RULE.zero},${y - RULE.thick / 2} L${neck},${y - RULE.thick / 2} L${neck},${y - RULE.thick} L${tip},${y} L${neck},${y + RULE.thick} L${neck},${y + RULE.thick / 2} L${RULE.zero},${y + RULE.thick / 2} Z`}
      fill={color}
      strokeLinejoin="round"
    />
  );
};

type TwoSpeedsProps = {
  /** Os quadros entre os quais a seta de escape cresce, e o do número dela. */
  readonly escape: readonly [from: number, to: number, label: number];
  /** O quadro em que o toco do giro sai, o do número dele, e o quadro em que ele desiste de crescer. */
  readonly spin: readonly [from: number, label: number, rest: number];
};

// De quanto em quanto tempo o toco toma impulso, em segundos, e quanto recua para tomá-lo.
const STRAIN = { seconds: 0.9, back: 0.3 } as const;

/** As duas velocidades na mesma régua: a de escape, comprida, e a do giro, um toco. */
const TwoSpeeds: React.FC<TwoSpeedsProps> = ({ escape, spin }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // O toco tenta crescer: recua, investe, treme na marca dele e não passa. Em "equador", desiste.
  const trying = frame >= spin[0] + 0.3 * fps && frame < spin[2];
  const beat = trying ? Math.sin((((frame - spin[0]) / fps / STRAIN.seconds) % 1) * Math.PI * 2) : 0;
  const stub = RULE.spin * settle(frame, spin[0], 0.3 * fps) * (1 - STRAIN.back * Math.max(0, beat));
  const shiver = 4 * Math.max(0, -beat) * Math.sin(frame * 2.6);
  const rows = { escape: 390, rule: 590, spin: 790 } as const;
  const colors = idea.lilac;
  return (
    <Frame backdrop={<IdeaBackdrop hue="lilac" />}>
      <Push to={1.03}>
        <Svg>
          {/* A régua, entre as duas: um traço por quilômetro por segundo, sem número. */}
          <rect x={RULE.zero - 6} y={rows.rule - 5} width={RULE.escape * RULE.perKm + 12} height={10} rx={5} fill={colors.contact} opacity={0.5} />
          {Array.from({ length: RULE.escape + 1 }, (_, index) => (
            <rect
              key={index}
              x={RULE.zero + index * RULE.perKm - 4}
              y={rows.rule - 24}
              width={8}
              height={48}
              rx={4}
              fill={colors.contact}
              opacity={0.5}
            />
          ))}
          {/* Escapar da Terra: a seta que sai dela e atravessa a régua. */}
          <Globe cx={210} cy={rows.escape} r={96} spin={0.1} shade={0.2} />
          {/* Ela leva a frase inteira para chegar a onze: a régua é comprida. */}
          <Speed y={rows.escape} value={RULE.escape * ramp(frame, escape[0], escape[1] - escape[0])} color={tags.light.fill} />
          {/* O giro: a Terra rodando, e o toco que ele dá. */}
          <Globe cx={210} cy={rows.spin} r={96} spin={frame / fps / 6} shade={0.2} />
          <LatitudeRing cx={210} cy={rows.spin} r={96} lat={0} color={ink.accent} width={7} runner={frame / fps / 6} />
          <Speed y={rows.spin + shiver} value={stub} color={ink.stop} />
          <rect x={RULE.zero - 5} y={rows.escape - 90} width={10} height={rows.spin - rows.escape + 180} rx={5} fill={earth.shade} opacity={0.55} />
        </Svg>
      </Push>
      <Place x={RULE.zero + RULE.escape * RULE.perKm - 150} y={rows.escape - 130}>
        <Pop at={escape[2]}>
          <Tag on="light" size="label">
            11 km/s
          </Tag>
        </Pop>
      </Place>
      <Place x={RULE.zero + 330} y={rows.spin}>
        <Pop at={spin[1]}>
          <Tag on="light" size="label">
            0,47 km/s
          </Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

export const NotToSpaceScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="para leste, não para cima">
      <LowCurve spaceAt={cue(scene, "nunca")} strikeAt={cue(scene, "espaço")} />
    </Shot>
    <Shot range={shots[1]} name="escape e giro na mesma régua">
      <TwoSpeeds
        escape={[
          cue(scene, "escapar") - shots[1].from,
          cue(scene, "preciso") - shots[1].from + 12,
          cue(scene, "gravidade") - shots[1].from,
        ]}
        spin={[
          cue(scene, "solo", 2) - shots[1].from,
          cue(scene, "gira") - shots[1].from,
          cue(scene, "equador") - shots[1].from,
        ]}
      />
    </Shot>
  </>
);
