import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  cameraBetween,
  framing,
  type CameraState,
} from "../../../components/Camera";
import { Sfx } from "../../../audio/Sfx";
import { wave } from "../../../components/Idle";
import { Onomatopoeia } from "../../../components/Onomatopoeia";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { lab, sound, tags } from "../palette";
import { BENCH_Y } from "../parts/Laboratory";
import {
  DISC,
  discRatSpot,
  LabPlaque,
  RatDisc,
  RatLab,
  type DiscRatPose,
} from "../parts/Rats";
import { Tag } from "../parts/Tag";
import { NEVER, Preluded } from "./MaybeBrainScene";

/**
 * Os três planos do disco são um palco só, e tudo o que acontece nele (os
 * ratos que sobem, o disco que gira, quem cochila) é contado no relógio da
 * cena: cada plano só escolhe a câmera, e a troca de plano não muda nada do
 * que está sobre a bancada.
 */

// O aparelho sobre a bancada, um pouco à direita; a placa do laboratório fica na parede, à esquerda.
const DISC_AT = { x: 1260, y: BENCH_Y + 50, scale: 1 };
const PLAQUE = { x: 420, y: 390 };
const CONTROL = discRatSpot(1, DISC_AT);
/**
 * A bancada dos ratos tem três trechos, um ao lado do outro, e a câmera
 * desliza de um ao seguinte: o disco, os ratos de comparação e os dez em fila
 * sob o calendário (os dois últimos em `rats-result`).
 */
export const BENCH_STRETCHES = 3;
/** Os enquadramentos do disco: a bancada inteira, o disco de perto e o rato de comparação. */
const WIDE = framing([960, 540], 1);
// Onde a deriva do plano aberto termina: um nada mais perto do disco.
const WIDE_END = framing([DISC_AT.x, 640], 1.03, [DISC_AT.x, 640]);
const CLOSE = framing([DISC_AT.x, 640], 1.9, [960, 580]);
// O quadro vai da borda direita da placa (que, cortada, disputaria com a etiqueta) ao fim do trecho, em 1920.
const MEDIUM = framing([1338, 600], 1.65, [960, 600]);
/** Onde a deriva do plano médio termina: é daqui que a câmera de `rats-result` desliza para os ratos de comparação. */
export const DISC_MEDIUM_END = framing([1338, 600], 1.7, [960, 600]);

// Em quantos quadros a bancada sobe ao palco, na entrada da cena.
const BENCH_IN_FRAMES = 27;


// O pulo para cima do disco: de onde cada rato sai (na bancada, na frente da bandeja, em pixels a partir do lugar dele
// no disco), o agachar que avisa, o tempo no ar, o assentar, e a altura do arco.
const HOP = {
  from: [
    [70, 268],
    [96, 276],
  ],
  crouch: 4,
  air: 11,
  land: 7,
  arc: 130,
  apart: 9,
} as const;
// O quarto de volta lento do plano aberto: em quantos quadros, e quanto leva os dois antes de eles voltarem ao lugar.
const QUARTER = { turns: 0.25, frames: 36, carried: 24, back: 16 };
// O giro do pico: o aviso (o disco recua um nada), o tranco de 0,8 s e a volta lenta que continua até eles pararem.
const SPIN = {
  warning: 6,
  back: 0.014,
  turns: 0.42,
  frames: 24,
  slow: 0.25,
  carried: 92,
  regained: 84,
};
// O passo de quem anda contra o giro: quadros por passo, bem marcados.
const STEP_FRAMES = 7.5;
// Uma onda nasce na água a cada tantos segundos.
const RIPPLE_SECONDS = 1.1;

/** A distância andada, em quadros de velocidade cheia, por quem parte em `from`, para em `to` e leva `ease` quadros para ganhar e perder velocidade. */
const travelled = (frame: number, from: number, to: number, ease: number) => {
  const gained = (u: number) =>
    u <= 0 ? 0 : u < ease ? (u * u) / (2 * ease) : u - ease / 2;
  return gained(frame - from) - gained(frame - to);
};

/** Um impulso que sobe e morre: 0 antes de `at`, 1 em `at + rise`, 0 de novo em `at + rise + fall`. */
const bump = (frame: number, at: number, rise: number, fall: number) =>
  interpolate(frame, [at, at + rise, at + rise + fall], [0, 1, 0], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });

