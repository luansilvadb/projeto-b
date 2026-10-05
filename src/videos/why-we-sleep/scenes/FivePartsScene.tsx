import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { phaseOf, wave } from "../../../components/Idle";
import { cue, linear, ramp } from "../../../components/timing";
import { HEIGHT, WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { markFor } from "../../../video/stage";
import { Vignette } from "../../../vignette/Vignette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  ICON_PITCH,
  ICONS,
  IconRow,
  iconSpot,
  type IconKey,
  type IconMotion,
  type IconState,
} from "../parts/IconRow";
import { VIGNETTE_FRAMES } from "./TheQuestionScene";

/** O fundo da fila: o mesmo matiz em todas as voltas dela, para o mapa ser reconhecido. */
export const ROW_HUE = "lilac";

type Placement = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
};

// A fila é uma só nos quatro planos; o que muda é de quão perto ela é vista e
// em que ícone o quadro está. Aberta, cabe inteira; de perto, um ícone manda.
const WIDE: Placement = { x: 960, y: 520, scale: 1.18 };
// De perto, nos olhos do capim: o primeiro ícone no centro, os vizinhos saindo pela direita.
const ON_EYES: Placement = {
  x: 960 + 2 * ICON_PITCH * 1.9 - 140,
  y: 540,
  scale: 1.9,
};
// Os três jeitos: os três do meio, com as pontas cortadas pela borda.
const ON_WAYS: Placement = { x: 960, y: 500, scale: 1.5 };

// Em quantos segundos um ícone passa de apagado a aceso.
const LIGHT_SECONDS = 0.3;
// A cascata da entrada: o intervalo entre um ícone e o seguinte, em segundos.
const CASCADE_SECONDS = 0.12;
// A deriva de cada plano: quanto a fila se aproxima do assunto, do começo ao fim dele.
const DRIFT = 0.04;
// A pausa viva da fila: quanto cada ícone pulsa (fração do tamanho) e flutua (pixels da fila).
const PULSE = 0.022;
const FLOAT = 6;
// A vinheta sai como entrou em cada mundo dela: uma janela redonda que encolhe
// até sumir no centro, onde o planeta está. Em quantos quadros, com peso.
const VIGNETTE_EXIT_FRAMES = 16;
const VIGNETTE_WINDOW = [HEIGHT * 0.48, Math.hypot(WIDTH, HEIGHT) / 2] as const;

/**
 * A fila a caminho de um enquadramento para outro, como uma câmera: a posição
 * interpola em linha reta e a escala em progressão geométrica, para a
 * velocidade aparente ser a mesma do começo ao fim.
 */
const placementBetween = (
  from: Placement,
  to: Placement,
  t: number,
): Placement => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
  scale: from.scale * (to.scale / from.scale) ** t,
});

/** O enquadramento um pouco mais perto de um ponto do quadro: onde a deriva do plano termina. */
const pushed = (
  placement: Placement,
  focus: readonly [number, number],
  by = DRIFT,
): Placement => ({
  x: focus[0] + (placement.x - focus[0]) * (1 + by),
  y: focus[1] + (placement.y - focus[1]) * (1 + by),
  scale: placement.scale * (1 + by),
});

// Onde cada plano termina, depois da deriva: o plano seguinte parte daqui.
const WIDE_END = pushed(WIDE, [WIDE.x, WIDE.y]);
const EYES_SPOT = iconSpot("eyes", ON_EYES);
const ON_EYES_END = pushed(ON_EYES, [EYES_SPOT.x, EYES_SPOT.y]);
const ON_WAYS_END = pushed(ON_WAYS, [ON_WAYS.x, ON_WAYS.y]);
const LAST_END = pushed(WIDE, [WIDE.x, WIDE.y], 0.03);

/** Um tremor que morre: `turns` idas e voltas em `frames` quadros, a partir de `at`. */
const shake = (
  frame: number,
  at: number,
  frames: number,
  degrees: number,
  turns: number,
): number => {
  const t = (frame - at) / frames;
  return t <= 0 || t >= 1
    ? 0
    : degrees * (1 - t) * Math.sin(t * turns * Math.PI * 2);
};

type RowLife = {
  readonly grow: Partial<Record<IconKey, number>>;
  readonly lift: Partial<Record<IconKey, number>>;
  readonly tilt: Partial<Record<IconKey, number>>;
  readonly motion: Partial<Record<IconKey, IconMotion>>;
};

