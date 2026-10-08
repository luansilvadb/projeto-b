import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Person } from "../../../art/Person";
import { Build, Camera, Layer, useBuild } from "../../../components/Camera";
import { StageContext, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { grown, Pop, POP_SECONDS, popOpacity } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  clamp,
} from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { enterProgress } from "../../../video/stage";
import { chalkboard, ink, daylightTones, sleepResearcher } from "../palette";
import { BALANCE, Balance, ExamSheet, panSpot } from "../parts/ExamSheet";
import { BENCH_Y, LabWall } from "../parts/Laboratory";
import { Rat, RatLab, ratIdle } from "../parts/Rats";
import { Tag } from "../parts/Tag";
import { DISC_LEAD, DiscPrelude } from "./AwakeRecordScene";
import { AlarmClock } from "./ForcedAwakeScene";
import { NEVER, Preluded } from "./MaybeBrainScene";
import { Grow } from "./SleepDebtScene";

// A prancheta do exame é o assunto: grande, à direita; Rechtschaffen, da cintura para cima, à esquerda.
// Ela termina acima do selo da fonte, que ocupa o canto de baixo à direita.
const SHEET = { x: 1250, y: 520, scale: 1.02 };
const RECHTSCHAFFEN = { x: 500, y: 1330, height: 1040 };
// O braço da frente solto, como no desenho da pessoa, e com a mão na cabeça.
const ARM = {
  loose: { hand: [-136, -214], bend: 26 },
  scratching: { hand: [-126, -566], bend: 40 },
} as const;
// Os vistos do exame: o intervalo entre um e o seguinte (0,25 s) e quanto cada um leva para se desenhar, em quadros.
const CHECKS = { count: 4, every: 7.5, frames: 6 };
// A caixa em branco chama a atenção duas vezes: quanto cresce, e o intervalo entre os dois pulsos, em quadros.
const BLANK = { grow: 0.05, frames: 10, gap: 13 };
// A bancada dos ratos sai por baixo no fim do plano anterior; ele e a prancheta entram logo no primeiro
// quadro, cada um na sua vez, para a parede não ficar sozinha: o quadro em que começam e quanto levam.
const ENTER = { him: 0, sheet: 3, frames: 11 };
// Ele e a prancheta saem estes quadros depois da marcação do palco: a balança só cresce quando o plano dela
// chega, e a parede, que fica, passaria esse tempo sozinha.
const LEAVE_LATE = 5;
/** Quantos quadros antes da cena ele começa a entrar, desenhado pelo último plano de `rats-result`. */
export const EXAM_LEAD = 8;
// Ele reage à interrogação um instante depois de ela entrar, e leva estes quadros para levar a mão à cabeça.
const SCRATCH = { after: 4, frames: 11 };

type ExamShotProps = {
  /** Quadros do plano em que os vistos começam, em que a caixa em branco pulsa e em que a interrogação entra. */
  readonly checksAt: number;
  readonly blankAt: number;
  readonly unknownAt: number;
  /** Quantos quadros faltam para o plano começar, quando é a cena anterior quem o desenha, parado no primeiro quadro. */
  readonly until?: number;
};

/**
 * A prancheta de exame: os itens ganham visto, um a um; a linha "causa da
 * morte" fica em branco e, na fala, ganha a interrogação. Rechtschaffen, que
 * acompanhava a prancheta, coça a cabeça.
 */
