import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cast, FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { POP_SECONDS, popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { idea, ink, personInPajamas } from "../palette";
import { Bed } from "../parts/Bed";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { ICONS, IconRow, iconSpot, type IconKey } from "../parts/IconRow";
import { BillPocket, POCKET_CORNER } from "../parts/SleepBill";
import {
  BAR_STEP,
  OUR_HOURS,
  RULER,
  rulerX,
  SleepBar,
  SleepRuler,
} from "../parts/SleepRuler";
import { Tag } from "../parts/Tag";
import { HERDS_RISE, HerdsPrelude } from "./ElephantsScene";
import { ROW_HUE } from "./FivePartsScene";
import { Drift, DRIFT, Grow, undrifted } from "./SleepDebtScene";

// A fila como `debt-returns` a deixou: parada, com a régua "1" acesa e crescida, e o bolso no canto.
const ROW = { x: 960, y: 560, scale: 1.12 };
const RULER_GROWN = 1.3;
// O fundo do plano da fila tem a mancha clara aqui; a deste plano fica sob quem dorme, e a mancha vai de uma à outra.
const ROW_SPOT = [0.36, 0.5] as const;
const SLEEPER_SPOT = [0.5, 0.62] as const;
// A régua de 24 horas sobre quem dorme: aberta, no meio do quadro (plano 1) e, de perto, no alto (plano 2).
const OPEN = { bar: 320, scale: 1.12 };
const RAISED = { bar: 190, scale: 1 };
// A cama de quem dorme, no chão do plano: menor no quadro aberto, grande no centro quando a câmera chega.
const BED_OPEN = { x: 960, y: 1010, scale: 0.76 };
const BED_NEAR = { x: 960, y: 1040, scale: 0.95 };
// O lugar vago é só mais curto que a barra dela: não mede nada, e por isso não leva número.
const SLOT = { height: 54, who: 44, hours: 3 };
const WHO = { scale: 0.13, drop: 30 };
const TONE = idea[ROW_HUE].contact;
// A altura da régua aberta, sem lugar vago por baixo, nas coordenadas do grupo dela.
const RULER_Y = OPEN.bar + 70;
// O ponto para o qual o primeiro plano deriva: quem dorme.
const SLEEPER_FOCUS = [960, 700] as const;

/** O cobertor de quem dorme: sobe e desce devagar, pelo relógio do vídeo, para não saltar na troca de plano. */
const blanketBreath = (seconds: number): number =>
  1 + 0.035 * wave(seconds, 4.4, 0.2);

type MeasureProps = {
  /** Quanto a câmera já chegou, de 0 a 1: a régua sobe para o alto e a cama cresce. */
  readonly near: number;
  /** Quanto da barra já encheu, e os quadros em que o dono dela e o "8 h" entram; sem valores, o plano ainda não tem barra. */
  readonly filled?: number;
  readonly whoAt?: number;
  readonly hoursAt?: number;
  /** Quanto o lugar vago, debaixo da barra, já abriu, de 0 a 1. */
  readonly slot?: number;
  /** O tempo do vídeo, em segundos: a respiração de quem dorme. */
  readonly seconds: number;
};

/**
 * Quem dorme, na cama, e sobre ela a régua de 24 horas, já desenhada. A barra
 * das oito horas e o "8 h" entram na fala que as diz, e debaixo dela abre o
 * lugar de outra, mais curta.
 */
const Measure: React.FC<MeasureProps> = ({
  near,
  filled,
  whoAt = 0,
  hoursAt,
  slot = 0,
  seconds,
}) => {
  const { fps } = useVideoConfig();
  const slotY = OPEN.bar + BAR_STEP * slot;
  const slotWidth = (rulerX(SLOT.hours) - rulerX(0)) * slot;
  const zero = rulerX(0);
  const bed = {
    x: mix(BED_OPEN.x, BED_NEAR.x, near),
    y: mix(BED_OPEN.y, BED_NEAR.y, near),
  };

  return (
    <>
      {/* A cama sai encolhendo em volta do colchão, como o resto do que está solto. */}
      <Cast origin={[bed.x, bed.y - 150]}>
        <Bed
          {...bed}
          scale={mix(BED_OPEN.scale, BED_NEAR.scale, near)}
          colors={personInPajamas}
          hue={ROW_HUE}
          breath={blanketBreath(seconds)}
        />
      </Cast>
      <AbsoluteFill
        style={{
          // Encolhe em volta da barra e sobe: no fim, a barra fica em RAISED.bar.
          transformOrigin: `960px ${OPEN.bar}px`,
          translate: `0 ${mix(0, RAISED.bar - OPEN.bar, near)}px`,
          scale: `${mix(OPEN.scale, RAISED.scale, near)}`,
        }}
      >
        <SvgLayer>
          {/* O lugar vago: o contorno de uma barra mais curta, que se desenha da esquerda para a direita, e o de quem ainda não chegou. */}
          {slot > 0 ? (
            <g
              fill="none"
              stroke={TONE}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray="16 14"
            >
              <rect
                x={zero}
                y={slotY - SLOT.height / 2}
                width={slotWidth}
                height={SLOT.height}
                rx={Math.min(SLOT.height, slotWidth) / 2}
                opacity={Math.min(1, slot * 5)}
              />
              <circle
                cx={zero - 100}
                cy={slotY}
                r={SLOT.who * Math.min(1, slot * 1.6)}
                opacity={Math.min(1, slot * 5)}
              />
            </g>
          ) : null}
        </SvgLayer>
        {filled === undefined ? null : (
          <SleepBar
            y={OPEN.bar}
            hours={OUR_HOURS}
            filled={filled}
            on={ROW_HUE}
            label="8 h"
            labelAt={hoursAt}
            // De quem é a barra: ela mesma, pequena, na cama.
            who={
              <Grow at={whoAt} frames={0.3 * fps}>
                <Bed
                  x={0}
                  y={WHO.drop}
                  scale={WHO.scale}
                  colors={personInPajamas}
                  hue={ROW_HUE}
                  shadow={false}
                  breath={blanketBreath(seconds)}
                />
              </Grow>
            }
          />
        )}
        <SleepRuler y={slotY + 70} color={TONE} />
      </AbsoluteFill>
    </>
  );
};

// O ícone da régua, nas unidades do desenho dele (o disco tem raio 100): a linha, as sete marcas e a barra.
const GLYPH = {
  half: 66,
  line: 22,
  major: 28,
  minor: 16,
  stroke: 7,
  bar: { top: -34, height: 34, full: 132, short: 54 },
};
// A régua de 24 horas, nas medidas de `SleepRuler`.
const FULL = { major: 30, minor: 16, stroke: 6, faint: 0.6 };
// Os tempos da transformação, em quadros: o resto da fila encolhe, o ícone sobe até quem dorme
// (a cama entra crescendo no caminho), o disco se recolhe atrás da régua e ela se estica.
// O plano não tem deixa e dura pouco mais de 1 s (acaba em "oito"): a transformação inteira cabe
// nele, com a régua começando a se esticar ainda no fim da subida.
const ROW_OUT = { step: 2, each: 8 };
const RISE = { at: 2, frames: 14 };
const BED_IN = { at: 4, frames: 13 };
const DISC_OUT = { at: 8, frames: 9 };
const STRETCH = { at: 11, frames: 20 };

type RulerMorphProps = {
  /** O centro do ícone e a escala dele (pixels por unidade do desenho), nas coordenadas do grupo da régua. */
  readonly x: number;
  readonly y: number;
  readonly size: number;
  /** Quanto do disco e da barra do ícone ainda está lá, de 1 a 0. */
  readonly disc: number;
  /** Quanto a régua do ícone já se esticou até a de 24 horas, de 0 a 1. */
  readonly stretch: number;
};

/**
 * A régua do ícone "1" virando a régua de 24 horas. É um desenho só do
 * primeiro ao último quadro: o disco e a barra do ícone se recolhem, e a linha
 * dele se estica para os dois lados. As sete marcas do ícone são sete das
 * vinte e cinco da régua, nos mesmos pontos da linha; as outras entram entre
 * elas, da esquerda para a direita.
 */
const RulerMorph: React.FC<RulerMorphProps> = ({
  x,
  y,
  size,
  disc,
  stretch,
}) => {
  const left = mix(x - GLYPH.half * size, RULER.x, stretch);
  const right = mix(x + GLYPH.half * size, RULER.x + RULER.width, stretch);
  const line = mix(y + GLYPH.line * size, RULER_Y, stretch);
  const color = interpolateColors(stretch, [0, 1], [ink.dark, TONE]);
  const bar = GLYPH.bar;

  return (
    <SvgLayer>
      <g transform={`translate(${x} ${y}) scale(${size})`}>
        {/* O anel e o disco do ícone aceso: encolhem para trás da régua. */}
        <circle r={110 * disc} fill={ink.ring} />
        <circle r={100 * disc} fill={ink.paper} />
        {/* A barra curta sobre a sombra da barra inteira: recolhe-se para a esquerda. */}
        <g
          transform={`translate(${-GLYPH.half} ${bar.top + bar.height / 2}) scale(${disc}) translate(${GLYPH.half} ${-bar.top - bar.height / 2})`}
        >
          <rect
            x={-GLYPH.half}
            y={bar.top}
            width={bar.full}
            height={bar.height}
            rx={bar.height / 2}
            fill={ink.tag}
            opacity={0.3}
          />
          <rect
            x={-GLYPH.half}
            y={bar.top}
            width={bar.short}
            height={bar.height}
            rx={bar.height / 2}
            fill={ink.tag}
          />
        </g>
      </g>
      <g
        stroke={color}
        strokeWidth={mix(GLYPH.stroke * size, FULL.stroke, stretch)}
        strokeLinecap="round"
      >
        <line x1={left} y1={line} x2={right} y2={line} />
        {Array.from({ length: RULER.hours + 1 }, (_, hour) => {
          const at = left + ((right - left) * hour) / RULER.hours;
          const major = hour % 6 === 0;
          const full = major ? FULL.major : FULL.minor;
          const faint = major ? 1 : FULL.faint;
          if (hour % 4 === 0) {
            // Uma das sete do ícone: já estava lá, e só muda de tamanho.
            const was =
              (hour / 4) % 3 === 0 ? GLYPH.major * size : GLYPH.minor * size;
            return (
              <line
                key={hour}
                x1={at}
                y1={line}
                x2={at}
                y2={line + mix(was, full, stretch)}
                opacity={mix(1, faint, stretch)}
              />
            );
          }
          // As novas crescem da linha, cada uma na sua vez, da esquerda para a direita.
          const grown = Math.min(
            1,
            Math.max(0, (stretch - 0.15 - 0.6 * (hour / RULER.hours)) / 0.25),
          );
          return grown > 0 ? (
            <line
              key={hour}
              x1={at}
              y1={line}
              x2={at}
              y2={line + full * grown}
              opacity={faint}
            />
          ) : null;
        })}
      </g>
    </SvgLayer>
  );
};

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio da respiração de quem dorme. */
  readonly clock: number;
};

