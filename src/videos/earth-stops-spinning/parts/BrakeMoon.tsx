import { blockBrake, earth as earthColors, ink } from "../palette";
import { Moon } from "./Sky";

/**
 * O freio da Lua: os dois calombos de maré que ela levanta, um de cada lado
 * da Terra, e a comparação deles com a sapata de um freio encostada no
 * planeta que gira. A Lua fica à direita da Terra, na mesma altura.
 *
 * O calombo é mar, e fica na cor do mar. O vermelho do que freia fica só no
 * que é do freio: a chapa fina por fora do calombo e as faíscas do raspão.
 *
 * Vai dentro de um SVG, **antes** do `Globe` da mesma Terra: o calombo é a
 * sobra de uma elipse atrás do disco, e a Terra é desenhada por cima.
 */

type Disc = { readonly cx: number; readonly cy: number; readonly r: number };

// Quanto o calombo passa do raio, na ponta. Exagerado para se ver: a maré de verdade é de metros.
const SWELL = 0.2;
// Meia abertura, em graus, da chapa atrás de cada sapata.
const PLATE = 38;
// Quanto a chapa fica para fora do calombo, em fração do raio da Terra.
const GAP = 0.045;
// As cristas do mar levantado, em cada calombo: a altura, em fração do raio, a partir do meio.
const CRESTS = [-0.3, 0.02, 0.32] as const;

type BrakeMoonProps = {
  readonly earth: Disc;
  readonly moon: Disc;
  /** Quanto a maré já subiu, de 0 a 1. */
  readonly rise?: number;
  /** Quanto o calombo já virou sapata, de 0 a 1: a chapa, a haste que vem da Lua e as faíscas. */
  readonly press?: number;
  /** O tempo, em segundos, para as faíscas. */
  readonly seconds: number;
};

export const BrakeMoon: React.FC<BrakeMoonProps> = ({ earth, moon, rise = 1, press = 1, seconds }) => {
  const rx = earth.r * (1 + SWELL * rise);
  const ry = earth.r * (1 + 0.012 * rise);
  const gap = earth.r * GAP;
  const plate = (side: 1 | -1) => {
    const point = (degrees: number): string => {
      const angle = (degrees * Math.PI) / 180;
      return `${earth.cx + side * (rx + gap) * Math.cos(angle)},${earth.cy + (ry + gap) * Math.sin(angle)}`;
    };
    return `M${point(-PLATE)} A${rx + gap},${ry + gap} 0 0 ${side === 1 ? 1 : 0} ${point(PLATE)}`;
  };
  // A crista: uma onda curta, no meio da largura do calombo àquela altura.
  const crest = (side: 1 | -1, height: number): string => {
    const y = earth.cy + height * earth.r;
    const inner = earth.r * Math.sqrt(1 - height ** 2);
    const outer = rx * Math.sqrt(1 - (height * earth.r) ** 2 / ry ** 2);
    const half = (outer - inner) * 0.3;
    const x = earth.cx + side * (inner + outer) * 0.5;
    return `M${x - half},${y} q${half / 2},${-half * 0.7} ${half},0 q${half / 2},${half * 0.7} ${half},0`;
  };
  return (
    <g>
      <ellipse cx={earth.cx} cy={earth.cy} rx={rx} ry={ry} fill={earthColors.water} />
      {rise > 0.5 ? (
        <g
          fill="none"
          stroke={earthColors.waterLight}
          strokeWidth={earth.r * 0.022}
          strokeLinecap="round"
          opacity={rise * 2 - 1}
        >
          {([1, -1] as const).flatMap((side) =>
            CRESTS.map((height) => <path key={`${side}-${height}`} d={crest(side, height)} />),
          )}
        </g>
      ) : null}
      {press > 0 ? (
        <g opacity={Math.min(1, press * 1.5)}>
          {/* A haste: sai da Lua e empurra a sapata do lado dela. */}
          <line
            x1={moon.cx - moon.r * 0.6}
            y1={moon.cy}
            x2={moon.cx - moon.r * 0.6 - (moon.cx - moon.r * 0.6 - earth.cx - rx - gap) * press}
            y2={earth.cy}
            stroke={blockBrake.plate}
            strokeWidth={earth.r * 0.07}
            strokeLinecap="round"
          />
          {([1, -1] as const).map((side) => (
            <g key={side}>
              <path
                d={plate(side)}
                fill="none"
                stroke={ink.stop}
                strokeWidth={earth.r * 0.05}
                strokeLinecap="round"
              />
              {/* As faíscas do raspão, nas duas pontas de cada sapata, onde ela afina e encosta no chão. */}
              {([-1, 1] as const).flatMap((end) =>
                [0, 1, 2, 3].map((index) => {
                  const life = (((seconds * 2.6 + index / 4 + (side + end) * 0.13) % 1) + 1) % 1;
                  const angle = ((PLATE + 9) * end * Math.PI) / 180;
                  const x = earth.cx + side * earth.r * 1.03 * Math.cos(angle);
                  const y = earth.cy + earth.r * 1.03 * Math.sin(angle);
                  // Cada faísca abre num leque para fora da sapata.
                  const fan = angle + end * (0.5 + index * 0.28);
                  const reach = earth.r * (0.1 + 0.3 * life);
                  return (
                    <line
                      key={`${end}-${index}`}
                      x1={x + side * reach * 0.5 * Math.cos(fan)}
                      y1={y + reach * 0.5 * Math.sin(fan)}
                      x2={x + side * reach * Math.cos(fan)}
                      y2={y + reach * Math.sin(fan)}
                      stroke={index % 2 === 0 ? blockBrake.spark : ink.stop}
                      strokeWidth={earth.r * 0.032}
                      strokeLinecap="round"
                      opacity={press * (1 - life)}
                    />
                  );
                }),
              )}
            </g>
          ))}
        </g>
      ) : null}
      <Moon {...moon} night={-0.35} />
    </g>
  );
};
