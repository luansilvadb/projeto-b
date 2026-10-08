import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, type Expression } from "../../../art/Person";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { ink, personInPajamas } from "../palette";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { Crate } from "../parts/ShopInside";
import { NEVER, Preluded, flash, shake } from "./MaybeBrainScene";
import { SEARCH_LEAD, SearchPrelude } from "./NobodyEscapedScene";
import { Drift } from "./SleepDebtScene";

// Da cintura para cima, à esquerda; o que ela lembra, num balão, à direita.
const YOU = { x: 700, y: 1330, height: 1100 };
const THOUGHT = { x: 1400, y: 360, size: 430 };
// As bolhas que ligam a cabeça ao balão: o centro e o raio de cada uma.
const TRAIL = [
  [1010, 520, 26],
  [1090, 470, 38],
] as const;
const RECALL_FOCUS = [960, 540] as const;
// Ela cresce no meio do que se vê dela (os pés ficam abaixo do quadro), e começa `lead` quadros antes da
// cena, desenhada pelo último plano de `stockroom-night`, por cima da loja de dentro que desce: a troca
// não passa por quadro só de fundo. Em quadros.
const YOU_IN = { origin: [YOU.x, 640], frames: 10, lead: 3 } as const;
// Ela acorda e se espreguiça: os braços sobem acima da cabeça, o corpo estica, e tudo volta. Em quadros,
// a partir de `wakeAt`: até lá ela ainda dorme, e é dormindo que a cena a recebe do sonho da loja.
const STRETCH = { up: 9, hold: 6, down: 9 };
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
  /** Quadros do plano em que ela acorda, em que a lembrança aparece e em que ela sorri e aponta. */
  readonly wakeAt: number;
  readonly recallAt: number;
  readonly pointAt: number;
  readonly clock: number;
};

/** A pessoa acorda, se espreguiça e reconhece o rosto da etiqueta de uma das caixas. */
const RecallShot: React.FC<RecallShotProps> = ({
  wakeAt,
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
    ramp(frame, wakeAt, STRETCH.up) -
    ramp(frame, wakeAt + STRETCH.up + STRETCH.hold, STRETCH.down);
  const awake = wakeAt + STRETCH.up + STRETCH.hold + STRETCH.down;
  // O braço aponta com peso, passa um pouco do ponto e volta: é um gesto.
  const pointing =
    ramp(frame, pointAt, 0.35 * fps) +
    shake(frame, pointAt + 0.35 * fps, 0.3 * fps, 0.07, 1);
  // O rosto de cada momento; cada troca acontece com a pálpebra fechada.
  const expression: Expression =
    frame < wakeAt + 3
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
          {/* O palco não a põe: ela cresce por conta própria. Sai com ele. */}
          <Stay only="entering">
            <AbsoluteFill
              style={{
                transformOrigin: `${YOU_IN.origin[0]}px ${YOU_IN.origin[1]}px`,
                // A entrada é contada no palco, e não no plano: ela começa antes dele.
                scale: `${popScale(stage.enter(0, YOU_IN.frames) * YOU_IN.frames, 0, YOU_IN.frames, 0, 1.04)}`,
              }}
            >
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
            </AbsoluteFill>
          </Stay>
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
 * Quantos quadros antes da cena ela começa a crescer, no último plano de `stockroom-night`. O nome é do
 * tempo em que a cena abria na loja de longe, sob a lupa: quem o importa é a cena vizinha.
 */
export const STUDIED_LEAD = YOU_IN.lead;

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de `stockroom-night` o desenha com
 * `Prelude`, e ela já cresce, dormindo, enquanto a loja de dentro desce. `clock` é o quadro do vídeo em
 * que a cena começa.
 */
export const StockroomSolidOpening: React.FC<{ clock: number }> = ({
  clock,
}) => (
  <RecallShot
    wakeAt={NEVER}
    recallAt={NEVER + 100}
    pointAt={NEVER + 200}
    clock={clock}
  />
);

export const StockroomSolidScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <Shot range={shots[0]} name="ela acorda e reconhece o rosto">
    <Preluded lead={YOU_IN.lead}>
      <RecallShot
        // Ela dorme até "sabe", e se espreguiça logo depois: o balão já a encontra acordada.
        wakeAt={cue(scene, "sabe") + 2}
        recallAt={cue(scene, "ajuda")}
        pointAt={cue(scene, "você")}
        clock={scene.from}
      />
    </Preluded>
  </Shot>
);
