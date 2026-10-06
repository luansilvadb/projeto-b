import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brain } from "../../../art/Brain";
import {
  Build,
  cameraBetween,
  framing,
  useBuild,
} from "../../../components/Camera";
import { Stay } from "../../../components/Cast";
import { wave } from "../../../components/Idle";
import { Label } from "../../../components/Label";
import { Place } from "../../../components/Place";
import { cue, drop, mix, ramp } from "../../../components/timing";
import type { SceneProps } from "../../../video/NarratedVideo";
import { Shot, useShotLength } from "../../../video/Shot";
import { leaveProgress, SCENERY_EXIT_FRAMES } from "../../../video/stage";
import { ink } from "../palette";
import { AnswerIcon } from "../parts/AnswerIcon";
import { JELLYFISH_SPOT } from "../parts/Lagoon";
import { LagoonShot } from "../parts/LagoonShot";
import { PULSES_ASLEEP, steady } from "../parts/pulse";
import {
  FRONT,
  FRONT_OPENING,
  FRONT_WIDE,
  ShopFront,
} from "../parts/ShopFront";
import { Prelude, Sooner, flash, shake } from "./MaybeBrainScene";
import { LIT_LEAD, WhatItIsOpening } from "./WhatItIsScene";
import { Grow } from "./SleepDebtScene";

// A aproximação lenta do plano da loja: 5% mais perto da porta, no fim.
const DOOR = [
  FRONT.x,
  FRONT_OPENING.y + FRONT_OPENING.height / 2 - 10,
] as const;
const FRONT_END = framing(DOOR, 1.05, DOOR);
// A interrogação balança na deixa: quantos graus, quantas idas e voltas, em quantos segundos.
const SWAY = { degrees: 16, turns: 2.5, seconds: 1.3 };

/**
 * A rua da loja começa a subir antes de o plano chegar: `lead` quadros antes,
 * sob o trio que ainda encolhe, para a troca não deixar a tela só com o fundo.
 * Quem desenha esses quadros é o plano anterior, com `ShopPrelude`.
 */
export const SHOP_RISE = { lead: 16, frames: 26 };

