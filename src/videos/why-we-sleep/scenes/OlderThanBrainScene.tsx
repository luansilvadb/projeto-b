import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cassiopea } from "../../../art/Cassiopea";
import { Elephant } from "../../../art/Elephant";
import { cameraBetween, framing } from "../../../components/Camera";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, clamp01, clamp } from "../../../components/timing";
import { WIDTH } from "../../../format";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { elephant, ink, jellyfish, lab } from "../palette";
import { CLIPBOARD, Clipboard, HELD_CLIPBOARD } from "../parts/Clipboard";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Glove, TANK_CENTER } from "../parts/Laboratory";
import { PULSES_ASLEEP, pulseCycles, pulseShape, steady } from "../parts/pulse";
import { BillToPocket, billHeight } from "../parts/SleepBill";
import { TIMELINE, Timeline } from "../parts/Timeline";
import { RESEARCHER, TankJellyfish, TankShot } from "../parts/TankShot";
import { VacantSign } from "../parts/VacantSign";
import { ALARM_MAP_LEAD, AlarmMapPrelude } from "./ForcedAwakeScene";
import { seenAt } from "./JellyfishScene";
import { Sooner, flash, useCastScale } from "./MaybeBrainScene";
import { billSway } from "./SkipANightScene";
import { Drift } from "./SleepDebtScene";
import { grown } from "../../../components/Pop";
import { elephantPolish } from "../polish";

// De onde a câmera vem: o fim da aproximação lenta de `jellyfish-debt` 3.
const LAB_BEFORE = framing([TANK_CENTER, 600], 1.05, [TANK_CENTER, 600]);
// O tanque de perto, deslocado para a direita: à esquerda dele cabem a prancheta e a conta.
const PROOF = framing([TANK_CENTER, 540], 1.34, [1270, 540]);
const PROOF_END = framing([TANK_CENTER, 540], 1.38, [1270, 540]);
const CAMERA_SECONDS = 0.6;
const BOARD = { x: 372, y: 250, scale: 0.86, tilt: -3 };
// A conta fica colada no canto do vidro, por cima dele.
const BILL = { x: 640, y: 690, scale: 0.92, lines: 3 };
// O bolso espera no canto de baixo, à esquerda, o único livre: no canto de sempre, em cima à direita, ele pousava
// sobre o canto do tanque e parecia colado no vidro. O selo da fonte ocupa o de baixo à direita.
const POCKET = { x: 236, y: 700, scale: 0.8 };
// Onde o quadro se divide entre o bolso e a conta, para cada um entrar em volta do próprio ponto.
const SPLIT_X = 400;
const STOW_SECONDS = 0.7;
// A pessoa é desenhada com esta altura, nas unidades dela: dá a escala da prancheta na mão da pesquisadora.
const PERSON_UNITS = 650;

type ProofShotProps = {
  /** Quadros do plano em que os vistos piscam e em que a conta volta para o bolso. */
  readonly checksAt: number;
  readonly stowAt: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
};

