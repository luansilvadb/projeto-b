import { useId } from "react";
import { sea } from "../palette";

/**
 * O mapa-múndi esquemático: continentes em manchas simples, sem litoral de
 * detalhe, porque os mapas do estudo não foram lidos. Ele só afirma o que o
 * texto do estudo sustenta: dois oceanos, um em cada polo; uma faixa de terra
 * contínua em volta do equador, feita dos continentes e do fundo do mar que
 * secou entre eles; e duas planícies do norte (Canadá e Sibéria) submersas.
 * Nenhuma mancha passa da margem sul, para o desenho não afogar lugar nenhum
 * que a fonte não cita.
 *
 * O desenho é feito num campo de 1600×900 (16:9) e esticado até a caixa pedida.
 */
const FIELD = { width: 1600, height: 900 } as const;
const EQUATOR = FIELD.height / 2;

/** A margem do oceano do norte e a do sul, no campo: onduladas, sem ser litoral de lugar nenhum. */
const northShore = (x: number) => 238 + 10 * Math.sin(x / 150) + 6 * Math.sin(x / 61 + 1);
const southShore = (x: number) => 694 + 10 * Math.sin(x / 170 + 2) + 6 * Math.sin(x / 67);

/** Uma margem como caminho, da esquerda para a direita (ou de volta), a `t` do caminho entre o equador e o lugar final. */
const shore = (edge: (x: number) => number, t: number, back = false): string => {
  const points = Array.from({ length: 41 }, (_, index) => {
    const x = (index * FIELD.width) / 40;
    return `${x.toFixed(0)},${(EQUATOR + (edge(x) - EQUATOR) * t).toFixed(1)}`;
  });
  return (back ? points.reverse() : points).join(" L");
};

// As manchas de hoje. As duas do norte têm uma corcova que passa da margem do
// oceano novo: são as planícies que afundam.
const CONTINENTS = [
  "M 330 300 C 320 200 400 110 500 105 C 590 100 640 170 620 250 C 610 310 560 330 540 380 C 520 430 470 450 440 420 C 410 390 340 380 330 300 Z",
  "M 520 470 C 570 450 640 480 640 540 C 640 600 600 660 560 665 C 520 668 500 600 495 550 C 492 510 495 485 520 470 Z",
  "M 800 380 C 860 360 950 380 960 450 C 968 520 920 600 880 640 C 850 660 820 610 810 550 C 800 500 760 470 770 420 C 775 395 785 385 800 380 Z",
  "M 820 300 C 850 250 950 290 1000 215 C 1035 150 1075 105 1125 105 C 1195 105 1235 165 1272 228 C 1330 262 1400 305 1380 360 C 1360 410 1290 400 1240 420 C 1180 440 1120 400 1060 390 C 980 380 930 350 880 345 C 840 340 810 330 820 300 Z",
  "M 1270 570 C 1300 540 1380 545 1400 585 C 1415 620 1380 650 1330 648 C 1290 646 1250 610 1270 570 Z",
] as const;

/**
 * Até este tanto de `flood` a água do norte só enche o oceano em volta das
 * planícies, que continuam secas; daqui até 1 ela avança sobre elas, da ponta
 * até a margem. É onde `two-oceans` deixa o mapa e onde `new-map` o recebe.
 */
export const PLAINS_DRY = 0.55;
// A ponta das planícies e o ponto mais ao sul da margem do norte, no campo.
const PLAINS = { tip: 92, shore: 258 } as const;

/** Onde ficam as coisas no mapa, em fração da caixa (0 a 1), para as cenas prenderem etiqueta e câmera. */
export const MAP_SPOTS = {
  canada: [0.31, 0.17],
  siberia: [0.7, 0.17],
  equator: 0.5,
  northShore: 238 / FIELD.height,
  southShore: 694 / FIELD.height,
} as const;

type MapWorldProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Quanto da água já migrou do equador para os polos, de 0 (o mapa de hoje) a 1. */
  readonly moved?: number;
  /** Quanto a água do norte já subiu, de 0 a 1: as planícies afundam de `PLAINS_DRY` em diante. */
  readonly flood?: number;
  /** As margens em tracejado, de 0 a 1: o mapa é provisório. */
  readonly dashed?: number;
  /** Quanto o tracejado já correu pelas margens, em unidades do campo. */
  readonly march?: number;
  /** O canto arredondado da caixa, em pixels. */
  readonly radius?: number;
};

