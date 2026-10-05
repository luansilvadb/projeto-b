import { useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../../components/Grain";
import { SlowPush } from "../../../components/SlowPush";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { idea, ink, personInPajamas, street } from "../palette";
import { Bed } from "../parts/Bed";
import { Chalkboard, Researcher, type Box } from "../parts/Chalkboard";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";

// O quadro do gancho, agora com ele ao lado: o quadro encolhe para dar lugar a quem disse a frase.
const RECALL_BOARD: Box = { x: 770, y: 140, width: 1030, height: 720 };
// De perto: o carimbo no meio do quadro, com os ramos e os olhos fechados em volta.
const CLOSE_BOARD: Box = { x: -500, y: -330, width: 2100, height: 1220 };

type RecallShotProps = {
  /** Quadro do plano em que o nome dele entra. */
  readonly nameAt: number;
};

/** O quadro-negro do gancho, com a árvore de olhos fechados e o carimbo, e quem disse a frase. */
const RecallShot: React.FC<RecallShotProps> = ({ nameAt }) => (
  <SlowPush
    focus={[1100, 520]}
    backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
  >
    <Chalkboard box={RECALL_BOARD} stamp="full" />
    <SvgLayer>
      <IdeaShadow hue="peach" x={330} y={1046} width={340} />
    </SvgLayer>
    <Researcher
      x={330}
      y={1040}
      height={680}
      pointing
      nameAt={nameAt}
      nameOffset={[124, -800]}
    />
    <Grain />
  </SlowPush>
);

type StampShotProps = {
  /** Quadro do plano em que o carimbo começa a perder a cor; sem valor, ele fica inteiro. */
  readonly fadeAt?: number;
  /** O carimbo já está sem cor quando o plano começa. */
  readonly from?: number;
};

/** De perto, o carimbo "erro?" sobre a árvore; no plano seguinte, ele perde a cor e sobra a interrogação pequena. */
const StampShot: React.FC<StampShotProps> = ({ fadeAt, from = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SlowPush
      focus={[1000, 600]}
      by={0.05}
      from={1 + from}
      backdrop={<IdeaBackdrop hue="peach" spot={[0.5, 0.5]} />}
    >
      <Chalkboard
        box={CLOSE_BOARD}
        stamp="full"
        faded={fadeAt === undefined ? 0 : ramp(frame, fadeAt, 1.2 * fps)}
      />
      <Grain />
    </SlowPush>
  );
};

// A última imagem do vídeo: a cama no centro, e a janela no alto, à direita, acima do pé da cama.
const SLEEPER = { x: 960, y: 990, scale: 0.9 };
const WINDOW = { x: 1330, y: 110, width: 440, height: 380 };
// As estrelas na janela: posição em fração dela.
const STARS = [
  [0.16, 0.2],
  [0.34, 0.52],
  [0.5, 0.16],
  [0.84, 0.6],
  [0.22, 0.78],
] as const;

/** A pessoa dormindo, no centro, com a janela e a noite lá fora. Fica no silêncio depois da fala. */
const AsleepShot: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <SlowPush
      focus={[960, 620]}
      by={0.06}
      backdrop={<IdeaBackdrop hue="lilac" spot={[0.45, 0.55]} />}
    >
      <SvgLayer>
        {/* A janela: a moldura clara, o céu da noite, a lua e o parapeito. */}
        <rect
          x={WINDOW.x - 16}
          y={WINDOW.y - 16}
          width={WINDOW.width + 32}
          height={WINDOW.height + 32}
          rx={36}
          fill={ink.paper}
        />
        <rect {...WINDOW} rx={22} fill={street.night.sky[0]} />
        <rect
          x={WINDOW.x}
          y={WINDOW.y + WINDOW.height * 0.55}
          width={WINDOW.width}
          height={WINDOW.height * 0.45}
          rx={22}
          fill={street.night.sky[1]}
        />
        {STARS.map(([x, y]) => (
          <circle
            key={x}
            cx={WINDOW.x + WINDOW.width * x}
            cy={WINDOW.y + WINDOW.height * y}
            r={6}
            fill={ink.moon}
          />
        ))}
        <g
          transform={`translate(${WINDOW.x + WINDOW.width * 0.66} ${WINDOW.y + WINDOW.height * 0.34})`}
        >
          <path
            d="M14,-62 A62,62 0 1 0 62,20 A50,50 0 1 1 14,-62 Z"
            fill={ink.moon}
          />
        </g>
        <rect
          x={WINDOW.x + WINDOW.width / 2 - 7}
          y={WINDOW.y}
          width={14}
          height={WINDOW.height}
          fill={ink.paper}
        />
        <rect
          x={WINDOW.x - 40}
          y={WINDOW.y + WINDOW.height + 8}
          width={WINDOW.width + 80}
          height={30}
          rx={15}
          fill={idea.lilac.spot}
        />
      </SvgLayer>
      <Bed
        {...SLEEPER}
        colors={personInPajamas}
        hue="lilac"
        snoreAt={0.4 * fps}
      />
      <Grain />
    </SlowPush>
  );
};

export const TonightScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="o quadro-negro do gancho">
      <RecallShot nameAt={cue(scene, "Álan")} />
    </Shot>
    <Shot range={shots[1]} name="o carimbo, de perto">
      <StampShot />
    </Shot>
    <Shot range={shots[2]} name="o carimbo perde a cor">
      {/* Continua o plano anterior, no mesmo enquadramento: parte de onde ele parou. */}
      <StampShot
        from={0.05}
        fadeAt={cue(scene, "abandonado") - shots[2].from}
      />
    </Shot>
    <Shot range={shots[3]} name="um bom sono">
      <AsleepShot />
    </Shot>
  </>
);
