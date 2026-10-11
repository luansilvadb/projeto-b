import { useId } from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Place } from "../../../components/Place";
import { Pop, popOpacity } from "../../../components/Pop";
import { clamp01, cue, mix, ramp, settle } from "../../../components/timing";
import { WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { blockBrake, earth as earthColors, ink } from "../palette";
import { BrakeMoon } from "../parts/BrakeMoon";
import { Globe, landPoint } from "../parts/Globe";
import { Frame, IdeaBackdrop, Push, SourceSeal, SpaceBackdrop, Svg, SvgText, Tag } from "../parts/kit";
import { Moon, SunDisc } from "../parts/Sky";

// No plano do freio a Terra dá uma volta a cada poucos segundos: a fala diz que ela gira mais
// depressa do que a Lua dá a volta nela, e é o ponto marcado passando várias vezes pela Lua que mostra isso.
const TURN_SECONDS = 2.4;
// O plano do freio: a Terra grande, cortada pela borda, e a Lua empurrando a sapata.
const STAGE = { earth: { cx: 620, cy: 580, r: 390 }, moon: { cx: 1640, cy: 580, r: 124 } } as const;
// O ponto marcado, na faixa de continentes (raio 100): em terra, no equador.
const MARK: readonly [number, number] = [-30, 0];

/** O ponto marcado na Terra, em unidades de raio 100: o mesmo nos dois planos do espaço. */
const Mark: React.FC<{ readonly x: number; readonly y: number; readonly r?: number }> = ({ x, y, r = 7 }) => (
  <circle cx={x} cy={y} r={r} fill={ink.paper} stroke={ink.dark} strokeWidth={r * 0.55} />
);

/** A Lua com a sapata de freio encostada na Terra, que continua girando. */
const StillTurning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const mark = landPoint(100, seconds / TURN_SECONDS, MARK);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[1100, 580]} to={1.06}>
        <Svg>
          <BrakeMoon {...STAGE} seconds={seconds} />
          <Globe {...STAGE.earth} spin={seconds / TURN_SECONDS}>
            <Mark x={mark.x} y={mark.y} />
          </Globe>
        </Svg>
        {/* A sapata é a comparação da cena anterior: a etiqueta volta com ela. */}
        <Place x={1310} y={450}>
          <Tag on="dark" size="seal">
            comparação
          </Tag>
        </Place>
      </Push>
    </Frame>
  );
};

/**
 * O plano visto de cima do polo norte: a Lua dá a volta na Terra no sentido anti-horário, e a
 * Terra gira no mesmo sentido. Os tamanhos e a distância não estão em escala.
 */
const ABOVE = { earth: { cx: 560, cy: 540, r: 165 }, orbit: 375, moon: 58 } as const;
// A Lua dá uma volta a cada tantos segundos: devagar, mas o bastante para se ver que ela anda.
const ORBIT_SECONDS = 20;
// Onde a Lua está quando o plano abre, em graus (0 é a direita, onde ela estava no plano anterior).
const MOON_START = 10;
// Quantas voltas a mais que a Lua a Terra dá até os dois movimentos se igualarem. Com a fala real
// são 4 s até "acompanhar": com três voltas ela abria a mais de uma volta por segundo e o ponto não se seguia.
const EXTRA_TURNS = 2;
// O rastro de cada um cobre o que ele andou neste tempo, em segundos: rastros iguais, passos iguais.
const TRAIL_SECONDS = 1.6;

type TrailProps = {
  readonly r: number;
  readonly degrees: number;
  readonly color: string;
  readonly width: number;
};

/** O rastro de quem anda em círculo de raio `r` e está em 0°: um arco para trás, de `degrees` graus. */
const Trail: React.FC<TrailProps> = ({ r, degrees, color, width }) => {
  const swept = Math.min(200, degrees);
  const angle = (swept * Math.PI) / 180;
  return (
    <path
      d={`M${r},0 A${r},${r} 0 ${swept > 180 ? 1 : 0} 1 ${r * Math.cos(angle)},${r * Math.sin(angle)}`}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={0.45}
    />
  );
};

type TopEarthProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly turn: number;
  /** Quantos graus de rastro o ponto marcado deixa. */
  readonly trail: number;
};