const ExamShot: React.FC<ExamShotProps> = ({
  checksAt,
  blankAt,
  unknownAt,
  until = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const late = useMemo(
    () => ({
      ...stage,
      leave: (delay = 0) => stage.leave(delay + LEAVE_LATE),
    }),
    [stage],
  );
  const seconds = frame / fps;
  const frames = POP_SECONDS * fps;
  // A entrada começou antes da cena; no prelúdio o plano está parado no quadro 0, e quem anda é `until`.
  const early = until - EXAM_LEAD;
  const checked = Array.from({ length: CHECKS.count }, (_, row) =>
    ramp(frame, checksAt + row * CHECKS.every, CHECKS.frames),
  ).reduce((sum, part) => sum + part, 0);
  const pulse = (at: number) =>
    interpolate(frame, [at, at + 4, at + BLANK.frames], [0, 1, 0], clamp);
  const blank = BLANK.grow * (pulse(blankAt) + pulse(blankAt + BLANK.gap));
  // A interrogação estoura com sobra; a opacidade só acompanha os primeiros quadros.
  const question =
    popOpacity(frame, unknownAt, frames) *
    interpolate(
      frame,
      [unknownAt, unknownAt + frames * 0.7, unknownAt + frames],
      [0.4, 1.2, 1],
      { ...clamp, easing: Easing.out(Easing.quad) },
    );
  // A mão sobe até a cabeça, com peso, e coça.
  const scratchAt = unknownAt + SCRATCH.after;
  const raised = ramp(frame, scratchAt, SCRATCH.frames);
  // A expressão troca no meio da subida do braço, sob a pálpebra fechada.
  const swapAt = scratchAt + 4;
  const lid = interpolate(
    frame,
    [swapAt - 3, swapAt, swapAt + 2, swapAt + 6],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill>
      {/* A parede é o cenário que este plano divide com o da balança (`sets`): fica no palco na troca, parada,
          e a câmera de lá parte daqui. Só o que está na frente dela se aproxima. */}
      <Camera>
        <Layer depth={1}>
          <LabWall />
        </Layer>
      </Camera>
      <StageContext.Provider value={late}>
        <SlowPush focus={[1160, 600]} by={0.05}>
          {/* O mesmo pesquisador de `Researcher`, com a mão na cabeça: a pose que a peça não tem.
          Ele e a prancheta entram por conta própria, antes da marcação do palco, e saem com ela. */}
          <Stay only="entering">
            <Place
              x={RECHTSCHAFFEN.x}
              y={RECHTSCHAFFEN.y}
              anchor="bottom"
              style={{ scale: `1 ${breath(seconds, "rechtschaffen")}` }}
            >
              <Grow
                at={ENTER.him + early}
                frames={ENTER.frames}
                origin="bottom"
              >
                <Person
                  height={RECHTSCHAFFEN.height}
                  colors={sleepResearcher}
                  glasses={ink.dark}
                  // Enquanto os vistos entram, ele acompanha a prancheta com os olhos.
                  expression={frame >= swapAt ? "puzzled" : "curious"}
                  blink={Math.max(lid, blink(seconds, "rechtschaffen"))}
                  frontArm={{
                    hand: [
                      mix(ARM.loose.hand[0], ARM.scratching.hand[0], raised) +
                        8 * raised * wave(seconds, 0.5),
                      mix(ARM.loose.hand[1], ARM.scratching.hand[1], raised),
                    ],
                    bend: mix(ARM.loose.bend, ARM.scratching.bend, raised),
                  }}
                />
              </Grow>
            </Place>
            <Place
              x={SHEET.x}
              y={SHEET.y}
              // O papel balança um nada na mão de quem o segura fora do quadro.
              style={{ rotate: `${3 + 0.5 * wave(seconds, 4.2, 0.4)}deg` }}
            >
              <Grow at={ENTER.sheet + early} frames={ENTER.frames}>
                <ExamSheet
                  scale={SHEET.scale}
                  question={question}
                  checked={checked}
                  blank={blank}
                  // O tracejado da resposta em branco corre devagar: a pergunta continua aberta.
                  dash={frame * 0.5}
                />
              </Grow>
            </Place>
          </Stay>
          <Grain />
        </SlowPush>
      </StageContext.Provider>
    </AbsoluteFill>
  );
};

const SCALE = { x: 960, y: BENCH_Y + 26 };
const PAN_RAT = 250;
// O despertador do prato do estresse: o raio do corpo dele.
const PAN_CLOCK = 62;
const NO_SLEEP = 104;

/**
 * A falta de sono, sem letra: a lua riscada, no desenho dos ícones riscados
 * de `third-of-life` (disco claro, figura escura, risco coral).
 */
const NoSleep: React.FC = () => (
  <svg
    width={NO_SLEEP}
    height={NO_SLEEP}
    viewBox="-52 -52 104 104"
    overflow="visible"
  >
    <circle r={50} fill={ink.paper} />
    <path
      d="M10,-32 A32,32 0 1 0 32,10 A25,25 0 1 1 10,-32 Z"
      fill={daylightTones.night.sky[0]}
    />
    <path
      d="M-34,34 L34,-34"
      stroke={chalkboard.stamp}
      strokeWidth={12}
      strokeLinecap="round"
    />
  </svg>
);

// A balança: quanto o primeiro peso a faz pender, o vaivém que não acaba (graus e quadros de ida e volta)
// e o tremor de quando ainda está vazia.
const SWING = { first: 9, degrees: 6, frames: 66, idle: 1.6 };
// Cada peso cai de cima do quadro até o prato, nestes quadros, e achata ao pousar.
const FALL = { from: 640, frames: 9, squash: 0.14, settle: 7 };
// A câmera: a aproximação com que o plano abre e a com que termina, e quantos pixels ela desliza por grau para o
// lado que pesa. A parede acaba na borda do quadro: o deslize cabe na folga que a aproximação dá.
const WEIGH = { from: 1.025, to: 1.06, slide: 1.8 };
// A saída: a bancada desce com o cenário, e a balança não vai com ela (descendo inclinada, lia como queda).
// Ela fica no ar e encolhe no próprio ponto, sem parar de oscilar: quantos quadros antes da troca começa,
// e quanto leva. `sink` é quanto a camada do assunto desce ao sair (o `SINK` de `components/Camera.tsx`,
// para a profundidade 1): é o que a balança sobe de volta.
const LEAVE = { before: 16, frames: 11, sink: 1300 };
// A entrada: a parede já está no palco, do plano da prancheta. A bancada sobe por baixo, e a balança cresce
// no próprio ponto, em volta do eixo: em quantos quadros.
const ARRIVE = { bench: 12, balanceAt: 0, balance: 13 };

/** A inclinação da balança num quadro do plano: vazia, treme; com o rato, pende para ele; com os dois, vai e volta sem assentar. */
const balanceTilt = (
  frame: number,
  fps: number,
  sleepAt: number,
  stressAt: number,
): number => {
  const idle = SWING.idle * wave(frame / fps, 3.4);
  // O primeiro peso: o braço desce, passa do ponto e volta, com a sobra diminuindo.
  const since = Math.max(0, frame - sleepAt);
  const first =
    -SWING.first *
    (1 - Math.exp(-since / 7) * Math.cos((since * Math.PI * 2) / 22));
  // O segundo: ela pende para lá, e daí em diante oscila devagar, sem parar.
  const swing =
    SWING.degrees *
    Math.sin(((frame - stressAt - 4) * Math.PI * 2) / SWING.frames);
  const weighed = ramp(frame, sleepAt, 4);
  const disputed = ramp(frame, stressAt, 18);
  return mix(mix(idle, first, weighed), swing, disputed);
};

type FallingProps = {
  /** Quadro do plano em que o peso pousa no prato. */
  readonly at: number;
  readonly children: React.ReactNode;
};

/** Um peso que cai no prato: vem de cima, acelerando, achata ao pousar e assenta. */
const Falling: React.FC<FallingProps> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const from = at - FALL.frames;
  if (frame < from) {
    return null;
  }
  const fallen = drop(frame, from, FALL.frames);
  const squash = interpolate(
    frame,
    [at, at + 2, at + FALL.settle],
    [0, 1, 0],
    clamp,
  );
  return (
    <div
      style={{
        translate: `0 ${-FALL.from * (1 - fallen)}px`,
        transformOrigin: "50% 100%",
        scale: `${1 + 0.5 * FALL.squash * squash} ${1 - FALL.squash * squash}`,
      }}
    >
      {children}
    </div>
  );
};

