import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { cue, linear, mix, ramp, clamp01 } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import {
  ICONS,
  IconRow,
  iconSpot,
  type IconKey,
  type IconState,
} from "../parts/IconRow";
import { BillPocket, BillToPocket, POCKET_CORNER } from "../parts/SleepBill";
import { SIDE_BILL } from "./DebtTestScene";
import { ROW_HUE, rowLife } from "./FivePartsScene";
import { billSway } from "./SkipANightScene";
import { Drift, DRIFT, drifted, undrifted } from "./SleepDebtScene";

// De perto: a conta à esquerda e o bolso, grande, à direita. No fim do plano o bolso vai para o canto.
const BILL = { x: 540, y: 180, scale: 1.45 };
const BIG_POCKET = { x: 1220, y: 640, scale: 3 };
// O plano deriva para o meio do caminho entre a conta e o bolso. A ficha chega
// de fora dele: o lugar de partida é desfeito da deriva do primeiro quadro.
const POCKET_FOCUS = [880, 560] as const;
const FROM_SIDE = (() => {
  const [x, y] = undrifted([SIDE_BILL.x, SIDE_BILL.y], POCKET_FOCUS, 1 - DRIFT);
  return { x, y, scale: SIDE_BILL.scale / (1 - DRIFT) };
})();
// Os tempos da conta, em quadros: chegar da ficha do plano anterior, dobrar em
// dois tempos, ir até a boca do bolso e descer por ela. Estão marcados para o
// papel entrar no bolso em "volta".
const ARRIVE_FRAMES = 11;
const FOLD_FRAMES = 12;
const STOW_FRAMES = 11;
// O bolso surge crescendo enquanto a conta chega, antes de ela dobrar.
const POCKET_AT_FRAMES = 4;
// As duas batidas do bolso: quanto ele cresce em cada uma e o intervalo entre elas.
const PAT = { swell: 0.07, seconds: 0.23, gap: 0.3 };
// Depois das batidas o bolso vai para o canto; assenta lá bem antes de o plano acabar.
const CORNER = { after: 4, frames: 18 };
// A fila do plano seguinte entra aqui, em cascata, com o bolso já no canto: a primeira fala dela a encontra no lugar.
const ROW_BEFORE = { frames: 22, step: 3, each: 9 };

const ROW = { x: 960, y: 560, scale: 1.12 };
// A câmera do plano da fila (decisão do usuário): aproxima da régua, "1", em
// "Falta", quando ela acende e cresce. A escala aprovada não muda: o plano abre
// `wider` mais aberto, em volta da régua, chega devagar (`creep`) até a deixa,
// e nela a câmera vai, com peso, até o quadro composto, onde fica.
const ROW_FOCUS = [iconSpot("ruler", ROW).x, ROW.y] as const;
const ROW_PUSH = { wider: 0.09, creep: 0.02, seconds: 0.8 };
// A aproximação com que a fila entra, ainda no fim do plano do bolso.
const ROW_OPENING = 1 - ROW_PUSH.wider;

/** A aproximação do plano da fila num quadro dele, com a régua acendendo em `pushAt`. */
const rowZoom = (frame: number, pushAt: number, frames: number): number =>
  mix(
    ROW_OPENING + ROW_PUSH.creep * clamp01(frame / pushAt),
    1,
    ramp(frame, pushAt, frames),
  );

/** A fila num instante da deriva do plano dela. */
const rowAt = (zoom: number) => {
  const [x, y] = drifted([ROW.x, ROW.y], ROW_FOCUS, zoom);
  return { x, y, scale: ROW.scale * zoom };
};

/** O balanço do bolso parado, em graus, pelo relógio do vídeo: continua de um plano para o outro. */
const pocketSway = (seconds: number): number => 1.8 * wave(seconds, 2.6);

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio da pausa viva. */
  readonly clock: number;
};

