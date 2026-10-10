import { useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "../../../components/Idle";
import { popOpacity, popScale } from "../../../components/Pop";
import { clamp01, cue, mix, ramp } from "../../../components/timing";
import { FPS } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { blockDay, earth, ink, space } from "../palette";
import { GLOBE_ROW, GlobeRow, NightSide } from "../parts/ClimateGlobes";
import { Globe } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, SpaceBackdrop, Svg } from "../parts/kit";
import { SunDisc } from "../parts/Sky";
import { WindArrows } from "../parts/Wind";

const EARTH = { cx: 960, cy: 540, r: 360 } as const;
const TURN_SECONDS = 14;

// O último globo da fileira vai ao centro do quadro e cresce até o tamanho da
// Terra do plano seguinte: o ponto fixo da câmera sai dessa conta.
const LAST = GLOBE_ROW.slots[GLOBE_ROW.slots.length - 1];
const GROWN = EARTH.r / GLOBE_ROW.r;
const ZOOM_FOCUS = [(GROWN * LAST.x - EARTH.cx) / (GROWN - 1), GLOBE_ROW.y] as const;

/** O último globo simulado da fileira cresce e toma o quadro. */
const LastGlobeGrows: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}>
      <Push focus={ZOOM_FOCUS} from={1} to={GROWN} progress={ramp(frame, 0.2 * fps, 1.5 * fps)}>
        <GlobeRow
          clock={frame}
          labels={1 - ramp(frame, 0.1 * fps, 0.4 * fps)}
          // Os vizinhos saem de cena enquanto ele cresce: no fim, só ele.
          rest={1 - ramp(frame, 0.5 * fps, 0.8 * fps)}
        />
      </Push>
    </Frame>
  );
};

// O furacão fica no hemisfério norte, a leste das duas setas de lá, do tamanho de uma delas.
const STORM = { x: EARTH.cx + EARTH.r * 0.7, y: EARTH.cy - EARTH.r * 0.375, r: EARTH.r * 0.19 } as const;
const STORM_TURN_SECONDS = 3;
// Em que volta a Terra está quando o furacão aparece: é a que põe debaixo dele
// o trecho de mar aberto entre dois continentes, que segue ali até ele sumir.
const STORM_OVER_SEA = 0.69;

/** Um braço da espiral, cheio: grosso no miolo e afinando até a ponta, abrindo no sentido horário de dentro para fora. */
const stormArm = (strength: number): string => {
  const edge = (side: 1 | -1) =>
    Array.from({ length: 15 }, (_, step) => {
      const t = step / 14;
      const angle = t * 1.3 * Math.PI * strength;
      const radius = STORM.r * (0.34 + 0.66 * t + side * 0.24 * (1 - t) ** 0.7 * strength);
      return `${(radius * Math.cos(angle)).toFixed(1)},${(radius * Math.sin(angle)).toFixed(1)}`;
    });
  return `M${[...edge(1), ...edge(-1).reverse()].join(" L")} Z`;
};

/**
 * Um furacão visto de cima, no hemisfério norte: uma espiral branca e cheia,
 * com o olho no meio. Gira no sentido anti-horário, e os braços ficam para
 * trás do giro (abrem no sentido horário de dentro para fora). `strength` de
 * 1 a 0 o desmancha: os braços desenrolam e afinam, e o miolo encolhe.
 */
const Hurricane: React.FC<{
  /** Voltas já dadas. */
  readonly turns: number;
  readonly strength: number;
}> = ({ turns, strength }) => {
  if (strength <= 0) {
    return null;
  }
  const { x, y, r } = STORM;
  const arm = stormArm(strength);
  return (
    // O sinal de menos é o sentido anti-horário na tela.
    <g transform={`translate(${x} ${y}) rotate(${-turns * 360})`} opacity={Math.min(1, strength * 2.5)}>
      {/* A sombra dele no mar: é o que o solta do azul claro. */}
      <g fill={earth.shade} opacity={0.22} transform={`translate(${r * 0.07} ${r * 0.09})`}>
        {[0, 120, 240].map((turn) => (
          <path key={turn} d={arm} transform={`rotate(${turn})`} />
        ))}
        <circle r={r * 0.56 * strength} />
      </g>
      <g fill={ink.paper}>
        {[0, 120, 240].map((turn) => (
          <path key={turn} d={arm} transform={`rotate(${turn})`} />
        ))}
        <circle r={r * 0.56 * strength} />
      </g>
      {/* As faixas de nuvem, enroladas para o olho. */}
      <g fill="none" stroke={blockDay.cloudShade} strokeWidth={r * 0.07} strokeLinecap="round">
        {[60, 180, 300].map((turn) => (
          <path
            key={turn}
            d={`M${r * 0.42 * strength},0 A${r * 0.42 * strength},${r * 0.42 * strength} 0 0 1 0,${r * 0.42 * strength}`}
            transform={`rotate(${turn})`}
          />
        ))}
      </g>
      <circle r={r * 0.17 * strength} fill={earth.ocean[2]} />
    </g>
  );
};

