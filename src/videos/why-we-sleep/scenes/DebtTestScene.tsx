import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Antelope } from "../../../art/Antelope";
import { FlatStage, Stay, useStage } from "../../../components/Cast";
import { Grain } from "../../../components/Grain";
import { blink, breath, wave } from "../../../components/Idle";
import { Place } from "../../../components/Place";
import { popScale } from "../../../components/Pop";
import { SvgLayer } from "../../../components/SvgLayer";
import { cue, linear, mix, ramp, clamp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { antelope, idea, ink, stopwatch } from "../palette";
import { IdeaBackdrop, IdeaShadow } from "../parts/IdeaBackdrop";
import { Glove } from "../parts/Laboratory";
import { billHeight, BILL_LINES, SleepBill } from "../parts/SleepBill";
import { billSway } from "./SkipANightScene";
import {
  Drift,
  driftZoom,
  Grow,
  placedAt,
  TABLE_BILL,
  undrifted,
} from "./SleepDebtScene";

type BillSpot = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
};

// O papel fica centrado na altura do quadro, já contando a linha do quadrado que ele ganha.
const FORM: BillSpot = {
  x: 960,
  y: 540 - (billHeight(BILL_LINES, 1) * 1.38) / 2 + 16,
  scale: 1.38,
};
// A câmera do plano (decisão do usuário): recua quando a prancheta cresce. A
// escala aprovada não muda: o plano abre este tanto mais perto da conta e a
// câmera recua, com peso, até o quadro composto enquanto a ficha se monta.
// Depois continua a deriva lenta dos planos de fundo liso, que termina nele.
const PULL_BACK = { closer: 0.1, seconds: 0.9, drift: 0.02 };
const FORM_FOCUS = [960, 540] as const;
/** A aproximação do plano da ficha num quadro dele: perto, o recuo na deixa, e a deriva até 1. */
const formZoom = (
  frame: number,
  length: number,
  formAt: number,
  fps: number,
): number =>
  (1 + PULL_BACK.closer * (1 - ramp(frame, formAt, PULL_BACK.seconds * fps))) *
  driftZoom(frame, length, PULL_BACK.drift);
// A conta chega de fora do plano (do lado da mesa do café): o lugar de partida
// é desfeito da aproximação do primeiro quadro, para ela começar exatamente
// onde o plano anterior a deixou.
const FORM_OPENING = (1 + PULL_BACK.closer) * (1 - PULL_BACK.drift);
const FROM_TABLE: BillSpot = (() => {
  const [x, y] = undrifted(
    [TABLE_BILL.x, TABLE_BILL.y],
    FORM_FOCUS,
    FORM_OPENING,
  );
  return { x, y, scale: TABLE_BILL.scale / FORM_OPENING };
})();
// A mão da pesquisadora, de jaleco e luva, entra pelo canto de baixo à esquerda com a caneta
// sobre o quadrado: uma ficha sozinha não tinha quem a operasse. O canto da direita é do selo.
const HAND = { from: [-120, 1200], to: [580, 968], size: 116 } as const;
const PEN = { back: [560, 1050], grip: [668, 944], tip: [770, 846] } as const;
// Em quanto tempo a conta vai de um plano ao lugar dela no seguinte: é a "câmera" dos planos de fundo liso.
const TRAVEL_SECONDS = 0.6;

/** A conta a caminho de um lugar do quadro para outro: a posição em linha reta, a escala em progressão geométrica. */
const billBetween = (from: BillSpot, to: BillSpot, t: number): BillSpot => ({
  x: mix(from.x, to.x, t),
  y: mix(from.y, to.y, t),
  scale: from.scale * (to.scale / from.scale) ** t,
});

type ShotClock = {
  /** O quadro do vídeo em que o plano começa: o relógio do balanço da conta. */
  readonly clock: number;
};

type FormShotProps = ShotClock & {
  /** Quadros do plano em que a conta vira ficha de teste e em que o braço entra. */
  readonly formAt: number;
  readonly handAt: number;
};

