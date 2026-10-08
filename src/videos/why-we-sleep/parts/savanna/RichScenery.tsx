import { useId, type ReactNode } from "react";
import { wave } from "../../../../components/Idle";
import { ramp } from "../../../../components/timing";
import {
  GrassTuft,
  useStudyTime,
} from "../../../../studies/savanna-reference/SavannaReference";
import { useRichPalette, useRichTheme } from "./RichTheme";
import { useBuild, useCameraState } from "../../../../components/Camera";
import { savannaNightSky } from "../../palette";

export const RichLayer = ({
  depth,
  children,
}: {
  readonly depth: number;
  readonly children: ReactNode;
}) => {
  const seconds = useStudyTime();
  const { cameraDriven } = useRichTheme();
  const camera = useCameraState();
  const { risen } = useBuild();
  if (cameraDriven) {
    // A mesma transformação de Layer, em unidades do SVG. Assim as deixas e
    // os enquadramentos do roteiro continuam mandando nas duas pinturas.
    const zoom = 1 + (camera.zoom - 1) * depth;
    const units = 1672 / 1920;
    const sink = depth === 0 ? 0 : (1 - risen) * (1000 + 300 * depth) * zoom;
    return (
      <g
        transform={`translate(${-camera.x * depth * units} ${(sink - camera.y * depth) * units}) translate(836 470.25) scale(${zoom}) translate(-836 -470.25)`}
      >
        {children}
      </g>
    );
  }
  const zoom = 1 + 0.065 * depth * ramp(seconds, 0, 8);
  return (
    <g transform={`translate(1180 730) scale(${zoom}) translate(-1180 -730)`}>
      {children}
    </g>
  );
};

type Lobe = readonly [x: number, radius: number, height?: number];
// As nuvens são recortes de lobos de raios diferentes. A base é comum, mas
// cada banco possui sua silhueta e suas massas claras e escuras próprias.
export const CloudBank = ({
  name,
  x,
  y,
  width,
  lobes,
  color,
  speed = 1,
  opacity = 1,
}: {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly lobes: readonly Lobe[];
  readonly color: string;
  readonly speed?: number;
  readonly opacity?: number;
}) => {
  const id = useId();
  const seconds = useStudyTime();
  const { moonlight } = useRichTheme();
  return (
    <g
      id={name}
      transform={`translate(${x + seconds * speed} ${y})`}
      opacity={opacity}
    >
      <defs>
        <clipPath id={id}>
          <rect x="-100" y="-300" width={width + 200} height="300" />
        </clipPath>
      </defs>
      <g fill={color} clipPath={`url(#${id})`}>
        <path
          d={`M0 0 Q${width * 0.03} -8 ${width * 0.1} -4 L${width * 0.85} -6 Q${width * 0.98} -5 ${width} 0 Z`}
        />
        {lobes.map(([cx, radius, height = radius], i) => (
          <g key={i}>
            <ellipse
              cx={cx}
              cy={-height * 0.38}
              rx={radius}
              ry={height * 0.72}
            />
            {moonlight > 0 &&
              radius > 25 &&
              (name.includes("lit-cloud") || name === "upper-left-cloud") && (
                <path
                  d={`M${cx - radius} ${-height * 0.38} A${radius} ${height * 0.72} 0 0 1 ${cx} ${-height * 1.1}`}
                  fill="none"
                  stroke={savannaNightSky.cloudEdge}
                  strokeWidth="1.7"
                  opacity={0.7 * moonlight}
                />
              )}
          </g>
        ))}
      </g>
    </g>
  );
};

