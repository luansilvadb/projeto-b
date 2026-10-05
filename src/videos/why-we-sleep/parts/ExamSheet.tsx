import "../../../design/fonts";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { typography } from "../../../design/tokens";
import { chalkboard, ink, lab, researcher, signs } from "../palette";

/**
 * O que o exame dos ratos deixou: a prancheta em que tudo foi preenchido,
 * menos a causa da morte, e a balança que não se decide entre a falta de sono
 * e o estresse. A prancheta é outra, e não a de duas linhas da pesquisadora
 * (`Clipboard`).
 */

/** Tamanho da prancheta de exame, em escala 1. */
export const EXAM = { width: 640, height: 820 };

const MARGIN = 26;
// As linhas preenchidas: o comprimento de cada risco de texto, em fração da largura livre.
const ROWS = [
  [0.86, 0.5],
  [0.7, 0.62],
  [0.92, 0.4],
  [0.64, 0.56],
] as const;
const ROW = { first: 132, step: 100, box: 56 };

type ExamSheetProps = {
  /** Tamanho do desenho: 1 dá 640 px de largura. */
  readonly scale?: number;
  /** Quanto a interrogação da linha em branco já entrou, de 0 a 1. */
  readonly question?: number;
};

/**
 * A prancheta do exame: quatro itens preenchidos, cada um com o visto e os
 * riscos do que foi anotado, e no fim a linha "causa da morte", em branco, com
 * uma interrogação. O ponto de referência é o centro dela.
 */
export const ExamSheet: React.FC<ExamSheetProps> = ({
  scale = 1,
  question = 1,
}) => {
  const { width, height } = EXAM;
  const left = -width / 2;
  const top = -height / 2;
  const textX = left + MARGIN + 36 + ROW.box + 26;
  const free = width / 2 - MARGIN - 36 - textX;
  const causeY = top + ROW.first + ROWS.length * ROW.step + 76;

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`${left} ${top} ${width} ${height}`}
      overflow="visible"
    >
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={38}
        fill={lab.clip}
      />
      <rect
        x={left + MARGIN}
        y={top + MARGIN + 16}
        width={width - MARGIN * 2}
        height={height - MARGIN * 2 - 16}
        rx={18}
        fill={lab.paper}
      />
      {/* O prendedor, no alto: é ele que faz do papel uma prancheta. */}
      <rect
        x={-96}
        y={top - 26}
        width={192}
        height={70}
        rx={22}
        fill={researcher.pantsShade}
      />
      <rect
        x={-44}
        y={top - 6}
        width={88}
        height={20}
        rx={10}
        fill={lab.platformShade}
      />
      {ROWS.map(([first, second], row) => {
        const y = top + ROW.first + row * ROW.step;
        const x = left + MARGIN + 36;
        return (
          <g key={row}>
            <rect
              x={x}
              y={y - ROW.box / 2}
              width={ROW.box}
              height={ROW.box}
              rx={12}
              fill={lab.paper}
              stroke={lab.clip}
              strokeWidth={8}
            />
            <path
              d={`M${x + 8},${y - 2} L${x + 26},${y + 20} L${x + 66},${y - 38}`}
              fill="none"
              stroke={signs.seal[1]}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x={textX}
              y={y - 22}
              width={free * first}
              height={16}
              rx={8}
              fill={lab.paperLine}
            />
            <rect
              x={textX}
              y={y + 8}
              width={free * second}
              height={16}
              rx={8}
              fill={lab.paperLine}
              opacity={0.6}
            />
          </g>
        );
      })}
      {/* A última linha: a pergunta do exame, e o lugar da resposta em branco. */}
      <rect
        x={left + MARGIN + 30}
        y={causeY - 66}
        width={width - MARGIN * 2 - 60}
        height={8}
        rx={4}
        fill={lab.paperLine}
        opacity={0.6}
      />
      <text
        x={left + MARGIN + 36}
        y={causeY + 22}
        fontFamily={typography.family}
        fontWeight={typography.weight}
        fontSize={typography.size.note}
        fill={ink.dark}
      >
        causa da morte
      </text>
      <rect
        x={left + MARGIN + 36}
        y={causeY + 56}
        width={width - MARGIN * 2 - 72}
        height={128}
        rx={18}
        fill="none"
        stroke={chalkboard.stamp}
        strokeWidth={8}
        strokeDasharray="26 18"
        strokeLinecap="round"
      />
      <text
        x={0}
        y={causeY + 166}
        textAnchor="middle"
        fontFamily={typography.family}
        fontWeight={900}
        fontSize={typography.size.headline * 1.1}
        fill={chalkboard.stamp}
        opacity={question > 0 ? 1 : 0}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          scale: `${question}`,
        }}
      >
        ?
      </text>
    </svg>
  );
};

/** A balança, em escala 1: do pé ao eixo, meio braço, e do braço ao prato. */
export const BALANCE = {
  height: 540,
  arm: 400,
  hang: 210,
  pan: 300,
};