type PocketShotProps = ShotClock & {
  /** Quadros do plano em que a conta começa a dobrar e em que o bolso dá as duas batidas. */
  readonly foldAt: number;
  readonly patAt: number;
};

/** A conta "cobrado" é dobrada e guardada no bolso, que vai para o canto da tela e fica lá. */
const PocketShot: React.FC<PocketShotProps> = ({ foldAt, patAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const clamp = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  // A ficha do plano anterior vem do canto dela e, no caminho, volta a ser só a conta: perde o visto e a prancheta.
  const arrived = ramp(frame, 0, ARRIVE_FRAMES);
  // A conta só dobra depois de chegar, e as batidas vêm depois de ela estar guardada.
  const fold = Math.max(foldAt - 2, ARRIVE_FRAMES + 1);
  const stowAt = fold + FOLD_FRAMES;
  const stowedAt = stowAt + STOW_FRAMES;
  const pat = Math.max(patAt, stowedAt);
  // Dobra (cada aba cai no tempo dela), e vai com peso até a boca do bolso.
  const stowed =
    0.4 * linear(frame, fold, FOLD_FRAMES) +
    0.6 * ramp(frame, stowAt, STOW_FRAMES);
  // O bolso surge crescendo, com sobra, enquanto a conta chega.
  const surged = interpolate(
    frame,
    [POCKET_AT_FRAMES, POCKET_AT_FRAMES + 7, POCKET_AT_FRAMES + 10],
    [0, 1.06, 1],
    { ...clamp, easing: Easing.out(Easing.quad) },
  );
  const patted = [0, 1].reduce((sum, index) => {
    const t = (frame - pat - index * PAT.gap * fps) / (PAT.seconds * fps);
    return t <= 0 || t >= 1
      ? sum
      : sum + PAT.swell * Math.sin(Math.PI * t) ** 2;
  }, 0);
  const cornerAt = pat + (PAT.gap + PAT.seconds) * fps + CORNER.after;
  const cornered = ramp(frame, cornerAt, CORNER.frames);
  // Guardada a conta, o bolso balança de leve, e continua balançando no canto.
  const swaying = ramp(frame, stowedAt, 0.3 * fps) * pocketSway(seconds);
  const rowFrom = length - ROW_BEFORE.frames;
  const life = rowLife(seconds);
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.forEach((icon, index) => {
    const at = rowFrom + index * ROW_BEFORE.step;
    present[icon] = interpolate(
      frame,
      [at, at + ROW_BEFORE.each * 0.7, at + ROW_BEFORE.each],
      [0, 1.06, 1],
      { ...clamp, easing: Easing.out(Easing.quad) },
    );
  });

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.62, 0.55]} />}>
        {/* O bolso continua no plano seguinte, no canto: quando ele chega, é ele quem o desenha. */}
        {stage.handedOver ? null : (
          <Stay>
            <Drift focus={POCKET_FOCUS}>
              <BillToPocket
                creased
                from={[
                  mix(FROM_SIDE.x, BILL.x, arrived),
                  mix(FROM_SIDE.y, BILL.y, arrived),
                ]}
                scale={
                  FROM_SIDE.scale * (BILL.scale / FROM_SIDE.scale) ** arrived
                }
                form={1 - ramp(frame, 0, 0.3 * fps)}
                checked={1 - ramp(frame, 0, 0.25 * fps)}
                // O balanço da ficha morre enquanto ela chega: é parada que ela dobra.
                tilt={billSway(seconds) * (1 - arrived)}
                progress={stowed}
                pocketTilt={swaying}
                pocket={{
                  x: mix(BIG_POCKET.x, POCKET_CORNER.x, cornered),
                  y: mix(BIG_POCKET.y, POCKET_CORNER.y, cornered),
                  scale:
                    mix(BIG_POCKET.scale, POCKET_CORNER.scale, cornered) *
                    surged *
                    (1 + patted),
                }}
              />
            </Drift>
          </Stay>
        )}
        {/* A fila do plano seguinte, ainda sobre o fundo deste: apagada no tom dele, com os olhos acesos. */}
        {frame >= rowFrom && !stage.handedOver ? (
          <Stay>
            <IconRow
              {...rowAt(ROW_OPENING)}
              hue="peach"
              states={{ eyes: "on" }}
              motion={life.motion}
              tilt={life.tilt}
              grow={life.grow}
              lift={life.lift}
              present={present}
            />
          </Stay>
        ) : null}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// O visto entra em "Dormir", que é a primeira palavra do plano: estes quadros depois da troca, para não coincidir com ela.
