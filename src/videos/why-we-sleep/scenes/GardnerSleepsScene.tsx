import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, personInPajamas } from "../palette";
import { Bed } from "../parts/Bed";
import {
  Dement,
  Gardner,
  RoomFloor,
  SleepClock,
  Symptoms,
  gardner,
} from "../parts/Gardner";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  BillPocket,
  BillToPocket,
  DETAIL,
  DETAIL_NIGHTS,
  POCKET_CORNER,
  SleepBillDetail,
} from "../parts/SleepBill";
import { OUR_HOURS, RULER, rulerX, SleepBar } from "../parts/SleepRuler";

const ROOM_HUE = "lilac";
// O chão fica acima do selo da fonte, que neste plano é comprido.
const FLOOR = 940;
const AWAKE = { x: 620, y: FLOOR, height: 600 };
// Dement é um adulto ao lado de um rapaz de dezessete anos: mais alto que ele.
const OBSERVER = { x: 1380, y: FLOOR, height: 710 };
// A cabeça de Gardner, para onde os balões apontam, e os três em arco sobre ela.
const HEAD = [AWAKE.x, AWAKE.y - AWAKE.height * 0.74] as const;
const BALLOONS = [
  [340, 370],
  [620, 190],
  [900, 370],
] as const;

type WatchedShotProps = {
  /** Quadro do plano em que o nome do pesquisador entra. */
  readonly nameAt: number;
  /** Quadro em que cada balão acende, na ordem da fala. */
  readonly at: readonly [number, number, number];
};

/** Ao lado do rapaz, Dement observa, de prancheta; três balões acendem sobre ele: enjoo, um branco, raiva. */
const WatchedShot: React.FC<WatchedShotProps> = ({ nameAt, at }) => (
  <AbsoluteFill>
    <IdeaBackdrop hue={ROOM_HUE} spot={[0.34, 0.45]} />
    <RoomFloor hue={ROOM_HUE} y={FLOOR} />
    <SvgLayer>
      <IdeaShadow hue={ROOM_HUE} x={AWAKE.x} y={FLOOR + 6} width={300} />
      <IdeaShadow hue={ROOM_HUE} x={OBSERVER.x} y={FLOOR + 6} width={320} />
    </SvgLayer>
    <Gardner {...AWAKE} expression="sleepy" tired={1} />
    <Dement {...OBSERVER} flip nameAt={nameAt} on={ROOM_HUE} />
    <Symptoms spots={BALLOONS} at={at} head={HEAD} />
    <Grain />
  </AbsoluteFill>
);

const BED_HUE = "mint";
/** As horas que ele dormiu de uma vez. */
const SLEPT_HOURS = 14;
// A cama em cima, com o relógio encostado no pé dela; logo embaixo, a régua de 24 horas com as duas barras.
// Os três ficam num bloco só, no meio do quadro: espalhados, eram três focos.
const BED_HIGH = { x: 800, y: 530, scale: 0.55 };
// No plano da conta, a cama desce e cresce, à direita da conta aberta.
const BED_LOW = { x: 1240, y: 920, scale: 0.72 };
const CLOCK = { x: 1270, y: 360, radius: 140 };
// A régua fica acima do selo da fonte.
const BARS = { ours: 640, his: 735, ruler: 800 };
// De quem é cada barra: quem dorme, pequeno, na cama (o chão dela fica um pouco abaixo do meio da barra).
const WHO = { x: 0, y: 30, scale: 0.13 };

/** O bolso da conta volta ao canto, cheio: a conta sai dele no plano seguinte. */
const Pocket: React.FC = () => (
  <Place x={POCKET_CORNER.x} y={POCKET_CORNER.y}>
    <BillPocket scale={POCKET_CORNER.scale} />
  </Place>
);

type BareRulerProps = {
  readonly y: number;
  readonly color: string;
};