type Cues = {
  /** Quadros da cena: os ratos sobem, o disco dá o quarto de volta, a água ondula. */
  readonly hopAt: number;
  readonly quarterAt: number;
  readonly waterAt: number;
  /** O rato do teste pesca de sono, o disco gira, os dois andam e param. */
  readonly drowsyAt: number;
  readonly spinAt: number;
  readonly walkAt: number;
  readonly stopAt: number;
  /** A etiqueta entra, o rato de comparação cochila, e o do teste o olha. */
  readonly tagAt: number;
  readonly napAt: number;
  readonly lookAt: number;
};

/** O pulo de um rato num quadro da cena: de onde está, quanto se estica e se já tem sombra no tampo. */
const hop = (frame: number, at: number, from: readonly [number, number]) => {
  const air = linear(frame, at, HOP.air);
  const crouch = bump(frame, at - HOP.crouch, HOP.crouch, 2);
  const landing = frame - at - HOP.air;
  const squash =
    landing < 0 ? 0 : interpolate(landing, [0, 2, HOP.land], [0, 1, 0], clamp);
  const flying = air > 0 && air < 1 ? 1 : 0;
  return {
    dx: from[0] * (1 - air),
    dy: from[1] * (1 - air) - HOP.arc * 4 * air * (1 - air),
    // Agacha, estica no ar e achata ao pousar.
    stretch: 1 - 0.16 * crouch + 0.1 * flying - 0.13 * squash,
    tilt: flying * 14 * (1 - 2 * air),
    shadow: Math.max(0, (air - 0.75) / 0.25),
    grounded: 1 - air,
  };
};

/**
 * Tudo o que está sobre a bancada num quadro da cena. `seconds` é o relógio
 * do vídeo: a respiração e o farejar não saltam na troca de plano nem de cena.
 */
