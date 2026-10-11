import { useId } from "react";
import { AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig } from "remotion";
import { bones, mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { blink, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { ALREADY_SHOWN, clamp01, cue, linear, mix, ramp, settle, shake } from "../../../components/timing";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { earth, home, ink } from "../palette";
import { CUP, Cup, STARTLED, Vig } from "../parts/Actor";
import {
  Bus,
  BUS_CAVEAT,
  BUS_GAUGE,
  BUS_SPEED,
  BUS_VIEW,
  busPoint,
  Flow,
  FLOW_LENGTH,
  roofMid,
} from "../parts/Bus";
import { Caveat } from "../parts/CutEarth";
import { Gauge } from "../parts/Gauge";
import { Globe, House, landPoint, spinFor } from "../parts/Globe";
import { KITCHEN } from "../parts/Kitchen";
import { Frame, Push, SpaceBackdrop, Svg, Tag } from "../parts/kit";
import { LeverStation } from "../parts/Lever";
import { STAGE } from "./SwitchOffScene";

const TURN_SECONDS = 14;
// Quanto do curso da alavanca ela vence antes de desistir: uns 14 graus da haste.
const TUG = 0.4;
// A câmera do plano da hesitação: parte de onde `switch-off` deixou a alavanca e fecha mais nela.
const NEAR = { focus: [1200, 640], from: 1.08, to: 1.16 } as const;

type HesitateProps = {
  /** O quadro em que ela puxa, o em que desiste do puxão, o em que olha a Terra e o em que volta à alavanca. */
  readonly tugAt: number;
  readonly letGoAt: number;
  readonly lookAt: number;
  readonly backAt: number;
};

/** A Vigília com as duas mãos na alavanca: começa a puxar, para, olha a Terra. */
const Hesitate: React.FC<HesitateProps> = ({ tugAt, letGoAt, lookAt, backAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Ela puxa de verdade: a haste cede, fica presa no esforço, e em "Só" ela afrouxa e a haste volta com sobra.
  const tug = ramp(frame, tugAt, 0.3 * fps) - settle(frame, letGoAt, 0.25 * fps);
  const spring = shake(frame, letGoAt, 0.5 * fps, 0.12, 2);
  const look = ramp(frame, lookAt, 0.4 * fps) - ramp(frame, backAt, 0.5 * fps);
  const worry = ramp(frame, letGoAt, 0.4 * fps);
  const closed = Math.max(0.12, blink(frame / fps, "vigilia"));
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push {...NEAR}>
        <Svg>
          <Globe {...STAGE.earth} spin={frame / fps / TURN_SECONDS} />
          <LeverStation
            {...STAGE.lever}
            on={1 - TUG * tug + spring}
            hands={1}
            grip={{
              lean: mix(10, 2, tug),
              grit: tug,
              squint: 0.6 * tug,
              turn: mix(0.9, 0.25, look),
              nod: mix(-0.3, -0.4, look),
              gaze: [mix(0.6, -0.8, look), mix(-0.4, -0.5, look)],
              nearBrow: [-0.5 * worry, 5 * worry],
              farBrow: [-0.5 * worry, 6 * worry],
              mouth: [mix(11, 9, worry), 0.15 * worry, mix(0.1, -0.5, worry)],
              nearLid: closed,
              farLid: closed,
            }}
            shadow={ink.dark}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

// O tamanho dela na cozinha.
const SIZE = 3.4;
// O corpo segue e os cascos ficam: ela passa do pé, a xícara à frente. É o gesto de `you-too`,
// quando o chão trava (`LURCH`, em `YouTooScene`): a mesma regra, o mesmo desenho.
const LURCH: VigiliaPose = {
  ...STARTLED,
  hip: [20, -30],
  lean: 26,
  farHand: [98, -50],
  nearHand: [-44, -84],
  nearFoot: 24,
  farFoot: 12,
};
// "Nada segurou o corpo": a mão de cá procura atrás algo em que se agarrar, e o olhar vai junto.
const GRASP: VigiliaPose = {
  ...LURCH,
  lean: 19,
  turn: 0.2,
  gaze: [-0.9, 0.3],
  nearHand: [-84, -46],
  nearElbow: 1,
  mouth: [12, 0.5, -0.4],
};
// O café saiu da xícara e vai ao lado dela, no mesmo passo: ela repara.
const WATCH: VigiliaPose = {
  ...LURCH,
  nod: -0.4,
  gaze: [0.9, -0.7],
  nearBrow: [0, 8],
  farBrow: [0, 9],
  mouth: [8, 0.35, 0],
};
// A parede da frente vem chegando: o corpo recua, os cascos vão adiante, a xícara sobe para fora do caminho.
const BRACE: VigiliaPose = {
  ...STARTLED,
  hip: [0, -28],
  lean: -12,
  stretch: 1.06,
  turn: 0.9,
  gaze: [0.9, 0],
  farHand: [40, -92],
  nearHand: [58, -56],
  nearElbow: 1,
  nearAnkle: [6, -6.2],
  farAnkle: [36, -6.2],
  nearFoot: -18,
  farFoot: -22,
};
// Segurada: o ovo achata contra a parede, a mão de cá espalmada nela, os olhos fechados. É cartum: amortece.
const SQUASHED: VigiliaPose = {
  ...BRACE,
  hip: [16, -22],
  lean: 12,
  stretch: 0.84,
  turn: 0.6,
  faceSize: 1.1,
  farHand: [30, -104],
  nearLid: 1,
  farLid: 1,
  squint: 0.8,
  nearBrow: [0.4, -2],
  farBrow: [0.4, -2],
  mouth: [14, 0.2, -0.3],
  grit: 1,
  nearFoot: 0,
  farFoot: 0,
};
// Parada, inteira: de pé, olhando o que sobrou na xícara.
const HELD: VigiliaPose = {
  ...CUP,
  turn: 0.7,
  nod: 0.3,
  gaze: [0.5, 0.6],
  nearLid: 0.05,
  farLid: 0.05,
  nearBrow: [-0.4, 4],
  farBrow: [-0.4, 5],
  mouth: [9, 0.15, -0.3],
};
// Onde a xícara vai enquanto ela desliza, no espaço da pose: o café que sai dela parte dali.
const CUP_AT = bones(LURCH).farArm.end;
// A seta do corpo dela, nas medidas da cozinha: logo acima da cabeça, onde não cruza a xícara nem o vapor.
// Na altura do peito ela passava por trás do corpo e saía cortada pela xícara e pela cortina.
const BODY_ARROW = { back: -70, y: 325 } as const;
// A seta dela incha e volta em cada "continua" da fala.
const PULSE = { grow: 0.22, seconds: 0.5 } as const;
// A frente do ônibus, por dentro, é o que a segura: a face da parede, onde ela para encostada nela,
// e quanto volta depois de amortecer.
const HOLD = { wall: WIDTH - 15, x: 1650, bounce: 44 } as const;
// A câmera lenta do deslize, em quadros: ela sai na velocidade do ônibus (`lead`), o tempo desacelera
// (`ramp`), e volta ao normal a tempo de ela chegar à parede na velocidade em que o ônibus vinha (`tail`).
// O ônibus é curto e a fala é longa: sem a câmera lenta ela atravessaria a cozinha em 2 s e a frase
// inteira da regra ficaria sobre uma figura parada.
const SLOW = { lead: 8, ramp: 10, tail: 8 } as const;

/**
 * Quantos quadros de tempo de verdade já correram desde a freada, com a câmera lenta no meio: o
 * quanto ela desacelera é o que faz o corpo, andando sempre a `BUS_SPEED`, vencer `distance` e
 * chegar à parede exatamente em `hitAt`. Depois disso o relógio dela para: ela foi segurada.
 */
const slideClock = (frame: number, brakeAt: number, hitAt: number, distance: number): number => {
  const slowed = (at: number) =>
    linear(at, brakeAt + SLOW.lead, SLOW.ramp) - linear(at, hitAt - SLOW.tail - SLOW.ramp, SLOW.ramp);
  let whole = 0;
  let sofar = 0;
  for (let at = brakeAt; at < hitAt; at++) {
    whole += slowed(at);
    sofar += at < frame ? slowed(at) : 0;
  }
  const cut = (hitAt - brakeAt - distance / BUS_SPEED) / whole;
  return Math.min(Math.max(frame, brakeAt), hitAt) - brakeAt - cut * sofar;
};

type BrakeProps = {
  /** O quadro em que o ônibus freia. */
  readonly brakeAt: number;
  /** Os quadros em que a fala diz "continua": a seta dela pulsa em cada um. */
  readonly goOnAt: readonly number[];
  /** Os quadros em que ela procura onde se agarrar, o café sai da xícara, ela repara nele e vê a parede chegando. */
  readonly graspAt: number;
  readonly allAt: number;
  readonly sameAt: number;
  readonly seesAt: number;
  /** O quadro em que a frente do ônibus a segura, e o em que a palavra "inércia" entra. */
  readonly hitAt: number;
  readonly wordAt: number;
};

/**
 * O ônibus-cozinha na estrada: freia de uma vez, as rodas travam e a estrada para de passar.
 * A seta do ônibus some; a dela continua, e ela e o café seguem pelo piso, em câmera lenta, na
 * velocidade em que o ônibus vinha, deixando o caminho pontilhado. A parede da frente a segura:
 * a seta dela acaba ali, e o caminho fica.
 */
const Brake: React.FC<BrakeProps> = ({ brakeAt, goOnAt, graspAt, allAt, sameAt, seesAt, hitAt, wordAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const view = BUS_VIEW.road;
  const lid = Math.max(CUP.nearLid, blink(frame / fps, "vigilia"));
  const calm: VigiliaPose = { ...CUP, nearLid: lid, farLid: lid };
  const stopped = settle(frame, brakeAt, 0.2 * fps);
  const clock = slideClock(frame, brakeAt, hitAt, HOLD.x - KITCHEN.stand[0]);
  // O relógio do que está solto na cozinha (a cortina, o vapor, os traços da seta): corre junto com
  // o dela, e é por ele ficar lento que a câmera lenta se vê.
  const loose = Math.min(frame, brakeAt) + clock + Math.max(0, frame - hitAt);
  const reached = KITCHEN.stand[0] + BUS_SPEED * clock;
  const x = reached - HOLD.bounce * ramp(frame, hitAt + 4, 0.35 * fps);

  // O susto vem depois do tranco, e só então o corpo vai.
  const startled = settle(frame, brakeAt + 2, 0.15 * fps);
  const going = ramp(frame, brakeAt + 0.25 * fps, 0.5 * fps);
  const grasp = ramp(frame, graspAt, 0.5 * fps) - ramp(frame, graspAt + 1.4 * fps, 0.6 * fps);
  const watch = ramp(frame, sameAt, 0.4 * fps);
  const sees = ramp(frame, seesAt, 0.35 * fps);
  const squashed = linear(frame, hitAt - 1, 2);
  const held = ramp(frame, hitAt + 5, 0.4 * fps);
  // Enquanto desliza ela se equilibra: o corpo oscila devagar, no passo da câmera lenta.
  const sway = going * (1 - sees) * wave(frame / fps, 2.6);
  const sliding = [GRASP, WATCH, BRACE, SQUASHED].reduce(
    (pose, next, index) => mixPose(pose, next, [grasp, watch, sees, squashed][index]),
    mixPose(mixPose(calm, STARTLED, startled), LURCH, going),
  );
  const pose = mixPose({ ...sliding, lean: sliding.lean + 3 * sway }, { ...HELD, nearLid: lid * 0.3, farLid: lid * 0.3 }, held);

  // O café continua indo: sobe do lado da frente e balança até assentar inclinado; na parede, balança de novo e assenta.
  const slosh =
    -24 * (stopped - ramp(frame, hitAt, 0.6 * fps)) +
    shake(loose, brakeAt, 0.9 * fps, 14, 3) +
    shake(frame, hitAt, 0.7 * fps, 16, 3);
  // Um gole sai da xícara em "Tudo" e vai ao lado dela, no mesmo passo. Ele não esbarra no corpo:
  // chega à parede um nada antes, e é a parede que o segura também.
  const lifted = ramp(frame, allAt, 1.2 * fps);
  const drop = [
    KITCHEN.stand[0] + BUS_SPEED * (clock + Math.max(0, frame - hitAt)) + SIZE * (CUP_AT[0] + 2 + 12 * lifted),
    KITCHEN.stand[1] + SIZE * (CUP_AT[1] - 24 - 34 * lifted + 3 * wave(loose / fps, 0.9)),
  ] as const;
  const spilled = drop[0] - (HOLD.wall - 12);
  const stain = clamp01(spilled / (3 * BUS_SPEED));
  const drip = ramp(spilled / BUS_SPEED, 6, 1.6 * fps);

  const pulse =
    1 +
    PULSE.grow *
      goOnAt.reduce((sum, at) => sum + Math.sin(Math.PI * linear(frame, at, PULSE.seconds * fps)), 0);
  // A seta vai com ela, e não atravessa a parede: encurta contra ela e acaba quando ela é segurada.
  const arrowX = reached + BODY_ARROW.back;
  const arrowLength =
    Math.min(FLOW_LENGTH, HOLD.wall - 10 - arrowX) * (1 - settle(frame, hitAt, 0.25 * fps));
  // O meio da seta: é em volta dele que ela incha.
  const arrowMid = arrowX + FLOW_LENGTH / 2;
  // O caminho que ela fez desde a freada: do lugar em que a seta estava até onde ela foi segurada.
  const trailFrom = KITCHEN.stand[0] + BODY_ARROW.back;
  const trailTip = settle(frame, hitAt + 0.2 * fps, 0.25 * fps);
  const word = busPoint(view, (trailFrom + HOLD.x + BODY_ARROW.back) / 2, BODY_ARROW.y - 110);
  const caveat = busPoint(view, ...BUS_CAVEAT);
  return (
    <Frame
      backdrop={<AbsoluteFill style={{ background: `linear-gradient(${home.sky[0]}, ${home.sky[1]})` }} />}
    >
      <Push focus={[WIDTH / 2, HEIGHT * 0.6]} to={1.03}>
        <Bus
          view={view}
          wheels={1}
          // A estrada passa até a freada, e para: as rodas travam no ângulo em que estavam.
          travelled={BUS_SPEED * Math.min(frame, brakeAt)}
          pitch={
            0.8 * (settle(frame, brakeAt, 0.12 * fps) - ramp(frame, brakeAt + 0.15 * fps, 0.45 * fps)) +
            // O ônibus é rígido: quando ela bate na frente dele, ele treme.
            shake(frame, hitAt, 0.4 * fps, 0.4, 2)
          }
          // A cortina é o ar lá de dentro: também segue para a frente, e balança no relógio lento.
          curtain={
            -9 * settle(loose, brakeAt, 0.3 * fps) +
            shake(loose, brakeAt, fps, 6, 3) +
            shake(frame, hitAt, 0.7 * fps, 4, 2)
          }
          over={
            // A seta do ônibus: encolhe até sumir quando ele para.
            <Flow
              x={WIDTH / 2 - FLOW_LENGTH / 2}
              y={roofMid(1)}
              at={ALREADY_SHOWN}
              length={FLOW_LENGTH * (1 - stopped)}
            />
          }
        >
          <Gauge x={BUS_GAUGE.x} y={BUS_GAUGE.y} r={BUS_GAUGE.r} value={BUS_GAUGE.value * (1 - stopped)} lit />
          {/* O café que chegou à parede: a mancha, e o fio que escorre dela. */}
          {stain > 0 ? (
            <g fill={home.coffee}>
              <rect x={HOLD.wall - 14} y={drop[1]} width={9} height={30 + 60 * drip} rx={4.5} />
              <ellipse cx={HOLD.wall - 6} cy={drop[1]} rx={14 * stain} ry={44 * stain} />
              <circle cx={HOLD.wall - 22} cy={drop[1] - 52} r={7 * stain} />
              <circle cx={HOLD.wall - 26} cy={drop[1] + 40} r={5 * stain} />
            </g>
          ) : null}
          {/* O caminho pontilhado, e a ponta que ele ganha quando ela para: vira a seta do trajeto. */}
          <g opacity={0.6}>
            <line
              x1={trailFrom}
              y1={BODY_ARROW.y}
              x2={arrowX}
              y2={BODY_ARROW.y}
              stroke={ink.dark}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray="1 30"
            />
            <path
              d="M34,0 L-14,-24 L-14,24 Z"
              fill={ink.dark}
              transform={`translate(${arrowX + 20} ${BODY_ARROW.y}) scale(${trailTip})`}
            />
          </g>
          <Vig
            x={x}
            y={KITCHEN.stand[1]}
            scale={SIZE}
            pose={pose}
            shadow={home.contact}
            held={<Cup slosh={slosh} steam={loose / 9} />}
          />
          {lifted > 0 && spilled <= 0 ? (
            <g fill={home.coffee} opacity={Math.min(1, lifted * 4)}>
              <ellipse cx={drop[0]} cy={drop[1]} rx={26} ry={19} />
              <circle cx={drop[0] - 40} cy={drop[1] + 20 * (1 - lifted) + 22} r={10} />
              <circle cx={drop[0] + 38} cy={drop[1] - 18} r={7} />
            </g>
          ) : null}
          {/* A seta dela: a mesma de antes da freada, e é a que fica. Os traços correm no relógio lento. */}
          <g
            transform={`translate(${arrowMid} ${BODY_ARROW.y}) scale(${pulse}) translate(${-arrowMid} ${-BODY_ARROW.y})`}
          >
            <Freeze frame={loose}>
              <Flow x={arrowX} y={BODY_ARROW.y} at={ALREADY_SHOWN} length={arrowLength} />
            </Freeze>
          </g>
        </Bus>
        <Place x={caveat[0]} y={caveat[1]}>
          <Pop at={0.2 * fps}>
            <Caveat on="light">comparação</Caveat>
          </Pop>
        </Place>
        {/* Presa ao caminho que o corpo fez sem ninguém empurrar: é o nome disso. */}
        <Place x={word[0]} y={word[1]}>
          <Pop at={wordAt}>
            <Tag on="light" size="label">
              inércia
            </Tag>
          </Pop>
        </Place>
      </Push>
    </Frame>
  );
};

// A faixa de manchas da rocha que se repete, em unidades do disco (raio 100): a mesma conta do `Globe`.
const STRIP = 400;
const BLOTCHES: readonly (readonly [number, number, number, number])[] = [
  [-60, -40, 34, 22],
  [10, 30, 46, 26],
  [70, -55, 26, 16],
  [130, 10, 38, 30],
  [200, -30, 30, 18],
  [250, 50, 42, 20],
  [310, -10, 28, 24],
];
// Os veios claros e as fendas: riscos que cruzam o disco, para o giro (e a falta dele) se ver de longe.
const VEINS: readonly (readonly [number, number, number])[] = [
  [-20, -70, 60],
  [50, 62, 80],
  [110, -22, 50],
  [170, 74, 44],
  [230, -72, 70],
  [290, 26, 56],
  [350, -44, 40],
];
const CRACKS = [0, 96, 184, 262, 340] as const;

/** A rocha sem as camadas de cima: um disco de pedra, com manchas, veios e fendas que deslizam para leste enquanto ela gira. */
const Rock: React.FC<{ readonly spin: number; readonly jolt: number }> = ({ spin, jolt }) => {
  const id = useId();
  const { cx, cy, r } = STAGE.earth;
  const drift = (((spin % 1) + 1) % 1) * STRIP;
  return (
    <g transform={`translate(${cx + jolt} ${cy}) scale(${r / 100})`}>
      <defs>
        <clipPath id={`${id}-disc`}>
          <circle r="100" />
        </clipPath>
        <mask id={`${id}-shade`}>
          <circle r="100" fill="white" />
          <circle cx="-26" cy="-26" r="100" fill="black" />
        </mask>
      </defs>
      <circle r="100" fill={earth.rock} />
      <g clipPath={`url(#${id}-disc)`}>
        {[0, STRIP].map((offset) => (
          <g key={offset} transform={`translate(${drift - offset} 0)`}>
            <g fill={earth.rockShade}>
              {BLOTCHES.map(([x, y, rx, ry], index) => (
                <ellipse key={index} cx={x} cy={y} rx={rx} ry={ry} />
              ))}
            </g>
            <g stroke={earth.mantle} strokeWidth={7} strokeLinecap="round" opacity={0.75}>
              {VEINS.map(([x, y, length], index) => (
                <line key={index} x1={x} y1={y} x2={x + length} y2={y + (index % 2 === 0 ? 8 : -8)} />
              ))}
            </g>
            <g fill="none" stroke={earth.rockShade} strokeWidth={5} strokeLinejoin="round">
              {CRACKS.map((x, index) => (
                <path key={x} d={`M${x},-100 l${index % 2 === 0 ? 14 : -12},46 l-16,38 l20,44 l-10,72`} />
              ))}
            </g>
          </g>
        ))}
      </g>
      <circle r="100" fill={earth.shade} opacity={0.4} mask={`url(#${id}-shade)`} />
    </g>
  );
};

// O achatamento com que um círculo de latitude é visto de lado: o de `LatitudeRing`.
const RING_TILT = 0.16;
// Quanto as camadas ficam afastadas da rocha, em raios: destacadas, sobram dos dois lados do disco.
const LIFT = 1.17;
// A volta das camadas (e da rocha, até travar), em segundos: depressa o bastante para se ver quem parou e quem não.
const LAYER_TURN_SECONDS = 5;
// A casca azul sai da rocha neste tempo.
const PEEL_SECONDS = 0.5;
// A ponte com o plano anterior: o ônibus abre o plano sobre a Terra, neste tamanho, encolhe e pousa
// onde a casinha de quem assiste fica. A Terra é o ônibus em que ela já viaja.
const BRIDGE = { scale: 0.36, landed: 0.04, seconds: 0.7, house: 76 } as const;
// As setas para leste sobre a Terra: as de `feel-nothing`, no amarelo que lê sobre o espaço.
// A da casinha vai com ela; as das camadas saem da ponta de leste de cada faixa, fora do disco:
// em cima da rocha elas diziam que era a rocha que seguia.
const EAST = { house: 200, layer: 130, gap: 16 } as const;
// A casinha atravessa este trecho da frente do disco (em unidades de raio 100) entre o pouso e a saída da casca.
const RIDE = { from: -80, to: 10 } as const;
// O solavanco da rocha quando trava, quadro a quadro: passa do ponto para leste e volta.
const ROCK_JOLT = [16, -10, 4] as const;

type BeltProps = {
  readonly lat: number;
  readonly spin: number;
  readonly color: string;
  readonly width: number;
  readonly opacity?: number;
  /** Quanto a camada já se afastou da rocha, de 0 (colada) a 1. */
  readonly lifted?: number;
  /** Quantas coisas a faixa leva, e o desenho de uma delas, com a base na origem. */
  readonly count: number;
  readonly item: React.ReactNode;
  /** A metade de lá vai antes da rocha; a de cá, depois. */
  readonly half: "back" | "front";
};

/** Uma camada destacada da Terra: uma faixa em volta da rocha, que leva o que é dela para leste. */
const Belt: React.FC<BeltProps> = ({ lat, spin, color, width, opacity = 1, lifted = 1, count, item, half }) => {
  const { cx, cy, r } = STAGE.earth;
  const phi = (lat * Math.PI) / 180;
  const lift = mix(1, LIFT, lifted);
  const rx = r * lift * Math.cos(phi);
  const ry = rx * RING_TILT;
  const y = cy - r * lift * Math.sin(phi);
  if (half === "back") {
    return (
      <path
        d={`M${cx - rx},${y} A${rx},${ry} 0 0 1 ${cx + rx},${y}`}
        fill="none"
        stroke={color}
        strokeWidth={width * 0.6}
        opacity={0.3 * opacity}
      />
    );
  }
  return (
    <g>
      <path
        d={`M${cx - rx},${y} A${rx},${ry} 0 0 0 ${cx + rx},${y}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        opacity={opacity}
      />
      {Array.from({ length: count }, (_, index) => {
        const theta = (spin + index / count) * Math.PI * 2;
        const depth = Math.cos(theta);
        if (depth <= 0.08) {
          return null;
        }
        return (
          <g
            key={index}
            transform={`translate(${cx + rx * Math.sin(theta)} ${y + ry * depth}) scale(${(0.3 + 0.7 * depth).toFixed(3)} 1)`}
            opacity={Math.min(1, depth * 4)}
          >
            {item}
          </g>
        );
      })}
    </g>
  );
};

// As três camadas soltas, de cima para baixo no quadro: o ar, o mar e a fileira de casinhas.
const LAYERS = [
  {
    lat: 31,
    color: earth.air,
    width: 56,
    opacity: 0.6,
    count: 7,
    item: <rect x={-42} y={-13} width={84} height={26} rx={13} fill={ink.paper} />,
  },
  {
    lat: 0,
    color: earth.water,
    width: 50,
    opacity: 1,
    count: 9,
    item: (
      <path
        d="M-30,2 q15,-14 30,0 q15,14 30,0"
        fill="none"
        stroke={earth.waterLight}
        strokeWidth={8}
        strokeLinecap="round"
      />
    ),
  },
  {
    lat: -31,
    color: earth.land,
    width: 16,
    opacity: 1,
    count: 8,
    item: <House x={0} y={-4} size={58} />,
  },
] as const;

type StopProps = {
  /** O quadro em que o ônibus começa a encolher sobre a Terra. */
  readonly swapAt: number;
  /** O quadro em que a casca azul sai e deixa a parte sólida à vista. */
  readonly peelAt: number;
  /** O quadro em que a rocha trava: a alavanca chega ao fim do curso nele. */
  readonly stopAt: number;
  /** O quadro em que cada camada ganha a seta de quem continua: o ar, o mar, as casinhas. */
  readonly goOnAt: readonly [number, number, number];
};

const PULL_SECONDS = 0.35;

/**
 * O ônibus do plano anterior pousa na Terra e vira a casinha, que já viaja para leste. A casca azul sai e
 * deixa a rocha à vista; ela puxa a alavanca, a rocha trava de uma vez, e o ar, o mar e as casinhas continuam.
 */
const OnlyTheRock: React.FC<StopProps> = ({ swapAt, peelAt, stopAt, goOnAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turns = (at: number) => at / fps / LAYER_TURN_SECONDS;
  const pulled = settle(frame, stopAt - PULL_SECONDS * fps, PULL_SECONDS * fps);
  // Depois do tranco, ela olha o que fez.
  const after = ramp(frame, stopAt + 0.2 * fps, 0.4 * fps);
  const effort = pulled * (1 - after);
  const spin = turns(frame);
  const peeled = ramp(frame, peelAt, PEEL_SECONDS * fps);
  const { cx, cy, r } = STAGE.earth;
  // A Terra azul gira no passo que leva a casinha de um lado ao outro do trecho dela entre o pouso e a
  // saída da casca: assim a seta dela fica sempre sobre o disco, qualquer que seja o tempo da fala.
  const landAt = swapAt + BRIDGE.seconds * fps;
  const blueSpin = spinFor(mix(RIDE.from, RIDE.to, (frame - landAt) / Math.max(1, peelAt - landAt)));
  const spot = landPoint(r, blueSpin);
  const house = [cx + spot.x, cy + spot.y] as const;
  const shrunk = ramp(frame, swapAt, BRIDGE.seconds * fps);
  const scale = mix(BRIDGE.scale, BRIDGE.landed, shrunk);
  const at = [mix(cx, house[0], shrunk), mix(cy, house[1] - BRIDGE.house / 2, shrunk)] as const;
  const landed = linear(frame, landAt - 4, 5);
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.05, 0.1]} />}>
      <Push focus={[STAGE.earth.cx, STAGE.earth.cy]} to={1.03}>
        <Svg>
          <g opacity={peeled}>
            {LAYERS.map((layer) => (
              <Belt key={layer.lat} {...layer} spin={spin} lifted={peeled} half="back" />
            ))}
          </g>
          <Rock spin={turns(Math.min(frame, stopAt))} jolt={ROCK_JOLT[frame - stopAt] ?? 0} />
          {peeled < 1 ? (
            <g opacity={1 - peeled}>
              <Globe cx={cx} cy={cy} r={r * mix(1, LIFT, peeled)} spin={blueSpin} />
              {/* O ônibus, pousado: a casinha de quem assiste, que já vai para leste com o chão. */}
              <House x={house[0]} y={house[1]} size={BRIDGE.house} opacity={landed} />
              <Flow
                x={house[0] + 44}
                y={house[1] - BRIDGE.house / 2}
                // Entra com o pouso: quando a fala chega em "já está viajando", ela já está lá.
                at={landAt + 0.15 * fps}
                length={EAST.house}
                color={ink.accent}
              />
            </g>
          ) : null}
          <g opacity={peeled}>
            {LAYERS.map((layer) => (
              <Belt key={layer.lat} {...layer} spin={spin} lifted={peeled} half="front" />
            ))}
          </g>
          {/* Quem continua leva a seta; a rocha, parada, não tem nenhuma. */}
          {LAYERS.map((layer, index) => {
            const phi = (layer.lat * Math.PI) / 180;
            return (
              <Flow
                key={layer.lat}
                x={cx + r * LIFT * Math.cos(phi) + layer.width / 2 + EAST.gap}
                y={cy - r * LIFT * Math.sin(phi)}
                at={goOnAt[index]}
                length={EAST.layer}
                color={ink.accent}
              />
            );
          })}
          <LeverStation
            {...STAGE.lever}
            on={1 - pulled}
            hands={1}
            grip={{
              turn: mix(0.9, 0.3, after),
              gaze: [mix(0.6, -0.8, after), -0.4],
              grit: effort,
              squint: 0.6 * effort,
              pupil: mix(1, 0.75, after),
              nearLid: 0.12 * (1 - after),
              farLid: 0.12 * (1 - after),
              nearBrow: [-0.5 * after, 6 * after],
              farBrow: [-0.5 * after, 7 * after],
              mouth: [11, 0.5 * after, 0.1 * (1 - after)],
            }}
            shadow={ink.dark}
          />
        </Svg>
        {/* O ônibus-cozinha de antes, sem ela: agora ela está na alavanca. */}
        {landed < 1 ? (
          <AbsoluteFill style={{ opacity: 1 - landed }}>
            <Bus
              view={{ scale, left: at[0] - (scale * WIDTH) / 2, top: at[1] - (scale * HEIGHT) / 2 }}
              wheels={1}
              travelled={BUS_SPEED * frame}
              afloat
            />
          </AbsoluteFill>
        ) : null}
      </Push>
      <Place x={STAGE.earth.cx} y={928}>
        <Pop at={stopAt + 0.15 * fps}>
          <Tag on="dark">só a parte sólida para</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

export const TheRuleScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const bus = (word: string, occurrence = 1) => cue(scene, word, occurrence) - shots[1].from;
  const later = (word: string, occurrence = 1) => cue(scene, word, occurrence) - shots[2].from;
  return (
    <>
      <Shot range={shots[0]} name="ela hesita">
        <Hesitate
          tugAt={cue(scene, "freada")}
          letGoAt={cue(scene, "só")}
          lookAt={cue(scene, "planeta")}
          backAt={cue(scene, "assim")}
        />
      </Shot>
      <Shot range={shots[1]} name="o ônibus freia">
        <Brake
          brakeAt={bus("freia")}
          goOnAt={[bus("continua"), bus("continua", 2)]}
          graspAt={bus("nada", 2)}
          allAt={bus("Tudo")}
          sameAt={bus("mesma")}
          seesAt={bus("até")}
          hitAt={bus("segure")}
          wordAt={bus("inércia")}
        />
      </Shot>
      <Shot range={shots[2]} name="só a parte sólida para">
        <OnlyTheRock
          swapAt={later("troque")}
          peelAt={later("Suponha")}
          stopAt={later("pare")}
          goOnAt={[later("ar"), later("água"), later("você", 2)]}
        />
      </Shot>
    </>
  );
};
