import { useCurrentFrame, useVideoConfig } from "remotion";
import { Earth } from "../../../art/Earth";
import { wave } from "../../../components/Idle";
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
/** O pedestal de perto: o lugar vazio enche o meio do quadro. */
export const CLOSE_SIGN = { x: 960, y: 1130, scale: 1.75 };

type MagnifierProps = {
  /** O centro da lente, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  /** O raio da lente. */
  readonly size?: number;
};

/** A lupa de quem procura: o cabo, o aro escuro, o vidro claro e o brilho nele. */
export const Magnifier: React.FC<MagnifierProps> = ({ x, y, size = 130 }) => (
  <SvgLayer>
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
  </SvgLayer>
);

type SearchProps = {
  /** O fundo de ideia sobre o qual o plano está: dá a cor da sombra de contato do globo. */
  readonly hue?: keyof typeof idea;
  /** Quadro em que o pedestal entra; por padrão, já está no quadro. */
  readonly signAt?: number;
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
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const { x, y, radius } = SEARCH_GLOBE;

  return (
    <>
      <SvgLayer>
        <IdeaShadow hue={hue} x={x} y={y + radius + 60} width={radius * 1.5} />
      </SvgLayer>
      <Place x={x} y={y}>
        <Earth
          radius={radius}
          spin={0.6 * linear(frame, 0, durationInFrames)}
        />
      </Place>
      <Magnifier
        x={x + 40 + 170 * wave(seconds, 3.1)}
        y={y - 20 + 130 * wave(seconds, 2.3, 0.25)}
      />
      <div
        style={{
          opacity: frame >= signAt ? 1 : 0,
        }}
      >
        <VacantSign {...SEARCH_SIGN} />
      </div>
    </>
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
