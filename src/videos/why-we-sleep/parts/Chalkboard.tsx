import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, type Stride } from "../../../art/Person";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import {
  Pop,
  popOpacity,
  popScale,
  POP_SECONDS,
} from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, mix, ramp } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import { chalkboard, ink, sleepResearcher, type TagTone } from "../palette";
import { LifeTree } from "./LifeTree";
import { Tag } from "./Tag";

export type Box = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** O quadro-negro no plano aberto: a árvore cabe inteira, com o carimbo por cima. */
export const BOARD_WIDE: Box = { x: 200, y: 90, width: 1520, height: 880 };

type BoardProps = Box & {
  /** O que está escrito a giz, em pixels do quadro. */
  readonly children?: React.ReactNode;
};

/**
 * O quadro-negro vazio: moldura de madeira, face verde-petróleo, a calha com
 * o giz e o apagador, e o pó de giz no canto. Quem o usa põe o conteúdo por
 * cima, em pixels do quadro (a árvore, as aspas, ou o que for).
 */
export const Board: React.FC<BoardProps> = ({
  x,
  y,
  width,
  height,
  children,
}) => (
  <>
    <SvgLayer>
      <rect
        x={x - 24}
        y={y - 24}
        width={width + 48}
        height={height + 48}
        rx={30}
        fill={chalkboard.frame}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={14}
        fill={chalkboard.face}
      />
      {/* Borda de luz no alto da face e o pó de giz de uma frase apagada. */}
      <rect
        x={x + 20}
        y={y + 14}
        width={width - 40}
        height={8}
        rx={4}
        fill={chalkboard.chalk}
        opacity={0.12}
      />
      <ellipse
        cx={x + width * 0.82}
        cy={y + height * 0.2}
        rx={width * 0.11}
        ry={height * 0.07}
        fill={chalkboard.chalk}
        opacity={0.07}
      />
      {/* A calha, com dois gizes e o apagador. */}
      <rect
        x={x - 6}
        y={y + height + 16}
        width={width + 12}
        height={22}
        rx={11}
        fill={chalkboard.frame}
      />
      <rect
        x={x + width * 0.12}
        y={y + height + 4}
        width={54}
        height={14}
        rx={7}
        fill={chalkboard.chalk}
      />
      <rect
        x={x + width * 0.12 + 70}
        y={y + height + 4}
        width={34}
        height={14}
        rx={7}
        fill={chalkboard.stamp}
      />
      <rect
        x={x + width * 0.78}
        y={y + height - 8}
        width={110}
        height={26}
        rx={8}
        fill={ink.dark}
      />
      <rect
        x={x + width * 0.78}
        y={y + height + 8}
        width={110}
        height={10}
        rx={5}
        fill={chalkboard.chalk}
      />
    </SvgLayer>
    {children}
  </>
);

type StampProps = {
  /** O centro do carimbo, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  /** Altura da letra, em pixels do quadro. */
  readonly size?: number;
  /** Quadro em que o carimbo cai; por padrão, já está no quadro. */
  readonly at?: number;
  /**
   * Quanto o carimbo já perdeu a cor, de 0 (inteiro, em coral) a 1 (só o
   * contorno de giz apagado). É o fecho do vídeo: "erro?" deixa de valer.
   */
  readonly faded?: number;
  /**
   * Quadro em que o carimbo aparece no ar, antes de bater em `at`: ele surge
   * grande, recua (o aviso) e desce de uma vez. Sem valor, só cai em `at`.
   */
  readonly raisedAt?: number;
};

