import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, type Expression } from "../../../art/Person";
import { cameraBetween, framing } from "../../../components/Camera";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Magnifier } from "../parts/Search";
import { FRONT, FRONT_OPENING, ShopFront } from "../parts/ShopFront";
import { Crate } from "../parts/ShopInside";
import { lampAt } from "./ButWhatScene";
import { NEVER, Preluded, flash, shake, Sooner } from "./MaybeBrainScene";
import { Hasten } from "./MemoryTestScene";
import { SEARCH_LEAD, SearchPrelude } from "./NobodyEscapedScene";
import { Drift } from "./SleepDebtScene";

// A loja de longe: a câmera recua com a calçada presa à base do quadro, e chega um pouco mais perto ao longo do plano.
const FAR = framing([960, 1080], 0.78, [960, 1080]);
const FAR_START = framing([960, 1080], 0.75, [960, 1080]);
// Onde a porta de enrolar cai no quadro, com a câmera recuada.
const DOOR = {
  x: FRONT.x,
  y: 1080 + (FRONT_OPENING.y + FRONT_OPENING.height / 2 - 1080) * FAR.zoom,
};
// A lupa vem de fora do quadro, por baixo e pela direita, e para sobre a porta.
const LENS = { from: [2080, 1320], size: 170, seconds: 0.8 };
// Depois passeia devagar pela fachada: quanto vai para cada lado, e os períodos.
const WANDER = { x: 110, y: 50, seconds: [3.1, 2.3] };
// A rua sobe nestes quadros: a fala começa aos 0,4 s.
const STREET_RISE = 15;

type StudiedShotProps = {
  /** Quadros do plano em que a lupa entra e em que passa a passear pela fachada. */
  readonly lensAt: number;
  readonly wanderAt: number;
  readonly clock: number;
};

