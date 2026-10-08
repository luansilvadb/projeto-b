import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant, STRIDE_LENGTH } from "../../../art/Elephant";
import { Person, type PersonColors } from "../../../art/Person";
import { taperPath } from "../../../art/shapes";
import {
  castScale,
  FlatStage,
  StageContext,
  Stay,
  useStage,
} from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  clamp,
  clamp01,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { markFor } from "../../../video/stage";
import { elephant, idea, jellyfish, person, personInPajamas } from "../palette";
import { Bed, BED_SIZE } from "../parts/Bed";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  PULSES_ASLEEP,
  PULSES_AWAKE,
  pulseCycles,
  pulseShape,
} from "../parts/pulse";
import { NEVER, Preluded, flash, useCastScale } from "./MaybeBrainScene";
import { Drift, Grow } from "./SleepDebtScene";
import { SHOP_RISE, ShopPrelude } from "./StillUnknownScene";

type Hue = keyof typeof idea;
type Point = readonly [number, number];

// Do centro do desenho da água-viva até onde o sino encosta no chão, em fração da largura do sino.
const RESTING = 124 / 660;
// A figura da cama é desenhada com 800 px de altura; de pé, o meio dela fica 5 px à esquerda do meio da cama.
const BED_FIGURE = { height: 800, offset: 5 };

type TrioLayout = {
  readonly ground: number;
  readonly elephant: { readonly x: number; readonly width: number };
  readonly person: { readonly x: number; readonly height: number };
  readonly jellyfish: { readonly x: number; readonly width: number };
};

/** Onde cada um fica, na mesma linha: a elefanta de um lado, a pessoa no meio, a água-viva do outro. */
const MEDIUM: TrioLayout = {
  ground: 990,
  elephant: { x: 390, width: 640 },
  person: { x: 990, height: 740 },
  jellyfish: { x: 1560, width: 400 },
};
export const WIDE: TrioLayout = {
  ground: 870,
  // A cama é mais comprida que a pessoa de pé: a elefanta e a água-viva abrem para os lados,
  // e a ponta da tromba fica com um vazio até a cabeceira (encostava nela).
  elephant: { x: 330, width: 420 },
  person: { x: 1050, height: 470 },
  jellyfish: { x: 1640, width: 270 },
};

/** O enquadramento a caminho de um para o outro: é a câmera recuando enquanto os dois bichos abrem espaço para a cama. */
const layoutBetween = (
  from: TrioLayout,
  to: TrioLayout,
  t: number,
): TrioLayout => ({
  ground: mix(from.ground, to.ground, t),
  elephant: {
    x: mix(from.elephant.x, to.elephant.x, t),
    width: mix(from.elephant.width, to.elephant.width, t),
  },
  person: {
    x: mix(from.person.x, to.person.x, t),
    height: mix(from.person.height, to.person.height, t),
  },
  jellyfish: {
    x: mix(from.jellyfish.x, to.jellyfish.x, t),
    width: mix(from.jellyfish.width, to.jellyfish.width, t),
  },
});

/** Onde a cama fica num enquadramento, e de que tamanho: ela tem a altura que a pessoa tinha de pé. */
export const trioBed = (
  layout: TrioLayout,
): { readonly x: number; readonly y: number; readonly scale: number } => {
  const scale = layout.person.height / BED_FIGURE.height;
  return {
    x: layout.person.x + BED_FIGURE.offset * scale,
    y: layout.ground,
    scale,
  };
};

type ElephantPose = {
  /** Quanto ela ainda está longe do lugar, em pixels, e a passada com que anda até lá. */
  readonly away?: number;
  readonly gait?: number;
  readonly pace?: number;
  /** A pálpebra além da piscada, a cabeça que pende, a tromba e a orelha, como no desenho. */
  readonly lid?: number;
  readonly droop?: number;
  readonly trunk?: number;
  readonly ear?: number;
  readonly look?: Point;
};

