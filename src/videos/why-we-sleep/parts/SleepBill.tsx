import "../../../design/fonts";
import { useId } from "react";
import { typography } from "../../../design/tokens";
import {
  chalkboard,
  idea,
  ink,
  lab,
  person,
  signs,
  tags,
  type TagTone,
} from "../palette";

/**
 * A conta de sono: a forma visual da analogia central do vídeo (a dívida).
 * Nasce ao lado do bicho que pulou uma noite, ganha o carimbo "cobrado", é
 * dobrada e guardada num bolso que fica no canto da tela, e sai dele na
 * água-viva e em Gardner. Todas as peças são desenhos soltos, com o tamanho
 * dado por `scale`: quem as põe no quadro é a cena, com `Place`.
 */

/** Largura do papel da conta, em escala 1, e o máximo de linhas lançadas. */
export const BILL_WIDTH = 420;
export const BILL_LINES = 5;
const HEADER = 128;
const LINE = 56;
const FOOT = 44;
const FORM_ROW = 104;
// O comprimento de cada lançamento, em fração da linha: desiguais, para não parecer grade.
const ENTRIES = [0.86, 0.62, 0.94, 0.7, 0.8] as const;
const TEETH = 14;

/** Altura do papel, em escala 1, para as linhas lançadas; com a ficha de teste, a linha do quadrado entra na conta. */
export const billHeight = (lines: number, form = 0): number =>
  HEADER + LINE * lines + FOOT + FORM_ROW * form;

/** O papel: cantos redondos em cima e a borda picotada de quem foi destacado do bloco, embaixo. */
const paperPath = (width: number, height: number): string => {
  const step = width / TEETH;
  const teeth = Array.from({ length: TEETH }, (_, index) => {
    const x = width - step * (index + 0.5);
    return `L${x.toFixed(1)},${height + 14} L${(x - step / 2).toFixed(1)},${height}`;
  }).join(" ");
  return `M0,22 Q0,0 22,0 L${width - 22},0 Q${width},0 ${width},22 L${width},${height} ${teeth} Z`;
};

/** A lua minguante que marca cada noite devida: um disco menos outro, deslocado para a direita. */
const Moon: React.FC<{ x: number; y: number; r: number; fill: string }> = ({
  x,
  y,
  r,
  fill,
}) => (
  <path
    d={`M${x + r * 0.45},${y - r * 0.89} A${r},${r} 0 1 0 ${x + r * 0.45},${y + r * 0.89} A${r},${r} 0 0 1 ${x + r * 0.45},${y - r * 0.89} Z`}
    fill={fill}
  />
);

type StampProps = {
  readonly x: number;
  readonly y: number;
  /** Quanto o carimbo já bateu, de 0 a 1: vem grande e assenta. */
  readonly pressed: number;
};

/** O carimbo "cobrado": moldura e letra coral, torto, como todo carimbo. */
const Stamp: React.FC<StampProps> = ({ x, y, pressed }) => (
  <g
    transform={`translate(${x} ${y}) rotate(-13) scale(${1.7 - 0.7 * pressed})`}
    opacity={Math.min(1, pressed * 3)}
  >
    <rect
      x={-158}
      y={-52}
      width={316}
      height={104}
      rx={20}
      fill={ink.paper}
      stroke={chalkboard.stamp}
      strokeWidth={10}
    />
    <text
      y={20}
      textAnchor="middle"
      fontFamily={typography.family}
      fontWeight={typography.weight}
      fontSize={typography.size.note}
      fill={chalkboard.stamp}
    >
      cobrado
    </text>
  </g>
);

type SleepBillProps = {
  /** Tamanho do desenho: 1 dá um papel de 420 px de largura, com o título no tamanho "note". */
  readonly scale?: number;
  /** Quantas linhas de sono devido já foram lançadas, de 0 a `BILL_LINES`; o papel cresce com elas. */
  readonly lines?: number;
  /** O carimbo "cobrado", de 0 (sem carimbo) a 1 (batido). */
  readonly stamp?: number;
  /** A conta virando ficha de teste, de 0 a 1: ganha a prancheta, o prendedor e um quadrado para marcar. */
  readonly form?: number;
  /** O visto no quadrado da ficha, de 0 a 1. */
  readonly checked?: number;
  /** Só o lugar da conta, em contorno tracejado: a conta que não existe. */
  readonly vacant?: boolean;
  /** A cor do contorno do lugar vazio. */
  readonly vacantColor?: string;
};