/**
 * A régua de 24 horas sem os números das pontas: neste plano as duas barras
 * já trazem "8 h" e "14 h", e o "0" e o "24 h" faziam seis textos à vista.
 * É o traço de `SleepRuler`, repetido aqui porque a peça não sabe omiti-los.
 */
const BareRuler: React.FC<BareRulerProps> = ({ y, color }) => (
  <SvgLayer>
    <g stroke={color} strokeWidth={6} strokeLinecap="round">
      <line x1={RULER.x} y1={y} x2={RULER.x + RULER.width} y2={y} />
      {Array.from({ length: RULER.hours + 1 }, (_, hour) => (
        <line
          key={hour}
          x1={rulerX(hour)}
          y1={y}
          x2={rulerX(hour)}
          y2={y + (hour % 6 === 0 ? 30 : 16)}
          opacity={hour % 6 === 0 ? 1 : 0.6}
        />
      ))}
    </g>
  </SvgLayer>
);

type CrashShotProps = {
  /** Quadro do plano em que o relógio fecha as catorze horas. */
  readonly hoursAt: number;
};

/** Ele desaba na cama, o relógio dá a volta até "14 h" e, na régua, a barra dele passa bem da barra "8 h" da pessoa. */
const CrashShot: React.FC<CrashShotProps> = ({ hoursAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slept = linear(frame, 0.4 * fps, hoursAt - 0.4 * fps);
  const tone = idea[BED_HUE].contact;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={BED_HUE} spot={[0.36, 0.36]} />
      <Bed
        {...BED_HIGH}
        colors={gardner}
        blanket="blue"
        hue={BED_HUE}
        snoreAt={0.4 * fps}
      />
      <SleepClock {...CLOCK} hours={SLEPT_HOURS * slept} />
      {/* As oito horas da pessoa já estão na régua quando o plano começa: é contra elas que a barra dele cresce. */}
      <SleepBar
        y={BARS.ours}
        hours={OUR_HOURS}
        label="8 h"
        on={BED_HUE}
        who={
          <Bed {...WHO} colors={personInPajamas} hue={BED_HUE} shadow={false} />
        }
      />
      {/* O número dele fica preso à ponta da barra, e não ao relógio: um texto a menos solto no quadro. */}
      <SleepBar
        y={BARS.his}
        hours={SLEPT_HOURS}
        filled={slept}
        label="14 h"
        labelAt={hoursAt}
        on={BED_HUE}
        who={
          <Bed
            {...WHO}
            colors={gardner}
            blanket="blue"
            hue={BED_HUE}
            shadow={false}
          />
        }
      />
      <BareRuler y={BARS.ruler} color={tone} />
      <Pocket />
      <Grain />
    </AbsoluteFill>
  );
};

// A conta se abre à esquerda da cama, sob a linha do bolso.
const BILL = { x: 440, y: 190, scale: 1.3 };
const OUT_SECONDS = 1.5;

