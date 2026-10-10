// A Vigília: a atriz chibi da trupe, um ovo que é a personagem inteira.
//
// Cabeça e corpo são um volume só, com o rosto nele; os braços e as pernas
// são curtos e grossos, e os pés são cascos claros. O usuário a escolheu em
// 2026-10-09, entre duas variantes chibi, e tirou os chifres: "nos chibis de
// resto tá perfeito". Antes dela, um corpo de cabeça grande sobre tronco fino
// foi recusado.
//
// Como o corpo é um volume só, quem atua é ele inteiro: inclina, achata e
// estica em volta da base, sai do chão, tomba. Virada de frente (`turn` perto
// de 0), os braços saem dos dois lados e se abrem na silhueta; virada de lado,
// vêm os dois para a frente.
//
// Ela é desenhada em volta da origem de quem a usa, com y para baixo, e as
// medidas são pixels do plano aberto: de pé, tem uns 140 de altura. As mãos e
// os tornozelos são alvos, e não ângulos: o casco plantado fica plantado
// enquanto o corpo se mexe. Os ossos não esticam: o alvo além de `REACH` deixa
// a ponta antes dele. Toda chave da pose é número, para `mixPose` misturar
// duas, ou cada canal andar na própria curva. As cores vêm de quem a usa.

import { useId } from "react";
import { taperPath, type Point } from "./shapes";

export type Vec = Point;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const mix = (from: number, to: number, u: number) => from + (to - from) * u;
/** Gira um vetor, em graus, no sentido do relógio na tela. */
const spin = ([x, y]: Vec, degrees: number): Vec => {
  const cos = Math.cos(rad(degrees));
  const sin = Math.sin(rad(degrees));
  return [x * cos - y * sin, x * sin + y * cos];
};

/** As cores dela. O desenho não tem cor própria: quem a usa escolhe. */
export type VigiliaColors = {
  readonly body: string;
  /** A barriga do ovo, embaixo. */
  readonly shade: string;
  readonly limb: string;
  readonly limbFar: string;
  readonly leg: string;
  readonly legFar: string;
  readonly lid: string;
  readonly line: string;
  /** A borda de luz fria, nas costas, e a quente, no rosto. */
  readonly cold: string;
  readonly warm: string;
  readonly hand: string;
  readonly hoof: string;
  readonly hoofFar: string;
  readonly ink: string;
  readonly eye: string;
};

// ---- A pose ----

export type VigiliaPose = {
  /** Onde o corpo assenta: a base do ovo. */
  readonly hip: Vec;
  /** Quantos graus o corpo pende da vertical, positivo para a frente (o lado para onde ela olha). */
  readonly lean: number;
  /** O ovo inteiro achata e estica: 1 é o do desenho, 0,9 achata, 1,1 estica. */
  readonly stretch: number;
  /** O rosto gira dentro do ovo: positivo baixa o queixo. */
  readonly head: number;

  /** Os braços: onde a mão está, e para que lado o cotovelo dobra (1 é para baixo ou para trás). */
  readonly nearHand: Vec;
  readonly nearElbow: number;
  readonly farHand: Vec;
  readonly farElbow: number;

  /** As pernas: onde o tornozelo está; o joelho (1 é para a frente); e o casco, em graus (positivo baixa o bico). */
  readonly nearAnkle: Vec;
  readonly nearKnee: number;
  readonly nearFoot: number;
  readonly farAnkle: Vec;
  readonly farKnee: number;
  readonly farFoot: number;

  /**
   * O rosto desliza no volume: para o lado (1 é de lado, para onde ela anda, 0 é de frente
   * para a câmera) e para cima e para baixo (-1 ergue o queixo). E cresce nas
   * emoções fortes: 1 é o tamanho de sempre, 1,2 é o do susto.
   */
  readonly turn: number;
  readonly nod: number;
  readonly faceSize: number;
  /** Para onde as pupilas olham, de -1 a 1; quanto cada olho foge disso, um para cada lado (a tontura); e o tamanho delas. */
  readonly gaze: Vec;
  readonly cross: Vec;
  readonly pupil: number;
  /** A pálpebra de cima de cada olho, de 0 (aberta) a 1 (fechada), e a de baixo, que aperta os dois. */
  readonly nearLid: number;
  readonly farLid: number;
  readonly squint: number;
  /** As sobrancelhas: a inclinação (negativo levanta o meio, aflita) e quanto sobem. */
  readonly nearBrow: Vec;
  readonly farBrow: Vec;
  /** A boca: a largura; quanto abre, de 0 a 1; e a curva dela fechada, de -1 (caída) a 1 (sorriso). */
  readonly mouth: readonly [width: number, open: number, curve: number];
  /** Os dentes cerrados, de 0 a 1. */
  readonly grit: number;
};