/**
 * A conta aberta: o papel "sono devido", com uma linha por noite devida. O
 * ponto de referência é o canto de cima à esquerda; a altura vem de
 * `billHeight`.
 */
export const SleepBill: React.FC<SleepBillProps> = ({
  scale = 1,
  lines = BILL_LINES,
  stamp = 0,
  form = 0,
  checked = 0,
  vacant = false,
  vacantColor = ink.dark,
}) => {
  const height = billHeight(lines, form);
  const rowY = HEADER + LINE * lines + 18;

  if (vacant) {
    return (
      <svg
        width={BILL_WIDTH * scale}
        height={height * scale}
        viewBox={`0 0 ${BILL_WIDTH} ${height}`}
        overflow="visible"
      >
        <rect
          x={5}
          y={5}
          width={BILL_WIDTH - 10}
          height={height - 10}
          rx={22}
          fill="none"
          stroke={vacantColor}
          strokeWidth={10}
          strokeDasharray="34 26"
          strokeLinecap="round"
          opacity={0.6}
        />
      </svg>
    );
  }

  return (
    <svg
      width={BILL_WIDTH * scale}
      height={height * scale}
      viewBox={`0 0 ${BILL_WIDTH} ${height}`}
      overflow="visible"
    >
      {form > 0 ? (
        // A prancheta por trás do papel: é ela que faz da conta uma ficha.
        <rect
          x={-34}
          y={-40}
          width={BILL_WIDTH + 68}
          height={height + 92}
          rx={34}
          fill={chalkboard.frame}
          opacity={form}
        />
      ) : null}
      {/* A sombra do papel, deslocada para o lado oposto à luz. */}
      <path
        d={paperPath(BILL_WIDTH, height)}
        fill={lab.platformShade}
        transform="translate(10 12)"
        opacity={form > 0 ? 0 : 0.55}
      />
      <path d={paperPath(BILL_WIDTH, height)} fill={ink.ring} />
      <text
        x={BILL_WIDTH / 2}
        y={78}
        textAnchor="middle"
        fontFamily={typography.family}
        fontWeight={typography.weight}
        fontSize={typography.size.note}
        fill={ink.dark}
      >
        sono devido
      </text>
      <rect
        x={32}
        y={104}
        width={BILL_WIDTH - 64}
        height={6}
        rx={3}
        fill={lab.platformShade}
      />
      {Array.from({ length: Math.ceil(lines) }, (_, index) => {
        const shown = Math.min(1, lines - index);
        const y = HEADER + LINE * index + LINE / 2;
        return (
          <g key={index} opacity={Math.min(1, shown * 2)}>
            <Moon x={54} y={y} r={15} fill={idea.lilac.contact} />
            <rect
              x={90}
              y={y - 8}
              width={
                (BILL_WIDTH - 130) * ENTRIES[index % ENTRIES.length] * shown
              }
              height={16}
              rx={8}
              fill={idea.lilac.bottom}
            />
          </g>
        );
      })}
      {form > 0 ? (
        <g opacity={form}>
          <rect
            x={36}
            y={rowY}
            width={68}
            height={68}
            rx={14}
            fill={ink.ring}
            stroke={ink.dark}
            strokeWidth={8}
          />
          <rect
            x={130}
            y={rowY + 26}
            width={BILL_WIDTH - 176}
            height={16}
            rx={8}
            fill={ink.dark}
            opacity={0.7}
          />
          <rect
            x={BILL_WIDTH / 2 - 86}
            y={-58}
            width={172}
            height={64}
            rx={20}
            fill={lab.clip}
          />
          <rect
            x={BILL_WIDTH / 2 - 40}
            y={-40}
            width={80}
            height={18}
            rx={9}
            fill={lab.platformShade}
          />
        </g>
      ) : null}
      {stamp > 0 ? (
        <Stamp
          x={BILL_WIDTH / 2 + 14}
          y={HEADER + (LINE * lines) / 2}
          pressed={stamp}
        />
      ) : null}
      {checked > 0 ? (
        // O visto sai do quadrado, grande: é ele que se lê de longe.
        <path
          d={`M${44},${rowY + 30} L${70},${rowY + 62} L${128},${rowY - 22}`}
          fill="none"
          stroke={signs.seal[1]}
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={160}
          strokeDashoffset={160 * (1 - checked)}
        />
      ) : null}
    </svg>
  );
};