/** De perto, a conta carimbada vira uma ficha de teste, com um quadrado para marcar. */
const FormShot: React.FC<FormShotProps> = ({ formAt, handAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const length = useShotLength();
  const seconds = frame / fps;
  // A conta vem de onde estava ao lado da mesa do café: é a mesma, e não sai da tela.
  const bill = billBetween(
    FROM_TABLE,
    FORM,
    ramp(frame, 0, TRAVEL_SECONDS * fps),
  );
  // O braço chega e para; sai pelo caminho por onde veio, antes de o plano seguinte chegar.
  const reached =
    interpolate(frame, [handAt, handAt + 0.6 * fps], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }) *
    (1 - stage.leave());
  // Parada, a caneta paira sobre o quadrado.
  const hover = 5 * wave(seconds, 2.6);

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.5, 0.5]} />}>
        <Drift focus={FORM_FOCUS} zoom={formZoom(frame, length, formAt, fps)}>
          {/* A ficha continua no plano seguinte: quando ele chega, é ele quem a desenha. */}
          {stage.handedOver ? null : (
            <Stay>
              <Place
                x={0}
                y={0}
                style={{
                  translate: placedAt(bill.x, bill.y),
                  transformOrigin: "50% 0",
                  // O papel, pendurado pelo alto, balança de leve enquanto ninguém mexe nele.
                  rotate: `${billSway((clock + frame) / fps)}deg`,
                }}
              >
                <SleepBill
                  scale={bill.scale}
                  stamp={1}
                  // O papel cresce para caber a linha do quadrado, e as peças da ficha
                  // entram uma a uma, com forma: a prancheta, o prendedor, o quadrado.
                  form={ramp(frame, formAt, 0.5 * fps)}
                  formIn={linear(frame, formAt, 0.7 * fps)}
                />
              </Place>
            </Stay>
          )}
          <Stay>
            <AbsoluteFill
              style={{
                translate: `${(reached - 1) * 520 + hover}px ${(1 - reached) * 320 - hover}px`,
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
          </Stay>
        </Drift>
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

// A tela dividida: à esquerda, só parado; à direita, dormindo de verdade.
const HALF = 960;
const DIVIDER = 14;
const ANIMAL = { y: 950, width: 470 };
const STILL = { x: 380 };
const SLEEPER = { x: 1330 };
/** Onde a ficha fica na metade de quem dorme: `debt-returns` a recebe daqui. */
export const SIDE_BILL: BillSpot = { x: 1690, y: 130, scale: 0.8 };
const VACANT = { x: 740 };
// Quanto cada metade fica apagada antes de a fala chegar a ela, e em quanto
// tempo acende: é mudança de cenário (meia tela), e leva 1 s, desacelerando.
// Em 0,4 s, com a curva de peso, quase tudo mudava em quatro quadros.
const DIMMED = 0.42;
const LIGHT_SECONDS = 1;

/** Quanto uma metade já acendeu, de 0 a 1: começa logo e desacelera ao chegar. */
const lighting = (frame: number, at: number, frames: number): number =>
  interpolate(frame, [at, at + frames], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
// Cada metade deriva para o bicho dela.
const STILL_FOCUS = [480, 720] as const;
const SLEEPER_FOCUS = [1440, 720] as const;
// Quem dorme cresce do chão enquanto a tela se divide.
const SLEEPER_AT_FRAMES = 5;

type SplitShotProps = ShotClock & {
  /** Quadros do plano em que a ficha ganha o visto e em que a metade de quem só está parado acende. */
  readonly checkAt: number;
  readonly stillAt: number;
};

/**
 * Dormindo, com a conta "cobrado", que ganha um visto; só parado de olho
 * aberto, sem conta nenhuma. Os dois lados estão na tela desde que ela se
 * divide, apagados, e cada um acende na fala dele.
 */
const SplitShot: React.FC<SplitShotProps> = ({ checkAt, stillAt, clock }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useStage();
  const seconds = frame / fps;
  const travel = TRAVEL_SECONDS * fps;
  // O recuo: a ficha vai para o canto dela enquanto a metade lilás entra pela
  // esquerda, como uma porta de correr, já com o bicho parado e o lugar vazio
  // da conta. No fim do plano ela sai por onde entrou, e a tela volta a ter um
  // fundo só antes de o plano seguinte chegar.
  const apart = ramp(frame, 0, travel);
  const edge = HALF * apart * (1 - stage.leave());
  const slide = edge - HALF;
  const bill = billBetween(FORM, SIDE_BILL, apart);
  const lightFrames = LIGHT_SECONDS * fps;
  // Quem dorme acende assim que a tela assenta, na primeira fala; o outro lado, só na dele.
  // O plano anterior era todo aceso: a metade de quem dorme escurece junto com o recuo, sem salto.
  const sleeperDim = ramp(frame, 0, 0.3 * fps);
  const sleeperLit = lighting(frame, travel - 2, lightFrames);
  const stillLit = lighting(frame, stillAt, lightFrames);
  // Ao acender, quem só está parado reage: a orelha dá uma sacudida, e o lugar vazio da conta pulsa uma vez.
  const noticed = interpolate(
    frame,
    [stillAt + 4, stillAt + 7, stillAt + 11, stillAt + 14, stillAt + 20],
    [0, -0.5, 0, -0.3, 0],
    clamp,
  );
  const outlineAt = stillAt + 0.3 * fps;

  return (
    <AbsoluteFill>
      <FlatStage backdrop={<IdeaBackdrop hue="mint" spot={[0.72, 0.6]} />}>
        {/* Dormindo de verdade: deitado, de olho fechado, com a conta cobrada. */}
        <Stay only="entering">
          <Drift focus={SLEEPER_FOCUS}>
            <Place x={SLEEPER.x} y={ANIMAL.y + 4}>
              <Grow at={SLEEPER_AT_FRAMES}>
                <svg width={400} height={48} viewBox="-200 -24 400 48">
                  <IdeaShadow hue="mint" x={0} y={0} width={400} />
                </svg>
              </Grow>
            </Place>
            <Place
              x={SLEEPER.x}
              y={ANIMAL.y}
              anchor="bottom"
              style={{
                // O flanco sobe e desce devagar, e fundo: é ele que diz "dormindo".
                scale: `-1 ${breath(seconds, "asleep", { amplitude: 0.045, period: 4.2 })}`,
              }}
            >
              <Grow at={SLEEPER_AT_FRAMES} origin="bottom">
                <Antelope
                  width={ANIMAL.width}
                  colors={antelope}
                  rest={1}
                  droop={1}
                  lid={1}
                  // A orelha caída ainda se mexe de vez em quando, e a cabeça acompanha a respiração.
                  ear={0.15 + 0.2 * Math.max(0, wave(seconds, 2.9, 0.3)) ** 6}
                  turn={1.5 * wave(seconds, 4.2, 0.1)}
                />
              </Grow>
            </Place>
          </Drift>
        </Stay>
        {/* Apagada até a tela assentar. */}
        <AbsoluteFill
          style={{
            clipPath: `inset(0 0 0 ${edge}px)`,
            backgroundColor: idea.mint.contact,
            opacity: DIMMED * sleeperDim * (1 - sleeperLit),
          }}
        />

        {/* Só parado: em pé, de olho aberto. No lugar da conta, o contorno vazio. Tudo vem e vai com a metade lilás. */}
        <AbsoluteFill style={{ clipPath: `inset(0 ${1920 - edge}px 0 0)` }}>
          <IdeaBackdrop hue="lilac" spot={[0.22, 0.6]} />
          <Stay>
            <AbsoluteFill style={{ translate: `${slide}px 0` }}>
              <Drift focus={STILL_FOCUS}>
                <SvgLayer>
                  <IdeaShadow
                    hue="lilac"
                    x={STILL.x}
                    y={ANIMAL.y + 4}
                    width={380}
                  />
                </SvgLayer>
                <Place
                  x={STILL.x}
                  y={ANIMAL.y}
                  anchor="bottom"
                  style={{
                    scale: `-1 ${breath(seconds, "still", { amplitude: 0.022, period: 3.1 })}`,
                    // O peso troca de pé, devagar.
                    rotate: `${0.8 * wave(seconds, 5.3, 0.2)}deg`,
                  }}
                >
                  <Antelope
                    width={ANIMAL.width}
                    colors={antelope}
                    lid={blink(seconds, "still", { every: [1.4, 3] })}
                    look={[-0.4 + 0.5 * wave(seconds, 3.1), 0]}
                    ear={
                      1 - 0.35 * Math.max(0, wave(seconds, 2.3)) ** 2 + noticed
                    }
                    turn={5 * wave(seconds, 4.3)}
                  />
                </Place>
                <Place
                  x={VACANT.x}
                  y={SIDE_BILL.y}
                  style={{
                    translate: "-50% 0",
                    scale: `${frame < outlineAt ? 1 : popScale(frame, outlineAt, 0.4 * fps, 1, 1.1)}`,
                  }}
                >
                  <SleepBill
                    scale={SIDE_BILL.scale}
                    form={1}
                    vacant
                    vacantColor={idea.lilac.contact}
                    // O tracejado anda devagar em volta do lugar vazio.
                    vacantDash={18 * seconds}
                  />
                </Place>
              </Drift>
            </AbsoluteFill>
          </Stay>
          {/* Apagada até a fala chegar a ela. */}
          <AbsoluteFill
            style={{
              backgroundColor: idea.lilac.contact,
              opacity: DIMMED * (1 - stillLit),
            }}
          />
        </AbsoluteFill>
        <Stay>
          <SvgLayer>
            <rect
              x={mix(-DIVIDER, HALF - DIVIDER / 2, edge / HALF)}
              y={0}
              width={DIVIDER}
              height={1080}
              fill={ink.ring}
            />
          </SvgLayer>
        </Stay>
        {/* A ficha veio do plano anterior e segue para o seguinte: não entra nem sai. */}
        {stage.handedOver ? null : (
          <Stay>
            <Place
              x={0}
              y={0}
              style={{
                translate: placedAt(bill.x, bill.y),
                transformOrigin: "50% 0",
                rotate: `${billSway((clock + frame) / fps)}deg`,
              }}
            >
              <SleepBill
                scale={bill.scale}
                stamp={1}
                form={1}
                checked={ramp(frame, checkAt, 0.3 * fps)}
              />
            </Place>
          </Stay>
        )}
        <Grain />
      </FlatStage>
    </AbsoluteFill>
  );
};

export const DebtTestScene: React.FC<SceneProps> = ({ scene, shots }) => (
  <>
    <Shot range={shots[0]} name="a conta vira ficha de teste">
      <FormShot
        formAt={cue(scene, "cobrança")}
        handAt={cue(scene, "testes")}
        clock={scene.from}
      />
    </Shot>
    <Shot range={shots[1]} name="dormindo de verdade, ou só parado">
      <SplitShot
        checkAt={cue(scene, "sinal") - shots[1].from}
        stillAt={cue(scene, "dormindo") - shots[1].from}
        clock={scene.from + shots[1].from}
      />
    </Shot>
  </>
);
