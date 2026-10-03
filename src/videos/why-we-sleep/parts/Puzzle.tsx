import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { POP_SECONDS, popOpacity, popScale } from "../../../components/Pop";
import { puzzle } from "../palette";
import { ALREADY_SHOWN } from "./timing";

/** O tabuleiro: quantas peças tem e o lado de cada uma. */
export const PUZZLE = { columns: 4, rows: 3, cell: 190 };
/** A peça que a água-viva preenche, a primeira pista: coluna e linha. */
export const FIRST_CLUE = [1, 1] as const;
// As outras peças que faltam: ninguém tem a resposta completa.
const MISSING = ["2-0", "0-2", "3-1", "2-2"];

// Tamanho da aba do encaixe, em relação ao lado da peça.
const TAB = 0.2;

/**
 * Um lado da peça indo de (0,0) a (length,0), em comandos relativos: `out` diz
 * para onde a aba aponta (1 para fora, -1 para dentro, 0 reto, na borda).
 */
const side = (length: number, out: number): string => {
  if (out === 0) {
    return `l${length},0`;
  }
  const r = length * TAB;
  const run = length / 2 - r * 0.8;
  const y = -out * r;
  // A aba é um cogumelo simétrico: sobe, abre, e desce do outro lado.
  return [
    `l${run},0`,
    `c0,${y * 0.6} ${-r * 0.5},${y * 1.9} ${r * 0.8},${y * 1.9}`,
    `c${r * 1.3},0 ${r * 0.8},${-y * 1.3} ${r * 0.8},${-y * 1.9}`,
    `l${run},0`,
  ].join(" ");
};

/** Gira os comandos relativos de um lado em quartos de volta. */
const rotate = (commands: string, quarters: number): string =>
  commands.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, a: string, b: string) => {
    const [x, y] = [Number(a), Number(b)];
    const turned = [
      [x, y],
      [-y, x],
      [-x, -y],
      [y, -x],
    ][quarters];
    return turned.join(",");
  });

/** Para que lado aponta a aba entre duas peças vizinhas: sorteado, mas igual para as duas. */
const tab = (edge: string) => (random(`puzzle-${edge}`) > 0.5 ? 1 : -1);

/** O contorno de uma peça, com as abas combinando com as das vizinhas. */
export const piecePath = (column: number, row: number): string => {
  const { columns, rows, cell } = PUZZLE;
  // Na ordem em que o contorno dá a volta: em cima, à direita, embaixo, à esquerda.
  const sides = [
    row === 0 ? 0 : -tab(`h-${column}-${row}`),
    column === columns - 1 ? 0 : tab(`v-${column + 1}-${row}`),
    row === rows - 1 ? 0 : tab(`h-${column}-${row + 1}`),
    column === 0 ? 0 : -tab(`v-${column}-${row}`),
  ];
  const outline = sides.map((out, quarters) =>
    rotate(side(cell, out), quarters),
  );
  return `M${column * cell},${row * cell} ${outline.join(" ")} Z`;
};

type PuzzleProps = {
  /** Mostra a peça da primeira pista encaixada no lugar. */
  readonly found?: boolean;
  /** Quadro do plano em que as peças começam a entrar, uma a uma. */
  readonly piecesAt?: number;
};

// Intervalo entre a entrada de uma peça e a da seguinte.
const STAGGER_SECONDS = 0.1;

/**
 * O quebra-cabeça das pistas do sono, cheio de buracos. Vai dentro de um
 * SvgLayer, num grupo posicionado por quem usa: a origem é o canto do tabuleiro.
 */
export const Puzzle: React.FC<PuzzleProps> = ({
  found = false,
  piecesAt = ALREADY_SHOWN,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { columns, rows, cell } = PUZZLE;
  const pieces = Array.from({ length: columns * rows }, (_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns),
  }));
  const isFirstClue = (column: number, row: number) =>
    column === FIRST_CLUE[0] && row === FIRST_CLUE[1];
  let entered = 0;

  return (
    <g>
      <rect
        x={-26}
        y={-26}
        width={columns * cell + 52}
        height={rows * cell + 52}
        rx={30}
        fill={puzzle.board}
      />
      <rect
        width={columns * cell}
        height={rows * cell}
        rx={8}
        fill={puzzle.hole}
      />
      {pieces.map(({ column, row }) => {
        const firstClue = isFirstClue(column, row);
        if (MISSING.includes(`${column}-${row}`) || (firstClue && !found)) {
          return null;
        }
        const path = piecePath(column, row);
        const tone = firstClue
          ? puzzle.found
          : puzzle.pieces[
              Math.floor(
                random(`piece-${column}-${row}`) * puzzle.pieces.length,
              )
            ];
        // A peça da pista encaixa por conta própria; as outras entram em fila.
        const at = firstClue
          ? ALREADY_SHOWN
          : piecesAt + entered++ * STAGGER_SECONDS * fps;
        const center = [(column + 0.5) * cell, (row + 0.5) * cell];
        const scale = popScale(frame, at, POP_SECONDS * fps);
        return (
          <g
            key={`${column}-${row}`}
            transform={`translate(${center[0]} ${center[1]}) scale(${scale}) translate(${-center[0]} ${-center[1]})`}
            opacity={popOpacity(frame, at, POP_SECONDS * fps)}
          >
            {/* A mesma peça, deslocada e mais escura: dá espessura. */}
            <path
              d={path}
              fill={puzzle.pieceShade}
              transform="translate(0 7)"
            />
            <path d={path} fill={tone} />
          </g>
        );
      })}
    </g>
  );
};
