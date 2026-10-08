import { AntelopeDrawing } from "./AntelopeDrawing";
import type { AntelopePaint, AntelopePose } from "./AntelopeDrawing";

export type AntelopeColors = {
  readonly body: string;
  readonly shade: string;
  readonly belly: string;
  readonly band: string;
  readonly earInside: string;
  readonly eye: string;
  readonly pupil: string;
  readonly light?: string;
  readonly deep?: string;
  readonly bellyShade?: string;
  readonly rim?: string;
  readonly hornRim?: string;
  readonly horn?: string;
};
type AntelopeProps = Omit<AntelopePose, "earAngle"> & {
  readonly width: number;
  readonly colors: AntelopeColors;
  readonly ear?: number;
};
export const antelopePaint = (colors: AntelopeColors): AntelopePaint => ({
  body: colors.body,
  light: colors.light ?? colors.body,
  shade: colors.shade,
  deep: colors.deep ?? colors.shade,
  cream: colors.belly,
  creamShade: colors.bellyShade ?? colors.belly,
  rim: colors.rim ?? colors.belly,
  band: colors.band,
  horn: colors.horn ?? colors.band,
  hornRim: colors.hornRim ?? colors.shade,
  eye: colors.pupil,
});

// A base da caixa é a linha dos cascos, inclusive quando o animal se deita.
// Todos os consumidores herdam a mesma anatomia; a cena só fornece a pose.
export const Antelope = ({
  width,
  colors,
  ear = 0.8,
  ...pose
}: AntelopeProps) => (
  <svg
    width={width}
    height={(width * 265) / 210}
    viewBox="1090 558 210 265"
    overflow="visible"
  >
    <AntelopeDrawing
      colors={antelopePaint(colors)}
      earAngle={(1 - ear) * 43}
      {...pose}
    />
  </svg>
);