/** A Terra vista de cima do polo norte, virada `turn` graus: o gelo no meio, e o ponto marcado perto da beira, em 0°. */
const TopEarth: React.FC<TopEarthProps> = ({ cx, cy, r, turn, trail }) => {
  const id = useId();
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r / 100})`}>
      <defs>
        {/* A luz não gira com a Terra: vem do mesmo lado que no resto do vídeo. */}
        <radialGradient id={`${id}-ocean`} cx="-30" cy="-30" r="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={earthColors.ocean[0]} />
          <stop offset="0.5" stopColor={earthColors.ocean[1]} />
          <stop offset="1" stopColor={earthColors.ocean[2]} />
        </radialGradient>
        <clipPath id={`${id}-disc`}>
          <circle r="100" />
        </clipPath>
      </defs>
      <circle r="100" fill={`url(#${id}-ocean)`} />
      <g clipPath={`url(#${id}-disc)`}>
        <g transform={`rotate(${turn})`}>
          <g fill={earthColors.land}>
            <path d="M20,-84 C48,-90 74,-62 64,-36 C56,-16 30,-26 22,-46 C15,-62 6,-76 20,-84 Z" />
            <path d="M-78,-20 C-62,-48 -30,-42 -32,-15 C-34,10 -56,28 -74,14 C-86,4 -86,-8 -78,-20 Z" />
            <path d="M-20,44 C6,34 38,50 32,74 C26,92 -6,96 -24,80 C-36,70 -36,52 -20,44 Z" />
          </g>
          <circle r="22" fill={earthColors.ice} />
          <Trail r={82} degrees={trail} color={ink.paper} width={7} />
          <Mark x={82} y={0} r={10} />
        </g>
      </g>
    </g>
  );
};

type SynchronizedProps = {
  /** A Terra passa a dar a volta junto com a Lua; a sapata começa a se soltar; já se soltou. */
  readonly at: readonly [number, number, number];
  /** As duas etiquetas entram. */
  readonly tagAt: readonly [number, number];
};

/**
 * Vistas de cima: a Terra gira cada vez mais devagar, até dar uma volta no tempo em que a Lua dá a
 * volta nela. Daí em diante o ponto marcado fica de frente para a Lua, sob a água levantada, a
 * sapata se solta, e os dois seguem dando a volta juntos: sincronizadas, não parada.
 */