type JellyfishPose = {
  /** De onde ela ainda vem, em pixels a partir do lugar em que pousa, e a inclinação com que nada. */
  readonly away?: Point;
  readonly tilt?: number;
  readonly droop?: number;
  /** Os pulsos que ela já deu, e para que lado os braços pendem. */
  readonly cycles: number;
  readonly sway?: number;
  /** Quanto da sombra já existe, de 0 a 1: só cresce quando ela chega perto do chão. */
  readonly shadow?: number;
};

type TrioProps = {
  readonly layout: TrioLayout;
  readonly hue: Hue;
  /** O instante do plano, em segundos: o relógio da pausa viva dos três. */
  readonly seconds: number;
  readonly elephant: ElephantPose;
  readonly jellyfish: JellyfishPose;
  /** A largura da sombra de quem está no meio, e quem está no meio: a pessoa de pé, ou a cama. */
  readonly middleShadow: number;
  /**
   * A sombra do meio fora do lugar de sempre: onde fica, e quanto é fina (de
   * 0, a de sempre, a 1, a sombra que a cama desenha sozinha). Serve à cama
   * que chega de outro plano com a sombra dela.
   */
  readonly middleAt?: { readonly x: number; readonly thin: number };
  readonly children: React.ReactNode;
};

/**
 * A pessoa entre a elefanta e a água-viva, na mesma linha: somos um desses
 * animais. Quem a usa diz o que cada um faz; o que ninguém faz, a pausa viva
 * faz: a elefanta respira, pisca e abana a orelha, e a água-viva pulsa. A
 * chamada final reusa o trio, já dormindo.
 */
const Trio: React.FC<TrioProps> = ({
  layout,
  hue,
  seconds,
  elephant: beast,
  jellyfish: jelly,
  middleShadow,
  middleAt,
  children,
}) => {
  const { ground } = layout;
  const asleep = beast.lid ?? 0;
  const away = beast.away ?? 0;
  const from = jelly.away ?? [0, 0];
  // A sombra de cada bicho cresce e encolhe com ele, na marcação do palco.
  const elephantOn = useCastScale(layout.elephant.x - away);
  const jellyfishOn = useCastScale(layout.jellyfish.x + from[0]);

  return (
    <>
      <SvgLayer>
        <IdeaShadow
          hue={hue}
          x={layout.elephant.x - away}
          y={ground + 6}
          width={layout.elephant.width * 0.8 * elephantOn}
        />
        <ellipse
          cx={middleAt?.x ?? layout.person.x}
          cy={ground + 6}
          rx={middleShadow / 2}
          ry={middleShadow * mix(0.06, 0.031, middleAt?.thin ?? 0)}
          fill={idea[hue].contact}
          opacity={0.24}
        />
        <IdeaShadow
          hue={hue}
          x={layout.jellyfish.x}
          y={ground + 6}
          width={
            layout.jellyfish.width * 1.1 * (jelly.shadow ?? 1) * jellyfishOn
          }
        />
      </SvgLayer>
      {/* A elefanta olha para o meio do quadro: o desenho, que olha para a esquerda, é espelhado. */}
      <Place
        x={layout.elephant.x - away}
        y={ground}
        anchor="bottom"
        style={{
          scale: `-1 ${breath(seconds, "trio-elephant", { amplitude: 0.012 + 0.004 * asleep, period: 4.5 })}`,
        }}
      >
        <Elephant
          width={layout.elephant.width}
          colors={elephant}
          lid={Math.max(asleep, blink(seconds, "trio-elephant"))}
          droop={beast.droop ?? 0}
          trunk={beast.trunk ?? 0}
          ear={
            (beast.ear ?? 0.1) +
            0.07 * (1 - 0.5 * asleep) * wave(seconds, 3.1, 0.2)
          }
          look={beast.look}
          gait={beast.gait}
          pace={beast.pace}
        />
      </Place>
      {children}
      <Place
        x={layout.jellyfish.x + from[0]}
        y={ground - layout.jellyfish.width * RESTING + from[1]}
        style={{ rotate: `${jelly.tilt ?? 0}deg` }}
      >
        <Cassiopea
          width={layout.jellyfish.width}
          colors={jellyfish.day}
          droop={jelly.droop ?? 0}
          pulse={pulseShape(jelly.cycles)}
          sway={jelly.sway ?? 0.4 * wave(seconds, 5)}
        />
      </Place>
    </>
  );
};

