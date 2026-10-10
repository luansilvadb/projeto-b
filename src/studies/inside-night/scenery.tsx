// O lugar: a abóbada, a janela do olho com a pálpebra, a floresta de
// neurônios, a passarela, o reservatório e o que liga uma coisa à outra (o
// conduto da pressão, a alavanca, o cabo). Cada peça lê o instante em `useNow`.

import { createContext, useContext, useId } from "react";
import { interpolateColors, random } from "remotion";
import { taperPath, type Point } from "../../art/shapes";
import { useCameraState } from "../../components/Camera";
import { HEIGHT, WIDTH } from "../../format";
import {
  alongPath,
  BEAM,
  beamCut,
  C,
  circle,
  CONDUIT,
  DECK,
  DEPTH,
  floorAt,
  Glow,
  LAMPS,
  LEVER,
  LIMIT,
  NAVE,
  onLever,
  onWindow,
  oval,
  project,
  PULLEY,
  RING,
  roundedPath,
  SPOT,
  VANISH,
  VESSEL,
  vesselHalf,
  WINDOW,
} from "./base";
import {
  arrivalAt,
  clamp01,
  decay,
  dropsAt,
  E,
  FORCE,
  HIT,
  key,
  KICK,
  MARK,
  mix,
  pulsesAt,
  sinceHit,
  span,
  WAVE,
  wobble,
} from "./timing";

// ---- O instante ----

export type Now = {
  readonly t: number;
  /** A alavanca, em graus. */
  readonly lever: number;
  /** A barra da pálpebra da janela e quanto o cabo está frouxo. */
  readonly lid: number;
  readonly slack: number;
  /** Quanto da luz da janela ainda entra: 1 com ela aberta, 0 fechada. */
  readonly cold: number;
  readonly level: number;
  /** A pressão, de 0 a 1, e a respiração do salão depois que ele adormece, de -1 a 1. */
  readonly pressure: number;
  readonly doze: number;
  /** O salão adormecendo, de 0 a 1: a luz que transbordou baixa para a de quem dorme. */
  readonly calm: number;
  /** O clarão de cada gota no reservatório, morrendo logo depois. */
  readonly throb: number;
  /** A noite passando: de 0 a 1, o caminho da lua. */
  readonly night: number;
  /** Onde o meio da Vigília está, para a sombra dela, e quanto ela saiu do chão, em pixels. */
  readonly vigiliaX: number;
  readonly vigiliaLift?: number;
};

const NowContext = createContext<Now | null>(null);
export const NowProvider = NowContext.Provider;
export const useNow = (): Now => {
  const now = useContext(NowContext);
  if (!now) {
    throw new Error("O cenário precisa do instante.");
  }
  return now;
};

/** De onde a onda de luz sai: o meio do reservatório. */
const WAVE_FROM: Point = [VESSEL.x, 470];

/**
 * Há quantos segundos a onda passou por um ponto desta camada (negativo: ainda
 * não chegou). A conta é na tela, onde a onda é um círculo: assim os nós
 * trocam quando ela passa por cima deles, seja qual for a profundidade.
 */
const useWave = (depth: number) => {
  const camera = useCameraState();
  const { t } = useNow();
  const [cx, cy] = project(camera, DEPTH.subject)(WAVE_FROM);
  const here = project(camera, depth);
  return (point: Point) => {
    const [x, y] = here(point);
    return t - WAVE.at - Math.max(0, Math.hypot(x - cx, y - cy) - WAVE.head) / WAVE.speed;
  };
};

/** O clarão de quando a onda chega a um nó, e quanto ele já trocou de cor. */
const turnOf = (since: number) => ({
  flash: since < 0 ? 0 : since < 0.1 ? since / 0.1 : Math.max(0, 1 - (since - 0.1) / 0.55),
  turned: clamp01(since / 0.22),
});

// ---- O neurônio: a unidade que se repete na floresta ----

type Neuron = {
  readonly d: string;
  readonly soma: Point;
  /** O raio do núcleo, que é o que acende. */
  readonly core: number;
  readonly hue: string;
  readonly lit: boolean;
  readonly phase: number;
  readonly tips: readonly Point[];
};

/**
 * Um neurônio em pé, como árvore: o axônio é o tronco, o corpo celular fica no
 * alto e os dendritos, grossos na base e finos na ponta, abrem a copa. Tudo
 * sai da semente, para o desenho ser o mesmo em todo quadro.
 */
const neuron = (seed: string, soma: Point, size: number, root: number, lean = 0): Neuron => {
  const pick = (trait: string) => random(`${seed}-${trait}`);
  const body = size * (0.32 + 0.06 * pick("body"));
  const foot: Point = [soma[0] - lean * (root - soma[1]), root];
  const parts = [
    taperPath(
      foot,
      [(foot[0] + soma[0]) / 2 + (pick("bend") - 0.5) * size * 0.9, (foot[1] + soma[1]) / 2],
      soma,
      body * 0.95,
      body * 0.55,
    ),
    circle(soma, body),
  ];
  const tips: Point[] = [];
  const count = 3 + Math.floor(pick("count") * 3);
  const fan = ((150 + 50 * pick("fan")) * Math.PI) / 180;
  for (let index = 0; index < count; index++) {
    const side = index / (count - 1) - 0.5;
    const angle = -Math.PI / 2 + side * fan + (pick(`a${index}`) - 0.5) * 0.32;
    // Os dendritos de lado são mais curtos que os de cima.
    const length = size * (0.62 + 0.3 * pick(`l${index}`)) * (1 - 0.35 * Math.abs(side));
    const end: Point = [soma[0] + Math.cos(angle) * length, soma[1] + Math.sin(angle) * length];
    const sway = (pick(`c${index}`) - 0.5) * length * 0.4;
    const control: Point = [
      (soma[0] + end[0]) / 2 - Math.sin(angle) * sway,
      (soma[1] + end[1]) / 2 + Math.cos(angle) * sway,
    ];
    parts.push(taperPath(soma, control, end, body * 0.95, body * 0.36), circle(end, body * 0.18));
    // O dendrito se abre em dois, e cada ponta termina num botão.
    const heading = Math.atan2(end[1] - control[1], end[0] - control[0]);
    for (const turn of [-1, 1]) {
      const bearing = heading + turn * (0.42 + 0.3 * pick(`f${index}${turn}`));
      const reach = length * (0.5 + 0.3 * pick(`r${index}${turn}`));
      const tip: Point = [end[0] + Math.cos(bearing) * reach, end[1] + Math.sin(bearing) * reach];
      parts.push(
        taperPath(
          end,
          [
            (end[0] + tip[0]) / 2 + Math.cos(heading) * reach * 0.14,
            (end[1] + tip[1]) / 2 + Math.sin(heading) * reach * 0.14,
          ],
          tip,
          body * 0.36,
          body * 0.13,
        ),
        circle(tip, body * 0.14),
      );
      tips.push(tip);
    }
  }
  return {
    d: parts.join(""),
    soma,
    core: body * 0.42,
    hue: pick("hue") < 0.55 ? C.cyan : C.magenta,
    lit: pick("lit") < 0.45,
    phase: pick("phase") * 2 * Math.PI,
    tips,
  };
};

type NeuronArtProps = {
  readonly tree: Neuron;
  /** A distância: 0 é o fim do salão, 2 é o bosque mais perto. */
  readonly tone: 0 | 1 | 2;
  /** Há quanto tempo a onda passou por ele. */
  readonly since: number;
  /** A borda de luz da lua e a do âmbar: a mesma silhueta por baixo, deslocada para o lado da fonte. */
  readonly moonlit?: string;
  readonly warmlit?: string;
};

/**
 * A silhueta e o núcleo: aceso, ele é fonte de luz, com o centro quase branco
 * e o halo da cor. Acordado, cada nó pisca no próprio ritmo; quando a onda
 * passa, ele clareia e troca para o âmbar apagado, e daí em diante respira
 * junto com o reservatório.
 */
const NeuronArt: React.FC<NeuronArtProps> = ({ tree, tone, since, moonlit, warmlit }) => {
  const { t, cold, doze, pressure } = useNow();
  const { soma, core } = tree;
  const { flash, turned } = turnOf(since);
  const awake = 0.82 + 0.18 * Math.sin(t * (1.4 + 0.25 * tree.phase) + tree.phase);
  const power = (mix(awake, 0.56 + 0.16 * doze, turned) + 0.9 * flash) * (0.55 + 0.225 * tone);
  // A cor do nó vira a da onda no instante em que ela chega, e assenta no âmbar apagado.
  const hue = interpolateColors(span(since, 0, 0.07), [0, 1], [
    tree.hue,
    interpolateColors(flash, [0, 1], [C.doze, C.cream]),
  ]);
  const heart = interpolateColors(turned - flash, [0, 1], [C.moon, C.cream]);
  // A borda quente abre do lado do reservatório: larga perto da luz, sumindo do outro lado do tronco.
  const away: Point = [soma[0] + core * 9, soma[1] + core * 5];
  return (
    <>
      {moonlit ? <path d={tree.d} fill={moonlit} transform="translate(-3.5 -4)" opacity={cold} /> : null}
      {warmlit ? (
        <path
          d={tree.d}
          fill={warmlit}
          transform={`translate(${away[0]} ${away[1]}) scale(1.035) translate(${-away[0]} ${-away[1]})`}
          opacity={moonlit ? turned : 0.8 + 0.2 * pressure}
        />
      ) : null}
      <path d={tree.d} fill={C.grove[tone]} />
      {tree.lit ? (
        <>
          <Glow
            at={soma}
            rx={core * (4.4 + 2.4 * flash)}
            stops={[
              [0, hue, Math.min(1, 0.85 * power)],
              [0.3, hue, Math.min(1, 0.38 * power)],
              [1, hue, 0],
            ]}
          />
          <circle cx={soma[0]} cy={soma[1]} r={core} fill={hue} opacity={Math.min(1, 0.5 + 0.5 * power)} />
          <circle cx={soma[0]} cy={soma[1]} r={core * (0.56 - 0.12 * turned + 0.2 * flash)} fill={heart} />
          {/* A luz corre até os botões de alguns dendritos. */}
          {tree.tips
            .filter((_, index) => index % 3 === 0)
            .map((tip, index) => (
              <g key={index}>
                <Glow
                  at={tip}
                  rx={core * 1.1}
                  stops={[
                    [0, hue, Math.min(1, 0.9 * power)],
                    [1, hue, 0],
                  ]}
                />
                <circle cx={tip[0]} cy={tip[1]} r={core * 0.17} fill={heart} />
              </g>
            ))}
        </>
      ) : (
        <circle cx={soma[0]} cy={soma[1]} r={core} fill={C.nucleus[tone]} />
      )}
    </>
  );
};

