import "../../../design/fonts";
import { useId } from "react";
import { interpolateColors, random } from "remotion";
import type { PersonColors } from "../../../art/Person";
import { typography } from "../../../design/tokens";
import {
  chalkboard,
  customer,
  goods,
  idea,
  ink,
  lab,
  lagoon,
  person,
  personInPajamas,
  puzzle,
  researcher,
  savanna,
  signs,
  sleepResearcher,
  stopwatch,
  street,
} from "../palette";

/**
 * O experimento de 1924 (Jenkins e Dallenbach): as listas de sílabas sem
 * sentido, as duas pessoas que as decoravam, os dois pesquisadores e a
 * estante dos estudos que repetiram o resultado. Ninguém aqui é retrato: são a
 * construção da pessoa, com roupa e cabelo próprios (não há fonte para a
 * aparência de nenhum deles).
 */

/**
 * As duas pessoas do experimento. Nenhuma é a pessoa "você" nem o freguês da
 * loja: a primeira veste verde, a segunda, lilás-azulado e usa coque.
 */
export const SUBJECTS: readonly [PersonColors, PersonColors] = [
  {
    ...customer,
    top: signs.seal[1],
    topShade: idea.mint.contact,
    topLight: idea.mint.bottom,
  },
  {
    ...person,
    hair: researcher.hair,
    hairLight: researcher.hairLight,
    top: personInPajamas.top,
    topShade: personInPajamas.topShade,
    topLight: personInPajamas.topLight,
    pants: customer.pants,
    pantsShade: customer.pantsShade,
    shoe: customer.shoe,
    shoeShade: customer.shoeShade,
  },
];

/**
 * Os dois pesquisadores de 1924, de jaleco. Sem óculos nem cabelo grisalho
 * (que são de Rechtschaffen) e sem luvas (que são da pesquisadora do tanque).
 */
export const EXPERIMENTERS: readonly [PersonColors, PersonColors] = [
  { ...sleepResearcher, hair: customer.hair, hairLight: customer.hairLight },
  {
    ...sleepResearcher,
    skin: researcher.skin,
    skinShade: researcher.skinShade,
    lid: researcher.lid,
    hand: researcher.skin,
    handShade: researcher.skinShade,
    hair: person.hair,
    hairLight: person.hairLight,
  },
];

/** Sílabas inventadas, sem sentido em português: as da lista (simplificação aprovada em art.md). */
const SYLLABLES = [
  "zof",
  "bim",
  "tul",
  "kev",
  "daj",
  "rop",
  "nuk",
  "gib",
  "lem",
  "vus",
] as const;

// A folha cabe nesta caixa: duas colunas de cinco sílabas sob a linha do título.
const SHEET = { width: 360, height: 560 };
const CHIP = { width: 140, height: 70, xs: [30, 190], y: 112, pitch: 86 };

type SyllableSheetProps = {
  /** Largura da folha, em pixels do quadro (ou nas unidades de quem a contém). */
  readonly width: number;
  /**
   * Quanto cada sílaba está acesa, de 0 (esquecida: apagada) a 1 (lembrada),
   * na ordem de `SYLLABLES`. Sem valor, todas acesas.
   */
  readonly lit?: readonly number[];
  /** Só as tarjas, sem letra: para a folha pequena, em que a letra ficaria abaixo do mínimo legível. */
  readonly plain?: boolean;
  /** Onde o canto da folha fica, quando ela vai dentro de outro SVG (na mão de alguém). */
  readonly x?: number;
  readonly y?: number;
  /**
   * Quanto de cada sílaba já está escrita, de 0 (só a tarja, com o traço da
   * folha pequena) a 1, na ordem de `SYLLABLES`, ou um número só para todas: a
   * letra se escreve da esquerda para a direita e o traço some à frente dela.
   * Sem valor, vale `plain`: nada escrito, ou tudo.
   */
  readonly written?: readonly number[] | number;
};

/**
 * Uma lista de sílabas: a folha de papel com dez sílabas, cada uma numa
 * tarja. A tarja amarela é a sílaba lembrada; a cinza, de letra quase
 * sumida, a esquecida.
 */
