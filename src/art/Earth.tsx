import { useId } from "react";
import { palette } from "../design/tokens";

type EarthProps = {
  readonly radius: number;
  /** Voltas já dadas pelo planeta; os continentes deslizam conforme o valor cresce. */
  readonly spin?: number;
};

// Largura, em unidades do viewBox, da faixa de continentes que se repete.
const STRIP_WIDTH = 400;

const Continents: React.FC = () => (
  <g fill={palette.leaf.base}>
    <path d="M -60 -50 C -40 -70 -10 -60 -5 -35 C 0 -15 -25 -5 -20 15 C -15 35 0 50 -10 70 C -20 80 -35 60 -40 40 C -45 20 -60 10 -65 -10 C -70 -30 -70 -40 -60 -50 Z" />
    <path d="M 40 -60 C 70 -75 110 -65 120 -40 C 128 -20 105 -10 95 5 C 88 20 95 45 80 55 C 65 62 55 40 50 20 C 46 0 25 -5 25 -25 C 25 -45 30 -55 40 -60 Z" />
    <path d="M 150 20 C 165 12 185 18 188 32 C 190 45 172 52 158 48 C 146 44 142 28 150 20 Z" />
    <path d="M 230 -40 C 250 -55 280 -45 285 -25 C 288 -8 268 0 252 -4 C 236 -8 222 -25 230 -40 Z" />
  </g>
);

export const Earth: React.FC<EarthProps> = ({ radius, spin = 0 }) => {
  const id = useId();
  const drift = -(spin % 1) * STRIP_WIDTH;

  return (
    <svg width={radius * 2} height={radius * 2} viewBox="-100 -100 200 200">
      <defs>
        <radialGradient
          id={`${id}-ocean`}
          cx="-30"
          cy="-30"
          r="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={palette.ocean.light} />
          <stop offset="0.5" stopColor={palette.ocean.base} />
          <stop offset="1" stopColor={palette.ocean.dark} />
        </radialGradient>
        <clipPath id={`${id}-disc`}>
          <circle r="100" />
        </clipPath>
        {/* Sobra só a meia-lua oposta à luz, que vira a sombra do planeta. */}
        <mask id={`${id}-shade`}>
          <circle r="100" fill="white" />
          <circle cx="-24" cy="-24" r="100" fill="black" />
        </mask>
      </defs>

      <circle r="100" fill={`url(#${id}-ocean)`} />
      <g clipPath={`url(#${id}-disc)`}>
        <g transform={`translate(${drift} 0)`}>
          <Continents />
          <g transform={`translate(${STRIP_WIDTH} 0)`}>
            <Continents />
          </g>
        </g>
        <ellipse cy="-98" rx="44" ry="13" fill={palette.paper} />
        <ellipse cy="98" rx="52" ry="14" fill={palette.paper} />
      </g>
      <circle
        r="100"
        fill={palette.ink}
        opacity="0.32"
        mask={`url(#${id}-shade)`}
      />
    </svg>
  );
};
