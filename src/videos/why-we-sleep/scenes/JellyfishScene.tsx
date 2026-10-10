import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brain } from "../../../art/Brain";
import { Cassiopea, type CassiopeaColors } from "../../../art/Cassiopea";
import {
  Build,
  cameraBetween,
  framing,
  seenAt,
  type CameraState,
} from "../../../components/Camera";
import { Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import {
  cue,
  linear,
  mix,
  ramp,
  settle,
  shake,
  clamp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, jellyfish, lagoon, blend } from "../palette";
import { InsideBackdrop } from "../parts/InsideBackdrop";
import { JELLYFISH_SPOT } from "../parts/Lagoon";
import { FISH_WATCHING, LAGOON } from "../parts/lagoonCameras";
import { LagoonShot, type FishSpot } from "../parts/LagoonShot";
import { PULSES_AWAKE, pulseCycles, pulseShape, steady } from "../parts/pulse";
import { Tag } from "../parts/Tag";
import { NEVER, Preluded, Standing, flash } from "./MaybeBrainScene";

// A lagoa abre deslizando do lado por onde o peixe entra até o enquadramento aberto.
const SLIDE_SECONDS = 1.6;
// O peixe entra pela direita e para ao vê-la.
const FISH_ARRIVES = { x: 1290, y: 560 };
const FISH_FROM = { x: 2080, y: 610 };
const FISH_SWIM_SECONDS = 0.9;

// A abertura fica mais perto que o plano aberto da lagoa: a água-viva precisa
// de ao menos um quarto da altura do quadro para ser o assunto.
const OPENING = {
  start: framing([1120, 620], 1.5, [960, 580]),
  wide: framing([900, 620], 1.36, [900, 600]),
  end: framing([880, 660], 1.42, [900, 620]),
} as const;

// A chegada dela, em relação ao lugar de pouso: de onde vem (fora do quadro, à
// esquerda), a que altura atravessa a água, quanto o corpo se inclina na
// direção em que nada e quanto ela avança a cada pulso.
const SWIM = { from: -980, height: -330, sink: 70, lean: 32, surge: 26 };
const TURN_SECONDS = 0.8;
// Do centro do desenho dela até a areia, em relação à largura do sino.
const RESTING = 62 / 330;
// A nuvem de areia do pouso: quantos tufos, quanto dura e até onde se espalha.
const PUFF = { count: 7, seconds: 0.8, reach: 150 };

type ArrivalShotProps = {
  /** Quadros do plano em que ela entra nadando, em que começa a virar, em que pousa e em que o peixe entra. */
  readonly swimAt: number;
  readonly turnAt: number;
  readonly landAt: number;
  readonly fishAt: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
};

/** A lagoa rasa: ela entra nadando de cabeça para cima, vira e pousa; o peixe entra e para ao vê-la. */
const ArrivalShot: React.FC<ArrivalShotProps> = ({
  swimAt,
  turnAt,
  landAt,
  fishAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const slideFrames = SLIDE_SECONDS * fps;
  const camera =
    frame < slideFrames
      ? cameraBetween(OPENING.start, OPENING.wide, ramp(frame, 0, slideFrames))
      : cameraBetween(
          OPENING.wide,
          OPENING.end,
          (frame - slideFrames) / (length - slideFrames),
        );
  const cycles = pulseCycles(clock + frame, fps, steady(PULSES_AWAKE));
  const turnFrames = TURN_SECONDS * fps;
  // Ela atravessa a água freando até ficar sobre o lugar de pouso, no fim da virada; cada pulso a empurra um pouco.
  const across = interpolate(frame, [swimAt, turnAt + turnFrames], [0, 1], {
    ...clamp,
    easing: (t) => 1 - (1 - t) ** 2,
  });
  const turned = ramp(frame, turnAt, turnFrames);
  // Só desce depois de começar a virar, e chega à areia devagar.
  const sunk = ramp(frame, turnAt + 6, landAt - turnAt - 6);
  const swimming = 1 - ramp(frame, turnAt - 8, 16);
  const arrival = {
    x:
      SWIM.from * (1 - across) -
      SWIM.surge * swimming * Math.sin(cycles * Math.PI * 2),
    y:
      (SWIM.height + SWIM.sink * across) * (1 - sunk) +
      8 * swimming * Math.sin(cycles * Math.PI * 2 + 1),
    turned,
    lean: SWIM.lean * swimming,
    shadow: ramp(frame, landAt - 18, 18),
  };
  // O peixe freia ao vê-la: o corpo empina, a cauda para, e só então ele pisca.
  const swim = settle(frame, fishAt, FISH_SWIM_SECONDS * fps);
  const braked = fishAt + 0.45 * fps;
  const { x, y, width } = JELLYFISH_SPOT;
  const sand = lagoon.day.sand;

  return (
    <LagoonShot
      time="day"
      camera={camera}
      clock={clock}
      rhythm={steady(PULSES_AWAKE)}
      arrival={arrival}
      fish={{
        x: mix(FISH_FROM.x, FISH_ARRIVES.x, swim),
        y: mix(FISH_FROM.y, FISH_ARRIVES.y, swim),
        width: FISH_WATCHING.width,
        look: [-0.8, 0.5],
        swimming: frame < braked,
        tilt: shake(frame, braked - 4, 0.6 * fps, 9, 1.5),
        lid: flash(frame, braked + 4, 6),
      }}
    >
      {/* A nuvem de areia do pouso: nasce pequena sob o sino e cresce enquanto se afasta. */}
      {frame >= landAt && frame < landAt + PUFF.seconds * fps ? (
        <SvgLayer>
          {Array.from({ length: PUFF.count }, (_, index) => {
            const age = (frame - landAt) / (PUFF.seconds * fps);
            const side = (index / (PUFF.count - 1)) * 2 - 1;
            const spread = 1 - (1 - age) ** 2;
            return (
              <circle
                key={index}
                cx={
                  x +
                  side * width * 0.42 +
                  side *
                    PUFF.reach *
                    spread *
                    (0.6 + 0.4 * random(`puff-${index}`))
                }
                cy={
                  y +
                  width * RESTING -
                  spread * (20 + 46 * random(`puff-rise-${index}`))
                }
                r={(8 + 20 * random(`puff-size-${index}`)) * (0.4 + spread)}
                fill={sand[index % 2]}
                opacity={0.8 * (1 - age)}
              />
            );
          })}
        </SvgLayer>
      ) : null}
    </LagoonShot>
  );
};

// A etiqueta fica no vazio à esquerda dela, ligada ao sino por uma linha.
const NAME = { x: 300, y: 540, to: [588, 614] as const };
const CAMERA_SECONDS = 0.8;
// O plano médio deriva um pouco na direção dela até o fim.
const MEDIUM_END = framing([860, 640], 1.95, [900, 560]);

/** O enquadramento do plano médio num quadro dele: chega com peso e depois deriva devagar. */
const mediumCamera = (
  frame: number,
  length: number,
  fps: number,
): CameraState =>
  cameraBetween(
    OPENING.end,
    cameraBetween(LAGOON.medium, MEDIUM_END, frame / length),
    ramp(frame, 0, CAMERA_SECONDS * fps),
  );

/** O peixe do plano médio: chega mais perto para olhar e acompanha um anel com o olho. */
const watchingFish = (frame: number, fps: number, ring: number): FishSpot => {
  const near = ramp(frame, 0, CAMERA_SECONDS * fps);
  return {
    x: mix(FISH_ARRIVES.x, FISH_WATCHING.x, near),
    y: mix(FISH_ARRIVES.y, FISH_WATCHING.y, near),
    width: FISH_WATCHING.width,
    swimming: near > 0.05 && near < 0.9,
    // O olho segue o anel que sai dela e volta para o seguinte.
    look: [-0.85 + 0.55 * ring, 0.35 + 0.2 * ring],
  };
};

type PulseShotProps = {
  /** Quadros do plano em que o nome entra e em que os anéis começam a sair. */
  readonly nameAt: number;
  readonly ringsAt: number;
  readonly clock: number;
};

/** Ela de perto, pousada, de braços para cima: cada pulso solta um anel na água. */
const PulseShot: React.FC<PulseShotProps> = ({ nameAt, ringsAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const cycles = pulseCycles(clock + frame, fps, steady(PULSES_AWAKE));
  // A linha sai do sino e chega à etiqueta junto com o estouro dela; na saída, recolhe.
  const drawn = ramp(frame, nameAt, 8) * (1 - stage.leave());
  const from = NAME.to;
  const to = [NAME.x + 200, NAME.y + 30] as const;

  return (
    <AbsoluteFill>
      {/* A lagoa não desce no fim: o plano seguinte parte dela e atravessa o sino. */}
      <Standing>
        <LagoonShot
          time="day"
          camera={mediumCamera(frame, length, fps)}
          clock={clock}
          rhythm={steady(PULSES_AWAKE)}
          rings
          ringsFrom={clock + ringsAt}
          fish={watchingFish(
            frame,
            fps,
            frame >= ringsAt ? ((cycles % 1) + 1) % 1 : 0,
          )}
        />
      </Standing>
      <SvgLayer>
        {drawn > 0 ? (
          <g>
            <path
              d={`M${from[0]},${from[1]} L${mix(from[0], to[0], drawn)},${mix(from[1], to[1], drawn)}`}
              stroke={ink.moon}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <circle cx={from[0]} cy={from[1]} r={12 * drawn} fill={ink.moon} />
          </g>
        ) : null}
      </SvgLayer>
      <Stay only="entering">
        <Place x={NAME.x} y={NAME.y}>
          <Pop at={nameAt + 4}>
            <Tag size="label" on="night">
              {/* Nome científico vai em itálico. */}
              <span style={{ fontStyle: "italic" }}>Cassiopea</span>
            </Tag>
          </Pop>
        </Place>
      </Stay>
    </AbsoluteFill>
  );
};

/** Ela por dentro: onde fica e de que largura, com o contorno do cérebro que não está lá. */
const INSIDE = { x: 960, y: 700, width: 1150 };
const NO_BRAIN = { x: 960, y: 330, width: 330 };
// A câmera atravessa o sino: vai do plano médio até ela ficar do tamanho de "por dentro", no lugar dela.
const THROUGH = framing(
  [JELLYFISH_SPOT.x, JELLYFISH_SPOT.y],
  INSIDE.width / JELLYFISH_SPOT.width,
  [INSIDE.x, INSIDE.y],
);
const CROSS_FRAMES = 18;
// Depois de atravessar, a aproximação lenta do plano, na direção do contorno vazio.
const INSIDE_FOCUS = [INSIDE.x, INSIDE.y - 120] as const;
const INSIDE_PUSH = 0.08;
const NET_SECONDS = 1.2;
// O contorno sai nos últimos quadros do plano: estes depois de a saída do palco começar.
const OUTLINE_LEAVES = 10;

type InsideViewProps = {
  /** O instante e a contagem de pulsos, no relógio do vídeo. */
  readonly seconds: number;
  readonly cycles: number;
  /** A aproximação lenta, em volta do contorno: 1 é o quadro composto. */
  readonly zoom?: number;
  /** Quanto o contorno do cérebro já se desenhou, e quanto a rede já acendeu e se espalhou, de 0 a 1. */
  readonly outline?: number;
  readonly nerves?: number;
  readonly spread?: number;
  /** A pintura dela e onde está, para o plano que chega atravessando o sino. Por padrão, a de noite, no lugar. */
  readonly colors?: CassiopeaColors;
  readonly at?: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
  };
  /** Quanto o fundo índigo já tomou o quadro, de 0 a 1. */
  readonly backdrop?: number;
  /** Quanto o contorno já saiu de cena, de 0 a 1: encolhe no próprio ponto. */
  readonly outlineGone?: number;
};

/**
 * "Por dentro" do sino, desenhado por valores: o fundo índigo, ela grande e
 * translúcida, a rede acesa e o contorno do cérebro que não está lá. É o
 * plano 3 desta cena e, de trás para a frente, a abertura de
 * `jellyfish-night`, que recua dele até a lagoa de noite.
 */
const InsideView: React.FC<InsideViewProps> = ({
  seconds,
  cycles,
  zoom = 1,
  outline = 1,
  nerves = 1,
  spread = 1,
  colors = jellyfish.night,
  at = INSIDE,
  backdrop = 1,
  outlineGone = 0,
}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ opacity: backdrop }}>
      <InsideBackdrop seconds={seconds} />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        transformOrigin: `${INSIDE_FOCUS[0]}px ${INSIDE_FOCUS[1]}px`,
        scale: `${zoom}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: at.x,
          top: at.y,
          translate: "-50% -50%",
        }}
      >
        <Cassiopea
          width={at.width}
          colors={colors}
          pulse={pulseShape(cycles)}
          sway={0.5 * wave(seconds, 5)}
          nerves={nerves}
          spread={spread}
          twinkle={seconds}
        />
      </div>
      {outline > 0 && outlineGone < 1 ? (
        <div
          style={{
            position: "absolute",
            left: NO_BRAIN.x,
            top: NO_BRAIN.y + 6 * wave(seconds, 2.4),
            translate: "-50% -50%",
            rotate: `${-6 + 1.2 * wave(seconds, 4.1, 0.3)}deg`,
            scale: `${1 - outlineGone}`,
            // O contorno se desenha da esquerda para a direita, tracejado por tracejado.
            clipPath:
              outline < 1
                ? `inset(-20% ${(1 - outline) * 120 - 10}% -20% -10%)`
                : undefined,
          }}
        >
          <Brain width={NO_BRAIN.width} color={ink.paper} dashed folds />
        </div>
      ) : null}
    </AbsoluteFill>
  </AbsoluteFill>
);

/**
 * O enquadramento da lagoa que põe a água-viva onde o último quadro de "por
 * dentro" a deixa, com a aproximação lenta do plano já feita: é de onde a
 * câmera de `jellyfish-night` recua.
 */
export const INSIDE_END = framing(
  [JELLYFISH_SPOT.x, JELLYFISH_SPOT.y],
  (INSIDE.width * (1 + INSIDE_PUSH)) / JELLYFISH_SPOT.width,
  [
    INSIDE_FOCUS[0] + (INSIDE.x - INSIDE_FOCUS[0]) * (1 + INSIDE_PUSH),
    INSIDE_FOCUS[1] + (INSIDE.y - INSIDE_FOCUS[1]) * (1 + INSIDE_PUSH),
  ],
);

type InsideLeavingProps = {
  /** A câmera da lagoa, que recua: ela fica onde a câmera a vê. */
  readonly camera: CameraState;
  /** O instante e a contagem de pulsos, no relógio do vídeo. */
  readonly seconds: number;
  readonly cycles: number;
  /** Quanto de "por dentro" já ficou para trás, de 0 a 1: o índigo abre e a rede apaga. */
  readonly left: number;
};

/**
 * "Por dentro" saindo de cima da lagoa: o caminho de `InsideShot` ao
 * contrário. A cena seguinte o desenha sobre a lagoa dela enquanto a câmera
 * recua do sino: o índigo abre, a rede apaga e o corpo volta a ser opaco.
 */
export const InsideLeaving: React.FC<InsideLeavingProps> = ({
  camera,
  seconds,
  cycles,
  left,
}) => {
  const [x, y] = seenAt(camera, [JELLYFISH_SPOT.x, JELLYFISH_SPOT.y]);
  return (
    <InsideView
      seconds={seconds}
      cycles={cycles}
      outline={0}
      nerves={1 - left}
      at={{ x, y, width: JELLYFISH_SPOT.width * camera.zoom }}
      backdrop={1 - left}
    />
  );
};

type InsideShotProps = {
  /** Quadros do plano em que o contorno se desenha e em que a rede de neurônios acende. */
  readonly outlineAt: number;
  readonly netAt: number;
  /** O quadro do plano anterior em que os anéis começaram a sair, e a duração dele: a lagoa é redesenhada como ele a deixou. */
  readonly ringsFrom: number;
  readonly before: number;
  readonly clock: number;
};

/** Por dentro do sino: a câmera o atravessa, o fundo passa ao índigo, e ali estão o contorno de um cérebro que não existe e a rede de neurônios. */
const InsideShot: React.FC<InsideShotProps> = ({
  outlineAt,
  netAt,
  ringsFrom,
  before,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const cycles = pulseCycles(clock + frame, fps, steady(PULSES_AWAKE));
  const crossing = ramp(frame, 0, CROSS_FRAMES);
  const camera = cameraBetween(MEDIUM_END, THROUGH, crossing);
  const [x, y] = seenAt(camera, [JELLYFISH_SPOT.x, JELLYFISH_SPOT.y]);
  const indigo = linear(frame, 3, CROSS_FRAMES - 5);

  return (
    <AbsoluteFill>
      {/* A lagoa do plano anterior, por baixo, enquanto a câmera entra no sino: o fundo índigo toma o quadro por cima dela. */}
      {frame < CROSS_FRAMES ? (
        <Build>
          <LagoonShot
            time="day"
            camera={camera}
            // O relógio do plano anterior, que continua: o peixe e os anéis ficam onde ele os deixou.
            clock={clock}
            rhythm={steady(PULSES_AWAKE)}
            rings
            ringsFrom={ringsFrom}
            fish={{
              ...watchingFish(before, fps, ((cycles % 1) + 1) % 1),
              swimming: false,
            }}
            absent
          />
        </Build>
      ) : null}
      <InsideView
        seconds={seconds}
        cycles={cycles}
        zoom={
          1 + INSIDE_PUSH * linear(frame, CROSS_FRAMES, length - CROSS_FRAMES)
        }
        outline={ramp(frame, outlineAt, 0.6 * fps)}
        nerves={ramp(frame, netAt, 0.3 * fps)}
        spread={linear(frame, netAt, NET_SECONDS * fps)}
        colors={blend(jellyfish.day, jellyfish.night, indigo)}
        at={{ x, y, width: JELLYFISH_SPOT.width * camera.zoom }}
        backdrop={indigo}
        // O contorno é o que está solto neste plano: encolhe no ponto dele logo antes de a cena seguinte recuar daqui.
        outlineGone={stage.leave(OUTLINE_LEAVES)}
      />
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `maybe-brain` o desenha com `Prelude`, e a lagoa já sobe enquanto o laboratório desce. `clock` é o quadro do vídeo em que a cena começa.
 */
export const JellyfishOpening: React.FC<{ clock: number }> = ({ clock }) => (
  <ArrivalShot
    swimAt={NEVER}
    turnAt={NEVER + 100}
    landAt={NEVER + 200}
    fishAt={NEVER}
    clock={clock}
  />
);

export const JellyfishScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const turnAt = cue(scene, "água");
  const ringsAt = cue(scene, "pulsando") - shots[1].from;
  return (
    <>
      <Shot range={shots[0]} name="ela chega nadando, vira e pousa">
        <Preluded>
          <ArrivalShot
            swimAt={cue(scene, "pesquisadores")}
            turnAt={turnAt}
            // Pousa com a virada já feita.
            landAt={Math.max(cue(scene, "Cassiopéia"), turnAt + 1 * fps)}
            fishAt={cue(scene, "Ela")}
            clock={scene.from}
          />
        </Preluded>
      </Shot>
      <Shot range={shots[1]} name="de perto: cada pulso, um anel">
        <PulseShot
          // A etiqueta espera a câmera assentar.
          nameAt={CAMERA_SECONDS * fps - 4}
          ringsAt={ringsAt}
          clock={scene.from + shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="por dentro: uma rede, sem cérebro">
        <InsideShot
          outlineAt={CROSS_FRAMES - 4}
          netAt={cue(scene, "rede") - shots[2].from}
          ringsFrom={scene.from + shots[1].from + ringsAt}
          before={shots[1].to - shots[1].from}
          clock={scene.from + shots[2].from}
        />
      </Shot>
    </>
  );
};
