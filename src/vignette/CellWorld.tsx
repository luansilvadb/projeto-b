import { AbsoluteFill } from "remotion";
import { SvgLayer } from "../components/SvgLayer";
import { cell } from "./palette";
import { blob, pick, type WorldProps } from "./shapes";

// A célula é maior que o quadro: só a membrana aparece, nos cantos.
const BODY = { x: 960, y: 560, r: 1010 };
const NUCLEUS = { x: 640, y: 560, r: 250 };
const GOLGI = { x: 1420, y: 300 };
// Cada mitocôndria: o centro, a inclinação em graus e o tamanho.
const MITOCHONDRIA = [
  [1180, 720, -24, 1.15],
  [1560, 640, 38, 0.9],
  [1010, 250, 12, 0.8],
  [330, 880, -40, 0.95],
  [1300, 930, 8, 0.75],
  [250, 300, 60, 0.7],
] as const;
const VESICLES = 18;
const RIBOSOMES = 170;
const PROTEINS = 44;

/** A fita ondulada do retículo: um arco em volta do núcleo, com dobras. */
const fold = (radius: number, from: number, to: number, seed: number) => {
  const points = [];
  for (let step = 0; step <= 40; step += 1) {
    const angle = from + ((to - from) * step) / 40;
    const r = radius + 16 * Math.sin(step * 0.9 + seed);
    points.push(
      `${(NUCLEUS.x + r * Math.cos(angle)).toFixed(1)},${(NUCLEUS.y + r * Math.sin(angle)).toFixed(1)}`,
    );
  }
  return `M${points.join(" L")}`;
};

/**
 * O primeiro mundo da vinheta: dentro de uma célula. O núcleo à esquerda, o
 * retículo em volta dele, o complexo de Golgi, mitocôndrias, vesículas e
 * ribossomos por toda parte, e a membrana nos cantos do quadro.
 */
