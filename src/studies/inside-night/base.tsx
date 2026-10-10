// A paleta, a geometria do lugar e as peças de desenho que o cenário e o elenco dividem.

import { useId } from "react";
import type { Point } from "../../art/shapes";
import type { CameraState } from "../../components/Camera";
import { HEIGHT, WIDTH } from "../../format";
import { LID } from "./timing";

// ---- A paleta: o modo "por dentro" ----
// O escuro é índigo e roxo, nunca preto; a distância clareia para a névoa; a
// luz fria vem da janela e a quente, do reservatório.

export const C = {
  /** A abóbada, do arco mais perto (escuro) ao fim do salão (névoa). */
  wall: ["#0d0640", "#120949", "#180d59", "#1f126b", "#27187f", "#301f94", "#3a27a8", "#4430ba"],
  /** A face de cada arco que olha para o meio do salão. */
  rib: ["#1a1064", "#211574", "#291b86", "#33229a", "#3d2aae", "#4833c0", "#523cd0"],
  fog: "#5644d6",
  mist: "#7462ea",
  /** A floresta de neurônios: a silhueta e o núcleo apagado de cada distância, de longe para perto. */
  grove: ["#3a28ac", "#22147a", "#170c58"],
  nucleus: ["#4a38c0", "#2f1f9a", "#231679"],
  /** A borda de luz dos bosques: a da lua e a do âmbar, no bosque de trás e no da frente. */
  groveCold: ["#2c41ae", "#3d5ccf"],
  groveWarm: ["#7a3398", "#c24e88"],
  /** A moldura de primeiro plano e os cantos do quadro. */
  near: "#090430",
  /** A noite lá fora. */
  sky: ["#071044", "#12277f", "#2358c2", "#4a9ae6"],
  hill: ["#1d43aa", "#0c1c64"],
  moon: "#f4fbff",
  crater: "#d3e8f8",
  /** A luz fria da janela. */
  ice: "#d6f3ff",
  cold: "#8fd4ff",
  coldDeep: "#2f55c4",
  frame: ["#2b1c8a", "#160b56"],
  /** Os nós que acendem. */
  cyan: "#3cf0ff",
  magenta: "#ff4fd6",
  /** O âmbar apagado que os nós tomam quando a onda passa: o salão dormindo. */
  doze: "#e0902e",
  /** O reservatório e a luz quente. */
  core: "#fffdf0",
  cream: "#fff3b0",
  gold: "#ffd95a",
  amber: "#ffae2e",
  ember: "#ff8420",
  rose: "#f0507a",
  plum: "#a02fc0",
  glass: "#9c8cff",
  glassDark: "#1b0f5c",
  tick: "#b8600e",
  /** O que foi construído ali dentro: passarela, anel, alavanca, conduto. */
  deck: ["#241678", "#2c1c8c", "#4a2a9a", "#7a3a9c"],
  deckSide: "#110945",
  iron: "#1b1060",
  ironLight: "#2f2190",
  shadow: "#0c0538",
  /** O tom que o salão toma quando adormece: multiplica o quadro, e por isso é claro. */
  hush: "#ad9cc8",
  /** O elenco, repintado para este modo. */
  /**
   * A Vigília: as cores que o desenho dela recebe (`src/art/Vigilia.tsx`). Verde-água, mãos creme,
   * pernas azul-marinho; os cascos são claros para se recortarem do chão escuro do fim.
   */
  vigilia: {
    body: "#1bcfbf",
    /** A barriga do ovo, embaixo. */
    shade: "#0f97a0",
    limb: "#0e9692",
    limbFar: "#0a6f7c",
    leg: "#2a1f5c",
    legFar: "#211850",
    lid: "#0e9692",
    line: "#073c54",
    /** A borda de luz da janela, nas costas, e a do reservatório, no rosto. */
    cold: "#bafff3",
    warm: "#ffe3a0",
    hand: "#fff4dc",
    hoof: "#fff4dc",
    hoofFar: "#f0dcb4",
    ink: "#1c1238",
    eye: "#fffdf4",
  },
  contador: {
    body: "#9440b4",
    lit: "#d274cf",
    shade: "#4c2180",
    limb: "#5a2880",
    line: "#2b1244",
    warm: "#ffd98a",
  },
  horn: "#fff4dc",
  hornCold: "#e6f8ff",
  navy: "#2a1f5c",
  ink: "#1c1238",
  eye: "#fffdf4",
  cap: "#f2b632",
  capLight: "#ffe08a",
  capShade: "#b9741f",
  bow: "#ff5a5f",
  page: "#fff1d6",
  pageLit: "#fffbe6",
  cover: "#c2255c",
} as const;

// ---- A geometria do quadro ----

