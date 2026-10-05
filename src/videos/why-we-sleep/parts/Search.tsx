import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Earth } from "../../../art/Earth";
import { wave } from "../../../components/Idle";
import { StageContext, Stay, useStage } from "../../../components/Cast";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { ALREADY_SHOWN, linear, mix, settle } from "../../../components/timing";
import { typography } from "../../../design/tokens";
import { idea, ink, pedestal } from "../palette";
import { IdeaShadow } from "./IdeaBackdrop";
import { PEDESTAL_HEIGHT, VacantSign } from "./VacantSign";

/** O globo e o pedestal no plano aberto da procura. */
export const SEARCH_GLOBE = { x: 620, y: 520, radius: 340 };
export const SEARCH_SIGN = { x: 1440, y: 930, scale: 1.2 };
/**
 * Quanto a câmera do plano aberto já se aproximou quando a procura passa ao
 * plano de perto: os dois usam o valor, um para chegar nele e o outro para
 * partir dele, e a câmera não salta.
 */
export const SEARCH_PUSH = 0.032;
/** O pedestal de perto: o lugar vazio enche o meio do quadro. */
export const CLOSE_SIGN = { x: 960, y: 1130, scale: 1.75 };

type MagnifierProps = {
  /** O centro da lente, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  /** O raio da lente. */
  readonly size?: number;
  /** Quanto a lupa gira em volta do centro da lente, em graus: o cabo sobe ou desce. */
  readonly tilt?: number;
};

/** A lupa de quem procura: o cabo, o aro escuro, o vidro claro e o brilho nele. */
export const Magnifier: React.FC<MagnifierProps> = ({
  x,
  y,
  size = 130,
  tilt = 0,
}) => (
  <SvgLayer>
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <line
        x1={x + size * 0.74}
        y1={y + size * 0.74}
        x2={x + size * 1.9}
        y2={y + size * 1.9}
        stroke={ink.dark}
        strokeWidth={size * 0.3}
        strokeLinecap="round"
      />
      <line
        x1={x + size * 1.2}
        y1={y + size * 1.2}
        x2={x + size * 1.86}
        y2={y + size * 1.86}
        stroke={ink.tag}
        strokeWidth={size * 0.3}
        strokeLinecap="round"
      />
      <circle cx={x} cy={y} r={size} fill={ink.ring} opacity={0.3} />
      <path
        d={`M${x - size * 0.62},${y - size * 0.2} A${size * 0.66},${size * 0.66} 0 0 1 ${x - size * 0.1},${y - size * 0.64}`}
        fill="none"
        stroke={ink.ring}
        strokeWidth={size * 0.1}
        strokeLinecap="round"
        opacity={0.8}
      />
      <circle
        cx={x}
        cy={y}
        r={size}
        fill="none"
        stroke={ink.dark}
        strokeWidth={size * 0.18}
      />
    </g>
  </SvgLayer>
);

/**
 * Onde a lente está enquanto procura sobre o globo, `seconds` segundos antes
 * (negativo) ou depois de a procura passar ao plano seguinte: um vaivém sem
 * começo nem fim, que o plano de perto continua do mesmo ponto.
 */
export const searchWander = (seconds: number): readonly [number, number] => [
  SEARCH_GLOBE.x + 40 + 170 * wave(seconds, 3.1),
  SEARCH_GLOBE.y - 20 + 130 * wave(seconds, 2.3, 0.25),
];

// Voltas do globo por segundo, e as voltas que ele já deu no instante da passagem: o giro
// é contado a partir dela, para trás e para a frente, e o desenho pede um valor positivo.
const SPIN = { perSecond: 0.17, atHandover: 10 };

/** As voltas do globo, `seconds` segundos antes ou depois da passagem ao plano de perto. */
export const searchSpin = (seconds: number): number =>
  SPIN.atHandover + SPIN.perSecond * seconds;

// Quantos quadros a lupa espera para entrar no palco depois dos outros objetos: o globo chega antes dela.
const LENS_ENTERS_AFTER = 16;

/** Atrasa a entrada no palco de quem está dentro: a lupa só aparece com o globo já no lugar. */
const AfterTheGlobe: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const stage = useStage();
  const later = useMemo(
    () => ({
      ...stage,
      enter: (delay = 0, frames?: number) =>
        stage.enter(delay + LENS_ENTERS_AFTER, frames),
    }),
    [stage],
  );
  return (
    <StageContext.Provider value={later}>{children}</StageContext.Provider>
  );
};