export const CellWorld: React.FC<WorldProps> = ({ seconds }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${cell.outside[0]}, ${cell.outside[1]})`,
    }}
  >
    <SvgLayer>
      <defs>
        <radialGradient id="cell-cytoplasm" cx="40%" cy="45%">
          <stop offset={0} stopColor={cell.cytoplasm[0]} />
          <stop offset={1} stopColor={cell.cytoplasm[1]} />
        </radialGradient>
      </defs>
      {/* As células vizinhas, lá fora. */}
      <circle cx={-260} cy={-240} r={420} fill={cell.neighbour} />
      <circle cx={2180} cy={1290} r={460} fill={cell.neighbour} />

      <circle cx={BODY.x} cy={BODY.y} r={BODY.r} fill="url(#cell-cytoplasm)" />
      {/* Manchas mais claras, que dão textura ao citoplasma. */}
      {Array.from({ length: 9 }, (_, index) => (
        <path
          key={index}
          d={blob(
            200 + pick("stain-x", index) * 1520,
            120 + pick("stain-y", index) * 840,
            140 + pick("stain-r", index) * 180,
            110 + pick("stain-r", index) * 120,
            `stain-${index}`,
          )}
          fill={cell.cytoplasmLight}
          opacity={0.28}
        />
      ))}
      {/* Os microtúbulos: fios que saem de perto do núcleo. */}
      <g stroke={cell.tubule} strokeWidth={5} opacity={0.45}>
        {Array.from({ length: 16 }, (_, index) => {
          const angle = (index / 16) * Math.PI * 2 + 0.2;
          return (
            <line
              key={index}
              x1={NUCLEUS.x + 300 * Math.cos(angle)}
              y1={NUCLEUS.y + 300 * Math.sin(angle)}
              x2={NUCLEUS.x + 1500 * Math.cos(angle + 0.12)}
              y2={NUCLEUS.y + 1500 * Math.sin(angle + 0.12)}
            />
          );
        })}
      </g>

      {/* O retículo: quatro fitas dobradas em volta do lado direito do núcleo. */}
      <g fill="none" strokeLinecap="round">
        {[330, 392, 454, 516].map((radius, index) => (
          <g key={radius}>
            <path
              d={fold(radius, -1.15 + index * 0.08, 1.2 - index * 0.1, index)}
              stroke={cell.erShade}
              strokeWidth={34}
            />
            <path
              d={fold(radius, -1.15 + index * 0.08, 1.2 - index * 0.1, index)}
              stroke={cell.er}
              strokeWidth={22}
            />
          </g>
        ))}
      </g>

      {/* O núcleo: o envelope com os poros, a cromatina e o nucléolo. */}
      <circle
        cx={NUCLEUS.x}
        cy={NUCLEUS.y}
        r={NUCLEUS.r}
        fill={cell.nucleus}
        stroke={cell.nucleusEdge}
        strokeWidth={24}
      />
      {Array.from({ length: 20 }, (_, index) => {
        const angle = (index / 20) * Math.PI * 2;
        return (
          <circle
            key={index}
            cx={NUCLEUS.x + NUCLEUS.r * Math.cos(angle)}
            cy={NUCLEUS.y + NUCLEUS.r * Math.sin(angle)}
            r={9}
            fill={cell.nucleus}
          />
        );
      })}
      <g
        fill="none"
        stroke={cell.chromatin}
        strokeWidth={12}
        strokeLinecap="round"
        opacity={0.75}
      >
        <path d="M480,470 q40,-50 90,-10 t80,10" />
        <path d="M500,640 q50,40 100,0 t90,20" />
        <path d="M700,400 q30,30 0,70 t30,60" />
        <path d="M760,640 q-30,50 20,80" />
        <path d="M470,560 q30,-20 60,10" />
      </g>
      <circle
        cx={NUCLEUS.x + 40}
        cy={NUCLEUS.y + 10}
        r={84}
        fill={cell.nucleolus}
      />
      <circle
        cx={NUCLEUS.x + 14}
        cy={NUCLEUS.y - 18}
        r={30}
        fill={cell.nucleolusLight}
      />

      {/* O complexo de Golgi: uma pilha de bolsas curvas, com vesículas se soltando. */}
      <g fill="none" strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((sac) => (
          <path
            key={sac}
            d={`M${GOLGI.x - 170 + sac * 16},${GOLGI.y + sac * 44} q${170 - sac * 16},${-70 + sac * 6} ${340 - sac * 32},0`}
            stroke={sac % 2 === 0 ? cell.golgi : cell.golgiLight}
            strokeWidth={30}
          />
        ))}
      </g>
      {[
        [GOLGI.x + 210, GOLGI.y + 30, 20],
        [GOLGI.x + 250, GOLGI.y + 110, 26],
        [GOLGI.x - 220, GOLGI.y + 150, 18],
      ].map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y} r={r} fill={cell.golgiLight} />
      ))}

      {/* As mitocôndrias: cápsulas com as cristas em zigue-zague. */}
      {MITOCHONDRIA.map(([x, y, tilt, size]) => (
        <g
          key={`${x}-${y}`}
          transform={`translate(${x} ${y}) rotate(${tilt}) scale(${size})`}
        >
          <rect
            x={-130}
            y={-62}
            width={260}
            height={124}
            rx={62}
            fill={cell.mito}
          />
          <path
            d="M-90,0 l22,-30 l22,60 l22,-60 l22,60 l22,-60 l22,60 l22,-60 l22,30"
            fill="none"
            stroke={cell.mitoLight}
            strokeWidth={13}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* As vesículas, cada uma com o seu brilho. */}
      {Array.from({ length: VESICLES }, (_, index) => {
        const x =
          120 +
          pick("vesicle-x", index) * 1680 +
          26 * Math.sin(seconds * 1.1 + index * 1.7);
        const y =
          80 +
          pick("vesicle-y", index) * 920 +
          20 * Math.cos(seconds * 0.9 + index * 2.3);
        const r = 18 + pick("vesicle-r", index) * 28;
        return (
          <g key={index}>
            <circle cx={x} cy={y} r={r} fill={cell.vesicle} />
            <circle
              cx={x - r * 0.3}
              cy={y - r * 0.3}
              r={r * 0.32}
              fill={cell.vesicleLight}
            />
          </g>
        );
      })}
      {/* Os lisossomos: bolsas amarelas com o que estão digerindo. */}
      {[
        [860, 870],
        [1650, 380],
        [1120, 470],
        [200, 620],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={46} fill={cell.lysosome} />
          <circle cx={x - 14} cy={y - 8} r={9} fill={cell.lysosomeDot} />
          <circle cx={x + 12} cy={y - 14} r={7} fill={cell.lysosomeDot} />
          <circle cx={x + 6} cy={y + 14} r={10} fill={cell.lysosomeDot} />
        </g>
      ))}
      {/* Os ribossomos: o pontilhado do citoplasma. */}
      {Array.from({ length: RIBOSOMES }, (_, index) => (
        <circle
          key={index}
          cx={pick("ribosome-x", index) * 1920}
          cy={pick("ribosome-y", index) * 1080}
          r={3 + pick("ribosome-r", index) * 4}
          fill={cell.dot}
          opacity={0.75}
        />
      ))}

      {/* A membrana, com as proteínas atravessadas nela. */}
      <circle
        cx={BODY.x}
        cy={BODY.y}
        r={BODY.r}
        fill="none"
        stroke={cell.membrane}
        strokeWidth={52}
      />
      <circle
        cx={BODY.x}
        cy={BODY.y}
        r={BODY.r - 14}
        fill="none"
        stroke={cell.membraneLight}
        strokeWidth={10}
      />
      {Array.from({ length: PROTEINS }, (_, index) => {
        const angle = (index / PROTEINS) * 360;
        return (
          <rect
            key={index}
            x={-13}
            y={-BODY.r - 44}
            width={26}
            height={88}
            rx={13}
            transform={`translate(${BODY.x} ${BODY.y}) rotate(${angle})`}
            fill={cell.protein}
          />
        );
      })}

      {/* Bem perto da câmera, fora de foco: o vulto de duas organelas. */}
      <path
        d={blob(60, 1010, 330, 230, "near-a")}
        fill={cell.near}
        opacity={0.6}
      />
      <path
        d={blob(1860, 90, 300, 200, "near-b")}
        fill={cell.near}
        opacity={0.6}
      />
    </SvgLayer>
  </AbsoluteFill>
);