type LeavingProps = {
  /** O ponto em volta do qual a cama encolhe ao sair, em pixels do quadro. */
  readonly origin: Point;
  readonly children: React.ReactNode;
};

/**
 * A cama sai do palco como o elenco, junto com os dois bichos, encolhendo em
 * volta do pé dela: como objeto de cena sairia por último, e ficaria sozinha
 * sobre o cenário que chega.
 */
const Leaving: React.FC<LeavingProps> = ({ origin, children }) => {
  const stage = useStage();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${origin[0]}px ${origin[1]}px`,
        scale: `${1 - stage.leave(markFor("actor", WIDE.person.x).leaveAt)}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Os três saem estes quadros antes da marcação do palco: a rua da loja sobe em seguida, e eles ainda
// encolhiam em cima do toldo e dos prédios dela.
const TRIO_OUT_SOONER = 6;

/** O elenco que está aqui sai `by` quadros antes da marcação do palco. */
const LeavingSooner: React.FC<{ by: number; children: React.ReactNode }> = ({
  by,
  children,
}) => {
  const stage = useStage();
  const sooner = useMemo(
    () => ({ ...stage, leave: (delay = 0) => stage.leave(delay - by) }),
    [stage, by],
  );
  return (
    <StageContext.Provider value={sooner}>{children}</StageContext.Provider>
  );
};

const PERSON_KEYS = Object.keys(person) as (keyof PersonColors)[];

/** A roupa de dia virando o pijama: as cores passam de uma à outra enquanto ela se deita. */
const dressed = (pajamas: number): PersonColors =>
  pajamas <= 0
    ? person
    : pajamas >= 1
      ? personInPajamas
      : (Object.fromEntries(
          PERSON_KEYS.map((key) => [
            key,
            interpolateColors(
              pajamas,
              [0, 1],
              [person[key], personInPajamas[key]],
            ),
          ]),
        ) as PersonColors);

// A elefanta entra andando pela esquerda: de quão longe vem (de fora do
// quadro), em quanto tempo, e a partir de que ponto do caminho freia.
const WALK_IN = { from: 760, seconds: 1.5, brake: 0.7 };
// A água-viva entra nadando pela direita, de cima, e pousa: de onde vem, em quanto tempo, e depois de a elefanta partir.
const SWIM_IN = {
  from: [640, -330],
  seconds: 1.0,
  after: 0.6,
  tilt: 12,
} as const;
// "Os três se olham": ela se vira para a elefanta, pisca, e se vira para a água-viva. Quantos graus
// o corpo pende, quantos quadros dura cada olhar e em quantos ela se vira.
const GLANCE = { degrees: 3.5, frames: 24, turn: 12 };
// Em quantos quadros a pálpebra fecha antes de o rosto trocar, e abre depois.
const LID_FRAMES = 3;
// O braço da frente, nas unidades do desenho da pessoa: solto, e com a mão no olho, que ela esfrega.
const ARM = {
  rest: { hand: [-136, -214], bend: 26 },
  eye: { hand: [-46, -452], bend: 44 },
} as const;
// O esfregar e o bocejo, em quadros a partir da deixa: a mão sobe até o olho, esfrega duas
// vezes e desce; o bocejo continua até ela se deitar.
const RUB = { rise: 8, rubs: 14, down: 9, sweep: 8 };
// O ombro da frente e o desenho do braço da pessoa, para a mão que passa na frente do rosto:
// o desenho põe os braços atrás da cabeça, e quem esfrega o olho precisa da mão por cima.
const FIGURE = { width: 400, height: 650, shoulder: [-70, -346] } as const;
// A câmera recua para caber a cama: começa nos últimos quadros do primeiro plano e termina no começo do segundo.
const PULL_BACK = { lead: 18, frames: 22 };
// A cama cresce atrás dela enquanto a câmera recua, e está pronta quando o segundo plano começa.
const BED_IN = { lead: 9, frames: 9 };
// Ela se deita: balança para a frente (aviso), tomba de costas no colchão e o cobertor a cobre. Em quadros.
const LIE = { warn: 5, fall: 11, cover: 9, sway: 5 };
// A elefanta e a água-viva adormecem em 0,8 s cada.
const DOZE_SECONDS = 0.8;
// O segundo plano aproxima devagar, a partir do quadro composto.
const WIDE_PUSH = { focus: [960, 620], by: 0.03 } as const;
const MEDIUM_FOCUS = [960, 600] as const;

type RaisedArmProps = {
  /** A altura da pessoa, em pixels do quadro, e o braço como o desenho dela o recebe. */
  readonly height: number;
  readonly hand: Point;
  readonly bend: number;
  /** Quanto os ombros caem, como o rosto dela manda. */
  readonly slump: number;
};

/**
 * O braço da frente da pessoa, de novo, por cima dela: o mesmo traço, no mesmo
 * lugar, para a mão passar na frente do rosto quando ela esfrega o olho.
 */
const RaisedArm: React.FC<RaisedArmProps> = ({ height, hand, bend, slump }) => {
  const sx = FIGURE.shoulder[0];
  const sy = FIGURE.shoulder[1] + slump;
  const dx = hand[0] - sx;
  const dy = hand[1] - sy;
  const length = Math.hypot(dx, dy) || 1;
  // O cotovelo: o meio do caminho entre o ombro e a mão, empurrado para fora.
  const elbow: Point = [
    (sx + hand[0]) / 2 - (dy / length) * bend,
    (sy + hand[1]) / 2 + (dx / length) * bend,
  ];
  const ex = hand[0] - elbow[0];
  const ey = hand[1] - elbow[1];
  const fore = Math.hypot(ex, ey) || 1;
  return (
    <svg
      width={(FIGURE.width * height) / FIGURE.height}
      height={height}
      viewBox={`${-FIGURE.width / 2} ${-FIGURE.height} ${FIGURE.width} ${FIGURE.height}`}
      overflow="visible"
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <g transform="rotate(2.5 0 -180)">
        <path d={taperPath([sx, sy], elbow, hand, 46, 34)} fill={person.top} />
        <circle
          cx={hand[0] + (ex / fore) * 14}
          cy={hand[1] + (ey / fore) * 14}
          r={24}
          // Um tom abaixo do rosto: da cor dele, a mão sumia em cima do olho.
          fill={person.handShade}
        />
      </g>
    </svg>
  );
};

/** Quanto do caminho já foi andado, de 0 a 1, com `t` de 0 a 1: reta até `brake`, e dali uma freada que termina parada. */
const walked = (t: number, brake: number): number => {
  const u = clamp01(t);
  const stop = 1 / (1 - brake ** 2);
  return u < brake ? 2 * stop * (1 - brake) * u : 1 - stop * (1 - u) ** 2;
};

type Cues = {
  /** Quadros da cena em que a elefanta parte, em que os três se olham e em que ela esfrega os olhos. */
  readonly enterAt: number;
  readonly lookAt: number;
  readonly rubAt: number;
  /** O quadro da cena em que o segundo plano começa, e os quadros em que a elefanta e a água-viva adormecem. */
  readonly wideAt: number;
  readonly lieAt: number;
  readonly elephantAt: number;
  readonly jellyfishAt: number;
};

type AmongProps = Cues & {
  /** O quadro da cena em que o plano que desenha isto começa. */
  readonly from: number;
  /** Quantos quadros faltam para a cena começar, quando é a cena anterior quem desenha isto, parado no primeiro quadro. */
  readonly until?: number;
};

/** Quantos quadros antes da cena ela começa a crescer, desenhada pelo último plano de `nobody-escaped`. */
export const AMONG_LEAD = 6;

/**
 * A cena inteira, num quadro dela: os dois planos são a mesma encenação, e o
 * que muda de um para o outro é a câmera, que recua. Por isso um desenho só,
 * contado no relógio da cena: quem o desenha é o primeiro plano e, da troca em
 * diante, o segundo.
 */
const Among: React.FC<AmongProps> = ({
  from,
  enterAt,
  lookAt,
  rubAt,
  wideAt,
  lieAt,
  elephantAt,
  jellyfishAt,
  until = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const at = from + frame;
  // Ela começa a crescer antes da cena; no prelúdio o plano está parado no quadro 0, e quem anda é `until`.
  const growAt = until - AMONG_LEAD - from;
  const seconds = at / fps;
  // A cama sai do palco em volta do pé dela, e a sombra vai junto.
  const bedOn = castScale(stage, markFor("actor", WIDE.person.x));
  const pulled = ramp(at, wideAt - PULL_BACK.lead, PULL_BACK.frames);
  const layout = layoutBetween(MEDIUM, WIDE, pulled);
  const bed = trioBed(layout);

  // A elefanta anda para dentro do quadro e freia; a passada cresce com o caminho andado.
  const walkFrames = WALK_IN.seconds * fps;
  const walking = (at - enterAt) / walkFrames;
  const covered = walked(walking, WALK_IN.brake);
  const strideLength = (STRIDE_LENGTH * layout.elephant.width) / 520;
  // Os três se olham: ela vira a tromba e o olho para a pessoa; depois, sono.
  const greeting =
    ramp(at, lookAt, 10) * (1 - ramp(at, lookAt + 2 * GLANCE.frames, 14));
  const elephantDozes = ramp(at, elephantAt, DOZE_SECONDS * fps);

  // A água-viva vem nadando de cima, pela direita: chega de lado primeiro e desce no fim, para pousar.
  const swimAt = enterAt + SWIM_IN.after * fps;
  const swimFrames = SWIM_IN.seconds * fps;
  const swum = clamp01((at - swimAt) / swimFrames);
  const across = Easing.out(Easing.cubic)(swum);
  const down = Easing.inOut(Easing.quad)(swum);
  const landedAt = swimAt + swimFrames;
  const jellyfishDozes = ramp(at, jellyfishAt, DOZE_SECONDS * fps);

  // "Os três se olham": ela pende para o lado da elefanta, pisca, e pende para o da água-viva.
  const lean =
    GLANCE.degrees *
    (-ramp(at, lookAt, GLANCE.turn) +
      2 * ramp(at, lookAt + GLANCE.frames, GLANCE.turn) -
      ramp(at, lookAt + 2 * GLANCE.frames, GLANCE.turn));
  const glanceLids = flash(at, lookAt + GLANCE.frames - 1, 2 * LID_FRAMES + 2);
  // O bocejo: o rosto troca com o olho já fechado pela mão que sobe; depois o bocejo o deixa quase fechado.
  const yawnAt = rubAt + RUB.rise / 2;
  const expression = at >= yawnAt ? "yawning" : "neutral";
  const rubEnds = rubAt + RUB.rise + RUB.rubs;
  const rubLids = interpolate(
    at,
    [rubAt, yawnAt - 1, rubEnds, rubEnds + 6],
    [0, 1, 1, 0],
    clamp,
  );
  // A mão sobe até o olho, esfrega (vai e vem duas vezes) e desce.
  const up = ramp(at, rubAt, RUB.rise) * (1 - ramp(at, rubEnds, RUB.down));
  const rubbing =
    at >= rubAt + RUB.rise && at < rubEnds
      ? Math.sin(((at - rubAt - RUB.rise) / RUB.rubs) * 4 * Math.PI)
      : 0;
  const frontArm = {
    hand: [
      mix(ARM.rest.hand[0], ARM.eye.hand[0], up) + RUB.sweep * rubbing,
      mix(ARM.rest.hand[1], ARM.eye.hand[1], up) - 3 * Math.abs(rubbing),
    ] as const,
    bend: mix(ARM.rest.bend, ARM.eye.bend, up),
  };
  // No bocejo o corpo estica um nada e volta.
  const stretch = 0.025 * flash(at, yawnAt, 34);
  // A respiração de quem está de pé morre antes da troca: a figura da cama, que a recebe, não respira de pé.
  const breathing = 1 - ramp(at, wideAt - 24, 20);

  // Diante da cama: o corpo vai um pouco à frente, tomba de costas no colchão, e o cobertor sobe.
  const fallAt = lieAt + LIE.warn;
  const landAt = fallAt + LIE.fall;
  const landed = (at - landAt) / (0.3 * fps);
  const sink =
    landed <= 0 || landed >= 1
      ? 0
      : 0.07 * (1 - landed) * Math.sin(Math.PI * landed);
  const bedIn = popScale(at, wideAt - BED_IN.lead, BED_IN.frames, 0, 1.05);
  const lying = at >= landAt;
  const standing = at < wideAt;

  return (
    <Trio
      layout={layout}
      hue="mint"
      seconds={seconds}
      elephant={{
        away: WALK_IN.from * (1 - covered),
        gait: walking < 1 ? (WALK_IN.from * covered) / strideLength : undefined,
        pace:
          walking < 1
            ? Math.min(1, (1 - walking) / (1 - WALK_IN.brake))
            : undefined,
        lid: interpolate(elephantDozes, [0.6, 1], [0, 1], clamp),
        droop: elephantDozes,
        trunk: mix(0.2 + 0.4 * greeting, 0, elephantDozes),
        ear: mix(0.45 + 0.25 * greeting, 0.1, elephantDozes),
        look: [-0.7 * greeting, -0.5 * greeting],
      }}
      jellyfish={{
        away: [SWIM_IN.from[0] * (1 - across), SWIM_IN.from[1] * (1 - down)],
        // Ao encostar, o sino afunda um nada e volta.
        tilt: SWIM_IN.tilt * (1 - across) + 2 * flash(at, landedAt - 2, 10),
        droop: mix(0.3 * (1 - across), 0.8, jellyfishDozes),
        cycles: pulseCycles(at, fps, [
          { from: 0, perMinute: PULSES_AWAKE },
          { from: jellyfishAt, perMinute: PULSES_ASLEEP },
        ]),
        // Olhando para ela, os braços pendem para o lado do meio.
        sway: 0.4 * wave(seconds, 5) - 0.8 * greeting,
        shadow: down ** 3,
      }}
      middleShadow={
        bedOn *
        // A sombra cresce com ela.
        linear(frame, growAt, 8) *
        mix(
          layout.person.height * 0.5,
          BED_SIZE.width * bed.scale + 60,
          Math.min(1, bedIn),
        )
      }
    >
      {standing ? (
        <>
          {/* A cama cresce atrás dela, do chão, enquanto a câmera recua. */}
          {bedIn > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: `${bed.x}px ${bed.y}px`,
                scale: `${bedIn}`,
              }}
            >
              <Bed
                {...bed}
                colors={personInPajamas}
                hue="mint"
                shadow={false}
                occupied={false}
                cover={0}
              />
            </div>
          ) : null}
          <Place
            x={layout.person.x}
            y={layout.ground}
            anchor="bottom"
            style={{
              scale: `1 ${1 + (breath(seconds, "you") - 1) * breathing + stretch}`,
              rotate: `${lean}deg`,
            }}
          >
            {/* Ela abre a cena: cresce dos pés nos primeiros quadros, e está de pé na primeira palavra. */}
            <Grow at={growAt} origin="bottom">
              <div style={{ position: "relative" }}>
                <Person
                  height={layout.person.height}
                  colors={person}
                  expression={expression}
                  blink={Math.max(
                    at < rubAt ? blink(seconds, "you") : 0,
                    glanceLids,
                    rubLids,
                  )}
                  frontArm={frontArm}
                />
                {up > 0 ? (
                  <RaisedArm
                    height={layout.person.height}
                    {...frontArm}
                    // Os ombros caem um nada com o bocejo.
                    slump={expression === "yawning" ? 6 : 0}
                  />
                ) : null}
              </div>
            </Grow>
          </Place>
        </>
      ) : (
        // Do segundo plano em diante, quem a desenha é a cama: de pé diante dela, tombando, e deitada.
        <Leaving origin={[bed.x, bed.y]}>
          <Bed
            {...bed}
            colors={dressed(ramp(at, fallAt, LIE.fall))}
            hue="mint"
            shadow={false}
            standing={1 - drop(at, fallAt, LIE.fall)}
            lean={LIE.sway * ramp(at, lieAt, LIE.warn)}
            // O rosto de quem dorme entra com o olho já fechado.
            state={at >= fallAt + LIE.fall / 2 ? "asleep" : "waking"}
            blink={ramp(at, lieAt, LIE.warn)}
            cover={ramp(at, landAt - 2, LIE.cover)}
            breath={lying ? 1 - sink + 0.035 * wave(seconds, 4.4, 0.2) : 1}
            snoreAt={landAt + 2 - from}
            snoreSize={120}
            snoreDrift={[0, 5 * wave(seconds, 3.1)]}
          />
        </Leaving>
      )}
    </Trio>
  );
};

