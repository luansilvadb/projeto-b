import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Antelope } from "../../../art/Antelope";
import { Grain } from "../../../components/Grain";
import { blink, breath } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, ramp, settle } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot } from "../../../video/Shot";
import { antelope, idea, ink, stopwatch } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Glove } from "../parts/Laboratory";
import { billHeight, BILL_LINES, SleepBill } from "../parts/SleepBill";

const FORM = { x: 960, scale: 1.38 };
// A mão da pesquisadora, de jaleco e luva, entra pelo canto de baixo à esquerda com a caneta
// sobre o quadrado: uma ficha sozinha não tinha quem a operasse. O canto da direita é do selo.
const HAND = { from: [-120, 1200], to: [580, 968], size: 116 } as const;
const PEN = { back: [560, 1050], grip: [668, 944], tip: [770, 846] } as const;

type FormShotProps = {
  /** Quadro do plano em que a conta vira ficha de teste. */
  readonly formAt: number;
};

/** De perto, a conta carimbada vira uma ficha de teste, com um quadrado para marcar. */
const FormShot: React.FC<FormShotProps> = ({ formAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const form = ramp(frame, formAt, 0.4 * fps);
  // Ela chega quando a conta já virou ficha.
  const reached = settle(frame, formAt + 0.3 * fps, 0.5 * fps);
  // O papel fica centrado na altura do quadro, já contando a linha do quadrado que ele ganha.
  const top = 540 - (billHeight(BILL_LINES, 1) * FORM.scale) / 2 + 16;

  return (
    <AbsoluteFill>
      <IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />
      <Place x={FORM.x} y={top} style={{ translate: "-50% 0" }}>
        <SleepBill scale={FORM.scale} stamp={1} form={form} />
      </Place>
      <AbsoluteFill
        style={{
          opacity: frame >= formAt + 0.3 * fps ? 1 : 0,
          translate: `${(reached - 1) * 520}px ${(1 - reached) * 320}px`,
        }}
      >
        <SvgLayer>
          {/* A caneta passa por dentro da mão fechada: a luva é desenhada por cima. */}
          <path
            d={`M${PEN.back[0]},${PEN.back[1]} L${PEN.grip[0]},${PEN.grip[1]} L${PEN.tip[0] - 18},${PEN.tip[1] + 18}`}
            fill="none"
            stroke={stopwatch.rim}
            strokeWidth={30}
            strokeLinecap="round"
          />
          <path
            d={`M${PEN.tip[0] - 30},${PEN.tip[1] + 30} L${PEN.tip[0]},${PEN.tip[1]}`}
            fill="none"
            stroke={ink.dark}
            strokeWidth={14}
            strokeLinecap="round"
          />
          <Glove from={HAND.from} to={HAND.to} size={HAND.size} />
        </SvgLayer>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

// A tela dividida: à esquerda, só parado; à direita, dormindo de verdade.
const HALF = 960;
const ANIMAL = { y: 950, width: 470 };
const SIDE_BILL = { y: 130, scale: 0.8 };

type SplitShotProps = {
  /** Quadro do plano em que a ficha da direita ganha o visto. */
  readonly checkAt: number;
};

/** Parado de olho aberto, sem conta nenhuma; dormindo, com a conta "cobrado", que ganha um visto. */
const SplitShot: React.FC<SplitShotProps> = ({ checkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${HALF}px 0 0)` }}>
        <IdeaBackdrop hue="lilac" spot={[0.22, 0.6]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${HALF}px)` }}>
        <IdeaBackdrop hue="mint" spot={[0.72, 0.6]} />
      </AbsoluteFill>
      <SvgLayer>
        <rect x={HALF - 7} y={0} width={14} height={1080} fill={ink.ring} />
        <IdeaShadow hue="lilac" x={380} y={ANIMAL.y + 4} width={380} />
        <IdeaShadow hue="mint" x={1330} y={ANIMAL.y + 4} width={400} />
      </SvgLayer>

      {/* Só parado: em pé, de olho aberto. No lugar da conta, o contorno vazio. */}
      <Place
        x={380}
        y={ANIMAL.y}
        anchor="bottom"
        style={{ scale: `-1 ${breath(seconds, "still")}` }}
      >
        <Antelope
          width={ANIMAL.width}
          colors={antelope}
          lid={blink(seconds, "still")}
          look={[-0.4, 0]}
          ear={1}
        />
      </Place>
      <Place x={740} y={SIDE_BILL.y} style={{ translate: "-50% 0" }}>
        <SleepBill
          scale={SIDE_BILL.scale}
          form={1}
          vacant
          vacantColor={idea.lilac.contact}
        />
      </Place>

      {/* Dormindo de verdade: deitado, de olho fechado, com a conta cobrada. */}
      <Place
        x={1330}
        y={ANIMAL.y}
        anchor="bottom"
        style={{
          scale: `-1 ${breath(seconds, "asleep", { amplitude: 0.02, period: 4.5 })}`,
        }}
      >
        <Antelope
          width={ANIMAL.width}
          colors={antelope}
          rest={1}
          droop={1}
          lid={1}
          ear={0.15}
        />
      </Place>
      <Place x={1690} y={SIDE_BILL.y} style={{ translate: "-50% 0" }}>
        <SleepBill
          scale={SIDE_BILL.scale}
          stamp={1}
          form={1}
          checked={settle(frame, checkAt, 0.35 * fps)}
        />
      </Place>
      <Grain />
    </AbsoluteFill>
  );
};

export const DebtTestScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a conta vira ficha de teste">
      <FormShot formAt={cue(scene, "testes")} />
    </Shot>
    <Shot range={shots[1]} name="só parado, ou dormindo de verdade">
      <SplitShot checkAt={cue(scene, "sinais") - shots[1].from} />
    </Shot>
  </>
);