// ---- O fundo: a abóbada e a janela do olho ----

/** Um arco pontudo da nave, com os pilares descendo até sumir embaixo do quadro. */
const archPath = (half: number) => {
  const spring = VANISH[1] - NAVE.rise * half;
  const radius = NAVE.pitch * half;
  const apex = spring - half * Math.sqrt(2 * NAVE.pitch - 1);
  return `M${VANISH[0] - half},${HEIGHT + 400}L${VANISH[0] - half},${spring}A${radius},${radius} 0 0 1 ${VANISH[0]},${apex}A${radius},${radius} 0 0 1 ${VANISH[0] + half},${spring}L${VANISH[0] + half},${HEIGHT + 400}Z`;
};

/** A abóbada: arcos aninhados que clareiam para o fim do salão, como degraus de névoa. */
export const Vault: React.FC = () => (
  <>
    <rect x={-800} y={-600} width={WIDTH + 1600} height={HEIGHT + 1200} fill={C.wall[0]} />
    {NAVE.arches.map((half, index) => (
      <g key={half}>
        <path d={archPath(half)} fill={C.rib[index]} />
        <path d={archPath(half * (1 - NAVE.rib))} fill={C.wall[index + 1]} />
      </g>
    ))}
    <Glow
      at={[VANISH[0], VANISH[1] + 20]}
      rx={420}
      ry={520}
      stops={[
        [0, C.fog, 0.95],
        [0.45, C.fog, 0.5],
        [1, C.fog, 0],
      ]}
    />
  </>
);

/** A barra da pálpebra numa altura: um meridiano da esfera, visto de frente. De canto a canto da janela. */
const lidArc = (h: number) =>
  Array.from({ length: 41 }, (_, index) => {
    const angle = (Math.PI * index) / 40;
    return `${(WINDOW.rx * Math.cos(angle)).toFixed(1)},${(h * WINDOW.ry * Math.sin(angle)).toFixed(1)}`;
  }).join("L");

/** O caminho da lua enquanto a noite passa: sobe da borda da janela até o lugar dela no quadro aprovado. */
const moonAt = (night: number): Point => {
  const from: Point = [-150, 12];
  const bend: Point = [-146, -66];
  const to: Point = [-66, -96];
  const left = 1 - night;
  return [
    WINDOW.cx + left * left * from[0] + 2 * left * night * bend[0] + night * night * to[0],
    WINDOW.cy + left * left * from[1] + 2 * left * night * bend[1] + night * night * to[1],
  ];
};
const MOON_REST = moonAt(1);

/**
 * A janela do olho: por ela se vê a noite lá fora, e é dela que vem a luz
 * fria. A pálpebra é uma persiana curva presa nos dois cantos, pendurada por
 * um cabo que passa na roldana do alto e vai até a ponta da alavanca: com a
 * alavanca para a frente ela fica recolhida, e desce quando a alavanca cede.
 */
export const EyeWindow: React.FC = () => {
  const id = useId();
  const { t, night, lid, cold } = useNow();
  const { cx, cy, rx, ry, tilt } = WINDOW;
  const turn = `rotate(${tilt} ${cx} ${cy})`;
  const moon = moonAt(night);
  // O céu inteiro gira com a lua, mais devagar.
  const drift: Point = [(moon[0] - MOON_REST[0]) * 0.55, (moon[1] - MOON_REST[1]) * 0.55];
  const [px, py] = PULLEY.at;
  // A roldana gira o quanto de cabo passou por ela.
  const spin = ((lid * ry) / PULLEY.radius) * (180 / Math.PI);
  return (
    <>
      <defs>
        <clipPath id={`${id}-near`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={turn} />
        </clipPath>
        {/* A boca de fora da abertura: o que sobra à direita é a espessura da parede. */}
        <clipPath id={`${id}-far`}>
          <ellipse cx={cx - 30} cy={cy - 8} rx={rx * 0.97} ry={ry * 0.97} transform={turn} />
        </clipPath>
        <clipPath id={`${id}-opening`}>
          <ellipse cx={0} cy={0} rx={rx} ry={ry} />
        </clipPath>
        <linearGradient id={`${id}-sky`} gradientUnits="userSpaceOnUse" x1={0} y1={cy - ry} x2={0} y2={cy + ry}>
          <stop offset="0" stopColor={C.sky[0]} />
          <stop offset="0.45" stopColor={C.sky[1]} />
          <stop offset="0.8" stopColor={C.sky[2]} />
          <stop offset="1" stopColor={C.sky[3]} />
        </linearGradient>
        <linearGradient
          id={`${id}-jamb`}
          gradientUnits="userSpaceOnUse"
          x1={cx - 120}
          y1={cy - 220}
          x2={cx + 190}
          y2={cy + 230}
        >
          <stop offset="0" stopColor={C.coldDeep} />
          <stop offset="0.65" stopColor={C.cold} />
          <stop offset="1" stopColor={C.ice} />
        </linearGradient>
        <linearGradient id={`${id}-lid`} gradientUnits="userSpaceOnUse" x1={0} y1={-ry} x2={0} y2={ry}>
          <stop offset="0" stopColor={C.frame[1]} />
          <stop offset="0.5" stopColor={C.frame[0]} />
          <stop offset="1" stopColor={C.frame[0]} />
        </linearGradient>
      </defs>
      {/* A parede em volta toma um pouco da luz de fora. */}
      <Glow
        at={[cx, cy]}
        rx={540}
        ry={620}
        stops={[
          [0.3, C.cold, 0.3 * cold],
          [1, C.cold, 0],
        ]}
      />
      <ellipse cx={cx} cy={cy} rx={rx + 40} ry={ry + 42} transform={turn} fill={C.frame[0]} />
      <ellipse cx={cx} cy={cy} rx={rx + 16} ry={ry + 17} transform={turn} fill={C.frame[1]} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={turn} fill={`url(#${id}-jamb)`} />
      <g clipPath={`url(#${id}-near)`}>
        <g clipPath={`url(#${id}-far)`}>
          <rect
            x={cx - rx - 100}
            y={cy - ry - 100}
            width={2 * rx + 200}
            height={2 * ry + 200}
            fill={`url(#${id}-sky)`}
          />
          {Array.from({ length: 30 }, (_, star) => {
            const pick = (trait: string) => random(`star-${trait}-${star}`);
            const x = cx - rx - 40 + pick("x") * (2 * rx + 60);
            const y = cy - ry + pick("y") * (2 * ry - 150);
            if (Math.hypot(x - MOON_REST[0], y - MOON_REST[1]) < 110) {
              return null;
            }
            return (
              <circle
                key={star}
                cx={x + drift[0]}
                cy={y + drift[1]}
                r={[1.6, 2.4, 3.4][Math.floor(pick("size") ** 2 * 3)]}
                fill={C.moon}
                opacity={0.5 + 0.4 * Math.sin(t * (1 + 2 * pick("speed")) + star)}
              />
            );
          })}
          <Glow
            at={moon}
            rx={200}
            stops={[
              [0, C.ice, 0.7],
              [0.4, C.cold, 0.28],
              [1, C.cold, 0],
            ]}
          />
          <circle cx={moon[0]} cy={moon[1]} r={56} fill={C.moon} />
          <circle cx={moon[0] - 16} cy={moon[1] - 12} r={11} fill={C.crater} />
          <circle cx={moon[0] + 20} cy={moon[1] + 14} r={7} fill={C.crater} />
          {/* O mundo lá fora: o morro ao longe e o chão perto do olho. */}
          <path
            d={`M${cx - 300},${cy + 300}L${cx - 300},${cy + 206}C${cx - 190},${cy + 170} ${cx - 120},${cy + 214} ${cx - 40},${cy + 196}C${cx + 40},${cy + 178} ${cx + 110},${cy + 212} ${cx + 300},${cy + 180}L${cx + 300},${cy + 300}Z`}
            fill={C.hill[0]}
          />
          <path
            d={`M${cx - 300},${cy + 300}L${cx - 300},${cy + 250}C${cx - 200},${cy + 226} ${cx - 150},${cy + 258} ${cx - 70},${cy + 244}C${cx + 10},${cy + 230} ${cx + 80},${cy + 262} ${cx + 300},${cy + 236}L${cx + 300},${cy + 300}Z`}
            fill={C.hill[1]}
          />
        </g>
      </g>
      {/* A pálpebra e a roldana, nas medidas da janela: do meio dela, já inclinadas. */}
      <g transform={`translate(${cx} ${cy}) rotate(${tilt})`}>
        <g clipPath={`url(#${id}-opening)`}>
          <path
            d={`M${-rx - 10},${-ry - 10}L${rx + 10},${-ry - 10}L${rx + 10},0L${lidArc(lid)}L${-rx - 10},0Z`}
            fill={`url(#${id}-lid)`}
          />
          {/* As ripas: a cada tanto acima da barra, e somem no alto, enroladas. */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slat) => {
            const h = lid - slat * 0.2;
            return h > -1 ? (
              <path key={slat} d={`M${lidArc(h)}`} fill="none" stroke={C.frame[1]} strokeWidth={3.5} />
            ) : null;
          })}
          {/* A barra: escura por dentro, com o fio de luar que passa por baixo dela. */}
          <path d={`M${lidArc(lid)}`} fill="none" stroke={C.near} strokeWidth={12} strokeLinejoin="round" />
          <path
            d={`M${lidArc(lid)}`}
            fill="none"
            stroke={C.ice}
            strokeWidth={3}
            transform="translate(0 6.5)"
            opacity={0.85 * cold}
          />
          {/* O cabo desce da roldana até o meio da barra. */}
          <path d={`M0,${py}L0,${lid * ry}`} stroke={C.near} strokeWidth={5} />
          <path d={`M-2,${py}L-2,${lid * ry}`} stroke={C.cold} strokeWidth={1.5} opacity={0.7} />
        </g>
        <circle cx={0} cy={lid * ry} r={7} fill={C.near} stroke={C.cold} strokeWidth={2.5} />
        <path
          d={`M${px - 30},${py + 30}L${px - 15},${py - 7}L${px + 15},${py - 7}L${px + 30},${py + 30}Z`}
          fill={C.near}
        />
        <circle cx={px} cy={py} r={PULLEY.radius} fill={C.frame[1]} stroke={C.ironLight} strokeWidth={5} />
        <g transform={`rotate(${spin} ${px} ${py})`} stroke={C.cold} strokeWidth={3} strokeLinecap="round" opacity={0.8}>
          {[0, 60, 120].map((spoke) => (
            <path
              key={spoke}
              d={`M${px - 12},${py}L${px + 12},${py}`}
              transform={`rotate(${spoke} ${px} ${py})`}
            />
          ))}
        </g>
        <circle cx={px} cy={py} r={5} fill={C.near} />
      </g>
    </>
  );
};

