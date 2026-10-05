import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { chalkboard, idea, ink, sky, street, tags } from "../palette";
import { Bed } from "../parts/Bed";
import { Mug } from "../parts/Belongings";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import {
  HoursClock,
  StudyShelf,
  SUBJECTS,
  SyllableSheet,
  TestBadge,
} from "../parts/SyllableList";
import { Tag } from "../parts/Tag";

/** O fundo liso das três voltas desta cena. */
const HUE = "peach";

// A tela dividida: a noite de quem dormiu à esquerda, o dia de quem ficou acordado à direita.
const GROUND = 880;
const HOURS = 8;
const WINDOW = { width: 250, height: 250 };

type WindowProps = {
  /** O centro da janela, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly night: boolean;
};

/** A janela do quarto: a lua e as estrelas, ou o sol. Vai dentro de um SvgLayer. */
const RoomWindow: React.FC<WindowProps> = ({ x, y, night }) => {
  const left = x - WINDOW.width / 2;
  const top = y - WINDOW.height / 2;
  return (
    <g>
      <rect
        x={left - 14}
        y={top - 14}
        width={WINDOW.width + 28}
        height={WINDOW.height + 28}
        rx={30}
        fill={ink.paper}
      />
      <rect
        x={left}
        y={top}
        width={WINDOW.width}
        height={WINDOW.height}
        rx={18}
        fill={night ? street.night.sky[0] : sky.day.top}
      />
      <rect
        x={left}
        y={top + WINDOW.height * 0.55}
        width={WINDOW.width}
        height={WINDOW.height * 0.45}
        rx={18}
        fill={night ? street.night.sky[1] : sky.day.bottom}
      />
      {night ? (
        <>
          {[
            [0.2, 0.24],
            [0.3, 0.66],
            [0.82, 0.72],
          ].map(([sx, sy]) => (
            <circle
              key={sx}
              cx={left + WINDOW.width * sx}
              cy={top + WINDOW.height * sy}
              r={6}
              fill={ink.moon}
            />
          ))}
          <path
            d="M10,-44 A44,44 0 1 0 44,14 A35,35 0 1 1 10,-44 Z"
            fill={ink.moon}
            transform={`translate(${left + WINDOW.width * 0.6} ${top + WINDOW.height * 0.4})`}
          />
        </>
      ) : (
        <circle
          cx={left + WINDOW.width * 0.62}
          cy={top + WINDOW.height * 0.4}
          r={46}
          fill={sky.day.sun}
        />
      )}
      <rect
        x={x - 6}
        y={top}
        width={12}
        height={WINDOW.height}
        fill={ink.paper}
      />
      <rect
        x={left - 34}
        y={top + WINDOW.height + 8}
        width={WINDOW.width + 68}
        height={26}
        rx={13}
        fill={ink.paper}
      />
    </g>
  );
};

type SideTableProps = {
  /** O meio do tampo, em pixels do quadro. */
  readonly x: number;
  readonly hue: keyof typeof idea;
};
const TABLE_TOP = GROUND - 150;

/** A mesa de cabeceira. Vai dentro de um SvgLayer; a lista fica por cima, de pé, encostada na parede. */
const SideTable: React.FC<SideTableProps> = ({ x, hue }) => (
  <g>
    <IdeaShadow hue={hue} x={x} y={GROUND + 4} width={220} />
    {[-70, 54].map((leg) => (
      <rect
        key={leg}
        x={x + leg}
        y={TABLE_TOP + 20}
        width={16}
        height={GROUND - TABLE_TOP - 20}
        rx={8}
        fill={chalkboard.frame}
      />
    ))}
    <rect
      x={x - 100}
      y={TABLE_TOP + 24}
      width={200}
      height={56}
      rx={12}
      fill={chalkboard.frame}
    />
    <rect
      x={x - 116}
      y={TABLE_TOP}
      width={232}
      height={30}
      rx={15}
      fill={idea.peach.top}
    />
  </g>
);

// Quem dormiu: deitada, com a cabeça à esquerda; a mesa de cabeceira, com a lista, aos pés da cama.
const BED = { x: 372, scale: 0.57 };
const NIGHT_TABLE = 842;
// Quem ficou acordada: de pé, com a caneca, ao lado da mesma mesa e da mesma lista.
const AWAKE = { x: 1560, height: 600 };
const DAY_TABLE = 1210;
const LIST = { width: 112, tilt: 5 };

type SplitShotProps = {
  /** Quadro do plano em que o lado de quem ficou acordada acende. */
  readonly awakeAt: number;
};

/** Tela dividida: a mesma pessoa dormindo logo depois de decorar, e passando as mesmas horas acordada. */
const SplitShot: React.FC<SplitShotProps> = ({ awakeAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const awake = ramp(frame, awakeAt, 0.4 * fps);
  const listHeight = (LIST.width * 560) / 360;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
        <IdeaBackdrop hue="lilac" spot={[0.22, 0.6]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
        <IdeaBackdrop hue={HUE} spot={[0.8, 0.55]} />
      </AbsoluteFill>

      <SvgLayer>
        <RoomWindow x={250} y={250} night />
        <HoursClock x={700} y={250} radius={100} hours={HOURS} />
        <SideTable x={NIGHT_TABLE} hue="lilac" />
      </SvgLayer>
      <Bed
        {...BED}
        y={GROUND}
        colors={SUBJECTS[0]}
        hue="lilac"
        // O cobertor no verde da blusa dele: o azul é só de Gardner.
        blanket="green"
        snoreAt={0.3 * fps}
        snoreSize={96}
      />
      <Place
        x={NIGHT_TABLE}
        y={TABLE_TOP - listHeight / 2 + 4}
        style={{ rotate: `${LIST.tilt}deg` }}
      >
        <SyllableSheet width={LIST.width} plain />
      </Place>
      <SvgLayer>
        <RoomWindow x={1700} y={250} night={false} />
        <HoursClock x={1210} y={250} radius={100} hours={HOURS} />
        <SideTable x={DAY_TABLE} hue={HUE} />
        <IdeaShadow hue={HUE} x={AWAKE.x} y={GROUND + 4} width={300} />
      </SvgLayer>
      <Place
        x={DAY_TABLE}
        y={TABLE_TOP - listHeight / 2 + 4}
        style={{ rotate: `${-LIST.tilt}deg` }}
      >
        <SyllableSheet width={LIST.width} plain />
      </Place>
      <Place
        x={AWAKE.x}
        y={GROUND}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "awake")}` }}
      >
        <Person
          height={AWAKE.height}
          colors={SUBJECTS[0]}
          blink={blink(seconds, "awake")}
          frontArm={{ hand: [-150, -310], bend: 24 }}
          held={<Mug seconds={seconds} />}
        />
      </Place>
      {/* O lado de quem ficou acordada só acende na oração dele. */}
      <AbsoluteFill
        style={{
          clipPath: "inset(0 0 0 50%)",
          background: idea.peach.contact,
          opacity: 0.62 * (1 - awake),
        }}
      />
      <SvgLayer>
        <rect x={953} y={0} width={14} height={1080} fill={ink.paper} />
      </SvgLayer>
      <Grain />
    </AbsoluteFill>
  );
};

// As duas listas na hora do teste, grandes, e as duas pessoas à direita, pequenas.
const SHEETS = { xs: [430, 900], y: 580, width: 410 };
const SHEET_HEIGHT = (SHEETS.width * 560) / 360;
// O colchete vai da borda da primeira lista até antes do selo da segunda, que fica no canto dela.
const BRACKET = {
  from: SHEETS.xs[0] - SHEETS.width / 2 + 20,
  to: SHEETS.xs[1] + SHEETS.width / 2 - 110,
};
const PAIR = { xs: [1400, 1610], y: 900, height: 340 };
// As sílabas que cada lista ainda guarda: a de quem dormiu, seis; a de quem ficou acordada, quatro.
// A fonte só diz que quem dormiu esqueceu menos, em todos os intervalos: a diferença aqui é
// ilustrativa e fica pequena de propósito, para o quadro não afirmar "o dobro".
const FORGOTTEN: readonly [readonly number[], readonly number[]] = [
  [2, 5, 7, 9],
  [0, 1, 3, 4, 6, 8],
];
const KINDS = ["slept", "awake"] as const;

type TestShotProps = {
  /** Quadros do plano em que as sílabas começam a apagar e em que entra "só duas". */
  readonly forgetAt: number;
  readonly onlyAt: number;
};

/** Na hora do teste, a lista de quem dormiu tem mais sílabas acesas; as duas pessoas são "só duas". */
const TestShot: React.FC<TestShotProps> = ({ forgetAt, onlyAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const top = SHEETS.y - SHEET_HEIGHT / 2;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={HUE} spot={[0.36, 0.55]} />
      <SvgLayer>
        {/* O colchete que põe as duas listas sob a mesma etiqueta. */}
        <path
          d={`M${BRACKET.from},${top - 22} L${BRACKET.from},${top - 70} L${BRACKET.to},${top - 70} L${BRACKET.to},${top - 22}`}
          fill="none"
          stroke={tags.peach.fill}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {PAIR.xs.map((x) => (
          <IdeaShadow key={x} hue={HUE} x={x} y={PAIR.y + 4} width={180} />
        ))}
      </SvgLayer>
      <Place x={(BRACKET.from + BRACKET.to) / 2} y={top - 70}>
        <Pop at={4}>
          <Tag on={HUE} size="note">
            de 1 a 8 h depois
          </Tag>
        </Pop>
      </Place>
      {SHEETS.xs.map((x, index) => (
        <Place key={x} x={x} y={SHEETS.y}>
          <SyllableSheet
            width={SHEETS.width}
            lit={Array.from({ length: 10 }, (_, syllable) => {
              const order = FORGOTTEN[index].indexOf(syllable);
              return order < 0
                ? 1
                : 1 - ramp(frame, forgetAt + order * 3, 0.3 * fps);
            })}
          />
        </Place>
      ))}
      {SHEETS.xs.map((x, index) => (
        <Place key={x} x={x + SHEETS.width / 2 - 30} y={top + 16}>
          <TestBadge kind={KINDS[index]} size={120} />
        </Place>
      ))}
      {PAIR.xs.map((x, index) => (
        <Place
          key={x}
          x={x}
          y={PAIR.y}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, `pair-${index}`)}` }}
        >
          <Person
            height={PAIR.height}
            colors={SUBJECTS[index]}
            bun={index === 1}
            blink={blink(seconds, `pair-${index}`)}
          />
        </Place>
      ))}
      <Place x={(PAIR.xs[0] + PAIR.xs[1]) / 2} y={PAIR.y - PAIR.height - 70}>
        <Pop at={onlyAt}>
          <Tag on={HUE} size="note">
            só duas
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