const discState = (frame: number, fps: number, cues: Cues, seconds: number) => {
  const spinning = frame - cues.spinAt;
  // O disco: o quarto de volta lento, o recuo do aviso, o tranco e a volta lenta que os obriga a andar.
  // Negativo: a frente do tampo anda para a direita, que é para onde os ratos são levados.
  const turn =
    -QUARTER.turns * ramp(frame, cues.quarterAt, QUARTER.frames) +
    SPIN.back * bump(frame, cues.spinAt - SPIN.warning, SPIN.warning, 3) -
    SPIN.turns * ramp(frame, cues.spinAt, SPIN.frames) -
    // A volta lenta soma sempre o mesmo giro, dure o que durar: o disco parado é o mesmo em qualquer narração.
    (SPIN.slow *
      travelled(frame, cues.spinAt + SPIN.frames - 8, cues.stopAt, 10)) /
      (cues.stopAt - cues.spinAt - SPIN.frames + 8);
  // Quanto do caminho de volta eles já andaram, contra o giro.
  const regained = linear(frame, cues.walkAt, cues.stopAt - cues.walkAt);
  const carried =
    QUARTER.carried *
      (ramp(frame, cues.quarterAt + 4, 20) -
        ramp(frame, cues.quarterAt + 26, QUARTER.back)) +
    SPIN.carried * ramp(frame, cues.spinAt + 1, SPIN.frames) -
    SPIN.regained * regained;
  // A passada: no quarto de volta, dois passos para voltar ao lugar; no pico, um passo a cada 0,25 s até parar.
  const stepping =
    bump(frame, cues.quarterAt + 24, 4, QUARTER.back) +
    Math.min(ramp(frame, cues.walkAt, 4), 1 - ramp(frame, cues.stopAt, 6));
  const step =
    Math.max(0, frame - cues.quarterAt - 24) / STEP_FRAMES +
    Math.max(0, frame - cues.walkAt) / STEP_FRAMES;
  // O susto do giro: o rato de comparação vê o disco andar; o do teste acorda com ele, três quadros depois.
  const startle = (delay: number) => bump(spinning - delay, 0, 3, 9);
  // O olho arregalado fica até eles pararem, e volta no fim.
  const alarmed = (delay: number) =>
    interpolate(
      spinning - delay,
      [0, 4, cues.stopAt - cues.spinAt + 10, cues.stopAt - cues.spinAt + 40],
      [0, 1, 0.75, 0.25],
      clamp,
    );
  // O rato do teste pesca de sono: a pálpebra desce, resiste um instante, e fecha; a cabeça pende junto.
  const drowsy = interpolate(
    frame - cues.drowsyAt,
    [0, 11, 16, 28, 36],
    [0, 0.55, 0.4, 0.86, 1],
    clamp,
  );
  const woken = ramp(spinning, 3, 4);
  // No plano médio, o de comparação vai fechando os olhos, cochila, e passa a respirar devagar e fundo.
  const dozing = interpolate(
    frame,
    [cues.tagAt, cues.napAt - 6, cues.napAt, cues.napAt + 12],
    [0, 0.5, 0.5, 1],
    clamp,
  );
  const asleep = ramp(frame, cues.napAt, 14);
  // E o do teste o olha: recua o corpo, arregala o olho e vira a orelha para ele.
  const staring = interpolate(
    frame - cues.lookAt,
    [0, 3, 8, 13],
    [0, -0.25, 1.15, 1],
    { ...clamp, easing: Easing.out(Easing.quad) },
  );
  const hops = [
    hop(frame, cues.hopAt, HOP.from[0]),
    hop(frame, cues.hopAt + HOP.apart, HOP.from[1]),
  ] as const;
  // A água ondula na fala, e de novo, forte, com o giro; depois sossega.
  const rippling = Math.min(
    1,
    0.55 *
      Math.min(
        ramp(frame, cues.waterAt, 8),
        1 - 0.6 * ramp(frame, cues.waterAt + 2 * fps, fps),
      ) +
      ramp(frame, cues.spinAt, 8) * (1 - ramp(frame, cues.stopAt, 1.5 * fps)),
  );
  const poses: readonly [DiscRatPose, DiscRatPose] = [
    {
      dx: hops[0].dx,
      dy: hops[0].dy,
      shadow: hops[0].shadow,
      tilt:
        hops[0].tilt - 5 * drowsy * (1 - woken) + 8 * startle(3) + 5 * staring,
      stretch:
        hops[0].stretch * (1 - 0.05 * drowsy * (1 - woken) + 0.1 * startle(3)),
      motion: {
        lid: drowsy * (1 - woken),
        wide: Math.max(alarmed(3), staring),
        ear: -22 * startle(3) + 18 * Math.max(0, staring),
        gait: { step, amount: stepping },
      },
    },
    {
      dx: hops[1].dx,
      dy: hops[1].dy,
      shadow: hops[1].shadow,
      tilt: hops[1].tilt + 7 * startle(0) - 4 * asleep,
      stretch:
        hops[1].stretch *
        (1 + 0.09 * startle(0) - 0.04 * asleep) *
        // Dormindo, o flanco sobe e desce devagar, por cima da respiração de sempre.
        (1 + 0.035 * asleep * wave(seconds, 4.2, 0.3)),
      motion: {
        lid: dozing,
        wide: alarmed(0) * (1 - dozing),
        ear: -22 * startle(0),
        // Os dois nunca pisam juntos.
        gait: { step: step + 0.5, amount: stepping },
      },
    },
  ];
  return {
    seconds,
    turn,
    carried,
    poses,
    grounded: [hops[0].grounded, hops[1].grounded] as const,
    // Dormindo, ele para de farejar.
    asleep,
    // Os riscos de velocidade só existem no tranco.
    streaks: Math.min(ramp(spinning, 1, 4), 1 - ramp(spinning, 14, 8)),
    ripple: {
      phase: seconds / RIPPLE_SECONDS,
      strength: rippling,
    },
  };
};

type DiscSetProps = {
  readonly cues: Cues;
  /** O quadro da cena, e o do vídeo, em que o plano começa. */
  readonly clock: number;
  readonly videoClock: number;
  /** A etiqueta e o ronco aparecem. */
  readonly labelled?: boolean;
};

type DiscShotProps = DiscSetProps & {
  readonly camera: CameraState;
  /** A câmera acompanha os dois quando o giro os leva: quanto do caminho deles ela segue, de 0 a 1. */
  readonly follow?: number;
};