/** Tamanho da conta dobrada, em escala 1. */
export const FOLDED = { width: 230, height: 170 };

type FoldedBillProps = {
  readonly scale?: number;
};

/** A conta dobrada em quatro: um maço de papel com a ponta do carimbo à vista. */
export const FoldedBill: React.FC<FoldedBillProps> = ({ scale = 1 }) => {
  const id = useId();
  return (
    <svg
      width={FOLDED.width * scale}
      height={FOLDED.height * scale}
      viewBox={`0 0 ${FOLDED.width} ${FOLDED.height}`}
      overflow="visible"
    >
      <clipPath id={id}>
        <rect width={FOLDED.width} height={FOLDED.height} rx={18} />
      </clipPath>
      <rect
        x={12}
        y={12}
        width={FOLDED.width}
        height={FOLDED.height}
        rx={18}
        fill={lab.platformShade}
      />
      <rect
        width={FOLDED.width}
        height={FOLDED.height}
        rx={18}
        fill={ink.ring}
      />
      <g clipPath={`url(#${id})`}>
        {/* O carimbo dobrado junto: só um canto dele aparece. */}
        <rect
          x={70}
          y={84}
          width={260}
          height={96}
          rx={18}
          fill="none"
          stroke={chalkboard.stamp}
          strokeWidth={12}
          transform="rotate(-13 70 84)"
        />
        <rect
          x={0}
          y={0}
          width={FOLDED.width}
          height={14}
          fill={lab.platformShade}
        />
        <rect
          x={0}
          y={0}
          width={14}
          height={FOLDED.height}
          fill={lab.platformShade}
        />
        <rect
          x={40}
          y={40}
          width={120}
          height={14}
          rx={7}
          fill={idea.lilac.bottom}
        />
      </g>
    </svg>
  );
};

/** Tamanho do bolso (o retalho de tecido inteiro), em escala 1. */
export const POCKET = { width: 200, height: 230 };
/** Onde o bolso fica marcado: o canto de cima, à direita, dentro da margem segura. O selo da fonte ocupa o de baixo. */
export const POCKET_CORNER = { x: 1700, y: 190, scale: 0.8 };

type BillPocketProps = {
  readonly scale?: number;
  /** Quanto a conta dobrada está dentro do bolso: 0, bolso vazio; 1, guardada, só com a ponta de fora. */
  readonly filled?: number;
};

/**
 * O bolso em que a conta fica guardada: um retalho da blusa da pessoa, com o
 * bolso costurado e a ponta da conta dobrada aparecendo. O ponto de
 * referência é o centro do retalho. É a peça pequena que as outras cenas
 * mantêm em `POCKET_CORNER`.
 */
