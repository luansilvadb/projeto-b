import { createContext, useContext, useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { Build } from "../components/Camera";
import { StageContext, type Stage } from "../components/Cast";
import type { FrameRange } from "../narration/timeline";
import {
  enterProgress,
  JOIN_FRAMES,
  leaveProgress,
  SCENERY_EXIT_FRAMES,
} from "./stage";

export type Wipe = {
  /** Quantos quadros a varredura leva para cobrir o plano anterior. */
  readonly frames: number;
  /** De que lado do quadro a varredura entra. */
  readonly from: "left" | "right" | "top" | "bottom";
};

/** O que o vídeo decidiu para um plano: se ele divide o palco com a cena anterior ou com a seguinte. */
export type ShotPlan = {
  readonly joinsPrevious: boolean;
  readonly joinsNext: boolean;
  /** O plano está no mesmo cenário do anterior, ou do seguinte: o cenário fica, e só muda o que está nele. */
  readonly sameSetAsPrevious: boolean;
  readonly sameSetAsNext: boolean;
  /** O nome do plano no palco, e o do plano anterior. Fora de um vídeo montado, nenhum. */
  readonly key: string | null;
  readonly previousKey: string | null;
};

// O plano desenhado fora de um vídeo montado (uma folha de modelo, um teste): entra e sai por corte.
const OFFSTAGE: ShotPlan = {
  joinsPrevious: false,
  joinsNext: false,
  sameSetAsPrevious: false,
  sameSetAsNext: false,
  key: null,
  previousKey: null,
};

/**
 * O plano de palco do vídeo, por trecho. Quem monta o vídeo preenche; cada
 * `Shot` acha o seu pelo `range` que recebeu.
 */
export const ShotPlans = createContext<ReadonlyMap<FrameRange, ShotPlan>>(
  new Map(),
);

type ShotProps = {
  /** O trecho da cena que o plano ocupa, vindo de `shots` em SceneProps. */
  readonly range: FrameRange;
  /** Nome do plano na linha do tempo do Studio. */
  readonly name?: string;
  /** Quadros a mais em que o plano continua desenhado, por baixo do seguinte, para a varredura dele. */
  readonly hold?: number;
  /** O plano entra varrendo o anterior, que precisa de `hold` com os mesmos quadros. */
  readonly wipe?: Wipe;
  readonly children: React.ReactNode;
};

/**
 * Um plano da cena: aparece só no trecho dele. Dentro do plano,
 * useCurrentFrame() conta a partir do começo do plano, e não da cena.
 */
export const Shot: React.FC<ShotProps> = ({
  range,
  name,
  hold,
  wipe,
  children,
}) => {
  const plan = useContext(ShotPlans).get(range) ?? OFFSTAGE;
  const length = range.to - range.from;
  const joinsNext = hold === undefined && plan.joinsNext;

  return (
    <Sequence
      from={range.from}
      durationInFrames={length + (hold ?? (joinsNext ? JOIN_FRAMES : 0))}
      name={name}
    >
      <OnStage
        entering={plan.joinsPrevious}
        leaveAt={joinsNext ? length : null}
        inherits={plan.sameSetAsPrevious}
        bequeaths={joinsNext && plan.sameSetAsNext}
        shot={plan.key}
        previous={plan.previousKey}
      >
        {wipe ? <Wiping wipe={wipe}>{children}</Wiping> : children}
      </OnStage>
    </Sequence>
  );
};

type OnStageProps = {
  /** O plano abre uma cena que divide o palco com a anterior. */
  readonly entering: boolean;
  /** O quadro do plano em que a cena seguinte chega ao palco; sem valor, o plano termina em corte. */
  readonly leaveAt: number | null;
  /** O plano herda o cenário do anterior: não o constrói de novo, só assume a câmera e a luz. */
  readonly inherits: boolean;
  /** O plano deixa o cenário para o seguinte: não o desmonta. */
  readonly bequeaths: boolean;
  /** O nome deste plano no palco, e o do anterior. */
  readonly shot: string | null;
  readonly previous: string | null;
  readonly children: React.ReactNode;
};

/** Diz ao plano, quadro a quadro, quanto do que chega já entrou e quanto do que sai já saiu. */
const OnStage: React.FC<OnStageProps> = ({
  entering,
  leaveAt,
  inherits,
  bequeaths,
  shot,
  previous,
  children,
}) => {
  const frame = useCurrentFrame();
  const stage = useMemo<Stage>(
    () => ({
      enter: (delay, frames) =>
        entering ? enterProgress(frame, delay, frames) : 1,
      leave: (delay) =>
        leaveAt === null ? 0 : leaveProgress(frame, leaveAt, delay),
      handedOver: leaveAt !== null && frame >= leaveAt,
      cast: true,
    }),
    [frame, entering, leaveAt],
  );
  // O cenário inteiro entra junto com a cena e sai mais devagar que um
  // elemento. Quando é o mesmo do plano vizinho, não entra nem sai: fica.
  const entered = stage.enter();
  const lit = inherits ? 1 : entered;
  const risen =
    leaveAt === null || bequeaths
      ? lit
      : lit * (1 - leaveProgress(frame, leaveAt, 0, SCENERY_EXIT_FRAMES));

  return (
    <StageContext.Provider value={stage}>
      <Build
        lit={lit}
        risen={risen}
        tracked
        takeover={inherits ? entered : 1}
        shot={shot}
        heir={inherits ? previous : null}
      >
        {children}
      </Build>
    </StageContext.Provider>
  );
};

const Wiping: React.FC<{ wipe: Wipe; children: React.ReactNode }> = ({
  wipe,
  children,
}) => {
  const frame = useCurrentFrame();
  // A borda cruza o quadro quase a velocidade constante, só freando no fim.
  const hidden = interpolate(frame, [0, wipe.frames], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // A parte do quadro que a varredura ainda não alcançou, no lado oposto ao que ela entra.
  const inset = {
    left: `0 ${hidden}% 0 0`,
    right: `0 0 0 ${hidden}%`,
    top: `0 0 ${hidden}% 0`,
    bottom: `${hidden}% 0 0 0`,
  }[wipe.from];

  return (
    <AbsoluteFill style={{ clipPath: `inset(${inset})` }}>
      {children}
    </AbsoluteFill>
  );
};
