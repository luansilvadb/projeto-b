import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { bones, mixPose, type VigiliaPose } from "../../../art/Vigilia";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop, popOpacity, popScale } from "../../../components/Pop";
import { cue, drop, linear, mix, ramp, settle, shake } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { earth, explorer, home, ice, ink } from "../palette";
import { BRACED, CUP, Explorer, LOOK_UP, Mug, STAND, STARTLED } from "../parts/Actor";
import { Gauge } from "../parts/Gauge";
import { Globe, LatitudeRing } from "../parts/Globe";
import { Arrow, Frame, IceBackdrop, Push, SpaceBackdrop, Svg, SvgText, Tag } from "../parts/kit";

// A mesma Terra e os mesmos três círculos de `by-latitude`.
const EARTH = { cx: 960, cy: 540, r: 340 } as const;
const HOME_LAT = -23.5;
// As latitudes das setas do arremesso, do equador para o polo, e o tamanho da do equador.
const FLINGS = [0, HOME_LAT, 30, 48, 63, 76] as const;
const FLING_LENGTH = 290;

/** A Terra parada, com os três círculos: as setas do arremesso encolhem do equador ao polo, até sumir. */
const ShrinkingFlings: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = (to - from) / FLINGS.length;
  return (
    <Frame backdrop={<SpaceBackdrop light={[0.1, 0.1]} />}>
      <Push focus={[1100, 420]} to={1.06}>
        <Svg>
          <Globe {...EARTH} spin={0.08} />
          <LatitudeRing {...EARTH} lat={0} color={ink.accent} />
          <LatitudeRing {...EARTH} lat={HOME_LAT} color={earth.waterLight} />
          {FLINGS.map((lat, index) => {
            const turn = (lat * Math.PI) / 180;
            const x = EARTH.cx + EARTH.r * Math.cos(turn) + 18;
            const y = EARTH.cy - EARTH.r * Math.sin(turn);
            return (
              <Arrow
                key={lat}
                from={[x, y]}
                to={[x + FLING_LENGTH * Math.cos(turn), y]}
                color={lat === 0 ? ink.accent : lat === HOME_LAT ? earth.waterLight : ink.paper}
                width={12}
                drawn={settle(frame, from + index * step, 0.35 * fps)}
              />
            );
          })}
          {/* No polo não há seta: só o ponto, que pisca quando a fila chega nele. */}
          <circle
            cx={EARTH.cx}
            cy={EARTH.cy - EARTH.r}
            r={14 * popScale(frame, to, 0.4 * fps, 1, 1.7)}
            fill={ink.paper}
          />
        </Svg>
      </Push>
    </Frame>
  );
};

// O lugar do Explorador no gelo, o mesmo nos dois planos: onde ele pisa, o
// tamanho dele, e o poste da placa, que fica ao alcance do braço.
const SPOT = { x: 640, y: 900, scale: 3, post: 62 } as const;
const POST_X = SPOT.x + SPOT.post * SPOT.scale;
const PRINTS = [1210, 1380, 1560, 1740] as const;

/** O poste da placa: à parte, porque no número mudo ele passa na frente de quem o abraça. */
const PolePost: React.FC<{ readonly tilt?: number; readonly height?: number }> = ({
  tilt = 0,
  height = 604,
}) => (
  <rect
    x={POST_X - 13}
    y={SPOT.y + 4 - height}
    width={26}
    height={height}
    rx={8}
    fill={ice.signPost}
    transform={`rotate(${tilt} ${POST_X} ${SPOT.y})`}
  />
);

/** A placa do polo: o poste e a tábua coral, que aponta para leste. `tilt` é quanto ela treme, em graus. */
const PoleSign: React.FC<{ readonly tilt?: number }> = ({ tilt = 0 }) => (
  <g>
    <ellipse cx={POST_X} cy={SPOT.y + 4} rx={54} ry={10} fill={ice.shadow} opacity={0.5} />
    <PolePost tilt={tilt} />
    <g transform={`rotate(${tilt} ${POST_X} ${SPOT.y})`}>
      <path
        d={`M${POST_X - 190},${SPOT.y - 590} L${POST_X + 210},${SPOT.y - 590} L${POST_X + 270},${SPOT.y - 530} L${POST_X + 210},${SPOT.y - 470} L${POST_X - 190},${SPOT.y - 470} Z`}
        fill={ice.sign}
        strokeLinejoin="round"
      />
      <SvgText x={POST_X + 20} y={SPOT.y - 530} size="note">
        polo, 10 km
      </SvgText>
    </g>
  </g>
);

