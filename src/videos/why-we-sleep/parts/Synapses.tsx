import { SvgLayer } from "../../../components/SvgLayer";
import { brainHalves, ink } from "../palette";

/** Dez conexões entre neurônios, da menor à maior fora de ordem: as duas maiores são as que o sono poupa. */
export const SYNAPSES = [0.55, 0.7, 1, 0.5, 0.65, 0.6, 0.95, 0.5, 0.7, 0.6];
/** A partir deste tamanho, a conexão é das grandes e firmes. */
const SPARED_FROM = 0.9;
/** Quanto as outras encolhem depois do sono: a área de contato fica cerca de 18% menor. */
const SHRUNK = 0.82;

export const isSpared = (size: number) => size >= SPARED_FROM;

type SynapseRowProps = {
  /** O centro da primeira conexão, a distância entre elas e o raio da maior. */
  readonly x: number;
  readonly y: number;
  readonly step: number;
  readonly radius: number;
  /** Quanto as conexões pequenas já encolheram, de 0 (como acordado) a 1 (depois do sono). */
  readonly slept: number;
  /** Destaca as que não encolhem. */
  readonly highlight?: number;
};

/**
 * Uma fileira de conexões entre neurônios: em cada uma, a ponta de um neurônio
 * (em cima) encosta na do outro (embaixo), e o tamanho do contato é o tamanho
 * da conexão.
 */
export const SynapseRow: React.FC<SynapseRowProps> = ({
  x,
  y,
  step,
  radius,
  slept,
  highlight = 0,
}) => (
  <SvgLayer>
    {SYNAPSES.map((size, index) => {
      const spared = isSpared(size);
      const r = radius * size * (spared ? 1 : 1 - (1 - SHRUNK) * slept);
      const cx = x + index * step;
      return (
        <g key={index}>
          {/* Os dois fios que chegam: o de cima e o de baixo. */}
          <line
            x1={cx}
            y1={y - radius * 2.1}
            x2={cx}
            y2={y + radius * 2.1}
            stroke={brainHalves.asleep}
            strokeWidth={10}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={y - r * 0.8} r={r} fill={brainHalves.awake} />
          <circle
            cx={cx}
            cy={y + r * 0.8}
            r={r * 0.9}
            fill={brainHalves.awakeCore}
          />
          {/* O rosto, na bolha de cima: as grandes ficam tranquilas; as que encolhem, assustadas. */}
          {[-1, 1].map((side) => (
            <circle
              key={side}
              cx={cx + side * r * 0.36}
              cy={y - r * 0.92}
              r={r * 0.15}
              fill={brainHalves.pupil}
            />
          ))}
          {spared ? (
            <path
              d={`M${cx - r * 0.26},${y - r * 0.56} Q${cx},${y - r * 0.34} ${cx + r * 0.26},${y - r * 0.56}`}
              fill="none"
              stroke={brainHalves.pupil}
              strokeWidth={r * 0.1}
              strokeLinecap="round"
            />
          ) : (
            <ellipse
              cx={cx}
              cy={y - r * 0.5}
              rx={r * (0.16 - 0.04 * slept)}
              ry={r * (0.05 + 0.15 * slept)}
              fill={brainHalves.pupil}
            />
          )}
          {spared ? (
            <circle
              cx={cx}
              cy={y}
              r={radius * 2}
              fill="none"
              stroke={ink.moon}
              strokeWidth={6}
              strokeDasharray="14 12"
              opacity={highlight}
            />
          ) : null}
        </g>
      );
    })}
  </SvgLayer>
);