/** O que está sobre o primeiro trecho da bancada: o aparelho, os dois ratos, a etiqueta e o ronco. */
const DiscSet: React.FC<DiscSetProps> = ({
  cues,
  clock,
  videoClock,
  labelled = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = clock + frame;
  const state = discState(at, fps, cues, (videoClock + frame) / fps);
  const tag = { x: CONTROL.x + 90, y: CONTROL.top - 130 };
  const line = ramp(at, cues.tagAt, 8);
  const spots = [discRatSpot(0, DISC_AT), CONTROL] as const;

  return (
    <>
      {/* Antes de subir, cada rato está na bancada, na frente da bandeja, com a sombra dele. */}
      <SvgLayer>
        {spots.map((spot, index) =>
          state.grounded[index] > 0 ? (
            <ellipse
              key={index}
              cx={spot.x + HOP.from[index][0]}
              cy={spot.y + HOP.from[index][1] - 12}
              rx={DISC.rat * 0.44 * state.grounded[index]}
              ry={13 * state.grounded[index]}
              fill={lab.contact}
              opacity={0.22}
            />
          ) : null,
        )}
      </SvgLayer>
      <RatDisc
        {...DISC_AT}
        rats={["awake", "awake"]}
        turn={state.turn}
        carried={state.carried}
        seconds={state.seconds}
        poses={state.poses}
        // Quem dorme não fareja; o outro, sim.
        alive={1}
        ripple={state.ripple}
        streaks={state.streaks}
        // O disco e os dois ratos são o assunto dos três planos da cena: de perto, com volume.
        close
      />
      {labelled ? (
        <>
          {/* A linha sai do rato e vai até a etiqueta, com a ponta redonda primeiro. */}
          {line > 0 ? (
            <SvgLayer>
              <path
                d={`M${CONTROL.x - 20},${CONTROL.top + 6} L${CONTROL.x - 20 + (tag.x - 30 - CONTROL.x + 20) * line},${CONTROL.top + 6 + (tag.y + 30 - CONTROL.top - 6) * line}`}
                stroke={tags.mint.fill}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <circle
                cx={CONTROL.x - 20}
                cy={CONTROL.top + 6}
                r={9 * Math.min(1, line * 3)}
                fill={tags.mint.fill}
              />
            </SvgLayer>
          ) : null}
          {/* A etiqueta está no cenário: desfaz a aproximação da câmera para ficar no tamanho de etiqueta. */}
          <Place x={tag.x} y={tag.y} style={{ scale: `${1 / MEDIUM.zoom}` }}>
            <Pop at={cues.tagAt - clock + 4}>
              <Tag size="note" on="mint">
                comparação
              </Tag>
            </Pop>
          </Place>
          {/* O ronco sobe e desce devagar, com a respiração de quem dorme. */}
          <Place
            x={CONTROL.x + 190}
            y={CONTROL.top + 10}
            style={{
              scale: `${1 / MEDIUM.zoom}`,
              translate: `-50% calc(-50% + ${5 * wave(state.seconds, 4.2, 0.3)}px)`,
              rotate: `${2 * wave(state.seconds, 3.1)}deg`,
            }}
          >
            <Onomatopoeia
              at={cues.napAt - clock + 6}
              size={84}
              color={sound.warm}
              edge={sound.edge}
              tilt={12}
              fade={0.22}
            >
              ZZZ
            </Onomatopoeia>
          </Place>
        </>
      ) : null}
    </>
  );
};

// O disco depois de tudo: as deixas ficaram para trás, na mesma ordem e com folga entre elas.
const AFTER: Cues = {
  hopAt: -9000,
  quarterAt: -8900,
  waterAt: -8800,
  drowsyAt: -8700,
  spinAt: -8600,
  walkAt: -8560,
  stopAt: -8500,
  tagAt: -8400,
  napAt: -8300,
  lookAt: -8200,
};

/** A placa do laboratório, na parede do primeiro trecho. */
export const DiscPlaque: React.FC = () => <LabPlaque {...PLAQUE} />;

/**
 * O primeiro trecho da bancada como a cena o deixou: o rato de comparação
 * cochilando sob a etiqueta, o do teste olhando para ele. É o que
 * `rats-result` desenha enquanto a câmera desliza para o trecho seguinte.
 */
export const DiscAtRest: React.FC<{ videoClock: number }> = ({
  videoClock,
}) => {
  const frame = useCurrentFrame();
  return (
    <DiscSet cues={AFTER} clock={-frame} videoClock={videoClock} labelled />
  );
};

/** O disco sobre a bandeja de água, com os dois ratos, no laboratório de Chicago. */
const DiscShot: React.FC<DiscShotProps> = ({ camera, follow = 0, ...set }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A câmera segue os dois com um atraso de três quadros: eles saem do lugar no quadro, e ela vai atrás.
  const followed = discState(set.clock + frame - 3, fps, set.cues, 0).carried;
  return (
    <RatLab
      steady
      span={BENCH_STRETCHES}
      camera={{
        ...camera,
        x: camera.x + follow * followed * camera.zoom,
      }}
      wall={<DiscPlaque />}
    >
      <DiscSet {...set} />
    </RatLab>
  );
};

type StagedProps = DiscSetProps;

/** O plano aberto: a bancada inteira, numa aproximação lenta na direção do disco. */
const BenchShot: React.FC<StagedProps> = (props) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  return (
    <DiscShot
      {...props}
      camera={cameraBetween(WIDE, WIDE_END, linear(frame, 0, length))}
    />
  );
};

