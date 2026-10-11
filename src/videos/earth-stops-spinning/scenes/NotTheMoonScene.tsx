import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { clamp01, cue, mix, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { blockDay, earth, ink, space } from "../palette";
import { GLOBE_ROW, GlobeRow, GROWING_SLOT, NightSide } from "../parts/ClimateGlobes";
import { MOON_LEVELS, Thermometer } from "../parts/ClimateThermometer";
import { Globe } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, Question, SourceSeal, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { Moon, SunDisc } from "../parts/Sky";

type Disc = { readonly cx: number; readonly cy: number; readonly r: number };

/** Meio disco: o lado claro (`side` -1, a esquerda) ou o escuro (1). */
const Half: React.FC<Disc & { readonly side: -1 | 1; readonly fill: string; readonly opacity: number }> = ({
  cx,
  cy,
  r,
  side,
  fill,
  opacity,
}) => (
  <path
    d={`M0,${-r} A${r},${r} 0 0 ${side === 1 ? 1 : 0} 0,${r} Z`}
    transform={`translate(${cx} ${cy})`}
    fill={fill}
    opacity={opacity}
  />
);

// Quanto a camada de ar passa do chão, em fração do raio.
const AIR = 1.14;

// A Terra parada, de lado, com a luz vindo da esquerda: o lado claro e o
// escuro são metades, como na Lua.
const StillEarth: React.FC<
  Disc & {
    /** Quanto da camada de ar já apareceu, de 0 a 1. */
    readonly air: number;
    /** Quanto o lado claro já esquentou e o escuro já esfriou, de 0 a 1: só cor, sem número. */
    readonly hot?: number;
    readonly cold?: number;
  }
> = ({ cx, cy, r, air, hot = 0, cold = 0 }) => (
  <>
    <circle cx={cx} cy={cy} r={r * (0.94 + (AIR - 0.94) * air)} fill={earth.air} opacity={0.3 * Math.min(1, air)} />
    {/*
      O ar de cada lado toma a cor do lado: é nele que o calor e o frio ficam à vista. Sobre o chão a
      tinta é pouca, porque laranja em cima do azul do mar dá cinza.
    */}
    <Half cx={cx} cy={cy} r={r * AIR} side={-1} fill={ink.hot} opacity={0.7 * hot} />
    <Half cx={cx} cy={cy} r={r * AIR} side={1} fill={ink.cold} opacity={0.6 * cold} />
    <Globe cx={cx} cy={cy} r={r} spin={0.06} shade={0} />
    <NightSide cx={cx} cy={cy} r={r} />
    <Half cx={cx} cy={cy} r={r} side={-1} fill={ink.hot} opacity={0.2 * hot} />
    <Half cx={cx} cy={cy} r={r} side={1} fill={ink.cold} opacity={0.18 * cold} />
  </>
);

const PAIR = {
  moon: { cx: 440, cy: 560, r: 250 },
  earth: { cx: 1330, cy: 560, r: 330 },
  base: 850,
  height: 560,
} as const;

type PairProps = {
  /** Os quadros da fala: o ar aparece, os termômetros da Terra entram vazios, as interrogações. */
  readonly at: readonly [number, number, number];
};

/**
 * A Lua e a Terra parada sob a mesma luz. A Lua já chega com o termômetro e os
 * dois números da cena anterior; a Terra ganha o ar, que a Lua não tem, e dois
 * termômetros sem marcação: ninguém rodou esse caso, e o que há é interrogação.
 */
const MoonAndStillEarth: React.FC<PairProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { moon, earth: globe, base, height } = PAIR;
  // A coluna da Lua vai e volta entre os dois extremos que ela mede.
  const swing = 0.5 + 0.5 * wave(frame / fps, 5, 0.25);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.5]} />}>
      <Push focus={[960, 560]} from={1.12} to={1} progress={ramp(frame, 0, 0.6 * fps)}>
        <Push focus={[globe.cx, globe.cy]} to={1.04}>
          <Svg>
            <Moon {...moon} night={0} />
            <StillEarth {...globe} air={popScale(frame, at[0], 0.4 * fps, 0)} />
            <Thermometer
              x={moon.cx + 110}
              y={base}
              height={height}
              level={mix(MOON_LEVELS.night, MOON_LEVELS.day, swing)}
              marks={[
                { at: MOON_LEVELS.day, text: "120 °C" },
                { at: MOON_LEVELS.night, text: "−130 °C" },
              ]}
            />
            {/* Um no lado claro, outro no escuro: nenhum dos dois tem leitura. */}
            {([-1, 1] as const).map((side) => {
              const x = globe.cx + side * 170 - 50;
              const later = (side + 1) * 3;
              return (
                <g key={side}>
                  {/* Cresce do pé, como o que é fincado. */}
                  <g
                    transform={`translate(${x} ${base}) scale(${popScale(frame, at[1] + later, 0.3 * fps, 0)}) translate(${-x} ${-base})`}
                  >
                    <Thermometer x={x} y={base} height={height} />
                  </g>
                  <g
                    opacity={popOpacity(frame, at[2] + later, 0.3 * fps)}
                    transform={`translate(${x + 128} ${base - height * 0.56}) scale(${popScale(frame, at[2] + later, 0.3 * fps)})`}
                  >
                    <Question x={0} y={0} size={132} />
                  </g>
                </g>
              );
            })}
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

