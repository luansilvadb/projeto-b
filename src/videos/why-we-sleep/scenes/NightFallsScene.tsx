import "../../../design/fonts";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Antelope } from "../../../art/Antelope";
import {
  Build,
  Camera,
  cameraBetween,
  framing,
  useBuild,
  type CameraState,
} from "../../../components/Camera";
import { Stay } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, phaseOf, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { POP_SECONDS, popOpacity, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  linear,
  mix,
  ramp,
  clamp01,
  clamp,
} from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength, wipeClip, type Wipe } from "../../../video/Shot";
import { antelope, antelopeNight, ink, savanna, sound } from "../palette";
import { SAVANNA_GROUND_Y, SavannaShadow } from "../parts/Savanna";
import { RichSavannaBackdrop } from "../../../studies/savanna-reference/RichSavannaReference";
import { richPalette } from "../../../studies/savanna-reference/richPalette";
import { nightPalette } from "../../../studies/savanna-reference/nightPalette";

/**
 * O lugar do bloco 2: o pé de uma acácia, onde o bicho pequeno se deita, e a
 * moita de capim alto atrás dele. As cenas seguintes (`last-to-know`,
 * `skip-a-night`, `sleep-debt`) voltam a este mesmo ponto da savana.
 */
export const DEN = { x: 1380, y: SAVANNA_GROUND_Y + 40, width: 220 };
/** A moita atrás dele, de onde o predador espia. */
export const THICKET = { x: DEN.x + 250, y: SAVANNA_GROUND_Y + 30 };

const DEN_WIDE = framing([960, 540], 1);
// O plano aberto deriva devagar para o pé da árvore, 5,5% do começo ao fim: antes
// de o bicho entrar, é o que impede a savana vazia de congelar. (5,5%: o plano é largo e quase tudo nele é pequeno.)
const DEN_SPOT = [DEN.x - 120, DEN.y - 90] as const;
const DEN_WIDE_END = framing(DEN_SPOT, 1.055, DEN_SPOT);
/** O plano médio: o bicho e a moita, com a árvore inteira em cima. */
const DEN_MEDIUM = framing([DEN.x + 40, DEN.y - 110], 2.9, [960, 640]);
// Chegada ao plano médio, a câmera continua se aproximando devagar do bicho até
// o plano acabar: é o que mexe o quadro depois de ele fechar os olhos. O close parte daqui.
const DEN_MEDIUM_END = framing(
  [DEN.x + 40, DEN.y - 110],
  2.9 * 1.035,
  [960, 640],
);
/**
 * De perto: o bicho deitado enche o quadro, do focinho à anca, e da moita
 * sobra a beirada, atrás dele. Deitado ele é largo e baixo, e por isso o close
 * é bem mais fechado que o plano médio: com menos, ele ficava do tamanho dos
 * planos vizinhos.
 */
export const DEN_CLOSE = framing([DEN.x - 20, DEN.y - 44], 5.6, [900, 640]);

/** Onde a lua está quando a noite cai: alta, à esquerda, para aparecer também nos planos de perto. */
const NIGHT_ORB = 0.36;
/** Onde ela está quando o bicho já ressona e o predador chega: é de onde `skip-a-night` a faz subir. */
export const LATE_ORB = NIGHT_ORB + 0.04;
// O sol do entardecer desce devagar, à esquerda, do começo ao fim do plano aberto.
const DUSK_ORB = { from: 0.335, to: 0.295 };
// A noite desce do alto do quadro sobre o entardecer, em 0,25 s.
const NIGHTFALL: Wipe = { frames: 8, from: "top" };

type SavannaShotProps = {
  readonly camera: CameraState;
  readonly daylight: number;
  readonly orb?: number;
  /**
   * O quadro do vídeo em que o plano começa. O cenário conta o tempo a partir
   * dele, e não do começo do plano: o capim, a poeira e as estrelas continuam
   * de onde estavam na troca de plano, em vez de saltar.
   */
  readonly clock?: number;
  /**
   * Quanto do cenário já subiu ao palco, de 0 a 1, quando é o plano quem
   * decide (a savana que começa a subir antes de o plano chegar). Sem valor,
   * é o palco quem diz.
   */
  readonly risen?: number;
  /** Sem a granulação: para quem desenha a savana por baixo de outro plano, que já tem a dele. */
  readonly bare?: boolean;
  readonly children: React.ReactNode;
};