/** A prova: ela cochilando no tanque, com a conta "cobrado" colada no vidro e a prancheta de dois vistos ao lado. No fim, a conta volta para o bolso. */
const ProofShot: React.FC<ProofShotProps> = ({ checksAt, stowAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const arriving = ramp(frame, 0, CAMERA_SECONDS * fps);
  const stowed = ramp(frame, stowAt, STOW_SECONDS * fps);
  // A prancheta estava na mão da pesquisadora no plano anterior: sai dali, do tamanho que tinha, e vai para o canto,
  // enquanto ela sai de cena. A mão de luva que a segura passa a vir de fora do quadro.
  const person = RESEARCHER.height / PERSON_UNITS;
  const held = seenAt(LAB_BEFORE, [
    RESEARCHER.x + HELD_CLIPBOARD.x * person,
    RESEARCHER.y +
      HELD_CLIPBOARD.y * person * breath(clock / fps, "researcher"),
  ]);
  const board = {
    x: mix(held[0], BOARD.x, arriving),
    y: mix(held[1], BOARD.y, arriving),
    scale: mix(
      HELD_CLIPBOARD.scale * person * LAB_BEFORE.zoom,
      BOARD.scale,
      arriving,
    ),
  };
  const corner: readonly [number, number] = [
    board.x - (CLIPBOARD.width / 2) * board.scale + 14,
    board.y + (CLIPBOARD.height / 2) * board.scale - 8,
  ];
  const billTop = BILL.y - (billHeight(BILL.lines) * BILL.scale) / 2;
  const tape: readonly [number, number] = [BILL.x, BILL.y - 157];
  const billIn = grown(frame, CAMERA_SECONDS * fps + 4);
  const pocketIn = grown(frame, CAMERA_SECONDS * fps - 2);
  const bill = (
    <BillToPocket
      from={[BILL.x, billTop]}
      scale={BILL.scale}
      lines={BILL.lines}
      pocket={POCKET}
      progress={stowed}
      creased
      pocketTilt={billSway(seconds)}
    />
  );

  return (
    <AbsoluteFill>
      <TankShot
        camera={cameraBetween(
          LAB_BEFORE,
          cameraBetween(PROOF, PROOF_END, frame / length),
          arriving,
        )}
        hour="day"
        researcher={[1, 1]}
        board={{ gone: Math.max(0.001, ramp(frame, 0, 9)) }}
        platform={TANK_CENTER}
        clock={clock}
      >
        <TankJellyfish droop={1} rhythm={steady(PULSES_ASLEEP)} clock={clock} />
      </TankShot>
      <Stay only="entering">
        <Cast origin={[BOARD.x, BOARD.y]}>
          <div
            style={{
              position: "absolute",
              left: board.x,
              top: board.y,
              translate: "-50% -50%",
              rotate: `${BOARD.tilt + 0.4 * billSway(seconds + 2) * arriving}deg`,
            }}
          >
            <Clipboard
              scale={board.scale}
              checked={[1, 1]}
              flash={[
                flash(frame, checksAt, 10),
                flash(frame, checksAt + 9, 10),
              ]}
            />
          </div>
          {/* A mão de luva da pesquisadora, que segura a prancheta pelo canto, de fora do quadro: entra com ela. */}
          <SvgLayer>
            <Glove
              from={[corner[0] - 116 - 120 * (1 - arriving), corner[1] + 116]}
              to={corner}
              size={62 * (board.scale / BOARD.scale)}
            />
          </SvgLayer>
        </Cast>
        {/* A conta, colada no vidro, e o bolso: um desenho só, em duas metades, para cada um crescer do próprio ponto.
            No fim do plano ela se dobra e volta para o bolso, de onde saiu em `jellyfish-debt`. */}
        <Cast origin={[POCKET.x, POCKET.y]}>
          <AbsoluteFill
            style={{
              clipPath: `inset(0 ${WIDTH - SPLIT_X}px 0 0)`,
              transformOrigin: `${POCKET.x}px ${POCKET.y}px`,
              scale: `${pocketIn}`,
            }}
          >
            {bill}
          </AbsoluteFill>
        </Cast>
        <AbsoluteFill
          style={{
            clipPath: `inset(0 0 0 ${SPLIT_X}px)`,
            transformOrigin: `${tape[0]}px ${tape[1]}px`,
            scale: `${billIn}`,
          }}
        >
          {bill}
          {/* A fita que prende a conta ao vidro: sai quando a conta é tirada. */}
          <SvgLayer>
            <rect
              x={BILL.x - 70}
              y={BILL.y - 180}
              width={140}
              height={46}
              rx={8}
              fill={lab.platformShade}
              opacity={0.9}
              transform={`rotate(-6 ${tape[0]} ${tape[1]}) translate(${tape[0]} ${tape[1]}) scale(${1 - ramp(frame, stowAt - 5, 5)}) translate(${-tape[0]} ${-tape[1]})`}
            />
          </SvgLayer>
        </AbsoluteFill>
      </Stay>
      <Grain />
    </AbsoluteFill>
  );
};

// O que a linha do tempo desenha, nas medidas dela: a marca do sono, a do cérebro e a altura das etiquetas.
const MARKS = { sleep: 240, brain: 1090, icon: 130, tag: 250 };
// O arco passa por cima da água-viva, que fica entre as duas marcas.
const ARC = { from: 36, rise: 250, seconds: 0.6 };

type LineShotProps = {
  /** Quadros do plano em que a marca do sono pulsa e em que a do cérebro acende. */
  readonly pulseAt: number;
  readonly brainAt: number;
};

/** A linha do tempo: o sono no começo, a água-viva logo depois, o cérebro mais adiante, e um arco do sono até ele. */
const LineShot: React.FC<LineShotProps> = ({ pulseAt, brainAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const y = TIMELINE.y - MARKS.tag - ARC.from;
  // O arco sai da marca do sono e chega à do cérebro, depois de ela acender; na saída, recolhe.
  const arc =
    ramp(frame, brainAt + 0.3 * fps, ARC.seconds * fps) * (1 - stage.leave());
  const from: readonly [number, number] = [MARKS.sleep, y];
  const to: readonly [number, number] = [MARKS.brain, y];
  const top: readonly [number, number] = [(from[0] + to[0]) / 2, y - ARC.rise];
  // A ponta da seta, no fim do arco: a direção é a da curva chegando.
  const angle =
    (Math.atan2(to[1] - (top[1] - ARC.rise), to[0] - top[0]) * 180) / Math.PI;
  const head = clamp01((arc - 0.85) / 0.15);

  return (
    <AbsoluteFill>
      <Timeline
        jellyfish
        eased
        alive
        // A linha se desenha do passado para hoje ao chegar, em vez de aparecer pronta.
        drawn={ramp(frame, 0, 0.5 * fps)}
        arrow={ramp(frame, 0, 6)}
        sleepAt={5}
        brainAt={brainAt}
      />
      <SvgLayer>
        {/* A marca do sono pulsa: dois anéis de luz saem da lua, um depois do outro. */}
        {[0, 7].map((delay) => {
          const age = (frame - pulseAt - delay) / (0.6 * fps);
          return age > 0 && age < 1 ? (
            <circle
              key={delay}
              cx={MARKS.sleep}
              cy={TIMELINE.y - MARKS.icon}
              r={60 + 90 * (1 - (1 - age) ** 2)}
              fill="none"
              stroke={ink.moon}
              strokeWidth={10 * (1 - age)}
              opacity={1 - age}
            />
          ) : null;
        })}
        {arc > 0 ? (
          <g
            fill="none"
            stroke={ink.moon}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d={`M${from[0]},${from[1]} Q${top[0]},${top[1] - ARC.rise} ${to[0]},${to[1]}`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - arc}
            />
            {head > 0 ? (
              <path
                d="M-30,-22 L0,0 L-30,22"
                transform={`translate(${to[0]} ${to[1]}) rotate(${angle}) scale(${head})`}
              />
            ) : null}
          </g>
        ) : null}
      </SvgLayer>
    </AbsoluteFill>
  );
};

const GROUND = 930;
const SIGN = { x: 960, y: GROUND, scale: 1 };
const ELEPHANT = { x: 320, width: 560 };
const JELLYFISH = { x: 1530, width: 380 };
// Do centro do desenho da água-viva até onde o sino encosta no chão, em fração da largura do sino.
const RESTING = 124 / 660;
const VACANT_FOCUS = [960, 560] as const;
// O pedestal e a elefanta abrem o plano: entram no primeiro quadro.
const VACANT_SOONER = 30;
// De quão alto a água-viva desce para pousar (de fora do quadro), e em quantos segundos.
const LANDING = { from: -1000, seconds: 0.7 };

type VacantShotProps = {
  /** Quadros do plano em que a água-viva pousa e em que o foco de luz pisca. */
  readonly landAt: number;
  readonly blinkAt: number;
  readonly clock: number;
};

/** O pedestal "acordado 24 h", vazio; a elefanta dorme de um lado e a água-viva pousa do outro, dormindo. */
const VacantShot: React.FC<VacantShotProps> = ({ landAt, blinkAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const elephantIn = useCastScale(ELEPHANT.x, VACANT_SOONER);
  // Ela desce já virada, freando, e os braços acabam de cair quando o sino encosta.
  const landing = interpolate(
    frame,
    [landAt, landAt + LANDING.seconds * fps],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );
  const out = 1 - stage.leave();
  const touched = landAt + LANDING.seconds * fps;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.4]} />}>
        {/* A fila de `forced-awake` entra aqui, por baixo do pedestal que encolhe: a troca de cena não
            deixa a tela só com o fundo. Quando a cena dela chega, é ela quem a desenha. */}
        {frame >= length - ALARM_MAP_LEAD && !stage.handedOver ? (
          <AlarmMapPrelude until={length - frame} />
        ) : null}
        <Sooner by={VACANT_SOONER}>
          <Drift focus={VACANT_FOCUS}>
            <SvgLayer>
              <IdeaShadow
                hue="mint"
                x={ELEPHANT.x}
                y={GROUND + 6}
                width={ELEPHANT.width * 0.8 * elephantIn}
              />
              <IdeaShadow
                hue="mint"
                x={JELLYFISH.x}
                y={GROUND + 6}
                width={JELLYFISH.width * 1.1 * landing ** 3 * out}
              />
            </SvgLayer>
            <Cast origin={[SIGN.x, SIGN.y]}>
              <VacantSign
                {...SIGN}
                // O foco pisca duas vezes sobre o lugar vazio.
                light={
                  1 -
                  0.75 *
                    Math.max(
                      flash(frame, blinkAt, 6),
                      flash(frame, blinkAt + 8, 6),
                    )
                }
              />
            </Cast>
            {/* A elefanta olha para o pedestal: o desenho, que olha para a esquerda, é espelhado. */}
            <Place
              x={ELEPHANT.x}
              y={GROUND}
              anchor="bottom"
              style={{
                scale: `-1 ${breath(seconds, "vacant-elephant", { amplitude: 0.014, period: 4.5 })}`,
              }}
            >
              <Elephant
                width={ELEPHANT.width}
                colors={elephant}
                finish={elephantPolish()}
                lid={1}
                droop={1}
                ear={0.1 + 0.06 * wave(seconds, 4.5, 0.2)}
              />
            </Place>
            {/* A água-viva não entra com o palco: desce na palavra dela. Sai com ele. */}
            {frame < landAt ? null : (
              <Stay only="entering">
                <Place
                  x={JELLYFISH.x}
                  y={
                    GROUND -
                    JELLYFISH.width * RESTING +
                    LANDING.from * (1 - landing) +
                    // Ao encostar, o sino afunda um nada e volta.
                    5 * flash(frame, touched - 2, 8)
                  }
                  style={{ rotate: `${6 * (1 - landing)}deg` }}
                >
                  <Cassiopea
                    width={JELLYFISH.width}
                    colors={jellyfish.day}
                    droop={mix(0.35, 0.9, ramp(frame, landAt + 6, 0.6 * fps))}
                    pulse={pulseShape(
                      pulseCycles(clock + frame, fps, steady(PULSES_ASLEEP)),
                    )}
                    sway={0.4 * wave(seconds, 5)}
                  />
                </Place>
              </Stay>
            )}
          </Drift>
        </Sooner>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const OlderThanBrainScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shot range={shots[0]} name="passou nos dois testes">
        <ProofShot
          checksAt={cue(scene, "dois")}
          // A conta volta para o bolso em "sem", e não em "cérebro": assenta meio segundo antes da troca.
          stowAt={Math.min(
            cue(scene, "sem"),
            shots[0].to - (STOW_SECONDS + 0.5) * fps,
          )}
          clock={scene.from}
        />
      </Shot>
      <Shot range={shots[1]} name="o sono antes do primeiro cérebro">
        <LineShot
          pulseAt={cue(scene, "sono") - shots[1].from}
          brainAt={cue(scene, "antes") - shots[1].from}
        />
      </Shot>
      <Shot range={shots[2]} name="o pedestal segue vazio">
        <VacantShot
          landAt={Math.max(2, cue(scene, "quem") - shots[2].from)}
          blinkAt={cue(scene, "conseguiu") - shots[2].from}
          clock={scene.from + shots[2].from}
        />
      </Shot>
    </>
  );
};
