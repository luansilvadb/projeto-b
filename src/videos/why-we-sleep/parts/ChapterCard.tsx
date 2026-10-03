import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../../../components/Backdrop";
import { Label } from "../../../components/Label";

type ChapterCardProps = {
  readonly title: string;
  /** Quadros da cena em que a cartela entra e sai. */
  readonly from: number;
  readonly to: number;
};

const FADE_FRAMES = 6;

/** Cartela de capítulo: cobre o quadro com o título, que não é narrado. */
export const ChapterCard: React.FC<ChapterCardProps> = ({
  title,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        // A cartela que abre a cena já entra cheia: surgir aos poucos deixaria
        // a cena aparecer por baixo dela nos primeiros quadros.
        opacity: interpolate(
          frame,
          [from, from + FADE_FRAMES, to - FADE_FRAMES, to],
          [from === 0 ? 1 : 0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    >
      <Backdrop />
      <div style={{ position: "relative" }}>
        <Label size="headline">{title}</Label>
      </div>
    </AbsoluteFill>
  );
};