/**
 * Um plano na savana: a câmera, o cenário em camadas e a granulação. De noite,
 * a árvore ganha o luar.
 *
 * Os sete planos seguidos do capítulo estão no mesmo cenário, e cada um parte
 * do enquadramento, da luz e do astro em que o anterior terminou, escrito no
 * próprio plano (`cameraBetween` do enquadramento anterior, com `ramp`). Por
 * isso o plano assume o cenário de uma vez (`takeover` 1), em vez de deixar o
 * palco misturar o valor herdado com o novo: a mistura do palco começa a toda
 * velocidade, e a câmera daqui tem peso; e o luar do tronco, que é desenhado
 * com a câmera do plano, ficaria fora do lugar enquanto as duas não batessem.
 */
export const SavannaShot: React.FC<SavannaShotProps> = ({
  camera,
  daylight,
  orb,
  clock = 0,
  risen,
  bare = false,
  children,
}) => {
  const stage = useBuild();
  const build =
    risen === undefined ? stage : { ...stage, lit: risen, risen: risen };
  return (
    <AbsoluteFill>
      <Build {...build} takeover={1}>
        {/* Dentro daqui o quadro é o do vídeo: é o relógio do cenário. */}
        <Sequence from={-clock} layout="none">
          <Camera {...camera}>
            <RichSavannaBackdrop daylight={daylight} orb={orb}>
              {children}
            </RichSavannaBackdrop>
          </Camera>
        </Sequence>
      </Build>
      {bare ? null : <Grain />}
    </AbsoluteFill>
  );
};

type SweepProps = {
  readonly wipe: Wipe;
  /** O último quadro do plano anterior, redesenhado: fica por baixo até a borda passar. */
  readonly under: React.ReactNode;
  readonly children: React.ReactNode;
};

/**
 * A varredura entre duas pinturas do mesmo lugar (o entardecer e a noite, a
 * noite e o dia): a pintura nova entra por uma borda que cruza o quadro, sobre
 * a anterior, e as duas dividem a mesma câmera. É feita dentro do plano novo,
 * e não com `wipe` do `Shot`, porque a câmera continua se movendo durante a
 * varredura: as duas pinturas precisam do mesmo enquadramento, quadro a quadro.
 */
