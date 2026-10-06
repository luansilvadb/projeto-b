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
  /**
   * A idade de cada anel, em segundos, pelo número do pulso que o soltou; um
   * valor negativo diz que esse pulso não soltou anel. Sem isto, a idade sai
   * do ritmo atual, e os anéis já soltos pulam quando o ritmo muda.
   */
  readonly ageOf?: (ring: number) => number;
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
  ageOf,
}) => {
  const period = 60 / Math.max(perMinute, 1);
  const latest = Math.floor(cycles);
  // Com a idade vinda de fora, um anel pode ser de um trecho mais rápido que o atual: conta pelo ritmo mais rápido que ela tem.
  const alive = Math.ceil(
    RING_SECONDS / (ageOf ? Math.min(period, 1) : period),
  );

  return (
    <g fill="none" stroke={color} strokeWidth={width * 0.012}>
      {Array.from({ length: alive + 1 }, (_, back) => {
        const age = ageOf
          ? ageOf(latest - back)
          : (cycles - (latest - back)) * period;
        if (age < 0 || age > RING_SECONDS || latest - back < 0) {
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
