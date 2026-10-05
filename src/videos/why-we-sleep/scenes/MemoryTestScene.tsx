import "../../../design/fonts";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { ink, lab, stopwatch } from "../palette";
import { EXPERIMENTERS, SUBJECTS, SyllableSheet } from "../parts/SyllableList";

// O calendário de parede: a faixa do ano em cima e um mês de trinta dias embaixo.
const CAL = {
  width: 300,
  height: 300,
  columns: 7,
  pitch: 38,
  cell: 30,
  days: 30,
};

type YearCalendarProps = {
  /** O centro do calendário e a largura, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quantos dias já passaram: enchem a folha do mês e, ao passar de trinta, a folha vira. */
  readonly days?: number;
};

/** O calendário de 1924 na parede. Vai dentro de um SvgLayer. */
const YearCalendar: React.FC<YearCalendarProps> = ({
  x,
  y,
  width,
  days = 0,
}) => {
  const scale = width / CAL.width;
  const page = Math.floor(days / CAL.days);
  const filled = days - page * CAL.days;

  return (
    <g
      transform={`translate(${x - width / 2} ${y - (CAL.height * scale) / 2}) scale(${scale})`}
    >
      {/* As folhas já viradas ficam dobradas para trás, no alto. */}
      {Array.from({ length: page }, (_, turned) => (
        <path
          key={turned}
          d={`M18,4 C50,${-44 - turned * 18} 250,${-44 - turned * 18} 282,4 Z`}
          fill={lab.platformShade}
        />
      ))}
      <rect
        x={10}
        y={12}
        width={CAL.width}
        height={CAL.height}
        rx={22}
        fill={lab.platformShade}
      />
      <rect width={CAL.width} height={CAL.height} rx={22} fill={lab.paper} />
      <path
        d={`M0,82 L0,22 Q0,0 22,0 L${CAL.width - 22},0 Q${CAL.width},0 ${CAL.width},22 L${CAL.width},82 Z`}
        fill={ink.tag}
      />
      {[78, 222].map((ring) => (
        <rect
          key={ring}
          x={ring - 8}
          y={-16}
          width={16}
          height={38}
          rx={8}
          fill={stopwatch.rim}
        />
      ))}
      <text
        x={CAL.width / 2}
        y={62}
        textAnchor="middle"
        fontFamily={typography.family}
        fontWeight={typography.weight}
        fontSize={56}
        fill={ink.paper}
      >
        1924
      </text>
      {Array.from({ length: CAL.days }, (_, day) => (
        <rect
          key={day}
          x={21 + (day % CAL.columns) * CAL.pitch}
          y={100 + Math.floor(day / CAL.columns) * CAL.pitch}
          width={CAL.cell}
          height={CAL.cell}
          rx={7}
          fill={day < filled ? ink.tag : ink.tagEdge}
          opacity={day < filled ? 1 : 0.2}
        />
      ))}
    </g>
  );
};

// O piso fica acima do selo da fonte, que nesta cena é comprido: os sapatos e o pé da mesa encostavam nele.
const FLOOR = 936;