/**
 * O feixe frio: degraus aninhados, mais claros no meio, sumindo na névoa de
 * baixo. Ele atravessa o salão, da janela, lá no fundo, até a passarela: por
 * isso é desenhado na tela, com cada ponta levada pela câmera na profundidade
 * dela. Preso a uma camada só, a outra ponta escorregaria quando a câmera
 * andasse. Quando a pálpebra desce, a sombra dela corta o feixe pelo lado de
 * cima, e ele estreita até sumir.
 */
export const Beam: React.FC = () => {
  const id = useId();
  const { t, lid, cold } = useNow();
  const camera = useCameraState();
  const atWall = project(camera, DEPTH.wall);
  const from = atWall(BEAM.from);
  const to = project(camera, DEPTH.subject)(BEAM.to);
  // Quanto cada ponta cresce com a aproximação da câmera.
  const grown = [1 + (camera.zoom - 1) * DEPTH.wall, camera.zoom] as const;
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const dir: Point = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
  const reach = length + 280 * grown[1];
  const corner = (along: number, across: number) =>
    `${(from[0] + dir[0] * along - dir[1] * across).toFixed(1)},${(from[1] + dir[1] * along + dir[0] * across).toFixed(1)}`;
  /** Um feixe: o desvio do eixo e a meia largura na janela e no fim. */
  const shaft = (offset: number, near: number, far: number) =>
    `M${corner(0, (offset - near) * grown[0])}L${corner(reach, (offset - far) * grown[1])}L${corner(reach, (offset + far) * grown[1])}L${corner(0, (offset + near) * grown[0])}Z`;
  const [cx, cy] = atWall([WINDOW.cx, WINDOW.cy]);
  const cut = beamCut(lid);
  return (
    // Uma nuvem passa na frente da lua: a luz respira devagar.
    <g opacity={(0.94 + 0.06 * Math.sin(t * 0.9)) * cold ** 0.6}>
      <defs>
        <linearGradient
          id={`${id}-fall`}
          gradientUnits="userSpaceOnUse"
          x1={from[0]}
          y1={from[1]}
          x2={from[0] + dir[0] * reach}
          y2={from[1] + dir[1] * reach}
        >
          <stop offset="0" stopColor={C.ice} stopOpacity="1" />
          <stop offset="0.62" stopColor={C.cold} stopOpacity="0.7" />
          <stop offset="1" stopColor={C.cold} stopOpacity="0" />
        </linearGradient>
        {/* O feixe nasce na borda da abertura: dentro dela, o céu fica limpo. As cores da máscara só dizem onde ela corta. */}
        <mask id={`${id}-out`} maskUnits="userSpaceOnUse" x={-400} y={-400} width={WIDTH + 800} height={HEIGHT + 800}>
          <rect x={-400} y={-400} width={WIDTH + 800} height={HEIGHT + 800} fill="white" />
          <ellipse
            cx={cx}
            cy={cy}
            rx={WINDOW.rx * grown[0]}
            ry={WINDOW.ry * grown[0]}
            transform={`rotate(${WINDOW.tilt} ${cx} ${cy})`}
            fill="black"
          />
        </mask>
        {/* O que a pálpebra deixa passar: do corte para baixo. */}
        <clipPath id={`${id}-lid`}>
          <path
            d={`M${corner(-400, cut * grown[0])}L${corner(reach + 200, cut * BEAM.spread * grown[1])}L${corner(reach + 200, 3000)}L${corner(-400, 3000)}Z`}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-lid)`}>
        <g mask={`url(#${id}-out)`} fill={`url(#${id}-fall)`}>
          <path d={shaft(0, 215, 300)} opacity={0.12} />
          <path d={shaft(10, 140, 205)} opacity={0.15} />
          <path d={shaft(-10, 78, 128)} opacity={0.22} />
          <path d={shaft(-92, 9, 16)} opacity={0.16} />
          <path d={shaft(118, 12, 22)} opacity={0.14} />
        </g>
      </g>
    </g>
  );
};

/**
 * O cabo: da ponta da alavanca, no plano do assunto, até a roldana da janela,
 * lá no fundo. Como o feixe, atravessa o salão e é desenhado na tela. Esticado
 * é uma reta; quando a alavanca cede antes de a pálpebra cair, ele afrouxa e
 * faz barriga, e depois de cada tranco vibra.
 */