const CHECK_AFTER_FRAMES = 3;

type MapShotProps = ShotClock & {
  /** Quadros do plano em que os olhos ganham o visto e em que a régua acende. */
  readonly checkAt: number;
  readonly nextAt: number;
};

/** A fila volta: os olhos no capim ganham um visto, e a régua, "1", acende e cresce. */
const MapShot: React.FC<MapShotProps> = ({ checkAt, nextAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const check = Math.max(checkAt, CHECK_AFTER_FRAMES);
  const turnFrames = 0.3 * fps;
  // A cena seguinte parte do último quadro deste plano, com a fila parada: o pulso e o capim sossegam antes do fim.
  const alive = 1 - ramp(frame, length - 0.8 * fps, 0.6 * fps);
  const life = rowLife(seconds, alive);
  const lit = ramp(frame, nextAt, turnFrames);

  const states: Partial<Record<IconKey, IconState>> = {
    eyes: frame >= check ? "check" : "on",
    ruler: frame >= nextAt ? "on" : "off",
  };
  // A régua, "1", cresce até 1,3: é dela que a cena seguinte parte.
  const grow = {
    ...life.grow,
    ruler: (life.grow.ruler ?? 1) * mix(1, 1.3, ramp(frame, nextAt, 0.5 * fps)),
  };
  const taken = stage.enter();
  const row = (
    <IconRow
      {...rowAt(rowZoom(frame, nextAt, ROW_PUSH.seconds * fps))}
      hue={ROW_HUE}
      // A fila entrou sobre o fundo do plano anterior: a cor dos ícones apagados passa à deste junto com o fundo.
      tint={{ from: "peach", progress: taken }}
      states={states}
      since={{ eyes: check, ruler: nextAt }}
      turning={{
        ...(frame >= check
          ? {
              eyes: {
                from: "on",
                progress: ramp(frame, check, turnFrames),
              },
            }
          : {}),
        ...(frame >= nextAt ? { ruler: { from: "off", progress: lit } } : {}),
      }}
      motion={life.motion}
      tilt={life.tilt}
      grow={grow}
      lift={life.lift}
    />
  );

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={[0.36, 0.5]} />}>
        {/* A fila já estava no palco, entrou no fim do plano anterior: não entra de novo. Os
            ícones apagados têm a cor do fundo, e passam do tom do plano anterior ao deste junto com ele:
            uma fila só, com a cor interpolada. Duas filas translúcidas, uma sobre a outra, somavam o
            escuro das duas e clareavam de uma vez quando a de baixo saía. */}
        <Stay>{row}</Stay>
        {/* O bolso da conta veio do plano anterior e fica marcado no canto: não entra de novo. */}
        <Stay>
          <Place
            x={POCKET_CORNER.x}
            y={POCKET_CORNER.y}
            style={{ rotate: `${alive * pocketSway(seconds)}deg` }}
          >
            <BillPocket scale={POCKET_CORNER.scale} />
          </Place>
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const DebtReturnsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a conta vai para o bolso">
      <PocketShot
        foldAt={cue(scene, "cobrança")}
        patAt={cue(scene, "duas")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="os olhos ganham o visto; a régua acende">
      <MapShot
        checkAt={cue(scene, "Dormir") - shots[1].from}
        nextAt={cue(scene, "Falta") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