type SearchProps = {
  /** O fundo de ideia sobre o qual o plano está: dá a cor da sombra de contato do globo. */
  readonly hue?: keyof typeof idea;
  /** Quadro em que o pedestal entra; por padrão, já está no quadro. */
  readonly signAt?: number;
  /** Quadro em que a placa "acordado 24 h" estoura; sem valor, ela já está lá. */
  readonly plaqueAt?: number;
  /** O foco de luz sobre o pedestal, de 0 a 1; por padrão, aceso. */
  readonly light?: number;
  /**
   * Quadro em que o plano passa a procura ao plano de perto, que a continua
   * (`the-question`): o globo, a lupa e o pedestal não saem do palco, ficam
   * até esse quadro e o plano seguinte assume o desenho de onde estavam. Sem
   * valor, a procura é só deste plano.
   */
  readonly handoverAt?: number;
};

/**
 * A procura pelo bicho que não dorme, em plano aberto: o globo gira sob a lupa
 * que vai e vem sobre ele e, ao lado, o pedestal "acordado 24 h" espera por um
 * dono sob o foco de luz. É o mesmo quadro no gancho e no fechamento. Não tem
 * fundo: vai por cima de um `IdeaBackdrop`.
 */
export const Search: React.FC<SearchProps> = ({
  hue = "mint",
  signAt = ALREADY_SHOWN,
  plaqueAt,
  light = 1,
  handoverAt,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stage = useStage();
  const seconds = frame / fps;
  const { x, y, radius } = SEARCH_GLOBE;
  const lens =
    handoverAt === undefined
      ? ([
          x + 40 + 170 * wave(seconds, 3.1),
          y - 20 + 130 * wave(seconds, 2.3, 0.25),
        ] as const)
      : searchWander((frame - handoverAt) / fps);
  // Depois da passagem, quem desenha a procura é o plano seguinte.
  if (handoverAt !== undefined && stage.handedOver) {
    return null;
  }

  const search = (
    <>
      <SvgLayer>
        <IdeaShadow hue={hue} x={x} y={y + radius + 60} width={radius * 1.5} />
      </SvgLayer>
      <Place x={x} y={y}>
        <Earth
          radius={radius}
          spin={
            handoverAt === undefined
              ? 0.6 * linear(frame, 0, durationInFrames)
              : searchSpin((frame - handoverAt) / fps)
          }
        />
      </Place>
      {handoverAt === undefined ? (
        <Magnifier x={lens[0]} y={lens[1]} />
      ) : (
        <AfterTheGlobe>
          <Magnifier x={lens[0]} y={lens[1]} />
        </AfterTheGlobe>
      )}
      <div
        style={{
          opacity: frame >= signAt ? 1 : 0,
        }}
      >
        <VacantSign {...SEARCH_SIGN} light={light} plaqueAt={plaqueAt} />
      </div>
    </>
  );
  // O que passa ao plano seguinte entra no palco, mas não sai dele.
  return handoverAt === undefined ? (
    search
  ) : (
    <Stay only="leaving">{search}</Stay>
  );
};

type SearchCloseProps = {
  /** Quanto a lupa já chegou ao lugar vazio, de 0 (fora do quadro, de onde vinha do globo) a 1. Por padrão, chega no começo do plano. */
  readonly arrived?: number;
  /** Quadro em que a interrogação aparece sobre o contorno tracejado. */
  readonly questionAt?: number;
};

/**
 * A procura de perto: a lupa para sobre o pedestal "acordado 24 h", que
 * continua vazio, e uma interrogação fica sobre o contorno tracejado. Não tem
 * fundo: vai por cima de um `IdeaBackdrop`.
 */
export const SearchClose: React.FC<SearchCloseProps> = ({
  arrived: ownArrived,
  questionAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrived = ownArrived ?? settle(frame, 0, 0.8 * fps);
  // O centro do contorno tracejado, já na escala do close.
  const slot = [
    CLOSE_SIGN.x,
    CLOSE_SIGN.y - (PEDESTAL_HEIGHT + 174) * CLOSE_SIGN.scale,
  ] as const;

  return (
    <>
      <VacantSign {...CLOSE_SIGN} />
      <Place x={slot[0]} y={slot[1]}>
        <Pop at={questionAt}>
          <div
            style={{
              fontFamily: typography.family,
              fontWeight: 900,
              fontSize: typography.size.display * 2,
              lineHeight: 1,
              color: pedestal.shade,
            }}
          >
            ?
          </div>
        </Pop>
      </Place>
      {/* A lupa vem da esquerda, de onde estava o globo, e para com o lugar vazio dentro da lente. */}
      <Magnifier
        x={mix(slot[0] - 1100, slot[0], arrived)}
        y={mix(slot[1] - 200, slot[1], arrived)}
        size={310}
      />
    </>
  );
};