// A Terra do plano anterior, no fim da aproximação dele, e onde ela para neste: sozinha, no meio.
const NEAR = { from: { cx: 1330, cy: 560, r: 343 }, to: { cx: 960, cy: 452, r: 320 } } as const;

type WayProps = {
  /** Os quadros em que a fala diz que o dia esquenta e que a noite esfria. */
  readonly at: readonly [number, number];
};

/** O lado para onde a coisa vai, sem número: o lado claro esquenta e o escuro esfria, só na cor. */
const WhichWay: React.FC<WayProps> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A câmera vai até a Terra: os termômetros e a Lua ficam para trás.
  const arrived = settle(frame, 0, 0.7 * fps);
  const globe = {
    cx: mix(NEAR.from.cx, NEAR.to.cx, arrived),
    cy: mix(NEAR.from.cy, NEAR.to.cy, arrived),
    r: mix(NEAR.from.r, NEAR.to.r, arrived),
  };
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.5]} />}>
      <Push focus={[NEAR.to.cx, NEAR.to.cy]} to={1.04}>
        <Svg>
          <StillEarth
            {...globe}
            air={1}
            hot={ramp(frame, at[0], 1.2 * fps)}
            cold={ramp(frame, at[1], 1.2 * fps)}
          />
        </Svg>
      </Push>
      {/* As duas pílulas do dia e da noite da Lua: amarela debaixo do lado claro, branca debaixo do escuro. */}
      <Place x={NEAR.to.cx - 440} y={916}>
        <Pop at={at[0] + 0.2 * fps}>
          <Tag on="dark">mais quente que hoje</Tag>
        </Pop>
      </Place>
      <Place x={NEAR.to.cx + 440} y={916}>
        <Pop at={at[1] + 0.2 * fps}>
          <Tag on="note">mais frio que hoje</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

// O globo de 128 dias sai da fileira, vai ao meio do quadro e cresce: o ponto
// fixo da câmera sai dessa conta.
const GROWN = { cx: 960, cy: 486, r: 320 } as const;
const ZOOM = GROWN.r / GLOBE_ROW.r;
const ZOOM_FOCUS = [
  (ZOOM * GROWING_SLOT.x - GROWN.cx) / (ZOOM - 1),
  (ZOOM * GLOBE_ROW.y - GROWN.cy) / (ZOOM - 1),
] as const;

// O laço do ar, numa faixa em volta do equador: o caminho de volta corre na
// linha do equador, rente ao chão, e o de ida, acima dele e um pouco para fora
// do globo. Passar os arcos por fora do disco leria como vento dando a volta
// pelos polos.
/** A metade de cá de um círculo em volta do globo, visto de lado: a elipse e a altura em que ela fica. */
const LOW = { rx: GROWN.r, ry: GROWN.r * 0.16, y: GROWN.cy } as const;
const HIGH = { rx: GROWN.r * 1.13, ry: GROWN.r * 0.18, y: GROWN.cy - GROWN.r * 0.42 } as const;

/** Um ponto do arco, com `along` de 0 (a borda do lado claro) a 1 (a do lado escuro). */
const onArc = (arc: typeof LOW | typeof HIGH, along: number): readonly [number, number] => [
  GROWN.cx - arc.rx * Math.cos(Math.PI * along),
  arc.y + arc.ry * Math.sin(Math.PI * along),
];

// O quente sobe no lado claro, atravessa por cima e desce no escuro; o frio volta por baixo, de ponta a ponta.
const HOT_PATH = `M${onArc(LOW, 0)} L${onArc(HIGH, 0)} A${HIGH.rx},${HIGH.ry} 0 0 0 ${onArc(HIGH, 1)} L${onArc(LOW, 1)}`;
const COLD_PATH = `M${onArc(LOW, 1)} A${LOW.rx},${LOW.ry} 0 0 1 ${onArc(LOW, 0)}`;
// Quanto do caminho quente é a subida e a travessia: o resto é a descida, que espera a palavra dela.
const HOT_ACROSS = 0.87;