// ---- As medidas ----

/** O casco, a partir do tornozelo: a altura dele com o pé chapado, e até onde vão o calcanhar e o bico. */
export const HOOF = { size: 0.78, ankle: 6.2, heel: 6.2, toe: 14.8 } as const;

/**
 * O ovo: 114 de altura por 96 de largura, mais cheio embaixo. Os braços e as
 * pernas têm um terço e um quarto da altura dele, e saem abaixo da boca: mais
 * alto, o braço de cá passava por cima do rosto. Com ela de frente, os braços
 * saem dos dois lados; virada de lado, vêm os dois para a frente.
 */
const BODY = {
  /** De onde sai cada membro, com ela de frente para a câmera e virada de lado. */
  armNear: [[-38, -20], [14, -13]],
  armFar: [[38, -20], [40, -24]],
  legNear: [[-15, -3], [-4, -3]],
  legFar: [[15, -4], [22, -6]],
  /** O comprimento de cada um dos dois ossos. */
  arm: 19,
  leg: 13,
  armWide: [17, 15, 14],
  legWide: [19, 17, 15],
  hand: 10.5,
} as const;

/** Até onde a mão e o tornozelo alcançam: além disso, a ponta não chega ao alvo. */
export const REACH = { arm: 2 * BODY.arm, leg: 2 * BODY.leg } as const;

// ---- O esqueleto ----

/** Um membro de dois ossos, da raiz ao alvo, com a junta saindo para o lado pedido. Os ossos não esticam. */
const reach = (root: Vec, to: Vec, bone: number, bend: number) => {
  const [dx, dy] = sub(to, root);
  const wanted = Math.hypot(dx, dy) || 1;
  const length = Math.min(wanted, 2 * bone);
  const [ux, uy] = [dx / wanted, dy / wanted];
  const out = Math.sqrt(Math.max(0, bone ** 2 - (length / 2) ** 2)) * bend;
  return {
    root,
    joint: [root[0] + (ux * length) / 2 - uy * out, root[1] + (uy * length) / 2 + ux * out] as Vec,
    end: [root[0] + ux * length, root[1] + uy * length] as Vec,
  };
};

/** Onde cada articulação está, e o meio e o raio do volume: serve a quem precisa saber onde ela pisa ou pega (a sombra, um teste). */
export const bones = (pose: VigiliaPose) => {
  const wide = 1 / Math.sqrt(pose.stretch);
  const onBody = ([x, y]: Vec): Vec => add(pose.hip, spin([x * wide, y * pose.stretch], pose.lean));
  const B = BODY;
  /** A raiz de um membro: desliza do lado do ovo para a frente dele conforme ela vira. */
  const socket = ([front, turned]: readonly (readonly number[])[]): Vec =>
    onBody([mix(front[0], turned[0], pose.turn), mix(front[1], turned[1], pose.turn)]);
  return {
    center: onBody([0, -53]),
    radius: 56,
    nearArm: reach(socket(B.armNear), pose.nearHand, B.arm, pose.nearElbow),
    farArm: reach(socket(B.armFar), pose.farHand, B.arm, pose.farElbow),
    nearLeg: reach(socket(B.legNear), pose.nearAnkle, B.leg, -pose.nearKnee),
    farLeg: reach(socket(B.legFar), pose.farAnkle, B.leg, -pose.farKnee),
  };
};