export const BillPocket: React.FC<BillPocketProps> = ({
  scale = 1,
  filled = 1,
}) => {
  const id = useId();
  return (
    <svg
      width={POCKET.width * scale}
      height={POCKET.height * scale}
      viewBox={`${-POCKET.width / 2} ${-POCKET.height / 2} ${POCKET.width} ${POCKET.height}`}
      overflow="visible"
    >
      <rect
        x={-POCKET.width / 2}
        y={-POCKET.height / 2}
        width={POCKET.width}
        height={POCKET.height}
        rx={44}
        fill={person.top}
      />
      {/* A ponta da conta, atrás da frente do bolso: desce para dentro dele ao ser guardada. */}
      {filled > 0 ? (
        <g transform={`translate(0 ${-150 * (1 - filled)})`}>
          <clipPath id={id}>
            <rect x={-62} y={-84} width={116} height={120} rx={12} />
          </clipPath>
          <rect
            x={-54}
            y={-92}
            width={116}
            height={120}
            rx={12}
            fill={lab.platformShade}
          />
          <rect
            x={-62}
            y={-84}
            width={116}
            height={120}
            rx={12}
            fill={ink.ring}
          />
          {/* O canto do carimbo, cortado pela borda do papel dobrado. */}
          <rect
            x={-26}
            y={-58}
            width={140}
            height={56}
            rx={12}
            fill="none"
            stroke={chalkboard.stamp}
            strokeWidth={9}
            transform="rotate(-13 -26 -58)"
            clipPath={`url(#${id})`}
          />
        </g>
      ) : null}
      <path
        d="M-74,-36 L74,-36 L74,44 C74,74 40,92 0,96 C-40,92 -74,74 -74,44 Z"
        fill={person.topShade}
      />
      <path
        d="M-58,-8 L-58,40 C-58,62 -30,76 0,80 C30,76 58,62 58,40 L58,-8"
        fill="none"
        stroke={person.topLight}
        strokeWidth={6}
        strokeDasharray="14 12"
        strokeLinecap="round"
      />
      <rect
        x={-82}
        y={-46}
        width={164}
        height={30}
        rx={12}
        fill={person.pants}
      />
    </svg>
  );
};

/** A conta de Gardner, de perto: tamanho do papel em escala 1. */
export const DETAIL = { width: 980, height: 560 };
/** Quantas noites a conta de Gardner risca. */
export const DETAIL_NIGHTS = 11;

type SleepBillDetailProps = {
  readonly scale?: number;
  /** Quantas das onze noites já foram riscadas, de 0 a 11. */
  readonly nights?: number;
  /** O "14 h" do outro lado, de 0 a 1. */
  readonly hours?: number;
  /** A seta para baixo com "mais fundo", sob as "14 h", de 0 a 1. */
  readonly deeper?: number;
  /** A família da etiqueta "mais fundo": a do fundo do plano. */
  readonly on?: TagTone;
};

/**
 * A conta de perto, como detalhe: de um lado, onze noites riscadas; do outro,
 * só "14 h"; e, sob elas, a seta "mais fundo". Cada parte entra separada. O
 * ponto de referência é o canto de cima à esquerda.
 */
export const SleepBillDetail: React.FC<SleepBillDetailProps> = ({
  scale = 1,
  nights = DETAIL_NIGHTS,
  hours = 1,
  deeper = 0,
  on = "lilac",
}) => {
  const { width, height } = DETAIL;
  const half = width / 2;
  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
    >
      <path
        d={paperPath(width, height)}
        fill={lab.platformShade}
        transform="translate(12 14)"
        opacity={0.55}
      />
      <path d={paperPath(width, height)} fill={ink.ring} />
      <line
        x1={half}
        y1={56}
        x2={half}
        y2={height - 56}
        stroke={lab.platformShade}
        strokeWidth={8}
        strokeDasharray="8 22"
        strokeLinecap="round"
      />
      {/* As onze noites em três fileiras (quatro, quatro, três); cada uma é riscada na sua vez. */}
      {Array.from({ length: DETAIL_NIGHTS }, (_, index) => {
        const x = 96 + (index % 4) * 98 + (index >= 8 ? 49 : 0);
        const y = 150 + Math.floor(index / 4) * 130;
        const struck = Math.max(0, Math.min(1, nights - index));
        return (
          <g key={index}>
            <Moon x={x} y={y} r={34} fill={idea.lilac.contact} />
            <line
              x1={x - 40}
              y1={y + 40}
              x2={x - 40 + 80 * struck}
              y2={y + 40 - 80 * struck}
              stroke={chalkboard.stamp}
              strokeWidth={12}
              strokeLinecap="round"
              opacity={struck > 0 ? 1 : 0}
            />
          </g>
        );
      })}
      <text
        x={half + half / 2}
        y={250}
        textAnchor="middle"
        fontFamily={typography.family}
        fontWeight={typography.weight}
        fontSize={typography.size.display}
        fill={ink.dark}
        opacity={hours}
      >
        14 h
      </text>
      <g opacity={deeper} transform={`translate(${half + half / 2} 0)`}>
        <path
          d="M0,296 L0,372 M-30,346 L0,378 L30,346"
          fill="none"
          stroke={chalkboard.stamp}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={-170}
          y={404}
          width={340}
          height={86}
          rx={43}
          fill={tags[on].fill}
        />
        <text
          y={466}
          textAnchor="middle"
          fontFamily={typography.family}
          fontWeight={typography.weight}
          fontSize={typography.size.note}
          fill={tags[on].text}
        >
          mais fundo
        </text>
      </g>
    </svg>
  );
};