const Synchronized: React.FC<SynchronizedProps> = ({ at, tagAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const orbit = 360 / ORBIT_SECONDS;
  // Graus negativos: anti-horário no quadro.
  const moon = MOON_START - orbit * seconds;
  // O que falta a Terra girar a mais que a Lua cai com o quadrado do tempo que resta: a diferença
  // de velocidade diminui por igual e chega a zero com o ponto marcado de frente para a Lua.
  // O ponto vem de trás da Lua e a alcança, no mesmo sentido dela: a Terra só perde velocidade,
  // nunca para nem volta. (Com o sinal trocado ela freava no sentido horário, zerava e saía no
  // anti-horário, e lia-se a Lua arrastando a Terra para trás.)
  const left = 1 - clamp01(frame / at[0]);
  const behind = 360 * EXTRA_TURNS * left ** 2;
  const spin = orbit + (2 * 360 * EXTRA_TURNS * left) / (at[0] / fps);
  const { earth } = ABOVE;
  const turned = (moon * Math.PI) / 180;
  // A Terra e a Lua ocupam o meio do quadro até as etiquetas pedirem o lado direito.
  const centered = 1 - ramp(frame, tagAt[0] - 0.7 * fps, 0.8 * fps);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      {/* A câmera chega: parte de perto da Terra, como o plano anterior, e abre até caber a volta da Lua. */}
      <Push focus={[earth.cx, earth.cy]} from={1.3} to={1} progress={settle(frame, 0, 0.7 * fps)}>
        <Svg style={{ translate: `${(WIDTH / 2 - earth.cx) * centered}px 0` }}>
          {/* O caminho da Lua. */}
          <circle
            cx={earth.cx}
            cy={earth.cy}
            r={ABOVE.orbit}
            fill="none"
            stroke={earthColors.ghost}
            strokeWidth={4}
            strokeDasharray="4 22"
            strokeLinecap="round"
            opacity={0.4}
          />
          {/* A Lua, a água levantada e a sapata dão a volta juntas: o freio inteiro vira com a Lua. */}
          <g transform={`rotate(${moon} ${earth.cx} ${earth.cy})`}>
            <g transform={`translate(${earth.cx} ${earth.cy})`}>
              <Trail r={ABOVE.orbit} degrees={orbit * TRAIL_SECONDS} color={earthColors.ghost} width={10} />
            </g>
            <BrakeMoon
              earth={earth}
              moon={{ cx: earth.cx + ABOVE.orbit, cy: earth.cy, r: ABOVE.moon }}
              press={1 - ramp(frame, at[1], Math.max(at[2] - at[1], 0.4 * fps))}
              seconds={seconds}
            />
          </g>
          {/* A Lua de novo, por cima da que vira com o freio: a sombra dela não dá a volta, porque a luz vem sempre do mesmo lado. */}
          <Moon
            cx={earth.cx + ABOVE.orbit * Math.cos(turned)}
            cy={earth.cy + ABOVE.orbit * Math.sin(turned)}
            r={ABOVE.moon}
            night={-0.35}
          />
          <TopEarth {...earth} turn={moon + behind} trail={spin * TRAIL_SECONDS} />
        </Svg>
        <Place x={1040} y={440} style={{ translate: "0 -50%" }}>
          <Pop at={tagAt[0]}>
            <Tag on="dark">sincronizadas, não parada</Tag>
          </Pop>
        </Place>
        <Place x={1040} y={590} style={{ translate: "0 -50%" }}>
          <Pop at={tagAt[1]}>
            <Tag on="dark">1 dia = 47 dias de hoje</Tag>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

/**
 * A régua de tempo: as duas barras partem do mesmo zero, a do freio em cima e a do Sol embaixo.
 * A régua não tem graduação nem fim: a barra do freio sai do quadro, e o que ela afirma é só a etiqueta.
 */
const RULER = { x0: 320, y: 540, brakeY: 440, sunY: 640, height: 70, icon: 46 } as const;
// A barra do Sol: curta, e claramente a menor. A proporção com a do freio não é medida.
const SUN_END = RULER.x0 + 250;
// O que acontece no fim da barra do Sol, desenhado embaixo dela e fora da régua, para o
// tamanho do Sol não ser lido como tempo: a altura da cena, o raio do Sol de hoje e o
// do inchado, e o raio da Terra.
const ENDING = { y: 880, r: 40, swollen: 104, earth: 40 } as const;

type PlainSunProps = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly red?: number;
};

/** O Sol sem o halo, que suja o fundo verde. */
const PlainSun: React.FC<PlainSunProps> = (sun) => {
  const id = useId();
  return (
    <>
      <defs>
        <clipPath id={id}>
          <circle cx={sun.cx} cy={sun.cy} r={sun.r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <SunDisc {...sun} />
      </g>
    </>
  );
};

type TwoBarsProps = {
  /** A barra do freio sai do quadro, e a etiqueta dela entra. */
  readonly outAt: number;
  /** A barra do Sol cresce; a etiqueta dela entra; o Sol incha. */
  readonly sunAt: readonly [number, number, number];
};

/** A barra do freio atravessa o quadro e sai dele; a do Sol, curta, acaba antes, e no fim dela o Sol incha e alcança a Terra. */
const TwoBars: React.FC<TwoBarsProps> = ({ outAt, sunAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A ponta passa da borda com folga, para a aproximação da câmera não a trazer de volta.
  const brakeTip = mix(RULER.x0, WIDTH + 300, ramp(frame, 0.2 * fps, Math.max(outAt - 0.2 * fps, fps)));
  const sunTip = mix(RULER.x0, SUN_END, ramp(frame, sunAt[0], 0.6 * fps));
  const ending = popOpacity(frame, sunAt[0] + 0.5 * fps, 0.4 * fps);
  const swollen = ramp(frame, sunAt[2], 1.1 * fps);
  // O Sol incha para a frente, com a beira de trás parada, até ficar centrado sob o fim da barra
  // e cobrir metade da Terra, que espera adiante.
  const sun = mix(ENDING.r, ENDING.swollen, swollen);
  return (
    <Frame backdrop={<IdeaBackdrop hue="mint" />}>
      <Push to={1.03}>
        <Svg>
          <g opacity={ending}>
            <Globe
              cx={SUN_END + ENDING.swollen}
              cy={ENDING.y}
              r={ENDING.earth}
              spin={frame / fps / 14}
              caps={false}
            />
            <PlainSun cx={SUN_END - ENDING.swollen + sun} cy={ENDING.y} r={sun} red={swollen} />
            {/* O fio que prende a cena ao fim da barra: é ali que o Sol incha. */}
            <line
              x1={SUN_END}
              y1={RULER.sunY + RULER.height / 2 + 14}
              x2={SUN_END}
              y2={ENDING.y - ENDING.swollen - 14}
              stroke={ink.dark}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </g>
          {/* O eixo do tempo segue para fora do quadro, sem riscos: nenhum ponto dele tem valor. */}
          <line x1={RULER.x0} y1={RULER.y} x2={WIDTH + 300} y2={RULER.y} stroke={ink.dark} strokeWidth={8} />
          <rect
            x={RULER.x0}
            y={RULER.brakeY - RULER.height / 2}
            width={brakeTip - RULER.x0}
            height={RULER.height}
            rx={14}
            fill={blockBrake.bar}
          />
          <rect
            x={RULER.x0}
            y={RULER.sunY - RULER.height / 2}
            width={sunTip - RULER.x0}
            height={RULER.height}
            rx={Math.min(14, (sunTip - RULER.x0) / 2)}
            fill={blockBrake.sunBar}
          />
          {/* O zero das duas barras: hoje. */}
          <line
            x1={RULER.x0}
            y1={RULER.brakeY - RULER.height / 2 - 24}
            x2={RULER.x0}
            y2={RULER.sunY + RULER.height / 2 + 24}
            stroke={ink.dark}
            strokeWidth={8}
            strokeLinecap="round"
          />
          {/* De quem é cada barra: a Lua e o Sol de hoje, antes do zero. */}
          <Moon cx={RULER.x0 - 90} cy={RULER.brakeY} r={RULER.icon} night={-0.35} />
          <g opacity={popOpacity(frame, sunAt[0], 0.3 * fps)}>
            <PlainSun cx={RULER.x0 - 90} cy={RULER.sunY} r={RULER.icon} />
          </g>
          {(["no mínimo, dezenas de bilhões de anos", "(extrapolação)"] as const).map((line, index) => (
            <SvgText
              key={line}
              x={RULER.x0}
              y={250 + index * 72}
              anchor="start"
              fill={ink.dark}
              opacity={popOpacity(frame, outAt + index * 0.15 * fps, 0.4 * fps)}
            >
              {line}
            </SvgText>
          ))}
        </Svg>
        <Place x={SUN_END + 40} y={RULER.sunY} style={{ translate: "0 -50%" }}>
          <Pop at={sunAt[1]}>
            <Tag on="light">menos de 8 bilhões</Tag>
          </Pop>
        </Place>
      </Push>
      {/* O selo é da conta do Sol: entra com a barra dele, para não assinar a extrapolação do freio. */}
      <Sequence from={sunAt[0]} layout="none">
        <SourceSeal>Schröder e Smith, 2008</SourceSeal>
      </Sequence>
    </Frame>
  );
};

export const NeverScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const at = (index: number, word: string) => cue(scene, word) - shots[index].from;
  return (
    <>
      <Shot range={shots[0]} name="o freio encostado">
        <StillTurning />
      </Shot>
      <Shot range={shots[1]} name="sincronizadas, não parada">
        <Synchronized
          at={[at(1, "acompanhar"), at(1, "sem"), at(1, "agir")]}
          tagAt={[at(1, "continuaria"), at(1, "semanas")]}
        />
      </Shot>
      <Shot range={shots[2]} name="as duas barras">
        <TwoBars outAt={at(2, "dezenas")} sunAt={[at(2, "antes"), at(2, "modelos"), at(2, "incha")]} />
      </Shot>
    </>
  );
};