/**
 * A pausa viva da fila, num instante: os cinco pulsam e flutuam, cada um na
 * sua fase, acesos ou apagados; o capim dos olhos balança, a barra da régua
 * respira, o contorno do cérebro oscila e o despertador faz tique-taque.
 * `amount` vai de 0 (a fila parada) a 1. Serve a toda cena em que a fila volta.
 */
export const rowLife = (seconds: number, amount = 1): RowLife => {
  const grow: Partial<Record<IconKey, number>> = {};
  const lift: Partial<Record<IconKey, number>> = {};
  for (const icon of ICONS) {
    grow[icon] =
      1 + PULSE * amount * wave(seconds, 2.8, phaseOf(`row-${icon}`));
    lift[icon] = FLOAT * amount * wave(seconds, 3.6, phaseOf(`float-${icon}`));
  }
  return {
    grow,
    lift,
    tilt: {
      brain: 1.4 * amount * wave(seconds, 4.4, 0.3),
      alarm: 2.2 * amount * wave(seconds, 1.3),
    },
    motion: {
      eyes: { sway: { seconds, amount } },
      ruler: { bar: 1 - 0.14 * amount * (0.5 + 0.5 * wave(seconds, 2.4, 0.6)) },
    },
  };
};

type Lit = { readonly icon: IconKey; readonly at: number };

type RowShotProps = {
  /** O enquadramento do plano; onde a deriva dele termina; e o do fim do plano anterior, de onde a câmera vem. */
  readonly placement: Placement;
  readonly end: Placement;
  readonly from?: Placement;
  /** Em quantos segundos a câmera chega. */
  readonly travel?: number;
  /** Os ícones que já estavam acesos quando o plano começou. */
  readonly already?: readonly IconKey[];
  /** Os que acendem neste plano, cada um no quadro dele. */
  readonly lighting?: readonly Lit[];
  /** Quadro do plano em que a interrogação entra na porta da loja. */
  readonly questionAt?: number;
  /** Quadro do plano em que os olhos no capim piscam. */
  readonly blinkAt?: number;
  /** O plano sai da vinheta: o fundo já está por baixo dela e a fila entra em cascata a partir deste quadro. */
  readonly arriveAt?: number;
  /** O plano entrega o palco a outro cenário: os ícones encolhem, cada um no seu ponto. */
  readonly leaving?: boolean;
  /** O quadro da cena em que o plano começa. */
  readonly clock?: number;
};

