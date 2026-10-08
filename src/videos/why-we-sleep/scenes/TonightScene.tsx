import { useId } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { idea, ink, personInPajamas, street } from "../palette";
import { Bed } from "../parts/Bed";
import {
  chalkStamp,
  Chalkboard,
  Researcher,
  type Box,
} from "../parts/Chalkboard";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Tag } from "../parts/Tag";
import {
  NEVER,
  Preluded,
  Sooner,
  flash,
  shake,
  useCastScale,
} from "./MaybeBrainScene";
import { Drift } from "./SleepDebtScene";

// O quadro do gancho, agora com ele ao lado: o quadro encolhe para dar lugar a quem disse a frase.
const RECALL_BOARD: Box = { x: 770, y: 140, width: 1030, height: 720 };
// De perto: o carimbo no meio do quadro, com os ramos e os olhos fechados em volta.
const CLOSE_BOARD: Box = { x: -500, y: -330, width: 2100, height: 1220 };
// Ele, ao lado do quadro: os pés, a altura e onde fica o nome.
const HIM = { x: 330, y: 1040, height: 680, name: [124, -800] } as const;
const RECALL_FOCUS = [1100, 520] as const;
// Ele e o quadro já estão no lugar quando o nome dele soa.
const RECALL_SOONER = 14;
const REACH_SECONDS = 0.6;
// A câmera fecha no carimbo em 0,7 s; depois, a aproximação lenta continua pelos dois planos de perto.
const CLOSING_SECONDS = 0.7;
const CLOSE_FOCUS = [1000, 600] as const;
const CLOSE_PUSH = 0.05;
// O carimbo treme uma vez: quantos graus, quantas idas e voltas, em quantos quadros.
const TREMBLE = { degrees: 5, turns: 2, frames: 14 };
// O carimbo perde a cor em 1,5 s.
const FADE_SECONDS = 1.5;

/** O quadro-negro a caminho do plano aberto para o de perto: é a câmera fechando no carimbo. */
const boardAt = (closed: number): Box => ({
  x: mix(RECALL_BOARD.x, CLOSE_BOARD.x, closed),
  y: mix(RECALL_BOARD.y, CLOSE_BOARD.y, closed),
  width: mix(RECALL_BOARD.width, CLOSE_BOARD.width, closed),
  height: mix(RECALL_BOARD.height, CLOSE_BOARD.height, closed),
});

/** Onde ele fica com o quadro em `box`: preso ao quadro, cresce com ele e sai pela esquerda quando a câmera fecha. */
const himAt = (box: Box) => {
  const scale = box.width / RECALL_BOARD.width;
  return {
    x: box.x + (HIM.x - RECALL_BOARD.x) * scale,
    y: box.y + (HIM.y - RECALL_BOARD.y) * scale,
    height: HIM.height * scale,
  };
};

type RecallShotProps = {
  /** Quadros do plano em que o nome dele entra e em que ele ergue o braço para o quadro. */
  readonly nameAt: number;
  readonly reachAt: number;
  readonly clock: number;
};