// As copas são massas de folhas sobrepostas, com uma borda dourada apenas
// nas curvas expostas à luz que vem da esquerda.
export const RichAcacia = ({
  name,
  x,
  y,
  scale = 1,
  distant = false,
  color,
}: {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly distant?: boolean;
  readonly color?: string;
}) => {
  const p = useRichPalette();
  const seconds = useStudyTime();
  const sway = 0.24 * (wave(seconds, 6.1, x / 1700) - wave(0, 6.1, x / 1700));
  const canopy =
    "M-240 -171 C-241 -178 -221 -186 -200 -190 C-186 -196 -171 -201 -146 -204 C-130 -217 -110 -218 -88 -220 C-55 -242 -24 -246 9 -247 C50 -250 88 -240 121 -225 C136 -219 142 -216 140 -211 C171 -211 186 -205 195 -201 C214 -196 228 -186 233 -180 C239 -172 208 -170 185 -169 C165 -162 143 -168 122 -165 C95 -158 74 -164 50 -163 C29 -159 8 -161 -17 -161 C-46 -156 -64 -158 -89 -161 C-116 -156 -142 -159 -163 -163 C-193 -160 -217 -164 -235 -167 Z";
  return (
    <g
      id={name}
      transform={`translate(${x} ${y}) scale(${scale}) skewX(${sway})`}
    >
      <g fill={distant ? (color ?? p.distantTree) : p.trunk}>
        <path d="M-17 0 C-15 -32 -12 -65 -10 -93 C-11 -109 -17 -120 -28 -131 L-48 -147 L-93 -165 L-87 -168 L-43 -153 L-66 -173 L-53 -174 L-20 -145 L-46 -182 L-32 -184 L-6 -143 L-10 -177 L0 -177 L10 -146 L31 -180 L44 -180 L22 -142 L60 -159 L105 -172 L112 -169 L65 -150 L40 -133 C26 -123 18 -111 17 -96 C15 -67 19 -29 20 0 Z" />
        <path
          d={canopy}
          fill={distant ? (color ?? p.distantTree) : "url(#rich-canopy)"}
        />
      </g>
      {distant ? null : (
        <>
          <path
            d="M-238 -171 C-218 -185 -183 -195 -151 -196 C-159 -191 -176 -188 -185 -182 C-152 -180 -132 -173 -101 -179 C-86 -182 -85 -186 -73 -187 C-96 -192 -114 -194 -135 -194 C-106 -209 -70 -214 -47 -208 C-74 -203 -83 -197 -92 -195 C-71 -193 -50 -190 -28 -181 C-61 -181 -81 -171 -110 -168 C-139 -169 -157 -165 -180 -166 C-207 -166 -218 -168 -238 -171 Z"
            fill={p.canopy.deep}
          />
          <path
            d="M-91 -218 C-63 -233 -36 -239 -9 -239 C21 -245 62 -238 90 -227 C79 -229 59 -227 48 -224 C18 -219 12 -213 0 -209 C-10 -206 -20 -204 -12 -200 C21 -198 43 -190 38 -188 C-18 -192 -48 -181 -76 -184 C-86 -190 -104 -193 -126 -195 C-111 -207 -109 -211 -91 -218 Z"
            fill={p.canopy.mid}
          />
          <path
            d="M45 -185 C62 -204 102 -213 130 -208 C154 -208 176 -204 191 -198 C166 -196 148 -196 139 -188 C151 -185 176 -185 186 -175 C164 -169 144 -171 127 -169 C99 -168 79 -174 45 -173 Z"
            fill={p.canopy.deep}
          />
          <path
            d="M-239 -174 C-215 -189 -183 -197 -151 -201 C-141 -208 -119 -215 -94 -217 C-71 -236 -31 -247 8 -247 C49 -251 91 -239 120 -225"
            fill="none"
            stroke={p.canopy.edge}
            strokeWidth="3.1"
            strokeLinecap="round"
          />
          <path
            d="M-149 -201 Q-127 -207 -99 -204 M-94 -217 Q-73 -219 -50 -214 M-23 -243 L-33 -237 M-15 -245 L-21 -241 M-190 -190 L-196 -183"
            fill="none"
            stroke={p.canopy.edge}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M-11 -88 C-16 -109 -28 -123 -47 -136 L-79 -150 C-63 -146 -54 -140 -45 -133 C-28 -118 -21 -107 -17 -85 Z"
            fill={p.canopy.mid}
            opacity="0.65"
          />
        </>
      )}
    </g>
  );
};