/** A fila sobre o fundo liso, com os ícones acendendo na fala. */
const RowShot: React.FC<RowShotProps> = ({
  placement,
  end,
  from = placement,
  travel = 0.6,
  already = [],
  lighting = [],
  questionAt,
  blinkAt,
  arriveAt,
  leaving = false,
  clock = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  // O relógio é o da cena: o pulso e o capim não saltam na troca de plano.
  const seconds = (clock + frame) / fps;
  const lightFrames = LIGHT_SECONDS * fps;
  // A câmera tem peso: acelera e freia até o enquadramento do plano, que por
  // sua vez deriva devagar, a velocidade constante, do começo ao fim dele.
  const seen = placementBetween(
    from,
    placementBetween(placement, end, linear(frame, 0, length)),
    ramp(frame, 0, travel * fps),
  );
  const life = rowLife(seconds);

  const states: Partial<Record<IconKey, IconState>> = {};
  const since: Partial<Record<IconKey, number>> = {};
  const turning: Partial<
    Record<IconKey, { from: IconState; progress: number }>
  > = {};
  const tilt: Partial<Record<IconKey, number>> = { ...life.tilt };
  const motion: Partial<Record<IconKey, IconMotion>> = { ...life.motion };
  for (const icon of already) {
    states[icon] = "on";
  }
  for (const { icon, at } of lighting) {
    if (frame >= at) {
      states[icon] = "on";
      since[icon] = at;
      turning[icon] = {
        from: "off",
        progress: ramp(frame, at, lightFrames),
      };
    }
    // Cada um dos três jeitos acende com o gesto dele: a barra encolhe, o contorno treme, o despertador chacoalha.
    if (icon === "ruler") {
      motion.ruler = {
        bar:
          (frame >= at ? ramp(frame, at + 0.2 * fps, 0.4 * fps) : 1) *
          (life.motion.ruler?.bar ?? 1),
      };
    }
    if (icon === "brain") {
      tilt.brain = (tilt.brain ?? 0) + shake(frame, at + 3, 0.6 * fps, 5, 3);
    }
    if (icon === "alarm") {
      tilt.alarm = (tilt.alarm ?? 0) + shake(frame, at + 3, 0.6 * fps, 11, 5);
    }
  }
  // O capim do primeiro ícone balança o tempo todo; os olhos piscam uma vez, na fala.
  motion.eyes = {
    ...life.motion.eyes,
    eyelid:
      blinkAt === undefined
        ? 0
        : interpolate(frame, [blinkAt, blinkAt + 3, blinkAt + 7], [0, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
  };

  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    if (arriveAt !== undefined) {
      const at = arriveAt + index * CASCADE_SECONDS * fps;
      // Entra crescendo do próprio ponto, passa um pouco do tamanho e assenta.
      present[icon] = interpolate(
        frame,
        [at, at + 0.2 * fps, at + 0.3 * fps],
        [0, 1.06, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        },
      );
    }
    if (leaving) {
      // Sai como o elenco de um palco dividido: da esquerda para a direita, cada um encolhendo onde está.
      const mark = markFor("actor", iconSpot(icon, placement).x);
      present[icon] = 1 - stage.leave(mark.leaveAt);
    }
  });
  // A vinheta acabou no quadro anterior. Ela sai inteira, pelo centro: o
  // último quadro dela vira uma janela redonda que encolhe sobre o lilás até
  // sumir onde o planeta está. Começa devagar e ganha velocidade, com peso.
  const shrunk = ramp(frame, 0, VIGNETTE_EXIT_FRAMES);
  const world = 1 - shrunk;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.48]} />
      {arriveAt !== undefined && shrunk < 1 ? (
        <AbsoluteFill
          style={{
            scale: `${world}`,
            // Com o quadro inteiro a janela cobre os cantos; logo se fecha até caber na altura.
            clipPath: `circle(${interpolate(world, [0.88, 1], VIGNETTE_WINDOW, { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px at 50% 50%)`,
          }}
        >
          <Sequence durationInFrames={VIGNETTE_FRAMES} layout="none">
            <Freeze frame={VIGNETTE_FRAMES - 1}>
              <Vignette />
            </Freeze>
          </Sequence>
        </AbsoluteFill>
      ) : null}
      <IconRow
        {...seen}
        hue={ROW_HUE}
        states={states}
        since={since}
        turning={turning}
        tilt={tilt}
        motion={motion}
        grow={life.grow}
        lift={life.lift}
        present={present}
        question={questionAt !== undefined && frame >= questionAt}
        questionAt={questionAt}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// A fila só entra quando a janela da vinheta já quase fechou.
const ROW_AFTER_FRAMES = VIGNETTE_EXIT_FRAMES - 4;
// A câmera dos três jeitos chega em 0,6 s; o primeiro só acende com ela
// assentada, e os outros vêm 0,3 s depois um do outro.
const WAYS_AT = [17, 26, 35] as const;

export const FivePartsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="os cinco ícones, apagados">
      <RowShot
        placement={WIDE}
        end={WIDE_END}
        arriveAt={Math.max(cue(scene, "resposta"), ROW_AFTER_FRAMES)}
      />
    </Shot>
    <Shot range={shots[1]} name="os olhos no capim acendem">
      <RowShot
        from={WIDE_END}
        clock={shots[1].from}
        placement={ON_EYES}
        end={ON_EYES_END}
        lighting={[{ icon: "eyes", at: 3 }]}
        blinkAt={cue(scene, "perigoso") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="os três jeitos acendem um a um">
      <RowShot
        from={ON_EYES_END}
        clock={shots[2].from}
        placement={ON_WAYS}
        end={ON_WAYS_END}
        already={["eyes"]}
        lighting={[
          { icon: "ruler", at: WAYS_AT[0] },
          { icon: "brain", at: WAYS_AT[1] },
          { icon: "alarm", at: WAYS_AT[2] },
        ]}
      />
    </Shot>
    <Shot range={shots[3]} name="a porta da loja acende, com a interrogação">
      <RowShot
        from={ON_WAYS_END}
        clock={shots[3].from}
        placement={WIDE}
        end={LAST_END}
        travel={0.7}
        already={["eyes", "ruler", "brain", "alarm"]}
        lighting={[{ icon: "shop", at: 6 }]}
        questionAt={cue(scene, "sabe") - shots[3].from}
        leaving
      />
    </Shot>
  </>
);