type TodayProps = {
  /** Os quadros em que as setas se curvam e em que o furacão aparece. */
  readonly at: readonly [number, number];
  /** As voltas que a Terra já tem no começo do plano. */
  readonly turned: number;
};

/** A Terra de hoje, girando: o vento se curva, e o desvio põe um furacão para girar no hemisfério norte. */
const Today: React.FC<TodayProps> = ({ at, turned }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} to={1.05}>
        <Svg>
          <Globe {...EARTH} spin={turned + frame / fps / TURN_SECONDS} />
          <WindArrows {...EARTH} curve={ramp(frame, at[0], 0.8 * fps)} drawn={ramp(frame, 0.1 * fps, 0.5 * fps)} />
          <Hurricane
            turns={frame / fps / STORM_TURN_SECONDS}
            strength={popScale(frame, at[1], 0.4 * fps, 0) * popOpacity(frame, at[1], 0.4 * fps)}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

// O laço do ar, numa faixa em volta do equador: o caminho de volta corre na
// linha do equador, rente ao chão, e o de ida, acima dele e um pouco para fora
// da Terra. Passar os arcos por fora do disco leria como vento dando a volta
// pelos polos.
const CUT_R = 290;
/** A metade de cá de um círculo em volta da Terra, vista de lado: a elipse e a altura em que ela fica. */
const LOW = { rx: CUT_R, ry: CUT_R * 0.16, y: EARTH.cy } as const;
const HIGH = { rx: CUT_R * 1.13, ry: CUT_R * 0.18, y: EARTH.cy - CUT_R * 0.42 } as const;