type BillToPocketProps = {
  /** Onde a conta aberta está: o meio do alto do papel, em pixels do quadro, e a escala dela. */
  readonly from: readonly [number, number];
  readonly scale?: number;
  /** Onde o bolso está: o centro dele e a escala. Padrão: o canto marcado. */
  readonly pocket?: {
    readonly x: number;
    readonly y: number;
    readonly scale: number;
  };
  /**
   * O caminho, de 0 a 1: em 0 a conta está aberta em `from`; até 0,4 ela se
   * dobra no lugar; de 0,4 a 1 o maço vai até a boca do bolso e entra. Para a
   * conta SAIR do bolso e se abrir, passe o mesmo valor ao contrário (1 - t).
   */
  readonly progress: number;
  readonly lines?: number;
  readonly stamp?: number;
};

const FOLD_END = 0.4;
// O maço chega à boca do bolso neste ponto do caminho; daí em diante é o bolso quem mostra o papel descendo.
const ARRIVAL = 0.8;
const between = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * A conta a caminho do bolso (ou saindo dele): dobra, viaja e entra. Desenha
 * a conta e o bolso juntos, para a ponta do papel passar por trás da frente do
 * bolso. Ocupa o quadro inteiro; vai solto na cena, fora de `Place`.
 */
export const BillToPocket: React.FC<BillToPocketProps> = ({
  from,
  scale = 1,
  pocket = POCKET_CORNER,
  progress,
  lines = BILL_LINES,
  stamp = 1,
}) => {
  const folding = clamp01(progress / FOLD_END);
  const travel = clamp01((progress - FOLD_END) / (1 - FOLD_END));
  const flying = clamp01(travel / ARRIVAL);
  const entering = clamp01((travel - ARRIVAL) / (1 - ARRIVAL));
  const height = billHeight(lines) * scale;
  // O maço chega do tamanho da ponta de papel que o bolso mostra, logo acima da boca dele.
  const packet = between(scale, (pocket.scale * 116) / FOLDED.width, flying);
  const mouth = [
    pocket.x - 4 * pocket.scale,
    pocket.y - 174 * pocket.scale,
  ] as const;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: pocket.x,
          top: pocket.y,
          translate: "-50% -50%",
        }}
      >
        <BillPocket scale={pocket.scale} filled={entering} />
      </div>
      {folding < 1 ? (
        <div
          style={{
            position: "absolute",
            left: from[0],
            top: from[1] + height / 2,
            translate: "-50% -50%",
            // A dobra, em dois tempos: primeiro o papel dobra de baixo para cima, depois dos lados para o meio.
            scale: `${between(1, FOLDED.width / BILL_WIDTH, clamp01(folding * 2 - 1))} ${between(1, (FOLDED.height * scale) / height, clamp01(folding * 2))}`,
          }}
        >
          <SleepBill scale={scale} lines={lines} stamp={stamp} />
        </div>
      ) : flying < 1 ? (
        <div
          style={{
            position: "absolute",
            left: between(from[0], mouth[0], flying),
            top: between(from[1] + height / 2, mouth[1], flying),
            translate: "-50% -50%",
          }}
        >
          <FoldedBill scale={packet} />
        </div>
      ) : null}
    </>
  );
};