type BalanceProps = {
  /** O meio do pé da balança, em pixels do cenário. */
  readonly x: number;
  readonly y: number;
  /** Quanto o braço pende, em graus: positivo desce o prato da direita. */
  readonly tilt: number;
  /** O que está em cada prato: posto pelo meio da base, no fundo do prato. */
  readonly left?: React.ReactNode;
  readonly right?: React.ReactNode;
};

/** Onde o fundo de cada prato fica, com o braço nessa inclinação. */
export const panSpot = (
  side: -1 | 1,
  { x, y, tilt }: { x: number; y: number; tilt: number },
): { readonly x: number; readonly y: number } => {
  const radians = (tilt * Math.PI) / 180;
  return {
    x: x + side * BALANCE.arm * Math.cos(radians),
    y:
      y -
      BALANCE.height +
      side * BALANCE.arm * Math.sin(radians) +
      BALANCE.hang,
  };
};

/**
 * A balança de dois pratos: o pé, a coluna, o braço que pende e os pratos
 * pendurados, que ficam sempre na horizontal. Ela oscila e não se decide.
 */
export const Balance: React.FC<BalanceProps> = ({
  x,
  y,
  tilt,
  left,
  right,
}) => {
  const pivot = y - BALANCE.height;
  const pans = ([-1, 1] as const).map((side) => ({
    side,
    ...panSpot(side, { x, y, tilt }),
  }));

  return (
    <>
      <SvgLayer>
        <ellipse
          cx={x}
          cy={y + 6}
          rx={230}
          ry={22}
          fill={lab.contact}
          opacity={0.22}
        />
        <rect
          x={x - 22}
          y={pivot}
          width={44}
          height={BALANCE.height - 30}
          fill={lab.clip}
        />
        <rect
          x={x}
          y={pivot}
          width={22}
          height={BALANCE.height - 30}
          fill={researcher.pantsShade}
        />
        <path
          d={`M${x - 190},${y} Q${x - 190},${y - 46} ${x - 130},${y - 46} L${x + 130},${y - 46} Q${x + 190},${y - 46} ${x + 190},${y} Z`}
          fill={researcher.pantsShade}
        />
        {/* Os fios de cada prato, do braço às duas pontas dele. */}
        <g stroke={researcher.pantsShade} strokeWidth={7} strokeLinecap="round">
          {pans.map((pan) => (
            <path
              key={pan.side}
              d={`M${pan.x - BALANCE.pan / 2 + 10},${pan.y} L${pan.x},${pan.y - BALANCE.hang} L${pan.x + BALANCE.pan / 2 - 10},${pan.y}`}
              fill="none"
            />
          ))}
        </g>
        <g transform={`rotate(${tilt} ${x} ${pivot})`}>
          <rect
            x={x - BALANCE.arm - 26}
            y={pivot - 16}
            width={(BALANCE.arm + 26) * 2}
            height={32}
            rx={16}
            fill={lab.clip}
          />
          {[-1, 1].map((side) => (
            <circle
              key={side}
              cx={x + side * BALANCE.arm}
              cy={pivot}
              r={15}
              fill={lab.platform}
            />
          ))}
        </g>
        <circle cx={x} cy={pivot} r={34} fill={researcher.pantsShade} />
        <circle cx={x} cy={pivot} r={15} fill={lab.platform} />
      </SvgLayer>
      {pans.map((pan) => (
        <Place key={pan.side} x={pan.x} y={pan.y + 4} anchor="bottom">
          {pan.side === -1 ? left : right}
        </Place>
      ))}
      {/* Os pratos ficam na frente dos pés de quem está neles. */}
      <SvgLayer>
        {pans.map((pan) => (
          <g key={pan.side}>
            <path
              d={`M${pan.x - BALANCE.pan / 2},${pan.y - 6} L${pan.x + BALANCE.pan / 2},${pan.y - 6} Q${pan.x + BALANCE.pan / 2 - 30},${pan.y + 56} ${pan.x},${pan.y + 56} Q${pan.x - BALANCE.pan / 2 + 30},${pan.y + 56} ${pan.x - BALANCE.pan / 2},${pan.y - 6} Z`}
              fill={lab.platform}
            />
            <path
              d={`M${pan.x - BALANCE.pan / 2 + 34},${pan.y + 32} Q${pan.x},${pan.y + 62} ${pan.x + BALANCE.pan / 2 - 34},${pan.y + 32} Q${pan.x + BALANCE.pan / 2 - 60},${pan.y + 56} ${pan.x},${pan.y + 56} Q${pan.x - BALANCE.pan / 2 + 60},${pan.y + 56} ${pan.x - BALANCE.pan / 2 + 34},${pan.y + 32} Z`}
              fill={lab.platformShade}
            />
          </g>
        ))}
      </SvgLayer>
    </>
  );
};