/**
 * A fila em que a cena anterior parou se desfaz: os outros ícones, a pílula
 * "1" e o bolso encolhem no lugar, e a régua do ícone sobe até ficar sobre
 * quem dorme, onde se estica e vira a régua de 24 horas, ainda sem barra.
 */
const RulerShot: React.FC<ShotClock> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = (clock + frame) / fps;
  const spot = iconSpot("ruler", ROW);
  // O ícone parte do lugar dele na fila. Dentro do plano ele está no grupo da régua, que deriva e
  // é maior que o quadro: o ponto de partida é desfeito da deriva do primeiro quadro e da escala do grupo.
  const [fromX, fromY] = undrifted([spot.x, spot.y], SLEEPER_FOCUS, 1 - DRIFT);
  const inGroup = (px: number, py: number) =>
    [
      960 + (px - 960) / OPEN.scale,
      OPEN.bar + (py - OPEN.bar) / OPEN.scale,
    ] as const;
  const [startX, startY] = inGroup(fromX, fromY);
  const startSize = (ROW.scale * RULER_GROWN) / (1 - DRIFT) / OPEN.scale;
  const endSize = RULER_GROWN;
  const risen = ramp(frame, RISE.at, RISE.frames);
  const stretch = ramp(frame, STRETCH.at, STRETCH.frames);
  // O que sai encolhe no próprio ponto, acelerando, um depois do outro.
  const gone = (at: number, frames = ROW_OUT.each) =>
    interpolate(frame, [at, at + frames], [0, 1], {
      ...clamp,
      easing: Easing.in(Easing.quad),
    });
  const present: Partial<Record<IconKey, number>> = {};
  ICONS.filter((icon) => icon !== "ruler").forEach((icon, index) => {
    present[icon] = 1 - gone(index * ROW_OUT.step);
  });
  const moved = ramp(frame, 0, 0.8 * fps);
  const labelFrames = POP_SECONDS * fps;
  const endAt = STRETCH.at + STRETCH.frames;

  return (
    <AbsoluteFill>
      <IdeaBackdrop
        hue={ROW_HUE}
        spot={[
          mix(ROW_SPOT[0], SLEEPER_SPOT[0], moved),
          mix(ROW_SPOT[1], SLEEPER_SPOT[1], moved),
        ]}
      />
      {/* Tudo aqui continua no plano seguinte ou já saiu antes do fim: nada encolhe na troca. Quando o outro chega, é ele quem desenha. */}
      {stage.handedOver ? null : (
        <Stay>
          {frame < ICONS.length * ROW_OUT.step + ROW_OUT.each ? (
            <>
              {/* A fila em que o plano anterior parou: os outros quatro saem, da esquerda para a direita. */}
              <IconRow
                {...ROW}
                hue={ROW_HUE}
                states={{ eyes: "check" }}
                omit={["ruler"]}
                present={present}
              />
              {/* A pílula "1" não sobe com a régua: fica e encolhe. */}
              <div
                style={{
                  position: "absolute",
                  left: spot.x,
                  top:
                    spot.y +
                    (spot.size / 2 + 54 * ROW.scale) +
                    (spot.size * (RULER_GROWN - 1)) / 2,
                  translate: "-50% -50%",
                  scale: `${ROW.scale * (1 - gone(0))}`,
                }}
              >
                <Tag on={ROW_HUE} size="note">
                  1
                </Tag>
              </div>
              {/* O bolso da conta sai: só aparece onde a conta é guardada ou de onde ela sai. */}
              <Place
                x={POCKET_CORNER.x}
                y={POCKET_CORNER.y}
                style={{ scale: `${1 - gone(1, 9)}` }}
              >
                <BillPocket scale={POCKET_CORNER.scale} />
              </Place>
            </>
          ) : null}
          <Drift focus={SLEEPER_FOCUS}>
            {/* Quem dorme entra crescendo do chão enquanto a régua sobe. */}
            <div
              style={{
                position: "absolute",
                left: BED_OPEN.x,
                top: BED_OPEN.y,
              }}
            >
              <Grow at={BED_IN.at} frames={BED_IN.frames}>
                <Bed
                  x={0}
                  y={0}
                  scale={BED_OPEN.scale}
                  colors={personInPajamas}
                  hue={ROW_HUE}
                  breath={blanketBreath(seconds)}
                />
              </Grow>
            </div>
            <AbsoluteFill
              style={{
                transformOrigin: `960px ${OPEN.bar}px`,
                scale: `${OPEN.scale}`,
              }}
            >
              <RulerMorph
                x={mix(startX, 960, risen)}
                y={mix(startY, RULER_Y - GLYPH.line * endSize, risen)}
                size={mix(startSize, endSize, risen)}
                disc={1 - ramp(frame, DISC_OUT.at, DISC_OUT.frames)}
                stretch={stretch}
              />
              {/* Os números das pontas entram quando a linha chega a cada uma: ela já está quase lá uns
                  quadros antes de assentar, e os dois terminam de estourar com o plano. */}
              {(
                [
                  ["0", 0, endAt - 6],
                  ["24 h", RULER.hours, endAt - 4],
                ] as const
              ).map(([text, hours, at]) =>
                frame >= at ? (
                  <Place key={text} x={rulerX(hours)} y={RULER_Y + 70}>
                    <div
                      style={{ scale: `${popScale(frame, at, labelFrames)}` }}
                    >
                      <Label size="note" color={TONE}>
                        {text}
                      </Label>
                    </div>
                  </Place>
                ) : null,
              )}
            </AbsoluteFill>
          </Drift>
        </Stay>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

// A barra enche hora por hora, em cascata: o intervalo entre uma hora e a seguinte e quanto cada uma leva, em quadros.
// O plano abre em "oito": ela enche enquanto a fala diz "oito horas", em 0,6 s.
const FILL = { at: 2, step: 1.6, each: 6 };
// O dono da barra entra com ela; o "8 h" só depois de ela chegar.
const HOURS_AFTER_FRAMES = 3;

type SleeperShotProps = ShotClock & {
  /** Quadro do plano em que abre o lugar da barra seguinte. */
  readonly slotAt: number;
};

/** De perto: quem dorme, grande, no centro; a barra das oito horas enche e ganha "8 h"; debaixo dela abre o lugar de outra, mais curta. */
const SleeperShot: React.FC<SleeperShotProps> = ({ slotAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const filled =
    Array.from({ length: OUR_HOURS }, (_, hour) =>
      ramp(frame, FILL.at + hour * FILL.step, FILL.each),
    ).reduce((sum, part) => sum + part, 0) / OUR_HOURS;
  const fullAt = FILL.at + (OUR_HOURS - 1) * FILL.step + FILL.each;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue={ROW_HUE} spot={SLEEPER_SPOT} />}>
        {/* A savana do plano seguinte já sobe por baixo de quem dorme, que encolhe: a troca não deixa a
            tela só com o fundo. Quando o plano dela chega, é ele quem a desenha, no mesmo ponto da subida. */}
        {frame >= length - HERDS_RISE.lead && !stage.handedOver ? (
          <HerdsPrelude until={length - frame} clock={clock} />
        ) : null}
        {/* Quem dorme e a régua já estavam no palco: não entram de novo, e saem com o plano. */}
        <Stay only="entering">
          <Measure
            near={ramp(frame, 0, 0.6 * fps)}
            filled={filled}
            whoAt={FILL.at}
            hoursAt={fullAt + HOURS_AFTER_FRAMES}
            slot={ramp(frame, slotAt, 0.5 * fps)}
            seconds={seconds}
          />
        </Stay>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const SleepLessScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a régua do ícone nasce sobre quem dorme">
      <RulerShot clock={scene.from} />
    </Shot>
    <Shot range={shots[1]} name="quem dorme, e a barra das oito horas">
      <SleeperShot
        slotAt={cue(scene, "tem") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