export const Cable: React.FC = () => {
  const { t, lever, slack, cold } = useNow();
  const camera = useCameraState();
  const [ax, ay] = project(camera, DEPTH.subject)(onLever(lever, 1.02));
  const [bx, by] = project(camera, DEPTH.wall)(onWindow(PULLEY.at[0] + PULLEY.radius - 3, PULLEY.at[1] + 5));
  const length = Math.hypot(bx - ax, by - ay);
  // De través, para o lado da janela.
  const across: Point = [(by - ay) / length, -(bx - ax) / length];
  const twang = KICK.reduce((sum, kick, index) => sum + FORCE[index] * wobble(t, kick + 0.06, 7.5, 5), 0);
  // A barriga cai para baixo. O cabo sobe quase a prumo, e para baixo é quase ao longo dele: sem o
  // desvio de través ele continuava reto enquanto a pálpebra ainda caía, e parecia esticado.
  const belly = 200 * slack;
  const side = (0.8 * belly * Math.abs(by - ay)) / length + 9 * twang;
  const mx = (ax + bx) / 2 + across[0] * side;
  const my = (ay + by) / 2 + 4 + belly + across[1] * side;
  const d = `M${ax.toFixed(1)},${ay.toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
  return (
    <>
      <path d={d} fill="none" stroke={C.near} strokeWidth={5.5} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={C.cold}
        strokeWidth={1.6}
        strokeLinecap="round"
        transform="translate(-1.6 -1)"
        opacity={0.75 * (0.3 + 0.7 * cold)}
      />
    </>
  );
};

// ---- A distância: a floresta de neurônios ----

/** Os neurônios do fim do salão: pequenos, perto do horizonte, quase da cor da névoa. */
const FAR_GROVE = Array.from({ length: 17 }, (_, index) => {
  const pick = (trait: string) => random(`far-${trait}-${index}`);
  const closeness = pick("depth");
  // Doze à esquerda do reservatório e cinco à direita: atrás dele não se vê nada.
  const x = index < 12 ? 590 + 580 * ((index + pick("x")) / 12) : 1650 + 250 * ((index - 12 + pick("x")) / 5);
  const y = 468 + 84 * closeness;
  const size = 13 + 22 * closeness;
  return { closeness, tree: neuron(`far-${index}`, [x, y], size, y + size * 3.4, (pick("lean") - 0.5) * 0.2) };
}).sort((a, b) => a.closeness - b.closeness);

export const FarGrove: React.FC = () => {
  const since = useWave(DEPTH.far);
  return (
    <>
      {FAR_GROVE.map(({ tree, closeness }, index) => (
        <g key={index} opacity={0.5 + 0.5 * closeness}>
          <NeuronArt tree={tree} tone={0} since={since(tree.soma)} />
        </g>
      ))}
      {/* A névoa do meio do salão: é contra ela que os personagens se recortam. */}
      <Glow
        at={[1150, 740]}
        rx={980}
        ry={270}
        stops={[
          [0, C.fog, 0.97],
          [0.62, C.fog, 0.88],
          [1, C.fog, 0],
        ]}
      />
      <Glow
        at={[260, 820]}
        rx={760}
        ry={240}
        stops={[
          [0, C.rib[3], 0.9],
          [0.6, C.rib[3], 0.7],
          [1, C.rib[3], 0],
        ]}
      />
      <Glow
        at={[1840, 800]}
        rx={560}
        ry={250}
        stops={[
          [0, C.rib[3], 0.85],
          [1, C.rib[3], 0],
        ]}
      />
    </>
  );
};

/** O halo do reservatório no ar do salão: âmbar perto, rosa e violeta longe. Cresce com a pressão. */
export const Halo: React.FC = () => {
  const { t, pressure, doze, calm, throb } = useNow();
  const dim = 1 - 0.34 * calm;
  return (
    <Glow
      at={[VESSEL.x, 640 - 60 * pressure]}
      rx={
        700 *
        (1 + 0.025 * Math.sin(t * 1.3) * (1 - pressure) + 0.3 * pressure - 0.14 * calm + 0.05 * doze + 0.06 * throb)
      }
      stops={[
        [0, C.gold, 0.95 * dim],
        [0.3, C.amber, (0.78 + 0.12 * pressure) * dim],
        [0.5, C.rose, (0.5 + 0.18 * pressure) * dim],
        [0.75, C.plum, (0.22 + 0.16 * pressure) * dim],
        [1, C.plum, 0],
      ]}
    />
  );
};

/**
 * Os bosques dos dois lados do salão: o corpo celular (x, y), o tamanho da
 * copa, a distância e a cor do núcleo quando ele está aceso. Quais acendem é
 * escolha de quadro, e não sorteio: poucos, espalhados, nenhum atrás do elenco.
 */
const GROVES: readonly (readonly [number, number, number, 1 | 2, string?])[] = [
  [95, 612, 80, 1],
  [222, 566, 96, 1],
  [338, 628, 78, 1],
  [452, 580, 92, 1, C.cyan],
  [556, 646, 72, 1],
  [640, 600, 58, 1, C.magenta],
  [1702, 604, 96, 1],
  [1884, 566, 100, 1, C.cyan],
  [152, 712, 122, 2, C.cyan],
  [398, 728, 132, 2, C.cyan],
  [560, 748, 88, 2],
  [1796, 700, 122, 2],
  [1912, 770, 108, 2, C.magenta],
];
const GROVE_TREES = GROVES.map(([x, y, size, tone, hue], index) => ({
  tone,
  tree: {
    ...neuron(`grove-${index}`, [x, y], size, HEIGHT + 140, (random(`grove-lean-${index}`) - 0.5) * 0.16),
    lit: hue !== undefined,
    hue: hue ?? C.cyan,
  },
}));

export const Groves: React.FC = () => {
  const since = useWave(DEPTH.grove);
  return (
    <>
      {GROVE_TREES.map(({ tree, tone }, index) => (
        // Quem está do lado da janela toma a lua por cima, até a onda passar; quem está do lado do reservatório, o âmbar de lado.
        <NeuronArt
          key={index}
          tree={tree}
          tone={tone}
          since={since(tree.soma)}
          moonlit={tree.soma[0] < VANISH[0] ? C.groveCold[tone - 1] : undefined}
          warmlit={C.groveWarm[tone - 1]}
        />
      ))}
      {/* Os troncos somem na névoa antes de chegar ao fundo. */}
      <Glow
        at={[330, 900]}
        rx={640}
        ry={170}
        stops={[
          [0, C.rib[4], 0.75],
          [0.5, C.rib[4], 0.5],
          [1, C.rib[4], 0],
        ]}
      />
      <Glow
        at={[1830, 930]}
        rx={380}
        ry={170}
        stops={[
          [0, C.rib[4], 0.7],
          [1, C.rib[4], 0],
        ]}
      />
    </>
  );
};

/** Lá embaixo: as copas de outros neurônios, vistas de cima e cada vez menores, e o reflexo do âmbar. */
const DEEP_GROVE = Array.from({ length: 11 }, (_, index) => {
  const pick = (trait: string) => random(`deep-${trait}-${index}`);
  const depth = pick("depth");
  const x = 500 + 1400 * ((index + pick("x")) / 11);
  const y = 950 + 100 * depth;
  return {
    depth,
    tree: neuron(`deep-${index}`, [x, y], 40 - 20 * depth, y + 260, (pick("lean") - 0.5) * 0.3),
  };
});

export const Deep: React.FC = () => {
  const since = useWave(DEPTH.deep);
  const { pressure, doze } = useNow();
  return (
    <>
      {DEEP_GROVE.map(({ tree, depth }, index) => (
        <g key={index} opacity={0.85 - 0.4 * depth}>
          <NeuronArt tree={tree} tone={0} since={since(tree.soma)} />
        </g>
      ))}
      <Glow
        at={[VESSEL.x, 1040]}
        rx={460 * (1 + 0.2 * pressure)}
        ry={86}
        stops={[
          [0, C.gold, 0.75 + 0.2 * pressure + 0.05 * doze],
          [0.4, C.amber, 0.45 + 0.2 * pressure],
          [1, C.rose, 0],
        ]}
      />
    </>
  );
};

/** A névoa do fundo sobe pelos troncos e pelos pilares, e some com eles. */
export const AbyssMist: React.FC = () => (
  <>
    <Glow
      at={[640, 1140]}
      rx={1000}
      ry={230}
      stops={[
        [0, C.mist, 0.8],
        [0.55, C.fog, 0.55],
        [1, C.fog, 0],
      ]}
    />
    <Glow
      at={[1700, 1150]}
      rx={520}
      ry={200}
      stops={[
        [0, C.mist, 0.6],
        [1, C.fog, 0],
      ]}
    />
  </>
);

// ---- O plano médio: a passarela e o anel ----

const deckTop = `M${DECK.left},${DECK.far(DECK.left)}L${DECK.right},${DECK.far(DECK.right)}L${DECK.right},${DECK.near(DECK.right)}L${DECK.left},${DECK.near(DECK.left)}Z`;
const ringTop =
  oval(RING.cx, RING.cy, RING.outer[0], RING.outer[1]) +
  oval(RING.cx, RING.cy, RING.inner[0], RING.inner[1]);
/** A borda de cá do anel, com a espessura dele. */
const ringSide = `M${RING.cx - RING.outer[0]},${RING.cy}A${RING.outer[0]},${RING.outer[1]} 0 0 0 ${RING.cx + RING.outer[0]},${RING.cy}L${RING.cx + RING.outer[0]},${RING.cy + RING.thick}A${RING.outer[0]},${RING.outer[1]} 0 0 1 ${RING.cx - RING.outer[0]},${RING.cy + RING.thick}Z`;

/** O anel: a face de cima toma a luz do reservatório, mais forte junto dele. */
const Ring: React.FC = () => {
  const id = useId();
  const [rx, ry] = RING.outer;
  return (
    <>
      <defs>
        <radialGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          cx={RING.cx}
          cy={RING.cy}
          r={rx}
          gradientTransform={`translate(0 ${RING.cy}) scale(1 ${ry / rx}) translate(0 ${-RING.cy})`}
        >
          <stop offset="0.6" stopColor={C.cream} />
          <stop offset="0.7" stopColor={C.gold} />
          <stop offset="0.82" stopColor={C.ember} />
          <stop offset="0.93" stopColor={C.rose} />
          <stop offset="1" stopColor={C.deck[3]} />
        </radialGradient>
      </defs>
      <path d={ringSide} fill={C.deckSide} />
      <path d={ringTop} fillRule="evenodd" fill={`url(#${id})`} />
    </>
  );
};

