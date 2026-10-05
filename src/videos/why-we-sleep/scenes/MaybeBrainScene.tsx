import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Brain } from "../../../art/Brain";
import { Elephant } from "../../../art/Elephant";
import { Person } from "../../../art/Person";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { Pop } from "../../../components/Pop";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, drop, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import {
  brainHalves,
  chalkboard,
  elephant,
  idea,
  ink,
  lab,
  person,
  researcher,
} from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { IconRow, MapIcon, iconSpot } from "../parts/IconRow";
import { LAB, TANK_CENTER } from "../parts/Laboratory";
import { Tag } from "../parts/Tag";
import { RESEARCHER, TankShot } from "../parts/TankShot";
import { ROW_HUE } from "./FivePartsScene";

// A fila no mesmo lugar em que `debt-returns` a deixou.
const ROW = { x: 960, y: 560, scale: 1.12 };

type MapShotProps = {
  /** Quadros do plano em que a régua ganha o X e em que o contorno do cérebro acende. */
  readonly crossAt: number;
  readonly nextAt: number;
};

/** A fila volta: a régua, "1", ganha um X, e o contorno sem cérebro, "2", acende. */
const MapShot: React.FC<MapShotProps> = ({ crossAt, nextAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />
      <IconRow
        {...ROW}
        hue={ROW_HUE}
        states={{
          eyes: "check",
          ruler: frame >= crossAt ? "cross" : "on",
          brain: frame >= nextAt ? "on" : "off",
        }}
        since={{ ruler: crossAt, brain: nextAt }}
        grow={{ brain: mix(1, 1.3, ramp(frame, nextAt, 0.5 * fps)) }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// O contorno parte de onde estava na fila, já crescido, e enche o quadro.
const SPOT = iconSpot("brain", ROW);
const FULL = { x: 960, y: 540, size: 1020 };
const GROW_SECONDS = 1;

/** O contorno do cérebro cresce até encher o quadro; a fila some por trás dele. */
const GrowShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grown = ramp(frame, 3, GROW_SECONDS * fps);

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue={ROW_HUE} spot={[0.5, 0.5]} />
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, 3, 0.4 * fps) }}>
        <IconRow
          {...ROW}
          hue={ROW_HUE}
          states={{ eyes: "check", ruler: "cross" }}
          omit={["brain"]}
        />
      </AbsoluteFill>
      <Place x={mix(SPOT.x, FULL.x, grown)} y={mix(SPOT.y, FULL.y, grown)}>
        <MapIcon
          icon="brain"
          state="on"
          hue={ROW_HUE}
          // A escala cresce em proporção, para a velocidade aparente ser a mesma do começo ao fim.
          size={SPOT.size * 1.3 * (FULL.size / (SPOT.size * 1.3)) ** grown}
        />
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

const GROUND = 980;
const ELEPHANT = { x: 520, width: 800 };
const YOU = { x: 1420, height: 760 };
// Onde o cérebro fica dentro de cada cabeça, nas unidades de cada desenho, e a largura dele.
const ELEPHANT_BRAIN = { x: 92, y: -330, width: 88 };
// Na pessoa ele fica dentro do contorno da cabeça, entre o alto do cabelo e as sobrancelhas: maior, saía pelo alto e lia como chapéu.
const PERSON_BRAIN = { x: 4, y: -540, width: 104 };
const SIGN = { x: 985, y: 330, drop: 420 };

type LitBrainProps = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly at: number;
};