export const SyllableSheet: React.FC<SyllableSheetProps> = ({
  width,
  lit,
  plain = false,
  x,
  y,
  written,
}) => {
  const id = useId();
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={(width * SHEET.height) / SHEET.width}
      viewBox={`0 0 ${SHEET.width} ${SHEET.height}`}
      overflow="visible"
    >
      {/* A folha de baixo, deslocada: dá espessura ao papel sem usar sombra transparente. */}
      <rect
        x={12}
        y={14}
        width={SHEET.width}
        height={SHEET.height}
        rx={26}
        fill={lab.platformShade}
      />
      <rect
        width={SHEET.width}
        height={SHEET.height}
        rx={26}
        fill={lab.paper}
      />
      <rect
        x={30}
        y={44}
        width={190}
        height={22}
        rx={11}
        fill={lab.paperLine}
      />
      {SYLLABLES.map((syllable, index) => {
        const on = lit?.[index] ?? 1;
        const cx = CHIP.xs[index % 2] + CHIP.width / 2;
        const top = CHIP.y + Math.floor(index / 2) * CHIP.pitch;
        const done =
          written === undefined
            ? plain
              ? 0
              : 1
            : typeof written === "number"
              ? written
              : (written[index] ?? 0);
        const tone = interpolateColors(on, [0, 1], [lab.platform, ink.dark]);
        return (
          <g key={syllable}>
            <rect
              x={cx - CHIP.width / 2}
              y={top}
              width={CHIP.width}
              height={CHIP.height}
              rx={18}
              fill={interpolateColors(
                on,
                [0, 1],
                [lab.platformShade, goods.crate],
              )}
            />
            {done < 1 ? (
              // O traço da folha pequena: some da esquerda para a direita, à frente da letra que se escreve.
              <rect
                x={cx - 44 + 88 * done}
                y={top + CHIP.height / 2 - 9}
                width={88 * (1 - done)}
                height={18}
                rx={9}
                fill={tone}
              />
            ) : null}
            {done > 0 ? (
              <>
                {done < 1 ? (
                  <clipPath id={`${id}-${index}`}>
                    <rect
                      x={cx - CHIP.width / 2}
                      y={top}
                      width={CHIP.width * done}
                      height={CHIP.height}
                    />
                  </clipPath>
                ) : null}
                <text
                  x={cx}
                  y={top + CHIP.height / 2 + 17}
                  textAnchor="middle"
                  fontFamily={typography.family}
                  fontWeight={typography.weight}
                  fontSize={50}
                  fill={tone}
                  clipPath={done < 1 ? `url(#${id}-${index})` : undefined}
                >
                  {syllable}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

type TestBadgeProps = {
  /** Como a pessoa passou as horas antes do teste: dormindo (a lua) ou acordada (o sol). */
  readonly kind: "slept" | "awake";
  /** Diâmetro, em pixels do quadro. */
  readonly size: number;
};

/** O selo que diz, sem palavra, de quem é a lista: de quem dormiu ou de quem ficou acordado. */
export const TestBadge: React.FC<TestBadgeProps> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" overflow="visible">
    <circle r={60} fill={ink.ring} />
    {kind === "slept" ? (
      <>
        <circle r={50} fill={street.night.sky[0]} />
        <path
          d="M8,-32 A32,32 0 1 0 32,12 A25,25 0 1 1 8,-32 Z"
          fill={ink.moon}
        />
        <circle cx={-26} cy={-18} r={5} fill={ink.ring} />
        <circle cx={-14} cy={24} r={4} fill={ink.ring} />
      </>
    ) : (
      <>
        <circle r={50} fill={lagoon.day.water[1]} />
        <g stroke={ink.moon} strokeWidth={8} strokeLinecap="round">
          {Array.from({ length: 8 }, (_, ray) => (
            <line
              key={ray}
              x1={0}
              y1={-30}
              x2={0}
              y2={-40}
              transform={`rotate(${ray * 45})`}
            />
          ))}
        </g>
        <circle r={21} fill={ink.moon} />
      </>
    )}
  </svg>
);

type HoursClockProps = {
  /** O centro e o raio do relógio, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  /** As horas que passaram desde que a lista foi decorada: a fatia pintada no mostrador de doze horas. */
  readonly hours: number;
};

/** Um relógio de parede com a fatia das horas passadas pintada. Vai dentro de um SvgLayer. */
export const HoursClock: React.FC<HoursClockProps> = ({
  x,
  y,
  radius,
  hours,
}) => {
  const angle = (Math.min(hours, 11.99) / 12) * Math.PI * 2;
  const reach = radius * 0.74;
  const tip = [Math.sin(angle) * reach, -Math.cos(angle) * reach];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={radius} fill={stopwatch.rim} />
      <circle r={radius * 0.86} fill={ink.paper} />
      {hours > 0 ? (
        <path
          d={`M0,0 L0,${-reach} A${reach},${reach} 0 ${angle > Math.PI ? 1 : 0} 1 ${tip[0]},${tip[1]} Z`}
          fill={ink.tag}
        />
      ) : null}
      {Array.from({ length: 12 }, (_, tick) => (
        <rect
          key={tick}
          x={-radius * 0.03}
          y={-radius * 0.82}
          width={radius * 0.06}
          height={radius * (tick % 3 === 0 ? 0.16 : 0.09)}
          rx={radius * 0.03}
          fill={stopwatch.rim}
          transform={`rotate(${tick * 30})`}
        />
      ))}
      <g stroke={ink.dark} strokeLinecap="round">
        <line x1={0} y1={0} x2={0} y2={-reach} strokeWidth={radius * 0.07} />
        <line
          x1={0}
          y1={0}
          x2={tip[0]}
          y2={tip[1]}
          strokeWidth={radius * 0.07}
        />
      </g>
      <circle r={radius * 0.09} fill={ink.dark} />
    </g>
  );
};

type ProfileHeadProps = {
  /** Diâmetro da cabeça, em pixels do quadro. O centro do desenho é o centro da cabeça. */
  readonly size: number;
  readonly colors: PersonColors;
  /**
   * Quanto o crânio está "aberto", de 0 a 1: um disco claro por cima do
   * cabelo, onde o cérebro aparece. A cena desenha o cérebro por cima, em
   * `profileBrain`.
   */
  readonly open?: number;
  /** A cor do disco: a mancha clara do fundo do plano. */
  readonly openColor?: string;
};

// A cabeça tem 300 unidades de diâmetro; o desenho é centrado nela e os ombros passam para baixo.
const HEAD = 300;
const SKULL = { x: 26, y: -44, radius: 112 };

/** Onde o cérebro cabe numa cabeça de perfil de diâmetro `size`: o deslocamento a partir do centro dela e a largura. */
export const profileBrain = (
  size: number,
): { readonly dx: number; readonly dy: number; readonly width: number } => ({
  dx: (SKULL.x * size) / HEAD,
  dy: (SKULL.y * size) / HEAD,
  width: (SKULL.radius * 1.62 * size) / HEAD,
});

/**
 * A cabeça de uma das pessoas, de perfil, virada para a esquerda e de olho
 * fechado: é quem dormiu. A mesma construção da pessoa (cabeça redonda,
 * topete, bochecha), vista de lado, com o pescoço e os ombros.
 */
export const ProfileHead: React.FC<ProfileHeadProps> = ({
  size,
  colors,
  open = 0,
  openColor = ink.paper,
}) => {
  const scale = size / HEAD;
  return (
    <svg
      width={440 * scale}
      height={440 * scale}
      viewBox="-220 -220 440 440"
      overflow="visible"
    >
      {/* Os ombros e o pescoço. */}
      <path
        d="M-170,330 C-176,236 -120,204 -40,196 L110,196 C196,204 250,240 244,330 Z"
        fill={colors.top}
      />
      <path
        d="M110,196 C196,204 250,240 244,330 L150,330 C160,270 150,226 110,196 Z"
        fill={colors.topShade}
      />
      <path
        d="M-34,110 L92,110 L104,200 Q36,232 -40,200 Z"
        fill={colors.skinShade}
      />
      {/* A cabeça, o nariz e a orelha. */}
      <ellipse rx={150} ry={146} fill={colors.skin} />
      <path
        d="M-140,-10 C-176,6 -182,34 -160,42 C-150,46 -140,44 -134,40 Z"
        fill={colors.skin}
      />
      <ellipse
        cx={-70}
        cy={62}
        rx={30}
        ry={18}
        fill={colors.blush}
        opacity={0.55}
      />
      <circle cx={62} cy={22} r={30} fill={colors.skinShade} />
      <circle cx={58} cy={22} r={15} fill={colors.skin} />
      {/* O cabelo cobre o alto e a nuca; o topete avança sobre a testa. */}
      <path
        d="M-132,-70 C-136,-150 -60,-176 14,-170 C110,-164 176,-100 166,0 C162,46 146,78 118,98 C124,50 112,6 78,-18 C40,-44 -30,-30 -132,-70 Z"
        fill={colors.hair}
      />
      <path
        d="M-112,-146 C-150,-170 -184,-150 -180,-124 C-166,-140 -146,-140 -130,-128 Z"
        fill={colors.hair}
      />
      <path
        d="M-70,-146 C-30,-164 30,-162 70,-144 C30,-150 -24,-152 -70,-146 Z"
        fill={colors.hairLight}
      />
      {/* O olho fechado, a sobrancelha e a boca pequena de quem dorme. */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M-116,-4 Q-96,14 -74,-2"
          stroke={colors.hair}
          strokeWidth={9}
        />
        <path d="M-118,-40 L-78,-44" stroke={colors.hair} strokeWidth={10} />
        <path
          d="M-128,82 Q-114,92 -100,84"
          stroke={colors.mouth}
          strokeWidth={8}
        />
      </g>
      {open > 0 ? (
        <circle
          cx={SKULL.x}
          cy={SKULL.y}
          r={SKULL.radius * open}
          fill={openColor}
        />
      ) : null}
    </svg>
  );
};

// Os livros da estante: cores frias e claras, para não disputar com o coral das barras e dos carimbos.
const SPINES = [
  signs.seal[0],
  puzzle.pieces[0],
  signs.seal[1],
  puzzle.pieces[3],
  ink.paper,
  lagoon.day.water[2],
  goods.crate,
  puzzle.pieces[2],
] as const;
const ROW_HEIGHT = 112;
const BOARD = 18;

type StudyShelfProps = {
  /** O meio da base da estante, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Quantas prateleiras a estante tem quando inteira. */
  readonly rows: number;
  /** Quantas já cresceram, de 0 a `rows`; a fração é a prateleira que está subindo. */
  readonly grown: number;
};

/**
 * A estante de estudos: cada prateleira que sobe é mais uma leva de pesquisa
 * que repetiu o resultado. Cresce do chão para cima. Vai dentro de um SvgLayer.
 */
export const StudyShelf: React.FC<StudyShelfProps> = ({
  x,
  y,
  width,
  rows,
  grown,
}) => {
  const shown = Math.max(0, Math.min(rows, grown));
  const height = shown * ROW_HEIGHT + BOARD;
  const left = x - width / 2;
  const inner = width - 56;

  return (
    <g>
      <rect
        x={left}
        y={y - height}
        width={width}
        height={height}
        rx={16}
        fill={chalkboard.frame}
      />
      <rect
        x={left + 20}
        y={y - height + BOARD}
        width={width - 40}
        height={Math.max(0, height - BOARD)}
        fill={savanna.day.contact}
      />
      {Array.from({ length: Math.ceil(shown) }, (_, row) => {
        // A prateleira que está subindo entra pelos livros, que crescem da tábua.
        const rise = Math.min(1, shown - row);
        const base = y - row * ROW_HEIGHT;
        let cursor = left + 28;
        const books: React.ReactNode[] = [];
        for (let book = 0; cursor < left + 28 + inner - 30; book++) {
          const pick = (trait: string) =>
            random(`study-${trait}-${row}-${book}`);
          const thick = Math.min(
            30 + pick("thick") * 34,
            left + 28 + inner - cursor,
          );
          const tall = (62 + pick("tall") * 24) * rise;
          const color = SPINES[Math.floor(pick("color") * SPINES.length)];
          books.push(
            <g key={book}>
              <rect
                x={cursor}
                y={base - BOARD - tall}
                width={thick - 4}
                height={tall}
                rx={6}
                fill={color}
              />
              {pick("band") > 0.5 ? (
                <rect
                  x={cursor}
                  y={base - BOARD - tall * 0.78}
                  width={thick - 4}
                  height={tall * 0.14}
                  fill={savanna.day.sky[0]}
                />
              ) : null}
            </g>,
          );
          cursor += thick;
        }
        return (
          <g key={row}>
            {books}
            <rect
              x={left}
              y={base - BOARD}
              width={width}
              height={BOARD}
              rx={8}
              fill={chalkboard.frame}
            />
            <rect
              x={left + 20}
              y={base - BOARD}
              width={width - 40}
              height={6}
              fill={savanna.day.far}
            />
          </g>
        );
      })}
    </g>
  );
};