export const Bush = ({
  name,
  x,
  y,
  scale = 1,
  shade = false,
}: {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly shade?: boolean;
}) => {
  const p = useRichPalette();
  const t = useStudyTime();
  const sway = 0.65 * (wave(t, 4.9, x / 700) - wave(0, 4.9, x / 700));
  return (
    <g
      id={name}
      transform={`translate(${x} ${y}) scale(${scale}) skewX(${sway})`}
    >
      <path
        d="M-47 0 C-68 -8 -66 -27 -49 -26 C-39 -30 -25 -19 -16 -6 C-44 -39 -41 -60 -23 -57 C-6 -62 0 -31 1 -10 C3 -51 20 -69 34 -59 C48 -55 36 -25 21 -7 C40 -24 54 -24 58 -10 C59 -4 55 -1 48 0 Z"
        fill={shade ? p.bush.dark : p.bush.rose}
      />
      <path
        d="M-39 0 C-43 -21 -33 -26 -25 -21 C-15 -14 -12 -8 -9 -3 C-19 -28 -10 -40 -1 -38 C8 -36 9 -17 7 -4 C15 -26 29 -32 35 -23 C42 -14 28 -2 24 0 Z"
        fill={shade ? p.bush.mid : p.bush.coral}
      />
      <path
        d="M-10 0 C-29 -8 -32 -16 -22 -19 C-10 -22 -3 -10 0 -3 C5 -22 17 -30 23 -22 C29 -13 16 -3 13 0 Z"
        fill={shade ? p.bush.dark : p.bush.purple}
      />
    </g>
  );
};

export const useRichGrassColors = () => {
  const p = useRichPalette();
  return {
    dark: p.grass.dark,
    shade: p.grass.shade,
    mid: p.grass.mid,
    gold: "url(#rich-grass-gold)",
    orange: "url(#rich-grass-orange)",
  };
};

export const SmallTuft = ({
  name,
  x,
  y,
  scale = 1,
  warm = false,
}: {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly warm?: boolean;
}) => {
  const grassColors = useRichGrassColors();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <GrassTuft
        parallelEdges
        name={name}
        colors={grassColors}
        blades={[
          [-16, 0, -29, 29, 9, warm ? "orange" : "mid"],
          [-7, 0, -11, 44, 10, warm ? "gold" : "dark", -3],
          [1, 0, 3, 35, 8, "mid", -3],
          [8, 0, 22, 47, 11, warm ? "orange" : "dark", -2],
          [16, 0, 32, 27, 10, warm ? "gold" : "shade", -3],
          [0, 0, 11, 24, 10, "mid", -3],
        ]}
      />
    </g>
  );
};

export const TallGrass = () => {
  const grassColors = useRichGrassColors();
  return (
    <GrassTuft
      parallelEdges
      name="rich-tall-grass"
      colors={grassColors}
      blades={[
        [1301, 814, 1271, 167, 17, "gold", -2],
        [1321, 814, 1330, 168, 17, "orange", 4],
        [1331, 814, 1332, 122, 19, "dark", -4],
        [1349, 814, 1330, 188, 15, "gold", 6],
        [1357, 814, 1369, 152, 19, "mid", -4],
        [1374, 814, 1395, 155, 22, "gold", -5],
        [1383, 814, 1377, 106, 19, "shade", -2],
        [1405, 814, 1463, 191, 21, "shade", -8],
        [1418, 814, 1454, 151, 17, "orange", -8],
        [1432, 814, 1425, 126, 18, "mid", 1],
        [1450, 814, 1493, 197, 19, "gold", -6],
        [1459, 814, 1466, 123, 17, "dark", -4],
        [1479, 814, 1492, 168, 21, "mid", -5],
        [1492, 814, 1549, 216, 21, "shade", -7],
        [1504, 814, 1534, 139, 20, "gold", -6],
        [1521, 814, 1572, 153, 21, "orange", -5],
        [1536, 814, 1550, 112, 20, "dark", -5],
        [1551, 814, 1605, 165, 23, "shade", -8],
        [1570, 814, 1602, 114, 20, "gold", -7],
        [1586, 814, 1635, 165, 24, "dark", -6],
        [1598, 814, 1647, 142, 18, "mid", -7],
        [1510, 814, 1478, 94, 17, "orange", 3],
        [1388, 814, 1408, 74, 15, "gold", -4],
        [1287, 814, 1303, 66, 19, "mid", -5],
      ]}
    />
  );
};
