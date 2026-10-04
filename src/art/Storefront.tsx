import { useId } from "react";

export type StorefrontColors = {
  readonly wall: string;
  readonly wallShade: string;
  readonly base: string;
  readonly sign: string;
  readonly signIcon: string;
  /** As duas cores das listras do toldo e a barra que o prende. */
  readonly awning: readonly [string, string];
  readonly awningRail: string;
  readonly glass: string;
  readonly glassShine: string;
  readonly frame: string;
  /** O que está exposto na vitrine. */
  readonly goods: readonly [string, string];
  readonly door: string;
  readonly doorShade: string;
  readonly knob: string;
  readonly shutter: string;
  readonly shutterLine: string;
  readonly lamp: string;
  /** Cor do halo da lâmpada, quando ela está acesa. */
  readonly lampGlow: string | null;
};

/** O que a placa mostra: a lua do sono, ou o bicho dono da loja. */
export type StorefrontSign =
  | "moon"
  | "trunk"
  | "fin"
  | "wing"
  | "bell"
  | "mouse";

type StorefrontProps = {
  /** Largura da loja, de uma ponta à outra do toldo, em pixels do quadro. */
  readonly width: number;
  readonly colors: StorefrontColors;
  /** Quanto a porta de enrolar desceu, de 0 (aberta) a 1 (fechada). */
  readonly shutter?: number;
  readonly sign?: StorefrontSign;
  /** Quanto a lâmpada está acesa, de 0 a 1; só faz diferença quando as cores têm brilho de lâmpada. */
  readonly lamp?: number;
  /** A porta de enrolar desce só sobre a vitrine: metade da loja fecha, a porta fica. */
  readonly half?: boolean;
  /** A porta aberta: um vão escuro com o balcão do caixa, onde alguém pode ficar. */
  readonly doorOpen?: boolean;
};

// A loja cabe nesta caixa, com a calçada no meio da base.
const VIEW = { width: 520, height: 510 };
const OPENING = { x: -206, y: -306, width: 412, height: 270 };
/** A vitrine, dentro da abertura: a metade que fecha quando só metade da loja fecha. */
export const WINDOW = { x: -206, y: -306, width: 252, height: 214 };
/** A porta, dentro da abertura: onde o funcionário fica quando ela está aberta. */
export const DOOR = { x: 74, y: -306, width: 132, height: 270 };
const STRIPES = 8;
const SLAT = 18;

const SIGNS: Record<StorefrontSign, React.ReactNode> = {
  moon: (
    <>
      <path d="M-6,-486 A26,26 0 1 0 22,-448 A20,20 0 1 1 -6,-486 Z" />
      <circle cx={-52} cy={-470} r={5} />
      <circle cx={60} cy={-452} r={4} />
      <circle cx={48} cy={-478} r={3} />
    </>
  ),
  // Tromba de elefante, erguida.
  trunk: (
    <path d="M-34,-440 C-36,-470 -14,-490 12,-486 C34,-482 44,-462 34,-448 C28,-440 16,-442 14,-452 C12,-462 22,-466 22,-466 C6,-474 -10,-462 -8,-440 Z" />
  ),
  // Barbatana de golfinho, cortando a água.
  fin: (
    <>
      <path d="M-30,-442 C-16,-476 8,-490 30,-490 C20,-474 20,-456 32,-442 Z" />
      <path
        d="M-58,-436 Q-44,-446 -30,-436 Q-16,-426 -2,-436 Q12,-446 26,-436 Q40,-426 54,-436"
        fill="none"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </>
  ),
  // Asa longa de fragata.
  wing: (
    <path d="M-60,-452 C-40,-478 -20,-482 0,-462 C20,-482 40,-478 60,-452 C40,-464 22,-462 6,-446 L0,-434 L-6,-446 C-22,-462 -40,-464 -60,-452 Z" />
  ),
  // O sino da água-viva, de lado, com os braços para cima.
  bell: (
    <>
      <path d="M-40,-448 C-36,-432 36,-432 40,-448 Z" />
      <path
        d="M-24,-452 L-30,-484 M-8,-452 L-10,-490 M8,-452 L10,-490 M24,-452 L30,-484"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
      />
    </>
  ),
  // Cabeça de camundongo: as duas orelhas redondas.
  mouse: (
    <>
      <circle cx={-28} cy={-478} r={17} />
      <circle cx={28} cy={-478} r={17} />
      <circle cy={-454} r={26} />
    </>
  ),
};

/**
 * A loja da analogia do sono: uma loja de bairro vista de frente, com toldo
 * listrado, vitrine, porta e porta de enrolar. Vitrine acesa é estar acordado;
 * porta de enrolar baixada é dormir. A base do desenho é a calçada.
 */