export const MapWorld: React.FC<MapWorldProps> = ({
  x,
  y,
  width,
  height,
  moved = 0,
  flood = moved,
  dashed = 0,
  march = 0,
  radius = 0,
}) => {
  const id = useId();
  const north = `M0,0 L${FIELD.width},0 L${shore(northShore, 1, true)} Z`;
  const south = `M0,${FIELD.height} L${FIELD.width},${FIELD.height} L${shore(southShore, 1, true)} Z`;
  // A frente da água que avança sobre as planícies, do norte para o sul: ondulada, como as margens.
  const reached =
    PLAINS.tip + (PLAINS.shore - PLAINS.tip) * Math.min(1, Math.max(0, (flood - PLAINS_DRY) / (1 - PLAINS_DRY)));
  const front = shore((at) => reached + 7 * Math.sin(at / 47), 1, true);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`${id}-box`}>
          <rect width={width} height={height} rx={radius} />
        </clipPath>
        <clipPath id={`${id}-land`}>
          {/* As manchas e a sombra de cada uma. */}
          {CONTINENTS.flatMap((d) => [
            <path key={d} d={d} />,
            <path key={`${d}-shade`} d={d} transform="translate(9 11)" />,
          ])}
        </clipPath>
        {/* O norte já coberto pela água, e o resto do mapa. */}
        <clipPath id={`${id}-under`}>
          <path d={`M0,0 L${FIELD.width},0 L${front} Z`} />
        </clipPath>
        <clipPath id={`${id}-above`}>
          <path d={`M0,${FIELD.height} L${FIELD.width},${FIELD.height} L${front} Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-box)`}>
        <g transform={`scale(${width / FIELD.width} ${height / FIELD.height})`}>
          <rect width={FIELD.width} height={FIELD.height} fill={sea.water[0]} />
          {/* O fundo do mar que seca: abre do equador para os dois lados. */}
          {moved > 0 ? (
            <path
              d={`M${shore(northShore, moved)} L${shore(southShore, moved, true)} Z`}
              fill={sea.dry}
            />
          ) : null}
          {/* A grade do mapa: é o que faz as manchas lerem como mapa-múndi. */}
          <g stroke={sea.paper} strokeWidth={5} opacity={0.28}>
            {[150, 300, 450, 600, 750].map((at) => (
              <line key={`lat-${at}`} x1={0} y1={at} x2={FIELD.width} y2={at} />
            ))}
            {[200, 400, 600, 800, 1000, 1200, 1400].map((at) => (
              <line key={`lon-${at}`} x1={at} y1={0} x2={at} y2={FIELD.height} />
            ))}
          </g>
          {/* Onde a água ainda não chegou, o oceano do norte enche e escurece por baixo das planícies, que ficam secas. */}
          <path d={north} fill={sea.water[0]} opacity={0.74 * Math.min(1, flood / PLAINS_DRY)} />
          <path d={north} fill={sea.deep} opacity={0.6 * moved} clipPath={`url(#${id}-above)`} />
          {/* Cada mancha com a sombra dela por baixo, deslocada: o relevo de um mapa de papel. */}
          {[sea.landShade, sea.land].map((fill, layer) => (
            <g key={fill} fill={fill} transform={layer === 0 ? "translate(9 11)" : undefined}>
              {CONTINENTS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          ))}
          {/* A água que sobe para o norte cobre as corcovas, que ficam à vista por baixo dela. */}
          <g clipPath={`url(#${id}-under)`}>
            <path d={north} fill={sea.water[0]} opacity={0.74} clipPath={`url(#${id}-land)`} />
            <path d={north} fill={sea.deep} opacity={0.6 * moved} />
          </g>
          {/* A beira da água sobre a terra: uma linha clara, que anda com ela. */}
          {flood > PLAINS_DRY && flood < 1 ? (
            <path
              d={`M${front}`}
              fill="none"
              stroke={sea.paper}
              strokeWidth={7}
              opacity={0.7}
              clipPath={`url(#${id}-land)`}
            />
          ) : null}
          {/* Os dois oceanos escurecem conforme a água se junta neles. */}
          <path d={south} fill={sea.deep} opacity={0.6 * moved} />
          {dashed > 0 ? (
            <g
              fill="none"
              stroke={sea.stamp}
              strokeWidth={9}
              strokeDasharray="30 24"
              strokeLinecap="round"
              strokeDashoffset={-march}
              opacity={dashed}
            >
              <path d={`M${shore(northShore, 1)}`} />
              <path d={`M${shore(southShore, 1)}`} />
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};