/** O laço do ar: o quente sobe, atravessa por cima e desce; o frio volta junto ao chão e fecha o laço. */
const AirLoop: React.FC<{
  readonly hot: number;
  readonly cold: number;
  /** O tempo, em segundos, das contas que correm pelo laço. */
  readonly seconds: number;
  readonly opacity: number;
}> = ({ hot, cold, seconds, opacity }) => {
  const over = onArc(HIGH, 0.5);
  const back = onArc(LOW, 0.5);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Por baixo de cada traço, o mesmo traço mais largo e escuro: é o que o separa do mar, da terra e do fundo. */}
      {[
        { stroke: space.sky[0], strokeWidth: 30, opacity: 0.55 },
        { stroke: undefined, strokeWidth: 16, opacity: 1 },
      ].map(({ stroke, strokeWidth, opacity: layer }) => (
        <g key={strokeWidth} strokeWidth={strokeWidth} opacity={layer}>
          {hot > 0 ? (
            <path d={HOT_PATH} stroke={stroke ?? ink.hot} pathLength={1} strokeDasharray={`${hot} 1`} />
          ) : null}
          {cold > 0 ? (
            <path d={COLD_PATH} stroke={stroke ?? ink.cold} pathLength={1} strokeDasharray={`${cold} 1`} />
          ) : null}
          {/* As pontas dizem o sentido: por cima, do claro para o escuro; por baixo, de volta. */}
          <path
            d="M-18,-24 L22,0 L-18,24"
            stroke={stroke ?? ink.hot}
            transform={`translate(${over})`}
            opacity={clamp01(hot * 3 - 1.2)}
          />
          <path
            d="M18,-24 L-22,0 L18,24"
            stroke={stroke ?? ink.cold}
            transform={`translate(${back})`}
            opacity={clamp01(cold * 3 - 1.2)}
          />
        </g>
      ))}
      {[0, 1, 2].map((bead) => {
        const along = (seconds / 2.6 + bead / 3) % 1;
        const up = onArc(HIGH, along);
        const down = onArc(LOW, 1 - along);
        return (
          <g key={bead} stroke="none" opacity={Math.sin(Math.PI * along)}>
            <circle cx={up[0]} cy={up[1]} r={13} fill={space.sunCore} opacity={clamp01(hot * 2 - 1)} />
            <circle cx={down[0]} cy={down[1]} r={13} fill={ink.paper} opacity={clamp01(cold * 2 - 1)} />
          </g>
        );
      })}
    </g>
  );
};

// O escudo de nuvens, visto de lado: empilhado sobre o ponto onde o Sol bate,
// que nesta vista é a borda esquerda do globo. Cada bola: o ângulo em graus a
// partir desse ponto, a distância do centro em raios e o raio dela, em pixels.
// A barriga, escura, fica virada para o chão; o topo, claro, para o Sol.
const BELLY: readonly (readonly [number, number, number])[] = [
  [-27, 1.0, 44],
  [-13, 1.02, 52],
  [0, 1.03, 58],
  [13, 1.02, 52],
  [27, 1.0, 44],
];
const CROWN: readonly (readonly [number, number, number])[] = [
  [-32, 1.07, 42],
  [-20, 1.12, 56],
  [-7, 1.16, 64],
  [7, 1.16, 66],
  [20, 1.12, 56],
  [32, 1.07, 42],
  [0, 1.1, 76],
];

type RowProps = {
  /** Os quadros da fala: o globo cresce, o lado claro e o escuro, o ar sobe, chega ao escuro, as nuvens, a sombra. */
  readonly at: readonly [number, number, number, number, number, number];
};

/**
 * A fileira dos modelos de clima, de giros cada vez mais lentos. O de 128 dias
 * cresce e mostra as duas coisas que amenizam o contraste: o ar que leva calor
 * do lado claro ao escuro, e o escudo de nuvens sobre o ponto onde o Sol bate.
 */