/** As pegadas de quem chegou andando: a distância entre duas é um passo. */
const Prints: React.FC = () => (
  <g fill={ice.shadow}>
    {PRINTS.map((x, index) => (
      <ellipse
        key={x}
        cx={x}
        cy={SPOT.y + 20 + (index % 2) * 22}
        rx={34}
        ry={13}
        opacity={0.9 - index * 0.14}
      />
    ))}
  </g>
);

/** O Explorador no gelo, ao lado da placa; o velocímetro quase não sai do zero, e a pegada dá o passo. */
const TenKilometres: React.FC<{ readonly speedAt: number; readonly stepAt: number }> = ({
  speedAt,
  stepAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const lid = Math.max(CUP.nearLid, blink(seconds, "explorer"));
  const calm: VigiliaPose = { ...CUP, stretch: breath(seconds, "explorer"), nearLid: lid, farLid: lid };
  // Ele confere o velocímetro e, depois, a própria pegada.
  const up = ramp(frame, speedAt, 0.4 * fps) - ramp(frame, stepAt - 0.2 * fps, 0.3 * fps);
  const down = ramp(frame, stepAt, 0.4 * fps);
  const pose = mixPose(
    mixPose(calm, { ...LOOK_UP, gaze: [0.9, -0.5] }, up),
    { ...CUP, turn: 0.9, nod: 0.5, gaze: [0.8, 0.8], nearLid: 0.3, farLid: 0.3 },
    down,
  );
  return (
    <Frame backdrop={<IceBackdrop />}>
      <Push focus={[900, 620]}>
        <Svg>
          <Prints />
          {/* A medida do passo, entre duas pegadas. */}
          <path
            d={`M${PRINTS[0]},${SPOT.y + 70} v24 H${PRINTS[1]} v-24`}
            fill="none"
            stroke={ink.dark}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={popOpacity(frame, stepAt, 0.3 * fps)}
          />
          <PoleSign />
          <Explorer {...SPOT} pose={pose} shadow={ice.shadow} held={<Mug />} />
          <g
            transform={`translate(1500 380) scale(${popScale(frame, speedAt, 0.3 * fps)})`}
            opacity={popOpacity(frame, speedAt, 0.3 * fps)}
          >
            {/* O ponteiro mal sai do zero. */}
            <Gauge x={0} y={0} r={112} value={0.03 * settle(frame, speedAt + 0.3 * fps, 0.5 * fps)} label="" />
          </g>
        </Svg>
      </Push>
      <Place x={1500} y={612}>
        <Pop at={speedAt + 0.3 * fps}>
          <Tag on="light">menos de 3 km/h</Tag>
        </Pop>
      </Place>
    </Frame>
  );
};

// As poses do número mudo, no espaço da pose dele (o poste fica em x = SPOT.post).
// O preparo: ele nota, finca os pés, abraça a placa e fecha os olhos.
const ALERT: VigiliaPose = { ...STARTLED, nearHand: [-36, -52], turn: 0.7 };
const PLANTED: VigiliaPose = {
  ...ALERT,
  hip: [0, -20],
  stretch: 0.9,
  lean: -6,
  nearAnkle: BRACED.nearAnkle,
  farAnkle: BRACED.farAnkle,
  nearBrow: [0.4, 2],
  farBrow: [0.4, 3],
  mouth: [14, 0.4, 0],
  grit: 1,
};
// O abraço: o corpo colado no poste, que passa na frente dele, rente ao rosto; o
// braço de cá dá a volta pela frente, e o de lá sai do outro lado, com a caneca.
const HUGGING: VigiliaPose = {
  ...PLANTED,
  hip: [SPOT.post - 44, -20],
  lean: 3,
  faceSize: 1.05,
  nearAnkle: [-8, -6.2],
  farAnkle: [42, -6.2],
  nearHand: [SPOT.post + 4, -42],
  nearElbow: 1,
  farHand: [SPOT.post + 20, -60],
  gaze: [0.7, 0.1],
};
const SHUT: VigiliaPose = {
  ...HUGGING,
  faceSize: 1,
  pupil: 1,
  nearLid: 1,
  farLid: 1,
  squint: 0.7,
  nearBrow: BRACED.nearBrow,
  farBrow: BRACED.farBrow,
  mouth: BRACED.mouth,
};
// O que chega: um passo. O pé de lá avança, o corpo vai atrás, e os olhos continuam fechados.
const STEP: VigiliaPose = {
  ...SHUT,
  hip: [SPOT.post - 28, -23],
  lean: 15,
  stretch: 0.97,
  nearAnkle: [0, -8],
  nearFoot: 18,
  farAnkle: [66, -6.2],
  farHand: [SPOT.post + 32, -56],
  mouth: [13, 0.7, 0],
};
// Confere se acabou: primeiro um olho, depois o outro.
const ONE_OPEN: VigiliaPose = {
  ...SHUT,
  nearLid: 0.05,
  squint: 0,
  grit: 0,
  pupil: 0.85,
  gaze: [0.75, -0.1],
  nearBrow: [-0.4, 7],
  farBrow: [0.2, 0],
  mouth: [9, 0, -0.2],
};
const BOTH_OPEN: VigiliaPose = {
  ...ONE_OPEN,
  farLid: 0.05,
  pupil: 1,
  gaze: [-0.5, 0.1],
  farBrow: [-0.4, 7],
  mouth: [9, 0.2, 0],
};
// Solto, ele fica de frente para a câmera: é o que deixa a virada do fim se ver.
const FREE: VigiliaPose = {
  ...STAND,
  turn: 0.1,
  gaze: [0, 0.1],
  hip: [6, -26],
  nearAnkle: [-6, -6.2],
  farAnkle: [24, -6.2],
  farHand: [60, -52],
  nearHand: [-44, -24],
  nearLid: 0.05,
  farLid: 0.05,
  mouth: [9, 0.15, 0.2],
};
// Esfrega o casaco: olha para a barriga, e a mão vai e volta de WIPE_FROM a WIPE_TO.
const WIPE_FROM = [-12, -52] as const;
const WIPE_TO = [22, -28] as const;
const WIPING: VigiliaPose = {
  ...FREE,
  lean: -4,
  nod: 0.6,
  gaze: [0.2, 0.9],
  nearLid: 0.35,
  farLid: 0.35,
  nearHand: WIPE_FROM,
  nearElbow: -1,
  farHand: [66, -62],
  mouth: [9, 0, -0.1],
};
// O fim: de perfil para o horizonte, a caneca parada no ar.
const FAR: VigiliaPose = {
  ...FREE,
  // Além do perfil do desenho: o rosto e os dois braços vão para o lado do horizonte.
  turn: 1.35,
  hip: [-2, -26],
  nearAnkle: [-12, -6.2],
  farAnkle: [18, -6.2],
  lean: 4,
  nod: -0.1,
  gaze: [1, 0],
  nearLid: 0,
  farLid: 0,
  nearBrow: [-0.2, 3],
  farBrow: [-0.2, 3],
  farHand: [84, -64],
  nearHand: [26, -26],
  mouth: [7, 0.12, 0],
};

// Onde o café derramado sai (a caneca no auge do passo) e onde cai na neve.
const SPILL_FROM = bones(STEP).farArm.end;
const STAIN = [SPOT.x + 400, SPOT.y + 44] as const;
// O solavanco do que está preso ao chão (a placa, as pegadas, o horizonte), quadro a quadro.
const JOLT = [-14, 9, -4] as const;
const WIPES = 3;

type MuteNumberProps = {
  /** Os quadros do preparo, na fala: nota, finca os pés, abraça a placa, fecha os olhos. */
  readonly prepare: readonly [number, number, number, number];
  /** Quantos quadros de silêncio o plano tem no fim. */
  readonly silence: number;
};

/**
 * O número mudo: ele se prepara para o pior, e o que chega é um tropeço de um
 * passo. Cada pose é segurada no tempo dela, e a passagem entre duas é curta.
 */
const MuteNumber: React.FC<MuteNumberProps> = ({ prepare, silence }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = frame / fps;
  // Os tempos do silêncio, em segundos de um silêncio de 7 s: outro tamanho estica ou encolhe todos juntos.
  const quiet = (second: number) => Math.round(length - silence + (silence * second) / 7);
  const at = {
    jolt: quiet(0.6),
    eye: quiet(1.7),
    other: quiet(2.5),
    free: quiet(3),
    wipe: quiet(3.3),
    wiped: quiet(4.3),
    turn: quiet(4.4),
    open: quiet(5),
  } as const;
  const quick = 0.2 * fps;
  const snap = 0.3 * fps;
  const keys: readonly (readonly [number, VigiliaPose, number, typeof settle])[] = [
    [prepare[0], ALERT, quick, settle],
    [prepare[1], PLANTED, quick, settle],
    [prepare[2], HUGGING, snap, ramp],
    [prepare[3], SHUT, quick, settle],
    // Os olhos abrem devagar, um de cada vez: é a única coisa que se mexe.
    [at.eye, ONE_OPEN, 0.45 * fps, ramp],
    [at.other, BOTH_OPEN, 0.35 * fps, ramp],
    [at.free, FREE, snap, ramp],
    [at.wipe, WIPING, quick, ramp],
    [at.turn, FAR, 0.5 * fps, ramp],
  ];
  const acted = keys.reduce(
    (pose, [start, next, frames, curve]) => mixPose(pose, next, curve(frame, start, frames)),
    CUP,
  );
  // O passo: vai em 5 quadros, segura 4, volta em 6. Meio segundo, e os olhos não abrem.
  const stepped = ramp(frame, at.jolt, 5) - ramp(frame, at.jolt + 9, 6);
  const posed = mixPose(acted, STEP, stepped);
  // Quem muda de lugar tira os cascos do chão, um depois do outro: ninguém desliza.
  const hop = (step: number, late: number) =>
    [prepare[2], at.free, at.turn].reduce(
      (sum, from) => sum + Math.sin(Math.PI * linear(frame, from + late * snap * 0.5, snap * 0.5)),
      0,
    ) + Math.sin(Math.PI * stepped) * step;
  // Esfrega o casaco em três vaivéns.
  const wiping = linear(frame, at.wipe + quick, at.wiped - at.wipe - quick);
  const stroke = wiping > 0 && wiping < 1 ? 0.5 - 0.5 * Math.cos(wiping * WIPES * Math.PI * 2) : 0;
  // De olhos fechados, ele treme, com os cascos e as mãos no lugar; o tranco acaba com o tremor.
  const braced = frame >= prepare[3] && frame < at.jolt;
  const tremble = braced ? Math.sin(frame * 2.4) : 0;
  const turned = ramp(frame, at.turn, 0.5 * fps);
  const pose: VigiliaPose = {
    ...posed,
    hip: [posed.hip[0] + 1.6 * tremble, posed.hip[1]],
    lean: posed.lean + 1.2 * tremble,
    // Respira o tempo todo, mais devagar no fim.
    stretch: posed.stretch * breath(seconds, "explorer", { period: mix(3, 5, turned) }),
    nearAnkle: [posed.nearAnkle[0], posed.nearAnkle[1] - 5 * hop(0, 0)],
    farAnkle: [posed.farAnkle[0], posed.farAnkle[1] - 5 * hop(1.6, 1)],
    nearHand: [
      posed.nearHand[0] + (WIPE_TO[0] - WIPE_FROM[0]) * stroke,
      posed.nearHand[1] + (WIPE_TO[1] - WIPE_FROM[1]) * stroke,
    ],
  };
  const skeleton = bones(pose);
  // O tranco: três quadros de solavanco no que está preso ao chão, e a placa ainda treme um pouco.
  const jolt = JOLT[frame - at.jolt] ?? 0;
  const rattle = shake(frame, at.jolt, 0.4 * fps, 2.2, 3);
  // O gole derramado: sai da caneca, para leste, e fica na neve.
  const spilt = drop(frame, at.jolt + 4, 0.4 * fps);
  const mugAt = [SPOT.x + (SPILL_FROM[0] + 10) * SPOT.scale, SPOT.y + (SPILL_FROM[1] - 24) * SPOT.scale] as const;
  // A câmera chega perto para o preparo se ler no rosto, e só abre, devagar, depois de ele se virar.
  const zoom =
    mix(1.04, 1.24, settle(frame, 0, 0.6 * fps)) - 0.24 * ramp(frame, at.open, length - at.open);
  const camera: React.CSSProperties = { transformOrigin: "700px 640px", scale: `${zoom}` };
  return (
    <Frame
      backdrop={
        <AbsoluteFill style={camera}>
          <AbsoluteFill style={{ translate: `${jolt}px 0px` }}>
            <IceBackdrop />
          </AbsoluteFill>
        </AbsoluteFill>
      }
    >
      <AbsoluteFill style={camera}>
        <Svg>
          <g transform={`translate(${jolt} 0)`}>
            <Prints />
            <PoleSign tilt={rattle} />
            <ellipse
              cx={STAIN[0]}
              cy={STAIN[1]}
              rx={34 * spilt}
              ry={10 * spilt}
              fill={home.coffee}
              opacity={spilt >= 1 ? 0.75 : 0}
            />
          </g>
          <Explorer {...SPOT} pose={pose} shadow={ice.shadow} />
          {/* O poste passa na frente dele: é o que faz do encosto um abraço. */}
          <g transform={`translate(${jolt} 0)`}>
            <PolePost tilt={rattle} height={460} />
          </g>
          {/* Por cima do poste, o antebraço e a mão de cá, que dão a volta nele, e a caneca. */}
          <g transform={`translate(${SPOT.x} ${SPOT.y}) scale(${SPOT.scale})`}>
            <line
              x1={skeleton.nearArm.joint[0]}
              y1={skeleton.nearArm.joint[1]}
              x2={skeleton.nearArm.end[0]}
              y2={skeleton.nearArm.end[1]}
              stroke={explorer.limb}
              strokeWidth={14.5}
              strokeLinecap="round"
            />
            <circle cx={skeleton.nearArm.end[0]} cy={skeleton.nearArm.end[1]} r={10.5} fill={explorer.hand} />
            <g transform={`translate(${skeleton.farArm.end[0]} ${skeleton.farArm.end[1]})`}>
              <Mug slosh={shake(frame, at.jolt, 0.8 * fps, 30, 2.5)} />
            </g>
          </g>
          {spilt > 0 && spilt < 1
            ? [0, 1, 2].map((index) => {
                const t = Math.min(1, spilt * (1 + index * 0.12));
                return (
                  <circle
                    key={index}
                    cx={mix(mugAt[0], STAIN[0] - 20 + index * 22, t)}
                    cy={mix(mugAt[1], STAIN[1], t * t) - 90 * Math.sin(Math.PI * t)}
                    r={11 - index * 2}
                    fill={home.coffee}
                  />
                );
              })
            : null}
        </Svg>
      </AbsoluteFill>
    </Frame>
  );
};

export const ThePoleScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o arremesso encolhe até o polo">
      <ShrinkingFlings from={cue(scene, "perto")} to={cue(scene, "devagar")} />
    </Shot>
    <Shot range={shots[1]} name="a dez quilômetros do polo">
      <TenKilometres
        speedAt={cue(scene, "devagar", 2) - shots[1].from}
        stepAt={cue(scene, "caminhando") - shots[1].from}
      />
    </Shot>
    <Shot range={shots[2]} name="número mudo: o tropeço">
      <MuteNumber
        prepare={[
          cue(scene, "parada") - shots[2].from,
          cue(scene, "tropeço") - shots[2].from,
          cue(scene, "escapa") - shots[2].from,
          cue(scene, "tranco") - shots[2].from,
        ]}
        silence={scene.holdFrames}
      />
    </Shot>
  </>
);