/** O ponto de fuga do salão: os arcos da abóbada e a floresta ao longe convergem para cá. */
export const VANISH: Point = [1200, 440];
/**
 * A nave: os arcos, do mais perto ao mais longe, pela meia largura de cada um
 * em volta do ponto de fuga; quanto o arco é pontudo; e quanto a linha em que
 * ele nasce sobe para a câmera.
 */
export const NAVE = { arches: [1100, 640, 450, 345, 280, 235, 200], pitch: 1.45, rise: 0.25, rib: 0.06 } as const;
/** A janela do olho: uma abertura redonda vista de lado, no primeiro vão da parede. */
export const WINDOW = { cx: 365, cy: 250, rx: 205, ry: 270, tilt: 10 };
/** Um ponto da janela, medido do meio dela e já inclinado como ela, no desenho. */
export const onWindow = (x: number, y: number): Point => {
  const turn = (WINDOW.tilt * Math.PI) / 180;
  return [
    WINDOW.cx + x * Math.cos(turn) - y * Math.sin(turn),
    WINDOW.cy + x * Math.sin(turn) + y * Math.cos(turn),
  ];
};
/** A roldana por onde o cabo da pálpebra passa, no alto da moldura. */
export const PULLEY = { at: [0, -(WINDOW.ry + 36)] as Point, radius: 19 };
/** O reservatório: o eixo, as alturas da boca, do ombro, do bojo, do fundo e do nível, e as meias larguras. */
export const VESSEL = {
  x: 1385,
  lip: 200,
  shoulder: 296,
  widest: 606,
  foot: 900,
  half: 258,
  neck: 58,
  /** O bico de onde a gota cai. */
  nozzle: 148,
};
/** A plataforma em anel que segura o reservatório, vista um pouco de cima. */
export const RING = { cx: 1385, cy: 808, outer: [350, 100], inner: [214, 59], thick: 22 } as const;
/**
 * A passarela cruza o salão de uma borda à outra do quadro, passando por
 * baixo do anel. Ela foge para a direita e para o fundo: as duas bordas
 * convergem.
 */
export const DECK = {
  left: -120,
  right: 2060,
  far: (x: number) => 768 + 0.0412 * (1045 - x),
  near: (x: number) => 842 + 0.0505 * (1045 - x),
  thick: 20,
};
/** Onde cada um pisa. */
export const SPOT = { vigilia: [756, 815] as Point, contador: [1060, 814] as Point };
/** O chão onde ela pisa, em cada x: a passarela sobe um nada para a esquerda. */
export const floorAt = (x: number) => SPOT.vigilia[1] + 0.046 * (SPOT.vigilia[0] - x);

/** A alavanca: o cubo em que ela gira e o comprimento da haste. */
export const LEVER = { hub: [896, 786] as Point, length: 242.4 };
/**
 * Um ponto da alavanca, com ela a `angle` graus da vertical: `s` vai de 0 (o
 * cubo) a 1 (a ponta), e `side` desloca para o lado, positivo para o do
 * reservatório.
 */
export const onLever = (angle: number, s: number, side = 0): Point => {
  const turn = (angle * Math.PI) / 180;
  return [
    LEVER.hub[0] + s * LEVER.length * Math.sin(turn) + side * Math.cos(turn),
    LEVER.hub[1] - s * LEVER.length * Math.cos(turn) + side * Math.sin(turn),
  ];
};

/**
 * O conduto da pressão: sai do pé do reservatório, desce para o anel, corre
 * por cima dele na frente dos pés do Contador e entra na base da alavanca.
 */
export const CONDUIT: readonly Point[] = [
  [1177, 799],
  [1161, 833],
  [1052, 836],
  [1022, 829],
  [960, 815],
];

/**
 * A conta, onde se lê de longe: sete lâmpadas na borda de cá do anel, da
 * esquerda para a direita. As cinco primeiras são um dia comum; as duas
 * depois da marca são o que passou dele.
 */
export const LAMPS = Array.from({ length: 7 }, (_, index) => {
  const angle = ((132 - index * 14) * Math.PI) / 180;
  return {
    at: [RING.cx + RING.outer[0] * Math.cos(angle), RING.cy + RING.outer[1] * Math.sin(angle) + RING.thick / 2] as Point,
    over: index >= 5,
  };
});
/** A marca do dia comum, entre a quinta e a sexta lâmpada. */
export const LIMIT: Point = (() => {
  const angle = (69 * Math.PI) / 180;
  return [RING.cx + RING.outer[0] * Math.cos(angle), RING.cy + RING.outer[1] * Math.sin(angle)];
})();

/** O feixe da janela: sai do meio da abertura e pousa na passarela, onde a Vigília está. */
export const BEAM = (() => {
  const from: Point = [WINDOW.cx + 12, WINDOW.cy + 16];
  const to: Point = [802, 812];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const dir: Point = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
  return {
    from,
    to,
    dir,
    normal: [-dir[1], dir[0]] as Point,
    length,
    /** A meia largura da abertura, vista de través pelo feixe, e quanto ele abre até pousar. */
    half: 250,
    spread: 1.4,
  };
})();
/**
 * Onde a sombra da pálpebra corta o feixe, de través: ela desce do alto da
 * janela, que é o lado de cima do feixe, e o estreita até apagar.
 */