const Simulated: React.FC<RowProps> = ({ at }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const grown = ramp(frame, at[0], 1.2 * fps);
  const lit = ramp(frame, at[1], 0.7 * fps);
  // A subida e a travessia duram a frase: o traço chega ao lado escuro quando a fala chega nele.
  const hot =
    HOT_ACROSS * ramp(frame, at[2], Math.max(0.8 * fps, at[3] - at[2])) +
    (1 - HOT_ACROSS) * ramp(frame, at[3], 0.4 * fps);
  // Com a fala real sobra 1 s entre "escuro" e "nuvens": o frio fecha o laço antes de as nuvens entrarem.
  const cold = ramp(frame, at[3] + 0.3 * fps, 0.7 * fps);
  const shade = ramp(frame, at[5], 0.7 * fps);
  const puff = (list: typeof BELLY, fill: string, delay: number) =>
    list.map(([degrees, far, r], index) => {
      const angle = (degrees * Math.PI) / 180;
      // As nuvens respiram na direção do Sol, sem sair de cima do ponto.
      const out = GROWN.r * far + 4 * wave(seconds, 4, index / list.length);
      return (
        <circle
          key={`${fill}-${index}`}
          cx={GROWN.cx - out * Math.cos(angle)}
          cy={GROWN.cy + out * Math.sin(angle)}
          // Incham do meio para as pontas, e depois só respiram.
          r={r * popScale(frame, at[4] + delay + Math.abs(index - (list.length - 1) / 2) * 2, 0.5 * fps, 0)}
          fill={fill}
        />
      );
    });
  return (
    <Frame backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.45]} />}>
      <Push to={1.03}>
        <Svg>
          {/* O Sol entra pela esquerda quando o globo vira o caso em estudo: é dele o lado claro. */}
          <SunDisc cx={mix(-320, 20, lit)} cy={GROWN.cy} r={170} />
        </Svg>
        <Push focus={ZOOM_FOCUS} from={1} to={ZOOM} progress={grown}>
          <GlobeRow
            clock={frame}
            // A fileira já vem entrando no corte: o primeiro globo está inteiro no primeiro quadro.
            enter={GLOBE_ROW.slots.map((_, index) => -9 + index * 0.18 * fps)}
            labels={1 - ramp(frame, at[0] - 0.1 * fps, 0.4 * fps)}
            // Os vizinhos saem de cena enquanto ele cresce: no fim, só ele.
            rest={1 - ramp(frame, at[0], 0.6 * fps)}
          />
        </Push>
        <Svg>
          <defs>
            <clipPath id={id}>
              <circle {...GROWN} />
            </clipPath>
          </defs>
          <NightSide {...GROWN} opacity={0.66 * lit} />
          {/* A sombra do escudo no chão, logo atrás dele para quem vem do Sol. */}
          <ellipse
            cx={GROWN.cx - GROWN.r * 0.74}
            cy={GROWN.cy}
            rx={GROWN.r * 0.3}
            ry={GROWN.r * 0.56}
            fill={earth.shade}
            opacity={0.6 * shade}
            clipPath={`url(#${id})`}
          />
          {/* Com as nuvens em cena o laço recua, mas fica: são as duas coisas juntas. */}
          <AirLoop hot={hot} cold={cold} seconds={seconds} opacity={1 - 0.6 * ramp(frame, at[4], 0.5 * fps)} />
          {puff(BELLY, blockDay.cloudShade, 0)}
          {puff(CROWN, ink.paper, 3)}
        </Svg>
        {/* O globo crescido continua sendo o modelo de 128 dias, e não a Terra parada: a etiqueta fica. */}
        <Place x={GROWN.cx} y={GROWN.cy + GROWN.r + 84}>
          <Pop at={at[0] + 0.9 * fps}>
            <Tag on="light">giro de 128 dias</Tag>
          </Pop>
        </Place>
      </Push>
      <SourceSeal>Way et al., 2018</SourceSeal>
    </Frame>
  );
};

export const NotTheMoonScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a Lua com números, a Terra sem">
      <MoonAndStillEarth at={[cue(scene, "ar"), cue(scene, "nenhuma"), cue(scene, "número")]} />
    </Shot>
    <Shot range={shots[1]} name="para que lado vai">
      <WhichWay at={[cue(scene, "esquentar") - shots[1].from, cue(scene, "esfriar") - shots[1].from]} />
    </Shot>
    <Shot range={shots[2]} name="os globos simulados: o ar e as nuvens">
      <Simulated
        at={[
          cue(scene, "mostram") - shots[2].from,
          cue(scene, "contraste") - shots[2].from,
          cue(scene, "ar", 2) - shots[2].from,
          cue(scene, "escuro") - shots[2].from,
          cue(scene, "nuvens") - shots[2].from,
          cue(scene, "sombra") - shots[2].from,
        ]}
      />
    </Shot>
  </>
);