/** A pessoa do primeiro plano, grande, entre a elefanta e a água-viva, que entram dos lados. */
const AmongThemShot: React.FC<Cues & { readonly until?: number }> = (cues) => {
  const stage = useStage();
  return (
    <>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}>
        {/* Ninguém aqui entra nem sai pela marcação do palco: cada um chega por conta própria, e os três continuam no plano seguinte. */}
        {stage.handedOver ? null : (
          <Stay>
            <Drift focus={MEDIUM_FOCUS}>
              <Among from={0} {...cues} />
            </Drift>
          </Stay>
        )}
      </FlatStage>
      <Grain />
    </>
  );
};

/** Em quadro aberto, ela se deita; a elefanta e a água-viva adormecem, uma depois da outra. */
const LieDownShot: React.FC<Cues & { readonly clock: number }> = ({
  clock,
  ...cues
}) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  const stage = useStage();
  return (
    <>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.55]} />}>
        {/* A rua da loja da cena seguinte já sobe por baixo dos três, que encolhem: a troca não deixa a tela só com o fundo. */}
        {frame >= length - SHOP_RISE.lead && !stage.handedOver ? (
          <ShopPrelude until={length - frame} clock={clock} />
        ) : null}
        {/* Os três já estavam no palco: não entram; saem com o plano, a cama em volta do pé dela. */}
        <LeavingSooner by={TRIO_OUT_SOONER}>
          <Stay only="entering">
            <Drift
              focus={WIDE_PUSH.focus}
              zoom={1 + (WIDE_PUSH.by * frame) / length}
            >
              <Among from={cues.wideAt} {...cues} />
            </Drift>
          </Stay>
        </LeavingSooner>
      </FlatStage>
      <Grain />
    </>
  );
};