/** Quanto da rua já subiu, de 0 a 1, no quadro `at` do plano da loja (negativo antes de ele chegar). */
const shopRisen = (at: number): number =>
  interpolate(
    at,
    [-SHOP_RISE.lead, SHOP_RISE.frames - SHOP_RISE.lead],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

// A deixa de quem ainda não tem deixa: um quadro que não chega.
const NOT_YET = 1e6;

type AskingShopProps = {
  /** O quadro do plano da loja que se desenha: negativo enquanto ela ainda sobe, no fim do plano anterior. */
  readonly at: number;
  /** A duração do plano da loja; sem valor, a câmera ainda não partiu. */
  readonly length?: number;
  /** Quadro do plano em que a interrogação balança. */
  readonly swayAt?: number;
  /** Quanto a rua já desceu para sair, de 0 a 1. */
  readonly left?: number;
  /** O quadro do vídeo em que começa o plano que desenha isto: o relógio da rua. */
  readonly clock: number;
};

/** A loja por fora, de porta baixada e luz acesa lá dentro, ainda com a interrogação, que balança. */
const AskingShop: React.FC<AskingShopProps> = ({
  at,
  length,
  swayAt = NOT_YET,
  left = 0,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const built = useBuild();
  const seconds = (clock + frame) / fps;
  const risen = shopRisen(at);
  return (
    // A subida da rua é contada daqui, e não do palco: ela começa antes de o plano chegar.
    <Build {...built} lit={risen} risen={risen * (1 - left)}>
      <ShopFront
        time="night"
        shutter={1}
        busy
        clock={clock}
        camera={cameraBetween(
          FRONT_WIDE,
          FRONT_END,
          length === undefined ? 0 : at / length,
        )}
      >
        <Place
          x={DOOR[0]}
          y={DOOR[1]}
          style={{
            // Presa pelo pé, como uma placa: balança em volta do ponto, cresce um nada na deixa, e não para de todo.
            transformOrigin: "50% 85%",
            rotate: `${shake(at, swayAt, SWAY.seconds * fps, SWAY.degrees, SWAY.turns) + 2.5 * wave(seconds, 3.4)}deg`,
            scale: `${1 + 0.18 * flash(at, swayAt, 12)}`,
          }}
        >
          <Label size="display" color={ink.moon}>
            ?
          </Label>
        </Place>
      </ShopFront>
    </Build>
  );
};

type ShopPreludeProps = {
  /** Quantos quadros faltam para o plano da loja começar. */
  readonly until: number;
  /** O quadro do vídeo em que começa o plano que desenha isto. */
  readonly clock: number;
};

/**
 * Os primeiros quadros da subida da rua da loja, para o plano anterior
 * desenhar por baixo do que ele ainda tem na tela: é o mesmo cenário, na mesma
 * câmera e no mesmo ponto da subida em que o plano da loja o assume.
 */
export const ShopPrelude: React.FC<ShopPreludeProps> = ({ until, clock }) => (
  <AskingShop at={-until} clock={clock} />
);

type StillAskingShotProps = {
  /** Quadro do plano em que a interrogação balança. */
  readonly swayAt: number;
  /** O quadro do vídeo em que o plano começa. */
  readonly clock: number;
};

/** O plano da loja: a rua que já vinha subindo, a interrogação que balança, e a aproximação lenta da porta. */
const StillAskingShot: React.FC<StillAskingShotProps> = ({ swayAt, clock }) => {
  const frame = useCurrentFrame();
  const length = useShotLength();
  return (
    <AskingShop
      at={frame}
      length={length}
      swayAt={swayAt}
      left={leaveProgress(frame, length, 0, SCENERY_EXIT_FRAMES)}
      clock={clock}
    />
  );
};

// A água-viva fica embaixo, à esquerda; o lugar do cérebro que ela não tem, ao lado dela.
const BELOW = framing([JELLYFISH_SPOT.x, JELLYFISH_SPOT.y], 1.55, [700, 860]);
// O plano abre mais acima, no cérebro em que a resposta cabe: a câmera desce este tanto, em pixels, até a água-viva.
const DESCENT = { pixels: 320, seconds: 0.6 };
const ABOVE = { ...BELOW, y: BELOW.y - DESCENT.pixels };
// A deriva lenta do plano: 4% mais perto da água-viva, no fim.
const BELOW_END = framing(
  [JELLYFISH_SPOT.x, JELLYFISH_SPOT.y],
  1.55 * 1.04,
  [700, 860],
);
const BRAIN = { x: 700, y: 270, width: 560 };
const MISSING = { x: 1330, y: 640, width: 420 };
const MEDALLION = 190;
// Onde o medalhão assenta dentro do cérebro.
const FITTED = [BRAIN.x - 10, BRAIN.y - 26] as const;
// O medalhão cai de cima do quadro até o cérebro, e o cérebro cede um nada com o peso.
const LANDING = { from: -640, seconds: 0.5 };
// A tentativa: ele sai do cérebro num arco e desce até o meio do contorno
// vazio; sem achar apoio, volta a subir e fica pairando acima dele, solto. Em
// segundos e pixels.
const ATTEMPT = {
  seconds: 0.55,
  lift: 60,
  hover: [MISSING.x, MISSING.y - 290],
  sunk: 290,
  riseSeconds: 0.45,
} as const;
// Quantos quadros antes da troca o cenário começa a descer.
const SCENERY_LEAD = 20;
// O cérebro já está no lugar quando "a resposta" soa.
const FITS_SOONER = 30;

type FitsShotProps = {
  /** Quadros do plano em que o medalhão cai no cérebro, em que a câmera desce e em que ele tenta pousar nela. */
  readonly landAt: number;
  readonly descendAt: number;
  readonly tryAt: number;
  readonly clock: number;
};

/** A resposta da memória cabe num cérebro; embaixo, a água-viva dorme sem ter um, e o medalhão não acha onde pousar. */
const FitsShot: React.FC<FitsShotProps> = ({
  landAt,
  descendAt,
  tryAt,
  clock,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const length = useShotLength();
  const seconds = (clock + frame) / fps;
  const descended = ramp(frame, descendAt, DESCENT.seconds * fps);
  // O que está por cima da lagoa desce junto com a câmera.
  const lift = DESCENT.pixels * (1 - descended);
  const landed = drop(frame, landAt, LANDING.seconds * fps);
  const touchAt = landAt + LANDING.seconds * fps;
  const given = flash(frame, touchAt - 1, 9);
  // A tentativa: vai com peso até o meio do contorno, e de lá volta a subir, passando um nada do ponto.
  const tried = ramp(frame, tryAt, ATTEMPT.seconds * fps);
  const riseAt = tryAt + ATTEMPT.seconds * fps - 2;
  const risen = interpolate(
    frame,
    [
      riseAt,
      riseAt + ATTEMPT.riseSeconds * fps * 0.75,
      riseAt + ATTEMPT.riseSeconds * fps,
    ],
    [0, 1.06, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );
  const hovering = ramp(frame, riseAt, ATTEMPT.riseSeconds * fps);
  const medallion = [
    mix(FITTED[0], ATTEMPT.hover[0], tried),
    mix(FITTED[1], ATTEMPT.hover[1] + ATTEMPT.sunk, tried) +
      LANDING.from * (1 - landed) +
      6 * given -
      ATTEMPT.lift * Math.sin(Math.PI * tried) -
      ATTEMPT.sunk * risen +
      9 * hovering * wave(seconds, 2.2),
  ] as const;

  return (
    <>
      <LagoonShot
        time="night"
        camera={cameraBetween(
          ABOVE,
          cameraBetween(BELOW, BELOW_END, frame / length),
          descended,
        )}
        rhythm={steady(PULSES_ASLEEP)}
        droop={0.8}
        clock={clock}
      />
      {/* Por cima da lagoa, fora da câmera dela: o cérebro com o medalhão, e o contorno do que falta nela. */}
      <AbsoluteFill style={{ translate: `0 ${lift}px` }}>
        <Sooner by={FITS_SOONER}>
          <Place
            x={BRAIN.x}
            y={BRAIN.y}
            style={{
              // O cérebro respira, e cede um nada quando o medalhão pousa.
              scale: `${1 + 0.012 * wave(seconds, 4.1) + 0.03 * given}`,
            }}
          >
            <Brain width={BRAIN.width} color={ink.glow} folds />
          </Place>
        </Sooner>
        {/* O contorno do cérebro que ela não tem aparece quando a câmera chega a ela. */}
        <Stay only="entering">
          <Place
            x={MISSING.x}
            y={MISSING.y}
            style={{ rotate: `${1.2 * wave(seconds, 4.7, 0.3)}deg` }}
          >
            <Grow at={descendAt + DESCENT.seconds * fps - 7}>
              <Brain width={MISSING.width} color={ink.paper} dashed folds />
            </Grow>
          </Place>
          {/* O medalhão não entra com o palco: cai na palavra dele. Sai com o plano. */}
          {frame < landAt ? null : (
            // O lugar dele no palco é onde ele acaba pairando: é em volta desse ponto que sai. O caminho
            // até lá vai pela transformação, e o que paira menos de um pixel por quadro não anda em degraus.
            <Place
              x={ATTEMPT.hover[0]}
              y={ATTEMPT.hover[1]}
              style={{
                // O `Place` fica na origem e o lugar vai pela transformação: posto por `left` e `top`, o que paira
                // menos de um pixel por quadro andaria em degraus.
                translate: `calc(-50% + ${medallion[0] - ATTEMPT.hover[0]}px) calc(-50% + ${medallion[1] - ATTEMPT.hover[1]}px)`,
                // Sem apoio, ele balança de leve no ar.
                rotate: `${5 * hovering * wave(seconds, 2.9, 0.2) - 8 * Math.sin(Math.PI * tried)}deg`,
                scale: `${1 + 0.025 * wave(seconds, 2.6) * (1 - tried)}`,
              }}
            >
              <AnswerIcon answer="stock" size={MEDALLION} />
            </Place>
          )}
        </Stay>
      </AbsoluteFill>
    </>
  );
};

export const StillUnknownScene: React.FC<SceneProps> = ({ scene, shots }) => {
  const { fps } = useVideoConfig();
  const fitsFrames = shots[1].to - shots[1].from;
  return (
    <>
      <Shot range={shots[0]} name="a loja ainda com a interrogação">
        <StillAskingShot swayAt={cue(scene, "falta")} clock={scene.from} />
      </Shot>
      <Shot range={shots[1]} name="a resposta cabe num cérebro; ela não tem um">
        <FitsShot
          // O cérebro leva uns quadros para crescer no lugar: o medalhão cai logo depois.
          landAt={Math.max(6, cue(scene, "resposta") - shots[1].from)}
          descendAt={cue(scene, "água") - shots[1].from}
          // A tentativa assenta antes de a lagoa começar a sair, que é dois terços de segundo antes da troca.
          tryAt={Math.min(
            cue(scene, "sem") - shots[1].from,
            fitsFrames -
              (ATTEMPT.seconds + ATTEMPT.riseSeconds) * fps -
              SCENERY_LEAD,
          )}
          clock={scene.from + shots[1].from}
        />
        {/* A pessoa de `what-it-is` cresce aqui, por cima da lagoa que desce: a troca de cena não deixa a
            tela só com o fundo. */}
        <Prelude lead={LIT_LEAD}>
          <WhatItIsOpening />
        </Prelude>
      </Shot>
    </>
  );
};