/** O quadro-negro do gancho, com a árvore de olhos fechados e o carimbo, e quem disse a frase. */
const RecallShot: React.FC<RecallShotProps> = ({ nameAt, reachAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const himIn = useCastScale(HIM.x, RECALL_SOONER);
  const reach = ramp(frame, reachAt, REACH_SECONDS * fps);

  return (
    <>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}>
        <Sooner by={RECALL_SOONER}>
          <Drift focus={RECALL_FOCUS}>
            {/* O quadro e ele entram com o plano, mas não saem: o plano seguinte é a câmera fechando neles. */}
            {stage.handedOver ? null : (
              <Stay only="leaving">
                <Cast
                  origin={[
                    RECALL_BOARD.x + RECALL_BOARD.width / 2,
                    RECALL_BOARD.y + RECALL_BOARD.height / 2,
                  ]}
                >
                  <Stay>
                    <Chalkboard
                      box={RECALL_BOARD}
                      stamp="full"
                      doze={seconds}
                    />
                  </Stay>
                </Cast>
                <SvgLayer>
                  <IdeaShadow
                    hue="peach"
                    x={HIM.x}
                    y={HIM.y + 6}
                    width={340 * himIn}
                  />
                </SvgLayer>
                <Researcher
                  x={HIM.x}
                  y={HIM.y}
                  height={HIM.height}
                  reach={reach}
                  // O rosto dele troca quando o braço passa do meio: a pálpebra esconde a troca.
                  lid={flash(frame, reachAt + (REACH_SECONDS * fps) / 2 - 3, 7)}
                />
              </Stay>
            )}
            {/* O nome sai com o plano, antes de a câmera fechar. */}
            <Place x={HIM.x + HIM.name[0]} y={HIM.y + HIM.name[1]}>
              <Pop at={nameAt}>
                <Tag size="note" on="peach">
                  Allan Rechtschaffen
                </Tag>
              </Pop>
            </Place>
          </Drift>
        </Sooner>
      </FlatStage>
      <Grain />
    </>
  );
};

type StampShotProps = {
  /** O quadro do carimbo em que o plano começa: os dois planos de perto são um só, contados daqui. */
  readonly from: number;
  /** Quantos quadros duram os dois planos de perto, juntos. */
  readonly span: number;
  /** Quadros, na mesma contagem, em que o carimbo treme, em que perde a cor e em que a interrogação pequena estoura. */
  readonly trembleAt: number;
  readonly fadeAt: number;
  readonly questionAt: number;
  /** Há quantos quadros ele está no palco, e o relógio da árvore. */
  readonly since: number;
  readonly clock: number;
  /** O último dos dois planos: o quadro sai com ele. */
  readonly last?: boolean;
};

/**
 * De perto, o carimbo "erro?" sobre a árvore: a câmera fecha nele, ele treme
 * uma vez; depois perde a cor aos poucos, a moldura fica tracejada, e sobra a
 * interrogação pequena ao lado do tronco. Os dois planos são o mesmo
 * enquadramento: um desenho só, contado do começo do primeiro.
 */
const StampShot: React.FC<StampShotProps> = ({
  from,
  span,
  trembleAt,
  fadeAt,
  questionAt,
  since,
  clock,
  last = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const at = from + frame;
  const seconds = (clock + at) / fps;
  const closed = ramp(at, 0, CLOSING_SECONDS * fps);
  const box = boardAt(closed);
  const him = himAt(box);
  const stamp = chalkStamp(CLOSE_BOARD);
  const board = (
    <Chalkboard
      box={box}
      stamp="full"
      doze={seconds}
      stampTilt={shake(
        at,
        trembleAt,
        TREMBLE.frames,
        TREMBLE.degrees,
        TREMBLE.turns,
      )}
      stampPulse={flash(at, trembleAt, TREMBLE.frames)}
      faded={ramp(at, fadeAt, FADE_SECONDS * fps)}
      // A interrogação cresce do nada, passa do tamanho e assenta.
      question={interpolate(
        at,
        [questionAt, questionAt + 8, questionAt + 12],
        [0, 1.15, 1],
        {
          ...clamp,
          easing: Easing.out(Easing.quad),
        },
      )}
    />
  );

  return (
    <>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}>
        {stage.handedOver ? null : (
          <Drift focus={CLOSE_FOCUS} zoom={1 + (CLOSE_PUSH * 2 * at) / span}>
            {last ? (
              // O quadro já estava no palco: não entra. Sai encolhendo em volta do carimbo.
              <Stay only="entering">
                <Cast origin={[stamp.x, stamp.y]}>
                  <Stay>{board}</Stay>
                </Cast>
              </Stay>
            ) : (
              <Stay>
                {board}
                {/* Ele sai pela esquerda enquanto a câmera fecha no carimbo. */}
                {closed < 1 ? (
                  <>
                    <SvgLayer>
                      <IdeaShadow
                        hue="peach"
                        x={him.x}
                        y={him.y + 6}
                        width={(340 * him.height) / HIM.height}
                      />
                    </SvgLayer>
                    <Researcher {...him} reach={1} since={since} />
                  </>
                ) : null}
              </Stay>
            )}
          </Drift>
        )}
      </FlatStage>
      <Grain />
    </>
  );
};