/** A conta carimbada sai do bolso marcado no canto e se abre ao lado da cama dele. */
const BillShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A cama vem de onde o plano anterior a deixou.
  const lowered = ramp(frame, 0, 0.5 * fps);
  const out = ramp(frame, 0.4 * fps, OUT_SECONDS * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={BED_HUE} spot={[0.62, 0.6]} />
      <Bed
        x={mix(BED_HIGH.x, BED_LOW.x, lowered)}
        y={mix(BED_HIGH.y, BED_LOW.y, lowered)}
        scale={mix(BED_HIGH.scale, BED_LOW.scale, lowered)}
        colors={gardner}
        blanket="blue"
        hue={BED_HUE}
        snoreAt={-fps}
      />
      {/* O caminho de `debt-returns`, ao contrário: o maço sai do bolso, viaja e se desdobra. */}
      <BillToPocket
        from={[BILL.x, BILL.y]}
        scale={BILL.scale}
        progress={1 - out}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// A conta de perto enche o quadro.
const CLOSE_BILL = 1.4;
// Nos últimos instantes do último plano o bolso aparece no canto dele, vazio, pronto para receber a conta:
// ela não sai da tela (decisão do usuário), só encolhe um pouco e vai para o lado, para os dois caberem.
const POCKET_SECONDS = 0.7;
const ASIDE = { x: -120, scale: 0.84 };

type DetailShotProps = {
  /** Quadros do plano em que as noites começam a ser riscadas e em que a última é riscada. */
  readonly strikeFrom?: number;
  readonly strikeTo?: number;
  /** Quadro do plano em que o "14 h" entra; sem valor, já está lá. */
  readonly hoursAt?: number;
  /** Quadro do plano em que a seta "mais fundo" acende; sem valor, não há seta. */
  readonly deeperAt?: number;
  /** No fim do plano o bolso do canto aparece ao lado da conta: é a última vez que ela aparece neste bloco. */
  readonly pocket?: boolean;
};

/** De perto, a conta: de um lado, onze noites riscadas; do outro, só "14 h"; e, depois, a seta "mais fundo". */
const DetailShot: React.FC<DetailShotProps> = ({
  strikeFrom,
  strikeTo,
  hoursAt,
  deeperAt,
  pocket = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pocketAt = durationInFrames - POCKET_SECONDS * fps;
  const aside = pocket ? ramp(frame, pocketAt, 0.4 * fps) : 0;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={BED_HUE} spot={[0.5, 0.5]} />
      <div
        style={{
          position: "absolute",
          left: 960 - (DETAIL.width * CLOSE_BILL) / 2,
          top: 520 - (DETAIL.height * CLOSE_BILL) / 2,
          translate: `${mix(0, ASIDE.x, aside)}px 0`,
          scale: `${mix(1, ASIDE.scale, aside)}`,
        }}
      >
        <SleepBillDetail
          scale={CLOSE_BILL}
          on={BED_HUE}
          nights={
            strikeFrom === undefined || strikeTo === undefined
              ? DETAIL_NIGHTS
              : DETAIL_NIGHTS * linear(frame, strikeFrom, strikeTo - strikeFrom)
          }
          hours={hoursAt === undefined ? 1 : ramp(frame, hoursAt, 0.2 * fps)}
          deeper={deeperAt === undefined ? 0 : ramp(frame, deeperAt, 0.3 * fps)}
        />
      </div>
      {pocket ? (
        <Place x={POCKET_CORNER.x} y={POCKET_CORNER.y}>
          <Pop at={pocketAt}>
            <BillPocket scale={POCKET_CORNER.scale} filled={0} />
          </Pop>
        </Place>
      ) : null}
      <Grain />
    </AbsoluteFill>
  );
};

export const GardnerSleepsScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="Dement observa; enjoo, um branco, raiva">
      <WatchedShot
        nameAt={cue(scene, "pesquisador")}
        at={[
          cue(scene, "náusea"),
          cue(scene, "memória"),
          cue(scene, "irritado"),
        ]}
      />
    </Shot>
    <Shot range={shots[1]} name="ele desaba na cama: 14 h contra 8 h">
      <CrashShot hoursAt={cue(scene, "catorze") - shots[1].from} />
    </Shot>
    <Shot range={shots[2]} name="a conta sai do bolso, ao lado da cama">
      <BillShot />
    </Shot>
    <Shot range={shots[3]} name="de perto: onze noites riscadas, 14 h">
      <DetailShot
        strikeFrom={cue(scene, "longe") - shots[3].from}
        strikeTo={cue(scene, "hora", 2) - shots[3].from}
        hoursAt={cue(scene, "catorze", 2) - shots[3].from}
      />
    </Shot>
    <Shot range={shots[4]} name="a seta: mais fundo">
      <DetailShot deeperAt={cue(scene, "mais", 2) - shots[4].from} pocket />
    </Shot>
  </>
);