/** De perto: a câmera fecha no rato do teste, e depois acompanha os dois quando o giro os leva para a borda. */
const AwakeShot: React.FC<StagedProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <DiscShot
      {...props}
      camera={cameraBetween(WIDE_END, CLOSE, ramp(frame, 0, 0.7 * fps))}
      follow={0.55}
    />
  );
};

/** A câmera recua para os dois: o outro rato ganha a etiqueta "comparação" e cochila, e o do teste o olha. */
const ControlShot: React.FC<StagedProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const arrive = 0.6 * fps;
  return (
    <DiscShot
      {...props}
      camera={cameraBetween(
        CLOSE,
        cameraBetween(
          MEDIUM,
          DISC_MEDIUM_END,
          linear(frame, arrive, length - arrive),
        ),
        ramp(frame, 0, arrive),
      )}
      // A câmera larga os dois enquanto recua: no fim do plano de perto eles já voltaram quase ao lugar.
      follow={0.55 * (1 - ramp(frame, 0, arrive))}
      labelled
    />
  );
};

// O disco antes de tudo: nenhuma deixa aconteceu, na mesma ordem e com folga entre elas.
const BEFORE: Cues = {
  hopAt: NEVER,
  quarterAt: NEVER + 100,
  waterAt: NEVER + 200,
  drowsyAt: NEVER + 300,
  spinAt: NEVER + 400,
  walkAt: NEVER + 440,
  stopAt: NEVER + 500,
  tagAt: NEVER + 600,
  napAt: NEVER + 700,
  lookAt: NEVER + 800,
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `forced-awake` o desenha com `Prelude`, e a bancada do disco já sobe enquanto a do quadro-negro desce. `videoClock` é o quadro do vídeo em que a cena começa.
 */
export const RatsDiscOpening: React.FC<{ videoClock: number }> = ({
  videoClock,
}) => <BenchShot cues={BEFORE} clock={0} videoClock={videoClock} />;

export const RatsDiscScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const cues: Cues = {
    // Eles só pulam com a bancada já no lugar: ela leva estes quadros para subir ao palco.
    hopAt: Math.max(cue(scene, "ratos"), BENCH_IN_FRAMES),
    quarterAt: cue(scene, "disco"),
    waterAt: cue(scene, "água"),
    drowsyAt: cue(scene, "começava"),
    spinAt: cue(scene, "disco", 2),
    walkAt: cue(scene, "dois"),
    stopAt: cue(scene, "fora"),
    tagAt: cue(scene, "comparação"),
    napAt: cue(scene, "dormir"),
    lookAt: cue(scene, "primeiro"),
  };
  return (
    <>
      <Shot
        range={shots[0]}
        name="um disco sobre a bandeja de água, dois ratos"
      >
        <Preluded>
          <BenchShot
            cues={cues}
            clock={shots[0].from}
            videoClock={scene.from + shots[0].from}
          />
        </Preluded>
      </Shot>
      <Shot
        range={shots[1]}
        name="ele fecha os olhos, o disco gira, os dois andam"
      >
        <AwakeShot
          cues={cues}
          clock={shots[1].from}
          videoClock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="o outro rato é a comparação">
        <ControlShot
          cues={cues}
          clock={shots[2].from}
          videoClock={scene.from + shots[2].from}
        />
      </Shot>
      {/* O giro do disco: o pico do capítulo. */}
      <Sfx name="whoosh" from={cues.spinAt} />
    </>
  );
};