// A última imagem do vídeo: a cama no centro, e a janela no alto, à direita, acima do pé da cama.
const SLEEPER = { x: 960, y: 990, scale: 0.9 };
const WINDOW = { x: 1330, y: 110, width: 440, height: 380 };
const ASLEEP_PUSH = { focus: [960, 620], by: 0.06 } as const;
// As estrelas na janela: posição em fração dela.
const STARS = [
  [0.16, 0.2],
  [0.34, 0.52],
  [0.5, 0.16],
  [0.84, 0.6],
  [0.22, 0.78],
] as const;
// A lua espera no canto da janela, meio escondida pela moldura, e passa por ela devagar, a velocidade constante.
const MOON = { from: 0.1, to: 0.72, y: 0.34 };
// A cama e a janela já estão no lugar quando "Hoje à noite" soa, e começam a crescer enquanto o quadro-negro
// ainda encolhe: com 14 quadros sobravam de 2 a 4 só com o fundo.
const ASLEEP_SOONER = 18;

/**
 * Onde a cama está na tela, e de que tamanho, quando o plano termina: a
 * chamada a recebe dali, com o "ZZZ" do tamanho em que a aproximação o deixou.
 */
export const SLEEPER_AT_HANDOVER = {
  x: SLEEPER.x,
  y:
    ASLEEP_PUSH.focus[1] +
    (SLEEPER.y - ASLEEP_PUSH.focus[1]) * (1 + ASLEEP_PUSH.by),
  scale: SLEEPER.scale * (1 + ASLEEP_PUSH.by),
  snoreSize: 150 * (1 + ASLEEP_PUSH.by),
};

type AsleepShotProps = {
  /** Quadros do plano em que o "ZZZ" sobe e em que a lua começa a passar pela janela. */
  readonly snoreAt: number;
  readonly moonAt: number;
  /** O quadro do vídeo em que o plano começa: o relógio da respiração, que continua na chamada. */
  readonly clock: number;
};