// ---- As peças do desenho ----

type LimbProps = {
  readonly limb: ReturnType<typeof reach>;
  /** A largura na raiz, na junta e na ponta. */
  readonly widths: readonly [number, number, number];
  readonly fill: string;
};

/** Um membro curto e grosso: dois tubos que afinam, de pontas redondas, arqueados para fora da dobra. */
const Limb: React.FC<LimbProps> = ({ limb: { root, joint, end }, widths, fill }) => {
  const out = sub(joint, [(root[0] + end[0]) / 2, (root[1] + end[1]) / 2]);
  const far = Math.hypot(out[0], out[1]);
  const bone = (from: Vec, to: Vec, width: number, taper: number) => {
    // Esticado, o membro é reto: o arco some junto com a dobra.
    const size = far < 0.01 ? 0 : (0.16 * Math.hypot(to[0] - from[0], to[1] - from[1]) * Math.min(1, far / 8)) / far;
    const middle: Vec = [(from[0] + to[0]) / 2 + out[0] * size, (from[1] + to[1]) / 2 + out[1] * size];
    return (
      <>
        <path d={taperPath(from, middle, to, width, taper)} fill={fill} />
        <circle cx={from[0]} cy={from[1]} r={width / 2} fill={fill} />
        <circle cx={to[0]} cy={to[1]} r={taper / 2} fill={fill} />
      </>
    );
  };
  return (
    <>
      {bone(root, joint, widths[0], widths[1])}
      {bone(joint, end, widths[1], widths[2])}
    </>
  );
};

/** O casco, em volta do tornozelo: pequeno, de calcanhar redondo e bico curto. */
const HOOF_PATH = "M-9.5,3C-9.5,-3 -5,-6.5 0,-6.5C6,-6.5 9,-3.5 14,-1.5C18,0 20.5,2 20.5,5C20.5,7 19,8 17,8L-6,8C-8.5,8 -9.5,6.5 -9.5,3Z";