/** A passarela, com os pilares, a poça de luz fria e o anel na ponta. */
export const Walkway: React.FC = () => {
  const id = useId();
  const { cold } = useNow();
  const edge = (x: number) => DECK.near(x);
  const column = RING.cy + RING.outer[1] - 6;
  // Cada pilar se abre em mísula debaixo do tabuleiro.
  const pillar = (x: number) => {
    const under = (at: number) => edge(at) + DECK.thick * 0.9;
    return `M${x - 96},${under(x - 96)}Q${x - 28},${under(x) + 4} ${x - 22},${under(x) + 74}L${x - 15},1110L${x + 15},1110L${x + 22},${under(x) + 74}Q${x + 28},${under(x) + 4} ${x + 96},${under(x + 96)}Z`;
  };
  // A poça encolhe pelo lado do reservatório quando a pálpebra corta o feixe.
  const lost = 1 - cold;
  return (
    <>
      <defs>
        {/* O piso e a quina dele ao longo do quadro: escuros longe das luzes, frios no feixe, quentes junto do anel. */}
        <linearGradient id={`${id}-top`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={2000} y2={0}>
          <stop offset="0" stopColor={C.deck[0]} />
          <stop offset="0.29" stopColor={C.deck[1]} />
          <stop offset="0.45" stopColor={C.deck[2]} />
          <stop offset="0.52" stopColor={C.deck[3]} />
          <stop offset="0.865" stopColor={C.deck[3]} />
          <stop offset="0.915" stopColor={C.deck[2]} />
          <stop offset="0.98" stopColor={C.deck[1]} />
        </linearGradient>
        <linearGradient id={`${id}-edge`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={2000} y2={0}>
          <stop offset="0" stopColor={C.ironLight} />
          <stop offset="0.32" stopColor={interpolateColors(cold, [0, 1], [C.ironLight, C.cold])} />
          <stop offset="0.425" stopColor={interpolateColors(cold, [0, 1], [C.deck[3], C.ice])} />
          <stop offset="0.485" stopColor={C.gold} />
          <stop offset="0.52" stopColor={C.cream} />
          <stop offset="0.865" stopColor={C.cream} />
          <stop offset="0.9" stopColor={C.gold} />
          <stop offset="0.96" stopColor={C.ironLight} />
        </linearGradient>
        <linearGradient id={`${id}-pillar`} gradientUnits="userSpaceOnUse" x1={0} y1={880} x2={0} y2={1100}>
          <stop offset="0" stopColor={C.deckSide} />
          <stop offset="1" stopColor={C.grove[1]} />
        </linearGradient>
        <linearGradient id={`${id}-column`} gradientUnits="userSpaceOnUse" x1={0} y1={column} x2={0} y2={1100}>
          <stop offset="0" stopColor={C.ember} />
          <stop offset="0.16" stopColor={C.cover} />
          <stop offset="0.5" stopColor={C.deckSide} />
          <stop offset="1" stopColor={C.grove[2]} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={deckTop} />
        </clipPath>
      </defs>
      {/* Os pilares descem para a névoa: é por eles que se mede a altura do salão. */}
      {[250, 640, 1872].map((x) => (
        <path key={x} d={pillar(x)} fill={`url(#${id}-pillar)`} />
      ))}
      <path
        d={`M${RING.cx - 190},${column}C${RING.cx - 110},${column + 16} ${RING.cx - 62},${column + 60} ${RING.cx - 56},${column + 130}L${RING.cx - 46},1110L${RING.cx + 46},1110L${RING.cx + 56},${column + 130}C${RING.cx + 62},${column + 60} ${RING.cx + 110},${column + 16} ${RING.cx + 190},${column}Z`}
        fill={`url(#${id}-column)`}
      />
      <path
        d={`M${DECK.left},${edge(DECK.left)}L${DECK.right},${edge(DECK.right)}L${DECK.right},${edge(DECK.right) + DECK.thick * 0.85}L${DECK.left},${edge(DECK.left) + DECK.thick}Z`}
        fill={C.deckSide}
      />
      <path d={deckTop} fill={`url(#${id}-top)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* As juntas do piso fogem para o ponto de fuga do salão: é o que deita a passarela no chão. */}
        {[-90, 60, 210, 360, 510, 660, 810, 960, 1770, 1900, 2030].map((x) => {
          const y = DECK.far(x);
          const run = 140 / (y - VANISH[1]);
          return (
            <path
              key={x}
              d={`M${x},${y}L${x + (x - VANISH[0]) * run},${y + 140}`}
              stroke={C.deckSide}
              strokeWidth={3}
              opacity={0.45}
            />
          );
        })}
        {/* Onde o feixe pousa. */}
        <Glow
          at={[BEAM.to[0] - 110 * lost, BEAM.to[1] + 2]}
          rx={240 * (1 - 0.55 * lost)}
          ry={70}
          stops={[
            [0, C.ice, 0.95 * cold ** 0.7],
            [0.5, C.cold, 0.6 * cold ** 0.7],
            [1, C.cold, 0],
          ]}
        />
      </g>
      <path
        d={`M${DECK.left},${edge(DECK.left)}L${DECK.right},${edge(DECK.right)}`}
        stroke={`url(#${id}-edge)`}
        strokeWidth={4}
      />
      <Ring />
    </>
  );
};

/** Quando cada lâmpada acende: três já vêm acesas da noite, uma a cada carimbada, e a última com a onda. */
const LAMP_ON = [-100, -100, -100, MARK[0], MARK[1], MARK[2], WAVE.at + 0.2] as const;

/**
 * A metade de cá do anel passa na frente do fundo do reservatório. Na borda
 * dela fica a conta: as lâmpadas de um dia comum em ouro, a marca, e as que
 * passam dela, em rosa.
 */
export const RingFront: React.FC = () => {
  const id = useId();
  const { t } = useNow();
  const [rx, ry] = RING.outer;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={RING.cx - rx - 20} y={RING.cy} width={2 * rx + 40} height={ry + RING.thick + 20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Ring />
        <path
          d={`M${RING.cx - rx},${RING.cy}A${rx},${ry} 0 0 0 ${RING.cx + rx},${RING.cy}`}
          fill="none"
          stroke={C.gold}
          strokeWidth={4}
          opacity={0.8}
        />
        <path
          d={`M${RING.cx - RING.inner[0]},${RING.cy}A${RING.inner[0]},${RING.inner[1]} 0 0 0 ${RING.cx + RING.inner[0]},${RING.cy}`}
          fill="none"
          stroke={C.core}
          strokeWidth={5}
        />
      </g>
      <rect x={LIMIT[0] - 3} y={LIMIT[1] - 7} width={6} height={RING.thick + 15} rx={3} fill={C.cream} />
      {LAMPS.map(({ at, over }, index) => {
        const since = t - LAMP_ON[index];
        const hue = over ? C.rose : C.gold;
        // Acende com sobra: cresce, passa do tamanho e volta, e o halo sobe em dois quadros, com ela.
        const pop = E.back(span(since, 0, 0.26));
        const on = span(since, 0, 0.07);
        const flare = decay(since, 0, 4.5);
        return (
          <g key={index}>
            {/* O soquete fica por baixo: nas duas depois da marca ele já avisa a cor. */}
            <circle
              cx={at[0]}
              cy={at[1]}
              r={9}
              fill={C.shadow}
              stroke={over ? C.cover : C.ironLight}
              strokeWidth={2.5}
            />
            {since > 0 ? (
              <>
                <Glow
                  at={at}
                  rx={36 + 36 * flare}
                  stops={[
                    [0, hue, 0.9 * on],
                    [0.4, over ? C.rose : C.amber, (0.4 + 0.3 * flare) * on],
                    [1, over ? C.rose : C.amber, 0],
                  ]}
                />
                <circle cx={at[0]} cy={at[1]} r={10.5 * pop} fill={over ? C.bow : C.gold} />
                <circle cx={at[0]} cy={at[1]} r={6 * pop} fill={C.core} />
              </>
            ) : null}
          </g>
        );
      })}
    </>
  );
};

/**
 * As sombras no piso: a da Vigília foge do feixe enquanto ele existe, e passa
 * para o outro lado quando só sobra a luz do reservatório; a do Contador foge
 * do reservatório. A dela foi medida para o ovo chibi: começa embaixo dos
 * cascos, na linha em que o boneco pisa, e encolhe e clareia quando ela sai do
 * chão (o pulo do primeiro tranco, a queda).
 */
export const FloorShadows: React.FC = () => {
  const { cold, vigiliaX, vigiliaLift = 0 } = useNow();
  const air = Math.min(1, vigiliaLift / 22);
  // O boneco pisa numa linha que passa pelo chão embaixo do cubo da alavanca (`cast.tsx`).
  const floor = floorAt(LEVER.hub[0]) + 0.046 * (vigiliaX - LEVER.hub[0]);
  const fade = 1 - 0.5 * air;
  return (
    <g fill={C.shadow}>
      <ellipse cx={vigiliaX + 46 - 8 * air} cy={floor + 7} rx={86 - 26 * air} ry={10 - 3 * air} opacity={0.42 * cold * fade} />
      <ellipse cx={vigiliaX - 40 + 8 * air} cy={floor + 5} rx={76 - 22 * air} ry={8 - 2 * air} opacity={0.36 * (1 - cold) * fade} />
      <ellipse cx={SPOT.contador[0] - 70} cy={SPOT.contador[1] + 4} rx={86} ry={9} opacity={0.42} />
    </g>
  );
};

// ---- O assunto: o reservatório da pressão do sono ----

const vesselPath = (() => {
  const { x, lip, shoulder, widest, foot, half, neck } = VESSEL;
  return `M${x - neck},${lip}L${x - neck},${shoulder}C${x - neck},${shoulder + 84} ${x - half},${widest - 190} ${x - half},${widest}C${x - half},${widest + 194} ${x - 170},${foot} ${x},${foot}C${x + 170},${foot} ${x + half},${widest + 194} ${x + half},${widest}C${x + half},${widest - 190} ${x + neck},${shoulder + 84} ${x + neck},${shoulder}L${x + neck},${lip}Z`;
})();

/** Até onde as bolhas sobem e de onde saem: a volta delas não depende do nível, para nenhuma pular quando ele sobe. */
const RISE = { top: 250, bottom: 890 };
/** As bolhas do líquido: três tamanhos, mais juntas nas bordas, com o meio em descanso. */
const BUBBLES = Array.from({ length: 40 }, (_, index) => {
  const pick = (trait: string) => random(`bubble-${trait}-${index}`);
  const side = pick("side") < 0.5 ? -1 : 1;
  return {
    off: side * (100 + 130 * Math.sqrt(pick("x"))),
    y: pick("y") * (RISE.bottom - RISE.top),
    r: [4, 7, 11][Math.floor(pick("size") ** 1.6 * 3)],
    ring: pick("ring") < 0.35,
    speed: 14 + 22 * pick("speed"),
  };
});

/** A gota: a ponta em cima, o bojo embaixo, em volta de (0, 0). */
const dropPath = "M0,-24C5,-10 14,-2 14,6A14,14 0 0 1 -14,6C-14,-2 -5,-10 0,-24Z";

export const Vessel: React.FC = () => {
  const id = useId();
  const { t, level, pressure, cold, doze, calm, throb } = useNow();
  const { x, lip, nozzle } = VESSEL;
  // A face de cima do líquido tem a largura do vidro naquela altura.
  const face = vesselHalf(level) - 11;
  // O líquido ferve mais com a pressão, e sossega depois de transbordar.
  const simmer =
    t +
    key(t, [
      [HIT[2], 0],
      [HIT[3] + 0.4, 2.4, E.lin],
      [12.5, 0.9, E.sine],
    ]);
  const hits = sinceHit(t);
  /** A luz que transborda quando a última gota bate, e o que fica dela na boca. */
  const spill = decay(t, HIT[3] + 0.14, 1.5) * span(t, HIT[3] + 0.06, HIT[3] + 0.2);
  const brim = span(t, HIT[3] + 0.1, HIT[3] + 0.3) * (0.7 + 0.12 * doze);
  const dripping = 1 - 0.75 * span(t, HIT[3], HIT[3] + 1.2);
  return (
    <>
      <defs>
        <clipPath id={`${id}-glass`}>
          <path d={vesselPath} />
        </clipPath>
        <radialGradient
          id={`${id}-liquid`}
          gradientUnits="userSpaceOnUse"
          cx={x}
          cy={660 - 0.35 * (548 - level)}
          r={340 * (1 + 0.3 * pressure - 0.1 * calm + 0.09 * doze + 0.1 * throb)}
        >
          {/* Dormindo, o miolo baixa do branco para o creme: é luz de quem repousa. */}
          <stop offset="0" stopColor={interpolateColors(calm, [0, 1], [C.core, C.cream])} />
          <stop offset="0.28" stopColor={interpolateColors(calm, [0, 1], [C.cream, C.gold])} />
          <stop offset="0.55" stopColor={C.gold} />
          <stop offset="0.8" stopColor={C.amber} />
          <stop offset="1" stopColor={C.ember} />
        </radialGradient>
        {/* O ar acima do líquido: do ouro ao violeta passando pelo rosa, que é limpo sobre o vidro escuro. */}
        <linearGradient id={`${id}-fume`} gradientUnits="userSpaceOnUse" x1={0} y1={level} x2={0} y2={level - 210}>
          <stop offset="0" stopColor={C.gold} stopOpacity="0.9" />
          <stop offset="0.07" stopColor={C.ember} stopOpacity="0.8" />
          <stop offset="0.32" stopColor={C.rose} stopOpacity="0.5" />
          <stop offset="0.66" stopColor={C.plum} stopOpacity="0.3" />
          <stop offset="1" stopColor={C.plum} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} gradientUnits="userSpaceOnUse" x1={0} y1={lip} x2={0} y2={VESSEL.foot}>
          <stop offset="0" stopColor={C.glass} stopOpacity="0.6" />
          <stop offset={Math.max(0, (level - 14 - lip) / (VESSEL.foot - lip))} stopColor={C.glass} stopOpacity="0.6" />
          <stop offset={Math.max(0, (level - 12 - lip) / (VESSEL.foot - lip))} stopColor={C.cream} stopOpacity="0.85" />
          <stop offset="1" stopColor={C.gold} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* O conduto desce da abóbada e pinga dentro do gargalo. */}
      <path
        d={`M${x - 24},-80 L${x - 24},${nozzle - 52} C${x - 24},${nozzle - 28} ${x - 40},${nozzle - 20} ${x - 42},${nozzle} L${x + 42},${nozzle} C${x + 40},${nozzle - 20} ${x + 24},${nozzle - 28} ${x + 24},${nozzle - 52} L${x + 24},-80 Z`}
        fill={C.iron}
      />
      {/* A lua pega o conduto pela esquerda. */}
      <path
        d={`M${x - 24},-80 L${x - 24},${nozzle - 52} C${x - 24},${nozzle - 28} ${x - 40},${nozzle - 20} ${x - 42},${nozzle} L${x - 31},${nozzle} C${x - 29},${nozzle - 18} ${x - 14},${nozzle - 28} ${x - 14},${nozzle - 52} L${x - 14},-80 Z`}
        fill={C.coldDeep}
        opacity={0.35 + 0.65 * cold}
      />
      <rect x={x - 31} y={44} width={62} height={16} rx={8} fill={C.ironLight} />
      {/* O gotejamento para depois da última: o bico apaga. */}
      <ellipse cx={x} cy={nozzle} rx={42} ry={9} fill={C.amber} opacity={dripping} />
      <ellipse cx={x} cy={nozzle} rx={27} ry={5} fill={C.core} opacity={dripping} />

      <path d={vesselPath} fill={C.glassDark} opacity={0.78} />
      <g clipPath={`url(#${id}-glass)`}>
        <rect x={x - 300} y={level - 210} width={600} height={210} fill={`url(#${id}-fume)`} />
        <rect x={x - 300} y={level} width={600} height={VESSEL.foot - level + 20} fill={`url(#${id}-liquid)`} />
        {/* Dormindo, o líquido baixa do ouro para a brasa. */}
        <rect x={x - 300} y={level} width={600} height={VESSEL.foot - level + 20} fill={C.ember} opacity={0.1 * calm} />
        {BUBBLES.map(({ off, y, r, ring, speed }, index) => {
          // Cada bolha sobe e recomeça do fundo; só existe dentro do líquido.
          const tall = RISE.bottom - RISE.top;
          const cy = RISE.top + ((((y - simmer * speed) % tall) + tall) % tall);
          const shown = clamp01((cy - level - 26) / 30);
          if (shown === 0 || Math.abs(off) > vesselHalf(cy) - 26) {
            return null;
          }
          return ring ? (
            <circle key={index} cx={x + off} cy={cy} r={r} fill="none" stroke={C.core} strokeWidth={2.5} opacity={0.7 * shown} />
          ) : (
            <circle key={index} cx={x + off} cy={cy} r={r} fill={C.core} opacity={0.6 * shown} />
          );
        })}
        {/* A batida de cada gota desce pelo líquido até o pé, de onde o pulso sai. */}
        {hits.map((since, index) => {
          const down = since / 0.11;
          if (down <= 0 || down >= 1) {
            return null;
          }
          const y = mix(level + 10, CONDUIT[0][1], down);
          const wide = vesselHalf(y) - 14;
          return (
            <ellipse
              key={index}
              cx={x}
              cy={y}
              rx={wide}
              ry={wide * 0.1}
              fill="none"
              stroke={C.core}
              strokeWidth={5 + 3 * FORCE[index]}
              opacity={0.85 - 0.3 * down}
            />
          );
        })}
        {/* A face de cima do líquido, vista de cima. */}
        <Glow
          at={[x, level]}
          rx={face}
          ry={face * 0.1025}
          stops={[
            [0, C.core, 1],
            [0.7, C.core, 1],
            [1, C.gold, 1],
          ]}
        />
        {[0, 1].map((ripple) => {
          const grown = ((t * 0.5 + ripple * 0.5) % 1) * 0.6 + 0.4;
          return (
            <ellipse
              key={ripple}
              cx={x}
              cy={level}
              rx={face * 0.39 * grown}
              ry={face * 0.041 * grown}
              fill="none"
              stroke={C.gold}
              strokeWidth={3}
              opacity={1.2 - grown}
            />
          );
        })}
        {/* O anel de cada gota que bate: sai do ponto e abre até a parede. */}
        {hits.map((since, index) => {
          const open = since / (0.6 + 0.2 * FORCE[index]);
          if (open <= 0 || open >= 1) {
            return null;
          }
          const grown = 0.1 + 0.88 * E.out(open);
          return (
            <ellipse
              key={index}
              cx={x}
              cy={level}
              rx={face * grown}
              ry={face * 0.1025 * grown}
              fill="none"
              stroke={C.amber}
              strokeWidth={3 + 4 * FORCE[index] * (1 - open)}
              opacity={1 - open}
            />
          );
        })}
      </g>
      {/* O clarão do contato, no ponto em que a gota bate: deitado na face do líquido. */}
      {hits.map((since, index) =>
        since > 0 && since < 0.3 ? (
          <Glow
            key={index}
            at={[x, level - 3]}
            rx={(64 + 50 * FORCE[index]) * (0.5 + 0.5 * E.out(since / 0.3))}
            ry={(26 + 20 * FORCE[index]) * (0.5 + 0.5 * E.out(since / 0.3))}
            stops={[
              [0, C.core, 0.9 * (1 - since / 0.3)],
              [0.35, C.cream, 0.5 * (1 - since / 0.3)],
              [1, C.gold, 0],
            ]}
          />
        ) : null,
      )}
      {dropsAt(t).map(({ fall, size, stretch }, index) => {
        // Pendurada, a ponta fica dentro do bico; caindo, o bojo chega ao nível.
        const hung = nozzle - 4 + 24 * size * stretch;
        const y = mix(hung, Math.max(hung, level - 20 * size * stretch), fall);
        return (
          <g key={index}>
            <Glow
              at={[x, y + 2]}
              rx={40 * size}
              stops={[
                [0, C.gold, 0.7],
                [0.4, C.amber, 0.35],
                [1, C.amber, 0],
              ]}
            />
            <g transform={`translate(${x} ${y}) scale(${size / Math.sqrt(stretch)} ${size * stretch})`}>
              <path d={dropPath} fill={C.gold} />
              <ellipse cx={0} cy={6} rx={8} ry={9} fill={C.core} />
            </g>
          </g>
        );
      })}
      {/* A parede do vidro: fria onde está vazio, acesa onde o líquido encosta. */}
      <path
        d={vesselPath}
        fill="none"
        stroke={`url(#${id}-wall)`}
        strokeWidth={22}
        clipPath={`url(#${id}-glass)`}
      />
      {/* A escala do vidro, do lado de quem lê o nível. */}
      {[0, 1, 2, 3, 4, 5, 6].map((mark) => {
        const y = 420 + mark * 46;
        const inset = 232 - 0.00144 * (y - 606) ** 2;
        return (
          <rect
            key={mark}
            x={x - inset}
            y={y - 3}
            width={mark % 2 === 0 ? 36 : 22}
            height={6}
            rx={3}
            fill={interpolateColors(clamp01((y - level + 6) / 12), [0, 1], [C.glass, C.tick])}
            opacity={0.72}
          />
        );
      })}
      {/* O reflexo da janela no ombro do vidro: some com ela. */}
      <path
        d={`M${x - 196},476 C${x - 204},410 ${x - 156},356 ${x - 98},326`}
        fill="none"
        stroke={C.ice}
        strokeWidth={14}
        strokeLinecap="round"
        opacity={0.55 * cold}
      />
      <path
        d={`M${x - 216},540 C${x - 220},522 ${x - 219},508 ${x - 214},494`}
        fill="none"
        stroke={C.ice}
        strokeWidth={9}
        strokeLinecap="round"
        opacity={0.45 * cold}
      />
      <ellipse cx={x} cy={lip} rx={72} ry={13} fill={C.glass} />
      <ellipse cx={x} cy={lip} rx={54} ry={8} fill={interpolateColors(brim, [0, 0.7], [C.glassDark, C.core])} />
      {/* O reservatório transborda em luz: o clarão sai da boca, e um resto fica nela. */}
      <Glow
        at={[x, lip]}
        rx={130 + 340 * spill}
        stops={[
          [0, C.core, Math.min(1, brim + spill)],
          [0.14, C.cream, Math.min(1, 0.5 * brim + 0.7 * spill)],
          [0.4, C.gold, 0.32 * spill + 0.1 * brim],
          [0.75, C.amber, 0.1 * spill],
          [1, C.amber, 0],
        ]}
      />
    </>
  );
};

/**
 * O conduto da pressão. Parado, é um cano escuro com um fio de âmbar apagado;
 * a cada gota um pulso de luz corre por ele, do reservatório até a alavanca,
 * e depois da última ele fica aceso.
 */
export const Conduit: React.FC = () => {
  const { t } = useNow();
  const d = roundedPath(CONDUIT, 14);
  const [sx, sy] = CONDUIT[0];
  const [ex, ey] = CONDUIT[CONDUIT.length - 1];
  const arrival = arrivalAt(t);
  const leaving = HIT.reduce(
    (glow, hit, index) => Math.max(glow, FORCE[index] * decay(t, hit + (index === 3 ? 0.02 : 0.1), 6)),
    0,
  );
  const held = 0.75 * span(t, KICK[3] - 0.04, KICK[3] + 0.1);
  return (
    <>
      <path d={d} fill="none" stroke={C.shadow} strokeWidth={19} strokeLinecap="round" opacity={0.55} />
      <path d={d} fill="none" stroke={C.iron} strokeWidth={14} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={C.ironLight}
        strokeWidth={4}
        strokeLinecap="round"
        transform="translate(0 -4)"
      />
      <path d={d} fill="none" stroke={C.tick} strokeWidth={4.5} strokeLinecap="round" opacity={0.75} />
      {/* As braçadeiras que prendem o cano ao piso. */}
      {[0.34, 0.6].map((u) => {
        const [bx, by] = alongPath(CONDUIT, u);
        return <rect key={u} x={bx - 5} y={by - 11} width={10} height={22} rx={4} fill={C.ironLight} />;
      })}
      <path d={d} fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={held} />
      {pulsesAt(t).map(({ along, force }, index) => {
        // O pulso tem cabeça e rastro: um trecho aceso do cano, que anda.
        const tail = 0.34;
        const head = Math.min(1, along);
        const from = Math.max(0, along - tail);
        const [hx, hy] = alongPath(CONDUIT, head);
        // Nasce pequeno na tomada e cresce enquanto se afasta dela.
        const born = Math.min(1, along / 0.15);
        return from < head ? (
          <g key={index}>
            <path
              d={d}
              fill="none"
              stroke={C.gold}
              strokeWidth={8 + 2 * force}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${head - from} 2`}
              strokeDashoffset={-from}
            />
            {along < 1 ? (
              <>
                <Glow
                  at={[hx, hy]}
                  rx={(34 + 22 * force) * (0.4 + 0.6 * born)}
                  stops={[
                    [0, C.core, 0.95],
                    [0.35, C.gold, 0.7],
                    [1, C.amber, 0],
                  ]}
                />
                <circle cx={hx} cy={hy} r={(5 + 2.5 * force) * (0.4 + 0.6 * born)} fill={C.core} />
              </>
            ) : null}
          </g>
        ) : null;
      })}
      {/* A tomada no pé do reservatório, de onde o pulso sai. */}
      <circle cx={sx} cy={sy} r={15} fill={C.iron} />
      <circle cx={sx} cy={sy} r={10} fill={C.ironLight} />
      <circle
        cx={sx}
        cy={sy}
        r={5.5}
        fill={interpolateColors(Math.min(1, leaving + held), [0, 1], [C.tick, C.core])}
      />
      <Glow
        at={[sx, sy]}
        rx={46}
        stops={[
          [0, C.gold, Math.min(1, 0.8 * leaving)],
          [1, C.amber, 0],
        ]}
      />
      {/* A boca do conduto na base da alavanca: é ali que a pressão empurra. */}
      <Glow
        at={[ex - 6, ey]}
        rx={54 + 30 * Math.min(1, arrival)}
        stops={[
          [0, C.core, Math.min(1, 0.95 * arrival)],
          [0.4, C.gold, Math.min(1, 0.6 * arrival)],
          [1, C.amber, 0],
        ]}
      />
    </>
  );
};

/**
 * A alavanca: um cubo preso ao piso e uma haste mais alta que quem a empurra,
 * com a lua de um lado e o âmbar do outro. A manopla é da cor da Vigília, que
 * é quem a segura; na ponta fica a argola do cabo da pálpebra, e na base, a
 * boca do conduto da pressão.
 */
export const Lever: React.FC = () => {
  const { t, lever, cold, pressure } = useNow();
  const [hx, hy] = LEVER.hub;
  const V = C.vigilia;
  const strip = (side: number, from: number, to: number) =>
    [onLever(lever, from, side), onLever(lever, (from + to) / 2, side), onLever(lever, to, side)] as const;
  const grip = (side: number) => {
    const from = onLever(lever, 0.74, side);
    const to = onLever(lever, 1, side);
    return `M${from[0].toFixed(1)},${from[1].toFixed(1)}L${to[0].toFixed(1)},${to[1].toFixed(1)}`;
  };
  const [ex, ey] = onLever(lever, 1.04);
  const arrival = Math.min(1, arrivalAt(t));
  const [px, py] = CONDUIT[CONDUIT.length - 1];
  // O cubo treme quando a alavanca bate no batente.
  const thud = 2.5 * wobble(t, KICK[3] + 0.33, 11, 9);
  return (
    <g transform={`translate(${thud} 0)`}>
      <ellipse cx={hx} cy={hy + 34} rx={78} ry={15} fill={C.deckSide} />
      {/* A boca do conduto. */}
      <rect x={px - 16} y={py - 13} width={30} height={26} rx={9} fill={C.ironLight} />
      <rect
        x={px - 9}
        y={py - 7}
        width={16}
        height={14}
        rx={5}
        fill={interpolateColors(arrival, [0, 1], [C.tick, C.core])}
      />
      <rect x={hx - 60} y={hy - 2} width={120} height={40} rx={14} fill={C.iron} />
      <circle cx={hx} cy={hy} r={42} fill={C.ironLight} />
      <path
        d={`M${hx - 42},${hy}A42,42 0 0 1 ${hx},${hy - 42}A54,54 0 0 0 ${hx - 42},${hy}Z`}
        fill={C.cold}
        opacity={cold}
      />
      <path
        d={`M${hx + 42},${hy}A42,42 0 0 1 ${hx + 14},${hy + 39.6}A52,52 0 0 0 ${hx + 42},${hy}Z`}
        fill={interpolateColors(Math.max(arrival, pressure), [0, 1], [C.amber, C.cream])}
      />
      <path d={taperPath(...strip(0, 0, 1), 30, 22)} fill={C.ironLight} />
      <path d={taperPath(...strip(-9.5, 0.14, 1), 9, 7)} fill={C.cold} opacity={cold} />
      <path d={taperPath(...strip(11.5, 0.14, 1), 5, 4)} fill={C.amber} />
      <circle cx={hx} cy={hy} r={13} fill={C.iron} />
      {/* A argola do cabo. */}
      <circle cx={ex} cy={ey} r={9} fill="none" stroke={C.near} strokeWidth={5} />
      {/* A manopla. */}
      <path d={grip(0)} stroke={V.limb} strokeWidth={36} strokeLinecap="round" />
      <path d={grip(1.5)} stroke={V.body} strokeWidth={28} strokeLinecap="round" />
      <path d={grip(-9)} stroke={V.cold} strokeWidth={8} strokeLinecap="round" opacity={0.35 + 0.65 * cold} />
      <path d={grip(11)} stroke={V.warm} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// ---- A moldura de primeiro plano ----

/** Neurônios perto da câmera: escuros e moles, cortados pela borda em dois cantos. */
export const Foreground: React.FC = () => {
  const id = useId();
  const { t, doze } = useNow();
  const since = useWave(DEPTH.frame);
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.8);
  // Cada nó da moldura é da cor contrária à luz do lado em que está, até a onda passar por ele.
  const nodes = (
    [
      [[346, 816], C.magenta, 78, 0.9, 0.7, 0.2],
      [[1740, 244], C.cyan, 84, 0.85, 0.6, 0.16],
    ] as const
  ).map(([at, awake, rx, heart, inner, outer]) => {
    const { flash, turned } = turnOf(since(at));
    return {
      at,
      rx: rx * (1 + 0.4 * flash),
      hue: interpolateColors(span(since(at), 0, 0.07), [0, 1], [
        awake,
        interpolateColors(flash, [0, 1], [C.doze, C.cream]),
      ]),
      power: mix(pulse, 0.62 + 0.14 * doze, turned) + 0.5 * flash,
      heart,
      inner,
      outer,
    };
  });
  return (
    <>
      <defs>
        {/* Desfoque só aqui: é o que diz que a moldura está perto demais da lente. */}
        <filter id={id} filterUnits="userSpaceOnUse" x={-400} y={-400} width={WIDTH + 800} height={HEIGHT + 800}>
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      <g filter={`url(#${id})`} fill={C.near}>
        {/* Embaixo, à esquerda: um tronco entra pela borda, faz a volta no canto e solta um galho, que se abre em dois. */}
        <path
          d={
            taperPath([-170, 360], [130, 720], [-40, 1230], 150, 300) +
            taperPath([40, 910], [200, 950], [340, 1000], 124, 82) +
            taperPath([250, 972], [318, 902], [342, 826], 76, 34) +
            circle([346, 816], 32) +
            taperPath([320, 996], [470, 1040], [600, 1140], 84, 50)
          }
        />
        {/* Em cima, à direita: outro cruza o canto e deixa cair um ramo. */}
        <path
          d={
            taperPath([2010, 70], [1820, 10], [1630, -80], 230, 130) +
            taperPath([1790, 0], [1722, 124], [1738, 232], 96, 40) +
            circle([1740, 244], 36)
          }
        />
      </g>
      {nodes.map(({ at, rx, hue, power, heart, inner, outer }, index) => (
        <Glow
          key={index}
          at={at}
          rx={rx}
          stops={[
            [0, C.moon, Math.min(1, heart * power)],
            [0.14, hue, Math.min(1, inner * power)],
            [0.42, hue, outer * power],
            [1, hue, 0],
          ]}
        />
      ))}
    </>
  );
};

// ---- As partículas ----

const SIZES = [2, 3.4, 6.5] as const;
/** Onde está o assunto: nenhuma partícula passa por cima dele. */
const overSubject = (x: number, y: number) =>
  (x > 690 && x < 1170 && y > 520 && y < 890) ||
  ((x - VESSEL.x) / 300) ** 2 + ((y - 560) / 400) ** 2 < 1;

/** Poeira no feixe frio, mais densa perto da janela. */
const DUST = Array.from({ length: 52 }, (_, index) => {
  const pick = (trait: string) => random(`dust-${trait}-${index}`);
  const along = 250 + 640 * pick("along") ** 1.7;
  const across = (pick("across") * 2 - 1) * (130 + 0.12 * along);
  return {
    x: BEAM.from[0] + BEAM.dir[0] * along + BEAM.normal[0] * across,
    y: BEAM.from[1] + BEAM.dir[1] * along + BEAM.normal[1] * across,
    // De través, na medida da janela: é o que diz se a sombra da pálpebra já pegou este grão.
    lane: across / (1 + (BEAM.spread - 1) * (along / BEAM.length)),
    size: Math.floor(pick("size") ** 2.2 * 3),
    phase: pick("phase") * 2 * Math.PI,
    light: pick("light"),
  };
}).filter(({ x, y }) => !overSubject(x, y));

/** Centelhas no ar em volta do reservatório, mais densas perto dele. */
const EMBERS = Array.from({ length: 44 }, (_, index) => {
  const pick = (trait: string) => random(`ember-${trait}-${index}`);
  const angle = pick("angle") * 2 * Math.PI;
  const radius = 330 + 330 * pick("radius") ** 1.6;
  return {
    x: VESSEL.x + Math.cos(angle) * radius,
    y: 560 + Math.sin(angle) * radius * 0.92,
    size: Math.floor(pick("size") ** 2.2 * 3),
    phase: pick("phase") * 2 * Math.PI,
    light: pick("light"),
  };
}).filter(({ x, y }) => !overSubject(x, y) && y < 900);

/** A poeira só se vê onde o feixe ainda passa; as centelhas são empurradas pela onda e depois derivam mais devagar. */
export const Motes: React.FC = () => {
  const { t, lid, cold, pressure } = useNow();
  const since = useWave(DEPTH.motes);
  const cut = beamCut(lid);
  // A deriva das centelhas: sobem com o calor, e quase param quando o salão adormece.
  const risen =
    t -
    key(t, [
      [WAVE.at + 0.4, 0],
      [12.5, 2.3, E.sine],
    ]);
  return (
    <>
      {DUST.map(({ x, y, lane, size, phase, light }, index) => (
        <circle
          key={`dust-${index}`}
          cx={x + 9 * Math.sin(t * 0.35 + phase)}
          cy={y + 6 * Math.cos(t * 0.28 + phase)}
          r={SIZES[size]}
          fill={C.ice}
          opacity={(size === 2 ? 0.3 : 0.8) * (0.45 + 0.55 * light) * cold ** 0.6 * clamp01((lane - cut) / 30)}
        />
      ))}
      {EMBERS.map(({ x, y, size, phase, light }, index) => {
        const passed = since([x, y]);
        const push = passed > 0 ? 34 * (1 - Math.exp(-passed * 5)) : 0;
        const away = Math.hypot(x - VESSEL.x, y - 470) || 1;
        return (
          <circle
            key={`ember-${index}`}
            cx={x + 7 * Math.sin(t * 0.4 + phase) + (push * (x - VESSEL.x)) / away}
            cy={y - 10 * risen + 5 * Math.cos(t * 0.3 + phase) + (push * (y - 470)) / away}
            r={SIZES[size] * (1 + 0.25 * pressure)}
            fill={size === 0 ? C.core : C.gold}
            opacity={Math.min(1, (size === 2 ? 0.3 : 0.85) * (0.45 + 0.55 * light) * (1 + 0.5 * pressure))}
          />
        );
      })}
    </>
  );
};

// ---- A luz que toma o salão ----

/**
 * O calor: sai do reservatório quando o nível chega ao gargalo, devagar, e
 * depois vai na frente da onda. É um disco de luz na tela, que cresce até
 * cobrir o quadro; o que fica para trás dele já é o salão quente.
 */
export const Warmth: React.FC = () => {
  const { t } = useNow();
  const camera = useCameraState();
  const at = project(camera, DEPTH.subject)(WAVE_FROM);
  const slow = key(t, [
    [HIT[2] + 0.4, 0],
    [WAVE.at, 720, E.out],
  ]);
  const radius = slow + Math.max(0, t - WAVE.at) * WAVE.speed;
  if (radius <= 0) {
    return null;
  }
  const strength = key(t, [
    [HIT[2] + 0.4, 0],
    [HIT[2] + 1.2, 0.34, E.out],
    [WAVE.at, 0.4, E.lin],
    [WAVE.at + 0.5, 0.62, E.out],
    [9.6, 0.62],
    [11.2, 0.44, E.sine],
  ]);
  // Antes da onda a borda é larga e mole; com ela, estreita.
  const soft = Math.min(0.95, mix(520, 300, span(t, WAVE.at, WAVE.at + 0.3)) / radius);
  return (
    <Glow
      at={at}
      rx={radius}
      stops={[
        [0, C.amber, strength],
        [1 - soft, C.ember, strength * 0.92],
        [1, C.rose, 0],
      ]}
    />
  );
};

/** A frente da onda: um anel claro que abre na tela e perde força com a distância. */
export const WaveFront: React.FC = () => {
  const { t } = useNow();
  const camera = useCameraState();
  const since = t - WAVE.at;
  if (since <= 0 || since > 1.5) {
    return null;
  }
  const at = project(camera, DEPTH.subject)(WAVE_FROM);
  const radius = WAVE.head + since * WAVE.speed;
  // Nasce por trás do vidro, já do tamanho dele, e perde força com a distância.
  const power = span(since, 0, 0.1) * (1 - since / 1.5) ** 1.4;
  const band = Math.min(0.9, 340 / radius);
  return (
    // A frente é uma faixa larga de luz, mais clara perto da borda e sem fio duro: onda, e não bolha.
    <Glow
      at={at}
      rx={radius}
      stops={[
        [0, C.amber, 0.06 * power],
        [1 - band, C.gold, 0.12 * power],
        [1 - band * 0.5, C.gold, 0.42 * power],
        [1 - band * 0.2, C.cream, 0.8 * power],
        [1 - band * 0.07, C.cream, 0.5 * power],
        [1, C.amber, 0],
      ]}
    />
  );
};