export const Storefront: React.FC<StorefrontProps> = ({
  width,
  colors,
  shutter = 0,
  sign = "moon",
  lamp = 1,
  half = false,
  doorOpen = false,
}) => {
  const id = useId();
  const scale = width / VIEW.width;
  const shutterHeight = OPENING.height * shutter;
  const shutterWidth = half ? WINDOW.width : OPENING.width;

  return (
    <svg
      width={width}
      height={VIEW.height * scale}
      viewBox={`${-VIEW.width / 2} ${-VIEW.height} ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
    >
      <defs>
        <clipPath id={`${id}-wall`}>
          <rect x={-240} y={-420} width={480} height={420} rx={16} />
        </clipPath>
        <clipPath id={`${id}-opening`}>
          <rect {...OPENING} rx={10} />
        </clipPath>
        {colors.lampGlow ? (
          <radialGradient id={`${id}-lamp`}>
            <stop offset={0} stopColor={colors.lampGlow} stopOpacity={0.75} />
            <stop offset={1} stopColor={colors.lampGlow} stopOpacity={0} />
          </radialGradient>
        ) : null}
      </defs>

      <rect
        x={-240}
        y={-420}
        width={480}
        height={420}
        rx={16}
        fill={colors.wall}
      />
      <g clipPath={`url(#${id}-wall)`}>
        <path
          d="M150,-420 C190,-300 180,-120 160,0 L260,0 L260,-420 Z"
          fill={colors.wallShade}
        />
        <rect
          x={-240}
          y={-338}
          width={480}
          height={18}
          fill={colors.wallShade}
        />
      </g>

      {/* Vitrine, com o que está exposto e o reflexo do vidro. */}
      <rect
        x={-206}
        y={-306}
        width={252}
        height={214}
        rx={10}
        fill={colors.frame}
      />
      <rect
        x={-196}
        y={-296}
        width={232}
        height={194}
        rx={6}
        fill={colors.glass}
      />
      <rect
        x={-170}
        y={-176}
        width={50}
        height={74}
        rx={8}
        fill={colors.goods[0]}
      />
      <rect
        x={-108}
        y={-150}
        width={60}
        height={48}
        rx={8}
        fill={colors.goods[1]}
      />
      <circle cx={-10} cy={-134} r={30} fill={colors.goods[0]} />
      <path
        d="M-196,-296 L-120,-296 L-190,-170 L-196,-170 Z"
        fill={colors.glassShine}
        opacity={0.4}
      />
      <path
        d="M-96,-296 L-70,-296 L-150,-150 L-164,-150 Z"
        fill={colors.glassShine}
        opacity={0.3}
      />

      {doorOpen ? (
        // A porta aberta: o vão escuro da loja, com o balcão do caixa ao fundo.
        <>
          <rect {...DOOR} rx={10} fill={colors.frame} />
          <rect
            x={DOOR.x + 14}
            y={-150}
            width={DOOR.width - 28}
            height={16}
            rx={6}
            fill={colors.base}
          />
          <rect
            x={DOOR.x + 14}
            y={-134}
            width={DOOR.width - 28}
            height={98}
            fill={colors.wallShade}
          />
        </>
      ) : (
        <>
          <rect {...DOOR} rx={10} fill={colors.door} />
          <path
            d="M152,-306 L196,-306 Q206,-306 206,-296 L206,-36 L152,-36 Z"
            fill={colors.doorShade}
          />
          <rect
            x={92}
            y={-288}
            width={96}
            height={92}
            rx={8}
            fill={colors.glass}
          />
          <circle cx={96} cy={-160} r={9} fill={colors.knob} />
        </>
      )}

      {shutter > 0 ? (
        <g clipPath={`url(#${id}-opening)`}>
          <rect
            x={OPENING.x}
            y={OPENING.y}
            width={shutterWidth}
            height={shutterHeight}
            fill={colors.shutter}
          />
          {Array.from(
            { length: Math.max(0, Math.floor((shutterHeight - 6) / SLAT)) },
            (_, slat) => (
              <line
                key={slat}
                x1={OPENING.x}
                x2={OPENING.x + shutterWidth}
                y1={OPENING.y + (slat + 1) * SLAT}
                y2={OPENING.y + (slat + 1) * SLAT}
                stroke={colors.shutterLine}
                strokeWidth={4}
              />
            ),
          )}
          <rect
            x={OPENING.x}
            y={OPENING.y + shutterHeight - 14}
            width={shutterWidth}
            height={14}
            fill={colors.shutterLine}
          />
        </g>
      ) : null}
      <rect
        x={-252}
        y={-36}
        width={504}
        height={36}
        rx={8}
        fill={colors.base}
      />

      {/* Toldo listrado, com a borda em ondas. */}
      {Array.from({ length: STRIPES }, (_, stripe) => {
        const x = -260 + stripe * 65;
        const tone = colors.awning[stripe % 2];
        return (
          <g key={stripe} fill={tone}>
            <rect x={x} y={-398} width={65.5} height={62} />
            <circle cx={x + 32.5} cy={-336} r={32.5} />
          </g>
        );
      })}
      <rect
        x={-260}
        y={-410}
        width={520}
        height={18}
        rx={9}
        fill={colors.awningRail}
      />

      <rect
        x={-120}
        y={-500}
        width={240}
        height={78}
        rx={20}
        fill={colors.sign}
      />
      <g fill={colors.signIcon} stroke={colors.signIcon} strokeWidth={0}>
        {SIGNS[sign]}
      </g>

      {colors.lampGlow && lamp > 0 ? (
        <circle
          cx={222}
          cy={-240}
          r={130}
          fill={`url(#${id}-lamp)`}
          opacity={lamp}
        />
      ) : null}
      <rect x={212} y={-272} width={20} height={16} rx={4} fill={colors.base} />
      <circle cx={222} cy={-244} r={14} fill={colors.base} />
      <circle cx={222} cy={-244} r={14} fill={colors.lamp} opacity={lamp} />
    </svg>
  );
};