type HoofProps = { readonly at: Vec; readonly angle: number; readonly fill: string };
const Hoof: React.FC<HoofProps> = ({ at, angle, fill }) => (
  <path
    d={HOOF_PATH}
    fill={fill}
    transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${HOOF.size})`}
  />
);

type EyeProps = {
  readonly id: string;
  readonly colors: VigiliaColors;
  readonly at: Vec;
  readonly size: Vec;
  /** Para que lado fica o canto de dentro do olho: 1 para a direita. */
  readonly inner: number;
  readonly lid: number;
  readonly squint: number;
  readonly slant: number;
  readonly gaze: Vec;
  readonly pupil: number;
};

/** Um olho: o branco, a pupila com o brilho e as duas pálpebras, que são formas cortando o olho. */
const Eye: React.FC<EyeProps> = ({ id, colors: P, at: [cx, cy], size: [rx, ry], inner, lid, squint, slant, gaze, pupil }) => {
  const r = 7 * pupil;
  const px = cx + Math.max(-1, Math.min(1, gaze[0])) * (rx - r - 1.2);
  const py = cy + Math.max(-1, Math.min(1, gaze[1])) * (ry - r - 1.6);
  // A borda da pálpebra de cima: reta enquanto pesa, e arqueando para baixo ao fechar.
  const edge = cy - ry + lid * 1.1 * ry;
  const sag = 0.9 * ry * lid ** 3;
  const tip = 2 * slant;
  const left = edge + (inner > 0 ? -tip : tip);
  const right = edge + (inner > 0 ? tip : -tip);
  const upper = `M${cx - rx - 1},${left}Q${cx},${edge + sag} ${cx + rx + 1},${right}`;
  // A de baixo sobe arqueada, empurrada pela bochecha.
  const floor = cy + ry - squint * 0.75 * ry;
  const lower = `M${cx - rx - 1},${floor}Q${cx},${floor - squint * 0.6 * ry} ${cx + rx + 1},${floor}`;
  // As duas se encontraram: o olho apertado fecha num arco para cima; o de quem dorme, num arco para baixo.
  const shut = edge + sag / 2 >= floor - squint * 0.3 * ry;
  return (
    <>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={P.eye} />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={r} fill={P.ink} />
        <circle cx={px - 0.36 * r} cy={py - 0.4 * r} r={0.34 * r} fill={P.eye} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={P.lid} opacity={shut ? 1 : Math.min(1, Math.max(0, (lid - 0.82) / 0.16))} />
        <path d={`${upper}L${cx + rx + 1},${cy - ry - 2}L${cx - rx - 1},${cy - ry - 2}Z`} fill={P.lid} />
        <path d={`${lower}L${cx + rx + 1},${cy + ry + 2}L${cx - rx - 1},${cy + ry + 2}Z`} fill={P.lid} />
        <path d={shut ? lower : upper} fill="none" stroke={P.line} strokeWidth={3.6} opacity={Math.min(1, lid / 0.12)} />
      </g>
    </>
  );
};

type FaceProps = { readonly id: string; readonly colors: VigiliaColors; readonly pose: VigiliaPose };

/**
 * O rosto, em volta do meio da linha dos olhos: olhos
 * grandes e baixos, sobrancelha curta, boca pequena. O esforço é olho apertado
 * e dentes cerrados, sem sobrancelha em V.
 */
const Face: React.FC<FaceProps> = ({ id, colors: P, pose }) => {
  // O olho de lá fica mais estreito quando o rosto vira: é o que diz que o volume é redondo.
  const eyes = [
    { key: "near", x: -15.5, rx: 13.5, side: 1, lid: pose.nearLid, brow: pose.nearBrow },
    { key: "far", x: 15.5, rx: 13.5 - 1.8 * Math.abs(pose.turn), side: -1, lid: pose.farLid, brow: pose.farBrow },
  ];
  const [wide, open, curve] = pose.mouth;
  const tall = Math.max(open * 12, 0.1);
  const lips = { x: 2, y: 27 };
  return (
    <>
      {eyes.map((eye) => {
        const [slant, raise] = eye.brow;
        const y = -17 - 5.5 - raise;
        const half = eye.rx * 0.78;
        return (
          <g key={eye.key}>
            <Eye
              id={`${id}-${eye.key}`}
              colors={P}
              at={[eye.x, 0]}
              size={[eye.rx, 17]}
              inner={eye.side}
              lid={eye.lid}
              squint={pose.squint}
              slant={slant}
              gaze={[pose.gaze[0] + eye.side * pose.cross[0], pose.gaze[1] + eye.side * pose.cross[1]]}
              pupil={pose.pupil}
            />
            <path
              d={`M${eye.x - eye.side * half},${y - slant * 4.5}Q${eye.x},${y - 2} ${eye.x + eye.side * half},${y + slant * 4.5}`}
              fill="none"
              stroke={P.line}
              strokeWidth={5.5}
              strokeLinecap="round"
            />
          </g>
        );
      })}
      {open < 0.1 ? (
        <path
          d={`M${lips.x - wide / 2},${lips.y - 2 * curve}Q${lips.x},${lips.y + 5 * curve} ${lips.x + wide / 2},${lips.y - 2 * curve}`}
          fill="none"
          stroke={P.line}
          strokeWidth={3.8}
          strokeLinecap="round"
        />
      ) : (
        <rect
          x={lips.x - wide / 2}
          y={lips.y - tall / 2}
          width={wide}
          height={tall}
          rx={Math.min(wide, tall) * 0.46}
          fill={pose.grit > 0.5 ? P.eye : P.line}
          stroke={P.line}
          strokeWidth={3}
        />
      )}
    </>
  );
};

type VigiliaProps = {
  readonly pose: VigiliaPose;
  /** Quanto da luz fria ainda bate nas costas dela, de 0 a 1. */
  readonly cold?: number;
  readonly colors: VigiliaColors;
};

/** O ovo, a partir da base: mais estreito em cima, mais cheio embaixo. */
const EGG = "M0,-110C27,-110 48,-80 48,-46C48,-16 31,4 0,4C-31,4 -48,-16 -48,-46C-48,-80 -27,-110 0,-110Z";

/**
 * A Vigília numa pose. De trás para a frente: a perna e o braço de lá; o
 * ovo com a barriga, as bordas de luz e o rosto; a perna e o braço de cá. O
 * ovo inteiro gira e achata em volta da base, e os membros saem dele.
 */
export const Vigilia: React.FC<VigiliaProps> = ({ pose, cold = 1, colors: P }) => {
  const id = useId();
  const b = bones(pose);
  const B = BODY;
  const wide = 1 / Math.sqrt(pose.stretch);
  return (
    <g>
      <Limb limb={b.farLeg} widths={B.legWide} fill={P.legFar} />
      <Hoof at={b.farLeg.end} angle={pose.farFoot} fill={P.hoofFar} />
      <Limb limb={b.farArm} widths={B.armWide} fill={P.limbFar} />
      <circle cx={b.farArm.end[0]} cy={b.farArm.end[1]} r={B.hand} fill={P.hand} />

      <g transform={`translate(${pose.hip[0].toFixed(1)} ${pose.hip[1].toFixed(1)}) rotate(${pose.lean.toFixed(1)}) scale(${wide.toFixed(3)} ${pose.stretch.toFixed(3)})`}>
        <defs>
          <clipPath id={`${id}-egg`}>
            <path d={EGG} />
          </clipPath>
        </defs>
        <path d={EGG} fill={P.body} />
        <g clipPath={`url(#${id}-egg)`}>
          <path d="M-60,-28Q0,2 60,-30L60,14L-60,14Z" fill={P.shade} />
          <path d="M-48,-30Q-47,-82 -14,-110.5L-62,-120L-62,-28Z" fill={P.cold} opacity={cold} />
          <path d="M35,-2Q51,-50 23,-107L64,-118L64,2Z" fill={P.warm} />
          <g transform={`translate(${(8 * pose.turn).toFixed(1)} ${(-59 + 7 * pose.nod).toFixed(1)}) rotate(${pose.head.toFixed(1)}) scale(${pose.faceSize.toFixed(3)})`}>
            <Face id={id} colors={P} pose={pose} />
          </g>
        </g>
      </g>

      <Limb limb={b.nearLeg} widths={B.legWide} fill={P.leg} />
      <Hoof at={b.nearLeg.end} angle={pose.nearFoot} fill={P.hoof} />
      <Limb limb={b.nearArm} widths={B.armWide} fill={P.limb} />
      <circle cx={b.nearArm.end[0]} cy={b.nearArm.end[1]} r={B.hand} fill={P.hand} />
    </g>
  );
};

/** A pose a caminho entre duas, com `u` de 0 a 1: cada valor anda em linha reta, e a curva é de quem chama. */
export const mixPose = <Pose extends object>(from: Pose, to: Pose, u: number): Pose =>
  // Toda chave da pose é um número ou uma lista de números: é o que deixa misturar sem conhecer cada uma,
  // e o que deixa quem usa o desenho acrescentar canais à pose dele.
  Object.fromEntries(
    (Object.keys(from) as (keyof Pose)[]).map((key) => {
      const [a, b] = [from[key], to[key]] as (number | readonly number[])[];
      return [key, typeof a === "number" ? mix(a, b as number, u) : a.map((value, index) => mix(value, (b as readonly number[])[index], u))];
    }),
  ) as Pose;