/** O cérebro aceso dentro de uma cabeça: o halo claro por trás e o desenho, com as dobras. */
const LitBrain: React.FC<LitBrainProps> = ({ x, y, width, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = 0.75 + 0.25 * wave(frame / fps, 1.6);

  return (
    <Place x={x} y={y}>
      <Pop at={at}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -width * 0.32,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${ink.ring}, ${ink.ring}00)`,
              opacity: glow,
            }}
          />
          <div style={{ position: "relative" }}>
            <Brain
              width={width}
              color={brainHalves.asleepShade}
              fill={brainHalves.awake}
              folds
            />
          </div>
        </div>
      </Pop>
    </Place>
  );
};

type SuspectsShotProps = {
  /** Quadros do plano em que cada cérebro acende e em que a placa desce. */
  readonly elephantAt: number;
  readonly youAt: number;
  readonly signAt: number;
};

/** A elefanta e a pessoa lado a lado, cada uma com o cérebro aceso na cabeça; a placa "culpado?" desce entre os dois. */
const SuspectsShot: React.FC<SuspectsShotProps> = ({
  elephantAt,
  youAt,
  signAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const elephantScale = ELEPHANT.width / 520;
  const youScale = YOU.height / 650;
  const hung = drop(frame, signAt, 0.35 * fps);
  const signY = SIGN.y - SIGN.drop * (1 - hung);

  return (
    <SlowPush
      focus={[960, 520]}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.42]} />}
    >
      <SvgLayer>
        <IdeaShadow
          hue="peach"
          x={ELEPHANT.x}
          y={GROUND + 6}
          width={ELEPHANT.width * 0.8}
        />
        <IdeaShadow
          hue="peach"
          x={YOU.x}
          y={GROUND + 6}
          width={YOU.height * 0.5}
        />
      </SvgLayer>
      {/* A elefanta olha para o meio do quadro: o desenho, que olha para a esquerda, é espelhado. */}
      <Place
        x={ELEPHANT.x}
        y={GROUND}
        anchor="bottom"
        style={{
          scale: `-1 ${breath(seconds, "suspect-elephant", { amplitude: 0.012, period: 4.5 })}`,
        }}
      >
        <Elephant
          width={ELEPHANT.width}
          colors={elephant}
          lid={blink(seconds, "suspect-elephant")}
          trunk={0.2}
          ear={0.4}
          look={[0.6, -0.4]}
        />
      </Place>
      <Place
        x={YOU.x}
        y={GROUND}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "you")}` }}
      >
        <Person
          height={YOU.height}
          colors={person}
          expression={frame >= signAt ? "surprised" : "curious"}
          blink={blink(seconds, "you")}
        />
      </Place>
      <LitBrain
        x={ELEPHANT.x + ELEPHANT_BRAIN.x * elephantScale}
        y={GROUND + ELEPHANT_BRAIN.y * elephantScale}
        width={ELEPHANT_BRAIN.width * elephantScale}
        at={elephantAt}
      />
      <LitBrain
        x={YOU.x + PERSON_BRAIN.x * youScale}
        y={GROUND + PERSON_BRAIN.y * youScale}
        width={PERSON_BRAIN.width * youScale}
        at={youAt}
      />
      {/* A placa desce do alto, pendurada por dois fios, e fica torta como toda placa pendurada. */}
      {frame >= signAt ? (
        <>
          <SvgLayer>
            <path
              d={`M${SIGN.x - 150},-20 L${SIGN.x - 150},${signY - 30} M${SIGN.x + 150},-20 L${SIGN.x + 150},${signY - 44}`}
              stroke={idea.peach.contact}
              strokeWidth={8}
              strokeLinecap="round"
            />
          </SvgLayer>
          <Place x={SIGN.x} y={signY} style={{ rotate: "-3deg" }}>
            <div
              style={{
                border: `8px solid ${chalkboard.stamp}`,
                borderRadius: 999,
              }}
            >
              <Tag size="label" on="peach">
                culpado?
              </Tag>
            </div>
          </Place>
        </>
      ) : null}
      <Grain />
    </SlowPush>
  );
};

// O contorno vazio dentro do tanque: o lugar do cérebro do bicho que ela vai buscar.
const CONTOUR = { x: TANK_CENTER, y: 560, width: 430 };

/** A rede de pesca no ombro, nas unidades do desenho da pessoa: o cabo, o aro e a malha. */
const Net: React.FC = () => (
  <g>
    <path
      d="M-84,-170 L-196,-640"
      stroke={chalkboard.frame}
      strokeWidth={16}
      strokeLinecap="round"
    />
    <g transform="translate(-212 -700) rotate(-14)">
      <path
        d="M-78,0 C-70,96 -30,150 0,154 C30,150 70,96 78,0 Z"
        fill={lab.glass}
        opacity={0.7}
      />
      <path
        d="M-52,10 L-24,138 M0,10 L0,150 M52,10 L24,138 M-74,50 L74,50 M-56,100 L56,100"
        fill="none"
        stroke={lab.platformShade}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <ellipse rx={84} ry={22} fill="none" stroke={lab.clip} strokeWidth={14} />
    </g>
  </g>
);

/** A pesquisadora, de rede de pesca no ombro, aponta para o contorno vazio: foi testado. */
const ResearcherShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <TankShot camera={LAB.medium} hour="day">
        <Place
          x={CONTOUR.x}
          y={CONTOUR.y + 8 * wave(seconds, 3)}
          style={{ rotate: "-5deg" }}
        >
          <Brain width={CONTOUR.width} color={ink.ring} dashed folds />
        </Place>
      </TankShot>
      {/* Ela fica na frente da bancada, grande: é quem age neste plano. */}
      <Place
        x={RESEARCHER.x + 40}
        y={1150}
        anchor="bottom"
        style={{ scale: `1 ${breath(seconds, "researcher")}` }}
      >
        <Person
          height={900}
          colors={researcher}
          bun
          plainFace
          frontArm={{ hand: [-100, -236], bend: 30 }}
          backArm={{ hand: [236, -372], bend: -26 }}
          held={<Net />}
        />
      </Place>
    </AbsoluteFill>
  );
};

export const MaybeBrainScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const crossAt = cue(scene, "primeiro");
  return (
    <>
      <Shot range={shots[0]} name="a régua ganha um X; o contorno acende">
        <MapShot
          crossAt={crossAt}
          // O contorno acende ainda neste plano, com folga: no seguinte ele já cresce.
          nextAt={Math.min(cue(scene, "limite"), shots[0].to - 0.5 * fps)}
        />
      </Shot>
      <Shot range={shots[1]} name="o contorno enche o quadro">
        <GrowShot />
      </Shot>
      <Shot range={shots[2]} name="o cérebro é o culpado?">
        <SuspectsShot
          elephantAt={4}
          youAt={cue(scene, "você") - shots[2].from}
          signAt={cue(scene, "pode") - shots[2].from}
        />
      </Shot>
      <Shot range={shots[3]} name="a pesquisadora aponta para o contorno vazio">
        <ResearcherShot />
      </Shot>
    </>
  );
};
