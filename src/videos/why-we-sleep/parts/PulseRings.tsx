type PulseRingsProps = {
  /** Centro e largura do sino, no plano do assunto. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Pulsos completos desde o começo do plano: cada um soltou um anel. */
  readonly cycles: number;
  /** O ritmo atual, que diz quanto tempo cada anel leva para envelhecer. */
  readonly perMinute: number;
  readonly color: string;
};

// Quanto um anel dura e quanto ele cresce por segundo, em relação ao sino.
const RING_SECONDS = 3.2;
const GROWTH = 0.26;
// A borda do sino vista um pouco de cima: a mesma proporção do desenho da água-viva.
const FLATNESS = 92 / 330;

/**
 * Anéis que o sino solta na água a cada pulso: é o que deixa o ritmo visível.
 * Todos crescem na mesma velocidade, então um pulso mais lento os deixa mais
 * espaçados. Vai dentro de um SvgLayer.
 */
export const PulseRings: React.FC<PulseRingsProps> = ({
  x,
  y,
  width,
  cycles,
  perMinute,
  color,
}) => {
  const period = 60 / perMinute;
  const latest = Math.floor(cycles);
  const alive = Math.ceil(RING_SECONDS / period);

  return (
    <g fill="none" stroke={color} strokeWidth={width * 0.012}>
      {Array.from({ length: alive + 1 }, (_, back) => {
        const age = (cycles - (latest - back)) * period;
        if (age > RING_SECONDS || latest - back < 0) {
          return null;
        }
        const radius = (width / 2) * (1.08 + age * GROWTH);
        return (
          <ellipse
            key={latest - back}
            cx={x}
            cy={y}
            rx={radius}
            ry={radius * FLATNESS}
            opacity={0.75 * (1 - age / RING_SECONDS)}
          />
        );
      })}
    </g>
  );
};