export const Sweep: React.FC<SweepProps> = ({ wipe, under, children }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {frame < wipe.frames ? under : null}
      <AbsoluteFill
        style={{
          clipPath: frame < wipe.frames ? wipeClip(frame, wipe) : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </>
  );
};

type CritterProps = {
  /** 1 é dia, 0 é noite: escolhe a pintura do bicho e a da sombra. */
  readonly daylight: number;
  /** Deitado, de 0 a 1. */
  readonly rest?: number;
  /** Dormindo, de 0 a 1: fecha o olho, baixa a orelha, pende a cabeça. */
  readonly asleep?: number;
  /** De vigia: olho arregalado, orelha em pé, cabeça erguida. De 0 a 1, para ele chegar a isso à vista. */
  readonly alert?: boolean | number;
  /** Devendo sono: a olheira, de 0 a 1; as pálpebras ficam a meio. */
  readonly tired?: number;
  /**
   * Cochilando em pé, de 0 a 1: os joelhos da frente cedem, o pescoço desce
   * e a cabeça fica pendurada, de orelha caída, sem o olho fechar de todo.
   */
  readonly nod?: number;
  /**
   * Andando: a fase do ciclo de passos, em voltas, e o tamanho da passada, de
   * 0 a 1. A fase anda com a distância percorrida, para os cascos não patinarem.
   */
  readonly gait?: number;
  readonly pace?: number;
  /** A cabeça virada para trás, por cima do ombro, de 0 a 1. */
  readonly lookBack?: number;
  /** O olho que se abre numa fresta no meio do sono, de 0 a 1: quem quase acorda. */
  readonly peek?: number;
  /** Quanto o corpo sobe a cada passada de `gait`, em pixels do cenário. De longe precisa de mais, para ser visto. */
  readonly bob?: number;
  /** Quanto o corpo sai do chão, em pixels do cenário: o pulinho de quem se vira. */
  readonly hop?: number;
  /** Virado para a direita, para a moita. O desenho olha para a esquerda. */
  readonly flipped?: boolean;
  /**
   * Para onde ele está virado, quando a virada é vista: 1 para a esquerda,
   * -1 para a direita, e o caminho entre os dois é a meia-volta. Vale acima de `flipped`.
   */
  readonly facing?: number;
  readonly x?: number;
  /** O corpo inclinado, em graus: a oscilação de quem vai cair. */
  readonly lean?: number;
  /** A altura do corpo, em fração: abaixo de 1 no impacto de quem desaba. */
  readonly squash?: number;
  /** O sono fundo, de 0 a 1: o flanco sobe e desce mais devagar e mais alto. */
  readonly deep?: number;
  /** Quanto a orelha se ergue além da pose, em fração: a orelha que se mexe. */
  readonly ear?: number;
  /** Quanto a cabeça gira além da pose, em graus. */
  readonly head?: number;
  /** Para onde a pupila vai além da pose, de -1 a 1. */
  readonly glance?: number;
  /** O tempo do cenário, em segundos (ver `clock` em SavannaShot). */
  readonly seconds: number;
};

// A respiração: acordado, dormindo e no sono fundo. A amplitude é fração da altura; o período, segundos.
const BREATH = {
  awake: { rise: 0.014, period: 3 },
  asleep: { rise: 0.026, period: 4.5 },
  deep: { rise: 0.05, period: 6.5 },
} as const;

/** O bicho pequeno do bloco 2: o antílope do elenco, do tamanho de quem é visto de longe. */
export const Critter: React.FC<CritterProps> = ({
  daylight,
  rest = 0,
  asleep = 0,
  alert = false,
  tired = 0,
  nod = 0,
  gait,
  pace = 1,
  lookBack = 0,
  peek = 0,
  bob: stepRise = 7,
  hop = 0,
  flipped = false,
  facing = flipped ? -1 : 1,
  x = DEN.x,
  lean = 0,
  squash = 1,
  deep = 0,
  ear = 0,
  head = 0,
  glance = 0,
  seconds,
}) => {
  const watch = typeof alert === "number" ? alert : alert ? 1 : 0;
  const phase = phaseOf("critter");
  // As três respirações são somadas na proporção de cada estado: passar de uma a outra não dá salto.
  const swell = (kind: keyof typeof BREATH) =>
    BREATH[kind].rise * wave(seconds, BREATH[kind].period, phase);
  const breathing =
    1 + mix(mix(swell("awake"), swell("asleep"), asleep), swell("deep"), deep);
  // A cada passada o corpo sobe e desce (duas vezes por ciclo): sem isso ele desliza.
  const bob =
    gait === undefined
      ? 0
      : stepRise * Math.min(1, pace) * Math.abs(Math.sin(gait * Math.PI * 2));
  // De lado ele nunca some: no meio da meia-volta é visto de frente, estreito.
  const side =
    Math.abs(facing) < TURN_WIDTH
      ? facing < 0
        ? -TURN_WIDTH
        : TURN_WIDTH
      : facing;

  return (
    <>
      <SvgLayer>
        <SavannaShadow
          x={x}
          y={DEN.y + 4}
          width={DEN.width * 0.8}
          daylight={daylight}
        />
      </SvgLayer>
      <Place
        x={x}
        y={DEN.y - bob - hop}
        anchor="bottom"
        style={{
          scale: `${side} ${breathing * squash}`,
          rotate: `${lean}deg`,
        }}
      >
        <Antelope
          finish
          width={DEN.width}
          colors={daylight > 0.25 ? antelope : antelopeNight}
          rest={Math.max(rest, NOD.buckle * nod)}
          droop={Math.max(asleep, nod)}
          tired={tired}
          lid={mix(
            Math.max(
              asleep * (1 - 0.45 * peek),
              0.55 * tired,
              NOD.lid * nod,
              // Quem dorme não pisca: a piscada só vale para quem está de olho aberto.
              (1 - asleep) * blink(seconds, "critter"),
            ),
            0,
            watch,
          )}
          look={[
            mix(0.5 * wave(seconds, 2.9) * (1 - nod), -0.8, watch) + glance,
            mix(0.1 + 0.7 * nod, -0.1, watch),
          ]}
          ear={Math.min(
            1,
            mix(0.9 - 0.75 * Math.max(asleep, nod), 1, watch) + ear,
          )}
          gait={gait}
          pace={pace}
          lookBack={lookBack}
          turn={
            mix(
              (1 - asleep) * 4 * wave(seconds, 3.7) + NOD.head * nod,
              -8 + 3 * wave(seconds, 3.1),
              watch,
            ) + head
          }
        />
      </Place>
    </>
  );
};

// A largura dele, em fração, no meio de uma meia-volta: visto de frente.
const TURN_WIDTH = 0.24;
// O cochilo em pé: quanto os joelhos cedem, quanto o focinho aponta para o chão e quanto a pálpebra desce.
const NOD = { buckle: 0.16, head: -38, lid: 0.66 };

/** A cor de uma coisa da savana entre a noite, o entardecer e o dia. */
const lightOf = (key: "grass" | "trees", daylight: number) =>
  interpolateColors(
    daylight,
    [0, 0.5],
    [
      key === "trees" ? nightPalette.grass.dark : nightPalette.grass.mid,
      key === "trees" ? richPalette.grass.dark : richPalette.grass.mid,
    ],
  );

// As folhas terminam em ponta, como as do cenário de referência. Curvas
// paralelas não deixam o tubo do desenho anterior ler como um cabo no close.
const thicketBlade = (
  base: readonly [number, number],
  middle: readonly [number, number],
  tip: readonly [number, number],
  width: number,
) => {
  const [x, y] = base;
  const height = y - tip[1];
  return `M${x - width / 2} ${y} C${middle[0] - width * 0.4} ${middle[1]} ${tip[0] - width * 0.1} ${tip[1] + height * 0.14} ${tip[0]} ${tip[1]} C${tip[0] + width * 0.1} ${tip[1] + height * 0.14} ${middle[0] + width * 0.4} ${middle[1]} ${x + width / 2} ${y} Z`;
};

// As folhas da moita: x da base, altura e inclinação; as de trás e as da frente.
const BACK_BLADES = [
  [-150, 150, -26],
  [-112, 196, -8],
  [-78, 170, 14],
  [-40, 214, -12],
  [-4, 184, 10],
  [34, 220, 22],
  [70, 176, -10],
  [108, 204, 16],
  [146, 156, 30],
] as const;
const FRONT_BLADES = [
  [-166, 92, -24],
  [-128, 124, 10],
  [-92, 100, -14],
  [-52, 132, 8],
  [-14, 96, -10],
  [26, 128, 14],
  [64, 102, -8],
  [102, 122, 18],
  [140, 94, 26],
] as const;

type ThicketProps = {
  readonly daylight: number;
  readonly seconds: number;
  /** Quanto o capim se mexe, de 0 (só o vento) a 1 (alguém passa por ele). */
  readonly stir?: number;
  /** Quanto o capim se abre para os lados, de 0 a 1: algo o afasta por dentro. */
  readonly part?: number;
  /** Quanto o vento dobra a ponta das folhas, em pixels do cenário. De longe precisa de mais, para ser visto. */
  readonly wind?: number;
  /** Quem está dentro da moita: fica entre as folhas de trás e as da frente. */
  readonly children?: React.ReactNode;
};

/** A moita de capim alto atrás do bicho. Vai dentro do `SavannaShot`. */
export const Thicket: React.FC<ThicketProps> = ({
  daylight,
  seconds,
  stir = 0,
  part = 0,
  wind = 6,
  children,
}) => {
  // O vento e a agitação são duas ondas somadas: a agitação entra e sai sem a folha saltar.
  const sway = (index: number) =>
    wind * wave(seconds, 3.2, index / 5) +
    22 * stir * wave(seconds, 0.5, index / 5);
  // Aberto, cada folha pende para o lado em que está, as das pontas mais.
  const spread = (x: number) => 52 * part * (x / 150);
  return (
    <>
      <SvgLayer>
        {BACK_BLADES.map(([x, height, lean], index) => (
          <path
            key={x}
            d={thicketBlade(
              [THICKET.x + x, THICKET.y],
              [THICKET.x + x - lean / 2, THICKET.y - height * 0.55],
              [
                THICKET.x + x + lean + sway(index) + spread(x),
                THICKET.y - height,
              ],
              17,
            )}
            fill={
              index % 4 === 1
                ? interpolateColors(
                    daylight,
                    [0, 0.5],
                    [nightPalette.grass.gold, richPalette.grass.gold],
                  )
                : lightOf("trees", daylight)
            }
          />
        ))}
      </SvgLayer>
      {children}
      <SvgLayer>
        {FRONT_BLADES.map(([x, height, lean], index) => (
          <path
            key={x}
            d={thicketBlade(
              [THICKET.x + x, THICKET.y + 26],
              [THICKET.x + x - lean / 2, THICKET.y + 26 - height * 0.55],
              [
                THICKET.x + x + lean + sway(index + 2) + spread(x),
                THICKET.y + 26 - height,
              ],
              19,
            )}
            fill={
              index % 3 === 1
                ? interpolateColors(
                    daylight,
                    [0, 0.5],
                    [nightPalette.grass.orange, richPalette.grass.orange],
                  )
                : lightOf("grass", daylight)
            }
          />
        ))}
      </SvgLayer>
    </>
  );
};

type StalkerProps = {
  /** Quanto os olhos estão acesos, de 0 a 1. */
  readonly lit: number;
  /** Quanto a sombra saiu da moita, na direção do bicho, de 0 a 1. */
  readonly out?: number;
  /** Quanto da sombra já se vê, de 0 a 1. */
  readonly shown?: number;
  readonly seconds: number;
};

/** O predador: uma sombra sem rosto dentro da moita e dois olhos, os mesmos do primeiro ícone da fila. */
export const Stalker: React.FC<StalkerProps> = ({
  lit,
  out = 0,
  shown = 1,
  seconds,
}) => {
  const x = THICKET.x + 10 - 90 * out;
  const y = THICKET.y - 6;
  return (
    <SvgLayer>
      {/* Só a cabeça e os ombros, agachados: o resto fica dentro do capim. */}
      <g
        transform={`translate(${x} ${y}) scale(0.5)`}
        fill={savanna.night.contact}
        opacity={shown * (0.7 + 0.3 * out)}
      >
        <path d="M-150,40 C-156,-90 -110,-190 -20,-200 C60,-196 150,-130 300,-110 C380,-100 420,-40 420,40 Z" />
        <path d="M-110,-160 L-128,-246 L-58,-196 Z M30,-176 L52,-252 L-10,-204 Z" />
      </g>
      {[-17, 17].map((offset) => (
        <ellipse
          key={offset}
          cx={x - 28 + offset}
          cy={y - 66}
          rx={10}
          ry={6.5 * lit * (1 - 0.9 * blink(seconds, "stalker"))}
          fill={ink.moon}
        />
      ))}
    </SvgLayer>
  );
};

// De quão longe ele vem andando até o pé da árvore: de fora do quadro, pela
// direita. A caminhada é a velocidade constante e só freia no fim (`brake` é a
// fração do tempo em que ele ainda não freou); `cycles` são os ciclos de
// passos do caminho inteiro, duas passadas cada um. De longe o andar precisa
// ser largo para ser lido: a passada é maior que a do desenho (`pace`), o corpo
// sobe `bob` pixels a cada passada e balança `pitch` graus, e a cabeça acena.
// Com quatro ciclos e meio cada passada dura 0,24 s; com mais, o sobe-e-desce virava tremor.
const WALK = {
  // Com a câmera deslocada para a direita, fora do quadro é mais longe.
  from: 820,
  seconds: 2.2,
  brake: 0.84,
  cycles: 4.5,
  pace: 1.5,
  bob: 14,
  pitch: 1.3,
  nod: 3.5,
};
// No plano aberto a moita é pequena: o vento a dobra mais, para ela não parecer parada antes de o bicho entrar.
const DUSK_WIND = 13;
// A câmera do plano (decisão do usuário): abre deslocada para a direita, de
// onde o bicho vem, e o acompanha, com peso, até o quadro composto. Não muda a
// escala: é um deslize de `pan` pixels, em 1,8 s, que começa `after` quadros
// depois de ele aparecer e acaba junto com a caminhada.
const FOLLOW = { pan: 110, after: 8, seconds: 1.8 };
/**
 * A savana começa a subir antes de o plano chegar: `lead` quadros antes, sob
 * os ícones da fila que ainda encolhem, para a troca não deixar a tela só com
 * o fundo. Quem desenha esses quadros é o plano anterior, com `DuskPrelude`.
 */
export const DUSK_RISE = { lead: 16, frames: 26 };

/** Quanto da savana do entardecer já subiu, de 0 a 1, no quadro `frame` do plano aberto (negativo antes de ele chegar). */
const duskRisen = (frame: number): number =>
  interpolate(
    frame,
    [-DUSK_RISE.lead, DUSK_RISE.frames - DUSK_RISE.lead],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );

/** A câmera do plano aberto: a deriva lenta para o pé da árvore, mais o deslize que acompanha o bicho. */
const duskCamera = (
  frame: number,
  length: number,
  followAt: number,
  followFrames: number,
): CameraState => {
  const drift = cameraBetween(DEN_WIDE, DEN_WIDE_END, linear(frame, 0, length));
  return {
    ...drift,
    x: drift.x + FOLLOW.pan * (1 - ramp(frame, followAt, followFrames)),
  };
};

type DuskPreludeProps = {
  /** Quantos quadros faltam para o plano aberto da savana começar. */
  readonly until: number;
  /** O quadro do vídeo em que começa o plano que desenha isto: o relógio do cenário. */
  readonly clock: number;
};

/**
 * Os primeiros quadros da subida da savana, para o plano anterior desenhar por
 * baixo do que ele ainda tem na tela: é o mesmo cenário, na mesma câmera e no
 * mesmo ponto da subida em que o plano aberto o assume.
 */
export const DuskPrelude: React.FC<DuskPreludeProps> = ({ until, clock }) => (
  <SavannaShot
    camera={duskCamera(-until, 1, 1, 1)}
    daylight={0.5}
    orb={DUSK_ORB.from}
    clock={clock}
    risen={duskRisen(-until)}
    bare
  >
    <DuskThicket clock={clock} />
  </SavannaShot>
);

/** A moita do entardecer, no relógio do vídeo. */
const DuskThicket: React.FC<{ clock: number }> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Thicket daylight={0.5} seconds={(clock + frame) / fps} wind={DUSK_WIND} />
  );
};
// Chegando, ele olha em volta uma vez antes de a noite descer: quanto a cabeça gira, em graus, e por quanto tempo.
const ARRIVAL_LOOK = { degrees: -9, seconds: 0.7 };

