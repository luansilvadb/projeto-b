// O elenco: a Vigília e o Contador. Ela é o ovo chibi, com as poses desenhadas
// de `poses.ts` e a atuação de `acting.ts`. Ele continua com o desenho do quadro aprovado e
// a atuação de `timing.ts`: o tronco inclina e achata em volta do pé do corpo,
// o braço é uma mangueira, e o rosto desliza no corpo.

import { useId } from "react";
import type { Point } from "../../art/shapes";
import { blink } from "../../components/Idle";
import { Vigilia as VigiliaDrawing } from "../../art/Vigilia";
import { vigiliaAt } from "./acting";
import { C, floorAt, LEVER, SPOT } from "./base";
import { settle, SLOPE } from "./poses";
import { useNow } from "./scenery";
import { contadorAt, mix, mixV } from "./timing";

/**
 * Um membro de mangueira: do ombro (ou do quadril) até a mão (ou o pé). Com
 * as pontas perto demais, ele dobra: o cotovelo e o joelho saem para o lado
 * pedido, tanto mais quanto mais comprimido está.
 */
const limb = (from: Point, to: Point, rest: number, side: 1 | -1, sag = 0) => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  // A dobra tem teto: comprimida além dele, a mangueira encolhe em vez de fazer um laço.
  const bend = Math.min(27, Math.max(0, rest - length)) * side;
  const cx = (from[0] + to[0]) / 2 + (dy / length) * bend;
  const cy = (from[1] + to[1]) / 2 - (dx / length) * bend + sag;
  return `M${from[0].toFixed(1)},${from[1].toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${to[0].toFixed(1)},${to[1].toFixed(1)}`;
};

/**
 * A Vigília é o ovo chibi de `src/art/Vigilia.tsx`, e a atuação dela, pose a
 * pose, vem de `acting.ts`. O desenho vive no espaço das poses (a origem no
 * chão embaixo do cubo, o chão plano): o grupo o leva para a passarela, e a
 * alavanca que as mãos presas seguem é a do cenário menos `SLOPE`. Quem põe a
 * mão presa na haste é `settle`: o desenho não sabe de alavanca. Ela é
 * desenhada inteira na frente da alavanca.
 */
export const Vigilia: React.FC = () => {
  const { t, lever, cold } = useNow();
  return (
    <g transform={`translate(${LEVER.hub[0]} ${floorAt(LEVER.hub[0])}) rotate(${SLOPE})`}>
      <VigiliaDrawing pose={settle(vigiliaAt(t).pose, lever - SLOPE)} cold={cold} colors={C.vigilia} />
    </g>
  );
};

/**
 * O Contador olha o nível com calma, de livro na mão. Está encostado no
 * reservatório: a luz bate de frente nele, e a sombra foge para trás. Cada
 * conta ele carimba com o corpo inteiro: sobe na ponta dos pés e bate, e o
 * quepe e o livro, que estão soltos, chegam um instante depois.
 */