// Em quadro aberto: as duas pessoas, pequenas, à esquerda, olham a estante que cresce à direita.
// Na frente dela, as duas se perdiam entre os livros; e a sombra da estante fica acima do selo da fonte.
const SHELF = { x: 1140, y: 880, width: 940, rows: 6 };
const CROWD = { xs: [270, 480], y: 900, height: 400 };

type ShelfShotProps = {
  /** Quadro do plano em que a estante chega ao alto e a etiqueta entra. */
  readonly centuryAt: number;
};

/** Atrás das duas pessoas, a estante de estudos cresce até "mais de 100 anos de pesquisa". */
const ShelfShot: React.FC<ShelfShotProps> = ({ centuryAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={HUE} spot={[0.5, 0.5]} />
      <SvgLayer>
        <IdeaShadow
          hue={HUE}
          x={SHELF.x}
          y={SHELF.y + 6}
          width={SHELF.width + 60}
        />
        <StudyShelf
          {...SHELF}
          grown={1 + (SHELF.rows - 1) * ramp(frame, 0, centuryAt)}
        />
        {CROWD.xs.map((x) => (
          <IdeaShadow key={x} hue={HUE} x={x} y={CROWD.y + 4} width={210} />
        ))}
      </SvgLayer>
      {CROWD.xs.map((x, index) => (
        <Place
          key={x}
          x={x}
          y={CROWD.y}
          anchor="bottom"
          style={{ scale: `1 ${breath(seconds, `pair-${index}`)}` }}
        >
          <Person
            height={CROWD.height}
            colors={SUBJECTS[index]}
            bun={index === 1}
            // Elas olham para a estante, à direita e para cima.
            expression={frame >= centuryAt ? "surprised" : "curious"}
            blink={blink(seconds, `pair-${index}`)}
          />
        </Place>
      ))}
      <Place x={SHELF.x} y={128}>
        <Pop at={centuryAt}>
          <Tag on={HUE} size="note">
            mais de 100 anos de pesquisa
          </Tag>
        </Pop>
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const MemoryResultScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="dormindo, ou as mesmas horas acordada">
      <SplitShot awakeAt={cue(scene, "passavam")} />
    </Shot>
    <Shot range={shots[1]} name="as duas listas na hora do teste">
      <TestShot
        forgetAt={cue(scene, "esqueciam") - shots[1].from}
        onlyAt={cue(scene, "só") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="um século de estudos">
      <ShelfShot centuryAt={cue(scene, "século") - shots[2].from} />
    </Shot>
  </>
);