type DebateShotProps = {
  /** Quadros do plano em que cada peso pousa no prato dele. */
  readonly sleepAt: number;
  readonly stressAt: number;
  /** O quadro do vídeo em que o plano começa: o disco da cena seguinte gira no relógio dela. */
  readonly clock: number;
};

/**
 * A balança das duas causas, uma em cada prato: de um lado o rato de pálpebra
 * caída, com a lua riscada (a falta de sono); do outro, o despertador que
 * toca (o estresse de ser acordado à força). Ela começa vazia, cada peso
 * pousa na fala dele, e daí em diante ela oscila devagar e não se decide.
 */
const DebateShot: React.FC<DebateShotProps> = ({
  sleepAt,
  stressAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const stage = useStage();
  const build = useBuild();
  // A bancada deste plano não estava no da prancheta: sobe ao chegar, e desce com o palco ao sair.
  const risen = Math.min(build.risen, enterProgress(frame, 0, ARRIVE.bench));
  const seconds = frame / fps;
  const tilt = balanceTilt(frame, fps, sleepAt, stressAt);
  // Ela encolhe acelerando, como todo elenco que sai.
  const left = drop(frame, length - LEAVE.before, LEAVE.frames);
  const pans = ([-1, 1] as const).map((side) =>
    panSpot(side, { ...SCALE, tilt }),
  );
  // O despertador toca em rajadas: treme forte, sossega, treme de novo.
  const ringing = 0.35 + 0.65 * Math.max(0, wave(seconds, 1.5, 0.1));
  const idle = ratIdle(seconds, "pan", 1);
  const push = mix(WEIGH.from, WEIGH.to, linear(frame, 0, length));
  const room = (push - 1) * 960;
  const slide = Math.max(-room, Math.min(room, WEIGH.slide * tilt));

  return (
    <Build {...build} risen={risen}>
      <RatLab
        // A câmera se aproxima devagar do eixo da balança e pende um nada para o prato que pesa.
        camera={{
          x: (push - 1) * (SCALE.x - 960) + slide,
          y: (push - 1) * (560 - 540),
          zoom: push,
        }}
      >
        {/* A balança e as etiquetas dela, que a bancada não leva ao descer: sobem o que a camada desce e encolhem em volta do eixo. */}
        <AbsoluteFill
          style={{
            transformOrigin: `${SCALE.x}px ${SCALE.y - BALANCE.height / 2}px`,
            translate: `0 ${-LEAVE.sink * (1 - risen)}px`,
            scale: `${grown(frame, ARRIVE.balanceAt, ARRIVE.balance) * (1 - left)}`,
          }}
        >
          <Balance
            {...SCALE}
            tilt={tilt}
            // O rato olha para o outro prato, por cima do braço da balança: é espelhado.
            left={
              <Falling at={sleepAt}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      scale: `-1 ${breath(seconds, "pan-rat", { amplitude: 0.03, period: 3.4 })}`,
                      transformOrigin: "50% 100%",
                    }}
                  >
                    <Rat
                      width={PAN_RAT}
                      // A pálpebra pesa: fica a meio, e de vez em quando quase fecha.
                      motion={{
                        lid: Math.max(
                          0.5 + 0.22 * Math.max(0, wave(seconds, 2.6, 0.2)),
                          idle.lid,
                        ),
                      }}
                    />
                  </div>
                  <div style={{ position: "absolute", left: -30, top: -70 }}>
                    <NoSleep />
                  </div>
                </div>
              </Falling>
            }
            right={
              <Falling at={stressAt}>
                {/* Os pés do despertador pousam no prato; ele treme enquanto toca. */}
                <div
                  style={{
                    // A caixa do desenho sobra por baixo dos pés: ele desce esse tanto.
                    translate: `0 ${PAN_CLOCK * 0.7}px`,
                    transformOrigin: "50% 80%",
                    rotate: `${6 * ringing * wave(seconds, 0.14)}deg`,
                  }}
                >
                  <AlarmClock radius={PAN_CLOCK} ringing streaks={ringing} />
                </div>
              </Falling>
            }
          />
          <Place x={pans[0].x} y={pans[0].y + 130}>
            <Pop at={sleepAt + 5}>
              <Tag size="note" on="mint">
                sem sono
              </Tag>
            </Pop>
          </Place>
          <Place x={pans[1].x} y={pans[1].y + 130}>
            <Pop at={stressAt + 5}>
              <Tag size="note" on="mint">
                estresse
              </Tag>
            </Pop>
          </Place>
        </AbsoluteFill>
      </RatLab>
      {/* O disco vazio de `awake-record` entra aqui, onde a balança encolhe: a troca de cena não deixa a
          parede sozinha. Quando a cena dele chega, é ela quem o desenha. */}
      {frame >= length - DISC_LEAD && !stage.handedOver ? (
        <DiscPrelude until={length - frame} clock={clock + length} />
      ) : null}
    </Build>
  );
};

/**
 * O plano que abre a cena, antes de qualquer deixa: o último plano de
 * `rats-result` o desenha com `Prelude`, e ele e a ficha já entram enquanto a bancada dos dez desce.
 * `until` é quantos quadros faltam para a cena.
 */
export const UnknownCauseOpening: React.FC<{ until: number }> = ({ until }) => (
  <ExamShot
    checksAt={NEVER}
    blankAt={NEVER + 100}
    unknownAt={NEVER + 200}
    until={until}
  />
);

export const UnknownCauseScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a causa da morte, em branco">
      <Preluded lead={EXAM_LEAD}>
        <ExamShot
          checksAt={cue(scene, "procurou")}
          blankAt={cue(scene, "causa")}
          unknownAt={cue(scene, "sem")}
        />
      </Preluded>
    </Shot>
    <Shot range={shots[1]} name="falta de sono ou estresse?">
      <DebateShot
        sleepAt={cue(scene, "falta") - shots[1].from}
        stressAt={cue(scene, "estresse") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