/** A pessoa dormindo, no centro, com a janela e a noite lá fora. Fica no silêncio depois da fala. */
const AsleepShot: React.FC<AsleepShotProps> = ({ snoreAt, moonAt, clock }) => {
  const id = useId();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const moon = mix(MOON.from, MOON.to, linear(frame, moonAt, length - moonAt));

  return (
    <Sooner by={ASLEEP_SOONER}>
      <SlowPush
        focus={ASLEEP_PUSH.focus}
        by={ASLEEP_PUSH.by}
        backdrop={<IdeaBackdrop hue="lilac" spot={[0.45, 0.55]} />}
      >
        <Cast
          origin={[WINDOW.x + WINDOW.width / 2, WINDOW.y + WINDOW.height / 2]}
        >
          <SvgLayer>
            <defs>
              <clipPath id={id}>
                <rect {...WINDOW} rx={22} />
              </clipPath>
            </defs>
            {/* A janela: a moldura clara, o céu da noite, a lua e o parapeito. */}
            <rect
              x={WINDOW.x - 16}
              y={WINDOW.y - 16}
              width={WINDOW.width + 32}
              height={WINDOW.height + 32}
              rx={36}
              fill={ink.paper}
            />
            <rect {...WINDOW} rx={22} fill={street.night.sky[0]} />
            <rect
              x={WINDOW.x}
              y={WINDOW.y + WINDOW.height * 0.55}
              width={WINDOW.width}
              height={WINDOW.height * 0.45}
              rx={22}
              fill={street.night.sky[1]}
            />
            {STARS.map(([x, y], index) => {
              // Cada estrela pisca no próprio tempo.
              const twinkle = Math.sin(
                seconds * (1.3 + index * 0.41) + index * 1.9,
              );
              return (
                <circle
                  key={x}
                  cx={WINDOW.x + WINDOW.width * x}
                  cy={WINDOW.y + WINDOW.height * y}
                  r={6 + 2.2 * twinkle}
                  fill={ink.moon}
                  opacity={0.75 + 0.25 * twinkle}
                />
              );
            })}
            <g clipPath={`url(#${id})`}>
              <g
                transform={`translate(${WINDOW.x + WINDOW.width * moon} ${WINDOW.y + WINDOW.height * MOON.y})`}
              >
                <path
                  d="M14,-62 A62,62 0 1 0 62,20 A50,50 0 1 1 14,-62 Z"
                  fill={ink.moon}
                />
              </g>
            </g>
            <rect
              x={WINDOW.x + WINDOW.width / 2 - 7}
              y={WINDOW.y}
              width={14}
              height={WINDOW.height}
              fill={ink.paper}
            />
            <rect
              x={WINDOW.x - 40}
              y={WINDOW.y + WINDOW.height + 8}
              width={WINDOW.width + 80}
              height={30}
              rx={15}
              fill={idea.lilac.spot}
            />
          </SvgLayer>
        </Cast>
        {/* A cama entra com o plano, mas não sai: a chamada a recebe, com a elefanta e a água-viva ao lado. */}
        {stage.handedOver ? null : (
          <Stay only="leaving">
            <Cast origin={[SLEEPER.x, SLEEPER.y]} order={1}>
              <Bed
                {...SLEEPER}
                colors={personInPajamas}
                hue="lilac"
                breath={1 + 0.035 * wave(seconds, 4.4, 0.2)}
                snoreAt={snoreAt}
                snoreDrift={[0, 5 * wave(seconds, 3.1)]}
              />
            </Cast>
          </Stay>
        )}
        <Grain />
      </SlowPush>
    </Sooner>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `what-it-is` o desenha com `Prelude`, e ele e o quadro-negro já crescem enquanto os três encolhem. `clock` é o quadro do vídeo em que a cena começa.
 */
/** Quantos quadros antes da cena ele e o quadro-negro começam a crescer: antes disso a linha do tempo ainda está encolhendo. */
export const RECALL_LEAD = 5;

export const TonightOpening: React.FC<{ clock: number }> = ({ clock }) => (
  <RecallShot nameAt={NEVER} reachAt={NEVER} clock={clock} />
);

export const TonightScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const stampFrom = shots[1].from;
  const close = {
    span: shots[2].to - stampFrom,
    trembleAt: cue(scene, "erro") - stampFrom,
    fadeAt: cue(scene, "erro", 2) - stampFrom,
    questionAt: cue(scene, "longe") - stampFrom,
    since: stampFrom,
    clock: scene.from + stampFrom,
  };
  return (
    <>
      <Shot range={shots[0]} name="o quadro-negro do gancho">
        <Preluded lead={RECALL_LEAD}>
          <RecallShot
            nameAt={cue(scene, "Réctchafen")}
            reachAt={cue(scene, "dizia")}
            clock={scene.from}
          />
        </Preluded>
      </Shot>
      <Shot range={shots[1]} name="o carimbo, de perto">
        <StampShot from={0} {...close} />
      </Shot>
      <Shot range={shots[2]} name="o carimbo perde a cor">
        {/* Continua o plano anterior, no mesmo enquadramento: parte de onde ele parou. */}
        <StampShot from={shots[2].from - stampFrom} last {...close} />
      </Shot>
      <Shot range={shots[3]} name="um bom sono">
        <AsleepShot
          snoreAt={cue(scene, "dormir") - shots[3].from}
          moonAt={cue(scene, "terço") - shots[3].from}
          clock={scene.from + shots[3].from}
        />
      </Shot>
    </>
  );
};
