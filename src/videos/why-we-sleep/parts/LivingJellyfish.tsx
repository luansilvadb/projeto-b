import { useCurrentFrame, useVideoConfig } from "remotion";
import { Jellyfish } from "../../../art/Jellyfish";
import {
  PULSES_ASLEEP,
  type PulseRhythm,
  pulseCycles,
  pulseShape,
} from "./pulse";

type LivingJellyfishProps = {
  readonly size: number;
  /** Pulsos por minuto, ou os trechos da cena com o ritmo de cada um. */
  readonly rhythm?: number | readonly PulseRhythm[];
  readonly nerves?: number;
};

const SWAY_SECONDS = 5;

/** A água-viva em movimento: o sino pulsa no ritmo pedido e os braços balançam na corrente. */
export const LivingJellyfish: React.FC<LivingJellyfishProps> = ({
  size,
  rhythm = PULSES_ASLEEP,
  nerves,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stretches =
    typeof rhythm === "number" ? [{ from: 0, perMinute: rhythm }] : rhythm;

  return (
    <Jellyfish
      size={size}
      pulse={pulseShape(pulseCycles(frame, fps, stretches))}
      sway={Math.sin((frame / fps / SWAY_SECONDS) * Math.PI * 2)}
      nerves={nerves}
    />
  );
};
