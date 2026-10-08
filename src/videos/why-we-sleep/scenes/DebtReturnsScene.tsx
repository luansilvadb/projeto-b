import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import {
  cue,
  drop,
  linear,
  mix,
  ramp,
  clamp01,
} from "../../../components/timing";
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
import {
  BILL_LINES,
  billHeight,
  BillPocket,
  BillToPocket,
  POCKET_CORNER,
  SleepBill,
} from "../parts/SleepBill";
import { SIDE_BILL } from "./DebtTestScene";
import { ROW_HUE, rowLife } from "./FivePartsScene";
import { billSway } from "./SkipANightScene";
import { Drift, DRIFT, drifted, undrifted } from "./SleepDebtScene";
import { popScale } from "../../../components/Pop";

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
// Os tempos da conta, em quadros da cena: chegar da ficha do plano anterior, dobrar em dois
// tempos, ir até a boca do bolso e descer por ela. O plano não tem deixa e dura pouco mais de
// 1 s (acaba em "escapar"): o gesto inteiro cabe nele, e o que vem depois de a conta estar
// guardada (o bolso ir para o canto, a fila entrar) atravessa a troca para o plano da fila.
const ARRIVE_FRAMES = 9;
// A ficha volta a ser só a conta nestes quadros: a prancheta, o prendedor e a linha do quadrado
// encolhem, opacos, para trás do papel. Por opacidade, a prancheta meio apagada formava um segundo
// papel atrás da conta.
const UNFORM_FRAMES = 8;
const FOLD = { at: 10, frames: 10 };
const STOW_FRAMES = 10;
const STOWED_AT = FOLD.at + FOLD.frames + STOW_FRAMES;
// O bolso surge crescendo enquanto a conta chega, antes de ela dobrar.
const POCKET_AT_FRAMES = 2;
// Ao receber a conta o bolso dá uma batida pequena: quanto ele cresce, e em quantos quadros.
const PAT = { swell: 0.07, frames: 7 };
// Guardada a conta, o bolso vai para o canto, com peso: sai no plano do bolso e assenta no da fila.
const CORNER = { at: STOWED_AT + 2, frames: 16 };
// A fila entra em cascata no lugar que o bolso deixa, e termina de entrar já no plano dela.
const ROW_IN = { at: STOWED_AT + 2, step: 2, each: 8 };

/** Onde o bolso está no quadro `at` da cena: grande, ao lado da conta, e depois a caminho do canto, onde fica. */
const pocketAt = (at: number) => {
  const cornered = ramp(at, CORNER.at, CORNER.frames);
  return {
    x: mix(BIG_POCKET.x, POCKET_CORNER.x, cornered),
    y: mix(BIG_POCKET.y, POCKET_CORNER.y, cornered),
    scale: mix(BIG_POCKET.scale, POCKET_CORNER.scale, cornered),
  };
};

/** Quanto de cada ícone da fila já entrou no quadro `at` da cena. */
const rowPresent = (at: number): Partial<Record<IconKey, number>> =>
  Object.fromEntries(
    ICONS.map((icon, index) => [
      icon,
      popScale(at, ROW_IN.at + index * ROW_IN.step, ROW_IN.each, 0),
    ]),
  );

const ROW = { x: 960, y: 560, scale: 1.12 };
// A câmera do plano da fila (decisão do usuário): aproxima da régua, "1", em
// "dormir", quando ela acende e cresce. A escala aprovada não muda: o plano abre
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