export const Contador: React.FC = () => {
  const id = useId();
  const { t } = useNow();
  const pose = contadorAt(t);
  const K = C.contador;
  const [ax, ay] = SPOT.contador;
  // O rosto desliza de um lado ao outro do corpo quando ele vira para ela, e a aba do quepe vai junto.
  const face = mix(12.2, -11, pose.turned);
  const brim = mix(22, -22, pose.turned);
  const facing = 1 - Math.abs(2 * pose.turned - 1);
  const eyeY = -72.3;
  const lean = (pose.lean * Math.PI) / 180;
  const wide = 1 / Math.sqrt(pose.stretch);
  /** Um ponto do tronco, que gira e achata em volta do pé do corpo. */
  const onBody = ([x, y]: Point): Point => {
    const up = (y + 16) * pose.stretch;
    return [
      x * wide * Math.cos(lean) - up * Math.sin(lean),
      -16 + pose.sink + x * wide * Math.sin(lean) + up * Math.cos(lean),
    ];
  };
  const shut = Math.max(pose.lids, blink(t, "contador", { every: [2.6, 4.4] }));
  // A lombada do livro: na mão estendida para a luz e, depois de fechado, debaixo do braço.
  const spine = mixV([62, -29 + pose.sink * 0.8 + pose.bookBob + pose.bookUp], onBody([45, -31]), pose.tucked);
  const hand: Point = [spine[0] - 4, spine[1] + 4];
  const shoulder = onBody([40, -52]);
  // A mão de cá sai de trás das costas, vai à aba do quepe e desce para o lado do corpo.
  const tip = onBody([brim - 34, -89 + pose.cap]);
  const start = mixV(onBody([-28, -44]), onBody([-53, -31]), pose.atEase);
  const out: Point = [-80, -52 + pose.sink];
  const u = pose.salute;
  const greet: Point = [
    (1 - u) ** 2 * start[0] + 2 * (1 - u) * u * out[0] + u ** 2 * tip[0],
    (1 - u) ** 2 * start[1] + 2 * (1 - u) * u * out[1] + u ** 2 * tip[1],
  ];
  const greeting = (
    <circle cx={greet[0]} cy={greet[1]} r={8} fill={C.horn} />
  );
  return (
    <g transform={`translate(${ax} ${ay}) scale(1.08)`}>
      <defs>
        <clipPath id={`${id}-body`}>
          <rect x={-48} y={-104} width={96} height={88} rx={44} />
        </clipPath>
        <clipPath id={`${id}-cap`}>
          <path d="M-38,-92 C-38,-126 38,-126 38,-92 Z" />
        </clipPath>
        {[-1, 1].map((side) => (
          <clipPath key={side} id={`${id}-eye${side}`}>
            <ellipse cx={face + side * 19.2} cy={eyeY} rx={11.5} ry={15.4} />
          </clipPath>
        ))}
      </defs>
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            d={`M${side * 18},${-20 + pose.sink} L${side * 20},${-7 - 3 * pose.tiptoe}`}
            stroke={C.navy}
            strokeWidth={13}
            strokeLinecap="round"
          />
          {/* Na ponta dos pés, o calcanhar sobe e o bico fica no chão. */}
          <ellipse
            cx={side * 20 + 6}
            cy={-5}
            rx={16}
            ry={7}
            fill={C.navy}
            transform={`rotate(${14 * pose.tiptoe} ${side * 20 + 20} 0)`}
          />
        </g>
      ))}
      {/* O braço de lá estende o livro para a luz. */}
      <path
        d={`M${shoulder[0]},${shoulder[1]} Q${(shoulder[0] + hand[0]) / 2 + 4},${(shoulder[1] + hand[1]) / 2 + 4} ${hand[0]},${hand[1] - 7}`}
        fill="none"
        stroke={K.limb}
        strokeWidth={13}
        strokeLinecap="round"
      />
      {/* O de cá fica atrás das costas até o cumprimento. */}
      <path
        d={limb(onBody([-40, -52]), greet, 30, 1)}
        fill="none"
        stroke={K.limb}
        strokeWidth={13}
        strokeLinecap="round"
      />
      {greet[0] > -50 ? greeting : null}
      <g transform={`translate(0 ${-16 + pose.sink}) rotate(${pose.lean}) scale(${wide} ${pose.stretch}) translate(0 16)`}>
        <rect x={-48} y={-104} width={96} height={88} rx={44} fill={K.body} />
        <g clipPath={`url(#${id}-body)`}>
          <path d="M-14,-112 Q2,-60 -20,-10 L-70,-10 L-70,-112 Z" fill={K.shade} />
          {/* A luz do reservatório dá a volta no corpo: uma faixa larga, que acompanha a borda. */}
          <path d="M22,-36 A31,31 0 0 0 12,-90 L30,-130 L80,-130 L80,-10 Z" fill={K.lit} />
          <path d="M40,-30 Q40.5,-76 14,-104 L70,-124 L70,-24 Z" fill={K.warm} />
        </g>
        {[-1, 1].map((side) => {
          const ex = face + side * 19.2;
          return (
            <g key={side}>
              <ellipse cx={ex} cy={eyeY} rx={11.5} ry={15.4} fill={C.eye} />
              <g clipPath={`url(#${id}-eye${side})`}>
                <circle cx={ex + pose.gaze[0]} cy={eyeY + pose.gaze[1]} r={6.2} fill={C.ink} />
                {/* A pálpebra reta de quem não tem pressa. */}
                <rect x={ex - 13} y={eyeY - 17} width={26} height={mix(11, 33, shut)} fill={K.limb} />
              </g>
              <ellipse cx={ex} cy={eyeY} rx={15.2} ry={19} fill="none" stroke={K.line} strokeWidth={3.2} />
            </g>
          );
        })}
        <path d={`M${face - 7},-44.5 L${face + 7},-44.5`} stroke={K.line} strokeWidth={4} strokeLinecap="round" />
        <path
          d={`M${face},-29 L${face - 13},-36 L${face - 13},-22 Z M${face},-29 L${face + 13},-36 L${face + 13},-22 Z`}
          fill={C.bow}
        />
        {/* O quepe, com a aba virada para onde ele olha. */}
        <g transform={`translate(0 ${pose.cap})`}>
          <path d="M-38,-92 C-38,-126 38,-126 38,-92 Z" fill={C.cap} />
          <g clipPath={`url(#${id}-cap)`}>
            <path d="M-46,-130 L-12,-130 Q-26,-108 -20,-88 L-46,-88 Z" fill={C.capShade} />
            <path d="M6,-130 Q28,-110 26,-88 L46,-88 L46,-130 Z" fill={C.capLight} />
          </g>
          <path d="M-38,-92 Q0,-86 38,-92" fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={brim} cy={-88} rx={mix(30, 39, facing)} ry={mix(5.5, 7, facing)} fill={C.navy} />
        </g>
      </g>
      {pose.open > 0.02 ? (
        // O livro aberto, com a página de lá acesa: as duas folhas se juntam quando ele fecha.
        <g transform={`translate(${spine[0]} ${spine[1]})`}>
          <path
            d={`M${-18 * pose.open - 2},${-7 * pose.open} L0,0 L${18 * pose.open + 2},${-9 * pose.open} L${18 * pose.open + 2},${-9 * pose.open + 5} L0,5 L${-18 * pose.open - 2},${-7 * pose.open + 5} Z`}
            fill={C.cover}
          />
          <path d={`M${-18 * pose.open},${-21 - 7 * pose.open} L0,-21 L0,0 L${-18 * pose.open},${-7 * pose.open} Z`} fill={C.page} />
          <path d={`M0,-21 L${18 * pose.open},${-21 - 9 * pose.open} L${18 * pose.open},${-9 * pose.open} L0,0 Z`} fill={C.pageLit} />
        </g>
      ) : (
        // Fechado: a capa, com o corte das folhas de um lado.
        <g transform={`translate(${spine[0]} ${spine[1]}) rotate(${14 * pose.tucked})`}>
          <rect x={-4 - 8 * pose.tucked} y={-24} width={8 + 14 * pose.tucked} height={29} rx={3} fill={C.cover} />
          <rect x={1 + 5 * pose.tucked} y={-21} width={3} height={23} rx={1.5} fill={C.page} />
        </g>
      )}
      <circle cx={hand[0]} cy={hand[1]} r={8} fill={C.horn} />
      {greet[0] > -50 ? null : greeting}
    </g>
  );
};