export const beamCut = (h: number) =>
  BEAM.half * (2 * Math.min(1, Math.max(0, (h - LID.open) / (LID.shut - LID.open))) - 1);

/** A profundidade de cada camada: 0 é o infinito, e 1, o plano do assunto. */
export const DEPTH = { wall: 0.06, far: 0.16, grove: 0.34, deep: 0.5, subject: 1, motes: 1.25, frame: 1.7 } as const;

// ---- Peças de desenho ----

/** Onde um ponto do desenho vai parar na tela, na profundidade da camada dele: a mesma conta de `Layer`. */
export const project = (camera: CameraState, depth: number) => {
  const zoom = 1 + (camera.zoom - 1) * depth;
  return ([x, y]: Point): Point => [
    WIDTH / 2 + zoom * (x - WIDTH / 2) - camera.x * depth,
    HEIGHT / 2 + zoom * (y - HEIGHT / 2) - camera.y * depth,
  ];
};

export const circle = ([x, y]: Point, r: number) =>
  `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0Z`;
export const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;

/** Um caminho pelos pontos, com as quinas arredondadas: o cano. */
export const roundedPath = (points: readonly Point[], radius: number) => {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let index = 1; index < points.length - 1; index++) {
    const [px, py] = points[index - 1];
    const [x, y] = points[index];
    const [nx, ny] = points[index + 1];
    const before = Math.hypot(x - px, y - py);
    const after = Math.hypot(nx - x, ny - y);
    const r = Math.min(radius, before / 2, after / 2);
    d += `L${(x - ((x - px) / before) * r).toFixed(1)},${(y - ((y - py) / before) * r).toFixed(1)}`;
    d += `Q${x},${y} ${(x + ((nx - x) / after) * r).toFixed(1)},${(y + ((ny - y) / after) * r).toFixed(1)}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d}L${lx},${ly}`;
};

/** O ponto a uma fração do comprimento de um caminho de retas. */
export const alongPath = (points: readonly Point[], u: number): Point => {
  const lengths = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]));
  let left = Math.min(1, Math.max(0, u)) * lengths.reduce((sum, length) => sum + length, 0);
  for (let index = 0; index < lengths.length; index++) {
    if (left <= lengths[index]) {
      const f = left / lengths[index];
      return [
        points[index][0] + (points[index + 1][0] - points[index][0]) * f,
        points[index][1] + (points[index + 1][1] - points[index][1]) * f,
      ];
    }
    left -= lengths[index];
  }
  return points[points.length - 1];
};

const bezier = (a: number, b: number, c: number, d: number, s: number) =>
  (1 - s) ** 3 * a + 3 * (1 - s) ** 2 * s * b + 3 * (1 - s) * s ** 2 * c + s ** 3 * d;

/** A meia largura do reservatório numa altura: é o que diz a largura da face do líquido quando o nível sobe. */
export const vesselHalf = (y: number): number => {
  const { shoulder, widest, foot, half, neck } = VESSEL;
  if (y <= shoulder) {
    return neck;
  }
  // As mesmas curvas de `vesselPath`: a altura cresce com o parâmetro, então dá para achá-lo por bisseção.
  const upper = y <= widest;
  const heights = upper ? [shoulder, shoulder + 84, widest - 190, widest] : [widest, widest + 194, foot, foot];
  const widths = upper ? [neck, neck, half, half] : [half, half, 170, 0];
  let low = 0;
  let high = 1;
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2;
    if (bezier(heights[0], heights[1], heights[2], heights[3], middle) < Math.min(y, foot)) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return bezier(widths[0], widths[1], widths[2], widths[3], low);
};

type Stop = readonly [offset: number, color: string, opacity: number];
type GlowProps = {
  readonly at: Point;
  readonly rx: number;
  readonly ry?: number;
  readonly stops: readonly Stop[];
};

/** Luz em degradê radial: halo, névoa e poça de luz, sem desfoque. */
export const Glow: React.FC<GlowProps> = ({ at, rx, ry = rx, stops }) => {
  const id = useId();
  return (
    <>
      <defs>
        <radialGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          cx={at[0]}
          cy={at[1]}
          r={rx}
          gradientTransform={`translate(0 ${at[1]}) scale(1 ${ry / rx}) translate(0 ${-at[1]})`}
        >
          {stops.map(([offset, color, opacity], index) => (
            <stop key={index} offset={offset} stopColor={color} stopOpacity={opacity} />
          ))}
        </radialGradient>
      </defs>
      <ellipse cx={at[0]} cy={at[1]} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
};
