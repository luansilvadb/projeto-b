import { Place } from "../../../components/Place";
import { signs } from "../palette";

/** Os três sinais de que um bicho dorme, na ordem em que a narração os diz. */
export type SleepSign = "quiet" | "slow" | "rebound";
export const SLEEP_SIGNS: readonly SleepSign[] = ["quiet", "slow", "rebound"];

const ICONS: Record<SleepSign, React.ReactNode> = {
  // Quieta à noite: a lua.
  quiet: <path d="M-10,-30 A32,32 0 1 0 28,14 A25,25 0 1 1 -10,-30 Z" />,
  // Lenta para reagir: o cronômetro.
  slow: (
    <>
      <circle r={26} fill="none" strokeWidth={9} />
      <rect x={-7} y={-42} width={14} height={12} rx={4} stroke="none" />
      <path
        d="M0,0 L0,-14 M0,0 L11,7"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
      />
    </>
  ),
  // Sono atrasado: o "z" de quem dorme fora de hora.
  rebound: (
    <>
      <path
        d="M-26,-6 L-2,-6 L-26,26 L-2,26"
        fill="none"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8,-32 L26,-32 L8,-10 L26,-10"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
};

type SealProps = {
  readonly sign: SleepSign;
  /** Diâmetro do selo, em pixels do quadro. */
  readonly size: number;
};

/** O selo de um sinal: um medalhão com o ícone dele. O centro do desenho é o centro do selo. */
export const Seal: React.FC<SealProps> = ({ sign, size }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120">
    <circle r={60} fill={signs.sealEdge} />
    <circle r={51} fill={signs.seal[SLEEP_SIGNS.indexOf(sign)]} />
    <g fill={signs.icon} stroke={signs.icon}>
      {ICONS[sign]}
    </g>
  </svg>
);

type SignPanelProps = {
  readonly sign: SleepSign;
  /** O centro do painel e o tamanho dele, em pixels do quadro. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Aceso de 0 a 1: apagado, o painel fica coberto pela cor de espera. */
  readonly lit: number;
  /** A cena do sinal, em pixels a partir do canto do painel: o painel a recorta. */
  readonly children: React.ReactNode;
};

const BACKGROUNDS: Record<SleepSign, readonly [string, string]> = {
  quiet: [signs.night[0], signs.night[1]],
  slow: [signs.tank[0], signs.tank[1]],
  rebound: [signs.day[0], signs.day[1]],
};
const BORDER = 10;

/** O painel de um sinal: uma janela de cantos redondos com a cena dele dentro e o selo no canto. */
export const SignPanel: React.FC<SignPanelProps> = ({
  sign,
  x,
  y,
  width,
  height,
  lit,
  children,
}) => {
  const [top, bottom] = BACKGROUNDS[sign];

  return (
    <Place x={x} y={y}>
      {/* O selo se prende ao canto desta caixa. */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            padding: BORDER,
            borderRadius: 44,
            background: signs.panel,
          }}
        >
          <div
            style={{
              position: "relative",
              width,
              height,
              borderRadius: 36,
              overflow: "hidden",
              background: `linear-gradient(${top}, ${bottom})`,
            }}
          >
            {children}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: signs.dim,
                opacity: 0.82 * (1 - lit),
              }}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: -12,
            top: -12,
            opacity: 0.35 + 0.65 * lit,
          }}
        >
          <Seal sign={sign} size={104} />
        </div>
      </div>
    </Place>
  );
};