/** Um ponto do arco, com `along` de 0 (a borda do lado claro, a oeste) a 1 (a do lado escuro). */
const onArc = (arc: typeof LOW | typeof HIGH, along: number): readonly [number, number] => [
  EARTH.cx - arc.rx * Math.cos(Math.PI * along),
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
}> = ({ hot, cold, seconds }) => {
  const over = onArc(HIGH, 0.5);
  const back = onArc(LOW, 0.5);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Por baixo de cada traço, o mesmo traço mais largo e escuro: é o que o separa do mar e da terra. */}
      {[
        { stroke: space.sky[0], strokeWidth: 30, opacity: 0.55 },
        { stroke: undefined, strokeWidth: 16, opacity: 1 },
      ].map(({ stroke, strokeWidth, opacity }) => (
        <g key={strokeWidth} strokeWidth={strokeWidth} opacity={opacity}>
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

type SlowProps = {
  /** O tempo que o plano anterior durou e as voltas com que ele começou, para o giro e o furacão não pularem no corte. */
  readonly before: number;
  readonly turned: number;
  /** Os quadros da fala: o corte aparece, o ar sobe, desce, volta. */
  readonly at: readonly [number, number, number, number];
};

/** Girando devagar: as setas se endireitam, o furacão se desmancha e, em corte, o ar faz um laço. */
const SlowSpin: React.FC<SlowProps> = ({ before, turned, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  // O giro freia em 1,5 s: a área debaixo de uma velocidade que cai em reta.
  const braking = Math.min(seconds, 1.5);
  const spin = turned + (before + braking - braking ** 2 / 3) / TURN_SECONDS;
  const straight = ramp(frame, 0.2 * fps, 1.1 * fps);
  const cut = ramp(frame, at[0], 0.7 * fps);
  const k = mix(1, CUT_R / EARTH.r, cut);
  const hot =
    HOT_ACROSS * ramp(frame, at[1], 1.2 * fps) + (1 - HOT_ACROSS) * ramp(frame, at[2], 0.4 * fps);
  const cold = ramp(frame, at[3], 1.1 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0, 0.5]} />}>
      <Push focus={[EARTH.cx, EARTH.cy]} from={1.1} to={1} progress={ramp(frame, 0, 0.6 * fps)}>
        <Svg>
          {/* O Sol entra pela esquerda quando a vista vira o corte: é dele o lado claro. */}
          <SunDisc cx={mix(-320, 30, cut)} cy={EARTH.cy} r={170} />
          <g transform={`translate(${EARTH.cx} ${EARTH.cy}) scale(${k}) translate(${-EARTH.cx} ${-EARTH.cy})`}>
            <Globe {...EARTH} spin={spin} shade={mix(0.32, 0, cut)} />
            <NightSide {...EARTH} opacity={0.66 * cut} />
            <WindArrows {...EARTH} curve={1 - straight} opacity={1 - cut} />
            <Hurricane turns={(before + seconds) / STORM_TURN_SECONDS} strength={1 - straight} />
          </g>
          <AirLoop hot={hot} cold={cold} seconds={seconds} />
        </Svg>
      </Push>
    </Frame>
  );
};

// De perto, o chão é o alto de uma Terra enorme, e o Sol bate de cima.
const GROUND = { cx: 960, cy: 2130, r: 1500 } as const;
// As bolas do escudo de nuvens: [x, y, raio]. A barriga, escura, e o topo, claro.
const BELLY: readonly (readonly [number, number, number])[] = [
  [640, 430, 92],
  [800, 446, 104],
  [960, 452, 112],
  [1120, 446, 104],
  [1280, 430, 92],
];
const CROWN: readonly (readonly [number, number, number])[] = [
  [590, 392, 84],
  [720, 340, 112],
  [870, 300, 128],
  [1040, 296, 132],
  [1200, 338, 114],
  [1332, 392, 86],
  [960, 380, 150],
];

type ShieldProps = {
  /** O quadro em que a sombra cai no chão. */
  readonly shadeAt: number;
};

/** Sobre o ponto onde o Sol bate, um escudo de nuvens espessas faz sombra no chão. */
const CloudShield: React.FC<ShieldProps> = ({ shadeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const shade = ramp(frame, shadeAt, 0.7 * fps);
  const puff = (list: typeof BELLY, fill: string, delay: number) =>
    list.map(([x, y, r], index) => (
      <circle
        key={`${fill}-${index}`}
        cx={x}
        cy={y + 5 * wave(seconds, 4, index / list.length)}
        // As nuvens incham do meio para as pontas, e depois só respiram.
        r={r * popScale(frame, delay + Math.abs(index - (list.length - 1) / 2) * 2, 0.5 * fps, 0)}
        fill={fill}
      />
    ));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.5, 0]} />}>
      <Push focus={[960, 560]} from={0.9} to={1} progress={ramp(frame, 0, 0.6 * fps)}>
        <Push focus={[960, 480]} to={1.05}>
          <Svg>
            <SunDisc cx={960} cy={30} r={150} />
            <Globe {...GROUND} spin={0.1} shade={0} caps={false} bare>
              {/* O chão debaixo do escudo e a sombra dele, pintados na Terra (em unidades de raio 100). */}
              <ellipse cx={-6} cy={-91} rx={54} ry={15} fill={earth.land} />
              <ellipse cy={-101} rx={29} ry={11} fill={earth.shade} opacity={0.6 * shade} />
            </Globe>
            {/* Debaixo do escudo a luz não passa. */}
            <path d="M590,470 L1330,470 L1380,640 L540,640 Z" fill={space.sky[0]} opacity={0.24 * shade} />
            {puff(BELLY, blockDay.cloudShade, 0)}
            {puff(CROWN, ink.paper, 3)}
          </Svg>
        </Push>
      </Push>
    </Frame>
  );
};

export const StraightWindScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const from = (index: number, word: string, occurrence = 1) =>
    cue(scene, word, occurrence) - shots[index].from;
  const stormAt = from(1, "furacões");
  // A Terra começa o plano na volta que a deixa em `STORM_OVER_SEA` quando o furacão aparece.
  const turned = STORM_OVER_SEA - stormAt / FPS / TURN_SECONDS;
  return (
    <>
      <Shot range={shots[0]} name="o último globo toma o quadro">
        <LastGlobeGrows />
      </Shot>
      <Shot range={shots[1]} name="hoje: o vento curvo e o furacão">
        <Today at={[from(1, "desvia"), stormAt]} turned={turned} />
      </Shot>
      <Shot range={shots[2]} name="girando devagar: o laço do ar">
        <SlowSpin
          before={(shots[2].from - shots[1].from) / FPS}
          turned={turned}
          at={[from(2, "some"), from(2, "sobe"), from(2, "desce"), from(2, "volta")]}
        />
      </Shot>
      <Shot range={shots[3]} name="o escudo de nuvens">
        <CloudShield shadeAt={from(3, "sombra")} />
      </Shot>
    </>
  );
};