// O carimbo no ar: o tamanho com que paira, até onde recua, e quanto afunda ao bater.
const RAISED = { hover: 1.4, back: 1.75, sunk: 0.93 };
// Em quadros: quanto dura o recuo antes da batida, a descida e o assentar.
const STRIKE = { windup: 9, fall: 3, settle: 6 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** O carimbo "erro?": coral e enorme quando vale; um contorno de giz apagado quando não vale mais. */
export const Stamp: React.FC<StampProps> = ({
  x,
  y,
  size = typography.size.display,
  at = ALREADY_SHOWN,
  faded = 0,
  raisedAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frames = POP_SECONDS * fps;
  // Com aviso: surge no ar, recua devagar e bate em três quadros; passa do ponto e volta.
  const struck =
    raisedAt === undefined
      ? popScale(frame, at, frames, 1.8, 0.96)
      : frame < at - STRIKE.windup
        ? RAISED.hover * popScale(frame, raisedAt, frames * 0.7, 0.6, 1.08)
        : interpolate(
            frame,
            [
              at - STRIKE.windup,
              at,
              at + STRIKE.fall,
              at + STRIKE.fall + STRIKE.settle,
            ],
            [RAISED.hover, RAISED.back, RAISED.sunk, 1],
            clamp,
          );
  // No recuo ele também gira um pouco para trás, e volta ao bater.
  const cocked =
    raisedAt === undefined
      ? 0
      : interpolate(
          frame,
          [at - STRIKE.windup, at, at + STRIKE.fall],
          [0, -5, 0],
          clamp,
        );
  const border = Math.max(8, size * 0.07);
  const face: React.CSSProperties = {
    fontFamily: typography.family,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1,
    whiteSpace: "nowrap",
    padding: "0.16em 0.42em 0.2em",
    borderRadius: size * 0.22,
  };

  return (
    <Place x={x} y={y} style={{ rotate: "-9deg" }}>
      <div
        style={{
          position: "relative",
          opacity: popOpacity(frame, raisedAt ?? at, frames),
          // O carimbo cai de cima: chega grande e assenta.
          scale: struck,
          rotate: `${cocked}deg`,
        }}
      >
        {/* O contorno apagado fica por baixo e aparece quando a cor sai. */}
        <div
          style={{
            ...face,
            color: chalkboard.chalk,
            border: `${border}px dashed ${chalkboard.chalk}`,
            opacity: 0.3 * faded,
          }}
        >
          erro?
        </div>
        <div
          style={{
            ...face,
            position: "absolute",
            inset: 0,
            color: ink.dark,
            background: chalkboard.stamp,
            border: `${border}px solid ${chalkboard.stamp}`,
            // A moldura interna do carimbo, um tom abaixo.
            boxShadow: `inset 0 0 0 ${border * 0.6}px ${ink.tagEdge}`,
            opacity: 1 - faded,
          }}
        >
          erro?
        </div>
      </div>
    </Place>
  );
};

/** Onde a árvore de giz fica num quadro-negro: o pé do tronco e a largura do desenho. */
export const chalkTree = (
  box: Box,
): { readonly x: number; readonly y: number; readonly width: number } => ({
  x: box.x + box.width / 2,
  y: box.y + box.height - (24 * box.width) / BOARD_WIDE.width,
  width: Math.min(box.width * 0.8, (box.height - 60) / 0.72),
});

/** Onde o carimbo "erro?" bate num quadro-negro: o centro dele e a altura da letra. */
export const chalkStamp = (
  box: Box,
): { readonly x: number; readonly y: number; readonly size: number } => ({
  x: box.x + box.width / 2 + chalkTree(box).width * 0.28,
  y: box.y + box.height * 0.76,
  size: (typography.size.display * 1.25 * box.width) / BOARD_WIDE.width,
});

type ChalkboardProps = {
  /** Onde o quadro fica. Por padrão, `BOARD_WIDE`. */
  readonly box?: Box;
  /** Quanto a árvore já cresceu, de 0 a 1. */
  readonly grown?: number;
  /**
   * O carimbo "erro?" sobre a árvore: "none" não tem; "full" é o do gancho;
   * "faded" é o do fecho, sem cor, com a interrogação pequena ao lado da árvore.
   * Entre um e outro, use `faded` (de 0 a 1) para a cor sair aos poucos.
   */
  readonly stamp?: "none" | "full" | "faded";
  /** Quadro em que o carimbo cai. */
  readonly stampAt?: number;
  /** Quanto o carimbo perdeu a cor, de 0 a 1; por padrão, o que `stamp` diz. */
  readonly faded?: number;
  /** Quadro em que o carimbo aparece no ar, antes de bater em `stampAt`; sem valor, só cai. */
  readonly stampRaisedAt?: number;
  /** O tronco, os bichos e os olhos da árvore, como em `LifeTree`; sem valor, a árvore de sempre. */
  readonly trunk?: number;
  readonly buds?: number;
  readonly closed?: number;
  readonly children?: React.ReactNode;
};

/**
 * O quadro-negro do gancho: a árvore da vida a giz, com um bicho de olhos
 * fechados na ponta de cada ramo, e o carimbo "erro?" por cima. Volta no
 * fecho, em que o carimbo perde a cor e sobra uma interrogação pequena.
 */
export const Chalkboard: React.FC<ChalkboardProps> = ({
  box = BOARD_WIDE,
  grown = 1,
  stamp = "none",
  stampAt = ALREADY_SHOWN,
  faded: ownFaded,
  stampRaisedAt,
  trunk,
  buds,
  closed,
  children,
}) => {
  const faded = ownFaded ?? (stamp === "faded" ? 1 : 0);
  const scale = box.width / BOARD_WIDE.width;
  const tree = chalkTree(box);
  const treeWidth = tree.width;
  const centerX = tree.x;
  const stampSpot = chalkStamp(box);

  return (
    <Board {...box}>
      <Place x={tree.x} y={tree.y} anchor="bottom">
        <LifeTree
          width={treeWidth}
          color={chalkboard.chalk}
          bud={chalkboard.chalk}
          eye={chalkboard.face}
          grown={grown}
          trunk={trunk}
          buds={buds}
          closed={closed}
        />
      </Place>
      {stamp === "none" ? null : (
        <>
          <Stamp
            x={stampSpot.x}
            y={stampSpot.y}
            size={stampSpot.size}
            at={stampAt}
            faded={faded}
            raisedAt={stampRaisedAt}
          />
          {/* A pergunta continua, pequena, ao lado da árvore. */}
          <Place
            x={centerX - treeWidth * 0.14}
            y={box.y + box.height * 0.8}
            style={{
              rotate: "-8deg",
              opacity: faded,
              scale: `${0.6 + 0.4 * faded}`,
            }}
          >
            <div
              style={{
                fontFamily: typography.family,
                fontWeight: 900,
                fontSize: typography.size.headline * scale,
                lineHeight: 1,
                color: chalkboard.chalk,
              }}
            >
              ?
            </div>
          </Place>
        </>
      )}
      {children}
    </Board>
  );
};

type QuoteProps = {
  /** O quadro em que as aspas se abrem. */
  readonly box: Box;
  /** Quadro em que as aspas abrem; as linhas e o fecho vêm em seguida. */
  readonly at?: number;
  /** Quadro em que cada linha de giz começa a se escrever; sem valor, em sequência depois das aspas. */
  readonly linesAt?: readonly number[];
  /** Quadro em que as aspas se fecham; sem valor, depois da última linha. */
  readonly closeAt?: number;
  /**
   * Quadro em que a frase é apagada: as linhas passam a giz esmaecido uma a
   * uma, de cima para baixo, e as aspas com elas. Sem valor, a frase fica.
   */
  readonly erasedAt?: number;
};

// Quanto sobra do giz depois de apagado, quantos quadros leva cada linha e quantos separam uma da seguinte.
const ERASED = { left: 0.16, frames: 7, every: 2 };

// As linhas de giz entre as aspas: a frase dele, sem as palavras (a narração a diz).
const QUOTE_LINES = [0.82, 0.92, 0.58] as const;

/** As aspas a giz e as linhas da frase: o que está no quadro é uma citação. Vai por cima de um `Board`. */
export const Quote: React.FC<QuoteProps> = ({
  box,
  at = 0,
  linesAt,
  closeAt,
  erasedAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // O que sobra do giz de cada coisa escrita, na ordem em que o apagador passa: as aspas que abrem, as linhas, as que fecham.
  const chalk = (order: number) =>
    erasedAt === undefined
      ? 1
      : mix(
          1,
          ERASED.left,
          ramp(frame, erasedAt + order * ERASED.every, ERASED.frames),
        );
  const mark: React.CSSProperties = {
    fontFamily: typography.family,
    fontWeight: 900,
    fontSize: box.height * 0.42,
    lineHeight: 0.8,
    height: box.height * 0.2,
    color: chalkboard.chalk,
  };

  return (
    <>
      <SvgLayer>
        {QUOTE_LINES.map((length, index) => (
          <rect
            key={index}
            x={box.x + box.width * 0.2}
            y={box.y + box.height * (0.4 + index * 0.13)}
            width={
              box.width *
              0.6 *
              length *
              ramp(
                frame,
                linesAt?.[index] ?? at + (0.3 + index * 0.3) * fps,
                (linesAt ? 0.5 : 0.4) * fps,
              )
            }
            height={22}
            rx={11}
            fill={chalkboard.chalk}
            opacity={0.85 * chalk(index + 1)}
          />
        ))}
      </SvgLayer>
      <Place x={box.x + box.width * 0.16} y={box.y + box.height * 0.24}>
        <Pop at={at}>
          <div style={{ ...mark, opacity: chalk(0) }}>“</div>
        </Pop>
      </Place>
      <Place x={box.x + box.width * 0.84} y={box.y + box.height * 0.82}>
        <Pop at={closeAt ?? at + 1.3 * fps}>
          <div style={{ ...mark, opacity: chalk(QUOTE_LINES.length + 1) }}>
            ”
          </div>
        </Pop>
      </Place>
    </>
  );
};

type ResearcherProps = {
  /** Os pés dele, em pixels do quadro, e a altura. */
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** Ele aponta para o que está à direita dele (o quadro). */
  readonly pointing?: boolean;
  /** Virado para a esquerda: o desenho é espelhado. */
  readonly flip?: boolean;
  /** Quadro em que a etiqueta "Allan Rechtschaffen" entra; sem valor, não há etiqueta. */
  readonly nameAt?: number;
  /** Onde a etiqueta fica, a partir dos pés dele, e o fundo sobre o qual ela fica. */
  readonly nameOffset?: readonly [number, number];
  readonly on?: TagTone;
  /**
   * Quanto o braço já subiu até onde ele aponta, de 0 (solto, com a mão na
   * cintura) a 1: é o gesto de `pointing` feito aos poucos, e com o braço
   * oscilando de leve depois de erguido. Sem valor, vale `pointing`.
   */
  readonly reach?: number;
  /** Inclinação do corpo, em graus, e quanto ele sobe do chão, em pixels: o balanço de quem anda. */
  readonly tilt?: number;
  readonly rise?: number;
  /** Quanto a pálpebra fecha além da piscada dele, de 0 a 1: esconde a troca de expressão. */
  readonly lid?: number;
  /** A passada de quem anda, como em `Person`: as pernas alternam, o corpo sobe e desce e os braços balançam. */
  readonly stride?: Stride;
  /**
   * Há quantos quadros ele já está no palco quando o plano começa: a
   * respiração e as piscadas continuam de onde estavam no plano anterior, em
   * vez de recomeçar. Por padrão, zero.
   */
  readonly since?: number;
};

// O braço de trás solto e apontando, nas unidades do desenho da pessoa.
const ARM = {
  loose: { hand: [100, -214], bend: 73 },
  pointing: { hand: [190, -400], bend: 20 },
} as const;

/**
 * Allan Rechtschaffen: a construção da pessoa, de jaleco, cabelo grisalho e
 * óculos redondos. Não é retrato (não há fonte para a aparência dele); quem
 * diz quem ele é é a etiqueta de nome.
 */
export const Researcher: React.FC<ResearcherProps> = ({
  x,
  y,
  height,
  pointing = false,
  flip = false,
  nameAt,
  nameOffset = [0, -height - 70],
  on = "peach",
  reach,
  tilt = 0,
  rise = 0,
  lid = 0,
  stride,
  since = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (frame + since) / fps;
  const turned = reach === undefined ? pointing : reach > 0.5;
  const backArm =
    reach === undefined
      ? pointing
        ? { hand: ARM.pointing.hand, bend: ARM.pointing.bend }
        : undefined
      : {
          hand: [
            mix(ARM.loose.hand[0], ARM.pointing.hand[0], reach),
            mix(ARM.loose.hand[1], ARM.pointing.hand[1], reach) +
              7 * reach * wave(seconds, 2.6),
          ] as const,
          bend: mix(ARM.loose.bend, ARM.pointing.bend, reach),
        };

  return (
    <>
      <Place
        x={x}
        y={y}
        anchor="bottom"
        style={{
          scale: `${flip ? -1 : 1} ${breath(seconds, "rechtschaffen")}`,
          // O `translate` do Place é o que apoia os pés no ponto: a subida do passo vai junto dele.
          ...(rise === 0
            ? null
            : { translate: `-50% calc(-100% - ${rise}px)` }),
          ...(tilt === 0 ? null : { rotate: `${tilt}deg` }),
        }}
      >
        <Person
          height={height}
          colors={sleepResearcher}
          glasses={ink.dark}
          expression={turned ? "curious" : "neutral"}
          blink={Math.max(lid, blink(seconds, "rechtschaffen"))}
          backArm={backArm}
          stride={stride}
        />
      </Place>
      {nameAt === undefined ? null : (
        <Place x={x + nameOffset[0]} y={y + nameOffset[1]}>
          <Pop at={nameAt}>
            <Tag size="note" on={on}>
              Allan Rechtschaffen
            </Tag>
          </Pop>
        </Place>
      )}
    </>
  );
};