/** Quanto do caminho já foi andado, de 0 a 1, com `t` de 0 a 1: reta até `brake`, e dali uma freada que termina parada. */
const walked = (t: number): number => {
  const u = clamp01(t);
  const stop = 1 / (1 - WALK.brake ** 2);
  return u < WALK.brake
    ? 2 * stop * (1 - WALK.brake) * u
    : 1 - stop * (1 - u) ** 2;
};

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do cenário. */
  readonly clock: number;
};

type DuskShotProps = ShotClock & {
  /** Quadro do plano em que ele entra andando. */
  readonly walkAt: number;
};

/** A savana ao entardecer, de longe: o bicho caminha sozinho para debaixo da árvore. */
const DuskShot: React.FC<DuskShotProps> = ({ walkAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const t = (frame - walkAt) / (WALK.seconds * fps);
  const arrived = walked(t);
  // A passada encurta na freada, junto com a velocidade, e ele para com as quatro patas no chão.
  const slowing = clamp01((1 - t) / (1 - WALK.brake));
  const pace = WALK.pace * slowing;
  const gait = WALK.cycles * arrived;
  // A cada passada o corpo balança para a frente e a cabeça acena; os dois morrem na freada.
  const step = Math.sin(gait * Math.PI * 4);
  const stopAt = walkAt + WALK.seconds * fps;
  // Parado, o peso ainda vai um pouco à frente e volta; depois ele ergue a cabeça e olha em volta.
  const halt = (frame - stopAt) / (0.4 * fps);
  const sway =
    halt <= 0 || halt >= 1
      ? 0
      : -2.4 * (1 - halt) * Math.sin(halt * Math.PI * 2);
  const look = (frame - stopAt - 2) / (ARRIVAL_LOOK.seconds * fps);
  const looking =
    look <= 0 || look >= 1
      ? 0
      : ARRIVAL_LOOK.degrees * Math.sin(Math.PI * look) ** 2;

  return (
    <SavannaShot
      camera={duskCamera(
        frame,
        length,
        walkAt + FOLLOW.after,
        FOLLOW.seconds * fps,
      )}
      daylight={0.5}
      orb={mix(DUSK_ORB.from, DUSK_ORB.to, linear(frame, 0, length))}
      clock={clock}
      risen={duskRisen(frame)}
    >
      <Thicket daylight={0.5} seconds={seconds} wind={DUSK_WIND} />
      <Critter
        daylight={0.5}
        x={DEN.x + WALK.from * (1 - arrived)}
        gait={gait}
        pace={pace}
        bob={WALK.bob}
        lean={sway + WALK.pitch * slowing * step}
        head={looking + WALK.nod * slowing * step}
        seconds={seconds}
      />
    </SavannaShot>
  );
};

type LyingShotProps = ShotClock & {
  /** Quadros do plano em que ele se deita e em que fecha os olhos. */
  readonly lieAt: number;
  readonly closeAt: number;
};

/** A noite desce sobre a savana enquanto a câmera chega ao bicho; ele se enrosca sob a árvore e fecha os olhos. */
const LyingShot: React.FC<LyingShotProps> = ({ lieAt, closeAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A câmera parte de onde a deriva do plano aberto a deixou.
  const camera = cameraBetween(
    DEN_WIDE_END,
    cameraBetween(DEN_MEDIUM, DEN_MEDIUM_END, linear(frame, 0, length)),
    ramp(frame, 0, 0.7 * fps),
  );
  // O vento largo do plano aberto volta ao de sempre enquanto a câmera chega: a moita não salta na troca.
  const wind = mix(DUSK_WIND, 6, ramp(frame, 0, 0.7 * fps));
  // Fechados os olhos, ele solta um suspiro: o corpo enche e esvazia uma vez, devagar.
  const sigh = (frame - closeAt - 0.3 * fps) / (0.7 * fps);
  const sighing = sigh <= 0 || sigh >= 1 ? 0 : Math.sin(Math.PI * sigh) ** 2;

  return (
    <Sweep
      wipe={NIGHTFALL}
      under={
        // O entardecer do plano anterior, no último quadro dele, visto pela câmera deste.
        <SavannaShot
          camera={camera}
          daylight={0.5}
          orb={DUSK_ORB.to}
          clock={clock}
        >
          <Thicket daylight={0.5} seconds={seconds} wind={wind} />
          <Critter daylight={0.5} seconds={seconds} />
        </SavannaShot>
      }
    >
      <SavannaShot camera={camera} daylight={0} orb={NIGHT_ORB} clock={clock}>
        <Thicket daylight={0} seconds={seconds} wind={wind} />
        <Critter
          daylight={0}
          rest={ramp(frame, lieAt, 0.6 * fps)}
          asleep={ramp(frame, closeAt, 0.3 * fps)}
          squash={1 + 0.05 * sighing}
          ear={0.25 * sighing}
          seconds={seconds}
        />
      </SavannaShot>
    </Sweep>
  );
};

// O ronco sai da cabeça dele, pousada no chão, e sobe para o céu livre.
const SNORE = { x: 800, y: 300, size: 200, shrink: 0.22, tilt: -12 };
// Os três "z" sobem um depois do outro, com este intervalo em segundos.
const SNORE_STEP = 0.25;

type SnoreProps = {
  /** Quadro do plano em que o primeiro "z" sobe. */
  readonly at: number;
  readonly seconds: number;
};

/**
 * O ronco, em três tempos: cada "z" estoura na sua vez, menor e mais alto que
 * o anterior, e fica boiando. O desenho é o de `Onomatopoeia` com `fade`; aqui
 * as letras entram separadas, e por isso são escritas uma a uma.
 */
const Snore: React.FC<SnoreProps> = ({ at, seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        rotate: `${SNORE.tilt}deg`,
        fontFamily: typography.family,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: sound.cool,
        WebkitTextStroke: `${SNORE.size * 0.14}px ${sound.edge}`,
        paintOrder: "stroke fill",
      }}
    >
      {[0, 1, 2].map((index) => {
        const born = at + index * SNORE_STEP * fps;
        return (
          <span
            key={index}
            style={{
              fontSize: SNORE.size * (1 - SNORE.shrink) ** index,
              // Cada letra sobe mais que a anterior, e as três boiam fora de fase.
              translate: `0 ${-SNORE.size * (0.12 * (1 - (index - 1) ** 2) + SNORE.shrink * index * 0.9) + 6 * wave(seconds, 2.6, index / 3)}px`,
              rotate: `${(index - 1) * 5 + 2 * wave(seconds, 3.4, index / 4)}deg`,
              opacity: popOpacity(frame, born, frames),
              scale: popScale(frame, born, frames, 0.4, 1.15),
            }}
          >
            z
          </span>
        );
      })}
    </div>
  );
};