/** A conta "cobrado" é dobrada e guardada no bolso, que parte para o canto da tela. */
const PocketShot: React.FC<ShotClock> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  // A ficha do plano anterior vem do canto dela e, no caminho, volta a ser só a conta: perde o visto e a prancheta.
  const arrived = ramp(frame, 0, ARRIVE_FRAMES);
  // Dobra (cada aba cai no tempo dela), e vai com peso até a boca do bolso.
  const stowed =
    0.4 * linear(frame, FOLD.at, FOLD.frames) +
    0.6 * ramp(frame, FOLD.at + FOLD.frames, STOW_FRAMES);
  // O bolso surge crescendo, com sobra, enquanto a conta chega.
  const surged = popScale(frame, POCKET_AT_FRAMES, 10, 0);
  const pat = (frame - STOWED_AT) / PAT.frames;
  const patted =
    pat <= 0 || pat >= 1 ? 0 : PAT.swell * Math.sin(Math.PI * pat) ** 2;
  // Guardada a conta, o bolso balança de leve, e continua balançando no canto.
  const swaying = ramp(frame, STOWED_AT, 0.3 * fps) * pocketSway(seconds);
  const life = rowLife(seconds);
  const spot = pocketAt(frame);
  const pocket = { ...spot, scale: spot.scale * surged * (1 + patted) };
  const from = [
    mix(FROM_SIDE.x, BILL.x, arrived),
    mix(FROM_SIDE.y, BILL.y, arrived),
  ] as const;
  const scale = FROM_SIDE.scale * (BILL.scale / FROM_SIDE.scale) ** arrived;
  // O balanço da ficha morre enquanto ela chega: é parada que ela dobra.
  const tilt = billSway(seconds) * (1 - arrived);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="peach" spot={[0.62, 0.55]} />}>
        {/* A fila do plano seguinte, ainda sobre o fundo deste: apagada no tom dele, com os olhos
            acesos. Fica por baixo do bolso, que ainda passa sobre ela a caminho do canto. */}
        {frame >= ROW_IN.at && !stage.handedOver ? (
          <Stay>
            <IconRow
              {...rowAt(ROW_OPENING)}
              hue="peach"
              states={{ eyes: "on" }}
              motion={life.motion}
              tilt={life.tilt}
              grow={life.grow}
              lift={life.lift}
              present={rowPresent(frame)}
            />
          </Stay>
        ) : null}
        {/* O bolso continua no plano seguinte, a caminho do canto: quando ele chega, é ele quem o desenha. */}
        {stage.handedOver ? null : (
          <Stay>
            <Drift focus={POCKET_FOCUS}>
              {/*
                A ficha que desmonta: a prancheta, o prendedor e a linha do quadrado, desenhados
                atrás da conta, encolhem para trás do papel. A conta por cima é a mesma, sem a ficha.
              */}
              {frame < UNFORM_FRAMES ? (
                <div
                  style={{
                    position: "absolute",
                    left: from[0],
                    top: from[1],
                    translate: "-50% 0",
                    transformOrigin: "50% 0",
                    rotate: `${tilt}deg`,
                  }}
                >
                  <div
                    style={{
                      // Em volta do meio do papel da conta: é para trás dele que a ficha some.
                      transformOrigin: `50% ${(billHeight(BILL_LINES) * scale) / 2}px`,
                      scale: `${1 - drop(frame, 0, UNFORM_FRAMES)}`,
                    }}
                  >
                    <SleepBill scale={scale} stamp={0} form={1} checked={1} />
                  </div>
                </div>
              ) : null}
              <BillToPocket
                creased
                from={from}
                scale={scale}
                tilt={tilt}
                progress={stowed}
                pocketTilt={swaying}
                pocket={pocket}
              />
            </Drift>
          </Stay>
        )}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// O visto entra em "escapar", que é a primeira palavra do plano: estes quadros depois da troca,
// com o ícone dos olhos já assentado da cascata, e 0,3 s antes de a régua acender.
const CHECK_AT_FRAMES = 8;

type MapShotProps = ShotClock & {
  /** O quadro da cena em que o plano começa: o bolso e a cascata da fila continuam do plano anterior. */
  readonly from: number;
  /** Quadro do plano em que a régua acende. */
  readonly nextAt: number;
};

/** A fila volta: os olhos no capim ganham um visto, e a régua, "1", acende e cresce. */
const MapShot: React.FC<MapShotProps> = ({ from, nextAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const check = CHECK_AT_FRAMES;
  const pocket = pocketAt(from + frame);
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
      present={rowPresent(from + frame)}
    />
  );

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={[0.36, 0.5]} />}>
        {/* A fila já vinha entrando no palco, desde o fim do plano anterior: não entra de novo. Os
            ícones apagados têm a cor do fundo, e passam do tom do plano anterior ao deste junto com ele:
            uma fila só, com a cor interpolada. Duas filas translúcidas, uma sobre a outra, somavam o
            escuro das duas e clareavam de uma vez quando a de baixo saía. */}
        <Stay>{row}</Stay>
        {/* O bolso da conta veio do plano anterior, termina de chegar ao canto e fica marcado lá: não entra de novo. */}
        <Stay>
          <Place
            x={pocket.x}
            y={pocket.y}
            style={{ rotate: `${alive * pocketSway(seconds)}deg` }}
          >
            <BillPocket scale={pocket.scale} />
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
      <PocketShot clock={scene.from} />
    </Shot>
    <Shot range={shots[1]} name="os olhos ganham o visto; a régua acende">
      <MapShot
        from={shots[1].from}
        nextAt={cue(scene, "dormir") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
