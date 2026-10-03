import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import type { FrameRange } from "../narration/timeline";

export type Wipe = {
  /** Quantos quadros a varredura leva para cobrir o plano anterior. */
  readonly frames: number;
  /** De que lado do quadro a varredura entra. */
  readonly from: "left" | "right" | "top" | "bottom";
};

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
  hold = 0,
  wipe,
  children,
}) => (
  <Sequence
    from={range.from}
    durationInFrames={range.to - range.from + hold}
    name={name}
  >
    {wipe ? <Wiping wipe={wipe}>{children}</Wiping> : children}
  </Sequence>
);

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