type SleepingTrioProps = {
  readonly hue: Hue;
  /** O relógio do vídeo, em quadros: a respiração dos três não recomeça quando o plano troca. */
  readonly clock: number;
  /** A cama, quando não está no lugar dela: a chamada a traz do plano anterior. */
  readonly bed?: {
    readonly x: number;
    readonly y: number;
    readonly scale: number;
  };
  /** A altura da primeira letra do "ZZZ", em pixels do quadro. */
  readonly snoreSize?: number;
  /** Quanto a sombra da cama ainda é a fina, a do plano de onde ela vem, de 0 a 1. */
  readonly thinShadow?: number;
};

/** Os três dormindo lado a lado, em quadro aberto: a pessoa na cama, a elefanta em pé, a água-viva de braços caídos. */
export const SleepingTrio: React.FC<SleepingTrioProps> = ({
  hue,
  clock,
  bed = trioBed(WIDE),
  snoreSize = 120,
  thinShadow = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const at = clock + frame;
  const seconds = at / fps;
  return (
    <Trio
      layout={WIDE}
      hue={hue}
      seconds={seconds}
      elephant={{ lid: 1, droop: 1, trunk: 0, ear: 0.1 }}
      jellyfish={{
        droop: 0.8,
        cycles: pulseCycles(at, fps, [{ from: 0, perMinute: PULSES_ASLEEP }]),
      }}
      middleShadow={
        (BED_SIZE.width * bed.scale + 60) *
        (1 - stage.leave(markFor("actor", WIDE.person.x).leaveAt))
      }
      middleAt={{ x: bed.x, thin: thinShadow }}
    >
      {/* A cama vem do plano anterior: não entra; sai em volta do pé dela. */}
      <Stay only="entering">
        <Leaving origin={[bed.x, bed.y]}>
          <Bed
            {...bed}
            colors={personInPajamas}
            hue={hue}
            shadow={false}
            breath={1 + 0.035 * wave(seconds, 4.4, 0.2)}
            snoreAt={-1000}
            snoreSize={snoreSize}
            snoreDrift={[0, 5 * wave(seconds, 3.1)]}
          />
        </Leaving>
      </Stay>
    </Trio>
  );
};

// Antes de tudo: nenhuma deixa aconteceu, na mesma ordem e com folga entre elas.
const BEFORE: Cues = {
  enterAt: NEVER,
  lookAt: NEVER + 100,
  rubAt: NEVER + 200,
  wideAt: NEVER + 300,
  lieAt: NEVER + 300,
  elephantAt: NEVER + 400,
  jellyfishAt: NEVER + 500,
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `nobody-escaped` o desenha com `Prelude`, e ela já cresce enquanto a linha
 * do tempo encolhe. `until` é quantos quadros faltam para a cena.
 */
export const OneOfThemOpening: React.FC<{ until: number }> = ({ until }) => (
  <AmongThemShot {...BEFORE} until={until} />
);

export const OneOfThemScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const wideAt = shots[1].from;
  const enterAt = Math.max(0, cue(scene, "Nós") - 6);
  const cues: Cues = {
    enterAt,
    // Os três se olham quando a água-viva acaba de pousar.
    lookAt: Math.max(
      cue(scene, "um"),
      enterAt + (SWIM_IN.after + SWIM_IN.seconds) * fps + 2,
    ),
    rubAt: cue(scene, "larga"),
    wideAt,
    lieAt: wideAt,
    elephantAt: cue(scene, "elefanta"),
    jellyfishAt: cue(scene, "água"),
  };
  return (
    <>
      <Shot range={shots[0]} name="um desses animais">
        <Preluded lead={AMONG_LEAD}>
          <AmongThemShot {...cues} />
        </Preluded>
      </Shot>
      <Shot range={shots[1]} name="ela se deita, como a elefanta e a água-viva">
        <LieDownShot {...cues} clock={scene.from + shots[1].from} />
      </Shot>
    </>
  );
};

/** A aproximação lenta dos planos do trio dormindo, a partir do quadro composto. */
export const TRIO_PUSH = WIDE_PUSH;