type AsleepShotProps = ShotClock & {
  /** Quadros do plano em que o ronco sobe e em que o capim se mexe. */
  readonly snoreAt: number;
  readonly stirAt: number;
};

/** De perto, ele ressona; atrás dele, o capim se abre e fecha, e ele continua igual. */
const AsleepShot: React.FC<AsleepShotProps> = ({ snoreAt, stirAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // Abre depressa e fecha mais devagar, em 0,6 s: alguém passou por dentro.
  const parted = interpolate(
    frame,
    [stirAt, stirAt + 0.2 * fps, stirAt + 0.6 * fps],
    [0, 1, 0],
    {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    },
  );

  return (
    <>
      <SavannaShot
        camera={cameraBetween(
          DEN_MEDIUM_END,
          DEN_CLOSE,
          ramp(frame, 0, 0.8 * fps),
        )}
        daylight={0}
        orb={mix(NIGHT_ORB, LATE_ORB, linear(frame, 0, length))}
        clock={clock}
      >
        {/* Só o capim se mexe: quem está nele aparece na cena seguinte. */}
        <Thicket
          daylight={0}
          seconds={seconds}
          stir={0.5 * parted}
          part={parted}
        />
        <Critter daylight={0} rest={1} asleep={1} seconds={seconds} />
      </SavannaShot>
      {/* O ronco não entra com o plano: sobe na fala. Sai encolhendo, como o resto do que está solto. */}
      <Stay only="entering">
        <Place x={SNORE.x} y={SNORE.y}>
          <Snore at={snoreAt} seconds={seconds} />
        </Place>
      </Stay>
    </>
  );
};

export const NightFallsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o bicho vai para debaixo da árvore">
      <DuskShot walkAt={cue(scene, "bicho")} clock={scene.from} />
    </Shot>
    <Shot range={shots[1]} name="anoitece e ele se deita">
      <LyingShot
        lieAt={cue(scene, "deita") - shots[1].from}
        closeAt={cue(scene, "fecha") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="ele ressona; o capim se mexe">
      <AsleepShot
        snoreAt={cue(scene, "horas") - shots[2].from}
        stirAt={cue(scene, "perceber") - shots[2].from}
        clock={scene.from + shots[2].from}
      />
    </Shot>
  </>
);