/** A sala do experimento: a parede do laboratório, sem a vidraria do tanque, e o piso. */
const Room: React.FC = () => (
  <AbsoluteFill
    style={{ background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})` }}
  >
    <SvgLayer>
      <rect x={0} y={FLOOR - 40} width={1920} height={16} fill={lab.shelf} />
      <rect
        x={0}
        y={FLOOR - 24}
        width={1920}
        height={1080 - FLOOR + 24}
        fill={lab.bench}
      />
      <rect
        x={0}
        y={FLOOR + 40}
        width={1920}
        height={1080 - FLOOR - 40}
        fill={lab.benchShade}
      />
    </SvgLayer>
  </AbsoluteFill>
);

// A mesa no meio, com as duas pessoas sentadas atrás dela; um pesquisador de cada lado, em pé.
const TABLE = { x: 960, top: 721, width: 820 };
const SEATED = { xs: [760, 1160], y: 911, height: 540 };
const CHAIR_TOP = 561;
const STANDING = { xs: [320, 1600], y: FLOOR, height: 650 };
// A folha na mão de quem a entrega, nas unidades do desenho da pessoa.
const HANDED = (
  <g transform="rotate(-8 -236 -372)">
    <SyllableSheet x={-292} y={-456} width={104} plain />
  </g>
);

type HandoverShotProps = {
  /** Quadro do plano em que o calendário entra. */
  readonly yearAt: number;
};

/** Em 1924, dois pesquisadores entregam uma lista a cada uma das duas pessoas sentadas à mesa. */
const HandoverShot: React.FC<HandoverShotProps> = ({ yearAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <Room />
      <Place x={960} y={222} style={{ scale: "0.9" }}>
        <Pop at={yearAt}>
          <svg
            width={360}
            height={380}
            viewBox="0 0 360 380"
            overflow="visible"
          >
            <YearCalendar x={180} y={200} width={340} />
          </svg>
        </Pop>
      </Place>
      <SvgLayer>
        {/* O encosto das cadeiras, atrás de cada pessoa. */}
        {SEATED.xs.map((x) => (
          <rect
            key={x}
            x={x - 120}
            y={CHAIR_TOP}
            width={240}
            height={200}
            rx={36}
            fill={lab.benchShade}
          />
        ))}
      </SvgLayer>
      {SEATED.xs.map((x, index) => (
        <Place
          key={x}
          x={x}
          y={SEATED.y}
          anchor="bottom"
          // Cada uma olha para o pesquisador do seu lado: a da esquerda é espelhada.
          style={{
            scale: `${index === 0 ? -1 : 1} ${breath(seconds, `subject-${index}`)}`,
          }}
        >
          <Person
            height={SEATED.height}
            colors={SUBJECTS[index]}
            bun={index === 1}
            expression="curious"
            blink={blink(seconds, `subject-${index}`)}
            frontArm={{ hand: [-104, -236], bend: 20 }}
            backArm={{ hand: [156, -300], bend: 24 }}
          />
        </Place>
      ))}
      <SvgLayer>
        {/* A mesa cobre as duas da cintura para baixo: estão sentadas. */}
        <rect
          x={TABLE.x - TABLE.width / 2 + 40}
          y={TABLE.top + 20}
          width={TABLE.width - 80}
          height={FLOOR - TABLE.top - 20}
          rx={18}
          fill={lab.benchShade}
        />
        <rect
          x={TABLE.x - TABLE.width / 2}
          y={TABLE.top}
          width={TABLE.width}
          height={38}
          rx={19}
          fill={lab.platform}
        />
        <rect
          x={TABLE.x - TABLE.width / 2 + 24}
          y={TABLE.top + 26}
          width={TABLE.width - 48}
          height={12}
          rx={6}
          fill={lab.platformShade}
        />
        {STANDING.xs.map((x) => (
          <ellipse
            key={x}
            cx={x}
            cy={FLOOR + 4}
            rx={150}
            ry={18}
            fill={lab.contact}
            opacity={0.22}
          />
        ))}
      </SvgLayer>
      {STANDING.xs.map((x, index) => (
        <Place
          key={x}
          x={x}
          y={STANDING.y}
          anchor="bottom"
          // O braço que entrega é o da frente: no da esquerda, o desenho é espelhado para ele ficar do lado da mesa.
          style={{
            scale: `${index === 0 ? -1 : 1} ${breath(seconds, `experimenter-${index}`)}`,
          }}
        >
          <Person
            height={STANDING.height}
            colors={EXPERIMENTERS[index]}
            bun={index === 1}
            blink={blink(seconds, `experimenter-${index}`)}
            frontArm={{ hand: [-204, -330], bend: -18 }}
            held={HANDED}
            heldInFront
          />
        </Place>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};

// De perto: quem lê à esquerda, a lista no meio e o calendário na parede, à direita.
const READER = { x: 400, y: 1330, height: 1200 };
const SHEET = { x: 1000, y: 520, width: 500, tilt: -4 };
const WALL_CALENDAR = { x: 1590, y: 360, width: 440 };
// "Quase dois meses": a segunda folha do calendário para um pouco antes do fim.
const DAYS = 56;

/** De perto, a lista de sílabas soltas na mão de uma delas; atrás, o calendário folheia quase dois meses. */
const ListShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const scale = READER.height / 650;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${lab.wall[0]}, ${lab.wall[1]})`,
        }}
      />
      <SvgLayer>
        <YearCalendar
          {...WALL_CALENDAR}
          days={Math.floor(
            DAYS * linear(frame, 0.2 * fps, durationInFrames - 0.6 * fps),
          )}
        />
      </SvgLayer>
      <Place
        x={READER.x}
        y={READER.y}
        anchor="bottom"
        // Espelhada: ela olha para a folha, à direita, e a segura com o braço desse lado.
        style={{ scale: `-1 ${breath(seconds, "reader")}` }}
      >
        <Person
          height={READER.height}
          colors={SUBJECTS[1]}
          bun
          expression="reading"
          blink={blink(seconds, "reader")}
          frontArm={{ hand: [-196, -236], bend: 34 }}
        />
      </Place>
      <Place x={SHEET.x} y={SHEET.y} style={{ rotate: `${SHEET.tilt}deg` }}>
        <SyllableSheet width={SHEET.width} />
      </Place>
      <SvgLayer>
        {/* O polegar por cima do canto da folha: é ela quem a segura. */}
        <circle
          cx={SHEET.x - SHEET.width / 2 + 34}
          cy={READER.y - 236 * scale + 6}
          r={22 * scale}
          fill={SUBJECTS[1].hand}
        />
      </SvgLayer>
      <Grain />
    </AbsoluteFill>
  );
};

export const MemoryTestScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="1924: uma lista para cada pessoa">
      <HandoverShot yearAt={cue(scene, "mil")} />
    </Shot>
    <Shot range={shots[1]} name="a lista de sílabas, por quase dois meses">
      <ListShot />
    </Shot>
  </>
);