/** A loja de porta baixada, de longe, com a lupa sobre ela: o que acontece lá dentro ainda se estuda. */
const StudiedShot: React.FC<StudiedShotProps> = ({
  lensAt,
  wanderAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  // A lupa chega com peso, passa um pouco do ponto e assenta.
  const arrive = LENS.seconds * fps;
  const landed =
    ramp(frame, lensAt, arrive) +
    shake(frame, lensAt + arrive, 0.3 * fps, 0.03, 1);
  // O passeio começa do ponto em que ela parou, e ganha amplitude aos poucos.
  const wandering = ramp(frame, wanderAt, 1.2 * fps);
  const since = Math.max(0, frame - wanderAt) / fps;
  const x =
    mix(LENS.from[0], DOOR.x - 20, landed) +
    WANDER.x * wandering * Math.sin((since / WANDER.seconds[0]) * Math.PI * 2);
  const y =
    mix(LENS.from[1], DOOR.y - 10, landed) +
    WANDER.y * wandering * Math.sin((since / WANDER.seconds[1]) * Math.PI * 2) +
    // Parada sobre a porta, ela sobe e desce um pouco: é uma mão que a segura.
    5 * wave(seconds, 2.7);

  return (
    <AbsoluteFill>
      <Hasten frames={STREET_RISE}>
        <ShopFront
          halo={1}
          time="night"
          shutter={1}
          busy
          clock={clock}
          lamp={lampAt(seconds)}
          camera={cameraBetween(FAR_START, FAR, linear(frame, 0, length))}
        />
      </Hasten>
      {/* A lupa do gancho: entra na palavra dela, e sai com o plano, encolhendo onde está. */}
      {frame >= lensAt ? (
        <Stay only="entering">
          <Cast origin={[x, y]}>
            <Magnifier
              x={x}
              y={y}
              size={LENS.size}
              // O cabo balança com o caminho.
              tilt={
                18 * (1 - landed) +
                6 *
                  wandering *
                  Math.cos((since / WANDER.seconds[0]) * Math.PI * 2)
              }
            />
          </Cast>
        </Stay>
      ) : null}
    </AbsoluteFill>
  );
};

// Da cintura para cima, à esquerda; o que ela lembra, num balão, à direita.
const YOU = { x: 700, y: 1330, height: 1100 };
const THOUGHT = { x: 1400, y: 360, size: 430 };
// As bolhas que ligam a cabeça ao balão: o centro e o raio de cada uma.
const TRAIL = [
  [1010, 520, 26],
  [1090, 470, 38],
] as const;
const RECALL_FOCUS = [960, 540] as const;
const YOU_SOONER = 14;
// Ela acorda e se espreguiça: os braços sobem acima da cabeça, o corpo estica, e tudo volta. Em quadros.
const STRETCH = { at: 5, up: 9, hold: 6, down: 9 };
// Os braços dela, nas unidades do desenho da pessoa: soltos, esticados para cima, e o de trás apontando o balão.
const ARMS = {
  front: { loose: [-136, -214, 26], up: [-176, -560, -34] },
  back: {
    loose: [100, -214, 73],
    up: [182, -566, 34],
    point: [238, -418, -24],
  },
} as const;

type RecallShotProps = {
  /** Quadros do plano em que a lembrança aparece e em que ela sorri e aponta. */
  readonly recallAt: number;
  readonly pointAt: number;
  readonly clock: number;
};

/** A pessoa acorda, se espreguiça e reconhece o rosto da etiqueta de uma das caixas. */
const RecallShot: React.FC<RecallShotProps> = ({
  recallAt,
  pointAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const stretched =
    ramp(frame, STRETCH.at, STRETCH.up) -
    ramp(frame, STRETCH.at + STRETCH.up + STRETCH.hold, STRETCH.down);
  const awake = STRETCH.at + STRETCH.up + STRETCH.hold + STRETCH.down;
  // O braço aponta com peso, passa um pouco do ponto e volta: é um gesto.
  const pointing =
    ramp(frame, pointAt, 0.35 * fps) +
    shake(frame, pointAt + 0.35 * fps, 0.3 * fps, 0.07, 1);
  // O rosto de cada momento; cada troca acontece com a pálpebra fechada.
  const expression: Expression =
    frame < STRETCH.at + 3
      ? "asleep"
      : frame < awake - 4
        ? "yawning"
        : frame < recallAt + 3
          ? "sleepy"
          : frame < pointAt + 3
            ? "curious"
            : "neutral";
  const lids = Math.max(
    flash(frame, awake - 7, 6),
    flash(frame, recallAt, 6),
    flash(frame, pointAt, 6),
    frame >= awake ? blink(seconds, "you") : 0,
  );
  const arm = (
    loose: readonly [number, number, number],
    up: readonly [number, number, number],
  ) => ({
    hand: [
      mix(loose[0], up[0], stretched),
      mix(loose[1], up[1], stretched),
    ] as [number, number],
    bend: mix(loose[2], up[2], stretched),
  });
  const back = arm(ARMS.back.loose, ARMS.back.up);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.4, 0.5]} />}>
        {/* O pedestal, o globo e a lupa de `nobody-escaped` entram aqui, por baixo do balão que encolhe: a
            troca de cena não deixa a tela só com o fundo. Quando a cena deles chega, é ela quem os desenha. */}
        {frame >= length - SEARCH_LEAD && !stage.handedOver ? (
          <SearchPrelude until={length - frame} />
        ) : null}
        <Drift focus={RECALL_FOCUS}>
          <Sooner by={YOU_SOONER}>
            <Place
              x={YOU.x}
              y={YOU.y}
              anchor="bottom"
              style={{
                // Espreguiçando, o corpo estica e pende um pouco para trás.
                scale: `1 ${breath(seconds, "you") + 0.035 * stretched}`,
                rotate: `${-2.5 * stretched + 1.5 * pointing}deg`,
              }}
            >
              <Person
                height={YOU.height}
                colors={personInPajamas}
                expression={expression}
                blink={lids}
                frontArm={arm(ARMS.front.loose, ARMS.front.up)}
                backArm={{
                  hand: [
                    mix(back.hand[0], ARMS.back.point[0], pointing),
                    mix(back.hand[1], ARMS.back.point[1], pointing),
                  ],
                  bend: mix(back.bend, ARMS.back.point[2], pointing),
                }}
              />
            </Place>
          </Sooner>
          {/* O balão e as bolhas entram na palavra deles, e saem com o plano. */}
          <Stay only="entering">
            <Cast origin={[TRAIL[0][0], TRAIL[0][1]]}>
              <SvgLayer>
                {TRAIL.map(([x, y, radius], index) => {
                  const at = recallAt + index * 3;
                  return frame >= at ? (
                    <circle
                      key={x}
                      cx={x}
                      cy={y + 4 * wave(seconds, 3.3, index * 0.3)}
                      r={radius * popScale(frame, at, 0.3 * fps, 0, 1.06)}
                      fill={ink.ring}
                    />
                  ) : null;
                })}
              </SvgLayer>
            </Cast>
            {/* O que ela lembra ao acordar: a caixa do depósito, com o rosto na etiqueta. */}
            <Place
              x={THOUGHT.x}
              y={THOUGHT.y + 7 * wave(seconds, 3.3, 0.6)}
              // Quando ela aponta, o balão dá um pulo pequeno.
              style={{ scale: `${1 + 0.05 * flash(frame, pointAt + 8, 10)}` }}
            >
              <Pop at={recallAt + 6}>
                <svg
                  width={THOUGHT.size}
                  height={THOUGHT.size}
                  viewBox="-100 -100 200 200"
                >
                  <circle r={100} fill={ink.ring} />
                  <Crate x={0} y={56} scale={1.15} memory="face" />
                </svg>
              </Pop>
            </Place>
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `stockroom-night` o desenha com `Prelude`, e a rua já sobe enquanto a loja por dentro desce. `clock` é o quadro do vídeo em que a cena começa.
 */
/** Quantos quadros antes da cena a rua começa a subir: a loja por dentro ainda está descendo. */
export const STUDIED_LEAD = 7;

export const StockroomSolidOpening: React.FC<{ clock: number }> = ({
  clock,
}) => <StudiedShot lensAt={NEVER} wanderAt={NEVER + 100} clock={clock} />;

export const StockroomSolidScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a loja de longe, sob a lupa">
      <Preluded lead={STUDIED_LEAD}>
        <StudiedShot
          lensAt={cue(scene, "comparação")}
          wanderAt={cue(scene, "ainda")}
          clock={scene.from}
        />
      </Preluded>
    </Shot>
    <Shot range={shots[1]} name="ela acorda e reconhece o rosto">
      <RecallShot
        recallAt={cue(scene, "ajuda") - shots[1].from}
        pointAt={cue(scene, "você") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
