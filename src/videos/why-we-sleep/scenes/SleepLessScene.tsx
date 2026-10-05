import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { Pop } from "../../../components/Pop";
import { cue, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, personInPajamas } from "../palette";
import { Bed } from "../parts/Bed";
import { IdeaBackdrop } from "../parts/IdeaBackdrop";
import { IconRow, MapIcon, iconSpot } from "../parts/IconRow";
import {
  BAR_STEP,
  OUR_HOURS,
  rulerX,
  SleepBar,
  SleepRuler,
} from "../parts/SleepRuler";
import { ROW_HUE } from "./FivePartsScene";

// A fila como `debt-returns` a deixou: a régua "1" acesa e crescida.
const ROW = { x: 960, y: 560, scale: 1.12 };
const RULER_GROWN = 1.3;
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

type MeasureProps = {
  /** Quanto a câmera já chegou, de 0 a 1: a régua sobe para o alto e a cama cresce. */
  readonly near: number;
  /** Quanto da régua já se desenhou. */
  readonly drawn: number;
  /** Quanto da barra já encheu, e o quadro em que o "8 h" entra na ponta dela; sem valores, o plano ainda não tem barra. */
  readonly filled?: number;
  readonly hoursAt?: number;
  /** Quanto o lugar vago, debaixo da barra, já abriu, de 0 a 1. */
  readonly slot?: number;
};

/**
 * Quem dorme, na cama, e sobre ela a régua de 24 horas. No primeiro plano só
 * a régua nasce; a barra das oito horas e o "8 h" entram no segundo, na fala
 * que as diz, e debaixo dela abre o lugar de outra, mais curta.
 */
const Measure: React.FC<MeasureProps> = ({
  near,
  drawn,
  filled,
  hoursAt,
  slot = 0,
}) => {
  const slotY = OPEN.bar + BAR_STEP * slot;
  const zero = rulerX(0);

  return (
    <>
      <Bed
        x={mix(BED_OPEN.x, BED_NEAR.x, near)}
        y={mix(BED_OPEN.y, BED_NEAR.y, near)}
        scale={mix(BED_OPEN.scale, BED_NEAR.scale, near)}
        colors={personInPajamas}
        hue={ROW_HUE}
      />
      <AbsoluteFill
        style={{
          // Encolhe em volta da barra e sobe: no fim, a barra fica em RAISED.bar.
          transformOrigin: `960px ${OPEN.bar}px`,
          translate: `0 ${mix(0, RAISED.bar - OPEN.bar, near)}px`,
          scale: `${mix(OPEN.scale, RAISED.scale, near)}`,
        }}
      >
        <SvgLayer>
          {/* O lugar vago: o contorno de uma barra mais curta e o de quem ainda não chegou. */}
          <g
            fill="none"
            stroke={TONE}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="16 14"
            opacity={slot}
          >
            <rect
              x={zero}
              y={slotY - SLOT.height / 2}
              width={rulerX(SLOT.hours) - zero}
              height={SLOT.height}
              rx={SLOT.height / 2}
            />
            <circle cx={zero - 100} cy={slotY} r={SLOT.who} />
          </g>
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
              <Pop at={0}>
                <Bed
                  x={0}
                  y={WHO.drop}
                  scale={WHO.scale}
                  colors={personInPajamas}
                  hue={ROW_HUE}
                  shadow={false}
                />
              </Pop>
            }
          />
        )}
        <SleepRuler y={slotY + 70} color={TONE} drawn={drawn} />
      </AbsoluteFill>
    </>
  );
};

/** A régua do ícone "1" nasce sobre quem dorme e vira a régua de 24 horas, ainda sem barra. */
const RulerShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spot = iconSpot("ruler", ROW);
  // O ícone sai do lugar dele na fila, vai para cima dela e cresce enquanto se desfaz.
  const grown = ramp(frame, 0, 0.7 * fps);
  const size = mix(spot.size * RULER_GROWN, 760, grown);
  const drawn = ramp(frame, 0.25 * fps, 0.8 * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.62]} />
      {/* A fila em que o plano anterior parou: os outros quatro saem. */}
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, 0, 0.3 * fps) }}>
        <IconRow
          {...ROW}
          hue={ROW_HUE}
          states={{ eyes: "check" }}
          omit={["ruler"]}
        />
      </AbsoluteFill>
      {/* Ela e a régua grande só aparecem quando a do ícone começa a se desfazer. */}
      <AbsoluteFill style={{ opacity: ramp(frame, 0.2 * fps, 0.3 * fps) }}>
        <Measure near={0} drawn={drawn} />
      </AbsoluteFill>
      <Place
        x={mix(spot.x, 960, grown)}
        y={mix(spot.y, OPEN.bar + 40, grown)}
        style={{ opacity: 1 - ramp(frame, 0.2 * fps, 0.45 * fps) }}
      >
        <MapIcon icon="ruler" state="on" size={size} hue={ROW_HUE} />
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

type SleeperShotProps = {
  /** Quadro do plano em que abre o lugar da barra seguinte. */
  readonly slotAt: number;
};

/** De perto: quem dorme, grande, no centro; a barra das oito horas enche e ganha "8 h"; debaixo dela abre o lugar de outra, mais curta. */
const SleeperShot: React.FC<SleeperShotProps> = ({ slotAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.62]} />
      <Measure
        near={ramp(frame, 0, 0.6 * fps)}
        drawn={1}
        // A deixa do plano é "Você", a oração das oito horas: a barra enche e ganha o número assim que ele abre.
        filled={ramp(frame, 0.2 * fps, 0.6 * fps)}
        hoursAt={0.7 * fps}
        slot={ramp(frame, slotAt, 0.4 * fps)}
      />
      <Grain />
    </AbsoluteFill>
  );
};

export const SleepLessScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a régua do ícone nasce sobre quem dorme">
      <RulerShot />
    </Shot>
    <Shot range={shots[1]} name="quem dorme, e a barra das oito horas">
      <SleeperShot slotAt={cue(scene, "bicho") - shots[1].from} />
    </Shot>
  </>
);
