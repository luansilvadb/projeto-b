import "../../../design/fonts";
import { typography } from "../../../design/tokens";
import { ink, lab, researcher, signs } from "../palette";

/**
 * A prancheta da pesquisadora: os dois testes do sono da água-viva, um por
 * linha, cada um com o quadrado dele. Entra em branco, em `jellyfish-night`,
 * e ganha um visto por teste: "lenta para reagir" em `jellyfish-platform` e
 * "cobra depois" em `jellyfish-debt`. É texto do mundo, o mesmo desenho nos
 * quatro planos, na mão dela ou solta num canto.
 */

/** As duas linhas, na ordem dos testes. */
export const CLIPBOARD_LINES = ["lenta para reagir", "cobra depois"] as const;

/** Tamanho da prancheta, em escala 1: a letra é a do tamanho "note". */
export const CLIPBOARD = { width: 740, height: 330 };

const MARGIN = 20;
const ROW = { first: 104, step: 116, box: 64 };

type SheetProps = {
  /** O visto de cada linha, de 0 a 1, na ordem dos testes. */
  readonly checked?: readonly [number, number];
};

/**
 * O desenho da prancheta, em SVG, com a origem no centro dela: é o que vai
 * dentro do `<svg>` de `Clipboard` e, na mão da pesquisadora, de `HeldClipboard`.
 */
const Sheet: React.FC<SheetProps> = ({ checked = [0, 0] }) => {
  const { width, height } = CLIPBOARD;
  const left = -width / 2;
  const top = -height / 2;

  return (
    <g>
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={34}
        fill={lab.clip}
      />
      <rect
        x={left + MARGIN}
        y={top + MARGIN + 12}
        width={width - MARGIN * 2}
        height={height - MARGIN * 2 - 12}
        rx={18}
        fill={lab.paper}
      />
      {/* O prendedor, no alto: é ele que faz do papel uma prancheta. */}
      <rect
        x={-86}
        y={top - 22}
        width={172}
        height={60}
        rx={20}
        fill={researcher.pantsShade}
      />
      <rect
        x={-40}
        y={top - 4}
        width={80}
        height={18}
        rx={9}
        fill={lab.platformShade}
      />
      {CLIPBOARD_LINES.map((line, row) => {
        const y = top + ROW.first + row * ROW.step;
        const x = left + MARGIN + 28;
        const done = checked[row];
        return (
          <g key={line}>
            <rect
              x={x}
              y={y - ROW.box / 2}
              width={ROW.box}
              height={ROW.box}
              rx={14}
              fill={lab.paper}
              stroke={lab.clip}
              strokeWidth={8}
            />
            <text
              x={x + ROW.box + 26}
              y={y + 19}
              fontFamily={typography.family}
              fontWeight={typography.weight}
              fontSize={typography.size.note}
              fill={ink.dark}
            >
              {line}
            </text>
            {done > 0 ? (
              // O visto sai do quadrado, grande: é ele que se lê de longe.
              <path
                d={`M${x + 8},${y - 2} L${x + 30},${y + 24} L${x + 78},${y - 46}`}
                fill="none"
                stroke={signs.seal[1]}
                strokeWidth={16}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={130}
                strokeDashoffset={130 * (1 - done)}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

type ClipboardProps = SheetProps & {
  /** Tamanho do desenho: 1 dá 740 px de largura. */
  readonly scale?: number;
};

/** A prancheta solta, para pôr no quadro com `Place`: o ponto de referência é o centro dela. */
export const Clipboard: React.FC<ClipboardProps> = ({ scale = 1, checked }) => (
  <svg
    width={CLIPBOARD.width * scale}
    height={CLIPBOARD.height * scale}
    viewBox={`${-CLIPBOARD.width / 2} ${-CLIPBOARD.height / 2} ${CLIPBOARD.width} ${CLIPBOARD.height}`}
    overflow="visible"
  >
    <Sheet checked={checked} />
  </svg>
);

// Na mão da pesquisadora, nas unidades do desenho da pessoa: o centro da prancheta e a escala dela.
const HELD = { x: 20, y: -284, scale: 0.66, tilt: -3 };

/** A prancheta na mão da pesquisadora: vai em `held` da Person, com `heldInFront`. */
export const HeldClipboard: React.FC<SheetProps> = ({ checked }) => (
  <g
    transform={`translate(${HELD.x} ${HELD.y}) rotate(${HELD.tilt}) scale(${HELD.scale})`}
  >
    <Sheet checked={checked} />
  </g>
);

/** Como ela segura a prancheta: uma mão em cada borda, virada para quem assiste. */
export const HOLDING_CLIPBOARD = {
  frontArm: {
    hand: [HELD.x - (CLIPBOARD.width / 2) * HELD.scale + 14, HELD.y + 16] as [
      number,
      number,
    ],
    bend: 34,
  },
  backArm: {
    hand: [HELD.x + (CLIPBOARD.width / 2) * HELD.scale - 14, HELD.y - 6] as [
      number,
      number,
    ],
    bend: 30,
  },
} as const;
